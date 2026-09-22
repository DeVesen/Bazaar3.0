# Bezahlen-Dialog: Breite, Betrag-Feld, globales Numpad-Layout — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the numpad show all 12/14 keys everywhere (no more `showDecimal`/`showEnter` toggles), rebuild the payment-panel's "Betrag erhalten" field on `app-input` with self-owned string parsing, wire `⏎` at the two numpad sites that never had it, and give the three Bezahlen-Dialoge a responsive width.

**Architecture:** `app-numpad` becomes a fixed 4×4 event-relay (still zero internal state) — its `showDecimal`/`showEnter` `@Input()`s are deleted, not defaulted. All 6 call sites lose those two bindings in the same task that removes them from `numpad.ts`, so the app never sits in an uncompilable state between tasks. `payment-panel.ts` then moves off `p-inputnumber`/`p-inputgroup` onto `app-input` + `addonRight`, following the exact pattern `intake-article-entry.ts`'s Preis-Feld already established (`priceText` signal + `parseGermanDecimal()` + numpad keys appended directly onto the string). The three `p-dialog`s get a `styleClass` + `::ng-deep` breakpoint block, mirroring `scan-dialog.scss`'s existing pattern for styling a PrimeNG dialog from its host component.

**Tech Stack:** Angular (standalone components, signals, `ChangeDetectionStrategy.OnPush`), PrimeNG, Vitest (`@angular/build:unit-test` runner) via `ng test`.

**Spec:** [docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md](../../spec/2026-09-22-bezahlen-dialog-betrag-numpad.md)

## Global Constraints

- Breakpoints: `@media (max-width: 1023px)` and `@media (max-width: 767px)` (exact values from `kpi-grid.scss`).
- Dialog widths: ≥1024px → 25%, 768–1023px → 50%, ≤767px → 95%.
- Numpad shows all 12 digit/utility keys (0–9, C, ⌫) plus `,` and `⏎` at **every** call site, unconditionally.
- `enterDisabled` keeps controlling only disabled/enabled — never visibility.
- No native `KeyboardEvent` dispatch anywhere in `payment-panel.ts` — numpad keys write directly into a string signal.
- Run tests with `npx ng test --include='<glob>'` from `src/bazaar-app/frontend`; run the full suite (`npx ng test`) once at the end of the plan.

---

### Task 1: Numpad — always-visible keys, new layout, update all 6 call sites

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/shared/components/numpad/numpad.ts`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/numpad/numpad.scss`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/numpad/numpad.spec.ts`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.ts` (3 numpad usages)
- Modify: `src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.spec.ts:453`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.html:29-36`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.html:73-75`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts:741`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.html:19-21` (no `showDecimal`/`showEnter` there today — only touched again in Task 3)
- Modify: `docs/components/numpad/component.md`
- Modify: `docs/components/input-group/component.md:210`
- Modify: `docs/components/seller-search/component.md:39`
- Modify: `docs/components/settings-form/component.md:47`
- Modify: `docs/components/scan-dialog/component.md:124-125`

**Interfaces:**
- Consumes: nothing new.
- Produces: `Numpad` with `keyPressed`/`cleared`/`submitted` outputs unchanged, `enterDisabled` input unchanged, `showDecimal`/`showEnter` inputs **removed** — every caller must drop those two bindings.

- [ ] **Step 1: Update the existing numpad spec to the new contract (red)**

Replace `src/bazaar-app/frontend/src/app/shared/components/numpad/numpad.spec.ts` in full:

```typescript
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
```

