import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SettingsPage } from './SettingsPage';
import { SettingsApiService, SettingsDto } from '../settings-api.service';
import { SellerTypeApiService } from '../../seller-types/seller-type-api.service';

const EMPTY_SETTINGS: SettingsDto = {
  registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
  bazaarFrom: null, bazaarUntil: null, defaultTypeId: null, infoText: null,
  startNumber: null, blockSize: null, defaultBlockCount: null
};

function create(initial: SettingsDto = EMPTY_SETTINGS) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
  });
  const api = TestBed.inject(SettingsApiService);
  const sellerTypeApi = TestBed.inject(SellerTypeApiService);
  vi.spyOn(api, 'get').mockReturnValue(of(initial));
  vi.spyOn(sellerTypeApi, 'getAll').mockReturnValue(of([{ id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5, sellerCount: 0 }]));
  const fixture = TestBed.createComponent(SettingsPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('SettingsPage', () => {
  it('loads settings on init', () => {
    const { fixture } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });

    expect(fixture.componentInstance.startNumber()).toBe(1);
    expect(fixture.componentInstance.blockSize()).toBe(10);
  });

  it('infoTextLength reflects the current infoText', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('Hallo');

    expect(fixture.componentInstance.infoTextLength()).toBe(5);
  });

  it('infoTextNearLimit is true from 3800 characters', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('a'.repeat(3800));

    expect(fixture.componentInstance.infoTextNearLimit()).toBe(true);
  });

  it('infoTextNearLimit is false below 3800 characters', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('a'.repeat(3799));

    expect(fixture.componentInstance.infoTextNearLimit()).toBe(false);
  });

  it('save() calls SettingsApiService.update with the current field values and shows a success toast', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    const updateSpy = vi.spyOn(api, 'update').mockReturnValue(of({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const registrationDeadline = new Date('2026-09-30T21:59:00.000Z');
    fixture.componentInstance.infoText.set('Hallo');
    fixture.componentInstance.registrationDeadline.set(registrationDeadline);

    fixture.componentInstance.save();

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({
      infoText: 'Hallo', startNumber: 1, blockSize: 10, defaultBlockCount: 1,
      registrationDeadline: registrationDeadline.toISOString()
    }));
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('save() on 400 sets fieldErrors instead of a toast', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    vi.spyOn(api, 'update').mockReturnValue(
      throwError(() => ({ status: 400, error: { errors: { defaultTypeId: ['Unbekannter Verkäufer-Typ'] } } }))
    );

    fixture.componentInstance.save();

    expect(fixture.componentInstance.fieldErrors()['defaultTypeId']).toEqual(['Unbekannter Verkäufer-Typ']);
  });

  it('save() on 409 sets saveError to the server detail', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    vi.spyOn(api, 'update').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Startnummer liegt über bereits vergebenen Artikelnummern' } }))
    );

    fixture.componentInstance.save();

    expect(fixture.componentInstance.saveError()).toBe('Startnummer liegt über bereits vergebenen Artikelnummern');
  });
});
