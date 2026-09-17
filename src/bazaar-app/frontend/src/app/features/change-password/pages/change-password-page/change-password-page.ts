import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/auth/auth.service';

interface ChangePasswordResponse {
  accessToken: string;
}

interface BadRequestBody {
  errors?: {
    newPassword?: string[];
  };
}

@Component({
  selector: 'app-change-password-page',
  imports: [FormsModule, ButtonModule, IconFieldModule, InputIconModule, InputPasswordModule],
  templateUrl: './change-password-page.html',
  styleUrl: './change-password-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangePasswordPage {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');

  readonly currentPasswordMask = signal(true);
  readonly newPasswordMask = signal(true);
  readonly confirmPasswordMask = signal(true);

  readonly currentPasswordError = signal<string | null>(null);
  readonly newPasswordError = signal<string | null>(null);

  readonly passwordsMatch = computed(() => this.newPassword() === this.confirmPassword());

  readonly canSubmit = computed(
    () =>
      this.currentPassword().length > 0 &&
      this.newPassword().length > 0 &&
      this.confirmPassword().length > 0 &&
      this.passwordsMatch(),
  );

  onSubmit(): void {
    if (!this.canSubmit()) return;

    this.currentPasswordError.set(null);
    this.newPasswordError.set(null);

    this.http
      .put<ChangePasswordResponse | null>('/api/auth/password', {
        currentPassword: this.currentPassword(),
        newPassword: this.newPassword(),
      })
      .subscribe({
        next: (response) => {
          if (response?.accessToken) {
            this.authService.login(response.accessToken);
          } else {
            this.messageService.add({ severity: 'success', summary: 'Passwort geändert' });
          }
          this.router.navigateByUrl('/intake');
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 401) {
            this.currentPasswordError.set('Aktuelles Passwort ist falsch');
            return;
          }
          if (error instanceof HttpErrorResponse && error.status === 400) {
            const body = error.error as BadRequestBody;
            const message = body?.errors?.newPassword?.[0];
            if (message) this.newPasswordError.set(message);
          }
        },
      });
  }
}
