# Filterleiste der Markenseite als gerahmte Leiste — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-brands-toolbar-redesign/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Seite „Marken" der Haupt-App bekommt eine gerahmte Filterleiste (Anlegen-Button nur für Admins, Freitextsuche über den Namen, Auswahlfeld „Original"), und der Button „+ Neu" in der Titelzeile entfällt.
**Architektur:** Der Filterzustand (`searchTerm`, `originalFilter`) liegt als Signals in `BrandsPage`; `rows` filtert die vom `BrandsStore` gelieferte Liste clientseitig und sortiert danach nach der Spaltenkopf-Wahl, es gibt keine neue Server-Abfrage. Die Leiste ist reines Template plus Komponenten-SCSS (`flex-wrap`), der Leer-Hinweis der Tabelle kommt als berechnetes `emptyText`.
**Tech-Stack:** Angular 22 (standalone, Signals, OnPush), PrimeNG 22.1 (`p-button`, `p-iconfield`, `p-select`, `pTooltip`), Vitest über `@angular/build:unit-test`, SCSS.
**Spec:** docs/forge/2026-10-12-brands-toolbar-redesign/spec.md
**Basis:** 47275aa

## Global Constraints
- Umgesetzt wird nur die Seite „Marken" der Haupt-App; Voranmelde-App und andere Listenseiten (auch „Kategorien") bleiben unverändert (Spec Soll-Vorgaben).
- Zur Leiste gehören nur Suchfeld, Auswahlfeld „Original" und der Anlegen-Button; weitere Schaltflächen gehören nicht dazu (Spec).
- Der Anlegen-Button steht nur für Admins in der Leiste (`RoleService.isAdmin()`); wer Marken anlegen darf, ändert sich nicht (Spec).
- Suche und Auswahlfeld wirken auf die vorhandene Liste, keine neue Abfrage an den Server (Spec).
- Texte wörtlich: Hinweis des Buttons „Neue Marke"; Suchplatzhalter „Suche nach Name …"; Auswahlfeld-Platzhalter „Alle"; Screenreader-Name des Auswahlfelds „Original"; Werte „✓ Original" und „Neu"; Hinweis bei Filter ohne Treffer „Keine Marken gefunden."; Hinweis bei leerer Liste „Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen." (Spec).
- Auswahlfeld mindestens 150 px breit, wird bei längerem Text breiter; keine sichtbaren Labels; keine Filter-Chips; Leiste bricht bei schmalen Fenstern um, keine waagerechte Bildlaufleiste (Spec).
- Anordnung der Leiste: Anlegen-Button links, Freitextsuche füllt den Platz zwischen Button (bzw. linkem Rand) und Auswahlfeld, Auswahlfeld rechts; die Verkäuferseite ist nur Vorbild, bei Abweichungen gilt die Spec (Spec Soll-Vorgaben).
- Suche: nur der Name, Teiltreffer ohne Beachtung von Groß-/Kleinschreibung, wirkt ohne Verzögerung (kein Debounce); Suche und Auswahlfeld müssen beide zutreffen; die Sortierung über die Spaltenköpfe bleibt erhalten (Spec).
- Projekt (CLAUDE.md, `docs/components/overview.md`): nur PrimeNG-Komponenten, kein natives `<button>`/`<select>` im Template; Code, Routen und JSON-Contract englisch, Doku deutsch.
- Tests, Build und Lint ausschließlich über `dv-angular-test|build|lint --root <R>/src/bazaar-app/frontend` im Bash-Tool, nie `ng test` oder `npm test` (dv-angular:toolchain).
- dv-angular:angular-component: Standalone-Komponenten ohne `standalone: true`, `ChangeDetectionStrategy.OnPush`, native Control-Flow-Syntax (`@if`), kein `ngClass`/`ngStyle`, Signals statt Decorator-Inputs, `host`-Objekt statt `@HostBinding`.
- dv-angular:angular-testing-vitest-conventions: Vitest-Spies (`vi.fn()`), kein Jasmine/Jest, keine zusätzlichen Mock-Libs; AAA mit Kommentaren `// Arrange` / `// Act` / `// Assert`; Namen neuer Tests `<methode>_<Situation>_<Ergebnis>`; bestehende Testnamen bleiben; jede injizierte Abhängigkeit wird in Arrange gestubbt.
- primeng:primeng-component-implementation: nur Inputs verwenden, die die installierte PrimeNG-Version 22.1.x tatsächlich hat (`p-button` `icon`/`ariaLabel`, `p-select` `options`/`optionLabel`/`optionValue`/`showClear`/`placeholder`/`ariaLabel`); Verhalten von Angular-Bindings und Formularen bleibt wie im Bestand (`ngModel`/`ngModelChange`).

