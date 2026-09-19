import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
import { PaymentConfirmedEvent, PaymentPanel } from '../../../../shared/components/payment-panel/payment-panel';
import { Cart } from '../../components/cart/cart';
import { SalesApi } from '../../data/sales-api';
// Cross-feature import, read-only: ArticlesApi.getByNumber() backs the
// checkout page's article-number lookup, same sanctioned pattern
// intake-article-entry.ts already uses for the same API.
// eslint-disable-next-line boundaries/dependencies
import { ArticleByNumberResult, ArticlesApi } from '../../../articles/data/articles-api';

/**
 * A single article added to the checkout basket, held locally until "BUCHEN"
 * calls `SalesApi.bookSale()` (Task 5). Deliberately narrower than
 * `ArticleByNumberResult` — only the fields the cart (Task 4) needs to
 * render a row and this page needs to sum the total.
 */
export interface CartItem {
  id: string;
  number: number;
  name: string;
  price: number;
}

type InfoType = 'info' | 'success' | 'warn' | 'error';

interface InfoState {
  type: InfoType;
  text: string;
}

/**
 * Kasse/Verkauf page (Epic_Verkauf) — left column: article-number `input-group`
 * (keyboard/camera/numpad), an inline InfoArea reporting the lookup result, and a
 * Preis-Button that adds the found article to the basket. Right column renders
 * `app-cart` (Task 4), which owns the remove/clear/checkout intents (this page still
 * owns `cartItems` mutation and refocusing). "BUCHEN" opens `app-payment-panel` in a
 * `p-dialog` overlay (Task 5); `SalesApi.bookSale()`/`undoSale()` back the booking and
 * Storno flow, mirroring `release-dialog.ts`'s own confirm→book→handle-409 shape.
 */
