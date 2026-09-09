import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PublicInfoService } from './public-info.service';

describe('PublicInfoService', () => {
  let service: PublicInfoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), PublicInfoService]
    });
    service = TestBed.inject(PublicInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('get() fetches GET /api/public/info', () => {
    service.get().subscribe();

    const req = httpMock.expectOne('/api/public/info');
    expect(req.request.method).toBe('GET');
    req.flush({
      registrationDeadline: null,
      dropOffFrom: null,
      dropOffUntil: null,
      bazaarFrom: null,
      bazaarUntil: null,
      defaultConditions: null,
      infoText: null
    });
  });
});
