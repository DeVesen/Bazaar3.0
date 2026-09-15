import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthApiService } from '@core/auth/auth-api.service';
import { AuthService } from '@core/auth/auth.service';
import { RegistrationForm, RegistrationFormValue } from '../../seller-management/register/components/registration-form';

/**
 * V3/V4: shown instead of login when AdminBootstrapState (backend) reports
 * no admin yet. Reuses the normal registration form as-is (F3 decision:
 * same fields, own welcome text) and calls /api/auth/bootstrap-admin
 * instead of /api/auth/register.
 */
@Component({
  selector: 'app-bootstrap-admin-page',
  imports: [RegistrationForm, TranslatePipe],
  template: `
    <h1>{{ 'bootstrapAdmin.title' | translate }}</h1>
    <p>{{ 'bootstrapAdmin.welcomeText' | translate }}</p>
    @if (genericError(); as message) {
      <p class="bootstrap-admin-page__error" data-testid="bootstrap-admin-generic-error">{{ message }}</p>
    }
    <app-registration-form [emailTakenError]="emailTakenError()" (submitted)="onSubmitted($event)" />
  `
})
export class BootstrapAdminPage {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly emailTakenError = signal(false);
  readonly genericError = signal<string | null>(null);

  onSubmitted(value: RegistrationFormValue): void {
    this.emailTakenError.set(false);
    this.genericError.set(null);
    this.authApi.bootstrapAdmin(value).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        void this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        if (err.error?.errorCode === 'seller.email_taken') {
          this.emailTakenError.set(true);
        } else {
          this.genericError.set(err.error?.detail ?? 'Anlage fehlgeschlagen. Bitte erneut versuchen.');
        }
      }
    });
  }
}
