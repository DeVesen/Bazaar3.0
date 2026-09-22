import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { Input } from './input';

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
  });

  describe('value binding', () => {
    it('reflects the value input as the initial field content', () => {
      const fixture = create(undefined, 'Ab3dEf7G');
      expect(fixture.componentInstance.rawValue()).toBe('Ab3dEf7G');
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
  });
});
