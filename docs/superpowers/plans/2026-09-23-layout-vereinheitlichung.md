# Layout-Vereinheitlichung Haupt-App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give all ten Haupt-App main pages one shared Page-Header + 75vw layout, move the scan dialog and the seller search onto `app-input`, and rebuild the Verkäufer dialog / wizard step 1 grid plus an infinitely scrolling Verkäufer tile list.

**Architecture:** A new dumb shared layout component `app-page` (`shared/components/page/`) owns the Page-Header format (title + projected `[pageActions]`) and the ">768px ⇒ max 75vw, horizontally centered" rule for header and content; every page wraps its template in it (Verkauf included, so the rule exists exactly once). The mode/addon logic that `checkout-page.ts` already hand-rolls around `app-input` is extracted into a small shared helper (`shared/components/input/field-mode.ts`) that `scan-dialog` and `seller-search` use to replace `app-input-group`. A global `.dialog-responsive` class in `styles.scss` carries the 50/80/100 % dialog widths for the scan dialog and the Verkäufer dialog. The Verkäufer list gets a `loadMore()` store API plus an `IntersectionObserver` sentinel directive instead of `p-paginator`.

**Tech Stack:** Angular 22 (standalone, signals, zoneless), PrimeNG 22.1, Vitest (via Angular CLI builder).

**Spec:** [`docs/spec/2026-09-23-layout-vereinheitlichung.md`](../../spec/2026-09-23-layout-vereinheitlichung.md) — binding wording for texts, widths and acceptance criteria. Read it before every task.

## Global Constraints

- Breakpoint for the page layout: `768px` (≤768 full width, ≥769 max `75vw`), existing value — no new breakpoint (spec Teil 1 Soll-Vorgaben).
- `75vw` = 75 % of the **window** width, not of the area next to the sidebar (spec Teil 1).
- Everything limited by `vw` stands horizontally centered (spec, übergreifende Regel).
- Title format = `docs/components/overview.md` "Page-Header-Format": flex, `space-between`, `margin-bottom: 20px`, title 20px / 800 / `#0f1f30`, actions `display:flex; gap:8px`.
- Page titles are fixed strings equal to the sidebar labels (`core/shell/sidebar/sidebar.ts:71-85`): `Artikelannahme`, `Verkauf`, `Abrechnung`, `Verkäufer`, `Artikel`, `Marken`, `Kategorien`, `Verkäufer-Typen`, `Statistik`, `Einstellungen`.
- The 33/67 split and the cart height cap stay on Verkauf only; Verkauf must look unchanged.
- The page itself never scrolls horizontally.
- Dialog widths (scan dialog + Verkäufer dialog): ≥1024px → 50 %, 768–1023px → 80 %, ≤767px → 100 %; no pixel max; `max-height: 90vh` and the mobile "no rounded corners" rule stay.
- Distance field → list: `24px` (scan dialog: field → list; seller search: hint → list).
- Only PrimeNG components (plus existing `app-*` wrappers). No other UI libraries.
- Code, identifiers, CSS classes English; docs (`docs/**`) German.
- Tests/lint/build are run through the `dev-mcp` skill tools (`test_angular_project`, `lint_angular_project`, `build_angular_project`) scoped to `src/bazaar-app/frontend` — do not call `ng`/`npm` directly (same convention as `docs/superpowers/plans/2026-09-22-verkauf-eingabe-enter-layout.md`).

## Decisions taken in this plan (not in the spec)

1. **Verkauf is migrated onto `app-page` too** (Task 2). Rationale: the 75vw/header CSS then exists once. Visual regression guarded by identical CSS values and the 96px cart calc staying valid (header block height unchanged: 24px title line + 20px margin).
2. **Camera-denied hint is kept** in scan dialog and seller search (ported from `input-group.ts` into `FieldModeState`), because seller-search AC-9 documents it. Verkauf keeps not having it (out of scope).
3. **`seller-search` `searchChanged` emits immediately** instead of 300ms debounced (it has no consumer in the app; `app-input` is used with `debounceMs=0` like on Verkauf).
4. **Verkäufer reload after mutations** (`SellersStore.load()`) re-fetches *all already loaded pages* in one request (`page: 1, pageSize: page × 60`) so the scroll position survives edit/delete. The backend `SellerCardsQuery` has no page-size cap (checked: only `DefaultPageSize = 60`).
5. **KPI grid breaks by its own width** (CSS container queries) instead of by viewport width — the only way tiles never get squeezed inside a 75vw column next to the sidebar. Thresholds: container < 900px → max 3 columns, < 444px → 2 columns (≈140px min tile width + 12px gaps).
6. **Horizontal table scroll** is solved once in `app-table` (`overflow-x: auto` on PrimeNG's table container), not only on Artikel.

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/bazaar-app/frontend/src/app/shared/components/page/page.ts/.html/.scss/.spec.ts` | Create | Page-Header + 75vw content frame, optional `fill` height mode |
| `src/bazaar-app/frontend/src/app/shared/components/input/field-mode.ts` (+ `.spec.ts`) | Create | Field mode state (keyboard/camera/numpad, previous mode, camera-denied), addon list, numpad key reducer |
| `src/bazaar-app/frontend/src/app/shared/components/input/input.html/.scss/.spec.ts` | Modify | Red `*` in label when `required`; `.app-input__addon--active` style |
| `src/bazaar-app/frontend/src/styles.scss` | Modify | Global `.dialog-responsive` widths |
| `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/*` | Modify | `app-input-group` → `app-input` + numpad + camera; responsive width; 24px gap |
| `src/bazaar-app/frontend/src/app/shared/components/seller-search/*` | Modify | `app-input-group` → `app-input`; no 500px cap; 24px gap |
| `src/bazaar-app/frontend/src/app/shared/components/kpi-tile/kpi-grid.scss` | Modify | Container queries instead of viewport media |
| `src/bazaar-app/frontend/src/app/shared/components/table/table.scss` | Modify | Host block + horizontal scroll inside the table |
| `src/bazaar-app/frontend/src/app/features/*/pages/*` (10 pages) | Modify | Wrap in `app-page` |
| `src/bazaar-app/frontend/src/app/features/settings/components/{settings-form,import-panel}/*.scss` | Modify | Center fixed-width panels |
| `src/bazaar-app/frontend/src/app/features/sellers/components/verkaeufer-dialog/*` | Modify | 6-column grid, `app-input`, iftalabels, stars, responsive width |
| `src/bazaar-app/frontend/src/app/features/intake/components/intake-wizard/*` | Modify | Same grid/fields in step 1 |
| `src/bazaar-app/frontend/src/app/features/sellers/sellers-store.ts` (+ spec) | Modify | `loadMore()`, `hasMore`, reload-all-loaded `load()`; drop `setPage` |
| `src/bazaar-app/frontend/src/app/features/sellers/components/load-more-sentinel/load-more-sentinel.ts` (+ spec) | Create | `IntersectionObserver` directive emitting `reached` |
| `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/*` | Modify | `app-page [fill]`, scrolling tile list, no paginator |
| `docs/components/page/component.md` | Create | Doc of `app-page` |
| `docs/components/{overview,app-input,modal,scan-dialog,seller-search,kpi-tile}/…md` | Modify | Doc corrections the spec demands |
| `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/{epic.md,stories/VERK-S01-seller-edit-form-layout.md}` | Modify | Paginator → nachladen; field grid; dialog size |
| `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md` | Modify | Field grid (VERK-S01 points here) |

All frontend paths below are abbreviated as `FE/` = `src/bazaar-app/frontend/src/app/`.

---

### Task 1: Shared `app-page` component

**Files:**
- Create: `FE/shared/components/page/page.ts`
- Create: `FE/shared/components/page/page.html`
- Create: `FE/shared/components/page/page.scss`
- Test: `FE/shared/components/page/page.spec.ts`
- Create: `docs/components/page/component.md`
- Modify: `docs/components/overview.md` (index table + Page-Header-Format section)

**Interfaces:**
- Produces: `Page` (selector `app-page`, import `{ Page } from '<rel>/shared/components/page/page'`), inputs `title: string` (required), `fill: boolean` (default `false`). Slots: `<… pageActions>` (projected into the header's right side, use `<ng-container ngProjectAs="[pageActions]">` around `@if` blocks), default slot = page content. DOM: `.page__header > h1.page__title + .page__actions`, `.page__content`. Host class `page--fill` when `fill()`.

- [ ] **Step 1: Write the failing test**

`FE/shared/components/page/page.spec.ts`:

```typescript
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Page } from './page';

@Component({
  selector: 'app-page-host',
  imports: [Page],
  template: `
    <app-page title="Marken" [fill]="fill()">
      <span pageActions class="test-action">Aktion</span>
      <p class="test-content">Inhalt</p>
    </app-page>
  `,
})
class PageHost {
  readonly fill = signal(false);
}

describe('Page', () => {
  async function create() {
    await TestBed.configureTestingModule({ imports: [PageHost] }).compileComponents();
    const fixture = TestBed.createComponent(PageHost);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renders the title as h1 inside the page header', async () => {
    const el: HTMLElement = (await create()).nativeElement;
    const title = el.querySelector('.page__header h1.page__title');
    expect(title?.textContent?.trim()).toBe('Marken');
  });

  it('projects [pageActions] into the header actions and everything else into the content', async () => {
    const el: HTMLElement = (await create()).nativeElement;
    expect(el.querySelector('.page__actions .test-action')).not.toBeNull();
    expect(el.querySelector('.page__content .test-content')).not.toBeNull();
    expect(el.querySelector('.page__content .test-action')).toBeNull();
  });

  it('toggles the page--fill host class with the fill input', async () => {
    const fixture = await create();
    const host = fixture.nativeElement.querySelector('app-page') as HTMLElement;
    expect(host.classList).not.toContain('page--fill');

    fixture.componentInstance.fill.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(host.classList).toContain('page--fill');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: dev-mcp `test_angular_project` for `src/bazaar-app/frontend`, filter `page.spec.ts`.
Expected: FAIL — `Cannot find module './page'`.

- [ ] **Step 3: Write minimal implementation**

`FE/shared/components/page/page.ts`:

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Einheitlicher Seitenrahmen der Haupt-App (docs/components/page/component.md): Page-Header
 * (Titel links, optionale `[pageActions]` rechts) über dem Seiteninhalt. Ab 769px sind Header
 * und Inhalt auf 75vw begrenzt und horizontal zentriert
 * (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 1).
 */
@Component({
  selector: 'app-page',
  templateUrl: './page.html',
  styleUrl: './page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.page--fill]': 'fill()' },
})
export class Page {
  readonly title = input.required<string>();
  /** Ab 769px genau fensterhoch; der Inhalt bekommt die Resthöhe (Verkäufer-Kachelliste). */
  readonly fill = input<boolean>(false);
}
```

`FE/shared/components/page/page.html`:

```html
<header class="page__header">
  <h1 class="page__title">{{ title() }}</h1>
  <div class="page__actions">
    <ng-content select="[pageActions]" />
  </div>
</header>

<div class="page__content">
  <ng-content />
</div>
```

`FE/shared/components/page/page.scss`:

```scss
:host {
  display: block;
}

// Page-Header-Format (docs/components/overview.md) — Werte 1:1 aus dem bisherigen
// checkout-page.scss übernommen, damit Verkauf unverändert aussieht.
.page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.page__title {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f1f30;
}

.page__actions {
  display: flex;
  gap: 8px;
}

// Breite Kinder (z. B. die Artikel-Tabelle) scrollen in sich selbst statt die Seite zu verbreitern.
.page__content {
  min-width: 0;
}

@media (min-width: 769px) {
  .page__header,
  .page__content {
    box-sizing: border-box;
    width: 100%;
    max-width: 75vw;
    margin-left: auto;
    margin-right: auto;
  }

  // 52px = shell.scss `.content-body`-Padding oben + unten (26px + 26px).
  :host(.page--fill) {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 52px);
  }

  :host(.page--fill) .page__content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: dev-mcp `test_angular_project`, filter `page.spec.ts`.
Expected: PASS (3 tests).

- [ ] **Step 5: Document the component**

Create `docs/components/page/component.md`:

```markdown
# Page (Seitenrahmen)

**Bibliothek:** Angular-Layout-Komponente ohne PrimeNG-Widget (reines Layout)
**Verwendung:** Bazaar Haupt-App — jede Hauptseite (Artikelannahme, Verkauf, Abrechnung,
Verkäufer, Artikel, Marken, Kategorien, Verkäufer-Typen, Statistik, Einstellungen)

## Überblick

`app-page` rahmt eine Hauptseite ein: oben der Page-Header (Titel links, optionale Actions
rechts), darunter der Seiteninhalt. Der Titel ist ein fester Text und entspricht dem Menüeintrag.

## Verhalten

| Fensterbreite | Verhalten |
|---|---|
| ≤ 768 px | Header und Inhalt nutzen die volle Breite |
| ≥ 769 px | Header und Inhalt höchstens 75 % der **Fensterbreite**, horizontal zentriert |

- Header-Format: siehe [Page-Header-Format](../overview.md#page-header-format).
- Breite Inhalte (Tabellen) scrollen in sich waagerecht, die Seite selbst nie.
- `fill`: ab 769 px ist die Seite genau fensterhoch (Fensterhöhe − 52 px Shell-Padding); der
  Inhalt bekommt die Resthöhe als Flex-Spalte. Einsatz: Verkäufer-Kachelliste mit eigenem
  Scrollbereich.

## Parameter

| Parameter | Typ | Default | Bedeutung |
|---|---|---|---|
| `title` | `string` | — (Pflicht) | Seitentitel |
| `fill` | `boolean` | `false` | Seite fensterhoch, Inhalt füllt die Resthöhe |

| Slot | Inhalt |
|---|---|
| `[pageActions]` | Buttons rechts im Header (z. B. „+ Neu" bei Marken/Kategorien/Verkäufer-Typen) |
| Default | Seiteninhalt |

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Titel als Überschrift im Page-Header-Format anzeigen.
2. **AC-2** — WHILE die Fensterbreite größer als 768 px ist, SHALL das System Header und Inhalt auf höchstens 75vw begrenzen und horizontal zentrieren.
3. **AC-3** — WHILE die Fensterbreite höchstens 768 px beträgt, SHALL das System Header und Inhalt in voller Breite anzeigen.
4. **AC-4** — WHERE `[pageActions]`-Inhalt übergeben wird, SHALL das System ihn rechts im Header anzeigen.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #component #page #layout #page-header
```

In `docs/components/overview.md`:
- In the Komponenten-Index table, add as first row after the header separator:

```markdown
| **Page** | Seitenrahmen der Haupt-App: Page-Header (Titel + Actions) und 75vw-Begrenzung ab 769 px | [page/](page/component.md) |
```

- Directly under the heading `### Page-Header-Format`, insert:

```markdown
Umsetzung in der Haupt-App: [Page](page/component.md) (`app-page`) — jede Hauptseite nutzt sie,
kein seiteneigenes Header-CSS.
```

- [ ] **Step 6: Commit**

```bash
git add src/bazaar-app/frontend/src/app/shared/components/page docs/components/page docs/components/overview.md
git commit -m "feat(bazaar-app): shared app-page Seitenrahmen mit Page-Header und 75vw-Begrenzung"
```

---

### Task 2: Verkauf onto `app-page` (regression)

