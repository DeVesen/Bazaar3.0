# Verkäufer-Kachelliste mit PrimeNG ScrollArea — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-sellers-kachelliste-scrollarea/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Kachelliste der Verkäufer-Seite scrollt ab 769px in der PrimeNG-ScrollArea statt in einem DIV mit nativem Überlauf, zeigt beim Erstladen ein Skeleton und beginnt nach Such-, Status- oder Sortierwechsel wieder oben.
**Architektur:** `sellers-page.html` ersetzt den Wrapper `.sellers-page__list` (DIV) durch `p-scrollarea` (Variante „auto“, ohne Maske) mit Viewport, Content und vertikaler Scrollbar; Grid und Nachlade-Sentinel liegen im Content, die Filterzeilen außerhalb. Die Höhe kommt wie bisher aus dem Flex-Layout von `app-page [fill]` (ab 769px `flex: 1; min-height: 0` auf dem ScrollArea-Host). Eine `effect()` in `SellersPage` setzt `scrollTop` des ScrollArea-Viewports auf 0, sobald nach einer Filteränderung die neue Liste eintrifft.
**Tech-Stack:** Angular 22 (Standalone, OnPush, Signals), PrimeNG 22.1.1 (`primeng/scrollarea`, `primeng/skeleton`), Vitest (jsdom), SCSS
**Spec:** docs/forge/2026-10-12-sellers-kachelliste-scrollarea/spec.md
**Basis:** 67e5dc1

## Global Constraints
- Es kommt ausschließlich PrimeNG ScrollArea zum Einsatz, kein selbstgebauter Scrollbereich. (Spec, Soll-Vorgaben)
- Der Wechsel zwischen den Darstellungen liegt unverändert bei 768px/769px. (Spec, Soll-Vorgaben)
- Die Höhe des Scrollbereichs bleibt Fensterhöhe abzüglich Shell-Abstand, Page-Header und Filter. (Spec, Soll-Vorgaben)
- Scrollbar-Variante „auto“; kein Fade-Verlauf an den Scrollkanten (`[mask]="false"`). (Spec, Theoretisches Verhalten)
- Begriffe: „Verkäufer-Kachel“ und „Kachelliste“; nie „Verkäufer-Karte“. Code-Namen bleiben stabil: Komponente `SellerCard` / Selector `app-seller-card` und CSS-Klasse `.sellers-page__list` werden nicht umbenannt. (Spec, Entscheidung „Begriff Kachel“ und F-Eintrag „Soll-Vorgaben“)
- Nachladen bleibt unverändert: 60 Verkäufer am Listenende über `LoadMoreSentinel`/`SellersStore.loadMore()`. (Spec, Entscheidung „Nachladen“)
- Verifikation nur über die dv-angular-Toolchain im Bash-Tool, nie `ng test`/`npm test` direkt: Testen `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include <pfad>`, Bauen `dv-angular-build --root <R>/src/bazaar-app/frontend`, Linten `dv-angular-lint --root <R>/src/bazaar-app/frontend`. (dv-angular:toolchain)
- Specs: Vitest-Konventionen; neue `it` heißen `<methode>_<Situation>_<Erwartung>`, Aufbau mit `// Arrange` / `// Act` / `// Assert`; Spies mit `vi.fn()`; Async als Act → `await fixture.whenStable()` → Assert; keine zusätzlichen Mock-Libs; bestehende Test-Namen bleiben. (dv-angular:angular-testing-vitest-conventions)
- Signals: Kein `effect()` zum Synchronhalten von Signals; `effect()` nur für den Seiteneffekt am DOM; Signal-Lesen, das nicht tracken soll, mit `untracked()`. (dv-angular:angular-signals)
- Layout-ACs in jsdom: Die Media-Query-Grenze (AC-04) wird über die Regeln der Component-Styles in `document.styleSheets` getestet, die Scrollbar-Sichtbarkeit (AC-03) über gestubbte Viewport-Maße (`clientHeight`/`scrollHeight` per `Object.defineProperty`) und `ScrollArea.refresh()`. Nur „die Seite selbst scrollt nicht“ (AC-01) bleibt Sichtprüfung. (Review-Nacharbeit R1)
- PrimeNG v22: Code nur aus den Referenzen (`.claude/skills/primeng/references/components/scrollarea`, `.../skeleton`) bzw. dem installierten Paket; kein `styleClass`/`pTemplate`. (primeng)

