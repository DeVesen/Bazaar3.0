# Filterleiste Verkäufer-Typen-Seite — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-seller-types-toolbar-redesign/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Seite „Verkäufer-Typen" der Haupt-App bekommt eine gerahmte Filterleiste mit „+"-Button (nur Admin) und einer Freitextsuche über den Namen; der Button „+ Neu" im Seitentitel entfällt.
**Architektur:** Die Suche ist reiner Client-Zustand der `SellerTypesPage` (Signal `searchTerm`): `rows` filtert die Liste des `SellerTypesStore` nach Namen und sortiert danach wie bisher; es gibt keine neue Server-Abfrage. Die Leiste ist ein Flex-Container im Template der Seite mit eigenem SCSS (Rahmen über PrimeNG-Design-Tokens). Der Leertext der `Table` ist ein `computed`, das zwischen „leere Liste" und „kein Treffer" umschaltet.
**Tech-Stack:** Angular 22 (standalone, OnPush, Signals), PrimeNG 22 (`p-button`, `p-iconfield`, `p-inputicon`, `pInputText`, `pTooltip`), Vitest
**Spec:** docs/forge/2026-10-12-seller-types-toolbar-redesign/spec.md
**Basis:** d7623a8

## Global Constraints
- Umgesetzt wird nur die Seite „Verkäufer-Typen" der Haupt-App (`src/bazaar-app/frontend`); Voranmelde-App und andere Listenseiten bleiben unverändert (Spec, Soll-Vorgaben).
- Maßgeblich sind die Einträge unter „Entscheidungen" und die Akzeptanzkriterien der Spec, auch die sinngemäß aus der Markenseite übernommenen Entscheidungen; weicht der Plan davon ab, gilt die Spec (Spec, Soll-Vorgaben).
- Zur Leiste gehören nur das Suchfeld und der Anlegen-Button; weitere Schaltflächen und Auswahlfelder gehören nicht dazu; keine Filter-Chips; keine sichtbaren Labels (Spec, Soll-Vorgaben, AC-07, AC-13).
- Das Suchfeld füllt den gesamten übrigen Platz zwischen „+"-Button (bzw. linkem Rand) und rechtem Rand der Leiste (AC-06); umgesetzt über `flex: 1 1 16rem` am Suchfeld in der Flex-Leiste.
- „+"-Button: nur Symbol „+" ohne Text; Hinweis und Screenreader-Text „Neuer Verkäufer-Typ" (AC-02, AC-03); nur für Admins (`RoleService.isAdmin()`, unverändert, AC-05).
- Suchfeld: Platzhalter `Suche nach Name …` (Auslassungszeichen U+2026); durchsucht nur den Namen; Teiltreffer ohne Beachtung von Groß- und Kleinschreibung; wirkt sofort (kein Debounce); keine neue Abfrage an den Server; Sortierung über Spaltenköpfe bleibt erhalten (AC-08 bis AC-10).
- Leertext bei leerer Liste (für alle Anwender, AC-12): `Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.` (öffnendes „ = U+201E, schließendes " = ASCII-Anführungszeichen). Hinweis bei Suche ohne Treffer (AC-11): `Keine Verkäufer-Typen gefunden.`
- Leiste bricht bei schmalen Fenstern auf weitere Zeilen um, keine waagerechte Bildlaufleiste, alle Elemente bleiben erreichbar (AC-14).
- Rahmenform (Antwort des Menschen): 1px Rand in `--p-content-border-color`, Radius `--p-content-border-radius`, Innenabstand 0.75rem, Seitenhintergrund unverändert.
- Quellcode, Routen und Bezeichner englisch, Doku deutsch (Projekt-`CLAUDE.md`); UI-Texte deutsch; nur PrimeNG-Komponenten (`docs/components/overview.md`).
- angular-testing-vitest-conventions: Vitest (`vi.fn()`), jeder Test mit `// Arrange` / `// Act` / `// Assert`, Naming `<methode>_<Situation>_<Erwartung>` für neue `it`; Specs liegen neben der Quelle; bestehende Tests behalten ihre Namen, keine Mitläufer-Migration; jede injizierte Abhängigkeit wird in Arrange gestubbt.
- angular (dv-angular): standalone Komponenten mit `ChangeDetectionStrategy.OnPush`, Signals; Build und Test über `dv-angular-build` / `dv-angular-test --root <R>/src/bazaar-app/frontend` im Bash-Tool, nie `ng test`/`npm test`.
- primeng (v22): PrimeNG-Code nur nach den Referenzen des Skills; Icon-Only-Button bekommt `ariaLabel` (Screenreader-Text); Icons als `pi pi-<name>`-Klassen.

---

### Task 1: Suchlogik und Leertexte der Seite

**ACs:** AC-08, AC-09, AC-10, AC-11, AC-12

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.ts:23-24` · `const EMPTY_TEXT =`
- Modify: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.ts:46` · `readonly emptyText = EMPTY_TEXT;`
- Modify: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.ts:62-66` · `readonly rows = computed<SellerType[]>`
- Modify: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.html:13` · `[emptyText]="emptyText"`
- Test: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts:73` · `passes the exact emptyText through`

**Interfaces:**
- Consumes: `SellerTypesStore.sellerTypes: WritableSignal<SellerType[]>` (besteht), `SortEvent { field: string; order: 'asc' | 'desc' }` (besteht, `shared/components/table/table`)
- Produces: `SellerTypesPage.searchTerm: WritableSignal<string>` (Start `''`), `SellerTypesPage.onSearchChange(term: string): void`, `SellerTypesPage.rows: Signal<SellerType[]>` (gefiltert, dann sortiert), `SellerTypesPage.emptyText: Signal<string>` (vorher `string`)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `seller-types-page.spec.ts` den bestehenden Test `passes the exact emptyText through` ersetzen (Name bleibt, der Wert ist jetzt ein Signal und der Text ändert sich):
  ```ts
  it('passes the exact emptyText through', () => {
    const { component } = createPage();
    sellerTypesSignal.set([]);

    expect(component.emptyText()).toBe(
      'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.',
    );
  });
  ```
  Direkt nach diesem Test (vor `marks every column as not filterable`) diesen neuen `describe`-Block einfügen:
  ```ts
  describe('search', () => {
    function threeTypes(): SellerType[] {
      return [
        sellerType({ id: '1', name: 'Anna' }),
        sellerType({ id: '2', name: 'Berta' }),
        sellerType({ id: '3', name: 'Carla' }),
      ];
    }

    it('onSearchChange_partialTermInOtherCase_showsOnlyMatchingNames', () => {
      // Arrange
      sellerTypesSignal.set([
        sellerType({ id: '1', name: 'Privat' }),
        sellerType({ id: '2', name: 'Händler' }),
      ]);
      const { component } = createPage();

      // Act
      component.onSearchChange('HÄ');

      // Assert
      expect(component.rows().map((row) => row.name)).toEqual(['Händler']);
    });

    it('onSearchChange_termCleared_showsAllSellerTypesAgain', () => {
      // Arrange
      sellerTypesSignal.set(threeTypes());
      const { component } = createPage();
      component.onSearchChange('berta');

      // Act
      component.onSearchChange('');

      // Assert
      expect(component.rows().map((row) => row.name)).toEqual(['Anna', 'Berta', 'Carla']);
    });

    it('onSearchChange_activeSort_keepsChosenSortOrder', () => {
      // Arrange
      sellerTypesSignal.set(threeTypes());
      const { component } = createPage();
      component.onSortChange([{ field: 'name', order: 'desc' }]);

      // Act
      component.onSearchChange('r');
      const afterFirstTerm = component.rows().map((row) => row.name);
      component.onSearchChange('a');
      const afterSecondTerm = component.rows().map((row) => row.name);

      // Assert
      expect(afterFirstTerm).toEqual(['Carla', 'Berta']);
      expect(afterSecondTerm).toEqual(['Carla', 'Berta', 'Anna']);
    });

    it('onSearchChange_anyTerm_doesNotReloadFromStore', () => {
      // Arrange
      const { component } = createPage();

      // Act
      component.onSearchChange('xyz');

      // Assert
      expect(load).toHaveBeenCalledTimes(1);
    });

    it('emptyText_termWithoutMatchWhileTypesExist_returnsNoResultsText', () => {
      // Arrange
      sellerTypesSignal.set(threeTypes());
      const { component } = createPage();

      // Act
      component.onSearchChange('zzz');

      // Assert
      expect(component.rows()).toEqual([]);
      expect(component.emptyText()).toBe('Keine Verkäufer-Typen gefunden.');
    });

    it('emptyText_noSellerTypesAndNoTerm_returnsEmptyListText', () => {
      // Arrange
      sellerTypesSignal.set([]);
      isAdminSignal.set(false);

      // Act
      const { component } = createPage();

      // Assert
      expect(component.emptyText()).toBe(
        'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.',
      );
    });
  });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts` — erwartet: FAIL (Kompilierfehler, `onSearchChange` und `emptyText()` fehlen; Tests `onSearchChange_partialTermInOtherCase_showsOnlyMatchingNames`, `passes the exact emptyText through` u. a. schlagen fehl)
- [ ] **Schritt 3: Minimal implementieren**
  In `seller-types-page.ts` die Konstante `EMPTY_TEXT` ersetzen:
  ```ts
  const EMPTY_TEXT =
    'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.';
  const NO_RESULTS_TEXT = 'Keine Verkäufer-Typen gefunden.';
  ```
  Das Feld `readonly emptyText = EMPTY_TEXT;` entfällt. Direkt nach `readonly saving …`/`serverErrors`-Feldern, vor `private readonly sortState`, kommt das neue Feld:
  ```ts
  readonly searchTerm = signal('');
  ```
  Das bestehende Feld `readonly rows` wird durch diesen Block ersetzt, `emptyText` folgt direkt dahinter. Die bisherige Fassung kopiert die Store-Liste per `[...rows].sort`; der neue Block sortiert die von `filter` frisch erzeugte Kopie `matching` und verändert die Liste des Stores dadurch ebenfalls nicht:
  ```ts
  readonly rows = computed<SellerType[]>(() => {
    const term = this.searchTerm().toLocaleLowerCase();
    const matching = this.sellerTypesStore
      .sellerTypes()
      .filter((sellerType) => sellerType.name.toLocaleLowerCase().includes(term));
    const sort = this.sortState();
    return sort.length === 0 ? matching : matching.sort((a, b) => this.compareBySort(a, b, sort));
  });

  readonly emptyText = computed(() =>
    this.sellerTypesStore.sellerTypes().length > 0 && this.rows().length === 0
      ? NO_RESULTS_TEXT
      : EMPTY_TEXT,
  );
  ```
  Die Methode `onSortChange` bekommt eine Nachbarin direkt darunter:
  ```ts
  onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }
  ```
  In `seller-types-page.html` die Bindung `[emptyText]="emptyText"` ändern, weil das Feld jetzt ein Signal ist:
  ```html
      [emptyText]="emptyText()"
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts` — erwartet: PASS (alle Tests der Datei)
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.ts src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.html src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts` · `git commit -m "feat(bazaar-app): Suchlogik und Leertexte der Verkäufer-Typen-Seite (seller-types-toolbar-redesign)"`

