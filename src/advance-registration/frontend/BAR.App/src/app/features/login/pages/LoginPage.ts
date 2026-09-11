import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { AuthApiService } from '@core/auth/auth-api.service';
import { AuthService } from '@core/auth/auth.service';
import { PublicInfoService, PublicInfo } from '@core/public-info/public-info.service';
import { LoginLayout } from '../components/login-layout';
import { LoginInfoPanel } from '../components/login-info-panel';
import { LoginForm } from '../components/login-form';

// Verdrahtet Layout, Info-Panel und Login-Form zum Ende-zu-Ende-Login-Flow
// (Epic_Login Abschnitt 4, AC-1/AC-2/AC-3). Das Info-Panel wird erst gerendert,
// sobald PublicInfo geladen ist, weil sein `info`-Input required ist.
@Component({
  selector: 'app-login-page',
  imports: [LoginLayout, LoginInfoPanel, LoginForm, TranslatePipe],
  template: `
    <app-login-layout>
      @if (info(); as loadedInfo) {
        <app-login-info-panel [info]="loadedInfo" />
      }
      <app-login-form form [errorMessage]="errorMessage()" (submitted)="onLoginSubmitted($event)" />
    </app-login-layout>
    @if (!isProduction) {
      <small data-testid="demo-hint" class="login-page__demo-hint">
        {{ 'login.demoHint' | translate }}
      </small>
    }
  `
})
export class LoginPage {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly publicInfoService = inject(PublicInfoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly isProduction = environment.production;
  readonly info = signal<PublicInfo | null>(null);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.publicInfoService.get().subscribe((value) => this.info.set(value));
  }

  onLoginSubmitted(credentials: { email: string; password: string }): void {
    this.errorMessage.set(null);
    this.authApi.login(credentials.email, credentials.password).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        // authGuard haengt die urspruenglich angesteuerte Route als returnUrl an
        // (core/auth/auth.guard.ts). Ohne diese Auswertung landet jeder
        // abgefangene Deep-Link nach dem Login stumm auf /home.
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl ?? '/home');
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error?.detail ?? this.translate.instant('login.invalidCredentials'));
      }
    });
  }
}
