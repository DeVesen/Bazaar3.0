import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Input, InputAddon } from '../../../../shared/components/input/input';
import { Page } from '../../../../shared/components/page/page';
import { Numpad } from '../../../../shared/components/numpad/numpad';
import { BarcodeScanner } from '../../../../shared/components/barcode-scanner/barcode-scanner';
import { ResultEvent, ResultKind, createResultEvent } from '../../../../shared/components/result-overlay/result-event';
import { ResultOverlay } from '../../../../shared/components/result-overlay/result-overlay';
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
 * calls `SalesApi.bookSale()`. Deliberately narrower than `ArticleByNumberResult` —
 * only the fields the cart needs to render a row and this page needs to sum the total.
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

type FieldMode = 'keyboard' | 'camera' | 'numpad';

/** docs/spec/2026-09-22-verkauf-eingabe-enter-layout.md "Info-Text initial/leer": gelb, shown on
 * fresh navigation and again whenever the page returns to an empty-cart baseline. */
const INITIAL_INFO_STATE: InfoState = { type: 'warn', text: 'Bitte Artikelnummer eingeben' };

/**
 * Kasse/Verkauf page (Epic_Verkauf) — left column: article-number `app-input` (keyboard,
 * with camera/numpad as sibling panels below it) driven entirely by Enter (no auto-lookup),
 * an inline InfoArea reporting the lookup result, no Preis-Button anymore — a second Enter on
 * a "found" result adds it to the basket. Right column renders `app-cart`, which owns the
 * remove/clear/checkout intents (this page still owns `cartItems` mutation and refocusing).
 * "BUCHEN" opens `app-payment-panel` in a `p-dialog` overlay; `SalesApi.bookSale()`/`undoSale()`
 * back the booking and Storno flow, mirroring `release-dialog.ts`'s own confirm→book→handle-409
 * shape.
 */
