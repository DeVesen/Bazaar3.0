# Filterleiste der Verkäuferseite als gerahmte Leiste — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-sellers-toolbar-redesign/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die zwei losen Filterzeilen der Verkäuferseite (Haupt-App) werden zu einer einzigen gerahmten Leiste mit „+"-Button links, füllender Freitextsuche und den Auswahlfeldern Sortierung und Status rechts.
**Architektur:** Die Leiste wird mit der PrimeNG-Komponente `p-toolbar` (Standard-Projektion, vier direkte Kinder) in `sellers-page.html` gebaut; Layout (Suche füllt Rest, Auswahlfelder min. 150 px, Umbruch) kommt aus dem Flex-Verhalten von `p-toolbar` plus drei Klassen in `sellers-page.scss`. Die Logik der Seite (`SellersPage`) bleibt unverändert; nur Template, Styles, ein Hinweistext und die Spec ändern sich.
**Tech-Stack:** Angular 22 (zoneless, OnPush), PrimeNG 22 (`p-toolbar`, `p-button`, `pTooltip`, `p-iconfield`, `p-select`), Vitest über `ng test`.
**Spec:** docs/forge/2026-10-12-sellers-toolbar-redesign/spec.md
**Basis:** e75281c

## Global Constraints
- Umgesetzt wird nur die Seite „Verkäufer" der Haupt-App (`src/bazaar-app/frontend/.../features/sellers/pages/sellers-page`); Voranmelde-App und andere Listenseiten bleiben unverändert. (Spec: Soll-Vorgaben)
- Layout-Muster: „+" links, Freitextsuche füllt den gesamten Platz zwischen Button und Auswahlfeldern, Auswahlfelder rechts, keine Labels, Auswahlfelder mit Mindestbreite 150 px. (Spec: Soll-Vorgaben)
- Zur Leiste gehören nur Suchfeld, zwei Auswahlfelder und der Anlegen-Button; keine weiteren Schaltflächen (Drucken, Hochladen, Abbrechen, Speichern). (Spec: Soll-Vorgaben)
- Keine sichtbaren Labels an den Eingabefeldern; Auswahlfelder tragen für Screenreader die Namen „Sortierung" und „Status". (Spec: Soll-Vorgaben, AC-08)
- Hinweis am „+"-Button (Hover und Screenreader): „Neuer Verkäufer"; Platzhalter der Suche: „Suche nach Name, Ort …". (Spec: AC-03, AC-05)
- Reihenfolge rechts: Sortierung, dann Status. (Spec: AC-06)
- Suche wirkt verzögert nach kurzer Tipppause, Sortierung und Status sofort; Chips bleiben unter der Leiste; die Leiste bricht bei schmalem Fenster um, keine waagerechte Bildlaufleiste. Der Umbruch ist über `flex-wrap: wrap` an `.sellers-page__toolbar` ausdrücklich gesetzt und zusammen mit den Flex-Regeln von Suchfeld und Auswahlfeldern in Task 1 automatisch getestet (`styles_pageOpened_searchGrowsSelectsKeepMinWidthAndToolbarWraps`); die Sichtprüfung im Dev-Server ergänzt nur die berechneten Pixelbreiten. (Spec: AC-09, AC-10, AC-11)
- Projekt-`CLAUDE.md`: nur PrimeNG-Komponenten, kein natives HTML für UI-Elemente; Code, Routen und JSON-Contract englisch, Doku deutsch.
- dv-angular:angular-testing-vitest-conventions: Specs mit Vitest (`vi.fn`, `expect`), Test-Aufbau Arrange/Act/Assert mit Kommentaren `// Arrange` `// Act` `// Assert`, neue `it`-Namen nach `<methode>_<Situation>_<Erwartung>`, bestehende Testnamen bleiben, zoneless: Act → `await fixture.whenStable()` → Assert, keine zusätzlichen Mock-Bibliotheken, Verifikation nur über den Testbefehl des Projekts.
- primeng: PrimeNG-v22-Code nur nach den Referenzen schreiben (`p-button` mit `icon`/`ariaLabel`, `pTooltip` aus `primeng/tooltip`, `p-toolbar` aus `primeng/toolbar`); `p-select` bekommt den Screenreader-Namen über den Input `ariaLabel`, nicht über das Host-Attribut `aria-label`.
- dv-angular:angular-component: `ChangeDetectionStrategy.OnPush` bleibt, native Control-Flow-Syntax, kein `ngClass`/`ngStyle`.
- dv-angular:angular-styling: Standard-Kapselung (`Emulated`) bleibt, kein `::ng-deep`, Klassen auf den Host-Elementen im eigenen Template.
- dv-angular:angular, dv-angular:toolchain: Tests/Build laufen über `dv-angular-test` (siehe Task-Schritte), nicht über `ng test` per Hand.

