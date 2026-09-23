import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { SellersPage } from './sellers-page';
// `SellersPage` renders `ReleaseDialog`, which renders `ScanDialog` -> `InputGroup` ->
// `BarcodeScanner`/`@zxing/browser` — importing the ONE shared mock (see that file's own
// comment for why it must be centralized, and why every spec that transitively loads
// `BarcodeScanner` must import it, not just the ones asserting on it) so this test never
// touches real device camera APIs (unavailable in jsdom).
// (Round-25 review fix: this registration now also happens unconditionally via the global
// Vitest `setupFiles` entry in `angular.json` — this import is kept for documentation/clarity,
// not because it is still load-bearing for the mock to win the race.)
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { SellersStore, SellersFilters } from '../../sellers-store';
import { RoleService } from '../../../../core/auth/role.service';
// eslint-disable-next-line boundaries/dependencies
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { SellerCard, SellerDetail, SellersApi } from '../../data/sellers-api';
import { ReleaseApi } from '../../data/release-api';

function buildDetail(overrides: Partial<SellerDetail> = {}): SellerDetail {
  return {
    id: 's1',
    firstName: 'Anna',
    lastName: 'Meier',
    address: 'Hauptstr. 1',
    postalCode: '76133',
    city: 'Karlsruhe',
    phone: '0123456789',
    email: 'anna@example.org',
    sellerTypeId: 'type-privat',
    salesCommission: 10,
    feePerItem: 0.5,
    intakeFeePaid: 0,
    settledAt: null,
    payoutAmount: null,
    ...overrides,
  };
}

function buildCard(overrides: Partial<SellerCard> = {}): SellerCard {
  return {
    id: 's1',
    firstName: 'Anna',
    lastName: 'Meier',
    postalCode: '76133',
    city: 'Karlsruhe',
    sellerType: 'Privat',
    status: 'open',
    articleCount: 12,
    releasedCount: 8,
    soldCount: 5,
    returnedCount: 1,
    acceptedValue: 100.5,
    openValue: 20.25,
    revenue: 80.25,
    settledAt: null,
    ...overrides,
  };
}

const SELLER_TYPES: SellerType[] = [
  { id: 'type-privat', name: 'Privat', commissionRate: 10, itemFee: 0.5, sellerCount: 5 },
];

