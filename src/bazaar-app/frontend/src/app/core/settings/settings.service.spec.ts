import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let settingsService: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    settingsService = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('falls back to 3000 before load() resolves', () => {
    expect(settingsService.scannerPauseMs()).toBe(3000);
    expect(settingsService.settings()).toBeNull();
  });

  it('load() populates settings()/scannerPauseMs() from GET /api/settings', async () => {
    const loadPromise = settingsService.load();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('GET');
    req.flush({ scannerPauseMs: 7000 });

    await loadPromise;

    expect(settingsService.settings()).toEqual({ scannerPauseMs: 7000 });
    expect(settingsService.scannerPauseMs()).toBe(7000);
  });
});