---

### Task 2: Gerahmte Filterleiste im Template

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-11, AC-12, AC-13, AC-14

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.scss`
- Modify: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.html:1-17` · Block `<app-page title="Verkäufer-Typen">`
- Modify: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.ts:34-39` · `@Component`-Dekorator der Klasse `SellerTypesPage` (imports, `styleUrl`)
- Test: `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts` · `describe('page header'`

**Interfaces:**
- Consumes: `SellerTypesPage.searchTerm: WritableSignal<string>`, `SellerTypesPage.onSearchChange(term: string): void`, `SellerTypesPage.emptyText: Signal<string>`, `SellerTypesPage.canAdd: Signal<boolean>`, `SellerTypesPage.onRowAdd(): void` (aus Task 1 bzw. bestehend)
- Produces: CSS-Klassen `.seller-types-page__toolbar` (Leiste) und `.seller-types-page__search` (Suchfeld, `p-iconfield`)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `seller-types-page.spec.ts` die Imports oben ergänzen:
  ```ts
  import { By } from '@angular/platform-browser';
  import { Tooltip } from 'primeng/tooltip';
  ```
  Den gesamten Block `describe('page header', () => { … });` am Dateiende durch diesen ersetzen (die drei alten „+ Neu"-Tests entfallen, weil der Button wandert):
  ```ts
  describe('page header', () => {
    it('shows "Verkäufer-Typen" as page title, no "+ Neu" in the header and no table title', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelector('app-page .page__title')?.textContent?.trim()).toBe(
        'Verkäufer-Typen',
      );
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(el.textContent).not.toContain('+ Neu');
      expect(el.querySelector('.app-table__toolbar')).toBeNull();
    });
  });

  describe('toolbar', () => {
    function toolbarOf(fixture: { nativeElement: HTMLElement }): HTMLElement {
      return fixture.nativeElement.querySelector('.seller-types-page__toolbar') as HTMLElement;
    }

    it('toolbar_pageShown_rendersOneToolbarWithSearchAboveTheTable', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;
      const toolbar = toolbarOf(fixture);
      const table = el.querySelector('app-table') as HTMLElement;

      // Assert
      expect(el.querySelectorAll('.seller-types-page__toolbar').length).toBe(1);
      expect(toolbar.querySelector('input')).not.toBeNull();
      expect(toolbar.compareDocumentPosition(table) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('toolbar_asAdmin_showsOneIconOnlyPlusButtonWithHint', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const buttons = toolbar.querySelectorAll('p-button');
      const plusButton = fixture.debugElement.query(By.css('.seller-types-page__toolbar p-button'));

      // Assert
      expect(buttons.length).toBe(1);
      expect(buttons[0].querySelector('.pi-plus')).not.toBeNull();
      expect(buttons[0].querySelector('button')?.textContent?.trim()).toBe('');
      expect(buttons[0].querySelector('button')?.getAttribute('aria-label')).toBe(
        'Neuer Verkäufer-Typ',
      );
      expect(plusButton.injector.get(Tooltip).content()).toBe('Neuer Verkäufer-Typ');
      expect(toolbar.firstElementChild).toBe(buttons[0]);
    });

    it('toolbar_asAdminPlusClicked_opensCreatePopup', () => {
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

    it('toolbar_asNonAdmin_hasNoAddButtonAndSearchStartsAtLeftEdge', () => {
      // Arrange
      isAdminSignal.set(false);

      // Act
      const { fixture } = createPage();
      const el: HTMLElement = fixture.nativeElement;
      const toolbar = toolbarOf(fixture);

      // Assert
      expect(toolbar.querySelector('p-button')).toBeNull();
      expect(el.querySelector('.page__actions p-button')).toBeNull();
      expect(toolbar.firstElementChild?.classList).toContain('seller-types-page__search');
    });

    it('toolbar_search_hasPlaceholderNoVisibleLabelAndNoSelect', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const input = toolbar.querySelector('input') as HTMLInputElement;

      // Assert
      expect(input.getAttribute('placeholder')).toBe('Suche nach Name …');
      expect(toolbar.querySelector('label')).toBeNull();
      expect(toolbar.querySelector('p-select')).toBeNull();
      expect(toolbar.querySelector('p-chip')).toBeNull();
    });

    it('toolbar_styles_wrapsFramedAndLetsSearchGrow', () => {
      // Arrange
      isAdminSignal.set(true);

      // Act
      const { fixture } = createPage();
      const toolbar = toolbarOf(fixture);
      const search = toolbar.querySelector('.seller-types-page__search') as HTMLElement;
      const toolbarStyle = getComputedStyle(toolbar);

      // Assert
      expect(toolbarStyle.display).toBe('flex');
      expect(toolbarStyle.flexWrap).toBe('wrap');
      expect(toolbarStyle.borderTopStyle).toBe('solid');
      expect(toolbarStyle.borderTopWidth).toBe('1px');
      expect(getComputedStyle(search).flexGrow).toBe('1');
    });

    it('search_termTyped_showsOnlyMatchingRowsAndNoChips', async () => {
      // Arrange
      sellerTypesSignal.set([
        sellerType({ id: '1', name: 'Privat' }),
        sellerType({ id: '2', name: 'Händler' }),
      ]);
      const { fixture } = createPage();
      const input = toolbarOf(fixture).querySelector('input') as HTMLInputElement;

      // Act
      input.value = 'HÄ';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert
      const rowTexts = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr'),
      ).map((row) => row.textContent ?? '');
      expect(rowTexts.length).toBe(1);
      expect(rowTexts[0]).toContain('Händler');
      expect(rowTexts[0]).not.toContain('Privat');
      expect((fixture.nativeElement as HTMLElement).querySelector('p-chip')).toBeNull();
    });

    it('search_termWithoutMatch_showsNoResultsHintInTable', async () => {
      // Arrange
      sellerTypesSignal.set([sellerType({ id: '1', name: 'Privat' })]);
      const { fixture } = createPage();
      const input = toolbarOf(fixture).querySelector('input') as HTMLInputElement;

      // Act
      input.value = 'zzz';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.app-table__empty')?.textContent?.trim(),
      ).toBe('Keine Verkäufer-Typen gefunden.');
    });

    it('table_noSellerTypesForNonAdmin_showsEmptyListHintMentioningPlus', () => {
      // Arrange
      sellerTypesSignal.set([]);
      isAdminSignal.set(false);

      // Act
      const { fixture } = createPage();

      // Assert
      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.app-table__empty')?.textContent?.trim(),
      ).toBe(
        'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit „+" beginnen.',
      );
    });
  });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts` — erwartet: FAIL `toolbar_pageShown_rendersOneToolbarWithSearchAboveTheTable` (und die übrigen `toolbar_*`/`search_*`-Tests; `.seller-types-page__toolbar` fehlt)
- [ ] **Schritt 3: Minimal implementieren**
  `seller-types-page.scss` neu anlegen:
  ```scss
  .seller-types-page {
    &__toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      padding: 0.75rem;
      margin-bottom: 1rem;
      // Rand als Einzelwerte statt Kurzform: jsdom (cssstyle) zerlegt eine Kurzform mit var() nicht,
      // borderTopStyle/borderTopWidth blieben im Test sonst leer.
      border-width: 1px;
      border-style: solid;
      border-color: var(--p-content-border-color);
      border-radius: var(--p-content-border-radius);
    }

    // Füllt den übrigen Platz bis zum rechten Rand; bricht unter 16rem in eine eigene Zeile um.
    &__search {
      flex: 1 1 16rem;
      min-width: 0;
    }
  }
  ```
  `seller-types-page.html`: den Kopf bis zum `<app-table` ersetzen (der `ngProjectAs="[pageActions]"`-Block mit `+ Neu` entfällt; ab `<app-table` bleibt alles wie nach Task 1, inklusive `[emptyText]="emptyText()"`):
  ```html
  <app-page title="Verkäufer-Typen">
    <div class="seller-types-page__toolbar">
      @if (canAdd()) {
        <p-button
          icon="pi pi-plus"
          ariaLabel="Neuer Verkäufer-Typ"
          pTooltip="Neuer Verkäufer-Typ"
          (onClick)="onRowAdd()"
        />
      }

      <p-iconfield class="seller-types-page__search">
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
  </app-page>
  ```
  `seller-types-page.ts`: Imports ergänzen und den Dekorator ersetzen:
  ```ts
  import { FormsModule } from '@angular/forms';
  import { IconFieldModule } from 'primeng/iconfield';
  import { InputIconModule } from 'primeng/inputicon';
  import { InputTextModule } from 'primeng/inputtext';
  import { TooltipModule } from 'primeng/tooltip';
  ```
  ```ts
  @Component({
    selector: 'app-seller-types-page',
    imports: [
      Table,
      TypPopup,
      Page,
      ButtonModule,
      FormsModule,
      IconFieldModule,
      InputIconModule,
      InputTextModule,
      TooltipModule,
    ],
    templateUrl: './seller-types-page.html',
    styleUrl: './seller-types-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts` — erwartet: PASS (alle Tests der Datei)
- [ ] **Schritt 5: Build prüfen**
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK (keine Template- oder Import-Fehler)
- [ ] **Schritt 6: Commit**
  `git add src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.scss src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.html src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.ts src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.spec.ts` · `git commit -m "feat(bazaar-app): gerahmte Filterleiste auf der Verkäufer-Typen-Seite (seller-types-toolbar-redesign)"`

## Entscheidungen
- **W · Plan-Ablage** · Aussage — Ein bestehender, ungetrackter `plan.md` am Zielpfad wird überschrieben; der Plan wird neu geschrieben.
- **W · Rahmenform** · Aussage — Dünner Rand plus Radius: 1px Rand in `--p-content-border-color`, Radius `--p-content-border-radius`, Innenabstand 0.75rem, Seitenhintergrund unverändert.
- **W · Planungs-Skills** · Aussage — Es gelten `dv-angular:angular-testing-vitest-conventions`, `dv-angular:angular` und `primeng`; ihre Kernregeln stehen unter Global Constraints.
- **E · Leertext bei Suche ohne Typen** · Planer — „Keine Verkäufer-Typen gefunden." erscheint nur, wenn Typen existieren und der Suchbegriff keinen trifft (AC-11); gibt es gar keine Typen, bleibt es beim Leertext der leeren Liste, auch bei gesetztem Suchbegriff, weil AC-12 die Liste, nicht den Begriff beschreibt und der Hinweis dann die richtige Handlung nennt.
- **E · Suchbegriff ohne Trimmen** · Planer — Der Begriff wird unverändert als Teilzeichenfolge verglichen (`toLocaleLowerCase().includes`); die Spec nennt kein Trimmen, ein leerer Begriff zeigt alles (AC-09).
- **E · Layout-Nachweis per berechnetem Stil** · Planer — AC-06 und AC-14 werden im Vitest-Lauf über `getComputedStyle` (Flex, Umbruch, Wachstum, Rand) abgesichert; eine Pixelprüfung im Browser ist nicht Teil des Plans.
- **E · Suchfeld-Barrierefreiheit** · Planer — Das Suchfeld trägt kein sichtbares Label (AC-07), aber `aria-label="Suche nach Name"` für Screenreader.
- **E · `ngModel` für das Suchfeld** · Planer — Gleiche Technik wie die Suchfelder der Verkäufer- und Artikelseite (`FormsModule`, `[ngModel]`/`(ngModelChange)`), kein Debounce, damit AC-08 „sofort" gilt.
- **R1 · Global Constraints** — geändert — Neuer Punkt: Maßgeblich sind die Entscheidungen und Akzeptanzkriterien der Spec, auch die sinngemäß aus der Markenseite übernommenen; bei Abweichung gilt die Spec. Damit ist die sechste Soll-Vorgabe abgedeckt; der W-Eintrag zur Übernahme von „Marken" in der Spec bleibt unberührt.
- **R1 · Task 1** — geändert — Dateizeilen auf den Ist-Code korrigiert: `seller-types-page.ts` als drei Modify-Zeilen mit je einem wörtlichen Anker (`const EMPTY_TEXT =` :23-24, `readonly emptyText = EMPTY_TEXT;` :46, `readonly rows = computed<SellerType[]>` :62-66), Template :13 mit Anker `[emptyText]="emptyText"`, Test :73 mit reinem Testnamen als Anker. Hinweis ergänzt, dass der neue `rows`-Block die von `filter` erzeugte Kopie sortiert und den Store nicht mutiert.
- **R1 · Task 2** — geändert — SCSS setzt den Rand jetzt als Einzelwerte (`border-width: 1px; border-style: solid; border-color: var(--p-content-border-color);`) statt als Kurzform mit var(), weil cssstyle unter jsdom eine solche Kurzform nicht in `borderTopStyle`/`borderTopWidth` zerlegt; der Test bleibt unverändert und prüft weiter `flexWrap` und `flexGrow`. Festlegung im Rahmen von W · Rahmenform (1px, Token, Radius). Zeilenbereich des `@Component`-Dekorators auf :34-39 korrigiert.
