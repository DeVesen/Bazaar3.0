import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';
import { PrintService } from './print.service';
// eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
import { ArticleSummary, SellerDetail, SellersApi } from '../../features/sellers/data/sellers-api';
// eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
import { SellerSettlement, SettlementApi } from '../../features/settlement/data/settlement-api';
// eslint-disable-next-line boundaries/dependencies -- see print.service.ts's own justification
import { PrintTexts, PrintTextsApi, emptyPrintTexts } from '../../features/settings/data/print-texts-api';

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
  salesCommission: 20,
  feePerItem: 0.5,
  intakeFeePaid: 0,
  settledAt: null,
  payoutAmount: null,
};

const settlement: SellerSettlement = {
  seller: {
    id: 'seller-1',
    firstName: 'Anna',
    lastName: 'Meier',
    address: 'Musterstraße 5',
    postalCode: '76133',
    city: 'Karlsruhe',
  },
  openCount: 3,
  soldCount: 2,
  returnedCount: 0,
  revenue: 200,
  commissionRate: 20,
  commission: 40,
  payout: 160,
  intakeFeePaid: 1.5,
  notDeliveredCount: 0,
  settledAt: null,
  payoutAmount: null,
  canSettle: true,
};

function article(id: string, number: number, status: string): ArticleSummary {
  return {
    id,
    number,
    name: `Artikel ${number}`,
    brand: 'Nike',
    category: 'Jacken',
    size: 'M',
    color: 'Rot',
    price: 10,
    status,
    soldManually: false,
  };
}

/** Währungsformat nutzt ein geschütztes Leerzeichen vor „€"; Tests vergleichen mit normalem. */
function plain(text: string | null | undefined): string {
  return (text ?? '').replace(/\u00a0/g, ' ').trim();
}

function printHost(): HTMLElement | null {
  return document.querySelector<HTMLElement>('app-print-document[data-print-host]');
}

function tileValue(host: HTMLElement, title: string): string {
  const tile = Array.from(host.querySelectorAll('.print-doc__tile')).find(
    (candidate) => plain(candidate.querySelector('.print-doc__tile-title')?.textContent) === title,
  );
  return plain(tile?.querySelector('.print-doc__tile-value')?.textContent);
}

function groupLabels(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll('.print-doc__group-row th')).map((cell) => plain(cell.textContent));
}

function articleNumbers(host: HTMLElement): string[] {
  return Array.from(host.querySelectorAll('.print-doc__table tbody tr:not(.print-doc__group-row) td:first-child')).map(
    (cell) => plain(cell.textContent),
  );
}

