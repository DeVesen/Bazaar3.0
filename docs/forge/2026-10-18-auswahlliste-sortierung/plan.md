# Auswahlliste nach Artikelnummer sortiert — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-18-auswahlliste-sortierung/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Der Server liefert die Artikel eines Verkäufers aufsteigend nach Artikelnummer, sodass die Auswahlliste im Scan-Dialog und die Artikeltabelle der Detail-Ansicht in dieser Reihenfolge erscheinen.
**Architektur:** Die einzige Code-Änderung ist ein `OrderBy(a => a.Number)` im Query-Port `ArticlesBySellerQuery` der Haupt-App (Backend). Das Frontend übernimmt die Server-Reihenfolge ohne zweite Sortierung (`scan-dialog.ts`, `seller-detail-modal`); Abrechnung und Druck sortieren schon selbst und bleiben unverändert. Frontend-ACs werden durch Absicherungstests belegt, Dokumentation läuft in einem eigenen Task mit.
**Tech-Stack:** .NET 10 / EF Core (xUnit v3, InMemory-Provider), Angular mit PrimeNG, Vitest
**Spec:** docs/forge/2026-10-18-auswahlliste-sortierung/spec.md
**Basis:** a248d09d

## Global Constraints
- Der Server liefert die Artikel eines Verkäufers immer aufsteigend nach Artikelnummer. Jede Ansicht, die diese Liste ohne eigene Sortierung nutzt, übernimmt die Reihenfolge. (Spec, Soll-Vorgabe 1)
- Die Sortierung ist numerisch (2 vor 10). Die Artikelnummer ist je Artikel eindeutig, Gleichstände gibt es nicht. (Spec, Soll-Vorgabe 2)
- Artikeltabelle der Abrechnung und Druck (Abgabe-Beleg, Verkäufer-Übersicht) zeigen keine sichtbare Änderung. (Spec, Soll-Vorgabe 3)
- Kanonischer Begriff „Auswahlliste“ für die Liste der noch nicht erfassten Artikel im Scan-Dialog; nicht verwenden: „Artikelliste“ (im Druck belegt), „Liste offener Artikel“ („offen“ ist Status-Begriff der Abrechnung). (Spec, Soll-Vorgabe 4 und Entscheidung „Begriff Auswahlliste“)
- Die Auswahlliste übernimmt die Reihenfolge des Servers ohne zweite eigene Sortierung. (Spec, Entscheidung „Sortierort“)
- Projekt: Code, Routen und JSON-Contract englisch, Doku deutsch; Commit-Konvention Conventional Commits `type(scope): Beschreibung`, Text deutsch; Dateien immer mit LF; Commits immer mit Pfadangabe in einem Schritt (`git commit -m "…" -- <pfade>`), vorher Branch und `git status` prüfen. (Projekt-`CLAUDE.md`)
- Testen laufen über `dv-dotnet-test` bzw. `dv-angular-test` im Bash-Tool, nie über `dotnet test`, `ng test` oder die dev-mcp-Test-Tools. Meldet der .NET-Build `MSB3027`, den Prozess nennen und den Menschen entscheiden lassen (Workaround `-c Release`). (Projekt-`CLAUDE.md`, Skills `dv-dotnet:toolchain`, `dv-angular:toolchain`)
- dv-craft:craft-design-principles — Methoden klein und mit einer Aufgabe, keine Verschachtelung, Domänensprache im Naming; YAGNI: keine Abstraktion für hypothetische Anforderungen (hier: keine zweite Sortierung im Frontend, kein Sortierparameter am Port).
- dv-craft:craft-unit-testing — AAA mit Kommentaren `// Arrange` / `// Act` / `// Assert`, Act genau eine Zeile, ein Test eine Behauptung, Tests unabhängig; Naming `[Methode]_[Situation]_[ErwartetesErgebnis]`.
- dv-dotnet:dotnet (dotnet-xunit-conventions) — xUnit v3; im Bestand dieser Testklasse gilt natives `Assert` statt FluentAssertions, das bleibt (keine Mitläufer-Migration); Testklasse spiegelt die Produktionsklasse (`ArticlesBySellerQueryTests`).
- dv-angular:angular (angular-testing-vitest-conventions) — Vitest, `describe`/`it`, AAA-Kommentare in neuen Tests, kein `jasmine`/`jest`; bestehende Namen in der Spec bleiben, neue `it` folgen `<methode>_<Situation>_<Ergebnis>`; Spies über `vi.fn()`.
- primeng:primeng-component-implementation — nicht betroffen: der Plan ändert weder Template noch PrimeNG-Komponente (`p-listbox`, `p-table` bleiben unangetastet).
- dv-dotnet:dotnet-ef-migrations — nicht betroffen: kein Schema-, View- oder Modell-Eingriff.

