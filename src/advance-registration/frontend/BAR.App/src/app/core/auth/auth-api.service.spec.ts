import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthApiService]
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('login() posts to /api/auth/login and returns the token pair', () => {
    let result: { accessToken: string; refreshToken: string } | undefined;
    service.login('anna@example.com', 'geheim123').subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'anna@example.com', password: 'geheim123' });
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('register() posts full seller payload to /api/auth/register and returns the token pair', () => {
    let result: { accessToken: string; refreshToken: string } | undefined;
    const payload = {
      email: 'anna@example.com', password: 'geheim123',
      firstName: 'Anna', lastName: 'Beispiel', address: 'Hauptstr. 1',
      postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345'
    };
    service.register(payload).subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });
});