- [ ] **Step 2: Run the numpad spec to confirm it fails against the current implementation**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/numpad.spec.ts'
```

Expected: FAIL — comma/enter keys are not rendered by default (`showDecimal`/`showEnter` default `false`), and the "no showDecimal/showEnter" test fails because those inputs still exist.

- [ ] **Step 3: Rewrite `numpad.ts`**

Replace `src/bazaar-app/frontend/src/app/shared/components/numpad/numpad.ts` in full:

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

/**
 * Cross-app stateless event-relay component rendering a touch-optimized 4x4 numeric grid
 * (docs/components/numpad/component.md). It holds NO value/buffer of its own — every click
 * results in exactly one emitted event (`keyPressed`, `cleared` or `submitted`), and it is the
 * parent's job to apply the received key onto its own value (component doc, Abschnitt 4
 * "Empfehlung: Integration im Parent").
 *
 * Global layout (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md): all 14 keys are always
 * rendered — the former `showDecimal`/`showEnter` visibility toggles are gone, not defaulted.
 * `enterDisabled` still only controls ⏎'s disabled state, never its visibility.
 *
 * PrimeIcons note (Round-16 Task 4): the doc's PrimeNG-Basis section (Abschnitt 5) shows the
 * `data-p-icon` SVG-component icon form, but this codebase uses PrimeIcons as plain CSS classes
 * (`icon="pi pi-..."` on `p-button`, see `verkaeufer-dialog`). `pi-delete-left` (⌫) exists
 * verbatim in the installed `primeicons` 8.0.1. `pi-arrow-turn-down-left` (⏎) does NOT exist in
 * that version — `pi-reply` is used instead as the closest available visual/semantic match
 * (a left-curving return arrow).
 */
@Component({
  selector: 'app-numpad',
  imports: [ButtonModule],
  template: `
    <div class="numpad">
      <p-button label="7" class="numpad__key numpad__key--7" (onClick)="emitDigit('7')" />
      <p-button label="8" class="numpad__key numpad__key--8" (onClick)="emitDigit('8')" />
      <p-button label="9" class="numpad__key numpad__key--9" (onClick)="emitDigit('9')" />
      <p-button
        icon="pi pi-delete-left"
        severity="secondary"
        class="numpad__key numpad__key--backspace"
        (onClick)="emitBackspace()"
      />

      <p-button label="4" class="numpad__key numpad__key--4" (onClick)="emitDigit('4')" />
      <p-button label="5" class="numpad__key numpad__key--5" (onClick)="emitDigit('5')" />
      <p-button label="6" class="numpad__key numpad__key--6" (onClick)="emitDigit('6')" />
      <p-button label="C" severity="secondary" class="numpad__key numpad__key--clear" (onClick)="emitClear()" />

      <p-button label="1" class="numpad__key numpad__key--1" (onClick)="emitDigit('1')" />
      <p-button label="2" class="numpad__key numpad__key--2" (onClick)="emitDigit('2')" />
      <p-button label="3" class="numpad__key numpad__key--3" (onClick)="emitDigit('3')" />
      <p-button
        icon="pi pi-reply"
        severity="secondary"
        class="numpad__key numpad__key--enter"
        [disabled]="enterDisabled()"
        (onClick)="emitSubmit()"
      />

      <p-button label="0" class="numpad__key numpad__key--0" (onClick)="emitDigit('0')" />
      <p-button label="," severity="secondary" class="numpad__key numpad__key--comma" (onClick)="emitComma()" />
    </div>
  `,
  styleUrl: './numpad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Numpad {
  readonly enterDisabled = input<boolean>(false);

  /** Emits for 0-9, comma and Backspace only — never for C or ⏎ (component doc, Abschnitt 3). */
  readonly keyPressed = output<KeyboardEventInit>();
  readonly cleared = output<void>();
  readonly submitted = output<void>();

  emitDigit(digit: string): void {
    this.keyPressed.emit({ key: digit });
  }

  emitComma(): void {
    this.keyPressed.emit({ key: ',' });
  }

  emitBackspace(): void {
    this.keyPressed.emit({ key: 'Backspace' });
  }

  emitClear(): void {
    this.cleared.emit();
  }

  emitSubmit(): void {
    if (this.enterDisabled()) return;
    this.submitted.emit();
  }
}
```

- [ ] **Step 4: Rewrite `numpad.scss` grid positions for the new layout**

Replace `src/bazaar-app/frontend/src/app/shared/components/numpad/numpad.scss` in full:

```scss
:host {
  display: block;
}

// Layout-Details (component doc, Abschnitt 6) — margin is binding at every call site, the
// grid must never be re-spaced by a parent.
.numpad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin: 16px 0;
  width: 100%;
}

// Explicit grid placement per key (rather than relying on DOM-order auto-flow). All 14 keys are
// always rendered (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md) — layout:
//   7  8  9  ⌫
//   4  5  6  C
//   1  2  3  ⏎
//   0  0  ,  ⏎
//
// These classes sit on a plain `class`/`[class]` attribute on the <p-button> TAG itself (not
// PrimeNG's `styleClass` input) because the actual CSS Grid item is that host element — PrimeNG
// renders its own internal <button> one level below it, and grid-column/row on a non-grid-item
// descendant has no layout effect at all.
.numpad__key {
  width: 100%;
  height: 100%;

  &--7 {
    grid-column: 1;
    grid-row: 1;
  }
  &--8 {
    grid-column: 2;
    grid-row: 1;
  }
  &--9 {
    grid-column: 3;
    grid-row: 1;
  }
  &--backspace {
    grid-column: 4;
    grid-row: 1;
  }
  &--4 {
    grid-column: 1;
    grid-row: 2;
  }
  &--5 {
    grid-column: 2;
    grid-row: 2;
  }
  &--6 {
    grid-column: 3;
    grid-row: 2;
  }
  &--clear {
    grid-column: 4;
    grid-row: 2;
  }
  &--1 {
    grid-column: 1;
    grid-row: 3;
  }
  &--2 {
    grid-column: 2;
    grid-row: 3;
  }
  &--3 {
    grid-column: 3;
    grid-row: 3;
  }
  &--enter {
    grid-column: 4;
    grid-row: 3 / span 2;
  }
  &--0 {
    grid-column: 1 / span 2;
    grid-row: 4;
  }
  &--comma {
    grid-column: 3;
    grid-row: 4;
  }
}

// Sizes PrimeNG's internal <button>, rendered one level below the `.numpad__key` host, to fill
// the grid cell (component doc, Abschnitt 6). `height: 100%` (not just `min-height`) so a
// spanned key (0, Enter) fills its whole grid area instead of leaving a gap below the button.
.numpad ::ng-deep .p-button {
  width: 100%;
  height: 100%;
  min-height: 48px;
  font-size: 20px;
  font-weight: 600;
}
```

