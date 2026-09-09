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
});
