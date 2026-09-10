import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExportApiService } from './export-api.service';

describe('ExportApiService', () => {
  let service: ExportApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ExportApiService]
    });
    service = TestBed.inject(ExportApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests /api/export with includeBrands/includeCategories as query params', () => {
    service.export({ includeBrands: true, includeCategories: false }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/export' && r.params.get('includeBrands') === 'true' && r.params.get('includeCategories') === 'false'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['{}']), { headers: { 'Content-Disposition': 'attachment; filename="basar-export-2026-09-10.json"' } });
  });

  it('extracts the filename from the Content-Disposition header', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export({ includeBrands: false, includeCategories: false }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(() => true);
    req.flush(new Blob(['{}']), { headers: { 'Content-Disposition': 'attachment; filename="basar-export-2026-09-10.json"' } });

    expect(result?.fileName).toBe('basar-export-2026-09-10.json');
  });

  it('falls back to a default filename when the header is missing', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export({ includeBrands: false, includeCategories: false }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(() => true);
    req.flush(new Blob(['{}']));

    expect(result?.fileName).toBe('basar-export.json');
  });
});
