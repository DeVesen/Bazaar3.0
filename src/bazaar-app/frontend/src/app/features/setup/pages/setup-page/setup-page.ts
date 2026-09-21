import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { TextareaModule } from 'primeng/textarea';
import { BootstrapApi, SetupSellerType } from '../../data/bootstrap-api';

/**
 * Splits a textarea's content into trimmed, non-empty, de-duplicated (case-insensitive) lines —
 * one line = one Marke/Kategorie. Backend rejects a duplicate name with a 409 that aborts the
 * whole setup transaction, so a stray duplicate line would silently nuke admin/seller-types too;
 * de-duping here is lossless (the list was never meant to have two rows for the same name).
 */
function linesOf(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(line);
  }
  return result;
}

/**
 * Setup wizard (docs/requirements/bazaar-app §7). Everything the three steps collect stays
 * local (signals only) — nothing is persisted until `finish()` fires the single
 * `POST /api/public/setup-complete` call. That's what keeps "Zurück" working throughout: an
 * earlier per-step-creates design already had the admin/seller-types persisted by the time the
 * user could go back, so "Zurück" to "Admin-Konto" broke (account already existed).
 */
@Component({
  selector: 'app-setup-page',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    IconFieldModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputIconModule,
    InputPasswordModule,
    InputTextModule,
    StepperModule,
    TextareaModule,
  ],
  templateUrl: './setup-page.html',
  styleUrl: './setup-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupPage {
  private readonly bootstrapApi = inject(BootstrapApi);
  private readonly router = inject(Router);

  // Step 1 - Admin-Konto
  readonly username = signal('');
  readonly password = signal('');
  readonly passwordConfirm = signal('');
  readonly passwordMask = signal(true);
  readonly passwordConfirmMask = signal(true);
  readonly canSubmitAdmin = computed(
    () =>
      this.username().trim().length > 0 &&
      this.password().length >= 8 &&
      this.password() === this.passwordConfirm(),
  );

  // Step 2 - Haendlertypen
  readonly sellerTypeName = signal('');
  readonly sellerTypeCommissionRate = signal(0);
  readonly sellerTypeItemFee = signal(0);
  readonly sellerTypes = signal<SetupSellerType[]>([]);
  readonly sellerTypeError = signal<string | null>(null);
  readonly canAddSellerType = computed(() => this.sellerTypeName().trim().length > 0);
  readonly canProceedPastSellerTypes = computed(() => this.sellerTypes().length > 0);

  // Step 3 - Marken/Kategorien
  readonly brandNamesText = signal('');
  readonly categoryNamesText = signal('');

  // Abschluss
  readonly submitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly setupAlreadyDone = signal(false);

  addSellerType(): void {
    const name = this.sellerTypeName().trim();
    if (!name) return;
    this.sellerTypeError.set(null);

    if (this.sellerTypes().some((sellerType) => sellerType.name.toLowerCase() === name.toLowerCase())) {
      this.sellerTypeError.set('Dieser Händlertyp wurde bereits hinzugefügt.');
      return;
    }

    this.sellerTypes.set([
      ...this.sellerTypes(),
      { name, commissionRate: this.sellerTypeCommissionRate(), itemFee: this.sellerTypeItemFee() },
    ]);
    this.sellerTypeName.set('');
    this.sellerTypeCommissionRate.set(0);
    this.sellerTypeItemFee.set(0);
  }

  finish(): void {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set(null);
    this.setupAlreadyDone.set(false);

    this.bootstrapApi
      .completeSetup({
        username: this.username().trim(),
        password: this.password(),
        sellerTypes: this.sellerTypes(),
        brandNames: linesOf(this.brandNamesText()),
        categoryNames: linesOf(this.categoryNamesText()),
      })
      .subscribe({
        next: () => this.router.navigateByUrl('/login'),
        error: (error: unknown) => {
          this.submitting.set(false);
          const errorCode = (error instanceof HttpErrorResponse ? error.error?.errorCode : null) as
            | string
            | null;
          if (errorCode === 'bootstrap.already_done') {
            this.submitError.set('Setup wurde bereits abgeschlossen. Bitte melde dich an.');
            this.setupAlreadyDone.set(true);
          } else if (error instanceof HttpErrorResponse && error.error?.detail) {
            // Surfaces the real reason (e.g. "Verkäufer-Typ existiert bereits") instead of a
            // blanket message — any of the reused Create*Handlers' 409/400s land here.
            this.submitError.set(error.error.detail);
          } else {
            this.submitError.set('Setup konnte nicht abgeschlossen werden. Bitte erneut versuchen.');
          }
        },
      });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/login');
  }
}
