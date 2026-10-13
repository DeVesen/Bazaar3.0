import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Tooltip } from 'primeng/tooltip';
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
import { ArticleImportApi } from '../../data/article-import-api';

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
  let showSkeletonSignal: ReturnType<typeof signal<boolean>>;
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
    showSkeletonSignal = signal(false);
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
            showSkeleton: showSkeletonSignal,
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
        { provide: ArticleImportApi, useValue: { importArticles: vi.fn() } },
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

  describe('sort filter', () => {
    it('onSortChange_sortSelected_callsSetFiltersImmediatelyWithoutDebounce', async () => {
      // Arrange
      const { component } = await createPage();
      setFilters.mockClear();

      // Act
      component.onSortChange('acceptedValue');

      // Assert
      expect(setFilters).toHaveBeenCalledWith({ sort: 'acceptedValue' });
    });
  });

  describe('filter chips', () => {
    it('template_noFilterActive_rendersNoChips', async () => {
      // Arrange
      filtersSignal.set({ q: '', status: null, sort: 'name' });

      // Act
      const { fixture } = await createPage();

      // Assert
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.sellers-page__chips')).toBeNull();
      expect(el.querySelectorAll('p-chip').length).toBe(0);
    });

    it('template_searchAndStatusActive_rendersRemovableChipsDirectlyBelowToolbar', async () => {
      // Arrange
      filtersSignal.set({ q: 'mei', status: 'open', sort: 'name' });

      // Act
      const { fixture } = await createPage();

      // Assert
      const el: HTMLElement = fixture.nativeElement;
      const toolbar = el.querySelector('p-toolbar.sellers-page__toolbar');
      const chips = el.querySelector('.sellers-page__chips');
      expect(toolbar?.nextElementSibling).toBe(chips);
      expect(chips?.querySelectorAll('p-chip').length).toBe(2);
      expect(chips?.textContent).toContain('Suche: mei');
      expect(chips?.textContent).toContain('Status: Offen');
      expect(chips?.querySelectorAll('.p-chip-remove-icon').length).toBe(2);
    });
  });

  describe('empty states', () => {
    it('shows the "no sellers at all" copy when totalCount is 0 and no filters are active', async () => {
      totalCountSignal.set(0);
      const { fixture } = await createPage();

      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).toContain('Noch keine Verkäufer.');
      expect(text).toContain('Einstellungen → Import');
      expect(text).toContain('+-Button');
      expect(text).not.toContain('+ Neu');
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

  describe('loading skeleton', () => {
    const SKELETON = 'app-seller-card-skeleton';
    const CARD = 'app-seller-card';

    function count(fixture: { nativeElement: unknown }, selector: string): number {
      return (fixture.nativeElement as HTMLElement).querySelectorAll(selector).length;
    }

    async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    function twoCards(): void {
      itemsSignal.set([buildCard({ id: 's1' }), buildCard({ id: 's2' })]);
      totalCountSignal.set(2);
    }

    it('render_firstOpenWhileLoading_showsSixPlaceholderCardsAndNoCards', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);

      // Act
      const { fixture } = await createPage();

      // Assert
      expect(count(fixture, SKELETON)).toBe(6);
      expect(count(fixture, CARD)).toBe(0);
    });

    it('render_listLoaded_replacesPlaceholdersWithCards', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();

      // Act
      twoCards();
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(0);
      expect(count(fixture, CARD)).toBe(2);
    });

    it('render_filterChangeWithCardsShown_replacesCardsWithSixPlaceholders', async () => {
      // Arrange
      twoCards();
      const { fixture } = await createPage();
      expect(count(fixture, CARD)).toBe(2);

      // Act
      loadingSignal.set(true);
      showSkeletonSignal.set(true);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(6);
      expect(count(fixture, CARD)).toBe(0);
    });

    it('render_backgroundRefreshWithoutSkeleton_keepsSameCardsAndListElement', async () => {
      // Arrange
      twoCards();
      const { fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;
      const listBefore = host.querySelector('.sellers-page__list');
      const cardBefore = host.querySelector(CARD);

      // Act
      loadingSignal.set(true);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(0);
      expect(count(fixture, CARD)).toBe(2);
      expect(host.querySelector('.sellers-page__list')).toBe(listBefore);
      expect(host.querySelector(CARD)).toBe(cardBefore);
    });

    it('onLoadMore_atListEnd_keepsExistingCardsAndShowsNoPlaceholders', async () => {
      // Arrange
      twoCards();
      hasMoreSignal.set(true);
      const { component, fixture } = await createPage();
      const cardBefore = (fixture.nativeElement as HTMLElement).querySelector(CARD);

      // Act
      component.onLoadMore();
      loadingSignal.set(true);
      await settle(fixture);

      // Assert
      expect(loadMore).toHaveBeenCalledTimes(1);
      expect(count(fixture, SKELETON)).toBe(0);
      expect(count(fixture, CARD)).toBe(2);
      expect((fixture.nativeElement as HTMLElement).querySelector(CARD)).toBe(cardBefore);
    });

    it('render_emptyResultWithoutFilters_showsNoSellersHintInsteadOfPlaceholders', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();
      expect(count(fixture, SKELETON)).toBe(6);

      // Act
      totalCountSignal.set(0);
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(count(fixture, SKELETON)).toBe(0);
      expect(text).toContain('Noch keine Verkäufer.');
    });

    it('render_emptyResultWithActiveFilter_showsNoResultsHintInsteadOfPlaceholders', async () => {
      // Arrange
      filtersSignal.set({ q: 'xyz', status: null, sort: 'name' });
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();
      expect(count(fixture, SKELETON)).toBe(6);

      // Act
      totalCountSignal.set(0);
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(count(fixture, SKELETON)).toBe(0);
      expect(text).toContain('Keine Verkäufer für die gewählten Filter.');
    });

    it('render_skeletonVisible_keepsFilterControlsUsableAndSearchFieldFocused', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { component, fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;
      const search = host.querySelector('input[type="text"]') as HTMLInputElement;
      search.focus();

      // Act
      search.value = 'ma';
      search.dispatchEvent(new Event('input'));
      await settle(fixture);

      // Assert
      expect(host.querySelector('input[type="text"]')).toBe(search);
      expect(document.activeElement).toBe(search);
      expect(component.qInput()).toBe('ma');
      expect(host.querySelectorAll('.sellers-page p-select').length).toBe(2);
      const newButton = host.querySelector<HTMLButtonElement>('button[aria-label="Neuer Verkäufer"]');
      expect(newButton).not.toBeNull();
      newButton?.click();
      expect(component.dialogVisible()).toBe(true);
    });

    it('render_loadFailsWhileSkeletonShown_removesPlaceholdersWithoutNewMessage', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();

      // Act
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(0);
      expect(messageServiceAdd).not.toHaveBeenCalled();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('Noch keine Verkäufer.');
    });

    it('render_noSkeleton_hasPermanentEmptyLiveRegion', async () => {
      // Arrange + Act
      const { fixture } = await createPage();

      // Assert
      const regions = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="status"]');
      expect(regions.length).toBe(1);
      expect(regions[0].classList.contains('sellers-page__sr-only')).toBe(true);
      expect(regions[0].textContent?.trim()).toBe('');
    });

    it('render_skeletonVisible_liveRegionAnnouncesLoadingAndEmptiesAgain', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;
      expect(host.querySelector('[role="status"]')?.textContent?.trim()).toBe('Verkäufer werden geladen');

      // Act
      showSkeletonSignal.set(false);
      loadingSignal.set(false);
      await settle(fixture);

      // Assert
      expect(host.querySelectorAll('[role="status"]').length).toBe(1);
      expect(host.querySelector('[role="status"]')?.textContent?.trim()).toBe('');
      expect(host.textContent).not.toContain('Verkäufer werden geladen');
    });

    it('render_skeletonToggles_liveRegionStaysSameDomElement', async () => {
      // Arrange
      const { fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;
      const before = host.querySelector('[role="status"]');

      // Act
      showSkeletonSignal.set(true);
      await settle(fixture);
      const during = host.querySelector('[role="status"]');
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      expect(during).toBe(before);
      expect(host.querySelector('[role="status"]')).toBe(before);
    });

    it('render_skeletonVisible_skeletonContainerHasNoOwnStatusRole', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      const { fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;

      // Assert
      expect(host.querySelectorAll('[role="status"]').length).toBe(1);
      expect(host.querySelector('.sellers-page__list [role="status"]')).toBeNull();
      expect(host.querySelector('.sellers-page__list .sellers-page__sr-only')).toBeNull();
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

  describe('article import', () => {
    const IMPORT_BUTTON = 'button[aria-label="Importieren"]';

    it('render_AdminWithCard_ShowsImportButtonOnCard', async () => {
      // Arrange
      isAdminSignal.set(true);
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON)).not.toBeNull();
    });

    it('render_NonAdminWithCard_ShowsNoImportButton', async () => {
      // Arrange
      isAdminSignal.set(false);
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();

      // Assert
      expect((fixture.nativeElement as HTMLElement).querySelector(IMPORT_BUTTON)).toBeNull();
    });

    it('onImportArticles_Card_OpensImportDialogForThatSellerWithoutOpeningDetailModal', async () => {
      // Arrange
      const { component } = await createPage();

      // Act
      component.onImportArticles(buildCard({ id: 's1' }));

      // Assert
      expect(component.articleImportVisible()).toBe(true);
      expect(component.articleImportSellerId()).toBe('s1');
      expect(component.detailModalVisible()).toBe(false);
    });

    it('onArticleImportVisibleChange_False_ClosesDialogAndClearsSellerId', async () => {
      // Arrange
      const { component } = await createPage();
      component.onImportArticles(buildCard({ id: 's1' }));

      // Act
      component.onArticleImportVisibleChange(false);

      // Assert
      expect(component.articleImportVisible()).toBe(false);
      expect(component.articleImportSellerId()).toBeNull();
    });

    it('onArticlesImported_Count_ReloadsListAndShowsCountInToast', async () => {
      // Arrange
      const { component } = await createPage();
      load.mockClear();

      // Act
      component.onArticlesImported(3);

      // Assert
      expect(load).toHaveBeenCalled();
      expect(messageServiceAdd).toHaveBeenCalledWith(
        expect.objectContaining({ severity: 'success', summary: '✓ 3 Artikel importiert' }),
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
    it('renders "Verkäufer" as page title in fill mode with an empty actions area', async () => {
      const { fixture } = await createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Verkäufer');
      expect(el.querySelector('app-page')?.classList).toContain('page--fill');
      expect(el.querySelector('.page__actions')?.children.length).toBe(0);
    });

    describe('filter toolbar', () => {
      async function renderToolbar(): Promise<{
        fixture: ComponentFixture<SellersPage>;
        component: SellersPage;
        el: HTMLElement;
        toolbar: HTMLElement;
      }> {
        const { fixture, component } = await createPage();
        const el: HTMLElement = fixture.nativeElement;
        const toolbar = el.querySelector<HTMLElement>('.sellers-page > p-toolbar.sellers-page__toolbar');
        if (!toolbar) throw new Error('sellers-page__toolbar not rendered');
        return { fixture, component, el, toolbar };
      }

      it('template_pageOpened_rendersAllControlsInOneToolbarInOrder', async () => {
        // Arrange
        // Act
        const { el, toolbar } = await renderToolbar();

        // Assert
        const children = Array.from(toolbar.children).map((child) => child.tagName.toLowerCase());
        expect(children).toEqual(['p-button', 'p-iconfield', 'p-select', 'p-select']);
        expect(el.querySelectorAll('.sellers-page__filter-row').length).toBe(0);
        expect(el.querySelectorAll('p-toolbar').length).toBe(1);
      });

      it('template_pageOpened_rendersIconOnlyAddButtonWithoutText', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const button = toolbar.querySelector<HTMLButtonElement>('p-button button');
        expect(button).not.toBeNull();
        expect(button?.textContent?.trim()).toBe('');
        expect(button?.querySelector('.pi-plus')).not.toBeNull();
      });

      it('template_pageOpened_labelsAddButtonNeuerVerkaeuferForHoverAndScreenreader', async () => {
        // Arrange
        // Act
        const { fixture, toolbar } = await renderToolbar();

        // Assert
        expect(
          toolbar.querySelector('p-button button')?.getAttribute('aria-label'),
        ).toBe('Neuer Verkäufer');
        const buttonHost = fixture.debugElement.query(By.css('p-toolbar p-button'));
        expect(buttonHost.injector.get(Tooltip).content()).toBe('Neuer Verkäufer');
      });

      it('onNewClick_addButtonClicked_opensCreateDialog', async () => {
        // Arrange
        const { fixture, component, toolbar } = await renderToolbar();

        // Act
        toolbar.querySelector<HTMLButtonElement>('p-button button')?.click();
        await fixture.whenStable();

        // Assert
        expect(component.dialogVisible()).toBe(true);
        expect(component.dialogMode()).toBe('create');
      });

      it('template_pageOpened_showsSearchPlaceholderInsideToolbar', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const input = toolbar.querySelector<HTMLInputElement>('p-iconfield input');
        expect(input?.getAttribute('placeholder')).toBe('Suche nach Name, Ort …');
      });

      it('template_pageOpened_namesSelectsSortierungThenStatusForScreenreader', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const names = Array.from(toolbar.querySelectorAll('p-select [role="combobox"]')).map(
          (combobox) => combobox.getAttribute('aria-label'),
        );
        expect(names).toEqual(['Sortierung', 'Status']);
      });

      it('template_pageOpened_rendersNoVisibleLabels', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        expect(toolbar.querySelectorAll('label').length).toBe(0);
        expect(toolbar.querySelector('p-button .p-button-label')).toBeNull();
      });

      it('template_pageOpened_marksSearchAndBothSelectsWithLayoutClasses', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const search = toolbar.querySelector('p-iconfield');
        const selects = Array.from(toolbar.querySelectorAll(':scope > p-select'));
        expect(search?.classList).toContain('sellers-page__search');
        expect(selects.length).toBe(2);
        for (const select of selects) {
          expect(select.classList).toContain('sellers-page__select');
        }
      });

      it('styles_pageOpened_searchGrowsSelectsKeepMinWidthAndToolbarWraps', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        expect(getComputedStyle(toolbar).flexWrap).toBe('wrap');
        const search = toolbar.querySelector<HTMLElement>('p-iconfield.sellers-page__search');
        if (!search) throw new Error('sellers-page__search not rendered');
        expect(getComputedStyle(search).flexGrow).toBe('1');
        const selects = Array.from(
          toolbar.querySelectorAll<HTMLElement>(':scope > p-select.sellers-page__select'),
        );
        expect(selects.length).toBe(2);
        for (const select of selects) {
          const style = getComputedStyle(select);
          expect(style.minWidth).toBe('150px');
          expect(style.flexGrow).toBe('0');
          expect(style.flexShrink).toBe('0');
        }
      });
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

    it('render_withSellers_keepsToolbarOutsideScrollArea', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelectorAll('p-toolbar').length).toBe(1);
      expect(el.querySelector('p-scrollarea p-toolbar')).toBeNull();
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

    it('render_loadingWithoutSellers_showsSkeletonTilesInsideScrollAreaAndKeepsToolbar', async () => {
      // Arrange
      loadingSignal.set(true);
      showSkeletonSignal.set(true);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(
        el.querySelectorAll('p-scrollarea p-scrollarea-content app-seller-card-skeleton').length,
      ).toBe(6);
      expect(el.querySelector('app-seller-card')).toBeNull();
      expect(el.querySelector('.sellers-page__sentinel')).toBeNull();
      expect(el.querySelectorAll('p-toolbar').length).toBe(1);
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
      expect(el.querySelector('app-seller-card-skeleton')).toBeNull();
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
