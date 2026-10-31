import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ArticlePrintItem, ArticlesApi } from './articles-api';

describe('ArticlesApi.getForPrint', () => {
  let articlesApi: ArticlesApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    articlesApi = TestBed.inject(ArticlesApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getForPrint_allFilters_sendsThemAsQueryParamsToPrintEndpoint', () => {
    // Arrange
    const items: ArticlePrintItem[] = [
      { name: 'Hose', brand: 'Nike', category: 'Hosen', size: '104', color: 'Rot', price: 5 },
    ];
    let received: ArticlePrintItem[] | undefined;

    // Act
    articlesApi
      .getForPrint({ q: 'hose', brand: 'Nike', category: 'Hosen', status: 'selling' })
      .subscribe((response) => (received = response));
    const req = httpMock.expectOne((r) => r.url === '/api/articles/print');
    req.flush(items);

    // Assert
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('hose');
    expect(req.request.params.get('brand')).toBe('Nike');
    expect(req.request.params.get('category')).toBe('Hosen');
    expect(req.request.params.get('status')).toBe('selling');
    expect(received).toEqual(items);
  });

  it('getForPrint_noFilters_sendsNoParamsAndNoPagingOrSort', () => {
    // Arrange & Act
    articlesApi.getForPrint({}).subscribe();
    const req = httpMock.expectOne((r) => r.url === '/api/articles/print');
    req.flush([]);

    // Assert
    expect(req.request.params.keys()).toEqual([]);
  });

  it('getForPrint_emptyOrNullFilters_areOmitted', () => {
    // Arrange & Act
    articlesApi.getForPrint({ q: '', brand: null, category: undefined, status: null }).subscribe();
    const req = httpMock.expectOne((r) => r.url === '/api/articles/print');
    req.flush([]);

    // Assert
    expect(req.request.params.keys()).toEqual([]);
  });
});
