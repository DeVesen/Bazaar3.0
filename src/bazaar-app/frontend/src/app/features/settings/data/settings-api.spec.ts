import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsApi } from './settings-api';

describe('SettingsApi', () => {
  let settingsApi: SettingsApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    settingsApi = TestBed.inject(SettingsApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('get() hits GET /api/settings', () => {
    settingsApi.get().subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('GET');
    req.flush({ scannerPauseMs: 3000 });
  });

  it('update() hits PUT /api/settings with the scannerPauseMs body', () => {
    settingsApi.update(5000).subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ scannerPauseMs: 5000 });
    req.flush(null);
  });
});
