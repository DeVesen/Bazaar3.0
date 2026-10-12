# Verkäuferliste Lade-Skeleton — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-12-sellers-lade-skeleton/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Die Seite „Verkäufer" der Haupt-App zeigt beim ersten Laden und beim Neuladen nach Suche-/Sortierung-/Statusfilter-Änderung 6 Platzhalter-Karten statt einer leeren Fläche.
**Architektur:** `SellersStore` besitzt einen read-only Zustand `showSkeleton`, den nur das erste Laden und `setFilters` einschalten und die jeweils jüngste Antwort (Erfolg oder Fehler) ausschaltet; Mutations-Reloads und `loadMore` berühren ihn nie. Eine neue Leaf-Komponente `app-seller-card-skeleton` bildet die Verkäuferkarte mit `p-skeleton` nach; `SellersPage` rendert bei `showSkeleton()` sechs davon samt Screenreader-Hinweis anstelle von Kartenliste und Leer-Hinweisen, die Filterleiste bleibt außerhalb der Umschaltung.
**Tech-Stack:** Angular (Signals, OnPush, Standalone), PrimeNG v22 (`p-skeleton`), Vitest, SCSS.
**Spec:** docs/forge/2026-10-12-sellers-lade-skeleton/spec.md
**Basis:** a758a32

## Global Constraints
- Spec: Gilt nur für die Seite „Verkäufer" der Haupt-App (Route „/sellers"); andere Seiten bleiben unverändert.
- Spec: Filterleiste, Karten, Leer-Hinweise und Fehlerverhalten bleiben sonst unverändert; bei Ladefehler keine neue Fehlermeldung.
- Spec: Feste Zahl von 6 Platzhalter-Karten; jede bildet die Verkäuferkarte nach (Namenszeile, Adresse, Status, vier Kennzahlen, Fußzeile mit drei Werten).
- Spec: Screenreader-Hinweis exakt „Verkäufer werden geladen", solange die Platzhalter stehen.
- Spec: Platzhalter nur beim ersten Öffnen und beim komplett neu geholten Ergebnis nach Änderung von Suche, Sortierung oder Statusfilter; nie bei Aktualisierung nach Speichern/Löschen/Freigabe und nie beim Nachladen am Listenende.
- Projekt-`CLAUDE.md`: Code, Routen und JSON-Contract englisch, Doku deutsch; UI nur mit PrimeNG (hier `p-skeleton` aus `primeng/skeleton`).
- Frontend-`package.json` (`"test": "ng test"`, Builder `@angular/build:unit-test` in `angular.json`): Tests im Verzeichnis `src/bazaar-app/frontend` über `npx ng test --include <Pfad> --watch=false` (Bash-Tool). Vor dem ersten Testschritt einmal prüfen, dass `--include` mit dem Vitest-Builder greift (Ausgabe nennt nur die angegebene Spec-Datei); greift es nicht, in jedem Testschritt `npx ng test --watch=false` ohne `--include` laufen lassen und die erwartete Ausgabe an den genannten Tests der Datei ablesen.
- dv-angular:angular-component: `ChangeDetectionStrategy.OnPush`, kein `standalone: true`, native Control-Flow (`@if`/`@for`, kein `*ngIf`), Host-Bindings über `host`-Objekt, kein `ngClass`/`ngStyle`.
- dv-angular:angular-signal-architecture: Store besitzt den schreibbaren Zustand und gibt nur `asReadonly()` heraus; kein `effect()` zum Synchronisieren von Signalen.
- dv-angular:angular-testing-vitest-conventions: Vitest (`vi.fn()`), AAA mit Kommentaren `// Arrange` / `// Act` / `// Assert`, neue `it`-Namen `<methode>_<situation>_<erwartung>`, zoneless Act → `await fixture.whenStable()` → Assert, Specs neben der Quelle.
- primeng (v22): `SkeletonModule` aus `primeng/skeleton`, Props `width`, `height`, `borderRadius` (api.md der Komponente `skeleton`); `p-skeleton` ist von sich aus `aria-hidden`.

