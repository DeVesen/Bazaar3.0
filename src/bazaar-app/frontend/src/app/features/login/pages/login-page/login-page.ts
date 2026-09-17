import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginCredentials, LoginForm } from '../../components/login-form/login-form';
import { AuthService } from '../../../../core/auth/auth.service';

interface LoginResponse {
  accessToken: string;
}

@Component({
  selector: 'app-login-page',
  imports: [LoginForm],
  template: `<app-login-form [errorMessage]="errorMessage()" (submitted)="onSubmit($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string | null>(null);

  onSubmit({ username, password }: LoginCredentials): void {
    this.errorMessage.set(null);
    this.http.post<LoginResponse>('/api/auth/login', { username, password }).subscribe({
      next: ({ accessToken }) => {
        this.authService.login(accessToken);
        this.router.navigateByUrl('/intake');
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.errorMessage.set('Ungültige Anmeldedaten');
        } else {
          this.errorMessage.set('Anmeldung derzeit nicht möglich. Bitte später erneut versuchen.');
        }
      },
    });
  }
}
