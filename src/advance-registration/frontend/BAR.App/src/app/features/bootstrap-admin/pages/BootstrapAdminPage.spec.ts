import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/auth/auth.service';
import { BootstrapAdminPage } from './BootstrapAdminPage';

describe('BootstrapAdminPage', () => {
  let fixture: ComponentFixture<BootstrapAdminPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BootstrapAdminPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        provideRouter([{ path: 'home', children: [] }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BootstrapAdminPage);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('on successful submission logs the new admin in and navigates to /home', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const loginSpy = vi.spyOn(authService, 'login');

    fixture.componentInstance.onSubmitted({
      email: 'chef@example.com', password: 'geheim123!', firstName: 'Chef', lastName: 'Basar',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 1'
    });

    const req = httpMock.expectOne('/api/auth/bootstrap-admin');
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('on email-taken conflict shows the emailTakenError state', () => {
    fixture.componentInstance.onSubmitted({
      email: 'chef@example.com', password: 'geheim123!', firstName: 'Chef', lastName: 'Basar',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 1'
    });

    const req = httpMock.expectOne('/api/auth/bootstrap-admin');
    req.flush({ errorCode: 'seller.email_taken' }, { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance.emailTakenError()).toBe(true);
  });

  it('on a generic (non email-taken) error shows the backend detail message', () => {
    fixture.componentInstance.onSubmitted({
      email: 'chef@example.com', password: 'geheim123!', firstName: 'Chef', lastName: 'Basar',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 1'
    });

    const req = httpMock.expectOne('/api/auth/bootstrap-admin');
    req.flush({ detail: 'some backend detail message' }, { status: 500, statusText: 'Internal Server Error' });

    expect(fixture.componentInstance.genericError()).toBe('some backend detail message');
    expect(fixture.componentInstance.emailTakenError()).toBe(false);
  });
});