---

### Task 1: Filterzustand, gefilterte Zeilen und Leer-Hinweis in `BrandsPage`

**ACs:** AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.ts:22-95` · `BrandsPage.rows`, `BrandsPage.emptyText`, Konstanten oberhalb der Klasse
- Modify: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.html:13` · `[emptyText]="emptyText"`
- Test: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.spec.ts:66-71` · `it('passes the exact emptyText through', () => {`

**Interfaces:**
- Consumes: `BrandsStore.brands: WritableSignal<Brand[]>` (bestehend, mit `Brand { id: string; name: string; original: boolean; articleCount: number }`), `SortEvent { field: string; order: 'asc' | 'desc' }` aus `shared/components/table/table.ts` (bestehend)
- Produces:
  - `export type OriginalFilter = 'original' | 'new'` in `brands-page.ts`
  - `BrandsPage.originalOptions: { label: string; value: OriginalFilter }[]` (`[{ label: '✓ Original', value: 'original' }, { label: 'Neu', value: 'new' }]`)
  - `BrandsPage.searchTerm: WritableSignal<string>` (Start `''`)
  - `BrandsPage.originalFilter: WritableSignal<OriginalFilter | null>` (Start `null`)
  - `BrandsPage.onSearchChange(value: string | null): void`
  - `BrandsPage.onOriginalChange(value: OriginalFilter | null | undefined): void`
  - `BrandsPage.emptyText: Signal<string>` (ersetzt das bisherige Feld `emptyText: string`)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `brands-page.spec.ts` den bestehenden Test auf den Signal-Zugriff umstellen (Anker `it('passes the exact emptyText through')`):
  ```ts
  it('passes the exact emptyText through', () => {
    const { component } = createPage();
    expect(component.emptyText()).toBe(
      'Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
    );
  });
  ```
  Direkt nach diesem Test (vor `describe('role-based visibility'`) diesen Block einfügen:
  ```ts
  describe('filter', () => {
    const nike = brand({ id: 'b1', name: 'Nike', original: true, articleCount: 5 });
    const adidas = brand({ id: 'b2', name: 'Adidas', original: false, articleCount: 2 });
    const nikita = brand({ id: 'b3', name: 'Nikita', original: false, articleCount: 9 });

    function namesOf(component: BrandsPage): string[] {
      return component.rows().map((row) => row.name);
    }

    it('rows_noFilterSet_showsAllBrands', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      const names = namesOf(component);

      // Assert
      expect(names).toEqual(['Nike', 'Adidas']);
    });

    it('rows_searchTermInUpperCase_showsOnlyBrandsContainingItIgnoringCase', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onSearchChange('NI');

      // Assert
      expect(namesOf(component)).toEqual(['Nike']);
    });

    it('rows_searchTermIsPartOfName_matchesInTheMiddleOfTheName', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onSearchChange('did');

      // Assert
      expect(namesOf(component)).toEqual(['Adidas']);
    });

    it('rows_originalFilterNew_showsOnlyNewBrands', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onOriginalChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Adidas']);
    });

    it('rows_originalFilterOriginal_showsOnlyOriginalBrands', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onOriginalChange('original');

      // Assert
      expect(namesOf(component)).toEqual(['Nike']);
    });

    it('onOriginalChange_valueCleared_showsBrandsOfBothKindsAgain', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();
      component.onOriginalChange('new');

      // Act
      component.onOriginalChange(null);

      // Assert
      expect(component.originalFilter()).toBeNull();
      expect(namesOf(component)).toEqual(['Nike', 'Adidas']);
    });

    it('rows_searchTermAndOriginalFilterSet_showsOnlyBrandsMatchingBoth', () => {
      // Arrange
      brandsSignal.set([nike, adidas, nikita]);
      const { component } = createPage();

      // Act
      component.onSearchChange('ni');
      component.onOriginalChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Nikita']);
    });

    it('rows_filterChangedAfterSortChosen_keepsChosenSort', () => {
      // Arrange
      brandsSignal.set([nike, adidas, nikita]);
      const { component } = createPage();
      component.onSortChange([{ field: 'articleCount', order: 'desc' }]);

      // Act
      component.onSearchChange('ni');

      // Assert
      expect(namesOf(component)).toEqual(['Nikita', 'Nike']);
    });

    it('emptyText_brandsExistButFilterMatchesNone_isNotFoundHint', () => {
      // Arrange
      brandsSignal.set([nike, adidas]);
      const { component } = createPage();

      // Act
      component.onSearchChange('zzz');

      // Assert
      expect(component.rows()).toEqual([]);
      expect(component.emptyText()).toBe('Keine Marken gefunden.');
    });

    it('emptyText_noBrandsAndNoFilter_isEmptyListHint', () => {
      // Arrange
      brandsSignal.set([]);
      const { component } = createPage();

      // Act
      const text = component.emptyText();

      // Assert
      expect(text).toBe(
        'Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
      );
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/brands/pages/brands-page/brands-page.spec.ts` — erwartet: FAIL der Datei (Build-Fehler: `onSearchChange`, `onOriginalChange` und `emptyText()` existieren nicht), also schlagen `rows_noFilterSet_showsAllBrands`, `rows_searchTermInUpperCase_showsOnlyBrandsContainingItIgnoringCase` und die übrigen neuen Tests des Blocks `filter` fehl.
- [ ] **Schritt 3: Minimal implementieren**
  In `brands-page.ts` den Konstanten-Block (Anker `const EMPTY_TEXT`) ergänzen:
  ```ts
  const EMPTY_TEXT =
    'Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen.';
  const NOT_FOUND_TEXT = 'Keine Marken gefunden.';

  export type OriginalFilter = 'original' | 'new';
  ```
  In der Klasse `BrandsPage` das Feld `readonly emptyText = EMPTY_TEXT;` ersetzen durch:
  ```ts
  readonly searchTerm = signal('');
  readonly originalFilter = signal<OriginalFilter | null>(null);
  readonly originalOptions: { label: string; value: OriginalFilter }[] = [
    { label: '✓ Original', value: 'original' },
    { label: 'Neu', value: 'new' },
  ];

  readonly emptyText = computed(() =>
    this.brandsStore.brands().length > 0 ? NOT_FOUND_TEXT : EMPTY_TEXT,
  );
  ```
  Das Computed `rows` (Anker `readonly rows = computed<BrandRow[]>`) ersetzen durch:
  ```ts
  readonly rows = computed<BrandRow[]>(() => {
    const term = this.searchTerm().toLocaleLowerCase();
    const originalFilter = this.originalFilter();
    const rows = this.brandsStore
      .brands()
      .filter(
        (brand) =>
          brand.name.toLocaleLowerCase().includes(term) &&
          (originalFilter === null || brand.original === (originalFilter === 'original')),
      )
      .map(
        (brand): BrandRow => ({
          ...brand,
          originalLabel: brand.original ? '✓ Original' : 'Neu',
        }),
      );
    const sort = this.sortState();
    return sort.length === 0 ? rows : [...rows].sort((a, b) => this.compareBySort(a, b, sort));
  });
  ```
  Direkt vor `onSortChange` (Anker `onSortChange(sort: SortEvent[]): void`) die beiden Handler einfügen:
  ```ts
  onSearchChange(value: string | null): void {
    this.searchTerm.set(value ?? '');
  }

  onOriginalChange(value: OriginalFilter | null | undefined): void {
    this.originalFilter.set(value ?? null);
  }
  ```
  In `brands-page.html` das Binding `[emptyText]="emptyText"` ersetzen durch:
  ```html
      [emptyText]="emptyText()"
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/brands/pages/brands-page/brands-page.spec.ts` — erwartet: PASS (alle Tests der Datei, auch die bestehenden Header-Tests).
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.ts src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.html src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.spec.ts` · `git commit -m "feat(bazaar-app): Markenseite filtert Zeilen nach Name und Original (brands-toolbar-redesign)"`

### Task 2: Gerahmte Filterleiste im Template, „+ Neu" aus der Titelzeile entfernt

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-17, AC-18

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.scss`
- Modify: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.html:1-17` · `<app-page title="Marken">`
- Modify: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.ts:33-39` · `@Component`-Metadaten (`imports`, `styleUrl`)
- Test: `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.spec.ts:216-242` · `describe('page header')`

**Interfaces:**
- Consumes: `BrandsPage.searchTerm`, `BrandsPage.originalFilter`, `BrandsPage.originalOptions`, `BrandsPage.onSearchChange(value: string | null): void`, `BrandsPage.onOriginalChange(value: OriginalFilter | null | undefined): void`, `BrandsPage.rows`, `BrandsPage.emptyText()`, `BrandsPage.canAdd`, `BrandsPage.onRowAdd()` (alle bestehend oder aus Task 1)
- Produces: CSS-Klassen `.brands-page`, `.brands-page__toolbar`, `.brands-page__add`, `.brands-page__search`, `.brands-page__original` (nur in diesem Template und SCSS genutzt)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `brands-page.spec.ts` die Importzeilen anpassen (Anker oberste Importe):
  ```ts
  import { ComponentFixture, TestBed } from '@angular/core/testing';
  import { signal } from '@angular/core';
  import { By } from '@angular/platform-browser';
  import { HttpErrorResponse } from '@angular/common/http';
  import { MessageService } from 'primeng/api';
  import { Select } from 'primeng/select';
  ```
  Den gesamten Block `describe('page header', () => { ... });` (drei Tests mit dem Button „+ Neu" in `.page__actions`) ersetzen durch:
  ```ts
  describe('filter toolbar', () => {
    function toolbarOf(fixture: ComponentFixture<BrandsPage>): HTMLElement {
      return fixture.nativeElement.querySelector('.brands-page__toolbar') as HTMLElement;
    }

    function selectOf(fixture: ComponentFixture<BrandsPage>): Select {
      return fixture.debugElement.query(By.directive(Select)).componentInstance as Select;
    }

    it('render_pageOpened_showsSingleToolbarAboveTableAndNoHeaderButton', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelectorAll('.brands-page__toolbar').length).toBe(1);
      expect(toolbarOf(fixture).nextElementSibling?.tagName).toBe('APP-TABLE');
      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Marken');
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(el.querySelector('.app-table__toolbar')).toBeNull();
      expect(el.querySelector('p-chip')).toBeNull();
    });

    it('render_admin_showsPlusIconButtonWithoutTextAsFirstToolbarElement', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const addButton = toolbar.firstElementChild as HTMLElement;

      // Assert
      expect(toolbar.querySelectorAll('p-button').length).toBe(1);
      expect(addButton.matches('p-button.brands-page__add')).toBe(true);
      expect(addButton.querySelector('button')?.textContent?.trim()).toBe('');
      expect(addButton.querySelector('.pi-plus')).not.toBeNull();
    });

    it('render_admin_plusButtonHasHintNeueMarke', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const addButton = toolbarOf(fixture).querySelector('p-button.brands-page__add') as HTMLElement;

      // Assert
      expect(addButton.querySelector('button')?.getAttribute('aria-label')).toBe('Neue Marke');
      expect(addButton.getAttribute('pTooltip')).toBe('Neue Marke');
    });

    it('plusButtonClick_admin_opensCreatePopup', () => {
      // Arrange
      isAdminSignal.set(true);
      const { fixture, component } = createPage();

      // Act
      (
        toolbarOf(fixture).querySelector('p-button.brands-page__add button') as HTMLButtonElement
      ).click();
      fixture.detectChanges();

      // Assert
      expect(component.popupVisible()).toBe(true);
      expect(component.popupMode()).toBe('create');
    });

    it('render_nonAdmin_hasNoCreateButtonAndSearchStartsAtLeftEdge', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(toolbarOf(fixture).querySelector('p-button')).toBeNull();
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(toolbarOf(fixture).firstElementChild?.tagName).toBe('P-ICONFIELD');
    });

    it('render_always_searchFieldFillsRemainingSpaceWithPlaceholder', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const search = toolbarOf(fixture).querySelector('.brands-page__search') as HTMLElement;
      const input = search.querySelector('input') as HTMLInputElement;

      // Assert
      expect(input.getAttribute('placeholder')).toBe('Suche nach Name …');
      expect(getComputedStyle(search).flexGrow).toBe('1');
      expect(getComputedStyle(search).minWidth).toBe('0px');
    });

    it('render_always_selectIsLastToolbarElementWithMinWidth150AndNoShrink', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const select = toolbar.lastElementChild as HTMLElement;

      // Assert
      expect(toolbar.querySelectorAll('p-select').length).toBe(1);
      expect(select.matches('p-select.brands-page__original')).toBe(true);
      expect(getComputedStyle(select).minWidth).toBe('150px');
      expect(getComputedStyle(select).flexShrink).toBe('0');
    });

    it('render_always_hasNoVisibleLabelAndSelectHasScreenReaderName', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();

      // Assert
      expect(toolbarOf(fixture).querySelectorAll('label').length).toBe(0);
      expect(selectOf(fixture).ariaLabel()).toBe('Original');
    });

    it('render_noValueChosen_selectShowsAllPlaceholderAndOffersBothValues', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const select = selectOf(fixture);

      // Assert
      expect(select.placeholder()).toBe('Alle');
      expect(select.showClear()).toBe(true);
      expect(select.options()).toEqual([
        { label: '✓ Original', value: 'original' },
        { label: 'Neu', value: 'new' },
      ]);
    });

    it('optionSelect_neuChosen_tableShowsOnlyNewBrands', () => {
      // Arrange
      brandsSignal.set([
        brand({ id: 'b1', name: 'Nike', original: true }),
        brand({ id: 'b2', name: 'Adidas', original: false }),
      ]);
      const { fixture, component } = createPage();

      // Act
      selectOf(fixture).onOptionSelect(new Event('click'), { label: 'Neu', value: 'new' });

      // Assert
      expect(component.originalFilter()).toBe('new');
      expect(component.rows().map((row) => row.name)).toEqual(['Adidas']);
    });

    it('clear_valueChosen_resetsFilterAndShowsBrandsOfBothKinds', () => {
      // Arrange
      brandsSignal.set([
        brand({ id: 'b1', name: 'Nike', original: true }),
        brand({ id: 'b2', name: 'Adidas', original: false }),
      ]);
      const { fixture, component } = createPage();
      selectOf(fixture).onOptionSelect(new Event('click'), { label: 'Neu', value: 'new' });

      // Act
      selectOf(fixture).clear(new Event('click'));

      // Assert
      expect(component.originalFilter()).toBeNull();
      expect(component.rows().map((row) => row.name)).toEqual(['Nike', 'Adidas']);
    });

    it('typing_niInSearchField_tableShowsOnlyNikeImmediately', () => {
      // Arrange
      brandsSignal.set([
        brand({ id: 'b1', name: 'Nike' }),
        brand({ id: 'b2', name: 'Adidas' }),
      ]);
      const { fixture, component } = createPage();
      const input = toolbarOf(fixture).querySelector('.brands-page__search input') as HTMLInputElement;

      // Act
      input.value = 'NI';
      input.dispatchEvent(new Event('input'));

      // Assert
      expect(component.searchTerm()).toBe('NI');
      expect(component.rows().map((row) => row.name)).toEqual(['Nike']);
    });

    it('render_always_toolbarWrapsOntoFurtherLinesInNarrowWindows', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);

      // Assert
      expect(getComputedStyle(toolbar).display).toBe('flex');
      expect(getComputedStyle(toolbar).flexWrap).toBe('wrap');
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/brands/pages/brands-page/brands-page.spec.ts` — erwartet: FAIL für alle 13 Tests des Blocks `filter toolbar` (u. a. `render_pageOpened_showsSingleToolbarAboveTableAndNoHeaderButton`, `render_admin_plusButtonHasHintNeueMarke`, `render_always_toolbarWrapsOntoFurtherLinesInNarrowWindows`), weil `.brands-page__toolbar` im Template fehlt; die übrigen Tests der Datei bleiben PASS.
- [ ] **Schritt 3: Minimal implementieren**
  `brands-page.html` komplett ersetzen:
  ```html
  <app-page title="Marken">
    <div class="brands-page">
      <div class="brands-page__toolbar">
        @if (canAdd()) {
          <p-button
            class="brands-page__add"
            icon="pi pi-plus"
            ariaLabel="Neue Marke"
            pTooltip="Neue Marke"
            (onClick)="onRowAdd()"
          />
        }

        <p-iconfield class="brands-page__search">
          <p-inputicon class="pi pi-search" />
          <input
            pInputText
            type="text"
            placeholder="Suche nach Name …"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
          />
        </p-iconfield>

        <p-select
          class="brands-page__original"
          [options]="originalOptions"
          optionLabel="label"
          optionValue="value"
          [ngModel]="originalFilter()"
          (ngModelChange)="onOriginalChange($event)"
          [showClear]="true"
          placeholder="Alle"
          ariaLabel="Original"
        />
      </div>

      <app-table
        [columns]="columns"
        [data]="rows()"
        [loading]="loading()"
        [actionColumn]="actionColumn()"
        [emptyText]="emptyText()"
        (sortChange)="onSortChange($event)"
        (actionClick)="onActionClick($event)"
      />
    </div>
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
  `brands-page.scss` neu anlegen:
  ```scss
  .brands-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &__toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--p-content-border-color);
      border-radius: var(--p-content-border-radius);
    }

    &__search {
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 14rem;
      min-width: 0;

      input {
        width: 100%;
      }
    }

    &__original {
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: auto;
      min-width: 150px;
    }
  }
  ```
  In `brands-page.ts` die Importe ergänzen (neben den bestehenden `ButtonModule`-Import):
  ```ts
  import { FormsModule } from '@angular/forms';
  import { IconFieldModule } from 'primeng/iconfield';
  import { InputIconModule } from 'primeng/inputicon';
  import { InputTextModule } from 'primeng/inputtext';
  import { SelectModule } from 'primeng/select';
  import { TooltipModule } from 'primeng/tooltip';
  ```
  und die `@Component`-Metadaten (Anker `@Component({ selector: 'app-brands-page'`) ersetzen durch:
  ```ts
  @Component({
    selector: 'app-brands-page',
    imports: [
      Table,
      MasterDataPopup,
      Page,
      ButtonModule,
      FormsModule,
      IconFieldModule,
      InputIconModule,
      InputTextModule,
      SelectModule,
      TooltipModule,
    ],
    templateUrl: './brands-page.html',
    styleUrl: './brands-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/brands/pages/brands-page/brands-page.spec.ts` — erwartet: PASS (alle Tests der Datei).
