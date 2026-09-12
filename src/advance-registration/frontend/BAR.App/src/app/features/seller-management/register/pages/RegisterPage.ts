import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthApiService } from '@core/auth/auth-api.service';
import { AuthService } from '@core/auth/auth.service';
import { RegistrationForm, RegistrationFormValue } from '../components/registration-form';

// Wires up the registration form into the end-to-end registration flow
// (Epic_Login section 6 flow 1-4, AC-8/AC-9/AC-10/AC-11). Successful
// registration logs in immediately (no second login step, AC-9).
@Component({
  selector: 'app-register-page',
  imports: [RegistrationForm, TranslatePipe],
  template: `
    @if (registrationNotEnabled()) {
      <p class="register-page__error">{{ 'register.notEnabled' | translate }}</p>
    } @else {
      @if (genericError(); as message) {
        <p class="register-page__error" data-testid="register-generic-error">{{ message }}</p>
      }
      <app-registration-form [emailTakenError]="emailTakenError()" (submitted)="onRegisterSubmitted($event)" />
    }
  `
})
export class RegisterPage {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly emailTakenError = signal(false);
  readonly registrationNotEnabled = signal(false);
  /**
   * Catch-all for everything that isn't one of the two known business
   * errors: network error, 500, unknown errorCode. Without this display, the
   * form would stay silently stuck after clicking "Register".
   */
  readonly genericError = signal<string | null>(null);

  onRegisterSubmitted(value: RegistrationFormValue): void {
    this.emailTakenError.set(false);
    this.genericError.set(null);
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
        } else {
          this.genericError.set(err.error?.detail ?? this.translate.instant('register.genericError'));
        }
      }
    });
  }
}
