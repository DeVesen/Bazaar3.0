import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminArticlesApiService } from './admin-articles-api.service';

describe('AdminArticlesApiService', () => {
  let service: AdminArticlesApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AdminArticlesApiService]
    });
    service = TestBed.inject(AdminArticlesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() requests /api/articles', () => {
    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });

    expect(result).toEqual({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });

  it('list(query) sends all provided filters including sellerId as query parameters', () => {
    service.list({ page: 2, pageSize: 10, sort: 'seller:desc', brand: 'Nike', category: 'Jacken', search: 'jack', sellerId: 's1' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sort')).toBe('seller:desc');
    expect(req.request.params.get('brand')).toBe('Nike');
    expect(req.request.params.get('category')).toBe('Jacken');
    expect(req.request.params.get('search')).toBe('jack');
    expect(req.request.params.get('sellerId')).toBe('s1');
    req.flush({ items: [], totalCount: 0, page: 2, pageSize: 10 });
  });

  it('list(query) omits parameters that are not set', () => {
    service.list({ page: 1 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.has('sellerId')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });

  it('getById() requests /api/articles/:id', () => {
    let result: unknown;
    service.getById('a1').subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/a1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'a1' });

    expect(result).toEqual({ id: 'a1' });
  });
});