- [ ] **Step 5: Run the numpad spec again to confirm it passes**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/numpad.spec.ts'
```

Expected: PASS.

- [ ] **Step 6: Drop `showDecimal`/`showEnter` from `input-group.ts`'s three numpad usages**

In `src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.ts`, the template has three `<app-numpad ...>` blocks (search/price/count variants). In each one, delete the `[showDecimal]="..."` and `[showEnter]="true"` lines, leaving `[enterDisabled]`/`(keyPressed)`/`(cleared)`/`(submitted)` untouched:

```html
@if (activeMode() === 'numpad') {
  <app-numpad
    [enterDisabled]="rawValue().length === 0"
    (keyPressed)="onNumpadKey($event)"
    (cleared)="onNumpadClear()"
    (submitted)="onSubmit()"
  />
}
```

(search variant — `enterDisabled` expression stays `rawValue().length === 0`)

```html
@if (activeMode() === 'numpad') {
  <app-numpad
    [enterDisabled]="priceValue() === null"
    (keyPressed)="onNumpadKey($event)"
    (cleared)="onNumpadClear()"
    (submitted)="onSubmit()"
  />
}
```

(price variant, then an identical block for the count variant — both already use `[enterDisabled]="priceValue() === null"`, only the surrounding `@else` branch differs; do not touch anything else in the template).

- [ ] **Step 7: Fix the one input-group spec assertion that reads `showDecimal`**

In `src/bazaar-app/frontend/src/app/shared/components/input-group/input-group.spec.ts`, the test titled `'shows exactly one modus-button (numpad) when modes=[keyboard, numpad] and switches to a readonly p-inputnumber + app-numpad with showDecimal=false'` (around line 442) currently ends with:

```typescript
      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
      expect(numpad.showDecimal()).toBe(false);
    });
```

Replace the last two lines and the test title (`showDecimal` no longer exists on `Numpad`) with:

```typescript
      const numpad = fixture.debugElement.query(By.directive(Numpad));
      expect(numpad).toBeTruthy();
    });
```

and rename the test to `'shows exactly one modus-button (numpad) when modes=[keyboard, numpad] and switches to a readonly p-inputnumber + app-numpad'`.

- [ ] **Step 8: Drop `showDecimal`/`showEnter` from `payment-panel.html`'s numpad tag**

In `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.html`, change:

```html
  @if (mode() === 'numpad') {
    <app-numpad
      [showDecimal]="true"
      [showEnter]="true"
      [enterDisabled]="belowTotal()"
      (keyPressed)="onNumpadKey($event)"
      (cleared)="onNumpadClear()"
      (submitted)="onNumpadSubmit()"
    />
  }
```

to:

```html
  @if (mode() === 'numpad') {
    <app-numpad
      [enterDisabled]="belowTotal()"
      (keyPressed)="onNumpadKey($event)"
      (cleared)="onNumpadClear()"
      (submitted)="onNumpadSubmit()"
    />
  }
```

(Task 2 rewrites this component's `.ts`/`.html` further — this step only keeps the app compiling.)

- [ ] **Step 9: Drop `showDecimal` from `intake-article-entry.html`'s price-field numpad**

In `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.html:74`, change:

```html
          <app-numpad [showDecimal]="true" (keyPressed)="onPriceNumpadKey($event)" (cleared)="onPriceNumpadClear()" />
```

to:

```html
          <app-numpad (keyPressed)="onPriceNumpadKey($event)" (cleared)="onPriceNumpadClear()" />
```

- [ ] **Step 10: Fix the intake-article-entry spec assertion that reads `showDecimal`**

In `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts`, the test `'numpad digits/comma/backspace/clear apply directly onto priceText, and it opens with decimal support'` (around line 734) currently has:

```typescript
      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
      expect(numpad.showDecimal()).toBe(true);
