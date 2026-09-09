import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BlocksApiService } from './blocks-api.service';

describe('BlocksApiService', () => {
  let service: BlocksApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), BlocksApiService]
    });
    service = TestBed.inject(BlocksApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getMine() gets /api/blocks/mine', () => {
    let result: unknown;
    service.getMine().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/blocks/mine');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' }]);

    expect(result).toEqual([{ id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' }]);
  });
});