---

### Task 1: SellersStore — Zustand `showSkeleton`

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-09

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/sellers-store.ts:51-123` · `SellersStore.requestSequence`, `SellersStore.load`, `SellersStore.setFilters`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/sellers-store.spec.ts` · `describe('stale response guard (request sequence)'`

**Interfaces:**
- Consumes: bestehend `SellersStore.load(): void`, `SellersStore.loadMore(): void`, `SellersStore.setFilters(partial: Partial<SellersFilters>): void`, `SellersApi.getCards(...)`.
- Produces: `SellersStore.showSkeleton: Signal<boolean>` (read-only); `SellersStore.load(options?: { skeleton?: boolean }): void` — Default `{}`, `load()` ohne Argument bleibt gültig.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `sellers-store.spec.ts` direkt **vor** `describe('create', () => {` einfügen (`Subject`, `of`, `throwError`, `sellerCard`, `getCards`, `createStore` sind in der Datei bereits vorhanden):
  ```ts
  describe('showSkeleton', () => {
    interface CardsResponse {
      items: SellerCard[];
      totalCount: number;
      page: number;
      pageSize: number;
    }

    function response(ids: string[], totalCount = ids.length): CardsResponse {
      return {
        items: ids.map((id) => sellerCard({ id })),
        totalCount,
        page: 1,
        pageSize: 60,
      };
    }

    it('load_firstLoadPending_showsSkeletonUntilResponseArrives', () => {
      // Arrange
      const response$ = new Subject<CardsResponse>();
      getCards.mockReturnValue(response$.asObservable());
      const store = createStore();

      // Act
      store.load();
      const whilePending = store.showSkeleton();
      response$.next(response(['s1']));

      // Assert
      expect(whilePending).toBe(true);
      expect(store.showSkeleton()).toBe(false);
      expect(store.items().map((s) => s.id)).toEqual(['s1']);
    });

    it('load_firstLoadFails_hidesSkeletonWithoutItems', () => {
      // Arrange
      const response$ = new Subject<CardsResponse>();
      getCards.mockReturnValue(response$.asObservable());
      const store = createStore();
      store.load();

      // Act
      response$.error(new Error('boom'));

      // Assert
      expect(store.showSkeleton()).toBe(false);
      expect(store.loading()).toBe(false);
      expect(store.items()).toEqual([]);
    });

    it('load_emptyResultAfterFirstLoad_hidesSkeleton', () => {
      // Arrange
      getCards.mockReturnValue(of(response([], 0)));
      const store = createStore();

      // Act
      store.load();

      // Assert
      expect(store.showSkeleton()).toBe(false);
      expect(store.totalCount()).toBe(0);
    });

    it('setFilters_afterInitialLoad_showsSkeletonUntilNewListArrives', () => {
      // Arrange
      getCards.mockReturnValueOnce(of(response(['s1', 's2'])));
      const store = createStore();
      store.load();
      const reload$ = new Subject<CardsResponse>();
      getCards.mockReturnValueOnce(reload$.asObservable());

      // Act
      store.setFilters({ q: 'mei' });
      const whilePending = store.showSkeleton();
      reload$.next(response(['s9']));

      // Assert
      expect(whilePending).toBe(true);
      expect(store.showSkeleton()).toBe(false);
      expect(store.items().map((s) => s.id)).toEqual(['s9']);
    });

    it('setFilters_reloadFails_hidesSkeleton', () => {
      // Arrange
      getCards.mockReturnValueOnce(of(response(['s1'])));
      const store = createStore();
      store.load();
      const reload$ = new Subject<CardsResponse>();
      getCards.mockReturnValueOnce(reload$.asObservable());
      store.setFilters({ status: 'open' });

      // Act
      reload$.error(new Error('boom'));

      // Assert
      expect(store.showSkeleton()).toBe(false);
      expect(store.loading()).toBe(false);
    });

    it('load_reloadAfterInitialLoad_keepsSkeletonHiddenAndItemsVisible', () => {
      // Arrange
      getCards.mockReturnValueOnce(of(response(['s1', 's2'])));
      const store = createStore();
      store.load();
      const reload$ = new Subject<CardsResponse>();
      getCards.mockReturnValueOnce(reload$.asObservable());

      // Act
      store.load();

      // Assert
      expect(store.loading()).toBe(true);
      expect(store.showSkeleton()).toBe(false);
      expect(store.items().map((s) => s.id)).toEqual(['s1', 's2']);
    });

    it('loadMore_afterInitialLoad_keepsSkeletonHidden', () => {
      // Arrange
      getCards.mockReturnValueOnce(of(response(['s1'], 2)));
      const store = createStore();
      store.load();
      const more$ = new Subject<CardsResponse>();
      getCards.mockReturnValueOnce(more$.asObservable());

      // Act
      store.loadMore();

      // Assert
      expect(store.loading()).toBe(true);
      expect(store.showSkeleton()).toBe(false);
      expect(store.items().map((s) => s.id)).toEqual(['s1']);
    });

    it('load_filterChangeSupersededByReload_keepsSkeletonUntilLatestResponse', () => {
      // Arrange
      getCards.mockReturnValueOnce(of(response(['s1'])));
      const store = createStore();
      store.load();
      const filtered$ = new Subject<CardsResponse>();
      const reload$ = new Subject<CardsResponse>();
      getCards.mockReturnValueOnce(filtered$.asObservable());
      getCards.mockReturnValueOnce(reload$.asObservable());
      store.setFilters({ q: 'x' });

      // Act
      store.load();
      filtered$.next(response(['stale']));
      const afterStaleResponse = store.showSkeleton();
      reload$.next(response(['fresh']));

      // Assert
      expect(afterStaleResponse).toBe(true);
      expect(store.showSkeleton()).toBe(false);
      expect(store.items().map((s) => s.id)).toEqual(['fresh']);
    });
  });

  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl (in `src/bazaar-app/frontend`): `npx ng test --include src/app/features/sellers/sellers-store.spec.ts --watch=false` — erwartet: FAIL (Kompilierfehler TS2339 „Property 'showSkeleton' does not exist on type 'SellersStore'" bzw. FAIL der Tests unter `showSkeleton`)
- [ ] **Schritt 3: Minimal implementieren**
  In `sellers-store.ts`:

  (a) Nach der Zeile `private requestSequence = 0;` einfügen:
  ```ts

    private readonly skeletonVisible = signal(false);

    /**
     * Platzhalter-Karten statt Kartenliste: nur beim allerersten Laden und bei einer komplett
     * neu geholten Liste nach `setFilters` (Suche/Sortierung/Statusfilter). Reloads nach
     * Mutationen und `loadMore()` lassen ihn aus, damit die Karten und die Scroll-Position
     * stehen bleiben. Die jeweils jüngste Antwort (Erfolg oder Fehler) schaltet ihn aus.
     */
    readonly showSkeleton = this.skeletonVisible.asReadonly();

    private loadedOnce = false;
  ```

  (b) `load()` ersetzen durch:
  ```ts
    /** Lädt alle bisher nachgeladenen Seiten in einem Request neu (Seite 1, pageSize × page). */
    load(options: { skeleton?: boolean } = {}): void {
      const sequence = ++this.requestSequence;
      this.loading.set(true);
      if (options.skeleton || !this.loadedOnce) {
        this.skeletonVisible.set(true);
      }
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
            if (sequence !== this.requestSequence) return;
            if (response.items.length < response.totalCount) {
              // Backend deckelt eine Seite auf `SellerCardsQuery.MaxPageSize = 200`
              // (Bazaar.Infrastructure/Persistence/Repositories/SellerCardsQuery.cs). Eine Anfrage
              // über 200 hinaus liefert also weniger Items als angefordert zurück — nur volle
              // `pageSize`-Seiten behalten, sonst würden die fehlenden Karten beim nächsten
              // `loadMore()` klaffend übersprungen (die nächste Seite fängt hinter dem Cap an).
              const fullPages = Math.max(1, Math.floor(response.items.length / this.pageSize()));
              this.items.set(response.items.slice(0, fullPages * this.pageSize()));
              this.page.set(fullPages);
            } else {
              this.items.set(response.items);
            }
            this.totalCount.set(response.totalCount);
            this.loading.set(false);
            this.loadedOnce = true;
            this.skeletonVisible.set(false);
          },
          error: () => {
            if (sequence !== this.requestSequence) return;
            this.loading.set(false);
            this.loadedOnce = true;
            this.skeletonVisible.set(false);
          },
        });
    }
  ```

  (c) In `setFilters` die Zeile `this.load();` ersetzen durch `this.load({ skeleton: true });`.
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl (in `src/bazaar-app/frontend`): `npx ng test --include src/app/features/sellers/sellers-store.spec.ts --watch=false` — erwartet: PASS (alle Tests der Datei, auch die bestehenden)
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/sellers-store.ts src/bazaar-app/frontend/src/app/features/sellers/sellers-store.spec.ts` · `git commit -m "feat(bazaar-app): SellersStore steuert Lade-Skeleton der Verkäuferliste (000000)"`