```

Delete the `expect(numpad.showDecimal()).toBe(true);` line (keep the `const numpad = ...` line — it is still used below to read `numpad.keyPressed`). Rename the test to `'numpad digits/comma/backspace/clear apply directly onto priceText'`.

- [ ] **Step 11: Update `docs/components/numpad/component.md`**

Rewrite the file's sections to match the new contract:

- Replace the "Überblick" paragraph's "zwölf bis vierzehn Buttons — je nachdem, ob Komma-Taste und `⏎` eingeblendet sind (Abschnitt 2)" with "vierzehn Buttons — immer alle, an jeder Verwendungsstelle (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md)".
- Replace the "1. ASCII-Darstellung" block with:

  ```
  ┌──────┬──────┬──────┬──────┐
  │  7   │  8   │  9   │  ⌫   │
  ├──────┼──────┼──────┼──────┤
  │  4   │  5   │  6   │  C   │
  ├──────┼──────┼──────┼──────┤
  │  1   │  2   │  3   │      │
  ├──────┴──────┼──────┤  ⏎   │
  │      0      │  ,   │      │
  └─────────────┴──────┴──────┘
  ```

  followed by: "Alle 14 Tasten sind immer sichtbar — die früheren `showDecimal`/`showEnter`-Umschalter sind ersatzlos entfallen (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md). `0` spannt zwei Spalten, `⏎` spannt Zeile 3–4 in Spalte 4. Alle Tasten sind gleich groß — touch-optimiert (min. 48 × 48 px). `C`, `⌫` und `⏎` sind visuell dezent abgesetzt (Sekundär-Stil)."
- In "2. Input-/Output-Schnittstelle", delete the `showDecimal`/`showEnter` table rows, keep only `enterDisabled`.
- In "3. Key-Mapping", remove "— nur wenn `showDecimal`" and "— nur wenn `showEnter`" from the `,` and `⏎` rows.
- In "4. Empfehlung: Integration im Parent", Schritt 4's example, delete `[showDecimal]="true"` and `[showEnter]="true"` from the snippet.
- In "5. PrimeNG-Basis", delete the `*ngIf="showDecimal"` from the comma button's pseudo-code line.
- In "Akzeptanzkriterien": delete AC-4, AC-5 and AC-7 (they describe the removed toggles); renumber the rest sequentially (old AC-6 → AC-4, AC-8 → AC-5, AC-9 → AC-6, AC-10 → AC-7). Add a new AC-8: "**AC-8** — THE SYSTEM SHALL an jeder Verwendungsstelle unconditional alle 14 Tasten (0–9, C, ⌫, `,`, `⏎`) anzeigen."

- [ ] **Step 12: Update the four other component docs that mention `showDecimal`/`showEnter`**

`docs/components/input-group/component.md:210` — replace:
```
- Numpad `showDecimal="false"` (kein Komma-Taste, passend zur Ganzzahl-Eingabe).
```
with:
```
- Numpad zeigt wie an jeder anderen Verwendungsstelle alle Tasten inkl. Komma — die
  `p-inputnumber`-Ganzzahl-Konfiguration (Zeile oben) verhindert eine Kommaeingabe unabhängig
  vom Numpad.
```

`docs/components/seller-search/component.md:39` — replace:
```
| Numpad | Für die Suche nach reiner Verkäufernummer; `showDecimal="false"`, `showEnter="true"`, `⏎` löst dieselbe Aktion aus wie `Enter` (Abschnitt 4) |
```
with:
```
| Numpad | Für die Suche nach reiner Verkäufernummer; `⏎` löst dieselbe Aktion aus wie `Enter` (Abschnitt 4) |
```

`docs/components/settings-form/component.md:47` — replace:
```
  Kamera-Modus — ein Millisekunden-Pausenwert wird nie gescannt), Numpad `showDecimal="false"`.
```
with:
```
  Kamera-Modus — ein Millisekunden-Pausenwert wird nie gescannt).
```

`docs/components/scan-dialog/component.md:124-125` — replace:
```
Der Numpad läuft hier mit `showDecimal="false"` (Artikelnummern sind ganzzahlig) und
`showEnter="true"`. `⏎` bestätigt die getippte Nummer — identisch zu `Enter` im
```
with:
```
Der Numpad zeigt hier wie überall alle Tasten. `⏎` bestätigt die getippte Nummer — identisch zu `Enter` im
```

- [ ] **Step 13: Run the full affected-file test slice and lint**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/numpad.spec.ts' --include='**/input-group.spec.ts' --include='**/intake-article-entry.spec.ts' --include='**/payment-panel.spec.ts'
npx ng lint
```

Expected: all PASS (the `payment-panel.spec.ts` suite still passes here — it only loses the `showDecimal`/`showEnter` bindings in Step 8, its own logic is untouched until Task 2).

- [ ] **Step 14: Commit**

```bash
git add src/bazaar-app/frontend/src/app/shared/components/numpad \
        src/bazaar-app/frontend/src/app/shared/components/input-group \
        src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.html \
        src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.html \
        src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts \
        docs/components/numpad/component.md \
        docs/components/input-group/component.md \
        docs/components/seller-search/component.md \
        docs/components/settings-form/component.md \
        docs/components/scan-dialog/component.md
git commit -m "feat(bazaar-app): numpad always shows all keys, drop showDecimal/showEnter"
```

---

### Task 2: Payment-Panel — `app-input` for "Betrag erhalten", self-owned string parsing, direct numpad buffer

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.ts`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.html`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.scss`
- Modify: `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.spec.ts`
- Modify: `docs/components/payment-panel/component.md`

**Interfaces:**
- Consumes: `Input`/`InputAddon` from `src/bazaar-app/frontend/src/app/shared/components/input/input.ts` (`value`/`debounceMs`/`addonRight`/`readOnly` inputs, `valueChange`/`keyDown`/`addonClick` outputs — all already exist, unchanged by this plan). `Numpad` from Task 1 (`enterDisabled` input, `keyPressed`/`cleared`/`submitted` outputs).
- Produces: `PaymentPanel` keeps its public surface identical (`totalLabel`/`totalAmount`/`confirmLabel` inputs, `confirmed`/`cancelled` outputs, `PaymentConfirmedEvent` interface) — only its internal `mode`/`receivedAmount` signals and `onNumpadKey`/`onNumpadClear` method bodies change; `receivedAmount` becomes a `computed<number | null>` (was a plain `signal<number | null>`), and a new `receivedText` signal (`string`) becomes the actual source of truth.

- [ ] **Step 1: Write the failing spec for the new payment-panel contract**

Replace `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.spec.ts` in full:

```typescript
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
    expect(fixture.debugElement.query(By.css('p-inputgroup'))).toBeFalsy();

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
```

- [ ] **Step 2: Run the spec to confirm it fails against the current implementation**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/payment-panel.spec.ts'
```

