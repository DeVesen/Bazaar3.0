import { ApplicationRef, ComponentRef, Injectable, createComponent, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
// Sanctioned `core` → `feature` boundary crossing (Round-23 Task 2 brief) — the first one in
// this project (`release-dialog.ts`'s own `SellersApi` import is same-feature, not a
// cross-boundary precedent). Sanctioned because the brief forbids extending
// `printIntakeReceipt()`'s signature, so this print flow must load the seller/article data
// itself rather than have callers pass it in.
// eslint-disable-next-line boundaries/dependencies
import { ArticleSummary, SellersApi } from '../../features/sellers/data/sellers-api';
// Sanctioned `core` → `feature` boundary crossing, same justification as the `SellersApi` import
// above: `printSellerSummary`'s signature must not grow beyond `{ sellerId, phase }` (Round-24
// Task 2 brief), so this print flow loads the settlement data itself instead of having
// `settlement-page` pass it in.
// eslint-disable-next-line boundaries/dependencies
import { SettlementApi } from '../../features/settlement/data/settlement-api';
// Sanctioned `core` → `shared` boundary crossing: `PrintAbgabeBeleg` (Round-23 Task 1) is the
// one presentation component this service renders; there is no other place for that dependency.
import {
  PrintAbgabeBeleg,
  PrintAbgabeBelegArticle,
  PrintAbgabeBelegSeller,
  // eslint-disable-next-line boundaries/dependencies
} from '../../shared/components/print-abgabe-beleg/print-abgabe-beleg';
// Sanctioned `core` → `shared` boundary crossing, same justification as `PrintAbgabeBeleg` above.
import {
  PrintVerkaeuferUebersicht,
  PrintVerkaeuferUebersichtArticle,
  PrintVerkaeuferUebersichtSeller,
  PrintVerkaeuferUebersichtSettlement,
  // eslint-disable-next-line boundaries/dependencies
} from '../../shared/components/print-verkaeufer-uebersicht/print-verkaeufer-uebersicht';

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
 * `printIntakeReceipt` (Round-23 Task 2) and `printSellerSummary` (Round-24 Task 2) both
 * dynamically instantiate a pure presentation component (`PrintAbgabeBeleg` /
 * `PrintVerkaeuferUebersicht`) via Angular's standalone `createComponent` API, feed it
 * seller/article(/settlement) data each method loads itself, trigger `window.print()`, and tear
 * the dynamic component back down on `afterprint`. Neither method's call sites ever changed for
 * this — `intake-session-list`/`release-dialog` still call `printIntakeReceipt()` with only
 * `{ articleIds, sellerId, feeAmount }`, and `settlement-page` still calls `printSellerSummary()`
 * with only `{ sellerId, phase }`, both their methods' unchanged signatures.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly sellersApi = inject(SellersApi);
  private readonly settlementApi = inject(SettlementApi);
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

        this.renderAndPrintAbgabeBeleg({
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

  /**
   * Loads the settlement (`SettlementApi.getSettlement`) and that seller's articles
   * (`SellersApi.getArticles`) itself, same reasoning as `printIntakeReceipt` — the caller's own
   * `{ sellerId, phase }` must not grow. Unlike `printIntakeReceipt`, `articles` is passed through
   * unfiltered: `PrintVerkaeuferUebersicht` groups by `status` itself (AC-1/AC-2/AC-7), it isn't
   * restricted to a caller-supplied id subset.
   */
  printSellerSummary(data: SellerSummaryPrintData): void {
    forkJoin({
      settlement: this.settlementApi.getSettlement(data.sellerId),
      articles: this.sellersApi.getArticles(data.sellerId),
    }).subscribe({
      next: ({ settlement, articles }) => {
        const printSeller: PrintVerkaeuferUebersichtSeller = {
          id: settlement.seller.id,
          firstName: settlement.seller.firstName,
          lastName: settlement.seller.lastName,
          postalCode: settlement.seller.postalCode,
          city: settlement.seller.city,
        };
        const printArticles: PrintVerkaeuferUebersichtArticle[] = articles.map((article) => ({
          number: article.number,
          name: article.name,
          price: article.price,
          status: article.status,
        }));
        const printSettlement: PrintVerkaeuferUebersichtSettlement = {
          revenue: settlement.revenue,
          commission: settlement.commission,
          payout: settlement.payout,
          commissionRate: settlement.commissionRate,
          intakeFeePaid: settlement.intakeFeePaid,
        };

        this.renderAndPrintVerkaeuferUebersicht({
          seller: printSeller,
          articles: printArticles,
          settlement: printSettlement,
          phase: data.phase,
        });
      },
      // Same reasoning as `printIntakeReceipt`'s own error handler: printing is a nice-to-have
      // follow-up here too (the settlement/return itself already succeeded), never a critical
      // path, so a failed lookup only gets logged.
      error: (error: unknown) => console.error('[PrintService] printSellerSummary failed', error),
    });
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

  private renderAndPrintAbgabeBeleg(inputs: {
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

    this.mountRenderAndPrint(componentRef);
  }

  /**
   * Same `createComponent`/mount/print/cleanup pattern as `renderAndPrintAbgabeBeleg`, kept as
   * its own method (rather than a single generic one) because no call site needs to treat both
   * component types uniformly — each print method already knows exactly which component and
   * which inputs it renders.
   */
  private renderAndPrintVerkaeuferUebersicht(inputs: {
    seller: PrintVerkaeuferUebersichtSeller;
    articles: PrintVerkaeuferUebersichtArticle[];
    settlement: PrintVerkaeuferUebersichtSettlement;
    phase: 'preliminary' | 'final';
  }): void {
    const componentRef: ComponentRef<PrintVerkaeuferUebersicht> = createComponent(
      PrintVerkaeuferUebersicht,
      { environmentInjector: this.appRef.injector },
    );
    componentRef.setInput('seller', inputs.seller);
    componentRef.setInput('articles', inputs.articles);
    componentRef.setInput('settlement', inputs.settlement);
    componentRef.setInput('phase', inputs.phase);

    this.mountRenderAndPrint(componentRef);
  }

  /**
   * Shared mount/print/cleanup mechanics for both dynamic print components — extracted once the
   * second print method needed the identical DOM-attach/`window.print`/`afterprint`-teardown
   * sequence, so the two `ComponentRef<...>` types never had to be unified into one signature
   * upstream (each caller still passes its own concretely-typed `ComponentRef`).
   */
  private mountRenderAndPrint(componentRef: ComponentRef<unknown>): void {
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
