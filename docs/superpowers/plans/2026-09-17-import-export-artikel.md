# Import/Export "Meine Artikel" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a CSV/XLSX Export, Vorlage (blank template) and Import to "Meine Artikel" in the
Voranmelde-App, reachable via a PrimeNG `p-splitButton` that replaces the existing "+Neu"
button in the shared `FilterPanel` toolbar.

**Architecture:** Backend lives entirely inside the existing `BAR.Modules.Registration`
module (Domain/Application/Infrastructure) behind the `IRegistrationModuleApi` facade —
`BAR.Host` never talks to Application handlers directly, only through that facade, exactly
like every existing Articles endpoint. Import parsing (CSV manual, `.xlsx` via ClosedXML) and
validation are pure, DB-free functions so the all-or-nothing row-error logic is fully unit
tested without a database; only the final batched write touches `IArticleRepository`.
Frontend adds one shared-component capability (`FilterPanel.splitButtonItems`) and one new
feature-local API service + result dialog.

**Tech Stack:** .NET 10 (Minimal APIs, EF Core, PostgreSQL), ClosedXML (new dependency,
MIT-licensed, `.xlsx` read/write), xUnit v3 + Moq, Angular (standalone components, signals),
PrimeNG (`p-splitButton`, `p-dialog`, `p-table`), Vitest.

**Spec:** [`docs/superpowers/specs/2026-09-17-import-export-artikel-design.md`](../specs/2026-09-17-import-export-artikel-design.md)

## Global Constraints

- Contract-Sprache (JSON-Feldnamen, Routen) ist **Englisch**, CSV-Header und alle
  Benutzer-sichtbaren Texte sind **Deutsch** (Export-Header exakt
  `Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis`, `;` als Trennzeichen, Komma als
  Dezimaltrennzeichen).
- Nur PrimeNG-Komponenten im Frontend, kein natives HTML für UI-Elemente.
- `BAR.Host` ruft ausschließlich `IRegistrationModuleApi`/`IMasterDataModuleApi` auf, nie
  Application-Handler oder `DbContext` direkt (dotnet-modulith-bridge).
- Jede neue/geänderte Übersetzung wird gleichzeitig in `de.json` und `en.json` eingetragen.
- Import ist alles-oder-nichts: bei mindestens einem Zeilenfehler wird nichts gespeichert,
  Antwort `422` mit der vollständigen Fehlerliste.
- Import gilt als vollständige Eingabe: Farbe/Beschreibung eines aktualisierten Artikels
  werden auf `null` gesetzt, weil die Import-Datei keine Spalten dafür hat.

---

## File Structure

**Backend (`src/advance-registration/backend/`):**

| File | Responsibility |
|---|---|
| `BAR.Modules.Registration/Domain/Ports/IArticleRepository.cs` (modify) | + `GetAllForSellerAsync`, `ApplyImportAsync` |
| `BAR.Modules.Registration/Infrastructure/Persistence/Repositories/ArticleRepository.cs` (modify) | EF impl of the two new methods |
| `BAR.Modules.Registration/Domain/NumberBlocks/NumberBlockSequence.cs` (new) | Pure: full ascending number sequence across a seller's blocks |
| `BAR.Modules.Registration/Application/Articles/ImportExport/ArticleExportRow.cs` (new) | Row DTO shared by export/template |
| `BAR.Modules.Registration/Application/Articles/ImportExport/ArticleExportRowBuilder.cs` (new) | Pure: numbers+articles → rows (export), numbers → blank rows (template) |
| `BAR.Modules.Registration/Application/Articles/ImportExport/ArticleCsvWriter.cs` (new) | Pure: rows → CSV string |
| `BAR.Modules.Registration/Application/Articles/ImportExport/GetArticleExportCsvQueryHandler.cs` (new) | Orchestrates export |
| `BAR.Modules.Registration/Application/Articles/ImportExport/GetArticleTemplateCsvQueryHandler.cs` (new) | Orchestrates template |
| `BAR.Modules.Registration/Application/Articles/ImportExport/ArticleImportFileParser.cs` (new) | CSV/XLSX bytes → raw rows |
| `BAR.Modules.Registration/Application/Articles/ImportExport/ArticleImportValidator.cs` (new) | Pure: raw rows + own blocks + existing articles → actions/errors |
| `BAR.Modules.Registration/Application/Articles/ImportExport/ImportArticlesCommandHandler.cs` (new) | Orchestrates parse → validate → master-data auto-create → batched write |
| `BAR.Modules.Registration.Contracts/Articles/ArticleImportExportDto.cs` (new) | Facade-crossing DTOs: command + result + row error |
| `BAR.Modules.Registration.Contracts/IRegistrationModuleApi.cs` (modify) | + 3 facade methods |
| `BAR.Modules.Registration/Application/RegistrationModuleApi.cs` (modify) | Wires the 3 new facade methods |
| `BAR.Modules.Registration/Infrastructure/DependencyInjection.cs` (modify) | Registers new handlers |
| `BAR.Modules.Registration/BAR.Modules.Registration.csproj` (modify) | + ClosedXML package reference |
| `Directory.Packages.props` (modify) | + ClosedXML version |
| `BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs` (new) | 3 endpoints: export/template GET, import POST |
| `BAR.Host/Program.cs` (modify) | + `app.MapArticleImportExportEndpoints();` |

**Frontend (`src/advance-registration/frontend/BAR.App/src/app/`):**

| File | Responsibility |
|---|---|
| `shared/filter-panel/filter-panel.ts` (modify) | + `splitButtonItems` input, renders `p-splitButton` when set |
| `features/registration/my-articles/articles-import-export-api.service.ts` (new) | Export/Template blob download, Import upload |
| `features/registration/my-articles/components/import-result-dialog.ts` (new) | Success / row-errors / general-error display |
| `features/registration/my-articles/pages/MyArticlesPage.ts` (modify) | Wires split-button items, hidden file input, dialog |
| `public/i18n/de.json`, `public/i18n/en.json` (modify) | New `myArticles.importExport.*` / `myArticles.import.*` keys |

---

### Task 1: `IArticleRepository` — seller-wide read + batched import write

**Files:**
- Modify: `src/advance-registration/backend/BAR.Modules.Registration/Domain/Ports/IArticleRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration/Infrastructure/Persistence/Repositories/ArticleRepository.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleRepositoryTests.cs` (add to existing file)

**Interfaces:**
- Produces: `IArticleRepository.GetAllForSellerAsync(string sellerId, CancellationToken) → Task<IReadOnlyList<Article>>`; `IArticleRepository.ApplyImportAsync(IReadOnlyList<Article> toCreate, IReadOnlyList<Article> toUpdate, IReadOnlyList<Article> toDelete, CancellationToken) → Task` — used by Task 4 (export) and Task 9 (import).

- [ ] **Step 1: Write the failing integration tests**

Append to `ArticleRepositoryTests.cs` (same `using`s as the existing file already provide
`Article`, `NumberBlock`, `IArticleRepository`, `PostgresWebApplicationFactory`):

```csharp
    [Fact]
    public async Task GetAllForSellerAsync_ReturnsOnlyThatSellersArticles()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var otherId = Guid.NewGuid().ToString("N")[..8];
        await repo.CreateAsync(Article.Create(sellerId, 201, "A", "B", "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(otherId, 202, "A", "B", "C", 1m, null, null, null, Now), null, ct);

        var result = await repo.GetAllForSellerAsync(sellerId, ct);

        Assert.Single(result);
        Assert.Equal(201, result[0].Number);
    }

    [Fact]
    public async Task ApplyImportAsync_CreatesUpdatesAndDeletesInOneCall()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await repo.CreateAsync(Article.Create(sellerId, 301, "Alt", "B", "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(sellerId, 302, "ZuLoeschen", "B", "C", 1m, null, null, null, Now), null, ct);
        var existing = await repo.GetAllForSellerAsync(sellerId, ct);
        var toUpdate = existing.Single(a => a.Number == 301);
        toUpdate.Update("Neu", "B2", "C2", 2m, null, null, null, Now);
        var toDelete = existing.Single(a => a.Number == 302);
        var toCreate = Article.Create(sellerId, 303, "Frisch", "B", "C", 3m, null, null, null, Now);

        await repo.ApplyImportAsync([toCreate], [toUpdate], [toDelete], ct);

        var after = await repo.GetAllForSellerAsync(sellerId, ct);
        Assert.Equal(2, after.Count);
        Assert.Contains(after, a => a.Number == 301 && a.Name == "Neu");
        Assert.Contains(after, a => a.Number == 303 && a.Name == "Frisch");
        Assert.DoesNotContain(after, a => a.Number == 302);
    }
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "GetAllForSellerAsync_ReturnsOnlyThatSellersArticles|ApplyImportAsync_CreatesUpdatesAndDeletesInOneCall"`
Expected: FAIL — `IArticleRepository` has no `GetAllForSellerAsync`/`ApplyImportAsync` members (compile error).

- [ ] **Step 3: Add the two methods to the interface**

In `IArticleRepository.cs`, add after `GetAllForExportAsync`:

```csharp
    Task<IReadOnlyList<Article>> GetAllForSellerAsync(string sellerId, CancellationToken cancellationToken);
    Task ApplyImportAsync(
        IReadOnlyList<Article> toCreate, IReadOnlyList<Article> toUpdate, IReadOnlyList<Article> toDelete,
        CancellationToken cancellationToken);
```

- [ ] **Step 4: Implement in `ArticleRepository`**

Add after `GetAllForExportAsync`:

```csharp
    public async Task<IReadOnlyList<Article>> GetAllForSellerAsync(string sellerId, CancellationToken cancellationToken) =>
        await dbContext.Articles.Where(a => a.SellerId == sellerId).ToListAsync(cancellationToken);

    public async Task ApplyImportAsync(
        IReadOnlyList<Article> toCreate, IReadOnlyList<Article> toUpdate, IReadOnlyList<Article> toDelete,
        CancellationToken cancellationToken)
    {
        dbContext.Articles.AddRange(toCreate);
        dbContext.Articles.RemoveRange(toDelete);
        // toUpdate entities are already tracked (loaded via GetAllForSellerAsync in the same
        // scoped DbContext) - their mutated state is picked up by SaveChangesAsync without
        // an explicit Update() call, same as the existing single-article UpdateAsync.
        await dbContext.SaveChangesAsync(cancellationToken);
    }
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "GetAllForSellerAsync_ReturnsOnlyThatSellersArticles|ApplyImportAsync_CreatesUpdatesAndDeletesInOneCall"`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.Registration/Domain/Ports/IArticleRepository.cs src/advance-registration/backend/BAR.Modules.Registration/Infrastructure/Persistence/Repositories/ArticleRepository.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleRepositoryTests.cs
git commit -m "feat(bar-backend): add seller-wide read and batched import write to IArticleRepository"
```

---

### Task 2: Number sequence + export row builder (pure, no DB)

**Files:**
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Domain/NumberBlocks/NumberBlockSequence.cs`
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleExportRow.cs`
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleExportRowBuilder.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Registration/NumberBlocks/NumberBlockSequenceTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleExportRowBuilderTests.cs`

