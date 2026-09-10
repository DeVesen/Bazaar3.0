import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SellerCreateDialog } from './seller-create-dialog';
import { SellersApiService, Seller } from '../../features/sellers/sellers-api.service';
import { SellerTypeApiService, SellerType } from '../../features/seller-types/seller-type-api.service';

const SELLER_TYPES: SellerType[] = [
  { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5, sellerCount: 3 },
  { id: 't2', name: 'Gewerblich', commissionRate: 20, itemFee: 1, sellerCount: 0 }
];

const CREATED_SELLER: Seller = {
  id: 's9',
  startNumber: null,
  firstName: 'Anna',
  lastName: 'Beispiel',
  address: null,
  postalCode: '76133',
  city: 'Karlsruhe',
  phone: '0721 1',
  email: 'anna@example.com',
  sellerTypeId: 't1',
  sellerType: SELLER_TYPES[0],
  isAdmin: false,
  articleCount: 0,
  hasPendingInvite: true
};

function create() {
  // app-info-area (rendered for the form-save error, AC-11) plays an audio
  // cue via AudioContext - jsdom does not implement it, so it is stubbed here
  // like in ProfilePage.spec.ts.
  vi.stubGlobal('AudioContext', class {
    createOscillator() {
      return {
        type: '',
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      };
    }
    destination = {};
    currentTime = 0;
  });

  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
  });
  const sellerTypeApi = TestBed.inject(SellerTypeApiService);
  vi.spyOn(sellerTypeApi, 'getAll').mockReturnValue(of(SELLER_TYPES));
  const sellersApi = TestBed.inject(SellersApiService);
  const fixture = TestBed.createComponent(SellerCreateDialog);
  fixture.detectChanges();
  return { fixture, sellerTypeApi, sellersApi };
}

function fillRequiredFields(instance: SellerCreateDialog): void {
  instance.firstName.set('Anna');
  instance.lastName.set('Beispiel');
  instance.postalCode.set('76133');
  instance.city.set('Karlsruhe');
  instance.phone.set('0721 1');
  instance.email.set('anna@example.com');
  instance.sellerTypeId.set('t1');
}

describe('SellerCreateDialog', () => {
  it('resets all fields and clears the form error when opened', () => {
    const { fixture } = create();

    fixture.componentInstance.firstName.set('Leftover');
    fixture.componentInstance.formError.set('Leftover error');
    fixture.componentInstance.visible.set(false);
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    expect(fixture.componentInstance.firstName()).toBe('');
    expect(fixture.componentInstance.lastName()).toBe('');
    expect(fixture.componentInstance.address()).toBe('');
    expect(fixture.componentInstance.postalCode()).toBe('');
    expect(fixture.componentInstance.city()).toBe('');
    expect(fixture.componentInstance.phone()).toBe('');
    expect(fixture.componentInstance.email()).toBe('');
    expect(fixture.componentInstance.sellerTypeId()).toBe('');
    expect(fixture.componentInstance.startNumber()).toBeNull();
    expect(fixture.componentInstance.blockCount()).toBeNull();
    expect(fixture.componentInstance.formError()).toBeNull();
  });

  it('loads seller types when the dialog opens', () => {
    const { fixture, sellerTypeApi } = create();

    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    expect(sellerTypeApi.getAll).toHaveBeenCalled();
    expect(fixture.componentInstance.sellerTypes()).toEqual(SELLER_TYPES);
  });

  it('derives the read-only commission/fee display from the selected seller type', () => {
    const { fixture } = create();
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges();

    fixture.componentInstance.sellerTypeId.set('t2');

    expect(fixture.componentInstance.selectedType()).toEqual(SELLER_TYPES[1]);
  });

  it('keeps the submit button disabled until all required fields are filled', () => {
    const { fixture } = create();
    fixture.componentInstance.visible.set(true);

    expect(fixture.componentInstance.canSubmit()).toBe(false);

    fillRequiredFields(fixture.componentInstance);

    expect(fixture.componentInstance.canSubmit()).toBe(true);
  });

  it('submit() posts the payload, toasts success, emits saved, and closes the dialog', () => {
    const { fixture, sellersApi } = create();
    const createSpy = vi.spyOn(sellersApi, 'create').mockReturnValue(of(CREATED_SELLER));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    fixture.componentInstance.visible.set(true);
    fillRequiredFields(fixture.componentInstance);
    fixture.componentInstance.startNumber.set(101);
    fixture.componentInstance.blockCount.set(2);
    let savedEmitted = false;
    fixture.componentInstance.saved.subscribe(() => (savedEmitted = true));

    fixture.componentInstance.submit();

    expect(createSpy).toHaveBeenCalledWith({
      firstName: 'Anna',
      lastName: 'Beispiel',
      address: undefined,
      postalCode: '76133',
      city: 'Karlsruhe',
      phone: '0721 1',
      email: 'anna@example.com',
      sellerTypeId: 't1',
      startNumber: 101,
      blockCount: 2
    });
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(savedEmitted).toBe(true);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('submit() does nothing while required fields are missing', () => {
    const { fixture, sellersApi } = create();
    const createSpy = vi.spyOn(sellersApi, 'create');
    fixture.componentInstance.visible.set(true);

    fixture.componentInstance.submit();

    expect(createSpy).not.toHaveBeenCalled();
  });

  it('submit() on 409 keeps the dialog open and shows the server error', () => {
    const { fixture, sellersApi } = create();
    vi.spyOn(sellersApi, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'E-Mail bereits vergeben' } }))
    );
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges(); // flushes the open-effect's field reset before filling the form
    fillRequiredFields(fixture.componentInstance);

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.componentInstance.formError()).toBe('E-Mail bereits vergeben');
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('renders the save error in an app-info-area instead of a bare field-error paragraph (AC-11)', () => {
    const { fixture, sellersApi } = create();
    vi.spyOn(sellersApi, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'E-Mail bereits vergeben' } }))
    );
    fixture.componentInstance.visible.set(true);
    fixture.detectChanges(); // flushes the open-effect's field reset before filling the form
    fillRequiredFields(fixture.componentInstance);

    fixture.componentInstance.submit();
    fixture.detectChanges();

    const infoArea = fixture.nativeElement.querySelector('app-info-area');
    expect(infoArea).not.toBeNull();
    expect(infoArea.textContent).toContain('E-Mail bereits vergeben');
    expect(fixture.nativeElement.querySelector('p.field-error')).toBeNull();
  });

  it('submit() on a non-409 error shows the generic error message', () => {
    const { fixture, sellersApi } = create();
    vi.spyOn(sellersApi, 'create').mockReturnValue(throwError(() => ({ status: 500 })));
    fixture.componentInstance.visible.set(true);
    fillRequiredFields(fixture.componentInstance);

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.formError()).toBe('Verkäufer konnte nicht gespeichert werden');
    expect(fixture.componentInstance.visible()).toBe(true);
  });
});
