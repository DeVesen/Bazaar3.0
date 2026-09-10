import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, Observable } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SellerTypesPage } from './SellerTypesPage';
import { SellerTypeApiService } from '../seller-type-api.service';

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
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
});
