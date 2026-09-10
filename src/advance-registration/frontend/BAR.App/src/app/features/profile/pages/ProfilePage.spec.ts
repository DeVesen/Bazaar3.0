import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ProfilePage } from './ProfilePage';
import { AuthService } from '../../../core/auth/auth.service';

const PROFILE = {
  id: 'a3f9c2d1', firstName: 'Anna', lastName: 'Beispiel', address: 'Hauptstr. 1',
  postalCode: '76133', city: 'Karlsruhe', phone: '0721 12345', email: 'anna@example.com',
  sellerType: { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 }
};

describe('ProfilePage', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    vi.stubGlobal('ResizeObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
    vi.stubGlobal('AudioContext', class {
      createOscillator() {
        return {
          type: '',
          frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn()
        };
      }
      destination = {}
      currentTime = 0
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the profile and pre-fills the form', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    expect(fixture.componentInstance.firstName()).toBe('Anna');
    expect(fixture.nativeElement.textContent).toContain('Standard');
  });

  it('saves successfully and shows a toast', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.save();
    const putReq = httpMock.expectOne('/api/profile');
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({ ...PROFILE, city: 'Stuttgart' });

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('shows field errors on 400 and keeps entered values', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.city.set('Freiburg');
    fixture.componentInstance.save();
    const putReq = httpMock.expectOne('/api/profile');
    putReq.flush({ errors: { city: ['Ort ist ein Pflichtfeld.'] } }, { status: 400, statusText: 'Bad Request' });

    expect(fixture.componentInstance.fieldErrors()['city']).toEqual(['Ort ist ein Pflichtfeld.']);
    expect(fixture.componentInstance.city()).toBe('Freiburg');
  });

  it('shows a load error when the profile request fails', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush('Server-Fehler', { status: 500, statusText: 'Internal Server Error' });
    fixture.detectChanges();

    expect(fixture.componentInstance.loadError()).toBe('Profil konnte nicht geladen werden');
    expect(fixture.nativeElement.textContent).toContain('Profil konnte nicht geladen werden');
  });

  it('disables saving when a required field is empty', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.city.set('');

    expect(fixture.componentInstance.canSave()).toBe(false);
  });
});

describe('ProfilePage - Zugangsdaten', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal('AudioContext', class {
      createOscillator() {
        return { type: '', frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      }
      destination = {}
      currentTime = 0
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('changes the email with the correct current password', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.newEmail.set('neu@example.com');
    fixture.componentInstance.emailCurrentPassword.set('geheim123!');
    fixture.componentInstance.changeEmail();

    const req = httpMock.expectOne('/api/profile/email');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ newEmail: 'neu@example.com', currentPassword: 'geheim123!' });
    req.flush(null);

    expect(fixture.componentInstance.emailError()).toBeNull();
  });

  it('shows 401 as wrong-password error on email change', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.newEmail.set('neu@example.com');
    fixture.componentInstance.emailCurrentPassword.set('falsch');
    fixture.componentInstance.changeEmail();

    httpMock.expectOne('/api/profile/email').flush('Ungültiges Passwort', { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.emailError()).toBe('Aktuelles Passwort ist falsch');
  });

  it('shows 409 as email-taken error on email change', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.newEmail.set('vergeben@example.com');
    fixture.componentInstance.emailCurrentPassword.set('geheim123!');
    fixture.componentInstance.changeEmail();

    httpMock.expectOne('/api/profile/email').flush('E-Mail vergeben', { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance.emailError()).toBe('Diese E-Mail ist bereits vergeben');
  });

  it('changes the password and updates the auth tokens', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();
    const authService = TestBed.inject(AuthService);
    const loginSpy = vi.spyOn(authService, 'login');

    fixture.componentInstance.passwordCurrentPassword.set('geheim123!');
    fixture.componentInstance.newPassword.set('neuGeheim456!');
    fixture.componentInstance.newPasswordConfirmation.set('neuGeheim456!');
    fixture.componentInstance.changePassword();

    const req = httpMock.expectOne('/api/profile/password');
    expect(req.request.method).toBe('PUT');
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(fixture.componentInstance.passwordError()).toBeNull();
  });

  it('shows 401 as wrong-password error on password change', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.passwordCurrentPassword.set('falsch');
    fixture.componentInstance.newPassword.set('neuGeheim456!');
    fixture.componentInstance.newPasswordConfirmation.set('neuGeheim456!');
    fixture.componentInstance.changePassword();

    httpMock.expectOne('/api/profile/password').flush('Ungültiges Passwort', { status: 401, statusText: 'Unauthorized' });

    expect(fixture.componentInstance.passwordError()).toBe('Aktuelles Passwort ist falsch');
  });

  it('disables the password submit while confirmation does not match', () => {
    const fixture = TestBed.createComponent(ProfilePage);
    fixture.detectChanges();
    httpMock.expectOne('/api/profile').flush(PROFILE);
    fixture.detectChanges();

    fixture.componentInstance.passwordCurrentPassword.set('geheim123!');
    fixture.componentInstance.newPassword.set('neuGeheim456!');
    fixture.componentInstance.newPasswordConfirmation.set('anders789!');

    expect(fixture.componentInstance.canChangePassword()).toBe(false);
  });
});
