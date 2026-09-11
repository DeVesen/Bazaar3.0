import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SellerTypeOptionsApiService } from './seller-type-options-api.service';

describe('SellerTypeOptionsApiService (Betrieb)', () => {
  let service: SellerTypeOptionsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SellerTypeOptionsApiService]
    });
    service = TestBed.inject(SellerTypeOptionsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() requests /api/seller-types', () => {
    service.getAll().subscribe();

    const req = httpMock.expectOne('/api/seller-types');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
});
