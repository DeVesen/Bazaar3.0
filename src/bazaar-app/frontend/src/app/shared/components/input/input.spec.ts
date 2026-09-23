import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Input, InputAddon } from './input';

describe('Input', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input],
    }).compileComponents();
  });

  function create(label?: string, value?: string, debounceMs?: number) {
    const fixture = TestBed.createComponent(Input);
    if (label !== undefined) fixture.componentRef.setInput('label', label);
    if (value !== undefined) fixture.componentRef.setInput('value', value);
    if (debounceMs !== undefined) fixture.componentRef.setInput('debounceMs', debounceMs);
    fixture.detectChanges();
    return fixture;
  }

  describe('label switch', () => {
    it('wraps the input in p-iftalabel with the label text when label is set', () => {
      const fixture = create('Bezeichnung');
      const iftaLabel = fixture.debugElement.query(By.css('p-iftalabel'));
      expect(iftaLabel).toBeTruthy();
      expect(iftaLabel.nativeElement.textContent).toContain('Bezeichnung');
    });

    it('renders a bare pInputText input, no p-iftalabel, when label is not set', () => {
      const fixture = create();
      expect(fixture.debugElement.query(By.css('p-iftalabel'))).toBeFalsy();
      expect(fixture.debugElement.query(By.css('input[pInputText]'))).toBeTruthy();
    });

    it('shows a required star inside the label when required is set', () => {
      const fixture = create('Vorname');
      fixture.componentRef.setInput('required', true);
      fixture.detectChanges();

      const star = fixture.debugElement.query(By.css('p-iftalabel label .app-input__required'));
      expect(star?.nativeElement.textContent.trim()).toBe('*');
    });

    it('shows no star when required is not set', () => {
      const fixture = create('Anschrift');
      expect(fixture.debugElement.query(By.css('.app-input__required'))).toBeFalsy();
    });
  });

  describe('value binding', () => {
    it('reflects the value input as the initial field content', () => {
      const fixture = create(undefined, 'Ab3dEf7G');
      expect(fixture.componentInstance.rawValue()).toBe('Ab3dEf7G');
    });

    it('reflects the value input in the real DOM input element', async () => {
      const fixture = create(undefined, 'Ab3dEf7G');
      await fixture.whenStable();
      fixture.detectChanges();
      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      expect(input.value).toBe('Ab3dEf7G');
    });
  });

  describe('debounced valueChange', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('debounces by the default 800ms and only emits the last typed value', async () => {
      const fixture = create();
      const emitted: string[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onTyped('B');
      fixture.componentInstance.onTyped('Be');
      fixture.componentInstance.onTyped('Bez');

      await vi.advanceTimersByTimeAsync(500);
      expect(emitted).toEqual([]);

      await vi.advanceTimersByTimeAsync(300);
      expect(emitted).toEqual(['Bez']);
    });

    it('uses a configured debounceMs instead of the 800ms default', async () => {
      const fixture = create(undefined, undefined, 100);
      const emitted: string[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onTyped('x');

      await vi.advanceTimersByTimeAsync(99);
      expect(emitted).toEqual([]);

      await vi.advanceTimersByTimeAsync(1);
      expect(emitted).toEqual(['x']);
    });

    it('emits immediately, with no delay, when debounceMs is 0', async () => {
      const fixture = create(undefined, undefined, 0);
      const emitted: string[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      fixture.componentInstance.onTyped('y');

      await vi.advanceTimersByTimeAsync(0);
      expect(emitted).toEqual(['y']);
    });

    it('feeds the debounced valueChange stream from real DOM input events', async () => {
      const fixture = create();
      const emitted: string[] = [];
      fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      input.value = 'typed';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      await vi.advanceTimersByTimeAsync(800);
      expect(emitted).toEqual(['typed']);
    });
  });

  describe('addons', () => {
    function createWithAddons(addonLeft: InputAddon[], addonRight: InputAddon[] = []) {
      const fixture = TestBed.createComponent(Input);
      fixture.componentRef.setInput('addonLeft', addonLeft);
      fixture.componentRef.setInput('addonRight', addonRight);
      fixture.detectChanges();
      return fixture;
    }

    it('renders no p-inputgroup-addon when both addonLeft and addonRight are empty', () => {
      const fixture = create();
      expect(fixture.debugElement.query(By.css('p-inputgroup-addon'))).toBeFalsy();
    });

    it('renders one p-inputgroup-addon per entry, left before the input, right after', () => {
      const fixture = createWithAddons(
        [{ type: 'icon', value: 'pi pi-search', key: 'search-icon' }],
        [{ type: 'label', value: 'kg', key: 'unit' }],
      );
      const addons = fixture.debugElement.queryAll(By.css('p-inputgroup-addon'));
      expect(addons.length).toBe(2);
      expect(addons[0].query(By.css('i.pi-search'))).toBeTruthy();
      expect(addons[1].nativeElement.textContent.trim()).toBe('kg');
    });

    it('renders a p-button for an addon of type button', () => {
      const fixture = createWithAddons([{ type: 'button', value: 'Los', key: 'go' }]);
      expect(fixture.debugElement.query(By.css('p-button'))).toBeTruthy();
    });

    it('emits addonClick with the addon key when a left addon is clicked, regardless of type', () => {
      const fixture = createWithAddons([{ type: 'label', value: '€', key: 'currency' }]);
      const emitted: string[] = [];
      fixture.componentInstance.addonClick.subscribe((k) => emitted.push(k));

      fixture.debugElement.query(By.css('p-inputgroup-addon')).nativeElement.click();

      expect(emitted).toEqual(['currency']);
    });

    it('emits addonClick with the addon key when a right addon is clicked', () => {
      const fixture = createWithAddons([], [{ type: 'icon', value: 'pi pi-times', key: 'clear' }]);
      const emitted: string[] = [];
      fixture.componentInstance.addonClick.subscribe((k) => emitted.push(k));

      fixture.debugElement.query(By.css('p-inputgroup-addon')).nativeElement.click();

      expect(emitted).toEqual(['clear']);
    });

    it('emits addonClick exactly once when a button-type addon is clicked', () => {
      const fixture = createWithAddons([{ type: 'button', value: 'Los', key: 'go' }]);
      const emitted: string[] = [];
      fixture.componentInstance.addonClick.subscribe((k) => emitted.push(k));

      fixture.debugElement.query(By.css('p-inputgroup-addon')).nativeElement.click();

      expect(emitted).toEqual(['go']);
    });

    it('applies the addon class and style onto the p-inputgroup-addon element', () => {
      const fixture = createWithAddons([
        { type: 'label', value: 'x', key: 'x', class: 'my-addon', style: { color: 'red' } },
      ]);
      const addon = fixture.debugElement.query(By.css('p-inputgroup-addon')).nativeElement as HTMLElement;
      expect(addon.classList).toContain('my-addon');
      expect(addon.style.color).toBe('red');
    });
  });

  describe('raw event passthrough', () => {
    it('emits enter on Enter keydown, immediately, without waiting for the debounce', () => {
      const fixture = create();
      const entered = vi.fn();
      fixture.componentInstance.enter.subscribe(entered);

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      expect(entered).toHaveBeenCalledTimes(1);
    });

    it('emits the native KeyboardEvent on keyUp', () => {
      const fixture = create();
      const emitted: KeyboardEvent[] = [];
      fixture.componentInstance.keyUp.subscribe((e) => emitted.push(e));

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));

      expect(emitted.length).toBe(1);
      expect(emitted[0].key).toBe('a');
    });

    it('emits the native KeyboardEvent on keyDown', () => {
      const fixture = create();
      const emitted: KeyboardEvent[] = [];
      fixture.componentInstance.keyDown.subscribe((e) => emitted.push(e));

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'b', bubbles: true }));

      expect(emitted.length).toBe(1);
      expect(emitted[0].key).toBe('b');
    });

    it('emits the native FocusEvent on blur', () => {
      const fixture = create();
      const emitted: FocusEvent[] = [];
      fixture.componentInstance.blurred.subscribe((e) => emitted.push(e));

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      input.dispatchEvent(new FocusEvent('blur', { bubbles: true }));

      expect(emitted.length).toBe(1);
    });
  });

  describe('standard attributes', () => {
    it('forwards inputId, name, placeholder, type, required, disabled and readonly onto the native input', async () => {
      const fixture = TestBed.createComponent(Input);
      fixture.componentRef.setInput('inputId', 'seller-email');
      fixture.componentRef.setInput('name', 'email');
      fixture.componentRef.setInput('placeholder', 'name@example.com');
      fixture.componentRef.setInput('type', 'email');
      fixture.componentRef.setInput('required', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.componentRef.setInput('readOnly', true);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      expect(input.id).toBe('seller-email');
      expect(input.name).toBe('email');
      expect(input.placeholder).toBe('name@example.com');
      expect(input.type).toBe('email');
      expect(input.required).toBe(true);
      expect(input.disabled).toBe(true);
      expect(input.readOnly).toBe(true);
    });

    it('defaults type to text when not set', () => {
      const fixture = create();
      const input = fixture.debugElement.query(By.css('input[pInputText]')).nativeElement as HTMLInputElement;
      expect(input.type).toBe('text');
    });
  });
});
