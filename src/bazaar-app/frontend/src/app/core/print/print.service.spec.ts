import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PrintService } from './print.service';
// eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
import { ArticleSummary, SellerDetail, SellersApi } from '../../features/sellers/data/sellers-api';
// eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
import { SellerSettlement, SettlementApi } from '../../features/settlement/data/settlement-api';

const seller: SellerDetail = {
  id: 'seller-1',
  firstName: 'Anna',
  lastName: 'Meier',
  address: 'Musterstraße 5',
  postalCode: '76133',
  city: 'Karlsruhe',
  phone: '0721 123456',
  email: 'anna@example.com',
  sellerTypeId: 'type-1',
  salesCommission: 0.1,
  feePerItem: 0.5,
  intakeFeePaid: 0,
  settledAt: null,
  payoutAmount: null,
};

function article(
  overrides: Partial<ArticleSummary> & Pick<ArticleSummary, 'id' | 'number'>,
): ArticleSummary {
  return {
    name: 'Artikel',
    brand: null,
    category: null,
    size: null,
    color: null,
    price: 5,
    status: 'accepted',
    soldManually: false,
    ...overrides,
  };
}

const settlement: SellerSettlement = {
  seller: {
    id: 'seller-1',
    firstName: 'Anna',
    lastName: 'Meier',
    address: 'Musterstraße 5',
    postalCode: '76133',
    city: 'Karlsruhe',
  },
  openCount: 1,
  soldCount: 1,
  returnedCount: 1,
  revenue: 20,
  commissionRate: 10,
  commission: 2,
  payout: 18,
  intakeFeePaid: 1.5,
  notDeliveredCount: 0,
  settledAt: null,
  payoutAmount: null,
  canSettle: true,
};

