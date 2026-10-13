# Artikelnummer beim Bearbeiten ändern — Umsetzungsplan

> Umsetzung mit `/dv-forge:implementation docs/forge/2026-10-13-artikelnummer-aendern/plan.md`, Task für Task, sequentiell. Schritte nutzen Checkbox-Syntax (`- [ ]`).

**Ziel:** Im Dialog „Artikel bearbeiten“ der Haupt-App lässt sich die Artikelnummer ändern, sofern sie frei oder die eigene ist; Frontend und Server lehnen eine vergebene Nummer mit Fehlertext ab.
**Architektur:** Die Domain erhält `Article.Renumber`; der `UpdateArticleHandler` prüft vor jeder Mutation über `IArticleRepository.GetByNumber`, ob die neue Nummer an einem anderen Artikel hängt, und wirft sonst `ConflictException` mit Code `article.number_taken`. Das Frontend prüft beim Verlassen des Feldes über den bestehenden Endpunkt `GET /api/articles/by-number/{number}` (404 = frei), der Server entscheidet beim Speichern endgültig. Der eindeutige Index auf `Number` besteht bereits, es ist keine Migration nötig.
**Tech-Stack:** .NET 10 (xUnit, Moq, FluentValidation), Angular (Signals, OnPush, PrimeNG, Vitest)
**Spec:** docs/forge/2026-10-13-artikelnummer-aendern/spec.md
**Basis:** b01133f2

## Global Constraints
- Die Nummer ist eine ganze Zahl ab 1 ohne Obergrenze; leer, 0, negativ oder Text ergeben einen Feldfehler. (Spec Soll-Vorgaben)
- Fehlertext bei vergebener Nummer wörtlich: „Artikelnummer <Nummer> ist bereits vergeben.“ — ohne Nennung eines anderen Artikels. (Spec Soll-Vorgaben)
- Alle Rollen, die den Dialog bearbeiten dürfen, dürfen die Nummer ändern; es kommt keine Rollenprüfung hinzu. (Spec Soll-Vorgaben)
- Sperren wie bei den übrigen Feldern: abgerechneter Verkäufer sperrt das Feld im Dialog und lehnt serverseitig ab; nach dem Verkauf bleibt die Nummer änderbar. (Spec Soll-Vorgaben)
- Vorschlag „nächste Nummer“ bleibt höchste vergebene Nummer plus 1; eine bewusst hohe Nummer ist erlaubt. (Spec Soll-Vorgaben)
- Eine Nummernänderung wird nicht protokolliert. (Spec Soll-Vorgaben)
- Hinweis bei geänderter, gültiger Nummer unter dem Feld wörtlich: „Etikett neu drucken und anbringen.“ (Spec Theoretisches Verhalten)
- Code, Routen und JSON-Contract englisch, Doku deutsch; Commit-Messages deutsch nach Conventional Commits `type(scope): Beschreibung`, mit Trailer `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` (Projekt-CLAUDE.md)
- Commits immer in einem Schritt mit Pfadangabe (`git commit -m … -- <pfade>`), nie getrennt stagen und committen; vorher Branch (`docs/feature/artikelnummer-aendern`) und `git status` prüfen; neue Dateien vorab mit `git add -N <datei>` bekannt machen (Projekt-CLAUDE.md)
- Dateien immer mit LF schreiben (Projekt-CLAUDE.md, `.gitattributes`)
- Bauen/Testen/Linten nur über `dv-dotnet-*` und `dv-angular-*`, im Bash-Tool, nie `dotnet test`, `ng test` oder dev-mcp-Build/Test (Projekt-CLAUDE.md, dv-dotnet:toolchain, dv-angular:toolchain). `<R>` ist der Worktree `C:/wt/bz-artnr`; im Frontend ist `npm ci` dort bereits gelaufen, fehlt `node_modules`, zuerst `npm ci` in `<R>/src/bazaar-app/frontend`
- Meldet der .NET-Build `MSB3027` (DLL gesperrt), laufenden Prozess `Bazaar.Api` beenden oder mit `-c Release` bauen (Projekt-CLAUDE.md)
- Doku-Nachführung: Ändert die Umsetzung Fähigkeit oder Beschriftung, werden Anforderungs-Doku und Profile im selben Lauf geändert (eigener Task 5); der Mensch bestätigt den Doku-Diff vor dem Commit (Projekt-CLAUDE.md)
- dv-craft:craft-design-principles — Methoden sind entweder Integration (nur delegieren, `if`/`switch` ist das Signal; Guard Clauses ausgenommen) oder Operation; keine Verschachtelung, kleine Funktionen mit einer Aufgabe, ein Erklär-Kommentar über 2–3 Zeilen wird zu einer benannten Funktion mit Docstring; DDD-Schnitt vor taktischen Prinzipien, YAGNI nur innerhalb des Schnitts
- dv-craft:craft-unit-testing — Testmethoden `[Methode]_[Situation]_[ErwartetesErgebnis]`, AAA mit Kommentaren `// Arrange` `// Act` `// Assert`, Act ist genau eine Zeile (Exception-Tests dürfen `// Act & Assert` zusammenfassen); ein Test, eine Behauptung; TDD mit fehlschlagendem Test zuerst; JS/TS: `describe`/`it`-Hierarchie als Naming
- dv-dotnet:dotnet, dv-dotnet:dotnet-xunit-conventions — Testklasse `<Klasse>Tests`, Testprojekt spiegelt Produktion 1:1, Bestand respektieren (keine Mitläufer-Migration: vorhandene Tests dieses Projekts nutzen xUnit-`Assert` und `Mock<T>`), Magic Strings bei mehrfach genutzten gekoppelten Literalen als Konstante
- dv-angular:angular — standalone Komponenten mit `ChangeDetectionStrategy.OnPush`, Signals (`signal`, `computed`, `effect`, `input`, `output`), abgeleiteter Zustand als `computed`, kein `effect` zum Synchronisieren zweier Signale außer dem hier genutzten Seeding
- primeng:primeng-component-implementation — nur PrimeNG und die vorhandenen Wrapper; das Nummernfeld nutzt wie das Feld „Bezeichnung“ ein `pInputText` (kein neuer PrimeNG-Baustein), daher kein neuer `get_component`/`validate_usage`-Aufruf nötig

---

### Task 1: Domain — `Article.Renumber`