Expected: FAIL — `PaymentPanel` has no `receivedText`/`onAmountTyped`/`onAmountKeyDown`/`onAmountAddonClick` members yet, and `Input`/`InputAddon` aren't wired.

- [ ] **Step 3: Rewrite `payment-panel.ts`**

Replace `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.ts` in full:

```typescript
import { ChangeDetectionStrategy, Component, computed, output, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Input, InputAddon } from '../input/input';
import { Numpad } from '../numpad/numpad';

/** docs/components/payment-panel/component.md §2 — emitted on "Bestätigen"/⏎. */
export interface PaymentConfirmedEvent {
  totalAmount: number;
  receivedAmount: number;
  change: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Shared, reusable payment/change component (docs/components/payment-panel/component.md) —
 * used both for Artikelannahme's "Speichern"-Popup and Verkauf's Bezahlpopup (only
 * `totalLabel`/`totalAmount`/`confirmLabel` differ). This component is DIALOG CONTENT ONLY — it
 * never renders its own `p-dialog`; the caller owns the `p-dialog` wrapper.
 *
 * "Betrag erhalten" is an `app-input` (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md),
 * following `intake-article-entry.ts`'s own established Preis-Feld pattern: `receivedText` is
 * the raw string source of truth, `receivedAmount` is derived from it via
 * `parseGermanDecimal()`, and numpad keys are applied directly onto `receivedText` — no native
 * `KeyboardEvent` is ever dispatched.
 *
 * Only two modes exist here — `keyboard`/`numpad`, no camera — so unlike `input-group` there is
 * no `visibleModes()` list to compute; the single mode-button just toggles between the two and
 * swaps its icon, following `input-group.ts`'s own `iconForMode()` PrimeIcons convention
 * (`pi-text` for "switch to keyboard" — no keyboard icon exists in the installed PrimeIcons
 * version — `pi-th-large` for "switch to numpad").
 */
@Component({
  selector: 'app-payment-panel',
  imports: [CurrencyPipe, ButtonModule, Input, Numpad],
  templateUrl: './payment-panel.html',
  styleUrl: './payment-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentPanel {
  readonly totalLabel = input.required<string>();
  readonly totalAmount = input.required<number>();
  readonly confirmLabel = input.required<string>();

  readonly confirmed = output<PaymentConfirmedEvent>();
  readonly cancelled = output<void>();

  /** Always starts in keyboard mode (doc §3/AC-4), independent of device. */
  readonly mode = signal<'keyboard' | 'numpad'>('keyboard');

  /** Raw text of the "Betrag erhalten" `app-input` field — source of truth for what's on
   * screen; `receivedAmount()` below is derived from it. */
  readonly receivedText = signal('');
  readonly receivedAmount = computed(() => this.parseGermanDecimal(this.receivedText()));

  /** `receivedAmount − totalAmount`, rounded to 2 decimals (doc §3). Only meaningful once
   * `showChange()` is true; kept computed unconditionally so the template can bind it directly. */
  readonly change = computed(() => round2((this.receivedAmount() ?? 0) - this.totalAmount()));

  /** AC-1/AC-2: Rückgeld box appears only once `receivedAmount >= totalAmount`. */
  readonly showChange = computed(() => {
    const received = this.receivedAmount();
    return received !== null && received >= this.totalAmount();
  });

  /** AC-2/AC-8: `null` counts as below `totalAmount()` — drives both the confirm button and the
   * numpad's `⏎`. */
  readonly belowTotal = computed(() => {
    const received = this.receivedAmount();
    return received === null || received < this.totalAmount();
  });

  readonly modeButtonIcon = computed(() => (this.mode() === 'numpad' ? 'pi pi-text' : 'pi pi-th-large'));

  /** € label + mode-toggle icon, in that order (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md
   * AC "Addon-Layout") — same icon-addon convention `intake-article-entry.ts`'s `priceAddonRight`
   * already uses for its own Nummernblock-toggle. */
  readonly amountAddonRight = computed<InputAddon[]>(() => [
    { type: 'label', value: '€', key: 'currency' },
    { type: 'icon', value: this.modeButtonIcon(), key: 'mode' },
  ]);

  onAmountTyped(value: string): void {
    this.receivedText.set(value);
  }

  /** Tastatur-Tippen: nur Ziffern und ein Komma, max. 2 Nachkommastellen — alles andere wird
   * per `preventDefault()` gar nicht erst ins Feld übernommen (spec AC "Tipp-Validierung"). */
  onAmountKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (this.isControlKey(event.key)) return;
    if (event.key === ',') {
      if (this.receivedText().includes(',')) event.preventDefault();
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      if (this.decimalsFull()) event.preventDefault();
      return;
    }
    event.preventDefault();
  }

  onAmountAddonClick(key: string): void {
    if (key === 'mode') this.toggleMode();
  }

  toggleMode(): void {
    this.mode.set(this.mode() === 'numpad' ? 'keyboard' : 'numpad');
  }

  /** Numpad-Dispatch (spec AC "Numpad-Modus"): the key is applied directly onto `receivedText`,
   * never dispatched as a synthetic `KeyboardEvent` onto a native input. */
  onNumpadKey(init: KeyboardEventInit): void {
    const key = init.key;
    if (key === undefined) return;
    if (key === 'Backspace') {
      this.receivedText.update((text) => text.slice(0, -1));
      return;
    }
    if (key === ',') {
      if (!this.receivedText().includes(',')) this.receivedText.update((text) => text + ',');
      return;
    }
    if (this.decimalsFull()) return;
    this.receivedText.update((text) => text + key);
  }

  onNumpadClear(): void {
    this.receivedText.set('');
  }

  onNumpadSubmit(): void {
    this.confirm();
  }

  confirm(): void {
    if (this.belowTotal()) return;
    this.confirmed.emit({
      totalAmount: this.totalAmount(),
      receivedAmount: this.receivedAmount()!,
      change: this.change(),
    });
  }

  /** AC-6: resets receivedText/mode and emits cancelled. */
  cancel(): void {
    this.receivedText.set('');
    this.mode.set('keyboard');
    this.cancelled.emit();
  }

  private isControlKey(key: string): boolean {
    return ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'].includes(key);
  }

  private decimalsFull(): boolean {
    const text = this.receivedText();
    const commaIndex = text.indexOf(',');
    return commaIndex !== -1 && text.length - commaIndex - 1 >= 2;
  }

  /** Same parsing as `intake-article-entry.ts`'s identically named private method and
   * `input-group.ts`'s own copy — kept as its own copy here rather than extracted to a shared
   * util, matching the existing convention in this codebase for this small a helper. */
  private parseGermanDecimal(raw: string): number | null {
    const normalized = raw.replace(',', '.').trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) && normalized.length > 0 ? parsed : null;
  }
}
```

