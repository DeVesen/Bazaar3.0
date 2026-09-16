import { Component, computed, effect, inject, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FluidModule } from 'primeng/fluid';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { AutoFocusModule } from 'primeng/autofocus';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SellersApiService, Seller, NumberBlock, UpdateSellerPayload } from '../sellers-api.service';
import { SellerTypeOptionsApiService, SellerTypeOption } from '@features/seller-management/seller-type-options-api.service';
import { Badge } from '@shared/badge/badge';
import { InfoArea } from '@shared/info-area/info-area';

@Component({
  selector: 'app-seller-edit-dialog',
  imports: [
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    FluidModule,
    ToggleSwitchModule,
    AutoFocusModule,
    Badge,
    InfoArea,
    TranslatePipe
  ],
  templateUrl: './seller-edit-dialog.html',
  styles: [`
    /* PrimeNG 22.1 injiziert fuer p-toggleswitch keine Runtime-CSS (Klassen/Struktur
       im DOM korrekt, aber Design-Tokens greifen nicht) — Notstyling bis Upstream-Fix. */
    :host ::ng-deep .p-toggleswitch {
      position: relative;
      display: inline-flex;
      width: 2.25rem;
      height: 1.375rem;
      flex-shrink: 0;

      .p-toggleswitch-input {
        position: absolute;
        inset: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        margin: 0;
        opacity: 0;
        cursor: pointer;
      }

      .p-toggleswitch-slider {
        position: absolute;
        inset: 0;
        border-radius: 30px;
        background: var(--color-border);
        transition: background 0.2s;
      }

      .p-toggleswitch-handle {
        position: absolute;
        top: 50%;
        left: 0.2rem;
        width: 0.875rem;
        height: 0.875rem;
        border-radius: 50%;
        background: #fff;
        transform: translateY(-50%);
        transition: left 0.2s;
      }

      &.p-toggleswitch-checked .p-toggleswitch-slider {
        background: var(--color-accent);
      }

      &.p-toggleswitch-checked .p-toggleswitch-handle {
        left: calc(100% - 0.875rem - 0.2rem);
      }
    }
  `]
})
export class SellerEditDialog {
  private readonly sellersApi = inject(SellersApiService);
  private readonly sellerTypeApi = inject(SellerTypeOptionsApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translate = inject(TranslateService);

  readonly visible = model<boolean>(false);
  readonly item = input<Seller | null>(null);
  readonly saved = output<void>();

  readonly sellerTypes = signal<SellerTypeOption[]>([]);
  readonly blocks = signal<NumberBlock[]>([]);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly sellerTypeId = signal('');
  readonly isAdmin = signal(false);
  readonly formError = signal<string | null>(null);

  readonly reserveBlockCount = signal<number | null>(1);
  readonly reserveStartNumber = signal<number | null>(null);
  readonly reserveError = signal<string | null>(null);

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

  get isAdminModel() { return this.isAdmin(); }
  set isAdminModel(v: boolean) { this.isAdmin.set(v); }

  get reserveBlockCountModel() { return this.reserveBlockCount(); }
  set reserveBlockCountModel(v: number | null) { this.reserveBlockCount.set(v); }

  get reserveStartNumberModel() { return this.reserveStartNumber(); }
  set reserveStartNumberModel(v: number | null) { this.reserveStartNumber.set(v); }

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
    // Reset + reload every time the dialog is (re-)opened for a seller — the
    // dialog instance is reused across rows, so both the profile fields and
    // the block list must come from this seller, not a stale previous one.
    effect(() => {
      const seller = this.item();
      if (this.visible() && seller) {
        this.firstName.set(seller.firstName);
        this.lastName.set(seller.lastName);
        this.address.set(seller.address ?? '');
        this.postalCode.set(seller.postalCode);
        this.city.set(seller.city);
        this.phone.set(seller.phone);
        this.email.set(seller.email);
        this.sellerTypeId.set(seller.sellerTypeId);
        this.isAdmin.set(seller.isAdmin);
        this.formError.set(null);
        this.reserveError.set(null);
        this.reserveBlockCount.set(1);

        this.sellerTypeApi.getAll().subscribe((types) => this.sellerTypes.set(types));
        this.reloadBlocks(seller.id);
      }
    });

    // Re-fetches the next-free-start-number suggestion whenever the panel
    // opens or "Anzahl Blöcke" changes (Epic_Verkaeufer §4 Panel 04) — kept
    // as a second effect so it also re-runs on later block-count edits, not
    // only on the initial reset above.
    effect(() => {
      const blockCount = this.reserveBlockCount();
      if (this.visible() && this.item()) {
        this.sellersApi.nextFreeStartNumber(blockCount ?? 1).subscribe((r) => this.reserveStartNumber.set(r.startNumber));
      }
    });
  }

