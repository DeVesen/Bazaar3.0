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
  city: null,
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
  it('is invalid while firstName/lastName/email are empty and valid once required fields are filled', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.canSave()).toBe(false);

    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.email.set('max@example.com');
    expect(component.canSave()).toBe(true);
  });

  it('does not allow save without a selected seller type', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.firstName.set('Max');
    component.lastName.set('Mustermann');
    component.email.set('max@example.com');
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

  it('displays a server-side field error for email when provided', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('mode', 'create');
    fixture.componentRef.setInput('serverErrors', { email: 'E-Mail bereits vergeben.' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'E-Mail bereits vergeben.',
    );
  });
});
