# List-Toolbar-Vereinheitlichung (p-toolbar + Filter-Dropdown) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die zwei geteilten Toolbar-Komponenten `FilterPanel` und `MasterDataFilterToolbar` (Voranmelde-App-Frontend) auf `p-toolbar` umstellen und ihr Verhalten unterhalb Tablet-Breite (< 768 px) von einem Bottom-Sheet-Drawer auf ein Dropdown-Overlay (`p-popover`) ändern. Beide Komponenten werden bereits von allen sechs betroffenen Listen (Meine Artikel, Verkäufer, Artikel, Marken, Kategorien, Verkäufer-Typen) verwendet — es müssen keine Seiten-Dateien angefasst werden.

**Architecture:** `p-toolbar` liefert die äußere Zeile mit den beiden Slots `#start` (Filterfelder) und `#end` (+ Neu-Button) — ersetzt die bisherige `display:flex;justify-content:space-between`-Div. Unterhalb 768 px bleibt die vorhandene `isMobile`-Signal-Logik (JS-getriebener `matchMedia`) bestehen, aber statt `p-drawer` (Bottom-Sheet) öffnet der "Filter"-Button jetzt ein `p-popover` (Dropdown-Overlay, `appendTo="self"` damit es im Komponentenbaum bleibt und testbar ist) mit denselben Feldern darin.

**Tech Stack:** Angular (Standalone Components, Signals), PrimeNG 22.1 (`primeng/toolbar`, `primeng/popover`), Vitest.

**Spec:** [docs/components/filter-panel/component.md](../../components/filter-panel/component.md), [docs/components/master-data-filter-toolbar/component.md](../../components/master-data-filter-toolbar/component.md)

## Global Constraints

- Ausschließlich PrimeNG-Komponenten, kein natives HTML für UI-Elemente (Projekt-Grundregel, [docs/components/overview.md](../../components/overview.md)).
- Dumb Component: keine eigene Datenbeschaffung, keine Business-Logik in den beiden Shared-Komponenten.
- `p-popover` mit `[appendTo]="'self'"` — nicht `'body'` (Default), sonst rendert PrimeNG den Inhalt außerhalb des Komponentenbaums und Vitest-Queries über `fixture.debugElement` finden ihn nicht mehr.
- Breakpoint bleibt `(max-width: 767px)`, identisch in beiden Komponenten (unverändert).
- Bestehende `data-testid`-Attribute (`filter-button`, `search-button`, `add-button`, `status-select`, `seller-type-select`, `seller-autocomplete`) bleiben erhalten — nur `p-drawer` wird zu `p-popover` mit neuem `data-testid="filter-popover"`.

---

### Task 1: FilterPanel auf p-toolbar + Popover umstellen

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.scss`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.spec.ts`

**Interfaces:**
- Consumes: nichts Neues — alle bestehenden `input()`/`output()` von `FilterPanel` bleiben unverändert (`brands`, `categories`, `statusOptions`, `sellerTypeOptions`, `sellerAutocomplete`, `canAdd`, `createLabel`, `liveFilter`, `sellerSearchFn`, `search`, `create`).
- Produces: Template-Struktur ändert sich (kein `.filter-panel`-Div mehr, sondern `p-toolbar` mit `#start`/`#end`), `overlayVisible` Signal entfällt (ersetzt durch `Popover.hide()` via `ViewChild`).

- [ ] **Step 1: Bestehende Drawer-Tests durch Popover-Tests ersetzen (failing zunächst)**

In `filter-panel.spec.ts` die drei Drawer-spezifischen Tests ersetzen:

```typescript
  it('opens a popover dropdown with the same filter fields when the filter button is clicked', () => {
    const { fixture } = create(false, undefined, true);

    fixture.debugElement.query(By.css('[data-testid="filter-button"] button')).nativeElement.click();
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="filter-popover"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('p-select'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('[data-testid="search-button"]'))).not.toBeNull();
  });

  it('does not render a popover when the viewport is desktop-width', () => {
    const { fixture } = create(false, undefined, false);

    expect(fixture.debugElement.query(By.css('[data-testid="filter-popover"]'))).toBeNull();
  });
```

