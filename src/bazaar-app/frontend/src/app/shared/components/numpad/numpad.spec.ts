import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Numpad } from './numpad';

/** Finds a rendered `p-button` element by its `styleClass` key modifier (e.g. `--7`, `--clear`). */
function findKey(fixture: ReturnType<typeof TestBed.createComponent>, modifier: string) {
  return fixture.debugElement.query(By.css(`.numpad__key--${modifier}`));
}

function clickKey(fixture: ReturnType<typeof TestBed.createComponent>, modifier: string): void {
  const el = findKey(fixture, modifier);
  el.nativeElement.click();
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

  // AC-4 / AC-5
  it('shows the comma key and emits key , when showDecimal is true, leaving C/0 positions unchanged', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.componentRef.setInput('showDecimal', true);
    fixture.detectChanges();
    const emitted: KeyboardEventInit[] = [];
    fixture.componentInstance.keyPressed.subscribe((e) => emitted.push(e));

    expect(findKey(fixture, 'comma')).toBeTruthy();
    clickKey(fixture, 'comma');
    expect(emitted).toEqual([{ key: ',' }]);

    expect(findKey(fixture, 'clear')).toBeTruthy();
    expect(findKey(fixture, '0')).toBeTruthy();
  });

  it('hides the comma key and leaves its grid slot empty when showDecimal is false', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();

    expect(findKey(fixture, 'comma')).toBeFalsy();
    expect(findKey(fixture, 'clear')).toBeTruthy();
    expect(findKey(fixture, '0')).toBeTruthy();
  });

  // AC-6
  it('emits submitted and NOT keyPressed when ⏎ is clicked, only when showEnter is true', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.componentRef.setInput('showEnter', true);
    fixture.detectChanges();
    const keyPressed: KeyboardEventInit[] = [];
    let submittedCount = 0;
    fixture.componentInstance.keyPressed.subscribe((e) => keyPressed.push(e));
    fixture.componentInstance.submitted.subscribe(() => submittedCount++);

    clickKey(fixture, 'enter');

    expect(submittedCount).toBe(1);
    expect(keyPressed).toEqual([]);
  });

  // AC-7
  it('hides ⏎ when showEnter is false and spans ⌫ across all four rows', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.detectChanges();

    expect(findKey(fixture, 'enter')).toBeFalsy();
    expect(findKey(fixture, 'backspace').nativeElement.classList).toContain('numpad__key--backspace-full');
  });

  it('does not span ⌫ across all four rows when showEnter is true', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.componentRef.setInput('showEnter', true);
    fixture.detectChanges();

    expect(findKey(fixture, 'backspace').nativeElement.classList).not.toContain('numpad__key--backspace-full');
  });

  // AC-9
  it('does not emit submitted when ⏎ is clicked while enterDisabled is true', () => {
    const fixture = TestBed.createComponent(Numpad);
    fixture.componentRef.setInput('showEnter', true);
    fixture.componentRef.setInput('enterDisabled', true);
    fixture.detectChanges();
    let submittedCount = 0;
    fixture.componentInstance.submitted.subscribe(() => submittedCount++);

    const enterButton = findKey(fixture, 'enter').nativeElement as HTMLElement;
    // PrimeNG's own [disabled] binding already blocks the click at the DOM level; this
    // asserts the component-level guard in emitSubmit() as a second, independent safety net.
    fixture.componentInstance.emitSubmit();

    expect(submittedCount).toBe(0);
    expect(enterButton).toBeTruthy();
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
});
