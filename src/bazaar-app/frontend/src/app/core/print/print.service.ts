import { ApplicationRef, ComponentRef, Injectable, createComponent, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, forkJoin, map } from 'rxjs';
// Sanctioned `core` → `feature` boundary crossing (first one in this project, Round-23): the
// print flows load the seller/article/settlement/text data themselves, so their callers keep
// passing only ids. `SellersApi`'s same-feature import in `release-dialog.ts` is no precedent.
// eslint-disable-next-line boundaries/dependencies
import { ArticleSummary, SellersApi } from '../../features/sellers/data/sellers-api';
// Sanctioned `core` → `feature` boundary crossing, same justification as above.
// eslint-disable-next-line boundaries/dependencies
import { SettlementApi } from '../../features/settlement/data/settlement-api';
// Sanctioned `core` → `feature` boundary crossing, same justification as above.
// eslint-disable-next-line boundaries/dependencies
import { PrintTextsApi } from '../../features/settings/data/print-texts-api';
// Sanctioned `core` → `shared` boundary crossing: `PrintDocument` is the one presentation
// component this service renders.
// eslint-disable-next-line boundaries/dependencies
import { PrintDocument } from '../../shared/components/print-document/print-document';
import {
  PrintArticle,
  PrintArticleStatus,
  PrintDocumentModel,
  PrintSeller,
  buildAbgabeBelegModel,
  buildVerkaeuferUebersichtModel,
  // eslint-disable-next-line boundaries/dependencies
} from '../../shared/components/print-document/print-document.model';

/** Data needed to print the Abgabe-Beleg after "Speichern" (Artikelannahme) or a Freigabe. */
export interface IntakeReceiptData {
  articleIds: string[];
  sellerId: string;
}

/** Data needed to print a seller's Verkäufer-Übersicht (Abrechnung). */
export interface SellerSummaryPrintData {
  sellerId: string;
}

const REGISTERED_STATUS = 'registered';
const PRINT_STATUSES: readonly string[] = ['registered', 'selling', 'sold', 'returned'] satisfies PrintArticleStatus[];
const PRINT_HOST_ATTRIBUTE = 'data-print-host';
const PRINT_STYLE_ATTRIBUTE = 'data-print-style';

/**
 * Gilt nur, solange das Druckdokument im DOM hängt: A4 hochkant ohne Seitenrand, und im Druck
 * bleibt von der Seite nur das Dokument übrig — alles andere im `body` (App, Overlays, Toasts)
 * entfällt, der Host rückt aus dem Off-Canvas-Bereich in den normalen Fluss.
 */
const PRINT_STYLE = `
@page { size: A4 portrait; margin: 0; }
@media print {
  html, body { margin: 0 !important; background: #fff !important; }
  body > *:not([data-print-host]) { display: none !important; }
  body > [data-print-host] { position: static !important; left: auto !important; top: auto !important; }
}
`;

const LOAD_ERROR_MESSAGE = 'Beleg konnte nicht geladen werden';

function toPrintSeller(seller: PrintSeller): PrintSeller {
  return {
    id: seller.id,
    firstName: seller.firstName,
    lastName: seller.lastName,
    address: seller.address,
    postalCode: seller.postalCode,
    city: seller.city,
  };
}

function toPrintArticle(article: ArticleSummary): PrintArticle {
  return {
    number: article.number,
    name: article.name,
    category: article.category,
    brand: article.brand,
    size: article.size,
    color: article.color,
    price: article.price,
    status: article.status,
  };
}

/** Nur Artikel mit druckbarem Status; ein unbekannter Status fiele sonst still aus den Gruppen. */
function toPrintArticles(articles: ArticleSummary[]): PrintArticle[] {
  return articles.filter((article) => PRINT_STATUSES.includes(article.status)).map(toPrintArticle);
}

/**
 * Lädt die Daten, baut das Modell des Belegs, rendert `PrintDocument` dynamisch, öffnet den
 * Druckdialog des Geräts und baut alles bei `afterprint` wieder ab. Die Aufrufer übergeben nur
 * Ids; welche Artikel auf den Beleg kommen, entscheidet der jeweilige Auslöser:
 * Druckbutton = alle außer „Registriert", Speichern/Freigabe = die gebuchten bzw. freigegebenen.
 */
@Injectable({ providedIn: 'root' })
export class PrintService {
  private readonly sellersApi = inject(SellersApi);
  private readonly settlementApi = inject(SettlementApi);
  private readonly printTextsApi = inject(PrintTextsApi);
  private readonly messageService = inject(MessageService);
  private readonly appRef = inject(ApplicationRef);

  /** Abbau des aktuell eingehängten Dokuments; `null`, solange keins hängt. */
  private activeCleanup: (() => void) | null = null;