---

### Task 1: Server sortiert Verkäufer-Artikel nach Artikelnummer

**ACs:** AC-03, AC-07

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/ArticlesBySellerQuery.cs:8-20` · `ArticlesBySellerQuery.GetBySellerId`
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Ports/IArticlesBySellerQuery.cs:9-12` · `IArticlesBySellerQuery.GetBySellerId`
- Test: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticlesBySellerQueryTests.cs` · `ArticlesBySellerQueryTests.GetBySellerId_NoArticlesForSeller_ReturnsEmptyList`

**Interfaces:**
- Consumes: `Article.Create(string id, int number, string sellerId, string name, string brand, string category, decimal price, string? size, string? color, string? description, DateTimeOffset createdAt, DateTimeOffset updatedAt)` — Aufrufform wie in den bestehenden Tests dieser Klasse.
- Produces: unveränderte Signatur `Task<IReadOnlyList<SellerArticleSummary>> IArticlesBySellerQuery.GetBySellerId(string sellerId)`; neue Zusicherung: die Liste ist aufsteigend nach `SellerArticleSummary.Number` sortiert (numerisch, `int`).

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `ArticlesBySellerQueryTests.cs` direkt nach dem Test `GetBySellerId_NoArticlesForSeller_ReturnsEmptyList` (vor der schließenden Klammer der Klasse) einfügen:

  ```csharp
      [Fact]
      public async Task GetBySellerId_ArticlesCreatedOutOfOrder_ReturnsAscendingByNumber()
      {
          // Arrange
          var cancellationToken = TestContext.Current.CancellationToken;
          await using var dbContext = CreateContext();
          var now = DateTimeOffset.UtcNow;
          var articles = new[] { 12, 3, 101 }
              .Select(number => Article.Create(
                  $"ART{number:D5}", number, "SEL00001", $"Artikel {number}", "Nike", "Kleidung", 10m,
                  null, null, null, now, now))
              .ToList();
          await dbContext.Articles.AddRangeAsync(articles, cancellationToken);
          await dbContext.SaveChangesAsync(cancellationToken);
          var sut = new ArticlesBySellerQuery(dbContext);

          // Act
          var result = await sut.GetBySellerId("SEL00001");

          // Assert
          Assert.Equal(new[] { 3, 12, 101 }, result.Select(a => a.Number));
      }

      [Fact]
      public async Task GetBySellerId_NumbersWithDifferentDigitCounts_SortsNumericallyNotAlphabetically()
      {
          // Arrange
          var cancellationToken = TestContext.Current.CancellationToken;
          await using var dbContext = CreateContext();
          var now = DateTimeOffset.UtcNow;
          var articles = new[] { 10, 2, 1 }
              .Select(number => Article.Create(
                  $"ART{number:D5}", number, "SEL00001", $"Artikel {number}", "Nike", "Kleidung", 10m,
                  null, null, null, now, now))
              .ToList();
          await dbContext.Articles.AddRangeAsync(articles, cancellationToken);
          await dbContext.SaveChangesAsync(cancellationToken);
          var sut = new ArticlesBySellerQuery(dbContext);

          // Act
          var result = await sut.GetBySellerId("SEL00001");

          // Assert
          Assert.Equal(new[] { 1, 2, 10 }, result.Select(a => a.Number));
      }
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter ArticlesBySellerQueryTests` — erwartet: FAIL `GetBySellerId_ArticlesCreatedOutOfOrder_ReturnsAscendingByNumber` und FAIL `GetBySellerId_NumbersWithDifferentDigitCounts_SortsNumericallyNotAlphabetically` (der InMemory-Provider liefert die Einfüge-Reihenfolge 12, 3, 101 bzw. 10, 2, 1)
- [ ] **Schritt 3: Minimal implementieren**
  In `ArticlesBySellerQuery.cs` die Abfrage in `GetBySellerId` ersetzen, sodass sie so lautet:

  ```csharp
          var articles = await dbContext.Articles
              .Where(a => a.SellerId == sellerId)
              .OrderBy(a => a.Number)
              .ToListAsync();
  ```

  Der anschließende `Select(...)`-Teil bleibt unverändert und erhält die Reihenfolge.

  In `IArticlesBySellerQuery.cs` den Summary-Kommentar des Interfaces um die Zusicherung erweitern; der Kommentarblock über `public interface IArticlesBySellerQuery` lautet danach:

  ```csharp
  /// <summary>
  /// Placeholder port until the Articles table exists (Round-15). Used by
  /// GetSellerArticlesHandler (GET /api/sellers/{id}/articles). This Round
  /// only provides the port contract (Domain concern) — Infrastructure's
  /// placeholder implementation is a separate task.
  /// The returned list is sorted ascending by article number (numeric).
  /// </summary>
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests -- --filter ArticlesBySellerQueryTests` — erwartet: PASS (alle sechs Tests der Klasse)
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(sellers): Artikel eines Verkäufers aufsteigend nach Artikelnummer liefern" -- src/bazaar-app/backend/Bazaar.Infrastructure/Persistence/Repositories/ArticlesBySellerQuery.cs src/bazaar-app/backend/Bazaar.Domain/Ports/IArticlesBySellerQuery.cs src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Persistence/Repositories/ArticlesBySellerQueryTests.cs`

