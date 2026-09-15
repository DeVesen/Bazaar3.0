import { Component, computed, effect, inject, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FluidModule } from 'primeng/fluid';
import { AutoFocusModule } from 'primeng/autofocus';
import { MessageService } from 'primeng/api';
import { SellersApiService, CreateSellerPayload } from '../sellers-api.service';
import { SellerTypeOptionsApiService, SellerTypeOption } from '@features/seller-management/seller-type-options-api.service';
import { InfoArea } from '@shared/info-area/info-area';

@Component({
  selector: 'app-seller-create-dialog',
  imports: [FormsModule, DialogModule, ButtonModule, InputTextModule, InputNumberModule, SelectModule, FluidModule, AutoFocusModule, InfoArea, TranslatePipe],
  templateUrl: './seller-create-dialog.html'
})
export class SellerCreateDialog {
  private readonly sellersApi = inject(SellersApiService);
  private readonly sellerTypeApi = inject(SellerTypeOptionsApiService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly visible = model<boolean>(false);
  readonly saved = output<void>();

  readonly sellerTypes = signal<SellerTypeOption[]>([]);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly sellerTypeId = signal('');
  readonly startNumber = signal<number | null>(null);
  readonly blockCount = signal<number | null>(null);
  readonly formError = signal<string | null>(null);

  get firstNameModel() { return this.firstName(); }
  set firstNameModel(v: string) { this.firstName.set(v); }

  get lastNameModel() { return this.lastName(); }
  set lastNameModel(v: string) { this.lastName.set(v); }

  get addressModel() { return this.address(); }
  set addressModel(v: string) { this.address.set(v); }

  get postalCodeModel() { return this.postalCode(); }
  set postalCodeModel(v: string) { this.postalCode.set(v); }

  get cityModel() { return this.city(); }
  set cityModel(v: string) { this.city.set(v); }

  get phoneModel() { return this.phone(); }
  set phoneModel(v: string) { this.phone.set(v); }

  get emailModel() { return this.email(); }
  set emailModel(v: string) { this.email.set(v); }

  get sellerTypeIdModel() { return this.sellerTypeId(); }
  set sellerTypeIdModel(v: string) { this.sellerTypeId.set(v); }

  get startNumberModel() { return this.startNumber(); }
  set startNumberModel(v: number | null) { this.startNumber.set(v); }

  get blockCountModel() { return this.blockCount(); }
  set blockCountModel(v: number | null) { this.blockCount.set(v); }

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }

  readonly selectedType = computed(() => this.sellerTypes().find((t) => t.id === this.sellerTypeId()) ?? null);

  readonly canSubmit = computed(() =>
    this.firstName().trim().length > 0 &&
    this.lastName().trim().length > 0 &&
    this.postalCode().trim().length > 0 &&
    this.city().trim().length > 0 &&
    this.phone().trim().length > 0 &&
    this.email().trim().length > 0 &&
    this.sellerTypeId().trim().length > 0
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        this.firstName.set('');
        this.lastName.set('');
        this.address.set('');
        this.postalCode.set('');
        this.city.set('');
        this.phone.set('');
        this.email.set('');
        this.sellerTypeId.set('');
        this.startNumber.set(null);
        this.blockCount.set(null);
        this.formError.set(null);
        this.sellerTypeApi.getAll().subscribe((types) => this.sellerTypes.set(types));
      }
    });
  }

  cancel(): void {
    this.visible.set(false);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    const payload: CreateSellerPayload = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      address: this.address().trim() || undefined,
      postalCode: this.postalCode().trim(),
      city: this.city().trim(),
      phone: this.phone().trim(),
      email: this.email().trim(),
      sellerTypeId: this.sellerTypeId(),
      startNumber: this.startNumber() ?? undefined,
      blockCount: this.blockCount() ?? undefined
    };

    this.sellersApi.create(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('sellerCreateDialog.saved') });
        this.saved.emit();
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.formError.set(
          err.status === 409
            ? (err.error?.detail ?? this.translate.instant('sellerCreateDialog.saveFailed'))
            : this.translate.instant('sellerCreateDialog.saveFailed')
        );
      }
    });
  }
}
