import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SettingsApiService, SettingsDto, SettingsPayload } from './settings-api.service';

describe('SettingsApiService', () => {
  let service: SettingsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SettingsApiService]
    });
    service = TestBed.inject(SettingsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('get() requests /api/settings', () => {
    service.get().subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('GET');
    const dto: SettingsDto = {
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultTypeId: null, infoText: null,
      startNumber: null, blockSize: null, defaultBlockCount: null
    };
    req.flush(dto);
  });

  it('update() puts payload to /api/settings', () => {
    const payload: SettingsPayload = {
      registrationDeadline: '2026-09-30T23:59:00+02:00', dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultTypeId: null, infoText: null,
      startNumber: 1, blockSize: 10, defaultBlockCount: 1
    };

    service.update(payload).subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload });
  });
});
