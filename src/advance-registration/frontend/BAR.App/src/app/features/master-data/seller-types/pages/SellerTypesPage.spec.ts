import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, Observable } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SellerTypesPage } from './SellerTypesPage';
import { SellerTypeApiService } from '../seller-type-api.service';

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), MessageService, ConfirmationService]
  });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', {
    common: { cancel: 'Abbrechen', save: 'Speichern', create: 'Anlegen', delete: 'Löschen', edit: 'Bearbeiten' },
    masterDataFilterToolbar: { searchPlaceholder: 'Suche...', filterButton: 'Filter' },
    sellerTypes: {
      title: 'Verkäufer-Typen',
      columnName: 'Bezeichnung',
      columnCommissionRate: 'Provision %',
      columnItemFee: 'Gebühr €',
      columnSellerCount: 'Verkäufer',
      emptyText: 'Noch keine Verkäufer-Typen. Ohne Typ ist keine Registrierung möglich — mit + Neu beginnen.',
      loadError: 'Verkäufer-Typen konnten nicht geladen werden',
      confirmDelete: 'Verkäufer-Typ „{{name}}“ wirklich löschen? Betrifft {{sellerCount}} Verkäufer.',
      deleted: '✓ Verkäufer-Typ gelöscht',
      inUse: 'Verkäufer-Typ wird noch verwendet',
      deleteFailed: 'Löschen fehlgeschlagen'
    }
  });
  translate.use('de');
  const api = TestBed.inject(SellerTypeApiService);
  vi.spyOn(api, 'getAll').mockReturnValue(of([{ id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 }]));
  const fixture = TestBed.createComponent(SellerTypesPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('SellerTypesPage', () => {
  it('loads seller types on init', () => {
    const { fixture, api } = create();

    expect(api.getAll).toHaveBeenCalled();
    expect(fixture.componentInstance.sellerTypes().length).toBe(1);
  });

  it('exposes the blocking empty-state text', () => {
    const { fixture } = create();

    expect(fixture.componentInstance.emptyText).toContain('Ohne Typ ist keine Registrierung möglich');
  });

  it('exposes the translated empty-state text', () => {
    const { fixture } = create();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { sellerTypes: { emptyText: "No seller types yet. Registration isn't possible without one — start with + New." } });
    translate.use('en');

    expect(fixture.componentInstance.emptyText).toContain("isn't possible");
  });

  it('deleteType(row) calls SellerTypeApiService.delete and reloads on success', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.deleteType({ id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 });

    expect(deleteSpy).toHaveBeenCalledWith('t1');
    expect(api.getAll).toHaveBeenCalled();
  });

  it('deleteType(row) on 409 shows the server error as a toast, not silently', () => {
    const { fixture, api } = create();
    vi.spyOn(api, 'delete').mockReturnValue(
      new Observable((subscriber) => subscriber.error({ status: 409, error: { detail: 'Verkäufer-Typ wird noch verwendet' } }))
    );
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.deleteType({ id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 });

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Verkäufer-Typ wird noch verwendet' }));
  });

  it('onTableAction("delete", row) confirms and, on accept, deletes the seller type', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    const confirmationService = TestBed.inject(ConfirmationService);
    const confirmSpy = vi.spyOn(confirmationService, 'confirm');
    const row = { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 };

    fixture.componentInstance.onTableAction({ actionId: 'delete', row });

    expect(confirmSpy).toHaveBeenCalled();
    const confirmation = confirmSpy.mock.calls[0][0];
    confirmation.accept!();

    expect(deleteSpy).toHaveBeenCalledWith('t1');
  });

  it('onFilterChange filters the table data by name, case-insensitively', () => {
    const { fixture, api } = create();
    vi.mocked(api.getAll).mockReturnValue(
      of([
        { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 },
        { id: 't2', name: 'Premium', commissionRate: 8, itemFee: 1, sellerCount: 1 }
      ])
    );
    fixture.componentInstance.load();

    fixture.componentInstance.onFilterChange({ search: 'prem' });

    expect(fixture.componentInstance.filteredSellerTypes().map((t) => t.id)).toEqual(['t2']);
    expect(fixture.componentInstance.hasActiveFilter()).toBe(true);
  });

  it('onFilterChange with an empty search shows all loaded seller types again', () => {
    const { fixture } = create();

    fixture.componentInstance.onFilterChange({ search: 'sta' });
    fixture.componentInstance.onFilterChange({});

    expect(fixture.componentInstance.filteredSellerTypes().length).toBe(1);
    expect(fixture.componentInstance.hasActiveFilter()).toBe(false);
  });

  it('openCreate is wired to the toolbar\'s create output', () => {
    const { fixture } = create();

    fixture.componentInstance.openCreate();

    expect(fixture.componentInstance.popupVisible()).toBe(true);
    expect(fixture.componentInstance.popupItem()).toBeNull();
  });
});
