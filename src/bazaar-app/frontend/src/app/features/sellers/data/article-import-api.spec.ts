import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TimeoutError } from 'rxjs';
import { ArticleImportApi, IMPORT_TIMEOUT_MS } from './article-import-api';

const IMPORT_URL = '/api/sellers/s1/articles/import';

describe('ArticleImportApi', () => {
  let api: ArticleImportApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ArticleImportApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.useRealTimers();
  });

  it('importArticles_FileAndLocale_PostsOneMultipartRequestToSellerRoute', () => {
    // Arrange
    const file = new File(['1;Jacke'], 'artikel.csv');

    // Act
    api.importArticles('s1', file, 'de-DE').subscribe();

    // Assert
    const request = httpMock.expectOne(IMPORT_URL);
    expect(request.request.method).toBe('POST');
    request.flush({ importedCount: 1 });
  });

  it('importArticles_FileAndLocale_SendsFileAndBrowserLocaleAsFormFields', () => {
    // Arrange
    const file = new File(['1;Jacke'], 'artikel.csv');

    // Act
    api.importArticles('s1', file, 'de-DE').subscribe();

    // Assert
    const request = httpMock.expectOne(IMPORT_URL);
    const body = request.request.body as FormData;
    expect((body.get('file') as File).name).toBe('artikel.csv');
    expect(body.get('locale')).toBe('de-DE');
    request.flush({ importedCount: 1 });
  });

  it('importArticles_Success_EmitsImportedCount', () => {
    // Arrange
    const next = vi.fn();
    api.importArticles('s1', new File(['x'], 'a.csv'), 'de-DE').subscribe(next);

    // Act
    httpMock.expectOne(IMPORT_URL).flush({ importedCount: 3 });

    // Assert
    expect(next).toHaveBeenCalledWith({ importedCount: 3 });
  });

  it('importArticles_NoResponseWithinThreeMinutes_ErrorsWithTimeoutAndCancelsRequest', async () => {
    // Arrange
    vi.useFakeTimers();
    const error = vi.fn();
    api.importArticles('s1', new File(['x'], 'a.csv'), 'de-DE').subscribe({ error });
    const request = httpMock.expectOne(IMPORT_URL);

    // Act
    await vi.advanceTimersByTimeAsync(IMPORT_TIMEOUT_MS);

    // Assert
    expect(error).toHaveBeenCalledWith(expect.any(TimeoutError));
    expect(request.cancelled).toBe(true);
  });
});
