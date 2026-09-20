import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PaymentPanel } from '../../../../shared/components/payment-panel/payment-panel';
import { PrintService } from '../../../../core/print/print.service';
import { IntakeApi } from '../../data/intake-api';
import { SessionArticle } from '../intake-article-entry/intake-article-entry';
// `SessionItemPopup` renders `InputGroup`, which depends on `BarcodeScanner`/`@zxing/browser`
// — importing the ONE shared mock (see that file's own comment for why it must be centralized,
// and why every spec that transitively loads `BarcodeScanner` must import it, not just the
// ones asserting on it) so this test never touches real device camera APIs (unavailable in
// jsdom).
// (Round-25 review fix: this registration now also happens unconditionally via the global
// Vitest `setupFiles` entry in `angular.json` — this import is kept for documentation/clarity,
// not because it is still load-bearing for the mock to win the race.)
import '../../../../shared/components/barcode-scanner/testing/zxing-browser.mock';
import { SessionItemPopup } from '../session-item-popup/session-item-popup';
import { IntakeSessionList } from './intake-session-list';

const SELLER_ID = 'SEL00001';

function itemStub(overrides: Partial<SessionArticle> = {}): SessionArticle {
  return {
    localId: 'local-1',
    number: 1043,
    name: 'Winterjacke',
    brand: 'Lego',
    category: 'Kleidung',
    price: 12.5,
    size: null,
    color: null,
    description: null,
    ...overrides,
  };
}

function intakeApiStub() {
  return { bookIntake: vi.fn().mockReturnValue(of({ articleIds: ['ART00099'], intakeFeePaid: 12.5 })) };
}

function printServiceStub() {
  return { printIntakeReceipt: vi.fn() };
}

