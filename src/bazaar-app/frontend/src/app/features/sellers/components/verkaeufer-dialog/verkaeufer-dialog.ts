import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { RoleService } from '../../../../core/auth/role.service';
import { Input } from '../../../../shared/components/input/input';
import {
  SellerRequiredField,
  sellerRequiredState,
} from '../../../../shared/seller-form/seller-required-fields';
// Cross-feature import, read-only: `SellerTypesApi.getAll()` populates the type dropdown.
// Sanctioned explicitly by plan.md ("hier read-only importiert") — see Round-14 Task 8 brief.
// eslint-disable-next-line boundaries/dependencies
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';

/**
 * Full seller stammdaten, as needed to open this dialog in edit mode (see `Seller` in
 * Task 6's `sellers-api.ts`, minus the read-only status/counter fields the dialog never
 * shows or edits). Also doubles as the shape produced on `save` — the caller (Task 10's
 * `sellers.page.ts`) narrows it down to `CreateSellerRequest`/`UpdateSellerRequest` as
 * appropriate (Create never sends `salesCommission`/`feePerItem` — the backend derives
 * them from `sellerTypeId` on creation).
 */
export interface SellerFormValue {
  firstName: string;
  lastName: string;
  email: string | null;
  sellerTypeId: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  salesCommission: number;
  feePerItem: number;
}

export type SellerFormResult = SellerFormValue;

/**
 * Field-level messages for a `400` validation response from the backend — Task 10's page
 * maps the response's `errors` dictionary onto this shape, matching `TypPopupServerErrors`'s
 * pattern from Round-13.
 */
export interface SellerDialogServerErrors {
  firstName?: string;
  lastName?: string;
  city?: string;
  sellerTypeId?: string;
}