---

### Task 1: Gerahmte Filterleiste (Template, Styles, Struktur-Tests)

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-11

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html:3-38` · `<p-button label="+ Neu" (onClick)="onNewClick()" />`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts:22-102` · `import { SelectModule } from 'primeng/select';`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.scss:25-39` · `&__filter-row {`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts:371-380` · `describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)'`

Zu ändern sind im Template beide Filterzeilen (Zeilen 3–38, die erste enthält den Anker-Button), in `sellers-page.ts` die PrimeNG-Import-Zeilen und das `imports`-Array der Komponente (beide bei `SelectModule`), in `sellers-page.scss` die Regeln `&__filter-row`, `&__search` und `&__spacer` und im Test der erste Test des genannten `describe`.

**Interfaces:**
- Consumes: bestehende Methoden `SellersPage.onNewClick(): void`, `onQInputChange(value: string): void`, `onSortChange(sort: string): void`, `onStatusChange(status: string | null): void` sowie die Felder `sortOptions`, `statusOptions`, `qInput`, `filters` (unverändert).
- Produces: DOM-Vertrag für Folge-Tasks und Tests — `p-toolbar.sellers-page__toolbar` mit genau vier direkten Kindern in der Reihenfolge `p-button`, `p-iconfield.sellers-page__search`, `p-select.sellers-page__select` (Sortierung), `p-select.sellers-page__select` (Status); direkt danach (falls Filter aktiv) `div.sellers-page__chips`. Die Klassen `sellers-page__filter-row` und `sellers-page__spacer` entfallen.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  In `sellers-page.spec.ts` zwei Imports oben ergänzen (direkt unter `import { signal } from '@angular/core';`):
  ```ts
  import { By } from '@angular/platform-browser';
  import { Tooltip } from 'primeng/tooltip';
  ```
  Den bestehenden Test `renders "Verkäufer" as page title in fill mode and keeps "+ Neu" in the filter row` ersetzen durch diesen Block (Namen der übrigen Tests im `describe` bleiben):
  ```ts
    it('renders "Verkäufer" as page title in fill mode with an empty actions area', async () => {
      const { fixture } = await createPage();
      const el: HTMLElement = fixture.nativeElement;

      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Verkäufer');
      expect(el.querySelector('app-page')?.classList).toContain('page--fill');
      expect(el.querySelector('.page__actions')?.children.length).toBe(0);
    });

    describe('filter toolbar', () => {
      async function renderToolbar(): Promise<{
        fixture: ComponentFixture<SellersPage>;
        component: SellersPage;
        el: HTMLElement;
        toolbar: HTMLElement;
      }> {
        const { fixture, component } = await createPage();
        const el: HTMLElement = fixture.nativeElement;
        const toolbar = el.querySelector<HTMLElement>('.sellers-page > p-toolbar.sellers-page__toolbar');
        if (!toolbar) throw new Error('sellers-page__toolbar not rendered');
        return { fixture, component, el, toolbar };
      }

      it('template_pageOpened_rendersAllControlsInOneToolbarInOrder', async () => {
        // Arrange
        // Act
        const { el, toolbar } = await renderToolbar();

        // Assert
        const children = Array.from(toolbar.children).map((child) => child.tagName.toLowerCase());
        expect(children).toEqual(['p-button', 'p-iconfield', 'p-select', 'p-select']);
        expect(el.querySelectorAll('.sellers-page__filter-row').length).toBe(0);
        expect(el.querySelectorAll('p-toolbar').length).toBe(1);
      });

      it('template_pageOpened_rendersIconOnlyAddButtonWithoutText', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const button = toolbar.querySelector<HTMLButtonElement>('p-button button');
        expect(button).not.toBeNull();
        expect(button?.textContent?.trim()).toBe('');
        expect(button?.querySelector('.pi-plus')).not.toBeNull();
      });

      it('template_pageOpened_labelsAddButtonNeuerVerkaeuferForHoverAndScreenreader', async () => {
        // Arrange
        // Act
        const { fixture, toolbar } = await renderToolbar();

        // Assert
        expect(
          toolbar.querySelector('p-button button')?.getAttribute('aria-label'),
        ).toBe('Neuer Verkäufer');
        const buttonHost = fixture.debugElement.query(By.css('p-toolbar p-button'));
        expect(buttonHost.injector.get(Tooltip).content()).toBe('Neuer Verkäufer');
      });

      it('onNewClick_addButtonClicked_opensCreateDialog', async () => {
        // Arrange
        const { fixture, component, toolbar } = await renderToolbar();

        // Act
        toolbar.querySelector<HTMLButtonElement>('p-button button')?.click();
        await fixture.whenStable();

        // Assert
        expect(component.dialogVisible()).toBe(true);
        expect(component.dialogMode()).toBe('create');
      });

      it('template_pageOpened_showsSearchPlaceholderInsideToolbar', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const input = toolbar.querySelector<HTMLInputElement>('p-iconfield input');
        expect(input?.getAttribute('placeholder')).toBe('Suche nach Name, Ort …');
      });

      it('template_pageOpened_namesSelectsSortierungThenStatusForScreenreader', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const names = Array.from(toolbar.querySelectorAll('p-select [role="combobox"]')).map(
          (combobox) => combobox.getAttribute('aria-label'),
        );
        expect(names).toEqual(['Sortierung', 'Status']);
      });

      it('template_pageOpened_rendersNoVisibleLabels', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        expect(toolbar.querySelectorAll('label').length).toBe(0);
        expect(toolbar.querySelector('p-button .p-button-label')).toBeNull();
      });

      it('template_pageOpened_marksSearchAndBothSelectsWithLayoutClasses', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        const search = toolbar.querySelector('p-iconfield');
        const selects = Array.from(toolbar.querySelectorAll(':scope > p-select'));
        expect(search?.classList).toContain('sellers-page__search');
        expect(selects.length).toBe(2);
        for (const select of selects) {
          expect(select.classList).toContain('sellers-page__select');
        }
      });

      it('styles_pageOpened_searchGrowsSelectsKeepMinWidthAndToolbarWraps', async () => {
        // Arrange
        // Act
        const { toolbar } = await renderToolbar();

        // Assert
        expect(getComputedStyle(toolbar).flexWrap).toBe('wrap');
        const search = toolbar.querySelector<HTMLElement>('p-iconfield.sellers-page__search');
        if (!search) throw new Error('sellers-page__search not rendered');
        expect(getComputedStyle(search).flexGrow).toBe('1');
        const selects = Array.from(
          toolbar.querySelectorAll<HTMLElement>(':scope > p-select.sellers-page__select'),
        );
        expect(selects.length).toBe(2);
        for (const select of selects) {
          const style = getComputedStyle(select);
          expect(style.minWidth).toBe('150px');
          expect(style.flexGrow).toBe('0');
          expect(style.flexShrink).toBe('0');
        }
      });
    });
  ```
  Der Style-Test liest die Komponenten-Styles über `getComputedStyle` wie bereits `numpad.spec.ts` (`renders the grid with the binding margin from the component doc`): jsdom wertet die eingebundenen Komponenten-Styles aus, berechnet aber keine Pixelbreiten. Deshalb stehen die Flex-Werte in `sellers-page.scss` als Einzel-Eigenschaften (`flex-grow`, `flex-shrink`, `flex-basis`) statt als Kurzform.
  Zusätzlich oben in der Spec den Import `import { TestBed } from '@angular/core/testing';` erweitern zu:
  ```ts
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL `template_pageOpened_rendersAllControlsInOneToolbarInOrder` (und die übrigen acht neuen Tests des Blocks `filter toolbar`, darunter `template_pageOpened_marksSearchAndBothSelectsWithLayoutClasses` und `styles_pageOpened_searchGrowsSelectsKeepMinWidthAndToolbarWraps`; `sellers-page__toolbar not rendered`)
- [ ] **Schritt 3: Minimal implementieren**
  1. `sellers-page.ts`: Import-Zeilen ergänzen (alphabetisch bei den PrimeNG-Importen, nach `SelectModule`):
     ```ts
     import { ToolbarModule } from 'primeng/toolbar';
     import { TooltipModule } from 'primeng/tooltip';
     ```
     und im `@Component({ imports: [...] })` nach `SelectModule,` einfügen:
     ```ts
         ToolbarModule,
         TooltipModule,
     ```
  2. `sellers-page.html`: den gesamten Block von `<div class="sellers-page__filter-row">` (erste Zeile, Zeile 3) bis zum schließenden `</div>` der zweiten Filterzeile (Zeile 38) ersetzen durch:
     ```html
       <p-toolbar class="sellers-page__toolbar">
         <p-button
           icon="pi pi-plus"
           ariaLabel="Neuer Verkäufer"
           pTooltip="Neuer Verkäufer"
           tooltipPosition="bottom"
           (onClick)="onNewClick()"
         />

         <p-iconfield class="sellers-page__search">
           <p-inputicon class="pi pi-search" />
           <input
             pInputText
             type="text"
             placeholder="Suche nach Name, Ort …"
             [ngModel]="qInput()"
             (ngModelChange)="onQInputChange($event)"
           />
         </p-iconfield>

         <p-select
           class="sellers-page__select"
           [options]="sortOptions"
           optionLabel="label"
           optionValue="value"
           [ngModel]="filters().sort"
           (ngModelChange)="onSortChange($event)"
           ariaLabel="Sortierung"
         />

         <p-select
           class="sellers-page__select"
           [options]="statusOptions"
           optionLabel="label"
           optionValue="value"
           [ngModel]="filters().status"
           (ngModelChange)="onStatusChange($event)"
           ariaLabel="Status"
         />
       </p-toolbar>
     ```
     Der Chips-Block (`@if (hasActiveFilters()) { ... }`) bleibt unverändert direkt darunter.
  3. `sellers-page.scss`: die Regeln `&__filter-row { ... }`, `&__search { ... }` und `&__spacer { ... }` (Zeilen 25–39) ersetzen durch:
     ```scss
       &__toolbar {
         flex-shrink: 0;
         flex-wrap: wrap;
       }

       &__search {
         flex-grow: 1;
         flex-shrink: 1;
         flex-basis: 16rem;
         min-width: 12rem;

         input {
           width: 100%;
         }
       }

       &__select {
         flex-grow: 0;
         flex-shrink: 0;
         flex-basis: auto;
         min-width: 150px;
       }
     ```
     `flex-wrap: wrap` steht ausdrücklich an der Leiste (Umbruch bei schmalem Fenster), unabhängig vom Standard-Style von `p-toolbar`. Die Auswahlfelder haben keine feste Breite und schrumpfen nicht (`flex-shrink: 0`), so wachsen sie mit dem gewählten Text über 150 px hinaus.
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS aller Tests der Datei (die neun neuen des Blocks `filter toolbar`, der angepasste Seitentitel-Test und die übrigen bestehenden; der Empty-State-Test mit `+ Neu` bleibt in diesem Task noch grün, weil der Hinweistext erst in Task 2 geändert wird)
- [ ] **Schritt 5: Ergänzende Sichtprüfung der berechneten Pixel-Layouts (AC-05, AC-07, AC-11; Klassen und Flex-Regeln sind in Schritt 1 automatisch getestet)**
  Dev-Server starten: `preview_start` mit `{"name": "bazaar-app-frontend"}`, Seite „Verkäufer" öffnen und prüfen: Suchfeld füllt den Platz zwischen „+" und den Auswahlfeldern; beide Auswahlfelder ≥ 150 px und wachsen bei längerem Text („Angenommener Warenwert", „Abgerechnet") ohne Kürzung; `resize_window` mit `{"preset": "mobile"}` — Leiste bricht um, keine waagerechte Bildlaufleiste; danach `resize_window` mit `{"preset": "desktop"}`. Lässt sich die Seite nicht öffnen (Anmeldung/Backend nötig), steht das im Bericht des Tasks als „nicht geprüft", kein Code wird dafür geändert.
- [ ] **Schritt 6: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.scss src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "feat(bazaar-app): Filterleiste Verkäuferseite als gerahmte Leiste (sellers-toolbar-redesign)"`

### Task 2: Hinweistext der Leere-Ansicht ohne „+ Neu"

**ACs:** AC-04

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html:55-61` · Block `@if (noSellersAtAll())` (Absatz mit `<strong>+ Neu</strong>`)
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts:213-222` · Test `shows the "no sellers at all" copy when totalCount is 0 and no filters are active`

**Interfaces:**
- Consumes: DOM-Vertrag aus Task 1 (`p-toolbar.sellers-page__toolbar`, Button mit `aria-label="Neuer Verkäufer"`).
- Produces: Hinweistext der Leere-Ansicht verweist auf den „+"-Button statt auf „+ Neu".

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  Im Test `shows the "no sellers at all" copy when totalCount is 0 and no filters are active` die Zeile `expect(text).toContain('+ Neu');` ersetzen durch:
  ```ts
      expect(text).toContain('+-Button');
      expect(text).not.toContain('+ Neu');
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL `shows the "no sellers at all" copy when totalCount is 0 and no filters are active`
- [ ] **Schritt 3: Minimal implementieren**
  In `sellers-page.html` den Absatz im Block `@if (noSellersAtAll())` ersetzen durch:
  ```html
      <p>
        Noch keine Verkäufer. Über <strong>Einstellungen → Import</strong> die Voranmeldedaten
        einlesen oder mit dem <strong>+</strong>-Button einen Verkäufer anlegen.
      </p>
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS (alle Tests der Datei)
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "feat(bazaar-app): Leere-Ansicht Verkäuferseite verweist auf +-Button (sellers-toolbar-redesign)"`

### Task 3: Absicherung Filterverhalten und Chips

**ACs:** AC-09, AC-10

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts:201-210` · `describe('status filter')` (neuer `describe` danach)

**Interfaces:**
- Consumes: `SellersPage.onSortChange(sort: string): void` (ruft `SellersStore.setFilters({ sort })`), `SellersPage.onStatusChange`, Chips-Block `div.sellers-page__chips` mit `p-chip` je aktivem Filter; Debounce der Suche und Sofortwirkung von Status sind bereits durch die bestehenden Tests `does not call setFilters on every keystroke, only once after 300ms of silence` und `triggers setFilters immediately, without any debounce delay` abgesichert.
- Produces: keine.

- [ ] **Schritt 1: Absicherungstest schreiben**
  In `sellers-page.spec.ts` nach dem `describe('status filter', ...)` einfügen:
  ```ts
    describe('sort filter', () => {
      it('onSortChange_sortSelected_callsSetFiltersImmediatelyWithoutDebounce', async () => {
        // Arrange
        const { component } = await createPage();
        setFilters.mockClear();

        // Act
        component.onSortChange('acceptedValue');

        // Assert
        expect(setFilters).toHaveBeenCalledWith({ sort: 'acceptedValue' });
      });
    });

    describe('filter chips', () => {
      it('template_noFilterActive_rendersNoChips', async () => {
        // Arrange
        filtersSignal.set({ q: '', status: null, sort: 'name' });

        // Act
        const { fixture } = await createPage();

        // Assert
        const el: HTMLElement = fixture.nativeElement;
        expect(el.querySelector('.sellers-page__chips')).toBeNull();
        expect(el.querySelectorAll('p-chip').length).toBe(0);
      });

      it('template_searchAndStatusActive_rendersRemovableChipsDirectlyBelowToolbar', async () => {
        // Arrange
        filtersSignal.set({ q: 'mei', status: 'open', sort: 'name' });

        // Act
        const { fixture } = await createPage();

        // Assert
        const el: HTMLElement = fixture.nativeElement;
        const toolbar = el.querySelector('p-toolbar.sellers-page__toolbar');
        const chips = el.querySelector('.sellers-page__chips');
        expect(toolbar?.nextElementSibling).toBe(chips);
        expect(chips?.querySelectorAll('p-chip').length).toBe(2);
        expect(chips?.textContent).toContain('Suche: mei');
        expect(chips?.textContent).toContain('Status: Offen');
        expect(chips?.querySelectorAll('.p-chip-remove-icon').length).toBe(2);
      });
    });
  ```
- [ ] **Schritt 2: Absicherungstest laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS `onSortChange_sortSelected_callsSetFiltersImmediatelyWithoutDebounce`, `template_noFilterActive_rendersNoChips`, `template_searchAndStatusActive_rendersRemovableChipsDirectlyBelowToolbar`; rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 3: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "test(bazaar-app): Absicherung Sortierung und Filter-Chips der Verkäuferseite (sellers-toolbar-redesign)"`

## Entscheidungen
- **E · Komponente der Leiste** · Planer — `p-toolbar` (PrimeNG) mit Standard-Projektion statt eigener Flex-Container: `docs/components/filter-panel/component.md` nennt `p-toolbar` für Filterleisten; die Spec lässt die Komponentenwahl dem Plan, und der Rahmen kommt aus den Toolbar-Tokens ohne eigenes Rahmen-CSS.
- **E · Screenreader-Name der Auswahlfelder** · Planer — Der Name kommt über den Input `ariaLabel` von `p-select` (setzt `aria-label` auf das innere `combobox`-Element); das bisherige Host-Attribut `aria-label` erreicht das fokussierbare Element nicht, AC-08 wäre damit nicht erfüllt.
- **E · Hinweistext der Leere-Ansicht** · Planer — „mit **+ Neu** einen Verkäufer anlegen" verwies auf einen Button, den es nicht mehr gibt; der Text nennt jetzt den „+"-Button (Task 2). Das ist keine Änderung des AC-Ergebnisses, nur die Folge der Umbenennung des Buttons.
- **E · Layout-ACs: Regeln getestet, Pixel per Sichtprüfung** · Planer — AC-05, AC-07 und AC-11 (Füllen, Mindestbreite 150 px mit Wachsen, Umbruch) sind in Task 1 automatisch über Struktur und Regeln getestet: `template_pageOpened_marksSearchAndBothSelectsWithLayoutClasses` prüft die Klassen an Suchfeld und beiden Auswahlfeldern, `styles_pageOpened_searchGrowsSelectsKeepMinWidthAndToolbarWraps` prüft per `getComputedStyle` `flex-wrap: wrap` an der Leiste, `flex-grow: 1` am Suchfeld sowie `min-width: 150px`, `flex-grow: 0` und `flex-shrink: 0` an beiden Auswahlfeldern. Nur die berechneten Pixelbreiten rechnet jsdom nicht aus; dafür bleibt die Sichtprüfung im Dev-Server als Ergänzung.
- **E · Chips-Test über PrimeNG-Klasse** · Planer — `.p-chip-remove-icon` ist die Klasse des Entfernen-Symbols im installierten `primeng/chip` (nachgesehen); sie belegt „entfernbar" im DOM.
- **W · Planungs-Skills** · Aussage — Es gelten dv-angular (Hauptskill), dv-angular:angular-testing-vitest-conventions, primeng, dv-angular:angular-styling und dv-angular:angular-component.
- **R1 · Entscheidungen** — geändert — Die Layout-ACs AC-05, AC-07 und AC-11 haben jetzt automatisierte Tests in Task 1: ein Struktur-Test für die Klassen `sellers-page__search`/`sellers-page__select` und ein Style-Test per `getComputedStyle` (Muster aus `numpad.spec.ts`) für Mindestbreite 150 px, Nicht-Schrumpfen, Füllen und Umbruch. Die Flex-Werte in `sellers-page.scss` stehen dafür als Einzel-Eigenschaften; der Entscheidungseintrag zu den Layout-ACs ist entsprechend umformuliert, die Sichtprüfung bleibt als Ergänzung für Pixelbreiten.
- **R1 · Global Constraints** — geändert — `flex-wrap: wrap` steht jetzt ausdrücklich in der Regel `&__toolbar`, und der Style-Test `styles_pageOpened_searchGrowsSelectsKeepMinWidthAndToolbarWraps` belegt den Umbruch für AC-11 automatisch; der Constraint nennt Regel und Test, die Sichtprüfung ist nur noch Ergänzung.
- **R1 · Task 1** — geändert — Die `Modify`-/`Test`-Zeilen nennen nach `·` nur noch je eine wörtlich und eindeutig vorkommende Zeichenfolge (`<p-button label="+ Neu" (onClick)="onNewClick()" />`, `import { SelectModule } from 'primeng/select';`, `&__filter-row {`, `describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)'`); die Erläuterungen stehen in einem Absatz darunter. Zeilenbereiche an den Code angeglichen (Template 3–38, `sellers-page.ts` 22–102).