**Files:**
- Modify: `FE/features/checkout/pages/checkout-page/checkout-page.html:1-5` and closing of the main grid
- Modify: `FE/features/checkout/pages/checkout-page/checkout-page.scss:1-35`
- Modify: `FE/features/checkout/pages/checkout-page/checkout-page.ts` (imports)
- Test: `FE/features/checkout/pages/checkout-page/checkout-page.spec.ts:93-103`

**Interfaces:**
- Consumes: `Page` from Task 1.

- [ ] **Step 1: Change the Page-Header test (failing)**

Replace the `describe('Page-Header', …)` block in `checkout-page.spec.ts` with:

```typescript
  describe('Page-Header', () => {
    it('renders the shared app-page header with the title "Verkauf" and no actions', async () => {
      const { fixture } = await setup();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Verkauf');
      expect(el.querySelector('app-page .page__actions')?.children.length).toBe(0);
      expect(el.querySelector('app-page .page__content .checkout-page')).not.toBeNull();
    });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: dev-mcp `test_angular_project`, filter `checkout-page.spec.ts`.
Expected: FAIL on `app-page .page__title` (null).

- [ ] **Step 3: Implement**

`checkout-page.html`: delete lines 1-3 (the `<div class="checkout-page__header">…</div>` block) and wrap the `<div class="checkout-page">…</div>` block (up to, not including, the `<p-dialog styleClass="payment-dialog" …>`) like this:

```html
<app-page title="Verkauf">
  <div class="checkout-page">
    <!-- unchanged content of the two columns -->
  </div>
</app-page>

<p-dialog styleClass="payment-dialog" …>  <!-- unchanged -->
```

`checkout-page.ts`: add `import { Page } from '../../../../shared/components/page/page';` and add `Page` to the `@Component` `imports` array.

`checkout-page.scss`:
- Delete the whole `.checkout-page__header { … }` block and the whole `.checkout-page__title { … }` block.
- In `.checkout-page { @media (min-width: 769px) { … } }` delete the two lines `max-width: 75vw;` and `margin: 0 auto;` (keep `grid-template-columns: 1fr 2fr;`).
- Replace the comment above `max-height: calc(100vh - 96px);` with:

```scss
      // Viewport-Höhe minus Shell-Padding (shell.scss: 26px oben+unten = 52px) minus
      // Page-Header-Block von app-page (shared/components/page/page.scss: Titel-Zeilenhöhe 24px
      // bei 20px/800 mit `margin: 0` + margin-bottom 20px = 44px) — spec.md
      // "Warenkorb-Höhenbegrenzung". 52px + 44px = 96px.
```

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `checkout-page.spec.ts`.
Expected: PASS (all checkout tests).

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/checkout/pages/checkout-page
git commit -m "refactor(bazaar-app): Verkauf nutzt app-page statt eigenem Page-Header"
```

---

### Task 3: Marken, Kategorien, Verkäufer-Typen — title + „+ Neu" in the Page-Header

**Files:**
- Modify: `FE/features/brands/pages/brands-page/brands-page.html`, `brands-page.ts`, test `brands-page.spec.ts`
- Modify: `FE/features/categories/pages/categories-page/categories-page.html`, `categories-page.ts`, test `categories-page.spec.ts`
- Modify: `FE/features/seller-types/pages/seller-types-page/seller-types-page.html`, `seller-types-page.ts`, test `seller-types-page.spec.ts`

**Interfaces:**
- Consumes: `Page` (Task 1); existing `canAdd()`, `onRowAdd()`, `popupVisible` of each page (unchanged).
- `app-table`'s `title`/`canAdd`/`rowAdd` API stays (other callers may use it) — these three pages just stop passing it.

- [ ] **Step 1: Write the failing tests**

Add to `brands-page.spec.ts` inside `describe('BrandsPage', …)`:

```typescript
  describe('page header', () => {
    it('shows "Marken" as page title and "+ Neu" in the header, with no table title', () => {
      isAdminSignal.set(true);
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Marken');
      expect(el.querySelector('.page__actions p-button[label="+ Neu"]')).not.toBeNull();
      expect(el.querySelector('.app-table__toolbar')).toBeNull();
    });

    it('hides "+ Neu" for non-admins', () => {
      isAdminSignal.set(false);
      const { fixture } = createPage();
      expect(fixture.nativeElement.querySelector('.page__actions p-button')).toBeNull();
    });

    it('opens the create popup from the header "+ Neu" button', () => {
      isAdminSignal.set(true);
      const { fixture, component } = createPage();

      (fixture.nativeElement.querySelector('.page__actions p-button button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.popupVisible()).toBe(true);
    });
  });
```

Add the same block to `categories-page.spec.ts` (title `'Kategorien'`) and to `seller-types-page.spec.ts` (title `'Verkäufer-Typen'`). Each spec already has `isAdminSignal` and `createPage()` returning `{ fixture, component }`.

- [ ] **Step 2: Run tests to verify they fail**

Run: dev-mcp `test_angular_project`, filter `brands-page.spec.ts|categories-page.spec.ts|seller-types-page.spec.ts`.
Expected: FAIL on the new `page header` tests.

- [ ] **Step 3: Implement**

`brands-page.html` becomes:

```html
<app-page title="Marken">
  <ng-container ngProjectAs="[pageActions]">
    @if (canAdd()) {
      <p-button label="+ Neu" (onClick)="onRowAdd()" />
    }
  </ng-container>

  <app-table
    [columns]="columns"
    [data]="rows()"
    [loading]="loading()"
    [actionColumn]="actionColumn()"
    [emptyText]="emptyText"
    (sortChange)="onSortChange($event)"
    (actionClick)="onActionClick($event)"
  />
</app-page>

<app-master-data-popup
  [visible]="popupVisible()"
  (visibleChange)="popupVisible.set($event)"
  entityLabel="Marke"
  [mode]="popupMode()"
  [initialValue]="popupInitialValue()"
  (save)="onPopupSave($event)"
  (cancel)="onPopupCancel()"
/>
```

`categories-page.html`: identical structure with `title="Kategorien"` and `entityLabel="Kategorie"` (popup block unchanged).

`seller-types-page.html`: identical structure with `title="Verkäufer-Typen"`; keep its existing `<app-typ-popup …/>` block unchanged below `</app-page>`.