- [ ] **Step 4: Rewrite `payment-panel.html`**

Replace `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.html` in full:

```html
<div class="payment-panel">
  <div class="payment-panel__total">
    <span>{{ totalLabel() }}</span>
    <span>{{ totalAmount() | currency: 'EUR' }}</span>
  </div>
  <div class="payment-panel__divider"></div>

  <div class="payment-panel__received">
    <label for="payment-panel-amount">Betrag erhalten</label>
    <app-input
      inputId="payment-panel-amount"
      [value]="receivedText()"
      [debounceMs]="0"
      [addonRight]="amountAddonRight()"
      [readOnly]="mode() === 'numpad'"
      (valueChange)="onAmountTyped($event)"
      (keyDown)="onAmountKeyDown($event)"
      (addonClick)="onAmountAddonClick($event)"
    />
  </div>

  @if (mode() === 'numpad') {
    <app-numpad
      [enterDisabled]="belowTotal()"
      (keyPressed)="onNumpadKey($event)"
      (cleared)="onNumpadClear()"
      (submitted)="onNumpadSubmit()"
    />
  }

  @if (showChange()) {
    <div class="payment-panel__change">
      <div class="payment-panel__change-amount">{{ change() | currency: 'EUR' }}</div>
      <div class="payment-panel__change-label">Rückgeld</div>
    </div>
  }

  <div class="payment-panel__footer">
    <p-button label="Abbrechen" severity="secondary" (onClick)="cancel()" />
    <p-button [label]="confirmLabel()" severity="primary" [disabled]="belowTotal()" (onClick)="confirm()" />
  </div>
</div>
```

- [ ] **Step 5: Remove the now-dead `p-inputgroup` rule from `payment-panel.scss`**

In `src/bazaar-app/frontend/src/app/shared/components/payment-panel/payment-panel.scss`, the `&__received` block currently has:

```scss
  &__received {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    p-inputgroup {
      width: 100%;
    }
  }
```

