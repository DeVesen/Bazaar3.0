import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { MyArticlesPage } from './MyArticlesPage';
import { ArticlesApiService } from '../articles-api.service';
import { MasterDataApiService } from '../../master-data-api.service';
import { ArticlesImportExportApiService } from '../articles-import-export-api.service';

const DE_TRANSLATIONS = {
  common: { cancel: 'Abbrechen', save: 'Speichern', create: 'Anlegen', delete: 'Löschen', edit: 'Bearbeiten', ok: 'OK' },
  myArticles: {
    title: 'Meine Artikel',
    columnNumber: 'Nr.',
    columnName: 'Bezeichnung',
    columnCategory: 'Kategorie',
    columnBrand: 'Marke',
    columnPrice: 'Preis',
    emptyTextPrefix: 'Noch keine Artikel angemeldet. Mit ',
    emptyTextSuffix: ' den ersten anlegen.',
    createButton: '+ Neu',
    loadError: 'Artikel konnten nicht geladen werden',
    noFreeNumber: 'Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren',
    importExport: {
      import: 'Import',
      export: 'Export',
      template: 'Vorlage'
    },
    import: {
      dialogHeader: 'Import-Ergebnis',
      success: '{{created}} angelegt, {{updated}} aktualisiert, {{deleted}} gelöscht.',
      rowColumn: 'Zeile',
      errorColumn: 'Fehler',
      generalError: 'Import fehlgeschlagen — Datei konnte nicht verarbeitet werden.'
    }
  },
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
  myArticles: {
    title: 'My articles',
    columnNumber: 'No.',
    columnName: 'Name',
    columnCategory: 'Category',
    columnBrand: 'Brand',
    columnPrice: 'Price',
    emptyTextPrefix: 'No articles registered yet. Use ',
    emptyTextSuffix: ' to create the first one.',
    createButton: '+ New',
    loadError: 'Articles could not be loaded',
    noFreeNumber: 'No free article number available — please contact the admin',
    importExport: {
      import: 'Import',
      export: 'Export',
      template: 'Template'
    },
    import: {
      dialogHeader: 'Import result',
      success: '{{created}} created, {{updated}} updated, {{deleted}} deleted.',
      rowColumn: 'Row',
      errorColumn: 'Error',
      generalError: 'Import failed — file could not be processed.'
    }
  },
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
  // p-splitbutton (rendered by FilterPanel once splitButtonItems is set) mounts a TieredMenu
  // whose ngOnInit unconditionally calls window.matchMedia, which jsdom does not implement.
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: () => undefined,
    removeEventListener: () => undefined
  } as unknown as MediaQueryList);
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), MessageService] });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.setTranslation('en', EN_TRANSLATIONS);
  translate.use('de');
  const articlesApi = TestBed.inject(ArticlesApiService);
  const masterDataApi = TestBed.inject(MasterDataApiService);
  vi.spyOn(articlesApi, 'getMine').mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 25 }));
  vi.spyOn(articlesApi, 'getNextNumber').mockReturnValue(of({ number: 104 }));
  vi.spyOn(masterDataApi, 'getAll').mockReturnValue(of([]));
  const fixture = TestBed.createComponent(MyArticlesPage);
  fixture.detectChanges();
  return { fixture, articlesApi, masterDataApi, translate };
}

