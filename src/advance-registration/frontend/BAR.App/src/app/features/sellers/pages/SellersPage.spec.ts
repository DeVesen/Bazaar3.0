import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SellersPage } from './SellersPage';
import { SellersApiService, Seller } from '../sellers-api.service';

const SELLER: Seller = {
  id: 's1',
  startNumber: 101,
  firstName: 'Anna',
  lastName: 'Beispiel',
  address: null,
  postalCode: '76133',
  city: 'Karlsruhe',
  phone: '0721 1',
  email: 'anna@example.com',
  sellerTypeId: 't1',
  sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 },
  isAdmin: false,
  articleCount: 3,
  hasPendingInvite: false
};

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
  const api = TestBed.inject(SellersApiService);
  vi.spyOn(api, 'list').mockReturnValue(of({ items: [SELLER], totalCount: 1, page: 1, pageSize: 25 }));
  const fixture = TestBed.createComponent(SellersPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('SellersPage', () => {
  it('loads sellers on init and exposes a flattened view-model to the table', () => {
    const { fixture, api } = create();

    expect(api.list).toHaveBeenCalledWith({ search: undefined, page: 1, pageSize: 25, sort: undefined });
    expect(fixture.componentInstance.totalRecords()).toBe(1);
    expect(fixture.componentInstance.rows()).toEqual([
      { ...SELLER, sellerTypeName: 'Standard', commissionRate: 15, itemFee: 0.5 }
    ]);
  });

  it('onSearch() reloads with the trimmed search term and resets to page 1', () => {
    const { fixture, api } = create();
    vi.mocked(api.list).mockClear();

    fixture.componentInstance.searchTerm.set('  anna  ');
    fixture.componentInstance.onSearch();

    expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ search: 'anna', page: 1 }));
  });

  it('onRowAdd() opens the dialog in create mode with no selected seller', () => {
    const { fixture } = create();

    fixture.componentInstance.selectedSeller.set(SELLER);
    fixture.componentInstance.onRowAdd();

    expect(fixture.componentInstance.dialogMode()).toBe('create');
    expect(fixture.componentInstance.selectedSeller()).toBeNull();
  });

  it('onTableAction("edit", row) opens the dialog in edit mode with the given seller', () => {
    const { fixture } = create();
    const row = { ...SELLER, sellerTypeName: 'Standard', commissionRate: 15, itemFee: 0.5 };

    fixture.componentInstance.onTableAction({ actionId: 'edit', row });

    expect(fixture.componentInstance.dialogMode()).toBe('edit');
    expect(fixture.componentInstance.selectedSeller()).toBe(row);
  });

  it('editDialogVisibleModel reflects and clears the edit dialog mode', () => {
    const { fixture } = create();
    const row = { ...SELLER, sellerTypeName: 'Standard', commissionRate: 15, itemFee: 0.5 };

    fixture.componentInstance.onTableAction({ actionId: 'edit', row });
    expect(fixture.componentInstance.editDialogVisibleModel).toBe(true);

    fixture.componentInstance.editDialogVisibleModel = false;
    expect(fixture.componentInstance.dialogMode()).toBeNull();
  });

  it('onEditSaved() closes the dialog and reloads the list', () => {
    const { fixture, api } = create();
    fixture.componentInstance.dialogMode.set('edit');
    vi.mocked(api.list).mockClear();

    fixture.componentInstance.onEditSaved();

    expect(fixture.componentInstance.dialogMode()).toBeNull();
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it('onPageChange() derives the page from first/rows and reloads', () => {
    const { fixture, api } = create();
    vi.mocked(api.list).mockClear();

    fixture.componentInstance.onPageChange({ first: 50, rows: 25 });

    expect(api.list).toHaveBeenCalledWith(expect.objectContaining({ page: 3, pageSize: 25 }));
  });

  it('onSortChange() builds a sort string, mapping sellerTypeName back to its nested API path while leaving already-flat fields as-is', () => {
    const { fixture, api } = create();
    vi.mocked(api.list).mockClear();

    fixture.componentInstance.onSortChange([
      { field: 'sellerTypeName', order: 'asc' },
      { field: 'commissionRate', order: 'desc' },
      { field: 'itemFee', order: 'desc' },
      { field: 'lastName', order: 'asc' }
    ]);

    expect(api.list).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'sellerType.name:asc,commissionRate:desc,itemFee:desc,lastName:asc' })
    );
  });

  it('onTableAction("delete", row) confirms and, on accept, deletes the seller and reloads', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    const confirmationService = TestBed.inject(ConfirmationService);
    const confirmSpy = vi.spyOn(confirmationService, 'confirm');
    const row = { ...SELLER, sellerTypeName: 'Standard', commissionRate: 15, itemFee: 0.5 };
    vi.mocked(api.list).mockClear();

    fixture.componentInstance.onTableAction({ actionId: 'delete', row });

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mock.calls[0][0].accept!();

    expect(deleteSpy).toHaveBeenCalledWith('s1');
    expect(api.list).toHaveBeenCalledTimes(1);
  });

  it('deleteSeller() on 409 shows the server error as a toast, not silently', () => {
    const { fixture, api } = create();
    vi.spyOn(api, 'delete').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Der letzte Admin kann nicht gelöscht werden' } }))
    );
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const row = { ...SELLER, sellerTypeName: 'Standard', commissionRate: 15, itemFee: 0.5 };

    fixture.componentInstance.deleteSeller(row);

    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Der letzte Admin kann nicht gelöscht werden' })
    );
  });

  it('load() error path resets loading and shows an error toast', () => {
    const { fixture, api } = create();
    vi.mocked(api.list).mockReturnValue(throwError(() => ({ status: 500 })));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.load();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
});
