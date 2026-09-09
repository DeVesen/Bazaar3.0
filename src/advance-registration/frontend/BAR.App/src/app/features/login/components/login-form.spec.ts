import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  let fixture: ComponentFixture<LoginForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginForm],
      // Stub-Routen statt provideRouter([]): der Klick-Test unten loest eine
      // echte Router-Navigation aus. Ohne passende Route wird deren Promise
      // abgelehnt - und zwar erst nach dem Teardown des Fixtures, was Vitest
      // als "Unhandled Rejection - NG0205: Injector has already been destroyed"
      // meldet. Mit registrierter Route laeuft die Navigation sauber durch.
      providers: [provideRouter([{ path: 'register', children: [] }, { path: 'login', children: [] }])]
    }).compileComponents();
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
});
