import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { VerkaeuferNummer } from '../../../shared/verkaeufer-nummer/verkaeufer-nummer';
import { InfoArea } from '../../../shared/info-area/info-area';
import { ProfileApiService, ProfileDto, ChangeEmailPayload, ChangePasswordPayload } from '../profile-api.service';
import { PasswordStrengthMeter, PasswordStrengthLevel } from '../../../shared/password-strength-meter/password-strength-meter';
import { computePasswordStrength } from '../../../shared/password-strength-meter/password-strength';
import { AuthService } from '../../../core/auth/auth.service';

interface ValidationProblem {
  errors?: Record<string, string[]>;
}

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, ButtonModule, InputTextModule, InputNumberModule, TabsModule, VerkaeuferNummer, InfoArea, PasswordStrengthMeter],
  templateUrl: './ProfilePage.html',
  styleUrl: './ProfilePage.scss'
})
export class ProfilePage {
  private readonly api = inject(ProfileApiService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);

  readonly profile = signal<ProfileDto | null>(null);
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly fieldErrors = signal<Record<string, string[]>>({});
  readonly saveError = signal<string | null>(null);
  readonly loadError = signal<string | null>(null);

  readonly canSave = computed(() =>
    this.firstName().trim() !== '' &&
    this.lastName().trim() !== '' &&
    this.postalCode().trim() !== '' &&
    this.city().trim() !== '' &&
    this.phone().trim() !== '');

  readonly newEmail = signal('');
  readonly emailCurrentPassword = signal('');
  readonly emailError = signal<string | null>(null);

  readonly passwordCurrentPassword = signal('');
  readonly newPassword = signal('');
  readonly newPasswordConfirmation = signal('');
  readonly newPasswordLevel = signal<PasswordStrengthLevel>('schwach');
  readonly passwordError = signal<string | null>(null);

  readonly canChangeEmail = computed(() =>
    this.newEmail().trim() !== '' && this.emailCurrentPassword().trim() !== '');

  // Stärke wird direkt aus dem Passwort berechnet statt aus newPasswordLevel gelesen:
  // newPasswordLevel wird nur durch Change Detection auf die Kind-Komponente
  // (app-password-strength-meter) aktualisiert, canChangePassword() muss aber auch
  // unmittelbar nach einem signal.set() (ohne Zwischenrender) korrekt auswerten.
  private readonly newPasswordStrength = computed(() => computePasswordStrength(this.newPassword()));

  readonly canChangePassword = computed(() =>
    this.passwordCurrentPassword().trim() !== '' &&
    this.newPassword().trim() !== '' &&
    this.newPassword() === this.newPasswordConfirmation() &&
    (this.newPasswordStrength() === 'medium' || this.newPasswordStrength() === 'strong'));

  constructor() {
    this.api.getProfile().subscribe({
      next: (profile) => this.applyProfile(profile),
      error: () => this.loadError.set('Profil konnte nicht geladen werden')
    });
  }

  save(): void {
    if (!this.canSave()) return;

    this.fieldErrors.set({});
    this.saveError.set(null);

    this.api.updateProfile({
      firstName: this.firstName(),
      lastName: this.lastName(),
      address: this.address() || null,
      postalCode: this.postalCode(),
      city: this.city(),
      phone: this.phone()
    }).subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        this.messageService.add({ severity: 'success', summary: '✓ Profil gespeichert' });
      },
      error: (response: { status: number; error?: ValidationProblem }) => {
        if (response.status === 400 && response.error?.errors) {
          this.fieldErrors.set(response.error.errors);
        } else {
          this.saveError.set('Profil konnte nicht gespeichert werden');
        }
      }
    });
  }

  changeEmail(): void {
    if (!this.canChangeEmail()) return;

    this.emailError.set(null);

    const payload: ChangeEmailPayload = {
      newEmail: this.newEmail(),
      currentPassword: this.emailCurrentPassword()
    };

    this.api.changeEmail(payload).subscribe({
      next: () => {
        this.newEmail.set('');
        this.emailCurrentPassword.set('');
        this.messageService.add({ severity: 'success', summary: '✓ E-Mail geändert' });
      },
      error: (response: { status: number }) => {
        if (response.status === 401) {
          this.emailError.set('Aktuelles Passwort ist falsch');
        } else if (response.status === 409) {
          this.emailError.set('Diese E-Mail ist bereits vergeben');
        } else {
          this.emailError.set('E-Mail konnte nicht geändert werden');
        }
      }
    });
  }

  changePassword(): void {
    if (!this.canChangePassword()) return;

    this.passwordError.set(null);

    const payload: ChangePasswordPayload = {
      currentPassword: this.passwordCurrentPassword(),
      newPassword: this.newPassword(),
      newPasswordConfirmation: this.newPasswordConfirmation()
    };

    this.api.changePassword(payload).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        this.passwordCurrentPassword.set('');
        this.newPassword.set('');
        this.newPasswordConfirmation.set('');
        this.messageService.add({ severity: 'success', summary: '✓ Passwort geändert' });
      },
      error: (response: { status: number }) => {
        if (response.status === 401) {
          this.passwordError.set('Aktuelles Passwort ist falsch');
        } else {
          this.passwordError.set('Passwort konnte nicht geändert werden');
        }
      }
    });
  }

  private applyProfile(profile: ProfileDto): void {
    this.profile.set(profile);
    this.firstName.set(profile.firstName);
    this.lastName.set(profile.lastName);
    this.address.set(profile.address ?? '');
    this.postalCode.set(profile.postalCode);
    this.city.set(profile.city);
    this.phone.set(profile.phone);
  }
}
