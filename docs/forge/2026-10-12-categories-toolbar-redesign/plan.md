# Filterleiste der Kategorienseite als gerahmte Leiste — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-categories-toolbar-redesign/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Kategorienseite der Haupt-App erhält eine einzige gerahmte Filterleiste (Anlegen-Button nur für Admins, Namenssuche, Auswahlfeld „Original"), die die geladene Liste clientseitig filtert; der Button „+ Neu" in der Titelzeile entfällt.
**Architektur:** `CategoriesPage` hält Suchbegriff und Original-Filter als Signals und filtert/sortiert die Zeilen im `rows`-Computed; es gibt keine neue Server-Abfrage. Die Leiste ist ein PrimeNG `p-toolbar` (liefert Rahmen, `flex-wrap`) mit `p-button`, `p-iconfield`+`pInputText` und `p-select`, direkt über der unveränderten `app-table`.
**Tech-Stack:** Angular 22 (Signals, OnPush, standalone), PrimeNG 22, Vitest über `@angular/build:unit-test`
**Spec:** docs/forge/2026-10-12-categories-toolbar-redesign/spec.md
**Basis:** dc337a3

## Global Constraints
- Umgesetzt wird nur die Seite „Kategorien" der Haupt-App (`src/bazaar-app/frontend`); Voranmelde-App und andere Listenseiten, auch „Marken", bleiben unverändert. (Spec Soll-Vorgaben)
- Zur Leiste gehören nur Suchfeld, Auswahlfeld „Original" und der Anlegen-Button; keine weiteren Schaltflächen, keine Filter-Chips. (Spec Soll-Vorgaben, AC-17)
- Layout: Anlegen-Button links, Freitextsuche füllt den Platz bis zum Auswahlfeld, Auswahlfeld rechts; keine sichtbaren Labels; Auswahlfeld Mindestbreite 150 px. (Spec Soll-Vorgaben, AC-06, AC-07, AC-08)
- Texte wörtlich: Hinweis/Tooltip „Neue Kategorie"; Platzhalter Suche „Suche nach Name …"; Platzhalter Auswahlfeld „Alle"; Screenreader-Name „Original"; Werte „✓ Original" und „Neu"; leeres Ergebnis „Keine Kategorien gefunden."; leere Liste „Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen."
- Der Anlegen-Button steht nur für Admins (`RoleService.isAdmin()`), die Berechtigung ändert sich nicht. (Spec Soll-Vorgaben, AC-05)
- Suche und Auswahlfeld wirken auf die vorhandene Liste, keine neue Abfrage an den Server; die Suche wirkt sofort (kein Debounce), Teiltreffer ohne Groß-/Kleinschreibung, nur über den Namen; Suche und Auswahlfeld müssen beide zutreffen; die Spaltenkopf-Sortierung bleibt erhalten. (Spec Soll-Vorgaben, AC-12 bis AC-14)
- Die Leiste bricht bei schmalem Fenster um, keine waagerechte Bildlaufleiste, alle Elemente bleiben erreichbar. (AC-18) Belegt durch den Style-Test `toolbar_narrowWindow_wrapsOntoFurtherLinesWithoutHorizontalOverflow` (Regeln `display: flex`, `flex-wrap: wrap`, `max-width: 100%` an der Leiste, `max-width: 100%` am Auswahlfeld); die Sichtprüfung in Task 2 ergänzt das.
- Haupt-App-Konvention (CLAUDE.md): Code, Routen, JSON-Contract englisch, Doku deutsch; nur PrimeNG-Komponenten, kein natives HTML für UI-Elemente; Standalone-Komponenten mit `ChangeDetectionStrategy.OnPush`.
- Style-Überschreibungen an PrimeNG-Innenelementen per `::ng-deep` in der Komponenten-SCSS, wie im Bestand (`checkout-page.scss`).
- dv-angular:angular-testing-vitest-conventions: Vitest (`vi.fn`, kein Jasmine/Jest); neue `it` heißen `<methode>_<Ausgangssituation>_<Erwartung>` mit `// Arrange`/`// Act`/`// Assert`; bestehende Tests behalten ihre Namen; keine zusätzlichen Mock-Libs; Specs liegen neben der Quelle.
- Testbefehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include <spec-pfad>` (Bash-Tool). Lint: `dv-angular-lint --root <R>/src/bazaar-app/frontend`; Build: `dv-angular-build --root <R>/src/bazaar-app/frontend`.

---

### Task 1: Filter- und Sortierlogik der Kategorienseite

**ACs:** AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.ts` · `CategoriesPage` (`rows`, `emptyText`, neue Signals und Handler)
- Modify: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.html` · `[emptyText]="emptyText"`
- Test: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.spec.ts` · `it('passes the exact emptyText through'`

