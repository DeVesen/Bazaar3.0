# Verkäufer-Kachelliste mit PrimeNG ScrollArea — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-sellers-kachelliste-scrollarea/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Kachelliste der Verkäufer-Seite scrollt ab 769px in der PrimeNG-ScrollArea statt in einem DIV mit nativem Überlauf, und beginnt nach einem Such-, Status- oder Sortierwechsel wieder oben.
**Architektur:** `sellers-page.html` ersetzt den Wrapper `.sellers-page__list` durch `p-scrollarea` (Variante „auto“, ohne Maske) mit Viewport, Content und vertikaler Scrollbar. Grid und Nachlade-Sentinel liegen im Content, die Filterzeilen außerhalb. Eine `effect()` in `SellersPage` setzt `scrollTop` des Viewports auf 0, sobald nach einer Filteränderung die neue Liste eintrifft. Die Höhe kommt wie bisher aus dem Flex-Layout von `app-page [fill]`.
**Tech-Stack:** Angular (Standalone, OnPush, Signals), PrimeNG 22 (`primeng/scrollarea`), Vitest, SCSS
**Spec:** docs/forge/2026-10-12-sellers-kachelliste-scrollarea/spec.md
**Basis:** e75281c

## Global Constraints
- Es kommt ausschließlich PrimeNG ScrollArea zum Einsatz, kein selbstgebauter Scrollbereich. (Spec, Soll-Vorgaben)
- Der Wechsel zwischen den Darstellungen liegt unverändert bei 768px/769px. (Spec, Soll-Vorgaben)
- Die Höhe des Scrollbereichs bleibt Fensterhöhe abzüglich Shell-Abstand, Page-Header und Filter. (Spec, Soll-Vorgaben)
- Scrollbar-Variante „auto“; kein Fade-Verlauf an den Scrollkanten (`mask` aus). (Spec, Theoretisches Verhalten)
- Umfang nur Verkäufer-Seite; Leaderboard (Statistik) und Warenkorb (Kasse) bleiben unverändert. (Spec, Was/wie/wo/warum)
- Nachladen unverändert: 60 Verkäufer am Listenende. (Spec, Entscheidungen)
- Begriffe: „Verkäufer-Kachel“ und „Kachelliste“ sind kanonisch, „Verkäufer-Karte“ gilt nicht. (Spec, Entscheidungen)
- Code, Routen und JSON-Contract englisch, Doku deutsch; bestehende Code-Namen (`app-seller-card`, `.sellers-page__grid`, `.sellers-page__sentinel`, `SellerCard`) bleiben unverändert. (Projekt-`CLAUDE.md`, Spec-Entscheidung F · Soll-Vorgaben)
- Nur PrimeNG-Komponenten für die UI, Wrapper nur für Fehlendes. (Projekt-`CLAUDE.md`, `docs/components/overview.md`)
- dv-angular:angular-testing-vitest-conventions: Vitest mit `vi.fn()`/`vi.spyOn()`, kein Jasmine/Jest; neue `it` heißen `<methode>_<Ausgangslage>_<Ergebnis>` mit `// Arrange` / `// Act` / `// Assert`; zoneless Muster Act → `await fixture.whenStable()` → Assert; bestehende Tests und deren Namen bleiben.
- `<R>` steht in allen Befehlen für die Repo-Wurzel `C:/Develop/Bazaar3.0`.
- Tests laufen ausschließlich über `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include <spec>`; Build `dv-angular-build --root <R>/src/bazaar-app/frontend`, Lint `dv-angular-lint --root <R>/src/bazaar-app/frontend` (dv-angular:toolchain, Bash-Tool).
- Layoutverhalten wird manuell abgenommen, nicht automatisiert getestet: Nur die Kachelliste scrollt und die Seite nicht (AC-01), Scrollbar sichtbar bei Überlauf und unsichtbar bei wenigen Kacheln (AC-03), ganze Seite scrollt bis 768px (AC-04) und kein sichtbarer Fade (AC-08). jsdom berechnet kein Layout, und im Frontend-Projekt ist kein Browser-Testrunner eingerichtet (kein Playwright/Cypress in `package.json`/`angular.json`). Die Vitest-Tests sichern dafür die Struktur ab (Filterzeilen außerhalb von `p-scrollarea`, Variante `auto`, vertikale Scrollbar, keine Maske); die Abnahme ist Schritt 6 von Task 2.
- Voraussetzung für das Lade-Skeleton (separates Vorhaben): Es hängt an der Stelle der Kacheln, also innerhalb von `p-scrollarea-content` neben bzw. anstelle von `.sellers-page__grid`. Dieser Plan baut kein Skeleton.