**ACs:** AC-04, AC-10

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Article/Article.cs:8` · `Article.Number`
- Modify: `src/bazaar-app/backend/Bazaar.Domain/Article/Article.cs:104-129` · `Article.UpdateDetails`
- Test: `src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/ArticleTests.cs:142-158` · `ArticleTests.UpdateDetails_WhenNotSold_UpdatesAllFieldsFreely`

**Interfaces:**
- Consumes: —
- Produces: `public void Article.Renumber(int number, DateTimeOffset now)` — setzt `Number` und `UpdatedAt`; wirft `ArgumentException`, wenn `number < 1`. `Article.Number` hat jetzt `private set` statt `private init`.

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `ArticleTests.cs` direkt nach der Methode `UpdateDetails_WhenNotSold_UpdatesAllFieldsFreely` (endet mit `Assert.Equal(now, article.UpdatedAt);` und `}`) einfügen:
  ```csharp
      [Fact]
      public void Renumber_ValidNumber_SetsNumberAndUpdatedAt()
      {
          // Arrange
          var article = CreateValidArticle();
          var now = new DateTimeOffset(2026, 9, 2, 12, 0, 0, TimeSpan.Zero);

          // Act
          article.Renumber(2000, now);

          // Assert
          Assert.Equal(2000, article.Number);
          Assert.Equal(now, article.UpdatedAt);
      }

      [Theory]
      [InlineData(0)]
      [InlineData(-5)]
      public void Renumber_ZeroOrNegativeNumber_ThrowsArgumentException(int invalidNumber)
      {
          // Arrange
          var article = CreateValidArticle();

          // Act & Assert
          Assert.Throws<ArgumentException>(() => article.Renumber(invalidNumber, UpdatedAt));
      }
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter "FullyQualifiedName~ArticleTests"` — erwartet: FAIL (Kompilierfehler, `Article.Renumber` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  In `Article.cs` die Zeile
  ```csharp
      public int Number { get; private init; }
  ```
  ersetzen durch
  ```csharp
      public int Number { get; private set; }
  ```
  und direkt nach der Methode `UpdateDetails` (vor dem `<summary>` von `SetTimestamps`) einfügen:
  ```csharp
      /// <summary>
      /// Ändert die Artikelnummer (Barcode- und Etikett-Grundlage). Ob die Nummer frei ist,
      /// prüft der Aufrufer gegen das Repository — die Domain kennt andere Artikel nicht.
      /// </summary>
      public void Renumber(int number, DateTimeOffset now)
      {
          if (number < 1) throw new ArgumentException("Number must be at least 1.");

          Number = number;
          UpdatedAt = now;
      }
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests -- --filter "FullyQualifiedName~ArticleTests"` — erwartet: PASS
- [ ] **Schritt 5: Commit**
  `git add -N` entfällt (nur bestehende Dateien) · `git commit -m "feat(domain): Artikelnummer über Article.Renumber änderbar" -- src/bazaar-app/backend/Bazaar.Domain/Article/Article.cs src/bazaar-app/backend/tests/Bazaar.Domain.UnitTests/ArticleTests.cs`

---

### Task 2: Application — Command, Validator und Handler

**ACs:** AC-02, AC-03, AC-04, AC-05, AC-07, AC-09, AC-10, AC-11, AC-12

**Dateien:**
- Modify: `src/bazaar-app/backend/Bazaar.Application/Articles/UpdateArticleCommand.cs` · `UpdateArticleCommand`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Articles/UpdateArticleCommandValidator.cs` · `UpdateArticleCommandValidator`
- Modify: `src/bazaar-app/backend/Bazaar.Application/Articles/UpdateArticleHandler.cs` · `UpdateArticleHandler.Handle`
- Create: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Articles/UpdateArticleCommandValidatorTests.cs`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Articles/UpdateArticleHandlerTests.cs:25-35` · `UpdateArticleHandlerTests.CreateCommand`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Articles/GetNextArticleNumberHandlerTests.cs:24-33` · `GetNextArticleNumberHandlerTests.Handle_TableWithData_ReturnsMaxPlusOne`

**Interfaces:**
- Consumes: `Article.Renumber(int number, DateTimeOffset now)` aus Task 1; `IArticleRepository.GetByNumber(int number)` → `Task<Article?>` (besteht)
- Produces: `UpdateArticleCommand.Number` (`int`, Wire-Feld `number`); Handler wirft `ConflictException("Artikelnummer <n> ist bereits vergeben.", "article.number_taken")`; Validator meldet für `Number <= 0` die Meldung „Artikelnummer muss eine ganze Zahl ab 1 sein.“ unter Schlüssel `number`

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  a) In `UpdateArticleHandlerTests.cs` die Methode `CreateCommand` ersetzen durch (Artikel im Test hat Nummer 1, daher Default `number = 1`):
  ```csharp
      private static UpdateArticleCommand CreateCommand(decimal price = 10m, int number = 1) => new()
      {
          Id = "ARTICLE001",
          Number = number,
          Name = "T-Shirt Neu",
          Brand = "Puma",
          Category = "Kleidung",
          Price = price,
          Size = "L",
          Color = "rot",
          Description = "gebraucht"
      };
  ```
  b) Am Ende der Klasse `UpdateArticleHandlerTests` (vor der schließenden `}` der Klasse) einfügen:
  ```csharp

      private static Article CreateOtherArticle(int number) =>
          Article.Create(
              "ARTICLE002", number, "SELLER001", "Hose", "Nike", "Kleidung", 5m,
              null, null, null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

      [Fact]
      public async Task Handle_NewNumberFree_RenumbersArticleAndUpdates()
      {
          // Arrange
          var article = CreateArticle();
          _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
          _articleRepository.Setup(r => r.GetByNumber(2000)).ReturnsAsync((Article?)null);
          _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
          var sut = CreateSut();

          // Act
          await sut.Handle(CreateCommand(number: 2000));

          // Assert
          Assert.Equal(2000, article.Number);
          _articleRepository.Verify(r => r.Update(article), Times.Once);
      }

      [Fact]
      public async Task Handle_NumberTakenByOtherArticle_ThrowsConflictWithNumberTakenCode_AndDoesNotCallUpdate()
      {
          // Arrange
          var article = CreateArticle();
          _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
          _articleRepository.Setup(r => r.GetByNumber(1044)).ReturnsAsync(CreateOtherArticle(1044));
          _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
          var sut = CreateSut();

          // Act & Assert
          var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(CreateCommand(number: 1044)));

          Assert.Equal("article.number_taken", exception.ErrorCode);
          Assert.Equal("Artikelnummer 1044 ist bereits vergeben.", exception.Message);
          Assert.Equal(1, article.Number);
          _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
      }

      [Fact]
      public async Task Handle_NumberUnchanged_DoesNotCheckAvailabilityAndUpdates()
      {
          // Arrange
          var article = CreateArticle();
          _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
          _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
          var sut = CreateSut();

          // Act
          await sut.Handle(CreateCommand(number: 1));

          // Assert
          _articleRepository.Verify(r => r.GetByNumber(It.IsAny<int>()), Times.Never);
          _articleRepository.Verify(r => r.Update(article), Times.Once);
      }

      [Fact]
      public async Task Handle_SellerSettledAndNumberChanged_ThrowsSettlementLocked_AndKeepsNumber()
      {
          // Arrange
          var article = CreateArticle();
          var seller = CreateSeller();
          seller.Settle(100m, DateTimeOffset.UtcNow);
          _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
          _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
          var sut = CreateSut();

          // Act & Assert
          var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(CreateCommand(number: 2000)));

          Assert.Equal("settlement.locked", exception.ErrorCode);
          Assert.Equal(1, article.Number);
          _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
      }

      [Fact]
      public async Task Handle_ArticleSoldNumberChangedToFreeNumber_Renumbers()
      {
          // Arrange
          var article = CreateArticle();
          article.SetTimestamps(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, true, DateTimeOffset.UtcNow);
          _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
          _articleRepository.Setup(r => r.GetByNumber(2000)).ReturnsAsync((Article?)null);
          _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
          var sut = CreateSut();

          // Act
          await sut.Handle(CreateCommand(number: 2000));

          // Assert
          Assert.Equal(2000, article.Number);
          _articleRepository.Verify(r => r.Update(article), Times.Once);
      }
  ```
  c) Neue Datei `UpdateArticleCommandValidatorTests.cs`:
  ```csharp
  using Bazaar.Application.Articles;

  namespace Bazaar.Application.UnitTests.Articles;

  public class UpdateArticleCommandValidatorTests
  {
      private const string NumberErrorMessage = "Artikelnummer muss eine ganze Zahl ab 1 sein.";

      private static UpdateArticleCommand CreateCommand(int number) => new()
      {
          Id = "ARTICLE001",
          Number = number,
          Name = "T-Shirt",
          Brand = "Puma",
          Category = "Kleidung",
          Price = 10m
      };

      [Theory]
      [InlineData(0)]
      [InlineData(-5)]
      public void Validate_ZeroOrNegativeNumber_ReturnsNumberError(int invalidNumber)
      {
          // Arrange
          var sut = new UpdateArticleCommandValidator();

          // Act
          var result = sut.Validate(CreateCommand(invalidNumber));

          // Assert
          Assert.Contains(result.Errors, e => e.PropertyName == "Number" && e.ErrorMessage == NumberErrorMessage);
      }

      [Fact]
      public void Validate_PositiveNumber_HasNoNumberError()
      {
          // Arrange
          var sut = new UpdateArticleCommandValidator();

          // Act
          var result = sut.Validate(CreateCommand(1043));

          // Assert
          Assert.DoesNotContain(result.Errors, e => e.PropertyName == "Number");
      }
  }
  ```
  d) Absicherungstest für AC-11 (kein Code-Change nötig): in `GetNextArticleNumberHandlerTests.cs` nach `Handle_TableWithData_ReturnsMaxPlusOne` einfügen:
  ```csharp

      [Fact]
      public async Task Handle_MaxNumberRaisedByRenumbering_ReturnsMaxPlusOne()
      {
          // Arrange
          _articleRepository.Setup(r => r.GetMaxNumber()).ReturnsAsync(9999);
          var sut = CreateSut();

          // Act
          var result = await sut.Handle();

          // Assert
          Assert.Equal(10000, result);
      }
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter "FullyQualifiedName~UnitTests.Articles"` — erwartet: FAIL (Kompilierfehler, `UpdateArticleCommand.Number` existiert nicht)
- [ ] **Schritt 3: Minimal implementieren**
  `UpdateArticleCommand.cs` ersetzen durch:
  ```csharp
  namespace Bazaar.Application.Articles;

  /// <summary>
  /// <see cref="Id"/> is NOT part of the wire contract — the endpoint sets it
  /// from the route value after ASP.NET model binding. sellerId is never part
  /// of this command — an article never changes its owner (api/articles.md §4).
  /// <see cref="Number"/> is editable: it must be free or the article's own number.
  /// </summary>
  public sealed class UpdateArticleCommand
  {
      public string Id { get; set; } = string.Empty;
      public int Number { get; set; }
      public string Name { get; set; } = string.Empty;
      public string Brand { get; set; } = string.Empty;
      public string Category { get; set; } = string.Empty;
      public decimal Price { get; set; }
      public string? Size { get; set; }
      public string? Color { get; set; }
      public string? Description { get; set; }
  }
  ```
  In `UpdateArticleCommandValidator.cs` nach `RuleFor(x => x.Name).NotEmpty();` einfügen:
  ```csharp
          RuleFor(x => x.Number).GreaterThan(0).WithMessage("Artikelnummer muss eine ganze Zahl ab 1 sein.");
  ```
  `UpdateArticleHandler.cs` ersetzen durch:
  ```csharp
  using Bazaar.Domain.Articles;
  using Bazaar.Domain.Exceptions;
  using Bazaar.Domain.Ports;

  namespace Bazaar.Application.Articles;

  public sealed class UpdateArticleHandler(IArticleRepository articleRepository, ISellerRepository sellerRepository)
  {
      public async Task Handle(UpdateArticleCommand command)
      {
          var article = await articleRepository.GetById(command.Id)
              ?? throw new NotFoundException("Artikel nicht gefunden", "article.not_found");

          var seller = await sellerRepository.GetById(article.SellerId);
          if (seller?.SettledAt != null)
          {
              throw new ConflictException("Verkäufer ist abgerechnet", "settlement.locked");
          }

          await EnsureNumberAvailable(article, command.Number);

          var now = DateTimeOffset.UtcNow;
          article.UpdateDetails(command.Name, command.Brand, command.Category, command.Price, command.Size, command.Color, command.Description, now);
          article.Renumber(command.Number, now);

          await articleRepository.Update(article);
      }

      private async Task EnsureNumberAvailable(Article article, int number)
      {
          if (number == article.Number) return;

          var owner = await articleRepository.GetByNumber(number);
          if (owner is null) return;

          throw new ConflictException($"Artikelnummer {number} ist bereits vergeben.", "article.number_taken");
      }
  }
  ```
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-dotnet-test --path <R>/src/bazaar-app/backend/tests/Bazaar.Application.UnitTests -- --filter "FullyQualifiedName~UnitTests.Articles"` — erwartet: PASS (inklusive der bestehenden `UpdateArticleHandlerTests` und `GetNextArticleNumberHandlerTests.Handle_MaxNumberRaisedByRenumbering_ReturnsMaxPlusOne`)
- [ ] **Schritt 5: Commit**
  `git add -N src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Articles/UpdateArticleCommandValidatorTests.cs` · `git commit -m "feat(articles): Artikelnummer beim Speichern prüfen und ändern" -- src/bazaar-app/backend/Bazaar.Application/Articles/UpdateArticleCommand.cs src/bazaar-app/backend/Bazaar.Application/Articles/UpdateArticleCommandValidator.cs src/bazaar-app/backend/Bazaar.Application/Articles/UpdateArticleHandler.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Articles/UpdateArticleCommandValidatorTests.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Articles/UpdateArticleHandlerTests.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Articles/GetNextArticleNumberHandlerTests.cs`

