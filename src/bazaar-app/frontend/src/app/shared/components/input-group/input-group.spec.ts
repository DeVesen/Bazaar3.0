import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InputNumber } from 'primeng/inputnumber';
import { vi } from 'vitest';
import { InputGroup, InputMode } from './input-group';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
import { Numpad } from '../numpad/numpad';
// `BarcodeScanner` (Task 3) is a real dependency of `InputGroup` — this imports the ONE shared
// `@zxing/browser` mock (see that file's own comment for why it must be centralized) so
// camera-mode tests never touch real device APIs (unavailable in jsdom) while still exercising
// the actual wiring between the two components.
import { getDecodeFromVideoDeviceMock } from '../barcode-scanner/testing/zxing-browser.mock';

const decodeFromVideoDeviceMock = getDecodeFromVideoDeviceMock();

describe('InputGroup', () => {
  beforeEach(async () => {
    decodeFromVideoDeviceMock.mockReset();
    decodeFromVideoDeviceMock.mockResolvedValue({ stop: vi.fn() });

    // jsdom has no `navigator.mediaDevices` at all — unlike a real browser, where it is always
    // present (even when access is later denied). Without this, InputGroup's camera-denied
    // detection (component doc Abschnitt 3) would immediately flip every camera-mode test back
    // to keyboard mode, which is the correct production behavior for a browser truly lacking
    // camera support but not representative of what these tests want to exercise.
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [InputGroup],
    }).compileComponents();
  });

  function create(modes?: InputMode[], variant?: 'search' | 'price' | 'count') {
    const fixture = TestBed.createComponent(InputGroup);
    if (modes) fixture.componentRef.setInput('modes', modes);
    if (variant) fixture.componentRef.setInput('variant', variant);
    fixture.detectChanges();
    return fixture;
  }

  describe('start mode', () => {
    it('always starts in keyboard mode regardless of configured modes', () => {
      const fixture = create(['keyboard', 'camera', 'numpad']);
      expect(fixture.componentInstance.activeMode()).toBe('keyboard');
    });
  });

  describe('mode-button visibility/order (doc Abschnitt 3)', () => {
    it('shows no mode button for modes=[keyboard]', () => {
      const fixture = create(['keyboard']);
      expect(fixture.componentInstance.visibleModes()).toEqual([]);
    });

    it('shows exactly camera for modes=[keyboard, camera]', () => {
      const fixture = create(['keyboard', 'camera']);
      expect(fixture.componentInstance.visibleModes()).toEqual(['camera']);
    });

    it('shows exactly numpad for modes=[keyboard, numpad]', () => {
      const fixture = create(['keyboard', 'numpad']);
      expect(fixture.componentInstance.visibleModes()).toEqual(['numpad']);
    });

    it('shows camera then numpad, in that order, for modes=[keyboard, camera, numpad]', () => {
      const fixture = create(['keyboard', 'camera', 'numpad']);
      expect(fixture.componentInstance.visibleModes()).toEqual(['camera', 'numpad']);
    });

    it('shows keyboard then numpad when camera is active', () => {
      const fixture = create(['keyboard', 'camera', 'numpad']);
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();
      expect(fixture.componentInstance.visibleModes()).toEqual(['keyboard', 'numpad']);
    });

    it('shows keyboard then camera when numpad is active', () => {
      const fixture = create(['keyboard', 'camera', 'numpad']);
      fixture.componentInstance.switchMode('numpad');
      fixture.detectChanges();
      expect(fixture.componentInstance.visibleModes()).toEqual(['keyboard', 'camera']);
    });
  });

  describe('debounce on keyboard typing (search variant)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('debounces valueChange by 300ms and only emits the last value', async () => {
      const fixture = create();
      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onTyped('s');
      fixture.componentInstance.onTyped('sc');
      fixture.componentInstance.onTyped('sch');

      await vi.advanceTimersByTimeAsync(100);
      expect(emitted).toEqual([]);

      await vi.advanceTimersByTimeAsync(300);
      expect(emitted).toEqual(['sch']);
    });
  });

  describe('clear button', () => {
    it('is hidden when the field is empty and visible once it has a value', () => {
      const fixture = create();
      expect(fixture.debugElement.query(By.css('p-button[icon="pi pi-times"]'))).toBeFalsy();

      fixture.componentInstance.onTyped('abc');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('p-button[icon="pi pi-times"]'))).toBeTruthy();
    });

    it('empties the field and refocuses it when clicked', () => {
      const fixture = create();
      fixture.componentInstance.onTyped('abc');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      const focusSpy = vi.spyOn(input, 'focus');

      fixture.componentInstance.onClear();
      fixture.detectChanges();

      expect(fixture.componentInstance.rawValue()).toBe('');
      expect(focusSpy).toHaveBeenCalled();
    });

    it('never shows both the clear button and the spinner at once', () => {
      const fixture = create();
      fixture.componentRef.setInput('searching', true);
      fixture.componentInstance.onTyped('abc');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('p-button[icon="pi pi-times"]'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('p-progressspinner'))).toBeTruthy();
    });
  });

  describe('action button', () => {
    it('is disabled while the field is empty and enabled once it has a value', () => {
      const fixture = create();
      const actionButton = () => fixture.debugElement.query(By.css('p-button[icon="pi pi-reply"]'));

      expect(actionButton().componentInstance.disabled()).toBe(true);

      fixture.componentInstance.onTyped('abc');
      fixture.detectChanges();

      expect(actionButton().componentInstance.disabled()).toBe(false);
    });

    it('emits submitted when clicked', () => {
      const fixture = create();
      let submittedCount = 0;
      fixture.componentInstance.submitted.subscribe(() => submittedCount++);

      fixture.componentInstance.onSubmit();

      expect(submittedCount).toBe(1);
    });
  });

  describe('numpad mode', () => {
    it('sets the search input readonly and wires numpad keys via a dispatched KeyboardEvent, immediately (no debounce)', () => {
      vi.useFakeTimers();
      const fixture = create(['keyboard', 'numpad']);
      fixture.componentInstance.switchMode('numpad');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      expect(input.readOnly).toBe(true);

      const dispatchSpy = vi.spyOn(input, 'dispatchEvent');
      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onNumpadKey({ key: '5' });

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      const dispatchedEvent = dispatchSpy.mock.calls[0][0] as KeyboardEvent;
      expect(dispatchedEvent.type).toBe('keydown');
      expect(dispatchedEvent.key).toBe('5');
      expect(emitted).toEqual(['5']);
      vi.useRealTimers();
    });

    it('clears the field via the numpad cleared event', () => {
      const fixture = create(['keyboard', 'numpad']);
      fixture.componentInstance.switchMode('numpad');
      fixture.componentInstance.onTyped('99');
      fixture.detectChanges();

      fixture.componentInstance.onNumpadClear();

      expect(fixture.componentInstance.rawValue()).toBe('');
    });

    // Review fix (Round-16 Task 4, fix round 1) — Important 2: clearing a price via the numpad
    // must not emit `valueChange(0)`. Emitting `0` would make "kein Wert eingegeben" (an empty
    // field) indistinguishable from a genuinely entered price of zero for a later consumer
    // (e.g. intake-wizard). Clearing should just leave the field empty without emitting.
    it('clears the price field via the numpad cleared event WITHOUT emitting a 0 valueChange', () => {
      const fixture = create(['keyboard', 'numpad'], 'price');
      fixture.componentInstance.switchMode('numpad');
      fixture.componentInstance.priceValue.set(12.5);
      fixture.detectChanges();

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onNumpadClear();

      expect(fixture.componentInstance.priceValue()).toBeNull();
      expect(emitted).toEqual([]);
    });

    it("wires the numpad's submitted event to the same submit handler as the action button", () => {
      const fixture = create(['keyboard', 'numpad'], 'price');
      fixture.componentInstance.switchMode('numpad');
      fixture.detectChanges();

      let submittedCount = 0;
      fixture.componentInstance.submitted.subscribe(() => submittedCount++);

      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
      numpad.submitted.emit();

      expect(submittedCount).toBe(1);
    });

    // Review fix (Round-16 Task 4, fix round 1) — Important 1: the numpadDispatchInProgress
    // bypass in onPriceTyped() was only covered indirectly via a search-variant assertion;
    // exercise it explicitly for the price variant here. `p-inputnumber` handles a (dispatched)
    // keydown internally and calls (ngModelChange)/onPriceTyped() SYNCHRONOUSLY within the
    // dispatchEvent() call — the mocked dispatchEvent below reproduces exactly that timing, so
    // onPriceTyped() runs while `numpadDispatchInProgress` is still true, the same as in
    // production.
    it('emits price changes from the numpad immediately, while keyboard-typed price changes still debounce', () => {
      vi.useFakeTimers();
      const fixture = create(['keyboard', 'numpad'], 'price');
      fixture.componentInstance.switchMode('numpad');
      fixture.detectChanges();

      const priceInput = fixture.debugElement.query(By.directive(InputNumber))
        .componentInstance as InputNumber;
      const nativeInput = priceInput.input().nativeElement;
      vi.spyOn(nativeInput, 'dispatchEvent').mockImplementation(() => {
        fixture.componentInstance.onPriceTyped(5);
        return true;
      });

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onNumpadKey({ key: '5' });

      // No debounce wait needed — the numpad-origin change must already be through.
      expect(emitted).toEqual([5]);

      // A genuinely keyboard-typed change (numpadDispatchInProgress is false again by now)
      // still goes through the 300ms debounce.
      fixture.componentInstance.onPriceTyped(12);
      expect(emitted).toEqual([5]);

      vi.advanceTimersByTime(300);
      expect(emitted).toEqual([5, 12]);

      vi.useRealTimers();
    });
  });

  describe('camera mode', () => {
    it('embeds barcode-scanner with active bound to the camera mode', () => {
      const fixture = create(['keyboard', 'camera']);
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      const scanner = fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;
      expect(scanner.active()).toBe(true);
    });

    it('updates the value and switches back to keyboard when codeDetected fires (search variant)', () => {
      const fixture = create(['keyboard', 'camera']);
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      const scanner = fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;
      scanner.codeDetected.emit('1234567890123');

      expect(fixture.componentInstance.rawValue()).toBe('1234567890123');
      expect(emitted).toEqual(['1234567890123']);
      expect(fixture.componentInstance.activeMode()).toBe('keyboard');
    });

    it('parses codeDetected as a number for the price variant', () => {
      const fixture = create(['keyboard', 'camera'], 'price');
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      const scanner = fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;
      scanner.codeDetected.emit('12,50');

      expect(fixture.componentInstance.priceValue()).toBe(12.5);
      expect(emitted).toEqual([12.5]);
    });
  });

  describe('cameraReplacesInput=false (Round-16 Task 7 fix round 1, reviewer Critical 1)', () => {
    it('keeps the <input> in the DOM and does not render its own barcode-scanner while camera mode is active', () => {
      const fixture = create(['keyboard', 'camera']);
      fixture.componentRef.setInput('cameraReplacesInput', false);
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[pInputText]'));
      expect(input).toBeTruthy();
      expect(fixture.debugElement.query(By.directive(BarcodeScanner))).toBeFalsy();
    });

    it('applyExternalValue() sets the field value and emits valueChange without touching activeMode', () => {
      const fixture = create(['keyboard', 'camera']);
      fixture.componentRef.setInput('cameraReplacesInput', false);
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.applyExternalValue('SEL00001');

      expect(fixture.componentInstance.rawValue()).toBe('SEL00001');
      expect(emitted).toEqual(['SEL00001']);
      // Unlike onCodeDetected(), applyExternalValue() leaves mode transitions to the parent.
      expect(fixture.componentInstance.activeMode()).toBe('camera');
    });

    it('applyExternalValue() parses the value as a number for the price variant', () => {
      const fixture = create(['keyboard'], 'price');
      fixture.componentInstance.applyExternalValue('12,50');

      expect(fixture.componentInstance.priceValue()).toBe(12.5);
    });
  });

  describe('showLeftAddon (final-review fix, Important 2 — doc AC-8)', () => {
    it('renders the 🔍 Left-Addon by default', () => {
      const fixture = create();
      expect(fixture.debugElement.query(By.css('p-inputgroup-addon'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('.pi-search'))).toBeTruthy();
    });

    it('removes the Left-Addon slot from the DOM entirely when showLeftAddon=false', () => {
      const fixture = create();
      fixture.componentRef.setInput('showLeftAddon', false);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('p-inputgroup-addon'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('.pi-search'))).toBeFalsy();
    });
  });

  describe('previous-mode tracking (Round-16 Task 7 fix round 1, reviewer Important 3)', () => {
    it('getPreviousMode() defaults to keyboard before camera has ever been entered', () => {
      const fixture = create(['keyboard', 'camera', 'numpad']);
      expect(fixture.componentInstance.getPreviousMode()).toBe('keyboard');
    });

    it('captures the mode active immediately before switching into camera, synchronously inside switchMode()', () => {
      const fixture = create(['keyboard', 'camera', 'numpad']);
      fixture.componentInstance.switchMode('numpad');
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      expect(fixture.componentInstance.getPreviousMode()).toBe('numpad');
    });

    it('does not overwrite the previous mode on a redundant camera-to-camera switch', () => {
      const fixture = create(['keyboard', 'camera', 'numpad']);
      fixture.componentInstance.switchMode('numpad');
      fixture.componentInstance.switchMode('camera');
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      expect(fixture.componentInstance.getPreviousMode()).toBe('numpad');
    });
  });

  describe('price variant', () => {
    it('renders p-inputnumber and the € addon with no clear button and no action button', () => {
      const fixture = create(['keyboard'], 'price');

      expect(fixture.debugElement.query(By.css('p-inputnumber'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('p-inputgroup-addon'))?.nativeElement.textContent.trim()).toBe('€');
      expect(fixture.debugElement.query(By.css('p-button[icon="pi pi-times"]'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('p-button[icon="pi pi-reply"]'))).toBeFalsy();
    });

    it('shows a single mode-button when numpad is offered alongside keyboard', () => {
      const fixture = create(['keyboard', 'numpad'], 'price');
      expect(fixture.componentInstance.visibleModes()).toEqual(['numpad']);
    });

    it('shows no mode-button for a single-mode price field', () => {
      const fixture = create(['keyboard'], 'price');
      expect(fixture.componentInstance.visibleModes()).toEqual([]);
    });
  });

  // Round-25 Task 6a: the count variant (`ms`-addon, integer p-inputnumber, no camera) reuses
  // the price variant's numeric code paths — see `isNumericVariant()` in input-group.ts — so
  // these tests mirror the 'price variant' describe block above, plus the count-specific
  // integer/no-camera assertions from the task brief.
  describe('count variant (Round-25 Task 6a)', () => {
    it('renders the ms addon with no left-addon, no clear button and no action button', () => {
      const fixture = create(['keyboard'], 'count');

      expect(fixture.debugElement.query(By.css('p-inputnumber'))).toBeTruthy();
      expect(fixture.debugElement.query(By.css('p-inputgroup-addon'))?.nativeElement.textContent.trim()).toBe('ms');
      expect(fixture.debugElement.query(By.css('.pi-search'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('p-button[icon="pi pi-times"]'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('p-button[icon="pi pi-reply"]'))).toBeFalsy();
    });

    it('configures the p-inputnumber for integer-only input (no fraction digits)', () => {
      const fixture = create(['keyboard'], 'count');

      const inputNumber = fixture.debugElement.query(By.directive(InputNumber)).componentInstance as InputNumber;
      expect(inputNumber.minFractionDigits()).toBe(0);
      expect(inputNumber.maxFractionDigits()).toBe(0);
    });

    it('shows exactly one modus-button (numpad) when modes=[keyboard, numpad] and switches to a readonly p-inputnumber + app-numpad', () => {
      const fixture = create(['keyboard', 'numpad'], 'count');
      expect(fixture.componentInstance.visibleModes()).toEqual(['numpad']);

      fixture.componentInstance.switchMode('numpad');
      fixture.detectChanges();

      const inputNumber = fixture.debugElement.query(By.directive(InputNumber)).componentInstance as InputNumber;
      expect(inputNumber.input().nativeElement.readOnly).toBe(true);

      const numpad = fixture.debugElement.query(By.directive(Numpad));
      expect(numpad).toBeTruthy();
    });

    it('shows no mode-button for a single-mode count field', () => {
      const fixture = create(['keyboard'], 'count');
      expect(fixture.componentInstance.visibleModes()).toEqual([]);
    });

    it('emits a number via valueChange when a value is typed', () => {
      vi.useFakeTimers();
      const fixture = create(['keyboard'], 'count');

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onPriceTyped(3000);
      vi.advanceTimersByTime(300);

      expect(emitted).toEqual([3000]);
      vi.useRealTimers();
    });

    it('emits a number via valueChange immediately when entered via the numpad (no debounce)', () => {
      const fixture = create(['keyboard', 'numpad'], 'count');
      fixture.componentInstance.switchMode('numpad');
      fixture.detectChanges();

      const inputNumber = fixture.debugElement.query(By.directive(InputNumber)).componentInstance as InputNumber;
      const nativeInput = inputNumber.input().nativeElement;
      vi.spyOn(nativeInput, 'dispatchEvent').mockImplementation(() => {
        fixture.componentInstance.onPriceTyped(3000);
        return true;
      });

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onNumpadKey({ key: '3' });

      expect(emitted).toEqual([3000]);
    });

    // Not over-engineered per the task brief (OPTIONAL): the count variant's template has no
    // camera `@if` branch at all (see input-group.ts), so no barcode-scanner can ever render for
    // it regardless of a (type-system-forbidden) misconfigured `modes` array.
    it('never renders a barcode-scanner for the count variant, even if modes were misconfigured to include camera', () => {
      const fixture = create(['keyboard', 'camera', 'numpad'] as InputMode[], 'count');
      fixture.componentInstance.switchMode('camera');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.directive(BarcodeScanner))).toBeFalsy();
    });

    it('clears the field via the numpad cleared event without emitting a 0 valueChange', () => {
      const fixture = create(['keyboard', 'numpad'], 'count');
      fixture.componentInstance.switchMode('numpad');
      fixture.componentInstance.priceValue.set(3000);
      fixture.detectChanges();

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onNumpadClear();

      expect(fixture.componentInstance.priceValue()).toBeNull();
      expect(emitted).toEqual([]);
    });

    it('rounds a fractional value from applyExternalValue() to an integer (fix round 1, reviewer Important 2)', () => {
      const fixture = create(['keyboard'], 'count');

      const emitted: (string | number)[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.applyExternalValue('12,5');

      expect(fixture.componentInstance.priceValue()).toBe(13);
      expect(emitted).toEqual([13]);
    });
  });

  describe('extra mode button (Artikelannahme Umnummerierung)', () => {
    function createWithExtra(extra: { icon: string; badge: string | null } | null) {
      const fixture = TestBed.createComponent(InputGroup);
      fixture.componentRef.setInput('modes', ['keyboard', 'camera', 'numpad']);
      fixture.componentRef.setInput('variant', 'search');
      fixture.componentRef.setInput('addonActionButtons', true);
      fixture.componentRef.setInput('extraModeButton', extra);
      fixture.detectChanges();
      return fixture;
    }

    it('renders no extra button when extraModeButton is null (every existing consumer)', () => {
      const fixture = createWithExtra(null);
      expect(fixture.nativeElement.querySelector('.input-group__mode-button--extra')).toBeNull();
    });

    it('renders the extra button with its icon and emits extraModeClicked on click', () => {
      const fixture = createWithExtra({ icon: 'pi pi-sync', badge: null });
      const clicked = vi.fn();
      fixture.componentInstance.extraModeClicked.subscribe(clicked);

      const button = fixture.nativeElement.querySelector('.input-group__mode-button--extra button');
      button.click();

      expect(clicked).toHaveBeenCalled();
    });

    it('renders the badge text when set, and no badge element when null', () => {
      const withBadge = createWithExtra({ icon: 'pi pi-sync', badge: '6' });
      expect(withBadge.nativeElement.querySelector('.input-group__mode-badge').textContent.trim()).toBe('6');

      const withoutBadge = createWithExtra({ icon: 'pi pi-sync', badge: null });
      expect(withoutBadge.nativeElement.querySelector('.input-group__mode-badge')).toBeNull();
    });
  });

  describe('focusAndSelect()', () => {
    it('focuses the native search input and selects its text', () => {
      const fixture = create(['keyboard'], 'search');
      fixture.componentInstance.applyExternalValue('1234');
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
      const selectSpy = vi.spyOn(input, 'select');

      fixture.componentInstance.focusAndSelect();

      expect(document.activeElement).toBe(input);
      expect(selectSpy).toHaveBeenCalled();
    });
  });
});
