import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs';
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
// Cross-cutting core service: the Sofort-Modus flag (`releaseOnClose`) is an app-wide setting,
// re-read via `SettingsService.load()` every time the popup opens.
import { SettingsService } from '../../../../core/settings/settings.service';

/** Sofort-Modus: Bleibt die Antwort einer Einzelbuchung so lange aus, gilt sie als fehlgeschlagen
 * (rot, zählt nicht zum Abgabe-Beleg) — sonst hinge das Schließen des Popups an einer hängenden Anfrage. */
export const IMMEDIATE_WRITE_TIMEOUT_MS = 10000;

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
 * dialog`'s `[visible]` follows `scanDialogVisible()`, which only ANDs `visible()` with flags that
 * never change while a session is open (`modeReady()` flips only at opening, before anything is
 * captured; `closeRequested()` only once the user has closed) — the payment-panel overlay is
 * instead a purely local `[hidden]` toggle bound directly to `paymentPanelVisible()` on the wrapping element (`release-dialog.html`),
 * which hides `scan-dialog` visually without ever touching its `visible` input, so it stays
 * mounted with its session state intact throughout the whole payment/409 dance. The overlay
 * itself has no separate "is scan-dialog visible" flag — it is always the logical inverse of
 * `paymentPanelVisible()`, so keeping only one signal removes the risk of the two drifting apart
 * (`scanDialogVisible()` is the unrelated `[visible]` binding described above).
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
 *
 * Sofort-Modus (Spec docs/forge/2026-10-19-freigabe-sofort-ohne-gebuehr/spec.md): Ist der Schalter
 * `releaseOnClose` (frisch bei jedem Öffnen über `SettingsService.load()` gelesen) aus und die
 * Gebühr je Stück 0, schaltet `writeMode()` den `scan-dialog` auf `'immediate'`. Jeder dann über
 * `articleConfirmed` bestätigte Artikel wird sofort einzeln gebucht (`POST /api/release`, Gebühr 0,
 * eine ID); scheitert die Buchung, meldet `ScanDialog.reportWriteFailed()` das rot. Beim Schließen
 * entfällt der Bezahlen-Dialog; der Abgabe-Beleg wird einmal mit allen freigegebenen Artikeln
 * gedruckt (nur wenn mindestens einer freigegeben wurde) — nachdem laufende Buchungen fertig sind
 * oder nach `IMMEDIATE_WRITE_TIMEOUT_MS` als fehlgeschlagen gelten. Der `scan-dialog` erscheint
 * erst, wenn Gebühr je Stück und Einstellungen dieser Öffnung geladen sind (`modeReady()`), damit
 * nie ein Artikel im falschen Modus erfasst wird; nach dem Schließen mit laufender Buchung bleibt
 * er verborgen (`closeRequested()`), damit keine weiteren Scans hinzukommen.
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
  private readonly settingsService = inject(SettingsService);
  private readonly scanDialog = viewChild(ScanDialog);

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
  /** Ladezustand von `feePerItem` für den aktuellen Verkäufer — nur bei `'loaded'` gilt je der Sofort-Modus;
   * `'failed'` lässt das Popup wie bisher im Sammel-Modus arbeiten. */
  private readonly feeState = signal<'loading' | 'loaded' | 'failed'>('loading');
  /** `true`, sobald `SettingsService.load()` für diese Öffnung zurück ist (auch nach einem geschluckten Fehler). */
  private readonly settingsLoaded = signal(false);
  /** Stellung des Schalters, bei jedem Öffnen frisch geladen; bis dahin „an" (Verhalten wie heute). */
  private readonly releaseOnClose = signal(true);
  /** Zähler der Öffnungen; ordnet eine `SettingsService.load()`-Antwort ihrer Öffnung zu. */
  private openingGeneration = 0;
  /** Gebühr je Stück und Einstellungen dieser Öffnung liegen vor — erst dann ist der Modus der Sitzung bekannt. */
  private readonly modeReady = computed(() => this.feeState() !== 'loading' && this.settingsLoaded());

  /** Sofort-Modus nur bei Gebühr je Stück 0 und ausgeschaltetem Schalter, sonst Verhalten wie heute. */
  readonly writeMode = computed<'batch' | 'immediate'>(() =>
    this.feeState() === 'loaded' && this.feePerItem() === 0 && !this.releaseOnClose() ? 'immediate' : 'batch',
  );

  /** Im Sofort-Modus in dieser Sitzung erfolgreich freigegebene Artikel — Grundlage des Abgabe-Belegs. */
  readonly releasedIds = signal<readonly string[]>([]);
  /** Im Sofort-Modus noch ohne Antwort laufende Einzelbuchungen. */
  private readonly pendingWrites = signal(0);
  /** Im Sofort-Modus hat der Nutzer geschlossen; bis zur nächsten Öffnung bleibt der `scan-dialog` verborgen. */
  private readonly closeRequested = signal(false);

  /** `[visible]` des `scan-dialog` — siehe Klassen-Doc-Kommentar, warum dieses UND die Sitzung nicht zurücksetzt. */
  readonly scanDialogVisible = computed(() => this.visible() && this.modeReady() && !this.closeRequested());

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
      this.feeState.set('loading');
      this.sellersApi.getById(id).subscribe({
        next: (seller) => {
          this.feePerItem.set(seller.feePerItem);
          this.feeState.set('loaded');
        },
        error: () => this.feeState.set('failed'),
      });
    });

    // Fresh local state every time the dialog opens — `scan-dialog` resets its own session on
    // this same `visible` transition, so this only needs to reset THIS component's own overlay
    // flag (a previous visit may have left `paymentPanelVisible` in whatever state the last
    // close/booking left it in).
    effect(() => {
      if (!this.visible()) {
        this.settingsLoaded.set(false);
        this.closeRequested.set(false);
        return;
      }
      this.paymentPanelVisible.set(false);
      this.bookingError.set(null);
      this.releasedIds.set([]);
      this.releaseOnClose.set(true);
      this.refreshReleaseOnClose();
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

    if (this.hasImmediateWrites()) {
      this.closeImmediateSession();
      return;
    }

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

  /** Sofort-Modus: `scan-dialog` hat einen Artikel bestätigt — sofort einzeln und ohne Gebühr buchen.
   * Bleibt die Antwort `IMMEDIATE_WRITE_TIMEOUT_MS` aus, gilt die Buchung als fehlgeschlagen. */
  onArticleConfirmed(articleId: string): void {
    this.pendingWrites.update((count) => count + 1);
    this.releaseApi
      .bookRelease(this.sellerId(), 0, [articleId])
      .pipe(timeout({ first: IMMEDIATE_WRITE_TIMEOUT_MS }))
      .subscribe({
        next: () => {
          this.releasedIds.update((ids) => [...ids, articleId]);
          this.onWriteSettled();
        },
        error: () => {
          this.scanDialog()?.reportWriteFailed();
          this.onWriteSettled();
        },
      });
  }

  private hasImmediateWrites(): boolean {
    return this.pendingWrites() > 0 || this.releasedIds().length > 0;
  }

  /** Antworten früherer Öffnungen (Popup zu früh geschlossen und neu geöffnet) werden verworfen. */
  private refreshReleaseOnClose(): void {
    const opening = ++this.openingGeneration;
    void this.settingsService.load().then(() => {
      if (opening !== this.openingGeneration) return;
      this.releaseOnClose.set(this.settingsService.releaseOnClose());
      this.settingsLoaded.set(true);
    });
  }

  private onWriteSettled(): void {
    this.pendingWrites.update((count) => count - 1);
    if (this.closeRequested() && this.pendingWrites() === 0) this.finishImmediateSession();
  }

  private closeImmediateSession(): void {
    this.closeRequested.set(true);
    if (this.pendingWrites() === 0) this.finishImmediateSession();
  }

  /** `closeRequested` bleibt gesetzt, bis der Elternteil `visible` auf `false` legt (zweiter Effect) —
   * sonst würde der `scan-dialog` zwischen Emit und Schließen kurz wieder erscheinen. */
  private finishImmediateSession(): void {
    const articleIds = Array.from(this.releasedIds());
    if (articleIds.length > 0) this.reportReleased(articleIds);
    this.visibleChange.emit(false);
  }

  /** Abgabe-Beleg drucken und das Verkäufer-Raster neu laden lassen — gemeinsam für Sammel- und Sofort-Modus. */
  private reportReleased(articleIds: string[]): void {
    this.printService.printIntakeReceipt({ articleIds, sellerId: this.sellerId() });
    this.released.emit();
  }

  private book(feeAmount: number): void {
    this.releaseApi.bookRelease(this.sellerId(), feeAmount, this.sessionIds()).subscribe({
      next: () => {
        this.reportReleased(Array.from(this.sessionIds()));
        this.paymentPanelVisible.set(false);
        this.bookingError.set(null);
        if (feeAmount > 0) this.resultEvent.set(createResultEvent('paid'));
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