- [ ] **Schritt 5: Build und Lint prüfen**
  Befehle: `dv-angular-build --root <R>/src/bazaar-app/frontend` und `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: je OK ohne Fehler.
- [ ] **Schritt 6: Commit**
  `git add src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.html src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.scss src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.ts src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.spec.ts` · `git commit -m "feat(bazaar-app): Markenseite mit gerahmter Filterleiste (brands-toolbar-redesign)"`

## Entscheidungen
- **W · Planungs-Skills** · Aussage — Die Skill-Regeln von dv-angular:angular-component, dv-angular:angular-testing-vitest-conventions und primeng:primeng-component-implementation gelten als Global Constraints.
- **E · Filterzustand in der Seite** · Planer — `searchTerm` und `originalFilter` sind Signals in `BrandsPage`, gefiltert wird im bestehenden Computed `rows` vor der Sortierung; das passt zur Spec („keine neue Abfrage", Sortierung bleibt) und zum Bestand, in dem die Seite schon die Sortierung hält.
- **E · Auswahlwerte als Strings** · Planer — `'original'`/`'new'` statt `true`/`false`, damit `p-select` den Wert „Neu" nicht mit „kein Wert" verwechselt und das Löschen-Kreuz sauber `null` liefert.
- **E · Leer-Hinweis** · Planer — `emptyText` wird ein Computed: `Keine Marken gefunden.`, sobald Marken existieren (die Zeilenliste kann dann nur durch die Filter leer sein), sonst der bisherige Hinweis. `Table.hasActiveFilter` bleibt ungesetzt, damit die Tabelle ihren eigenen Filtertext nicht vorzieht.
- **E · Hinweis des Plus-Buttons** · Planer — Hinweis per `pTooltip="Neue Marke"` (wie die Aktionsbuttons der Tabelle) und `ariaLabel="Neue Marke"` für Screenreader.
- **E · Breitenverhalten per SCSS** · Planer — Suchfeld `flex-grow: 1` mit `min-width: 0`, Auswahlfeld `min-width: 150px` und `flex-shrink: 0`, Leiste `flex-wrap: wrap`; Tests prüfen diese Werte über `getComputedStyle`, wie im bestehenden `numpad.spec.ts`.
- **E · Dokumentation** · Planer — Keine Änderung an `docs/`: die Spec fordert keine Doku-Anpassung.
- **R1 · Global Constraints** — geändert — Neuer Punkt zur Anordnung der Leiste (Button links, Suche füllt den Platz bis zum Auswahlfeld, Auswahlfeld rechts) und zum Vorrang der Spec vor der Verkäuferseite, wie in den Spec-Soll-Vorgaben.
- **R1 · Task 1** — geändert — Anker der Vorlage auf die wörtliche Zeichenfolge `[emptyText]="emptyText"` mit Zeile 13 korrigiert, Anker des Tests auf `it('passes the exact emptyText through', () => {` (Zeile 66 im Code geprüft).
