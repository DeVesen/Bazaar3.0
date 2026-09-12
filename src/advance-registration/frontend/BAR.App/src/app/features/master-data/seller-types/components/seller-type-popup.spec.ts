import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { SellerTypePopup } from './seller-type-popup';
import { MessageService } from 'primeng/api';
import type { SellerType } from '../seller-type-api.service';

const DE_TRANSLATIONS = {
  common: { cancel: 'Abbrechen', save: 'Speichern' },
  typPopup: {
    editTitle: 'Verkäufer-Typ bearbeiten',
    createTitle: 'Neuer Verkäufer-Typ',
    name: 'Name',
    commissionRate: 'Provision (%)',
    itemFee: 'Gebühr (€)',
    saved: '✓ Verkäufer-Typ gespeichert',
    nameTaken: 'Bezeichnung existiert bereits',
    saveFailed: 'Speichern fehlgeschlagen'
  }
};

function create(item: SellerType | null, saveFn = vi.fn()) {
  TestBed.configureTestingModule({ providers: [provideTranslateService(), MessageService] });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.use('de');
  const fixture = TestBed.createComponent(SellerTypePopup);
  fixture.componentRef.setInput('item', item);
  fixture.componentRef.setInput('saveFn', saveFn);
  fixture.componentInstance.visible.set(true);
  fixture.detectChanges();
  return { fixture, translate };
}

describe('SellerTypePopup', () => {
  it('create mode (no item) starts with empty fields', () => {
    const { fixture } = create(null);

    expect(fixture.componentInstance.name()).toBe('');
    expect(fixture.componentInstance.commissionRate()).toBe(0);
    expect(fixture.componentInstance.itemFee()).toBe(0);
  });

  it('edit mode pre-fills all three fields from item', () => {
    const item: SellerType = { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 };

    const { fixture } = create(item);

    expect(fixture.componentInstance.name()).toBe('Standard');
    expect(fixture.componentInstance.commissionRate()).toBe(12.5);
    expect(fixture.componentInstance.itemFee()).toBe(0.5);
  });

  it('canSubmit() is false when commissionRate is out of 0-100 range', () => {
    const { fixture } = create(null);
    fixture.componentInstance.name.set('Standard');
    fixture.componentInstance.commissionRate.set(150);

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('canSubmit() is false when itemFee is negative', () => {
    const { fixture } = create(null);
    fixture.componentInstance.name.set('Standard');
    fixture.componentInstance.itemFee.set(-1);

    expect(fixture.componentInstance.canSubmit()).toBe(false);
  });

  it('submit() calls saveFn with payload and no id in create mode, emits saved, closes', () => {
    const created: SellerType = { id: 't2', name: 'Gewerblich', commissionRate: 20, itemFee: 1, sellerCount: 0 };
    const saveFn = vi.fn(() => of(created));
    const { fixture } = create(null, saveFn);
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
    const { fixture } = create(item, saveFn);
    fixture.componentInstance.commissionRate.set(15);

    fixture.componentInstance.submit();

    expect(saveFn).toHaveBeenCalledWith({ name: 'Standard', commissionRate: 15, itemFee: 0.5 }, 't1');
  });

  it('submit() on error keeps the dialog open and sets an error message', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409, error: { detail: 'Bezeichnung existiert bereits' } })));
    const { fixture } = create(null, saveFn);
    fixture.componentInstance.name.set('Standard');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Bezeichnung existiert bereits');
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('shows the create-mode title in the active language', () => {
    TestBed.configureTestingModule({ providers: [provideTranslateService(), MessageService] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { typPopup: { createTitle: 'New seller type' }, common: { cancel: 'Cancel', save: 'Save' } });
    translate.use('en');
    const fixture = TestBed.createComponent(SellerTypePopup);
    fixture.componentRef.setInput('item', null);
    fixture.componentRef.setInput('saveFn', vi.fn());
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('New seller type');
  });

  it('shows the edit-mode title when an item is provided', () => {
    const item: SellerType = { id: 't1', name: 'Standard', commissionRate: 12.5, itemFee: 0.5, sellerCount: 3 };

    const { fixture } = create(item);

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Verkäufer-Typ bearbeiten');
  });

  it('dialogTitle re-evaluates when the active language changes after render', () => {
    const { fixture, translate } = create(null);

    expect(fixture.componentInstance.dialogTitle).toBe('Neuer Verkäufer-Typ');

    translate.setTranslation('en', { typPopup: { createTitle: 'New seller type' }, common: { cancel: 'Cancel', save: 'Save' } });
    translate.use('en');
    fixture.detectChanges();

    expect(fixture.componentInstance.dialogTitle).toBe('New seller type');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('New seller type');
  });

  it('shows the translated success toast after a successful save', () => {
    const saveFn = vi.fn(() => of({ id: 't1', name: 'Standard', commissionRate: 10, itemFee: 0.5, sellerCount: 0 }));
    const { fixture, translate } = create(null, saveFn);
    fixture.componentInstance.name.set('Standard');
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.submit();

    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: translate.instant('typPopup.saved') }));
  });

  it('shows the translated name-taken fallback when the 409 response has no detail', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 409 })));
    const { fixture } = create(null, saveFn);
    fixture.componentInstance.name.set('Standard');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Bezeichnung existiert bereits');
  });

  it('shows the translated generic save-failed message on a non-409 error', () => {
    const saveFn = vi.fn(() => throwError(() => ({ status: 500 })));
    const { fixture } = create(null, saveFn);
    fixture.componentInstance.name.set('Standard');

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.nameError()).toBe('Speichern fehlgeschlagen');
  });
});
