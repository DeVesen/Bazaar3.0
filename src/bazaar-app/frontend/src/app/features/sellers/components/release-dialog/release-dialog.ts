import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { PaymentConfirmedEvent, PaymentPanel } from '../../../../shared/components/payment-panel/payment-panel';
import { ScanDialog } from '../../../../shared/components/scan-dialog/scan-dialog';
import { ReleaseApi } from '../../data/release-api';
import { SellersApi } from '../../data/sellers-api';
// Cross-cutting core service, read-only call: `PrintService.printIntakeReceipt()` after a
// successful booking — same sanctioned `core` import pattern `intake-session-list.ts` already
// uses (deliberately the SECOND caller of this same stub method, per spec.md).
import { PrintService } from '../../../../core/print/print.service';

/**
 * Orchestrates the "Freigeben"-Popup (Round-18 spec.md, plan.md section 4) opened from a
 * seller-card's scanner button (`sellers-page.ts`'s `onScan()`). Hosts `app-scan-dialog`
 * (Round-18 Task 3, read-only validation) for the actual scan/typed session, then — once the
 * user closes the scan dialog with at least one article validated — `app-payment-panel`
 * (Round-17) for the fee, and finally books the session via `ReleaseApi.bookRelease()`
 * (`POST /api/release`, Round-18 Tasks 1/2). Mirrors `intake-session-list.ts`'s own
 * confirm→book→handle-409→print→close sequence almost exactly; the only real difference is the
 * extra scan-dialog layer this component owns on top of that (`intake-session-list` gets its
 * `items()` handed in by its parent, this component gathers them itself via `scan-dialog`).
 *
 * Feature-local (not `shared`) — same tier as `intake-session-list`, since this component
 * orchestrates business logic (booking, payment-panel, error handling), not just presentation.
 *
 * `scan-dialog`/payment-panel overlay handling (spec.md "Freigeben-Popup", read this carefully
 * before touching it): `scan-dialog` resets its own internal session state whenever ITS OWN
 * `visible` input transitions `false → true`. If the payment-panel overlay were implemented by
 * toggling `scan-dialog`'s own `[visible]`, reopening it after a cancelled/failed payment (or a
 * 409) would silently wipe the very session it is supposed to preserve. To avoid that, `scan-
 * dialog`'s `[visible]` stays bound directly to this component's own `visible()` input and is
 * NEVER ANDed with anything else — the payment-panel overlay is instead a purely local `[hidden]`
 * toggle (`scanDialogVisible()`) on the wrapping element, which hides `scan-dialog` visually
 * without ever touching its `visible` input, so it stays mounted with its session state intact
 * throughout the whole payment/409 dance. `sessionIds()` (this component's own mirror, kept in
 * sync via `scan-dialog`'s `sessionArticleIds` output, which keeps firing regardless of which
 * overlay is on top) is the source of truth for the fee and for the booking request.
 */
