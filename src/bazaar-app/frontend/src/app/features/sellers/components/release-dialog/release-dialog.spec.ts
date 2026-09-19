import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { PaymentPanel } from '../../../../shared/components/payment-panel/payment-panel';
import { ScanDialog } from '../../../../shared/components/scan-dialog/scan-dialog';
import { PrintService } from '../../../../core/print/print.service';
import { ReleaseApi } from '../../data/release-api';
import { SellersApi } from '../../data/sellers-api';
import { ReleaseDialog } from './release-dialog';

const SELLER_ID = 'SEL00001';

function releaseApiStub() {
  return { bookRelease: vi.fn().mockReturnValue(of({ releasedCount: 2, intakeFeePaid: 1 })) };
}

function sellersApiStub(feePerItem = 0.5) {
  return { getById: vi.fn().mockReturnValue(of({ feePerItem })) };
}

function printServiceStub() {
  return { printIntakeReceipt: vi.fn() };
}

function messageServiceStub() {
  return { add: vi.fn() };
}

/** `ScanDialog` (a real dependency here, mounted by `release-dialog.html`) injects `HttpClient`
 * directly — this fake only needs to satisfy its constructor-time `loadPendingArticles()` call
 * (`GET /api/sellers/{id}/articles`), never exercised further since this spec drives
 * `release-dialog`'s own booking/payment/409 logic directly through its public API, the same way
 * `intake-session-list.spec.ts` drives `onPaymentConfirmed()` directly rather than simulating
 * clicks through `payment-panel`'s own template. */
function httpClientStub(): HttpClient {
  return { get: vi.fn().mockReturnValue(of([])) } as unknown as HttpClient;
}

/** Reads the actual DOM `hidden` state of the `app-scan-dialog` wrapper (`release-dialog.html`'s
 * `<div [hidden]="paymentPanelVisible()">`) rather than a component-level flag — this is what
 * would actually catch it if the template's binding ever drifted from `paymentPanelVisible()`
 * (Round-18 review fix: the old `scanDialogVisible()` signal could not, since it was set by hand
 * at every call site and only happened to stay in sync with the template). */
function scanDialogHidden(fixture: ComponentFixture<unknown>): boolean {
  const scanDialogElement = fixture.nativeElement.querySelector('app-scan-dialog') as HTMLElement | null;
  const wrapper = scanDialogElement?.parentElement as HTMLElement | null | undefined;
  return Boolean(wrapper?.hidden);
}

