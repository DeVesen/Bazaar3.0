import { TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
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
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => 'token-abc' } } } },
        provideTranslateService()
      ]
    });
    httpMock = TestBed.inject(HttpTestingController);

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', {
      setPassword: {
        title: 'Passwort festlegen',
        newPassword: 'Neues Passwort',
        submit: 'Passwort setzen',
        invalidLink: 'Der Link ist ungültig oder abgelaufen.',
        weakPassword: 'Passwort erfüllt die Anforderungen nicht.',
        genericError: 'Passwort konnte nicht gesetzt werden.'
      }
    });
    translate.use('de');
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

  it('shows a password-related message when the password is too weak (400)', () => {
    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();
    httpMock.expectOne('/api/auth/set-password').flush('error', { status: 400, statusText: 'Bad Request' });

    expect(fixture.componentInstance.errorMessage()).toBe('Passwort erfüllt die Anforderungen nicht.');
  });

  it('shows the link-invalid message when the invite token is invalid, consumed or expired (401)', () => {
    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();
    httpMock.expectOne('/api/auth/set-password').flush('error', { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.errorMessage()).toBe('Der Link ist ungültig oder abgelaufen.');
  });

  it('renders English labels when the active language is en', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      setPassword: {
        title: 'Set password',
        newPassword: 'New password',
        submit: 'Set password'
      }
    });
    translate.use('en');

    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Set password');
    expect(text).toContain('New password');
  });

  it('shows the English generic-error message when the active language is en (500)', () => {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      setPassword: {
        genericError: 'Could not set the password.'
      }
    });
    translate.use('en');

    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    fixture.componentInstance.password.set('geheim123');
    fixture.componentInstance.onSubmit();
    httpMock.expectOne('/api/auth/set-password').flush('error', { status: 500, statusText: 'Internal Server Error' });

    expect(fixture.componentInstance.errorMessage()).toBe('Could not set the password.');
  });
});