  private reloadBlocks(sellerId: string): void {
    this.sellersApi.getBlocks(sellerId).subscribe((blocks) => this.blocks.set(blocks));
  }

  isDeletable(block: NumberBlock): boolean {
    return block.usedCount === 0;
  }

  cancel(): void {
    this.visible.set(false);
  }

  submit(): void {
    const seller = this.item();
    if (!seller || !this.canSubmit()) return;

    const payload: UpdateSellerPayload = {
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      address: this.address().trim() || undefined,
      postalCode: this.postalCode().trim(),
      city: this.city().trim(),
      phone: this.phone().trim(),
      email: this.email().trim(),
      sellerTypeId: this.sellerTypeId(),
      isAdmin: this.isAdmin()
    };

    this.sellersApi.update(seller.id, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('sellerEditDialog.saved') });
        this.saved.emit();
        this.visible.set(false);
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.formError.set(
          err.status === 409
            ? (err.error?.detail ?? this.translate.instant('sellerEditDialog.saveFailed'))
            : this.translate.instant('sellerEditDialog.saveFailed')
        );
      }
    });
  }

  onDeleteBlock(block: NumberBlock): void {
    const seller = this.item();
    if (!seller) return;

    this.confirmationService.confirm({
      message: this.translate.instant('sellerEditDialog.confirmDeleteBlock'),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => {
        this.sellersApi.deleteBlock(seller.id, block.id).subscribe(() => this.reloadBlocks(seller.id));
      }
    });
  }

  onReserve(): void {
    const seller = this.item();
    if (!seller) return;

    this.reserveError.set(null);
    this.sellersApi
      .reserveBlocks(seller.id, {
        startNumber: this.reserveStartNumber() ?? undefined,
        blockCount: this.reserveBlockCount() ?? undefined
      })
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: this.translate.instant('sellerEditDialog.reserved') });
          this.reloadBlocks(seller.id);
        },
        error: (err: { status?: number; error?: { detail?: string } }) => {
          this.reserveError.set(
            err.status === 409
              ? (err.error?.detail ?? this.translate.instant('sellerEditDialog.reserveConflict'))
              : this.translate.instant('sellerEditDialog.reserveFailed')
          );
        }
      });
  }

  onDeleteSeller(): void {
    const seller = this.item();
    if (!seller) return;

    this.confirmationService.confirm({
      message: this.translate.instant('sellers.confirmDelete', { firstName: seller.firstName, lastName: seller.lastName }),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => {
        this.sellersApi.delete(seller.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: this.translate.instant('sellers.deleted') });
            this.saved.emit();
            this.visible.set(false);
          },
          error: (err: { status?: number; error?: { detail?: string } }) => {
            this.messageService.add({
              severity: 'error',
              summary: err.status === 409 ? (err.error?.detail ?? this.translate.instant('sellers.deleteFailed')) : this.translate.instant('sellers.deleteFailed')
            });
          }
        });
      }
    });
  }

  onInviteClick(): void {
    const seller = this.item();
    if (!seller) return;

    this.sellersApi.invite(seller.id).subscribe((result) => {
      void navigator.clipboard.writeText(result.inviteUrl);
      this.messageService.add({ severity: 'success', summary: this.translate.instant('sellerEditDialog.inviteCopied') });
    });
  }
}