Ersetze dabei diese drei bestehenden `it(...)`-Blöcke komplett:
- `'opens an overlay with the same filter fields when the filter button is clicked'`
- `'closes the overlay after a search is triggered from within it on mobile'`
- `'does not render a filter button or overlay when the viewport is desktop-width'`
- `'opens the overlay as a bottom sheet (p-drawer, position bottom)'`

durch die zwei neuen Tests oben plus diesen (ersetzt `'closes the overlay...'`):

```typescript
  it('closes the popover after a search is triggered from within it on mobile', () => {
    const { fixture } = create(false, undefined, true);
    const component = fixture.componentInstance;
    fixture.debugElement.query(By.css('[data-testid="filter-button"] button')).nativeElement.click();
    fixture.detectChanges();

    component.emit();

    expect(component.filterPopover?.overlayVisible()).toBe(false);
  });
```

- [ ] **Step 2: Test-Lauf zeigt Fehlschlag**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel.spec.ts`
Expected: FAIL — `[data-testid="filter-popover"]` existiert noch nicht, `filterPopover` ist nicht definiert.

- [ ] **Step 3: Template und Imports umbauen**

In `filter-panel.ts`:

```typescript
import { Component, DestroyRef, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { ToolbarModule } from 'primeng/toolbar';
import { Popover, PopoverModule } from 'primeng/popover';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, Subject, catchError, debounceTime, of, switchMap } from 'rxjs';
import type { MasterDataItem } from '@shared/models/master-data-item';
import type { SellerTypeOption } from '@shared/models/seller-type-option';
```

`imports`-Array der `@Component`-Dekoration:

```typescript
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, FluidModule, AutoCompleteModule, ToolbarModule, PopoverModule, TranslatePipe, NgTemplateOutlet],
```

Template — das äußere Markup (ab `<div class="filter-panel">`) ersetzen durch:

```html
    <p-toolbar>
      <ng-template #start>
        @if (isMobile()) {
          <button
            pButton type="button" icon="pi pi-filter" data-testid="filter-button"
            (click)="filterPopover.toggle($event)"
          >{{ 'filterPanel.filterButton' | translate }}</button>
          <p-popover #filterPopover [appendTo]="'self'" data-testid="filter-popover">
            <div class="filter-panel-overlay">
              <ng-container *ngTemplateOutlet="fields" />
            </div>
          </p-popover>
        } @else {
          <ng-container *ngTemplateOutlet="fields" />
        }
      </ng-template>
      <ng-template #end>
        @if (canAdd()) {
          <button pButton type="button" data-testid="add-button" (click)="create.emit()">{{ createLabel() }}</button>
        }
      </ng-template>
    </p-toolbar>
```

Die `<ng-template #fields>` (Zeilen 44-95 im Original) bleibt unverändert stehen.

- [ ] **Step 4: `overlayVisible`-Signal entfernen, `filterPopover`-ViewChild ergänzen, `emit()` anpassen**

Entferne `readonly overlayVisible = signal(false);` aus der Klasse.

Ergänze im Klassenkörper, direkt nach `readonly isMobile = signal(false);`:

```typescript
  readonly filterPopover = viewChild.required<Popover>('filterPopover');
```

Passe `emit()` an — `this.overlayVisible.set(false);` ersetzen durch:

```typescript
  emit(): void {
    this.search.emit({
      brand: this.brandValue() ?? undefined,
      category: this.categoryValue() ?? undefined,
      status: this.statusValue() ?? undefined,
      sellerTypeId: this.sellerTypeValue() ?? undefined,
      search: this.searchText().trim() || undefined,
      sellerId: this.sellerId()
    });
    if (this.isMobile()) {
      this.filterPopover().hide();
    }
  }
```

