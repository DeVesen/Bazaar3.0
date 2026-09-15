import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { FilterPanel, SellerOption, StatusOption } from './filter-panel';
import type { MasterDataItem } from '@shared/models/master-data-item';
import type { SellerTypeOption } from '@shared/models/seller-type-option';

const SELLER_TYPES: SellerTypeOption[] = [{ id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 }];

const EN_TRANSLATIONS = {
  filterPanel: {
    brandPlaceholder: 'Brand',
    categoryPlaceholder: 'Category',
    statusPlaceholder: 'Original/New',
    searchPlaceholder: 'Search...',
    searchButton: 'Search',
    filterButton: 'Filter'
  }
};

const STATUS_OPTIONS: StatusOption[] = [
  { label: 'Original', value: 'original' },
  { label: 'Neu', value: 'new' }
];

const BRANDS: MasterDataItem[] = [{ id: 'b1', name: 'Nike', original: true }];
const CATEGORIES: MasterDataItem[] = [{ id: 'c1', name: 'Jacken', original: true }];

function mockMatchMedia(matches: boolean) {
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  const mql = {
    matches,
    addEventListener: (_: 'change', listener: (event: MediaQueryListEvent) => void) => listeners.push(listener),
    removeEventListener: () => undefined
  } as unknown as MediaQueryList;
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    setMatches: (value: boolean) => listeners.forEach((listener) => listener({ matches: value } as MediaQueryListEvent))
  };
}

function create(sellerAutocomplete = false, sellerSearchFn?: (query: string) => Observable<SellerOption[]>, mobile = false) {
  const media = mockMatchMedia(mobile);
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const fixture = TestBed.createComponent(FilterPanel);
  fixture.componentRef.setInput('brands', BRANDS);
  fixture.componentRef.setInput('categories', CATEGORIES);
  fixture.componentRef.setInput('sellerAutocomplete', sellerAutocomplete);
  if (sellerSearchFn) {
    fixture.componentRef.setInput('sellerSearchFn', sellerSearchFn);
  }
  fixture.detectChanges();
  return { fixture, media };
}

