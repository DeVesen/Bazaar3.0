import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from './login-form';

const de = {
  login: {
    title: 'Anmelden',
    email: 'E-Mail',
    password: 'Passwort',
    submit: 'Anmelden',
    forgotPassword: 'Passwort vergessen?',
    forgotPasswordHint: 'Bitte wende dich an den Admin, um dein Passwort zurückzusetzen.',
    noAccount: 'Noch kein Konto?',
    registerLink: 'Jetzt registrieren'
  }
};

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      // Stub routes instead of provideRouter([]): the click test below
      // triggers a real router navigation. Without a matching route its
      // promise gets rejected - and only after the fixture's teardown, which
      // Vitest reports as an "Unhandled Rejection - NG0205: Injector has
      // already been destroyed". With a registered route the navigation
      // completes cleanly.
      providers: [
        provideRouter([{ path: 'register', children: [] }, { path: 'login', children: [] }]),
        provideTranslateService()
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', de);
    translate.use('de');
    fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();
  });

  it('emits submitted with email and password on submit', () => {
    const component = fixture.componentInstance;
    let emitted: { email: string; password: string } | undefined;
    component.submitted.subscribe((v) => (emitted = v));

    component.email.set('anna@example.com');
    component.password.set('geheim123');
    component.onSubmit();

    expect(emitted).toEqual({ email: 'anna@example.com', password: 'geheim123' });
  });

  it('shows the given error message', () => {
    fixture.componentRef.setInput('errorMessage', 'Ungültige Anmeldedaten');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Ungültige Anmeldedaten');
  });

  it('renders a register link pointing to /register', () => {
    const link: HTMLElement | null = fixture.nativeElement.querySelector('[routerLink="/register"]');

    expect(link).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Noch kein Konto?');
  });

  it('clicking the register link does not emit submitted', () => {
    const component = fixture.componentInstance;
    let submitEmitted = false;
    component.submitted.subscribe(() => {
      submitEmitted = true;
    });

    const registerLink: HTMLElement | null = fixture.nativeElement.querySelector('[routerLink="/register"]');
    registerLink?.click();
    fixture.detectChanges();

    expect(submitEmitted).toBe(false);
  });

  it('shows the exact popover text for forgot password', () => {
    const forgotButton: HTMLElement = fixture.nativeElement.querySelector('.login-form__forgot');
    forgotButton.click();
    fixture.detectChanges();

    const popoverText: string = document.body.textContent ?? '';

    expect(popoverText).toContain('Bitte wende dich an den Admin, um dein Passwort zurückzusetzen.');
  });

  it('renders translated labels', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Anmelden');
    expect(text).toContain('E-Mail');
    expect(text).toContain('Jetzt registrieren');
  });
});

describe('LoginForm (English translation)', () => {
  it('renders English labels when the active language is en', () => {
    TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [
        provideRouter([{ path: 'register', children: [] }, { path: 'login', children: [] }]),
        provideTranslateService()
      ]
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      login: {
        title: 'Sign in',
        email: 'Email',
        password: 'Password',
        submit: 'Sign in',
        forgotPassword: 'Forgot your password?',
        forgotPasswordHint: 'Please contact the admin to reset your password.',
        noAccount: "Don't have an account?",
        registerLink: 'Register now'
      }
    });
    translate.use('en');
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Sign in');
    expect(text).toContain('Register now');
  });
});
