import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ArticlesStore } from './articles-store';
import { ArticleListItem, ArticlesApi } from './data/articles-api';

function articleItem(overrides: Partial<ArticleListItem> = {}): ArticleListItem {
  return {
    id: 'a1',
    number: 1001,
    name: 'Schneeanzug 104',
    brand: 'Playmobil',
    category: 'Kleidung',
    price: 12.5,
    status: 'selling',
    soldManually: false,
    sellerId: 's1',
    sellerName: 'Anna Meier',
    ...overrides,
  };
}

describe('ArticlesStore', () => {
  let getArticles: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let updateTimestamps: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getArticles = vi.fn();
    update = vi.fn();
    updateTimestamps = vi.fn();
    remove = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ArticlesApi,
          useValue: { getArticles, update, updateTimestamps, remove },
        },
      ],
    });
  });

  function createStore() {
    return TestBed.inject(ArticlesStore);
  }

  describe('load', () => {
    it('populates items and totalCount', () => {
      getArticles.mockReturnValue(
        of({
          items: [articleItem(), articleItem({ id: 'a2' })],
          totalCount: 2,
          page: 1,
          pageSize: 50,
        }),
      );
      const store = createStore();

      store.load();

      expect(store.items().map((a) => a.id)).toEqual(['a1', 'a2']);
      expect(store.totalCount()).toBe(2);
      expect(store.loading()).toBe(false);
    });

    it('sets loading to false on error and leaves items untouched', () => {
      getArticles.mockReturnValue(throwError(() => new Error('boom')));
      const store = createStore();

      store.load();

      expect(store.loading()).toBe(false);
      expect(store.items()).toEqual([]);
    });

    it('calls the API with the current page/pageSize/filters (default pageSize 50)', () => {
      getArticles.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 50 }));
      const store = createStore();

      store.load();

      expect(getArticles).toHaveBeenCalledWith({
        page: 1,
        pageSize: 50,
        q: '',
        brand: undefined,
        category: undefined,
        status: undefined,
        sort: 'number:asc',
      });
    });
  });

  describe('setFilters', () => {
    it('merges filters, resets page to 1 and triggers reload', () => {
      getArticles.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 50 }));
      const store = createStore();
      store.setPage(3);
      getArticles.mockClear();

      store.setFilters({ q: 'schneeanzug', brand: 'Playmobil' });

      expect(store.page()).toBe(1);
      expect(store.filters()).toEqual({
        q: 'schneeanzug',
        brand: 'Playmobil',
        category: null,
        status: null,
        sort: 'number:asc',
      });
      expect(getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, q: 'schneeanzug', brand: 'Playmobil' }),
      );
    });
  });

  describe('setPage', () => {
    it('sets page and triggers reload with the new page, without touching filters', () => {
      getArticles.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 50 }));
      const store = createStore();
      getArticles.mockClear();

      store.setPage(2);

      expect(store.page()).toBe(2);
      expect(getArticles).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });

  describe('setPageSize', () => {
    it('sets pageSize, resets page to 1 and triggers a reload with the new page size (fix round 1)', () => {
      getArticles.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 50 }));
      const store = createStore();
      store.setPage(3);
      getArticles.mockClear();

      store.setPageSize(10);

      expect(store.pageSize()).toBe(10);
      expect(store.page()).toBe(1);
      expect(getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 10 }),
      );
    });
  });

  describe('update', () => {
    it('calls the API and triggers a reload on success', () => {
      getArticles.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 50 }));
      const request = {
        name: 'Schneeanzug 104',
        brand: 'Playmobil',
        category: 'Kleidung',
        price: 12.5,
      };
      update.mockReturnValue(of(undefined));
      const store = createStore();
      getArticles.mockClear();

      store.update('a1', request).subscribe();

      expect(update).toHaveBeenCalledWith('a1', request);
      expect(getArticles).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateTimestamps', () => {
    it('calls the API and triggers a reload on success', () => {
      getArticles.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 50 }));
      const request = { releasedAt: '2026-01-01T00:00:00Z', soldAt: null, returnedAt: null };
      updateTimestamps.mockReturnValue(of(undefined));
      const store = createStore();
      getArticles.mockClear();

      store.updateTimestamps('a1', request).subscribe();

      expect(updateTimestamps).toHaveBeenCalledWith('a1', request);
      expect(getArticles).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove', () => {
    it('calls the API and triggers a reload on success', () => {
      getArticles.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 50 }));
      remove.mockReturnValue(of(undefined));
      const store = createStore();
      getArticles.mockClear();

      store.remove('a1').subscribe();

      expect(remove).toHaveBeenCalledWith('a1');
      expect(getArticles).toHaveBeenCalledTimes(1);
    });
  });
});