---

### Task 3: Frontend — Artikelnummer-Feld im `artikel-dialog`

Dialog, `ArtikelFormValue.number` und die davon abhängigen Aufrufer (`articles-page.ts` Seed-Wert, API-Typ, Store-/Seiten-Specs) liegen in einem Task, weil `ArtikelFormValue` und `UpdateArticleRequest` strukturell zusammenhängen und das Frontend sonst zwischen zwei Commits nicht baut.

**ACs:** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-10, AC-12

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/articles/data/articles-api.ts:64-76` · `UpdateArticleRequest`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.ts` · `ArtikelDialog`, `ArtikelFormValue`, `ArtikelDialogServerErrors`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.html` · Block `artikel-dialog__readonly-label`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.scss` · `&__readonly-label`, `&__readonly-value`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.ts:227-239` · `ArticlesPage.dialogInitialValue`
- Test: `src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.spec.ts` · `describe('ArtikelDialog')`, `setup`, `EDIT_ARTICLE`
- Test: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.spec.ts:625-724` · `describe('edit flow (artikel-dialog, review fix)')`
- Test: `src/bazaar-app/frontend/src/app/features/articles/articles-store.spec.ts:148-165` · `describe('update')`

**Interfaces:**
- Consumes: `ArticlesApi.getByNumber(number: number): Observable<ArticleByNumberResult>` (besteht; `404` heißt frei, `200` liefert `id` des Besitzer-Artikels)
- Produces:
  - `ArtikelFormValue.number: number`, `ArtikelDialogServerErrors.number?: string`, `UpdateArticleRequest.number: number`
  - `ArtikelDialog.articleId = input<string>('')` — `id` des bearbeiteten Artikels (für den Eigen-Treffer der Vorabprüfung)
  - `ArtikelDialog.numberText` (`signal<string>`), `parsedNumber` (`computed<number | null>`), `numberError` (`computed<string | null>`), `onNumberBlur(): void`
  - `articleNumber`-Input bleibt die aktuell am Artikel gespeicherte Nummer (Titel, Löschen-Bestätigung, Änderungserkennung)

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  a) `artikel-dialog.spec.ts`: Imports ergänzen — nach der Zeile `import { Brand, BrandsApi } from '../../../brands/data/brands-api';` einfügen: `import { ArticlesApi } from '../../data/articles-api';`
  b) `EDIT_ARTICLE` ersetzen durch:
  ```ts
  const EDIT_ARTICLE: ArtikelFormValue = {
    number: 1043,
    name: 'Winterjacke',
    brand: 'Playmobil',
    category: 'Kleidung',
    price: 12.5,
    size: '104',
    color: 'Blau',
    description: 'Kaum getragen',
  };
  ```
  c) Nach `brandsApiStub()` die Stub-Funktion einfügen:
  ```ts
  function articlesApiStub() {
    return {
      getByNumber: vi
        .fn()
        .mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 }))),
    };
  }
  ```
  d) In `setup(options)`: Typ um `articlesApi?: ReturnType<typeof articlesApiStub>;` erweitern, nach `const brandsApi = …` einfügen `const articlesApi = options.articlesApi ?? articlesApiStub();`, in `providers` nach `{ provide: BrandsApi, useValue: brandsApi },` einfügen `{ provide: ArticlesApi, useValue: articlesApi },` und im Rückgabeobjekt `articlesApi,` nach `brandsApi,` ergänzen.
  e) Im Test `'seeds all form fields from initialValue once visible() becomes true'` nach `expect(component.name()).toBe('Winterjacke');` einfügen: `expect(component.numberText()).toBe('1043');`
  f) Den Test `'is invalid whenever locked is not none, even with all required fields valid'` ersetzen durch:
  ```ts
  it('is invalid when the seller is settled, and stays valid when only the article is sold', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    expect(component.canSave()).toBe(true);

    fixture.componentRef.setInput('locked', 'sold');
    await fixture.whenStable();
    expect(component.canSave()).toBe(true);

    fixture.componentRef.setInput('locked', 'settled');
    await fixture.whenStable();
    expect(component.canSave()).toBe(false);
  });
  ```
  g) Den Test `'does not include the article number in the save payload'` ersetzen durch:
  ```ts
  it('includes the unchanged article number in the save payload', async () => {
    const { fixture } = await setup({ isAdmin: true });
    fixture.componentRef.setInput('visible', true);
    fixture.componentRef.setInput('articleNumber', 1043);
    fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
    await fixture.whenStable();

    const component = fixture.componentInstance;
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);

    component.onSave();

    expect(saveSpy).toHaveBeenCalledWith({
      number: 1043,
      name: 'Winterjacke',
      brand: 'Playmobil',
      category: 'Kleidung',
      price: 12.5,
      size: '104',
      color: 'Blau',
      description: 'Kaum getragen',
    });
  });
  ```
  h) Am Ende von `describe('ArtikelDialog', …)` (vor der letzten `});`) den neuen Block einfügen:
  ```ts

    describe('article number field', () => {
      async function openDialog(
        options: {
          isAdmin?: boolean;
          articlesApi?: ReturnType<typeof articlesApiStub>;
          locked?: 'none' | 'sold' | 'settled';
        } = {},
      ) {
        const { fixture, articlesApi } = await setup({
          isAdmin: options.isAdmin ?? true,
          articlesApi: options.articlesApi,
        });
        fixture.componentRef.setInput('visible', true);
        fixture.componentRef.setInput('articleNumber', 1043);
        fixture.componentRef.setInput('articleId', 'a1');
        fixture.componentRef.setInput('initialValue', EDIT_ARTICLE);
        fixture.componentRef.setInput('locked', options.locked ?? 'none');
        await fixture.whenStable();
        return {
          fixture,
          component: fixture.componentInstance,
          articlesApi,
          element: fixture.nativeElement as HTMLElement,
        };
      }

      it('shows the number input prefilled with the current number and enabled', async () => {
        const { element } = await openDialog();

        const input = element.querySelector('#artikel-dialog-number') as HTMLInputElement;
        expect(input.value).toBe('1043');
        expect(input.disabled).toBe(false);
      });

      it('shows the taken-number error and blocks saving when another article owns the number', async () => {
        const articlesApi = articlesApiStub();
        articlesApi.getByNumber.mockReturnValue(of({ id: 'b2', number: 1044 }));
        const { fixture, component, element } = await openDialog({ articlesApi });

        component.numberText.set('1044');
        component.onNumberBlur();
        await fixture.whenStable();

        expect(articlesApi.getByNumber).toHaveBeenCalledWith(1044);
        expect(element.textContent).toContain('Artikelnummer 1044 ist bereits vergeben.');
        expect(component.canSave()).toBe(false);
      });

      it('does not query the backend and can save when the number stays unchanged', async () => {
        const { fixture, component, articlesApi } = await openDialog();

        component.onNumberBlur();
        await fixture.whenStable();

        expect(articlesApi.getByNumber).not.toHaveBeenCalled();
        expect(component.canSave()).toBe(true);
      });

      it('treats a lookup hit on the article itself as free', async () => {
        const articlesApi = articlesApiStub();
        articlesApi.getByNumber.mockReturnValue(of({ id: 'a1', number: 1050 }));
        const { fixture, component } = await openDialog({ articlesApi });

        component.numberText.set('1050');
        component.onNumberBlur();
        await fixture.whenStable();

        expect(component.numberError()).toBeNull();
        expect(component.canSave()).toBe(true);
      });

      it('emits the new number in the save payload when the number is free', async () => {
        const { fixture, component } = await openDialog();
        const saveSpy = vi.fn();
        component.save.subscribe(saveSpy);

        component.numberText.set('2000');
        component.onNumberBlur();
        await fixture.whenStable();
        component.onSave();

        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ number: 2000 }));
      });

      it('shows a server-side number error only while the rejected number is still entered', async () => {
        const { fixture, component, element } = await openDialog();

        component.numberText.set('1050');
        fixture.componentRef.setInput('serverErrors', {
          number: 'Artikelnummer 1050 ist bereits vergeben.',
        });
        await fixture.whenStable();
        expect(element.textContent).toContain('Artikelnummer 1050 ist bereits vergeben.');

        component.numberText.set('1060');
        await fixture.whenStable();
        expect(element.textContent).not.toContain('Artikelnummer 1050 ist bereits vergeben.');
      });

      it('shows the label hint for a changed valid number and hides it again on return', async () => {
        const { fixture, component, element } = await openDialog();

        component.numberText.set('2000');
        await fixture.whenStable();
        expect(element.textContent).toContain('Etikett neu drucken und anbringen.');

        component.numberText.set('1043');
        await fixture.whenStable();
        expect(element.textContent).not.toContain('Etikett neu drucken und anbringen.');
      });

      for (const invalidText of ['', '0', '-5', 'abc']) {
        it(`rejects "${invalidText}" with a field error and blocks saving`, async () => {
          const { fixture, component, element } = await openDialog();

          component.numberText.set(invalidText);
          await fixture.whenStable();

          expect(element.textContent).toContain('Artikelnummer muss eine ganze Zahl ab 1 sein.');
          expect(component.canSave()).toBe(false);
        });
      }

      it('disables the number input when the seller is settled', async () => {
        const { element } = await openDialog({ locked: 'settled' });

        const input = element.querySelector('#artikel-dialog-number') as HTMLInputElement;
        expect(input.disabled).toBe(true);
      });

      it('keeps the number input enabled and saveable when only the article is sold', async () => {
        const { fixture, component, element } = await openDialog({ locked: 'sold' });

        component.numberText.set('2000');
        component.onNumberBlur();
        await fixture.whenStable();

        const input = element.querySelector('#artikel-dialog-number') as HTMLInputElement;
        expect(input.disabled).toBe(false);
        expect(component.canSave()).toBe(true);
      });

      it('lets a non-admin change the number the same way as an admin', async () => {
        const { fixture, component } = await openDialog({ isAdmin: false });
        const saveSpy = vi.fn();
        component.save.subscribe(saveSpy);

        component.numberText.set('2000');
        component.onNumberBlur();
        await fixture.whenStable();
        component.onSave();

        expect(saveSpy).toHaveBeenCalledWith(expect.objectContaining({ number: 2000 }));
      });
    });
  ```
  i) `articles-page.spec.ts`: Zeile 19 `import { ArticleDetail, ArticleListItem } from '../../data/articles-api';` ersetzen durch `import { ArticleDetail, ArticleListItem, ArticlesApi } from '../../data/articles-api';`; in `providers` von `beforeEach` nach `{ provide: CategoriesApi, useValue: { getAll: () => of(CATEGORIES) } },` einfügen:
  ```ts
        {
          provide: ArticlesApi,
          useValue: {
            getByNumber: () => throwError(() => new HttpErrorResponse({ status: 404 })),
          },
        },
  ```
  Im Test `'fetches the full detail via ArticlesStore.getById and opens the dialog on success'` im erwarteten `toEqual({…})` nach `expect(component.dialogInitialValue()).toEqual({` die Zeile `number: detail.number,` ergänzen. Im Test `'calls ArticlesStore.update with the form result and closes the dialog on success'` im Objekt `formResult` nach `const formResult = {` die Zeile `number: 1001,` ergänzen. Im Test `'maps a 400 response to field-level serverErrors instead of closing the dialog'` im Objekt von `component.onDialogSave({` nach `{` die Zeile `number: 1001,` ergänzen.
  j) `articles-store.spec.ts` im Test unter `describe('update')`: im Objekt `const request = {` nach `{` die Zeile `number: 1001,` ergänzen.
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/articles/components/artikel-dialog/artikel-dialog.spec.ts` — erwartet: FAIL (Typfehler/Fehler, `numberText`, `onNumberBlur`, `articleId`, `number` unbekannt)
- [ ] **Schritt 3: Minimal implementieren**
  a) `articles-api.ts`: `UpdateArticleRequest` samt Doc-Kommentar ersetzen durch:
  ```ts
  /**
   * PUT /api/articles/{id} request body — Stammfelder plus the editable article number
   * (api/articles.md §4: free or the article's own number, else 409 `article.number_taken`).
   * sellerId is never editable.
   */
  export interface UpdateArticleRequest {
    number: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    size?: string | null;
    color?: string | null;
    description?: string | null;
  }
  ```
  b) `artikel-dialog.ts`:
  - Import ändern: `import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';` (bestehende Mehrzeilen-Importliste um `untracked,` zwischen `signal,` und `viewChild,` ergänzen) und nach der `Brand`-Importzeile `import { ArticlesApi } from '../../data/articles-api';` einfügen.
  - Den Kommentar `ArtikelFormValue` und das Interface ersetzen durch:
  ```ts
  /**
   * Article Stammfelder as edited by this dialog (see `UpdateArticleRequest` in `articles-api.ts`)
   * — `brand`/`category` are the master-data NAMES (not ids), matching
   * `ArticleListItem`/`UpdateArticleRequest`'s string shape and `articles-page.ts`'s own
   * Brand/Category filter dropdowns (`optionValue="name"`-equivalent). The seller is fixed and
   * never part of this shape; `number` is editable (free or the article's own number).
   */
  export interface ArtikelFormValue {
    number: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    size: string | null;
    color: string | null;
    description: string | null;
  }
  ```
  - `ArtikelDialogServerErrors` ersetzen durch:
  ```ts
  export interface ArtikelDialogServerErrors {
    number?: string;
    name?: string;
    brand?: string;
    category?: string;
    price?: string;
  }
  ```
  - Direkt vor `@Component({` einfügen:
  ```ts
  const MAX_ARTICLE_NUMBER = 2147483647;
  const ARTICLE_NUMBER_FORMAT_ERROR = 'Artikelnummer muss eine ganze Zahl ab 1 sein.';

  /** Whole number from 1 to the technical `int` limit, else `null` (empty, 0, negative, text). */
  function parseArticleNumber(text: string): number | null {
    const trimmed = text.trim();
    if (!/^\d+$/.test(trimmed)) return null;

    const value = Number(trimmed);
    return value >= 1 && value <= MAX_ARTICLE_NUMBER ? value : null;
  }

  function numberTakenMessage(number: number): string {
    return `Artikelnummer ${number} ist bereits vergeben.`;
  }

  ```
  - In der Klasse nach `private readonly confirmationService = inject(ConfirmationService);` einfügen: `private readonly articlesApi = inject(ArticlesApi);`
  - Den Doc-Kommentar und die Zeile von `articleNumber` ersetzen durch:
  ```ts
    /** The number the article currently carries — used for the title, the delete confirmation
     * and to detect a change. The editable value lives in `numberText`. */
    readonly articleNumber = input.required<number>();
    /** Id of the edited article — lets the on-blur lookup recognise a hit on the article itself. */
    readonly articleId = input<string>('');
  ```
  - Nach `readonly description = signal('');` einfügen:
  ```ts

    readonly numberText = signal('');
    readonly parsedNumber = computed(() => parseArticleNumber(this.numberText()));
    /** Number a blur lookup found at ANOTHER article; only counts while it is still entered. */
    private readonly takenNumber = signal<number | null>(null);
    /** Number that was entered when the server last rejected the save with a number error. */
    private readonly rejectedNumber = signal<number | null>(null);

    readonly numberTaken = computed(
      () => this.takenNumber() !== null && this.takenNumber() === this.parsedNumber(),
    );
    private readonly serverNumberError = computed(() =>
      this.rejectedNumber() === this.parsedNumber() ? (this.serverErrors()?.number ?? null) : null,
    );
    readonly numberError = computed<string | null>(() => {
      const parsed = this.parsedNumber();
      if (parsed === null) return ARTICLE_NUMBER_FORMAT_ERROR;
      if (this.numberTaken()) return numberTakenMessage(parsed);
      return this.serverNumberError();
    });
    readonly showLabelHint = computed(() => {
      const parsed = this.parsedNumber();
      return parsed !== null && parsed !== this.articleNumber() && this.numberError() === null;
    });
  ```
  - `canSave` ersetzen durch (nur Abrechnung sperrt das Speichern, `'sold'` sperrt nur den Preis):
  ```ts
    readonly canSave = computed(
      () =>
        this.parsedNumber() !== null &&
        !this.numberTaken() &&
        this.name().trim().length > 0 &&
        this.category().length > 0 &&
        this.brand().length > 0 &&
        this.price() > 0 &&
        !this.isSettled() &&
        !this.saving(),
    );
  ```
  - Im Konstruktor im ersten `effect` nach `const initial = this.initialValue();` einfügen:
  ```ts
        this.numberText.set(String(initial?.number ?? this.articleNumber()));
        this.takenNumber.set(null);
  ```
  - Im Konstruktor nach dem zweiten `effect(…)`-Block einfügen:
  ```ts

      effect(() => {
        if (!this.serverErrors()?.number) return;
        this.rejectedNumber.set(untracked(() => this.parsedNumber()));
      });
  ```
  - Nach `onPriceChange` die neue Methode einfügen:
  ```ts

    /**
     * Frontend pre-check on leaving the field: `404` means free, a hit on another article marks
     * the number taken. Any other failure is ignored — the server decides on save.
     */
    onNumberBlur(): void {
      const number = this.parsedNumber();
      if (number === null || number === this.articleNumber()) {
        this.takenNumber.set(null);
        return;
      }

      this.articlesApi.getByNumber(number).subscribe({
        next: (owner) => this.takenNumber.set(owner.id === this.articleId() ? null : number),
        error: () => this.takenNumber.set(null),
      });
    }
  ```
  - `onSave` ersetzen durch:
  ```ts
    onSave(): void {
      const number = this.parsedNumber();
      if (!this.canSave() || number === null) return;
      this.save.emit({
        number,
        name: this.name().trim(),
        brand: this.brand(),
        category: this.category(),
        price: this.price(),
        size: this.size().trim() || null,
        color: this.color().trim() || null,
        description: this.description().trim() || null,
      });
    }
  ```
  c) `artikel-dialog.html`: den Block
  ```html
      <div class="artikel-dialog__field">
        <span class="artikel-dialog__readonly-label">Artikelnummer</span>
        <span class="artikel-dialog__readonly-value">{{ articleNumber() }}</span>
      </div>
  ```
  ersetzen durch:
  ```html
      <div class="artikel-dialog__field">
        <label for="artikel-dialog-number">Artikelnummer</label>
        <input
          id="artikel-dialog-number"
          pInputText
          inputmode="numeric"
          [ngModel]="numberText()"
          (ngModelChange)="numberText.set($event)"
          (blur)="onNumberBlur()"
          name="number"
          type="text"
          required
          [disabled]="fieldsDisabled()"
        />
        @if (numberError()) {
          <small class="artikel-dialog__error">{{ numberError() }}</small>
        } @else if (showLabelHint()) {
          <small class="artikel-dialog__hint">Etikett neu drucken und anbringen.</small>
        }
      </div>
  ```
  d) `artikel-dialog.scss`: die beiden ungenutzten Blöcke `&__readonly-label { … }` und `&__readonly-value { … }` (samt der Leerzeile dazwischen) entfernen.
  e) `articles-page.ts`: in `dialogInitialValue` im zurückgegebenen Objekt vor `name: detail.name,` die Zeile `number: detail.number,` einfügen.
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/articles/**/*.spec.ts` — erwartet: PASS (Dialog-, Seiten- und Store-Spec)
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(articles): Artikelnummer im Artikel-Dialog änderbar mit Vorabprüfung" -- src/bazaar-app/frontend/src/app/features/articles/data/articles-api.ts src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.ts src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.html src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.scss src/bazaar-app/frontend/src/app/features/articles/components/artikel-dialog/artikel-dialog.spec.ts src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.ts src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.spec.ts src/bazaar-app/frontend/src/app/features/articles/articles-store.spec.ts`

