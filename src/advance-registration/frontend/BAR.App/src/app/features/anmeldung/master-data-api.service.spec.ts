import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MasterDataApiService } from './master-data-api.service';

describe('MasterDataApiService (Anmeldung)', () => {
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

  it('create("categories", name) posts to /api/categories', () => {
    service.create('categories', 'Spielzeug').subscribe();

    const req = httpMock.expectOne('/api/categories');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Spielzeug' });
    req.flush({ id: 'c1', name: 'Spielzeug', original: false });
  });
});
