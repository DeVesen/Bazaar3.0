import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ScrollArea } from 'primeng/scrollarea';
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

// PrimeNG `ScrollArea` observes its viewport via `ResizeObserver` (setupResizeObserver in
// primeng-scrollarea.mjs) — unavailable in jsdom. Same stub as `intake-page.spec.ts` and
// `intake-wizard.spec.ts`; tests that need overflow call `ScrollArea.refresh()` directly.
class ResizeObserverStub {
  observe(): void {
    // no-op: not exercised by these tests, only needed so PrimeNG's ScrollArea doesn't throw.
  }
  unobserve(): void {
    // no-op, see observe().
  }
  disconnect(): void {
    // no-op, see observe().
  }
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
  ResizeObserverStub;

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

    /** Regeln der Component-Styles für `.sellers-page__list`, jeweils mit ihrer Media-Query (oder null). */
    function listStyleRules(): { media: string | null; style: CSSStyleDeclaration }[] {
      const found: { media: string | null; style: CSSStyleDeclaration }[] = [];
      const collect = (rules: CSSRuleList, media: string | null): void => {
        for (const rule of Array.from(rules)) {
          if ('media' in rule && 'cssRules' in rule) {
            const mediaRule = rule as CSSMediaRule;
            collect(mediaRule.cssRules, mediaRule.media.mediaText);
          } else if (
            'selectorText' in rule &&
            (rule as CSSStyleRule).selectorText.includes('.sellers-page__list')
          ) {
            found.push({ media, style: (rule as CSSStyleRule).style });
          }
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        collect(sheet.cssRules, null);
      }
      return found;
    }

    async function renderWithViewportSize(
      clientHeight: number,
      scrollHeight: number,
    ): Promise<HTMLElement> {
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const viewport = el.querySelector('p-scrollarea-viewport') as HTMLElement;
      Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: clientHeight });
      Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: scrollHeight });
      (
        fixture.debugElement.query(By.directive(ScrollArea)).componentInstance as ScrollArea
      ).refresh();
      fixture.detectChanges();
      return el;
    }

    it('styles_from769px_giveKachellisteRemainingHeightWithoutNativeOverflow', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      await createPage();
      const desktopRules = listStyleRules().filter(
        (rule) => (rule.media ?? '').replace(/\s/g, '') === '(min-width:769px)',
      );

      // Assert
      expect(desktopRules.length).toBeGreaterThan(0);
      expect(
        desktopRules.some((rule) => rule.style.getPropertyValue('flex').trim().startsWith('1')),
      ).toBe(true);
      expect(
        desktopRules.some((rule) =>
          ['0', '0px'].includes(rule.style.getPropertyValue('min-height').trim()),
        ),
      ).toBe(true);
      expect(desktopRules.every((rule) => rule.style.getPropertyValue('overflow-y') === '')).toBe(
        true,
      );
      expect(desktopRules.every((rule) => rule.style.getPropertyValue('overflow') === '')).toBe(
        true,
      );
    });

    it('styles_upTo768px_giveKachellisteNoOwnScrollHeight', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      await createPage();
      const rules = listStyleRules();
      const baseRules = rules.filter((rule) => rule.media === null);
      const mediaRules = rules.filter((rule) => rule.media !== null);

      // Assert
      expect(rules.length).toBeGreaterThan(0);
      expect(
        mediaRules.every((rule) => (rule.media ?? '').replace(/\s/g, '') === '(min-width:769px)'),
      ).toBe(true);
      for (const rule of baseRules) {
        for (const property of [
          'height',
          'max-height',
          'min-height',
          'flex',
          'flex-grow',
          'overflow',
          'overflow-y',
        ]) {
          expect(rule.style.getPropertyValue(property)).toBe('');
        }
      }
    });

    it('refresh_withMoreTilesThanSpace_showsVerticalScrollbar', async () => {
      // Arrange
      const el = await renderWithViewportSize(600, 2000);

      // Act
      const scrollbar = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-scrollbar[data-orientation="vertical"]',
      ) as HTMLElement;
      const viewport = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-viewport',
      ) as HTMLElement;

      // Assert
      expect(scrollbar.style.display).not.toBe('none');
      expect(viewport.hasAttribute('data-scroll-y-after')).toBe(true);
    });

    it('refresh_withFewerTilesThanSpace_hidesVerticalScrollbar', async () => {
      // Arrange
      const el = await renderWithViewportSize(600, 300);

      // Act
      const scrollbar = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-scrollbar[data-orientation="vertical"]',
      ) as HTMLElement;
      const viewport = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-viewport',
      ) as HTMLElement;

      // Assert
      expect(scrollbar.style.display).toBe('none');
      expect(viewport.hasAttribute('data-scroll-y-after')).toBe(false);
    });

    it('render_withSellers_putsGridAndSentinelIntoScrollAreaContentWithoutPaginator', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      const content = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-viewport p-scrollarea-content',
      );
      expect(content?.querySelector('.sellers-page__grid app-seller-card')).not.toBeNull();
      expect(content?.querySelector('[appLoadMoreSentinel]')).not.toBeNull();
      expect(el.querySelector('div.sellers-page__list')).toBeNull();
      expect(el.querySelector('p-paginator')).toBeNull();
    });

    it('render_withSellers_usesAutoScrollbarWithoutFadeMask', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const root = (fixture.nativeElement as HTMLElement).querySelector(
        'p-scrollarea.sellers-page__list',
      );

      // Assert
      expect(root?.getAttribute('data-variant')).toBe('auto');
      expect(root?.classList.contains('p-scrollarea-mask')).toBe(false);
      expect(
        root?.querySelector(
          'p-scrollarea-scrollbar[data-orientation="vertical"] p-scrollarea-handle',
        ),
      ).not.toBeNull();
    });

    it('render_withSellers_keepsFilterRowsOutsideScrollArea', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelectorAll('.sellers-page__filter-row').length).toBe(2);
      expect(el.querySelector('p-scrollarea .sellers-page__filter-row')).toBeNull();
    });

    it('cardClick_onTileInsideScrollArea_opensDetailModal', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      const { fixture, component } = await createPage();
      fixture.detectChanges();
      const tile = fixture.debugElement.query(By.css('p-scrollarea app-seller-card'));

      // Act
      tile.triggerEventHandler('cardClick', buildCard());

      // Assert
      expect(component.detailModalVisible()).toBe(true);
      expect(component.selectedCardForDetail()?.id).toBe('s1');
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

    it('render_loadingWithoutSellers_showsSkeletonTilesInsideScrollAreaAndKeepsFilterRows', async () => {
      // Arrange
      loadingSignal.set(true);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelectorAll('p-scrollarea p-scrollarea-content p-skeleton').length).toBe(6);
      expect(el.querySelector('app-seller-card')).toBeNull();
      expect(el.querySelector('.sellers-page__sentinel')).toBeNull();
      expect(el.querySelectorAll('.sellers-page__filter-row').length).toBe(2);
    });

    it('render_loadingWithExistingSellers_keepsTilesAndShowsNoSkeleton', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      loadingSignal.set(true);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelector('p-skeleton')).toBeNull();
      expect(el.querySelector('p-scrollarea app-seller-card')).not.toBeNull();
    });

    describe('scroll position', () => {
      async function renderScrolledList(): Promise<{
        fixture: Awaited<ReturnType<typeof createPage>>['fixture'];
        scrollTop: () => number;
      }> {
        itemsSignal.set([buildCard()]);
        totalCountSignal.set(1);
        const { fixture } = await createPage();
        fixture.detectChanges();
        const viewport = (fixture.nativeElement as HTMLElement).querySelector(
          'p-scrollarea-viewport',
        ) as HTMLElement;
        let top = 500;
        Object.defineProperty(viewport, 'scrollTop', {
          configurable: true,
          get: () => top,
          set: (value: number) => {
            top = value;
          },
        });
        return { fixture, scrollTop: () => top };
      }

      it('filterChange_afterNewListArrives_scrollsKachellisteToTop', async () => {
        // Arrange
        const { fixture, scrollTop } = await renderScrolledList();

        // Act
        filtersSignal.set({ ...filtersSignal(), q: 'meier' });
        loadingSignal.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        const topWhileLoading = scrollTop();
        loadingSignal.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(topWhileLoading).toBe(500);
        expect(scrollTop()).toBe(0);
      });

      it('sortChange_afterNewListArrives_scrollsKachellisteToTop', async () => {
        // Arrange
        const { fixture, scrollTop } = await renderScrolledList();

        // Act
        filtersSignal.set({ ...filtersSignal(), sort: 'revenue' });
        loadingSignal.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        loadingSignal.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(scrollTop()).toBe(0);
      });

      it('loadMore_withoutFilterChange_keepsScrollPosition', async () => {
        // Arrange
        const { fixture, scrollTop } = await renderScrolledList();

        // Act
        loadingSignal.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        loadingSignal.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(scrollTop()).toBe(500);
      });
    });
  });
});
