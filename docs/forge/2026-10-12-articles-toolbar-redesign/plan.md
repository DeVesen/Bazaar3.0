# Filterleiste der Artikelseite als gerahmte Leiste — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation <plan.md>`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Filterleiste der Seite „Artikel" der Haupt-App wird eine einzige gerahmte Leiste mit Freitextsuche (füllt den Restplatz) und rechts Marke, Kategorie, Status.
**Architektur:** Die zwei losen Zeilen (`__filter-row`, `__filter-grid`) in `articles-page.html` werden durch ein PrimeNG `<p-toolbar>` ersetzt: Suchfeld im `#center`-Template, die drei `p-select` im `#end`-Template, kein `#start`. Die Breitenregeln (Suche füllt, Auswahlfelder min. 200 px und wachsend, Umbruch) stehen in `articles-page.scss`; Logik, Store und Filter-Handler in `articles-page.ts` bleiben unverändert.
**Tech-Stack:** Angular (standalone, Signals), PrimeNG 22.1.1 (`primeng/toolbar`, `primeng/select`), SCSS, Vitest (`@angular/build:unit-test`)
**Spec:** docs/forge/2026-10-12-articles-toolbar-redesign/spec.md
**Basis:** 310b692

## Global Constraints
- Umgesetzt wird nur die Seite „Artikel" der Haupt-App (`src/bazaar-app/frontend`); Voranmelde-App und andere Listenseiten bleiben unverändert (Spec, Soll-Vorgabe 1).
- Mindestbreite der Auswahlfelder: `200px`, nur für diese Filterleiste; das 150-px-Muster der Verkäufer-Spec bleibt unberührt (Spec, Soll-Vorgabe 2).
- Zur Leiste gehören nur das Suchfeld und die drei Auswahlfelder; kein Anlegen-Button, keine weiteren Schaltflächen, kein Element links vor dem Suchfeld (Spec, Soll-Vorgabe 3).
- Keine sichtbaren Labels; Auswahlfelder tragen für Screenreader die Namen „Marke", „Kategorie", „Status" (Spec, Soll-Vorgabe 4, AC-06).
- Platzhalter („Suche nach Nr., Bezeichnung …", „Alle"), Löschen-Kreuz und Wirkung auf die Tabelle bleiben unverändert (Spec, Soll-Vorgabe 5).
- Keine Filter-Chips auf der Artikelseite (Spec, AC-10).
- Reihenfolge rechts: Marke, Kategorie, Status.
- Umbruch bei schmalem Fenster ohne waagerechte Bildlaufleiste (Spec, AC-11); belegt durch den Style-Test `styles_narrowWindow_toolbarWrapsWithoutHorizontalOverflow` (Regeln `flex-wrap: wrap` an Leiste und `.p-toolbar-end`, `max-width: 100%` an Bereich und Auswahlfeldern), die Sichtprüfung ist Ergänzung.
- Rahmen und Abstände der Leiste folgen dem Muster der Verkäuferseite (Spec, Soll-Vorgabe 6): wie im Verkäufer-Plan (`docs/forge/2026-10-12-sellers-toolbar-redesign/plan.md`, Entscheidung „Komponente der Leiste") kommen Rahmen, Innenabstand, Eckenradius und Hintergrund ausschließlich aus den `p-toolbar`-Tokens, ohne eigenes Rahmen-, Padding- oder Hintergrund-CSS; der Abstand zwischen den Auswahlfeldern ist `0.75rem` wie `gap` der bisherigen Verkäufer-Filterzeile (`sellers-page.scss`, `&__filter-row`). Abgleich mit der Verkäufer-Filterleiste in der Sichtprüfung (Schritt 6).
- Begriff „Filterleiste" (CSS-Klasse `articles-page__filterbar`); „Toolbar" nur als PrimeNG-Komponentenname `p-toolbar` (Spec, W · Begriff; CONTEXT.md).
- Projekt-CLAUDE.md: nur PrimeNG als UI-Bibliothek, Code/Routen englisch, Doku deutsch.
- primeng: Code nur nach der v22-Referenz (`.claude/skills/primeng/references/components/toolbar/api.md`); Templates `#start`/`#center`/`#end` per `<ng-template #name>`, Import `ToolbarModule` aus `primeng/toolbar`.
- angular-styling: Emulated Encapsulation; Regeln auf Kind-Elemente von PrimeNG-Komponenten nur über `::ng-deep`, verankert an einer eigenen Klasse (Projekt-Konvention, siehe `checkout-page.scss`).
- angular-testing-vitest-conventions: Vitest (`vi.fn`, `describe/it`), AAA-Kommentare `// Arrange` / `// Act` / `// Assert`, Namensschema `<methode>_<Situation>_<Erwartung>` für neue `it`, Act → `await fixture.whenStable()` → Assert; bestehende Tests nicht umbenennen.

---

### Task 1: Artikel-Filterleiste als p-toolbar

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.html:3-47` · `<div class="articles-page__filter-row">`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.scss:1-25` · `.articles-page {`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.ts:107-141` · `import { SelectModule } from 'primeng/select';`
- Test: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.spec.ts:1-228` · `describe('brand/category/status filters'`

Zu ändern sind im Template beide Filterzeilen (Zeilen 3–47, von `<div class="articles-page__filter-row">` bis zum schließenden `</div>` von `articles-page__filter-grid`), in `articles-page.ts` die PrimeNG-Importzeile, das `imports`-Array von `@Component` (bei `SelectModule,`) und die Zeilen 107–111 des Klassen-Doc-Kommentars (ab `Round-15 review fix) — replaces the Round-7 placeholder. Filter panel is the Haupt-App`), im Test die Importzeilen oben, ein neuer `describe('Filterleiste')` direkt vor dem genannten `describe` und ein neuer Test an dessen Ende.

**Interfaces:**
- Consumes: `ArticlesPage.onQInputChange(value: string): void`, `onBrandChange(brand: string | null): void`, `onCategoryChange(category: string | null): void`, `onStatusChange(status: string | null): void`, `ArticlesPage.brandOptions()`, `categoryOptions()`, `statusOptions` (alle unverändert, bestehend); Store-Mock `setFilters`, `filtersSignal` im bestehenden Spec.
- Produces: DOM-Struktur `p-toolbar.articles-page__filterbar` > `.p-toolbar-center` (Suchfeld, `p-iconfield.articles-page__search`) und `.p-toolbar-end` (drei `p-select.articles-page__select`); keine neue TypeScript-API.

- [ ] **Schritt 1: Fehlschlagende Struktur-, Style- und Verdrahtungs-Tests schreiben**
  In `articles-page.spec.ts` direkt unter `import { signal } from '@angular/core';` zwei Imports ergänzen:
  ```ts
  import { NgModel } from '@angular/forms';
  import { By } from '@angular/platform-browser';
  ```
  Dann direkt vor `describe('brand/category/status filters', () => {` einfügen (die `styles_*`-Tests lesen die Komponenten-Styles über `getComputedStyle` wie `numpad.spec.ts`; jsdom wertet Selektoren samt Spezifität aus, berechnet aber keine Pixelbreiten, deshalb stehen die Flex-Werte in `articles-page.scss` als Einzel-Eigenschaften `flex-grow`/`flex-shrink`/`flex-basis`):
  ```ts
  describe('Filterleiste', () => {
    function filterbar(fixture: { nativeElement: HTMLElement }): HTMLElement | null {
      return (fixture.nativeElement as HTMLElement).querySelector('p-toolbar.articles-page__filterbar');
    }

    it('render_pageOpened_putsSearchAndThreeSelectsInOneToolbarAboveTable', async () => {
      // Arrange
      const { fixture } = await createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Act
      const bar = filterbar(fixture);

      // Assert
      expect(bar).not.toBeNull();
      expect(el.querySelectorAll('p-toolbar')).toHaveLength(1);
      expect(bar!.querySelector('input[pInputText], input.p-inputtext')).not.toBeNull();
      expect(bar!.querySelectorAll('p-select')).toHaveLength(3);
      expect(el.querySelectorAll('p-select')).toHaveLength(3);
      const table = el.querySelector('app-table')!;
      expect(
        bar!.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(el.querySelector('.articles-page__filter-row, .articles-page__filter-grid')).toBeNull();
    });

    it('render_pageOpened_hasNoElementBeforeSearchField', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const children = Array.from(bar.children);

      // Assert
      expect(children[0].classList.contains('p-toolbar-center')).toBe(true);
      expect(bar.querySelector('.p-toolbar-start')).toBeNull();
      expect(bar.querySelector('button')).toBeNull();
      expect(
        children[0].querySelector('input')?.getAttribute('placeholder'),
      ).toBe('Suche nach Nr., Bezeichnung …');
    });

    it('render_pageOpened_putsSelectsOnTheRightInOrderBrandCategoryStatus', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const names = Array.from(bar.querySelectorAll('.p-toolbar-end p-select')).map((s) =>
        s.getAttribute('aria-label'),
      );

      // Assert
      expect(names).toEqual(['Marke', 'Kategorie', 'Status']);
      expect(bar.querySelectorAll('.p-toolbar-center p-select')).toHaveLength(0);
    });

    it('render_pageOpened_hasNoVisibleLabelsAndShowsAllePlaceholderInEverySelect', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const labels = Array.from(bar.querySelectorAll('p-select .p-select-label')).map((l) =>
        l.textContent?.trim(),
      );

      // Assert
      expect(bar.querySelector('label')).toBeNull();
      expect(labels).toEqual(['Alle', 'Alle', 'Alle']);
    });

    it('render_filterActive_showsNoFilterChips', async () => {
      // Arrange
      filtersSignal.set({ q: 'x', brand: 'Playmobil', category: 'Kleidung', status: 'sold', sort: 'number:asc' });
      const { fixture } = await createPage();

      // Act
      const chips = (fixture.nativeElement as HTMLElement).querySelectorAll('p-chip');

      // Assert
      expect(chips).toHaveLength(0);
    });

    it('styles_pageOpened_searchAreaFillsRemainingWidth', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const center = getComputedStyle(bar.querySelector<HTMLElement>('.p-toolbar-center')!);
      const search = getComputedStyle(
        bar.querySelector<HTMLElement>('.p-toolbar-center p-iconfield.articles-page__search')!,
      );
      const input = getComputedStyle(bar.querySelector<HTMLElement>('.p-toolbar-center input')!);

      // Assert
      expect(center.flexGrow).toBe('1');
      expect(center.flexShrink).toBe('1');
      expect(center.flexBasis).toBe('16rem');
      expect(center.minWidth).toBe('16rem');
      expect(search.display).toBe('block');
      expect(search.width).toBe('100%');
      expect(input.width).toBe('100%');
    });

    it('styles_pageOpened_selectsHaveMinWidth200AndGrowWithSelectedText', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const selects = Array.from(bar.querySelectorAll<HTMLElement>('.p-toolbar-end p-select'));

      // Assert
      expect(selects).toHaveLength(3);
      for (const select of selects) {
        expect(select.classList).toContain('articles-page__select');
        const style = getComputedStyle(select);
        expect(style.minWidth).toBe('200px');
        expect(style.flexGrow).toBe('0');
        expect(style.flexShrink).toBe('0');
        expect(style.flexBasis).toBe('auto');
        const label = getComputedStyle(select.querySelector<HTMLElement>('.p-select-label')!);
        expect(label.width).toBe('auto');
        expect(label.overflow).toBe('visible');
        expect(label.textOverflow).toBe('clip');
      }
    });

    it('styles_narrowWindow_toolbarWrapsWithoutHorizontalOverflow', async () => {
      // Arrange
      const { fixture } = await createPage();
      const bar = filterbar(fixture)!;

      // Act
      const toolbar = getComputedStyle(bar);
      const end = getComputedStyle(bar.querySelector<HTMLElement>('.p-toolbar-end')!);
      const selects = Array.from(bar.querySelectorAll<HTMLElement>('.p-toolbar-end p-select')).map(
        (s) => getComputedStyle(s),
      );

      // Assert
      expect(toolbar.flexWrap).toBe('wrap');
      expect(end.flexWrap).toBe('wrap');
      expect(end.maxWidth).toBe('100%');
      expect(selects).toHaveLength(3);
      for (const select of selects) {
        expect(select.maxWidth).toBe('100%');
      }
    });

    it('onBrandChange_selectsInToolbarEmitChange_callSetFiltersImmediately', async () => {
      // Arrange
      const { fixture } = await createPage();
      const selects = fixture.debugElement.queryAll(
        By.css('p-toolbar.articles-page__filterbar .p-toolbar-end p-select'),
      );
      setFilters.mockClear();

      // Act
      selects[0].injector.get(NgModel).viewToModelUpdate('Playmobil');
      selects[1].injector.get(NgModel).viewToModelUpdate('Kleidung');
      selects[2].injector.get(NgModel).viewToModelUpdate('sold');

      // Assert
      expect(selects).toHaveLength(3);
      expect(setFilters).toHaveBeenCalledTimes(3);
      expect(setFilters).toHaveBeenNthCalledWith(1, { brand: 'Playmobil' });
      expect(setFilters).toHaveBeenNthCalledWith(2, { category: 'Kleidung' });
      expect(setFilters).toHaveBeenNthCalledWith(3, { status: 'sold' });
    });

    describe('Suche mit Tipppause', () => {
      beforeEach(() => {
        vi.useFakeTimers();
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('onQInputChange_typingInToolbarSearch_callsSetFiltersOnlyAfterPause', async () => {
        // Arrange
        const { fixture } = await createPage();
        const input = filterbar(fixture)!.querySelector<HTMLInputElement>('.p-toolbar-center input')!;
        setFilters.mockClear();

        // Act
        input.value = 'sch';
        input.dispatchEvent(new Event('input'));
        await vi.advanceTimersByTimeAsync(100);
        await fixture.whenStable();
        const callsBeforePause = setFilters.mock.calls.length;
        await vi.advanceTimersByTimeAsync(300);
        await fixture.whenStable();

        // Assert
        expect(callsBeforePause).toBe(0);
        expect(setFilters).toHaveBeenCalledTimes(1);
        expect(setFilters).toHaveBeenCalledWith({ q: 'sch' });
      });
    });
  });

  ```
  `onBrandChange_selectsInToolbarEmitChange_callSetFiltersImmediately` löst `ngModelChange` über die `NgModel`-Instanz am jeweiligen `p-select` aus (`viewToModelUpdate` sendet `ngModelChange`) und belegt damit die Verdrahtung des neuen Templates; `onQInputChange_typingInToolbarSearch_callsSetFiltersOnlyAfterPause` tippt über das `input`-Ereignis in das Suchfeld der Leiste (300 ms Tipppause wie im bestehenden `describe('free-text filter debounce')`).
  Absicherung (Verhalten bleibt wie bisher, AC-08/AC-09): im bestehenden `describe('brand/category/status filters')` den neuen Test am Ende des `describe` ergänzen:
  ```ts
    it('onBrandChange_clearIconEmitsNull_callsSetFiltersWithNullForEachSelect', async () => {
      // Arrange
      const { component } = await createPage();
      setFilters.mockClear();

      // Act
      component.onBrandChange(null);
      component.onCategoryChange(null);
      component.onStatusChange(null);

      // Assert
      expect(setFilters).toHaveBeenCalledWith({ brand: null });
      expect(setFilters).toHaveBeenCalledWith({ category: null });
      expect(setFilters).toHaveBeenCalledWith({ status: null });
    });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/articles/pages/articles-page/articles-page.spec.ts` — erwartet: FAIL `render_pageOpened_putsSearchAndThreeSelectsInOneToolbarAboveTable`, `render_pageOpened_hasNoElementBeforeSearchField`, `render_pageOpened_putsSelectsOnTheRightInOrderBrandCategoryStatus`, `styles_pageOpened_searchAreaFillsRemainingWidth`, `styles_pageOpened_selectsHaveMinWidth200AndGrowWithSelectedText`, `styles_narrowWindow_toolbarWrapsWithoutHorizontalOverflow`, `onBrandChange_selectsInToolbarEmitChange_callSetFiltersImmediately`, `onQInputChange_typingInToolbarSearch_callsSetFiltersOnlyAfterPause` (jeweils, weil `p-toolbar.articles-page__filterbar` fehlt); die Tests `render_pageOpened_hasNoVisibleLabelsAndShowsAllePlaceholderInEverySelect`, `render_filterActive_showsNoFilterChips` und `onBrandChange_clearIconEmitsNull_callsSetFiltersWithNullForEachSelect` sind Absicherungstests und laufen schon grün (rot ist dort ein Befund).
- [ ] **Schritt 3: Minimal implementieren**
  a) `articles-page.html`: Zeilen 3–47 (von `<div class="articles-page__filter-row">` bis zum schließenden `</div>` von `articles-page__filter-grid`) ersetzen durch:
  ```html
    <p-toolbar class="articles-page__filterbar">
      <ng-template #center>
        <p-iconfield class="articles-page__search">
          <p-inputicon class="pi pi-search" />
          <input
            pInputText
            type="text"
            placeholder="Suche nach Nr., Bezeichnung …"
            [ngModel]="qInput()"
            (ngModelChange)="onQInputChange($event)"
          />
        </p-iconfield>
      </ng-template>
      <ng-template #end>
        <p-select
          class="articles-page__select"
          [options]="brandOptions()"
          optionLabel="label"
          optionValue="value"
          [ngModel]="filters().brand"
          (ngModelChange)="onBrandChange($event)"
          [showClear]="true"
          placeholder="Alle"
          aria-label="Marke"
        />
        <p-select
          class="articles-page__select"
          [options]="categoryOptions()"
          optionLabel="label"
          optionValue="value"
          [ngModel]="filters().category"
          (ngModelChange)="onCategoryChange($event)"
          [showClear]="true"
          placeholder="Alle"
          aria-label="Kategorie"
        />
        <p-select
          class="articles-page__select"
          [options]="statusOptions"
          optionLabel="label"
          optionValue="value"
          [ngModel]="filters().status"
          (ngModelChange)="onStatusChange($event)"
          [showClear]="true"
          placeholder="Alle"
          aria-label="Status"
        />
      </ng-template>
    </p-toolbar>
  ```
  b) `articles-page.ts`: Import ergänzen direkt nach `import { SelectModule } from 'primeng/select';`:
  ```ts
  import { ToolbarModule } from 'primeng/toolbar';
  ```
  und im `imports`-Array von `@Component` nach `SelectModule,` die Zeile `ToolbarModule,` einfügen. Im Klassen-Doc-Kommentar die Zeilen 107–111, heute
  ```
   * Round-15 review fix) — replaces the Round-7 placeholder. Filter panel is the Haupt-App
   * "Sonderfall zweizeilig" (two-row) layout: row 1 is a full-width free-text search (debounced,
   * no sort-select/"+ Neu" — sort here comes from clicking column headers, and spec.md is explicit
   * there's no create action on this page), row 2 is a 3-column Brand/Category/Status filter grid
   * (immediate, no debounce). The table itself is `<app-table [lazy]="true">` (Round-15 Task 6 also
  ```
  vollständig ersetzen durch diese fünf Zeilen (Zeile 106 davor und Zeile 112 danach bleiben unverändert):
  ```
   * Round-15 review fix) — replaces the Round-7 placeholder. Filterleiste is one framed
   * `p-toolbar` above the table: the free-text search (debounced, no sort-select/create button —
   * sort here comes from clicking column headers, and spec.md is explicit there's no create action
   * on this page) fills the remaining width, the Brand/Category/Status selects sit on the right
   * (immediate, no debounce). The table itself is `<app-table [lazy]="true">` (Round-15 Task 6 also
  ```
  c) `articles-page.scss` komplett ersetzen durch:
  ```scss
  .articles-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    // Rahmen, Innenabstand und Hintergrund kommen wie auf der Verkäuferseite nur aus den
    // p-toolbar-Tokens. Umbruch bei schmalem Fenster steht ausdrücklich an der Leiste.
    &__filterbar {
      flex-wrap: wrap;
    }

    // Suchfeld füllt den Restplatz. `.p-toolbar-*` sind Elemente innerhalb von p-toolbar, daher
    // `::ng-deep` (Konvention wie checkout-page.scss), verankert an der eigenen Klasse.
    // Einzel-Eigenschaften statt `flex`-Kurzform, damit der Style-Test sie lesen kann.
    &__filterbar ::ng-deep .p-toolbar-center {
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 16rem;
      min-width: 16rem;
    }

    &__filterbar ::ng-deep .p-toolbar-end {
      flex-wrap: wrap;
      gap: 0.75rem;
      max-width: 100%;
    }

    &__search {
      display: block;
      width: 100%;

      input {
        width: 100%;
      }
    }

    // Mindestbreite 200px, wächst mit dem gewählten Text: PrimeNG setzt `.p-select-label` auf
    // `width: 1%` + `overflow: hidden`, wodurch ein auto-breites Select auf min-width kollabiert.
    // `flex-shrink: 0`, damit das Feld nicht unter die Breite seines Textes schrumpft.
    &__select {
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: auto;
      min-width: 200px;
      max-width: 100%;
    }

    &__select ::ng-deep .p-select-label {
      width: auto;
      overflow: visible;
      text-overflow: clip;
    }
  }
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/articles/pages/articles-page/articles-page.spec.ts` — erwartet: PASS (alle Tests der Datei, vorher 36, jetzt 47).
- [ ] **Schritt 5: Lint und Build prüfen**
  Befehle: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK; `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK (SCSS und Template übersetzen).
- [ ] **Schritt 6: Ergänzende Sichtprüfung der berechneten Pixel-Layouts (AC-03, AC-05, AC-11, Rahmen und Abstände; Regeln sind in Schritt 1 automatisch getestet)**
  Dev-Server starten: `preview_start` mit `{"name": "bazaar-app-frontend"}`, Seite „Artikel" öffnen und prüfen — erwartet: (a) Leiste gerahmt, Suchfeld füllt den Platz vom linken Rand bis zu den drei Auswahlfeldern; (b) jedes Auswahlfeld ≥ 200 px, bei gewählter Marke mit langem Namen breiter und ohne Kürzung; (c) Seite „Verkäufer" öffnen: Rahmen, Innenabstand, Eckenradius und Hintergrund der Leiste stimmen mit der Artikel-Leiste überein; (d) `resize_window` mit `{"preset": "mobile"}`: Leiste bricht um, keine waagerechte Bildlaufleiste, alle Felder erreichbar; danach `resize_window` mit `{"preset": "desktop"}`. Weicht (a), (b) oder (d) ab, SCSS aus Schritt 3c anpassen und Schritt 4 wiederholen; weicht (c) ab, weil die Verkäuferseite noch die alte Filterzeile zeigt (Verkäufer-Plan nicht umgesetzt), steht das im Bericht des Tasks als „nicht abgeglichen", kein Code wird dafür geändert. Lässt sich die Seite nicht öffnen (Anmeldung/Backend nötig), steht das im Bericht als „nicht geprüft".
- [ ] **Schritt 7: Commit**
  `git add src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.html src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.scss src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.ts src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.spec.ts` · `git commit -m "feat(bazaar-app): Filterleiste Artikelseite als gerahmte Leiste (articles-toolbar-redesign)"`

## Entscheidungen
- **W · Rahmen-Quelle** · Aussage — Der Mensch erlaubte, die Verkäufer-Spec als Quelle für Rahmen, Abstände und Umbruch zu lesen; sie nennt aber keine Zahlenwerte und überlässt die Komponentenwahl dem Plan.
- **W · Planungs-Skills** · Aussage — Es gelten `primeng`, `dv-angular:angular-testing-vitest-conventions` und `dv-angular:angular-styling`.
- **E · Komponente** · Planer — `p-toolbar` (PrimeNG) statt eigenem Rahmen-`div`: liefert Rahmen, Abstand, Hintergrund und Umbruch (`flex-wrap`) aus den Design-Tokens und passt zur PrimeNG-Grundregel; Rahmen und Abstände sind damit die PrimeNG-Standardwerte (`--p-toolbar-*`).
- **E · Slots** · Planer — Suchfeld im `#center`-, Selects im `#end`-Template, `#start` entfällt (AC-02); `justify-content: space-between` des Toolbars plus `flex: 1 1 16rem` am Center füllt den Restplatz.
- **E · Auswahlfeld-Breite** · Planer — `min-width: 200px` am `p-select`-Host und `width: auto` am `.p-select-label`, weil PrimeNG das Label sonst auf `width: 1%` hält und das Feld nicht mit dem Text wächst.
- **E · Mindestbreite Suche** · Planer — `16rem` Mindestbreite des Suchbereichs als Umbruchschwelle (wie die frühere Suchzeile der Verkäuferseite); nicht in der Spec festgelegt.
- **E · Tests** · Planer — jsdom berechnet kein Layout; AC-03/05/11 werden deshalb über DOM-Struktur und die per `getComputedStyle` gelesenen Style-Regeln (Schritt 1, `styles_*`-Tests) belegt, nicht über Pixelwerte; die Sichtprüfung (Schritt 6) ergänzt das.
- **R1 · AC-11** — geändert — Neuer Test `styles_narrowWindow_toolbarWrapsWithoutHorizontalOverflow` liest per `getComputedStyle` `flex-wrap: wrap` an Leiste und `.p-toolbar-end` sowie `max-width: 100%` an `.p-toolbar-end` und den drei Auswahlfeldern; dafür steht `flex-wrap: wrap` jetzt ausdrücklich in der Regel `&__filterbar`. Erreichbarkeit aller Elemente folgt aus Umbruch ohne Überlauf; Sichtprüfung (d) mit `resize_window` bleibt Ergänzung. Global Constraints nennen den Test.
- **R1 · AC-03** — geändert — Neuer Test `styles_pageOpened_searchAreaFillsRemainingWidth` prüft `flex-grow: 1`, `flex-shrink: 1`, `flex-basis: 16rem`, `min-width: 16rem` am Center-Bereich sowie `display: block`/`width: 100%` am `p-iconfield` und `width: 100%` am Eingabefeld; der Platzhalter ist weiter über `render_pageOpened_hasNoElementBeforeSearchField` abgedeckt. Das SCSS nutzt dafür Einzel-Eigenschaften statt `flex`-Kurzform und setzt `width: 100%` auch am `input`.
- **R1 · AC-05** — geändert — Neuer Test `styles_pageOpened_selectsHaveMinWidth200AndGrowWithSelectedText` prüft für alle drei `p-select` die Klasse `articles-page__select`, `min-width: 200px`, `flex-grow: 0`, `flex-shrink: 0`, `flex-basis: auto` und am `.p-select-label` `width: auto`, `overflow: visible`, `text-overflow: clip`. Festlegung: `flex-shrink: 0` am Auswahlfeld, damit es nicht unter die Breite seines Textes schrumpft (wie Verkäufer-Plan).
- **R1 · AC-09** — geändert — Zwei neue Tests lösen die Änderungen über das neue Template aus: `onBrandChange_selectsInToolbarEmitChange_callSetFiltersImmediately` sendet `ngModelChange` über die `NgModel`-Instanz jedes `p-select` in `.p-toolbar-end` und erwartet sofort `setFilters` mit Marke, Kategorie, Status; `onQInputChange_typingInToolbarSearch_callsSetFiltersOnlyAfterPause` tippt per `input`-Ereignis mit Fake-Timern und erwartet nach 100 ms keinen, nach weiteren 300 ms genau einen Aufruf. Imports `NgModel` und `By` ergänzt, Testzahl 42 → 47.
- **R1 · Global Constraints** — geändert — Neue Zeile: Rahmen und Abstände folgen der Verkäuferseite; Festlegung wie im Verkäufer-Plan (Entscheidung „Komponente der Leiste"): Rahmen, Innenabstand, Eckenradius und Hintergrund nur aus den `p-toolbar`-Tokens ohne eigenes CSS, Abstand zwischen den Auswahlfeldern `0.75rem` wie `gap` der bisherigen Verkäufer-Filterzeile. Sichtprüfung (c) gleicht mit der Verkäufer-Leiste ab; E · Komponente bleibt gültig, weil auch die Verkäuferseite die Standardwerte nutzt.
- **R1 · Task 1** — geändert — Anker korrigiert auf wörtlich vorkommende Zeichenfolgen (`import { SelectModule } from 'primeng/select';`, `describe('brand/category/status filters'`, `<div class="articles-page__filter-row">`, `.articles-page {`), Erläuterungen in einem Absatz darunter. Der Doc-Kommentar-Ersatz gibt jetzt die Zeilen 107–111 alt und neu vollständig vor (kein doppeltes ` * `). Schritt 6 nennt `preview_start` mit `{"name": "bazaar-app-frontend"}` (`.claude/launch.json`) und `resize_window`-Presets; `dv-angular-test|lint|build` bleiben wie in den Schwester-Plänen.