`viewChild.required` wirft, wenn die Query vor dem ersten Render aufgerufen wird — das passiert hier nicht, da `emit()` erst nach Nutzerinteraktion läuft. Der Test aus Step 1 muss entsprechend `component.filterPopover().overlayVisible()` lesen (Signal-Funktionsaufruf statt Property) — Step 1 oben mit `component.filterPopover?.overlayVisible()` ist zu korrigieren auf `component.filterPopover().overlayVisible()` (kein Optional-Chaining nötig, `required` liefert immer einen Wert nach Render).

- [ ] **Step 5: SCSS aufräumen**

`filter-panel.scss` ersetzen durch:

```scss
.filter-panel-overlay {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}
```

(`.filter-panel` und `.filter-panel-fields` entfallen — `p-toolbar` liefert die äußere Zeile, die Felder selbst kommen aus `p-fluid` in `<ng-template #fields>` und brauchen keinen eigenen Wrapper mehr.)

- [ ] **Step 6: Tests laufen lassen**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel.spec.ts`
Expected: PASS — alle Tests inkl. der drei neuen/angepassten Popover-Tests.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.scss src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.spec.ts
git commit -m "refactor(advance-registration): FilterPanel auf p-toolbar und Popover-Dropdown umstellen"
```

---

### Task 2: MasterDataFilterToolbar auf p-toolbar + Popover umstellen

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/master-data-filter-toolbar/master-data-filter-toolbar.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/master-data-filter-toolbar/master-data-filter-toolbar.scss`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/master-data-filter-toolbar/master-data-filter-toolbar.spec.ts`

**Interfaces:**
- Consumes: nichts aus Task 1 — beide Komponenten sind unabhängig voneinander, teilen sich nur dasselbe Muster.
- Produces: gleiche Template-Struktur wie `FilterPanel` (p-toolbar mit `#start`/`#end`), gleiches Popover-Verhalten via `filterPopover` ViewChild.

- [ ] **Step 1: Bestehende Drawer-Tests lesen und Äquivalent in Popover-Form schreiben**

Zuerst `master-data-filter-toolbar.spec.ts` öffnen und die Tests suchen, die `p-drawer`, `overlayVisible` oder `'position bottom'` referenzieren (analog zum Muster in `filter-panel.spec.ts` — vermutlich Tests wie `'collapses the filter fields into a filter button on a mobile-width viewport'`, `'opens an overlay ...'`, `'does not render a filter button or overlay ...'`). Ersetze deren Drawer-spezifische Assertions 1:1 nach demselben Muster wie in Task 1 Step 1 (aus `p-drawer`/`overlayVisible` wird `[data-testid="filter-popover"]`/`filterPopover().overlayVisible()`).

- [ ] **Step 2: Test-Lauf zeigt Fehlschlag**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- master-data-filter-toolbar.spec.ts`
Expected: FAIL — `[data-testid="filter-popover"]` existiert noch nicht.

- [ ] **Step 3: Template und Imports umbauen**

In `master-data-filter-toolbar.ts`:

```typescript
import { Component, DestroyRef, inject, input, output, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { ToolbarModule } from 'primeng/toolbar';
import { Popover, PopoverModule } from 'primeng/popover';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject, debounceTime } from 'rxjs';
```

`imports`-Array:

```typescript
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, FluidModule, ToolbarModule, PopoverModule, TranslatePipe, NgTemplateOutlet],
```

Template — das äußere Markup (ab `<div class="master-data-filter-toolbar">`) ersetzen durch:

```html
    <p-toolbar>
      <ng-template #start>
        @if (isMobile()) {
          <button
            pButton type="button" icon="pi pi-filter" data-testid="filter-button"
            (click)="filterPopover().toggle($event)"
          >{{ 'masterDataFilterToolbar.filterButton' | translate }}</button>
          <p-popover #filterPopover [appendTo]="'self'" data-testid="filter-popover">
            <div class="master-data-filter-toolbar-overlay">
              <ng-container *ngTemplateOutlet="fields" />
            </div>
          </p-popover>
        } @else {
          <ng-container *ngTemplateOutlet="fields" />
        }
      </ng-template>
      <ng-template #end>
        @if (canAdd()) {
          <button pButton type="button" data-testid="add-button" (click)="create.emit()">+ Neu</button>
        }
      </ng-template>
    </p-toolbar>
