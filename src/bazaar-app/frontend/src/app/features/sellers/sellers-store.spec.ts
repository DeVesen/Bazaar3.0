import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { SellersStore } from './sellers-store';
import { SellerCard, SellersApi } from './data/sellers-api';

function sellerCard(overrides: Partial<SellerCard> = {}): SellerCard {
  return {
    id: 's1',
    firstName: 'Anna',
    lastName: 'Meier',
    postalCode: '76133',
    city: 'Karlsruhe',
    sellerType: 'Privat',
    status: 'selling',
    articleCount: 42,
    releasedCount: 40,
    soldCount: 31,
    returnedCount: 9,
    acceptedValue: 512.5,
    openValue: 96,
    revenue: 380.5,
    settledAt: null,
    ...overrides,
  };
}

describe('SellersStore', () => {
  let getCards: ReturnType<typeof vi.fn>;
  let search: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let getArticles: ReturnType<typeof vi.fn>;
  let resetSettlement: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getCards = vi.fn();
    search = vi.fn();
    create = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    getArticles = vi.fn();
    resetSettlement = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SellersApi,
          useValue: { getCards, search, create, update, remove, getArticles, resetSettlement },
        },
      ],
    });
  });

  function createStore() {
    return TestBed.inject(SellersStore);
  }

  describe('load', () => {
    it('populates items and totalCount', () => {
      getCards.mockReturnValue(
        of({ items: [sellerCard(), sellerCard({ id: 's2' })], totalCount: 2, page: 1, pageSize: 60 }),
      );
      const store = createStore();

      store.load();

      expect(store.items().map((s) => s.id)).toEqual(['s1', 's2']);
      expect(store.totalCount()).toBe(2);
      expect(store.loading()).toBe(false);
    });

    it('sets loading to false on error and leaves items untouched', () => {
      getCards.mockReturnValue(throwError(() => new Error('boom')));
      const store = createStore();

      store.load();

      expect(store.loading()).toBe(false);
      expect(store.items()).toEqual([]);
    });

    it('calls the API with the current page/pageSize/filters', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 60 }));
      const store = createStore();

      store.load();

      expect(getCards).toHaveBeenCalledWith({
        page: 1,
        pageSize: 60,
        q: '',
        status: undefined,
        sort: 'name',
      });
    });
  });

  describe('setFilters', () => {
    it('merges filters, resets page to 1 and triggers reload', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 60 }));
      const store = createStore();
      store.setPage(3);
      getCards.mockClear();

      store.setFilters({ q: 'meier', status: 'selling' });

      expect(store.page()).toBe(1);
      expect(store.filters()).toEqual({ q: 'meier', status: 'selling', sort: 'name' });
      expect(getCards).toHaveBeenCalledWith({
        page: 1,
        pageSize: 60,
        q: 'meier',
        status: 'selling',
        sort: 'name',
      });
    });
  });

  describe('setPage', () => {
    it('sets page and triggers reload with the new page', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 60 }));
      const store = createStore();
      getCards.mockClear();

      store.setPage(2);

      expect(store.page()).toBe(2);
      expect(getCards).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
      );
    });
  });

  describe('create', () => {
    it('calls the API and triggers a reload on success without mutating items', () => {
      getCards.mockReturnValue(of({ items: [sellerCard()], totalCount: 1, page: 1, pageSize: 60 }));
      const request = { firstName: 'Anna', lastName: 'Meier', email: 'a@x.de', sellerTypeId: 't1' };
      create.mockReturnValue(of({ id: 's1' }));
      const store = createStore();

      const next = vi.fn();
      store.create(request).subscribe(next);

      expect(create).toHaveBeenCalledWith(request);
      expect(next).toHaveBeenCalled();
      expect(getCards).toHaveBeenCalledTimes(1);
      expect(store.items().map((s) => s.id)).toEqual(['s1']);
    });
  });

  describe('update', () => {
    it('calls the API and triggers a reload on success', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 60 }));
      const request = {
        firstName: 'Anna',
        lastName: 'Meier',
        email: 'a@x.de',
        sellerTypeId: 't1',
        salesCommission: 10,
        feePerItem: 0.5,
      };
      update.mockReturnValue(of(undefined));
      const store = createStore();
      getCards.mockClear();

      store.update('s1', request).subscribe();

      expect(update).toHaveBeenCalledWith('s1', request);
      expect(getCards).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('calls the API and triggers a reload on success', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 60 }));
      remove.mockReturnValue(of(undefined));
      const store = createStore();
      getCards.mockClear();

      store.remove('s1').subscribe();

      expect(remove).toHaveBeenCalledWith('s1');
      expect(getCards).toHaveBeenCalledTimes(1);
    });
  });

  describe('resetSettlement', () => {
    it('calls the API and triggers a reload on success', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 60 }));
      resetSettlement.mockReturnValue(of(undefined));
      const store = createStore();
      getCards.mockClear();

      store.resetSettlement('s1').subscribe();

      expect(resetSettlement).toHaveBeenCalledWith('s1');
      expect(getCards).toHaveBeenCalledTimes(1);
    });
  });

  describe('getArticles', () => {
    it('passes through to the API without touching items', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 60 }));
      getArticles.mockReturnValue(of([{ id: 'a1' }]));
      const store = createStore();
      getCards.mockClear();

      const next = vi.fn();
      store.getArticles('s1').subscribe(next);

      expect(getArticles).toHaveBeenCalledWith('s1');
      expect(next).toHaveBeenCalledWith([{ id: 'a1' }]);
      expect(getCards).not.toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('passes through to the API without touching items/page/filters', () => {
      search.mockReturnValue(of([{ id: 's1' }]));
      const store = createStore();

      const next = vi.fn();
      store.search('mei').subscribe(next);

      expect(search).toHaveBeenCalledWith('mei');
      expect(next).toHaveBeenCalledWith([{ id: 's1' }]);
      expect(getCards).not.toHaveBeenCalled();
    });
  });
});
