import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ArticlesPage } from './articles-page';
import { ArtikelDialog } from '../../components/artikel-dialog/artikel-dialog';
// `ArticlesPage` renders `ArtikelDialog`, which renders `InputGroup`, which depends on
// `BarcodeScanner`/`@zxing/browser` — importing the ONE shared mock (see that file's own
// comment for why it must be centralized, and why every spec that transitively loads
// `BarcodeScanner` must import it, not just the ones asserting on it) so this test never
// touches real device camera APIs (unavailable in jsdom).
// (Round-25 review fix: this registration now also happens unconditionally via the global
// Vitest `setupFiles` entry in `angular.json` — this import is kept for documentation/clarity,
// not because it is still load-bearing for the mock to win the race.)
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { ArticlesStore, ArticlesFilters } from '../../articles-store';
import { ArticleDetail, ArticleListItem, ArticlesApi } from '../../data/articles-api';
import { RoleService } from '../../../../core/auth/role.service';
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

function buildDetail(overrides: Partial<ArticleDetail> = {}): ArticleDetail {
  return {
    id: 'a1',
    number: 1001,
    name: 'Schneeanzug 104',
    brand: 'Playmobil',
    category: 'Kleidung',
    price: 12.5,
    size: '104',
    color: 'blau',
    description: null,
    status: 'selling',
    soldManually: false,
    sellerId: 's1',
    sellerName: 'Anna Meier',
    createdAt: '2026-08-01T08:00:00Z',
    releasedAt: '2026-08-02T08:00:00Z',
    soldAt: null,
    returnedAt: null,
    sellerSettledAt: null,
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
  let isAdminSignal: ReturnType<typeof signal<boolean>>;
  let load: ReturnType<typeof vi.fn>;
  let setFilters: ReturnType<typeof vi.fn>;
  let setPage: ReturnType<typeof vi.fn>;
  let setPageSize: ReturnType<typeof vi.fn>;
  let getById: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let updateTimestamps: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

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
    isAdminSignal = signal(true);
    load = vi.fn();
    setFilters = vi.fn((partial: Partial<ArticlesFilters>) => {
      filtersSignal.set({ ...filtersSignal(), ...partial });
    });
    setPage = vi.fn();
    setPageSize = vi.fn();
    getById = vi.fn().mockReturnValue(of(buildDetail()));
    update = vi.fn().mockReturnValue(of(undefined));
    updateTimestamps = vi.fn().mockReturnValue(of(undefined));
    remove = vi.fn().mockReturnValue(of(undefined));
    messageServiceAdd = vi.fn();

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
            setPageSize,
            getById,
            update,
            updateTimestamps,
            remove,
          },
        },
        { provide: RoleService, useValue: { isAdmin: isAdminSignal } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
        { provide: BrandsApi, useValue: { getAll: () => of(BRANDS) } },
        { provide: CategoriesApi, useValue: { getAll: () => of(CATEGORIES) } },
        {
          provide: ArticlesApi,
          useValue: {
            getByNumber: () => throwError(() => new HttpErrorResponse({ status: 404 })),
          },
        },
        ConfirmationService,
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

  it('renders "Artikel" as page title around filters and table', async () => {
    const { fixture } = await createPage();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Artikel');
    expect(el.querySelector('app-page .page__content app-table')).not.toBeNull();
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

  describe('Filterleiste', () => {
    function filterbar(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
      return (fixture.nativeElement as HTMLElement).querySelector('p-toolbar.articles-page__filterbar');
    }

    it('render_pageOpened_putsSearchAndThreeSelectsInOneToolbarAboveTable', async () => {
      // Arrange
      const { fixture } = await createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Act
      const bar = filterbar(fixture);

      // Assert
      expect(bar).not.toBeNull();
      expect(el.querySelectorAll('p-toolbar')).toHaveLength(1);
      expect(bar!.querySelector('input[pInputText], input.p-inputtext')).not.toBeNull();
      expect(bar!.querySelectorAll('p-select')).toHaveLength(3);
      expect(el.querySelectorAll('p-select')).toHaveLength(3);
      const table = el.querySelector('app-table')!;
      expect(
        bar!.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(el.querySelector('.articles-page__filter-row, .articles-page__filter-grid')).toBeNull();
    });

    it('render_pageOpened_hasNoElementBeforeSearchField', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const children = Array.from(bar.children);

      // Assert
      expect(children[0].classList.contains('p-toolbar-center')).toBe(true);
      expect(bar.querySelector('.p-toolbar-start')).toBeNull();
      expect(bar.querySelector('button')).toBeNull();
      expect(
        children[0].querySelector('input')?.getAttribute('placeholder'),
      ).toBe('Suche nach Nr., Bezeichnung …');
    });

    it('render_pageOpened_putsSelectsOnTheRightInOrderBrandCategoryStatus', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const names = Array.from(bar.querySelectorAll('.p-toolbar-end p-select')).map((s) =>
        s.getAttribute('aria-label'),
      );

      // Assert
      expect(names).toEqual(['Marke', 'Kategorie', 'Status']);
      expect(bar.querySelectorAll('.p-toolbar-center p-select')).toHaveLength(0);
    });

    it('render_pageOpened_hasNoVisibleLabelsAndShowsAllePlaceholderInEverySelect', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const labels = Array.from(bar.querySelectorAll('p-select .p-select-label')).map((l) =>
        l.textContent?.trim(),
      );

      // Assert
      expect(bar.querySelector('label')).toBeNull();
      expect(labels).toEqual(['Alle', 'Alle', 'Alle']);
    });

    it('render_filterActive_showsNoFilterChips', async () => {
      // Arrange
      filtersSignal.set({ q: 'x', brand: 'Playmobil', category: 'Kleidung', status: 'sold', sort: 'number:asc' });
      const { fixture } = await createPage();

      // Act
      const chips = (fixture.nativeElement as HTMLElement).querySelectorAll('p-chip');

      // Assert
      expect(chips).toHaveLength(0);
    });

    it('styles_pageOpened_searchAreaFillsRemainingWidth', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const center = getComputedStyle(bar.querySelector<HTMLElement>('.p-toolbar-center')!);
      const search = getComputedStyle(
        bar.querySelector<HTMLElement>('.p-toolbar-center p-iconfield.articles-page__search')!,
      );
      const input = getComputedStyle(bar.querySelector<HTMLElement>('.p-toolbar-center input')!);

      // Assert
      expect(center.flexGrow).toBe('1');
      expect(center.flexShrink).toBe('1');
      expect(center.flexBasis).toBe('16rem');
      expect(center.minWidth).toBe('16rem');
      expect(search.display).toBe('block');
      expect(search.width).toBe('100%');
      expect(input.width).toBe('100%');
    });

    it('styles_pageOpened_selectsHaveMinWidth200AndGrowWithSelectedText', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const selects = Array.from(bar.querySelectorAll<HTMLElement>('.p-toolbar-end p-select'));

      // Assert
      expect(selects).toHaveLength(3);
      for (const select of selects) {
        expect(select.classList).toContain('articles-page__select');
        const style = getComputedStyle(select);
        expect(style.minWidth).toBe('200px');
        expect(style.flexGrow).toBe('0');
        expect(style.flexShrink).toBe('0');
        expect(style.flexBasis).toBe('auto');
        const label = getComputedStyle(select.querySelector<HTMLElement>('.p-select-label')!);
        expect(label.width).toBe('auto');
        expect(label.overflow).toBe('visible');
        expect(label.textOverflow).toBe('clip');
      }
    });

    it('styles_narrowWindow_toolbarWrapsWithoutHorizontalOverflow', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const toolbar = getComputedStyle(bar);
      const end = getComputedStyle(bar.querySelector<HTMLElement>('.p-toolbar-end')!);
      const selects = Array.from(bar.querySelectorAll<HTMLElement>('.p-toolbar-end p-select')).map(
        (s) => getComputedStyle(s),
      );

      // Assert
      expect(toolbar.flexWrap).toBe('wrap');
      expect(end.flexWrap).toBe('wrap');
      expect(end.maxWidth).toBe('100%');
      expect(selects).toHaveLength(3);
      for (const select of selects) {
        expect(select.maxWidth).toBe('100%');
      }
    });

    it('onBrandChange_selectsInToolbarEmitChange_callSetFiltersImmediately', async () => {
      // Arrange
      const { fixture } = await createPage();
      const selects = fixture.debugElement.queryAll(
        By.css('p-toolbar.articles-page__filterbar .p-toolbar-end p-select'),
      );
      setFilters.mockClear();

      // Act
      selects[0].injector.get(NgModel).viewToModelUpdate('Playmobil');
      selects[1].injector.get(NgModel).viewToModelUpdate('Kleidung');
      selects[2].injector.get(NgModel).viewToModelUpdate('sold');

      // Assert
      expect(selects).toHaveLength(3);
      expect(setFilters).toHaveBeenCalledTimes(3);
      expect(setFilters).toHaveBeenNthCalledWith(1, { brand: 'Playmobil' });
      expect(setFilters).toHaveBeenNthCalledWith(2, { category: 'Kleidung' });
      expect(setFilters).toHaveBeenNthCalledWith(3, { status: 'sold' });
    });

    describe('Suche mit Tipppause', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('onQInputChange_typingInToolbarSearch_callsSetFiltersOnlyAfterPause', async () => {
        // Arrange
        const { fixture } = await createPage();
        const input = filterbar(fixture)!.querySelector<HTMLInputElement>('.p-toolbar-center input')!;
        setFilters.mockClear();

        // Act
        input.value = 'sch';
        input.dispatchEvent(new Event('input'));
        await vi.advanceTimersByTimeAsync(100);
        await fixture.whenStable();
        const callsBeforePause = setFilters.mock.calls.length;
        await vi.advanceTimersByTimeAsync(300);
        await fixture.whenStable();

        // Assert
        expect(callsBeforePause).toBe(0);
        expect(setFilters).toHaveBeenCalledTimes(1);
        expect(setFilters).toHaveBeenCalledWith({ q: 'sch' });
      });
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

    it('onBrandChange_clearIconEmitsNull_callsSetFiltersWithNullForEachSelect', async () => {
      // Arrange
      const { component } = await createPage();
      setFilters.mockClear();

      // Act
      component.onBrandChange(null);
      component.onCategoryChange(null);
      component.onStatusChange(null);

      // Assert
      expect(setFilters).toHaveBeenCalledWith({ brand: null });
      expect(setFilters).toHaveBeenCalledWith({ category: null });
      expect(setFilters).toHaveBeenCalledWith({ status: null });
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

  describe('pagination: paginator page-size change -> ArticlesStore.setPageSize (fix round 1)', () => {
    it('calls setPageSize instead of setPage when the emitted rows differ from the current pageSize', async () => {
      const { component } = await createPage();

      component.onPageChange({ page: 0, rows: 10 });

      expect(setPageSize).toHaveBeenCalledWith(10);
      expect(setPage).not.toHaveBeenCalled();
    });

    it('does not call setPageSize when rows matches the current pageSize, a plain page-number change', async () => {
      const { component } = await createPage();

      component.onPageChange({ page: 1, rows: 50 });

      expect(setPageSize).not.toHaveBeenCalled();
      expect(setPage).toHaveBeenCalledWith(2);
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
      const statusColumn = component.columns.find((c) => c.field === 'statusLabel');

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
      ['Registriert', 'secondary'],
      ['Im Verkauf', 'info'],
      ['Verkauft', 'success'],
      ['Zurückgegeben', 'warn'],
    ])('maps German status label "%s" to severity "%s"', async (label, severity) => {
      const { component } = await createPage();
      const statusColumn = component.columns.find((c) => c.field === 'statusLabel');

      expect(statusColumn?.badgeSeverity?.(label)).toBe(severity);
    });
  });

  describe('status badge shows the German label, not the raw backend value (fix round 1)', () => {
    it('points the status column config at the derived statusLabel field, not the raw status', async () => {
      const { component } = await createPage();

      expect(component.columns.find((c) => c.field === 'status')).toBeUndefined();
      expect(component.columns.find((c) => c.field === 'statusLabel')).toBeDefined();
    });

    it('renders the German label ("Im Verkauf") in the DOM, not the raw English status ("selling")', async () => {
      itemsSignal.set([buildItem({ status: 'selling' })]);
      totalCountSignal.set(1);
      const { fixture } = await createPage();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Im Verkauf');
      expect(text).not.toContain('selling');
    });

    it('maps every raw status value to its German label on the row Table actually receives', async () => {
      const { component } = await createPage();

      itemsSignal.set([
        buildItem({ id: 'r', status: 'registered' }),
        buildItem({ id: 's', status: 'sold' }),
        buildItem({ id: 't', status: 'returned' }),
      ]);

      expect(component.items().map((r) => r.statusLabel)).toEqual([
        'Registriert',
        'Verkauft',
        'Zurückgegeben',
      ]);
    });
  });

  describe('Aktionen column (review fix)', () => {
    it('always includes the "Bearbeiten" (edit) action', async () => {
      const { component } = await createPage();

      expect(component.actionColumn().buttons.map((b) => b.actionId)).toContain('edit');
    });

    it('includes the "Status" action only for admins', async () => {
      isAdminSignal.set(true);
      const { component } = await createPage();
      expect(component.actionColumn().buttons.map((b) => b.actionId)).toContain('status');

      isAdminSignal.set(false);
      expect(component.actionColumn().buttons.map((b) => b.actionId)).not.toContain('status');
    });

    it('routes the "edit" actionClick to onEdit and "status" to onStatusClick', async () => {
      const { component } = await createPage();
      const row = buildItem();
      const editSpy = vi.spyOn(component, 'onEdit');
      const statusSpy = vi.spyOn(component, 'onStatusClick');

      component.onTableAction({ actionId: 'edit', row });
      expect(editSpy).toHaveBeenCalledWith(row);

      component.onTableAction({ actionId: 'status', row });
      expect(statusSpy).toHaveBeenCalledWith(row);
    });
  });

  describe('edit flow (artikel-dialog, review fix)', () => {
    it('fetches the full detail via ArticlesStore.getById and opens the dialog on success', async () => {
      const { component } = await createPage();
      const detail = buildDetail();
      getById.mockReturnValue(of(detail));

      component.onEdit(buildItem());

      expect(getById).toHaveBeenCalledWith('a1');
      expect(component.dialogVisible()).toBe(true);
      expect(component.dialogInitialValue()).toEqual({
        number: detail.number,
        name: detail.name,
        brand: detail.brand,
        category: detail.category,
        price: detail.price,
        size: detail.size,
        color: detail.color,
        description: detail.description,
      });
    });

    it('toasts and keeps the dialog closed when getById fails', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(throwError(() => new Error('not found')));

      component.onEdit(buildItem());

      expect(component.dialogVisible()).toBe(false);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });

    it('derives locked="sold" when soldAt is set but the seller is not settled', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail({ soldAt: '2026-08-05T08:00:00Z' })));

      component.onEdit(buildItem());

      expect(component.dialogLocked()).toBe('sold');
    });

    it('derives locked="settled" when the seller is settled, even if also sold', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(
        of(buildDetail({ soldAt: '2026-08-05T08:00:00Z', sellerSettledAt: '2026-08-06T08:00:00Z' })),
      );

      component.onEdit(buildItem());

      expect(component.dialogLocked()).toBe('settled');
    });

    it('calls ArticlesStore.update with the form result and closes the dialog on success', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail()));
      component.onEdit(buildItem());
      const formResult = {
        number: 1001,
        name: 'Neuer Name',
        brand: 'Playmobil',
        category: 'Kleidung',
        price: 15,
        size: '104',
        color: 'blau',
        description: null,
      };

      component.onDialogSave(formResult);

      expect(update).toHaveBeenCalledWith('a1', formResult);
      expect(component.dialogVisible()).toBe(false);
    });

    it('maps a 400 response to field-level serverErrors instead of closing the dialog', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail()));
      component.onEdit(buildItem());
      update.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { errors: { name: ['Bezeichnung ist erforderlich'] } },
            }),
        ),
      );

      component.onDialogSave({
        number: 1001,
        name: '',
        brand: 'Playmobil',
        category: 'Kleidung',
        price: 15,
        size: null,
        color: null,
        description: null,
      });

      expect(component.dialogVisible()).toBe(true);
      expect(component.serverErrors()?.name).toBe('Bezeichnung ist erforderlich');
    });

    it('maps a 400 number error to serverErrors.number', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail()));
      component.onEdit(buildItem());
      update.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 400,
              error: { errors: { number: ['Artikelnummer muss eine ganze Zahl ab 1 sein.'] } },
            }),
        ),
      );

      component.onDialogSave({
        number: 0,
        name: 'Schneeanzug 104',
        brand: 'Playmobil',
        category: 'Kleidung',
        price: 15,
        size: null,
        color: null,
        description: null,
      });

      expect(component.dialogVisible()).toBe(true);
      expect(component.serverErrors()?.number).toBe(
        'Artikelnummer muss eine ganze Zahl ab 1 sein.',
      );
    });

    it('maps a 409 article.number_taken to serverErrors.number without closing the dialog', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail()));
      component.onEdit(buildItem());
      update.mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 409,
              error: {
                errorCode: 'article.number_taken',
                detail: 'Artikelnummer 1044 ist bereits vergeben.',
              },
            }),
        ),
      );

      component.onDialogSave({
        number: 1044,
        name: 'Schneeanzug 104',
        brand: 'Playmobil',
        category: 'Kleidung',
        price: 15,
        size: null,
        color: null,
        description: null,
      });

      expect(component.dialogVisible()).toBe(true);
      expect(component.serverErrors()?.number).toBe('Artikelnummer 1044 ist bereits vergeben.');
      expect(messageServiceAdd).not.toHaveBeenCalled();
    });

    it('passes the edited article id to the dialog', async () => {
      const { fixture, component } = await createPage();
      getById.mockReturnValue(of(buildDetail({ id: 'a7' })));

      component.onEdit(buildItem({ id: 'a7' }));
      await fixture.whenStable();

      const dialog = fixture.debugElement.query(By.directive(ArtikelDialog))
        .componentInstance as ArtikelDialog;
      expect(dialog.articleId()).toBe('a7');
    });

    it('calls ArticlesStore.remove on deleteRequested and closes the dialog on success', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail()));
      component.onEdit(buildItem());

      component.onDeleteRequested();

      expect(remove).toHaveBeenCalledWith('a1');
      expect(component.dialogVisible()).toBe(false);
    });
  });

  describe('status popup flow (article-status-popup, review fix)', () => {
    it('fetches the full detail and opens the popup on success', async () => {
      const { component } = await createPage();
      const detail = buildDetail({ soldAt: null, returnedAt: null });
      getById.mockReturnValue(of(detail));

      component.onStatusClick(buildItem());

      expect(getById).toHaveBeenCalledWith('a1');
      expect(component.statusPopupVisible()).toBe(true);
      expect(component.statusPopupValue()).toEqual({
        createdAt: detail.createdAt,
        releasedAt: detail.releasedAt,
        soldAt: detail.soldAt,
        returnedAt: detail.returnedAt,
      });
    });

    it('derives statusPopupSettlementLocked from sellerSettledAt', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail({ sellerSettledAt: '2026-08-06T08:00:00Z' })));

      component.onStatusClick(buildItem());

      expect(component.statusPopupSettlementLocked()).toBe(true);
    });

    it('calls ArticlesStore.updateTimestamps and closes the popup on success', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail()));
      component.onStatusClick(buildItem());

      component.onTimestampsChange({ releasedAt: '2026-08-02T08:00:00Z', soldAt: '2026-08-05T08:00:00Z', returnedAt: null });

      expect(updateTimestamps).toHaveBeenCalledWith('a1', {
        releasedAt: '2026-08-02T08:00:00Z',
        soldAt: '2026-08-05T08:00:00Z',
        returnedAt: null,
      });
      expect(component.statusPopupVisible()).toBe(false);
    });

    it('toasts settlement.locked without closing on error', async () => {
      const { component } = await createPage();
      getById.mockReturnValue(of(buildDetail()));
      component.onStatusClick(buildItem());
      updateTimestamps.mockReturnValue(
        throwError(
          () => new HttpErrorResponse({ status: 409, error: { errorCode: 'settlement.locked' } }),
        ),
      );

      component.onTimestampsChange({ releasedAt: null, soldAt: null, returnedAt: null });

      expect(component.statusPopupVisible()).toBe(true);
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error', summary: 'Verkäufer bereits abgerechnet' }),
      );
    });
  });
});