---

### Task 4: Frontend — Seite verdrahtet Artikel-ID und Server-Fehler

**ACs:** AC-05, AC-07

**Dateien:**
- Modify: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.html:68-80` · `<app-artikel-dialog`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.ts:387-432` · `ArticlesPage.onDialogSave`
- Modify: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.ts:533-542` · `ArticlesPage.fieldErrorsOf`
- Test: `src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.spec.ts:698-724` · `describe('edit flow (artikel-dialog, review fix)')`

**Interfaces:**
- Consumes: `ArtikelDialog.articleId` (`input<string>`), `ArtikelDialogServerErrors.number?: string`, `ArtikelFormResult.number` aus Task 3; Server-Antwort `409` mit `errorCode: 'article.number_taken'` und `detail`, `400` mit `errors.number`
- Produces: `ArticlesPage.serverErrors()` enthält bei `article.number_taken` `{ number: <detail oder „Artikelnummer <n> ist bereits vergeben.“> }`, bei `400` zusätzlich `number` aus `errors.number[0]`

- [ ] **Schritt 1: Fehlschlagende Tests schreiben**
  In `articles-page.spec.ts` Import ergänzen: nach `import { ArticlesPage } from './articles-page';` einfügen `import { ArtikelDialog } from '../../components/artikel-dialog/artikel-dialog';`. Direkt nach dem Test `'maps a 400 response to field-level serverErrors instead of closing the dialog'` (endet mit `expect(component.serverErrors()?.name).toBe('Bezeichnung ist erforderlich');` und `});`) einfügen:
  ```ts

      it('maps a 400 number error to serverErrors.number', async () => {
        const { component } = await createPage();
        getById.mockReturnValue(of(buildDetail()));
        component.onEdit(buildItem());
        update.mockReturnValue(
          throwError(
            () =>
              new HttpErrorResponse({
                status: 400,
                error: { errors: { number: ['Artikelnummer muss eine ganze Zahl ab 1 sein.'] } },
              }),
          ),
        );

        component.onDialogSave({
          number: 0,
          name: 'Schneeanzug 104',
          brand: 'Playmobil',
          category: 'Kleidung',
          price: 15,
          size: null,
          color: null,
          description: null,
        });

        expect(component.dialogVisible()).toBe(true);
        expect(component.serverErrors()?.number).toBe(
          'Artikelnummer muss eine ganze Zahl ab 1 sein.',
        );
      });

      it('maps a 409 article.number_taken to serverErrors.number without closing the dialog', async () => {
        const { component } = await createPage();
        getById.mockReturnValue(of(buildDetail()));
        component.onEdit(buildItem());
        update.mockReturnValue(
          throwError(
            () =>
              new HttpErrorResponse({
                status: 409,
                error: {
                  errorCode: 'article.number_taken',
                  detail: 'Artikelnummer 1044 ist bereits vergeben.',
                },
              }),
          ),
        );

        component.onDialogSave({
          number: 1044,
          name: 'Schneeanzug 104',
          brand: 'Playmobil',
          category: 'Kleidung',
          price: 15,
          size: null,
          color: null,
          description: null,
        });

        expect(component.dialogVisible()).toBe(true);
        expect(component.serverErrors()?.number).toBe('Artikelnummer 1044 ist bereits vergeben.');
        expect(messageServiceAdd).not.toHaveBeenCalled();
      });

      it('passes the edited article id to the dialog', async () => {
        const { fixture, component } = await createPage();
        getById.mockReturnValue(of(buildDetail({ id: 'a7' })));

        component.onEdit(buildItem({ id: 'a7' }));
        await fixture.whenStable();

        const dialog = fixture.debugElement.query(By.directive(ArtikelDialog))
          .componentInstance as ArtikelDialog;
        expect(dialog.articleId()).toBe('a7');
      });
  ```
- [ ] **Schritt 2: Tests rot laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/articles/pages/articles-page/articles-page.spec.ts` — erwartet: FAIL `maps a 409 article.number_taken to serverErrors.number without closing the dialog` (außerdem FAIL `maps a 400 number error to serverErrors.number` und `passes the edited article id to the dialog`)
- [ ] **Schritt 3: Minimal implementieren**
  a) `articles-page.html`: im Tag `<app-artikel-dialog` nach der Zeile `[articleNumber]="editingRow()?.number ?? 0"` einfügen: `[articleId]="editingDetail()?.id ?? ''"`
  b) `articles-page.ts`, in `onDialogSave` direkt nach `const code = this.errorCodeOf(error);` (vor `if (code === 'article.sold') {`) einfügen:
  ```ts
          if (code === 'article.number_taken') {
            this.serverErrors.set({
              number:
                this.detailOf(error) ?? `Artikelnummer ${result.number} ist bereits vergeben.`,
            });
            return;
          }
  ```
  c) `articles-page.ts`, in `fieldErrorsOf` im zurückgegebenen Objekt vor `name: firstMessage('name'),` einfügen: `number: firstMessage('number'),`
