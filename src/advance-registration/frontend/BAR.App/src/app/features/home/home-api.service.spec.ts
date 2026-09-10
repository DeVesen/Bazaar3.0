import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HomeApiService } from './home-api.service';

describe('HomeApiService', () => {
  let service: HomeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), HomeApiService] });
    service = TestBed.inject(HomeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getSellerHome() fetches GET /api/home/seller', () => {
    service.getSellerHome().subscribe();

    const req = httpMock.expectOne('/api/home/seller');
    expect(req.request.method).toBe('GET');
    req.flush({ articleCount: 3, typeConditions: { commissionRate: 15, itemFee: 0.5 } });
  });

  it('getAdminHome() fetches GET /api/home/admin', () => {
    service.getAdminHome().subscribe();

    const req = httpMock.expectOne('/api/home/admin');
    expect(req.request.method).toBe('GET');
    req.flush({ sellerCount: 1, articleCount: 1, categoryCount: 1, brandCount: 1, heatmapData: [] });
  });
});