---

### Task 2: Komponente `app-seller-card-skeleton`

**ACs:** AC-07

**Dateien:**
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card-skeleton/seller-card-skeleton.ts`
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card-skeleton/seller-card-skeleton.html`
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card-skeleton/seller-card-skeleton.scss`
- Create: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-card-skeleton/seller-card-skeleton.spec.ts`

**Interfaces:**
- Consumes: `SkeletonModule` aus `primeng/skeleton` (bereits in `shared/components/table/table.ts` im Einsatz).
- Produces: `SellerCardSkeleton` (Selektor `app-seller-card-skeleton`, keine Inputs/Outputs, Host `aria-hidden="true"`); Bereichs-Klassen `.seller-card-skeleton__name`, `__address`, `__status`, `__stats` mit vier `__stat`, `__footer` mit drei `__footer-item`.

- [ ] **Schritt 1: Fehlschlagenden Test schreiben**
  `seller-card-skeleton.spec.ts`:
  ```ts
  import { TestBed } from '@angular/core/testing';
  import { SellerCardSkeleton } from './seller-card-skeleton';

  describe('SellerCardSkeleton', () => {
    async function render(): Promise<HTMLElement> {
      await TestBed.configureTestingModule({ imports: [SellerCardSkeleton] }).compileComponents();
      const fixture = TestBed.createComponent(SellerCardSkeleton);
      await fixture.whenStable();
      return fixture.nativeElement as HTMLElement;
    }

    it('render_default_showsAreasForNameAddressStatusFourStatsAndThreeFooterValues', async () => {
      // Arrange / Act
      const host = await render();

      // Assert
      const single = (cls: string) => host.querySelectorAll(`.seller-card-skeleton__${cls}`);
      expect(single('name').length).toBe(1);
      expect(single('address').length).toBe(1);
      expect(single('status').length).toBe(1);
      expect(single('stat').length).toBe(4);
      expect(single('footer-item').length).toBe(3);
    });

    it('render_default_fillsEveryAreaWithPSkeleton', async () => {
      // Arrange / Act
      const host = await render();

      // Assert
      const areas = host.querySelectorAll(
        '.seller-card-skeleton__name, .seller-card-skeleton__address, .seller-card-skeleton__status, .seller-card-skeleton__stat, .seller-card-skeleton__footer-item',
      );
      expect(areas.length).toBe(10);
      areas.forEach((area) => {
        expect(area.querySelectorAll('p-skeleton').length).toBeGreaterThan(0);
      });
    });

    it('render_default_marksHostAriaHiddenSoScreenReadersSkipIt', async () => {
      // Arrange / Act
      const host = await render();

      // Assert
      expect(host.getAttribute('aria-hidden')).toBe('true');
    });
  });
  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl (in `src/bazaar-app/frontend`): `npx ng test --include src/app/features/sellers/components/seller-card-skeleton/seller-card-skeleton.spec.ts --watch=false` — erwartet: FAIL (Modul `./seller-card-skeleton` nicht gefunden)
- [ ] **Schritt 3: Minimal implementieren**
  `seller-card-skeleton.ts`:
  ```ts
  import { ChangeDetectionStrategy, Component } from '@angular/core';
  import { SkeletonModule } from 'primeng/skeleton';

  /**
   * Platzhalter für eine Verkäuferkarte (`app-seller-card`) während die Liste lädt. Gleiche
   * Bereiche in gleicher Anordnung: Namenszeile, Adresse, Status, vier Kennzahlen, Fußzeile
   * mit drei Werten. Rein dekorativ — der Screenreader-Hinweis steht einmal an der Seite.
   */
  @Component({
    selector: 'app-seller-card-skeleton',
    imports: [SkeletonModule],
    templateUrl: './seller-card-skeleton.html',
    styleUrl: './seller-card-skeleton.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'aria-hidden': 'true' },
  })
  export class SellerCardSkeleton {
    readonly statSlots = [0, 1, 2, 3];
    readonly footerSlots = [0, 1, 2];
  }
  ```
  `seller-card-skeleton.html`:
  ```html
  <div class="seller-card-skeleton">
    <div class="seller-card-skeleton__name">
      <p-skeleton width="60%" height="1.25rem" />
    </div>

    <div class="seller-card-skeleton__address">
      <p-skeleton width="45%" height="0.875rem" />
    </div>

    <div class="seller-card-skeleton__status">
      <p-skeleton width="5rem" height="1.5rem" borderRadius="1rem" />
    </div>

    <div class="seller-card-skeleton__stats">
      @for (slot of statSlots; track slot) {
        <div class="seller-card-skeleton__stat">
          <p-skeleton width="50%" height="0.75rem" />
          <p-skeleton width="30%" height="1rem" />
        </div>
      }
    </div>

    <div class="seller-card-skeleton__footer">
      @for (slot of footerSlots; track slot) {
        <div class="seller-card-skeleton__footer-item">
          <p-skeleton width="70%" height="0.75rem" />
          <p-skeleton width="50%" height="1rem" />
        </div>
      }
    </div>
  </div>
  ```
  `seller-card-skeleton.scss` (Abstände, Raster und Rahmen wie `seller-card.scss`, damit die Anordnung gleich ist):
  ```scss
  :host {
    display: block;
  }

  p-skeleton {
    display: block;
  }

  .seller-card-skeleton {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--p-content-border-color);
    background: var(--p-content-background);

    &__status {
      display: flex;
    }

    &__stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    &__stat,
    &__footer-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    &__footer {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
      border-top: 1px solid var(--p-content-border-color);
      padding-top: 0.75rem;
    }
  }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl (in `src/bazaar-app/frontend`): `npx ng test --include src/app/features/sellers/components/seller-card-skeleton/seller-card-skeleton.spec.ts --watch=false` — erwartet: PASS (3 Tests)