describe('PrintService', () => {
  let getByIdSpy: ReturnType<typeof vi.fn>;
  let getArticlesSpy: ReturnType<typeof vi.fn>;
  let getSettlementSpy: ReturnType<typeof vi.fn>;
  let getTextsSpy: ReturnType<typeof vi.fn>;
  let messageAddSpy: ReturnType<typeof vi.fn>;
  let printSpy: ReturnType<typeof vi.fn>;

  function setup(
    options: { articles?: ArticleSummary[]; texts?: PrintTexts; sellerResult?: Observable<SellerDetail> } = {},
  ): PrintService {
    TestBed.resetTestingModule();
    getByIdSpy = vi.fn().mockReturnValue(options.sellerResult ?? of(seller));
    getArticlesSpy = vi.fn().mockReturnValue(of(options.articles ?? []));
    getSettlementSpy = vi.fn().mockReturnValue(of(settlement));
    getTextsSpy = vi.fn().mockReturnValue(of(options.texts ?? emptyPrintTexts()));
    messageAddSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        { provide: SellersApi, useValue: { getById: getByIdSpy, getArticles: getArticlesSpy } },
        { provide: SettlementApi, useValue: { getSettlement: getSettlementSpy } },
        { provide: PrintTextsApi, useValue: { get: getTextsSpy } },
        { provide: MessageService, useValue: { add: messageAddSpy } },
      ],
    });

    return TestBed.inject(PrintService);
  }

  beforeEach(() => {
    printSpy = vi.fn();
    vi.stubGlobal('print', printSpy);
  });

  afterEach(() => {
    window.dispatchEvent(new Event('afterprint'));
    vi.unstubAllGlobals();
    document.querySelectorAll('app-print-document').forEach((element) => element.remove());
    document.querySelectorAll('style[data-print-style]').forEach((element) => element.remove());
  });

  describe('printSellerReceipt', () => {
    it('printSellerReceipt_mixedStatuses_rendersGroupsInOrderWithoutRegisteredAndSortedByNumber', () => {
      // Arrange
      const articles = [
        article('a1', 12, 'selling'),
        article('a2', 5, 'selling'),
        article('a3', 9, 'selling'),
        article('a4', 20, 'sold'),
        article('a5', 21, 'sold'),
        article('a6', 30, 'returned'),
        article('a7', 40, 'registered'),
        article('a8', 41, 'registered'),
      ];
      const service = setup({ articles });

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      const host = printHost();
      expect(host).not.toBeNull();
      expect(groupLabels(host!)).toEqual(['Im Verkauf (3)', 'Verkauft (2)', 'Zurückgegeben (1)']);
      expect(articleNumbers(host!)).toEqual(['5', '9', '12', '20', '21', '30']);
      expect(tileValue(host!, 'Anzahl Artikel')).toBe('6');
      expect(printSpy).toHaveBeenCalledTimes(1);
    });

    it('printSellerReceipt_sellerWithoutArticles_stillPrintsEmptyReceipt', () => {
      // Arrange
      const service = setup({ articles: [] });

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      const host = printHost();
      expect(host).not.toBeNull();
      expect(articleNumbers(host!)).toEqual([]);
      expect(tileValue(host!, 'Anzahl Artikel')).toBe('0');
      expect(tileValue(host!, 'Gebühr 0,50 € / Artikel')).toBe('0,00 €');
      expect(printSpy).toHaveBeenCalledTimes(1);
    });

    it('printSellerReceipt_dataCannotBeLoaded_showsErrorToastAndDoesNotPrint', () => {
      // Arrange
      const service = setup({ sellerResult: throwError(() => new Error('offline')) });

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      expect(messageAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Beleg konnte nicht geladen werden' }),
      );
      expect(printHost()).toBeNull();
      expect(printSpy).not.toHaveBeenCalled();
    });

    it('printSellerReceipt_afterPrint_removesDocumentAndPrintStyle', () => {
      // Arrange
      const service = setup({ articles: [article('a1', 1, 'selling')] });
      service.printSellerReceipt('seller-1');

      // Act
      window.dispatchEvent(new Event('afterprint'));

      // Assert
      expect(printHost()).toBeNull();
      expect(document.querySelector('style[data-print-style]')).toBeNull();
    });

    it('printSellerReceipt_always_setsA4PortraitAndHidesEverythingButTheDocument', () => {
      // Arrange
      const service = setup({ articles: [article('a1', 1, 'selling')] });

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      const css = document.querySelector('style[data-print-style]')?.textContent ?? '';
      expect(css).toContain('size: A4 portrait');
      expect(css).toContain('body > *:not([data-print-host])');
      expect(css).toContain('display: none !important');
    });

    it('printSellerReceipt_savedFreitext_appearsInTheNextReceipt', () => {
      // Arrange
      const texts = emptyPrintTexts();
      texts.abgabeBeleg.text1 = 'Kopf A';
      const service = setup({ articles: [article('a1', 1, 'selling')], texts });

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      expect(plain(printHost()?.querySelector('.print-doc__head .print-doc__text--left')?.textContent)).toBe('Kopf A');
      expect(getTextsSpy).toHaveBeenCalledTimes(1);
    });

    it('printSellerReceipt_rendersSizeColorAndCategoryColumns', () => {
      // Arrange
      const service = setup({ articles: [article('a1', 7, 'selling')] });

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      const cells = Array.from(printHost()!.querySelectorAll('.print-doc__table tbody tr:not(.print-doc__group-row) td')).map(
        (cell) => plain(cell.textContent),
      );
      expect(cells.slice(0, 6)).toEqual(['7', 'Artikel 7', 'Jacken', 'Nike', 'M', 'Rot']);
    });
  });

  describe('printIntakeReceipt', () => {
    it('printIntakeReceipt_threeBookedRegisteredArticles_rendersOnlyThemInGroupRegistriert', () => {
      // Arrange
      const articles = [
        article('a1', 1, 'registered'),
        article('a2', 2, 'registered'),
        article('a3', 3, 'registered'),
        article('a4', 4, 'selling'),
        article('a5', 5, 'registered'),
      ];
      const service = setup({ articles });

      // Act
      service.printIntakeReceipt({ articleIds: ['a1', 'a2', 'a3'], sellerId: 'seller-1' });

      // Assert
      const host = printHost();
      expect(groupLabels(host!)).toEqual(['Registriert (3)']);
      expect(articleNumbers(host!)).toEqual(['1', '2', '3']);
      expect(tileValue(host!, 'Anzahl Artikel')).toBe('3');
      expect(printSpy).toHaveBeenCalledTimes(1);
    });

    it('printIntakeReceipt_twoReleasedArticles_rendersGroupImVerkauf', () => {
      // Arrange
      const articles = [article('a1', 1, 'selling'), article('a2', 2, 'selling'), article('a3', 3, 'registered')];
      const service = setup({ articles });

      // Act
      service.printIntakeReceipt({ articleIds: ['a1', 'a2'], sellerId: 'seller-1' });

      // Assert
      expect(groupLabels(printHost()!)).toEqual(['Im Verkauf (2)']);
    });

    it('printIntakeReceipt_loadFails_showsErrorToastAndDoesNotPrint', () => {
      // Arrange
      const service = setup({ sellerResult: throwError(() => new Error('offline')) });

      // Act
      service.printIntakeReceipt({ articleIds: ['a1'], sellerId: 'seller-1' });

      // Assert
      expect(messageAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Beleg konnte nicht geladen werden' }),
      );
      expect(printHost()).toBeNull();
      expect(printSpy).not.toHaveBeenCalled();
    });
  });

  describe('printSellerSummary', () => {
    const summaryArticles = [
      article('a1', 1, 'selling'),
      article('a2', 2, 'selling'),
      article('a3', 3, 'selling'),
      article('a4', 4, 'sold'),
      article('a5', 5, 'sold'),
      article('a6', 6, 'registered'),
      article('a7', 7, 'registered'),
    ];

    it('printSellerSummary_settlementWithSoldArticles_rendersRowATilesAndGroupsWithoutRegistered', () => {
      // Arrange
      const service = setup({ articles: summaryArticles });

      // Act
      service.printSellerSummary({ sellerId: 'seller-1' });

      // Assert
      const host = printHost();
      expect(getSettlementSpy).toHaveBeenCalledWith('seller-1');
      expect(groupLabels(host!)).toEqual(['Im Verkauf (3)', 'Verkauft (2)']);
      expect(tileValue(host!, 'Anzahl offener Artikel')).toBe('3');
      expect(tileValue(host!, 'Anzahl verkaufter Artikel')).toBe('2');
      expect(tileValue(host!, 'Anzahl Artikel')).toBe('5');
      expect(printSpy).toHaveBeenCalledTimes(1);
    });

    it('printSellerSummary_revenue200Rate20_rendersRevenueCommissionAndEarningsFromSettlement', () => {
      // Arrange
      const service = setup({ articles: summaryArticles });

      // Act
      service.printSellerSummary({ sellerId: 'seller-1' });

      // Assert
      const host = printHost()!;
      expect(tileValue(host, 'Einnahmen')).toBe('200,00 €');
      expect(tileValue(host, 'Provision 20 %')).toBe('40,00 €');
      expect(tileValue(host, 'Verdienst')).toBe('160,00 €');
    });

    it('printSellerSummary_afterPrint_removesDocument', () => {
      // Arrange
      const service = setup({ articles: summaryArticles });
      service.printSellerSummary({ sellerId: 'seller-1' });

      // Act
      window.dispatchEvent(new Event('afterprint'));

      // Assert
      expect(printHost()).toBeNull();
    });

    it('printSellerSummary_dataCannotBeLoaded_showsErrorToastAndDoesNotPrint', () => {
      // Arrange
      const service = setup({ sellerResult: throwError(() => new Error('offline')) });

      // Act
      service.printSellerSummary({ sellerId: 'seller-1' });

      // Assert
      expect(messageAddSpy).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Beleg konnte nicht geladen werden' }),
      );
      expect(printHost()).toBeNull();
      expect(printSpy).not.toHaveBeenCalled();
    });
  });

  describe('Aufräumen', () => {
    it('print_secondPrintWithoutAfterprint_keepsOnlyOneDocumentAndOneStyle', () => {
      // Arrange
      const service = setup({ articles: [article('a1', 1, 'selling')] });
      service.printSellerReceipt('seller-1');

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      expect(document.querySelectorAll('app-print-document[data-print-host]').length).toBe(1);
      expect(document.querySelectorAll('style[data-print-style]').length).toBe(1);
      expect(printSpy).toHaveBeenCalledTimes(2);
    });

    it('print_windowPrintThrows_removesDocumentAndPrintStyle', () => {
      // Arrange
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      printSpy.mockImplementation(() => {
        throw new Error('print blocked');
      });
      const service = setup({ articles: [article('a1', 1, 'selling')] });

      // Act
      service.printSellerReceipt('seller-1');

      // Assert
      expect(printHost()).toBeNull();
      expect(document.querySelector('style[data-print-style]')).toBeNull();
      consoleError.mockRestore();
    });
  });

  describe('Freitexte je Vorlage', () => {
    it('print_freitext3OnlyMaintainedForAbgabeBeleg_appearsOnlyInTheReceipt', () => {
      // Arrange
      const texts = emptyPrintTexts();
      texts.abgabeBeleg.text3 = 'Nur im Beleg';
      const service = setup({ articles: [article('a1', 1, 'selling')], texts });

      // Act
      service.printSellerReceipt('seller-1');
      const receiptHasText = (printHost()?.textContent ?? '').includes('Nur im Beleg');
      window.dispatchEvent(new Event('afterprint'));
      service.printSellerSummary({ sellerId: 'seller-1' });

      // Assert
      expect(receiptHasText).toBe(true);
      expect(printHost()?.textContent ?? '').not.toContain('Nur im Beleg');
      expect(printHost()?.querySelector('.print-doc__freitext3')).toBeNull();
    });
  });
});
