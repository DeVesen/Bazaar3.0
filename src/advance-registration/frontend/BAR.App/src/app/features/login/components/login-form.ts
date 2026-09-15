import { Component, EventEmitter, Output, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Envelope } from '@primeicons/angular/envelope';
import { Eye } from '@primeicons/angular/eye';
import { EyeSlash } from '@primeicons/angular/eye-slash';
import { Lock } from '@primeicons/angular/lock';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-login-form',
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    Envelope,
    Eye,
    EyeSlash,
    Lock,
    ButtonModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    InputPasswordModule,
    InputTextModule,
    FluidModule,
    PopoverModule
  ],
  template: `
    <p-card>
      <form (ngSubmit)="onSubmit()">
        <h1>{{ 'login.title' | translate }}</h1>

        <p-fluid>
        <label for="login-email">{{ 'login.email' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="envelope"></svg>
          </p-inputicon>
          <input id="login-email" pInputText [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" type="email" required />
        </p-iconfield>

        <label for="login-password">{{ 'login.password' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="lock"></svg>
          </p-inputicon>
          <input
            id="login-password"
            pInputPassword
            [(mask)]="mask"
            [ngModel]="password()"
            (ngModelChange)="password.set($event)"
            name="password"
            required
          />
          <p-inputicon (click)="mask.set(!mask())">
            @if (mask()) {
              <svg data-p-icon="eye"></svg>
            } @else {
              <svg data-p-icon="eye-slash"></svg>
            }
          </p-inputicon>
        </p-iconfield>
        </p-fluid>

        @if (errorMessage()) {
          <p class="login-form__error">{{ errorMessage() }}</p>
        }

        <p-button type="submit" [label]="'login.submit' | translate" severity="primary" [fluid]="true" />

        <button type="button" class="login-form__forgot" (click)="forgotPopover.toggle($event)">{{ 'login.forgotPassword' | translate }}</button>
        <p-popover #forgotPopover>
          <p>{{ 'login.forgotPasswordHint' | translate }}</p>
        </p-popover>

        <p-button type="button" [text]="true" label="{{ 'login.noAccount' | translate }} {{ 'login.registerLink' | translate }}" routerLink="/register" />
      </form>
    </p-card>
  `
})
export class LoginForm {
  readonly errorMessage = input<string | null>(null);
  @Output() readonly submitted = new EventEmitter<{ email: string; password: string }>();

  readonly email = signal('');
  readonly password = signal('');
  readonly mask = signal(true);

  onSubmit(): void {
    this.submitted.emit({ email: this.email(), password: this.password() });
  }
}