**Interfaces:**
- Consumes: `CategoriesStore.categories: WritableSignal<Category[]>` (bestehend), `SortEvent { field: string; order: 'asc' | 'desc' }` aus `shared/components/table/table` (bestehend).
- Produces (in `categories-page.ts`):
  - `export type OriginalFilterValue = 'original' | 'new';`
  - `readonly originalOptions: { label: string; value: OriginalFilterValue }[]` = `[{ label: '✓ Original', value: 'original' }, { label: 'Neu', value: 'new' }]`
  - `readonly searchTerm: WritableSignal<string>` (Start `''`)
  - `readonly originalFilter: WritableSignal<OriginalFilterValue | null>` (Start `null`)
  - `onSearchChange(value: string | null): void`
  - `onOriginalFilterChange(value: OriginalFilterValue | null): void`
  - `readonly emptyText: Signal<string>` (ersetzt die bisherige Konstante-Property `emptyText: string`)
  - `readonly rows: Signal<CategoryRow[]>` (bestehend, jetzt gefiltert und dann sortiert)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `categories-page.spec.ts` den bestehenden Test `passes the exact emptyText through` ändern: `component.emptyText` wird `component.emptyText()`:
  ```ts
  it('passes the exact emptyText through', () => {
    const { component } = createPage();
    expect(component.emptyText()).toBe(
      'Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
    );
  });
  ```
  Direkt hinter diesem Test (vor `it('marks every column as not filterable ...`) diesen Block einfügen:
  ```ts
  describe('Filter', () => {
    function namesOf(component: CategoriesPage): string[] {
      return component.rows().map((row) => row.name);
    }

    it('rows_noFilterSet_showsAllCategories', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Jacken' }),
      ]);
      const { component } = createPage();

      // Act
      const names = namesOf(component);

      // Assert
      expect(names).toEqual(['Hosen', 'Jacken']);
    });

    it('rows_searchTermHoUppercase_showsOnlyHosen', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Jacken' }),
      ]);
      const { component } = createPage();

      // Act
      component.onSearchChange('HO');

      // Assert
      expect(namesOf(component)).toEqual(['Hosen']);
    });

    it('rows_searchTermClearedToNull_showsAllCategoriesAgain', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Jacken' }),
      ]);
      const { component } = createPage();
      component.onSearchChange('HO');

      // Act
      component.onSearchChange(null);

      // Assert
      expect(namesOf(component)).toEqual(['Hosen', 'Jacken']);
    });

    it('rows_originalFilterNew_showsOnlyNewCategories', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();

      // Act
      component.onOriginalFilterChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Jacken']);
    });

    it('rows_originalFilterOriginal_showsOnlyOriginalCategories', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();

      // Act
      component.onOriginalFilterChange('original');

      // Assert
      expect(namesOf(component)).toEqual(['Hosen']);
    });

    it('rows_originalFilterClearedToNull_showsBothKinds', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();
      component.onOriginalFilterChange('new');

      // Act
      component.onOriginalFilterChange(null);

      // Assert
      expect(namesOf(component)).toEqual(['Hosen', 'Jacken']);
    });

    it('rows_searchTermAndOriginalFilterSet_showsOnlyCategoriesMatchingBoth', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen', original: true }),
        category({ id: 'c2', name: 'Hosentaschen', original: false }),
        category({ id: 'c3', name: 'Jacken', original: false }),
      ]);
      const { component } = createPage();

      // Act
      component.onSearchChange('hose');
      component.onOriginalFilterChange('new');

      // Assert
      expect(namesOf(component)).toEqual(['Hosentaschen']);
    });

    it('rows_filterChangedWhileSortActive_keepsChosenSortOrder', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Hemden' }),
        category({ id: 'c3', name: 'Jacken' }),
      ]);
      const { component } = createPage();
      component.onSortChange([{ field: 'name', order: 'desc' }]);

      // Act
      component.onSearchChange('h');

      // Assert
      expect(namesOf(component)).toEqual(['Hosen', 'Hemden']);
    });

    it('emptyText_filterMatchesNothingButCategoriesExist_isNoResultsText', () => {
      // Arrange
      categoriesSignal.set([category({ id: 'c1', name: 'Hosen' })]);
      const { component } = createPage();

      // Act
      component.onSearchChange('xyz');

      // Assert
      expect(component.rows()).toEqual([]);
      expect(component.emptyText()).toBe('Keine Kategorien gefunden.');
    });

    it('emptyText_originalFilterMatchesNothingButCategoriesExist_isNoResultsText', () => {
      // Arrange
      categoriesSignal.set([category({ id: 'c1', name: 'Hosen', original: false })]);
      const { component } = createPage();

      // Act
      component.onOriginalFilterChange('original');

      // Assert
      expect(component.emptyText()).toBe('Keine Kategorien gefunden.');
    });

    it('emptyText_noCategoriesAndNoFilter_isEmptyListText', () => {
      // Arrange
      categoriesSignal.set([]);
      const { component } = createPage();

      // Act
      const text = component.emptyText();

      // Assert
      expect(text).toBe(
        'Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen.',
      );
    });
  });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/categories/pages/categories-page/categories-page.spec.ts` — erwartet: FAIL (Test Files 1 failed; `onSearchChange`/`onOriginalFilterChange` existieren nicht, `emptyText` ist kein Signal)