@Component({
  selector: 'app-release-dialog',
  imports: [DialogModule, ScanDialog, PaymentPanel],
  templateUrl: './release-dialog.html',
  styleUrl: './release-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseDialog {
  private readonly releaseApi = inject(ReleaseApi);
  private readonly sellersApi = inject(SellersApi);
  private readonly printService = inject(PrintService);

  readonly visible = input<boolean>(false);
  readonly sellerId = input.required<string>();

  readonly visibleChange = output<boolean>();
  /** Emitted after a successful booking so the parent (`sellers-page`) can refresh the seller
   * grid (released articles change the seller's `releasedCount`/status). */
  readonly released = output<void>();

  /** Fetched internally rather than taken as an `@Input` — `SellerCard` (the shape the parent
   * already has loaded) does not carry `feePerItem`, only `SellerDetail`/`Seller` do. Mirrors
   * `intake-article-entry.ts`'s own `SellersApi.getById()` pattern exactly. */
  readonly feePerItem = signal(0);

  /** The full current session list, mirrored from `scan-dialog`'s own `sessionArticleIds`
   * output on every change (a complete snapshot, not a delta — see that output's own doc
   * comment) — never counted/derived from `scanComplete` events here. */
  readonly sessionIds = signal<readonly string[]>([]);

  /** Local overlay switch: `true` while `scan-dialog` itself is the visible layer, `false` while
   * the payment-panel `p-dialog` is shown on top of it (see class doc comment above for why this
   * is a `[hidden]` toggle rather than `scan-dialog`'s own `visible` input). */
  readonly scanDialogVisible = signal(true);
  readonly paymentPanelVisible = signal(false);
  readonly bookingError = signal<string | null>(null);

  /** Same formula shape as `intake-session-list.ts`'s own `fee` computed. */
  readonly fee = computed(() => this.sessionIds().length * this.feePerItem());

  constructor() {
    effect(() => {
      const id = this.sellerId();
      if (!id) return;
      this.sellersApi.getById(id).subscribe((seller) => this.feePerItem.set(seller.feePerItem));
    });

    // Fresh local state every time the dialog opens — `scan-dialog` resets its own session on
    // this same `visible` transition, so this only needs to reset THIS component's own overlay
    // flags (a previous visit may have left `scanDialogVisible`/`paymentPanelVisible` in
    // whatever state the last close/booking left them in).
    effect(() => {
      if (this.visible()) {
        this.scanDialogVisible.set(true);
        this.paymentPanelVisible.set(false);
        this.bookingError.set(null);
      }
    });
  }

  onSessionChanged(ids: readonly string[]): void {
    this.sessionIds.set(ids);
  }

  /** `scan-dialog`'s own `visibleChange` — per spec.md, "sofern mindestens ein Artikel in
   * dieser Sitzung erfasst wurde, öffnet payment-panel... Wurde nichts erfasst, schließt der
   * Dialog ohne payment-panel." Only ever fires with `false` in practice (`scan-dialog`'s
   * `[visible]` is bound one-way, so nothing else can trigger a `true` here), but guarded
   * defensively anyway. */
  onScanDialogVisibleChange(value: boolean): void {
    if (value) return;

    if (this.sessionIds().length === 0) {
      this.visibleChange.emit(false);
      return;
    }

    this.scanDialogVisible.set(false);
    this.bookingError.set(null);
    this.paymentPanelVisible.set(true);
  }

  /** Judgment call (spec.md doesn't cover cancelling the payment panel explicitly): reopen
   * `scan-dialog` rather than fully closing, since the session is still intact and the user may
   * want to scan more or fix something. */
  onPaymentCancelled(): void {
    this.paymentPanelVisible.set(false);
    this.scanDialogVisible.set(true);
  }

  onPaymentConfirmed(event: PaymentConfirmedEvent): void {
    this.releaseApi.bookRelease(this.sellerId(), event.totalAmount, this.sessionIds()).subscribe({
      next: () => {
        this.printService.printIntakeReceipt({
          articleIds: Array.from(this.sessionIds()),
          sellerId: this.sellerId(),
          feeAmount: event.totalAmount,
        });
        this.paymentPanelVisible.set(false);
        this.bookingError.set(null);
        this.released.emit();
        this.visibleChange.emit(false);
      },
      error: (error: unknown) => this.handleBookingError(error),
    });
  }

  /** 409 `article.not_releasable` (spec.md: "Sitzung bleibt im Dialog erhalten") reopens
   * `scan-dialog` with the session untouched and shows an inline error; any other failure
   * (network/5xx/unmapped) gets the same reopen + a generic message. */
  private handleBookingError(error: unknown): void {
    this.paymentPanelVisible.set(false);
    this.scanDialogVisible.set(true);

    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      (error.error as { errorCode?: string } | null)?.errorCode === 'article.not_releasable'
    ) {
      const numbers = (error.error as { articleNumbers?: number[] } | null)?.articleNumbers ?? [];
      this.bookingError.set(`Artikel ${numbers.join(', ')} sind nicht mehr freigebbar.`);
      return;
    }

    this.bookingError.set('Buchung fehlgeschlagen. Bitte erneut versuchen.');
  }
}
