import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ExportPage } from './ExportPage';
import { ExportApiService } from '../export-api.service';

function create() {
  vi.stubGlobal('AudioContext', vi.fn().mockImplementation(() => ({
    createOscillator: () => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } }),
    destination: {},
    currentTime: 0
  })));
  vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() });

  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService()]
  });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', { export: { success: '{{sellerCount}} Verkäufer und {{articleCount}} Artikel exportiert.', error: 'Export fehlgeschlagen' } });
  translate.use('de');
  const api = TestBed.inject(ExportApiService);
  const fixture = TestBed.createComponent(ExportPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('ExportPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('calls ExportApiService.export with the checkbox state', () => {
    const { fixture, api } = create();
    const exportSpy = vi.spyOn(api, 'export').mockReturnValue(of({ blob: new Blob(['{"sellers":[],"brands":[],"categories":[]}']), fileName: 'basar-export-2026-09-10.json' }));
    fixture.componentInstance.includeBrands.set(true);

    fixture.componentInstance.onExport();

    expect(exportSpy).toHaveBeenCalledWith({ includeBrands: true, includeCategories: false });
  });

  it('shows an info-area with seller/article counts after a successful export', async () => {
    const { fixture, api } = create();
    const json = JSON.stringify({ sellers: [{ id: 's1', articles: [{ id: 'a1' }, { id: 'a2' }] }, { id: 's2', articles: [{ id: 'a3' }] }], brands: [], categories: [] });
    vi.spyOn(api, 'export').mockReturnValue(of({ blob: new Blob([json]), fileName: 'basar-export-2026-09-10.json' }));

    fixture.componentInstance.onExport();
    await fixture.whenStable();

    expect(fixture.componentInstance.resultMessage()).toBe('2 Verkäufer und 3 Artikel exportiert.');
  });

  it('shows an error info-area when the export request fails', () => {
    const { fixture, api } = create();
    vi.spyOn(api, 'export').mockReturnValue(throwError(() => new Error('network')));

    fixture.componentInstance.onExport();

    expect(fixture.componentInstance.errorMessage()).toBe('Export fehlgeschlagen');
  });
});
