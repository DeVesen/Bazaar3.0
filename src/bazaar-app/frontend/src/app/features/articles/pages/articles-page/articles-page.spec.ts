import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ArticlesPage } from './articles-page';
import { ArticlesStore, ArticlesFilters } from '../../articles-store';
import { ArticleListItem } from '../../data/articles-api';
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';

function buildItem(overrides: Partial<ArticleListItem> = {}): ArticleListItem {
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

const BRANDS: Brand[] = [{ id: 'b1', name: 'Playmobil', original: true, articleCount: 3 }];
const CATEGORIES: Category[] = [{ id: 'c1', name: 'Kleidung', original: true, articleCount: 5 }];

describe('ArticlesPage', () => {
  let itemsSignal: ReturnType<typeof signal<ArticleListItem[]>>;
  let totalCountSignal: ReturnType<typeof signal<number>>;
  let pageSizeSignal: ReturnType<typeof signal<number>>;
  let loadingSignal: ReturnType<typeof signal<boolean>>;
  let filtersSignal: ReturnType<typeof signal<ArticlesFilters>>;
  let load: ReturnType<typeof vi.fn>;
  let setFilters: ReturnType<typeof vi.fn>;
  let setPage: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    itemsSignal = signal<ArticleListItem[]>([]);
    totalCountSignal = signal(0);
    pageSizeSignal = signal(50);
    loadingSignal = signal(false);
    filtersSignal = signal<ArticlesFilters>({
      q: '',
      brand: null,
      category: null,
      status: null,
      sort: 'number:asc',
    });
    load = vi.fn();
    setFilters = vi.fn((partial: Partial<ArticlesFilters>) => {
      filtersSignal.set({ ...filtersSignal(), ...partial });
    });
    setPage = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ArticlesPage],
      providers: [
        {
          provide: ArticlesStore,
          useValue: {
            items: itemsSignal,
            totalCount: totalCountSignal,
            pageSize: pageSizeSignal,
            loading: loadingSignal,
            filters: filtersSignal,
            load,
            setFilters,
            setPage,
          },
        },
        { provide: BrandsApi, useValue: { getAll: () => of(BRANDS) } },
        { provide: CategoriesApi, useValue: { getAll: () => of(CATEGORIES) } },
      ],
    }).compileComponents();
  });

  async function createPage() {
    const fixture = TestBed.createComponent(ArticlesPage);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance };
  }

  it('calls articlesStore.load() on construction', async () => {
    await createPage();
    expect(load).toHaveBeenCalled();
  });

  it('loads brand/category dropdown options from BrandsApi/CategoriesApi', async () => {
    const { component } = await createPage();

    expect(component.brandOptions()).toEqual([
      { label: 'Alle', value: null },
      { label: 'Playmobil', value: 'Playmobil' },
    ]);
    expect(component.categoryOptions()).toEqual([
      { label: 'Alle', value: null },
      { label: 'Kleidung', value: 'Kleidung' },
    ]);
  });

  describe('free-text filter debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('does not call setFilters on every keystroke, only once after 300ms of silence', async () => {
      const { component, fixture } = await createPage();
      setFilters.mockClear();

      component.onQInputChange('s');
      component.onQInputChange('sc');
      component.onQInputChange('sch');
      await vi.advanceTimersByTimeAsync(100);
      await fixture.whenStable();
      expect(setFilters).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);
      await fixture.whenStable();

      expect(setFilters).toHaveBeenCalledTimes(1);
      expect(setFilters).toHaveBeenCalledWith({ q: 'sch' });
    });

    it('does not fire again for the same value that is already applied', async () => {
      const { component } = await createPage();
      setFilters.mockClear();

      component.onQInputChange('sch');
      await vi.advanceTimersByTimeAsync(300);
      expect(setFilters).toHaveBeenCalledTimes(1);

      setFilters.mockClear();
      component.onQInputChange('sch');
      await vi.advanceTimersByTimeAsync(300);
      expect(setFilters).not.toHaveBeenCalled();
    });
  });

  describe('brand/category/status filters', () => {
    it('trigger setFilters immediately, without any debounce delay', async () => {
      const { component } = await createPage();
      setFilters.mockClear();

      component.onBrandChange('Playmobil');
      expect(setFilters).toHaveBeenCalledWith({ brand: 'Playmobil' });

      component.onCategoryChange('Kleidung');
      expect(setFilters).toHaveBeenCalledWith({ category: 'Kleidung' });

      component.onStatusChange('sold');
      expect(setFilters).toHaveBeenCalledWith({ status: 'sold' });
    });
  });

  describe('pagination: Table zero-based page -> ArticlesStore one-based setPage', () => {
    it('maps Table pageChange {page: 0, rows} to setPage(1)', async () => {
      const { component } = await createPage();

      component.onPageChange({ page: 0, rows: 50 });

      expect(setPage).toHaveBeenCalledWith(1);
    });

    it('maps Table pageChange {page: 2, rows} to setPage(3) — the off-by-one that is easy to invert', async () => {
      const { component } = await createPage();

      component.onPageChange({ page: 2, rows: 50 });

      expect(setPage).toHaveBeenCalledWith(3);
    });
  });

  describe('sort: SortEvent[] -> comma-separated backend param', () => {
    it('joins a single sort event as "field:order"', async () => {
      const { component } = await createPage();
      setFilters.mockClear();

      component.onSortChange([{ field: 'price', order: 'desc' }]);

      expect(setFilters).toHaveBeenCalledWith({ sort: 'price:desc' });
    });

    it('joins multiple sort events as a comma-separated multi-sort string', async () => {
      const { component } = await createPage();
      setFilters.mockClear();

      component.onSortChange([
        { field: 'category', order: 'asc' },
        { field: 'price', order: 'desc' },
      ]);

      expect(setFilters).toHaveBeenCalledWith({ sort: 'category:asc,price:desc' });
    });

    it('falls back to the default "number:asc" when all sort keys are cleared', async () => {
      const { component } = await createPage();
      setFilters.mockClear();

      component.onSortChange([]);

      expect(setFilters).toHaveBeenCalledWith({ sort: 'number:asc' });
    });
  });

  describe('"manuell" secondary badge', () => {
    it('the status column config renders a secondary "manuell" badge only when soldManually is true', async () => {
      const { component } = await createPage();
      const statusColumn = component.columns.find((c) => c.field === 'status');

      expect(statusColumn?.secondaryBadge?.(buildItem({ soldManually: true }))).toEqual({
        text: 'manuell',
        severity: 'secondary',
      });
      expect(statusColumn?.secondaryBadge?.(buildItem({ soldManually: false }))).toBeNull();
    });

    it('renders the "manuell" tag in the DOM for a row with soldManually true', async () => {
      itemsSignal.set([buildItem({ soldManually: true }), buildItem({ id: 'a2', soldManually: false })]);
      totalCountSignal.set(2);
      const { fixture } = await createPage();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('manuell');
    });
  });

  describe('status badge severity mapping', () => {
    it.each([
      ['registered', 'secondary'],
      ['selling', 'info'],
      ['sold', 'success'],
      ['returned', 'warn'],
    ])('maps status "%s" to severity "%s"', async (status, severity) => {
      const { component } = await createPage();
      const statusColumn = component.columns.find((c) => c.field === 'status');

      expect(statusColumn?.badgeSeverity?.(status)).toBe(severity);
    });
  });
});
