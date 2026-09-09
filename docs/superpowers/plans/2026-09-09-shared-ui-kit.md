# Shared-UI-Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the generic PrimeNG-wrapper components that `docs/components/` describes but that don't exist yet in `BAR.App` (Voranmelde-App frontend), so that R06 (Verkäuferverwaltung) and every later admin-CRUD epic can consume them instead of inventing ad-hoc markup.

**Architecture:** Each component is a standalone Angular "Dumb Component" (data in via `input()`, events out via `output()`, no HTTP, no business logic) living under `src/app/shared/<name>/`, following the existing naming convention (`bar-blueprint.ts`, `password-strength-meter.ts`): kebab-case file, PascalCase class without a `Component` suffix, selector `app-<kebab-name>`. Two cross-cutting services (`MessageService`, `ConfirmationService`) are wired once at the app root. Global, non-component styling (design tokens, panel-block/form-grid CSS) lives in `src/styles/`.

**Tech Stack:** Angular 22.1 (standalone, Signals, `ChangeDetectionStrategy.OnPush`), PrimeNG 22.1.0, Vitest via `ng test`.

**Spec:** [`docs/components/table/component.md`](../../components/table/component.md) · [`docs/components/modal/component.md`](../../components/modal/component.md) · [`docs/components/badge/component.md`](../../components/badge/component.md) · [`docs/components/info-area/component.md`](../../components/info-area/component.md) · [`docs/components/toast/component.md`](../../components/toast/component.md) · [`docs/components/confirmdialog/component.md`](../../components/confirmdialog/component.md) · [`docs/components/card/component.md`](../../components/card/component.md) · [`docs/components/overview.md`](../../components/overview.md)

## Global Constraints

- Every new component file: standalone, `changeDetection: ChangeDetectionStrategy.OnPush`, selector `app-<kebab-name>`, class name without `Component` suffix (project convention, see `LoginForm`/`PasswordStrengthMeter`).
- Inputs/outputs use Angular Signals (`input()`, `input.required()`, `output()`), not `@Input()`/`@Output()` decorators or `EventEmitter` directly (project convention in `password-strength-meter.ts`; `login-form.ts` still uses `@Output() EventEmitter` because it predates this — new code follows the Signal form).
- No native HTML form elements — PrimeNG only (CLAUDE.md PrimeNG-Grundregel). No other UI library.
- Test runner is `ng test` (Vitest builder). Import `describe`/`it`/`expect`/`beforeEach`/`afterEach` explicitly from `'vitest'`.
- Voranmelde-App scope only: this plan builds `BAR.App`-local shared components. Rank-Badges and the Haupt-App-specific Form-Rule enhancements (R-4/R-5 amounts-on-receipt) are out of scope — Badge doc AC-5 explicitly excludes rank badges from this app.
- Code (types, class/selector names, CSS classes) is English; explanatory comments, where needed at all, are German, matching the rest of the codebase.

---

### Task 1: Design tokens + Panel-Block/Form-Grid styles

