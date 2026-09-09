import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { VerkaeuferNummer } from '../../../shared/verkaeufer-nummer/verkaeufer-nummer';
import { InfoArea } from '../../../shared/info-area/info-area';
import { ProfileApiService, ProfileDto } from '../profile-api.service';

interface ValidationProblem {
  errors?: Record<string, string[]>;
}

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, ButtonModule, InputTextModule, InputNumberModule, TabsModule, VerkaeuferNummer, InfoArea],
  templateUrl: './ProfilePage.html'
})
export class ProfilePage {
  private readonly api = inject(ProfileApiService);
  private readonly messageService = inject(MessageService);

  readonly profile = signal<ProfileDto | null>(null);
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly fieldErrors = signal<Record<string, string[]>>({});
  readonly saveError = signal<string | null>(null);

  readonly canSave = computed(() =>
    this.firstName().trim() !== '' &&
    this.lastName().trim() !== '' &&
    this.postalCode().trim() !== '' &&
    this.city().trim() !== '' &&
    this.phone().trim() !== '');

  constructor() {
    this.api.getProfile().subscribe((profile) => this.applyProfile(profile));
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
