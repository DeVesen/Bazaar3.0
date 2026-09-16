import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateService, provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SellerEditDialog } from './seller-edit-dialog';
import { SellersApiService, Seller, NumberBlock } from '../sellers-api.service';
import { SellerTypeOptionsApiService, SellerTypeOption } from '@features/seller-management/seller-type-options-api.service';

const SELLER_TYPES: SellerTypeOption[] = [
  { id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5 },
  { id: 't2', name: 'Gewerblich', commissionRate: 20, itemFee: 1 }
];

const SELLER: Seller = {
  id: 's1',
  startNumber: 101,
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
  articleCount: 3,
  hasPendingInvite: false,
  canDelete: true
};

const BLOCKS: NumberBlock[] = [
  { id: 'b1', sellerId: 's1', fromNumber: 101, toNumber: 110, numberCount: 10, usedCount: 3, assignedAt: '2026-08-14T10:00:00+02:00' },
  { id: 'b2', sellerId: 's1', fromNumber: 111, toNumber: 120, numberCount: 10, usedCount: 0, assignedAt: '2026-08-14T10:00:00+02:00' }
];

function create() {
  // app-info-area (rendered for the form-save/reserve errors, AC-11) plays an
  // audio cue via AudioContext - jsdom does not implement it, so it is
  // stubbed here like in ProfilePage.spec.ts.
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
    providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), MessageService, ConfirmationService]
  });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', {
    common: { cancel: 'Abbrechen', save: 'Speichern', delete: 'Löschen' },
    sellerEditDialog: {
      header: 'Verkäufer bearbeiten',
      sectionPersonal: 'Personendaten',
      firstName: 'Vorname *',
      lastName: 'Nachname *',
      sectionContact: 'Kontakt',
      address: 'Anschrift',
      postalCode: 'PLZ *',
      city: 'Ort *',
      phone: 'Telefon *',
      email: 'E-Mail (= Login) *',
      sectionConditions: 'Konditionen',
      sellerType: 'Verkäufer-Typ *',
      conditionsSummary: 'Provision: {{commissionRate}} % · Gebühr: {{itemFee}} € pro Stück',
      sectionBlocks: 'Nummernblöcke',
      blockUsage: '{{count}} Nummern · {{used}} vergeben',
      blockFull: 'Voll — nicht löschbar',
      confirmDeleteBlock: 'Diesen Nummernblock wirklich löschen?',
      reserveAdditional: 'Zusätzliche Blöcke reservieren:',
      blockCount: 'Anzahl Blöcke',
      suggestedStartNumber: 'Startnummer (Vorschlag)',
      reserve: '✓ Reservieren',
      reserveConflict: 'Nummernbereich überschneidet sich mit bestehendem Block',
      reserveFailed: 'Block konnte nicht reserviert werden',
      reserved: '✓ Block reserviert',
      sectionOther: 'Sonstiges',
      isAdmin: 'Dieser Verkäufer hat Admin-Rechte',
      generateInvite: '📋 Einladungs-Link generieren',
      inviteCopied: '✓ Einladungs-Link kopiert!',
      saved: '✓ Verkäufer gespeichert',
      saveFailed: 'Verkäufer konnte nicht gespeichert werden'
    }
  });
  translate.use('de');
  const sellerTypeApi = TestBed.inject(SellerTypeOptionsApiService);
  vi.spyOn(sellerTypeApi, 'getAll').mockReturnValue(of(SELLER_TYPES));
  const sellersApi = TestBed.inject(SellersApiService);
  vi.spyOn(sellersApi, 'getBlocks').mockReturnValue(of(BLOCKS));
  vi.spyOn(sellersApi, 'nextFreeStartNumber').mockReturnValue(of({ startNumber: 121 }));
  const fixture = TestBed.createComponent(SellerEditDialog);
  return { fixture, sellerTypeApi, sellersApi };
}

function open(fixture: ReturnType<typeof create>['fixture'], seller: Seller | null = SELLER) {
  fixture.componentRef.setInput('item', seller);
  fixture.componentInstance.visible.set(true);
  fixture.detectChanges();
}