```

Die `<ng-template #fields>` (Zeilen 26-43 im Original) bleibt unverändert stehen.

- [ ] **Step 4: `overlayVisible`-Signal entfernen, `filterPopover`-ViewChild ergänzen, `emit()` anpassen**

Entferne `readonly overlayVisible = signal(false);`.

Ergänze nach `readonly isMobile = signal(false);`:

```typescript
  readonly filterPopover = viewChild.required<Popover>('filterPopover');
```

Passe `emit()` an:

```typescript
  private emit(): void {
    this.filterChange.emit({
      search: this.searchText().trim() || undefined,
      original: this.originalValue() ?? undefined
    });
    if (this.isMobile()) {
      this.filterPopover().hide();
    }
  }
```

- [ ] **Step 5: SCSS aufräumen**

`master-data-filter-toolbar.scss` ersetzen durch:

```scss
.master-data-filter-toolbar-overlay {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}
```

- [ ] **Step 6: Tests laufen lassen**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- master-data-filter-toolbar.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/master-data-filter-toolbar/master-data-filter-toolbar.ts src/advance-registration/frontend/BAR.App/src/app/shared/master-data-filter-toolbar/master-data-filter-toolbar.scss src/advance-registration/frontend/BAR.App/src/app/shared/master-data-filter-toolbar/master-data-filter-toolbar.spec.ts
git commit -m "refactor(advance-registration): MasterDataFilterToolbar auf p-toolbar und Popover-Dropdown umstellen"
```

---

### Task 3: Visuelle Verifikation an allen sechs Listen

**Files:** keine Code-Änderungen — nur manuelle/Browser-Prüfung.

**Interfaces:**
- Consumes: die fertig umgebauten Komponenten aus Task 1 und Task 2, jeweils bereits in den sechs Seiten verdrahtet (`MyArticlesPage`, `SellersPage`, `ArticlesPage`, `BrandsPage`, `CategoriesPage`, `SellerTypesPage` — keine dieser Dateien wird verändert).

- [ ] **Step 1: Frontend starten und alle sechs Listen im Browser prüfen**

Dev-Server starten (`preview_start` mit dem Frontend-Launch-Eintrag, oder `npm --prefix src/advance-registration/frontend/BAR.App start`), dann nacheinander aufrufen:
- Meine Artikel
- Verkäufer (Verkäufer-Verwaltung)
- Artikel (Alle Artikel)
- Marken
- Kategorien
- Verkäufer-Typen

Bei jeder Seite bei ≥ Tablet-Breite (≥ 768 px) prüfen: Filterfelder linksbündig, „+ Neu" (wo vorhanden) rechtsbündig, alles eine Zeile, `p-toolbar`-Rahmen sichtbar (per `read_page`/DOM-Inspektion: `<p-toolbar>`-Element vorhanden).

Fensterbreite auf < 768 px verkleinern (`resize_window`), prüfen: Filterfelder durch „Filter"-Button ersetzt, Klick öffnet Dropdown-Panel (nicht Bottom-Sheet) mit denselben Feldern, „+ Neu" bleibt daneben sichtbar.

- [ ] **Step 2: Auffälligkeiten dokumentieren oder Abschluss bestätigen**

Keine Code-Änderung in diesem Task — bei Abweichungen zurück zu Task 1/2, sonst Plan abgeschlossen.

## Tags & Piles

**Piles:** #pile/docs
**Tags:** #frontend #primeng #toolbar #filter-panel #master-data-filter-toolbar #advance-registration