In each of the three `*-page.ts`: add `import { Page } from '../../../../shared/components/page/page';` and `import { ButtonModule } from 'primeng/button';` (skip if already imported) and add `Page` and `ButtonModule` to the `@Component` `imports` array.

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `brands-page.spec.ts|categories-page.spec.ts|seller-types-page.spec.ts`.
Expected: PASS (existing `canAdd()` tests still pass — the signal is unchanged).

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/brands src/bazaar-app/frontend/src/app/features/categories src/bazaar-app/frontend/src/app/features/seller-types
git commit -m "feat(bazaar-app): Stammdaten-Seiten mit Page-Header und + Neu im Header"
```

---

### Task 4: Artikel — Page-Header, table scrolls horizontally inside itself

**Files:**
- Modify: `FE/features/articles/pages/articles-page/articles-page.html`, `articles-page.scss`, `articles-page.ts`
- Modify: `FE/shared/components/table/table.scss`
- Test: `FE/features/articles/pages/articles-page/articles-page.spec.ts`

**Interfaces:**
- Consumes: `Page` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `articles-page.spec.ts` inside `describe('ArticlesPage', …)`:

```typescript
  it('renders "Artikel" as page title around filters and table', async () => {
    const { fixture } = await createPage();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Artikel');
    expect(el.querySelector('app-page .page__content app-table')).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: dev-mcp `test_angular_project`, filter `articles-page.spec.ts`.
Expected: FAIL (title null).

- [ ] **Step 3: Implement**

`articles-page.html`: wrap the `<div class="articles-page">…</div>` block (not the two popups below it) in `<app-page title="Artikel"> … </app-page>`.

`articles-page.ts`: import `Page` from `'../../../../shared/components/page/page'`, add to `imports`.

`articles-page.scss`: delete the line `padding: 1rem;` in `.articles-page` (the shell and `app-page` provide the spacing; the header must be flush with the content).

`FE/shared/components/table/table.scss`: prepend

```scss
// Custom-Element ist sonst `inline`; `min-width: 0` lässt es in Flex-/Grid-Eltern schrumpfen.
:host {
  display: block;
  min-width: 0;
}

// Passen die Spalten nicht in die Breite, scrollt nur die Tabelle waagerecht, nie die Seite
// (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 1). `p-table` rendert seinen Container
// außerhalb dieses Encapsulation-Scopes, daher `::ng-deep` (Konvention wie kpi-tile.scss).
.app-table ::ng-deep .p-datatable-table-container {
  overflow-x: auto;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `articles-page.spec.ts|table.spec.ts`.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/articles/pages src/bazaar-app/frontend/src/app/shared/components/table/table.scss
git commit -m "feat(bazaar-app): Artikel mit Page-Header, Tabelle scrollt waagerecht in sich"
```

---

### Task 5: Statistik — Page-Header, KPI grid breaks by its own width

**Files:**
- Modify: `FE/features/statistics/pages/statistics-page/statistics-page.html`, `statistics-page.ts`
- Modify: `FE/shared/components/kpi-tile/kpi-grid.scss`
- Test: `FE/features/statistics/pages/statistics-page/statistics-page.spec.ts`
- Modify: `docs/components/kpi-tile/component.md` (section "Responsive" + AC-5)

**Interfaces:**
- Consumes: `Page` (Task 1). `app-kpi-grid` API unchanged (`columns: 3|4|5|6`).

- [ ] **Step 1: Write the failing test**

Add to `statistics-page.spec.ts` inside `describe('StatisticsPage', …)`:

```typescript
  it('renders "Statistik" as page title above the KPI sections', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Statistik');
    expect(el.querySelector('app-page .page__content .statistics-page')).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: dev-mcp `test_angular_project`, filter `statistics-page.spec.ts`.
Expected: FAIL.

- [ ] **Step 3: Implement**

`statistics-page.html`: wrap the whole `<div class="statistics-page">…</div>` in `<app-page title="Statistik"> … </app-page>`. `statistics-page.ts`: import `Page`, add to `imports`.

`FE/shared/components/kpi-tile/kpi-grid.scss` — replace the complete file with:

```scss
// Container statt Viewport: die Kacheln brechen nach der tatsächlich verfügbaren Breite um
// (75vw-Fläche neben der Sidebar), damit sie nie gequetscht werden
// (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 1 "Statistik").
:host {
  display: block;
  container-type: inline-size;
}

.kpi-grid {
  display: grid;
  gap: 12px;
}

.kpi-grid--c3 {
  grid-template-columns: repeat(3, 1fr);
}

.kpi-grid--c4 {
  grid-template-columns: repeat(4, 1fr);
}

.kpi-grid--c5 {
  grid-template-columns: repeat(5, 1fr);
}

.kpi-grid--c6 {
  grid-template-columns: repeat(6, 1fr);
}

// ≈140px Mindestbreite je Kachel + 12px Gap: 6 Kacheln brauchen 900px, 3 Kacheln 444px.
// Zielt auf `.kpi-grid` ohne Modifier, damit es nach den `--cN`-Regeln kommt und gewinnt.
@container (max-width: 899px) {
  .kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container (max-width: 443px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

`docs/components/kpi-tile/component.md`:
- Replace the "Responsive" table with:

```markdown
Das Grid bricht nach **seiner eigenen Breite** um (CSS-Container-Query), nicht nach der
Fensterbreite — so bleiben die Kacheln auch in der 75vw-Fläche neben der Sidebar lesbar.

| Grid-Breite | Verhalten |
|---|---|
| ≥ 900 px | Konfigurierte Spaltenanzahl |
| 444–899 px | Max. 3 Spalten |
| < 444 px | 2 Spalten |
```

- Replace AC-5 with:

```markdown
5. **AC-5** — WHEN das Grid schmaler als 900 px ist, THEN SHALL das System höchstens 3 Spalten anzeigen; WHEN es schmaler als 444 px ist, THEN SHALL das System 2 Spalten anzeigen, jeweils unabhängig von der konfigurierten Spaltenanzahl.
```

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `statistics-page.spec.ts|kpi-grid.spec.ts|settlement-page.spec.ts`.
Expected: PASS (kpi-grid spec only checks classes, unaffected).

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/statistics/pages src/bazaar-app/frontend/src/app/shared/components/kpi-tile/kpi-grid.scss docs/components/kpi-tile/component.md
git commit -m "feat(bazaar-app): Statistik mit Page-Header, KPI-Grid bricht nach Containerbreite um"
```

---

### Task 6: Einstellungen — Page-Header, fixed-width panels centered

**Files:**
- Modify: `FE/features/settings/pages/settings-page/settings-page.ts`
- Modify: `FE/features/settings/components/settings-form/settings-form.scss:1-6`
- Modify: `FE/features/settings/components/import-panel/import-panel.scss:1-6`
- Test: `FE/features/settings/pages/settings-page/settings-page.spec.ts`

**Interfaces:**
- Consumes: `Page` (Task 1).

- [ ] **Step 1: Write the failing test**

Add to `settings-page.spec.ts` inside `describe('SettingsPage', …)`:

```typescript
  it('renders "Einstellungen" as page title with all panels inside the page content', () => {
    const fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Einstellungen');
    expect(el.querySelector('app-page .page__content app-settings-form')).not.toBeNull();
    expect(el.querySelector('app-page .page__content app-import-panel')).not.toBeNull();
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: dev-mcp `test_angular_project`, filter `settings-page.spec.ts`.
Expected: FAIL.

- [ ] **Step 3: Implement**

`settings-page.ts`: add `import { Page } from '../../../../shared/components/page/page';`, add `Page` to `imports`, and change the template to:

```typescript
  template: `
    <app-page title="Einstellungen">
      <app-settings-form /><app-import-panel /><app-user-management /><app-dev-tools-panel />
    </app-page>
  `,
```

`settings-form.scss`: in `.settings-form { … }` add after `max-width: 360px;`:

```scss
  // Panel behält seine Breite und steht horizontal zentriert in der 75vw-Fläche
  // (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 1 "Einstellungen").
  margin-left: auto;
  margin-right: auto;
```

`import-panel.scss`: same two lines + comment in `.import-panel { … }` after `max-width: 520px;`.

(`user-management` and `dev-tools-panel` have no fixed width — they fill the 75vw area and are therefore centered already.)

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `settings-page.spec.ts|settings-form.spec.ts|import-panel.spec.ts`.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/settings
git commit -m "feat(bazaar-app): Einstellungen mit Page-Header, Panels zentriert"
```

---

### Task 7: Artikelannahme + Abrechnung — Page-Header in every state

**Files:**
- Modify: `FE/features/intake/pages/intake-page/intake-page.html`, `intake-page.ts`
- Modify: `FE/features/settlement/pages/settlement-page/settlement-page.html`, `settlement-page.ts`
- Test: `FE/features/intake/pages/intake-page/intake-page.spec.ts`, `FE/features/settlement/pages/settlement-page/settlement-page.spec.ts`

**Interfaces:**
- Consumes: `Page` (Task 1). Existing `state()`, `onSellerSelected()` etc. unchanged.

- [ ] **Step 1: Write the failing tests**

Add to `intake-page.spec.ts` inside `describe('IntakePage', …)`:

```typescript
  it('shows "Artikelannahme" as page title in the seller-search state', () => {
    const fixture = create();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Artikelannahme');
    expect(el.querySelector('app-page .page__content app-seller-search')).not.toBeNull();
  });

  it('keeps "Artikelannahme" as page title in the wizard state', () => {
    const fixture = create();
    fixture.componentInstance.onCreateRequested('Anna Meier');
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__content app-intake-wizard')).not.toBeNull();
    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Artikelannahme');
  });
```

(`onCreateRequested()` sets `state` to `'wizard'` synchronously — `intake-page.ts:49-53`.)

Add to `settlement-page.spec.ts` inside `describe('SettlementPage', …)`:

```typescript
  it('shows "Abrechnung" as page title before a seller is selected', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Abrechnung');
    expect(el.querySelector('app-page .page__content app-seller-search')).not.toBeNull();
  });

  it('keeps "Abrechnung" above the seller header after a seller is selected', async () => {
    const { fixture, component } = await setup();
    selectSeller(component);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Abrechnung');
    expect(el.querySelector('app-page .page__content .settlement-page__header')).not.toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: dev-mcp `test_angular_project`, filter `intake-page.spec.ts|settlement-page.spec.ts`.
Expected: FAIL on the new tests.

- [ ] **Step 3: Implement**

`intake-page.html` becomes:

```html
<app-page title="Artikelannahme">
  @if (state() === 'search') {
    <app-seller-search
      [sellers]="sellers()"
      [hint]="hint"
      [showCreateButton]="true"
      (sellerSelected)="onSellerSelected($event)"
      (createRequested)="onCreateRequested($event)"
    />
  } @else {
    <app-intake-wizard
      [sellerId]="resolvedSellerId()"
      [pendingSearchText]="pendingSearchText()"
      (closed)="onWizardClosed()"
    />
  }
</app-page>
```

(The old HTML comment about the 500px card is deleted — the cap is removed in Task 10.)

`settlement-page.html`: wrap the entire existing content (the `@if (state() === 'selection') { … } @else if (settlement(); as s) { … }` chain, including the scan dialog and settlement panel inside it) in `<app-page title="Abrechnung"> … </app-page>`. Nothing inside changes.

Both `intake-page.ts` and `settlement-page.ts`: import `Page` from `'../../../../shared/components/page/page'`, add to `imports`.

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `intake-page.spec.ts|settlement-page.spec.ts`.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/pages src/bazaar-app/frontend/src/app/features/settlement/pages
git commit -m "feat(bazaar-app): Artikelannahme und Abrechnung mit durchgehendem Page-Header"
```

---

### Task 8: `app-input` required star + shared field-mode helper

**Files:**
- Modify: `FE/shared/components/input/input.html` (label), `input.scss`
- Test: `FE/shared/components/input/input.spec.ts`
- Create: `FE/shared/components/input/field-mode.ts`
- Test: `FE/shared/components/input/field-mode.spec.ts`
- Modify: `docs/components/app-input/component.md`

**Interfaces:**
- Produces (used by Tasks 9–12):
  - `app-input` renders `<span class="app-input__required">*</span>` inside its iftalabel `<label>` when `required()` is true. Class `app-input__addon--active` on an `InputAddon.class` highlights that addon.
  - `type FieldMode = 'keyboard' | 'camera' | 'numpad'`
  - `fieldModeAddons(modes: readonly FieldMode[], active: FieldMode): InputAddon[]` — keys in order `camera`?, `numpad`?, `clear`, `enter`.
  - `applyNumpadKey(current: string, init: KeyboardEventInit): string`
  - `class FieldModeState` (construct in a field initializer — needs injection context): `active: Signal<FieldMode>`, `cameraDenied: WritableSignal<boolean>`, `switchTo(mode: FieldMode): void`, `toggle(mode: 'camera' | 'numpad'): void`, `previousMode(): FieldMode`.

- [ ] **Step 1: Write the failing tests**

Add to `input.spec.ts` inside `describe('label switch', …)`:

```typescript
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
```

Create `FE/shared/components/input/field-mode.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FieldModeState, applyNumpadKey, fieldModeAddons } from './field-mode';

describe('fieldModeAddons', () => {
  it('orders camera, numpad, clear, enter and marks the active mode', () => {
    const addons = fieldModeAddons(['keyboard', 'camera', 'numpad'], 'numpad');

    expect(addons.map((a) => a.key)).toEqual(['camera', 'numpad', 'clear', 'enter']);
    expect(addons.find((a) => a.key === 'numpad')?.class).toBe('app-input__addon--active');
    expect(addons.find((a) => a.key === 'camera')?.class).toBeUndefined();
  });

  it('omits the camera addon when camera is not an available mode', () => {
    expect(fieldModeAddons(['keyboard', 'numpad'], 'keyboard').map((a) => a.key)).toEqual([
      'numpad',
      'clear',
      'enter',
    ]);
  });
});

describe('applyNumpadKey', () => {
  it('appends digits, removes the last char on Backspace and ignores anything else', () => {
    expect(applyNumpadKey('10', { key: '4' })).toBe('104');
    expect(applyNumpadKey('104', { key: 'Backspace' })).toBe('10');
    expect(applyNumpadKey('10', { key: 'Enter' })).toBe('10');
    expect(applyNumpadKey('10', {})).toBe('10');
  });
});

describe('FieldModeState', () => {
  function createState(): FieldModeState {
    return TestBed.runInInjectionContext(() => new FieldModeState());
  }

  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', { value: { getUserMedia: vi.fn() }, configurable: true });
  });

  it('starts in keyboard mode', () => {
    expect(createState().active()).toBe('keyboard');
  });

  it('toggles a mode on and back to keyboard', () => {
    const state = createState();
    state.toggle('numpad');
    expect(state.active()).toBe('numpad');
    state.toggle('numpad');
    expect(state.active()).toBe('keyboard');
  });

  it('remembers the mode active before entering camera', () => {
    const state = createState();
    state.switchTo('numpad');
    state.switchTo('camera');
    expect(state.previousMode()).toBe('numpad');
  });

  it('flags camera-denied and falls back to keyboard when no camera API exists', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    const state = createState();

    state.switchTo('camera');
    TestBed.tick();
    await Promise.resolve();

    expect(state.cameraDenied()).toBe(true);
    expect(state.active()).toBe('keyboard');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: dev-mcp `test_angular_project`, filter `input.spec.ts|field-mode.spec.ts`.
Expected: FAIL (`./field-mode` missing, star not rendered).

- [ ] **Step 3: Implement**

`input.html` — replace

```html
      <label [attr.for]="resolvedId()">{{ labelText }}</label>
```

with

```html
      <label [attr.for]="resolvedId()">
        {{ labelText }}
        @if (required()) {
          <span class="app-input__required">*</span>
        }
      </label>
```

`input.scss` — append:

```scss
// Pflichtfeld-Stern (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 3).
.app-input__required {
  color: var(--p-red-500, #ef4444);
}

// Aktiver Modus-Button (Kamera/Nummernblock) — Klasse kommt über `InputAddon.class`
// (field-mode.ts `fieldModeAddons()`); Wert wie checkout-page.scss `--active`.
.app-input__addon--active {
  background: var(--p-primary-100, #dbeafe);
}
```

Create `FE/shared/components/input/field-mode.ts`:

```typescript
import { DestroyRef, effect, inject, signal } from '@angular/core';
import { InputAddon } from './input';

export type FieldMode = 'keyboard' | 'camera' | 'numpad';

const ACTIVE_ADDON_CLASS = 'app-input__addon--active';

/**
 * Addons für ein `app-input` mit Eingabemodi — Reihenfolge und Icons wie das Verkauf-Feld
 * (checkout-page.ts `inputAddons()`): Kamera, Nummernblock, Löschen, Übernehmen.
 */
export function fieldModeAddons(modes: readonly FieldMode[], active: FieldMode): InputAddon[] {
  const addons: InputAddon[] = [];
  if (modes.includes('camera')) {
    addons.push({
      type: 'icon',
      value: 'pi pi-camera',
      key: 'camera',
      class: active === 'camera' ? ACTIVE_ADDON_CLASS : undefined,
    });
  }
  if (modes.includes('numpad')) {
    addons.push({
      type: 'icon',
      value: 'pi pi-th-large',
      key: 'numpad',
      class: active === 'numpad' ? ACTIVE_ADDON_CLASS : undefined,
    });
  }
  addons.push({ type: 'icon', value: 'pi pi-times', key: 'clear' }, { type: 'icon', value: 'pi pi-reply', key: 'enter' });
  return addons;
}

/** Nummernblock-Taste auf den Feldwert anwenden (Muster checkout-page.ts `onNumpadKey`). */
export function applyNumpadKey(current: string, init: KeyboardEventInit): string {
  const key = init.key;
  if (key === 'Backspace') return current.slice(0, -1);
  if (key !== undefined && /^[0-9]$/.test(key)) return current + key;
  return current;
}

/**
 * Modus-Zustand eines `app-input` mit Kamera/Nummernblock (ersetzt die Modus-Logik von
 * `app-input-group` für Scan-Dialog und Verkäufersuche). Muss im Injection-Context entstehen
 * (Feld-Initializer einer Komponente), weil er `effect()` und `DestroyRef` nutzt.
 *
 * Kamera-verweigert-Erkennung 1:1 aus `input-group.ts` `checkCameraAccess()` übernommen — dort
 * sind auch die Grenzen dokumentiert (Permissions API nur in Chromium zuverlässig).
 */
export class FieldModeState {
  private readonly _active = signal<FieldMode>('keyboard');
  readonly active = this._active.asReadonly();
  readonly cameraDenied = signal(false);

  private previous: FieldMode = 'keyboard';
  private permissionStatus: PermissionStatus | undefined;

  constructor() {
    effect(() => {
      if (this._active() === 'camera') {
        this.cameraDenied.set(false);
        void this.checkCameraAccess();
      } else {
        this.teardownPermissionWatch();
      }
    });
    inject(DestroyRef).onDestroy(() => this.teardownPermissionWatch());
  }

  switchTo(mode: FieldMode): void {
    if (mode === 'camera' && this._active() !== 'camera') {
      this.previous = this._active();
    }
    this._active.set(mode);
  }

  toggle(mode: 'camera' | 'numpad'): void {
    this.switchTo(this._active() === mode ? 'keyboard' : mode);
  }

  /** Modus vor dem letzten Wechsel in die Kamera; `'keyboard'`, falls nie in der Kamera. */
  previousMode(): FieldMode {
    return this.previous;
  }

  private async checkCameraAccess(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      this.flagCameraDenied();
      return;
    }

    const permissions = navigator.permissions;
    if (!permissions?.query) return;

    try {
      const status = await permissions.query({ name: 'camera' as unknown as PermissionName });
      if (status.state === 'denied') {
        this.flagCameraDenied();
        return;
      }
      this.permissionStatus = status;
      status.onchange = () => {
        if (status.state === 'denied' && this._active() === 'camera') {
          this.flagCameraDenied();
        }
      };
    } catch {
      // Permissions API vorhanden, 'camera' aber nicht abfragbar — dokumentierte Grenze.
    }
  }

  private flagCameraDenied(): void {
    this.cameraDenied.set(true);
    this._active.set('keyboard');
  }

  private teardownPermissionWatch(): void {
    if (this.permissionStatus) {
      this.permissionStatus.onchange = null;
      this.permissionStatus = undefined;
    }
  }
}
```

`docs/components/app-input/component.md`: replace the bullet

```markdown
- Pflichtfeld-Stern (`*`) und Feldfehler-Text (`docs/components/form` R-1) bleiben Aufgabe des
  Parent-Templates, außerhalb dieser Komponente.
```

with

```markdown
- Pflichtfeld-Stern: Ist `required` gesetzt und ein `label` vorhanden, zeigt die Komponente
  selbst einen roten `*` hinter dem Label-Text im Feldrahmen. Feldfehler-Text
  (`docs/components/form` R-1) bleibt Aufgabe des Parent-Templates.
- Eingabemodi (Kamera/Nummernblock) sind nicht Teil der Komponente; der Parent baut sie über
  `addonRight` + `app-barcode-scanner`/`app-numpad` — Hilfsfunktionen dafür in
  `shared/components/input/field-mode.ts` (Scan-Dialog, Verkäufersuche).
```

and change the `required` parameter row to:

```markdown
| `required` | `boolean` | `false` | HTML-`required`; zeigt zusätzlich einen roten `*` am Label |
```

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `input.spec.ts|field-mode.spec.ts`.
Expected: PASS. (If `TestBed.tick()` does not exist in the installed Angular, use `TestBed.flushEffects()`.)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/shared/components/input docs/components/app-input/component.md
git commit -m "feat(bazaar-app): app-input Pflicht-Stern und gemeinsame Feld-Modus-Hilfen"
```

---

### Task 9: Scan dialog on `app-input`, responsive width, 24px gap

**Files:**
- Modify: `src/bazaar-app/frontend/src/styles.scss` (global dialog width class)
- Modify: `FE/shared/components/scan-dialog/scan-dialog.ts`, `scan-dialog.html`, `scan-dialog.scss`
- Test: `FE/shared/components/scan-dialog/scan-dialog.spec.ts`
- Modify: `docs/components/scan-dialog/component.md`, `docs/components/modal/component.md`

**Interfaces:**
- Consumes: `Input`, `InputAddon` (`../input/input`), `FieldModeState`, `fieldModeAddons`, `applyNumpadKey` (`../input/field-mode`, Task 8), `Numpad` (`../numpad/numpad`: outputs `keyPressed: KeyboardEventInit`, `cleared`, `submitted`).
- Produces: `ScanDialog.articleNumber: WritableSignal<string>`, `ScanDialog.mode: FieldModeState`, `ScanDialog.inputAddons: Signal<InputAddon[]>`, `onTyped(value: string)`, `onAddonClick(key: string)`, `onNumpadKey(init)`, `onNumpadClear()`; existing `onSubmit()`, `onListboxSelect()`, `onScanDetected()`, `onVisibleChange()`, inputs/outputs unchanged. Global CSS class `dialog-responsive` (Task 11 reuses it).

- [ ] **Step 1: Adapt the spec helpers and add failing tests**

In `scan-dialog.spec.ts`:
- Delete `import { InputGroup } from '../input-group/input-group';` and the `inputGroupOf` helper; change the comment above the zxing mock import to say `BarcodeScanner` is a direct dependency of `ScanDialog`.
- Replace `typeInto` with:

```typescript
  function typeInto(fixture: Awaited<ReturnType<typeof create>>, text: string) {
    fixture.componentInstance.onTyped(text);
    fixture.detectChanges();
  }
```

- In `'clears the input field after a success'` replace `expect(inputGroupOf(fixture).rawValue()).toBe('');` with `expect(fixture.componentInstance.articleNumber()).toBe('');`.
- Replace `enterCameraMode` with:

```typescript
    function enterCameraMode(fixture: Awaited<ReturnType<typeof create>>) {
      fixture.componentInstance.onAddonClick('camera');
      fixture.detectChanges();
    }
```

- Add a new block at the end of `describe('ScanDialog', …)`:

```typescript
  describe('field and layout (Layout-Vereinheitlichung Teil 2)', () => {
    it('renders app-input with the label "Artikelnummer" in the frame and no search icon', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-input p-iftalabel label')?.textContent).toContain('Artikelnummer');
      expect(el.querySelector('.pi-search')).toBeNull();
      expect(el.querySelector('app-input-group')).toBeNull();
    });

    it('offers camera, numpad, clear and enter addons like Verkauf', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      expect(fixture.componentInstance.inputAddons().map((a) => a.key)).toEqual(['camera', 'numpad', 'clear', 'enter']);
    });

    it('opens the numpad below the field and submits the typed number from its enter key', async () => {
      const article = { id: 'A1', number: 101, name: 'Jacke', sellerId: 'SEL1', status: 'registered' };
      const http = httpClientMock({ pending: [{ id: 'A1', number: 101, name: 'Jacke', status: 'registered' }], byNumber: { 101: article } });
      const fixture = await create(http);
      const confirmed: string[] = [];
      fixture.componentInstance.sessionArticleIds.subscribe((ids) => confirmed.push(...ids));

      fixture.componentInstance.onAddonClick('numpad');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('app-numpad')).not.toBeNull();

      fixture.componentInstance.onNumpadKey({ key: '1' });
      fixture.componentInstance.onNumpadKey({ key: '0' });
      fixture.componentInstance.onNumpadKey({ key: '1' });
      fixture.componentInstance.onSubmit();

      expect(confirmed).toContain('A1');
    });

    it('clears the field from the clear addon', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      typeInto(fixture, '12');

      fixture.componentInstance.onAddonClick('clear');

      expect(fixture.componentInstance.articleNumber()).toBe('');
    });

    it('uses the responsive dialog width class', async () => {
      const fixture = await create(httpClientMock({ pending: [] }));
      expect(fixture.nativeElement.querySelector('p-dialog[styleClass="scan-dialog dialog-responsive"]')).not.toBeNull();
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: dev-mcp `test_angular_project`, filter `scan-dialog.spec.ts`.
Expected: FAIL (compile error: `onTyped`/`articleNumber`/`onAddonClick` do not exist).

- [ ] **Step 3: Implement**

`src/bazaar-app/frontend/src/styles.scss` — insert directly after the existing `@media (max-width: 768px) { .p-dialog { … } }` block:

```scss
// Gestufte Dialogbreite (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 2/3):
// ≥1024px 50 %, 768–1023px 80 %, ≤767px 100 %. Breakpoints wie der Bezahlen-Dialog.
// Doppelte Klasse schlägt die globale `.p-dialog`-Breite oben; max-height/border-radius bleiben.
.p-dialog.dialog-responsive {
  width: 50%;
}

@media (max-width: 1023px) {
  .p-dialog.dialog-responsive {
    width: 80%;
  }
}

@media (max-width: 767px) {
  .p-dialog.dialog-responsive {
    width: 100%;
  }
}
```

`scan-dialog.html` — replace the whole file with:

```html
<p-dialog
  styleClass="scan-dialog dialog-responsive"
  [header]="title()"
  [visible]="visible()"
  [modal]="true"
  [closable]="true"
  (visibleChange)="onVisibleChange($event)"
  (onShow)="onShown()"
>
  <app-input
    label="Artikelnummer"
    inputId="scan-dialog-number"
    [value]="articleNumber()"
    [debounceMs]="0"
    [addonRight]="inputAddons()"
    (valueChange)="onTyped($event)"
    (enter)="onSubmit()"
    (addonClick)="onAddonClick($event)"
  />

  @if (mode.active() === 'numpad') {
    <app-numpad
      class="scan-dialog__numpad"
      (keyPressed)="onNumpadKey($event)"
      (cleared)="onNumpadClear()"
      (submitted)="onSubmit()"
    />
  }

  @if (mode.cameraDenied()) {
    <p class="scan-dialog__camera-error">Kamerazugriff nicht möglich</p>
  }

  @if (isCameraActive()) {
    <app-barcode-scanner class="scan-dialog__camera" [active]="isCameraActive()" (codeDetected)="onScanDetected($event)" />
    <app-scan-feedback [result]="scanFeedbackResult()" [pauseMs]="pauseMs()" />
  } @else {
    @if (pendingList().length > 0) {
      <p-listbox [options]="pendingList()" styleClass="scan-dialog__list" (onChange)="onListboxSelect($event)">
        <ng-template #item let-a>{{ a.number }} — {{ a.name }}</ng-template>
      </p-listbox>
    } @else if (showUnknownMessage()) {
      <p class="scan-dialog__message">Artikel nicht bekannt</p>
    } @else {
      <p class="scan-dialog__message">{{ allDoneMessage() }}</p>
    }
  }
</p-dialog>
```

`scan-dialog.scss` — replace the whole file with:

```scss
:host {
  display: block;
}

// `p-dialog`/`p-listbox` sind eigene PrimeNG-Komponenten — `styleClass` landet außerhalb dieses
// Encapsulation-Scopes, daher `::ng-deep`. Die Dialogbreite kommt global über
// `.dialog-responsive` (styles.scss).
::ng-deep .scan-dialog__list {
  display: block;
  width: 100%;
  border: none;
  margin-top: 24px;
}

.scan-dialog {
  &__numpad {
    display: block;
    margin-top: 12px;
  }

  &__camera {
    display: block;
    width: 100%;
    margin-top: 24px;
  }

  &__camera-error {
    margin: 10px 0 0;
    font-size: 0.875rem;
    color: var(--p-red-500, #ef4444);
  }

  &__message {
    margin: 24px 0 0;
    color: var(--p-text-muted-color);
  }
}
```

`scan-dialog.ts`:
- Imports: remove `viewChild` from the `@angular/core` import and remove `import { InputGroup } from '../input-group/input-group';`; add

```typescript
import { Input, InputAddon } from '../input/input';
import { FieldModeState, applyNumpadKey, fieldModeAddons } from '../input/field-mode';
import { Numpad } from '../numpad/numpad';
```

- `@Component.imports`: `[DialogModule, ListboxModule, Input, Numpad, BarcodeScanner, ScanFeedback]`.
- In the class doc comment replace "composing `app-input-group` + `app-barcode-scanner` …" with "composing `app-input` (Modi über `field-mode.ts`) + `app-numpad` + `app-barcode-scanner` + `app-scan-feedback` + `p-listbox`".
- Replace `private readonly inputGroupRef = viewChild<InputGroup>('inputGroup');` with:

```typescript
  readonly mode = new FieldModeState();
  readonly articleNumber = signal('');
  readonly inputAddons = computed<InputAddon[]>(() =>
    fieldModeAddons(['keyboard', 'camera', 'numpad'], this.mode.active()),
  );
```

- `isCameraActive`: `computed<boolean>(() => this.mode.active() === 'camera')`.
- `pendingList`: `filterPending(this.basePendingList(), this.articleNumber())` (update its doc comment: reads the field's own `articleNumber` signal, updated on every keystroke because `debounceMs` is 0).
- Replace `onTypedOrNumpad(...)` (method + doc comment) with:

```typescript
  onTyped(value: string): void {
    this.articleNumber.set(value);
  }

  onAddonClick(key: string): void {
    switch (key) {
      case 'camera':
      case 'numpad':
        this.mode.toggle(key);
        return;
      case 'clear':
        this.articleNumber.set('');
        return;
      case 'enter':
        this.onSubmit();
        return;
    }
  }

  onNumpadKey(init: KeyboardEventInit): void {
    this.articleNumber.set(applyNumpadKey(this.articleNumber(), init));
  }

  onNumpadClear(): void {
    this.articleNumber.set('');
  }
```

- `onSubmit()`: `const raw = this.articleNumber();` instead of the `inputGroupRef` read.
- `onVisibleChange()`: replace the `inputGroupRef` lines with

```typescript
    if (!value && this.mode.active() === 'camera') {
      this.mode.switchTo('keyboard');
    }
```

- In `handleArticleFound()` replace both `this.inputGroupRef()?.applyExternalValue('');` with `this.articleNumber.set('');`.
- Update the `onVisibleChange` doc comment: "switch the field mode back to keyboard first" instead of "`input-group`'s internal `activeMode`".

`docs/components/scan-dialog/component.md`:
- Replace the paragraph starting "Das Artikelnummer-Feld des Dialogs ist eine [InputGroup]…" with:

```markdown
Das Artikelnummer-Feld des Dialogs ist ein [Input](../app-input/component.md) (`app-input`) mit
dem Label „Artikelnummer" im Feldrahmen, ohne Lupe. Rechts bündig am Feld sitzen die Buttons
Kamera, Nummernblock, Löschen und Übernehmen — Reihenfolge und Optik wie das Verkauf-Feld.
Kamera und Nummernblock klappen unter dem Feld auf. Zwischen Feld und Artikelliste liegen 24 px.

**Breite:** ≥ 1024 px höchstens 50 %, 768–1023 px höchstens 80 %, ≤ 767 px 100 %, horizontal
zentriert (globale Klasse `dialog-responsive`), max. Höhe 90vh.
```

- In "Verlassen des Kamera-Modus" replace the two sentences with: `Über den Kamera-Button am Feld (erneuter Klick) oder den Nummernblock-Button. Beim Wechsel gibt das System die Kamera frei ([Barcode-Scanner](../barcode-scanner/component.md)).`
- In the PrimeNG-Basis code block replace the line `p-inputgroup       ← Artikelnummer-Feld mit ↩- und Modus-Buttons (siehe input-group)` with `app-input          ← Artikelnummer-Feld (label im Rahmen) mit Kamera/Numpad/Löschen/Übernehmen-Addons`.

`docs/components/modal/component.md`:
- Size table: replace the row `| Standard | 80 % / max 700 px | Seller-Edit, Freigabe, Rückgabe | Artikel-Dialog |` with

```markdown
| Standard | 80 % / max 700 px | — | Artikel-Dialog |
| Gestuft (`dialog-responsive`) | ≥ 1024 px 50 %, 768–1023 px 80 %, ≤ 767 px 100 % — keine Pixel-Obergrenze | Verkäufer anlegen/bearbeiten, Artikel freigeben, Artikel zurückgeben | — |
```

- AC-2: replace with `2. **AC-2** — THE SYSTEM SHALL die Größenvarianten `sm` (max 420 px), Standard (80 % / max 700 px), Gestuft (≥ 1024 px 50 %, 768–1023 px 80 %, ≤ 767 px 100 %) und `lg` (max 940 px) unterstützen.`

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `scan-dialog.spec.ts|release-dialog.spec.ts|settlement-page.spec.ts`.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/styles.scss src/bazaar-app/frontend/src/app/shared/components/scan-dialog docs/components/scan-dialog/component.md docs/components/modal/component.md
git commit -m "feat(bazaar-app): Scan-Dialog mit app-input, gestufter Breite und 24px Abstand"
```

---

### Task 10: Seller search on `app-input`, full width, 24px gap

**Files:**
- Modify: `FE/shared/components/seller-search/seller-search.ts`, `seller-search.html`, `seller-search.scss`
- Test: `FE/shared/components/seller-search/seller-search.spec.ts` (full replacement)
- Modify: `docs/components/seller-search/component.md`, `docs/components/overview.md` (Seller-Search index row)

**Interfaces:**
- Consumes: Task 8 helpers, `Input`, `Numpad`, `BarcodeScanner`.
- Produces: public API unchanged (`sellers`, `hint`, `showCreateButton`, `showScanButton` inputs; `sellerSelected`, `createRequested`, `searchChanged` outputs). New public members used by tests: `searchText: WritableSignal<string>`, `mode: FieldModeState`, `modes: Signal<FieldMode[]>`, `inputAddons`, `onTyped()`, `onAddonClick()`, `onNumpadKey()`, `onNumpadClear()`, `onScanDetected()`, `onSubmit()`, `onKeydown()`, `onListboxChange()`, `filteredSellers`, `blockedSelectionHint`.

- [ ] **Step 1: Replace the spec (failing)**

Replace `seller-search.spec.ts` completely with:

```typescript
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { SellerSearch, SellerSummary } from './seller-search';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
// `BarcodeScanner` (direct dependency of `SellerSearch`) — the ONE shared `@zxing/browser` mock
// (see that file's own comment) so camera-mode tests never touch real device APIs.
import { getDecodeFromVideoDeviceMock } from '../barcode-scanner/testing/zxing-browser.mock';

const decodeFromVideoDeviceMock = getDecodeFromVideoDeviceMock();

function seller(overrides: Partial<SellerSummary> = {}): SellerSummary {
  return {
    id: 'SEL00001',
    firstName: 'Anna',
    lastName: 'Meier',
    zip: '76133',
    city: 'Karlsruhe',
    settledAt: null,
    ...overrides,
  };
}

describe('SellerSearch', () => {
  beforeEach(async () => {
    decodeFromVideoDeviceMock.mockReset();
    decodeFromVideoDeviceMock.mockResolvedValue({ stop: vi.fn() });

    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: vi.fn() },
      configurable: true,
    });

    await TestBed.configureTestingModule({
      imports: [SellerSearch],
    }).compileComponents();
  });

  function create(sellers: SellerSummary[] = [], opts: { showCreateButton?: boolean; showScanButton?: boolean } = {}) {
    const fixture = TestBed.createComponent(SellerSearch);
    fixture.componentRef.setInput('sellers', sellers);
    fixture.componentRef.setInput('hint', 'Test-Hinweis');
    if (opts.showCreateButton !== undefined) fixture.componentRef.setInput('showCreateButton', opts.showCreateButton);
    if (opts.showScanButton !== undefined) fixture.componentRef.setInput('showScanButton', opts.showScanButton);
    fixture.detectChanges();
    return fixture;
  }

  function typeInto(fixture: ReturnType<typeof create>, text: string) {
    fixture.componentInstance.onTyped(text);
    fixture.detectChanges();
  }

  function enterMode(fixture: ReturnType<typeof create>, mode: 'camera' | 'numpad') {
    fixture.componentInstance.onAddonClick(mode);
    fixture.detectChanges();
  }

  function scannerOf(fixture: ReturnType<typeof create>): BarcodeScanner {
    return fixture.debugElement.query(By.directive(BarcodeScanner)).componentInstance as BarcodeScanner;
  }

  // Layout-Vereinheitlichung Teil 4
  it('renders app-input with the label "Verkäufer" in the frame and no search icon', () => {
    const fixture = create([seller()]);
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('app-input p-iftalabel label')?.textContent).toContain('Verkäufer');
    expect(el.querySelector('.pi-search')).toBeNull();
    expect(el.querySelector('app-input-group')).toBeNull();
  });

  it('keeps the hint directly below the field, before the result list', () => {
    const fixture = create([seller()]);
    const card: HTMLElement = fixture.nativeElement;
    const order = Array.from(card.querySelectorAll('app-input, .seller-search__hint, p-listbox')).map((n) => n.tagName.toLowerCase() === 'p' ? 'hint' : n.tagName.toLowerCase());

    expect(order).toEqual(['app-input', 'hint', 'p-listbox']);
  });

  it('offers numpad, clear and enter addons, plus camera only with showScanButton', () => {
    expect(create([seller()]).componentInstance.inputAddons().map((a) => a.key)).toEqual(['numpad', 'clear', 'enter']);
    expect(create([seller()], { showScanButton: true }).componentInstance.inputAddons().map((a) => a.key)).toEqual([
      'camera',
      'numpad',
      'clear',
      'enter',
    ]);
  });

  // AC-1
  it('shows all sellers when the search field is empty', () => {
    const sellers = [seller({ id: 'SEL1' }), seller({ id: 'SEL2', lastName: 'Schmidt' })];
    const fixture = create(sellers);

    expect(fixture.componentInstance.filteredSellers()).toEqual(sellers);
  });

  // AC-2
  it('filters by id/firstName/lastName, case-insensitive substring', () => {
    const sellers = [
      seller({ id: 'SEL00001', firstName: 'Anna', lastName: 'Meier' }),
      seller({ id: 'SEL00002', firstName: 'Max', lastName: 'Mustermann' }),
    ];
    const fixture = create(sellers);

    typeInto(fixture, 'mei');

    expect(fixture.componentInstance.filteredSellers()).toEqual([sellers[0]]);
  });

  // AC-3
  it('emits sellerSelected on Enter when exactly one result matches', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target, seller({ id: 'SEL00002', lastName: 'Other' })]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    typeInto(fixture, 'SEL00001');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual([target]);
  });

  it('treats the enter addon like a keyboard Enter', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    typeInto(fixture, 'SEL00001');
    fixture.componentInstance.onAddonClick('enter');

    expect(emitted).toEqual([target]);
  });

  it('does nothing on Enter when more than one result matches', () => {
    const fixture = create([seller({ id: 'SEL1', lastName: 'Meier' }), seller({ id: 'SEL2', lastName: 'Meierhof' })]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    typeInto(fixture, 'meier');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual([]);
  });

  // AC-4
  it('emits createRequested with the search text on Enter when there are 0 results and showCreateButton is set', () => {
    const fixture = create([], { showCreateButton: true });
    const emitted: string[] = [];
    fixture.componentInstance.createRequested.subscribe((text) => emitted.push(text));

    typeInto(fixture, 'Unbekannt');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual(['Unbekannt']);
  });

  it('does not emit createRequested on Enter with 0 results when showCreateButton is off (Abrechnung)', () => {
    const fixture = create([], { showCreateButton: false });
    const emitted: string[] = [];
    fixture.componentInstance.createRequested.subscribe((text) => emitted.push(text));

    typeInto(fixture, 'Unbekannt');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(emitted).toEqual([]);
    expect(fixture.debugElement.query(By.css('p-button[label="+ Neuen Verkäufer anlegen"]'))).toBeFalsy();
  });

  it('shows the "+ Neuen Verkäufer anlegen" button only when showCreateButton is set and results are empty', () => {
    const createButton = () => fixture.debugElement.query(By.css('p-button[label="+ Neuen Verkäufer anlegen"]'));
    const fixture = create([], { showCreateButton: true });
    fixture.detectChanges();

    expect(createButton()).toBeTruthy();

    fixture.componentRef.setInput('sellers', [seller()]);
    typeInto(fixture, 'anna');

    expect(createButton()).toBeFalsy();
  });

  // AC-5
  it('swaps the RESULT LIST (not the input field) for the video feed in camera mode', () => {
    const fixture = create([seller()], { showScanButton: true });

    expect(fixture.componentInstance.modes()).toEqual(['keyboard', 'camera', 'numpad']);
    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeTruthy();

    enterMode(fixture, 'camera');

    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeFalsy();
    const scanners = fixture.debugElement.queryAll(By.directive(BarcodeScanner));
    expect(scanners.length).toBe(1);
    expect(scanners[0].nativeElement.classList).toContain('seller-search__camera');
    expect(fixture.debugElement.query(By.css('app-input input[pInputText]'))).toBeTruthy();
  });

  it('does not offer the camera mode when showScanButton is false (default)', () => {
    const fixture = create([seller()]);
    expect(fixture.componentInstance.modes()).toEqual(['keyboard', 'numpad']);
  });

  // AC-6 + scan flow
  it('auto-selects on scan when exactly one result matches, and the camera stops', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target], { showScanButton: true });
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('SEL00001');
    fixture.detectChanges();

    expect(emitted).toEqual([target]);
    expect(fixture.componentInstance.mode.active()).toBe('keyboard');
  });

  it('emits searchChanged exactly once per scan', () => {
    const fixture = create([seller({ id: 'SEL00001' })], { showScanButton: true });
    const emitted: string[] = [];
    fixture.componentInstance.searchChanged.subscribe((v) => emitted.push(v));

    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('SEL00001');
    fixture.detectChanges();

    expect(emitted).toEqual(['SEL00001']);
  });

  it('keeps the camera active when a scan matches 0 sellers', () => {
    const fixture = create([seller({ id: 'SEL00001' })], { showScanButton: true });

    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('NOPE');
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('camera');
  });

  it('returns to the previously active mode when a scan matches more than one seller', () => {
    const fixture = create(
      [seller({ id: 'SEL1', lastName: 'Meier' }), seller({ id: 'SEL2', lastName: 'Meierhof' })],
      { showScanButton: true },
    );

    enterMode(fixture, 'numpad');
    enterMode(fixture, 'camera');
    scannerOf(fixture).codeDetected.emit('Meier');
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('numpad');
    expect(fixture.debugElement.query(By.css('p-listbox'))).toBeTruthy();
  });

  // AC-7
  it('stops the camera and returns to the previously active mode on Escape', () => {
    const fixture = create([seller()], { showScanButton: true });

    enterMode(fixture, 'numpad');
    enterMode(fixture, 'camera');
    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('numpad');
  });

  it('clears the field and shows all sellers on Escape in keyboard mode', () => {
    const fixture = create([seller({ id: 'SEL1' }), seller({ id: 'SEL2', lastName: 'Other' })]);
    typeInto(fixture, 'SEL1');

    fixture.componentInstance.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.searchText()).toBe('');
    expect(fixture.componentInstance.filteredSellers().length).toBe(2);
  });

  // AC-8
  it('types via the numpad and treats its submit like a keyboard Enter', () => {
    const target = seller({ id: '42', lastName: 'Zahl' });
    const fixture = create([target, seller({ id: '7', lastName: 'Andere' })]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    enterMode(fixture, 'numpad');
    expect(fixture.nativeElement.querySelector('app-numpad')).not.toBeNull();
    fixture.componentInstance.onNumpadKey({ key: '4' });
    fixture.componentInstance.onNumpadKey({ key: '2' });
    fixture.componentInstance.onSubmit();

    expect(fixture.componentInstance.searchText()).toBe('42');
    expect(emitted).toEqual([target]);
  });

  // AC-9
  it('shows one camera-denied hint and falls back to keyboard when no camera API exists', async () => {
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
    const fixture = create([seller()], { showScanButton: true });

    enterMode(fixture, 'camera');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.componentInstance.mode.active()).toBe('keyboard');
    const occurrences = (fixture.nativeElement.textContent.match(/Kamerazugriff nicht möglich/g) ?? []).length;
    expect(occurrences).toBe(1);
  });

  // Epic_Artikelannahme AC-12 — settled sellers
  it('shows a settled seller with a badge and blocks selection with an inline hint instead of emitting sellerSelected', () => {
    const settled = seller({ id: 'SEL00001', settledAt: '2026-01-01T00:00:00Z' });
    const fixture = create([settled]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('p-tag'))).toBeTruthy();

    fixture.componentInstance.onListboxChange({ value: settled });
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(fixture.componentInstance.blockedSelectionHint()).toContain('Admin');
    expect(fixture.componentInstance.blockedSelectionHint()).toContain('Anna Meier');
  });

  it('still selects a non-settled seller normally when clicked from the list', () => {
    const target = seller({ id: 'SEL00001' });
    const fixture = create([target]);
    const emitted: SellerSummary[] = [];
    fixture.componentInstance.sellerSelected.subscribe((s) => emitted.push(s));

    fixture.componentInstance.onListboxChange({ value: target });

    expect(emitted).toEqual([target]);
    expect(fixture.componentInstance.blockedSelectionHint()).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: dev-mcp `test_angular_project`, filter `seller-search.spec.ts`.
Expected: FAIL (compile errors: `onTyped`, `onAddonClick`, `mode`, `inputAddons` missing; `searchText` is a computed).

- [ ] **Step 3: Implement**

`seller-search.html` — replace the whole file with:

```html
<p-card styleClass="seller-search" (keydown)="onKeydown($event)">
  <!-- Enter wird über das Card-(keydown) behandelt, nicht über app-input (enter) — sonst
       würde ein Enter zweimal ausgewertet. -->
  <app-input
    label="Verkäufer"
    inputId="seller-search-input"
    [value]="searchText()"
    [debounceMs]="0"
    [addonRight]="inputAddons()"
    (valueChange)="onTyped($event)"
    (addonClick)="onAddonClick($event)"
  />

  <p class="seller-search__hint">{{ hint() }}</p>

  @if (mode.cameraDenied()) {
    <p class="seller-search__camera-error">Kamerazugriff nicht möglich</p>
  }

  @if (mode.active() === 'numpad') {
    <app-numpad
      class="seller-search__numpad"
      (keyPressed)="onNumpadKey($event)"
      (cleared)="onNumpadClear()"
      (submitted)="onSubmit()"
    />
  }

  @if (isCameraActive()) {
    <!-- Kamera ersetzt die TREFFERLISTE, nicht das Suchfeld (component.md Abschnitt 6). -->
    <app-barcode-scanner
      class="seller-search__camera"
      [active]="isCameraActive()"
      (codeDetected)="onScanDetected($event)"
    />
  } @else {
    <p-listbox
      [options]="filteredSellers()"
      styleClass="seller-search__list"
      (onChange)="onListboxChange($event)"
    >
      <ng-template #item let-seller>
        <div
          class="seller-search__item"
          [class.seller-search__item--settled]="seller.settledAt !== null"
          [class.seller-search__item--highlighted]="filteredSellers().indexOf(seller) === highlightedIndex()"
        >
          <span class="seller-search__item-name">{{ seller.lastName }}, {{ seller.firstName }}</span>
          <span class="seller-search__item-meta">#{{ seller.id }} · {{ seller.city }}</span>
          @if (seller.settledAt !== null) {
            <p-tag value="Abgerechnet" severity="warn" styleClass="seller-search__item-tag" />
          }
        </div>
      </ng-template>
    </p-listbox>

    @if (blockedSelectionHint(); as blocked) {
      <p class="seller-search__blocked-hint">{{ blocked }}</p>
    }

    @if (showCreateButton() && filteredSellers().length === 0) {
      <p-button
        label="+ Neuen Verkäufer anlegen"
        severity="secondary"
        [outlined]="true"
        styleClass="seller-search__create-button"
        (onClick)="onCreateClick()"
      />
    }
  }
</p-card>
```

`seller-search.scss`:
- Delete the whole block `::ng-deep .seller-search { max-width: 500px; margin: 0 auto; }` (the card fills the 75vw page content; centering comes from `app-page`).
- In `::ng-deep .seller-search__list` change `margin-top: 0.75rem;` to `margin-top: 24px;`.
- In `.seller-search { &__camera { … } }` change `margin-top: 0.75rem;` to `margin-top: 24px;`.
- Add inside `.seller-search { … }`:

```scss
  &__numpad {
    display: block;
    margin-top: 12px;
  }

  &__camera-error {
    margin: 10px 0 0;
    font-size: 0.875rem;
    color: var(--p-red-500, #ef4444);
  }
```

`seller-search.ts` — replace imports and class body (keep `SellerSummary` and `filterSellers()` unchanged):

```typescript
import { ChangeDetectionStrategy, Component, ElementRef, computed, effect, inject, input, output, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ListboxModule } from 'primeng/listbox';
import { TagModule } from 'primeng/tag';
import { Input, InputAddon } from '../input/input';
import { FieldMode, FieldModeState, applyNumpadKey, fieldModeAddons } from '../input/field-mode';
import { BarcodeScanner } from '../barcode-scanner/barcode-scanner';
import { Numpad } from '../numpad/numpad';
```

```typescript
/**
 * Shared cross-app entry point for "find one seller, then continue" flows
 * (docs/components/seller-search/component.md). Suchfeld ist ein `app-input` (Label „Verkäufer"
 * im Rahmen, Buttons bündig wie im Verkauf); Modus-Logik über `field-mode.ts`. Die Kamera
 * ersetzt die Trefferliste, nicht das Feld; der Nummernblock klappt unter dem Hinweis auf.
 */
@Component({
  selector: 'app-seller-search',
  imports: [CardModule, ButtonModule, ListboxModule, TagModule, Input, Numpad, BarcodeScanner],
  templateUrl: './seller-search.html',
  styleUrl: './seller-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerSearch {
  private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);

  readonly sellers = input<SellerSummary[]>([]);
  readonly hint = input<string>('');
  readonly showCreateButton = input<boolean>(false);
  readonly showScanButton = input<boolean>(false);

  readonly sellerSelected = output<SellerSummary>();
  readonly createRequested = output<string>();
  /** Feuert bei jeder Änderung des Feldwerts (Tippen, Nummernblock, Scan, Löschen). */
  readonly searchChanged = output<string>();

  readonly mode = new FieldModeState();

  readonly modes = computed<FieldMode[]>(() =>
    this.showScanButton() ? ['keyboard', 'camera', 'numpad'] : ['keyboard', 'numpad'],
  );

  readonly inputAddons = computed<InputAddon[]>(() => fieldModeAddons(this.modes(), this.mode.active()));

  readonly searchText = signal('');

  readonly filteredSellers = computed<SellerSummary[]>(() => filterSellers(this.sellers(), this.searchText()));

  /** Inline hint shown after a blocked (settled-seller) selection attempt — doc's Epic AC-12 extension. */
  readonly blockedSelectionHint = signal<string | null>(null);

  /** ↓/↑ highlight index into `filteredSellers()` (doc Abschnitt 4 "Navigation in der Trefferliste"). */
  readonly highlightedIndex = signal<number>(-1);

  readonly isCameraActive = computed<boolean>(() => this.mode.active() === 'camera');

  constructor() {
    // Reset the highlight whenever the visible result set changes shape (new search text).
    effect(() => {
      this.filteredSellers();
      this.highlightedIndex.set(-1);
    });
  }

  onTyped(value: string): void {
    this.searchText.set(value);
    this.searchChanged.emit(value);
  }

  onAddonClick(key: string): void {
    switch (key) {
      case 'camera':
      case 'numpad':
        this.mode.toggle(key);
        return;
      case 'clear':
        this.clear();
        return;
      case 'enter':
        this.onSubmit();
        return;
    }
  }

  onNumpadKey(init: KeyboardEventInit): void {
    this.onTyped(applyNumpadKey(this.searchText(), init));
  }

  onNumpadClear(): void {
    this.onTyped('');
  }

  /**
   * Doc Abschnitt 6 "Scan-Ablauf": Wert ins Feld, dann Moduswechsel nach Trefferzahl —
   * 1 Treffer: auswählen + Tastatur; mehrere: zurück zum vorherigen Modus; 0: Kamera bleibt.
   */
  onScanDetected(value: string): void {
    this.onTyped(value);

    const results = this.filteredSellers();
    if (results.length === 1) {
      this.trySelect(results[0]);
      this.mode.switchTo('keyboard');
    } else if (results.length > 1) {
      this.mode.switchTo(this.mode.previousMode());
    }
  }

  onSubmit(): void {
    const results = this.filteredSellers();
    if (results.length === 1) {
      this.trySelect(results[0]);
    } else if (results.length === 0 && this.showCreateButton()) {
      this.createRequested.emit(this.searchText());
    }
    // > 1 result: no action (doc Abschnitt 4).
  }

  onListboxChange(event: { value: SellerSummary }): void {
    this.trySelect(event.value);
  }

  onCreateClick(): void {
    this.createRequested.emit(this.searchText());
  }

  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        this.onSubmit();
        break;
      case 'Escape':
        event.preventDefault();
        this.onEscape();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveHighlight(-1);
        break;
    }
  }

  private moveHighlight(delta: number): void {
    const count = this.filteredSellers().length;
    if (count === 0) return;
    const next = this.highlightedIndex() + delta;
    this.highlightedIndex.set(Math.min(Math.max(next, 0), count - 1));
  }

  private onEscape(): void {
    if (this.mode.active() === 'camera') {
      this.mode.switchTo(this.mode.previousMode());
    } else {
      this.clear();
    }
  }

  private clear(): void {
    this.onTyped('');
    this.blockedSelectionHint.set(null);
    // app-input hat kein öffentliches focus() — gleiches Host-querySelector-Muster wie scan-dialog.ts.
    queueMicrotask(() => this.hostElement.nativeElement.querySelector<HTMLInputElement>('input')?.focus());
  }

  private trySelect(seller: SellerSummary): void {
    if (seller.settledAt !== null) {
      this.blockedSelectionHint.set(
        `${seller.firstName} ${seller.lastName} ist bereits abgerechnet — ein Admin muss die Abrechnung zuerst stornieren.`,
      );
      return;
    }
    this.blockedSelectionHint.set(null);
    this.sellerSelected.emit(seller);
  }
}
```

`docs/components/seller-search/component.md`:
- `**Bibliothek:**` line → `PrimeNG-Komposition — [Input](../app-input/component.md) + `p-card` + `p-listbox` (+ `app-numpad`, `app-barcode-scanner`)`.
- Replace "Das Suchfeld ist eine [InputGroup](../input-group/component.md); Umschaltmechanik, Button-Reihenfolge und Startmodus stehen dort in Abschnitt 3." with: `Das Suchfeld ist ein [Input](../app-input/component.md) mit dem Label „Verkäufer" im Feldrahmen, ohne Lupe. Rechts bündig am Feld: Kamera (nur mit `showScanButton`), Nummernblock, Löschen, Übernehmen — wie das Verkauf-Feld. Startmodus Tastatur; erneuter Klick auf Kamera/Nummernblock schaltet zurück auf Tastatur.`
- In the `showScanButton` parameter row replace "siehe [InputGroup](../input-group/component.md) Abschnitt 3" with "Kamera-Button am Feld".
- Section "7. Layout" replace the first two bullets with:

```markdown
- Äußere Card: volle Breite der Seitenfläche (höchstens 75vw, zentriert über [Page](../page/component.md)), bündig mit dem Seitentitel
- Suchfeld: [Input](../app-input/component.md) (volle Breite, Label „Verkäufer" im Rahmen)
```

  and change the Trefferliste bullet to `- Trefferliste: `p-listbox` ohne Border, 24 px unter dem Hinweistext — kein eigener Card-Rahmen`.
- Section "8. PrimeNG-Basis": `p-card ← Außenrahmen (volle Breite)`; replace the `app-input-group …` lines with

```
app-input           ← Suchfeld, label="Verkäufer", Addons aus field-mode.ts
  [addonRight]="showScanButton ? [Kamera, Numpad, Löschen, Übernehmen] : [Numpad, Löschen, Übernehmen]"
app-numpad          ← nur im Numpad-Modus, unter dem Hinweistext
```

`docs/components/overview.md`: Seller-Search index row description → `Verkäufer-Suchfeld-Panel (app-input in Card mit Trefferliste und optionalem Anlegen-Button)`.

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `seller-search.spec.ts|intake-page.spec.ts|settlement-page.spec.ts`.
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/shared/components/seller-search docs/components/seller-search/component.md docs/components/overview.md
git commit -m "feat(bazaar-app): Verkäufersuche mit app-input, voller Breite und 24px Abstand"
```

---

### Task 11: Verkäufer dialog — responsive width, 6-column grid, labels in frame, stars

**Files:**
- Modify: `FE/features/sellers/components/verkaeufer-dialog/verkaeufer-dialog.html`, `verkaeufer-dialog.scss`, `verkaeufer-dialog.ts` (imports)
- Test: `FE/features/sellers/components/verkaeufer-dialog/verkaeufer-dialog.spec.ts`
- Modify: `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/stories/VERK-S01-seller-edit-form-layout.md`
- Modify: `docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md`

**Interfaces:**
- Consumes: `Input` (`app-input`, `required` star from Task 8), `.dialog-responsive` (Task 9), `IftaLabelModule` (`primeng/iftalabel`). Component signals (`firstName`, `lastName`, …, `sellerTypeId`, `feePerItem`, `salesCommission`, `conditionsEditable()`, `serverErrors()`) unchanged.
- Produces: CSS field classes `verkaeufer-dialog__field--half | --third | --two-thirds | --full` inside `.verkaeufer-dialog__grid` (Task 12 mirrors them with the `intake-wizard__` prefix).

- [ ] **Step 1: Write the failing tests**

Add to `verkaeufer-dialog.spec.ts` inside `describe('VerkaeuferDialog', …)`:

```typescript
  describe('layout (Layout-Vereinheitlichung Teil 3)', () => {
    async function open(mode: 'create' | 'edit', isAdmin = true) {
      const { fixture } = await setup({ isAdmin });
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('mode', mode);
      if (mode === 'edit') fixture.componentRef.setInput('initialValue', EDIT_SELLER);
      fixture.detectChanges();
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    }

    function fieldOf(el: HTMLElement, id: string): Element | null | undefined {
      return el.querySelector(`#${id}`)?.closest('.verkaeufer-dialog__field');
    }

    const SPANS: [string, string][] = [
      ['verkaeufer-dialog-first-name', 'half'],
      ['verkaeufer-dialog-last-name', 'half'],
      ['verkaeufer-dialog-address', 'full'],
      ['verkaeufer-dialog-postal-code', 'third'],
      ['verkaeufer-dialog-city', 'two-thirds'],
      ['verkaeufer-dialog-phone', 'half'],
      ['verkaeufer-dialog-email', 'half'],
      ['verkaeufer-dialog-seller-type', 'third'],
      ['verkaeufer-dialog-fee-per-item', 'third'],
      ['verkaeufer-dialog-sales-commission', 'third'],
    ];

    it.each(['create', 'edit'] as const)('arranges every field in its documented grid span (%s)', async (mode) => {
      const el = await open(mode);
      for (const [id, span] of SPANS) {
        expect(fieldOf(el, id)?.classList, id).toContain(`verkaeufer-dialog__field--${span}`);
      }
    });

    it('keeps the three panel headings', async () => {
      const el = await open('create');
      const headings = Array.from(el.querySelectorAll('.verkaeufer-dialog__panel-title')).map((h) => h.textContent?.trim());
      expect(headings).toEqual(['Personendaten', 'Kontakt', 'Konditionen']);
    });

    it('shows a red star exactly on Vorname, Nachname, E-Mail and Verkäufer-Typ', async () => {
      const el = await open('create');
      const starred = SPANS.map(([id]) => id).filter((id) =>
        fieldOf(el, id)?.querySelector('.app-input__required, .verkaeufer-dialog__required'),
      );
      expect(starred).toEqual([
        'verkaeufer-dialog-first-name',
        'verkaeufer-dialog-last-name',
        'verkaeufer-dialog-email',
        'verkaeufer-dialog-seller-type',
      ]);
    });

    it('puts every label inside the field frame (iftalabel)', async () => {
      const el = await open('create');
      for (const [id] of SPANS) {
        expect(fieldOf(el, id)?.querySelector('p-iftalabel label'), id).not.toBeNull();
      }
    });

    it('uses the responsive dialog width class', async () => {
      const el = await open('create');
      expect(el.querySelector('p-dialog[styleClass="dialog-responsive"]')).not.toBeNull();
    });

    it('still locks fee and commission for a non-admin', async () => {
      const el = await open('edit', false);
      expect((el.querySelector('#verkaeufer-dialog-fee-per-item') as HTMLInputElement).disabled).toBe(true);
      expect((el.querySelector('#verkaeufer-dialog-sales-commission') as HTMLInputElement).disabled).toBe(true);
    });
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: dev-mcp `test_angular_project`, filter `verkaeufer-dialog.spec.ts`.
Expected: FAIL on the new `layout` tests.

- [ ] **Step 3: Implement**

`verkaeufer-dialog.html` — replace everything from `<p-dialog` down to (not including) `<ng-template #footer>` with:

```html
<p-dialog
  styleClass="dialog-responsive"
  [visible]="visible()"
  (visibleChange)="visibleChange.emit($event)"
  [modal]="true"
  [header]="dialogTitle()"
>
  <div class="verkaeufer-dialog">
    <section class="verkaeufer-dialog__panel">
      <h3 class="verkaeufer-dialog__panel-title">Personendaten</h3>
      <div class="verkaeufer-dialog__grid">
        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--half">
          <app-input
            label="Vorname"
            inputId="verkaeufer-dialog-first-name"
            name="firstName"
            [required]="true"
            [debounceMs]="0"
            [value]="firstName()"
            (valueChange)="firstName.set($event)"
          />
          @if (serverErrors()?.firstName) {
            <small class="verkaeufer-dialog__error">{{ serverErrors()?.firstName }}</small>
          }
        </div>

        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--half">
          <app-input
            label="Nachname"
            inputId="verkaeufer-dialog-last-name"
            name="lastName"
            [required]="true"
            [debounceMs]="0"
            [value]="lastName()"
            (valueChange)="lastName.set($event)"
          />
          @if (serverErrors()?.lastName) {
            <small class="verkaeufer-dialog__error">{{ serverErrors()?.lastName }}</small>
          }
        </div>

        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--full">
          <app-input
            label="Anschrift"
            inputId="verkaeufer-dialog-address"
            name="address"
            [debounceMs]="0"
            [value]="address()"
            (valueChange)="address.set($event)"
          />
        </div>

        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--third">
          <app-input
            label="PLZ"
            inputId="verkaeufer-dialog-postal-code"
            name="postalCode"
            [debounceMs]="0"
            [value]="postalCode()"
            (valueChange)="postalCode.set($event)"
          />
        </div>

        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--two-thirds">
          <app-input
            label="Ort"
            inputId="verkaeufer-dialog-city"
            name="city"
            [debounceMs]="0"
            [value]="city()"
            (valueChange)="city.set($event)"
          />
        </div>
      </div>
    </section>

    <section class="verkaeufer-dialog__panel">
      <h3 class="verkaeufer-dialog__panel-title">Kontakt</h3>
      <div class="verkaeufer-dialog__grid">
        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--half">
          <app-input
            label="Telefon"
            inputId="verkaeufer-dialog-phone"
            name="phone"
            type="tel"
            [debounceMs]="0"
            [value]="phone()"
            (valueChange)="phone.set($event)"
          />
        </div>

        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--half">
          <app-input
            label="E-Mail"
            inputId="verkaeufer-dialog-email"
            name="email"
            type="email"
            [required]="true"
            [debounceMs]="0"
            [value]="email()"
            (valueChange)="email.set($event)"
          />
          @if (serverErrors()?.email) {
            <small class="verkaeufer-dialog__error">{{ serverErrors()?.email }}</small>
          }
        </div>
      </div>
    </section>

    <section class="verkaeufer-dialog__panel">
      <h3 class="verkaeufer-dialog__panel-title">Konditionen</h3>
      <div class="verkaeufer-dialog__grid">
        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--third">
          <p-iftalabel>
            <p-select
              inputId="verkaeufer-dialog-seller-type"
              [options]="sellerTypesList()"
              optionLabel="name"
              optionValue="id"
              [ngModel]="sellerTypeId()"
              (ngModelChange)="onTypeChange($event)"
              name="sellerTypeId"
            />
            <label for="verkaeufer-dialog-seller-type">
              Verkäufer-Typ <span class="verkaeufer-dialog__required">*</span>
            </label>
          </p-iftalabel>
          @if (serverErrors()?.sellerTypeId) {
            <small class="verkaeufer-dialog__error">{{ serverErrors()?.sellerTypeId }}</small>
          }
        </div>

        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--third">
          <p-iftalabel>
            <p-inputnumber
              inputId="verkaeufer-dialog-fee-per-item"
              [ngModel]="feePerItem()"
              (ngModelChange)="feePerItem.set($event)"
              name="feePerItem"
              mode="currency"
              currency="EUR"
              locale="de-DE"
              [min]="0"
              [disabled]="!conditionsEditable()"
            />
            <label for="verkaeufer-dialog-fee-per-item">Gebühr/Stück (€)</label>
          </p-iftalabel>
        </div>

        <div class="verkaeufer-dialog__field verkaeufer-dialog__field--third">
          <p-iftalabel>
            <p-inputnumber
              inputId="verkaeufer-dialog-sales-commission"
              [ngModel]="salesCommission()"
              (ngModelChange)="salesCommission.set($event)"
              name="salesCommission"
              mode="decimal"
              locale="de-DE"
              [minFractionDigits]="0"
              [maxFractionDigits]="2"
              suffix=" %"
              [min]="0"
              [max]="100"
              [disabled]="!conditionsEditable()"
            />
            <label for="verkaeufer-dialog-sales-commission">Provision (%)</label>
          </p-iftalabel>
        </div>
      </div>
    </section>

    @if (deleteError()) {
      <p class="verkaeufer-dialog__delete-error">{{ deleteError() }}</p>
    }
  </div>
```

(The `<ng-template #footer>…</ng-template>`, `</p-dialog>` and both `<p-confirmdialog>` lines stay unchanged.)

`verkaeufer-dialog.scss` — replace the `.verkaeufer-dialog { … }` block (keep the two `__footer` blocks below it) with:

```scss
.verkaeufer-dialog {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  &__panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__panel-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--p-text-muted-color);
  }

  // 6er-Raster: 50 % = 3 Spalten, 33 % = 2, 67 % = 4, 100 % = alle
  // (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 3). Bis 767px: jedes Feld 100 %.
  &__grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    grid-column: 1 / -1;

    @media (min-width: 768px) {
      &--half {
        grid-column: span 3;
      }

      &--third {
        grid-column: span 2;
      }

      &--two-thirds {
        grid-column: span 4;
      }
    }
  }

  // `p-iftalabel`/`p-select`/`p-inputnumber` rendern außerhalb dieses Encapsulation-Scopes —
  // volle Zellbreite wie die `app-input`-Felder daneben.
  &__field ::ng-deep p-iftalabel,
  &__field ::ng-deep .p-select,
  &__field ::ng-deep .p-inputnumber {
    display: block;
    width: 100%;
  }

  &__required {
    color: var(--p-red-500, #ef4444);
  }

  &__error {
    color: var(--p-red-500);
  }

  &__delete-error {
    margin: 0;
    color: var(--p-red-500);
    font-size: 0.875rem;
  }
}
```

`verkaeufer-dialog.ts`: add

```typescript
import { IftaLabelModule } from 'primeng/iftalabel';
import { Input } from '../../../../shared/components/input/input';
```

add `IftaLabelModule` and `Input` to the `@Component` `imports`, and remove `InputTextModule` (import line + array entry) — no `pInputText` is left in the template.

`docs/requirements/bazaar-app/epics/Epic_Verkaeufer/stories/VERK-S01-seller-edit-form-layout.md`:
- In the UI box, change the first line to `┌─ Dialog (gestuft: 50 % / 80 % / 100 %) ─────────┐`, the PLZ line to `│ │ [PLZ      33%] [Ort                   67%] │   │` and replace the two Konditionen lines with `│ │ [Typ * 33%] [Gebühr j.St. 33%] [Prov. 33%] │   │  ← vorausgefüllt bei Typ-Wechsel (AC-5)`.
- Replace the paragraph `**Dialog-Größe:** Desktop ≥ 768 px: 80 % Breite / 90 % Höhe. Mobile < 768 px: 100 % / 100 %, kein border-radius.` with:

```markdown
**Dialog-Größe:** ≥ 1024 px höchstens 50 % Breite, 768–1023 px höchstens 80 %, ≤ 767 px 100 %;
horizontal zentriert, max. 90 % Höhe, mobil ohne border-radius (Modal-Variante „Gestuft").
Bis 767 px stehen alle Felder untereinander, jedes 100 % breit. Labels stehen im Feldrahmen
(`app-input` mit `label`, `p-iftalabel` für Auswahl- und Zahlenfelder); Pflichtfelder tragen
einen roten `*`.
```

`docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md`:
- UI box: PLZ line → `│ [PLZ            33%] [Ort           67%] │`; replace the Verkäufer-Typ and Gebühr lines with `│ [Typ * 33%] [Gebühr je St. 33%] [Prov. 33%] │  ← vorausgefüllt bei Typ-Wechsel (AC-6)`.
- `**Form-Grid:** 2 Spalten, gap 12 px. Pflichtmarker `*` in Danger-Farbe.` → `**Form-Grid:** 6er-Raster (50 % = 3, 33 % = 2, 67 % = 4 Spalten), gap 12 px; bis 767 px ein Feld pro Zeile. Labels im Feldrahmen (`app-input` / `p-iftalabel`). Pflichtmarker `*` in Danger-Farbe.`
- Field table: PLZ `33 %`, Ort `67 %`, Verkäufer-Typ `33 %`, Gebühr je Stück `33 %`, Provision `33 %`; component column for the text fields `app-input` (Vorname: `app-input`, Autofokus).
- AC-1 → `… PLZ (33 %) und Ort (67 %) in Panel 01 (PERSONENDATEN) anzeigen.` (drop "in einem 2-Spalten-Grid"); AC-2 drop "in einem 2-Spalten-Grid"; AC-3 → `… Verkäufer-Typ (33 %), Gebühr je Stück (33 %) und Provision (33 %) in einer Zeile in Panel 03 (KONDITIONEN) anzeigen.`

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `verkaeufer-dialog.spec.ts|sellers-page.spec.ts`.
Expected: PASS (existing signal-level tests unaffected).

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/sellers/components/verkaeufer-dialog docs/requirements/bazaar-app/epics/Epic_Verkaeufer/stories/VERK-S01-seller-edit-form-layout.md docs/requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md
git commit -m "feat(bazaar-app): Verkäufer-Dialog mit gestufter Breite, neuem Feldraster und Pflicht-Sternen"
```

---

### Task 12: Artikelannahme wizard step 1 — same field arrangement

**Files:**
- Modify: `FE/features/intake/components/intake-wizard/intake-wizard.html` (step-1 tabpanel)
- Modify: `FE/features/intake/components/intake-wizard/intake-wizard.scss`
- Modify: `FE/features/intake/components/intake-wizard/intake-wizard.ts` (imports, autofocus)
- Test: `FE/features/intake/components/intake-wizard/intake-wizard.spec.ts`

**Interfaces:**
- Consumes: `Input` (Task 8 star), `IftaLabelModule`; field classes mirror Task 11 with prefix `intake-wizard__field--half | --third | --two-thirds | --full` inside `.intake-wizard__grid`.

- [ ] **Step 1: Write the failing tests**

Add to `intake-wizard.spec.ts` inside the top-level `describe`, using the spec's existing setup helper (the one the `'renders both tabs with the exact labels'` test uses — call it the same way):

```typescript
  describe('step-1 layout (Layout-Vereinheitlichung Teil 3)', () => {
    const SPANS: [string, string][] = [
      ['intake-wizard-first-name', 'half'],
      ['intake-wizard-last-name', 'half'],
      ['intake-wizard-address', 'full'],
      ['intake-wizard-postal-code', 'third'],
      ['intake-wizard-city', 'two-thirds'],
      ['intake-wizard-phone', 'half'],
      ['intake-wizard-email', 'half'],
      ['intake-wizard-seller-type', 'third'],
      ['intake-wizard-fee-per-item', 'third'],
      ['intake-wizard-sales-commission', 'third'],
    ];

    function fieldOf(el: HTMLElement, id: string): Element | null | undefined {
      return el.querySelector(`#${id}`)?.closest('.intake-wizard__field');
    }

    it('arranges the fields exactly like the Verkäufer dialog', async () => {
      const el = (await setup()).fixture.nativeElement as HTMLElement;
      for (const [id, span] of SPANS) {
        expect(fieldOf(el, id)?.classList, id).toContain(`intake-wizard__field--${span}`);
      }
    });

    it('stars exactly Vorname, Nachname, E-Mail and Verkäufer-Typ, labels in the frame', async () => {
      const el = (await setup()).fixture.nativeElement as HTMLElement;
      const starred = SPANS.map(([id]) => id).filter((id) =>
        fieldOf(el, id)?.querySelector('.app-input__required, .intake-wizard__required'),
      );
      expect(starred).toEqual([
        'intake-wizard-first-name',
        'intake-wizard-last-name',
        'intake-wizard-email',
        'intake-wizard-seller-type',
      ]);
      for (const [id] of SPANS) {
        expect(fieldOf(el, id)?.querySelector('p-iftalabel label'), id).not.toBeNull();
      }
    });
  });
```

(`setup()` is the spec's existing helper, `intake-wizard.spec.ts:77`; called without options it starts on step 1.)

- [ ] **Step 2: Run tests to verify they fail**

Run: dev-mcp `test_angular_project`, filter `intake-wizard.spec.ts`.
Expected: FAIL on the new tests.

- [ ] **Step 3: Implement**

`intake-wizard.html` — replace the three `<div class="intake-wizard__panel">…</div>` blocks inside `<p-tabpanel value="step1">` (keep the `@if (createError())` paragraph after them) with:

```html
        <div class="intake-wizard__panel">
          <h3 class="intake-wizard__panel-title">Personendaten</h3>
          <div class="intake-wizard__grid">
            <div class="intake-wizard__field intake-wizard__field--half">
              <app-input
                label="Vorname"
                inputId="intake-wizard-first-name"
                name="firstName"
                [required]="true"
                [debounceMs]="0"
                [value]="firstName()"
                (valueChange)="firstName.set($event)"
              />
            </div>

            <div class="intake-wizard__field intake-wizard__field--half">
              <app-input
                label="Nachname"
                inputId="intake-wizard-last-name"
                name="lastName"
                [required]="true"
                [debounceMs]="0"
                [value]="lastName()"
                (valueChange)="lastName.set($event)"
              />
            </div>

            <div class="intake-wizard__field intake-wizard__field--full">
              <app-input
                label="Anschrift"
                inputId="intake-wizard-address"
                name="address"
                [debounceMs]="0"
                [value]="address()"
                (valueChange)="address.set($event)"
              />
            </div>

            <div class="intake-wizard__field intake-wizard__field--third">
              <app-input
                label="PLZ"
                inputId="intake-wizard-postal-code"
                name="postalCode"
                [debounceMs]="0"
                [value]="postalCode()"
                (valueChange)="postalCode.set($event)"
              />
            </div>

            <div class="intake-wizard__field intake-wizard__field--two-thirds">
              <app-input
                label="Ort"
                inputId="intake-wizard-city"
                name="city"
                [debounceMs]="0"
                [value]="city()"
                (valueChange)="city.set($event)"
              />
            </div>
          </div>
        </div>

        <div class="intake-wizard__panel">
          <h3 class="intake-wizard__panel-title">Kontakt</h3>
          <div class="intake-wizard__grid">
            <div class="intake-wizard__field intake-wizard__field--half">
              <app-input
                label="Telefon"
                inputId="intake-wizard-phone"
                name="phone"
                type="tel"
                [debounceMs]="0"
                [value]="phone()"
                (valueChange)="phone.set($event)"
              />
            </div>

            <div class="intake-wizard__field intake-wizard__field--half">
              <app-input
                label="E-Mail"
                inputId="intake-wizard-email"
                name="email"
                type="email"
                [required]="true"
                [debounceMs]="0"
                [value]="email()"
                (valueChange)="email.set($event)"
              />
              @if (emailFormatError()) {
                <small class="intake-wizard__error">{{ emailFormatError() }}</small>
              }
            </div>
          </div>
        </div>

        <div class="intake-wizard__panel">
          <h3 class="intake-wizard__panel-title">Konditionen</h3>
          <div class="intake-wizard__grid">
            <div class="intake-wizard__field intake-wizard__field--third">
              <p-iftalabel>
                <p-select
                  inputId="intake-wizard-seller-type"
                  [options]="sellerTypesList()"
                  optionLabel="name"
                  optionValue="id"
                  [ngModel]="sellerTypeId()"
                  (ngModelChange)="onTypeChange($event)"
                  name="sellerTypeId"
                />
                <label for="intake-wizard-seller-type">
                  Verkäufer-Typ <span class="intake-wizard__required">*</span>
                </label>
              </p-iftalabel>
            </div>

            <div class="intake-wizard__field intake-wizard__field--third">
              <p-iftalabel>
                <p-inputnumber
                  inputId="intake-wizard-fee-per-item"
                  [ngModel]="feePerItem()"
                  (ngModelChange)="feePerItem.set($event)"
                  name="feePerItem"
                  mode="currency"
                  currency="EUR"
                  locale="de-DE"
                  [min]="0"
                  [disabled]="!conditionsEditable()"
                />
                <label for="intake-wizard-fee-per-item">Gebühr je Stück</label>
              </p-iftalabel>
            </div>

            <div class="intake-wizard__field intake-wizard__field--third">
              <p-iftalabel>
                <p-inputnumber
                  inputId="intake-wizard-sales-commission"
                  [ngModel]="salesCommission()"
                  (ngModelChange)="salesCommission.set($event)"
                  name="salesCommission"
                  mode="decimal"
                  locale="de-DE"
                  [minFractionDigits]="0"
                  [maxFractionDigits]="2"
                  suffix=" %"
                  [min]="0"
                  [max]="100"
                  [disabled]="!conditionsEditable()"
                />
                <label for="intake-wizard-sales-commission">Provision</label>
              </p-iftalabel>
            </div>
          </div>
        </div>
```

`intake-wizard.scss` — replace the `&__grid`, `&__field` (incl. `&--full`), the `&__field ::ng-deep .p-select, &__field ::ng-deep .p-inputnumber` rule and the `&__field label { … }` rule with:

```scss
  // Gleiches 6er-Raster wie verkaeufer-dialog.scss (Epic verlangt Identität).
  &__grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
    grid-column: 1 / -1;

    @media (min-width: 768px) {
      &--half {
        grid-column: span 3;
      }

      &--third {
        grid-column: span 2;
      }

      &--two-thirds {
        grid-column: span 4;
      }
    }
  }

  &__field ::ng-deep p-iftalabel,
  &__field ::ng-deep .p-select,
  &__field ::ng-deep .p-inputnumber {
    display: block;
    width: 100%;
  }
```

(The old uppercase `label` rule is deleted on purpose — all labels now use the iftalabel look.)

`intake-wizard.ts`:
- Remove `import { AutoFocusModule } from 'primeng/autofocus';` and `import { InputTextModule } from 'primeng/inputtext';` and their entries in `imports`; add `import { IftaLabelModule } from 'primeng/iftalabel';` and `import { Input } from '../../../../shared/components/input/input';` and add both to `imports`.
- Add `afterNextRender` and `ElementRef` to the `@angular/core` import, add a field `private readonly hostElement: ElementRef<HTMLElement> = inject(ElementRef);`, and at the end of the existing `constructor()` body add:

```typescript
    // Ersatz für `pAutoFocus` am Vorname-Feld (ANNAHME-S02): app-input hat kein öffentliches
    // focus() — gleiches Host-querySelector-Muster wie scan-dialog.ts `onShown()`.
    afterNextRender(() => {
      this.hostElement.nativeElement.querySelector<HTMLInputElement>('#intake-wizard-first-name')?.focus();
    });
```

- [ ] **Step 4: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `intake-wizard.spec.ts|intake-page.spec.ts`.
Expected: PASS (existing tests work on signals; `'renders the fee/commission inputs as disabled in the DOM even for an admin'` still finds `#intake-wizard-fee-per-item` via `inputId`).

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/intake/components/intake-wizard
git commit -m "feat(bazaar-app): Annahme-Wizard Schritt 1 mit Feldraster wie Verkäufer-Dialog"
```

---

### Task 13: Verkäufer page — own scrolling tile list, load 60 more at the end, no paginator

**Files:**
- Modify: `FE/features/sellers/sellers-store.ts`, test `FE/features/sellers/sellers-store.spec.ts`
- Create: `FE/features/sellers/components/load-more-sentinel/load-more-sentinel.ts`, test `load-more-sentinel.spec.ts`
- Modify: `FE/features/sellers/pages/sellers-page/sellers-page.html`, `sellers-page.scss`, `sellers-page.ts`, test `sellers-page.spec.ts`
- Modify: `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md:66-68,258`

**Interfaces:**
- Produces:
  - `SellersStore.hasMore: Signal<boolean>` (`items().length < totalCount()`), `SellersStore.loadMore(): void` (fetch `page()+1`, append, then `page.set(page()+1)`; no-op while loading or without more), `SellersStore.load()` now fetches `{ page: 1, pageSize: page() * pageSize(), … }` and replaces `items`. `setPage()` is removed.
  - `LoadMoreSentinel` directive, selector `[appLoadMoreSentinel]`, input `appLoadMoreSentinel: unknown` (re-observe trigger), output `reached: void`.
  - `SellersPage.onLoadMore(): void`.
- Consumes: `Page` with `[fill]="true"` (Task 1).

- [ ] **Step 1: Write the failing store tests**

In `sellers-store.spec.ts`:
- In `'merges filters, resets page to 1 and triggers reload'` replace `store.setPage(3);` with `store.page.set(3);`.
- Replace the whole `describe('setPage', …)` block with:

```typescript
  describe('load (reload of all loaded pages)', () => {
    it('re-fetches every already loaded page in one request, starting at page 1', () => {
      getCards.mockReturnValue(of({ items: [], totalCount: 0, page: 1, pageSize: 180 }));
      const store = createStore();
      store.page.set(3);

      store.load();

      expect(getCards).toHaveBeenCalledWith(expect.objectContaining({ page: 1, pageSize: 180 }));
    });
  });

  describe('loadMore', () => {
    const card = (id: string) => ({ id }) as unknown as SellerCard;

    it('fetches the next page and appends it to the loaded items', () => {
      getCards.mockReturnValueOnce(of({ items: [card('a')], totalCount: 2, page: 1, pageSize: 60 }));
      const store = createStore();
      store.load();
      getCards.mockReturnValueOnce(of({ items: [card('b')], totalCount: 2, page: 2, pageSize: 60 }));

      store.loadMore();

      expect(getCards).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, pageSize: 60 }));
      expect(store.items().map((c) => c.id)).toEqual(['a', 'b']);
      expect(store.page()).toBe(2);
      expect(store.hasMore()).toBe(false);
    });

    it('does nothing when everything is loaded', () => {
      getCards.mockReturnValueOnce(of({ items: [card('a')], totalCount: 1, page: 1, pageSize: 60 }));
      const store = createStore();
      store.load();
      getCards.mockClear();

      store.loadMore();

      expect(getCards).not.toHaveBeenCalled();
    });

    it('does nothing while a request is running', () => {
      const store = createStore();
      store.totalCount.set(120);
      store.loading.set(true);

      store.loadMore();

      expect(getCards).not.toHaveBeenCalled();
    });
  });
