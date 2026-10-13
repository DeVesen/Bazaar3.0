import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { ConfirmationService } from 'primeng/api';
import { RoleService } from '../../../../core/auth/role.service';
// Cross-feature import, read-only — see the matching exception note in verkaeufer-dialog.ts.
// eslint-disable-next-line boundaries/dependencies
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { SellerFormValue, VerkaeuferDialog } from './verkaeufer-dialog';

const SELLER_TYPES: SellerType[] = [
  { id: 'type-privat', name: 'Privat', commissionRate: 10, itemFee: 0.5, sellerCount: 5 },
  { id: 'type-gewerblich', name: 'Gewerblich', commissionRate: 15, itemFee: 1, sellerCount: 2 },
];

const EDIT_SELLER: SellerFormValue = {
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@example.com',
  sellerTypeId: 'type-privat',
  address: null,
  postalCode: null,
  city: 'Karlsruhe',
  phone: null,
  salesCommission: 10,
  feePerItem: 0.5,
};

interface ConfirmConfig {
  message?: string;
  header?: string;
  key?: string;
  accept?: () => void;
  reject?: () => void;
}

async function setup(options: { isAdmin: boolean }) {
  const isAdminSignal = signal(options.isAdmin);

  await TestBed.configureTestingModule({
    imports: [VerkaeuferDialog],
    providers: [
      { provide: RoleService, useValue: { isAdmin: isAdminSignal } },
      { provide: SellerTypesApi, useValue: { getAll: () => of(SELLER_TYPES) } },
      ConfirmationService,
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(VerkaeuferDialog);
  const confirmationService = TestBed.inject(ConfirmationService);
  const confirmSpy = vi
    .spyOn(confirmationService, 'confirm')
    .mockImplementation(() => confirmationService);
  return { fixture, isAdminSignal, confirmSpy: confirmSpy as unknown as ReturnType<typeof vi.fn<(config: ConfirmConfig) => void>> };
}

describe('VerkaeuferDialog', () => {
  it('is invalid while a required field is empty and valid once all six are filled — the email is optional', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.canSave()).toBe(false);

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    expect(component.canSave()).toBe(false);

    component.city.set('Karlsruhe');
    // seller type, fee and commission are prefilled in create mode; no email was entered
    expect(component.canSave()).toBe(true);
  });

  it('treats a cleared fee or commission as missing but accepts 0', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.city.set('Karlsruhe');
    component.feePerItem.set(0);
    component.salesCommission.set(0);
    expect(component.canSave()).toBe(true);

    component.feePerItem.set(null);
    expect(component.canSave()).toBe(false);

    component.feePerItem.set(0);
    component.salesCommission.set(null);
    expect(component.canSave()).toBe(false);
  });

  it('emits email null and the trimmed city when the email field is empty', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.city.set(' Karlsruhe ');
    component.email.set('  ');

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({ email: null, city: 'Karlsruhe', firstName: 'Max', lastName: 'Mustermann' }),
    );
  });

  it('shows an inline message under each empty required field only after the field was touched', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.verkaeufer-dialog__error').length).toBe(0);

    component.markTouched('firstName');
    component.markTouched('city');
    fixture.detectChanges();

    const messages = Array.from(el.querySelectorAll('.verkaeufer-dialog__error')).map((m) => m.textContent?.trim());
    expect(messages).toEqual(['Vorname ist erforderlich.', 'Ort ist erforderlich.']);

    component.firstName.set('Max');
    fixture.detectChanges();

    const remaining = Array.from(el.querySelectorAll('.verkaeufer-dialog__error')).map((m) => m.textContent?.trim());
    expect(remaining).toEqual(['Ort ist erforderlich.']);
  });

  it('does not allow save without a selected seller type', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.city.set('Karlsruhe');
    component.sellerTypeId.set('');

    expect(component.canSave()).toBe(false);
  });

  it('preselects the seller type with the highest sellerCount in create mode', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.sellerTypeId()).toBe('type-privat');
    expect(component.feePerItem()).toBe(0.5);
    expect(component.salesCommission()).toBe(10);
  });

  it('marks condition fields (fee/commission) as not editable for non-admin', async () => {
    const { fixture } = await setup({ isAdmin: false });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await fixture.whenStable();

    expect(fixture.componentInstance.conditionsEditable()).toBe(false);
  });

  it('marks condition fields (fee/commission) as editable for admin', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await fixture.whenStable();

    expect(fixture.componentInstance.conditionsEditable()).toBe(true);
  });

  it('shows a type-change confirm dialog with the concrete old/new fee/commission values for admin', async () => {
    const { fixture, confirmSpy } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await fixture.whenStable();

    fixture.componentInstance.onTypeChange('type-gewerblich');

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    const config = confirmSpy.mock.calls[0][0];
    expect(config.message).toContain('Privat');
    expect(config.message).toContain('Gewerblich');
    expect(config.message).toContain('10%');
    expect(config.message).toContain('0,50€');
    expect(config.message).toContain('15%');
    expect(config.message).toContain('1,00€');

    // The type/conditions only take effect once the admin confirms.
    expect(fixture.componentInstance.sellerTypeId()).toBe('type-privat');
    config.accept?.();
    expect(fixture.componentInstance.sellerTypeId()).toBe('type-gewerblich');
    expect(fixture.componentInstance.feePerItem()).toBe(1);
    expect(fixture.componentInstance.salesCommission()).toBe(15);
  });

  it('leaves fee/commission unchanged when the admin rejects the type-change confirm', async () => {
    const { fixture, confirmSpy } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await fixture.whenStable();

    fixture.componentInstance.onTypeChange('type-gewerblich');
    const config = confirmSpy.mock.calls[0][0];
    config.reject?.();

    expect(fixture.componentInstance.sellerTypeId()).toBe('type-privat');
    expect(fixture.componentInstance.feePerItem()).toBe(0.5);
    expect(fixture.componentInstance.salesCommission()).toBe(10);
  });

  it('changes the selected type for a non-admin but never alters fee/commission, and shows no confirm dialog', async () => {
    const { fixture, confirmSpy } = await setup({ isAdmin: false });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await fixture.whenStable();

    fixture.componentInstance.onTypeChange('type-gewerblich');

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(fixture.componentInstance.sellerTypeId()).toBe('type-gewerblich');
    expect(fixture.componentInstance.feePerItem()).toBe(0.5);
    expect(fixture.componentInstance.salesCommission()).toBe(10);
  });

  it('sends the seller original fee/commission on save for a non-admin, even after a type change', async () => {
    const { fixture } = await setup({ isAdmin: false });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component.onTypeChange('type-gewerblich');
    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerTypeId: 'type-gewerblich',
        feePerItem: 0.5,
        salesCommission: 10,
      }),
    );
  });

  it('shows the delete button only for admin, in edit mode', async () => {
    const admin = await setup({ isAdmin: true });
    admin.fixture.componentRef.setInput('visible', true);
    admin.fixture.componentRef.setInput('mode', 'edit');
    admin.fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await admin.fixture.whenStable();
    expect((admin.fixture.nativeElement as HTMLElement).textContent).toContain('Löschen');

    TestBed.resetTestingModule();
    const nonAdmin = await setup({ isAdmin: false });
    nonAdmin.fixture.componentRef.setInput('visible', true);
    nonAdmin.fixture.componentRef.setInput('mode', 'edit');
    nonAdmin.fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await nonAdmin.fixture.whenStable();
    expect((nonAdmin.fixture.nativeElement as HTMLElement).textContent).not.toContain('Löschen');
  });

  it('does not show the delete button in create mode, even for admin', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Löschen');
  });

  it('emits deleteRequested only after the delete confirm dialog is accepted', async () => {
    const { fixture, confirmSpy } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const deleteSpy = vi.fn();
    component.deleteRequested.subscribe(deleteSpy);

    component.onDeleteClick();
    expect(deleteSpy).not.toHaveBeenCalled();

    const config = confirmSpy.mock.calls[0][0];
    expect(config.message).toContain('Max Mustermann');
    config.accept?.();

    expect(deleteSpy).toHaveBeenCalled();
  });

  it('renders the 409 article-count message when deleteError is set', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', EDIT_SELLER);
    fixture.componentRef.setInput(
      'deleteError',
      'Verkäufer hat noch 12 Artikel und kann nicht gelöscht werden.',
    );
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Verkäufer hat noch 12 Artikel und kann nicht gelöscht werden.',
    );
  });

  it('emits cancel and visibleChange(false) on cancel', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const cancelSpy = vi.fn();
    const visibleChangeSpy = vi.fn();
    component.cancel.subscribe(cancelSpy);
    component.visibleChange.subscribe(visibleChangeSpy);

    component.onCancel();

    expect(cancelSpy).toHaveBeenCalled();
    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('opens a seller without email in edit mode with an empty email field and allows saving', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'edit');
    fixture.componentRef.setInput('initialValue', { ...EDIT_SELLER, email: null });
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const emailInput = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>(
      '#verkaeufer-dialog-email',
    );
    expect(component.email()).toBe('');
    expect(emailInput?.value).toBe('');
    expect(component.canSave()).toBe(true);

    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    component.onSave();
    expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ email: null }));
  });

  it('displays a server-side field error for city when provided', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('serverErrors', { city: 'Ort fehlt auf dem Server.' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Ort fehlt auf dem Server.',
    );
  });

  describe('layout (Layout-Vereinheitlichung Teil 3)', () => {
    async function open(mode: 'create' | 'edit', isAdmin = true) {
      const { fixture } = await setup({ isAdmin });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', mode);
      if (mode === 'edit') fixture.componentRef.setInput('initialValue', EDIT_SELLER);
      fixture.detectChanges();
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    }

    function fieldOf(el: HTMLElement, id: string): Element | null | undefined {
      return el.querySelector(`#${id}`)?.closest('.verkaeufer-dialog__field');
    }

    const SPANS: [string, string][] = [
      ['verkaeufer-dialog-first-name', 'half'],
      ['verkaeufer-dialog-last-name', 'half'],
      ['verkaeufer-dialog-address', 'full'],
      ['verkaeufer-dialog-postal-code', 'third'],
      ['verkaeufer-dialog-city', 'two-thirds'],
      ['verkaeufer-dialog-phone', 'half'],
      ['verkaeufer-dialog-email', 'half'],
      ['verkaeufer-dialog-seller-type', 'third'],
      ['verkaeufer-dialog-fee-per-item', 'third'],
      ['verkaeufer-dialog-sales-commission', 'third'],
    ];

    it.each(['create', 'edit'] as const)('arranges every field in its documented grid span (%s)', async (mode) => {
      const el = await open(mode);
      for (const [id, span] of SPANS) {
        expect(fieldOf(el, id)?.classList, id).toContain(`verkaeufer-dialog__field--${span}`);
      }
    });

    it('keeps the three panel headings', async () => {
      const el = await open('create');
      const headings = Array.from(el.querySelectorAll('.verkaeufer-dialog__panel-title')).map((h) => h.textContent?.trim());
      expect(headings).toEqual(['Personendaten', 'Kontakt', 'Konditionen']);
    });

    it('shows a red star exactly on Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr and Provision', async () => {
      const el = await open('create');
      const starred = SPANS.map(([id]) => id).filter((id) =>
        fieldOf(el, id)?.querySelector('.app-input__required, .verkaeufer-dialog__required'),
      );
      expect(starred).toEqual([
        'verkaeufer-dialog-first-name',
        'verkaeufer-dialog-last-name',
        'verkaeufer-dialog-city',
        'verkaeufer-dialog-seller-type',
        'verkaeufer-dialog-fee-per-item',
        'verkaeufer-dialog-sales-commission',
      ]);
    });

    it('puts every label inside the field frame (iftalabel)', async () => {
      const el = await open('create');
      for (const [id] of SPANS) {
        expect(fieldOf(el, id)?.querySelector('p-iftalabel label'), id).not.toBeNull();
      }
    });

    it('uses the responsive dialog width class', async () => {
      const el = await open('create');
      expect(el.querySelector('p-dialog[styleClass="dialog-responsive"]')).not.toBeNull();
    });

    it('still locks fee and commission for a non-admin', async () => {
      const el = await open('edit', false);
      expect((el.querySelector('#verkaeufer-dialog-fee-per-item') as HTMLInputElement).disabled).toBe(true);
      expect((el.querySelector('#verkaeufer-dialog-sales-commission') as HTMLInputElement).disabled).toBe(true);
    });
  });
});
