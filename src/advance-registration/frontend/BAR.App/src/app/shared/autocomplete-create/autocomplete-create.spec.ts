import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { AutocompleteCreate } from './autocomplete-create';
import type { MasterDataItem } from '@shared/models/master-data-item';

const ITEMS: MasterDataItem[] = [
  { id: 'b1', name: 'Nike', original: true },
  { id: 'b2', name: 'Adidas', original: false }
];

const DE_TRANSLATIONS = {
  common: { cancel: 'Abbrechen', create: 'Anlegen' },
  autocompleteCreate: {
    dialogHeaderPrefix: 'Neuer Eintrag: ',
    conflict: 'Eintrag existiert bereits',
    createFailed: 'Anlegen fehlgeschlagen'
  }
};

const EN_TRANSLATIONS = {
  common: { cancel: 'Cancel', create: 'Create' },
  autocompleteCreate: {
    dialogHeaderPrefix: 'New entry: ',
    conflict: 'Entry already exists',
    createFailed: 'Create failed'
  }
};

function create(items: MasterDataItem[] = ITEMS) {
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.setTranslation('en', EN_TRANSLATIONS);
  translate.use('de');
  const fixture = TestBed.createComponent(AutocompleteCreate);
  fixture.componentRef.setInput('items', items);
  fixture.componentRef.setInput('createFn', vi.fn());
  fixture.detectChanges();
  return { fixture, translate };
}

describe('AutocompleteCreate', () => {
  it('filters suggestions case-insensitively by typed query', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;

    component.onFilter('nik');

    expect(component.suggestions()).toEqual([ITEMS[0]]);
  });

  it('shows all items when query is empty', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;

    component.onFilter('');

    expect(component.suggestions()).toEqual(ITEMS);
  });

  it('isCreateMode() is false for an exact existing match', () => {
    const { fixture } = create();
    fixture.componentInstance.value.set('Nike');

    expect(fixture.componentInstance.isCreateMode()).toBe(false);
  });

  it('isCreateMode() is false for a value matching an existing item only differing in case', () => {
    const { fixture } = create();
    fixture.componentInstance.value.set('nike');

    expect(fixture.componentInstance.isCreateMode()).toBe(false);
  });

  it('isCreateMode() is true for a value with no exact match', () => {
    const { fixture } = create();
    fixture.componentInstance.value.set('Puma');

    expect(fixture.componentInstance.isCreateMode()).toBe(true);
  });

  it('isCreateMode() is false for an empty value', () => {
    const { fixture } = create();
    fixture.componentInstance.value.set('');

    expect(fixture.componentInstance.isCreateMode()).toBe(false);
  });

  it('confirmCreate() calls createFn, emits itemCreated and sets value to the new name', () => {
    const { fixture } = create();
    const created: MasterDataItem = { id: 'b3', name: 'Puma', original: false };
    fixture.componentRef.setInput('createFn', () => of(created));
    fixture.componentInstance.value.set('Puma');
    const emitted: MasterDataItem[] = [];
    fixture.componentInstance.itemCreated.subscribe((i) => emitted.push(i));

    fixture.componentInstance.openCreateModal();
    fixture.componentInstance.confirmCreate();

    expect(emitted).toEqual([created]);
    expect(fixture.componentInstance.value()).toBe('Puma');
    expect(fixture.componentInstance.createModalOpen()).toBe(false);
  });

  it('confirmCreate() on 409 shows an error in the modal and keeps it open', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('createFn', () =>
      throwError(() => ({ status: 409, error: { detail: 'Puma existiert bereits' } })));
    fixture.componentInstance.value.set('Puma');

    fixture.componentInstance.openCreateModal();
    fixture.componentInstance.confirmCreate();

    expect(fixture.componentInstance.createModalOpen()).toBe(true);
    expect(fixture.componentInstance.createModalError()).toBe('Puma existiert bereits');
  });

  it('confirmCreate() on 409 without detail falls back to the translated conflict message', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('createFn', () => throwError(() => ({ status: 409 })));
    fixture.componentInstance.value.set('Puma');

    fixture.componentInstance.openCreateModal();
    fixture.componentInstance.confirmCreate();

    expect(fixture.componentInstance.createModalError()).toBe('Eintrag existiert bereits');
  });

  it('confirmCreate() on a non-409 error shows the translated generic create-failed message', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('createFn', () => throwError(() => ({ status: 500 })));
    fixture.componentInstance.value.set('Puma');

    fixture.componentInstance.openCreateModal();
    fixture.componentInstance.confirmCreate();

    expect(fixture.componentInstance.createModalError()).toBe('Anlegen fehlgeschlagen');
  });

  it('shows English button labels when the active language is English', () => {
    const { fixture, translate } = create();
    fixture.componentInstance.value.set('Puma');
    fixture.componentInstance.openCreateModal();
    translate.use('en');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Cancel');
    expect(text).toContain('Create');
    expect(text).toContain('New entry: Puma');
  });

  it('dialogHeader re-evaluates when the active language changes after render', () => {
    const { fixture, translate } = create();
    fixture.componentInstance.value.set('Puma');
    fixture.componentInstance.openCreateModal();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Neuer Eintrag: Puma');

    translate.use('en');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('New entry: Puma');
  });
});
