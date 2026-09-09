import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MasterDataApiService } from './master-data-api.service';

describe('MasterDataApiService', () => {
  let service: MasterDataApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), MasterDataApiService]
    });
    service = TestBed.inject(MasterDataApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll("brands") requests /api/brands', () => {
    service.getAll('brands').subscribe();

    const req = httpMock.expectOne('/api/brands');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getAll("categories") requests /api/categories', () => {
    service.getAll('categories').subscribe();

    const req = httpMock.expectOne('/api/categories');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('create("brands", name) posts to /api/brands', () => {
    service.create('brands', 'Nike').subscribe();

    const req = httpMock.expectOne('/api/brands');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Nike' });
    req.flush({ id: 'b1', name: 'Nike', original: false });
  });
});