function createCustom(opts: {
  brands?: MasterDataItem[];
  categories?: MasterDataItem[];
  statusOptions?: StatusOption[];
  sellerTypeOptions?: SellerTypeOption[];
  liveFilter?: boolean;
  mobile?: boolean;
}) {
  const media = mockMatchMedia(opts.mobile ?? false);
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const fixture = TestBed.createComponent(FilterPanel);
  if (opts.brands) {
    fixture.componentRef.setInput('brands', opts.brands);
  }
  if (opts.categories) {
    fixture.componentRef.setInput('categories', opts.categories);
  }
  if (opts.statusOptions) {
    fixture.componentRef.setInput('statusOptions', opts.statusOptions);
  }
  if (opts.sellerTypeOptions) {
    fixture.componentRef.setInput('sellerTypeOptions', opts.sellerTypeOptions);
  }
  if (opts.liveFilter !== undefined) {
    fixture.componentRef.setInput('liveFilter', opts.liveFilter);
  }
  fixture.detectChanges();
  return { fixture, media };
}

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not emit while typing in the free-text field', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.searchText.set('jack');

    expect(emitted.length).toBe(0);
  });

  it('does not emit when a brand or category is selected', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.brandValue.set('Nike');
    component.categoryValue.set('Jacken');

    expect(emitted.length).toBe(0);
  });

  it('emit() sends the current brand/category/search values', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.brandValue.set('Nike');
    component.categoryValue.set('Jacken');
    component.searchText.set('jack');

    component.emit();

    expect(emitted).toEqual([{ brand: 'Nike', category: 'Jacken', search: 'jack', sellerId: undefined }]);
  });

  it('emit() omits fields that are empty', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: undefined }]);
  });

  it('clicking the Suchen button triggers emit()', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.searchText.set('jack');

    fixture.debugElement.query(By.css('[data-testid="search-button"] button')).nativeElement.click();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: 'jack', sellerId: undefined }]);
  });

  it('does not render the seller autocomplete when sellerAutocomplete is false', () => {
    const { fixture } = create(false);
    expect(fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'))).toBeNull();
  });

  it('renders the seller autocomplete when sellerAutocomplete is true', () => {
    const { fixture } = create(true);
    expect(fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'))).not.toBeNull();
  });

  it('does not call sellerSearchFn before 2 characters are typed', () => {
    const searchFn = vi.fn(() => of<SellerOption[]>([]));
    const { fixture } = create(true, searchFn);

    fixture.componentInstance.onSellerFilter('a');
    vi.advanceTimersByTime(400);

    expect(searchFn).not.toHaveBeenCalled();
  });

  it('calls sellerSearchFn 400ms after typing 2+ characters, debounced', () => {
    const searchFn = vi.fn((_query: string) => of<SellerOption[]>([{ id: 's1', label: 'Max Mustermann (#42)' }]));
    const { fixture } = create(true, searchFn);

    fixture.componentInstance.onSellerFilter('an');
    fixture.componentInstance.onSellerFilter('ann');
    vi.advanceTimersByTime(399);
    expect(searchFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(searchFn).toHaveBeenCalledExactlyOnceWith('ann');
    expect(fixture.componentInstance.sellerSuggestions()).toEqual([{ id: 's1', label: 'Max Mustermann (#42)' }]);
  });

  it('onSellerSelect() sets the sellerId and immediately emits', () => {
    const { fixture } = create(true);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.onSellerSelect({ value: { id: 's1', label: 'Max Mustermann (#42)' } } as never);

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: 's1' }]);
  });

  it('onSellerClear() resets the sellerId and immediately emits', () => {
    const { fixture } = create(true);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.onSellerSelect({ value: { id: 's1', label: 'Max Mustermann (#42)' } } as never);
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.onSellerClear();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: undefined }]);
  });

  it('renders the seller autocomplete with forceSelection to prevent a stale sellerId', () => {
    const { fixture } = create(true);
    const autocomplete = fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'));

    expect(autocomplete.componentInstance.forceSelection()).toBe(true);
  });

  it('resolves to empty suggestions when sellerSearchFn errors, and keeps working for the next search', () => {
    const searchFn = vi.fn((query: string) =>
      query === 'ann' ? throwError(() => new Error('boom')) : of<SellerOption[]>([{ id: 's1', label: 'Max Mustermann (#42)' }])
    );
    const { fixture } = create(true, searchFn);

    fixture.componentInstance.onSellerFilter('ann');
    vi.advanceTimersByTime(400);
    expect(fixture.componentInstance.sellerSuggestions()).toEqual([]);

    fixture.componentInstance.onSellerFilter('max');
    vi.advanceTimersByTime(400);
    expect(fixture.componentInstance.sellerSuggestions()).toEqual([{ id: 's1', label: 'Max Mustermann (#42)' }]);
  });

  it('shows English placeholders and the search button label when the active language is English', () => {
    const { fixture } = create();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', EN_TRANSLATIONS);
    translate.use('en');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Search');
    const searchInput = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
    expect(searchInput.placeholder).toBe('Search...');
  });

  it('shows the filter fields inline and no filter button on a desktop-width viewport (>= 768px)', () => {
    const { fixture } = create(false, undefined, false);

    expect(fixture.debugElement.query(By.css('[data-testid="filter-button"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('p-select'))).not.toBeNull();
  });

  it('collapses the filter fields into a filter button on a mobile-width viewport (< 768px)', () => {
    const { fixture } = create(false, undefined, true);

    expect(fixture.debugElement.query(By.css('[data-testid="filter-button"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('p-select'))).toBeNull();
  });

  it('opens an overlay with the same filter fields when the filter button is clicked', () => {
    const { fixture } = create(false, undefined, true);

    fixture.debugElement.query(By.css('[data-testid="filter-button"] button')).nativeElement.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.overlayVisible()).toBe(true);
    expect(fixture.debugElement.query(By.css('p-select'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="search-button"]'))).not.toBeNull();
  });

  it('closes the overlay after a search is triggered from within it on mobile', () => {
    const { fixture } = create(false, undefined, true);
    const component = fixture.componentInstance;
    component.overlayVisible.set(true);
    fixture.detectChanges();

    component.emit();

    expect(component.overlayVisible()).toBe(false);
  });

  it('does not render a filter button or overlay when the viewport is desktop-width', () => {
    const { fixture } = create(false, undefined, false);

    expect(fixture.componentInstance.overlayVisible()).toBe(false);
    expect(fixture.debugElement.query(By.css('p-drawer'))).toBeNull();
  });

  it('opens the overlay as a bottom sheet (p-drawer, position bottom)', () => {
    const { fixture } = create(false, undefined, true);

    const drawer = fixture.debugElement.query(By.css('p-drawer'));

    expect(drawer).not.toBeNull();
    expect(drawer.componentInstance.position()).toBe('bottom');
  });

  it('switches from inline fields to the filter button when the viewport crosses the breakpoint', () => {
    const { fixture, media } = create(false, undefined, false);
    expect(fixture.debugElement.query(By.css('[data-testid="filter-button"]'))).toBeNull();

    media.setMatches(true);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="filter-button"]'))).not.toBeNull();
  });

  it('does not render brand/category selects when the inputs are omitted', () => {
    const { fixture } = createCustom({ statusOptions: STATUS_OPTIONS });

    expect(fixture.debugElement.query(By.css('[data-testid="status-select"]'))).not.toBeNull();
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(1);
  });

  it('renders the status select and includes it in emit() when statusOptions is set', () => {
    const { fixture } = createCustom({ statusOptions: STATUS_OPTIONS });
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.statusValue.set('original');
    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, status: 'original', search: undefined, sellerId: undefined }]);
  });

  it('renders the seller-type select and includes it in emit() when sellerTypeOptions is set', () => {
    const { fixture } = createCustom({ sellerTypeOptions: SELLER_TYPES });
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    expect(fixture.debugElement.query(By.css('[data-testid="seller-type-select"]'))).not.toBeNull();

    component.sellerTypeValue.set('t1');
    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, sellerTypeId: 't1', search: undefined, sellerId: undefined }]);
  });

  it('live filter mode: hides the Suchen button', () => {
    const { fixture } = createCustom({ statusOptions: STATUS_OPTIONS, liveFilter: true });

    expect(fixture.debugElement.query(By.css('[data-testid="search-button"]'))).toBeNull();
  });

  it('live filter mode: debounces free-text changes and auto-emits after 400ms', () => {
    const { fixture } = createCustom({ statusOptions: STATUS_OPTIONS, liveFilter: true });
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.searchText.set('nik');
    component.onSearchTextChange();
    vi.advanceTimersByTime(399);
    expect(emitted.length).toBe(0);
    vi.advanceTimersByTime(1);

    expect(emitted).toEqual([{ brand: undefined, category: undefined, status: undefined, search: 'nik', sellerId: undefined }]);
  });

  it('live filter mode: emits immediately when the status select changes', () => {
    const { fixture } = createCustom({ statusOptions: STATUS_OPTIONS, liveFilter: true });
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.statusValue.set('new');
    component.onFieldChange();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, status: 'new', search: undefined, sellerId: undefined }]);
  });

  it('non-live mode: selecting a field does not auto-emit', () => {
    const { fixture } = createCustom({ statusOptions: STATUS_OPTIONS });
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.statusValue.set('new');
    component.onFieldChange();

    expect(emitted.length).toBe(0);
  });
});