describe('SellerEditDialog', () => {
  it('pre-fills the profile fields from the given seller when opened', () => {
    const { fixture } = create();

    open(fixture);

    expect(fixture.componentInstance.firstName()).toBe('Anna');
    expect(fixture.componentInstance.lastName()).toBe('Beispiel');
    expect(fixture.componentInstance.postalCode()).toBe('76133');
    expect(fixture.componentInstance.city()).toBe('Karlsruhe');
    expect(fixture.componentInstance.phone()).toBe('0721 1');
    expect(fixture.componentInstance.email()).toBe('anna@example.com');
    expect(fixture.componentInstance.sellerTypeId()).toBe('t1');
    expect(fixture.componentInstance.isAdmin()).toBe(false);
  });

  it('loads seller types and the seller-specific block list when opened', () => {
    const { fixture, sellerTypeApi, sellersApi } = create();

    open(fixture);

    expect(sellerTypeApi.getAll).toHaveBeenCalled();
    expect(sellersApi.getBlocks).toHaveBeenCalledWith('s1');
    expect(fixture.componentInstance.blocks()).toEqual(BLOCKS);
  });

  it('only allows deleting a block with usedCount 0', () => {
    const { fixture } = create();
    open(fixture);

    expect(fixture.componentInstance.isDeletable(BLOCKS[0])).toBe(false);
    expect(fixture.componentInstance.isDeletable(BLOCKS[1])).toBe(true);
  });

  it('fetches the next-free-start-number suggestion for the reserve form on open', () => {
    const { fixture, sellersApi } = create();

    open(fixture);

    expect(sellersApi.nextFreeStartNumber).toHaveBeenCalledWith(1);
    expect(fixture.componentInstance.reserveStartNumber()).toBe(121);
  });

  it('re-fetches the suggestion when the reserve block count changes', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    vi.mocked(sellersApi.nextFreeStartNumber).mockClear();
    vi.mocked(sellersApi.nextFreeStartNumber).mockReturnValue(of({ startNumber: 131 }));

    fixture.componentInstance.reserveBlockCount.set(2);
    fixture.detectChanges();

    expect(sellersApi.nextFreeStartNumber).toHaveBeenCalledWith(2);
    expect(fixture.componentInstance.reserveStartNumber()).toBe(131);
  });

  it('keeps the submit button disabled until all required fields are filled', () => {
    const { fixture } = create();
    open(fixture);

    fixture.componentInstance.firstName.set('');

    expect(fixture.componentInstance.canSubmit()).toBe(false);

    fixture.componentInstance.firstName.set('Anna');

    expect(fixture.componentInstance.canSubmit()).toBe(true);
  });

  it('submit() puts the payload including isAdmin, toasts success, emits saved, and closes the dialog', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    const updateSpy = vi.spyOn(sellersApi, 'update').mockReturnValue(of(SELLER));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    let savedEmitted = false;
    fixture.componentInstance.saved.subscribe(() => (savedEmitted = true));
    fixture.componentInstance.isAdmin.set(true);

    fixture.componentInstance.submit();

    expect(updateSpy).toHaveBeenCalledWith('s1', {
      firstName: 'Anna',
      lastName: 'Beispiel',
      address: undefined,
      postalCode: '76133',
      city: 'Karlsruhe',
      phone: '0721 1',
      email: 'anna@example.com',
      sellerTypeId: 't1',
      isAdmin: true
    });
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: '✓ Verkäufer gespeichert' }));
    expect(savedEmitted).toBe(true);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('submit() on 409 keeps the dialog open and shows the server error', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    vi.spyOn(sellersApi, 'update').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'E-Mail bereits vergeben' } }))
    );

    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect(fixture.componentInstance.formError()).toBe('E-Mail bereits vergeben');
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('renders the save error in an app-info-area instead of a bare field-error paragraph (AC-11)', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    vi.spyOn(sellersApi, 'update').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'E-Mail bereits vergeben' } }))
    );

    fixture.componentInstance.submit();
    fixture.detectChanges();

    const infoAreas = fixture.nativeElement.querySelectorAll('app-info-area');
    const texts = Array.from(infoAreas).map((el) => (el as HTMLElement).textContent);
    expect(texts.some((t) => t?.includes('E-Mail bereits vergeben'))).toBe(true);
    expect(fixture.nativeElement.querySelector('p.field-error')).toBeNull();
  });

  it('submit() on a non-409 error shows the generic error message', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    vi.spyOn(sellersApi, 'update').mockReturnValue(throwError(() => ({ status: 500 })));

    fixture.componentInstance.submit();

    expect(fixture.componentInstance.formError()).toBe('Verkäufer konnte nicht gespeichert werden');
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('onDeleteBlock() asks for confirmation and, on accept, deletes the block and reloads the list', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    const deleteSpy = vi.spyOn(sellersApi, 'deleteBlock').mockReturnValue(of(undefined));
    const confirmationService = TestBed.inject(ConfirmationService);
    const confirmSpy = vi.spyOn(confirmationService, 'confirm');
    vi.mocked(sellersApi.getBlocks).mockClear();

    fixture.componentInstance.onDeleteBlock(BLOCKS[1]);

    expect(confirmSpy).toHaveBeenCalled();
    confirmSpy.mock.calls[0][0].accept!();

    expect(deleteSpy).toHaveBeenCalledWith('s1', 'b2');
    expect(sellersApi.getBlocks).toHaveBeenCalledWith('s1');
  });

  it('onReserve() reserves the block, toasts success, and reloads the block list', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    const reserveSpy = vi.spyOn(sellersApi, 'reserveBlocks').mockReturnValue(of(BLOCKS));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    vi.mocked(sellersApi.getBlocks).mockClear();
    fixture.componentInstance.reserveBlockCount.set(2);
    fixture.componentInstance.reserveStartNumber.set(131);

    fixture.componentInstance.onReserve();

    expect(reserveSpy).toHaveBeenCalledWith('s1', { startNumber: 131, blockCount: 2 });
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    expect(sellersApi.getBlocks).toHaveBeenCalledWith('s1');
  });

  it('onReserve() on 409 shows the overlap error near the reserve form, not the main form error', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    vi.spyOn(sellersApi, 'reserveBlocks').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Nummernbereich überschneidet sich mit bestehendem Block' } }))
    );

    fixture.componentInstance.onReserve();
    fixture.detectChanges();

    expect(fixture.componentInstance.reserveError()).toBe('Nummernbereich überschneidet sich mit bestehendem Block');
    expect(fixture.componentInstance.formError()).toBeNull();
    const infoAreas = fixture.nativeElement.querySelectorAll('app-info-area');
    const texts = Array.from(infoAreas).map((el) => (el as HTMLElement).textContent);
    expect(texts.some((t) => t?.includes('Nummernbereich überschneidet sich mit bestehendem Block'))).toBe(true);
    expect(fixture.nativeElement.querySelector('p.field-error')).toBeNull();
  });

  it('onInviteClick() invites, copies the link to the clipboard, and toasts', () => {
    const { fixture, sellersApi } = create();
    open(fixture);
    vi.spyOn(sellersApi, 'invite').mockReturnValue(of({ inviteUrl: 'https://x/set-password?token=t', expiresAt: '2026-08-24T12:00:00+02:00' }));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText: writeTextSpy } });

    fixture.componentInstance.onInviteClick();

    expect(writeTextSpy).toHaveBeenCalledWith('https://x/set-password?token=t');
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success', summary: '✓ Einladungs-Link kopiert!' }));
  });

  it('renders the English dialog header and block usage text when the English translation is active', () => {
    const { fixture } = create();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      common: { cancel: 'Cancel', save: 'Save', delete: 'Delete' },
      sellerEditDialog: {
        header: 'Edit seller',
        sectionPersonal: 'Personal details',
        blockUsage: '{{count}} numbers · {{used}} assigned',
        isAdmin: 'This seller has admin rights',
        generateInvite: '📋 Generate invite link'
      }
    });
    translate.use('en');
    open(fixture);

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Edit seller');
    expect(text).toContain('Personal details');
    expect(text).toContain('10 numbers · 3 assigned');
    expect(text).toContain('This seller has admin rights');
    expect(text).toContain('📋 Generate invite link');
  });

  it('re-renders the dialog header after a post-render language switch', () => {
    const { fixture } = create();
    open(fixture);

    expect((fixture.nativeElement.textContent as string)).toContain('Verkäufer bearbeiten');

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { sellerEditDialog: { header: 'Edit seller' } });
    translate.use('en');
    fixture.detectChanges();

    expect((fixture.nativeElement.textContent as string)).toContain('Edit seller');
  });
});
