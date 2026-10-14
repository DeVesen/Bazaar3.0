import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ResultOverlay } from '../../../../shared/components/result-overlay/result-overlay';
import { ResultEvent, createResultEvent } from '../../../../shared/components/result-overlay/result-event';
import { PaymentConfirmedEvent, PaymentPanel } from '../../../../shared/components/payment-panel/payment-panel';
import { IntakeApi, IntakeArticleLine } from '../../data/intake-api';
import { SessionArticle } from '../intake-article-entry/intake-article-entry';
import { SessionItemFormValue, SessionItemPopup } from '../session-item-popup/session-item-popup';
// Cross-cutting core service, read-only call: `PrintService.printIntakeReceipt()` after a
// successful booking — same sanctioned `core` import pattern the boundaries config allows any
// feature to use directly (no `eslint-disable` needed, unlike the cross-FEATURE imports below).
import { PrintService } from '../../../../core/print/print.service';

/** Payload of `bookingConflict` — the backend's 409 `article.number_taken` shape
 * (`DomainExceptionHandler`'s `ProblemDetails.Extensions`, see `IntakeHandler.cs`). */
export interface BookingConflict {
  takenNumbers: number[];
  nextNumber: number;
}

/**
 * Presentational session-article list (Round-17 Task 7, spec.md "Übersicht (rechts, 30%)") —
 * replaces `intake-article-entry`'s Round-17-Task-6 minimal inline list. Does NOT own `items()`;
 * it is a leaf component that emits intent events (`itemDeleted`/`itemUpdated`/`booked`/
 * `bookingConflict`) for `intake-article-entry` to apply against its own `items` signal — see
 * that class's doc comment on `SessionArticle`/`items`.
 *
 * Owns the payment flow: clicking "Speichern" opens `app-payment-panel` inside a `p-dialog` this
 * component renders itself (`payment-panel` is dialog CONTENT only, per its own doc comment) and,
 * on `confirmed`, calls `IntakeApi.bookIntake()` with `feeAmount = event.totalAmount` (the fixed
 * total shown in the panel, NOT `event.receivedAmount` — spec.md's exact wording for the
 * `confirmed` → POST /api/intake mapping).
 */
@Component({
  selector: 'app-intake-session-list',
  imports: [CurrencyPipe, ButtonModule, DialogModule, PaymentPanel, ResultOverlay, SessionItemPopup],
  templateUrl: './intake-session-list.html',
  styleUrl: './intake-session-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntakeSessionList {
  private readonly intakeApi = inject(IntakeApi);
  private readonly printService = inject(PrintService);

  readonly items = input.required<SessionArticle[]>();
  readonly feePerItem = input.required<number>();
  readonly sellerId = input.required<string>();
  readonly categoryOptions = input.required<string[]>();
  readonly brandOptions = input.required<string[]>();

  readonly itemDeleted = output<string>();
  readonly itemUpdated = output<{ localId: string; value: SessionItemFormValue }>();
  readonly booked = output<void>();
  readonly bookingConflict = output<BookingConflict>();
  readonly categoryCreated = output<string>();
  readonly brandCreated = output<string>();

  /** spec.md exact formula. `items` is an `@Input`-backed signal, so this recomputes whenever the
   * parent mutates the array. */
  readonly fee = computed(() => this.items().length * this.feePerItem());
  /** Not explicitly stated in spec.md for this exact edge case (see task-7-report.md) — nothing
   * to book with an empty session, so "Speichern" stays disabled. */
  readonly canBook = computed(() => this.items().length > 0);

  readonly popupVisible = signal(false);
  readonly selectedItem = signal<SessionArticle | null>(null);
  readonly initialPopupValue = computed<SessionItemFormValue | null>(() => {
    const item = this.selectedItem();
    if (!item) return null;
    return { name: item.name, category: item.category, brand: item.brand, price: item.price };
  });

  readonly paymentPanelVisible = signal(false);
  readonly bookingError = signal<string | null>(null);
  /** Fresh `paid` event after a successful booking with a fee to collect (`app-result-overlay`). */
  readonly resultEvent = signal<ResultEvent | null>(null);

  onRowClick(item: SessionArticle): void {
    this.selectedItem.set(item);
    this.popupVisible.set(true);
  }

  onPopupSave(value: SessionItemFormValue): void {
    const item = this.selectedItem();
    if (!item) return;
    this.itemUpdated.emit({ localId: item.localId, value });
    this.popupVisible.set(false);
    this.selectedItem.set(null);
  }

  onPopupCancel(): void {
    this.popupVisible.set(false);
    this.selectedItem.set(null);
  }

  onDelete(localId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.itemDeleted.emit(localId);
  }

  openPayment(): void {
    if (!this.canBook()) return;
    this.bookingError.set(null);

    // Nothing to collect (fee 0): skip the payment-panel and book straight away.
    if (this.fee() <= 0) {
      this.book(0);
      return;
    }

    this.paymentPanelVisible.set(true);
  }

  onPaymentConfirmed(event: PaymentConfirmedEvent): void {
    this.book(event.totalAmount);
  }

  private book(feeAmount: number): void {
    const articles: IntakeArticleLine[] = this.items().map((item) => ({
      number: item.number,
      name: item.name,
      brand: item.brand,
      category: item.category,
      price: item.price,
      size: item.size,
      color: item.color,
      description: item.description,
      deleteArticleNumber: item.originalNumberToDelete,
    }));

    this.intakeApi.bookIntake(this.sellerId(), feeAmount, articles).subscribe({
      next: (result) => {
        this.printService.printIntakeReceipt({
          articleIds: result.articleIds,
          sellerId: this.sellerId(),
          feeAmount,
        });
        this.paymentPanelVisible.set(false);
        this.bookingError.set(null);
        if (feeAmount > 0) this.resultEvent.set(createResultEvent('paid'));
        this.booked.emit();
      },
      error: (error: unknown) => this.handleBookingError(error),
    });
  }

  private handleBookingError(error: unknown): void {
    this.paymentPanelVisible.set(false);

    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      (error.error as { errorCode?: string } | null)?.errorCode === 'article.number_taken'
    ) {
      const body = error.error as { takenNumbers?: number[]; nextNumber?: number };
      this.bookingConflict.emit({
        takenNumbers: body.takenNumbers ?? [],
        nextNumber: body.nextNumber ?? 0,
      });
      return;
    }

    this.bookingError.set('Buchung fehlgeschlagen. Bitte erneut versuchen.');
  }
}