describe('PrintService', () => {
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let getArticlesSpy: ReturnType<typeof vi.fn>;
  let printSpy: ReturnType<typeof vi.fn>;

  // Every prior test's own dynamically created component is torn down in `afterEach`, but
  // `setup()` is also called a second time within a single test (the "same document shape for
  // both callers" test) — a fresh `TestBed` module per `setup()` call keeps the two `PrintService`
  // instances (and their `SellersApi` mocks) fully independent of each other.
  let getSettlementSpy: ReturnType<typeof vi.fn>;

  function setup(articles: ArticleSummary[]): PrintService {
    TestBed.resetTestingModule();
    getByIdSpy = vi.fn().mockReturnValue(of(seller));
    getArticlesSpy = vi.fn().mockReturnValue(of(articles));
    getSettlementSpy = vi.fn().mockReturnValue(of(settlement));

    TestBed.configureTestingModule({
      providers: [
        { provide: SellersApi, useValue: { getById: getByIdSpy, getArticles: getArticlesSpy } },
        { provide: SettlementApi, useValue: { getSettlement: getSettlementSpy } },
      ],
    });

    return TestBed.inject(PrintService);
  }

  beforeEach(() => {
    printSpy = vi.fn();
    vi.stubGlobal('print', printSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.querySelectorAll('app-print-abgabe-beleg').forEach((el) => el.remove());
    document.querySelectorAll('app-print-verkaeufer-uebersicht').forEach((el) => el.remove());
  });

  it('loads seller + articles by sellerId, filters/orders by articleIds, prints, and cleans up on afterprint', () => {
    const articles = [
      article({ id: 'art-1', number: 1001, name: 'Winterjacke', brand: 'Nike', price: 12 }),
      article({ id: 'art-2', number: 1002, name: 'Gummistiefel', brand: 'Aigle', price: 8 }),
      article({ id: 'art-3', number: 1003, name: 'Schal' }),
    ];
    const service = setup(articles);

    service.printIntakeReceipt({
      articleIds: ['art-2', 'art-1'],
      sellerId: 'seller-1',
      feeAmount: 1,
    });

    expect(getByIdSpy).toHaveBeenCalledWith('seller-1');
    expect(getArticlesSpy).toHaveBeenCalledWith('seller-1');

    const rendered = document.querySelector('app-print-abgabe-beleg');
    expect(rendered).toBeTruthy();
    const rowTexts = Array.from(rendered!.querySelectorAll('tbody tr')).map(
      (row) => row.textContent ?? '',
    );
    // 'art-3' (Schal) was not in articleIds, so it must not appear; order follows articleIds
    // (art-2 before art-1), not the backend's own list order (art-1 before art-2).
    expect(rowTexts.length).toBe(2);
    expect(rowTexts[0]).toContain('Gummistiefel');
    expect(rowTexts[1]).toContain('Winterjacke');
    expect(rendered!.textContent).not.toContain('Schal');

    expect(printSpy).toHaveBeenCalledTimes(1);

    window.dispatchEvent(new Event('afterprint'));
    expect(document.querySelector('app-print-abgabe-beleg')).toBeNull();
  });

  it('produces the same document shape for wizard-style and freigabe-style articleIds (AC-6)', () => {
    const articles = [
      article({ id: 'art-1', number: 1, name: 'Wizard-Artikel', price: 3 }),
      article({ id: 'art-2', number: 2, name: 'Freigabe-Artikel', price: 4 }),
    ];

    // Round-17-Wizard-like call: a single freshly-added article's id.
    const wizardService = setup(articles);
    wizardService.printIntakeReceipt({
      articleIds: ['art-1'],
      sellerId: 'seller-1',
      feeAmount: 0.5,
    });
    const wizardRendered = document.querySelector('app-print-abgabe-beleg');
    expect(wizardRendered?.textContent).toContain('Wizard-Artikel');
    expect(wizardRendered?.querySelectorAll('tbody tr').length).toBe(1);
    window.dispatchEvent(new Event('afterprint'));

    // Round-18-Freigabe-like call: a scanned session's id, same `IntakeReceiptData` shape.
    const freigabeService = setup(articles);
    freigabeService.printIntakeReceipt({
      articleIds: ['art-2'],
      sellerId: 'seller-1',
      feeAmount: 0.5,
    });
    const freigabeRendered = document.querySelector('app-print-abgabe-beleg');
    expect(freigabeRendered?.textContent).toContain('Freigabe-Artikel');
    expect(freigabeRendered?.querySelectorAll('tbody tr').length).toBe(1);
    window.dispatchEvent(new Event('afterprint'));

    expect(printSpy).toHaveBeenCalledTimes(2);
  });

  describe('printSellerSummary', () => {
    it('loads settlement + articles by sellerId, renders preliminary phase, prints, and cleans up on afterprint', () => {
      const articles = [
        article({ id: 'art-1', number: 1001, name: 'Winterjacke', status: 'selling' }),
        article({ id: 'art-2', number: 1002, name: 'Gummistiefel', status: 'sold' }),
      ];
      const service = setup(articles);

      service.printSellerSummary({ sellerId: 'seller-1', phase: 'preliminary' });

      expect(getSettlementSpy).toHaveBeenCalledWith('seller-1');
      expect(getArticlesSpy).toHaveBeenCalledWith('seller-1');

      const rendered = document.querySelector('app-print-verkaeufer-uebersicht');
      expect(rendered).toBeTruthy();
      expect(rendered!.textContent).toContain('Anna Meier');
      expect(rendered!.textContent).toContain('Winterjacke');
      expect(rendered!.textContent).toContain('Gummistiefel');
      // AC-3: rounded settlement amounts pass through unmodified.
      expect(rendered!.textContent).toContain('20,00');
      expect(rendered!.textContent).toContain('18,00');
      expect(rendered!.textContent).toContain('VORLÄUFIG');

      expect(printSpy).toHaveBeenCalledTimes(1);

      window.dispatchEvent(new Event('afterprint'));
      expect(document.querySelector('app-print-verkaeufer-uebersicht')).toBeNull();
    });

    it('passes `phase` through unchanged — no preliminary hint for the final phase', () => {
      const articles = [article({ id: 'art-1', number: 1, name: 'Schal', status: 'returned' })];
      const service = setup(articles);

      service.printSellerSummary({ sellerId: 'seller-1', phase: 'final' });

      const rendered = document.querySelector('app-print-verkaeufer-uebersicht');
      expect(rendered!.textContent).not.toContain('VORLÄUFIG');

      window.dispatchEvent(new Event('afterprint'));
    });

    it('renders all loaded articles unfiltered — unlike printIntakeReceipt, no articleIds subset', () => {
      const articles = [
        article({ id: 'art-1', number: 1, name: 'Erster', status: 'selling' }),
        article({ id: 'art-2', number: 2, name: 'Zweiter', status: 'sold' }),
        article({ id: 'art-3', number: 3, name: 'Dritter', status: 'returned' }),
      ];
      const service = setup(articles);

      service.printSellerSummary({ sellerId: 'seller-1', phase: 'preliminary' });

      const rendered = document.querySelector('app-print-verkaeufer-uebersicht');
      expect(rendered!.textContent).toContain('Erster');
      expect(rendered!.textContent).toContain('Zweiter');
      expect(rendered!.textContent).toContain('Dritter');

      window.dispatchEvent(new Event('afterprint'));
    });
  });
});
