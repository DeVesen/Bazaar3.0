import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SellerTypeApiService } from './seller-type-api.service';

describe('SellerTypeApiService', () => {
  let service: SellerTypeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SellerTypeApiService]
    });
    service = TestBed.inject(SellerTypeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() requests /api/seller-types', () => {
    service.getAll().subscribe();

    const req = httpMock.expectOne('/api/seller-types');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create() posts payload to /api/seller-types', () => {
    const payload = { name: 'Standard', commissionRate: 12.5, itemFee: 0.5 };
    service.create(payload).subscribe();

    const req = httpMock.expectOne('/api/seller-types');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 't1', ...payload, sellerCount: 0 });
  });

  it('update() puts payload to /api/seller-types/:id', () => {
    const payload = { name: 'Premium', commissionRate: 20, itemFee: 1 };
    service.update('t1', payload).subscribe();

    const req = httpMock.expectOne('/api/seller-types/t1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 't1', ...payload, sellerCount: 3 });
  });

  it('delete() deletes /api/seller-types/:id', () => {
    service.delete('t1').subscribe();

    const req = httpMock.expectOne('/api/seller-types/t1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