**Interfaces:**
- Produces: `NumberBlockSequence.AllNumbersOrdered(IReadOnlyList<NumberBlock>) → IReadOnlyList<int>`; `ArticleExportRow(int Number, string? Name, string? Category, string? Brand, string? Size, decimal? Price)`; `ArticleExportRowBuilder.BuildExportRows(IReadOnlyList<int>, IReadOnlyList<Article>) → IReadOnlyList<ArticleExportRow>`; `ArticleExportRowBuilder.BuildTemplateRows(IReadOnlyList<int>) → IReadOnlyList<ArticleExportRow>` — used by Task 3 (CSV writer) and Task 4 (handlers).

- [ ] **Step 1: Write the failing domain test**

```csharp
using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.Registration.NumberBlocks;

public class NumberBlockSequenceTests
{
    [Fact]
    public void AllNumbersOrdered_SingleBlock_ReturnsFullRange()
    {
        var block = NumberBlock.Assign("s1", 101, 5, DateTime.UtcNow);

        var result = NumberBlockSequence.AllNumbersOrdered([block]);

        Assert.Equal([101, 102, 103, 104, 105], result);
    }

    [Fact]
    public void AllNumbersOrdered_MultipleBlocksOutOfOrder_ReturnsAscendingAcrossBlocks()
    {
        var second = NumberBlock.Assign("s1", 201, 3, DateTime.UtcNow);
        var first = NumberBlock.Assign("s1", 101, 2, DateTime.UtcNow);

        var result = NumberBlockSequence.AllNumbersOrdered([second, first]);

        Assert.Equal([101, 102, 201, 202, 203], result);
    }

    [Fact]
    public void AllNumbersOrdered_NoBlocks_ReturnsEmpty()
    {
        Assert.Empty(NumberBlockSequence.AllNumbersOrdered([]));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter NumberBlockSequenceTests`
Expected: FAIL — `NumberBlockSequence` does not exist.

- [ ] **Step 3: Implement `NumberBlockSequence`**

```csharp
namespace BAR.Modules.Registration.Domain.NumberBlocks;

/// <summary>
/// Ascending numbers across all of a seller's blocks, own-range-membership
/// and Export/Template row generation share this instead of duplicating the
/// range expansion (blocks never overlap, enforced by a DB exclusion
/// constraint - see AddNumberBlockOverlapExclusion migration).
/// </summary>
public static class NumberBlockSequence
{
    public static IReadOnlyList<int> AllNumbersOrdered(IReadOnlyList<NumberBlock> blocks) =>
        blocks
            .OrderBy(b => b.FromNumber)
            .SelectMany(b => Enumerable.Range(b.FromNumber, b.ToNumber - b.FromNumber + 1))
            .ToList();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Domain.UnitTests --filter NumberBlockSequenceTests`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing application test**

```csharp
using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Domain.Articles;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleExportRowBuilderTests
{
    private static readonly DateTime Now = new(2026, 9, 17, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void BuildExportRows_NumberWithArticle_FillsAllFields()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", "kaum getragen", Now);

        var rows = ArticleExportRowBuilder.BuildExportRows([101], [article]);

        Assert.Equal(new ArticleExportRow(101, "Jacke", "Jacken", "Nike", "M", 25m), rows.Single());
    }

    [Fact]
    public void BuildExportRows_NumberWithoutArticle_OnlyNumberFilled()
    {
        var rows = ArticleExportRowBuilder.BuildExportRows([102], []);

        Assert.Equal(new ArticleExportRow(102, null, null, null, null, null), rows.Single());
    }

    [Fact]
    public void BuildTemplateRows_NeverIncludesArticleData()
    {
        var rows = ArticleExportRowBuilder.BuildTemplateRows([101, 102]);

        Assert.All(rows, r => Assert.Null(r.Name));
        Assert.Equal([101, 102], rows.Select(r => r.Number));
    }
}
```