@Component({
  selector: 'app-verkaeufer-dialog',
  imports: [
    FormsModule,
    DialogModule,
    ConfirmDialogModule,
    IftaLabelModule,
    Input,
    InputNumberModule,
    SelectModule,
    ButtonModule,
  ],
  templateUrl: './verkaeufer-dialog.html',
  styleUrl: './verkaeufer-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerkaeuferDialog {
  private readonly roleService = inject(RoleService);
  private readonly sellerTypesApi = inject(SellerTypesApi);
  private readonly confirmationService = inject(ConfirmationService);

  readonly visible = input.required<boolean>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly initialValue = input<SellerFormValue | null>(null);
  /** Disables the save button while the caller's actual API call (Task 10) is in flight. */
  readonly saving = input<boolean>(false);
  /** Server-side validation messages to render under the affected field. */
  readonly serverErrors = input<SellerDialogServerErrors | null>(null);
  /**
   * Message for a failed delete (e.g. mapped from a `409 seller.has_articles` response's
   * `detail`) — the page owns the actual `DELETE` call and feeds the result back in here so
   * this dialog can display it without closing.
   */
  readonly deleteError = input<string | null>(null);

  readonly visibleChange = output<boolean>();
  readonly save = output<SellerFormResult>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();
  readonly deleteRequested = output<void>();

  readonly isAdmin = this.roleService.isAdmin;

  readonly sellerTypesList = signal<SellerType[]>([]);

  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly address = signal('');
  readonly postalCode = signal('');
  readonly city = signal('');
  readonly phone = signal('');
  readonly email = signal('');
  readonly sellerTypeId = signal('');
  /** `null` while the number input is cleared; `0` is valid. */
  readonly feePerItem = signal<number | null>(0);
  readonly salesCommission = signal<number | null>(0);

  /** The seller's persisted type/conditions when the dialog was opened (edit mode only). */
  private readonly originalSellerTypeId = signal<string | null>(null);
  private readonly originalFeePerItem = signal(0);
  private readonly originalSalesCommission = signal(0);

  readonly pendingTypeChange = signal<{ typeId: string } | null>(null);

  readonly dialogTitle = computed(() =>
    this.mode() === 'create' ? 'Neuer Verkäufer' : 'Verkäufer bearbeiten',
  );

  /** Only admins may type numeric fee/commission values directly (backend rule). */
  readonly conditionsEditable = computed(() => this.isAdmin());

  private readonly required = sellerRequiredState(() => ({
    firstName: this.firstName(),
    lastName: this.lastName(),
    city: this.city(),
    sellerTypeId: this.sellerTypeId(),
    feePerItem: this.feePerItem(),
    salesCommission: this.salesCommission(),
  }));

  /** Inline messages for empty required fields the user already left. */
  readonly requiredErrors = this.required.errors;

  readonly canSave = computed(() => this.required.complete() && !this.saving());

  markTouched(field: SellerRequiredField): void {
    this.required.markTouched(field);
  }

  constructor() {
    this.sellerTypesApi.getAll().subscribe((types) => this.sellerTypesList.set(types));

    effect(() => {
      if (!this.visible()) return;

      this.required.reset();
      const initial = this.initialValue();
      this.firstName.set(initial?.firstName ?? '');
      this.lastName.set(initial?.lastName ?? '');
      this.address.set(initial?.address ?? '');
      this.postalCode.set(initial?.postalCode ?? '');
      this.city.set(initial?.city ?? '');
      this.phone.set(initial?.phone ?? '');
      this.email.set(initial?.email ?? '');

      if (initial) {
        this.sellerTypeId.set(initial.sellerTypeId);
        this.feePerItem.set(initial.feePerItem);
        this.salesCommission.set(initial.salesCommission);
        this.originalSellerTypeId.set(initial.sellerTypeId);
        this.originalFeePerItem.set(initial.feePerItem);
        this.originalSalesCommission.set(initial.salesCommission);
      } else {
        const defaultType = this.defaultTypeForCreate();
        this.sellerTypeId.set(defaultType?.id ?? '');
        this.feePerItem.set(defaultType?.itemFee ?? 0);
        this.salesCommission.set(defaultType?.commissionRate ?? 0);
        this.originalSellerTypeId.set(null);
        this.originalFeePerItem.set(0);
        this.originalSalesCommission.set(0);
      }
    });
  }

  /** Type with the highest `sellerCount`; first one encountered wins a tie. */
  private defaultTypeForCreate(): SellerType | null {
    const types = this.sellerTypesList();
    if (types.length === 0) return null;
    return types.reduce((best, current) => (current.sellerCount > best.sellerCount ? current : best));
  }

  onTypeChange(newTypeId: string): void {
    const newType = this.sellerTypesList().find((t) => t.id === newTypeId) ?? null;

    if (this.mode() === 'create') {
      this.sellerTypeId.set(newTypeId);
      this.feePerItem.set(newType?.itemFee ?? 0);
      this.salesCommission.set(newType?.commissionRate ?? 0);
      return;
    }

    // Edit mode.
    if (!this.isAdmin()) {
      // Non-admin: the type may change freely, no confirm dialog needed — a non-admin
      // never has a way to edit fee/commission directly (conditionsEditable() is
      // false), so there is nothing for them to confirm against. The server derives
      // the new type's conditions itself on save (UpdateSellerHandler), silently
      // overriding whatever fee/commission this dialog happens to send — so leaving
      // these signals untouched here is fine, they're informational only.
      this.sellerTypeId.set(newTypeId);
      return;
    }

    if (newTypeId === this.originalSellerTypeId()) {
      // Switching back to the seller's current type: nothing actually changes.
      this.sellerTypeId.set(newTypeId);
      this.feePerItem.set(this.originalFeePerItem());
      this.salesCommission.set(this.originalSalesCommission());
      return;
    }

    if (!newType) {
      this.sellerTypeId.set(newTypeId);
      return;
    }

    const oldType = this.sellerTypesList().find((t) => t.id === this.originalSellerTypeId());
    const oldName = oldType?.name ?? 'aktueller Typ';
    const oldCommission = oldType?.commissionRate ?? this.originalSalesCommission();
    const oldFee = oldType?.itemFee ?? this.originalFeePerItem();

    this.pendingTypeChange.set({ typeId: newTypeId });
    this.confirmationService.confirm({
      key: 'typeChange',
      header: 'Verkäufer-Typ ändern',
      message:
        `Der Verkäufer-Typ wird von '${oldName}' (Provision ${this.formatPercent(oldCommission)}, ` +
        `Gebühr ${this.formatCurrency(oldFee)}) auf '${newType.name}' ` +
        `(Provision ${this.formatPercent(newType.commissionRate)}, Gebühr ${this.formatCurrency(newType.itemFee)}) ` +
        'geändert. Fortfahren?',
      accept: () => {
        this.sellerTypeId.set(newTypeId);
        this.feePerItem.set(newType.itemFee);
        this.salesCommission.set(newType.commissionRate);
        this.pendingTypeChange.set(null);
      },
      reject: () => {
        this.pendingTypeChange.set(null);
      },
    });
  }

  private formatPercent(value: number): string {
    return `${value.toLocaleString('de-DE', { maximumFractionDigits: 2 })}%`;
  }

  private formatCurrency(value: number): string {
    return `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
  }

  onSave(): void {
    const feePerItem = this.feePerItem();
    const salesCommission = this.salesCommission();
    if (!this.canSave() || feePerItem === null || salesCommission === null) return;
    this.save.emit({
      firstName: this.firstName().trim(),
      lastName: this.lastName().trim(),
      email: this.email().trim() || null,
      sellerTypeId: this.sellerTypeId(),
      address: this.address().trim() || null,
      postalCode: this.postalCode().trim() || null,
      city: this.city().trim(),
      phone: this.phone().trim() || null,
      // Always send the current signal values. A non-admin never has a way to change
      // these (conditionsEditable() is false, and onTypeChange() leaves them untouched
      // for a non-admin), so they end up resending the seller's original conditions
      // naturally — no special-casing needed here. On a type change, the server
      // recomputes salesCommission/feePerItem from the new type and ignores whatever
      // is sent in this request (UpdateSellerHandler, Round-14 review fix), so it
      // doesn't matter whether an admin's request carries the new type's values (set by
      // onTypeChange's confirm) or stale ones — the server-derived result is the same.
      feePerItem,
      salesCommission,
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }

  onDeleteClick(): void {
    const name = `${this.firstName()} ${this.lastName()}`.trim();
    this.confirmationService.confirm({
      key: 'delete',
      header: 'Verkäufer löschen',
      message: `Verkäufer '${name}' wirklich löschen?`,
      accept: () => {
        this.deleteRequested.emit();
      },
    });
  }
}
