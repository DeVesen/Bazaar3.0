import { computed, Signal, signal } from '@angular/core';

/** The six fields the Haupt-App requires for a seller (Verkäufer dialog and intake wizard step 1). */
export type SellerRequiredField =
  | 'firstName'
  | 'lastName'
  | 'city'
  | 'sellerTypeId'
  | 'feePerItem'
  | 'salesCommission';

export interface SellerRequiredValues {
  firstName: string;
  lastName: string;
  city: string;
  sellerTypeId: string;
  /** `null` means the number input was cleared; `0` is a valid value. */
  feePerItem: number | null;
  salesCommission: number | null;
}

export const SELLER_REQUIRED_MESSAGES: Record<SellerRequiredField, string> = {
  firstName: 'Vorname ist erforderlich.',
  lastName: 'Nachname ist erforderlich.',
  city: 'Ort ist erforderlich.',
  sellerTypeId: 'Verkäufer-Typ ist erforderlich.',
  feePerItem: 'Gebühr ist erforderlich.',
  salesCommission: 'Provision ist erforderlich.',
};

export function missingSellerFields(values: SellerRequiredValues): SellerRequiredField[] {
  const missing: SellerRequiredField[] = [];
  if (values.firstName.trim().length === 0) missing.push('firstName');
  if (values.lastName.trim().length === 0) missing.push('lastName');
  if (values.city.trim().length === 0) missing.push('city');
  if (values.sellerTypeId.length === 0) missing.push('sellerTypeId');
  if (values.feePerItem === null) missing.push('feePerItem');
  if (values.salesCommission === null) missing.push('salesCommission');
  return missing;
}

export type SellerRequiredErrors = Partial<Record<SellerRequiredField, string>>;

/** Messages for fields that are missing AND were already touched (left by the user). */
export function sellerRequiredErrors(
  values: SellerRequiredValues,
  touched: ReadonlySet<SellerRequiredField>,
): SellerRequiredErrors {
  const errors: SellerRequiredErrors = {};
  for (const field of missingSellerFields(values)) {
    if (touched.has(field)) {
      errors[field] = SELLER_REQUIRED_MESSAGES[field];
    }
  }
  return errors;
}

/** Touched tracking plus derived errors/completeness for one seller form (dialog or wizard step 1). */
export interface SellerRequiredState {
  /** Inline messages for empty required fields the user already left. */
  readonly errors: Signal<SellerRequiredErrors>;
  /** `true` when all six required fields are set. */
  readonly complete: Signal<boolean>;
  markTouched(field: SellerRequiredField): void;
  /** Forgets all touched fields, e.g. when the form is opened again. */
  reset(): void;
}

/**
 * Shared state for the six required seller fields. `values` is read lazily inside the
 * computeds, so a component may pass a closure over signals declared anywhere in the class.
 */
export function sellerRequiredState(values: () => SellerRequiredValues): SellerRequiredState {
  const touched = signal<ReadonlySet<SellerRequiredField>>(new Set());
  const current = computed(values);
  return {
    errors: computed(() => sellerRequiredErrors(current(), touched())),
    complete: computed(() => missingSellerFields(current()).length === 0),
    markTouched: (field) => touched.update((set) => new Set(set).add(field)),
    reset: () => touched.set(new Set()),
  };
}