  /** Druckbutton der Verkäufer-Kachel: alle Artikel des Verkäufers außer „Registriert". */
  printSellerReceipt(sellerId: string): void {
    this.loadAbgabeBeleg(sellerId, (articles) =>
      articles.filter((article) => article.status !== REGISTERED_STATUS),
    ).subscribe({
      next: (model) => this.mountRenderAndPrint(model),
      error: () => this.showLoadError(),
    });
  }

  /** „Speichern" in der Artikelannahme und Freigabe: genau die übergebenen Artikel. */
  printIntakeReceipt(data: IntakeReceiptData): void {
    const wanted = new Set(data.articleIds);
    this.loadAbgabeBeleg(data.sellerId, (articles) =>
      articles.filter((article) => wanted.has(article.id)),
    ).subscribe({
      next: (model) => this.mountRenderAndPrint(model),
      // Die Buchung ist schon erfolgt; der Toast sagt nur, dass der Beleg fehlt.
      error: () => this.showLoadError(),
    });
  }

  /** Druck in der Abrechnung: Verkäufer-Übersicht mit den Beträgen der Abrechnung. */
  printSellerSummary(data: SellerSummaryPrintData): void {
    forkJoin({
      seller: this.sellersApi.getById(data.sellerId),
      settlement: this.settlementApi.getSettlement(data.sellerId),
      articles: this.sellersApi.getArticles(data.sellerId),
      texts: this.printTextsApi.get(),
    })
      .pipe(
        map(({ seller, settlement, articles, texts }) =>
          buildVerkaeuferUebersichtModel({
            seller: toPrintSeller(seller),
            articles: toPrintArticles(articles),
            freitexts: texts.verkaeuferUebersicht,
            feePerItem: seller.feePerItem,
            settlement: {
              revenue: settlement.revenue,
              commission: settlement.commission,
              payout: settlement.payout,
              commissionRate: settlement.commissionRate,
            },
            printedAt: new Date(),
          }),
        ),
      )
      .subscribe({
        next: (model) => this.mountRenderAndPrint(model),
        error: () => this.showLoadError(),
      });
  }

  private showLoadError(): void {
    this.messageService.add({ severity: 'error', summary: LOAD_ERROR_MESSAGE });
  }

  private loadAbgabeBeleg(
    sellerId: string,
    selectArticles: (articles: ArticleSummary[]) => ArticleSummary[],
  ): Observable<PrintDocumentModel> {
    return forkJoin({
      seller: this.sellersApi.getById(sellerId),
      articles: this.sellersApi.getArticles(sellerId),
      texts: this.printTextsApi.get(),
    }).pipe(
      map(({ seller, articles, texts }) =>
        buildAbgabeBelegModel({
          seller: toPrintSeller(seller),
          articles: toPrintArticles(selectArticles(articles)),
          freitexts: texts.abgabeBeleg,
          feePerItem: seller.feePerItem,
          commissionRate: seller.salesCommission,
          printedAt: new Date(),
        }),
      ),
    );
  }

  private mountRenderAndPrint(model: PrintDocumentModel): void {
    // Ein Dokument aus einem früheren Druck, dessen `afterprint` ausblieb (Android/iOS) oder das
    // nach einem Doppelklick noch hängt, wird zuerst abgebaut — es hängt immer höchstens eins.
    this.activeCleanup?.();

    const componentRef: ComponentRef<PrintDocument> = createComponent(PrintDocument, {
      environmentInjector: this.appRef.injector,
    });
    componentRef.setInput('model', model);

    const hostElement = componentRef.location.nativeElement as HTMLElement;
    hostElement.setAttribute(PRINT_HOST_ATTRIBUTE, '');
    // Off-screen, not `display: none` — a hidden host would stay unrendered for `window.print()`
    // too. Im Druck rückt das Isolations-CSS den Host in den normalen Fluss.
    hostElement.style.position = 'fixed';
    hostElement.style.top = '0';
    hostElement.style.left = '-10000px';
    document.body.appendChild(hostElement);

    const styleElement = document.createElement('style');
    styleElement.setAttribute(PRINT_STYLE_ATTRIBUTE, '');
    styleElement.textContent = PRINT_STYLE;
    document.head.appendChild(styleElement);

    this.appRef.attachView(componentRef.hostView);

    const cleanup = (): void => {
      window.removeEventListener('afterprint', cleanup);
      this.activeCleanup = null;
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      hostElement.remove();
      styleElement.remove();
    };
    this.activeCleanup = cleanup;
    window.addEventListener('afterprint', cleanup);

    this.appRef.tick();
    componentRef.instance.applyMeasurement();
    this.appRef.tick();
    this.openPrintDialog(cleanup);
  }

  /**
   * Kein `finally`: Auf Android/iOS kehrt `window.print()` sofort zurück, während der Dialog
   * noch rendert — abgebaut wird hier nur, wenn der Aufruf selbst wirft.
   */
  private openPrintDialog(cleanup: () => void): void {
    try {
      window.print();
    } catch (error: unknown) {
      cleanup();
      console.error('[PrintService] window.print failed', error);
    }
  }
}
