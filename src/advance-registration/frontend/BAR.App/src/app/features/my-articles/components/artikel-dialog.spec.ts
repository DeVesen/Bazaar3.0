import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ArtikelDialog } from './artikel-dialog';
import { ArticlesApiService, CreateArticleResponse } from '../articles-api.service';

const DE_TRANSLATIONS = {
  common: { cancel: 'Abbrechen', save: 'Speichern', create: 'Anlegen', delete: 'Löschen', edit: 'Bearbeiten', ok: 'OK' },
  articleDialog: {
    createHeader: 'Artikel anlegen',
    editHeader: 'Artikel bearbeiten',
    number: 'Artikelnummer',
    numberHint: 'wird beim Speichern endgültig vergeben',
    name: 'Bezeichnung',
    category: 'Kategorie',
    brand: 'Marke',
    size: 'Größe',
    color: 'Farbe',
    price: 'Preis',
    description: 'Beschreibung',
    deleteConfirmHeader: 'Artikel wirklich löschen?',
    saveAndCopyTooltip: 'Artikel speichern und einen weiteren mit denselben Werten anlegen',
    saveAndCopy: 'Speichern + kopieren',
    conflictHeader: 'Artikelnummer bereits vergeben',
    noFreeNumber: 'Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren',
    savedAndCopied: '✓ Artikel {{number}} gespeichert — nächste Nummer: {{nextNumber}}',
    saveFailed: 'Speichern fehlgeschlagen',
    deleteFailed: 'Löschen fehlgeschlagen'
  },
  autocompleteCreate: { dialogHeaderPrefix: 'Neuer Eintrag: ', conflict: 'Eintrag existiert bereits', createFailed: 'Anlegen fehlgeschlagen' }
};

const EN_TRANSLATIONS = {
  common: { cancel: 'Cancel', save: 'Save', create: 'Create', delete: 'Delete', edit: 'Edit', ok: 'OK' },
  articleDialog: {
    createHeader: 'Create article',
    editHeader: 'Edit article',
    number: 'Article number',
    numberHint: 'assigned permanently on save',
    name: 'Name',
    category: 'Category',
    brand: 'Brand',
    size: 'Size',
    color: 'Color',
    price: 'Price',
    description: 'Description',
    deleteConfirmHeader: 'Really delete this article?',
    saveAndCopyTooltip: 'Save the article and create another one with the same values',
    saveAndCopy: 'Save + copy',
    conflictHeader: 'Article number already taken',
    noFreeNumber: 'No free article number available — please contact the admin',
    savedAndCopied: '✓ Article {{number}} saved — next number: {{nextNumber}}',
    saveFailed: 'Save failed',
    deleteFailed: 'Delete failed'
  },
  autocompleteCreate: { dialogHeaderPrefix: 'New entry: ', conflict: 'Entry already exists', createFailed: 'Create failed' }
};

function create() {
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.setTranslation('en', EN_TRANSLATIONS);
  translate.use('de');
  const fixture = TestBed.createComponent(ArtikelDialog);
  fixture.componentRef.setInput('mode', 'create');
  fixture.componentRef.setInput('article', null);
  fixture.componentRef.setInput('initialNumber', 104);
  fixture.componentRef.setInput('brands', []);
  fixture.componentRef.setInput('categories', []);
  fixture.componentRef.setInput('visible', true);
  fixture.detectChanges();
  return { fixture, translate };
}

