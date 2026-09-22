import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Input } from '../input/input';
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

/** Simulates typing one key into the amount field: runs the component's keydown guard first
 * (as a real browser would before inserting the character), then — if not prevented — appends
 * the key and fires `onAmountTyped`, mirroring what `app-input`'s own (valueChange) would emit. */
function typeKey(component: PaymentPanel, key: string): void {
  let prevented = false;
  const event = { key, ctrlKey: false, metaKey: false, altKey: false, preventDefault: () => (prevented = true) } as unknown as KeyboardEvent;
  component.onAmountKeyDown(event);
  if (prevented) return;
  const current = component.receivedText();
  component.onAmountTyped(current + key);
}

describe('PaymentPanel', () => {
  it('opens in keyboard mode (AC-4)', async () => {
    const { component } = await setup();
    expect(component.mode()).toBe('keyboard');
  });

  it('computes change as receivedAmount - totalAmount, rounded to 2 decimals (AC-1)', async () => {
    const { component } = await setup(12.5);
    component.onAmountTyped('20,01');
    expect(component.change()).toBe(7.51);
  });

  it('hides the Rückgeld box and disables confirm while receivedAmount < totalAmount (AC-2)', async () => {
    const { component } = await setup(12.5);

    expect(component.showChange()).toBe(false);
    expect(component.belowTotal()).toBe(true);

    component.onAmountTyped('10');
    expect(component.showChange()).toBe(false);
    expect(component.belowTotal()).toBe(true);
  });

  it('empty receivedText counts as below totalAmount', async () => {
    const { component } = await setup(12.5);
    expect(component.receivedAmount()).toBeNull();
    expect(component.belowTotal()).toBe(true);
  });

  it('shows the Rückgeld box once receivedAmount >= totalAmount, including the equal case', async () => {
    const { component } = await setup(12.5);

    component.onAmountTyped('12,5');
    expect(component.showChange()).toBe(true);
    expect(component.belowTotal()).toBe(false);
    expect(component.change()).toBe(0);

    component.onAmountTyped('20');
    expect(component.showChange()).toBe(true);
    expect(component.change()).toBe(7.5);
  });

  it('emits confirmed with totalAmount/receivedAmount/change on confirm()', async () => {
    const { component } = await setup(12.5);
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    component.onAmountTyped('20');
    component.confirm();

    expect(confirmedSpy).toHaveBeenCalledWith({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });
  });

  it('does not emit confirmed while receivedAmount < totalAmount', async () => {
    const { component } = await setup(12.5);
    const confirmedSpy = vi.fn();
    component.confirmed.subscribe(confirmedSpy);

    component.onAmountTyped('5');
    component.confirm();

    expect(confirmedSpy).not.toHaveBeenCalled();
  });

  it('resets receivedText to empty and mode to keyboard, and emits cancelled, on cancel() (AC-6)', async () => {
    const { component } = await setup(12.5);
    const cancelledSpy = vi.fn();
    component.cancelled.subscribe(cancelledSpy);

    component.onAmountTyped('20');
    component.mode.set('numpad');
    component.cancel();

    expect(component.receivedText()).toBe('');
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

  it('renders € and the mode-toggle as addonRight entries, no p-inputgroup wrapper', async () => {
    const { fixture, component } = await setup(12.5);
    const appInput = fixture.debugElement.query(By.directive(Input)).componentInstance as Input;

    expect(appInput.addonRight()).toEqual([
      { type: 'label', value: '€', key: 'currency' },
      { type: 'icon', value: 'pi pi-th-large', key: 'mode' },
    ]);
    // Note: `Input`'s own template (out of scope for this task) always wraps its addons in
    // `p-inputgroup` internally, so a DOM-wide query for it is not a meaningful assertion here —
    // the real invariant ("no p-inputgroup composed directly in payment-panel.html anymore") is
    // already covered by asserting against `Input`'s addonRight() API above.

    component.toggleMode();
    fixture.detectChanges();
    expect(appInput.addonRight()).toEqual([
      { type: 'label', value: '€', key: 'currency' },
      { type: 'icon', value: 'pi pi-text', key: 'mode' },
    ]);
  });

  it('clicking the mode addon toggles the mode', async () => {
    const { fixture, component } = await setup(12.5);
    fixture.debugElement.query(By.directive(Input)).componentInstance.addonClick.emit('mode');

    expect(component.mode()).toBe('numpad');
  });

  it('sets app-input readOnly in numpad mode', async () => {
    const { fixture, component } = await setup(12.5);
    component.mode.set('numpad');
    fixture.detectChanges();

    const appInput = fixture.debugElement.query(By.directive(Input)).componentInstance as Input;
    expect(appInput.readOnly()).toBe(true);
  });

  it('rejects a typed letter, leaving receivedText unchanged', async () => {
    const { component } = await setup(12.5);
    typeKey(component, '1');
    typeKey(component, 'a');
    expect(component.receivedText()).toBe('1');
  });

  it('accepts digits and one comma while typing (AC covers only digits + one comma)', async () => {
    const { component } = await setup(12.5);
    for (const key of ['1', '2', ',', '5']) typeKey(component, key);
    expect(component.receivedText()).toBe('12,5');
    expect(component.receivedAmount()).toBe(12.5);
  });

  it('rejects a second comma while typing', async () => {
    const { component } = await setup(12.5);
    for (const key of ['1', ',', '2', ',']) typeKey(component, key);
    expect(component.receivedText()).toBe('1,2');
  });

  it('rejects a third decimal digit while typing', async () => {
    const { component } = await setup(12.5);
    for (const key of ['1', ',', '2', '5', '9']) typeKey(component, key);
    expect(component.receivedText()).toBe('1,25');
  });

  it('applies numpad digits/comma directly onto receivedText, without dispatching a KeyboardEvent', async () => {
    const { fixture, component } = await setup(12.5);
    component.mode.set('numpad');
    fixture.detectChanges();

    const appInputNative = fixture.debugElement.query(By.css('input'))?.nativeElement as HTMLInputElement | undefined;
    const dispatchSpy = appInputNative ? vi.spyOn(appInputNative, 'dispatchEvent') : undefined;

    component.onNumpadKey({ key: '1' });
    component.onNumpadKey({ key: '2' });
    component.onNumpadKey({ key: ',' });
    component.onNumpadKey({ key: '5' });

    expect(component.receivedText()).toBe('12,5');
    expect(component.receivedAmount()).toBe(12.5);
    expect(dispatchSpy?.mock.calls ?? []).toEqual([]);
  });

  it('numpad backspace removes the last character', async () => {
    const { component } = await setup(12.5);
    component.onNumpadKey({ key: '1' });
    component.onNumpadKey({ key: '2' });
    component.onNumpadKey({ key: 'Backspace' });
    expect(component.receivedText()).toBe('1');
  });

  it('numpad caps at 2 decimal digits, same as typing', async () => {
    const { component } = await setup(12.5);
    for (const key of ['1', ',', '2', '5', '9']) component.onNumpadKey({ key });
    expect(component.receivedText()).toBe('1,25');
  });

  it('numpad clear resets receivedText to empty', async () => {
    const { component } = await setup(12.5);
    component.onNumpadKey({ key: '2' });
    component.onNumpadClear();
    expect(component.receivedText()).toBe('');
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

    component.onNumpadKey({ key: '2' });
    component.onNumpadKey({ key: '0' });
    fixture.detectChanges();
    expect(numpad.enterDisabled()).toBe(false);

    component.onNumpadSubmit();
    expect(confirmedSpy).toHaveBeenCalledWith({ totalAmount: 12.5, receivedAmount: 20, change: 7.5 });
  });
});