---

### Task 2: Auswahlliste übernimmt die Server-Reihenfolge

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.spec.ts` · `describe('Sitzungssammlung ohne Duplikate'`

**Interfaces:**
- Consumes: aus Task 1 die Zusicherung, dass `GET /api/sellers/{id}/articles` aufsteigend nach Nummer liefert. Aus dem bestehenden `scan-dialog.spec.ts`: Hilfen `create(http, opts)`, `typeInto(fixture, text)`, `httpClientMock({ pending, byNumber })` und die Typen `PendingArticleFixture`, `ByNumberFixture`; aus `ScanDialog`: `pendingList()`, `onSubmit()`, `allDoneMessage()`, `showUnknownMessage()`.
- Produces: nichts (reine Absicherung, keine Produktionsänderung — `scan-dialog.ts` sortiert bewusst nicht selbst).

Dies ist ein Absicherungstest-Task: Die Auswahlliste gibt `pendingArticles` ohne eigene Sortierung weiter (`basePendingList` → `pendingList` → `filterPending`), die Tests liefern die Server-Reihenfolge und erwarten sie unverändert zurück. Rot ist ein Befund, kein Grund, Produktionscode zu ändern.

- [ ] **Schritt 1: Absicherungstests schreiben**
  In `scan-dialog.spec.ts` direkt vor der Zeile `describe('Sitzungssammlung ohne Duplikate', () => {` (innerhalb von `describe('ScanDialog', …)`) einfügen:

  ```ts
    describe('Auswahlliste in Server-Reihenfolge', () => {
      function pendingOf(numbers: number[], status: string): PendingArticleFixture[] {
        return numbers.map((number) => ({ id: `A${number}`, number, name: `Artikel ${number}`, status }));
      }

      function numbersOf(fixture: Awaited<ReturnType<typeof create>>): number[] {
        return fixture.componentInstance.pendingList().map((article) => article.number);
      }

      it('pendingList_releaseServerDeliversAscending_keepsOrder', async () => {
        // Arrange
        const http = httpClientMock({ pending: pendingOf([3, 12, 101], 'registered') });

        // Act
        const fixture = await create(http, { targetField: 'releasedAt' });

        // Assert
        expect(numbersOf(fixture)).toEqual([3, 12, 101]);
      });

      it('pendingList_returnServerDeliversAscending_keepsOrder', async () => {
        // Arrange
        const http = httpClientMock({ pending: pendingOf([3, 12, 101], 'selling') });

        // Act
        const fixture = await create(http, { targetField: 'returnedAt', writeMode: 'immediate' });

        // Assert
        expect(numbersOf(fixture)).toEqual([3, 12, 101]);
      });

      it('pendingList_numbersWithDifferentDigitCounts_keepsServerOrderOneTwoTen', async () => {
        // Arrange
        const http = httpClientMock({ pending: pendingOf([1, 2, 10], 'registered') });

        // Act
        const fixture = await create(http, { targetField: 'releasedAt' });

        // Assert
        expect(numbersOf(fixture)).toEqual([1, 2, 10]);
      });

      it('pendingList_typedDigitThree_keepsRemainingHitsAscending', async () => {
        // Arrange
        const http = httpClientMock({ pending: pendingOf([3, 13, 31, 45], 'registered') });
        const fixture = await create(http, { targetField: 'releasedAt' });

        // Act
        typeInto(fixture, '3');

        // Assert
        expect(numbersOf(fixture)).toEqual([3, 13, 31]);
      });

      it('pendingList_articleTwelveConfirmedOnReturn_dropsItAndKeepsOrderOfTheRest', async () => {
        // Arrange
        const pending = pendingOf([3, 12, 101], 'selling');
        const articleTwelve: ByNumberFixture = {
          id: 'A12',
          number: 12,
          name: 'Artikel 12',
          sellerId: 'SEL1',
          status: 'selling',
        };
        const http = httpClientMock({ pending, byNumber: { 12: articleTwelve } });
        const fixture = await create(http, { targetField: 'returnedAt', writeMode: 'immediate' });
        typeInto(fixture, '12');

        // Act
        fixture.componentInstance.onSubmit();

        // Assert
        expect(numbersOf(fixture)).toEqual([3, 101]);
      });

      it('template_sellerWithoutPendingArticles_showsAllDoneTextInsteadOfListbox', async () => {
        // Arrange
        const http = httpClientMock({ pending: [] });

        // Act
        const fixture = await create(http, { targetField: 'releasedAt' });

        // Assert
        expect(fixture.nativeElement.querySelector('p-listbox')).toBeNull();
        expect(fixture.nativeElement.textContent).toContain('Alle Artikel freigegeben.');
      });
    });

  ```
- [ ] **Schritt 2: Absicherungstests laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/scan-dialog/scan-dialog.spec.ts` — erwartet: PASS aller neuen Tests `pendingList_releaseServerDeliversAscending_keepsOrder`, `pendingList_returnServerDeliversAscending_keepsOrder`, `pendingList_numbersWithDifferentDigitCounts_keepsServerOrderOneTwoTen`, `pendingList_typedDigitThree_keepsRemainingHitsAscending`, `pendingList_articleTwelveConfirmedOnReturn_dropsItAndKeepsOrderOfTheRest`, `template_sellerWithoutPendingArticles_showsAllDoneTextInsteadOfListbox`; rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 3: Commit**
  `git commit -m "test(scan-dialog): Auswahlliste übernimmt Server-Reihenfolge nach Artikelnummer" -- src/bazaar-app/frontend/src/app/shared/components/scan-dialog/scan-dialog.spec.ts`

---

### Task 3: Detail-Ansicht des Verkäufers zeigt Artikel in Server-Reihenfolge

**ACs:** AC-08

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/features/sellers/components/seller-detail-modal/seller-detail-modal.spec.ts` · `renders article rows when the list is non-empty`

**Interfaces:**
- Consumes: aus Task 1 die Zusicherung der Server-Sortierung. Aus dem bestehenden Spec: `buildArticle(overrides)`, `buildCard()`, `getArticlesSpy` (`vi.fn()` für `SellersStore.getArticles`), das `beforeEach` mit `TestBed.configureTestingModule`.
- Produces: nichts (reine Absicherung; `seller-detail-modal.ts` bindet `articles()` ohne eigene Sortierung an `p-table`).

Absicherungstest-Task: Die Detail-Ansicht rendert `articles()` in der gelieferten Reihenfolge. Rot ist ein Befund, kein Grund, Code zu ändern.

- [ ] **Schritt 1: Absicherungstest schreiben**
  In `seller-detail-modal.spec.ts` direkt nach dem Test `it('renders article rows when the list is non-empty', …)` (vor `it('calls SellersStore.getArticles(seller.id) when the modal opens for a seller', …)`) einfügen:

  ```ts
    it('articleTable_serverDeliversAscendingNumbers_rendersRowsInThatOrder', async () => {
      // Arrange
      getArticlesSpy.mockReturnValue(
        of([
          buildArticle({ id: 'article-3', number: 3 }),
          buildArticle({ id: 'article-12', number: 12 }),
          buildArticle({ id: 'article-101', number: 101 }),
        ]),
      );
      const fixture = TestBed.createComponent(SellerDetailModal);
      fixture.componentRef.setInput('visible', true);
      fixture.componentRef.setInput('seller', buildCard());

      // Act
      await fixture.whenStable();

      // Assert
      const numberCells = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody tr td:first-child')).map(
        (cell) => cell.textContent?.trim(),
      );
      expect(numberCells).toEqual(['3', '12', '101']);
    });

  ```
- [ ] **Schritt 2: Absicherungstest laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/sellers/components/seller-detail-modal/seller-detail-modal.spec.ts` — erwartet: PASS `articleTable_serverDeliversAscendingNumbers_rendersRowsInThatOrder`; rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 3: Commit**
  `git commit -m "test(sellers): Detail-Ansicht zeigt Artikel in Server-Reihenfolge" -- src/bazaar-app/frontend/src/app/features/sellers/components/seller-detail-modal/seller-detail-modal.spec.ts`

---

### Task 4: Abrechnung und Druck bleiben unverändert

**ACs:** AC-09, AC-10

**Dateien:**
- Test: `src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` · `sorts the article list ascending by number`
- Test: `src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.spec.ts` · `buildVerkaeuferUebersichtModel_always_hasTheFiveTilesOfRowAAndThreeOfRowB`

**Interfaces:**
- Consumes: aus `settlement-page.spec.ts` die Hilfen `article(overrides)`, `sellersApiStub()` (mit `getArticles` als `vi.fn()`), `setup({ sellersApi })` (liefert `{ component }`), `selectSeller(component)`; aus `print-document.model.spec.ts` das Seller-Fixture `seller`, `noTexts`, `printedAt`, die Hilfe `article(number, status, price?)` und im `describe('buildVerkaeuferUebersichtModel')` die Hilfe `build(articles)`; aus `print-document.model.ts` `PrintDocumentModel.groups` (je Gruppe `status` und `articles` mit `number`).
- Produces: nichts (reine Absicherung; `settlement-page.ts` sortiert selbst in `loadArticles`, `print-document.model.ts` in `groupArticles`).

Absicherungstest-Task: Beide Stellen sortieren schon selbst und bleiben unverändert. Rot ist ein Befund, kein Grund, Code zu ändern.

- [ ] **Schritt 1: Absicherungstests schreiben**
  In `settlement-page.spec.ts` direkt nach dem Test `it('sorts the article list ascending by number', …)` (vor `describe('action bar', …)`) einfügen:

  ```ts
    it('articles_serverDeliversAscendingNumbers_showsSameOrderAsBefore', async () => {
      // Arrange
      const sellersApi = sellersApiStub();
      sellersApi.getArticles.mockReturnValue(
        of([article({ id: 'a', number: 3 }), article({ id: 'b', number: 12 }), article({ id: 'c', number: 101 })]),
      );
      const { component } = await setup({ sellersApi });

      // Act
      selectSeller(component);

      // Assert
      expect(component.articles().map((a) => a.number)).toEqual([3, 12, 101]);
    });

  ```

  In `print-document.model.spec.ts` im `describe('buildVerkaeuferUebersichtModel', …)` direkt vor dem Test `it('buildVerkaeuferUebersichtModel_always_hasTheFiveTilesOfRowAAndThreeOfRowB', …)` einfügen:

  ```ts
    it('buildVerkaeuferUebersichtModel_sellingAndSoldGroupsUnsorted_keepsGroupOrderAndSortsWithinGroups', () => {
      // Arrange
      const articles = [article(12, 'selling'), article(3, 'selling'), article(7, 'sold'), article(1, 'sold')];

      // Act
      const model = build(articles);

      // Assert
      expect(model.groups.map((group) => [group.status, group.articles.map((entry) => entry.number)])).toEqual([
        ['selling', [3, 12]],
        ['sold', [1, 7]],
      ]);
    });

  ```
- [ ] **Schritt 2: Absicherungstests laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts` — erwartet: PASS `articles_serverDeliversAscendingNumbers_showsSameOrderAsBefore` (AC-09; der bestehende Test `sorts the article list ascending by number` bleibt grün und belegt zusätzlich die eigene Sortierung)
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/shared/components/print-document/print-document.model.spec.ts` — erwartet: PASS `buildVerkaeuferUebersichtModel_sellingAndSoldGroupsUnsorted_keepsGroupOrderAndSortsWithinGroups` (AC-10); rot ist ein Befund, kein Grund, Code zu ändern
- [ ] **Schritt 3: Commit**
  `git commit -m "test(settlement): Abrechnung und Druck behalten ihre Artikelreihenfolge" -- src/bazaar-app/frontend/src/app/features/settlement/pages/settlement-page/settlement-page.spec.ts src/bazaar-app/frontend/src/app/shared/components/print-document/print-document.model.spec.ts`

---

### Task 5: Anforderungs-Doku und Profile nachführen

**ACs:** AC-01, AC-02, AC-07, AC-08

**Dateien:**
- Modify: `docs/requirements/bazaar-app/api/sellers.md:183-199` · `## 6. \`GET /api/sellers/{id}/articles\``
- Modify: `docs/components/scan-dialog/component.md:114-122` · `### Verhalten der AutoComplete-Liste`
- Modify: `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md:50` · `liefert seit 2026-10-14 zusätzlich Größe und Farbe`

**Interfaces:**
- Consumes: aus Task 1 die Zusicherung der Server-Sortierung; Glossar-Eintrag „Auswahlliste“ in `docs/glossary/frontend-terms.md` (steht bereits dort, wird hier nicht angefasst).
- Produces: nichts.

Dokumentations-Task ohne Testzyklus: Die Prüfung ist eine Suche nach den neuen Sätzen.

- [ ] **Schritt 1: API-Doku ergänzen**
  In `docs/requirements/bazaar-app/api/sellers.md` im Abschnitt `## 6. \`GET /api/sellers/{id}/articles\`` den ersten Absatz (beginnt mit `Artikelliste eines Verkäufers für das Detail-Modal`) um den folgenden Satz am Ende des Absatzes erweitern, getrennt durch ein Leerzeichen:

  ```
  Die Liste ist aufsteigend nach Artikelnummer sortiert (numerisch, 2 vor 10); Detail-Modal und Auswahlliste im Scan-Dialog übernehmen diese Reihenfolge.
  ```
- [ ] **Schritt 2: Komponenten-Doku ergänzen**
  In `docs/components/scan-dialog/component.md` unter `### Verhalten der AutoComplete-Liste` direkt nach der Tabelle (nach der Zeile mit `Alle Artikel bereits gesetzt`) eine Leerzeile und diesen Absatz einfügen:

  ```
  Die Liste (im Sprachgebrauch „Auswahlliste“) zeigt die Artikel aufsteigend nach Artikelnummer; die Reihenfolge kommt vom Server (`GET /api/sellers/{id}/articles`, siehe `sellers.md` §6) und bleibt beim Filtern und beim Wegfall erfasster Artikel erhalten — der Dialog sortiert nicht selbst.
  ```
- [ ] **Schritt 3: Feature-Profil ergänzen**
  In `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` unter `## Notes` die Zeile, die mit ``- `GET /api/sellers/{id}/articles` liefert seit 2026-10-14`` beginnt, unverändert lassen und direkt darunter eine neue Zeile einfügen:

  ```
  - `GET /api/sellers/{id}/articles` liefert die Artikel seit 2026-10-18 aufsteigend nach Artikelnummer (`ArticlesBySellerQuery`); die Auswahlliste im Scan-Dialog und die Artikeltabelle der Detail-Ansicht übernehmen die Reihenfolge ohne eigene Sortierung, Abrechnung (`settlement-page.ts`) und Druck (`print-document.model.ts`) sortieren weiter selbst.
  ```
- [ ] **Schritt 4: Doku prüfen**
  Befehl: `git grep -n "aufsteigend nach Artikelnummer" -- docs/requirements/bazaar-app/api/sellers.md docs/components/scan-dialog/component.md docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` — erwartet: je ein Treffer in den drei Dateien
- [ ] **Schritt 5: Commit**
  `git commit -m "docs(sellers): Sortierung der Verkäufer-Artikel nach Artikelnummer nachgeführt" -- docs/requirements/bazaar-app/api/sellers.md docs/components/scan-dialog/component.md docs/knowledge/feature-profile/bazaar-app-sellers/feature.md`

## Entscheidungen
- Keine Fragen an den Menschen.
- **E · Sortierung im Query-Port statt im Handler** · Planer — `OrderBy(a => a.Number)` steht in `ArticlesBySellerQuery`, weil dort die Abfrage entsteht; der Handler `GetSellerArticlesHandler` delegiert nur und bleibt unverändert. Kein Sortierparameter am Port (YAGNI, die Spec kennt nur diese eine Reihenfolge).
- **E · Frontend-ACs als Absicherungstests** · Planer — `scan-dialog.ts`, `seller-detail-modal`, `settlement-page.ts` und `print-document.model.ts` brauchen keine Code-Änderung (Spec-Entscheidung „Sortierort“); AC-01 bis AC-06 und AC-08 bis AC-10 sind deshalb Absicherungstests mit Server-Reihenfolge als Eingabe. Die Server-Seite beweisen AC-03 und AC-07 in Task 1.
- **E · Glossar nicht in diesem Plan** · Planer — Der Eintrag „Auswahlliste“ liegt bereits (uncommittet) in `docs/glossary/frontend-terms.md`; der Plan ändert ihn nicht, damit kein fremder Stand überschrieben wird.
- **R1 · Task 5** — geändert — Schritt 5 (Commit) steht jetzt als eigene Checkbox-Zeile unter Schritt 4. Der Anker der `Modify`-Zeile für `docs/knowledge/feature-profile/bazaar-app-sellers/feature.md` ist durch die eindeutige Zeichenfolge `liefert seit 2026-10-14 zusätzlich Größe und Farbe` ersetzt, die in Zeile 50 der Datei steht (vorher fehlerhafte Backtick-Verschachtelung, Anker-Prüfung fand ihn nicht).