- [ ] **Schritt 4: Tests grün laufen lassen**
  Befehl: `dv-angular-test --root <R>/src/bazaar-app/frontend -- --include src/app/features/articles/**/*.spec.ts` — erwartet: PASS; danach `dv-angular-lint --root <R>/src/bazaar-app/frontend` — erwartet: OK ohne Fehler
- [ ] **Schritt 5: Commit**
  `git commit -m "feat(articles): Seite meldet vergebene Artikelnummer am Feld" -- src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.html src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.ts src/bazaar-app/frontend/src/app/features/articles/pages/articles-page/articles-page.spec.ts`

---

### Task 5: Doku nachführen

**ACs:** AC-01, AC-02, AC-06, AC-08, AC-09

**Dateien:**
- Modify: `docs/requirements/bazaar-app/components/artikel-dialog.md` · Abschnitte „Überblick“, „1. ASCII-Darstellung“, „2. Felder“, „3. Sperren“, „Akzeptanzkriterien“
- Modify: `docs/requirements/bazaar-app/api/articles.md` · Abschnitt „4. `PUT /api/articles/{id}` — Stammfelder“
- Modify: `docs/requirements/bazaar-app/api/cross-cutting.md` · Tabellenzeile `article.number_taken`
- Modify: `docs/requirements/bazaar-app/epics/Epic_Artikel/epic.md` · Edit-Button-Liste
- Modify: `docs/requirements/bazaar-app/entities/artikel.md` · Tabellenzeile `number`
- Modify: `docs/knowledge/feature-profile/bazaar-app-articles/feature.md` · Capabilities, `Last reviewed`

