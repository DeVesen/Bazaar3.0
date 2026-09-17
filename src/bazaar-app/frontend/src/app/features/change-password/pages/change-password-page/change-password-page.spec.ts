import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ChangePasswordPage } from './change-password-page';
import { AuthService } from '../../../../core/auth/auth.service';

describe('ChangePasswordPage', () => {
  let login: ReturnType<typeof vi.fn>;
  let navigateByUrl: ReturnType<typeof vi.fn>;
  let messageServiceAdd: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    login = vi.fn();
    navigateByUrl = vi.fn().mockResolvedValue(true);
    messageServiceAdd = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ChangePasswordPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { login } },
        { provide: Router, useValue: { navigateByUrl } },
        { provide: MessageService, useValue: { add: messageServiceAdd } },
      ],
    }).compileComponents();
  });

  function createPage() {
    const fixture = TestBed.createComponent(ChangePasswordPage);
    const httpMock = TestBed.inject(HttpTestingController);
    return { fixture, httpMock, component: fixture.componentInstance };
  }

  describe('canSubmit', () => {
    it('is false when fields are empty', () => {
      const { component } = createPage();
      expect(component.canSubmit()).toBe(false);
    });

    it('is false when new and confirm passwords do not match', () => {
      const { component } = createPage();
      component.currentPassword.set('altesPasswort1');
      component.newPassword.set('neuesPasswort1');
      component.confirmPassword.set('neuesPasswort2');
      expect(component.canSubmit()).toBe(false);
    });

    it('is true when all fields are filled and new/confirm match', () => {
      const { component } = createPage();
      component.currentPassword.set('altesPasswort1');
      component.newPassword.set('neuesPasswort1');
      component.confirmPassword.set('neuesPasswort1');
      expect(component.canSubmit()).toBe(true);
    });
  });

  function fillValidForm(component: ChangePasswordPage) {
    component.currentPassword.set('altesPasswort1');
    component.newPassword.set('neuesPasswort1');
    component.confirmPassword.set('neuesPasswort1');
  }

  it('on 200 with accessToken calls authService.login and navigates to /intake', () => {
    const { component, httpMock } = createPage();
    fillValidForm(component);

    component.onSubmit();
    const req = httpMock.expectOne('/api/auth/password');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ currentPassword: 'altesPasswort1', newPassword: 'neuesPasswort1' });
    req.flush({ accessToken: 'new-token' });

    expect(login).toHaveBeenCalledWith('new-token');
    expect(navigateByUrl).toHaveBeenCalledWith('/intake');
    httpMock.verify();
  });

  it('on 204 shows a success toast and navigates to /intake', () => {
    const { component, httpMock } = createPage();
    fillValidForm(component);

    component.onSubmit();
    const req = httpMock.expectOne('/api/auth/password');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(messageServiceAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(login).not.toHaveBeenCalled();
    expect(navigateByUrl).toHaveBeenCalledWith('/intake');
    httpMock.verify();
  });

  it('on 401 sets the current-password error and does not navigate', () => {
    const { component, httpMock } = createPage();
    fillValidForm(component);

    component.onSubmit();
    const req = httpMock.expectOne('/api/auth/password');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(component.currentPasswordError()).toBe('Aktuelles Passwort ist falsch');
    expect(navigateByUrl).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
    httpMock.verify();
  });

  it('on 400 shows the newPassword server validation message', () => {
    const { component, httpMock } = createPage();
    fillValidForm(component);

    component.onSubmit();
    const req = httpMock.expectOne('/api/auth/password');
    req.flush(
      { errors: { newPassword: ['Passwort muss mindestens 8 Zeichen lang sein'] } },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(component.newPasswordError()).toBe('Passwort muss mindestens 8 Zeichen lang sein');
    expect(navigateByUrl).not.toHaveBeenCalled();
    httpMock.verify();
  });
});
