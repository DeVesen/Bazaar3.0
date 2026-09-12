import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PasswordStrengthMeter } from '@shared/password-strength-meter/password-strength-meter';
import { AuthService } from '@core/auth/auth.service';
import { SetPasswordApiService } from '../data/set-password-api.service';

// End-to-end flow for the admin invite link: the invite token comes as a
// query param (there's no core/auth/auth.guard.ts equivalent for login here,
// the link is publicly reachable); after successfully setting the password,
// login happens and it redirects to /home, same as LoginPage/RegisterPage.
@Component({
  selector: 'app-set-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputTextModule, PasswordStrengthMeter, TranslatePipe],
  template: `
    <h1>{{ 'setPassword.title' | translate }}</h1>
    <label for="set-password-input">{{ 'setPassword.newPassword' | translate }}</label>
    <input
      id="set-password-input"
      pInputText
      type="password"
      [ngModel]="password()"
      (ngModelChange)="password.set($event)"
    />
    <app-password-strength-meter [password]="password()" />
    @if (errorMessage()) {
      <p class="set-password__error">{{ errorMessage() }}</p>
    }
    <button type="button" class="p-button p-button-primary" (click)="onSubmit()">{{ 'setPassword.submit' | translate }}</button>
  `
})
export class SetPasswordPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly api = inject(SetPasswordApiService);
  private readonly translate = inject(TranslateService);

  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly password = signal('');
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    this.errorMessage.set(null);
    this.api.setPassword(this.token, this.password()).subscribe({
      next: (result) => {
        this.authService.login(result.accessToken, result.refreshToken);
        void this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        // 401 (token unknown/used/expired) and 400 (password too weak) are
        // distinct business errors and need distinct messages - see
        // api/auth.md §4.
        if (err.status === 401) {
          this.errorMessage.set(this.translate.instant('setPassword.invalidLink'));
        } else if (err.status === 400) {
          this.errorMessage.set(
            err.error?.errors?.password?.[0] ?? err.error?.detail ?? this.translate.instant('setPassword.weakPassword')
          );
        } else {
          this.errorMessage.set(this.translate.instant('setPassword.genericError'));
        }
      }
    });
  }
}
