import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

/**
 * Seller type as read from the backend (Round-13, `SellerTypeDto`). `sellerCount` is
 * display-only in the seller-types table (Task 6) — it is never edited through this popup.
 */
export interface SellerType {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
  sellerCount: number;
}

export interface TypPopupResult {
  name: string;
  commissionRate: number;
  itemFee: number;
}

export type TypPopupInitialValue = TypPopupResult;

/**
 * Field-level messages for a `400` range-validation response from the backend
 * (`commissionRate` outside 0–100, `itemFee` negative — see
 * docs/components/inputnumber/component.md §3). Task 6's store/page maps the response's
 * `errors` dictionary onto this shape and passes it in; this component never calls the API
 * itself (Task 5 has no backend dependency).
 */
export interface TypPopupServerErrors {
  name?: string;
  commissionRate?: string;
  itemFee?: string;
}

@Component({
  selector: 'app-typ-popup',
  imports: [FormsModule, DialogModule, InputTextModule, InputNumberModule, ButtonModule],
  templateUrl: './typ-popup.html',
  styleUrl: './typ-popup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypPopup {
  readonly visible = input.required<boolean>();
  readonly mode = input.required<'create' | 'edit'>();
  readonly initialValue = input<TypPopupInitialValue | null>(null);
  /** Disables the save button while the caller's actual API call (Task 6) is in flight. */
  readonly saving = input<boolean>(false);
  /** Server-side range-validation messages to render under the affected field. */
  readonly serverErrors = input<TypPopupServerErrors | null>(null);

  readonly visibleChange = output<boolean>();
  readonly save = output<TypPopupResult>();
  // `cancel` is the exact API contract from task-5-brief.md / master-data-popup component
  // spec; Task 6 consumes it as `(cancel)`.
  // eslint-disable-next-line @angular-eslint/no-output-native
  readonly cancel = output<void>();

  readonly name = signal('');
  readonly commissionRate = signal(0);
  readonly itemFee = signal(0);

  readonly dialogTitle = computed(() =>
    this.mode() === 'create' ? 'Neuer Verkäufer-Typ' : 'Verkäufer-Typ bearbeiten',
  );

  readonly canSave = computed(
    () =>
      this.name().trim().length > 0 &&
      this.commissionRate() >= 0 &&
      this.commissionRate() <= 100 &&
      this.itemFee() >= 0 &&
      !this.saving(),
  );

  constructor() {
    effect(() => {
      if (this.visible()) {
        const initial = this.initialValue();
        this.name.set(initial?.name ?? '');
        this.commissionRate.set(initial?.commissionRate ?? 0);
        this.itemFee.set(initial?.itemFee ?? 0);
      }
    });
  }

  onSave(): void {
    if (!this.canSave()) return;
    this.save.emit({
      name: this.name().trim(),
      commissionRate: this.commissionRate(),
      itemFee: this.itemFee(),
    });
  }

  onCancel(): void {
    this.cancel.emit();
    this.visibleChange.emit(false);
  }
}