**Interfaces:**
- Consumes: umgesetztes Verhalten aus Task 1–4 (Fehlercode `article.number_taken`, Texte, Sperren)
- Produces: Anforderungs-Doku und Feature-Profil beschreiben die änderbare Artikelnummer

- [ ] **Schritt 1: Doku-Änderungen schreiben** (je Ersetzung mit dem Edit-Werkzeug, `old_string` → `new_string`)
  a) `artikel-dialog.md` — Überblick-Tabelle:
  alt: `| Artikelnummer | Vorschlag, beim Speichern endgültig vergeben | **read-only**, klebt physisch am Etikett |`
  neu: `| Artikelnummer | Vorschlag, beim Speichern endgültig vergeben | **änderbar** — nur frei oder die eigene Nummer, sonst Fehler; klebt physisch am Etikett, daher Hinweis bei Änderung |`
  b) `artikel-dialog.md` — ASCII-Zeile:
  alt: `│  Artikelnummer  1043            (read-only)     │`
  neu: `│  [Artikelnummer *                      100%]     │`
  c) `artikel-dialog.md` — Felder-Tabelle:
  alt: `| Artikelnummer | — | **read-only**, oben; die Nummer klebt am Etikett |`
  neu: `| Artikelnummer | ✅ | oben; ganze Zahl ab 1, nur frei oder die eigene Nummer. Prüfung beim Verlassen des Feldes (Fehler „Artikelnummer <n> ist bereits vergeben.“), bei geänderter gültiger Nummer Hinweis „Etikett neu drucken und anbringen.“ |`
  d) `artikel-dialog.md` — Sperren: nach dem Satz `Alle Sperren werden **serverseitig** durchgesetzt (`409`); die deaktivierten Felder sind die Bequemlichkeit, nicht die Regel.` einen Absatz einfügen:
  `Die Artikelnummer folgt denselben Sperren wie Bezeichnung und Beschreibung: nach dem Verkauf bleibt sie änderbar, bei abgerechnetem Verkäufer ist sie gesperrt.`
  e) `artikel-dialog.md` — Akzeptanzkriterien: Zeile 1 ersetzen:
  alt: `1. **AC-1** — THE SYSTEM SHALL die Artikelnummer schreibgeschützt anzeigen und keinen Verkäufer-Wechsel anbieten.`
  neu: `1. **AC-1** — THE SYSTEM SHALL die Artikelnummer als änderbares Feld anzeigen und keinen Verkäufer-Wechsel anbieten.`
  und nach der Zeile `7. **AC-7** — …` anfügen:
  ```
  8. **AC-8** — IF die eingegebene Artikelnummer an einem anderen Artikel hängt, THEN SHALL das Feld „Artikelnummer <n> ist bereits vergeben.“ zeigen und das Speichern verhindern.
  9. **AC-9** — IF die Artikelnummer leer, 0, negativ oder keine ganze Zahl ist, THEN SHALL das Feld einen Fehler zeigen und das Speichern verhindern.
  10. **AC-10** — WHEN die Artikelnummer geändert und gültig ist, THE SYSTEM SHALL unter dem Feld den Hinweis „Etikett neu drucken und anbringen.“ zeigen.
  11. **AC-11** — THE SYSTEM SHALL eine Nummernänderung serverseitig ablehnen, wenn die Nummer an einem anderen Artikel hängt (`409`, `article.number_taken`) oder der Verkäufer abgerechnet ist (`409`, `settlement.locked`).
  ```
  f) `api/articles.md` §4: Request-Zeile alt `{ "name": "Winterjacke", "brand": "Nike", "category": "Jacken",` neu `{ "number": 1043, "name": "Winterjacke", "brand": "Nike", "category": "Jacken",`; nach der Zeile `→ 409 Conflict   errorCode: settlement.locked     (Verkäufer abgerechnet)` einfügen:
  ```
  → 409 Conflict   errorCode: article.number_taken  (number an einem anderen Artikel)
  → 400 Bad Request                                  (number < 1)
  ```
  und den Satz alt `` `number` und `sellerId` sind **nie** änderbar: Die Nummer klebt physisch am Artikel, und ein Artikel wechselt nicht den Besitzer. `` neu `` `number` ist änderbar, wenn sie frei oder die eigene Nummer des Artikels ist (sonst `409 article.number_taken`, geprüft vor dem Speichern); sie folgt den Sperren der übrigen Stammfelder außer `price`. Die Nummer klebt physisch am Etikett — der Dialog weist bei Änderung darauf hin. `sellerId` ist **nie** änderbar: Ein Artikel wechselt nicht den Besitzer. ``
  g) `api/cross-cutting.md`: alt `| `article.number_taken` | 409 | Artikelnummer *n* ist inzwischen vergeben | [`intake.md`](intake.md) |` neu `| `article.number_taken` | 409 | Artikelnummer *n* ist inzwischen vergeben | [`intake.md`](intake.md), [`articles.md`](articles.md) §4 |`
  h) `epics/Epic_Artikel/epic.md`: alt `- Artikelnummer oben, read-only` neu `- Artikelnummer oben, änderbar (nur frei oder die eigene Nummer, sonst Fehler am Feld)`
  i) `entities/artikel.md`: alt `| `number` | int | ✅ | Artikelnummer, Grundlage für Barcode/QR |` neu `| `number` | int | ✅ | Artikelnummer, Grundlage für Barcode/QR; systemweit eindeutig, im Artikel-Dialog änderbar |`
  j) `feature-profile/bazaar-app-articles/feature.md`: `**Last reviewed:** 2026-09-21` → `**Last reviewed:** 2026-10-13`; Zeile alt `- User can edit an article's Bezeichnung/Kategorie/Marke/Preis/Größe/Farbe/Beschreibung via dialog — `components/artikel-dialog/artikel-dialog.ts`` neu `- User can edit an article's Artikelnummer/Bezeichnung/Kategorie/Marke/Preis/Größe/Farbe/Beschreibung via dialog — `components/artikel-dialog/artikel-dialog.ts``; nach der Zeile `- User can delete an article (only surfaced when allowed) — …` einfügen:
  `- User sees an error and cannot save when the entered Artikelnummer belongs to another article (checked on blur via `GET /api/articles/by-number/{number}`, enforced by `PUT /api/articles/{id}` as 409 `article.number_taken`) and a label hint when the number was changed — `artikel-dialog.ts` (`onNumberBlur`, `numberError`, `showLabelHint`), `UpdateArticleHandler``