async function setup(
  options: {
    items?: SessionArticle[];
    feePerItem?: number;
    intakeApi?: ReturnType<typeof intakeApiStub>;
    printService?: ReturnType<typeof printServiceStub>;
  } = {},
) {
  const intakeApi = options.intakeApi ?? intakeApiStub();
  const printService = options.printService ?? printServiceStub();

  await TestBed.configureTestingModule({
    imports: [IntakeSessionList],
    providers: [
      { provide: IntakeApi, useValue: intakeApi },
      { provide: PrintService, useValue: printService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(IntakeSessionList);
  fixture.componentRef.setInput('items', options.items ?? [itemStub()]);
  fixture.componentRef.setInput('feePerItem', options.feePerItem ?? 0.5);
  fixture.componentRef.setInput('sellerId', SELLER_ID);
  fixture.componentRef.setInput('categoryOptions', ['Kleidung']);
  fixture.componentRef.setInput('brandOptions', ['Lego']);
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, intakeApi, printService };
}

describe('IntakeSessionList', () => {
  it('computes the fee as items().length * feePerItem()', async () => {
    const { component } = await setup({
      items: [itemStub({ localId: 'a' }), itemStub({ localId: 'b', number: 1099 })],
      feePerItem: 0.5,
    });

    expect(component.fee()).toBe(1);
  });

  it('emits itemDeleted with the row localId', async () => {
    const { component } = await setup();
    const spy = vi.fn();
    component.itemDeleted.subscribe(spy);

    component.onDelete('local-1', new MouseEvent('click'));

    expect(spy).toHaveBeenCalledWith('local-1');
  });

  it('opens the popup seeded with the clicked row values', async () => {
    const { component } = await setup({ items: [itemStub()] });

    component.onRowClick(itemStub());

    expect(component.popupVisible()).toBe(true);
    expect(component.initialPopupValue()).toEqual({
      name: 'Winterjacke',
      category: 'Kleidung',
      brand: 'Lego',
      price: 12.5,
    });
  });

  it("popup's save emits itemUpdated with the row's localId and new values, and closes the popup", async () => {
    const { component } = await setup({ items: [itemStub()] });
    const spy = vi.fn();
    component.itemUpdated.subscribe(spy);

    component.onRowClick(itemStub());
    component.onPopupSave({ name: 'Sommerjacke', category: 'Kleidung', brand: 'Lego', price: 19.9 });

    expect(spy).toHaveBeenCalledWith({
      localId: 'local-1',
      value: { name: 'Sommerjacke', category: 'Kleidung', brand: 'Lego', price: 19.9 },
    });
    expect(component.popupVisible()).toBe(false);
  });

  it('popup cancel just closes the popup without emitting itemUpdated', async () => {
    const { component } = await setup({ items: [itemStub()] });
    const spy = vi.fn();
    component.itemUpdated.subscribe(spy);

    component.onRowClick(itemStub());
    component.onPopupCancel();

    expect(component.popupVisible()).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('disables "Speichern" when items() is empty', async () => {
    const { component, fixture } = await setup({ items: [] });
    expect(component.canBook()).toBe(false);

    component.openPayment();
    expect(component.paymentPanelVisible()).toBe(false);

    fixture.detectChanges();
    const saveButton = fixture.debugElement.query(By.css('p-button[label="Speichern"]'));
    expect(saveButton.componentInstance.disabled()).toBe(true);
  });

  it('opens the payment dialog on "Speichern" when items() is non-empty', async () => {
    const { component } = await setup({ items: [itemStub()] });

    component.openPayment();

    expect(component.paymentPanelVisible()).toBe(true);
  });

  it('onPaymentConfirmed calls IntakeApi.bookIntake with feeAmount = event.totalAmount, not receivedAmount', async () => {
    const { component, intakeApi } = await setup({ items: [itemStub()], feePerItem: 0.5 });

    component.onPaymentConfirmed({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });

    expect(intakeApi.bookIntake).toHaveBeenCalledWith(SELLER_ID, 12.5, [
      {
        number: 1043,
        name: 'Winterjacke',
        brand: 'Lego',
        category: 'Kleidung',
        price: 12.5,
        size: null,
        color: null,
        description: null,
      },
    ]);
  });

  it('success: calls PrintService.printIntakeReceipt, closes the dialog, and emits booked', async () => {
    const { component, printService } = await setup({ items: [itemStub()] });
    const bookedSpy = vi.fn();
    component.booked.subscribe(bookedSpy);
    component.paymentPanelVisible.set(true);

    component.onPaymentConfirmed({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });

    expect(printService.printIntakeReceipt).toHaveBeenCalledWith({
      articleIds: ['ART00099'],
      sellerId: SELLER_ID,
      feeAmount: 12.5,
    });
    expect(component.paymentPanelVisible()).toBe(false);
    expect(bookedSpy).toHaveBeenCalled();
  });

  it('409 article.number_taken: emits bookingConflict with the right payload, does NOT emit booked, and closes the dialog', async () => {
    const intakeApi = intakeApiStub();
    intakeApi.bookIntake.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errorCode: 'article.number_taken', takenNumbers: [1043], nextNumber: 1050 },
          }),
      ),
    );
    const { component } = await setup({ items: [itemStub()], intakeApi });
    const bookedSpy = vi.fn();
    const conflictSpy = vi.fn();
    component.booked.subscribe(bookedSpy);
    component.bookingConflict.subscribe(conflictSpy);
    component.paymentPanelVisible.set(true);

    component.onPaymentConfirmed({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });

    expect(conflictSpy).toHaveBeenCalledWith({ takenNumbers: [1043], nextNumber: 1050 });
    expect(bookedSpy).not.toHaveBeenCalled();
    expect(component.paymentPanelVisible()).toBe(false);
  });

  it('other errors (e.g. 400 fee mismatch): show an inline error, do not emit booked or bookingConflict', async () => {
    const intakeApi = intakeApiStub();
    intakeApi.bookIntake.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { errorCode: 'intake.fee_mismatch' } })),
    );
    const { component } = await setup({ items: [itemStub()], intakeApi });
    const bookedSpy = vi.fn();
    const conflictSpy = vi.fn();
    component.booked.subscribe(bookedSpy);
    component.bookingConflict.subscribe(conflictSpy);

    component.onPaymentConfirmed({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });

    expect(component.bookingError()).toBeTruthy();
    expect(bookedSpy).not.toHaveBeenCalled();
    expect(conflictSpy).not.toHaveBeenCalled();
  });

  it('forwards categoryCreated/brandCreated from the popup upward', async () => {
    const { fixture, component } = await setup({ items: [itemStub()] });
    const categorySpy = vi.fn();
    const brandSpy = vi.fn();
    component.categoryCreated.subscribe(categorySpy);
    component.brandCreated.subscribe(brandSpy);

    const popup = fixture.debugElement.query(By.directive(SessionItemPopup)).componentInstance as SessionItemPopup;
    popup.categoryCreated.emit('Schuhe');
    popup.brandCreated.emit('Nike');

    expect(categorySpy).toHaveBeenCalledWith('Schuhe');
    expect(brandSpy).toHaveBeenCalledWith('Nike');
  });

  it('renders the payment-panel with the fixed fee as totalAmount once the dialog is open', async () => {
    const { fixture, component } = await setup({ items: [itemStub(), itemStub({ localId: 'b', number: 1099 })], feePerItem: 0.5 });
    component.paymentPanelVisible.set(true);
    fixture.detectChanges();

    const panel = fixture.debugElement.query(By.directive(PaymentPanel)).componentInstance as PaymentPanel;
    expect(panel.totalAmount()).toBe(1);
    expect(panel.totalLabel()).toBe('Gesamtgebühr');
    expect(panel.confirmLabel()).toBe('Buchen');
  });
});