- [ ] **Step 6: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleExportRowBuilderTests`
Expected: FAIL — `ArticleExportRow`/`ArticleExportRowBuilder` do not exist.

- [ ] **Step 7: Implement `ArticleExportRow` and `ArticleExportRowBuilder`**

`ArticleExportRow.cs`:
```csharp
namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed record ArticleExportRow(int Number, string? Name, string? Category, string? Brand, string? Size, decimal? Price);
```

`ArticleExportRowBuilder.cs`:
```csharp
using BAR.Modules.Registration.Domain.Articles;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public static class ArticleExportRowBuilder
{
    public static IReadOnlyList<ArticleExportRow> BuildExportRows(IReadOnlyList<int> allNumbers, IReadOnlyList<Article> articles)
    {
        var byNumber = articles.ToDictionary(a => a.Number);
        return allNumbers
            .Select(n => byNumber.TryGetValue(n, out var a)
                ? new ArticleExportRow(n, a.Name, a.Category, a.Brand, a.Size, a.Price)
                : new ArticleExportRow(n, null, null, null, null, null))
            .ToList();
    }

    public static IReadOnlyList<ArticleExportRow> BuildTemplateRows(IReadOnlyList<int> allNumbers) =>
        allNumbers.Select(n => new ArticleExportRow(n, null, null, null, null, null)).ToList();
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleExportRowBuilderTests`
Expected: PASS (3 tests).

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.Registration/Domain/NumberBlocks/NumberBlockSequence.cs src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleExportRow.cs src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleExportRowBuilder.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Registration/NumberBlocks/NumberBlockSequenceTests.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleExportRowBuilderTests.cs
git commit -m "feat(bar-backend): add number-sequence and export-row-builder helpers"
```

---

### Task 3: `ArticleCsvWriter`

**Files:**
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleCsvWriter.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleCsvWriterTests.cs`

**Interfaces:**
- Consumes: `ArticleExportRow` (Task 2).
- Produces: `ArticleCsvWriter.Write(IReadOnlyList<ArticleExportRow>) → string` — used by Task 4.

- [ ] **Step 1: Write the failing test**

```csharp
using BAR.Modules.Registration.Application.Articles.ImportExport;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleCsvWriterTests
{
    [Fact]
    public void Write_HeaderRow_MatchesExactGermanColumns()
    {
        var csv = ArticleCsvWriter.Write([]);

        Assert.StartsWith("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n", csv);
    }

    [Fact]
    public void Write_FullyFilledRow_UsesCommaAsDecimalSeparator()
    {
        var csv = ArticleCsvWriter.Write([new ArticleExportRow(101, "Jacke", "Jacken", "Nike", "M", 12.5m)]);

        Assert.Contains("101;Jacke;Jacken;Nike;M;12,50\r\n", csv);
    }

    [Fact]
    public void Write_EmptyRow_OnlyNumberFilledRestBlank()
    {
        var csv = ArticleCsvWriter.Write([new ArticleExportRow(102, null, null, null, null, null)]);

        Assert.Contains("102;;;;;\r\n", csv);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleCsvWriterTests`
Expected: FAIL — `ArticleCsvWriter` does not exist.

- [ ] **Step 3: Implement `ArticleCsvWriter`**

```csharp
using System.Globalization;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

/// <summary>
/// ';' as the delimiter and ',' as the decimal separator match German Excel's
/// default CSV dialect - a plain '.'/',' file opens with every value crammed
/// into column A otherwise (api/articles.md has no CSV format section; this
/// is the format this feature introduces).
/// </summary>
public static class ArticleCsvWriter
{
    private const string Header = "Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis";
    private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");

    public static string Write(IReadOnlyList<ArticleExportRow> rows)
    {
        var lines = new List<string> { Header };
        lines.AddRange(rows.Select(FormatRow));
        return string.Join("\r\n", lines) + "\r\n";
    }

    private static string FormatRow(ArticleExportRow row) => string.Join(';', new[]
    {
        row.Number.ToString(CultureInfo.InvariantCulture),
        row.Name ?? "",
        row.Category ?? "",
        row.Brand ?? "",
        row.Size ?? "",
        row.Price.HasValue ? row.Price.Value.ToString("0.00", German) : ""
    });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleCsvWriterTests`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleCsvWriter.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleCsvWriterTests.cs
git commit -m "feat(bar-backend): add ArticleCsvWriter"
```

---

### Task 4: Export/Template handlers + facade wiring

**Files:**
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/GetArticleExportCsvQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/GetArticleTemplateCsvQueryHandler.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration.Contracts/IRegistrationModuleApi.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration/Application/RegistrationModuleApi.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration/Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/GetArticleExportCsvQueryHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/GetArticleTemplateCsvQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `IArticleRepository.GetAllForSellerAsync` (Task 1), `INumberBlockRepository.GetForSellerAsync` (existing), `NumberBlockSequence.AllNumbersOrdered`, `ArticleExportRowBuilder`, `ArticleCsvWriter` (Tasks 2/3).
- Produces: `IRegistrationModuleApi.GetArticleExportCsvAsync(string sellerId, CancellationToken) → Task<string>`; `IRegistrationModuleApi.GetArticleTemplateCsvAsync(string sellerId, CancellationToken) → Task<string>` — used by Task 5 (endpoints).

- [ ] **Step 1: Write the failing handler tests**

Put the first class in `GetArticleExportCsvQueryHandlerTests.cs`, the second in
`GetArticleTemplateCsvQueryHandlerTests.cs` (both files use this same `using` block):

```csharp
using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class GetArticleExportCsvQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_GapInNumberBlock_ExportsFullRangeWithBlankGap()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 3, DateTime.UtcNow);
        var article = Article.Create(sellerId, 101, "Jacke", "Nike", "Jacken", 25m, null, null, null, DateTime.UtcNow);
        var blocks = new Mock<INumberBlockRepository>();
        blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        var articles = new Mock<IArticleRepository>();
        articles.Setup(a => a.GetAllForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([article]);
        var handler = new GetArticleExportCsvQueryHandler(articles.Object, blocks.Object);

        var csv = await handler.HandleAsync(sellerId, TestContext.Current.CancellationToken);

        Assert.Contains("101;Jacke;Jacken;Nike;;25,00\r\n", csv);
        Assert.Contains("102;;;;;\r\n", csv);
        Assert.Contains("103;;;;;\r\n", csv);
    }
}

public class GetArticleTemplateCsvQueryHandlerTests
{
    [Fact]
    public async Task HandleAsync_ExistingArticle_StillOnlyNumberInTemplate()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 1, DateTime.UtcNow);
        var blocks = new Mock<INumberBlockRepository>();
        blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        var handler = new GetArticleTemplateCsvQueryHandler(blocks.Object);

        var csv = await handler.HandleAsync(sellerId, TestContext.Current.CancellationToken);

        Assert.Contains("101;;;;;\r\n", csv);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter "GetArticleExportCsvQueryHandlerTests|GetArticleTemplateCsvQueryHandlerTests"`
Expected: FAIL — handler classes do not exist.

- [ ] **Step 3: Implement the handlers**

`GetArticleExportCsvQueryHandler.cs`:
```csharp
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed class GetArticleExportCsvQueryHandler(IArticleRepository articles, INumberBlockRepository blocks)
{
    public async Task<string> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var allNumbers = NumberBlockSequence.AllNumbersOrdered(sellerBlocks);
        var sellerArticles = await articles.GetAllForSellerAsync(sellerId, cancellationToken);
        var rows = ArticleExportRowBuilder.BuildExportRows(allNumbers, sellerArticles);
        return ArticleCsvWriter.Write(rows);
    }
}
```

`GetArticleTemplateCsvQueryHandler.cs`:
```csharp
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed class GetArticleTemplateCsvQueryHandler(INumberBlockRepository blocks)
{
    public async Task<string> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var allNumbers = NumberBlockSequence.AllNumbersOrdered(sellerBlocks);
        var rows = ArticleExportRowBuilder.BuildTemplateRows(allNumbers);
        return ArticleCsvWriter.Write(rows);
    }
}
```

- [ ] **Step 4: Add the two methods to the facade contract**

In `IRegistrationModuleApi.cs`, add after `GetArticlesForExportAsync`:

```csharp
    /// <summary>For the seller-facing CSV Export/Vorlage in Meine Artikel.</summary>
    Task<string> GetArticleExportCsvAsync(string sellerId, CancellationToken cancellationToken);
    Task<string> GetArticleTemplateCsvAsync(string sellerId, CancellationToken cancellationToken);
```

- [ ] **Step 5: Implement in `RegistrationModuleApi`**

Add after `GetArticlesForExportAsync`:

```csharp
    public Task<string> GetArticleExportCsvAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetArticleExportCsvQueryHandler>().HandleAsync(sellerId, cancellationToken);

    public Task<string> GetArticleTemplateCsvAsync(string sellerId, CancellationToken cancellationToken) =>
        Resolve<GetArticleTemplateCsvQueryHandler>().HandleAsync(sellerId, cancellationToken);
```

Add `using BAR.Modules.Registration.Application.Articles.ImportExport;` to the `using` block.

- [ ] **Step 6: Register the handlers in DI**

In `DependencyInjection.cs`, add after `services.AddScoped<GetArticleByIdQueryHandler>();`:

```csharp
        services.AddScoped<GetArticleExportCsvQueryHandler>();
        services.AddScoped<GetArticleTemplateCsvQueryHandler>();
```

Add `using BAR.Modules.Registration.Application.Articles.ImportExport;` to the `using` block.

- [ ] **Step 7: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter "GetArticleExportCsvQueryHandlerTests|GetArticleTemplateCsvQueryHandlerTests"`
Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/GetArticleExportCsvQueryHandler.cs src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/GetArticleTemplateCsvQueryHandler.cs src/advance-registration/backend/BAR.Modules.Registration.Contracts/IRegistrationModuleApi.cs src/advance-registration/backend/BAR.Modules.Registration/Application/RegistrationModuleApi.cs src/advance-registration/backend/BAR.Modules.Registration/Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/GetArticleExportCsvQueryHandlerTests.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/GetArticleTemplateCsvQueryHandlerTests.cs
git commit -m "feat(bar-backend): add export/template handlers and wire the facade"
```

---

### Task 5: Export/Template endpoints

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Articles/ArticleImportExportEndpointsTests.cs`

**Interfaces:**
- Consumes: `IRegistrationModuleApi.GetArticleExportCsvAsync`/`GetArticleTemplateCsvAsync` (Task 4).
- Produces: `GET /api/articles/mine/export`, `GET /api/articles/mine/template` — this task only maps these two; the `POST /api/articles/mine/import` route is added to the same file in Task 9.

- [ ] **Step 1: Write the failing integration tests**

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Articles;

public class ArticleImportExportEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleImportExportEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Export_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/articles/mine/export", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Export_AuthenticatedSeller_ReturnsCsvWithHeaderAndOwnNumberRange()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/articles/mine/export", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/csv; charset=utf-8", response.Content.Headers.ContentType!.ToString());
        Assert.StartsWith("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n", body);
    }

    [Fact]
    public async Task Template_ExistingArticle_RowStillOnlyHasNumber()
    {
        var client = await RegisterAndAuthenticateAsync();
        await client.PostAsJsonAsync("/api/articles", new { name = "A", brand = "B", category = "C", price = 1m }, TestContext.Current.CancellationToken);

        var response = await client.GetAsync("/api/articles/mine/template", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        var firstDataLine = body.Split("\r\n")[1];

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.EndsWith(";;;;;", firstDataLine);
    }

    private async Task<HttpClient> RegisterAndAuthenticateAsync()
    {
        await RegistrationTestSeed.EnableRegistrationAsync(_factory.Services, TestContext.Current.CancellationToken);

        var client = _factory.CreateClient();
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"{Guid.NewGuid()}@example.com", password = "geheim123!",
            firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
            postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);
        var tokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        return client;
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ArticleImportExportEndpointsTests`
Expected: FAIL — 404, routes don't exist yet.

- [ ] **Step 3: Implement the endpoints**

```csharp
using System.Security.Claims;
using System.Text;
using BAR.Modules.Registration.Contracts;

namespace BAR.Host.Features.Articles;

public static class ArticleImportExportEndpoints
{
    public static IEndpointRouteBuilder MapArticleImportExportEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/articles/mine/export", async (ClaimsPrincipal user, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var csv = await registration.GetArticleExportCsvAsync(sellerId, ct);
            return CsvFile(csv, $"meine-artikel-{DateTime.UtcNow:yyyy-MM-dd}.csv");
        }).RequireAuthorization();

        app.MapGet("/api/articles/mine/template", async (ClaimsPrincipal user, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var csv = await registration.GetArticleTemplateCsvAsync(sellerId, ct);
            return CsvFile(csv, $"meine-artikel-vorlage-{DateTime.UtcNow:yyyy-MM-dd}.csv");
        }).RequireAuthorization();

        return app;
    }

    private static IResult CsvFile(string csv, string fileName)
    {
        var bytes = new UTF8Encoding(encoderShouldEmitUTF8Identifier: true).GetBytes(csv);
        return Results.File(bytes, "text/csv; charset=utf-8", fileName);
    }
}
```

In `Program.cs`, add directly after `app.MapArticlesEndpoints();`:

```csharp
app.MapArticleImportExportEndpoints();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ArticleImportExportEndpointsTests`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Articles/ArticleImportExportEndpointsTests.cs
git commit -m "feat(bar-backend): add GET export/template endpoints for Meine Artikel"
```

---

### Task 6: ClosedXML dependency + `ArticleImportFileParser`

**Files:**
- Modify: `src/advance-registration/backend/Directory.Packages.props`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration/BAR.Modules.Registration.csproj`
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportRawRow.cs`
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleImportFileParser.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleImportFileParserTests.cs`

**Interfaces:**
- Produces: `ImportRawRow(int LineNumber, string? NumberRaw, string? Name, string? Category, string? Brand, string? Size, string? PriceRaw)`; `ArticleImportFileParser.Parse(byte[] fileContent, string fileName) → IReadOnlyList<ImportRawRow>` (throws `FormatException` on an unreadable/wrong-shaped file) — used by Task 8.

- [ ] **Step 1: Add the ClosedXML package**

In `Directory.Packages.props`, add a new `<ItemGroup>` after the "Persistenz" group:

```xml
  <!-- Import/Export -->
  <ItemGroup>
    <PackageVersion Include="ClosedXML" Version="0.104.2" />
  </ItemGroup>
```

In `BAR.Modules.Registration/BAR.Modules.Registration.csproj`, add to the existing package
`<ItemGroup>`:

```xml
    <PackageReference Include="ClosedXML" />
```

- [ ] **Step 2: Write the failing tests**

```csharp
using System.Text;
using BAR.Modules.Registration.Application.Articles.ImportExport;
using ClosedXML.Excel;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleImportFileParserTests
{
    [Fact]
    public void Parse_Csv_OneDataRow_MapsAllSixColumns()
    {
        var csv = "Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n101;Jacke;Jacken;Nike;M;12,50\r\n";
        var bytes = new UTF8Encoding(true).GetBytes(csv);

        var rows = ArticleImportFileParser.Parse(bytes, "import.csv");

        var row = rows.Single();
        Assert.Equal(2, row.LineNumber);
        Assert.Equal("101", row.NumberRaw);
        Assert.Equal("Jacke", row.Name);
        Assert.Equal("Jacken", row.Category);
        Assert.Equal("Nike", row.Brand);
        Assert.Equal("M", row.Size);
        Assert.Equal("12,50", row.PriceRaw);
    }

    [Fact]
    public void Parse_Csv_EmptyDataRow_KeepsBlankCellsAsEmptyStrings()
    {
        var csv = "Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n102;;;;;\r\n";
        var bytes = Encoding.UTF8.GetBytes(csv);

        var row = ArticleImportFileParser.Parse(bytes, "import.csv").Single();

        Assert.Equal("102", row.NumberRaw);
        Assert.Equal("", row.Name);
    }

    [Fact]
    public void Parse_Csv_TooFewColumns_ThrowsFormatException()
    {
        var bytes = Encoding.UTF8.GetBytes("Nummer;Bezeichnung\r\n101;Jacke\r\n");

        Assert.Throws<FormatException>(() => ArticleImportFileParser.Parse(bytes, "import.csv"));
    }

    [Fact]
    public void Parse_Xlsx_OneDataRow_MapsAllSixColumns()
    {
        using var stream = new MemoryStream();
        using (var workbook = new XLWorkbook())
        {
            var ws = workbook.Worksheets.Add("Sheet1");
            ws.Cell(1, 1).Value = "Nummer"; ws.Cell(1, 2).Value = "Bezeichnung"; ws.Cell(1, 3).Value = "Kategorie";
            ws.Cell(1, 4).Value = "Marke"; ws.Cell(1, 5).Value = "Größe"; ws.Cell(1, 6).Value = "Preis";
            ws.Cell(2, 1).Value = 101; ws.Cell(2, 2).Value = "Jacke"; ws.Cell(2, 3).Value = "Jacken";
            ws.Cell(2, 4).Value = "Nike"; ws.Cell(2, 5).Value = "M"; ws.Cell(2, 6).Value = "12,50";
            workbook.SaveAs(stream);
        }

        var rows = ArticleImportFileParser.Parse(stream.ToArray(), "import.xlsx");

        var row = rows.Single();
        Assert.Equal("101", row.NumberRaw);
        Assert.Equal("Jacke", row.Name);
    }

    [Fact]
    public void Parse_UnknownExtension_ThrowsFormatException()
    {
        Assert.Throws<FormatException>(() => ArticleImportFileParser.Parse([1, 2, 3], "import.txt"));
    }

    [Fact]
    public void Parse_GarbageBytesAsXlsx_ThrowsFormatException()
    {
        Assert.Throws<FormatException>(() => ArticleImportFileParser.Parse([1, 2, 3], "import.xlsx"));
    }
}
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleImportFileParserTests`
Expected: FAIL — `ArticleImportFileParser`/`ImportRawRow` do not exist.

- [ ] **Step 4: Implement `ImportRawRow` and `ArticleImportFileParser`**

`ImportRawRow.cs`:
```csharp
namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed record ImportRawRow(
    int LineNumber, string? NumberRaw, string? Name, string? Category, string? Brand, string? Size, string? PriceRaw);
```

`ArticleImportFileParser.cs`:
```csharp
using System.Text;
using ClosedXML.Excel;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

/// <summary>
/// Both CSV and .xlsx map onto the same ImportRawRow shape so
/// ArticleImportValidator (Task 7) never has to know which one was
/// uploaded. Values stay raw strings here - number/price parsing and
/// blank-vs-missing distinction is the validator's job, not the parser's.
/// </summary>
public static class ArticleImportFileParser
{
    public static IReadOnlyList<ImportRawRow> Parse(byte[] fileContent, string fileName)
    {
        if (fileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return ParseXlsx(fileContent);
        }
        if (fileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        {
            return ParseCsv(fileContent);
        }
        throw new FormatException("Nur .csv oder .xlsx werden unterstützt.");
    }

    private static IReadOnlyList<ImportRawRow> ParseCsv(byte[] fileContent)
    {
        var text = Encoding.UTF8.GetString(StripBom(fileContent));
        var lines = text.Split(["\r\n", "\n"], StringSplitOptions.None).Where(l => l.Length > 0).ToList();
        var rows = new List<ImportRawRow>();

        for (var i = 1; i < lines.Count; i++)
        {
            var cells = lines[i].Split(';');
            if (cells.Length < 6)
            {
                throw new FormatException($"Zeile {i + 1}: erwartet 6 Spalten, gefunden {cells.Length}.");
            }
            rows.Add(new ImportRawRow(i + 1, cells[0], cells[1], cells[2], cells[3], cells[4], cells[5]));
        }
        return rows;
    }

    private static byte[] StripBom(byte[] content) =>
        content.Length >= 3 && content[0] == 0xEF && content[1] == 0xBB && content[2] == 0xBF
            ? content[3..]
            : content;

    private static IReadOnlyList<ImportRawRow> ParseXlsx(byte[] fileContent)
    {
        try
        {
            using var stream = new MemoryStream(fileContent);
            using var workbook = new XLWorkbook(stream);
            var worksheet = workbook.Worksheet(1);

            return worksheet.RowsUsed().Skip(1)
                .Select(row => new ImportRawRow(
                    row.RowNumber(),
                    row.Cell(1).GetString(), row.Cell(2).GetString(), row.Cell(3).GetString(),
                    row.Cell(4).GetString(), row.Cell(5).GetString(), row.Cell(6).GetString()))
                .ToList();
        }
        catch (Exception ex) when (ex is not FormatException)
        {
            throw new FormatException("Datei konnte nicht als XLSX gelesen werden.", ex);
        }
    }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleImportFileParserTests`
Expected: PASS (6 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/Directory.Packages.props src/advance-registration/backend/BAR.Modules.Registration/BAR.Modules.Registration.csproj src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportRawRow.cs src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleImportFileParser.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleImportFileParserTests.cs
git commit -m "feat(bar-backend): add ClosedXML dependency and ArticleImportFileParser"
```

---

### Task 7: `ArticleImportValidator` (pure, no DB)

**Files:**
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportAction.cs`
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportRowError.cs`
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleImportValidator.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleImportValidatorTests.cs`

**Interfaces:**
- Consumes: `ImportRawRow` (Task 6), `NumberBlockSequence.AllNumbersOrdered` (Task 2), `Article`/`NumberBlock` (existing Domain).
- Produces: `ImportActionKind { Create, Update, Delete, NoOp }`; `ImportAction(ImportActionKind Kind, int Number, string? Name, string? Category, string? Brand, string? Size, decimal? Price)`; `ImportRowError(int Row, string ErrorCode, string Detail)`; `ArticleImportValidator.Validate(IReadOnlyList<ImportRawRow>, IReadOnlyList<NumberBlock>, IReadOnlyList<Article>) → (IReadOnlyList<ImportAction> Actions, IReadOnlyList<ImportRowError> Errors)` — used by Task 8.

- [ ] **Step 1: Write the failing tests**

```csharp
using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleImportValidatorTests
{
    private static readonly DateTime Now = new(2026, 9, 17, 10, 0, 0, DateTimeKind.Utc);
    private static readonly NumberBlock Block = NumberBlock.Assign("s1", 101, 5, Now);

    private static ImportRawRow Row(int line, string number, string name = "", string category = "", string brand = "", string size = "", string price = "") =>
        new(line, number, name, category, brand, size, price);

    [Fact]
    public void Validate_NumberNotAnInteger_ReturnsInvalidNumberError()
    {
        var (actions, errors) = ArticleImportValidator.Validate([Row(2, "abc")], [Block], []);

        Assert.Empty(actions);
        Assert.Equal("import.invalid_number", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_NumberOutsideOwnBlocks_ReturnsNotInOwnRangeError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "999", "A", "B", "C", price: "1,00")], [Block], []);

        Assert.Empty(actions);
        Assert.Equal("import.number_not_in_own_range", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_DuplicateNumberInFile_ReturnsDuplicateErrorForSecondOccurrence()
    {
        var rows = new[] { Row(2, "101", "A", "B", "C", price: "1,00"), Row(3, "101", "A", "B", "C", price: "1,00") };

        var (actions, errors) = ArticleImportValidator.Validate(rows, [Block], []);

        Assert.Equal("import.duplicate_number", errors.Single().ErrorCode);
        Assert.Equal(3, errors.Single().Row);
    }

    [Fact]
    public void Validate_FreeNumberEmptyRow_ReturnsNoOpAction()
    {
        var (actions, errors) = ArticleImportValidator.Validate([Row(2, "101")], [Block], []);

        Assert.Empty(errors);
        Assert.Equal(ImportActionKind.NoOp, actions.Single().Kind);
    }

    [Fact]
    public void Validate_FreeNumberFilledRow_ReturnsCreateAction()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Jacke", "Jacken", "Nike", "M", "12,50")], [Block], []);

        Assert.Empty(errors);
        var action = actions.Single();
        Assert.Equal(ImportActionKind.Create, action.Kind);
        Assert.Equal(101, action.Number);
        Assert.Equal("Jacke", action.Name);
        Assert.Equal(12.50m, action.Price);
    }

    [Fact]
    public void Validate_OccupiedNumberFilledRow_ReturnsUpdateAction()
    {
        var existing = Article.Create("s1", 101, "Alt", "B", "C", 1m, null, null, null, Now);

        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Neu", "B2", "C2", price: "2,00")], [Block], [existing]);

        Assert.Empty(errors);
        Assert.Equal(ImportActionKind.Update, actions.Single().Kind);
    }

    [Fact]
    public void Validate_OccupiedNumberEmptyRow_ReturnsDeleteAction()
    {
        var existing = Article.Create("s1", 101, "Alt", "B", "C", 1m, null, null, null, Now);

        var (actions, errors) = ArticleImportValidator.Validate([Row(2, "101")], [Block], [existing]);

        Assert.Empty(errors);
        Assert.Equal(ImportActionKind.Delete, actions.Single().Kind);
    }

    [Fact]
    public void Validate_MissingRequiredField_ReturnsMissingFieldError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", name: "Jacke", price: "1,00")], [Block], []);

        Assert.Equal("import.missing_field", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_InvalidPrice_ReturnsInvalidPriceError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Jacke", "Jacken", "Nike", price: "kostenlos")], [Block], []);

        Assert.Equal("import.invalid_price", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_ZeroPrice_ReturnsInvalidPriceError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Jacke", "Jacken", "Nike", price: "0,00")], [Block], []);

        Assert.Equal("import.invalid_price", errors.Single().ErrorCode);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleImportValidatorTests`
Expected: FAIL — `ArticleImportValidator`/`ImportAction`/`ImportRowError` do not exist.

- [ ] **Step 3: Implement the three files**

`ImportRowError.cs`:
```csharp
namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed record ImportRowError(int Row, string ErrorCode, string Detail);
```

`ImportAction.cs`:
```csharp
namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public enum ImportActionKind { Create, Update, Delete, NoOp }

public sealed record ImportAction(
    ImportActionKind Kind, int Number, string? Name, string? Category, string? Brand, string? Size, decimal? Price);
```

`ArticleImportValidator.cs`:
```csharp
using System.Globalization;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

/// <summary>
/// Pure, DB-free row-by-row decision: which of the 4 actions a row maps to,
/// or which single error stops the whole import (all-or-nothing, spec.md
/// "Import-Zeilenlogik"). Never touches a repository - ImportArticlesCommandHandler
/// (Task 8) supplies the seller's own blocks and already-persisted articles.
/// </summary>
public static class ArticleImportValidator
{
    public static (IReadOnlyList<ImportAction> Actions, IReadOnlyList<ImportRowError> Errors) Validate(
        IReadOnlyList<ImportRawRow> rows, IReadOnlyList<NumberBlock> sellerBlocks, IReadOnlyList<Article> existingArticles)
    {
        var errors = new List<ImportRowError>();
        var actions = new List<ImportAction>();
        var ownNumbers = NumberBlockSequence.AllNumbersOrdered(sellerBlocks).ToHashSet();
        var existingByNumber = existingArticles.ToDictionary(a => a.Number);
        var seenAtLine = new Dictionary<int, int>();

        foreach (var row in rows)
        {
            if (!int.TryParse(row.NumberRaw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var number))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.invalid_number", $"Zeile {row.LineNumber}: Nummer fehlt oder ist keine Ganzzahl."));
                continue;
            }

            if (!ownNumbers.Contains(number))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.number_not_in_own_range", $"Zeile {row.LineNumber}: Nummer {number} gehört nicht zum eigenen Nummernkreis."));
                continue;
            }

            if (seenAtLine.TryGetValue(number, out var firstLine))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.duplicate_number", $"Zeile {row.LineNumber}: Nummer {number} bereits in Zeile {firstLine} vergeben."));
                continue;
            }
            seenAtLine[number] = row.LineNumber;

            var isEmpty = string.IsNullOrWhiteSpace(row.Name) && string.IsNullOrWhiteSpace(row.Category) &&
                          string.IsNullOrWhiteSpace(row.Brand) && string.IsNullOrWhiteSpace(row.Size) && string.IsNullOrWhiteSpace(row.PriceRaw);
            var hasExisting = existingByNumber.ContainsKey(number);

            if (isEmpty)
            {
                actions.Add(new ImportAction(
                    hasExisting ? ImportActionKind.Delete : ImportActionKind.NoOp,
                    number, null, null, null, null, null));
                continue;
            }

            if (string.IsNullOrWhiteSpace(row.Name) || string.IsNullOrWhiteSpace(row.Category) || string.IsNullOrWhiteSpace(row.Brand))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.missing_field", $"Zeile {row.LineNumber}: Bezeichnung, Kategorie und Marke sind Pflichtfelder."));
                continue;
            }

            if (!decimal.TryParse(row.PriceRaw?.Replace(',', '.'), NumberStyles.Number, CultureInfo.InvariantCulture, out var price) || price <= 0)
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.invalid_price", $"Zeile {row.LineNumber}: Preis fehlt oder ist ungültig."));
                continue;
            }

            actions.Add(new ImportAction(
                hasExisting ? ImportActionKind.Update : ImportActionKind.Create,
                number, row.Name.Trim(), row.Category!.Trim(), row.Brand!.Trim(),
                string.IsNullOrWhiteSpace(row.Size) ? null : row.Size.Trim(), price));
        }

        return (actions, errors);
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ArticleImportValidatorTests`
Expected: PASS (10 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportAction.cs src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportRowError.cs src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ArticleImportValidator.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ArticleImportValidatorTests.cs
git commit -m "feat(bar-backend): add ArticleImportValidator"
```

---

### Task 8: `ImportArticlesCommandHandler` + facade wiring

**Files:**
- Create: `src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportArticlesCommandHandler.cs`
- Create: `src/advance-registration/backend/BAR.Modules.Registration.Contracts/Articles/ArticleImportExportDto.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration.Contracts/IRegistrationModuleApi.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration/Application/RegistrationModuleApi.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.Registration/Infrastructure/DependencyInjection.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ImportArticlesCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ArticleImportFileParser.Parse` (Task 6), `ArticleImportValidator.Validate` (Task 7), `IArticleRepository.GetAllForSellerAsync`/`ApplyImportAsync` (Task 1), `INumberBlockRepository.GetForSellerAsync` (existing), `IMasterDataModuleApi.GetAllBrandNamesAsync`/`GetAllCategoryNamesAsync`/`CreateBrandAsync`/`CreateCategoryAsync` (existing, `BAR.Modules.MasterData.Contracts`).
- Produces: `ImportArticlesCommand(string SellerId, bool IsAdmin, byte[] FileContent, string FileName)`; `ImportArticlesResultDto(bool Success, int Created, int Updated, int Deleted, IReadOnlyList<ImportRowError> Errors)`; `IRegistrationModuleApi.ImportArticlesAsync(ImportArticlesCommand, CancellationToken) → Task<ImportArticlesResultDto>` — used by Task 9 (endpoint).

- [ ] **Step 1: Write the failing handler tests**

```csharp
using System.Text;
using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts;
using BAR.SharedKernel;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ImportArticlesCommandHandlerTests
{
    private static readonly DateTime Now = new(2026, 9, 17, 10, 0, 0, DateTimeKind.Utc);
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();
    private readonly Mock<IClock> _clock = new();

    private ImportArticlesCommandHandler CreateHandler() =>
        new(_articles.Object, _blocks.Object, _masterData.Object, _clock.Object);

    private static byte[] Csv(params string[] dataLines) =>
        Encoding.UTF8.GetBytes("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n" + string.Join("\r\n", dataLines) + "\r\n");

    private void SetUpCommonMocks(string sellerId, IReadOnlyList<NumberBlock> blocks, IReadOnlyList<Article> existing)
    {
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(blocks);
        _articles.Setup(a => a.GetAllForSellerAsync(sellerId, It.IsAny<CancellationToken>())).ReturnsAsync(existing);
        _masterData.Setup(m => m.GetAllBrandNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Nike"]);
        _masterData.Setup(m => m.GetAllCategoryNamesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(["Jacken"]);
        _clock.Setup(c => c.UtcNow).Returns(Now);
    }

    [Fact]
    public async Task HandleAsync_RowError_ReturnsUnsuccessfulResultAndAppliesNothing()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 3, Now);
        SetUpCommonMocks(sellerId, [block], []);
        var command = new ImportArticlesCommand(sellerId, false, Csv("999;A;B;C;;1,00"), "import.csv");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.Success);
        Assert.Equal("import.number_not_in_own_range", result.Errors.Single().ErrorCode);
        _articles.Verify(a => a.ApplyImportAsync(
            It.IsAny<IReadOnlyList<Article>>(), It.IsAny<IReadOnlyList<Article>>(), It.IsAny<IReadOnlyList<Article>>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_AllRowsValid_CreatesUpdatesDeletesAndReturnsCounts()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 3, Now);
        var existingAt102 = Article.Create(sellerId, 102, "Alt", "Nike", "Jacken", 1m, null, null, null, Now);
        var existingAt103 = Article.Create(sellerId, 103, "ZuLoeschen", "Nike", "Jacken", 1m, null, null, null, Now);
        SetUpCommonMocks(sellerId, [block], [existingAt102, existingAt103]);
        var command = new ImportArticlesCommand(sellerId, false,
            Csv("101;Neu;Jacken;Nike;;12,50", "102;Update;Jacken;Nike;;9,00", "103;;;;;"), "import.csv");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        Assert.True(result.Success);
        Assert.Equal(1, result.Created);
        Assert.Equal(1, result.Updated);
        Assert.Equal(1, result.Deleted);
        _articles.Verify(a => a.ApplyImportAsync(
            It.Is<IReadOnlyList<Article>>(l => l.Count == 1 && l[0].Number == 101),
            It.Is<IReadOnlyList<Article>>(l => l.Count == 1 && l[0].Number == 102 && l[0].Name == "Update"),
            It.Is<IReadOnlyList<Article>>(l => l.Count == 1 && l[0].Number == 103),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownBrandAndCategory_AreAutoCreatedBeforeWriting()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 1, Now);
        SetUpCommonMocks(sellerId, [block], []);
        var command = new ImportArticlesCommand(sellerId, false, Csv("101;Neu;NeueKategorie;NeueMarke;;5,00"), "import.csv");
        var handler = CreateHandler();

        await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        _masterData.Verify(m => m.CreateBrandAsync(
            It.Is<CreateBrandCommand>(c => c.Name == "NeueMarke" && c.IsAdmin == false), It.IsAny<CancellationToken>()), Times.Once);
        _masterData.Verify(m => m.CreateCategoryAsync(
            It.Is<CreateCategoryCommand>(c => c.Name == "NeueKategorie" && c.IsAdmin == false), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_KnownBrand_IsNotRecreated()
    {
        var sellerId = "s1234567";
        var block = NumberBlock.Assign(sellerId, 101, 1, Now);
        SetUpCommonMocks(sellerId, [block], []);
        var command = new ImportArticlesCommand(sellerId, false, Csv("101;Neu;Jacken;Nike;;5,00"), "import.csv");
        var handler = CreateHandler();

        await handler.HandleAsync(command, TestContext.Current.CancellationToken);

        _masterData.Verify(m => m.CreateBrandAsync(It.IsAny<CreateBrandCommand>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_UnreadableFile_ThrowsArgumentException()
    {
        SetUpCommonMocks("s1234567", [], []);
        var command = new ImportArticlesCommand("s1234567", false, [1, 2, 3], "import.txt");
        var handler = CreateHandler();

        await Assert.ThrowsAsync<ArgumentException>(() => handler.HandleAsync(command, TestContext.Current.CancellationToken));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ImportArticlesCommandHandlerTests`
Expected: FAIL — `ImportArticlesCommandHandler`/`ImportArticlesCommand`/`ImportArticlesResultDto` do not exist.

- [ ] **Step 3: Add the Contracts DTOs**

`ArticleImportExportDto.cs`:
```csharp
namespace BAR.Modules.Registration.Contracts.Articles;

public sealed record ImportArticlesCommand(string SellerId, bool IsAdmin, byte[] FileContent, string FileName);

public sealed record ImportRowErrorDto(int Row, string ErrorCode, string Detail);

public sealed record ImportArticlesResultDto(bool Success, int Created, int Updated, int Deleted, IReadOnlyList<ImportRowErrorDto> Errors);
```

- [ ] **Step 4: Implement `ImportArticlesCommandHandler`**

```csharp
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.SharedKernel;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed class ImportArticlesCommandHandler(
    IArticleRepository articles, INumberBlockRepository blocks, IMasterDataModuleApi masterData, IClock clock)
{
    public async Task<ImportArticlesResultDto> HandleAsync(ImportArticlesCommand command, CancellationToken cancellationToken)
    {
        IReadOnlyList<ImportRawRow> rawRows;
        try
        {
            rawRows = ArticleImportFileParser.Parse(command.FileContent, command.FileName);
        }
        catch (FormatException ex)
        {
            throw new ArgumentException(ex.Message, ex);
        }

        var sellerBlocks = await blocks.GetForSellerAsync(command.SellerId, cancellationToken);
        var existingArticles = await articles.GetAllForSellerAsync(command.SellerId, cancellationToken);
        var (actions, errors) = ArticleImportValidator.Validate(rawRows, sellerBlocks, existingArticles);

        if (errors.Count > 0)
        {
            var dtoErrors = errors.Select(e => new ImportRowErrorDto(e.Row, e.ErrorCode, e.Detail)).ToList();
            return new ImportArticlesResultDto(false, 0, 0, 0, dtoErrors);
        }

        await EnsureBrandsAndCategoriesExistAsync(actions, command.IsAdmin, cancellationToken);

        var now = clock.UtcNow;
        var existingByNumber = existingArticles.ToDictionary(a => a.Number);
        var toCreate = new List<Article>();
        var toUpdate = new List<Article>();
        var toDelete = new List<Article>();

        foreach (var action in actions)
        {
            switch (action.Kind)
            {
                case ImportActionKind.Create:
                    toCreate.Add(Article.Create(
                        command.SellerId, action.Number, action.Name!, action.Brand!, action.Category!,
                        action.Price!.Value, action.Size, null, null, now));
                    break;
                case ImportActionKind.Update:
                    var existing = existingByNumber[action.Number];
                    existing.Update(action.Name!, action.Brand!, action.Category!, action.Price!.Value, action.Size, null, null, now);
                    toUpdate.Add(existing);
                    break;
                case ImportActionKind.Delete:
                    toDelete.Add(existingByNumber[action.Number]);
                    break;
                case ImportActionKind.NoOp:
                    break;
            }
        }

        await articles.ApplyImportAsync(toCreate, toUpdate, toDelete, cancellationToken);

        return new ImportArticlesResultDto(true, toCreate.Count, toUpdate.Count, toDelete.Count, []);
    }

    private async Task EnsureBrandsAndCategoriesExistAsync(
        IReadOnlyList<ImportAction> actions, bool isAdmin, CancellationToken cancellationToken)
    {
        var brandNames = actions.Where(a => a.Brand is not null).Select(a => a.Brand!).Distinct(StringComparer.OrdinalIgnoreCase).ToList();
        var categoryNames = actions.Where(a => a.Category is not null).Select(a => a.Category!).Distinct(StringComparer.OrdinalIgnoreCase).ToList();

        var existingBrands = await masterData.GetAllBrandNamesAsync(cancellationToken);
        var existingCategories = await masterData.GetAllCategoryNamesAsync(cancellationToken);

        foreach (var name in brandNames.Where(n => !existingBrands.Contains(n, StringComparer.OrdinalIgnoreCase)))
        {
            await masterData.CreateBrandAsync(new CreateBrandCommand(name, isAdmin), cancellationToken);
        }

        foreach (var name in categoryNames.Where(n => !existingCategories.Contains(n, StringComparer.OrdinalIgnoreCase)))
        {
            await masterData.CreateCategoryAsync(new CreateCategoryCommand(name, isAdmin), cancellationToken);
        }
    }
}
```

- [ ] **Step 5: Add the facade method**

In `IRegistrationModuleApi.cs`, add after `GetArticleTemplateCsvAsync`:

```csharp
    Task<ImportArticlesResultDto> ImportArticlesAsync(ImportArticlesCommand command, CancellationToken cancellationToken);
```

In `RegistrationModuleApi.cs`, add after `GetArticleTemplateCsvAsync`:

```csharp
    public Task<ImportArticlesResultDto> ImportArticlesAsync(ImportArticlesCommand command, CancellationToken cancellationToken) =>
        Resolve<ImportArticlesCommandHandler>().HandleAsync(command, cancellationToken);
```

- [ ] **Step 6: Register the handler in DI**

In `DependencyInjection.cs`, add after `services.AddScoped<GetArticleTemplateCsvQueryHandler>();`:

```csharp
        services.AddScoped<ImportArticlesCommandHandler>();
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter ImportArticlesCommandHandlerTests`
Expected: PASS (5 tests).

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.Registration/Application/Articles/ImportExport/ImportArticlesCommandHandler.cs src/advance-registration/backend/BAR.Modules.Registration.Contracts/Articles/ArticleImportExportDto.cs src/advance-registration/backend/BAR.Modules.Registration.Contracts/IRegistrationModuleApi.cs src/advance-registration/backend/BAR.Modules.Registration/Application/RegistrationModuleApi.cs src/advance-registration/backend/BAR.Modules.Registration/Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Registration/Articles/ImportExport/ImportArticlesCommandHandlerTests.cs
git commit -m "feat(bar-backend): add ImportArticlesCommandHandler and wire the facade"
```

---

### Task 9: Import endpoint

**Files:**
- Modify: `src/advance-registration/backend/BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Articles/ArticleImportExportEndpointsTests.cs` (add to existing file from Task 5)

**Interfaces:**
- Consumes: `IRegistrationModuleApi.ImportArticlesAsync` (Task 8).
- Produces: `POST /api/articles/mine/import` — `200 { created, updated, deleted }` or `422 { errors: [{row, errorCode, detail}] }`.

- [ ] **Step 1: Write the failing integration tests**

Append to `ArticleImportExportEndpointsTests.cs`:

```csharp
    [Fact]
    public async Task Import_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        using var content = BuildMultipart("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n");

        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Import_RoundTripUnchangedExport_CreatesNothing()
    {
        var client = await RegisterAndAuthenticateAsync();
        await client.PostAsJsonAsync("/api/articles", new { name = "Jacke", brand = "Nike", category = "Jacken", price = 12.5m }, TestContext.Current.CancellationToken);
        var exportCsv = await (await client.GetAsync("/api/articles/mine/export", TestContext.Current.CancellationToken)).Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        using var content = BuildMultipart(exportCsv);
        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(0, body.GetProperty("created").GetInt32());
        Assert.Equal(1, body.GetProperty("updated").GetInt32());
        Assert.Equal(0, body.GetProperty("deleted").GetInt32());
    }

    [Fact]
    public async Task Import_NumberOutsideOwnRange_Returns422WithRowError_AndCreatesNothing()
    {
        var client = await RegisterAndAuthenticateAsync();
        using var content = BuildMultipart("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n999999;A;B;C;;1,00\r\n");

        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        Assert.Equal((HttpStatusCode)422, response.StatusCode);
        Assert.Equal("import.number_not_in_own_range", body.GetProperty("errors")[0].GetProperty("errorCode").GetString());

        var mine = await client.GetAsync("/api/articles/mine", TestContext.Current.CancellationToken);
        var mineBody = await mine.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        Assert.Equal(0, mineBody.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task Import_UnknownBrand_IsAutoCreated()
    {
        var client = await RegisterAndAuthenticateAsync();
        var nextNumber = (await (await client.GetAsync("/api/articles/next-number", TestContext.Current.CancellationToken)).Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken)).GetProperty("number").GetInt32();
        var brandName = $"Marke-{Guid.NewGuid():N}"[..12];
        using var content = BuildMultipart($"Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n{nextNumber};A;B;{brandName};;1,00\r\n");

        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var brandsResponse = await client.GetAsync("/api/brands", TestContext.Current.CancellationToken);
        var brandsBody = await brandsResponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains(brandName, brandsBody);
    }

    private static MultipartFormDataContent BuildMultipart(string csv)
    {
        var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes(csv));
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
        content.Add(fileContent, "file", "import.csv");
        return content;
    }
```

Add `using System.Text;`, `using System.Text.Json;`, `using System.Net.Http.Headers;` to the file's
`using` block if not already present (`System.Net.Http.Headers` and `System.Text.Json` are
already there from Task 5; add `System.Text`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "Import_Unauthenticated_Returns401|Import_RoundTripUnchangedExport_CreatesNothing|Import_NumberOutsideOwnRange_Returns422WithRowError_AndCreatesNothing|Import_UnknownBrand_IsAutoCreated"`
Expected: FAIL — 404, route doesn't exist yet.

- [ ] **Step 3: Add the import endpoint**

In `ArticleImportExportEndpoints.cs`, add inside `MapArticleImportExportEndpoints`, before
`return app;`:

```csharp
        app.MapPost("/api/articles/mine/import", async (
            ClaimsPrincipal user, IFormFile file, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var isAdmin = user.IsInRole("admin");
            using var stream = new MemoryStream();
            await file.CopyToAsync(stream, ct);

            var command = new ImportArticlesCommand(sellerId, isAdmin, stream.ToArray(), file.FileName);
            var result = await registration.ImportArticlesAsync(command, ct);

            return result.Success
                ? Results.Ok(new { created = result.Created, updated = result.Updated, deleted = result.Deleted })
                : Results.Json(new { errors = result.Errors }, statusCode: StatusCodes.Status422UnprocessableEntity);
        }).RequireAuthorization();
```

Add `using BAR.Modules.Registration.Contracts.Articles;` to the file's `using` block (for
`ImportArticlesCommand`).

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "Import_Unauthenticated_Returns401|Import_RoundTripUnchangedExport_CreatesNothing|Import_NumberOutsideOwnRange_Returns422WithRowError_AndCreatesNothing|Import_UnknownBrand_IsAutoCreated"`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full backend test suite once to catch regressions**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests`
Expected: PASS (all tests, no regressions from the two module-boundary changes).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Articles/ArticleImportExportEndpointsTests.cs
git commit -m "feat(bar-backend): add POST import endpoint for Meine Artikel"
```

---

### Task 10: `FilterPanel` — SplitButton support

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.spec.ts`

**Interfaces:**
- Produces: `FilterPanel.splitButtonItems: InputSignal<MenuItem[] | undefined>` — used by Task 13 (`MyArticlesPage`). When set, the `#end`-slot renders `p-splitButton` (main click still emits the existing `create` output); when unset, the existing plain button stays unchanged (regression guard for every other `FilterPanel` consumer, e.g. Sellers).

- [ ] **Step 1: Write the failing tests**

Add to `filter-panel.spec.ts`, inside the `describe('FilterPanel', ...)` block:

```typescript
  it('renders a plain button (not a split button) when splitButtonItems is not set', () => {
    const { fixture } = create();

    expect(fixture.debugElement.query(By.css('[data-testid="add-button"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('p-splitbutton'))).toBeNull();
  });

  it('renders a p-splitButton with the given items when splitButtonItems is set', () => {
    const { fixture } = create();
    const items = [{ label: 'Import' }, { separator: true }, { label: 'Export' }];
    fixture.componentRef.setInput('splitButtonItems', items);
    fixture.detectChanges();

    const splitButton = fixture.debugElement.query(By.css('[data-testid="add-split-button"]'));
    expect(splitButton).not.toBeNull();
    expect(splitButton.componentInstance.model()).toEqual(items);
    expect(fixture.debugElement.query(By.css('[data-testid="add-button"]'))).toBeNull();
  });

  it('clicking the split button main action still emits create', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('splitButtonItems', [{ label: 'Import' }]);
    fixture.componentRef.setInput('canAdd', true);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.create.subscribe(() => emitted.push(true));

    fixture.debugElement.query(By.css('[data-testid="add-split-button"] button')).nativeElement.click();

    expect(emitted.length).toBe(1);
  });
```

Note: `create()` in this spec file does not set `canAdd`, so the first two new tests need
`canAdd` too — add it to the `create()` helper call by extending the existing `create()`
signature is out of scope for this task (would touch every existing call site); instead set
it directly on the two tests that need the button to render:

```typescript
  it('renders a plain button (not a split button) when splitButtonItems is not set', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('canAdd', true);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="add-button"]'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('p-splitbutton'))).toBeNull();
  });

  it('renders a p-splitButton with the given items when splitButtonItems is set', () => {
    const { fixture } = create();
    fixture.componentRef.setInput('canAdd', true);
    const items = [{ label: 'Import' }, { separator: true }, { label: 'Export' }];
    fixture.componentRef.setInput('splitButtonItems', items);
    fixture.detectChanges();

    const splitButton = fixture.debugElement.query(By.css('[data-testid="add-split-button"]'));
    expect(splitButton).not.toBeNull();
    expect(splitButton.componentInstance.model()).toEqual(items);
    expect(fixture.debugElement.query(By.css('[data-testid="add-button"]'))).toBeNull();
  });
```

(Use these two corrected versions, plus the third "clicking the split button" test above
which already sets `canAdd` itself.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel.spec.ts`
Expected: FAIL — `splitButtonItems` input does not exist, `[data-testid="add-split-button"]` never renders.

- [ ] **Step 3: Implement `splitButtonItems` in `FilterPanel`**

Add imports at the top of `filter-panel.ts`:

```typescript
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuItem } from 'primeng/api';
```

Add `SplitButtonModule` to the `@Component` `imports` array.

Add the input near the other inputs (after `createLabel`):

```typescript
  readonly splitButtonItems = input<MenuItem[]>();
```

Replace the `#end` template block:

```html
      <ng-template #end>
        @if (canAdd()) {
          @if (splitButtonItems(); as items) {
            <p-splitButton data-testid="add-split-button" [label]="createLabel()" [model]="items" (onClick)="create.emit()" />
          } @else {
            <button pButton type="button" data-testid="add-button" (click)="create.emit()">{{ createLabel() }}</button>
          }
        }
      </ng-template>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel.spec.ts`
Expected: PASS (all tests, including the 3 new ones).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.spec.ts
git commit -m "feat(bar-app): add optional SplitButton mode to FilterPanel"
```

---

### Task 11: `ArticlesImportExportApiService`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/articles-import-export-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/articles-import-export-api.service.spec.ts`

**Interfaces:**
- Produces: `ArticlesImportExportApiService.export(): Observable<{blob: Blob; fileName: string}>`; `.template(): Observable<{blob: Blob; fileName: string}>`; `.import(file: File): Observable<ImportSummary>`; `ImportSummary { created: number; updated: number; deleted: number }`; `ImportRowError { row: number; errorCode: string; detail: string }` — used by Task 13 (`MyArticlesPage`) and Task 12 (`ImportResultDialog`, for the `ImportRowError` type).

- [ ] **Step 1: Write the failing tests**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ArticlesImportExportApiService } from './articles-import-export-api.service';

describe('ArticlesImportExportApiService', () => {
  let service: ArticlesImportExportApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ArticlesImportExportApiService]
    });
    service = TestBed.inject(ArticlesImportExportApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('export() requests the export endpoint and extracts the filename', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/mine/export');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['csv']), { headers: { 'Content-Disposition': 'attachment; filename="meine-artikel-2026-09-17.csv"' } });

    expect(result?.fileName).toBe('meine-artikel-2026-09-17.csv');
  });

  it('export() falls back to a default filename when the header is missing', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export().subscribe((r) => (result = r));

    httpMock.expectOne('/api/articles/mine/export').flush(new Blob(['csv']));

    expect(result?.fileName).toBe('meine-artikel.csv');
  });

  it('template() requests the template endpoint', () => {
    service.template().subscribe();

    const req = httpMock.expectOne('/api/articles/mine/template');
    expect(req.request.method).toBe('GET');
    req.flush(new Blob(['csv']));
  });

  it('import() posts the file as multipart form data', () => {
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });
    service.import(file).subscribe();

    const req = httpMock.expectOne('/api/articles/mine/import');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    req.flush({ created: 1, updated: 0, deleted: 0 });
  });

  it('import() surfaces a 422 row-error body to the caller', () => {
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });
    let error: HttpErrorResponse | undefined;
    service.import(file).subscribe({ error: (e) => (error = e) });

    httpMock.expectOne('/api/articles/mine/import').flush(
      { errors: [{ row: 2, errorCode: 'import.invalid_price', detail: 'Zeile 2: ...' }] },
      { status: 422, statusText: 'Unprocessable Entity' }
    );

    expect(error?.error.errors[0].errorCode).toBe('import.invalid_price');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- articles-import-export-api.service.spec.ts`
Expected: FAIL — `Cannot find module './articles-import-export-api.service'`.

- [ ] **Step 3: Implement the service**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ImportSummary {
  created: number;
  updated: number;
  deleted: number;
}

export interface ImportRowError {
  row: number;
  errorCode: string;
  detail: string;
}

export interface DownloadResult {
  blob: Blob;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class ArticlesImportExportApiService {
  private readonly http = inject(HttpClient);

  export(): Observable<DownloadResult> {
    return this.download('/api/articles/mine/export', 'meine-artikel.csv');
  }

  template(): Observable<DownloadResult> {
    return this.download('/api/articles/mine/template', 'meine-artikel-vorlage.csv');
  }

  import(file: File): Observable<ImportSummary> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post<ImportSummary>('/api/articles/mine/import', formData);
  }

  private download(url: string, fallbackFileName: string): Observable<DownloadResult> {
    return this.http.get(url, { responseType: 'blob', observe: 'response' }).pipe(
      map((response) => ({
        blob: response.body!,
        fileName: this.extractFileName(response.headers.get('Content-Disposition')) ?? fallbackFileName
      }))
    );
  }

  private extractFileName(header: string | null): string | null {
    const match = header?.match(/filename="?([^"]+)"?/);
    return match?.[1] ?? null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- articles-import-export-api.service.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/articles-import-export-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/articles-import-export-api.service.spec.ts
git commit -m "feat(bar-app): add ArticlesImportExportApiService"
```

---

### Task 12: `ImportResultDialog` component

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/components/import-result-dialog.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/components/import-result-dialog.spec.ts`
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/de.json`
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/en.json`

**Interfaces:**
- Consumes: `ImportSummary`, `ImportRowError` (Task 11).
- Produces: `ImportResultData = {kind: 'success'; summary: ImportSummary} | {kind: 'rowErrors'; errors: ImportRowError[]} | {kind: 'generalError'; message: string}`; `ImportResultDialog` with inputs `visible: InputSignal<boolean>`, `result: InputSignal<ImportResultData | null>`, output `visibleChange: OutputEmitterRef<boolean>` — used by Task 13 (`MyArticlesPage`).

- [ ] **Step 1: Add i18n keys**

In `de.json`, add inside the existing `"myArticles"` object (after `"noFreeNumber"`):

```json
    "importExport": {
      "import": "Import",
      "export": "Export",
      "template": "Vorlage"
    },
    "import": {
      "dialogHeader": "Import-Ergebnis",
      "success": "{{created}} angelegt, {{updated}} aktualisiert, {{deleted}} gelöscht.",
      "rowColumn": "Zeile",
      "errorColumn": "Fehler",
      "generalError": "Import fehlgeschlagen — Datei konnte nicht verarbeitet werden."
    }
```

In `en.json`, add inside the existing `"myArticles"` object (after `"noFreeNumber"`):

```json
    "importExport": {
      "import": "Import",
      "export": "Export",
      "template": "Template"
    },
    "import": {
      "dialogHeader": "Import result",
      "success": "{{created}} created, {{updated}} updated, {{deleted}} deleted.",
      "rowColumn": "Row",
      "errorColumn": "Error",
      "generalError": "Import failed — the file could not be processed."
    }
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ImportResultDialog } from './import-result-dialog';

const DE_TRANSLATIONS = {
  common: { ok: 'OK' },
  myArticles: {
    import: {
      dialogHeader: 'Import-Ergebnis',
      success: '{{created}} angelegt, {{updated}} aktualisiert, {{deleted}} gelöscht.',
      rowColumn: 'Zeile',
      errorColumn: 'Fehler',
      generalError: 'Import fehlgeschlagen — Datei konnte nicht verarbeitet werden.'
    }
  }
};

function create() {
  TestBed.configureTestingModule({ providers: [provideTranslateService()] });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', DE_TRANSLATIONS);
  translate.use('de');
  const fixture = TestBed.createComponent(ImportResultDialog);
  fixture.componentRef.setInput('visible', true);
  return fixture;
}

describe('ImportResultDialog', () => {
  it('shows the success summary with created/updated/deleted counts', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', { kind: 'success', summary: { created: 2, updated: 1, deleted: 0 } });
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-testid="import-success"]')).nativeElement.textContent;
    expect(text).toContain('2 angelegt, 1 aktualisiert, 0 gelöscht.');
  });

  it('shows a row/error table for row errors', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', {
      kind: 'rowErrors',
      errors: [{ row: 3, errorCode: 'import.invalid_price', detail: 'Zeile 3: Preis fehlt oder ist ungültig.' }]
    });
    fixture.detectChanges();

    const text = fixture.debugElement.query(By.css('[data-testid="import-error-table"]')).nativeElement.textContent;
    expect(text).toContain('3');
    expect(text).toContain('Zeile 3: Preis fehlt oder ist ungültig.');
  });

  it('shows a general error message', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', { kind: 'generalError', message: 'Kaputt' });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('[data-testid="import-general-error"]')).nativeElement.textContent).toContain('Kaputt');
  });

  it('emits visibleChange(false) when OK is clicked', () => {
    const fixture = create();
    fixture.componentRef.setInput('result', { kind: 'success', summary: { created: 0, updated: 0, deleted: 0 } });
    fixture.detectChanges();
    const emitted: boolean[] = [];
    fixture.componentInstance.visibleChange.subscribe((v: boolean) => emitted.push(v));

    fixture.debugElement.query(By.css('button')).nativeElement.click();

    expect(emitted).toEqual([false]);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- import-result-dialog.spec.ts`
Expected: FAIL — `Cannot find module './import-result-dialog'`.

- [ ] **Step 4: Implement `ImportResultDialog`**

```typescript
import { Component, input, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import type { ImportRowError, ImportSummary } from '../articles-import-export-api.service';

export type ImportResultData =
  | { kind: 'success'; summary: ImportSummary }
  | { kind: 'rowErrors'; errors: ImportRowError[] }
  | { kind: 'generalError'; message: string };

@Component({
  selector: 'app-import-result-dialog',
  imports: [DialogModule, TableModule, ButtonModule, TranslatePipe],
  template: `
    <p-dialog [visible]="visible()" (visibleChange)="visibleChange.emit($event)" [modal]="true" [header]="'myArticles.import.dialogHeader' | translate">
      @if (result(); as r) {
        @switch (r.kind) {
          @case ('success') {
            <p data-testid="import-success">{{ 'myArticles.import.success' | translate: { created: r.summary.created, updated: r.summary.updated, deleted: r.summary.deleted } }}</p>
          }
          @case ('rowErrors') {
            <p-table [value]="r.errors" data-testid="import-error-table">
              <ng-template #header>
                <tr>
                  <th>{{ 'myArticles.import.rowColumn' | translate }}</th>
                  <th>{{ 'myArticles.import.errorColumn' | translate }}</th>
                </tr>
              </ng-template>
              <ng-template #body let-error>
                <tr>
                  <td>{{ error.row }}</td>
                  <td>{{ error.detail }}</td>
                </tr>
              </ng-template>
            </p-table>
          }
          @case ('generalError') {
            <p data-testid="import-general-error">{{ r.message }}</p>
          }
        }
      }
      <button pButton type="button" [label]="'common.ok' | translate" (click)="visibleChange.emit(false)"></button>
    </p-dialog>
  `
})
export class ImportResultDialog {
  readonly visible = input.required<boolean>();
  readonly visibleChange = output<boolean>();
  readonly result = input<ImportResultData | null>(null);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- import-result-dialog.spec.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/components/import-result-dialog.ts src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/components/import-result-dialog.spec.ts src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): add ImportResultDialog"
```

---

### Task 13: Wire `MyArticlesPage`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/pages/MyArticlesPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/pages/MyArticlesPage.spec.ts`

**Interfaces:**
- Consumes: `FilterPanel.splitButtonItems` (Task 10), `ArticlesImportExportApiService` (Task 11), `ImportResultDialog`/`ImportResultData` (Task 12).
- Produces: none (leaf page); this is the final task, nothing else in this plan depends on it.

- [ ] **Step 1: Write the failing tests**

Add to `MyArticlesPage.spec.ts` (extend `DE_TRANSLATIONS`/`EN_TRANSLATIONS` with the
`myArticles.importExport`/`myArticles.import` keys from Task 12's i18n additions, and the
following test cases — inspect the file's existing `create()` helper for the exact
`TestBed.configureTestingModule` setup and reuse it):

```typescript
  it('clicking the Export menu item downloads the export CSV', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    const exportSpy = vi.spyOn(importExportApi, 'export').mockReturnValue(of({ blob: new Blob(['csv']), fileName: 'meine-artikel.csv' }));
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() });

    fixture.componentInstance.onExport();

    expect(exportSpy).toHaveBeenCalledOnce();
  });

  it('clicking the Vorlage menu item downloads the template CSV', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    const templateSpy = vi.spyOn(importExportApi, 'template').mockReturnValue(of({ blob: new Blob(['csv']), fileName: 'vorlage.csv' }));
    vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() });

    fixture.componentInstance.onTemplate();

    expect(templateSpy).toHaveBeenCalledOnce();
  });

  it('a successful import shows the success dialog and reloads the list', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    vi.spyOn(importExportApi, 'import').mockReturnValue(of({ created: 1, updated: 0, deleted: 0 }));
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });

    fixture.componentInstance.onFileSelected({ target: { files: [file], value: '' } } as unknown as Event);

    expect(fixture.componentInstance.importDialogVisible()).toBe(true);
    expect(fixture.componentInstance.importResult()).toEqual({ kind: 'success', summary: { created: 1, updated: 0, deleted: 0 } });
  });

  it('a 422 import response shows the row-error dialog', () => {
    const { fixture } = create();
    const importExportApi = TestBed.inject(ArticlesImportExportApiService);
    const errorBody = { errors: [{ row: 2, errorCode: 'import.invalid_price', detail: 'Zeile 2: ...' }] };
    vi.spyOn(importExportApi, 'import').mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 422, error: errorBody }))
    );
    const file = new File(['data'], 'import.csv', { type: 'text/csv' });

    fixture.componentInstance.onFileSelected({ target: { files: [file], value: '' } } as unknown as Event);

    expect(fixture.componentInstance.importResult()).toEqual({ kind: 'rowErrors', errors: errorBody.errors });
  });
```

Add `import { ArticlesImportExportApiService } from '../articles-import-export-api.service';`
and `import { HttpErrorResponse } from '@angular/common/http';` to the spec file's imports.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- MyArticlesPage.spec.ts`
Expected: FAIL — `onExport`/`onTemplate`/`onFileSelected`/`importDialogVisible`/`importResult`
do not exist yet.

- [ ] **Step 3: Wire the page**

In `MyArticlesPage.ts`, add imports:

```typescript
import { HttpErrorResponse } from '@angular/common/http';
import { MenuItem } from 'primeng/api';
import { ArticlesImportExportApiService, ImportRowError } from '../articles-import-export-api.service';
import { ImportResultDialog, ImportResultData } from '../components/import-result-dialog';
```

Add `ImportResultDialog` to the `@Component` `imports` array.

Update the `<app-filter-panel>` tag to pass the new items, and add the hidden file input and
the dialog to the template:

```html
    <app-filter-panel
      [brands]="brands()"
      [categories]="categories()"
      [canAdd]="true"
      [createLabel]="'myArticles.createButton' | translate"
      [splitButtonItems]="importExportMenuItems"
      (search)="onFilterSearch($event)"
      (create)="openCreateDialog()"
    />

    <input #fileInput type="file" accept=".csv,.xlsx" style="display: none" (change)="onFileSelected($event)" />
```

Add after the existing `<app-article-dialog>` closing tag, still inside the template:

```html
    <app-import-result-dialog
      [(visible)]="importDialogVisibleModel"
      [result]="importResult()"
      (visibleChange)="onSaved()"
    />
```

Add to the component class (after the `masterDataApi`/`messageService`/`translate`
injections):

```typescript
  private readonly importExportApi = inject(ArticlesImportExportApiService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly importDialogVisible = signal(false);
  readonly importResult = signal<ImportResultData | null>(null);

  get importDialogVisibleModel() { return this.importDialogVisible(); }
  set importDialogVisibleModel(v: boolean) { this.importDialogVisible.set(v); }

  get importExportMenuItems(): MenuItem[] {
    return [
      { label: this.translate.instant('myArticles.importExport.import'), icon: 'pi pi-upload', command: () => this.triggerImport() },
      { separator: true },
      { label: this.translate.instant('myArticles.importExport.export'), icon: 'pi pi-download', command: () => this.onExport() },
      { separator: true },
      { label: this.translate.instant('myArticles.importExport.template'), icon: 'pi pi-file', command: () => this.onTemplate() }
    ];
  }

  triggerImport(): void {
    this.fileInput()?.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.importExportApi.import(file).subscribe({
      next: (summary) => {
        this.importResult.set({ kind: 'success', summary });
        this.importDialogVisible.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.importResult.set(
          err.status === 422
            ? { kind: 'rowErrors', errors: (err.error?.errors ?? []) as ImportRowError[] }
            : { kind: 'generalError', message: this.translate.instant('myArticles.import.generalError') }
        );
        this.importDialogVisible.set(true);
      }
    });
  }

  onExport(): void {
    this.importExportApi.export().subscribe((result) => this.triggerDownload(result.blob, result.fileName));
  }

  onTemplate(): void {
    this.importExportApi.template().subscribe((result) => this.triggerDownload(result.blob, result.fileName));
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
```

Add `ElementRef, viewChild` to the existing `@angular/core` import line (already imports
`Component, OnInit, computed, inject, signal`).

`onSaved()` already exists (`loadArticles()`) and is reused as the dialog's close handler so
a successful import refreshes the table when the user dismisses the dialog — consistent with
the existing pattern where the article-dialog's `saved`/`deleted` outputs both call
`onSaved()`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- MyArticlesPage.spec.ts`
Expected: PASS (all tests, including the 4 new ones).

- [ ] **Step 5: Run the full frontend test suite once to catch regressions**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test`
Expected: PASS (no regressions from the `FilterPanel`/`MyArticlesPage` changes).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/pages/MyArticlesPage.ts src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/pages/MyArticlesPage.spec.ts
git commit -m "feat(bar-app): wire Import/Export/Vorlage SplitButton into Meine Artikel"
```

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #import #export #meine-artikel #csv #xlsx #nummernkreis #splitbutton