describe('ArtikelDialog', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), MessageService] });
  });

  it('isValid() is false when a required field is empty', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    component.name.set('');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(5);

    expect(component.isValid()).toBe(false);
  });

  it('isValid() is false when price is not greater than 0', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    component.name.set('Jacke');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(0);

    expect(component.isValid()).toBe(false);
  });

  it('isValid() is true when all required fields are filled and price > 0', () => {
    const { fixture } = create();
    const component = fixture.componentInstance;
    component.name.set('Jacke');
    component.brand.set('Nike');
    component.category.set('Jacken');
    component.price.set(5);

    expect(component.isValid()).toBe(true);
  });

  it('save() in create mode posts via ArticlesApiService and emits saved on success', () => {
    const { fixture } = create();
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

  it('save() on 409 keeps the main dialog open and shows the number-conflict dialog', () => {
    const { fixture } = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105', nextNumber: 105 } })));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);

    component.save();

    expect(component.visible()).toBe(true);
    expect(component.conflictDialogVisible()).toBe(true);
    expect(component.conflictMessage()).toBe('Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105');
    expect(component.number()).toBe(105);
  });

  it('saveAndCopy() with nextNumber keeps the dialog open, keeps all field values and updates the number', () => {
    const { fixture } = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104, nextNumber: 105 } as unknown as CreateArticleResponse));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const component = fixture.componentInstance;
    component.name.set('Body langarm'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);

    component.saveAndCopy();

    expect(component.visible()).toBe(true);
    expect(component.name()).toBe('Body langarm');
    expect(component.brand()).toBe('Nike');
    expect(component.number()).toBe(105);
    expect(component.errorMessage()).toBeNull();
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success', summary: '✓ Artikel 104 gespeichert — nächste Nummer: 105'
    }));
  });

  it('saveAndCopy() with nextNumber focuses and selects the Bezeichnung input', async () => {
    const { fixture } = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104, nextNumber: 105 } as unknown as CreateArticleResponse));
    const component = fixture.componentInstance;
    component.name.set('Body langarm'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);
    const nameInputEl = (component as unknown as { nameInput: () => { nativeElement: HTMLInputElement } | undefined })
      .nameInput()!.nativeElement;
    const selectSpy = vi.spyOn(nameInputEl, 'select');

    component.saveAndCopy();
    await Promise.resolve();

    expect(selectSpy).toHaveBeenCalled();
  });

  it('saveAndCopy() without nextNumber closes the dialog and keeps it saved', () => {
    const { fixture } = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104 } as unknown as CreateArticleResponse));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const component = fixture.componentInstance;
    component.name.set('Body'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);
    const emitted: void[] = [];
    component.saved.subscribe(() => emitted.push(undefined));

    component.saveAndCopy();

    expect(emitted.length).toBe(1);
    expect(component.visible()).toBe(false);
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'warn', summary: 'Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren'
    }));
  });

  it('saveAndCopy() on 409 shows the number-conflict dialog like save()', () => {
    const { fixture } = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105', nextNumber: 105 } })));
    const component = fixture.componentInstance;
    component.name.set('Body'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);

    component.saveAndCopy();

    expect(component.visible()).toBe(true);
    expect(component.conflictDialogVisible()).toBe(true);
    expect(component.number()).toBe(105);
  });

  it('closeConflictDialog() hides the conflict dialog and keeps the main dialog open', () => {
    const { fixture } = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'x', nextNumber: 105 } })));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);
    component.save();

    component.closeConflictDialog();

    expect(component.conflictDialogVisible()).toBe(false);
    expect(component.visible()).toBe(true);
  });

  it('confirmDelete() deletes via ArticlesApiService and emits deleted', () => {
    const { fixture } = create();
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

  it('confirmDelete() on error sets errorMessage, does not emit deleted and keeps the dialog open', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('article', { id: 'a1', number: 104, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5 } as never);
    fixture.detectChanges();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'delete').mockReturnValue(throwError(() => ({ status: 500, error: { detail: undefined } })));
    const component = fixture.componentInstance;
    component.deleteConfirmVisible.set(true);
    const emitted: void[] = [];
    component.deleted.subscribe(() => emitted.push(undefined));

    component.confirmDelete();

    expect(emitted.length).toBe(0);
    expect(component.visible()).toBe(true);
    expect(component.deleteConfirmVisible()).toBe(true);
    expect(component.errorMessage()).toBe('Löschen fehlgeschlagen');
  });

  it('header getter returns the translated create-mode header', () => {
    const { fixture } = create();

    expect(fixture.componentInstance.header).toBe('Artikel anlegen');
  });

  it('header getter returns the translated edit-mode header', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('article', { id: 'a1', number: 104, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5 } as never);
    fixture.detectChanges();

    expect(fixture.componentInstance.header).toBe('Artikel bearbeiten');
  });

  it('renders the translated create-mode header in the dialog', () => {
    const { fixture } = create();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Artikel anlegen');
  });

  it('header re-evaluates when the active language changes after render (no computed() staleness)', () => {
    const { fixture, translate } = create();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Artikel anlegen');

    translate.use('en');
    fixture.detectChanges();

    expect(fixture.componentInstance.header).toBe('Create article');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Create article');
  });

  it('shows English labels and buttons when the active language is English', () => {
    const { fixture, translate } = create();
    translate.use('en');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Article number');
    expect(text).toContain('assigned permanently on save');
    expect(text).toContain('Cancel');
    expect(text).toContain('Save + copy');
    expect(text).toContain('Save');
  });

  it('saveAndCopy() shows the translated success toast with interpolated numbers', () => {
    const { fixture, translate } = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104, nextNumber: 105 } as unknown as CreateArticleResponse));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const component = fixture.componentInstance;
    component.name.set('Body langarm'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);
    translate.use('en');

    component.saveAndCopy();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'success', summary: '✓ Article 104 saved — next number: 105'
    }));
  });
});
