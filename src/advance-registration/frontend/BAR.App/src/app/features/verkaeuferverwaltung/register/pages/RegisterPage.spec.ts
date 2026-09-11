import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthApiService } from '@core/auth/auth-api.service';
import { AuthService } from '@core/auth/auth.service';
import { RegisterPage } from './RegisterPage';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;
  let authApi: AuthApiService;

  const formValue = {
    email: 'anna@example.com',
    password: 'geheim123!',
    firstName: 'Anna',
    lastName: 'Beispiel',
    address: '',
    postalCode: '76133',
    city: 'Karlsruhe',
    phone: '0721 12345'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      // Stub-Route fuer /home: erfolgreiche Registrierung navigiert wirklich
      // dorthin (vi.spyOn ruft das Original mit auf). Ohne die Route wird die
      // Navigation nach dem Teardown abgelehnt und Vitest meldet eine
      // Unhandled Rejection.
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'home', children: [] }]),
        provideTranslateService()
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', {
      register: {
        notEnabled: 'Registrierung ist noch nicht freigeschaltet.',
        genericError: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.'
      }
    });
    translate.use('de');
    fixture = TestBed.createComponent(RegisterPage);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    authApi = TestBed.inject(AuthApiService);
    fixture.detectChanges();
  });

  it('on success stores tokens and navigates to /home without a second login step', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const loginSpy = vi.spyOn(authService, 'login');
    const authApiLoginSpy = vi.spyOn(authApi, 'login');

    fixture.componentInstance.onRegisterSubmitted(formValue);

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.body).toEqual(formValue);
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(navigateSpy).toHaveBeenCalledWith('/home');
    expect(authApiLoginSpy).not.toHaveBeenCalled();
  });

  it('on 409 seller.email_taken sets emailTakenError', () => {
    fixture.componentInstance.onRegisterSubmitted(formValue);

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ errorCode: 'seller.email_taken', detail: 'Diese E-Mail ist bereits registriert' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.componentInstance.emailTakenError()).toBe(true);
    expect(fixture.componentInstance.registrationNotEnabled()).toBe(false);
    expect(fixture.componentInstance.genericError()).toBeNull();
  });

  it('on 500 shows a generic error without touching the two specific 409 signals', () => {
    fixture.componentInstance.onRegisterSubmitted(formValue);

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ detail: 'Interner Fehler' }, { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.genericError()).toBe('Interner Fehler');
    expect(fixture.componentInstance.emailTakenError()).toBe(false);
    expect(fixture.componentInstance.registrationNotEnabled()).toBe(false);
    // Die Form bleibt stehen, die Meldung ist tatsaechlich sichtbar.
    expect(fixture.nativeElement.querySelector('app-registrierung-form')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="register-generic-error"]')?.textContent).toContain('Interner Fehler');
  });

  it('on an unrecognized errorCode falls back to a default message', () => {
    fixture.componentInstance.onRegisterSubmitted(formValue);

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ errorCode: 'block.overlap' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.componentInstance.genericError()).toBe('Registrierung fehlgeschlagen. Bitte versuche es erneut.');
    expect(fixture.componentInstance.emailTakenError()).toBe(false);
    expect(fixture.componentInstance.registrationNotEnabled()).toBe(false);
  });

  it('clears a previous generic error when the form is submitted again', () => {
    fixture.componentInstance.onRegisterSubmitted(formValue);
    httpMock.expectOne('/api/auth/register').flush({}, { status: 500, statusText: 'Internal Server Error' });
    expect(fixture.componentInstance.genericError()).not.toBeNull();

    fixture.componentInstance.onRegisterSubmitted(formValue);

    expect(fixture.componentInstance.genericError()).toBeNull();
    httpMock.expectOne('/api/auth/register').flush({ accessToken: 'a', refreshToken: 'r' });
  });

  it('on 409 registration.not_enabled shows the alternate message instead of the form', () => {
    fixture.componentInstance.onRegisterSubmitted(formValue);

    const req = httpMock.expectOne('/api/auth/register');
    req.flush({ errorCode: 'registration.not_enabled', detail: 'Registrierung ist noch nicht freigeschaltet' }, { status: 409, statusText: 'Conflict' });
    fixture.detectChanges();

    expect(fixture.componentInstance.registrationNotEnabled()).toBe(true);
    expect(fixture.nativeElement.querySelector('app-registrierung-form')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Registrierung ist noch nicht freigeschaltet.');
  });
});
