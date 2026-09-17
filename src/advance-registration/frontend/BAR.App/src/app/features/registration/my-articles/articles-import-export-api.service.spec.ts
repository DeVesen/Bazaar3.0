import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ArticlesImportExportApiService } from './articles-import-export-api.service';

describe('ArticlesImportExportApiService', () => {
  let service: ArticlesImportExportApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ArticlesImportExportApiService]
    });
    service = TestBed.inject(ArticlesImportExportApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('export() requests the export endpoint and extracts the filename', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/mine/export');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['csv']), { headers: { 'Content-Disposition': 'attachment; filename="meine-artikel-2026-09-17.csv"' } });

    expect(result?.fileName).toBe('meine-artikel-2026-09-17.csv');
  });

  it('export() falls back to a default filename when the header is missing', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export().subscribe((r) => (result = r));

    httpMock.expectOne('/api/articles/mine/export').flush(new Blob(['csv']));

    expect(result?.fileName).toBe('meine-artikel.csv');
  });

  it('template() requests the template endpoint', () => {
    service.template().subscribe();

    const req = httpMock.expectOne('/api/articles/mine/template');
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['csv']));
  });

  it('import() posts the file as multipart form data', () => {
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });
    service.import(file).subscribe();

    const req = httpMock.expectOne('/api/articles/mine/import');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ created: 1, updated: 0, deleted: 0 });
  });

  it('import() surfaces a 422 row-error body to the caller', () => {
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });
    let error: HttpErrorResponse | undefined;
    service.import(file).subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/api/articles/mine/import').flush(
      { errors: [{ row: 2, errorCode: 'import.invalid_price', detail: 'Zeile 2: ...' }] },
      { status: 422, statusText: 'Unprocessable Entity' }
    );

    expect(error?.error.errors[0].errorCode).toBe('import.invalid_price');
  });
});
