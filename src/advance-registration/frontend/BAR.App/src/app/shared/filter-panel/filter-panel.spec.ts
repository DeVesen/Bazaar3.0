import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { FilterPanel, SellerOption } from './filter-panel';
import type { MasterDataItem } from '@shared/models/master-data-item';

const EN_TRANSLATIONS = {
  filterPanel: {
    brandPlaceholder: 'Brand',
    categoryPlaceholder: 'Category',
    searchPlaceholder: 'Search...',
    searchButton: 'Search'
  }
};

const BRANDS: MasterDataItem[] = [{ id: 'b1', name: 'Nike', original: true }];
const CATEGORIES: MasterDataItem[] = [{ id: 'c1', name: 'Jacken', original: true }];

function create(sellerAutocomplete = false, sellerSearchFn?: (query: string) => Observable<SellerOption[]>) {
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const fixture = TestBed.createComponent(FilterPanel);
  fixture.componentRef.setInput('brands', BRANDS);
  fixture.componentRef.setInput('categories', CATEGORIES);
  fixture.componentRef.setInput('sellerAutocomplete', sellerAutocomplete);
  if (sellerSearchFn) {
    fixture.componentRef.setInput('sellerSearchFn', sellerSearchFn);
  }
  fixture.detectChanges();
  return fixture;
}

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not emit while typing in the free-text field', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.searchText.set('jack');

    expect(emitted.length).toBe(0);
  });

  it('does not emit when a brand or category is selected', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.brandValue.set('Nike');
    component.categoryValue.set('Jacken');

    expect(emitted.length).toBe(0);
  });

  it('emit() sends the current brand/category/search values', () => {
    const fixture = create();
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
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: undefined }]);
  });

  it('clicking the Suchen button triggers emit()', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.searchText.set('jack');

    fixture.debugElement.query(By.css('[data-testid="search-button"] button')).nativeElement.click();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: 'jack', sellerId: undefined }]);
  });

  it('does not render the seller autocomplete when sellerAutocomplete is false', () => {
    const fixture = create(false);
    expect(fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'))).toBeNull();
  });

  it('renders the seller autocomplete when sellerAutocomplete is true', () => {
    const fixture = create(true);
    expect(fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'))).not.toBeNull();
  });

  it('does not call sellerSearchFn before 2 characters are typed', () => {
    const searchFn = vi.fn(() => of<SellerOption[]>([]));
    const fixture = create(true, searchFn);

    fixture.componentInstance.onSellerFilter('a');
    vi.advanceTimersByTime(400);

    expect(searchFn).not.toHaveBeenCalled();
  });

  it('calls sellerSearchFn 400ms after typing 2+ characters, debounced', () => {
    const searchFn = vi.fn((_query: string) => of<SellerOption[]>([{ id: 's1', label: 'Max Mustermann (#42)' }]));
    const fixture = create(true, searchFn);

    fixture.componentInstance.onSellerFilter('an');
    fixture.componentInstance.onSellerFilter('ann');
    vi.advanceTimersByTime(399);
    expect(searchFn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);

    expect(searchFn).toHaveBeenCalledExactlyOnceWith('ann');
    expect(fixture.componentInstance.sellerSuggestions()).toEqual([{ id: 's1', label: 'Max Mustermann (#42)' }]);
  });

  it('onSellerSelect() sets the sellerId and immediately emits', () => {
    const fixture = create(true);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.onSellerSelect({ value: { id: 's1', label: 'Max Mustermann (#42)' } } as never);

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: 's1' }]);
  });

  it('onSellerClear() resets the sellerId and immediately emits', () => {
    const fixture = create(true);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.onSellerSelect({ value: { id: 's1', label: 'Max Mustermann (#42)' } } as never);
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.onSellerClear();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: undefined }]);
  });

  it('renders the seller autocomplete with forceSelection to prevent a stale sellerId', () => {
    const fixture = create(true);
    const autocomplete = fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'));

    expect(autocomplete.componentInstance.forceSelection()).toBe(true);
  });

  it('resolves to empty suggestions when sellerSearchFn errors, and keeps working for the next search', () => {
    const searchFn = vi.fn((query: string) =>
      query === 'ann' ? throwError(() => new Error('boom')) : of<SellerOption[]>([{ id: 's1', label: 'Max Mustermann (#42)' }])
    );
    const fixture = create(true, searchFn);

    fixture.componentInstance.onSellerFilter('ann');
    vi.advanceTimersByTime(400);
    expect(fixture.componentInstance.sellerSuggestions()).toEqual([]);

    fixture.componentInstance.onSellerFilter('max');
    vi.advanceTimersByTime(400);
    expect(fixture.componentInstance.sellerSuggestions()).toEqual([{ id: 's1', label: 'Max Mustermann (#42)' }]);
  });

  it('shows English placeholders and the search button label when the active language is English', () => {
    const fixture = create();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', EN_TRANSLATIONS);
    translate.use('en');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Search');
    const searchInput = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
    expect(searchInput.placeholder).toBe('Search...');
  });
});
