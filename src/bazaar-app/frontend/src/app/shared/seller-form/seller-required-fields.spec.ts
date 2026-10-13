import { signal } from '@angular/core';
import {
  missingSellerFields,
  SELLER_REQUIRED_MESSAGES,
  sellerRequiredErrors,
  SellerRequiredField,
  sellerRequiredState,
  SellerRequiredValues,
} from './seller-required-fields';

const VALID: SellerRequiredValues = {
  firstName: 'Max',
  lastName: 'Mustermann',
  city: 'Karlsruhe',
  sellerTypeId: 'type-privat',
  feePerItem: 0.5,
  salesCommission: 10,
};

describe('missingSellerFields', () => {
  it('returns nothing when all six required fields are set', () => {
    expect(missingSellerFields(VALID)).toEqual([]);
  });

  it.each([
    ['firstName', { firstName: '' }],
    ['lastName', { lastName: '   ' }],
    ['city', { city: ' ' }],
    ['sellerTypeId', { sellerTypeId: '' }],
    ['feePerItem', { feePerItem: null }],
    ['salesCommission', { salesCommission: null }],
  ] as [SellerRequiredField, Partial<SellerRequiredValues>][])('reports %s when it is empty', (field, override) => {
    expect(missingSellerFields({ ...VALID, ...override })).toEqual([field]);
  });

  it('treats a fee and a commission of 0 as set', () => {
    expect(missingSellerFields({ ...VALID, feePerItem: 0, salesCommission: 0 })).toEqual([]);
  });
});

describe('sellerRequiredErrors', () => {
  it('reports a message only for fields that are missing and were touched', () => {
    const values = { ...VALID, firstName: '', city: '' };

    const errors = sellerRequiredErrors(values, new Set<SellerRequiredField>(['firstName']));

    expect(errors).toEqual({ firstName: SELLER_REQUIRED_MESSAGES.firstName });
  });

  it('reports nothing for a touched field that is filled', () => {
    const errors = sellerRequiredErrors(VALID, new Set<SellerRequiredField>(['firstName', 'city']));

    expect(errors).toEqual({});
  });
});

describe('sellerRequiredState', () => {
  it('is incomplete and silent while a required field is empty and untouched', () => {
    const values = signal<SellerRequiredValues>({ ...VALID, firstName: '' });

    const state = sellerRequiredState(() => values());

    expect(state.complete()).toBe(false);
    expect(state.errors()).toEqual({});
  });

  it('reports a touched empty field and drops the message once it is filled', () => {
    const values = signal<SellerRequiredValues>({ ...VALID, firstName: '' });
    const state = sellerRequiredState(() => values());

    state.markTouched('firstName');
    expect(state.errors()).toEqual({ firstName: SELLER_REQUIRED_MESSAGES.firstName });

    values.set(VALID);
    expect(state.errors()).toEqual({});
    expect(state.complete()).toBe(true);
  });

  it('forgets touched fields on reset', () => {
    const values = signal<SellerRequiredValues>({ ...VALID, city: '' });
    const state = sellerRequiredState(() => values());
    state.markTouched('city');

    state.reset();

    expect(state.errors()).toEqual({});
  });
});