- [ ] **Schritt 2: Diff dem Menschen zeigen und Bestätigung abwarten**
  Befehl: `git diff -- docs` — erwartet: nur die oben genannten Ersetzungen; Mensch bestätigt im Chat, vorher kein Commit
- [ ] **Schritt 3: Commit**
  `git commit -m "docs(articles): änderbare Artikelnummer in Anforderungen und Feature-Profil" -- docs/requirements/bazaar-app/components/artikel-dialog.md docs/requirements/bazaar-app/api/articles.md docs/requirements/bazaar-app/api/cross-cutting.md docs/requirements/bazaar-app/epics/Epic_Artikel/epic.md docs/requirements/bazaar-app/entities/artikel.md docs/knowledge/feature-profile/bazaar-app-articles/feature.md`

## Entscheidungen
- Keine Fragen an den Menschen.
- **E · Reihenfolge im Handler** · Planer — Verfügbarkeitsprüfung vor `UpdateDetails` und `Renumber`, damit eine Ablehnung (vergebene Nummer, Preissperre) den geladenen Artikel nie halb mutiert; `Renumber` läuft als letzte Mutation und kann nicht mehr werfen, da der Validator `Number ≥ 1` sichert.
- **E · Parallelzugriff** · Planer — Eine Kollision zwischen Prüfung und Speichern in derselben Millisekunde fängt der bestehende eindeutige Index auf `Number` als Datenbankfehler ab; ein eigenes Mapping der `DbUpdateException` auf `article.number_taken` ist nicht geplant (YAGNI, kein Vorbild im Bestand, kein AC verlangt es). Keine Migration nötig, der Index besteht.
- **E · Vorabprüfung über Bestands-Endpunkt** · Planer — Das Frontend nutzt `GET /api/articles/by-number/{number}` (404 = frei, Treffer mit eigener `id` = frei); die API-Doku schließt einen eigenen `number-available`-Endpunkt ausdrücklich aus. Der Treffer liefert dem Frontend zwar Daten des anderen Artikels, angezeigt wird nur der feste Text ohne Besitzer.
- **E · Technische Obergrenze** · Planer — Die Spec nennt keine Obergrenze; Datenbank und Contract tragen `int`, daher gilt `2147483647` als größte Eingabe, größere Werte erhalten denselben Formatfehler wie ungültige Eingaben.
- **E · Speichern bei „verkauft“** · Planer — Der Dialog sperrte bisher das Speichern bei `locked = 'sold'` ganz (`canSave` verlangte `'none'`), obwohl die Anforderungs-Doku nach dem Verkauf alle Felder außer Preis freigibt. AC-10 der Spec („verkaufter Artikel, Nummer ändern, speichern“) verlangt das Speichern; `canSave` sperrt deshalb nur noch bei abgerechnetem Verkäufer, der Preis bleibt über `priceDisabled` gesperrt. Der bestehende Test wird entsprechend angepasst — Verhaltensänderung über die Nummer hinaus, die der Mensch beim Review bestätigen sollte.
- **E · Stale-Fehler** · Planer — Eine Server-Fehlermeldung zur Nummer erscheint nur, solange die abgelehnte Nummer noch im Feld steht (`rejectedNumber`); ändert der Anwender die Nummer, verschwindet die alte Meldung, ohne dass die Seite sie zurücksetzen muss.
- **E · Task-Zuschnitt Frontend** · Planer — Dialog und die davon strukturell abhängigen Typen/Specs (`ArtikelFormValue`, `UpdateArticleRequest`, Seed in `articles-page.ts`) liegen in Task 3, weil `ArtikelFormValue.number` sonst die Seite zwischen zwei Commits unbaubar macht; Task 4 enthält nur die Seiten-Verdrahtung.
- **E · AC-12 ohne Rollenprüfung** · Planer — Der Endpunkt verlangt nur `RequireAuthorization()` ohne Rollenpolicy und der Handler kennt keine Rolle; AC-12 wird deshalb über den Dialog-Test mit `isAdmin: false` belegt, ein Endpunkt-Test mit Rollen entfällt (es gibt keine Endpunkt-Testinfrastruktur für Artikel).