- [ ] **Schritt 5: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/components/seller-card-skeleton` · `git commit -m "feat(bazaar-app): Platzhalter-Komponente für die Verkäuferkarte (000000)"`

---

### Task 3: SellersPage zeigt Platzhalter

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-08, AC-09, AC-10

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.ts:23-137` · `SellersPage` (Imports, `imports`-Array, Feld `loading`)
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.html:55-91` · `@if (noSellersAtAll()) {`
- Modify: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.scss:13-23` · `&__list`
- Test: `src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts` · `describe('SellersPage'` (`beforeEach`, `describe('empty states'`)

**Interfaces:**
- Consumes: `SellersStore.showSkeleton: Signal<boolean>` (Task 1); `SellerCardSkeleton` mit Selektor `app-seller-card-skeleton` (Task 2).
- Produces: `SellersPage.showSkeleton: Signal<boolean>`, `SellersPage.skeletonSlots: number[]` (Länge 6).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `sellers-page.spec.ts`:

  (a) Nach `let hasMoreSignal: ReturnType<typeof signal<boolean>>;` einfügen:
  ```ts
    let showSkeletonSignal: ReturnType<typeof signal<boolean>>;
  ```
  (b) Nach `hasMoreSignal = signal(false);` einfügen:
  ```ts
      showSkeletonSignal = signal(false);
  ```
  (c) Im Store-Mock nach `hasMore: hasMoreSignal,` einfügen:
  ```ts
            showSkeleton: showSkeletonSignal,
  ```
  (d) Direkt **vor** `describe('scan', () => {` einfügen:
  ```ts
  describe('loading skeleton', () => {
    const SKELETON = 'app-seller-card-skeleton';
    const CARD = 'app-seller-card';

    function count(fixture: { nativeElement: unknown }, selector: string): number {
      return (fixture.nativeElement as HTMLElement).querySelectorAll(selector).length;
    }

    async function settle(fixture: { detectChanges(): void; whenStable(): Promise<unknown> }) {
      fixture.detectChanges();
      await fixture.whenStable();
    }

    function twoCards(): void {
      itemsSignal.set([buildCard({ id: 's1' }), buildCard({ id: 's2' })]);
      totalCountSignal.set(2);
    }

    it('render_firstOpenWhileLoading_showsSixPlaceholderCardsAndNoCards', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);

      // Act
      const { fixture } = await createPage();

      // Assert
      expect(count(fixture, SKELETON)).toBe(6);
      expect(count(fixture, CARD)).toBe(0);
    });

    it('render_listLoaded_replacesPlaceholdersWithCards', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();

      // Act
      twoCards();
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(0);
      expect(count(fixture, CARD)).toBe(2);
    });

    it('render_filterChangeWithCardsShown_replacesCardsWithSixPlaceholders', async () => {
      // Arrange
      twoCards();
      const { fixture } = await createPage();
      expect(count(fixture, CARD)).toBe(2);

      // Act
      loadingSignal.set(true);
      showSkeletonSignal.set(true);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(6);
      expect(count(fixture, CARD)).toBe(0);
    });

    it('render_backgroundRefreshWithoutSkeleton_keepsSameCardsAndListElement', async () => {
      // Arrange
      twoCards();
      const { fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;
      const listBefore = host.querySelector('.sellers-page__list');
      const cardBefore = host.querySelector(CARD);

      // Act
      loadingSignal.set(true);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(0);
      expect(count(fixture, CARD)).toBe(2);
      expect(host.querySelector('.sellers-page__list')).toBe(listBefore);
      expect(host.querySelector(CARD)).toBe(cardBefore);
    });

    it('onLoadMore_atListEnd_keepsExistingCardsAndShowsNoPlaceholders', async () => {
      // Arrange
      twoCards();
      hasMoreSignal.set(true);
      const { component, fixture } = await createPage();
      const cardBefore = (fixture.nativeElement as HTMLElement).querySelector(CARD);

      // Act
      component.onLoadMore();
      loadingSignal.set(true);
      await settle(fixture);

      // Assert
      expect(loadMore).toHaveBeenCalledTimes(1);
      expect(count(fixture, SKELETON)).toBe(0);
      expect(count(fixture, CARD)).toBe(2);
      expect((fixture.nativeElement as HTMLElement).querySelector(CARD)).toBe(cardBefore);
    });

    it('render_emptyResultWithoutFilters_showsNoSellersHintInsteadOfPlaceholders', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();
      expect(count(fixture, SKELETON)).toBe(6);

      // Act
      totalCountSignal.set(0);
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(count(fixture, SKELETON)).toBe(0);
      expect(text).toContain('Noch keine Verkäufer.');
    });

    it('render_emptyResultWithActiveFilter_showsNoResultsHintInsteadOfPlaceholders', async () => {
      // Arrange
      filtersSignal.set({ q: 'xyz', status: null, sort: 'name' });
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();
      expect(count(fixture, SKELETON)).toBe(6);

      // Act
      totalCountSignal.set(0);
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(count(fixture, SKELETON)).toBe(0);
      expect(text).toContain('Keine Verkäufer für die gewählten Filter.');
    });

    it('render_skeletonVisible_keepsFilterControlsUsableAndSearchFieldFocused', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { component, fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;
      const search = host.querySelector('input[type="text"]') as HTMLInputElement;
      search.focus();

      // Act
      search.value = 'ma';
      search.dispatchEvent(new Event('input'));
      await settle(fixture);

      // Assert
      expect(host.querySelector('input[type="text"]')).toBe(search);
      expect(document.activeElement).toBe(search);
      expect(component.qInput()).toBe('ma');
      expect(host.querySelectorAll('.sellers-page p-select').length).toBe(2);
      const newButton = Array.from(host.querySelectorAll('button')).find((b) =>
        b.textContent?.includes('+ Neu'),
      );
      expect(newButton).toBeDefined();
      newButton?.click();
      expect(component.dialogVisible()).toBe(true);
    });

    it('render_loadFailsWhileSkeletonShown_removesPlaceholdersWithoutNewMessage', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();

      // Act
      loadingSignal.set(false);
      showSkeletonSignal.set(false);
      await settle(fixture);

      // Assert
      expect(count(fixture, SKELETON)).toBe(0);
      expect(messageServiceAdd).not.toHaveBeenCalled();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain('Noch keine Verkäufer.');
    });

    it('render_skeletonVisible_announcesLoadingStatusAndDropsItWithPlaceholders', async () => {
      // Arrange
      showSkeletonSignal.set(true);
      loadingSignal.set(true);
      const { fixture } = await createPage();
      const host = fixture.nativeElement as HTMLElement;
      const status = host.querySelector('[role="status"]');
      expect(status?.textContent).toContain('Verkäufer werden geladen');

      // Act
      showSkeletonSignal.set(false);
      loadingSignal.set(false);
      await settle(fixture);

      // Assert
      expect(host.querySelector('[role="status"]')).toBeNull();
      expect(host.textContent).not.toContain('Verkäufer werden geladen');
    });
  });

  ```
- [ ] **Schritt 2: Test rot laufen lassen**
  Befehl (in `src/bazaar-app/frontend`): `npx ng test --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts --watch=false` — erwartet: FAIL (Tests unter `loading skeleton`, z. B. `render_firstOpenWhileLoading_showsSixPlaceholderCardsAndNoCards`; die bestehenden Tests bleiben PASS)
- [ ] **Schritt 3: Minimal implementieren**
  `sellers-page.ts`:

  (a) Nach der Zeile `import { LoadMoreSentinel } from '../../components/load-more-sentinel/load-more-sentinel';` einfügen:
  ```ts
  import { SellerCardSkeleton } from '../../components/seller-card-skeleton/seller-card-skeleton';
  ```
  (b) Nach `const DEBOUNCE_MS = 300;` einfügen:
  ```ts

  /** Anzahl Platzhalter-Karten, solange die Liste lädt (Spec: feste Zahl 6). */
  const SKELETON_CARD_COUNT = 6;
  ```
  (c) Im `imports`-Array nach `SellerCard,` einfügen:
  ```ts
      SellerCardSkeleton,
  ```
  (d) Nach `readonly loading = this.sellersStore.loading;` einfügen:
  ```ts
    readonly showSkeleton = this.sellersStore.showSkeleton;
    readonly skeletonSlots = Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => index);
  ```
  `sellers-page.html`: Die Zeile `  @if (noSellersAtAll()) {` (Beginn des Listen-/Leer-Blocks) ersetzen durch:
  ```html
    @if (showSkeleton()) {
      <div class="sellers-page__list" role="status">
        <span class="sellers-page__sr-only">Verkäufer werden geladen</span>
        <div class="sellers-page__grid">
          @for (slot of skeletonSlots; track slot) {
            <app-seller-card-skeleton />
          }
        </div>
      </div>
    } @else if (noSellersAtAll()) {
  ```
  (der Rest des Blocks — `} @else if (noResultsForFilter()) {` … `}` — bleibt unverändert).

  `sellers-page.scss`: Nach dem `&__sentinel { height: 1px; }`-Block einfügen:
  ```scss

    // Nur für Screenreader: Hinweis „Verkäufer werden geladen“ neben den Platzhalter-Karten.
    &__sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  ```
- [ ] **Schritt 4: Test grün laufen lassen**
  Befehl (in `src/bazaar-app/frontend`): `npx ng test --include src/app/features/sellers/pages/sellers-page/sellers-page.spec.ts --watch=false` — erwartet: PASS (alle Tests der Datei, neue und bestehende)
- [ ] **Schritt 5: Gesamtlauf Verkäufer-Feature**
  Befehl (in `src/bazaar-app/frontend`): `npx ng test --include "src/app/features/sellers/**/*.spec.ts" --watch=false` — erwartet: PASS (alle Specs unter `features/sellers`)
- [ ] **Schritt 6: Commit**
  `git add src/bazaar-app/frontend/src/app/features/sellers/pages/sellers-page` · `git commit -m "feat(bazaar-app): Verkäuferliste zeigt beim Laden Platzhalter-Karten (000000)"`

## Entscheidungen
- **W · Planungs-Skills** · Aussage — Angular-Set: `dv-angular:angular-component`, `dv-angular:angular-signal-architecture`, `dv-angular:angular-testing-vitest-conventions`, `primeng`; ihre Kernregeln stehen unter Global Constraints.
- **E · Zustand im Store, nicht in der Seite** · Planer — Nur der Store kennt Erstladen, Filterwechsel, Mutations-Reload und veraltete Antworten (`requestSequence`); die jüngste Antwort schaltet `showSkeleton` aus, so bleibt es auch bei überholten Requests korrekt. Die Seite liest nur das Signal.
- **E · „Erstes Öffnen" = erstes Laden des Stores** · Planer — Der Store ist `providedIn: 'root'`; öffnet der Anwender die Seite später erneut, stehen die alten Karten bereits und werden im Hintergrund aktualisiert (kein Platzhalter), wie bisher. Ein Fehler beim ersten Laden zählt als abgeschlossenes Erstladen (AC-09: Platzhalter weg, Verhalten wie heute).
- **E · Eigene Leaf-Komponente `app-seller-card-skeleton`** · Planer — `app-seller-card` hat ein `input.required<SellerCard>` und viele Outputs; ein Platzhalter-Modus dort würde sie aufblähen. Das SCSS wiederholt Abstände und Raster der Karte bewusst (ca. 30 Zeilen), statt ein gemeinsames Partial einzuführen.
- **E · Screenreader-Hinweis als `role="status"` mit visuell verstecktem Text** · Planer — Liegt am Listen-Container der Platzhalter und verschwindet mit ihm; die Platzhalter-Karten selbst sind `aria-hidden`. Es gibt keine globale `sr-only`-Klasse, deshalb steht sie lokal in `sellers-page.scss`.
- **F · Global Constraints** — geändert — Vorschlag 1: Die Testvorgabe stützt sich jetzt auf die Frontend-`package.json` (`"test": "ng test"`) und den Builder `@angular/build:unit-test` statt auf eine nicht vorhandene CLAUDE.md-Regel; alle Testschritte nutzen `npx ng test --include <Pfad> --watch=false` in `src/bazaar-app/frontend`, mit einmaliger Vorabprüfung von `--include` und Rückfall auf den Gesamtlauf ohne `--include`.
