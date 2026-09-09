import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TypPopup } from './typ-popup';
import { MessageService } from 'primeng/api';
import type { SellerType } from '../../features/seller-types/seller-type-api.service';

function create(item: SellerType | null, saveFn = vi.fn()) {
  TestBed.configureTestingModule({ providers: [MessageService] });
  const fixture = TestBed.createComponent(TypPopup);
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('saveFn', saveFn);
  fixture.componentInstance.visible.set(true);
  fixture.detectChanges();
  return fixture;
}

describe('TypPopup', () => {
  it('create mode (no item) starts with empty fields', () => {
    const fixture = create(null);

    expect(fixture.componentInstance.name()).toBe('');
    expect(fixture.componentInstance.commissionRate()).toBe(0);
    expect(fixture.componentInstance.itemFee()).toBe(0);
  });

  it('edit mode pre-fills all three fields from item', () => {
    const item: SellerType = { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 };

    const fixture = create(item);

    expect(fixture.componentInstance.name()).toBe('Standard');
    expect(fixture.componentInstance.commissionRate()).toBe(12.5);
    expect(fixture.componentInstance.itemFee()).toBe(0.5);
  });

  it('canSubmit() is false when commissionRate is out of 0-100 range', () => {
    const fixture = create(null);
    fixture.componentInstance.name.set('Standard');
    fixture.componentInstance.commissionRate.set(150);

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('canSubmit() is false when itemFee is negative', () => {
    const fixture = create(null);
    fixture.componentInstance.name.set('Standard');
    fixture.componentInstance.itemFee.set(-1);

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('submit() calls saveFn with payload and no id in create mode, emits saved, closes', () => {
    const created: SellerType = { id: 't2', name: 'Gewerblich', commissionRate: 20, itemFee: 1, sellerCount: 0 };
    const saveFn = vi.fn(() => of(created));
    const fixture = create(null, saveFn);
    fixture.componentInstance.name.set('Gewerblich');
    fixture.componentInstance.commissionRate.set(20);
    fixture.componentInstance.itemFee.set(1);
    const emitted: SellerType[] = [];
    fixture.componentInstance.saved.subscribe((t) => emitted.push(t));

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith({ name: 'Gewerblich', commissionRate: 20, itemFee: 1 }, undefined);
    expect(emitted).toEqual([created]);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('submit() passes the item id in edit mode', () => {
    const item: SellerType = { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 };
    const updated: SellerType = { ...item, commissionRate: 15 };
    const saveFn = vi.fn(() => of(updated));
    const fixture = create(item, saveFn);
    fixture.componentInstance.commissionRate.set(15);

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith({ name: 'Standard', commissionRate: 15, itemFee: 0.5 }, 't1');
  });

  it('submit() on error keeps the dialog open and sets an error message', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409, error: { detail: 'Bezeichnung existiert bereits' } })));
    const fixture = create(null, saveFn);
    fixture.componentInstance.name.set('Standard');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Bezeichnung existiert bereits');
    expect(fixture.componentInstance.visible()).toBe(true);
  });
});