Remove the now-pointless `p-inputgroup { width: 100%; }` nested rule (there is no `p-inputgroup` in this template anymore — `app-input`'s own `:host { display: block; }` combined with this flex-column container's default `align-items: stretch` already makes it full width, the same way `intake-article-entry`'s `app-input` fields stretch inside their `display: flex; flex-direction: column` field wrappers):

```scss
  &__received {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
```

- [ ] **Step 6: Run the spec to confirm it passes**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/payment-panel.spec.ts'
```

Expected: PASS.

- [ ] **Step 7: Update `docs/components/payment-panel/component.md`**

- Change the "**Bibliothek:**" line from `PrimeNG-Komposition — p-inputgroup + p-inputnumber + app-numpad` to `PrimeNG-Komposition — app-input + app-numpad`.
- In "3. Verhalten" → "Numpad-Integration", replace the `ViewChild`/`dispatchEvent` code block and the paragraph below it with:

  ```typescript
  onNumpadKey(init: KeyboardEventInit): void {
      const key = init.key;
      if (key === undefined) return;
      if (key === 'Backspace') {
          this.receivedText.update((text) => text.slice(0, -1));
          return;
      }
      // ... comma/digit handling, see payment-panel.ts
  }

  onNumpadClear(): void {
      this.receivedText.set('');
  }
  ```

  followed by: "Der Numpad zeigt hier wie überall alle Tasten (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md). `enterDisabled` ist an dieselbe Bedingung gekoppelt wie der Bestätigen-Button: `receivedAmount < totalAmount`. Ein Tastendruck wird direkt in `receivedText` übernommen — kein `KeyboardEvent`-Dispatch."
- Delete the entire "### Fokus beim Öffnen" section (autofocus is dropped — `app-input` has no `pAutoFocus` equivalent, and no acceptance criterion covers it).
- In "5. PrimeNG-Basis", replace the whole pseudo-code block with:

  ```
  app-input
    [value]="receivedText()"
    [debounceMs]="0"
    [addonRight]="amountAddonRight()"
    [readOnly]="mode === 'numpad'"

  app-numpad
    *ngIf="mode === 'numpad'"
    [enterDisabled]="receivedAmount < totalAmount"
    (keyPressed)="onNumpadKey($event)"
    (cleared)="onNumpadClear()"
    (submitted)="onNumpadSubmit()"

  p-button  label="Abbrechen"  severity="secondary"
  p-button  [label]="confirmLabel"  severity="primary"
            [disabled]="receivedAmount < totalAmount"
  ```
- In "Akzeptanzkriterien", reword AC-5 to drop the "im Numpad-Modus `p-inputnumber` auf `readonly` schalten" clause into "...im Numpad-Modus das Eingabefeld auf `readonly` schalten".

- [ ] **Step 8: Run the full affected test slice and lint**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/payment-panel.spec.ts'
npx ng lint
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/bazaar-app/frontend/src/app/shared/components/payment-panel docs/components/payment-panel/component.md
git commit -m "feat(bazaar-app): rebuild payment-panel's Betrag-Feld on app-input"
```

---

### Task 3: Wire ⏎ at the two previously-unbound numpad sites

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.html:74`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.html:19-21`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.spec.ts`

**Interfaces:**
- Consumes: `Numpad.submitted`/`enterDisabled` (Task 1). `intake-article-entry.ts`'s existing `onSubmitEntry(): void` (line 419, guards on `canSave()` internally already: `if (!this.canSave()) return;`) and `canSave: Signal<boolean>` (line 199). `intake-renumber-lookup-popup.ts`'s existing `onLoad(): void` (line 82) and `loading: WritableSignal<boolean>` (line 37).
- Produces: nothing new — this task only adds template bindings.

- [ ] **Step 1: Write the failing spec assertions for intake-article-entry's price-field ⏎**

In `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.spec.ts`, inside the same `describe` block that already contains `'numpad digits/comma/backspace/clear apply directly onto priceText'` (around line 734), add:

```typescript
    it('⏎ on the price numpad triggers onSubmitEntry() when canSave() is true, and is disabled otherwise', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onArticleNumberChange('123');
      component.onNameChange('Pullover');
      component.category.set('Kleidung');
      component.brand.set('H&M');
      component.onPriceChange('19,90');
      component.onPriceAddonClick('numpad');
      fixture.detectChanges();

      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
      expect(component.canSave()).toBe(true);
      expect(numpad.enterDisabled()).toBe(false);

      const submitSpy = vi.spyOn(component, 'onSubmitEntry');
      numpad.submitted.emit();
      expect(submitSpy).toHaveBeenCalled();
    });

    it('⏎ on the price numpad is disabled while canSave() is false', async () => {
      const { fixture } = await setup();
      const component = fixture.componentInstance;
      component.onPriceAddonClick('numpad');
      fixture.detectChanges();

      const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
      expect(component.canSave()).toBe(false);
      expect(numpad.enterDisabled()).toBe(true);
    });
```

- [ ] **Step 2: Run the spec to confirm it fails**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/intake-article-entry.spec.ts'
```

Expected: FAIL — `<app-numpad>` at the price field has no `submitted`/`enterDisabled` bindings, so `onSubmitEntry` is never called and `enterDisabled()` is `false` by default.

- [ ] **Step 3: Wire `submitted`/`enterDisabled` on the price-field numpad**

In `src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry/intake-article-entry.html:74`, change:

```html
          <app-numpad (keyPressed)="onPriceNumpadKey($event)" (cleared)="onPriceNumpadClear()" />
```

to:

```html
          <app-numpad
            [enterDisabled]="!canSave()"
            (keyPressed)="onPriceNumpadKey($event)"
            (cleared)="onPriceNumpadClear()"
            (submitted)="onSubmitEntry()"
          />
```

- [ ] **Step 4: Run the spec to confirm it passes**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/intake-article-entry.spec.ts'
```

Expected: PASS.

- [ ] **Step 5: Write the failing spec assertions for the renumber-lookup-popup's ⏎**

`intake-renumber-lookup-popup.spec.ts`'s existing `setup()` returns `{ fixture, articlesApi }` (not `component` — read it off `fixture.componentInstance`), and there's no `By`/`Numpad` import yet. Add both imports at the top:

```typescript
import { By } from '@angular/platform-browser';
import { Numpad } from '../../../../shared/components/numpad/numpad';
```

Then add these two tests inside the `describe('IntakeRenumberLookupPopup', ...)` block:

```typescript
  it('⏎ on the numpad triggers onLoad() when loading() is false, and is disabled while loading', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;
    component.onNumberAddonClick('numpad');
    fixture.detectChanges();

    const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
    expect(component.loading()).toBe(false);
    expect(numpad.enterDisabled()).toBe(false);

    const loadSpy = vi.spyOn(component, 'onLoad');
    numpad.submitted.emit();
    expect(loadSpy).toHaveBeenCalled();
  });

  it('⏎ on the numpad is disabled while loading() is true', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;
    component.onNumberAddonClick('numpad');
    component.loading.set(true);
    fixture.detectChanges();

    const numpad = fixture.debugElement.query(By.directive(Numpad)).componentInstance as Numpad;
    expect(numpad.enterDisabled()).toBe(true);
  });
