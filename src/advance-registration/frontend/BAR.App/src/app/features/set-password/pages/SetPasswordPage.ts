import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordStrengthMeter } from '../../../shared/password-strength-meter/password-strength-meter';
import { AuthService } from '../../../core/auth/auth.service';
import { SetPasswordApiService } from '../data/set-password-api.service';

// Ende-zu-Ende-Flow fuer den Admin-Invite-Link: Invite-Token kommt als Query-Param
// (core/auth/auth.guard.ts-Pendant fuers Login gibt es hier nicht, der Link ist
// oeffentlich erreichbar), nach erfolgreichem Setzen wird wie bei LoginPage/RegisterPage
// eingeloggt und auf /home weitergeleitet.
@Component({
  selector: 'app-set-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, InputTextModule, PasswordStrengthMeter],
  template: `
    <h1>Passwort festlegen</h1>
    <label for="set-password-input">Neues Passwort</label>
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
    <button type="button" class="p-button p-button-primary" (click)="onSubmit()">Passwort setzen</button>
  `
})
export class SetPasswordPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly api = inject(SetPasswordApiService);

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
        this.errorMessage.set(err.error?.detail ?? 'Der Link ist ungültig oder abgelaufen.');
      }
    });
  }
}