- [ ] **Schritt 3: Minimal implementieren**
  In `categories-page.ts`:

  a) Konstanten ersetzen — den Block
  ```ts
  const EMPTY_TEXT =
    'Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen.';
  ```
  ersetzen durch:
  ```ts
  const EMPTY_TEXT =
    'Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen.';
  const NO_RESULTS_TEXT = 'Keine Kategorien gefunden.';

  export type OriginalFilterValue = 'original' | 'new';
  ```

  b) In der Klasse die Zeile `readonly emptyText = EMPTY_TEXT;` ersetzen durch:
  ```ts
  readonly originalOptions: { label: string; value: OriginalFilterValue }[] = [
    { label: '✓ Original', value: 'original' },
    { label: 'Neu', value: 'new' },
  ];

  readonly searchTerm = signal('');
  readonly originalFilter = signal<OriginalFilterValue | null>(null);

  private readonly filterActive = computed(
    () => this.searchTerm() !== '' || this.originalFilter() !== null,
  );

  readonly emptyText = computed(() =>
    this.filterActive() && this.categoriesStore.categories().length > 0
      ? NO_RESULTS_TEXT
      : EMPTY_TEXT,
  );
  ```

  c) Das Computed `rows` ersetzen durch:
  ```ts
  readonly rows = computed<CategoryRow[]>(() => {
    const term = this.searchTerm().toLowerCase();
    const originalFilter = this.originalFilter();
    const rows = this.categoriesStore
      .categories()
      .filter((category) => category.name.toLowerCase().includes(term))
      .filter(
        (category) => originalFilter === null || category.original === (originalFilter === 'original'),
      )
      .map(
        (category): CategoryRow => ({
          ...category,
          originalLabel: category.original ? '✓ Original' : 'Neu',
        }),
      );
    const sort = this.sortState();
    return sort.length === 0 ? rows : [...rows].sort((a, b) => this.compareBySort(a, b, sort));
  });
  ```

  d) Direkt nach `onSortChange(sort: SortEvent[]): void { ... }` einfügen:
  ```ts
  onSearchChange(value: string | null): void {
    this.searchTerm.set(value ?? '');
  }

  onOriginalFilterChange(value: OriginalFilterValue | null): void {
    this.originalFilter.set(value);
  }
  ```

  In `categories-page.html` die Zeile `[emptyText]="emptyText"` ersetzen durch `[emptyText]="emptyText()"`.
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/categories/pages/categories-page/categories-page.spec.ts` — erwartet: PASS (alle Tests der Datei, inklusive der bisherigen 16)
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.ts src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.html src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.spec.ts` · `git commit -m "feat(bazaar-app): Kategorienseite filtert Liste nach Name und Original (categories-toolbar-redesign)"`

