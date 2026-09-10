import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CategoriesPage } from './CategoriesPage';
import { MasterDataApiService } from '../../my-articles/master-data-api.service';

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
  const api = TestBed.inject(MasterDataApiService);
  vi.spyOn(api, 'getAll').mockReturnValue(of([
    { id: 'c1', name: 'Jacken', original: true, articleCount: 2 },
    { id: 'c2', name: 'Hosen', original: false, articleCount: 5 }
  ]));
  const fixture = TestBed.createComponent(CategoriesPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('CategoriesPage', () => {
  it('loads categories on init', () => {
    const { fixture, api } = create();

    expect(api.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.categories().length).toBe(2);
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
});
