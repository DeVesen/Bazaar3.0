import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ResultOverlay } from '../../../../shared/components/result-overlay/result-overlay';
import { ResultEvent, createResultEvent } from '../../../../shared/components/result-overlay/result-event';
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
 * toggle bound directly to `paymentPanelVisible()` on the wrapping element (`release-dialog.html`),
 * which hides `scan-dialog` visually without ever touching its `visible` input, so it stays
 * mounted with its session state intact throughout the whole payment/409 dance. There is
 * deliberately no separate "is scan-dialog visible" flag — it is always the logical inverse of
 * `paymentPanelVisible()`, so keeping only one signal removes the risk of the two drifting apart.
 * `sessionIds()` (this component's own mirror, kept in
 * sync via `scan-dialog`'s `sessionArticleIds` output, which keeps firing regardless of which
 * overlay is on top) is the source of truth for the fee and for the booking request.
 *
 * Booking-error visibility (fix round 1, reviewer Important finding): the inline `bookingError`
 * text renders in this component's own host, in normal document flow — but the reopened
 * `scan-dialog` on top of it is a PrimeNG `p-dialog[modal]`, whose mask+panel render
 * `position: fixed` with a high `z-index` above ordinary page content. That left the inline
 * message effectively invisible behind the reopened modal on every error path, even though
 * `bookingError()` itself was set correctly. Fixed by ALSO surfacing the same text via
 * `MessageService` (the app's global `p-toast`, same convention `sellers-page.ts` already uses
 * for its own error toasts) — the toast stacks above any `p-dialog` mask by design, so the user
 * actually sees why the booking failed. `bookingError()` is kept as well (still asserted by
 * tests, still useful for anything that reads component state), it is just no longer the ONLY
 * channel.
 */
@Component({
  selector: 'app-release-dialog',
  imports: [DialogModule, ScanDialog, PaymentPanel, ResultOverlay],
  templateUrl: './release-dialog.html',
  styleUrl: './release-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseDialog {
  private readonly releaseApi = inject(ReleaseApi);
  private readonly sellersApi = inject(SellersApi);
  private readonly printService = inject(PrintService);
  private readonly messageService = inject(MessageService);

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

  /** Local overlay switch: `true` while the payment-panel `p-dialog` is shown on top of
   * `scan-dialog` (see class doc comment above for why this drives a `[hidden]` toggle on
   * `scan-dialog`'s wrapper rather than `scan-dialog`'s own `visible` input). `scan-dialog` is
   * visible exactly when this is `false` — no separate flag for that, see class doc comment. */
  readonly paymentPanelVisible = signal(false);
  readonly bookingError = signal<string | null>(null);
  /** Fresh `paid` event after a successful booking with a fee to collect (`app-result-overlay`). */
  readonly resultEvent = signal<ResultEvent | null>(null);

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
    // flag (a previous visit may have left `paymentPanelVisible` in whatever state the last
    // close/booking left it in).
    effect(() => {
      if (this.visible()) {
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

    this.bookingError.set(null);

    // Nothing to collect (fee 0): skip the payment-panel and book straight away.
    if (this.fee() <= 0) {
      this.book(0);
      return;
    }

    this.paymentPanelVisible.set(true);
  }

  /** Judgment call (spec.md doesn't cover cancelling the payment panel explicitly): reopen
   * `scan-dialog` rather than fully closing, since the session is still intact and the user may
   * want to scan more or fix something. */
  onPaymentCancelled(): void {
    this.paymentPanelVisible.set(false);
  }

  onPaymentConfirmed(event: PaymentConfirmedEvent): void {
    this.book(event.totalAmount);
  }

  private book(feeAmount: number): void {
    this.releaseApi.bookRelease(this.sellerId(), feeAmount, this.sessionIds()).subscribe({
      next: () => {
        this.printService.printIntakeReceipt({
          articleIds: Array.from(this.sessionIds()),
          sellerId: this.sellerId(),
          feeAmount,
        });
        this.paymentPanelVisible.set(false);
        this.bookingError.set(null);
        if (feeAmount > 0) this.resultEvent.set(createResultEvent('paid'));
        this.released.emit();
        this.visibleChange.emit(false);
      },
      error: (error: unknown) => this.handleBookingError(error),
    });
  }

  /** 409 `article.not_releasable` (spec.md: "Sitzung bleibt im Dialog erhalten") reopens
   * `scan-dialog` with the session untouched and shows an error; any other failure
   * (network/5xx/unmapped) gets the same reopen + a generic message. Both the inline
   * `bookingError` signal and a `MessageService` toast are set to the same text — see this
   * class's doc comment ("Booking-error visibility") for why the toast is the one that is
   * actually visible while `scan-dialog`'s modal is reopened on top. */
  private handleBookingError(error: unknown): void {
    this.paymentPanelVisible.set(false);

    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      (error.error as { errorCode?: string } | null)?.errorCode === 'article.not_releasable'
    ) {
      const numbers = (error.error as { articleNumbers?: number[] } | null)?.articleNumbers ?? [];
      this.setBookingError(`Artikel ${numbers.join(', ')} sind nicht mehr freigebbar.`);
      return;
    }

    this.setBookingError('Buchung fehlgeschlagen. Bitte erneut versuchen.');
  }

  private setBookingError(message: string): void {
    this.bookingError.set(message);
    this.messageService.add({ severity: 'error', summary: message });
  }
}