### Task 2: Gerahmte Filterleiste in der Kategorienseite

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-11, AC-17, AC-18

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.html` · gesamtes Template bis `</app-page>`
- Modify: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.ts` · `@Component`-Dekorator (`imports`, `styleUrl`) und Import-Zeilen am Dateikopf
- Create: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.scss`
- Test: `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.spec.ts` · `describe('page header')`

**Interfaces:**
- Consumes (aus Task 1, `categories-page.ts`): `searchTerm: WritableSignal<string>`, `originalFilter: WritableSignal<OriginalFilterValue | null>`, `originalOptions: { label: string; value: OriginalFilterValue }[]`, `onSearchChange(value: string | null): void`, `onOriginalFilterChange(value: OriginalFilterValue | null): void`, `emptyText: Signal<string>`; bestehend: `canAdd: Signal<boolean>`, `onRowAdd(): void`, `popupVisible: WritableSignal<boolean>`.
- Produces: keine neuen Namen für spätere Tasks. CSS-Klassen `categories-page`, `categories-page__toolbar`, `categories-page__search`, `categories-page__original`.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `categories-page.spec.ts` am Dateikopf diese Importe ergänzen:
  ```ts
  import { By } from '@angular/platform-browser';
  import { Select } from 'primeng/select';
  import { Tooltip } from 'primeng/tooltip';
  ```
  Den gesamten Block `describe('page header', () => { ... });` (drei Tests: `shows "Kategorien" as page title and "+ Neu" ...`, `hides "+ Neu" for non-admins`, `opens the create popup from the header "+ Neu" button`) ersetzen durch:
  ```ts
  describe('page header', () => {
    it('pageHeader_adminOpensPage_showsTitleButNoNewButtonInTitleRow', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe('Kategorien');
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(el.querySelector('.page__actions')?.textContent?.trim()).toBe('');
      expect(el.querySelector('.app-table__toolbar')).toBeNull();
    });
  });

  describe('filter toolbar', () => {
    function toolbarOf(fixture: ReturnType<typeof createPage>['fixture']): HTMLElement {
      return fixture.nativeElement.querySelector('p-toolbar') as HTMLElement;
    }

    it('toolbar_pageOpened_isSingleToolbarAboveTheTable', () => {
      // Arrange / Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;
      const toolbar = toolbarOf(fixture);
      const table = el.querySelector('app-table') as HTMLElement;

      // Assert
      expect(el.querySelectorAll('p-toolbar').length).toBe(1);
      expect(toolbar.querySelector('p-select')).not.toBeNull();
      expect(toolbar.querySelector('input[type="text"]')).not.toBeNull();
      expect(toolbar.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('toolbar_adminOpensPage_hasExactlyOneIconOnlyPlusButtonAtLeftEdge', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const buttons = toolbar.querySelectorAll('p-button');

      // Assert
      expect(buttons.length).toBe(1);
      expect(toolbar.firstElementChild?.tagName.toLowerCase()).toBe('p-button');
      expect(buttons[0].querySelector('.pi-plus')).not.toBeNull();
      expect(buttons[0].textContent?.trim()).toBe('');
    });

    it('toolbar_adminOpensPage_plusButtonHasNewCategoryTooltipAndAriaLabel', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const tooltip = fixture.debugElement
        .query(By.directive(Tooltip))
        .injector.get(Tooltip);

      // Assert
      expect(tooltip.content()).toBe('Neue Kategorie');
      expect(
        toolbarOf(fixture).querySelector('p-button button')?.getAttribute('aria-label'),
      ).toBe('Neue Kategorie');
    });

    it('toolbar_adminClicksPlusButton_opensCreatePopup', () => {
      // Arrange
      isAdminSignal.set(true);
      const { fixture, component } = createPage();

      // Act
      (toolbarOf(fixture).querySelector('p-button button') as HTMLButtonElement).click();
      fixture.detectChanges();

      // Assert
      expect(component.popupVisible()).toBe(true);
      expect(component.popupMode()).toBe('create');
    });

    it('toolbar_nonAdminOpensPage_hasNoCreateButtonAndSearchStartsAtLeftEdge', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;
      const toolbar = toolbarOf(fixture);

      // Assert
      expect(toolbar.querySelector('p-button')).toBeNull();
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(toolbar.firstElementChild?.tagName.toLowerCase()).toBe('p-iconfield');
    });

    it('toolbar_pageOpened_searchFieldShowsPlaceholder', () => {
      // Arrange / Act
      const { fixture } = createPage();
      const input = toolbarOf(fixture).querySelector('input[type="text"]') as HTMLInputElement;

      // Assert
      expect(input.getAttribute('placeholder')).toBe('Suche nach Name …');
    });

    it('toolbar_pageOpened_selectIsLastItemWithAllPlaceholderClearIconAndOriginalName', () => {
      // Arrange / Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const select = fixture.debugElement.query(By.directive(Select)).componentInstance as Select;

      // Assert
      expect(toolbar.querySelectorAll('p-select').length).toBe(1);
      expect(toolbar.lastElementChild?.tagName.toLowerCase()).toBe('p-select');
      expect(select.placeholder()).toBe('Alle');
      expect(select.showClear()).toBe(true);
      expect(toolbar.querySelector('p-select [aria-label="Original"]')).not.toBeNull();
    });

    it('toolbar_pageOpened_hasNoVisibleLabels', () => {
      // Arrange / Act
      const { fixture } = createPage();

      // Assert
      expect(toolbarOf(fixture).querySelector('label')).toBeNull();
    });

    it('toolbar_pageOpened_selectOffersOriginalAndNewValues', () => {
      // Arrange / Act
      const { fixture, component } = createPage();
      const select = fixture.debugElement.query(By.directive(Select)).componentInstance as Select;

      // Assert
      expect(component.originalOptions.map((option) => option.label)).toEqual(['✓ Original', 'Neu']);
      expect(select.options()).toEqual(component.originalOptions);
    });

    it('toolbar_userTypesIntoSearchField_filtersRowsImmediately', () => {
      // Arrange
      categoriesSignal.set([
        category({ id: 'c1', name: 'Hosen' }),
        category({ id: 'c2', name: 'Jacken' }),
      ]);
      const { fixture, component } = createPage();
      const input = toolbarOf(fixture).querySelector('input[type="text"]') as HTMLInputElement;

      // Act
      input.value = 'HO';
      input.dispatchEvent(new Event('input'));

      // Assert
      expect(component.searchTerm()).toBe('HO');
      expect(component.rows().map((row) => row.name)).toEqual(['Hosen']);
    });

    it('toolbar_activeFilter_showsNoFilterChips', () => {
      // Arrange
      const { fixture, component } = createPage();

      // Act
      component.onSearchChange('Spiel');
      component.onOriginalFilterChange('new');
      fixture.detectChanges();

      // Assert
      expect(fixture.nativeElement.querySelector('p-chip')).toBeNull();
    });

    it('toolbar_pageOpened_searchFieldGrowsIntoRemainingSpace', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const search = toolbarOf(fixture).querySelector('p-iconfield') as HTMLElement;
      const style = getComputedStyle(search);

      // Assert
      expect(search.classList.contains('categories-page__search')).toBe(true);
      expect(style.flexGrow).toBe('1');
      expect(style.flexShrink).toBe('1');
    });

    it('toolbar_pageOpened_selectKeepsMinWidth150AndDoesNotShrink', () => {
      // Arrange / Act
      const { fixture } = createPage();
      const select = toolbarOf(fixture).querySelector('p-select') as HTMLElement;
      const style = getComputedStyle(select);

      // Assert
      expect(select.classList.contains('categories-page__original')).toBe(true);
      expect(style.minWidth).toBe('150px');
      expect(style.flexGrow).toBe('0');
      expect(style.flexShrink).toBe('0');
    });

    it('toolbar_narrowWindow_wrapsOntoFurtherLinesWithoutHorizontalOverflow', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const toolbarStyle = getComputedStyle(toolbar);
      const selectStyle = getComputedStyle(toolbar.querySelector('p-select') as HTMLElement);

      // Assert
      expect(toolbar.classList.contains('categories-page__toolbar')).toBe(true);
      expect(toolbarStyle.display).toBe('flex');
      expect(toolbarStyle.flexWrap).toBe('wrap');
      expect(toolbarStyle.maxWidth).toBe('100%');
      expect(selectStyle.maxWidth).toBe('100%');
    });
  });
  ```
  Die drei Style-Tests lesen die Komponenten-Styles über `getComputedStyle` wie bereits `numpad.spec.ts` (`expect(getComputedStyle(grid).margin).toBe('16px 0px')`): jsdom wertet die eingebundenen Komponenten-Styles samt Selektoren aus, berechnet aber keine Pixelbreiten. Deshalb stehen die Flex-Werte in `categories-page.scss` als Einzel-Eigenschaften (`flex-grow`, `flex-shrink`, `flex-basis`) statt als Kurzform, und `display: flex`/`flex-wrap: wrap` stehen ausdrücklich in der eigenen Regel `&__toolbar`, statt sich auf das PrimeNG-Theme zu verlassen.
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/categories/pages/categories-page/categories-page.spec.ts` — erwartet: FAIL `toolbar_pageOpened_isSingleToolbarAboveTheTable` und die übrigen `toolbar_*`-Tests sowie `pageHeader_adminOpensPage_showsTitleButNoNewButtonInTitleRow` (noch kein `p-toolbar`, „+ Neu" steht noch in `.page__actions`)
- [ ] **Schritt 3: Minimal implementieren**
  a) `categories-page.ts`: am Dateikopf nach `import { HttpErrorResponse } from '@angular/common/http';` einfügen:
  ```ts
  import { FormsModule } from '@angular/forms';
  ```
  und nach `import { ButtonModule } from 'primeng/button';` einfügen:
  ```ts
  import { IconFieldModule } from 'primeng/iconfield';
  import { InputIconModule } from 'primeng/inputicon';
  import { InputTextModule } from 'primeng/inputtext';
  import { SelectModule } from 'primeng/select';
  import { ToolbarModule } from 'primeng/toolbar';
  import { TooltipModule } from 'primeng/tooltip';
  ```
  Den `@Component`-Dekorator ersetzen durch:
  ```ts
  @Component({
    selector: 'app-categories-page',
    imports: [
      FormsModule,
      Table,
      MasterDataPopup,
      Page,
      ButtonModule,
      IconFieldModule,
      InputIconModule,
      InputTextModule,
      SelectModule,
      ToolbarModule,
      TooltipModule,
    ],
    templateUrl: './categories-page.html',
    styleUrl: './categories-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  ```

  b) `categories-page.scss` neu anlegen:
  ```scss
  .categories-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 0;

    // `p-toolbar` bringt Rahmen und Innenabstand mit. Umbruch ausdrücklich hier gesetzt:
    // bei schmalem Fenster brechen die Elemente auf weitere Zeilen um, die Leiste wird
    // nie breiter als die Seite, also keine waagerechte Bildlaufleiste (AC-18).
    &__toolbar {
      display: flex;
      flex-wrap: wrap;
      min-width: 0;
      max-width: 100%;
    }

    // Füllt den Platz zwischen Anlegen-Button (bzw. linkem Rand) und Auswahlfeld (AC-06);
    // 16rem ist die Umbruchschwelle, `min-width: 0` lässt das Feld unter seine Inhaltsbreite schrumpfen.
    &__search {
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 16rem;
      min-width: 0;
    }

    // Mindestbreite 150 px; das Label kürzt nicht, sondern vergrößert das Feld (AC-07).
    // `max-width: 100%` hält das Feld auf eigener Zeile innerhalb der Leiste (AC-18).
    // `.p-select-label` ist ein Innenelement von PrimeNG, daher `::ng-deep`.
    &__original {
      flex-grow: 0;
      flex-shrink: 0;
      flex-basis: auto;
      min-width: 150px;
      max-width: 100%;

      ::ng-deep .p-select-label {
        width: auto;
        overflow: visible;
        text-overflow: clip;
      }
    }
  }
  ```

  c) `categories-page.html` den Block von `<app-page title="Kategorien">` bis `</app-page>` ersetzen durch:
  ```html
  <app-page title="Kategorien">
    <div class="categories-page">
      <p-toolbar class="categories-page__toolbar">
        @if (canAdd()) {
          <p-button
            icon="pi pi-plus"
            pTooltip="Neue Kategorie"
            ariaLabel="Neue Kategorie"
            (onClick)="onRowAdd()"
          />
        }

        <p-iconfield class="categories-page__search">
          <p-inputicon class="pi pi-search" />
          <input
            pInputText
            type="text"
            placeholder="Suche nach Name …"
            aria-label="Suche nach Name"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
          />
        </p-iconfield>

        <p-select
          class="categories-page__original"
          [options]="originalOptions"
          optionLabel="label"
          optionValue="value"
          [ngModel]="originalFilter()"
          (ngModelChange)="onOriginalFilterChange($event)"
          [showClear]="true"
          placeholder="Alle"
          ariaLabel="Original"
        />
      </p-toolbar>

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
  ```
  (Der Block `<app-master-data-popup ... />` unter `</app-page>` bleibt unverändert.)
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/categories/pages/categories-page/categories-page.spec.ts` — erwartet: PASS (alle Tests der Datei)
- [ ] **Schritt 5: Lint und Build prüfen**
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK ohne Fehler in `categories-page.*`
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK
- [ ] **Schritt 6: Ergänzende Sichtprüfung der berechneten Pixel-Layouts (AC-06, AC-07, AC-18; die Regeln sind in Schritt 1 automatisch getestet)**
  Dev-Server starten: `preview_start` mit `{"name": "bazaar-app-frontend"}`, als Admin die Seite „Kategorien" öffnen und prüfen — erwartet: (a) eine gerahmte Leiste, Suchfeld füllt den Platz vom „+"-Button bis zum Auswahlfeld; (b) Auswahlfeld mindestens 150 px breit, bei gewähltem „✓ Original" ohne gekürzten Text; (c) `resize_window` mit `{"preset": "mobile"}`: Leiste bricht auf weitere Zeilen um, keine waagerechte Bildlaufleiste, „+"-Button, Suchfeld und Auswahlfeld bleiben sichtbar und bedienbar; danach `resize_window` mit `{"preset": "desktop"}`. Weicht (a), (b) oder (c) ab, SCSS aus Schritt 3b anpassen und Schritt 4 wiederholen. Lässt sich die Seite nicht öffnen (Anmeldung/Backend nötig), steht das im Bericht des Tasks als „nicht geprüft".
- [ ] **Schritt 7: Commit**
  `git add src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.ts src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.html src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.scss src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.spec.ts` · `git commit -m "feat(bazaar-app): Kategorienseite mit gerahmter Filterleiste statt Neu-Button in der Titelzeile (categories-toolbar-redesign)"`

## Entscheidungen
- Keine Fragen an den Menschen.
- **E · Trägerkomponente** · Planer — `p-toolbar` statt eigenem `div`: liefert Rahmen, Innenabstand, `role="toolbar"` und `flex-wrap: wrap` ohne eigenes CSS und ist die in `docs/components/master-data-filter-toolbar/component.md` vorgesehene Trägerkomponente. Die Seite hat damit genau eine gerahmte Leiste (AC-01, AC-18).
- **E · Werte des Auswahlfelds** · Planer — Optionswerte sind die Strings `'original'`/`'new'` statt Booleans, damit `null` („Alle") und `false` („Neu") im `p-select` nicht verwechselt werden.
- **E · Suchbegriff nicht getrimmt** · Planer — Der Suchbegriff wird 1:1 verglichen (nur Kleinschreibung angeglichen), weil die Spec „Name enthält den Suchbegriff" fordert und kein Trimmen nennt.
- **E · Hinweis des Plus-Buttons** · Planer — `pTooltip` (Maus) plus `ariaLabel` (Screenreader), jeweils „Neue Kategorie"; gleiche Technik wie die Tooltips der Tabellen-Aktionsbuttons.
- **E · Screenreader-Name des Auswahlfelds** · Planer — über den `ariaLabel`-Input von `p-select` (setzt `aria-label` am fokussierbaren Element) statt `aria-label` am Host wie auf der Artikelseite; sonst läse der Screenreader den Platzhalter „Alle" vor.
- **E · Planungs-Skills** · Planer — `forge-config.js get Planungs-Skills` ist leer; angewendet wurde nur `dv-angular:angular-testing-vitest-conventions` (Projekt testet mit Vitest), seine Kernregeln stehen unter Global Constraints.
- **E · Zuschnitt in zwei Tasks** · Planer — Task 1 (Filterlogik, rein TypeScript/Signals) und Task 2 (Leisten-Template, SCSS, Tests des Layouts) sind getrennt prüfbar; die Breiten- und Umbruchregeln AC-06/AC-07/AC-18 liegen in `categories-page.scss` und sind über die per `getComputedStyle` gelesenen Style-Tests in Task 2 Schritt 1 belegt (jsdom berechnet keine Pixel), ergänzt durch die Sichtprüfung in Task 2 Schritt 6.
- **R1 · Entscheidungen** — geändert — AC-18 hat jetzt einen automatisierten Test: `toolbar_narrowWindow_wrapsOntoFurtherLinesWithoutHorizontalOverflow` prüft per `getComputedStyle` `display: flex`, `flex-wrap: wrap` und `max-width: 100%` an der Leiste sowie `max-width: 100%` am Auswahlfeld; dafür stehen diese Regeln ausdrücklich in `&__toolbar`/`&__original` statt nur im PrimeNG-Theme. Zusätzlich belegen `toolbar_pageOpened_searchFieldGrowsIntoRemainingSpace` (AC-06) und `toolbar_pageOpened_selectKeepsMinWidth150AndDoesNotShrink` (AC-07) die Breitenregeln; das SCSS nutzt dafür Einzel-Eigenschaften statt `flex`-Kurzform. Neuer Task-2-Schritt 6 (Sichtprüfung mit `preview_start`/`resize_window`) ergänzt die Pixel-Prüfung, Commit ist jetzt Schritt 7. Global Constraints und E · Zuschnitt nennen Test und Sichtprüfung statt „nur Lint/Build".
- **R1 · Task 1** — geändert — Anker an den Bestand angepasst: Template-Zeile jetzt `[emptyText]="emptyText"` (Zeile 13 von `categories-page.html`), Test-Zeile jetzt `it('passes the exact emptyText through'` (Zeile 66 von `categories-page.spec.ts`), beides wörtlich in den Dateien vorhanden.