---

### Task 1: Kachelliste in PrimeNG ScrollArea

**ACs:** AC-01, AC-03, AC-04, AC-05, AC-08, AC-09, AC-10

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html` · `sellers-page__list`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.scss` · `&__list`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts` · `imports`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `layout and infinite loading`

**Interfaces:**
- Consumes: `ScrollAreaModule` aus `primeng/scrollarea` (exportiert `p-scrollarea`, `p-scrollarea-viewport`, `p-scrollarea-content`, `p-scrollarea-scrollbar`, `p-scrollarea-handle`); Inputs `variant: 'auto' | 'hover' | 'scroll' | 'always' | 'hidden'`, `mask: boolean`.
- Produces: DOM `p-scrollarea.sellers-page__list > p-scrollarea-viewport > p-scrollarea-content > (.sellers-page__grid + .sellers-page__sentinel)` und `p-scrollarea-scrollbar[orientation=vertical] > p-scrollarea-handle`; Host-Klasse `.sellers-page__list` bleibt. Task 2 und 3 bauen darauf auf.

- [ ] **Schritt 1: Spec anpassen (ResizeObserver-Stub, Import, neue Tests)**
  jsdom hat kein `ResizeObserver`; `ScrollArea` legt in `onAfterViewInit` einen an. In `sellers-page.spec.ts`:

  a) Imports ergänzen: nach der Zeile `import { signal } from '@angular/core';` die erste, nach der Zeile `import { ConfirmationService, MessageService } from 'primeng/api';` die zweite Zeile:
  ```ts
  import { By } from '@angular/platform-browser';
  ```
  ```ts
  import { ScrollArea } from 'primeng/scrollarea';
  ```
  b) Direkt nach der Zeile `import { ReleaseApi } from '../../data/release-api';` (vor `function buildDetail`) den Modul-Stub einfügen, gleiches Muster wie `intake-page.spec.ts` und `intake-wizard.spec.ts` (Klasse `ResizeObserverStub` auf Modulebene, Zuweisung an `globalThis.ResizeObserver`; kein `vi.stubGlobal`, kein `afterEach`):
  ```ts

  // PrimeNG `ScrollArea` observes its viewport via `ResizeObserver` (setupResizeObserver in
  // primeng-scrollarea.mjs) — unavailable in jsdom. Same stub as `intake-page.spec.ts` and
  // `intake-wizard.spec.ts`; tests that need overflow call `ScrollArea.refresh()` directly.
  class ResizeObserverStub {
    observe(): void {
      // no-op: not exercised by these tests, only needed so PrimeNG's ScrollArea doesn't throw.
    }
    unobserve(): void {
      // no-op, see observe().
    }
    disconnect(): void {
      // no-op, see observe().
    }
  }
  (globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;
  ```
  c) Den bestehenden Test `it('renders the tiles inside the scrolling list without a paginator', …)` ersetzen durch (die Hilfsfunktionen `listStyleRules` und `renderWithViewportSize` stehen im selben `describe`; `listStyleRules` liest die Regeln für `.sellers-page__list` aus den von Angular in `document.head` eingehängten Component-Styles, `renderWithViewportSize` setzt die Viewport-Maße per `Object.defineProperty` und ruft die öffentliche Methode `ScrollArea.refresh()`, die dieselbe Berechnung wie der ResizeObserver-Callback ausführt):
  ```ts
    /** Regeln der Component-Styles für `.sellers-page__list`, jeweils mit ihrer Media-Query (oder null). */
    function listStyleRules(): { media: string | null; style: CSSStyleDeclaration }[] {
      const found: { media: string | null; style: CSSStyleDeclaration }[] = [];
      const collect = (rules: CSSRuleList, media: string | null): void => {
        for (const rule of Array.from(rules)) {
          if ('media' in rule && 'cssRules' in rule) {
            const mediaRule = rule as CSSMediaRule;
            collect(mediaRule.cssRules, mediaRule.media.mediaText);
          } else if (
            'selectorText' in rule &&
            (rule as CSSStyleRule).selectorText.includes('.sellers-page__list')
          ) {
            found.push({ media, style: (rule as CSSStyleRule).style });
          }
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        collect(sheet.cssRules, null);
      }
      return found;
    }

    async function renderWithViewportSize(clientHeight: number, scrollHeight: number): Promise<HTMLElement> {
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;
      const viewport = el.querySelector('p-scrollarea-viewport') as HTMLElement;
      Object.defineProperty(viewport, 'clientHeight', { configurable: true, value: clientHeight });
      Object.defineProperty(viewport, 'scrollHeight', { configurable: true, value: scrollHeight });
      (fixture.debugElement.query(By.directive(ScrollArea)).componentInstance as ScrollArea).refresh();
      fixture.detectChanges();
      return el;
    }

    it('styles_from769px_giveKachellisteRemainingHeightWithoutNativeOverflow', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      await createPage();
      const desktopRules = listStyleRules().filter(
        (rule) => (rule.media ?? '').replace(/\s/g, '') === '(min-width:769px)',
      );

      // Assert
      expect(desktopRules.length).toBeGreaterThan(0);
      expect(desktopRules.some((rule) => rule.style.getPropertyValue('flex').trim().startsWith('1'))).toBe(true);
      expect(
        desktopRules.some((rule) => ['0', '0px'].includes(rule.style.getPropertyValue('min-height').trim())),
      ).toBe(true);
      expect(desktopRules.every((rule) => rule.style.getPropertyValue('overflow-y') === '')).toBe(true);
      expect(desktopRules.every((rule) => rule.style.getPropertyValue('overflow') === '')).toBe(true);
    });

    it('styles_upTo768px_giveKachellisteNoOwnScrollHeight', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      await createPage();
      const rules = listStyleRules();
      const baseRules = rules.filter((rule) => rule.media === null);
      const mediaRules = rules.filter((rule) => rule.media !== null);

      // Assert
      expect(rules.length).toBeGreaterThan(0);
      expect(
        mediaRules.every((rule) => (rule.media ?? '').replace(/\s/g, '') === '(min-width:769px)'),
      ).toBe(true);
      for (const rule of baseRules) {
        for (const property of ['height', 'max-height', 'min-height', 'flex', 'flex-grow', 'overflow', 'overflow-y']) {
          expect(rule.style.getPropertyValue(property)).toBe('');
        }
      }
    });

    it('refresh_withMoreTilesThanSpace_showsVerticalScrollbar', async () => {
      // Arrange
      const el = await renderWithViewportSize(600, 2000);

      // Act
      const scrollbar = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-scrollbar[data-orientation="vertical"]',
      ) as HTMLElement;
      const viewport = el.querySelector('p-scrollarea.sellers-page__list p-scrollarea-viewport') as HTMLElement;

      // Assert
      expect(scrollbar.style.display).not.toBe('none');
      expect(viewport.hasAttribute('data-scroll-y-after')).toBe(true);
    });

    it('refresh_withFewerTilesThanSpace_hidesVerticalScrollbar', async () => {
      // Arrange
      const el = await renderWithViewportSize(600, 300);

      // Act
      const scrollbar = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-scrollbar[data-orientation="vertical"]',
      ) as HTMLElement;
      const viewport = el.querySelector('p-scrollarea.sellers-page__list p-scrollarea-viewport') as HTMLElement;

      // Assert
      expect(scrollbar.style.display).toBe('none');
      expect(viewport.hasAttribute('data-scroll-y-after')).toBe(false);
    });

    it('render_withSellers_putsGridAndSentinelIntoScrollAreaContentWithoutPaginator', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      const content = el.querySelector(
        'p-scrollarea.sellers-page__list p-scrollarea-viewport p-scrollarea-content',
      );
      expect(content?.querySelector('.sellers-page__grid app-seller-card')).not.toBeNull();
      expect(content?.querySelector('[appLoadMoreSentinel]')).not.toBeNull();
      expect(el.querySelector('div.sellers-page__list')).toBeNull();
      expect(el.querySelector('p-paginator')).toBeNull();
    });

    it('render_withSellers_usesAutoScrollbarWithoutFadeMask', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const root = (fixture.nativeElement as HTMLElement).querySelector('p-scrollarea.sellers-page__list');

      // Assert
      expect(root?.getAttribute('data-variant')).toBe('auto');
      expect(root?.classList.contains('p-scrollarea-mask')).toBe(false);
      expect(
        root?.querySelector('p-scrollarea-scrollbar[data-orientation="vertical"] p-scrollarea-handle'),
      ).not.toBeNull();
    });

    it('render_withSellers_keepsFilterRowsOutsideScrollArea', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelectorAll('.sellers-page__filter-row').length).toBe(2);
      expect(el.querySelector('p-scrollarea .sellers-page__filter-row')).toBeNull();
    });

    it('cardClick_onTileInsideScrollArea_opensDetailModal', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      const { fixture, component } = await createPage();
      fixture.detectChanges();
      const tile = fixture.debugElement.query(By.css('p-scrollarea app-seller-card'));

      // Act
      tile.triggerEventHandler('cardClick', buildCard());

      // Assert
      expect(component.detailModalVisible()).toBe(true);
      expect(component.selectedCardForDetail()?.id).toBe('s1');
    });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL `render_withSellers_putsGridAndSentinelIntoScrollAreaContentWithoutPaginator`, `render_withSellers_usesAutoScrollbarWithoutFadeMask`, `render_withSellers_keepsFilterRowsOutsideScrollArea`, `cardClick_onTileInsideScrollArea_opensDetailModal`, `styles_from769px_giveKachellisteRemainingHeightWithoutNativeOverflow` (heute noch `overflow-y: auto`), `refresh_withMoreTilesThanSpace_showsVerticalScrollbar`, `refresh_withFewerTilesThanSpace_hidesVerticalScrollbar`; `styles_upTo768px_giveKachellisteNoOwnScrollHeight` ist schon grün und sichert die Media-Query-Grenze gegen Regression
