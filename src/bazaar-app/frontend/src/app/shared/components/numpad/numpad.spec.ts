import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Numpad } from './numpad';

/** Finds a rendered `p-button` element by its `styleClass` key modifier (e.g. `--7`, `--clear`). */
function findKey(fixture: ReturnType<typeof TestBed.createComponent>, modifier: string) {
  return fixture.debugElement.query(By.css(`.numpad__key--${modifier}`));
}

// Clicks the real <button> nested one level inside the `.numpad__key--*`-classed <p-button> host
// (that host element carries the grid-placement class for CSS Grid purposes — see numpad.scss —
// but PrimeNG's own click handling lives on its internal <button>). A native `.click()` on the
// outer host element never reaches that internal listener, since clicking an element only
// bubbles up to ancestors, never down into descendants — so this mirrors what a real pointer
// click actually hits (the internal <button>, which visually fills the whole grid cell).
function clickKey(fixture: ReturnType<typeof TestBed.createComponent>, modifier: string): void {
  const el = findKey(fixture, modifier);
  const button = el.nativeElement.querySelector('button') as HTMLButtonElement;
  button.click();
  fixture.detectChanges();
}

describe('Numpad', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Numpad],
    }).compileComponents();
  });

  // AC-1
  it.each(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])(
    'emits keyPressed with key %s when the digit is clicked',
    (digit) => {
      const fixture = TestBed.createComponent(Numpad);
      fixture.detectChanges();
      const emitted: KeyboardEventInit[] = [];
      fixture.componentInstance.keyPressed.subscribe((e) => emitted.push(e));

      clickKey(fixture, digit);

      expect(emitted).toEqual([{ key: digit }]);
    },
  );

  // AC-2
  it('emits keyPressed with key Backspace when ⌫ is clicked', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();
    const emitted: KeyboardEventInit[] = [];
    fixture.componentInstance.keyPressed.subscribe((e) => emitted.push(e));

    clickKey(fixture, 'backspace');

    expect(emitted).toEqual([{ key: 'Backspace' }]);
  });

  // AC-3
  it('emits cleared and NOT keyPressed when C is clicked', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();
    const keyPressed: KeyboardEventInit[] = [];
    let clearedCount = 0;
    fixture.componentInstance.keyPressed.subscribe((e) => keyPressed.push(e));
    fixture.componentInstance.cleared.subscribe(() => clearedCount++);

    clickKey(fixture, 'clear');

    expect(clearedCount).toBe(1);
    expect(keyPressed).toEqual([]);
  });

  // AC-4 (numpad-scope): comma is always visible and always emits ','
  it('emits keyPressed with key , when the comma key is clicked', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();
    const emitted: KeyboardEventInit[] = [];
    fixture.componentInstance.keyPressed.subscribe((e) => emitted.push(e));

    clickKey(fixture, 'comma');

    expect(emitted).toEqual([{ key: ',' }]);
  });

  // AC-6
  it('emits submitted and NOT keyPressed when ⏎ is clicked', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();
    const keyPressed: KeyboardEventInit[] = [];
    let submittedCount = 0;
    fixture.componentInstance.keyPressed.subscribe((e) => keyPressed.push(e));
    fixture.componentInstance.submitted.subscribe(() => submittedCount++);

    clickKey(fixture, 'enter');

    expect(submittedCount).toBe(1);
    expect(keyPressed).toEqual([]);
  });

  // Numpad-scope: all 14 keys are always present, regardless of any input.
  it('renders all 14 keys unconditionally (0-9, C, ⌫, comma, ⏎)', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();

    for (const modifier of ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', 'backspace', 'comma', 'enter']) {
      expect(findKey(fixture, modifier)).toBeTruthy();
    }
  });

  // AC-9
  it('does not emit submitted when ⏎ is clicked while enterDisabled is true', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.componentRef.setInput('enterDisabled', true);
    fixture.detectChanges();
    let submittedCount = 0;
    fixture.componentInstance.submitted.subscribe(() => submittedCount++);

    // PrimeNG's own [disabled] binding already blocks the click at the DOM level; this
    // asserts the component-level guard in emitSubmit() as a second, independent safety net.
    fixture.componentInstance.emitSubmit();

    expect(submittedCount).toBe(0);
  });

  // AC-8
  it('holds no internal value/buffer state — repeated clicks only ever emit events', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();
    const emitted: KeyboardEventInit[] = [];
    fixture.componentInstance.keyPressed.subscribe((e) => emitted.push(e));

    clickKey(fixture, '1');
    clickKey(fixture, '2');
    clickKey(fixture, '3');

    expect(emitted).toEqual([{ key: '1' }, { key: '2' }, { key: '3' }]);
    expect(Object.keys(fixture.componentInstance)).not.toContain('value');
    expect(Object.keys(fixture.componentInstance)).not.toContain('buffer');
  });

  // AC-10
  it('renders the grid with the binding margin from the component doc', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();

    const grid = fixture.debugElement.query(By.css('.numpad')).nativeElement as HTMLElement;
    expect(getComputedStyle(grid).margin).toBe('16px 0px');
  });

  it('has no showDecimal/showEnter inputs', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();

    expect((fixture.componentInstance as unknown as Record<string, unknown>)['showDecimal']).toBeUndefined();
    expect((fixture.componentInstance as unknown as Record<string, unknown>)['showEnter']).toBeUndefined();
  });
});
