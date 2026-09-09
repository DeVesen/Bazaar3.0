import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthService } from '../../../core/auth/auth.service';
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
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();

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
