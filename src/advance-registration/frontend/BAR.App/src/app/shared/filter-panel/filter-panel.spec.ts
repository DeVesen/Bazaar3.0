import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FilterPanel } from './filter-panel';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

const BRANDS: MasterDataItem[] = [{ id: 'b1', name: 'Nike', original: true }];
const CATEGORIES: MasterDataItem[] = [{ id: 'c1', name: 'Jacken', original: true }];

function create(sellerAutocomplete = false) {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const fixture = TestBed.createComponent(FilterPanel);
  fixture.componentRef.setInput('brands', BRANDS);
  fixture.componentRef.setInput('categories', CATEGORIES);
  fixture.componentRef.setInput('sellerAutocomplete', sellerAutocomplete);
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

  it('does not request suggestions before 2 characters are typed', () => {
    const fixture = create(true);
    const httpMock = TestBed.inject(HttpTestingController);

    fixture.componentInstance.onSellerFilter('a');
    vi.advanceTimersByTime(400);

    httpMock.expectNone((r) => r.url === '/api/sellers');
  });

  it('requests suggestions 400ms after typing 2+ characters, debounced', () => {
    const fixture = create(true);
    const httpMock = TestBed.inject(HttpTestingController);

    fixture.componentInstance.onSellerFilter('an');
    fixture.componentInstance.onSellerFilter('ann');
    vi.advanceTimersByTime(399);
    httpMock.expectNone((r) => r.url === '/api/sellers');
    vi.advanceTimersByTime(1);

    const req = httpMock.expectOne((r) => r.url === '/api/sellers');
    expect(req.request.params.get('search')).toBe('ann');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ items: [{ id: 's1', startNumber: 42, firstName: 'Max', lastName: 'Mustermann' }], totalCount: 1, page: 1, pageSize: 10 });

    expect(fixture.componentInstance.sellerSuggestions()).toEqual([{ id: 's1', label: 'Max Mustermann (#42)' }]);
  });

  it('onSellerSelect() sets the sellerId used by emit()', () => {
    const fixture = create(true);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.onSellerSelect({ value: { id: 's1', label: 'Max Mustermann (#42)' } } as never);
    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: 's1' }]);
  });
});
