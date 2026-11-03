import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ArticlesApiService } from './articles-api.service';

describe('ArticlesApiService', () => {
  let service: ArticlesApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ArticlesApiService]
    });
    service = TestBed.inject(ArticlesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getMine() requests /api/articles/mine', () => {
    let result: unknown;
    service.getMine().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/mine');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });

    expect(result).toEqual({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });

  it('getMine(query) sends all provided filters as query parameters', () => {
    service.getMine({ page: 2, pageSize: 10, sort: 'price:desc', brand: 'Nike', category: 'Jacken', search: 'jack' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles/mine');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sort')).toBe('price:desc');
    expect(req.request.params.get('brand')).toBe('Nike');
    expect(req.request.params.get('category')).toBe('Jacken');
    expect(req.request.params.get('search')).toBe('jack');
    req.flush({ items: [], totalCount: 0, page: 2, pageSize: 10 });
  });

  it('getMine(query) omits parameters that are not set', () => {
    service.getMine({ page: 1 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles/mine');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.has('brand')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });

  it('getNextNumber() requests /api/articles/next-number', () => {
    let result: { number: number } | undefined;
    service.getNextNumber().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/next-number');
    expect(req.request.method).toBe('GET');
    req.flush({ number: 104 });

    expect(result).toEqual({ number: 104 });
  });

  it('create() posts payload to /api/articles', () => {
    const payload = { name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5, expectedNumber: 104 };
    service.create(payload).subscribe();

    const req = httpMock.expectOne('/api/articles');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'a1', number: 104 });
  });

  it('update() puts payload to /api/articles/:id', () => {
    const payload = { name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 5 };
    service.update('a1', payload).subscribe();

    const req = httpMock.expectOne('/api/articles/a1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 'a1' });
  });

  it('delete() deletes /api/articles/:id', () => {
    service.delete('a1').subscribe();

    const req = httpMock.expectOne('/api/articles/a1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('getAllMine() loads page after page with pageSize 100 until totalCount is reached', () => {
    let result: unknown;
    service.getAllMine({ sort: 'number:1', brand: 'Nike' }).subscribe((r) => (result = r));
    const item = (n: number) => ({ id: `a${n}`, number: n });

    const first = httpMock.expectOne((r) => r.url === '/api/articles/mine' && r.params.get('page') === '1');
    expect(first.request.params.get('pageSize')).toBe('100');
    expect(first.request.params.get('sort')).toBe('number:1');
    expect(first.request.params.get('brand')).toBe('Nike');
    first.flush({ items: Array.from({ length: 100 }, (_, i) => item(i)), totalCount: 150, page: 1, pageSize: 100 });

    const second = httpMock.expectOne((r) => r.url === '/api/articles/mine' && r.params.get('page') === '2');
    second.flush({ items: Array.from({ length: 50 }, (_, i) => item(100 + i)), totalCount: 150, page: 2, pageSize: 100 });

    expect((result as unknown[]).length).toBe(150);
    expect((result as { number: number }[])[149].number).toBe(149);
  });

  it('getAllMine() stops after one request when everything fits on the first page', () => {
    let result: unknown;
    service.getAllMine().subscribe((r) => (result = r));

    httpMock.expectOne((r) => r.url === '/api/articles/mine').flush({ items: [{ id: 'a1' }], totalCount: 1, page: 1, pageSize: 100 });

    expect(result).toEqual([{ id: 'a1' }]);
  });
});
