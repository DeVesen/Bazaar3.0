import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { ArtikelDialog } from './artikel-dialog';
import { ArticlesApiService, CreateArticleResponse } from '../articles-api.service';

function create() {
  const fixture = TestBed.createComponent(ArtikelDialog);
  fixture.componentRef.setInput('mode', 'create');
  fixture.componentRef.setInput('article', null);
  fixture.componentRef.setInput('initialNumber', 104);
  fixture.componentRef.setInput('brands', []);
  fixture.componentRef.setInput('categories', []);
  fixture.componentRef.setInput('visible', true);
  fixture.detectChanges();
  return fixture;
}

describe('ArtikelDialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  });

  it('isValid() is false when a required field is empty', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.name.set('');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(5);

    expect(component.isValid()).toBe(false);
  });

  it('isValid() is false when price is not greater than 0', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.name.set('Jacke');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(0);

    expect(component.isValid()).toBe(false);
  });

  it('isValid() is true when all required fields are filled and price > 0', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    component.name.set('Jacke');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(5);

    expect(component.isValid()).toBe(true);
  });

  it('save() in create mode posts via ArticlesApiService and emits saved on success', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104, nextNumber: 105 } as unknown as CreateArticleResponse));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);
    const emitted: void[] = [];
    component.saved.subscribe(() => emitted.push(undefined));

    component.save();

    expect(emitted.length).toBe(1);
    expect(component.visible()).toBe(false);
  });

  it('save() on 409 keeps the dialog open and sets errorMessage', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105' } })));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);

    component.save();

    expect(component.visible()).toBe(true);
    expect(component.errorMessage()).toBe('Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105');
  });

  it('confirmDelete() deletes via ArticlesApiService and emits deleted', () => {
    const fixture = create();
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('article', { id: 'a1', number: 104, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5 } as never);
    fixture.detectChanges();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    const component = fixture.componentInstance;
    const emitted: void[] = [];
    component.deleted.subscribe(() => emitted.push(undefined));

    component.confirmDelete();

    expect(emitted.length).toBe(1);
    expect(component.visible()).toBe(false);
  });
});
