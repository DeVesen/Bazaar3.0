import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { RegistrationForm, RegistrationFormValue } from './registration-form';

const de = {
  register: {
    title: 'Registrierung',
    email: 'E-Mail',
    firstName: 'Vorname',
    lastName: 'Nachname',
    address: 'Anschrift',
    postalCode: 'PLZ',
    city: 'Ort',
    phone: 'Telefon',
    password: 'Passwort',
    passwordConfirmation: 'Passwort-Bestätigung',
    submit: 'Registrieren',
    hasAccount: 'Schon ein Konto?',
    loginLink: 'Zum Login',
    passwordMismatch: 'Passwörter stimmen nicht überein',
    emailTaken: 'Diese E-Mail ist bereits registriert.'
  }
};

describe('RegistrationForm', () => {
  let fixture: ComponentFixture<RegistrationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationForm],
      // Stub routes instead of provideRouter([]): the click test below
      // triggers a real router navigation. Without a matching route its
      // promise gets rejected - and only after the fixture's teardown, which
      // Vitest reports as an "Unhandled Rejection - NG0205: Injector has
      // already been destroyed". With a registered route the navigation
      // completes cleanly.
      providers: [
        provideRouter([{ path: 'login', children: [] }, { path: 'register', children: [] }]),
        provideTranslateService()
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', de);
    translate.use('de');
    fixture = TestBed.createComponent(RegistrationForm);
    fixture.detectChanges();
  });

  function fillValidMasterData(): void {
    const component = fixture.componentInstance;
    component.firstName.set('Anna');
    component.lastName.set('Beispiel');
    component.postalCode.set('76133');
    component.city.set('Karlsruhe');
    component.phone.set('0721 12345');
  }

  it('does not emit when passwords do not match', () => {
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    fillValidMasterData();
    component.email.set('anna@example.com');
    component.password.set('geheim123!X');
    component.passwordConfirmation.set('anders');
    component.onSubmit();

    expect(emitted).toBe(false);
    expect(component.passwordMismatch()).toBe(true);
  });

  it('does not emit when password strength is below medium', () => {
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    fillValidMasterData();
    component.email.set('anna@example.com');
    component.password.set('short');
    component.passwordConfirmation.set('short');
    // no onLevelChange('medium'|'strong') triggered - level stays at the default 'weak'.
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('does not emit when a required MasterData field is missing', () => {
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    // fillValidMasterData() deliberately NOT called - lastName stays empty.
    component.email.set('anna@example.com');
    component.password.set('geheim123!');
    component.passwordConfirmation.set('geheim123!');
    component.onLevelChange('stark');
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('emits the full seller payload when all fields are valid', () => {
    const component = fixture.componentInstance;
    let emitted: RegistrationFormValue | undefined;
    component.submitted.subscribe((v) => (emitted = v));

    fillValidMasterData();
    component.email.set('anna@example.com');
    component.password.set('geheim123!');
    component.passwordConfirmation.set('geheim123!');
    component.onLevelChange('stark');
    component.onSubmit();

    expect(emitted).toEqual({
      email: 'anna@example.com',
      password: 'geheim123!',
      firstName: 'Anna',
      lastName: 'Beispiel',
      address: '',
      postalCode: '76133',
      city: 'Karlsruhe',
      phone: '0721 12345'
    });
  });

  it('does not emit when password strength is only "mittel" is not reached (weak by default)', () => {
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitted.subscribe(() => (emitted = true));

    fillValidMasterData();
    component.email.set('anna@example.com');
    component.password.set('geheim123!');
    component.passwordConfirmation.set('geheim123!');
    component.onLevelChange('schwach');
    component.onSubmit();

    expect(emitted).toBe(false);
  });

  it('emits when password strength is exactly "mittel"', () => {
    const component = fixture.componentInstance;
    let emitted: RegistrationFormValue | undefined;
    component.submitted.subscribe((v) => (emitted = v));

    fillValidMasterData();
    component.email.set('anna@example.com');
    component.password.set('geheim123!');
    component.passwordConfirmation.set('geheim123!');
    component.onLevelChange('mittel');
    component.onSubmit();

    expect(emitted).toBeDefined();
  });

  it('shows the email-taken error text with a login link', () => {
    fixture.componentRef.setInput('emailTakenError', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Diese E-Mail ist bereits registriert.');
    const inlineLink: HTMLElement | null = fixture.nativeElement.querySelector('.registration-form__error [routerLink="/login"]');
    expect(inlineLink).not.toBeNull();
  });

  it('renders a standing "Schon ein Konto?" link to /login, independent of emailTakenError', () => {
    // emailTakenError deliberately not set (default false) - the link must still be there.
    const links: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('[routerLink="/login"]');

    expect(links.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).toContain('Schon ein Konto?');
  });

  it('clicking the standing login link does not trigger submit', () => {
    const component = fixture.componentInstance;
    let submitEmitted = false;
    component.submitted.subscribe(() => {
      submitEmitted = true;
    });

    const loginLink: HTMLElement | null = fixture.nativeElement.querySelector('[routerLink="/login"]');
    loginLink?.click();
    fixture.detectChanges();

    expect(submitEmitted).toBe(false);
  });

  it('renders translated labels', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Registrierung');
    expect(text).toContain('Vorname');
    expect(text).toContain('Zum Login');
  });
});

describe('RegistrationForm (English translation)', () => {
  it('renders English labels when the active language is en', () => {
    TestBed.configureTestingModule({
      imports: [RegistrationForm],
      providers: [
        provideRouter([{ path: 'login', children: [] }, { path: 'register', children: [] }]),
        provideTranslateService()
      ]
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      register: {
        title: 'Registration',
        email: 'Email',
        firstName: 'First name',
        lastName: 'Last name',
        address: 'Address',
        postalCode: 'Postal code',
        city: 'City',
        phone: 'Phone',
        password: 'Password',
        passwordConfirmation: 'Confirm password',
        submit: 'Register',
        hasAccount: 'Already have an account?',
        loginLink: 'Go to login',
        passwordMismatch: 'Passwords do not match',
        emailTaken: 'This email is already registered.'
      }
    });
    translate.use('en');
    const fixture = TestBed.createComponent(RegistrationForm);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Registration');
    expect(text).toContain('First name');
    expect(text).toContain('Register');
  });
});
