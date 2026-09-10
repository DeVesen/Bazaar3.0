import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SetPasswordPage } from './SetPasswordPage';
import { AuthService } from '../../../core/auth/auth.service';

describe('SetPasswordPage', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // Stub-Route fuer /home - sonst endet die echte Navigation nach dem
        // Teardown in einer Unhandled Rejection (siehe LoginPage.spec.ts).
        provideRouter([{ path: 'home', children: [] }]),
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => 'token-abc' } } } }
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('submits the invite token from the query param together with the password', () => {
    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();

    const req = httpMock.expectOne('/api/auth/set-password');
    expect(req.request.body).toEqual({ inviteToken: 'token-abc', password: 'geheim123' });
    req.flush({ accessToken: 'a', refreshToken: 'r' });
  });

  it('logs in and navigates to /home on success', () => {
    const fixture = TestBed.createComponent(SetPasswordPage);
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(authService, 'login');
    vi.spyOn(router, 'navigateByUrl');
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();
    httpMock.expectOne('/api/auth/set-password').flush({ accessToken: 'a', refreshToken: 'r' });

    expect(authService.login).toHaveBeenCalledWith('a', 'r');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/home');
  });

  it('shows an error message when the invite token is invalid or expired', () => {
    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();
    httpMock.expectOne('/api/auth/set-password').flush('error', { status: 400, statusText: 'Bad Request' });

    expect(fixture.componentInstance.errorMessage()).toBe('Der Link ist ungültig oder abgelaufen.');
  });
});
