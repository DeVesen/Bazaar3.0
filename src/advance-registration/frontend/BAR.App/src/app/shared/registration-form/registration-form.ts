import { Component, EventEmitter, Output, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Envelope } from '@primeicons/angular/envelope';
import { Eye } from '@primeicons/angular/eye';
import { EyeSlash } from '@primeicons/angular/eye-slash';
import { Hashtag } from '@primeicons/angular/hashtag';
import { Home } from '@primeicons/angular/home';
import { Lock } from '@primeicons/angular/lock';
import { MapMarker } from '@primeicons/angular/map-marker';
import { Phone } from '@primeicons/angular/phone';
import { User } from '@primeicons/angular/user';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { FluidModule } from 'primeng/fluid';
import { PasswordStrengthLevel, PasswordStrengthMeter } from '@shared/password-strength-meter/password-strength-meter';

export interface RegistrationFormValue {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
}

@Component({
  selector: 'app-registration-form',
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    Envelope,
    Eye,
    EyeSlash,
    Hashtag,
    Home,
    Lock,
    MapMarker,
    Phone,
    User,
    ButtonModule,
    CardModule,
    IconFieldModule,
    InputIconModule,
    InputPasswordModule,
    InputTextModule,
    FluidModule,
    PasswordStrengthMeter
  ],
  template: `
    <p-card>
      <form (ngSubmit)="onSubmit()">
        <h1>{{ 'register.title' | translate }}</h1>

        <p-fluid>
        <label for="register-email">{{ 'register.email' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="envelope"></svg>
          </p-inputicon>
          <input id="register-email" pInputText [ngModel]="email()" (ngModelChange)="email.set($event)" name="email" type="email" required />
        </p-iconfield>
        @if (emailTakenError()) {
          <p class="registration-form__error">{{ 'register.emailTaken' | translate }} <a routerLink="/login">{{ 'register.loginLink' | translate }}</a></p>
        }

        <label for="register-first-name">{{ 'register.firstName' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="user"></svg>
          </p-inputicon>
          <input id="register-first-name" pInputText [ngModel]="firstName()" (ngModelChange)="firstName.set($event)" name="firstName" required />
        </p-iconfield>

        <label for="register-last-name">{{ 'register.lastName' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="user"></svg>
          </p-inputicon>
          <input id="register-last-name" pInputText [ngModel]="lastName()" (ngModelChange)="lastName.set($event)" name="lastName" required />
        </p-iconfield>

        <label for="register-address">{{ 'register.address' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="home"></svg>
          </p-inputicon>
          <input id="register-address" pInputText [ngModel]="address()" (ngModelChange)="address.set($event)" name="address" />
        </p-iconfield>

        <label for="register-postal-code">{{ 'register.postalCode' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="hashtag"></svg>
          </p-inputicon>
          <input id="register-postal-code" pInputText [ngModel]="postalCode()" (ngModelChange)="postalCode.set($event)" name="postalCode" required />
        </p-iconfield>

        <label for="register-city">{{ 'register.city' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="map-marker"></svg>
          </p-inputicon>
          <input id="register-city" pInputText [ngModel]="city()" (ngModelChange)="city.set($event)" name="city" required />
        </p-iconfield>

        <label for="register-phone">{{ 'register.phone' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="phone"></svg>
          </p-inputicon>
          <input id="register-phone" pInputText [ngModel]="phone()" (ngModelChange)="phone.set($event)" name="phone" required />
        </p-iconfield>

        <label for="register-password">{{ 'register.password' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="lock"></svg>
          </p-inputicon>
          <input
            id="register-password"
            pInputPassword
            [(mask)]="passwordMask"
            [ngModel]="password()"
            (ngModelChange)="password.set($event)"
            name="password"
            required
          />
          <p-inputicon (click)="passwordMask.set(!passwordMask())">
            @if (passwordMask()) {
              <svg data-p-icon="eye"></svg>
            } @else {
              <svg data-p-icon="eye-slash"></svg>
            }
          </p-inputicon>
        </p-iconfield>
        <app-password-strength-meter [password]="password()" (level)="onLevelChange($event)" />

        <label for="register-password-confirmation">{{ 'register.passwordConfirmation' | translate }}</label>
        <p-iconfield>
          <p-inputicon>
            <svg data-p-icon="lock"></svg>
          </p-inputicon>
          <input
            id="register-password-confirmation"
            pInputPassword
            [(mask)]="passwordConfirmationMask"
            [ngModel]="passwordConfirmation()"
            (ngModelChange)="passwordConfirmation.set($event)"
            name="passwordConfirmation"
            required
          />
          <p-inputicon (click)="passwordConfirmationMask.set(!passwordConfirmationMask())">
            @if (passwordConfirmationMask()) {
              <svg data-p-icon="eye"></svg>
            } @else {
              <svg data-p-icon="eye-slash"></svg>
            }
          </p-inputicon>
        </p-iconfield>
        @if (passwordMismatch()) {
          <p class="registration-form__error">{{ 'register.passwordMismatch' | translate }}</p>
        }
        </p-fluid>

        <p-button type="submit" [label]="'register.submit' | translate" severity="primary" [fluid]="true" [disabled]="!canSubmit()" />

        <p-button type="button" [text]="true" label="{{ 'register.hasAccount' | translate }} {{ 'register.loginLink' | translate }}" routerLink="/login" />
      </form>
    </p-card>
  `
})
export class RegistrationForm {
  readonly emailTakenError = input(false);
  @Output() readonly submitted = new EventEmitter<RegistrationFormValue>();

  readonly email = signal('');
  readonly password = signal('');
  readonly passwordConfirmation = signal('');
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');

  readonly passwordMask = signal(true);
  readonly passwordConfirmationMask = signal(true);

  private readonly passwordLevel = signal<PasswordStrengthLevel>('schwach');

  readonly passwordMismatch = computed(
    () => this.passwordConfirmation().length > 0 && this.password() !== this.passwordConfirmation()
  );

  private readonly hasRequiredMasterData = computed(() =>
    [this.firstName(), this.lastName(), this.postalCode(), this.city(), this.phone()].every((v) => v.length > 0)
  );

  readonly canSubmit = computed(() => {
    const level = this.passwordLevel();
    return (
      this.email().length > 0 &&
      this.hasRequiredMasterData() &&
      this.password().length > 0 &&
      this.password() === this.passwordConfirmation() &&
      (level === 'mittel' || level === 'stark')
    );
  });

  onLevelChange(level: PasswordStrengthLevel): void {
    this.passwordLevel.set(level);
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.submitted.emit({
      email: this.email(),
      password: this.password(),
      firstName: this.firstName(),
      lastName: this.lastName(),
      address: this.address(),
      postalCode: this.postalCode(),
      city: this.city(),
      phone: this.phone()
    });
  }
}