Pure global CSS — no new component, no Vitest coverage (Vitest doesn't execute SCSS). Verified visually in Task 5/6 once components consume the classes, and by grep in Step 3 below.

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/styles.scss`
- Create: `src/advance-registration/frontend/BAR.App/src/styles/_panel-block.scss`
- Create: `src/advance-registration/frontend/BAR.App/src/styles/_form-grid.scss`

**Interfaces:**
- Produces: CSS custom properties `--color-border`, `--color-muted`, `--color-danger` on `:root`; global classes `.panel-block`, `.panel-block__title`, `.form-grid`, `.form-grid .full`, `.form-grid label`, `.form-grid .required-marker`. Later tasks (Modal body content, and the future R06 dialog panels) apply these classes directly in template markup — they are not Angular components.

- [ ] **Step 1: Add the missing design tokens**

Add to `src/advance-registration/frontend/BAR.App/src/styles.scss`, inside the existing `:root { ... }` block, right after `--color-accent: #5980a6;`:

```scss
  --color-border: #dde6ee;
  --color-muted: #6b7785;
  --color-danger: #c0392b;
```

- [ ] **Step 2: Create the Panel-Block partial**

Create `src/advance-registration/frontend/BAR.App/src/styles/_panel-block.scss` (values from `docs/components/card/component.md` §3, Voranmelde-App column):

```scss
.panel-block {
  border-radius: 8px;
  padding: 15px 16px;
  margin-bottom: 12px;
  background: #f5f9f6;
  border: 1px solid #d4e8dc;

  &__title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: #3a7057;
    margin-bottom: 8px;
  }
}
```

- [ ] **Step 3: Create the Form-Grid partial**

Create `src/advance-registration/frontend/BAR.App/src/styles/_form-grid.scss` (values from `docs/components/card/component.md` §4):

```scss
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  .full {
    grid-column: 1 / -1;
  }

  label {
    display: block;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.4px;
    color: var(--color-muted);
    margin-bottom: 4px;
  }

  .required-marker {
    color: var(--color-danger);
  }
}
```

- [ ] **Step 4: Import both partials globally**

In `src/advance-registration/frontend/BAR.App/src/styles.scss`, after the existing `@use '@fontsource/...'` lines, add:

```scss
@use 'styles/panel-block';
@use 'styles/form-grid';
```

- [ ] **Step 5: Verify the build picks up the new partials**

Run: `npm --prefix src/advance-registration/frontend/BAR.App run build`
Expected: build succeeds, no Sass import errors.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/styles.scss src/advance-registration/frontend/BAR.App/src/styles/_panel-block.scss src/advance-registration/frontend/BAR.App/src/styles/_form-grid.scss
git commit -m "feat(bar-app): add panel-block and form-grid design tokens"
```

---

### Task 2: Badge component

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/badge/badge.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/badge/badge.spec.ts`

**Interfaces:**
- Produces: `export type BadgeType = 'success' | 'danger' | 'warn' | 'info' | 'sec' | 'original' | 'neu';` and component `Badge` with `input.required<BadgeType>() type`, `input.required<string>() label`. No rank support (Voranmelde-App has none — Badge doc AC-5).
- Consumed later by: R06's Verkäufer-Table (Typ column, once that plan exists) and Table's `badge` column type (Task 6).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { Badge } from './badge';

describe('Badge', () => {
  it('renders the label text', () => {
    const fixture = TestBed.createComponent(Badge);
    fixture.componentRef.setInput('type', 'success');
    fixture.componentRef.setInput('label', 'Verkauft');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe('Verkauft');
  });

  it.each([
    ['success', '#d5f5e3', '#1a5c38'],
    ['danger', '#fadbd8', '#7b241c'],
    ['warn', '#fef9e7', '#7e5109'],
    ['info', '#d6eaf8', '#1a5276'],
    ['sec', '#eaecee', '#566573'],
    ['original', '#d5f5e3', '#1a5c38'],
    ['neu', '#fdebd0', '#784212']
  ] as const)('applies the %s palette', (type, background, color) => {
    const fixture = TestBed.createComponent(Badge);
    fixture.componentRef.setInput('type', type);
    fixture.componentRef.setInput('label', 'x');
    fixture.detectChanges();

    const span: HTMLElement = fixture.nativeElement.querySelector('.app-badge');
    expect(span.style.background).toContain(background);
    expect(span.style.color).toContain(color);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run badge.spec.ts`
Expected: FAIL — `Cannot find module './badge'`

- [ ] **Step 3: Implement the component**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeType = 'success' | 'danger' | 'warn' | 'info' | 'sec' | 'original' | 'neu';

const PALETTE: Record<BadgeType, { background: string; color: string }> = {
  success: { background: '#d5f5e3', color: '#1a5c38' },
  danger: { background: '#fadbd8', color: '#7b241c' },
  warn: { background: '#fef9e7', color: '#7e5109' },
  info: { background: '#d6eaf8', color: '#1a5276' },
  sec: { background: '#eaecee', color: '#566573' },
  original: { background: '#d5f5e3', color: '#1a5c38' },
  neu: { background: '#fdebd0', color: '#784212' }
};

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="app-badge" [style.background]="palette().background" [style.color]="palette().color">{{ label() }}</span>
  `,
  styles: [
    `
      .app-badge {
        display: inline-block;
        border-radius: 4px;
        padding: 2px 8px;
        font-size: 11px;
        font-weight: 600;
      }
    `
  ]
})
export class Badge {
  readonly type = input.required<BadgeType>();
  readonly label = input.required<string>();

  readonly palette = computed(() => PALETTE[this.type()]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run badge.spec.ts`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/badge/
git commit -m "feat(bar-app): add Badge shared component"
```

---

### Task 3: InfoArea component

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/info-area/info-area.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/info-area/info-area.spec.ts`

**Interfaces:**
- Produces: `export type InfoAreaType = 'success' | 'error' | 'warn' | 'info';` and component `InfoArea` with `input.required<InfoAreaType>() type`, `input.required<string>() message`.
- Consumed later by: R06's Panel-05 error feedback ("Verkäufer konnte nicht gespeichert werden") — that wiring belongs to the R06 plan, not this one.

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { InfoArea } from './info-area';

describe('InfoArea', () => {
  let originalAudioContext: typeof AudioContext | undefined;
  let oscillatorSpy: { type: string; frequency: { value: number; setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    originalAudioContext = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
    oscillatorSpy = {
      type: '',
      frequency: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn()
    };
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => ({
      createOscillator: () => oscillatorSpy,
      destination: {},
      currentTime: 0
    }));
  });

  afterEach(() => {
    (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext = originalAudioContext;
  });

  it('renders the message with the icon for its type', () => {
    const fixture = TestBed.createComponent(InfoArea);
    fixture.componentRef.setInput('type', 'success');
    fixture.componentRef.setInput('message', 'Artikel gebucht');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('✓');
    expect(fixture.nativeElement.textContent).toContain('Artikel gebucht');
  });

  it('plays a sine ping for type success', () => {
    const fixture = TestBed.createComponent(InfoArea);
    fixture.componentRef.setInput('type', 'success');
    fixture.componentRef.setInput('message', 'x');
    fixture.detectChanges();

    expect(oscillatorSpy.type).toBe('sine');
    expect(oscillatorSpy.start).toHaveBeenCalled();
  });

  it.each(['error', 'warn'] as const)('plays a square zonk for type %s', (type) => {
    const fixture = TestBed.createComponent(InfoArea);
    fixture.componentRef.setInput('type', type);
    fixture.componentRef.setInput('message', 'x');
    fixture.detectChanges();

    expect(oscillatorSpy.type).toBe('square');
  });

  it('plays no tone for type info', () => {
    const fixture = TestBed.createComponent(InfoArea);
    fixture.componentRef.setInput('type', 'info');
    fixture.componentRef.setInput('message', 'x');
    fixture.detectChanges();

    expect(oscillatorSpy.start).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run info-area.spec.ts`
Expected: FAIL — `Cannot find module './info-area'`

- [ ] **Step 3: Implement the component**

```typescript
import { ChangeDetectionStrategy, Component, computed, effect, input } from '@angular/core';

export type InfoAreaType = 'success' | 'error' | 'warn' | 'info';

const PALETTE: Record<InfoAreaType, { background: string; color: string }> = {
  success: { background: '#d5f5e3', color: '#1a5c38' },
  error: { background: '#fadbd8', color: '#7b241c' },
  warn: { background: '#fef9e7', color: '#7e5109' },
  info: { background: '#d6eaf8', color: '#1a5276' }
};

const ICONS: Record<InfoAreaType, string> = {
  success: '✓',
  error: '✗',
  warn: '⚠',
  info: 'ℹ'
};

@Component({
  selector: 'app-info-area',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="app-info-area" [style.background]="palette().background" [style.color]="palette().color">
      <span>{{ icon() }}</span>
      <span>{{ message() }}</span>
    </div>
  `,
  styles: [
    `
      .app-info-area {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        padding: 10px 14px;
        border-radius: 6px;
        width: 100%;
        box-sizing: border-box;
      }
    `
  ]
})
export class InfoArea {
  readonly type = input.required<InfoAreaType>();
  readonly message = input.required<string>();

  readonly palette = computed(() => PALETTE[this.type()]);
  readonly icon = computed(() => ICONS[this.type()]);

  constructor() {
    effect(() => this.playTone(this.type()));
  }

  private playTone(type: InfoAreaType): void {
    if (type === 'info') {
      return;
    }

    try {
      const ctor = (window as unknown as { AudioContext?: typeof AudioContext }).AudioContext;
      if (!ctor) {
        return;
      }

      const context = new ctor();
      const oscillator = context.createOscillator();
      oscillator.connect(context.destination);

      if (type === 'success') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, context.currentTime);
        oscillator.frequency.linearRampToValueAtTime(1320, context.currentTime + 0.15);
      } else {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(180, context.currentTime);
        oscillator.frequency.linearRampToValueAtTime(120, context.currentTime + 0.15);
      }

      oscillator.start();
      oscillator.stop(context.currentTime + 0.15);
    } catch {
      // Audio-Wiedergabe ist best-effort - manche Browser blockieren
      // AudioContext ohne vorherige Nutzerinteraktion. Die Anzeige selbst
      // darf davon nicht abhaengen.
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run info-area.spec.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/info-area/
git commit -m "feat(bar-app): add InfoArea shared component"
```

---

### Task 4: Toast & Confirmdialog global wiring

No new shared component — `p-toast`/`MessageService` and `p-confirmdialog`/`ConfirmationService` are used directly per `docs/components/toast/component.md` and `docs/components/confirmdialog/component.md`. This task only wires the two PrimeNG primitives once at the app root so every feature can `inject(MessageService)` / `inject(ConfirmationService)` afterwards.

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.spec.ts`

**Interfaces:**
- Produces: `MessageService` and `ConfirmationService` available app-wide via DI; `<p-toast />` and `<p-confirmdialog />` mounted once in `app.html`. Later features call `inject(MessageService).add({ severity: 'success', summary: '...' })` and `inject(ConfirmationService).confirm({ message: '...', accept: () => ... })` directly — no wrapper needed (both are already "Dumb" cross-cutting services).

- [ ] **Step 1: Write the failing test**

Add to `src/advance-registration/frontend/BAR.App/src/app/app.spec.ts` (inside the existing `describe('App', ...)`, after the existing `providers` array add `MessageService, ConfirmationService`):

```typescript
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
// ... add to the existing providers array in beforeEach:
//   MessageService,
//   ConfirmationService

it('mounts the global toast and confirm dialog', () => {
  const fixture = TestBed.createComponent(App);
  fixture.detectChanges();

  expect(fixture.nativeElement.querySelector('p-toast')).not.toBeNull();
  expect(fixture.nativeElement.querySelector('p-confirmdialog')).not.toBeNull();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run app.spec.ts`
Expected: FAIL — `querySelector('p-toast')` returns `null` (and/or a `NullInjectorError: No provider for MessageService!` before the fix)

- [ ] **Step 3: Register the providers**

In `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`, add the import and the two providers:

```typescript
import { ConfirmationService, MessageService } from 'primeng/api';
```

and inside the `providers: [...]` array, add:

```typescript
    MessageService,
    ConfirmationService
```

- [ ] **Step 4: Mount the components in the app root**

`src/advance-registration/frontend/BAR.App/src/app/app.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
```

`src/advance-registration/frontend/BAR.App/src/app/app.html`:

```html
<p-toast />
<p-confirmdialog />
<router-outlet />
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run app.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/app.config.ts src/advance-registration/frontend/BAR.App/src/app/app.ts src/advance-registration/frontend/BAR.App/src/app/app.html src/advance-registration/frontend/BAR.App/src/app/app.spec.ts
git commit -m "feat(bar-app): wire global Toast and Confirmdialog"
```

---

### Task 5: Modal component

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/modal/modal.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/modal/modal.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/modal/modal.scss`
- Create: `src/advance-registration/frontend/BAR.App/src/styles/_modal.scss`
- Modify: `src/advance-registration/frontend/BAR.App/src/styles.scss`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/modal/modal.spec.ts`

**Interfaces:**
- Produces: `export type ModalSize = 'sm' | 'standard' | 'lg';` and component `Modal` with `input.required<boolean>() visible`, `input.required<string>() header`, `input<ModalSize>('standard') size`, `output<boolean>() visibleChange`. Body content goes through `<ng-content select="[modalBody]" />`, footer buttons through `<ng-content select="[modalFooter]" />` — the component itself renders no buttons, matching the four footer patterns in `docs/components/modal/component.md` §4 being the caller's responsibility.
- Consumed later by: R06's Anlege-/Bearbeiten-Dialog (own plan).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { describe, it, expect } from 'vitest';
import { Modal } from './modal';

describe('Modal', () => {
  it('renders the header text', () => {
    TestBed.overrideComponent(Modal, {
      set: { template: `<app-modal [visible]="true" header="Verkäufer anlegen"></app-modal>` }
    });
    const fixture = TestBed.createComponent(Modal);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Verkäufer anlegen');
  });

  it('projects body and footer content into their slots', () => {
    TestBed.overrideComponent(Modal, {
      set: {
        template: `
          <app-modal [visible]="true" header="x">
            <p modalBody>Formularinhalt</p>
            <button modalFooter type="button">Speichern</button>
          </app-modal>
        `
      }
    });
    const fixture = TestBed.createComponent(Modal);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Formularinhalt');
    expect(fixture.nativeElement.textContent).toContain('Speichern');
  });

  it.each([
    ['sm', '420px'],
    ['standard', '700px'],
    ['lg', '940px']
  ] as const)('computes the max-width for size %s', (size, maxWidth) => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('header', 'x');
    fixture.componentRef.setInput('size', size);
    fixture.detectChanges();

    expect(fixture.componentInstance.style()['max-width']).toBe(maxWidth);
  });

  it('emits visibleChange when the dialog requests to close', () => {
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('header', 'x');
    fixture.detectChanges();

    let emitted: boolean | undefined;
    fixture.componentInstance.visibleChange.subscribe((v) => (emitted = v));
    fixture.componentInstance.onVisibleChange(false);

    expect(emitted).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run modal.spec.ts`
Expected: FAIL — `Cannot find module './modal'`

- [ ] **Step 3: Implement the component**

`modal.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

export type ModalSize = 'sm' | 'standard' | 'lg';

const MAX_WIDTHS: Record<ModalSize, string> = {
  sm: '420px',
  standard: '700px',
  lg: '940px'
};

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  readonly visible = input.required<boolean>();
  readonly header = input.required<string>();
  readonly size = input<ModalSize>('standard');
  readonly visibleChange = output<boolean>();

  readonly style = computed(() => ({
    'max-width': MAX_WIDTHS[this.size()],
    width: this.size() === 'standard' ? '80%' : '100%'
  }));

  onVisibleChange(value: boolean): void {
    this.visibleChange.emit(value);
  }
}
```

`modal.html`:

```html
<p-dialog
  [visible]="visible()"
  (visibleChange)="onVisibleChange($event)"
  [header]="header()"
  [modal]="true"
  [style]="style()"
  [breakpoints]="{ '768px': '100vw' }"
  [draggable]="false"
  [resizable]="false"
>
  <ng-content select="[modalBody]" />
  <ng-template pTemplate="footer">
    <ng-content select="[modalFooter]" />
  </ng-template>
</p-dialog>
```

`modal.scss` (component has no local styles — mask/shadow are global overlay elements, handled in the global partial below):

```scss
:host {
  display: contents;
}
```

Create `src/advance-registration/frontend/BAR.App/src/styles/_modal.scss` (values from `docs/components/modal/component.md` §1/§5 — PrimeNG renders the mask and dialog outside this component's DOM subtree via `appendTo="body"`, so these rules must be global, not scoped):

```scss
.p-dialog-mask {
  background: rgba(0, 0, 0, 0.52);
}

.p-dialog {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  max-height: 90vh;

  .p-dialog-header {
    padding: 17px 20px;
  }

  .p-dialog-content {
    padding: 20px;
    overflow-y: auto;
  }

  .p-dialog-footer {
    padding: 13px 20px;
  }
}

@media (max-width: 768px) {
  .p-dialog {
    border-radius: 0;
  }
}
```

Import it in `src/advance-registration/frontend/BAR.App/src/styles.scss`, next to the other partials added in Task 1:

```scss
@use 'styles/modal';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run modal.spec.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/modal/ src/advance-registration/frontend/BAR.App/src/styles/_modal.scss src/advance-registration/frontend/BAR.App/src/styles.scss
git commit -m "feat(bar-app): add Modal shared component"
```

---

### Task 6: Table component — columns, sorting, actions, empty state, loading, visual style

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.model.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.scss`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.spec.ts`

**Interfaces:**
- Produces (`table.model.ts`): `ColumnConfig` (`field`, `header`, `type: 'text'|'number'|'currency'|'date'|'badge'`, `sortable?`, `filterable?`), `SortMeta` (`{ field: string; order: 'asc'|'desc' }`), `ActionButtonConfig` (`{ actionId: string; icon: string; ariaLabel: string }`), `ActionColumnConfig` (`{ buttons: ActionButtonConfig[] }`), `ActionClickEvent<T>` (`{ actionId: string; row: T }`).
- Produces (`table.ts`): component `Table<T>` with inputs `columns: ColumnConfig[]`, `data: T[]`, `totalRecords: number`, `loading: boolean`, `actionColumn: ActionColumnConfig | null`, `emptyText?: string`; outputs `sortChange: SortMeta[]`, `actionClick: ActionClickEvent<T>`, `rowAdd: void`. `filterChange`/`pageChange` and the column-filter UI are added in Task 7 — this task's `Table` is already usable stand-alone for a non-filtered, non-paginated list (R06's later plan can start against it and Task 7 extends the same file).
- Consumed later by: R06's Verkäufer-Tabelle (own plan).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, it, expect } from 'vitest';
import { Table } from './table';
import { ColumnConfig } from './table.model';

interface Row {
  id: string;
  name: string;
  amount: number;
}

const COLUMNS: ColumnConfig[] = [
  { field: 'name', header: 'Name', type: 'text' },
  { field: 'amount', header: 'Betrag', type: 'currency' }
];

const ROWS: Row[] = [
  { id: '1', name: 'Anna', amount: 12.5 },
  { id: '2', name: 'Ben', amount: 4 }
];

function createTable() {
  const fixture = TestBed.createComponent(Table<Row>);
  fixture.componentRef.setInput('columns', COLUMNS);
  fixture.componentRef.setInput('data', ROWS);
  fixture.componentRef.setInput('totalRecords', ROWS.length);
  fixture.componentRef.setInput('loading', false);
  fixture.componentRef.setInput('actionColumn', null);
  return fixture;
}

describe('Table', () => {
  it('renders one row per data record with the configured columns', () => {
    const fixture = createTable();
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
    expect(rows[0].nativeElement.textContent).toContain('Anna');
  });

  it('shows the generic empty text when there are no records and no override is given', () => {
    const fixture = createTable();
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('totalRecords', 0);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Keine Einträge gefunden.');
  });

  it('shows the overridden empty text when emptyText is set', () => {
    const fixture = createTable();
    fixture.componentRef.setInput('data', []);
    fixture.componentRef.setInput('totalRecords', 0);
    fixture.componentRef.setInput('emptyText', 'Noch keine Verkäufer registriert.');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Noch keine Verkäufer registriert.');
  });

  it('renders 5 skeleton rows while loading', () => {
    const fixture = createTable();
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    const skeletons = fixture.debugElement.queryAll(By.css('tbody tr.table__skeleton-row'));
    expect(skeletons.length).toBe(5);
  });

  it('emits sortChange with ascending order on first header click', () => {
    const fixture = createTable();
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.sortChange.subscribe((v) => (emitted = v));

    const header = fixture.debugElement.query(By.css('th[pSortableColumn="name"]'));
    header.nativeElement.click();
    fixture.detectChanges();

    expect(emitted).toEqual([{ field: 'name', order: 'asc' }]);
  });

  it('renders the action column buttons and emits actionClick', () => {
    const fixture = createTable();
    fixture.componentRef.setInput('actionColumn', {
      buttons: [{ actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' }]
    });
    fixture.detectChanges();
    let emitted: unknown;
    fixture.componentInstance.actionClick.subscribe((v) => (emitted = v));

    const button = fixture.debugElement.query(By.css('button[data-action-id="edit"]'));
    button.nativeElement.click();

    expect(emitted).toEqual({ actionId: 'edit', row: ROWS[0] });
  });

  it('does not render an action column when actionColumn is null', () => {
    const fixture = createTable();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('th.table__action-header'))).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run table.spec.ts`
Expected: FAIL — `Cannot find module './table'`

- [ ] **Step 3: Implement the model types**

`table.model.ts`:

```typescript
export type ColumnType = 'text' | 'number' | 'currency' | 'date' | 'badge';

export interface ColumnConfig {
  field: string;
  header: string;
  type: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
}

export interface SortMeta {
  field: string;
  order: 'asc' | 'desc';
}

export interface ActionButtonConfig {
  actionId: string;
  icon: string;
  ariaLabel: string;
}

export interface ActionColumnConfig {
  buttons: ActionButtonConfig[];
}

export interface ActionClickEvent<T> {
  actionId: string;
  row: T;
}
```

- [ ] **Step 4: Implement the component**

`table.ts`:

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ActionClickEvent, ActionColumnConfig, ColumnConfig, SortMeta } from './table.model';

const DEFAULT_EMPTY_TEXT = 'Keine Einträge gefunden.';
const FILTERED_EMPTY_TEXT = 'Keine Einträge für den gewählten Filter gefunden.';

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, SkeletonModule],
  templateUrl: './table.html',
  styleUrl: './table.scss'
})
export class Table<T> {
  readonly columns = input.required<ColumnConfig[]>();
  readonly data = input.required<T[]>();
  readonly totalRecords = input.required<number>();
  readonly loading = input.required<boolean>();
  readonly actionColumn = input.required<ActionColumnConfig | null>();
  readonly emptyText = input<string>(DEFAULT_EMPTY_TEXT);

  readonly sortChange = output<SortMeta[]>();
  readonly actionClick = output<ActionClickEvent<T>>();
  readonly rowAdd = output<void>();

  readonly skeletonRows = [0, 1, 2, 3, 4];

  // Bewusst kein Input dafuer, ob gerade gefiltert wird - Task 7 fuegt das
  // Filter-State-Signal hinzu und ersetzt diese Konstante durch eine
  // computed() ueber den aktiven Filterstatus.
  readonly filteredEmptyText = FILTERED_EMPTY_TEXT;

  onSort(event: { multisortmeta?: { field: string; order: number }[] }): void {
    const meta = event.multisortmeta ?? [];
    this.sortChange.emit(meta.map((m) => ({ field: m.field, order: m.order === 1 ? 'asc' : 'desc' })));
  }

  onActionClick(actionId: string, row: T): void {
    this.actionClick.emit({ actionId, row });
  }
}
```

`table.html`:

```html
<p-table
  [value]="data()"
  [columns]="columns()"
  [totalRecords]="totalRecords()"
  [loading]="loading()"
  [sortMode]="'multiple'"
  [stripedRows]="true"
  [rowHover]="true"
  (onSort)="onSort($event)"
>
  <ng-template pTemplate="header" let-columns>
    <tr>
      @for (col of columns; track col.field) {
        <th [pSortableColumn]="col.sortable === false ? undefined : col.field">
          {{ col.header }}
          @if (col.sortable !== false) {
            <p-sortIcon [field]="col.field" />
          }
        </th>
      }
      @if (actionColumn()) {
        <th class="table__action-header"></th>
      }
    </tr>
  </ng-template>

  <ng-template pTemplate="body" let-row let-columns="columns">
    <tr>
      @for (col of columns; track col.field) {
        <td [class.table__cell--number]="col.type === 'number' || col.type === 'currency'">
          {{ row[col.field] }}
        </td>
      }
      @if (actionColumn(); as actions) {
        <td class="table__action-cell">
          @for (button of actions.buttons; track button.actionId) {
            <button
              type="button"
              class="p-button p-button-text p-button-rounded"
              [attr.data-action-id]="button.actionId"
              [attr.aria-label]="button.ariaLabel"
              (click)="onActionClick(button.actionId, row)"
            >
              <i [class]="button.icon"></i>
            </button>
          }
        </td>
      }
    </tr>
  </ng-template>

  <ng-template pTemplate="loadingbody">
    @for (i of skeletonRows; track i) {
      <tr class="table__skeleton-row">
        @for (col of columns(); track col.field) {
          <td><p-skeleton /></td>
        }
        @if (actionColumn()) {
          <td><p-skeleton /></td>
        }
      </tr>
    }
  </ng-template>

  <ng-template pTemplate="emptymessage">
    <tr>
      <td [attr.colspan]="columns().length + (actionColumn() ? 1 : 0)" class="table__empty">
        {{ emptyText() }}
      </td>
    </tr>
  </ng-template>
</p-table>
```

`table.scss`:

```scss
:host ::ng-deep {
  .p-datatable-tbody > tr:nth-child(even) {
    background: #fafafa;
  }

  .table__empty {
    text-align: center;
  }

  .table__cell--number {
    text-align: right;
  }

  .table__action-cell {
    display: flex;
    gap: 6px;
    align-items: center;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run table.spec.ts`
Expected: PASS (7 tests)

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/table/
git commit -m "feat(bar-app): add Table shared component (columns, sort, actions, empty/loading state)"
```

---

### Task 7: Table component — column filters and pagination

Extends Task 6's files; no new files.

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.model.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.spec.ts`

**Interfaces:**
- Produces (added to `table.model.ts`): `MatchMode = 'equals' | 'startsWith' | 'contains' | 'endsWith' | 'lt' | 'lte' | 'gt' | 'gte'`; `ColumnConfig` gains `matchModes?: MatchMode[]`; `FilterMeta = { value: unknown; matchMode: MatchMode }`; `FilterState = Record<string, FilterMeta>`; `PageEvent = { page: number; pageSize: number }`.
- Produces (added to `Table<T>`): outputs `filterChange: FilterState`, `pageChange: PageEvent`.
- Default match modes per column `type`, per `docs/components/table/component.md` §6: `text` → `contains`/`startsWith`/`endsWith`/`equals`; `number`/`currency`/`date` → `equals`/`lt`/`lte`/`gt`/`gte`; `badge` → `equals`. `filterOptions`-driven preset lists are **not** implemented in this task — no R06 column needs them (Verkäufer-Tabelle only has a page-level free-text search, not per-column presets); adding them here without a caller would be speculative. Flag it if a later plan needs it.

- [ ] **Step 1: Write the failing test**

Append to `table.spec.ts`:

```typescript
it('emits filterChange with matchMode when a column filter is applied', () => {
  const fixture = createTable();
  fixture.detectChanges();
  let emitted: unknown;
  fixture.componentInstance.filterChange.subscribe((v) => (emitted = v));

  fixture.componentInstance.onFilter({ filters: { name: [{ value: 'Anna', matchMode: 'contains' }] } });

  expect(emitted).toEqual({ name: { value: 'Anna', matchMode: 'contains' } });
});

it('emits pageChange on page navigation', () => {
  const fixture = createTable();
  fixture.detectChanges();
  let emitted: unknown;
  fixture.componentInstance.pageChange.subscribe((v) => (emitted = v));

  fixture.componentInstance.onPage({ first: 25, rows: 25 });

  expect(emitted).toEqual({ page: 2, pageSize: 25 });
});

it('shows the filtered empty text when a filter is active and yields no rows', () => {
  const fixture = createTable();
  fixture.componentRef.setInput('data', []);
  fixture.componentRef.setInput('totalRecords', 0);
  fixture.detectChanges();
  fixture.componentInstance.onFilter({ filters: { name: [{ value: 'zzz', matchMode: 'contains' }] } });
  fixture.detectChanges();

  expect(fixture.nativeElement.textContent).toContain('Keine Einträge für den gewählten Filter gefunden.');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run table.spec.ts`
Expected: FAIL — `fixture.componentInstance.onFilter is not a function`

- [ ] **Step 3: Extend the model types**

In `table.model.ts`, add:

```typescript
export type MatchMode = 'equals' | 'startsWith' | 'contains' | 'endsWith' | 'lt' | 'lte' | 'gt' | 'gte';

export interface FilterMeta {
  value: unknown;
  matchMode: MatchMode;
}

export type FilterState = Record<string, FilterMeta>;

export interface PageEvent {
  page: number;
  pageSize: number;
}
```

and add `matchModes?: MatchMode[];` to the existing `ColumnConfig` interface.

- [ ] **Step 4: Extend the component**

In `table.ts`, add the default-match-mode map, the two new outputs, a `hasActiveFilter` signal, and the two new handlers:

```typescript
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import {
  ActionClickEvent,
  ActionColumnConfig,
  ColumnConfig,
  ColumnType,
  FilterState,
  MatchMode,
  PageEvent,
  SortMeta
} from './table.model';

const DEFAULT_EMPTY_TEXT = 'Keine Einträge gefunden.';
const FILTERED_EMPTY_TEXT = 'Keine Einträge für den gewählten Filter gefunden.';

const DEFAULT_MATCH_MODES: Record<ColumnType, MatchMode[]> = {
  text: ['contains', 'startsWith', 'endsWith', 'equals'],
  number: ['equals', 'lt', 'lte', 'gt', 'gte'],
  currency: ['equals', 'lt', 'lte', 'gt', 'gte'],
  date: ['equals', 'lt', 'lte', 'gt', 'gte'],
  badge: ['equals']
};

@Component({
  selector: 'app-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, SkeletonModule],
  templateUrl: './table.html',
  styleUrl: './table.scss'
})
export class Table<T> {
  readonly columns = input.required<ColumnConfig[]>();
  readonly data = input.required<T[]>();
  readonly totalRecords = input.required<number>();
  readonly loading = input.required<boolean>();
  readonly actionColumn = input.required<ActionColumnConfig | null>();
  readonly emptyText = input<string>(DEFAULT_EMPTY_TEXT);

  readonly sortChange = output<SortMeta[]>();
  readonly filterChange = output<FilterState>();
  readonly pageChange = output<PageEvent>();
  readonly actionClick = output<ActionClickEvent<T>>();
  readonly rowAdd = output<void>();

  readonly skeletonRows = [0, 1, 2, 3, 4];
  readonly hasActiveFilter = signal(false);

  matchModesFor(column: ColumnConfig): MatchMode[] {
    return column.matchModes ?? DEFAULT_MATCH_MODES[column.type];
  }

  currentEmptyText(): string {
    return this.hasActiveFilter() ? FILTERED_EMPTY_TEXT : this.emptyText();
  }

  onSort(event: { multisortmeta?: { field: string; order: number }[] }): void {
    const meta = event.multisortmeta ?? [];
    this.sortChange.emit(meta.map((m) => ({ field: m.field, order: m.order === 1 ? 'asc' : 'desc' })));
  }

  onFilter(event: { filters: Record<string, { value: unknown; matchMode: MatchMode }[] | undefined> }): void {
    const state: FilterState = {};
    let anyActive = false;

    for (const [field, entries] of Object.entries(event.filters)) {
      const entry = entries?.[0];
      if (entry && entry.value !== null && entry.value !== undefined && entry.value !== '') {
        state[field] = { value: entry.value, matchMode: entry.matchMode };
        anyActive = true;
      }
    }

    this.hasActiveFilter.set(anyActive);
    this.filterChange.emit(state);
  }

  onPage(event: { first: number; rows: number }): void {
    this.pageChange.emit({ page: Math.floor(event.first / event.rows) + 1, pageSize: event.rows });
  }

  onActionClick(actionId: string, row: T): void {
    this.actionClick.emit({ actionId, row });
  }
}
```

- [ ] **Step 5: Wire the new PrimeNG bindings and the column filter menu into the template**

Replace the `<p-table ...>` opening tag and the header `<ng-template>` in `table.html`:

```html
<p-table
  [value]="data()"
  [columns]="columns()"
  [totalRecords]="totalRecords()"
  [loading]="loading()"
  [lazy]="true"
  [paginator]="totalRecords() > 25"
  [rows]="25"
  [rowsPerPageOptions]="[10, 25, 50]"
  [sortMode]="'multiple'"
  [stripedRows]="true"
  [rowHover]="true"
  currentPageReportTemplate="Zeige {first} – {last} von {totalRecords} Einträgen"
  (onSort)="onSort($event)"
  (onFilter)="onFilter($event)"
  (onPage)="onPage($event)"
>
  <ng-template pTemplate="header" let-columns>
    <tr>
      @for (col of columns; track col.field) {
        <th [pSortableColumn]="col.sortable === false ? undefined : col.field">
          {{ col.header }}
          @if (col.sortable !== false) {
            <p-sortIcon [field]="col.field" />
          }
          @if (col.filterable !== false) {
            <p-columnFilter [field]="col.field" [matchModeOptions]="matchModeOptionsFor(col)" display="menu" />
          }
        </th>
      }
      @if (actionColumn()) {
        <th class="table__action-header"></th>
      }
    </tr>
  </ng-template>
```

and replace the `emptymessage` template's `{{ emptyText() }}` with `{{ currentEmptyText() }}`.

Add the PrimeNG-shaped label mapping as a method on `Table<T>` (PrimeNG's `p-columnFilter` wants `{ label, value }[]`, our `MatchMode` is a bare string — this converts between them):

```typescript
  private static readonly MATCH_MODE_LABELS: Record<MatchMode, string> = {
    equals: 'gleich',
    startsWith: 'beginnt mit',
    contains: 'enthält',
    endsWith: 'endet mit',
    lt: 'kleiner',
    lte: 'kleiner gleich',
    gt: 'größer',
    gte: 'größer gleich'
  };

  matchModeOptionsFor(column: ColumnConfig): { label: string; value: MatchMode }[] {
    return this.matchModesFor(column).map((mode) => ({ label: Table.MATCH_MODE_LABELS[mode], value: mode }));
  }
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- --run table.spec.ts`
Expected: PASS (10 tests)

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/table/
git commit -m "feat(bar-app): add column filters and pagination to Table"
```

---

## Self-Review Notes

- **Spec coverage:** Table doc §1–§12 → Tasks 6+7 (filter preset-lists / `filterOptions` explicitly deferred, no caller needs them yet — noted in Task 7). Modal doc §1–§5 → Task 5. Badge doc (status variants only, no rank) → Task 2. InfoArea doc → Task 3. Toast/Confirmdialog docs → Task 4 (thin wiring, no wrapper — both already are PrimeNG primitives, per the "Primitive" classification in `docs/components/overview.md`). Card doc §1/§3/§4 (Standard-Card itself is just `p-card` used directly by callers, no wrapper needed) → Task 1 covers Panel-Block + Form-Grid, the two parts that need project-specific CSS. Select/Input/InputNumber/Boolean-Input are intentionally **not** built here — `docs/components/overview.md` lists them as "Primitive" (PrimeNG directives + usage convention, not a new component); a later plan applies them directly in feature templates.
- **Placeholder scan:** none found — every step has runnable code or an explicit, justified scope cut (filter presets, Select/Input/InputNumber/Boolean-Input).
- **Type consistency:** `ColumnConfig`/`SortMeta`/`FilterState`/`PageEvent`/`ActionClickEvent<T>` are defined once in `table.model.ts` (Task 6/7) and referenced by the same names throughout; `ModalSize`/`BadgeType`/`InfoAreaType` likewise defined once per component and not redeclared elsewhere.
- **Scope check:** single, focused subsystem (generic UI primitives for `BAR.App`), no business logic — safe to execute as one plan.