- [ ] **Schritt 3: Minimal implementieren**
  a) `sellers-page.ts`: Import nach `import { SelectModule } from 'primeng/select';` ergänzen und in `imports` nach `SelectModule,` eintragen:
  ```ts
  import { ScrollAreaModule } from 'primeng/scrollarea';
  ```
  ```ts
      SelectModule,
      ScrollAreaModule,
  ```
  b) `sellers-page.html`: den Block `<div class="sellers-page__list"> … </div>` im letzten `@else` komplett ersetzen durch:
  ```html
    <p-scrollarea class="sellers-page__list" variant="auto" [mask]="false">
      <p-scrollarea-viewport>
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
  ```
  c) `sellers-page.scss`: die Regel `&__list { @media (min-width: 769px) { flex: 1; min-height: 0; overflow-y: auto; } }` ersetzen durch (der Scrollbereich liegt jetzt in der ScrollArea, kein nativer Überlauf; Rahmen und Hintergrund der ScrollArea entfallen, damit die Optik wie bisher bleibt; bis 768px hat der Host keine Höhenvorgabe, die ganze Seite scrollt):
  ```scss
    &__list {
      border: 0;
      background: transparent;

      @media (min-width: 769px) {
        flex: 1;
        min-height: 0;
      }
    }
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS aller Tests der Datei, darunter die acht neuen (AC-03: Scrollbar sichtbar bei Überlauf, unsichtbar ohne Überlauf; AC-04: keine Höhen-/Überlaufvorgabe bis 768px, Restflächen-Regel nur ab 769px) sowie die Regressionen `empty states` (AC-10: beide Hinweistexte), `cardClick` und `does not load more while loading or when everything is loaded`; die Nachlade-Logik (AC-05) prüft weiter `loads more when the list end is reached and more sellers exist`, die Lage des Sentinels im Content der neue Strukturtest
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.scss src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "feat(bazaar-app): Verkäufer-Kachelliste in PrimeNG ScrollArea (sellers-kachelliste-scrollarea)"`

