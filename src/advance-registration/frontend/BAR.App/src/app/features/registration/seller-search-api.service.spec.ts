import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SellerSearchApiService } from './seller-search-api.service';

describe('SellerSearchApiService', () => {
  let service: SellerSearchApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SellerSearchApiService]
    });
    service = TestBed.inject(SellerSearchApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('search(query) requests /api/sellers with search/page/pageSize and maps to SellerOption[]', () => {
    let result: unknown;
    service.search('Max').subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      (r) => r.url === '/api/sellers' && r.params.get('search') === 'Max' && r.params.get('page') === '1' && r.params.get('pageSize') === '10'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [{ id: 's1', firstName: 'Max', lastName: 'Mustermann', startNumber: 42 }], totalCount: 1 });

    expect(result).toEqual([{ id: 's1', label: 'Max Mustermann (#42)' }]);
  });

  it('maps a missing startNumber to a dash placeholder', () => {
    let result: unknown;
    service.search('Ann').subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === '/api/sellers');
    req.flush({ items: [{ id: 's2', firstName: 'Ann', lastName: 'Beispiel', startNumber: null }], totalCount: 1 });

    expect(result).toEqual([{ id: 's2', label: 'Ann Beispiel (#–)' }]);
  });
});