async function setup(
  options: {
    visible?: boolean;
    sellerId?: string;
    feePerItem?: number;
    releaseApi?: ReturnType<typeof releaseApiStub>;
    sellersApi?: ReturnType<typeof sellersApiStub>;
    printService?: ReturnType<typeof printServiceStub>;
    messageService?: ReturnType<typeof messageServiceStub>;
  } = {},
) {
  const releaseApi = options.releaseApi ?? releaseApiStub();
  const sellersApi = options.sellersApi ?? sellersApiStub(options.feePerItem ?? 0.5);
  const printService = options.printService ?? printServiceStub();
  const messageService = options.messageService ?? messageServiceStub();

  await TestBed.configureTestingModule({
    imports: [ReleaseDialog],
    providers: [
      { provide: ReleaseApi, useValue: releaseApi },
      { provide: SellersApi, useValue: sellersApi },
      { provide: PrintService, useValue: printService },
      { provide: MessageService, useValue: messageService },
      { provide: HttpClient, useValue: httpClientStub() },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(ReleaseDialog);
  fixture.componentRef.setInput('visible', options.visible ?? true);
  fixture.componentRef.setInput('sellerId', options.sellerId ?? SELLER_ID);
  await fixture.whenStable();
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance, releaseApi, sellersApi, printService, messageService };
}

describe('ReleaseDialog', () => {
  it('fetches feePerItem via SellersApi.getById keyed on sellerId', async () => {
    const { sellersApi } = await setup({ sellerId: SELLER_ID });
    expect(sellersApi.getById).toHaveBeenCalledWith(SELLER_ID);
  });

  it('computes fee as sessionIds().length * feePerItem()', async () => {
    const { component } = await setup({ feePerItem: 0.5 });

    component.onSessionChanged(['a1', 'a2', 'a3']);

    expect(component.fee()).toBe(1.5);
  });

  it('closing scan-dialog with an empty session emits visibleChange(false) without opening payment', async () => {
    const { component } = await setup();
    const spy = vi.fn();
    component.visibleChange.subscribe(spy);

    component.onScanDialogVisibleChange(false);

    expect(spy).toHaveBeenCalledWith(false);
    expect(component.paymentPanelVisible()).toBe(false);
  });

  it('closing scan-dialog with a non-empty session opens payment-panel instead of closing', async () => {
    const { fixture, component } = await setup();
    const spy = vi.fn();
    component.visibleChange.subscribe(spy);
    component.onSessionChanged(['a1']);

    component.onScanDialogVisibleChange(false);
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
    expect(component.paymentPanelVisible()).toBe(true);
    expect(scanDialogHidden(fixture)).toBe(true);
  });

  it('renders payment-panel with fee as totalAmount once open', async () => {
    const { fixture, component } = await setup({ feePerItem: 0.5 });
    component.onSessionChanged(['a1', 'a2']);
    component.paymentPanelVisible.set(true);
    fixture.detectChanges();

    const panel = fixture.debugElement.query(
      (de) => de.componentInstance instanceof PaymentPanel,
    )?.componentInstance as PaymentPanel;
    expect(panel.totalAmount()).toBe(1);
    expect(panel.totalLabel()).toBe('Gesamtgebühr');
    expect(panel.confirmLabel()).toBe('Buchen');
  });

  it('payment cancel reopens scan-dialog and keeps the session', async () => {
    const { fixture, component } = await setup();
    component.onSessionChanged(['a1']);
    component.paymentPanelVisible.set(true);
    fixture.detectChanges();

    component.onPaymentCancelled();
    fixture.detectChanges();

    // Real signal driving the template's `[hidden]` on the scan-dialog wrapper (release-dialog.html)
    // — `false` means scan-dialog is visible again. No separate "scan-dialog visible" flag exists
    // any more (Round-18 review fix), so this is the one signal that can actually catch a template
    // divergence.
    expect(component.paymentPanelVisible()).toBe(false);
    expect(scanDialogHidden(fixture)).toBe(false);
    expect(component.sessionIds()).toEqual(['a1']);
  });

  it('onPaymentConfirmed books with feeAmount = event.totalAmount (not receivedAmount)', async () => {
    const { component, releaseApi } = await setup({ sellerId: SELLER_ID });
    component.onSessionChanged(['a1', 'a2']);

    component.onPaymentConfirmed({ totalAmount: 1, receivedAmount: 5, change: 4 });

    expect(releaseApi.bookRelease).toHaveBeenCalledWith(SELLER_ID, 1, ['a1', 'a2']);
  });

  it('success: prints via PrintService, closes payment + dialog, emits released', async () => {
    const { component, printService } = await setup({ sellerId: SELLER_ID });
    component.onSessionChanged(['a1', 'a2']);
    component.paymentPanelVisible.set(true);
    const releasedSpy = vi.fn();
    const visibleChangeSpy = vi.fn();
    component.released.subscribe(releasedSpy);
    component.visibleChange.subscribe(visibleChangeSpy);

    component.onPaymentConfirmed({ totalAmount: 1, receivedAmount: 5, change: 4 });

    expect(printService.printIntakeReceipt).toHaveBeenCalledWith({
      articleIds: ['a1', 'a2'],
      sellerId: SELLER_ID,
      feeAmount: 1,
    });
    expect(component.paymentPanelVisible()).toBe(false);
    expect(releasedSpy).toHaveBeenCalled();
    expect(visibleChangeSpy).toHaveBeenCalledWith(false);
  });

  it('409 article.not_releasable: reopens scan-dialog, keeps the session, shows an inline error + toast, does not close', async () => {
    const releaseApi = releaseApiStub();
    releaseApi.bookRelease.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { errorCode: 'article.not_releasable', articleNumbers: [1043, 1050] },
          }),
      ),
    );
    const { fixture, component, messageService } = await setup({ releaseApi });
    component.onSessionChanged(['a1', 'a2']);
    component.paymentPanelVisible.set(true);
    fixture.detectChanges();
    const releasedSpy = vi.fn();
    const visibleChangeSpy = vi.fn();
    component.released.subscribe(releasedSpy);
    component.visibleChange.subscribe(visibleChangeSpy);

    component.onPaymentConfirmed({ totalAmount: 1, receivedAmount: 5, change: 4 });
    fixture.detectChanges();

    expect(component.bookingError()).toBe('Artikel 1043, 1050 sind nicht mehr freigebbar.');
    // Fix round 1: the inline `bookingError` text alone is invisible once `scan-dialog`'s modal
    // reopens on top of it (PrimeNG `p-dialog[modal]` renders `position: fixed` above normal
    // flow) — the toast is what the user actually sees, see `release-dialog.ts`'s class doc
    // comment ("Booking-error visibility").
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Artikel 1043, 1050 sind nicht mehr freigebbar.' }),
    );
    expect(component.paymentPanelVisible()).toBe(false);
    expect(scanDialogHidden(fixture)).toBe(false);
    expect(component.sessionIds()).toEqual(['a1', 'a2']);
    expect(releasedSpy).not.toHaveBeenCalled();
    expect(visibleChangeSpy).not.toHaveBeenCalled();
  });

  it('other errors: generic inline error + toast, reopens scan-dialog, does not close', async () => {
    const releaseApi = releaseApiStub();
    releaseApi.bookRelease.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { component, messageService } = await setup({ releaseApi });
    component.onSessionChanged(['a1']);
    component.paymentPanelVisible.set(true);
    const visibleChangeSpy = vi.fn();
    component.visibleChange.subscribe(visibleChangeSpy);

    component.onPaymentConfirmed({ totalAmount: 0.5, receivedAmount: 1, change: 0.5 });

    expect(component.bookingError()).toBe('Buchung fehlgeschlagen. Bitte erneut versuchen.');
    expect(messageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', summary: 'Buchung fehlgeschlagen. Bitte erneut versuchen.' }),
    );
    expect(component.paymentPanelVisible()).toBe(false);
    expect(visibleChangeSpy).not.toHaveBeenCalled();
  });

  it('reopening (visible false -> true) resets the local overlay flags', async () => {
    const { fixture, component } = await setup();
    component.onSessionChanged(['a1']);
    component.paymentPanelVisible.set(true);
    component.bookingError.set('stale error');

    fixture.componentRef.setInput('visible', false);
    fixture.detectChanges();
    fixture.componentRef.setInput('visible', true);
    fixture.detectChanges();

    expect(component.paymentPanelVisible()).toBe(false);
    expect(component.bookingError()).toBeNull();
  });

  it('mounts app-scan-dialog with the releasedAt target field', async () => {
    const { fixture } = await setup({ sellerId: SELLER_ID });

    const scanDialog = fixture.debugElement.query(
      (de) => de.componentInstance instanceof ScanDialog,
    )?.componentInstance as ScanDialog;

    expect(scanDialog.targetField()).toBe('releasedAt');
    expect(scanDialog.sellerId()).toBe(SELLER_ID);
    expect(scanDialog.title()).toBe('Artikel freigeben');
  });
});
