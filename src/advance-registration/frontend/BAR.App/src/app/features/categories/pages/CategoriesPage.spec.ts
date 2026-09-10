import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, Observable } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoriesPage } from './CategoriesPage';
import { MasterDataApiService } from '../../my-articles/master-data-api.service';

const DE_TRANSLATIONS = {
  common: { cancel: 'Abbrechen', save: 'Speichern', create: 'Anlegen', delete: 'Löschen', edit: 'Bearbeiten' },
  categories: {
    title: 'Kategorien',
    entityLabel: 'Kategorie',
    columnName: 'Name',
    columnOriginal: 'Original',
    badgeOriginal: '✓ Original',
    badgeNew: 'Neu',
    columnArticleCount: 'Artikel',
    loadError: 'Kategorien konnten nicht geladen werden',
    confirmDelete: 'Kategorie „{{name}}“ wirklich löschen?',
    deleted: '✓ Kategorie gelöscht',
    inUse: 'Kategorie wird noch verwendet',
    deleteFailed: 'Löschen fehlgeschlagen'
  }
};

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), MessageService, ConfirmationService]
  });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.use('de');
  const api = TestBed.inject(MasterDataApiService);
  vi.spyOn(api, 'getAll').mockReturnValue(of([
    { id: 'c1', name: 'Jacken', original: true, articleCount: 2 },
    { id: 'c2', name: 'Hosen', original: false, articleCount: 5 }
  ]));
  const fixture = TestBed.createComponent(CategoriesPage);
  fixture.detectChanges();
  return { fixture, api, translate };
}

describe('CategoriesPage', () => {
  it('loads categories on init', () => {
    const { fixture, api } = create();

    expect(api.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.categories().length).toBe(2);
  });

  it('renders the translated title', () => {
    const { fixture } = create();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Kategorien');
  });

  it('openCreate() opens the popup in create mode', () => {
    const { fixture } = create();

    fixture.componentInstance.openCreate();

    expect(fixture.componentInstance.popupMode()).toBe('create');
    expect(fixture.componentInstance.popupItem()).toBeNull();
    expect(fixture.componentInstance.popupVisible()).toBe(true);
  });

  it('onTableAction("edit", row) opens the popup in edit mode with that row', () => {
    const { fixture } = create();
    const row = { id: 'c2', name: 'Hosen', original: false, articleCount: 5 };

    fixture.componentInstance.onTableAction({ actionId: 'edit', row });

    expect(fixture.componentInstance.popupMode()).toBe('edit');
    expect(fixture.componentInstance.popupItem()).toBe(row);
    expect(fixture.componentInstance.popupVisible()).toBe(true);
  });

  it('onSaved() reloads the list', () => {
    const { fixture, api } = create();
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.onSaved();

    expect(api.getAll).toHaveBeenCalledWith('categories');
  });

  it('deleteCategory(row) calls MasterDataApiService.delete with "categories" and reloads on success', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.deleteCategory({ id: 'c1', name: 'Jacken', original: true, articleCount: 2 });

    expect(deleteSpy).toHaveBeenCalledWith('categories', 'c1');
    expect(api.getAll).toHaveBeenCalledWith('categories');
  });

  it('deleteCategory(row) on 409 shows the server error as a toast, not silently', () => {
    const { fixture, api } = create();
    vi.spyOn(api, 'delete').mockReturnValue(
      new Observable((subscriber) => subscriber.error({ status: 409, error: { detail: 'Kategorie wird noch verwendet' } }))
    );
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.deleteCategory({ id: 'c1', name: 'Jacken', original: true, articleCount: 2 });

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Kategorie wird noch verwendet' }));
  });

  it('onTableAction("delete", row) confirms and, on accept, deletes the category', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    const confirmationService = TestBed.inject(ConfirmationService);
    const confirmSpy = vi.spyOn(confirmationService, 'confirm');
    const row = { id: 'c1', name: 'Jacken', original: true, articleCount: 2 };

    fixture.componentInstance.onTableAction({ actionId: 'delete', row });

    expect(confirmSpy).toHaveBeenCalled();
    const confirmation = confirmSpy.mock.calls[0][0];
    confirmation.accept!();

    expect(deleteSpy).toHaveBeenCalledWith('categories', 'c1');
  });

  it('renders the translated title in the active language after a post-render language switch', () => {
    const { fixture, translate } = create();

    translate.setTranslation('en', { categories: { title: 'Categories' } });
    translate.use('en');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Categories');
  });
});
