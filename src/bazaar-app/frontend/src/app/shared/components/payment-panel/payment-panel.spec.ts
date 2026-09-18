import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InputNumber } from 'primeng/inputnumber';
import { Numpad } from '../numpad/numpad';
import { PaymentPanel } from './payment-panel';

async function setup(totalAmount = 12.5) {
  await TestBed.configureTestingModule({
    imports: [PaymentPanel],
  }).compileComponents();

  const fixture = TestBed.createComponent(PaymentPanel);
  fixture.componentRef.setInput('totalLabel', 'Gesamtgebühr');
  fixture.componentRef.setInput('totalAmount', totalAmount);
  fixture.componentRef.setInput('confirmLabel', 'Buchen');
  await fixture.whenStable();
  fixture.detectChanges();
  return { fixture, component: fixture.componentInstance };
}

describe('PaymentPanel', () => {
  it('opens in keyboard mode (AC-4)', async () => {
    const { component } = await setup();
    expect(component.mode()).toBe('keyboard');
  });

  it('computes change as receivedAmount - totalAmount, rounded to 2 decimals (AC-1)', async () => {
    const { component } = await setup(12.5);
    component.receivedAmount.set(20.01);
    expect(component.change()).toBe(7.51);
  });

  it('hides the Rückgeld box and disables confirm while receivedAmount < totalAmount (AC-2)', async () => {
    const { component } = await setup(12.5);

    expect(component.showChange()).toBe(false);
    expect(component.belowTotal()).toBe(true);

    component.receivedAmount.set(10);
    expect(component.showChange()).toBe(false);
    expect(component.belowTotal()).toBe(true);
  });

  it('null receivedAmount counts as below totalAmount', async () => {
    const { component } = await setup(12.5);
    expect(component.receivedAmount()).toBeNull();
    expect(component.belowTotal()).toBe(true);
  });

  it('shows the Rückgeld box once receivedAmount >= totalAmount, including the equal case', async () => {
    const { component } = await setup(12.5);

    component.receivedAmount.set(12.5);
    expect(component.showChange()).toBe(true);
    expect(component.belowTotal()).toBe(false);
    expect(component.change()).toBe(0);

    component.receivedAmount.set(20);
    expect(component.showChange()).toBe(true);
    expect(component.change()).toBe(7.5);
  });

  it('emits confirmed with totalAmount/receivedAmount/change on confirm()', async () => {
    const { component } = await setup(12.5);
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    component.receivedAmount.set(20);
    component.confirm();

    expect(confirmedSpy).toHaveBeenCalledWith({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });
  });

  it('does not emit confirmed while receivedAmount < totalAmount', async () => {
    const { component } = await setup(12.5);
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    component.receivedAmount.set(5);
    component.confirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });

  it('resets receivedAmount to null and mode to keyboard, and emits cancelled, on cancel() (AC-6)', async () => {
    const { component } = await setup(12.5);
    const cancelledSpy = vi.fn();
    component.cancelled.subscribe(cancelledSpy);

    component.receivedAmount.set(20);
    component.mode.set('numpad');
    component.cancel();

    expect(component.receivedAmount()).toBeNull();
    expect(component.mode()).toBe('keyboard');
    expect(cancelledSpy).toHaveBeenCalled();
  });

  it('toggles between keyboard and numpad mode and swaps the mode-button icon (AC-5)', async () => {
    const { component } = await setup(12.5);
    expect(component.modeButtonIcon()).toBe('pi pi-th-large');

    component.toggleMode();
    expect(component.mode()).toBe('numpad');
    expect(component.modeButtonIcon()).toBe('pi pi-text');

    component.toggleMode();
    expect(component.mode()).toBe('keyboard');
    expect(component.modeButtonIcon()).toBe('pi pi-th-large');
  });

  it('sets p-inputnumber readonly in numpad mode', async () => {
    const { fixture, component } = await setup(12.5);
    component.mode.set('numpad');
    fixture.detectChanges();

    const inputNumber = fixture.debugElement.query(By.directive(InputNumber)).componentInstance as InputNumber;
    expect(inputNumber.readonly()).toBe(true);
  });

  it('dispatches numpad key presses onto the native amount input (numpad integration pattern)', async () => {
    const { fixture, component } = await setup(12.5);
    component.mode.set('numpad');
    fixture.detectChanges();
    await fixture.whenStable();

    const inputNumber = fixture.debugElement.query(By.directive(InputNumber)).componentInstance as InputNumber;
    const nativeInput = inputNumber.input().nativeElement as HTMLInputElement;
    const dispatchSpy = vi.spyOn(nativeInput, 'dispatchEvent');
    const focusSpy = vi.spyOn(nativeInput, 'focus');

    component.onNumpadKey({ key: '5' });

    expect(focusSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: 'keydown' }));
  });

  it('numpad clear resets receivedAmount to null', async () => {
    const { component } = await setup(12.5);
    component.receivedAmount.set(20);
    component.onNumpadClear();
    expect(component.receivedAmount()).toBeNull();
  });

  it('numpad submit triggers the same confirm() path, wired to the numpad enterDisabled/⏎ (AC-7/AC-8)', async () => {
    const { fixture, component } = await setup(12.5);
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);
    component.mode.set('numpad');
    fixture.detectChanges();

    // Below total: numpad's own `enterDisabled` mirrors belowTotal(), and onNumpadSubmit() itself
    // (called only when the numpad's ⏎ isn't disabled) still must not confirm below total.
    expect(component.belowTotal()).toBe(true);
    const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
    expect(numpad.enterDisabled()).toBe(true);

    component.receivedAmount.set(20);
    fixture.detectChanges();
    expect(numpad.enterDisabled()).toBe(false);

    component.onNumpadSubmit();
    expect(confirmedSpy).toHaveBeenCalledWith({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });
  });
});
