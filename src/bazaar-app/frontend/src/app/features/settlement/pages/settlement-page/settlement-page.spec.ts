import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { SettlementPage } from './settlement-page';
import { SellerSearch, SellerSummary } from '../../../../shared/components/seller-search/seller-search';
import { ScanDialog } from '../../../../shared/components/scan-dialog/scan-dialog';
// eslint-disable-next-line boundaries/dependencies -- see settlement-page.ts's own justification
import { ArticleSummary, SellerSearchResult, SellersApi } from '../../../sellers/data/sellers-api';
import { PrintService } from '../../../../core/print/print.service';
import { SellerSettlement, SettleSellerResponse, SettlementApi } from '../../data/settlement-api';
// `SellerSearch`/`ScanDialog` both compose `InputGroup` -> `BarcodeScanner` — importing the ONE
// shared `@zxing/browser` mock (see that file's own comment for why it must be centralized) so
// no test here touches real device camera APIs (unavailable in jsdom). The import alone is
// enough to trigger `vi.mock` registration; this file doesn't need to configure/track calls.
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';

function searchResult(overrides: Partial<SellerSearchResult> = {}): SellerSearchResult {
  return {
    id: 'SEL00001',
    firstName: 'Anna',
    lastName: 'Meier',
    city: 'Karlsruhe',
    sellerType: 'Privat',
    settledAt: null,
    ...overrides,
  };
}

function settlement(overrides: Partial<SellerSettlement> = {}): SellerSettlement {
  return {
    seller: {
      id: 'SEL00001',
      firstName: 'Anna',
      lastName: 'Meier',
      address: 'Hauptstr. 1',
      postalCode: '76133',
      city: 'Karlsruhe',
    },
    openCount: 0,
    soldCount: 31,
    returnedCount: 9,
    revenue: 380.5,
    commissionRate: 12.5,
    commission: 47.56,
    payout: 332.94,
    intakeFeePaid: 20,
    notDeliveredCount: 10,
    settledAt: null,
    payoutAmount: null,
    canSettle: false,
    ...overrides,
  };
}

function article(overrides: Partial<ArticleSummary> = {}): ArticleSummary {
  return {
    id: 'ART00001',
    number: 1042,
    name: 'Winterjacke',
    brand: null,
    category: null,
    price: 12.5,
    status: 'selling',
    soldManually: false,
    ...overrides,
  };
}

function sellersApiStub() {
  return {
    search: vi.fn().mockReturnValue(of([searchResult()])),
    getArticles: vi.fn().mockReturnValue(of([article()])),
  };
}

function settleSellerResponse(overrides: Partial<SettleSellerResponse> = {}): SettleSellerResponse {
  return {
    settledAt: '2026-01-15T10:00:00Z',
    payoutAmount: 332.94,
    removedArticleCount: 10,
    ...overrides,
  };
}

function settlementApiStub() {
  return {
    getSettlement: vi.fn().mockReturnValue(of(settlement())),
    returnArticle: vi.fn().mockReturnValue(of(undefined)),
    settle: vi.fn().mockReturnValue(of(settleSellerResponse())),
  };
}

function printServiceStub() {
  return { printSellerSummary: vi.fn() };
}

function messageServiceStub() {
  return { add: vi.fn() };
}

/** `ScanDialog` (a real dependency here, mounted by `settlement-page.html` once in the 'view'
 * state) injects `HttpClient` directly — this fake only needs to satisfy its constructor-time
 * effect, never exercised further since these tests drive `SettlementPage`'s own
 * onArticleConfirmed()/scanDialogVisible logic directly, same pattern as
 * `release-dialog.spec.ts`'s own `httpClientStub()`. */
function httpClientStub(): HttpClient {
  return { get: vi.fn().mockReturnValue(of([])) } as unknown as HttpClient;
}

async function setup(
  options: {
    sellersApi?: ReturnType<typeof sellersApiStub>;
    settlementApi?: ReturnType<typeof settlementApiStub>;
    printService?: ReturnType<typeof printServiceStub>;
    messageService?: ReturnType<typeof messageServiceStub>;
  } = {},
) {
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: vi.fn() },
    configurable: true,
  });

  const sellersApi = options.sellersApi ?? sellersApiStub();
  const settlementApi = options.settlementApi ?? settlementApiStub();
  const printService = options.printService ?? printServiceStub();
  const messageService = options.messageService ?? messageServiceStub();

  await TestBed.configureTestingModule({
    imports: [SettlementPage],
    providers: [
      { provide: SellersApi, useValue: sellersApi },
      { provide: SettlementApi, useValue: settlementApi },
      { provide: PrintService, useValue: printService },
      { provide: MessageService, useValue: messageService },
      { provide: HttpClient, useValue: httpClientStub() },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SettlementPage);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, sellersApi, settlementApi, printService, messageService };
}