### Task 2: Lade-Skeleton im Scrollbereich

**ACs:** AC-07

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html` · Block `<p-scrollarea-content>` (aus Task 1)
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts` · Konstante `DEBOUNCE_MS`, Dekorator `SellersPage`, Klasse `SellersPage` (Feld `noResultsForFilter`)
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)')`

**Interfaces:**
- Consumes: `p-scrollarea-content` aus Task 1; `SellersStore.loading` und `SellersStore.items` (Signals, bestehend); `SkeletonModule` aus `primeng/skeleton` (Input `height: string`).
- Produces: `SellersPage.showSkeleton: Signal<boolean>` = `loading() && items().length === 0`; `SellersPage.skeletonTiles: number[]` (Länge 6); DOM `p-scrollarea-content > .sellers-page__grid[aria-busy=true] > p-skeleton` (6×).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `sellers-page.spec.ts` am Ende des `describe('layout and infinite loading …')` (vor dessen schließendem `});`) einfügen:
  ```ts
    it('render_loadingWithoutSellers_showsSkeletonTilesInsideScrollAreaAndKeepsFilterRows', async () => {
      // Arrange
      loadingSignal.set(true);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelectorAll('p-scrollarea p-scrollarea-content p-skeleton').length).toBe(6);
      expect(el.querySelector('app-seller-card')).toBeNull();
      expect(el.querySelector('.sellers-page__sentinel')).toBeNull();
      expect(el.querySelectorAll('.sellers-page__filter-row').length).toBe(2);
    });

    it('render_loadingWithExistingSellers_keepsTilesAndShowsNoSkeleton', async () => {
      // Arrange
      itemsSignal.set([buildCard()]);
      totalCountSignal.set(1);
      loadingSignal.set(true);

      // Act
      const { fixture } = await createPage();
      fixture.detectChanges();
      const el: HTMLElement = fixture.nativeElement;

      // Assert
      expect(el.querySelector('p-skeleton')).toBeNull();
      expect(el.querySelector('p-scrollarea app-seller-card')).not.toBeNull();
    });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL `render_loadingWithoutSellers_showsSkeletonTilesInsideScrollAreaAndKeepsFilterRows` (der zweite Test ist schon grün, er sichert das Nicht-Ersetzen vorhandener Kacheln)
- [ ] **Schritt 3: Minimal implementieren**
  a) `sellers-page.ts`: Import nach `import { SelectModule } from 'primeng/select';` ergänzen, in `imports` nach `ScrollAreaModule,` eintragen:
  ```ts
  import { SkeletonModule } from 'primeng/skeleton';
  ```
  ```ts
      ScrollAreaModule,
      SkeletonModule,
  ```
  b) `sellers-page.ts`: nach `const DEBOUNCE_MS = 300;` einfügen:
  ```ts
  const SKELETON_TILE_COUNT = 6;
  ```
  c) `sellers-page.ts`: direkt nach dem Feld `noResultsForFilter` (Ende von `readonly noResultsForFilter = computed(…);`) einfügen:
  ```ts
    /** Erstladen: noch keine Kacheln, Request läuft — Skeleton statt leerem Grid. */
    readonly showSkeleton = computed(() => this.loading() && this.items().length === 0);

    readonly skeletonTiles = Array.from({ length: SKELETON_TILE_COUNT }, (_, i) => i);
  ```
  d) `sellers-page.html`: den Inhalt von `<p-scrollarea-content> … </p-scrollarea-content>` ersetzen durch (Skeleton nur bei leerer Liste; sonst Grid und Sentinel wie bisher):
  ```html
        <p-scrollarea-content>
          @if (showSkeleton()) {
            <div class="sellers-page__grid" aria-busy="true">
              @for (tile of skeletonTiles; track tile) {
                <p-skeleton height="9rem" />
              }
            </div>
          } @else {
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
          }
        </p-scrollarea-content>
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS aller Tests der Datei
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "feat(bazaar-app): Lade-Skeleton in der Verkäufer-Kachelliste (sellers-kachelliste-scrollarea)"`

### Task 3: Kachelliste nach Filterwechsel oben beginnen

**ACs:** AC-06

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts` · Imports aus `@angular/core`, Klasse `SellersPage` (Felder und `constructor`)
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `describe('layout and infinite loading (Layout-Vereinheitlichung Teil 1/3)')`

