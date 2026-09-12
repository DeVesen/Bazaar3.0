import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfileApiService } from './profile-api.service';

const PROFILE = {
  id: 'a3f9c2d1', firstName: 'Anna', lastName: 'Beispiel', address: 'Hauptstr. 1',
  postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345', email: 'anna@example.com',
  sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 }
};

describe('ProfileApiService', () => {
  let service: ProfileApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProfileApiService]
    });
    service = TestBed.inject(ProfileApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getProfile() gets /api/profile', () => {
    let result: unknown;
    service.getProfile().subscribe((r: unknown) => (result = r));

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.method).toBe('GET');
    req.flush(PROFILE);

    expect(result).toEqual(PROFILE);
  });

  it('updateProfile() puts to /api/profile', () => {
    let result: unknown;
    const payload = { firstName: 'Anna-Maria', lastName: 'Muster', address: null, postalCode: '76135', city: 'Ettlingen', phone: '0721 99999' };
    service.updateProfile(payload).subscribe((r: unknown) => (result = r));

    const req = httpMock.expectOne('/api/profile');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...PROFILE, city: 'Ettlingen' });

    expect(result).toEqual({ ...PROFILE, city: 'Ettlingen' });
  });
});
