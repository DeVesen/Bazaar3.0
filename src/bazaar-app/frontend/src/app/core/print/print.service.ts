import { ApplicationRef, ComponentRef, Injectable, createComponent, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
// Sanctioned `core` → `feature` boundary crossing (Round-23 Task 2 brief): `SellersApi` is
// already imported the same way by feature code (`release-dialog.ts`), and this print flow
// needs to load the seller/article data itself to keep both callers' `printIntakeReceipt()`
// signature unchanged.
// eslint-disable-next-line boundaries/dependencies
import { ArticleSummary, SellersApi } from '../../features/sellers/data/sellers-api';
// Sanctioned `core` → `shared` boundary crossing: `PrintAbgabeBeleg` (Round-23 Task 1) is the
// one presentation component this service renders; there is no other place for that dependency.
import {
  PrintAbgabeBeleg,
  PrintAbgabeBelegArticle,
  PrintAbgabeBelegSeller,
  // eslint-disable-next-line boundaries/dependencies
} from '../../shared/components/print-abgabe-beleg/print-abgabe-beleg';

/** Data needed to print an Artikelannahme receipt (Round-17 Task 7's booking flow). */
export interface IntakeReceiptData {
  articleIds: string[];
  sellerId: string;
  feeAmount: number;
}

/** Data needed to print a seller's Abrechnungs-Beleg (Round-20 Task 6b's "Drucken" button). */
export interface SellerSummaryPrintData {
  sellerId: string;
  phase: 'preliminary' | 'final';
}

/**
 * `printSellerSummary` is still a stub (Round-24) — deliberately does nothing beyond logging.
 * The `settlement-page` call site must not change when its real implementation lands.
 *
 * `printIntakeReceipt` (Round-23 Task 2) dynamically instantiates the pure presentation
 * component `PrintAbgabeBeleg` (Round-23 Task 1) via Angular's standalone `createComponent`
 * API, feeds it seller/article data it loads itself, triggers `window.print()`, and tears the
 * dynamic component back down on `afterprint`. The call sites in `intake-session-list`/
 * `release-dialog` never changed for this — both already call `printIntakeReceipt()` with only
 * `{ articleIds, sellerId, feeAmount }`, which is exactly this method's unchanged signature.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly sellersApi = inject(SellersApi);
  private readonly appRef = inject(ApplicationRef);

  /**
   * Loads the seller (`SellersApi.getById`) and that seller's articles (`SellersApi.getArticles`)
   * itself rather than taking them as parameters — symmetric with how both existing callers
   * already fetch fee-per-item info themselves (see `release-dialog.ts`'s own `getById` call).
   * `GET /api/sellers/{id}` exists since Round-14's nachfix; no `sellerSummary` parameter needed.
   */
  printIntakeReceipt(data: IntakeReceiptData): void {
    forkJoin({
      seller: this.sellersApi.getById(data.sellerId),
      articles: this.sellersApi.getArticles(data.sellerId),
    }).subscribe({
      next: ({ seller, articles }) => {
        const filteredArticles = this.filterAndOrderArticles(articles, data.articleIds);
        const printSeller: PrintAbgabeBelegSeller = {
          id: seller.id,
          firstName: seller.firstName,
          lastName: seller.lastName,
          address: seller.address,
          postalCode: seller.postalCode,
          city: seller.city,
          phone: seller.phone,
        };
        const printArticles: PrintAbgabeBelegArticle[] = filteredArticles.map((article) => ({
          number: article.number,
          name: article.name,
          brand: article.brand,
          price: article.price,
        }));

        this.renderAndPrint({
          seller: printSeller,
          articles: printArticles,
          feePerItem: seller.feePerItem,
          feeAmount: data.feeAmount,
          occurredAt: new Date(),
        });
      },
      // The booking itself already succeeded by the time this is called — printing is a
      // nice-to-have follow-up, not a critical path, so a failed lookup here only gets logged,
      // never surfaced to the user (no spec requirement for user-facing error handling here).
      error: (error: unknown) => console.error('[PrintService] printIntakeReceipt failed', error),
    });
  }

  printSellerSummary(data: SellerSummaryPrintData): void {
    console.log('[PrintService] printSellerSummary', data);
  }

  /** Keeps `articleIds`' own order (the caller's session order), not the backend's list order. */
  private filterAndOrderArticles(
    articles: ArticleSummary[],
    articleIds: string[],
  ): ArticleSummary[] {
    const byId = new Map(articles.map((article) => [article.id, article]));
    return articleIds
      .map((id) => byId.get(id))
      .filter((article): article is ArticleSummary => !!article);
  }

  private renderAndPrint(inputs: {
    seller: PrintAbgabeBelegSeller;
    articles: PrintAbgabeBelegArticle[];
    feePerItem: number;
    feeAmount: number;
    occurredAt: Date;
  }): void {
    // No explicit `hostElement` — letting `createComponent` create its own host element gives it
    // the component's real selector tag (`<app-print-abgabe-beleg>`), which both this method's
    // own test and any future DOM-based debugging/e2e rely on being findable by that selector.
    // A supplied custom host element (e.g. a plain `<div>`) would replace that tag entirely.
    const componentRef: ComponentRef<PrintAbgabeBeleg> = createComponent(PrintAbgabeBeleg, {
      environmentInjector: this.appRef.injector,
    });
    componentRef.setInput('seller', inputs.seller);
    componentRef.setInput('articles', inputs.articles);
    componentRef.setInput('feePerItem', inputs.feePerItem);
    componentRef.setInput('feeAmount', inputs.feeAmount);
    componentRef.setInput('occurredAt', inputs.occurredAt);

    const hostElement = componentRef.location.nativeElement as HTMLElement;
    // Off-screen, not `display: none` — a `display: none` host would stay unrendered for
    // `window.print()` too and nothing would print at all. Positioning it off-canvas keeps it
    // out of the visible viewport (no flash on screen) while it still lays out and prints.
    hostElement.style.position = 'fixed';
    hostElement.style.top = '0';
    hostElement.style.left = '-10000px';
    document.body.appendChild(hostElement);

    this.appRef.attachView(componentRef.hostView);

    const cleanup = (): void => {
      window.removeEventListener('afterprint', cleanup);
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      hostElement.remove();
    };
    window.addEventListener('afterprint', cleanup);

    this.appRef.tick();
    window.print();
  }
}