function selectSeller(component: SettlementPage, overrides: Partial<SellerSummary> = {}): void {
  component.onSellerSelected({
    id: 'SEL00001',
    firstName: 'Anna',
    lastName: 'Meier',
    zip: '',
    city: 'Karlsruhe',
    settledAt: null,
    ...overrides,
  });
}

describe('SettlementPage', () => {
  it('starts in the "selection" state and renders app-seller-search (AC-1)', async () => {
    const { fixture, component } = await setup();

    expect(component.state()).toBe('selection');
    expect(fixture.debugElement.query(By.directive(SellerSearch))).toBeTruthy();
  });

  it('loads the full seller list on init via SellersApi.search(\'\')', async () => {
    const { sellersApi } = await setup();
    expect(sellersApi.search).toHaveBeenCalledWith('');
  });

  it('switches to "view", loads the settlement read-model and the article list on sellerSelected', async () => {
    const settlementApi = settlementApiStub();
    settlementApi.getSettlement.mockReturnValue(
      of(settlement({ openCount: 4, soldCount: 31, revenue: 380.5 })),
    );
    const sellersApi = sellersApiStub();
    const { fixture, component } = await setup({ settlementApi, sellersApi });

    selectSeller(component);
    fixture.detectChanges();

    expect(component.state()).toBe('view');
    expect(settlementApi.getSettlement).toHaveBeenCalledWith('SEL00001');
    expect(sellersApi.getArticles).toHaveBeenCalledWith('SEL00001');
    expect(component.settlement()?.openCount).toBe(4);
    expect(component.settlement()?.soldCount).toBe(31);
    expect(component.settlement()?.revenue).toBe(380.5);
    expect(component.settlement()?.seller.firstName).toBe('Anna');

    const header = fixture.nativeElement.querySelector('.settlement-page__name') as HTMLElement;
    expect(header.textContent).toContain('Anna');
    expect(header.textContent).toContain('Meier');
  });

  it('sorts the article list ascending by number', async () => {
    const sellersApi = sellersApiStub();
    sellersApi.getArticles.mockReturnValue(
      of([article({ id: 'a', number: 30 }), article({ id: 'b', number: 5 }), article({ id: 'c', number: 17 })]),
    );
    const { component } = await setup({ sellersApi });

    selectSeller(component);

    expect(component.articles().map((a) => a.number)).toEqual([5, 17, 30]);
  });

  describe('canReturn / canSettleClick', () => {
    it('no open articles, canSettle=false: both disabled', async () => {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 0, canSettle: false })));
      const { component } = await setup({ settlementApi });

      selectSeller(component);

      expect(component.canReturn()).toBe(false);
      expect(component.canSettleClick()).toBe(false);
    });

    it('openCount > 0, canSettle=false: return enabled, settle disabled', async () => {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 3, canSettle: false })));
      const { component } = await setup({ settlementApi });

      selectSeller(component);

      expect(component.canReturn()).toBe(true);
      expect(component.canSettleClick()).toBe(false);
    });

    it('canSettle=true, openCount=0: settle enabled, return disabled', async () => {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 0, canSettle: true })));
      const { component } = await setup({ settlementApi });

      selectSeller(component);

      expect(component.canReturn()).toBe(false);
      expect(component.canSettleClick()).toBe(true);
    });

    it('settled seller overrides canSettle=true/openCount>0 to both false and shows the badge', async () => {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(
        of(
          settlement({
            openCount: 3,
            canSettle: true,
            settledAt: '2026-01-15T10:00:00Z',
            payoutAmount: 332.94,
          }),
        ),
      );
      const { fixture, component } = await setup({ settlementApi });

      selectSeller(component);
      fixture.detectChanges();

      expect(component.isSettled()).toBe(true);
      expect(component.canReturn()).toBe(false);
      expect(component.canSettleClick()).toBe(false);

      const badge = fixture.nativeElement.querySelector('p-tag') as HTMLElement;
      expect(badge).toBeTruthy();
      // Fix round 1 (reviewer finding): the CurrencyPipe itself already prefixes the €
      // symbol (no locale data/LOCALE_ID override registered in this project, so 'EUR'
      // falls back to en-US formatting, e.g. "€332.94") — a trailing `+ ' €'` in the
      // template used to duplicate it into "€332.94 €". Assert there is exactly one
      // currency symbol in the rendered badge text, not the mere presence of the tag.
      const badgeText = badge.textContent ?? '';
      expect(badgeText).toContain('332.94');
      expect(badgeText.match(/€/g)?.length ?? 0).toBe(1);
      expect(badgeText).not.toContain('€332.94 €');
    });
  });

  describe('Abrechnen / settlement-panel booking flow', () => {
    it('onSettleClick opens the settlement panel and clears any previous error', async () => {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 0, canSettle: true })));
      const { component } = await setup({ settlementApi });

      selectSeller(component);
      component.onSettleClick();

      expect(component.settlePanelVisible()).toBe(true);
      expect(component.settleError()).toBeNull();
    });

    it('onSettleConfirmed calls settlementApi.settle with the seller id and the settlement payout', async () => {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 0, canSettle: true, payout: 332.94 })));
      const { component } = await setup({ settlementApi });

      selectSeller(component);
      component.onSettleConfirmed();

      expect(settlementApi.settle).toHaveBeenCalledWith('SEL00001', 332.94);
    });

    it('on success: closes the panel, reloads settlement and articles, and prints the final summary', async () => {
      const settlementApi = settlementApiStub();
      const sellersApi = sellersApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 0, canSettle: true, payout: 332.94 })));
      const printService = printServiceStub();
      const { component } = await setup({ settlementApi, sellersApi, printService });

      selectSeller(component);
      component.onSettleClick();
      settlementApi.getSettlement.mockClear();
      sellersApi.getArticles.mockClear();

      component.onSettleConfirmed();

      expect(component.settlePanelVisible()).toBe(false);
      expect(component.settleError()).toBeNull();
      expect(settlementApi.getSettlement).toHaveBeenCalledWith('SEL00001');
      // Der Server hat gerade alle nie freigegebenen Artikel hart gelöscht — die Tabelle muss
      // neu geladen werden, sonst zeigt sie sie fälschlich weiter als "Angenommen".
      expect(sellersApi.getArticles).toHaveBeenCalledWith('SEL00001');
      expect(printService.printSellerSummary).toHaveBeenCalledWith({ sellerId: 'SEL00001', phase: 'final' });
    });

    it('on 409 settlement.articles_open: keeps the panel open and shows the server detail message', async () => {
      const settlementApi = settlementApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 0, canSettle: true, payout: 332.94 })));
      settlementApi.settle.mockReturnValue(
        throwError(() => ({
          error: { errorCode: 'settlement.articles_open', detail: '3 Artikel sind noch im Verkauf' },
        })),
      );
      const { component } = await setup({ settlementApi });

      selectSeller(component);
      component.onSettleClick();

      component.onSettleConfirmed();

      expect(component.settlePanelVisible()).toBe(true);
      expect(component.settleError()).toBe('3 Artikel sind noch im Verkauf');
    });

    it('on 409 settlement.already_settled: closes the panel, clears the error and reloads settlement and articles', async () => {
      const settlementApi = settlementApiStub();
      const sellersApi = sellersApiStub();
      settlementApi.getSettlement.mockReturnValue(of(settlement({ openCount: 0, canSettle: true, payout: 332.94 })));
      settlementApi.settle.mockReturnValue(
        throwError(() => ({ error: { errorCode: 'settlement.already_settled' } })),
      );
      const messageService = messageServiceStub();
      const { component } = await setup({ settlementApi, sellersApi, messageService });

      selectSeller(component);
      component.onSettleClick();
      settlementApi.getSettlement.mockClear();
      sellersApi.getArticles.mockClear();

      component.onSettleConfirmed();

      expect(component.settlePanelVisible()).toBe(false);
      expect(component.settleError()).toBeNull();
      expect(settlementApi.getSettlement).toHaveBeenCalledWith('SEL00001');
      expect(sellersApi.getArticles).toHaveBeenCalledWith('SEL00001');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Verkäufer ist bereits abgerechnet',
      });
    });
  });

  it('onArticleConfirmed calls returnArticle then reloads both the settlement read-model and the article list', async () => {
    const settlementApi = settlementApiStub();
    const sellersApi = sellersApiStub();
    const { component } = await setup({ settlementApi, sellersApi });

    selectSeller(component);
    settlementApi.getSettlement.mockClear();
    sellersApi.getArticles.mockClear();

    component.onArticleConfirmed('ART00001');

    expect(settlementApi.returnArticle).toHaveBeenCalledWith('ART00001');
    expect(settlementApi.getSettlement).toHaveBeenCalledWith('SEL00001');
    expect(sellersApi.getArticles).toHaveBeenCalledWith('SEL00001');
  });

  it('onBack returns to the "selection" state and clears the view signals', async () => {
    const { component } = await setup();

    selectSeller(component);
    expect(component.state()).toBe('view');

    component.onBack();

    expect(component.state()).toBe('selection');
    expect(component.selectedSellerId()).toBeNull();
    expect(component.settlement()).toBeNull();
    expect(component.articles()).toEqual([]);
  });

  it('mounts app-scan-dialog with the returnedAt target field and immediate writeMode', async () => {
    const { fixture, component } = await setup();

    selectSeller(component);
    fixture.detectChanges();

    const scanDialog = fixture.debugElement.query(By.directive(ScanDialog))?.componentInstance as ScanDialog;
    expect(scanDialog).toBeTruthy();
    expect(scanDialog.targetField()).toBe('returnedAt');
    expect(scanDialog.writeMode()).toBe('immediate');
  });
});
