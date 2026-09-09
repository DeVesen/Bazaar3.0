import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { BrandsPage } from './BrandsPage';
import { MasterDataApiService } from '../../my-articles/master-data-api.service';

function create() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
  const api = TestBed.inject(MasterDataApiService);
  vi.spyOn(api, 'getAll').mockReturnValue(of([
    { id: 'b1', name: 'Nike', original: true, articleCount: 0 },
    { id: 'b2', name: 'Adidas', original: false, articleCount: 3 }
  ]));
  const fixture = TestBed.createComponent(BrandsPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('BrandsPage', () => {
  it('loads brands on init', () => {
    const { fixture, api } = create();

    expect(api.getAll).toHaveBeenCalledWith('brands');
    expect(fixture.componentInstance.brands().length).toBe(2);
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
    const row = { id: 'b2', name: 'Adidas', original: false, articleCount: 3 };

    fixture.componentInstance.onTableAction({ actionId: 'edit', row });

    expect(fixture.componentInstance.popupMode()).toBe('edit');
    expect(fixture.componentInstance.popupItem()).toBe(row);
    expect(fixture.componentInstance.popupVisible()).toBe(true);
  });

  it('onSaved() reloads the list', () => {
    const { fixture, api } = create();
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.onSaved();

    expect(api.getAll).toHaveBeenCalledWith('brands');
  });

  it('deleteBrand(row) calls MasterDataApiService.delete and reloads on success', () => {
    const { fixture, api } = create();
    const deleteSpy = vi.spyOn(api, 'delete').mockReturnValue(of(undefined));
    vi.mocked(api.getAll).mockClear();

    fixture.componentInstance.deleteBrand({ id: 'b2', name: 'Adidas', original: false, articleCount: 3 });

    expect(deleteSpy).toHaveBeenCalledWith('brands', 'b2');
    expect(api.getAll).toHaveBeenCalledWith('brands');
  });
});