describe('MyArticlesPage', () => {
  it('loads articles, brands and categories on init', () => {
    const { fixture, articlesApi, masterDataApi } = create();

    expect(articlesApi.getMine).toHaveBeenCalled();
    expect(masterDataApi.getAll).toHaveBeenCalledWith('brands');
    expect(masterDataApi.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.articles()).toEqual([]);
  });

  it('shows the empty-state text when there are no articles', () => {
    const { fixture } = create();

    expect(fixture.componentInstance.isEmpty()).toBe(true);
  });

  it('openCreateDialog() fetches next-number then opens the dialog in create mode', () => {
    const { fixture, articlesApi } = create();

    fixture.componentInstance.openCreateDialog();

    expect(articlesApi.getNextNumber).toHaveBeenCalled();
    expect(fixture.componentInstance.dialogMode()).toBe('create');
    expect(fixture.componentInstance.dialogNextNumber()).toBe(104);
    expect(fixture.componentInstance.dialogVisible()).toBe(true);
  });

  it('openEditDialog() opens the dialog in edit mode with the given article', () => {
    const { fixture } = create();
    const article = { id: 'a1', number: 101 } as never;

    fixture.componentInstance.openEditDialog(article);

    expect(fixture.componentInstance.dialogMode()).toBe('edit');
    expect(fixture.componentInstance.dialogArticle()).toBe(article);
    expect(fixture.componentInstance.dialogVisible()).toBe(true);
  });

  it('onSaved() reloads the article list', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onSaved();

    expect(articlesApi.getMine).toHaveBeenCalledTimes(1);
  });

  it('onFilterSearch() reloads with the given filters and resets to page 1', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onFilterSearch({ brand: 'Nike', category: undefined, search: 'jack' });

    expect(articlesApi.getMine).toHaveBeenCalledWith({ page: 1, pageSize: 25, sort: undefined, brand: 'Nike', category: undefined, search: 'jack' });
    expect(fixture.componentInstance.hasActiveFilter()).toBe(true);
  });

  it('onTableSort() reloads with a sort string built from the sort metas', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onTableSort([{ field: 'price', order: 'desc' }, { field: 'name', order: 'asc' }]);

    expect(articlesApi.getMine).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'price:desc,name:asc' }));
  });

  it('onTablePage() reloads with the page derived from first/rows', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onTablePage({ first: 50, rows: 25 });

    expect(articlesApi.getMine).toHaveBeenCalledWith(expect.objectContaining({ page: 3, pageSize: 25 }));
  });

  it('loadArticles() error path resets loading and shows an error toast', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockReturnValue(throwError(() => ({ status: 500 })));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.loadArticles();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });

  it('renders the empty-state text with the bolded create-button fragment', () => {
    const { fixture } = create();

    const html = (fixture.nativeElement as HTMLElement).innerHTML;
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Noch keine Artikel angemeldet. Mit + Neu den ersten anlegen.');
    expect(html).toContain('<strong>+ Neu</strong>');
  });

  it('shows English text when the active language is English', () => {
    const { fixture, translate } = create();
    translate.use('en');
    fixture.detectChanges();

    const html = (fixture.nativeElement as HTMLElement).innerHTML;
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No articles registered yet. Use + New to create the first one.');
    expect(html).toContain('<strong>+ New</strong>');
  });

  it('translated text re-evaluates when the active language changes after render', () => {
    const { fixture, translate } = create();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Noch keine Artikel angemeldet');

    translate.use('en');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No articles registered yet');
  });

  it('columns getter returns translated column headers', () => {
    const { fixture, translate } = create();

    expect(fixture.componentInstance.columns.map((c) => c.header)).toEqual(['Nr.', 'Bezeichnung', 'Kategorie', 'Marke', 'Preis']);

    translate.use('en');

    expect(fixture.componentInstance.columns.map((c) => c.header)).toEqual(['No.', 'Name', 'Category', 'Brand', 'Price']);
  });

  it('loadArticles() error toast is translated', () => {
    const { fixture, articlesApi, translate } = create();
    vi.mocked(articlesApi.getMine).mockReturnValue(throwError(() => ({ status: 500 })));
    translate.use('en');
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.loadArticles();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Articles could not be loaded' }));
  });

  it('openCreateDialog() error toast is translated', () => {
    const { fixture, articlesApi, translate } = create();
    vi.mocked(articlesApi.getNextNumber).mockReturnValue(throwError(() => ({ status: 409 })));
    translate.use('en');
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.openCreateDialog();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'warn', summary: 'No free article number available — please contact the admin' }));
  });

  it('clicking the Export menu item downloads the export CSV', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    const exportSpy = vi.spyOn(importExportApi, 'export').mockReturnValue(of({ blob: new Blob(['csv']), fileName: 'meine-artikel.csv' }));
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() });

    fixture.componentInstance.onExport();

    expect(exportSpy).toHaveBeenCalledOnce();
  });

  it('clicking the Vorlage menu item downloads the template CSV', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    const templateSpy = vi.spyOn(importExportApi, 'template').mockReturnValue(of({ blob: new Blob(['csv']), fileName: 'vorlage.csv' }));
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() });

    fixture.componentInstance.onTemplate();

    expect(templateSpy).toHaveBeenCalledOnce();
  });

  it('a successful import shows the success dialog and reloads the list', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    vi.spyOn(importExportApi, 'import').mockReturnValue(of({ created: 1, updated: 0, deleted: 0 }));
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });

    fixture.componentInstance.onFileSelected({ target: { files: [file], value: '' } } as unknown as Event);

    expect(fixture.componentInstance.importDialogVisible()).toBe(true);
    expect(fixture.componentInstance.importResult()).toEqual({ kind: 'success', summary: { created: 1, updated: 0, deleted: 0 } });
  });

  it('a 422 import response shows the row-error dialog', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    const errorBody = { errors: [{ row: 2, errorCode: 'import.invalid_price', detail: 'Zeile 2: ...' }] };
    vi.spyOn(importExportApi, 'import').mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: errorBody }))
    );
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });

    fixture.componentInstance.onFileSelected({ target: { files: [file], value: '' } } as unknown as Event);

    expect(fixture.componentInstance.importResult()).toEqual({ kind: 'rowErrors', errors: errorBody.errors });
  });
});