@Component({
  selector: 'app-checkout-page',
  imports: [ButtonModule, DialogModule, Input, Page, Numpad, BarcodeScanner, Cart, PaymentPanel, ResultOverlay],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly articlesApi = inject(ArticlesApi);
  private readonly salesApi = inject(SalesApi);
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

  readonly cartItems = signal<CartItem[]>([]);
  readonly infoState = signal<InfoState>(INITIAL_INFO_STATE);
  /** Latest lookup/cart result for `app-result-overlay` (green = like the InfoArea, see spec "Verkauf-Farben"). */
  readonly resultEvent = signal<ResultEvent | null>(null);
  readonly lastSaleArticleIds = signal<string[]>([]);
  readonly paymentPanelVisible = signal(false);
  readonly highlightedItemId = signal<string | null>(null);

  readonly articleNumber = signal('');
  readonly activeMode = signal<FieldMode>('keyboard');
  readonly previousMode = signal<FieldMode>('keyboard');
  readonly searching = signal(false);
  /** The currently looked-up, sellable-and-not-in-cart article; non-null exactly while the field
   * is in the "valide gefunden" state. */
  readonly foundArticle = signal<ArticleByNumberResult | null>(null);
  /** Raw field value at the moment `foundArticle` was set — typing away from it invalidates the
   * find (spec.md "Tippen nach Valid": the next Enter becomes a new lookup, not a cart add). */
  readonly resultNumber = signal<string | null>(null);

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

  /** Kamera/Nummernblock-Umschalter + Clear/Enter; im "valide gefunden"-Zustand nur noch
   * Clear/Enter (spec.md "Zustand valide"). Das Enter-Addon bekommt während `searching()` eine
   * `--disabled`-Klasse (spec.md AC "Enter während Suche wirkungslos"; `InputAddon` selbst hat
   * kein natives disabled-Feld). */
  readonly inputAddons = computed<InputAddon[]>(() => {
    const clearAndEnter: InputAddon[] = [
      { type: 'icon', value: 'pi pi-times', key: 'clear' },
      {
        type: 'icon',
        value: 'pi pi-reply',
        key: 'enter',
        class: this.searching() ? 'checkout-page__addon--disabled' : undefined,
      },
    ];
    if (this.foundArticle()) return clearAndEnter;
    return [
      {
        type: 'icon',
        value: 'pi pi-camera',
        key: 'camera',
        class: this.activeMode() === 'camera' ? 'checkout-page__addon--active' : undefined,
      },
      {
        type: 'icon',
        value: 'pi pi-th-large',
        key: 'numpad',
        class: this.activeMode() === 'numpad' ? 'checkout-page__addon--active' : undefined,
      },
      ...clearAndEnter,
    ];
  });

  constructor() {
    // Fokus-Verhalten (spec.md §7, AC-1): focus the article-number field on page entry.
    // `app-input` exposes no public `focus()` — same best-effort host-querySelector pattern as
    // `scan-dialog.ts`'s `onShown()`.
    queueMicrotask(() => this.focusArticleNumberField());
  }

  onTyped(value: string): void {
    this.articleNumber.set(value);
    if (this.foundArticle() && value !== this.resultNumber()) {
      this.foundArticle.set(null);
      this.resultNumber.set(null);
    }
  }

  onAddonClick(key: string): void {
    switch (key) {
      case 'camera':
        this.activeMode.set(this.activeMode() === 'camera' ? 'keyboard' : 'camera');
        return;
      case 'numpad':
        this.activeMode.set(this.activeMode() === 'numpad' ? 'keyboard' : 'numpad');
        return;
      case 'clear':
        this.onTyped('');
        return;
      case 'enter':
        this.onEnterPressed();
        return;
    }
  }

  /** Artikelnummer ist reine Ganzzahl — nur Ziffern und Backspace werden übernommen, gleiches
   * Muster wie `intake-renumber-lookup-popup.ts`'s eigener `onNumpadKey`. */
  onNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    if (key === 'Backspace') {
      this.onTyped(this.articleNumber().slice(0, -1));
      return;
    }
    if (/^[0-9]$/.test(key)) {
      this.onTyped(this.articleNumber() + key);
    }
  }

  onNumpadClear(): void {
    this.onTyped('');
  }

  onCodeDetected(code: string): void {
    this.onTyped(code);
    this.activeMode.set('keyboard');
  }

  onEnterPressed(): void {
    if (this.searching()) return;
    // `.trim()`-insensitive: a barcode-scanner keyboard-wedge can append whitespace to the raw
    // field value before its own Enter keystroke, and `resultNumber` is always the trimmed value
    // (set from `trimmed` in `handleArticleFound`) — comparing untrimmed here would otherwise
    // re-trigger a lookup instead of adding to cart on the primary "2nd Enter" path.
    if (this.foundArticle() && this.articleNumber().trim() === this.resultNumber()) {
      this.addToCart();
      return;
    }
    this.startLookup();
  }

  private startLookup(): void {
    const trimmed = this.articleNumber().trim();
    if (!trimmed) return;
    const number = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(number)) return;

    // Storno-Button "verschwindet, sobald der nächste Artikel gescannt wird" (epic.md §5) — this
    // is the single entry point every keyboard/camera/numpad lookup funnels through, so one reset
    // here covers all input modes. Placed after the empty/invalid guards above so a reflex Enter
    // on an empty or non-numeric field does not silently clear "Letzten Vorgang stornieren".
    this.lastSaleArticleIds.set([]);

    // Local duplicate check first, no network call (Epic_Verkauf §2 "Bereits im Warenkorb",
    // cart.md AC-2).
    if (this.cartItems().some((item) => item.number === number)) {
      this.infoState.set({ type: 'warn', text: 'Artikel ist bereits im Warenkorb.' });
      this.showResult('already');
      this.foundArticle.set(null);
      this.resultNumber.set(null);
      this.focusArticleNumberField(true);
      return;
    }

    this.searching.set(true);
    this.articlesApi.getByNumber(number).subscribe({
      next: (article) => this.handleArticleFound(article, number, trimmed),
      error: (error: unknown) => this.handleArticleLookupError(error, number),
    });
  }

  private handleArticleFound(article: ArticleByNumberResult, number: number, matchedRaw: string): void {
    this.searching.set(false);
    switch (article.status) {
      case 'selling':
        this.infoState.set({
          type: 'success',
          text: `Artikel gültig – ${article.price.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} – Enter zum Übernehmen`,
        });
        this.foundArticle.set(article);
        this.resultNumber.set(matchedRaw);
        this.previousMode.set(this.activeMode());
        this.activeMode.set('keyboard');
        this.showResult('success');
        this.focusArticleNumberField(true);
        return;
      case 'registered':
        this.infoState.set({
          type: 'error',
          text: `Artikel ${number} ist noch nicht freigegeben — zuerst annehmen.`,
        });
        this.foundArticle.set(null);
        this.showResult('failed');
        this.focusArticleNumberField(true);
        return;
      case 'sold':
        this.infoState.set({ type: 'error', text: `Artikel ${number} ist bereits verkauft.` });
        this.foundArticle.set(null);
        this.showResult('failed');
        this.focusArticleNumberField(true);
        return;
      case 'returned':
        this.infoState.set({
          type: 'error',
          text: `Artikel ${number} wurde an den Verkäufer zurückgegeben.`,
        });
        this.foundArticle.set(null);
        this.showResult('failed');
        this.focusArticleNumberField(true);
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
        this.showResult('failed');
        this.focusArticleNumberField(true);
    }
  }

  private handleArticleLookupError(error: unknown, number: number): void {
    this.searching.set(false);
    if (error instanceof HttpErrorResponse && error.status === 404) {
      this.infoState.set({ type: 'error', text: `Artikelnummer ${number} ist nicht bekannt.` });
      this.foundArticle.set(null);
      this.showResult('failed');
      this.focusArticleNumberField(true);
      return;
    }

    // Not part of the epic's six-state table (network/5xx only) — treated conservatively with a
    // generic error message rather than silently doing nothing.
    this.infoState.set({ type: 'error', text: 'Artikel-Suche fehlgeschlagen. Bitte erneut versuchen.' });
    this.foundArticle.set(null);
    this.showResult('failed');
    this.focusArticleNumberField(true);
  }

  private addToCart(): void {
    const article = this.foundArticle();
    if (!article) return;
    this.cartItems.update((items) => [
      ...items,
      { id: article.id, number: article.number, name: article.name, price: article.price },
    ]);
    this.foundArticle.set(null);
    this.resultNumber.set(null);
    this.articleNumber.set('');
    this.infoState.set({ type: 'success', text: 'Nächsten Artikel eingeben …' });
    this.showResult('cart');
    this.activeMode.set(this.previousMode());
    this.focusArticleNumberField();
  }

  onCartRemoveItem(id: string): void {
    this.cartItems.update((items) => items.filter((item) => item.id !== id));
    this.highlightedItemId.set(null);
    this.resetField();
    this.focusArticleNumberField();
  }

  onCartClear(): void {
    this.cartItems.set([]);
    this.highlightedItemId.set(null);
    this.resetField();
    this.infoState.set(INITIAL_INFO_STATE);
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
    // `bookSale()` only needs the article ids, not the payment breakdown (unlike
    // release-dialog.ts/intake-session-list.ts, which forward `event.totalAmount`). `void` keeps
    // the parameter referenced so lint's no-unused-vars rule (no underscore-prefix exemption
    // configured in this project) stays quiet without pretending it is actually used.
    void event;
    const articleIds = this.cartItems().map((item) => item.id);
    this.salesApi.bookSale(articleIds).subscribe({
      next: () => {
        this.paymentPanelVisible.set(false);
        this.showResult('paid');
        this.lastSaleArticleIds.set(articleIds);
        this.cartItems.set([]);
        this.highlightedItemId.set(null);
        this.resetField();
        this.infoState.set(INITIAL_INFO_STATE);
        this.focusArticleNumberField();
      },
      error: (error: unknown) => this.handleBookingError(error),
    });
  }

  /** 409 `article.not_sellable` (cart.md AC-7 / epic.md AC-8): the cart stays completely
   * unchanged — only the payment-panel closes and the affected row gets marked. Mirrors
   * `release-dialog.ts`'s own `handleBookingError` shape. */
  private handleBookingError(error: unknown): void {
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

  private showResult(kind: ResultKind): void {
    this.resultEvent.set(createResultEvent(kind));
  }

  private resetField(): void {
    this.articleNumber.set('');
    this.foundArticle.set(null);
    this.resultNumber.set(null);
  }

  /** Extracted since it is called from multiple places (init, after found/error results,
   * after add-to-cart, after remove/clear/booking) — reused instead of duplicating the query.
   * `selectAll` selects the field's content too (spec.md: focus+select on every settled result
   * except the freshly-cleared/init states). */
  private focusArticleNumberField(selectAll = false): void {
    const input = this.hostElement.nativeElement.querySelector<HTMLInputElement>('input');
    input?.focus();
    if (selectAll) input?.select();
  }
}