```

(`SellerCard` is exported from `./data/sellers-api`; add it to the spec's import if missing. `getCards`/`createStore` are the spec's existing helpers.)

- [ ] **Step 2: Run to verify they fail**

Run: dev-mcp `test_angular_project`, filter `sellers-store.spec.ts`.
Expected: FAIL (`loadMore`/`hasMore` missing, `load` still sends `page: 3`).

- [ ] **Step 3: Implement the store**

`sellers-store.ts`:
- Add `computed` to the `@angular/core` import.
- Update the class doc comment's second sentence to: "search, status filter and sort are resolved server-side; paging is 'Nachladen am Listenende' (`loadMore()`, 60 per request) instead of a paginator — `load()` re-fetches all already loaded pages in one request so mutations keep the scroll position."
- Add after `readonly filters = …`:

```typescript
  readonly hasMore = computed(() => this.items().length < this.totalCount());
```

- Replace `load()` and `setPage()` with:

```typescript
  /** Lädt alle bisher nachgeladenen Seiten in einem Request neu (Seite 1, pageSize × page). */
  load(): void {
    this.loading.set(true);
    this.sellersApi
      .getCards({
        page: 1,
        pageSize: this.page() * this.pageSize(),
        q: this.filters().q,
        status: this.filters().status ?? undefined,
        sort: this.filters().sort,
      })
      .subscribe({
        next: (response) => {
          this.items.set(response.items);
          this.totalCount.set(response.totalCount);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  /** Nächste 60 Verkäufer ans Listenende anhängen (Epic_Verkaeufer: Nachladen statt Paginator). */
  loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    const nextPage = this.page() + 1;
    this.loading.set(true);
    this.sellersApi
      .getCards({
        page: nextPage,
        pageSize: this.pageSize(),
        q: this.filters().q,
        status: this.filters().status ?? undefined,
        sort: this.filters().sort,
      })
      .subscribe({
        next: (response) => {
          this.items.update((items) => [...items, ...response.items]);
          this.totalCount.set(response.totalCount);
          this.page.set(nextPage);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }
```

Run: dev-mcp `test_angular_project`, filter `sellers-store.spec.ts`. Expected: PASS (the original `'calls the API with the current page/pageSize/filters'` still expects `page: 1, pageSize: 60` — true for `page() === 1`).

- [ ] **Step 4: Write the failing sentinel test**

Create `FE/features/sellers/components/load-more-sentinel/load-more-sentinel.spec.ts`:

```typescript
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoadMoreSentinel } from './load-more-sentinel';

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {
    IntersectionObserverMock.instances.push(this);
  }

  fire(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

@Component({
  selector: 'app-sentinel-host',
  imports: [LoadMoreSentinel],
  template: `<div [appLoadMoreSentinel]="count()" (reached)="reached = reached + 1"></div>`,
})
class SentinelHost {
  readonly count = signal(0);
  reached = 0;
}

describe('LoadMoreSentinel', () => {
  beforeEach(() => {
    IntersectionObserverMock.instances = [];
    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function create() {
    await TestBed.configureTestingModule({ imports: [SentinelHost] }).compileComponents();
    const fixture = TestBed.createComponent(SentinelHost);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('emits reached when the sentinel becomes visible', async () => {
    const fixture = await create();

    IntersectionObserverMock.instances[0].fire(true);

    expect(fixture.componentInstance.reached).toBe(1);
  });

  it('does not emit while the sentinel is out of view', async () => {
    const fixture = await create();

    IntersectionObserverMock.instances[0].fire(false);

    expect(fixture.componentInstance.reached).toBe(0);
  });

  it('re-observes when the trigger input changes (list still too short to scroll)', async () => {
    const fixture = await create();
    const observer = IntersectionObserverMock.instances[0];
    const before = observer.observe.mock.calls.length;

    fixture.componentInstance.count.set(60);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(observer.unobserve).toHaveBeenCalled();
    expect(observer.observe.mock.calls.length).toBe(before + 1);
  });

  it('disconnects on destroy', async () => {
    const fixture = await create();
    const observer = IntersectionObserverMock.instances[0];

    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalled();
  });
});
```

Run: dev-mcp `test_angular_project`, filter `load-more-sentinel.spec.ts`. Expected: FAIL (`./load-more-sentinel` missing).

- [ ] **Step 5: Implement the sentinel**

Create `FE/features/sellers/components/load-more-sentinel/load-more-sentinel.ts`:

```typescript
import { DestroyRef, Directive, ElementRef, effect, inject, input, output } from '@angular/core';

/**
 * Meldet `reached`, sobald das Element (Ende der Verkäufer-Kachelliste) sichtbar wird — auch
 * innerhalb eines eigenen Scrollbereichs, weil `IntersectionObserver` das Clipping durch
 * scrollende Vorfahren berücksichtigt. Jede Änderung des Trigger-Inputs (z. B. Anzahl geladener
 * Karten) beobachtet neu; so meldet sich der Sentinel erneut, wenn die Liste nach dem Nachladen
 * noch nicht scrollt. Ohne `IntersectionObserver` (jsdom) ist die Direktive wirkungslos.
 */
@Directive({ selector: '[appLoadMoreSentinel]' })
export class LoadMoreSentinel {
  readonly trigger = input<unknown>(undefined, { alias: 'appLoadMoreSentinel' });
  readonly reached = output<void>();

  constructor() {
    if (typeof IntersectionObserver === 'undefined') return;

    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.reached.emit();
      }
    });

    effect(() => {
      this.trigger();
      observer.unobserve(element);
      observer.observe(element);
    });

    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}
```

Run: dev-mcp `test_angular_project`, filter `load-more-sentinel.spec.ts`. Expected: PASS.

- [ ] **Step 6: Write the failing page tests**

In `sellers-page.spec.ts`:
- Replace the `setPage` declaration/mock with `loadMore` and add a `hasMore` signal:

```typescript
  let loadMore: ReturnType<typeof vi.fn>;
  let hasMoreSignal: ReturnType<typeof signal<boolean>>;
```

  in `beforeEach`: `loadMore = vi.fn(); hasMoreSignal = signal(false);` (delete the `setPage = vi.fn(…)` line), and in the `SellersStore` `useValue` replace `setPage,` with `loadMore,` and add `hasMore: hasMoreSignal,`.
- Add inside `describe('SellersPage', …)`:

```typescript
  describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)', () => {
    it('renders "Verkäufer" as page title in fill mode and keeps "+ Neu" in the filter row', async () => {
      const { fixture } = await createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Verkäufer');
      expect(el.querySelector('app-page')?.classList).toContain('page--fill');
      expect(el.querySelector('.page__actions')?.children.length).toBe(0);
      expect(el.querySelector('.sellers-page__filter-row p-button[label="+ Neu"]')).not.toBeNull();
    });

    it('renders the tiles inside the scrolling list without a paginator', async () => {
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('.sellers-page__list .sellers-page__grid app-seller-card')).not.toBeNull();
      expect(el.querySelector('.sellers-page__list [appLoadMoreSentinel]')).not.toBeNull();
      expect(el.querySelector('p-paginator')).toBeNull();
    });

    it('loads more when the list end is reached and more sellers exist', async () => {
      hasMoreSignal.set(true);
      const { component } = await createPage();

      component.onLoadMore();

      expect(loadMore).toHaveBeenCalledTimes(1);
    });

    it('does not load more while loading or when everything is loaded', async () => {
      const { component } = await createPage();

      hasMoreSignal.set(false);
      component.onLoadMore();
      hasMoreSignal.set(true);
      loadingSignal.set(true);
      component.onLoadMore();

      expect(loadMore).not.toHaveBeenCalled();
    });
  });
```

Run: dev-mcp `test_angular_project`, filter `sellers-page.spec.ts`. Expected: FAIL (`onLoadMore` missing, no `app-page`).

- [ ] **Step 7: Implement the page**

`sellers-page.html`: wrap the `<div class="sellers-page">…</div>` block in `<app-page title="Verkäufer" [fill]="true"> … </app-page>` (dialogs/confirmdialog below stay outside). Inside, replace the final `@else { … }` branch (grid + `p-paginator`) with:

```html
  } @else {
    <div class="sellers-page__list">
      <div class="sellers-page__grid">
        @for (card of items(); track card.id) {
          <app-seller-card
            [card]="card"
            (edit)="onEdit($event)"
            (scan)="onScan($event)"
            (statusClick)="onStatusClick($event)"
            (cardClick)="onCardClick($event)"
          />
        }
      </div>
      <div class="sellers-page__sentinel" [appLoadMoreSentinel]="items().length" (reached)="onLoadMore()"></div>
    </div>
  }
```

`sellers-page.ts`:
- Remove `import { PaginatorModule, PaginatorState } from 'primeng/paginator';` and `PaginatorModule` from `imports`; add

```typescript
import { Page } from '../../../../shared/components/page/page';
import { LoadMoreSentinel } from '../../components/load-more-sentinel/load-more-sentinel';
```

  and add `Page`, `LoadMoreSentinel` to `imports`.
- Replace the `page`/`pageSize` field declarations with `readonly hasMore = this.sellersStore.hasMore;` (first check with Grep that `page()`/`pageSize()` are not used elsewhere in `sellers-page.ts`/`.html`; keep any still-used one).
- Replace `onPageChange(event: PaginatorState) { … }` with:

```typescript
  /** Listenende sichtbar (LoadMoreSentinel) — nächste 60 Verkäufer anhängen. */
  onLoadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    this.sellersStore.loadMore();
  }
```

`sellers-page.scss` — replace the `.sellers-page { … }` opening lines and add the list rules:

```scss
.sellers-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  // Ab 769px füllt die Seite die Resthöhe von app-page [fill]; Filter bleiben stehen, nur die
  // Kachelliste scrollt (docs/spec/2026-09-23-layout-vereinheitlichung.md Teil 3).
  @media (min-width: 769px) {
    flex: 1;
    min-height: 0;
  }

  &__list {
    @media (min-width: 769px) {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }
  }

  &__sentinel {
    height: 1px;
  }
```

  (i.e. delete `padding: 1rem;`; keep `&__filter-row`, `&__search`, `&__spacer`, `&__chips`, `&__empty`, `&__grid` unchanged.)

`docs/requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md`:
- Line 66 → `**Suche, Filter, Sortierung und Paging laufen serverseitig.** Kein Paginator: Am Listenende lädt das System automatisch die nächsten **60 Karten** nach. Über 768 px scrollt nur die Kachelliste in einem eigenen Bereich (Fensterhöhe abzüglich Shell-Abstand, Page-Header und Filter), die Filterzeilen bleiben stehen; bis 768 px scrollt die Seite normal.`
- Line 68 → `Grund: Jede Karte trägt sieben Aggregate, und sortiert wird nach Summen, die nur der Server kennt. 60 je Nachladen decken etwa drei Bildschirmhöhen ab und bleiben auf einem Tablet flüssig.`
- AC-7 (line 258) → `7. **AC-7** — THE SYSTEM SHALL Suche, Statusfilter, Sortierung und Paging serverseitig auflösen und je Nachladen höchstens 60 Karten liefern; WHEN das Listenende erreicht wird und weitere Verkäufer existieren, THEN SHALL das System die nächsten 60 ohne Paginator anhängen. Die Karten-Aggregate SHALL aus einer einzigen Abfrage stammen.`

- [ ] **Step 8: Run tests to verify they pass**

Run: dev-mcp `test_angular_project`, filter `sellers`.
Expected: PASS (store, sentinel, page, dialog specs).

- [ ] **Step 9: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/sellers docs/requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md
git commit -m "feat(bazaar-app): Verkäufer-Kachelliste mit eigenem Scrollbereich und Nachladen statt Paginator"
```

---

### Task 14: Full verification (lint, build, all tests, browser at 1440 / 900 / 768 / 767)

**Files:** none (fix-ups only if something fails — fix in the task's files, own commit).

- [ ] **Step 1: Lint**

Run: dev-mcp `lint_angular_project` for `src/bazaar-app/frontend`.
Expected: 0 errors. Typical fix-ups: unused imports (`InputGroup`, `PaginatorModule`, `InputTextModule`, `AutoFocusModule`), `boundaries` rule (all new imports are `shared → shared` or `feature → shared`, both allowed).

- [ ] **Step 2: Build**

Run: dev-mcp `build_angular_project` for `src/bazaar-app/frontend`.
Expected: success, no new warnings.

- [ ] **Step 3: All frontend tests**

Run: dev-mcp `test_angular_project` for `src/bazaar-app/frontend` (no filter).
Expected: all green. Also confirm `app-input-group` still has consumers (artikel-dialog, intake-article-entry, session-item-popup, settings-form) — it must stay; do not delete it.

- [ ] **Step 4: Browser check**

Start the preview via `preview_start {name: "bazaar-app-frontend"}` (needs the backend running; log in as admin). Check with `resize_window` + `javascript_tool` (computed widths) + screenshot:

| Width | Page / dialog | Expected |
|---|---|---|
| 1440 | each of the 9 pages + Verkauf | title = menu label; `.page__content` width ≤ 1080px and centered (`getBoundingClientRect()` left/right margins inside the content area equal) |
| 1440 | Marken/Kategorien/Verkäufer-Typen | „+ Neu" right in the header, no table title |
| 1440 | Verkauf | pixel-identical layout to before (33/67 grid, cart height) |
| 1440 | Abrechnung → „Zurückgeben", Verkäufer → Freigeben (scan icon on a card) | dialog width 720px, centered, label „Artikelnummer" in the frame, 24px field→list |
| 1440 | Verkäufer „+ Neu" and edit pencil | dialog 720px; rows 50/50, 100, 33/67, 50/50, 33/33/33; stars on 4 fields |
| 1440 | Verkäufer page with > 60 sellers | only the tile list scrolls, filters stay; scrolling to the end loads the next 60 (network: `page=2&pageSize=60`) |
| 900 | Artikel | only the table scrolls horizontally (`document.documentElement.scrollWidth === clientWidth`) |
| 900 | Statistik | tiles readable, 3 per row |
| 900 | scan dialog / Verkäufer dialog | width = 80 % (720px) |
| 1024 | scan dialog | 50 % (512px) |
| 768 | all pages | full width, title visible; Verkäufer page scrolls as a whole |
| 767 | scan dialog / Verkäufer dialog | 100 % width, every Verkäufer field on its own row |
| any | Artikelannahme | title in search and in wizard; wizard step 1 grid identical to the dialog; Enter with exactly one hit opens the wizard |
| any | Abrechnung, no hit | no „+ Neuen Verkäufer anlegen" button |

Reset with `resize_window {preset: "desktop"}` afterwards.

- [ ] **Step 5: Commit fix-ups (only if any)**

```bash
git add -A src/bazaar-app/frontend
git commit -m "fix(bazaar-app): Nacharbeiten aus der Layout-Verifikation"
```