@Component({
  selector: 'app-checkout-page',
  imports: [ButtonModule, DialogModule, InputGroup, Cart, PaymentPanel],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly articlesApi = inject(ArticlesApi);
  private readonly salesApi = inject(SalesApi);
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

  private readonly numberGroup = viewChild<InputGroup>('numberGroup');

  readonly cartItems = signal<CartItem[]>([]);
  readonly infoState = signal<InfoState>({ type: 'info', text: 'Ersten Artikel eingeben …' });
  /** The currently looked-up, sellable-and-not-in-cart article; drives the Preis-Button's
   * visibility/price/caption. `null` whenever the Preis-Button should be hidden. */
  readonly foundArticle = signal<ArticleByNumberResult | null>(null);
  /** Article ids of the last successfully booked sale — drives the "Letzten Vorgang
   * stornieren" button's visibility; cleared as soon as the next lookup starts (epic.md §5). */
  readonly lastSaleArticleIds = signal<string[]>([]);
  /** `true` while the "Bezahlen" payment-panel `p-dialog` is open. */
  readonly paymentPanelVisible = signal(false);
  /** Id of the cart row to mark after a booking 409 (`article.not_sellable`); `null` otherwise. */
  readonly highlightedItemId = signal<string | null>(null);

  /** The page's own copy of the cart total for the payment-panel's `totalAmount` input —
   * `cart.ts`'s own `total` computed is private to that component, see task-5-brief.md §1. */
  readonly cartTotal = computed(() => this.cartItems().reduce((sum, item) => sum + item.price, 0));

  readonly infoIcon = computed<string>(() => {
    switch (this.infoState().type) {
      case 'success':
        return 'pi pi-check';
      case 'error':
        return 'pi pi-times';
      case 'warn':
        return 'pi pi-exclamation-triangle';
      case 'info':
        return 'pi pi-info-circle';
    }
  });

  readonly priceLabel = computed<string>(() => {
    const article = this.foundArticle();
    if (!article) return '';
    return article.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
  });

  constructor() {
    // Fokus-Verhalten (spec.md §7, AC-1): focus the article-number field on page entry.
    // `input-group` exposes no public `focus()` method (documented, deliberate) — same
    // best-effort host-querySelector pattern as `scan-dialog.ts`'s `onShown()`.
    queueMicrotask(() => this.focusArticleNumberField());
  }

  onArticleNumberChange(value: string | number): void {
    const raw = String(value);
    if (!raw.trim()) return;
    this.checkArticleNumber(raw);
  }

  /** Fallback trigger for Enter/the numpad's ⏎ — `submitted` does not necessarily carry the
   * latest debounced value, so re-read `rawValue()` directly, same reasoning as
   * `intake-article-entry.ts`'s own `onArticleNumberSubmit()`. */
  onArticleNumberSubmit(): void {
    const raw = this.numberGroup()?.rawValue() ?? '';
    if (raw.trim()) this.checkArticleNumber(raw);
  }

  onAddToCart(): void {
    const article = this.foundArticle();
    if (!article) return;
    this.cartItems.update((items) => [
      ...items,
      { id: article.id, number: article.number, name: article.name, price: article.price },
    ]);
    this.foundArticle.set(null);
    this.numberGroup()?.applyExternalValue('');
    this.infoState.set({ type: 'success', text: 'Nächsten Artikel eingeben …' });
    this.focusArticleNumberField();
  }

  private checkArticleNumber(raw: string): void {
    // Storno-Button "verschwindet, sobald der nächste Artikel gescannt wird" (epic.md §5) — this
    // is the single entry point every keyboard/camera/numpad lookup funnels through, so one reset
    // here covers all input modes.
    this.lastSaleArticleIds.set([]);

    const trimmed = raw.trim();
    const number = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(number)) return;

    // Local duplicate check first, no network call (Epic_Verkauf §2 "Bereits im Warenkorb",
    // cart.md AC-2).
    if (this.cartItems().some((item) => item.number === number)) {
      this.infoState.set({ type: 'warn', text: 'Artikel ist bereits im Warenkorb.' });
      this.foundArticle.set(null);
      return;
    }

    this.articlesApi.getByNumber(number).subscribe({
      next: (article) => this.handleArticleFound(article, number),
      error: (error: unknown) => this.handleArticleLookupError(error, number),
    });
  }

  private handleArticleFound(article: ArticleByNumberResult, number: number): void {
    switch (article.status) {
      case 'selling':
        this.infoState.set({
          type: 'success',
          text: article.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }),
        });
        this.foundArticle.set(article);
        return;
      case 'registered':
        this.infoState.set({
          type: 'error',
          text: `Artikel ${number} ist noch nicht freigegeben — zuerst annehmen.`,
        });
        this.foundArticle.set(null);
        return;
      case 'sold':
        this.infoState.set({ type: 'error', text: `Artikel ${number} ist bereits verkauft.` });
        this.foundArticle.set(null);
        return;
      case 'returned':
        this.infoState.set({
          type: 'error',
          text: `Artikel ${number} wurde an den Verkäufer zurückgegeben.`,
        });
        this.foundArticle.set(null);
        return;
      default:
        // There is no `not_sellable`/settlement case reachable here — that only exists
        // server-side at booking time (spec.md: "Einen Fall „Verkäufer ist abgerechnet" gibt es
        // hier nicht"). Any other/unknown status is treated the same as a lookup failure.
        this.infoState.set({
          type: 'error',
          text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.',
        });
        this.foundArticle.set(null);
    }
  }

  private handleArticleLookupError(error: unknown, number: number): void {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.infoState.set({ type: 'error', text: `Artikelnummer ${number} ist nicht bekannt.` });
      this.foundArticle.set(null);
      return;
    }

    // Not part of the epic's six-state table (network/5xx only) — treated conservatively with a
    // generic error message rather than silently doing nothing.
    this.infoState.set({ type: 'error', text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.' });
    this.foundArticle.set(null);
  }

  onCartRemoveItem(id: string): void {
    this.cartItems.update((items) => items.filter((item) => item.id !== id));
    this.highlightedItemId.set(null);
    this.numberGroup()?.applyExternalValue('');
    this.focusArticleNumberField();
  }

  onCartClear(): void {
    this.cartItems.set([]);
    this.highlightedItemId.set(null);
    this.numberGroup()?.applyExternalValue('');
    this.infoState.set({ type: 'info', text: 'Ersten Artikel eingeben …' });
    this.focusArticleNumberField();
  }

  onCartCheckout(): void {
    this.paymentPanelVisible.set(true);
  }

  /** `p-dialog[modal]` already overlays the whole page — unlike `release-dialog.ts`'s own
   * scan-dialog/payment-panel mutual-exclusion dance, `app-cart` does not need to be hidden while
   * this is open. */
  onPaymentCancelled(): void {
    this.paymentPanelVisible.set(false);
  }

  onPaymentConfirmed(event: PaymentConfirmedEvent): void {
    const articleIds = this.cartItems().map((item) => item.id);
    this.salesApi.bookSale(articleIds).subscribe({
      next: () => {
        this.paymentPanelVisible.set(false);
        this.lastSaleArticleIds.set(articleIds);
        this.cartItems.set([]);
        this.numberGroup()?.applyExternalValue('');
        this.highlightedItemId.set(null);
        this.infoState.set({ type: 'info', text: 'Ersten Artikel eingeben …' });
        this.focusArticleNumberField();
      },
      error: (error: unknown) => this.handleBookingError(error, articleIds),
    });
  }

  /** 409 `article.not_sellable` (cart.md AC-7 / epic.md AC-8): the cart stays completely
   * unchanged — only the payment-panel closes and the affected row gets marked. Mirrors
   * `release-dialog.ts`'s own `handleBookingError` shape. */
  private handleBookingError(error: unknown, articleIds: string[]): void {
    this.paymentPanelVisible.set(false);

    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      (error.error as { errorCode?: string } | null)?.errorCode === 'article.not_sellable'
    ) {
      const numbers = (error.error as { articleNumbers?: number[] } | null)?.articleNumbers ?? [];
      const affectedNumber = numbers[0];
      const affectedItem = this.cartItems().find((item) => item.number === affectedNumber);
      this.highlightedItemId.set(affectedItem?.id ?? null);
      this.infoState.set({
        type: 'error',
        text:
          affectedNumber !== undefined
            ? `Artikel ${affectedNumber} ist nicht mehr im Verkauf.`
            : 'Buchung fehlgeschlagen. Bitte erneut versuchen.',
      });
      return;
    }

    this.infoState.set({ type: 'error', text: 'Buchung fehlgeschlagen. Bitte erneut versuchen.' });
  }

  /** "Letzten Vorgang stornieren" (epic.md §5, AC-11) — articles do NOT return to the cart, this
   * only clears `lastSaleArticleIds` on success. */
  onUndoSale(): void {
    const ids = this.lastSaleArticleIds();
    this.salesApi.undoSale(ids).subscribe({
      next: () => this.lastSaleArticleIds.set([]),
      error: (error: unknown) => this.handleUndoError(error),
    });
  }

  /** 409 `settlement.locked`: spec.md prescribes no exact text for this case (unlike the sales
   * 409 above) — implementer's own judgment call, see task-5-report.md. `lastSaleArticleIds` is
   * kept unchanged so the button stays visible and the user isn't left without an explanation or
   * a way to retry. */
  private handleUndoError(error: unknown): void {
    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      (error.error as { errorCode?: string } | null)?.errorCode === 'settlement.locked'
    ) {
      this.infoState.set({
        type: 'error',
        text: 'Storno nicht mehr möglich — Verkäufer ist bereits abgerechnet.',
      });
      return;
    }
    this.infoState.set({ type: 'error', text: 'Storno fehlgeschlagen. Bitte erneut versuchen.' });
  }

  /** Extracted since it is called from multiple places (init, after add-to-cart, after
   * remove/clear/booking) — reused instead of duplicating the query. */
  private focusArticleNumberField(): void {
    this.hostElement.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
  }
}