**Interfaces:**
- Consumes: `ScrollArea` aus `primeng/scrollarea` (Instanzfeld `viewportEl: HTMLElement | null`, gesetzt vom Viewport; Host-Element `p-scrollarea-viewport`); `SellersStore.filters` und `SellersStore.loading` (Signals, bestehend); `<p-scrollarea>` aus Task 1.
- Produces: privat in `SellersPage`: `scrollArea` (`viewChild(ScrollArea)`), `filterKey` (`computed<string>`), `resetScrollToTop(): void`. Kein öffentlicher Zugriff.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `sellers-page.spec.ts` am Ende des `describe('layout and infinite loading …')` einfügen. Der Viewport bekommt ein nachverfolgbares `scrollTop` (unabhängig vom jsdom-Verhalten):
  ```ts
    describe('scroll position', () => {
      async function renderScrolledList(): Promise<{
        fixture: Awaited<ReturnType<typeof createPage>>['fixture'];
        scrollTop: () => number;
      }> {
        itemsSignal.set([buildCard()]);
        totalCountSignal.set(1);
        const { fixture } = await createPage();
        fixture.detectChanges();
        const viewport = (fixture.nativeElement as HTMLElement).querySelector(
          'p-scrollarea-viewport',
        ) as HTMLElement;
        let top = 500;
        Object.defineProperty(viewport, 'scrollTop', {
          configurable: true,
          get: () => top,
          set: (value: number) => {
            top = value;
          },
        });
        return { fixture, scrollTop: () => top };
      }

      it('filterChange_afterNewListArrives_scrollsKachellisteToTop', async () => {
        // Arrange
        const { fixture, scrollTop } = await renderScrolledList();

        // Act
        filtersSignal.set({ ...filtersSignal(), q: 'meier' });
        loadingSignal.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        const topWhileLoading = scrollTop();
        loadingSignal.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(topWhileLoading).toBe(500);
        expect(scrollTop()).toBe(0);
      });

      it('sortChange_afterNewListArrives_scrollsKachellisteToTop', async () => {
        // Arrange
        const { fixture, scrollTop } = await renderScrolledList();

        // Act
        filtersSignal.set({ ...filtersSignal(), sort: 'revenue' });
        loadingSignal.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        loadingSignal.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(scrollTop()).toBe(0);
      });

      it('loadMore_withoutFilterChange_keepsScrollPosition', async () => {
        // Arrange
        const { fixture, scrollTop } = await renderScrolledList();

        // Act
        loadingSignal.set(true);
        fixture.detectChanges();
        await fixture.whenStable();
        loadingSignal.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        // Assert
        expect(scrollTop()).toBe(500);
      });
    });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: FAIL `filterChange_afterNewListArrives_scrollsKachellisteToTop` und `sortChange_afterNewListArrives_scrollsKachellisteToTop` (`loadMore_withoutFilterChange_keepsScrollPosition` ist schon grün und sichert „bisherige Kacheln bleiben an ihrer Position“)
- [ ] **Schritt 3: Minimal implementieren**
  In `sellers-page.ts`:

  a) Import aus `@angular/core` erweitern um `effect`, `untracked`, `viewChild` (alphabetisch in die vorhandene Liste einsortieren), und neu:
  ```ts
  import { ScrollArea, ScrollAreaModule } from 'primeng/scrollarea';
  ```
  (ersetzt die in Task 1 eingefügte Zeile `import { ScrollAreaModule } from 'primeng/scrollarea';`).

  b) In der Klasse `SellersPage` nach dem Feld `skeletonTiles` (aus Task 2) einfügen:
  ```ts
    private readonly scrollArea = viewChild(ScrollArea);

    /** Ändert sich bei Suche, Status oder Sortierung — nicht beim Nachladen. */
    private readonly filterKey = computed(() => {
      const { q, status, sort } = this.filters();
      return JSON.stringify([q, status, sort]);
    });

    private lastFilterKey = this.filterKey();
    private scrollResetPending = false;
  ```
  c) Im `constructor()` nach `this.sellersStore.load();` einfügen:
  ```ts
      // Neue Liste nach Filterwechsel beginnt oben: erst den Wechsel merken, dann beim Eintreffen
      // (loading false) den Viewport der ScrollArea zurücksetzen. Nachladen ändert den Key nicht.
      effect(() => {
        const key = this.filterKey();
        const loading = this.loading();
        untracked(() => {
          if (key !== this.lastFilterKey) {
            this.lastFilterKey = key;
            this.scrollResetPending = true;
          }
          if (this.scrollResetPending && !loading) {
            this.scrollResetPending = false;
            this.resetScrollToTop();
          }
        });
      });
  ```
  d) Als private Methode am Ende der Klasse (vor der schließenden `}`) einfügen:
  ```ts
    private resetScrollToTop(): void {
      const viewport = this.scrollArea()?.viewportEl;
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` — erwartet: PASS aller Tests der Datei
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `git commit -m "feat(bazaar-app): Kachelliste beginnt nach Filterwechsel oben (sellers-kachelliste-scrollarea)"`

### Task 4: Build, Lint und Gesamtlauf

**ACs:** AC-01

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `describe('SellersPage')`

**Interfaces:**
- Consumes: Ergebnisse aus Task 1 bis 3 (`p-scrollarea.sellers-page__list`, Scrollbar-Markup, Flex-Regel ab 769px).
- Produces: nichts (reiner Absicherungs-Task; Code unverändert).

- [ ] **Schritt 1: Absicherungstest nennen**
  AC-03 ist in Task 1 durch `refresh_withMoreTilesThanSpace_showsVerticalScrollbar` und `refresh_withFewerTilesThanSpace_hidesVerticalScrollbar` getestet (gestubbte Viewport-Maße, Scrollbar `display` und `data-scroll-y-after`), AC-04 durch `styles_upTo768px_giveKachellisteNoOwnScrollHeight` und `styles_from769px_giveKachellisteRemainingHeightWithoutNativeOverflow` (Regeln der Component-Styles für `.sellers-page__list`). Für AC-01 sichern `render_withSellers_keepsFilterRowsOutsideScrollArea` (Filterzeilen außerhalb der ScrollArea) und der Restflächen-Test (Höhe nur ab 769px, kein nativer Überlauf) den Aufbau; dass die Seite selbst bei 1440px nicht scrollt, hängt an echter Layout-Berechnung und bleibt Sichtprüfung bei 1440px in der Übergabe.
- [ ] **Schritt 2: Gesamtlauf der Prüfungen**
  Befehl: `dv-angular-build --root <R>/src/bazaar-app/frontend` — erwartet: OK (Template-Typprüfung für `p-scrollarea`, `p-scrollarea-viewport`, `p-scrollarea-content`, `p-scrollarea-scrollbar`, `p-scrollarea-handle`, `p-skeleton`)
  Befehl: `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend` — erwartet: PASS aller Testdateien; rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 3: Commit** (entfällt; keine Änderung)

## Entscheidungen
- **W · Skeleton** · Aussage — Das Skeleton erscheint nur bei leerer Liste (`loading()` und noch keine Kacheln): 6 `p-skeleton`-Platzhalter im Kachel-Grid innerhalb der ScrollArea. Bei Nachladen oder Filterwechsel mit vorhandenen Kacheln bleibt die alte Liste stehen, kein Skeleton.
- **W · Planungs-Skills** · Aussage — Es gelten angular-testing-vitest-conventions, angular-component/angular-signals und primeng; deren Kernregeln stehen unter Global Constraints.
- **W · Bestehender Plan** · Aussage — Die vorhandene `plan.md` (Commit dc337a3) wird überschrieben; dieser Plan ersetzt sie vollständig.
- **E · Grid statt Skeleton-Seite** · Planer — Das Skeleton nutzt dasselbe `.sellers-page__grid` wie die Kacheln, damit die Platzhalter an der Stelle der Kacheln stehen; Höhe `9rem` ist ein Schätzwert ohne Spec-Vorgabe.
- **E · Scroll-Reset über effect statt Store** · Planer — Der Reset liegt als `effect()` in `SellersPage`, weil nur die Seite die ScrollArea kennt; der Store bleibt unverändert. Er erkennt „Filter geändert“ am Key aus `q|status|sort` und „Liste eingetroffen“ am Ende von `loading`, damit Nachladen (Key gleich) die Position nicht verändert.
- **E · Rahmen/Hintergrund entfernt** · Planer — `.p-scrollarea` bringt Rahmen und Hintergrund mit; `.sellers-page__list` setzt `border: 0` und `background: transparent`, damit die Optik der Kachelliste unverändert bleibt.
- **E · Kein Browser-Test für AC-01/03/04** · Planer — Das Projekt hat keine E2E-Tests, jsdom misst kein Layout; der Plan sichert Aufbau und Build ab und weist die Sichtprüfung bei 1440px/768px in der Übergabe aus.
- **E · Glossar nicht angefasst** · Planer — `docs/glossary/frontend-terms.md` hat uncommittete Änderungen im Arbeitsbaum; der Eintrag „Kachelliste“ nennt `.sellers-page__list` weiter korrekt und wird in diesem Plan nicht geändert.
- **R1 · Global Constraints** — geändert — Neue Constraint „Layout-ACs in jsdom“. Task 1 bekommt vier Tests: `styles_upTo768px_giveKachellisteNoOwnScrollHeight` (AC-04: außerhalb der Media-Query keine Höhen-, Flex- oder Überlaufvorgabe, einzige Media-Query `(min-width: 769px)`), `styles_from769px_giveKachellisteRemainingHeightWithoutNativeOverflow` (ab 769px `flex: 1`, `min-height: 0`, kein `overflow`), `refresh_withMoreTilesThanSpace_showsVerticalScrollbar` und `refresh_withFewerTilesThanSpace_hidesVerticalScrollbar` (AC-03 beide Fälle inkl. Randfall; Viewport-Maße per `Object.defineProperty`, dann `ScrollArea.refresh()`; geprüft `display` der vertikalen Scrollbar und `data-scroll-y-after` am Viewport, beides laut `primeng-scrollarea.mjs` aus `computeHandle`). Task 4 nennt die neuen Tests und führt nur noch AC-01 (Seite scrollt nicht) als Sichtprüfung; der Eintrag „E · Kein Browser-Test für AC-01/03/04“ gilt damit nur noch für AC-01.
- **R1 · Task 1** — geändert — ResizeObserver-Stub an das vorhandene Muster aus `intake-page.spec.ts`/`intake-wizard.spec.ts` angeglichen: Modul-Klasse `ResizeObserverStub` nach dem Import von `ReleaseApi`, Zuweisung an `globalThis.ResizeObserver`; `vi.stubGlobal` und `afterEach` entfallen. Kein gemeinsamer Helper unter `shared/`, um den Umfang nicht zu erweitern. Anker der Dateiliste als reine Zeichenfolgen: html `sellers-page__list`, scss `&__list`, ts `imports`, spec `layout and infinite loading` (alle im Code vorhanden und eindeutig).
