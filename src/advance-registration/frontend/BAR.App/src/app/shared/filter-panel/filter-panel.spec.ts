import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FilterPanel } from './filter-panel';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

const BRANDS: MasterDataItem[] = [{ id: 'b1', name: 'Nike', original: true }];
const CATEGORIES: MasterDataItem[] = [{ id: 'c1', name: 'Jacken', original: true }];

function create() {
  const fixture = TestBed.createComponent(FilterPanel);
  fixture.componentRef.setInput('brands', BRANDS);
  fixture.componentRef.setInput('categories', CATEGORIES);
  fixture.detectChanges();
  return fixture;
}

describe('FilterPanel', () => {
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

    expect(emitted).toEqual([{ brand: 'Nike', category: 'Jacken', search: 'jack' }]);
  });

  it('emit() omits fields that are empty', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined }]);
  });

  it('clicking the Suchen button triggers emit()', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.searchText.set('jack');

    fixture.debugElement.query(By.css('[data-testid="search-button"] button')).nativeElement.click();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: 'jack' }]);
  });
});