describe('SellersPage', () => {
  let itemsSignal: ReturnType<typeof signal<SellerCard[]>>;
  let totalCountSignal: ReturnType<typeof signal<number>>;
  let pageSignal: ReturnType<typeof signal<number>>;
  let pageSizeSignal: ReturnType<typeof signal<number>>;
  let loadingSignal: ReturnType<typeof signal<boolean>>;
  let filtersSignal: ReturnType<typeof signal<SellersFilters>>;
  let isAdminSignal: ReturnType<typeof signal<boolean>>;
  let load: ReturnType<typeof vi.fn>;
  let setFilters: ReturnType<typeof vi.fn>;
  let loadMore: ReturnType<typeof vi.fn>;
  let hasMoreSignal: ReturnType<typeof signal<boolean>>;
  let create: ReturnType<typeof vi.fn>;
  let update: ReturnType<typeof vi.fn>;
  let remove: ReturnType<typeof vi.fn>;
  let resetSettlement: ReturnType<typeof vi.fn>;
  let getArticles: ReturnType<typeof vi.fn>;
  let getById: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    itemsSignal = signal<SellerCard[]>([]);
    totalCountSignal = signal(0);
    pageSignal = signal(1);
    pageSizeSignal = signal(60);
    loadingSignal = signal(false);
    filtersSignal = signal<SellersFilters>({ q: '', status: null, sort: 'name' });
    isAdminSignal = signal(true);
    load = vi.fn();
    setFilters = vi.fn((partial: Partial<SellersFilters>) => {
      filtersSignal.set({ ...filtersSignal(), ...partial });
    });
    loadMore = vi.fn();
    hasMoreSignal = signal(false);
    create = vi.fn();
    update = vi.fn();
    remove = vi.fn();
    resetSettlement = vi.fn();
    getArticles = vi.fn().mockReturnValue(of([]));
    getById = vi.fn().mockReturnValue(of(buildDetail()));
    messageServiceAdd = vi.fn();
    // `app-release-dialog` (Round-18 Task 4) is always rendered by `sellers-page.html` and
    // injects the real `SellersApi`/`ReleaseApi` itself (`providedIn: 'root'`) — both are
    // overridden here purely so their real `HttpClient` dependency is never required by this
    // page's own spec, same reasoning as the `SellerTypesApi` mock above.

    await TestBed.configureTestingModule({
      imports: [SellersPage],
      providers: [
        {
          provide: SellersStore,
          useValue: {
            items: itemsSignal,
            totalCount: totalCountSignal,
            page: pageSignal,
            pageSize: pageSizeSignal,
            loading: loadingSignal,
            filters: filtersSignal,
            load,
            setFilters,
            loadMore,
            hasMore: hasMoreSignal,
            create,
            update,
            remove,
            resetSettlement,
            getArticles,
            getById,
          },
        },
        { provide: RoleService, useValue: { isAdmin: isAdminSignal } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
        { provide: SellerTypesApi, useValue: { getAll: () => of(SELLER_TYPES) } },
        { provide: SellersApi, useValue: { getById: vi.fn().mockReturnValue(of(buildDetail())) } },
        { provide: ReleaseApi, useValue: { bookRelease: vi.fn() } },
        ConfirmationService,
      ],
    }).compileComponents();
  });

  async function createPage() {
    const fixture = TestBed.createComponent(SellersPage);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, component: fixture.componentInstance };
  }

  it('calls sellersStore.load() on construction', async () => {
    await createPage();
    expect(load).toHaveBeenCalled();
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

      component.onQInputChange('m');
      component.onQInputChange('me');
      component.onQInputChange('mei');
      await vi.advanceTimersByTimeAsync(100);
      await fixture.whenStable();
      expect(setFilters).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);
      await fixture.whenStable();

      expect(setFilters).toHaveBeenCalledTimes(1);
      expect(setFilters).toHaveBeenCalledWith({ q: 'mei' });
    });

    it('does not fire again for the same value that is already applied', async () => {
      const { component } = await createPage();
      setFilters.mockClear();

      component.onQInputChange('mei');
      await vi.advanceTimersByTimeAsync(300);
      expect(setFilters).toHaveBeenCalledTimes(1);

      setFilters.mockClear();
      component.onQInputChange('mei');
      await vi.advanceTimersByTimeAsync(300);
      expect(setFilters).not.toHaveBeenCalled();
    });
  });

  describe('status filter', () => {
    it('triggers setFilters immediately, without any debounce delay', async () => {
      const { component } = await createPage();
      setFilters.mockClear();

      component.onStatusChange('selling');

      expect(setFilters).toHaveBeenCalledWith({ status: 'selling' });
    });
  });

  describe('empty states', () => {
    it('shows the "no sellers at all" copy when totalCount is 0 and no filters are active', async () => {
      totalCountSignal.set(0);
      const { fixture } = await createPage();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Noch keine Verkäufer.');
      expect(text).toContain('Einstellungen → Import');
      expect(text).toContain('+ Neu');
      expect(text).not.toContain('Keine Verkäufer für die gewählten Filter.');
    });

    it('shows the "no results for filter" copy with a reset button when a filter is active', async () => {
      totalCountSignal.set(0);
      filtersSignal.set({ q: 'xyz', status: null, sort: 'name' });
      const { component, fixture } = await createPage();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Keine Verkäufer für die gewählten Filter.');
      expect(text).not.toContain('Noch keine Verkäufer.');

      setFilters.mockClear();
      component.resetAllFilters();
      expect(setFilters).toHaveBeenCalledWith({ q: '', status: null, sort: 'name' });
    });
  });

  describe('scan', () => {
    it('opens the release dialog for the clicked card', async () => {
      const { component } = await createPage();

      component.onScan(buildCard({ id: 's1' }));

      expect(component.releaseDialogVisible()).toBe(true);
      expect(component.releaseDialogSellerId()).toBe('s1');
      expect(create).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    });

    it('clears the seller id when the release dialog closes', async () => {
      const { component } = await createPage();
      component.onScan(buildCard({ id: 's1' }));

      component.onReleaseDialogVisibleChange(false);

      expect(component.releaseDialogVisible()).toBe(false);
      expect(component.releaseDialogSellerId()).toBeNull();
    });

    it('onReleased refreshes the seller list and shows a success toast', async () => {
      const { component } = await createPage();
      load.mockClear();

      component.onReleased();

      expect(load).toHaveBeenCalled();
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: '✓ Artikel freigegeben' }),
      );
    });
  });

  describe('cardClick', () => {
    it('opens the detail modal with the clicked card', async () => {
      const { component } = await createPage();
      const card = buildCard();

      component.onCardClick(card);

      expect(component.detailModalVisible()).toBe(true);
      expect(component.selectedCardForDetail()).toEqual(card);
    });
  });

  describe('edit', () => {
    it('fetches the seller detail via getById and only then opens the dialog in edit mode', async () => {
      const { component, fixture } = await createPage();
      const card = buildCard({ id: 's1', firstName: 'Anna', lastName: 'Meier' });
      getById.mockReturnValue(
        of(
          buildDetail({
            id: 's1',
            firstName: 'Anna',
            lastName: 'Meier',
            email: 'anna@example.org',
            address: 'Hauptstr. 1',
            phone: '0123456789',
            sellerTypeId: 'type-privat',
            salesCommission: 10,
            feePerItem: 0.5,
          }),
        ),
      );

      component.onEdit(card);
      await fixture.whenStable();

      expect(getById).toHaveBeenCalledWith('s1');
      expect(component.dialogVisible()).toBe(true);
      expect(component.dialogMode()).toBe('edit');
      expect(component.dialogInitialValue()).toEqual(
        expect.objectContaining({
          firstName: 'Anna',
          lastName: 'Meier',
          email: 'anna@example.org',
          address: 'Hauptstr. 1',
          phone: '0123456789',
          sellerTypeId: 'type-privat',
          salesCommission: 10,
          feePerItem: 0.5,
        }),
      );
    });

    it('does not open the dialog and shows an error toast when the fetch fails', async () => {
      const { component, fixture } = await createPage();
      getById.mockReturnValue(throwError(() => new Error('not found')));
      const card = buildCard({ id: 's1' });

      component.onEdit(card);
      await fixture.whenStable();

      expect(component.dialogVisible()).toBe(false);
      expect(component.dialogInitialValue()).toBeNull();
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'error' }),
      );
    });
  });

  describe('statusClick', () => {
    it('opens the status popup for the clicked card', async () => {
      const { component } = await createPage();
      const card = buildCard({ settledAt: '2026-01-01T10:00:00Z' });

      component.onStatusClick(card);

      expect(component.statusPopupVisible()).toBe(true);
      expect(component.statusPopupCard()).toEqual(card);
    });

    it('only offers the reset button to admins when settledAt is set', async () => {
      isAdminSignal.set(false);
      const { component } = await createPage();
      component.onStatusClick(buildCard({ settledAt: '2026-01-01T10:00:00Z' }));

      expect(component.statusPopupCanReset()).toBe(false);
    });
  });

  describe('onResetSettlement', () => {
    it('builds the confirm-dialog message without throwing (NG0701 regression)', async () => {
      const { component } = await createPage();
      component.onStatusClick(buildCard({ settledAt: '2026-01-01T10:00:00Z' }));

      expect(() => component.onResetSettlement()).not.toThrow();
    });
  });

  describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)', () => {
    it('renders "Verkäufer" as page title in fill mode and keeps "+ Neu" in the filter row', async () => {
      const { fixture } = await createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Verkäufer');
      expect(el.querySelector('app-page')?.classList).toContain('page--fill');
      expect(el.querySelector('.page__actions')?.children.length).toBe(0);
      expect(el.querySelector('.sellers-page__filter-row p-button[label="+ Neu"]')).not.toBeNull();
    });

    it('renders the tiles inside the scrolling list without a paginator', async () => {
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('.sellers-page__list .sellers-page__grid app-seller-card')).not.toBeNull();
      expect(el.querySelector('.sellers-page__list [appLoadMoreSentinel]')).not.toBeNull();
      expect(el.querySelector('p-paginator')).toBeNull();
    });

    it('loads more when the list end is reached and more sellers exist', async () => {
      hasMoreSignal.set(true);
      const { component } = await createPage();

      component.onLoadMore();

      expect(loadMore).toHaveBeenCalledTimes(1);
    });

    it('does not load more while loading or when everything is loaded', async () => {
      const { component } = await createPage();

      hasMoreSignal.set(false);
      component.onLoadMore();
      hasMoreSignal.set(true);
      loadingSignal.set(true);
      component.onLoadMore();

      expect(loadMore).not.toHaveBeenCalled();
    });
  });
});