---

### Task 1: Kachelliste in PrimeNG ScrollArea

**ACs:** AC-01, AC-03, AC-04, AC-05, AC-07, AC-08, AC-09, AC-10

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html:68-90` · `<div class="sellers-page__list">` (Zweig `@else`)
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts` · `SellersPage` (`imports`-Array)
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.scss:1-23` · `&__list`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `describe('SellersPage', () => {` (darin `beforeEach(async () => {` und `describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)', () => {`)

**Interfaces:**
- Consumes: bestehend — `SellersPage.items()`, `SellersPage.onLoadMore()`, `SellersPage.onCardClick(card)`, Direktive `LoadMoreSentinel` (`[appLoadMoreSentinel]`, Output `reached`), `app-seller-card` mit Output `cardClick`, `ScrollAreaModule` aus `primeng/scrollarea` (Selektoren `p-scrollarea`, `p-scrollarea-viewport`, `p-scrollarea-content`, `p-scrollarea-scrollbar`, `p-scrollarea-handle`; Inputs `variant`, `mask` an `p-scrollarea`, `orientation` an `p-scrollarea-scrollbar`)
- Produces: DOM-Struktur `p-scrollarea.sellers-page__list > p-scrollarea-viewport.sellers-page__viewport > p-scrollarea-content > (.sellers-page__grid, .sellers-page__sentinel)` plus `p-scrollarea-scrollbar > p-scrollarea-handle`. Task 2 liest den Viewport über `viewChild(ScrollArea)` (`ScrollArea.viewportEl: HTMLElement | null`).

Hinweis zum Test: `ScrollArea` legt beim Initialisieren einen `ResizeObserver` an (`setupResizeObserver`); den gibt es in jsdom nicht. Die Spec stubbt ihn deshalb in `beforeEach` global.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `sellers-page.spec.ts` zuerst den Stub ergänzen. Direkt am Anfang von `beforeEach(async () => {` (vor `itemsSignal = signal<SellerCard[]>([]);`) einfügen:

  ```ts
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      },
    );
  ```

  Direkt nach dem Block `beforeEach(async () => { … });` (vor `async function createPage()`) einfügen:

  ```ts
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  ```

  Im `describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)', () => {` vor dessen schließender Klammer `});` diesen Block anhängen:

  ```ts

    describe('scroll area (Kachelliste)', () => {
      async function renderWithCards(): Promise<HTMLElement> {
        itemsSignal.set([buildCard()]);
        totalCountSignal.set(1);
        const { fixture } = await createPage();
        fixture.detectChanges();
        return fixture.nativeElement as HTMLElement;
      }

      it('render_withCards_putsGridAndSentinelInsideScrollAreaContent', async () => {
        // Arrange / Act
        const el = await renderWithCards();

        // Assert
        const content = 'p-scrollarea.sellers-page__list p-scrollarea-viewport p-scrollarea-content';
        expect(el.querySelector(`${content} .sellers-page__grid app-seller-card`)).not.toBeNull();
        expect(el.querySelector(`${content} .sellers-page__sentinel[appLoadMoreSentinel]`)).not.toBeNull();
      });

      it('render_withCards_keepsFilterRowsOutsideScrollArea', async () => {
        // Arrange / Act
        const el = await renderWithCards();

        // Assert
        const rows = Array.from(el.querySelectorAll('.sellers-page__filter-row'));
        expect(rows.length).toBe(2);
        for (const row of rows) {
          expect(row.closest('p-scrollarea')).toBeNull();
        }
      });

      it('render_withCards_usesAutoVariantWithVerticalScrollbar', async () => {
        // Arrange / Act
        const el = await renderWithCards();

        // Assert
        const scrollArea = el.querySelector('p-scrollarea.sellers-page__list');
        expect(scrollArea?.getAttribute('data-variant')).toBe('auto');
        expect(scrollArea?.querySelector('p-scrollarea-scrollbar p-scrollarea-handle')).not.toBeNull();
      });

      it('render_withCards_hasNoFadeMask', async () => {
        // Arrange / Act
        const el = await renderWithCards();

        // Assert
        const scrollArea = el.querySelector('p-scrollarea.sellers-page__list');
        expect(scrollArea?.classList).toContain('p-scrollarea');
        expect(scrollArea?.classList).not.toContain('p-scrollarea-mask');
      });

      it('cardClick_onTileInsideScrollArea_opensDetailModal', async () => {
        // Arrange
        itemsSignal.set([buildCard({ id: 's1' })]);
        totalCountSignal.set(1);
        const { fixture, component } = await createPage();
        fixture.detectChanges();
        const tile = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
          'p-scrollarea .seller-card',
        );

        // Act
        tile?.click();
        await fixture.whenStable();

        // Assert
        expect(tile).not.toBeNull();
        expect(component.detailModalVisible()).toBe(true);
        expect(component.selectedCardForDetail()?.id).toBe('s1');
      });

      it('render_withoutSellers_showsEmptyHintWithoutScrollArea', async () => {
        // Arrange
        totalCountSignal.set(0);

        // Act
        const { fixture } = await createPage();

        // Assert
        const el = fixture.nativeElement as HTMLElement;
        expect(el.querySelector('p-scrollarea')).toBeNull();
        expect(el.textContent).toContain('Noch keine Verkäufer.');
      });
    });
  ```

- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL `render_withCards_putsGridAndSentinelInsideScrollAreaContent`, `render_withCards_usesAutoVariantWithVerticalScrollbar`, `render_withCards_hasNoFadeMask`, `cardClick_onTileInsideScrollArea_opensDetailModal`; die übrigen (auch `render_withCards_keepsFilterRowsOutsideScrollArea`, `render_withoutSellers_showsEmptyHintWithoutScrollArea`) und alle bestehenden Tests bleiben PASS.

- [ ] **Schritt 3: Minimal implementieren**
  `sellers-page.ts`: Import ergänzen (nach `import { InputTextModule } from 'primeng/inputtext';`):

  ```ts
  import { ScrollAreaModule } from 'primeng/scrollarea';
  ```

  und im `imports`-Array der `@Component`-Konfiguration nach `InputTextModule,` die Zeile `ScrollAreaModule,` einfügen.

  `sellers-page.html`: den gesamten Zweig `@else { <div class="sellers-page__list"> … </div> }` (ab `<div class="sellers-page__list">` bis zum zugehörigen schließenden `</div>`, einschließlich des Kommentars zum Sentinel) ersetzen durch:

  ```html
    @else {
      <p-scrollarea class="sellers-page__list" variant="auto" [mask]="false">
        <p-scrollarea-viewport class="sellers-page__viewport">
          <p-scrollarea-content>
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
            <!-- Property binding drives the directive's `trigger` input (re-observe on count change);
                 the extra attr. binding reflects the same value as a real DOM attribute so tests can
                 locate the sentinel via `[appLoadMoreSentinel]` — plain property bindings never show
                 up in the rendered HTML. -->
            <div
              class="sellers-page__sentinel"
              [appLoadMoreSentinel]="items().length"
              [attr.appLoadMoreSentinel]="items().length"
              (reached)="onLoadMore()"
            ></div>
          </p-scrollarea-content>
        </p-scrollarea-viewport>
        <p-scrollarea-scrollbar orientation="vertical">
          <p-scrollarea-handle />
        </p-scrollarea-scrollbar>
      </p-scrollarea>
    }
  ```

  (Der umgebende `} @else if (noResultsForFilter()) { … }`-Zweig und der `@if (noSellersAtAll())`-Kopf bleiben unverändert; ersetzt wird nur der letzte `@else`-Block.)

  `sellers-page.scss`: den Block `&__list { … }` (Zeilen 13–19) ersetzen durch:

  ```scss
  // Ab 769px füllt die Kachelliste (PrimeNG ScrollArea) die Resthöhe; der Viewport scrollt
  // in sich. Bis 768px bekommt die ScrollArea keine Höhenbegrenzung, die ganze Seite scrollt.
  &__list {
    @media (min-width: 769px) {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
    }
  }

  &__viewport {
    @media (min-width: 769px) {
      flex: 1;
      min-height: 0;
    }
  }
  ```

  Außerdem im Kommentar am Kopf von `.sellers-page` (Zeilen 6–7) „Kachelliste scrollt“ beibehalten; keine weitere Änderung.

- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS (alle Tests der Datei, einschließlich der bestehenden `renders the tiles inside the scrolling list without a paginator`).

- [ ] **Schritt 5: Build und Lint**
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK. Danach `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK ohne neue Befunde in den geänderten Dateien.

- [ ] **Schritt 6: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.scss src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "feat(bazaar-app): Verkäufer-Kachelliste in PrimeNG ScrollArea (sellers-kachelliste-scrollarea)"`

---

### Task 2: Kachelliste springt nach Filterwechsel nach oben

**ACs:** AC-05, AC-06

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts` · `SellersPage` (Imports, Felder, `constructor`)
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `describe('scroll area (Kachelliste)')`

**Interfaces:**
- Consumes: Task 1 — DOM `p-scrollarea` mit Viewport; `ScrollArea` aus `primeng/scrollarea` mit öffentlichem Feld `viewportEl: HTMLElement | null`. Bestehend: `SellersPage.filters` (`Signal<SellersFilters>`), `SellersPage.loading` (`Signal<boolean>`); `SellersStore.setFilters` erzeugt bei jeder Änderung ein neues Filter-Objekt und setzt `loading` auf `true`, bis die neue Liste eintrifft; `SellersStore.loadMore()`/Mutationen ändern `filters` nicht.
- Produces: `private readonly scrollArea = viewChild(ScrollArea)` und `private scrollResetPending`/`private appliedFilters` in `SellersPage`; Verhalten: nach neuem `filters()`-Objekt und anschließendem `loading() === false` ist `viewportEl.scrollTop === 0`. Ohne Filteränderung bleibt `scrollTop` unverändert.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `sellers-page.spec.ts` im `describe('scroll area (Kachelliste)', () => { … })` nach dem letzten `it` (vor dessen schließendem `});`) anhängen:

  ```ts

      /** jsdom kennt kein Layout: `scrollTop` wird am Viewport durch einen schreibbaren Wert ersetzt. */
      function makeViewportScrollable(el: HTMLElement, initial: number): { current: () => number } {
        const viewport = el.querySelector<HTMLElement>('p-scrollarea-viewport');
        let value = initial;
        Object.defineProperty(viewport, 'scrollTop', {
          configurable: true,
          get: () => value,
          set: (next: number) => {
            value = next;
          },
        });
        return { current: () => value };
      }

      it('scrollTop_afterFilterChangeAndNewListArrives_isReset', async () => {
        // Arrange
        itemsSignal.set([buildCard()]);
        totalCountSignal.set(1);
        const { fixture } = await createPage();
        fixture.detectChanges();
        const scroll = makeViewportScrollable(fixture.nativeElement as HTMLElement, 500);

        // Act
        filtersSignal.set({ q: 'mei', status: null, sort: 'name' });
        loadingSignal.set(true);
        await fixture.whenStable();
        expect(scroll.current()).toBe(500);
        loadingSignal.set(false);
        await fixture.whenStable();

        // Assert
        expect(scroll.current()).toBe(0);
      });

      it('scrollTop_afterSortChangeAndNewListArrives_isReset', async () => {
        // Arrange
        itemsSignal.set([buildCard()]);
        totalCountSignal.set(1);
        const { fixture } = await createPage();
        fixture.detectChanges();
        const scroll = makeViewportScrollable(fixture.nativeElement as HTMLElement, 320);

        // Act
        filtersSignal.set({ q: '', status: null, sort: 'revenue' });
        loadingSignal.set(true);
        await fixture.whenStable();
        loadingSignal.set(false);
        await fixture.whenStable();

        // Assert
        expect(scroll.current()).toBe(0);
      });

      it('scrollTop_afterLoadMoreWithoutFilterChange_isKept', async () => {
        // Arrange
        itemsSignal.set([buildCard()]);
        totalCountSignal.set(1);
        const { fixture } = await createPage();
        fixture.detectChanges();
        const scroll = makeViewportScrollable(fixture.nativeElement as HTMLElement, 500);

        // Act
        loadingSignal.set(true);
        await fixture.whenStable();
        itemsSignal.set([buildCard({ id: 's1' }), buildCard({ id: 's2' })]);
        loadingSignal.set(false);
        await fixture.whenStable();

        // Assert
        expect(scroll.current()).toBe(500);
      });
  ```

- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL `scrollTop_afterFilterChangeAndNewListArrives_isReset` und `scrollTop_afterSortChangeAndNewListArrives_isReset` (Wert bleibt 500 bzw. 320); `scrollTop_afterLoadMoreWithoutFilterChange_isKept` ist bereits PASS (Absicherung), alle übrigen PASS.

- [ ] **Schritt 3: Minimal implementieren**
  `sellers-page.ts`: Core-Imports erweitern — in `import { … } from '@angular/core';` ergänzen: `effect`, `untracked`, `viewChild` (alphabetisch zwischen die vorhandenen Namen einsortieren). Nach `import { InputTextModule } from 'primeng/inputtext';` die Zeile `import { ScrollAreaModule } from 'primeng/scrollarea';` (aus Task 1) zu folgender erweitern:

  ```ts
  import { ScrollArea, ScrollAreaModule } from 'primeng/scrollarea';
  ```

  Im Klassenrumpf nach `private readonly destroyRef = inject(DestroyRef);` einfügen:

  ```ts
    private readonly scrollArea = viewChild(ScrollArea);

    /** Zuletzt gesehenes Filter-Objekt; ein neues Objekt heißt: Suche, Status oder Sortierung wurde geändert. */
    private appliedFilters: SellersFilters | null = null;
    private scrollResetPending = false;
  ```

  Den Import `import { SellersStore } from '../../sellers-store';` zu `import { SellersFilters, SellersStore } from '../../sellers-store';` erweitern.

  Im `constructor()` nach `this.sellersStore.load();` einfügen:

  ```ts
      // AC-06: Nach Änderung von Suche/Status/Sortierung beginnt die Kachelliste oben, sobald die
      // neue Liste eintrifft (loading wieder false). Nachladen und Aktualisierungen nach
      // Speichern/Löschen/Freigeben ändern `filters` nicht und behalten die Scroll-Position.
      effect(() => {
        const filters = this.filters();
        const loading = this.loading();
        untracked(() => {
          if (filters !== this.appliedFilters) {
            this.appliedFilters = filters;
            this.scrollResetPending = true;
          }
          if (this.scrollResetPending && !loading) {
            this.scrollResetPending = false;
            const viewport = this.scrollArea()?.viewportEl;
            if (viewport) viewport.scrollTop = 0;
          }
        });
      });
  ```

- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS (alle Tests der Datei).

- [ ] **Schritt 5: Gesamtprüfung Build, Lint, Tests des Features**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers` — erwartet: PASS. Danach `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK; `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK ohne neue Befunde.

- [ ] **Schritt 6: Manuelle Abnahme im Browser (kein automatisierter Test; Layoutteil von AC-01, AC-03, AC-04, AC-08, siehe Global Constraints)**
  Die Unterschritte laufen der Reihe nach; jeder gilt als bestanden, wenn die genannte Beobachtung eintritt. Läuft das Backend lokal nicht oder ist keine Anmeldung möglich, melde das als Befund; kein Grund, Code zu ändern.

  - [ ] **6.1 Vorschau starten und Seite öffnen**
    Tool-Aufrufe: `preview_start` mit `{"name": "bazaar-app-frontend"}` (Name aus `.claude/launch.json`), dann `navigate` auf `/sellers` der geöffneten App. — erwartet: Die Verkäufer-Seite zeigt Page-Header, beide Filterzeilen und die Kachelliste.
  - [ ] **6.2 Scrollverhalten bei 1440px (AC-01, AC-08)**
    Tool-Aufrufe: `resize_window` mit `{"width": 1440, "height": 900}`, dann in der Kachelliste nach unten scrollen, dann `javascript_tool` mit `document.scrollingElement.scrollTop`. — erwartet: Nur die Kachelliste scrollt, Page-Header und Filterzeilen bleiben stehen; der Aufruf liefert `0`; obere und untere Kante des Scrollbereichs zeigen beim Scrollen keinen Fade-Verlauf.
  - [ ] **6.3 Scrollbar bei Überlauf und bei wenigen Kacheln (AC-03)**
    Tool-Aufrufe: bei 1440px mit vielen Kacheln `javascript_tool` mit `getComputedStyle(document.querySelector('.p-scrollarea-scrollbar')).display`; danach im Suchfeld einen Begriff eingeben, der nur ein bis zwei Verkäufer trifft, und denselben Aufruf wiederholen. — erwartet: Bei vielen Kacheln ist die PrimeNG-Scrollbar sichtbar (Wert ungleich `none`, Scrollbar im Bild); bei wenigen Kacheln ist keine Scrollbar zu sehen. Danach das Suchfeld leeren.
  - [ ] **6.4 Nachladen am Listenende (AC-05)**
    Tool-Aufrufe: bei 1440px in der Kachelliste bis ans Ende scrollen. — erwartet: Weitere Kacheln erscheinen unten in der Liste, die Scroll-Position springt dabei nicht nach oben.
  - [ ] **6.5 Sortierwechsel (AC-06)**
    Tool-Aufrufe: bei 1440px in der Kachelliste ein Stück nach unten scrollen, dann die Sortierung ändern, danach `javascript_tool` mit `document.querySelector('.p-scrollarea-viewport').scrollTop`. — erwartet: Die Liste steht oben, der Aufruf liefert `0`.
  - [ ] **6.6 Seitenscroll bei 768px (AC-04)**
    Tool-Aufrufe: `resize_window` mit `{"width": 768, "height": 900}`, dann `javascript_tool` mit `(() => { const v = document.querySelector('.p-scrollarea-viewport'); return v.clientHeight === v.scrollHeight; })()`. — erwartet: Die ganze Seite scrollt, der Aufruf liefert `true` (Viewport ohne begrenzte Höhe).
  - [ ] **6.7 Fenstergröße zurücksetzen**
    Tool-Aufruf: `resize_window` mit `{"preset": "desktop"}`. — erwartet: Das Fenster hat wieder die Desktop-Größe.

- [ ] **Schritt 7: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "feat(bazaar-app): Kachelliste springt nach Filterwechsel nach oben (sellers-kachelliste-scrollarea)"`

## Entscheidungen
- **W · AC-07 Skeleton** · Aussage — Im Code gibt es noch kein Lade-Skeleton. Gewählt: Platz vorbereiten, AC-07 per Strukturtest. Die ScrollArea umschließt den gesamten Kachelbereich (Grid und Sentinel in `p-scrollarea-content`, Filterzeilen außerhalb); der Test beweist genau diese Lage. Das Skeleton baut das eigene Vorhaben an derselben Stelle (siehe Global Constraints).
- **E · ResizeObserver-Stub in der Spec** · Planer — `ScrollArea` braucht `ResizeObserver`, den jsdom nicht kennt. Der Stub steht in `sellers-page.spec.ts` (`beforeEach`/`afterEach`), nicht global, weil nur diese Spec die ScrollArea rendert.
- **E · Scroll-Reset über `effect()` auf `filters`/`loading`** · Planer — Ein neues Filter-Objekt markiert den Reset als ausstehend, der Sprung nach oben erfolgt, sobald `loading` wieder `false` ist. So bleibt die Position bei Nachladen und Aktualisierungen nach Speichern/Löschen/Freigeben unverändert (`filters` ändert sich dort nicht), und der Store bleibt unangetastet.
- **E · Sichtprüfung als Schritt** · Planer — Scrollbar-Sichtbarkeit, Resthöhe und der Wechsel bei 768px/769px lassen sich in jsdom nicht beweisen (kein Layout); sie stehen als Browser-Schritt in Task 2.
- **E · Planungs-Skills** · Planer — `forge-config.js get Planungs-Skills` ist leer; angewendet wurden die Projekt-`CLAUDE.md`, `dv-angular:angular-testing-vitest-conventions` und `dv-angular:toolchain`.
- **R1 · AC-02** — nicht geändert — AC-02 ist in der Spec gestrichen (Spec-Entscheidung F · AC-02: prüfte die Bauweise statt Verhalten). Es gibt kein Verhalten, das ein Task umsetzen könnte; die Vorgabe „ausschließlich PrimeNG ScrollArea“ steht in den Global Constraints und wird von Task 1 umgesetzt, das beobachtbare Verhalten deckt AC-03 ab. Die Spec-Zeile zu entfernen liegt außerhalb dieser Nacharbeit.
- **R1 · Global Constraints** — geändert — Neue Constraint: Das Layoutverhalten von AC-01, AC-03, AC-04 und AC-08 wird manuell abgenommen, weil jsdom kein Layout berechnet und das Frontend keinen Browser-Testrunner hat (kein Playwright/Cypress); einen einzuführen liegt außerhalb des Vorhabens. Task 2 Schritt 6 heißt jetzt „Manuelle Abnahme im Browser“ und prüft zusätzlich die Fade-freien Kanten (AC-08). Die Vitest-Strukturtests aus Task 1 bleiben die automatisierte Absicherung.
- **R1 · Task 1** — geändert — `<R>` ist in den Global Constraints als Repo-Wurzel `C:/Develop/Bazaar3.0` definiert, Build- und Lint-Befehle dort ausgeschrieben. Der Test-Anker lautet jetzt `describe('SellersPage', () => {` exakt wie in der Datei (Zeile 67), die inneren Blöcke stehen als exakte Zeichenfolgen in Klammern.
- **F · AC-02** — spec-rückfrage — Vorschlag 1: Der Vorschlag verlangt, die Zeile „AC-02 (entfällt, siehe Entscheidungen)“ aus der Spec zu löschen. Die Spec ist in diesem Lauf schreibgeschützt; der Plan kann die Lücke nicht schließen, weil AC-02 kein umsetzbares Verhalten mehr enthält.
- **R2 · AC-02** — frage an den menschen — Soll die Zeile „AC-02 (entfällt, siehe Entscheidungen)“ aus der Kriterienliste der Spec gelöscht werden (übrige Nummern unverändert), damit die AC-Abdeckungsprüfung nicht mehr anschlägt? Alternativ: Soll die Prüfung gestrichene ACs mit Vermerk „entfällt“ ignorieren?
- **F · Task 2** — geändert — Vorschlag 1: Schritt 6 ist in die Unterschritte 6.1 bis 6.7 mit eigener Checkbox aufgeteilt (Vorschau starten und Seite öffnen; Scrollverhalten bei 1440px; Scrollbar bei Überlauf und wenigen Kacheln; Nachladen; Sortierwechsel; Seitenscroll bei 768px; Fenstergröße zurücksetzen). Jeder Unterschritt nennt seine Tool-Aufrufe und eine erwartete Beobachtung; Schrittnummer 6 und Commit-Schritt 7 bleiben, der Verweis in den Global Constraints gilt weiter.
