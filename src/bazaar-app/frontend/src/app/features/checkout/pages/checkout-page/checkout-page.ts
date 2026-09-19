import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from '../../../../shared/components/input-group/input-group';
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
 * Preis-Button that adds the found article to the basket. Right column (`cart`,
 * Task 4) and the payment-panel/BUCHEN/Storno wiring (Task 5) are out of scope for
 * this task — see the trivial placeholder in the template and `lastSaleArticleIds`
 * below, both left for those tasks to build on.
 */
@Component({
  selector: 'app-checkout-page',
  imports: [ButtonModule, InputGroup],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private readonly articlesApi = inject(ArticlesApi);
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

  private readonly numberGroup = viewChild<InputGroup>('numberGroup');

  readonly cartItems = signal<CartItem[]>([]);
  readonly infoState = signal<InfoState>({ type: 'info', text: 'Ersten Artikel eingeben …' });
  /** The currently looked-up, sellable-and-not-in-cart article; drives the Preis-Button's
   * visibility/price/caption. `null` whenever the Preis-Button should be hidden. */
  readonly foundArticle = signal<ArticleByNumberResult | null>(null);
  /** Declared now (empty), populated/read by Task 5's Storno wiring — no UI here yet. */
  readonly lastSaleArticleIds = signal<string[]>([]);

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

  /** Extracted since it is called from multiple places (init, after add-to-cart) — Task 4/5 will
   * call it again after remove/clear/undo, reusing this instead of duplicating the query. */
  private focusArticleNumberField(): void {
    this.hostElement.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
  }
}