```

- [ ] **Step 6: Run the spec to confirm it fails**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/intake-renumber-lookup-popup.spec.ts'
```

Expected: FAIL.

- [ ] **Step 7: Wire `submitted`/`enterDisabled` on the renumber popup's numpad**

In `src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup/intake-renumber-lookup-popup.html:19-21`, change:

```html
    @if (numpadVisible()) {
      <app-numpad (keyPressed)="onNumpadKey($event)" (cleared)="onNumpadClear()" />
    }
```

to:

```html
    @if (numpadVisible()) {
      <app-numpad
        [enterDisabled]="loading()"
        (keyPressed)="onNumpadKey($event)"
        (cleared)="onNumpadClear()"
        (submitted)="onLoad()"
      />
    }
```

- [ ] **Step 8: Run the spec to confirm it passes**

```bash
cd src/bazaar-app/frontend
npx ng test --include='**/intake-renumber-lookup-popup.spec.ts'
```

Expected: PASS.

- [ ] **Step 9: Lint**

```bash
cd src/bazaar-app/frontend
npx ng lint
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/components/intake-article-entry \
        src/bazaar-app/frontend/src/app/features/intake/components/intake-renumber-lookup-popup
git commit -m "feat(bazaar-app): wire numpad Enter at price field and renumber popup"
```

---

### Task 4: Responsive width for the three Bezahlen-Dialoge

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.html:40`
- Modify: `src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page/checkout-page.scss`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.html:43`
- Modify: `src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list/intake-session-list.scss`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.html:16`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog/release-dialog.scss`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing new — CSS-only change, no other task depends on it.

This task is CSS-only. `@media`-driven layout cannot be observed through `getComputedStyle()` in jsdom (Angular's Vitest-based unit-test runner has no real layout engine — there's no existing precedent for it anywhere in this codebase's specs), so there is no automated test step here; verification is a manual/browser check at the end. Every other task in this plan keeps its normal TDD cycle — only this one is style-only by nature.

- [ ] **Step 1: Add `styleClass="payment-dialog"` to the three `p-dialog`s**

`checkout-page.html:40` — change:
```html
<p-dialog [(visible)]="paymentPanelVisible" [modal]="true" header="Bezahlen">
```
to:
```html
<p-dialog styleClass="payment-dialog" [(visible)]="paymentPanelVisible" [modal]="true" header="Bezahlen">
```

`intake-session-list.html:43` — same edit.

`release-dialog.html:16` — same edit.

- [ ] **Step 2: Add the responsive width block to each host's own `.scss`**

Append to `checkout-page.scss`, `intake-session-list.scss`, and `release-dialog.scss` (identical block in all three, same convention as `scan-dialog.scss`'s existing `::ng-deep .scan-dialog { ... }` rule for styling a PrimeNG dialog from its host component; breakpoints copied verbatim from `kpi-grid.scss`):

```scss

// Responsive Bezahlen-Dialog-Breite (docs/spec/2026-09-22-bezahlen-dialog-betrag-numpad.md):
// `p-dialog`'s rendered root is outside this component's emulated-encapsulation scope, hence
// `::ng-deep` — same convention as `scan-dialog.scss`. Breakpoints match `kpi-grid.scss`.
::ng-deep .payment-dialog {
  width: 25%;
}

@media (max-width: 1023px) {
  ::ng-deep .payment-dialog {
    width: 50%;
  }
}

@media (max-width: 767px) {
  ::ng-deep .payment-dialog {
    width: 95%;
  }
}
```

- [ ] **Step 3: Build and lint**

```bash
cd src/bazaar-app/frontend
npx ng build
npx ng lint
```

Expected: PASS.

- [ ] **Step 4: Manual verification in the browser**

Start the dev server, open each of the three Bezahlen-Dialoge (Checkout → Warenkorb bezahlen; Artikelannahme → Speichern; Verkäufer-Freigabe → Buchen), and resize the viewport across the two breakpoints, confirming the dialog is ~25% wide at ≥1024px, ~50% at 768–1023px, and ~95% at ≤767px.

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page \
        src/bazaar-app/frontend/src/app/features/intake/components/intake-session-list \
        src/bazaar-app/frontend/src/app/features/sellers/components/release-dialog
git commit -m "feat(bazaar-app): responsive width for the three Bezahlen-Dialoge"
```

---

## Final Verification

- [ ] Run the whole suite once, end to end:

```bash
cd src/bazaar-app/frontend
npx ng test
npx ng lint
npx ng build
```

Expected: all PASS.
