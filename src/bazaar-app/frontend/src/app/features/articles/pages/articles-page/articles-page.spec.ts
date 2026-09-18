import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ArticlesPage } from './articles-page';
import { ArticlesStore, ArticlesFilters } from '../../articles-store';
import { ArticleDetail, ArticleListItem } from '../../data/articles-api';
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
