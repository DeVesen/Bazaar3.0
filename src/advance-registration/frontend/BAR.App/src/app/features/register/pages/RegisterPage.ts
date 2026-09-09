import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthApiService } from '../../../core/auth/auth-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { RegistrierungForm, RegistrierungFormValue } from '../components/registrierung-form';

// Verdrahtet die Registrierungs-Form zum Ende-zu-Ende-Registrierungs-Flow
// (Epic_Login Abschnitt 6 Ablauf 1-4, AC-8/AC-9/AC-10/AC-11). Erfolgreiche
// Registrierung loggt sofort ein (kein zweiter Login-Schritt, AC-9).
@Component({
  selector: 'app-register-page',
  imports: [RegistrierungForm],
  template: `
    @if (registrationNotEnabled()) {
      <p class="register-page__error">Registrierung ist noch nicht freigeschaltet.</p>
    } @else {
      <app-registrierung-form [emailTakenError]="emailTakenError()" (submitted)="onRegisterSubmitted($event)" />
    }
  `
})
export class RegisterPage {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly emailTakenError = signal(false);
  readonly registrationNotEnabled = signal(false);

  onRegisterSubmitted(value: RegistrierungFormValue): void {
    this.emailTakenError.set(false);
    this.authApi.register(value).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        void this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        if (err.error?.errorCode === 'seller.email_taken') {
          this.emailTakenError.set(true);
        } else if (err.error?.errorCode === 'registration.not_enabled') {
          this.registrationNotEnabled.set(true);
        }
      }
    });
  }
}
