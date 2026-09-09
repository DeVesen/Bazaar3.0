import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  let fixture: ComponentFixture<LoginPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();

    httpMock.expectOne('/api/public/info').flush({
      registrationDeadline: null,
      dropOffFrom: null,
      dropOffUntil: null,
      bazaarFrom: null,
      bazaarUntil: null,
      defaultConditions: null,
      infoText: null
    });
  });

  it('on successful login stores tokens and navigates to /home', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const loginSpy = vi.spyOn(authService, 'login');

    fixture.componentInstance.onLoginSubmitted({ email: 'admin@bazaar.local', password: 'Admin123!' });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('on 401 shows the invalid-credentials error message', () => {
    fixture.componentInstance.onLoginSubmitted({ email: 'admin@bazaar.local', password: 'wrong' });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ detail: 'Ungültige Anmeldedaten', errorCode: 'auth.invalid_credentials' }, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();

    expect(fixture.componentInstance.errorMessage()).toBe('Ungültige Anmeldedaten');
  });

  it('shows the demo hint outside production builds', () => {
    // environment.production ist im Test-Build false (Standard-Vitest-Config aus R00)
    expect(fixture.nativeElement.querySelector('[data-testid="demo-hint"]')).not.toBeNull();
  });

  it('exposes isProduction from the environment', () => {
    expect(fixture.componentInstance.isProduction).toBe(false);
  });
});
