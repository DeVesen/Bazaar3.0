# R12 — Export und Auslieferung Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the Export-Feature (backend query + frontend download), complete the i18n
retrofit of the entire Voranmelde-App (currently only login/register/errors are wired to
ngx-translate, `en.json` is empty), and build a shared responsive breakpoint system with a
manual verification pass — the three parts of R12 that don't depend on an Azure subscription.

**Architecture:** Backend follows the existing Query-Port pattern (`IExportQuery` in
`BAR.Domain`, EF-Core adapter in `BAR.Infrastructure`, handler in `BAR.Application`, Minimal
API endpoint in `BAR.Host`) — identical shape to the existing `ISellerListQuery`. Frontend
Export-Feature is a new page with a blob-download HTTP call (no such pattern exists yet).
The i18n retrofit replaces every hardcoded German string across ~20 files with
`ngx-translate` keys, introducing a small set of shared `common.*` keys (Abbrechen/Speichern/
Anlegen/Löschen) to avoid duplicating the same four labels in every dialog. The responsive
work adds one new shared SCSS partial (`_breakpoints.scss`) and refactors 4 existing
duplicated media queries onto it, then a manual pass over every page.

**Tech Stack:** .NET 10 (Minimal APIs, EF Core, PostgreSQL), xUnit v3 + Moq, Angular
(standalone components, signals), `@ngx-translate/core` + `@ngx-translate/http-loader`,
Vitest, PrimeNG, SCSS.

**Spec:** [`docs/superpowers/specs/2026-09-10-r12-export-und-auslieferung-design.md`](../specs/2026-09-10-r12-export-und-auslieferung-design.md)

## Global Constraints

- Contract-Sprache (JSON-Feldnamen, Routen) ist **Englisch** — Export-Response-DTO folgt
  exakt dem Schema in `docs/requirements/advance-registration/api/export.md`.
- **Nur PrimeNG**, kein natives HTML für UI-Komponenten (Checkbox → `p-checkbox`, Button →
  `pButton`). Fehlende Komponenten → eigener Wrapper auf PrimeNG-Basis.
- `en.json`/`de.json` bleiben **flach pro Namespace verschachtelt** (ein Top-Level-Key pro
  Feature, z. B. `"sellers": { "title": "...", ... }`), keine tiefere Verschachtelung als
  zwei Ebenen.
- Jede neue/geänderte Übersetzung wird **gleichzeitig** in `de.json` und `en.json`
  eingetragen — nie nur in einer Datei.
- Verkäufer trägt keine eigenen Konditionsfelder — Export überträgt nur `sellerType` (Name),
  keine Zahlen (spec.md §11.7).
- IDs sind 8-stellige alphanumerische Strings (spec.md §11.5) — in Tests via
  `Guid.NewGuid()`-Suffixe eindeutig halten, nicht die 8-Zeichen-Form selbst erzeugen (nicht
  Teil dieses Plans, bestehende Konvention aus `SellerListQueryTests` übernehmen).

---

# Teil A — Export-Feature (Backend)

### Task 1: `IExportQuery` Domain-Port

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Ports/Queries/IExportQuery.cs`
- Test: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Ports/Queries/IExportQueryContractTests.cs`

**Interfaces:**
- Produces: `IExportQuery.ExecuteAsync(bool includeBrands, bool includeCategories, CancellationToken ct)` → `Task<ExportResult>`; `ExportResult(IReadOnlyList<ExportSeller> Sellers, IReadOnlyList<string> Brands, IReadOnlyList<string> Categories)`; `ExportSeller(string Id, string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone, string Email, string SellerType, IReadOnlyList<ExportArticle> Articles)`; `ExportArticle(string Id, int Number, string Name, string Brand, string Category, decimal Price, string? Size, string? Color, string? Description)`.

This is a pure interface + records file (no logic), so there is nothing to unit-test in
isolation beyond compilation. Skip the TDD red/green cycle for this task and instead verify
the shape compiles by having the next task's test reference it.

- [ ] **Step 1: Create the port file**

```csharp
namespace BAR.Domain.Ports.Queries;

public interface IExportQuery
{
    Task<ExportResult> ExecuteAsync(bool includeBrands, bool includeCategories, CancellationToken cancellationToken);
}

public sealed record ExportResult(
    IReadOnlyList<ExportSeller> Sellers,
    IReadOnlyList<string> Brands,
    IReadOnlyList<string> Categories);

public sealed record ExportSeller(
    string Id,
    string FirstName,
    string LastName,
    string? Address,
    string PostalCode,
    string City,
    string Phone,
    string Email,
    string SellerType,
    IReadOnlyList<ExportArticle> Articles);

public sealed record ExportArticle(
    string Id,
    int Number,
    string Name,
    string Brand,
    string Category,
    decimal Price,
    string? Size,
    string? Color,
    string? Description);
```

- [ ] **Step 2: Build to verify it compiles**

Run: `dotnet build src/advance-registration/backend/BAR.Domain`
Expected: Build succeeded.

- [ ] **Step 3: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/Queries/IExportQuery.cs
git commit -m "feat(bar-backend): add IExportQuery domain port"
```

---

### Task 2: `ExportQuery` EF-Core adapter

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/ExportQuery.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs:73` (add registration after `ISellerListQuery`)
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ExportQueryTests.cs`

**Interfaces:**
- Consumes: `IExportQuery` (Task 1), `BarDbContext.Sellers/SellerTypes/Articles/Brands/Categories`, `Seller.CreateByAdmin(firstName, lastName, address?, postalCode, city, phone, email, sellerTypeId, isAdmin)`, `Article.Create(sellerId, number, name, brand, category, price, size?, color?, description?, createdAt)`, `Brand.Create(name, original)`, `Category.Create(name, original)`, `SellerType.Create(name, commissionRate, itemFee)`.
- Produces: `ExportQuery : IExportQuery` for DI registration in Task 4's endpoint wiring.

This is an integration test against the real Postgres test container (`PostgresWebApplicationFactory`), matching the existing `SellerListQueryTests` convention — no in-memory/mock DB for query adapters in this codebase.

- [ ] **Step 1: Write the failing integration test**

```csharp
using BAR.Domain.Articles;
using BAR.Domain.MasterData;
using BAR.Domain.Ports.Queries;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class ExportQueryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ExportQueryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task ExecuteAsync_ExcludesSellersWithoutArticles()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<IExportQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];

        var type = SellerType.Create($"Standard-{marker}", 15m, 0.5m);
        dbContext.SellerTypes.Add(type);
        var withArticle = Seller.CreateByAdmin("Anna", $"Beispiel-{marker}", null, "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        var withoutArticle = Seller.CreateByAdmin("Ben", $"Muster-{marker}", null, "10115", "Berlin", "030 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        dbContext.Sellers.AddRange(withArticle, withoutArticle);
        await dbContext.SaveChangesAsync(ct);
        dbContext.Articles.Add(Article.Create(withArticle.Id, 101, $"Jacke-{marker}", "Nike", "Jacken", 25m, "M", "Blau", null, DateTime.UtcNow));
        await dbContext.SaveChangesAsync(ct);

        var result = await query.ExecuteAsync(false, false, ct);

        Assert.Contains(result.Sellers, s => s.Id == withArticle.Id);
        Assert.DoesNotContain(result.Sellers, s => s.Id == withoutArticle.Id);
    }

    [Fact]
    public async Task ExecuteAsync_MapsArticlesAndSellerTypeName()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<IExportQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];

        var type = SellerType.Create($"Premium-{marker}", 20m, 1m);
        dbContext.SellerTypes.Add(type);
        var seller = Seller.CreateByAdmin("Clara", $"Beispiel-{marker}", "Hauptstr. 1", "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        dbContext.Sellers.Add(seller);
        await dbContext.SaveChangesAsync(ct);
        dbContext.Articles.Add(Article.Create(seller.Id, 201, $"Hose-{marker}", "Adidas", "Hosen", 12.5m, "L", "Schwarz", "kaum getragen", DateTime.UtcNow));
        await dbContext.SaveChangesAsync(ct);

        var result = await query.ExecuteAsync(false, false, ct);
        var exported = result.Sellers.Single(s => s.Id == seller.Id);

        Assert.Equal($"Premium-{marker}", exported.SellerType);
        Assert.Equal("Hauptstr. 1", exported.Address);
        var article = exported.Articles.Single();
        Assert.Equal(201, article.Number);
        Assert.Equal("Adidas", article.Brand);
        Assert.Equal(12.5m, article.Price);
    }

    [Fact]
    public async Task ExecuteAsync_BrandsAndCategoriesEmptyArraysWhenNotRequested()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<IExportQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];
        dbContext.Brands.Add(Brand.Create($"Puma-{marker}", true));
        dbContext.Categories.Add(Category.Create($"Schuhe-{marker}", true));
        await dbContext.SaveChangesAsync(ct);

        var withoutFlags = await query.ExecuteAsync(false, false, ct);
        var withFlags = await query.ExecuteAsync(true, true, ct);

        Assert.Empty(withoutFlags.Brands);
        Assert.Empty(withoutFlags.Categories);
        Assert.Contains($"Puma-{marker}", withFlags.Brands);
        Assert.Contains($"Schuhe-{marker}", withFlags.Categories);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ExportQueryTests`
Expected: FAIL — `IExportQuery` has no registered implementation (DI resolution error).

- [ ] **Step 3: Implement the adapter**

```csharp
using BAR.Domain.Ports.Queries;
using BAR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class ExportQuery(BarDbContext dbContext) : IExportQuery
{
    public async Task<ExportResult> ExecuteAsync(bool includeBrands, bool includeCategories, CancellationToken cancellationToken)
    {
        var sellerRows = await (
            from seller in dbContext.Sellers
            join type in dbContext.SellerTypes on seller.SellerTypeId equals type.Id
            where dbContext.Articles.Any(a => a.SellerId == seller.Id)
            select new { Seller = seller, TypeName = type.Name })
            .ToListAsync(cancellationToken);

        var sellerIds = sellerRows.Select(r => r.Seller.Id).ToList();
        var articles = await dbContext.Articles
            .Where(a => sellerIds.Contains(a.SellerId))
            .ToListAsync(cancellationToken);

        var sellers = sellerRows.Select(row => new ExportSeller(
            row.Seller.Id, row.Seller.FirstName, row.Seller.LastName, row.Seller.Address,
            row.Seller.PostalCode, row.Seller.City, row.Seller.Phone, row.Seller.Email, row.TypeName,
            articles.Where(a => a.SellerId == row.Seller.Id).Select(a => new ExportArticle(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description
            )).ToList()
        )).ToList();

        var brands = includeBrands
            ? await dbContext.Brands.OrderBy(b => b.Name).Select(b => b.Name).ToListAsync(cancellationToken)
            : [];

        var categories = includeCategories
            ? await dbContext.Categories.OrderBy(c => c.Name).Select(c => c.Name).ToListAsync(cancellationToken)
            : [];

        return new ExportResult(sellers, brands, categories);
    }
}
```

Register in `BAR.Infrastructure/DependencyInjection.cs` — add this line directly after line 73
(`services.AddScoped<ISellerListQuery, SellerListQuery>();`):

```csharp
        services.AddScoped<IExportQuery, ExportQuery>();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ExportQueryTests`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/ExportQuery.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ExportQueryTests.cs
git commit -m "feat(bar-backend): add ExportQuery EF Core adapter"
```

---

### Task 3: `GetExportQuery`/`GetExportQueryHandler` Application layer

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Export/GetExportQuery.cs`
- Create: `src/advance-registration/backend/BAR.Application/Export/GetExportQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Export/ExportResponse.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs:121` (add handler registration after `GetSellersQueryHandler`)
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Export/GetExportQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `IExportQuery.ExecuteAsync` (Task 1/2).
- Produces: `GetExportQuery(bool IncludeBrands, bool IncludeCategories)`; `GetExportQueryHandler.HandleAsync(GetExportQuery, CancellationToken)` → `Task<ExportResponse>`; `ExportResponse(DateTime ExportedAt, IReadOnlyList<ExportSellerResponse> Sellers, IReadOnlyList<string> Brands, IReadOnlyList<string> Categories)`; `ExportSellerResponse(string Id, string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone, string Email, string SellerType, IReadOnlyList<ExportArticleResponse> Articles)`; `ExportArticleResponse(string Id, int Number, string Name, string Brand, string Category, decimal Price, string? Size, string? Color, string? Description)` — used by Task 4's endpoint.

- [ ] **Step 1: Write the failing unit test**

```csharp
using BAR.Application.Export;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Export;

public class GetExportQueryHandlerTests
{
    private readonly Mock<IExportQuery> _query = new();

    [Fact]
    public async Task HandleAsync_MapsQueryResultToResponseWithExportedAtTimestamp()
    {
        _query.Setup(q => q.ExecuteAsync(true, true, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ExportResult(
                [new ExportSeller("s1", "Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "Standard",
                    [new ExportArticle("a1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null)])],
                ["Nike"], ["Jacken"]));
        var handler = new GetExportQueryHandler(_query.Object);
        var before = DateTime.UtcNow;

        var result = await handler.HandleAsync(new GetExportQuery(true, true), TestContext.Current.CancellationToken);

        Assert.True(result.ExportedAt >= before);
        Assert.Single(result.Sellers);
        Assert.Equal("Standard", result.Sellers[0].SellerType);
        Assert.Equal("Nike", result.Sellers[0].Articles[0].Brand);
        Assert.Equal(["Nike"], result.Brands);
        Assert.Equal(["Jacken"], result.Categories);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter GetExportQueryHandlerTests`
Expected: FAIL — `BAR.Application.Export` namespace/types don't exist yet.

- [ ] **Step 3: Implement query, DTOs and handler**

`GetExportQuery.cs`:
```csharp
namespace BAR.Application.Export;

public sealed record GetExportQuery(bool IncludeBrands, bool IncludeCategories);
```

`ExportResponse.cs`:
```csharp
namespace BAR.Application.Export;

public sealed record ExportResponse(
    DateTime ExportedAt,
    IReadOnlyList<ExportSellerResponse> Sellers,
    IReadOnlyList<string> Brands,
    IReadOnlyList<string> Categories);

public sealed record ExportSellerResponse(
    string Id,
    string FirstName,
    string LastName,
    string? Address,
    string PostalCode,
    string City,
    string Phone,
    string Email,
    string SellerType,
    IReadOnlyList<ExportArticleResponse> Articles);

public sealed record ExportArticleResponse(
    string Id,
    int Number,
    string Name,
    string Brand,
    string Category,
    decimal Price,
    string? Size,
    string? Color,
    string? Description);
```

`GetExportQueryHandler.cs`:
```csharp
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Export;

public sealed class GetExportQueryHandler(IExportQuery query)
{
    public async Task<ExportResponse> HandleAsync(GetExportQuery request, CancellationToken cancellationToken)
    {
        var result = await query.ExecuteAsync(request.IncludeBrands, request.IncludeCategories, cancellationToken);

        var sellers = result.Sellers.Select(s => new ExportSellerResponse(
            s.Id, s.FirstName, s.LastName, s.Address, s.PostalCode, s.City, s.Phone, s.Email, s.SellerType,
            s.Articles.Select(a => new ExportArticleResponse(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price, a.Size, a.Color, a.Description
            )).ToList()
        )).ToList();

        return new ExportResponse(DateTime.UtcNow, sellers, result.Brands, result.Categories);
    }
}
```

Register in `DependencyInjection.cs` — add this line directly after line 121
(`services.AddScoped<GetSellersQueryHandler>();`):

```csharp
        services.AddScoped<BAR.Application.Export.GetExportQueryHandler>();
```

Add `using BAR.Application.Export;` to the existing `using` block near line 27 (alphabetically after `BAR.Application.Blocks.Reserve;`).

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter GetExportQueryHandlerTests`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Export/ src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Export/GetExportQueryHandlerTests.cs
git commit -m "feat(bar-backend): add GetExportQueryHandler application layer"
```

---

### Task 4: `ExportEndpoints` Minimal API

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/Export/ExportEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs:100` (add `app.MapExportEndpoints();` after `app.MapSellerTypesEndpoints();`)
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Export/ExportEndpointsTests.cs`

**Interfaces:**
- Consumes: `GetExportQueryHandler` (Task 3).
- Produces: `GET /api/export?includeBrands=&includeCategories=` (admin-only), response `Content-Disposition: attachment; filename="basar-export-YYYY-MM-DD.json"`, JSON body per `api/export.md` schema — this is the contract the frontend Task 5/6 consume.

- [ ] **Step 1: Write the failing integration test**

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using BAR.Domain.Articles;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Export;

public class ExportEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ExportEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private async Task<HttpClient> CreateAdminClientAsync()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var tokenIssuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();
        var ct = TestContext.Current.CancellationToken;

        var seedType = SellerType.Create($"Seed-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(seedType, ct);
        var admin = Seller.Register("Admin", "User", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", seedType.Id, "hash", isAdmin: true);
        await sellers.AddAsync(admin, ct);

        var token = tokenIssuer.IssueAccessToken(admin.Id, "admin", DateTime.UtcNow);
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task Get_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/export", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Get_AsAdmin_ReturnsAttachmentWithTodaysFilename()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.GetAsync("/api/export", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("attachment", response.Content.Headers.ContentDisposition!.DispositionType);
        Assert.Equal($"basar-export-{DateTime.UtcNow:yyyy-MM-dd}.json", response.Content.Headers.ContentDisposition!.FileName);
    }

    [Fact]
    public async Task Get_WithoutFlags_ReturnsEmptyBrandsAndCategoriesArrays()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.GetAsync("/api/export", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);

        Assert.Equal(0, body.GetProperty("brands").GetArrayLength());
        Assert.Equal(0, body.GetProperty("categories").GetArrayLength());
    }

    [Fact]
    public async Task Get_SchemaMatchesExportContract()
    {
        var client = await CreateAdminClientAsync();
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Standard-{Guid.NewGuid():N}", 15m, 0.5m);
        await types.AddAsync(type, ct);
        var seller = Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        await sellers.AddAsync(seller, ct);
        await articles.AddAsync(Article.Create(seller.Id, 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null, DateTime.UtcNow), ct);

        var response = await client.GetAsync("/api/export", ct);
        var body = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(ct);

        var exportedSeller = body.GetProperty("sellers").EnumerateArray().Single(s => s.GetProperty("id").GetString() == seller.Id);
        Assert.Equal("Standard", exportedSeller.GetProperty("sellerType").GetString().Split('-')[0] == "Standard" ? "Standard" : exportedSeller.GetProperty("sellerType").GetString());
        Assert.False(exportedSeller.TryGetProperty("commissionRate", out _));
        Assert.False(exportedSeller.TryGetProperty("itemFee", out _));
        var article = exportedSeller.GetProperty("articles").EnumerateArray().Single();
        Assert.Equal("Nike", article.GetProperty("brand").GetString());
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ExportEndpointsTests`
Expected: FAIL — 404 Not Found, `/api/export` doesn't exist yet.

- [ ] **Step 3: Implement the endpoint**

```csharp
using System.Text.Json;
using BAR.Application.Export;

namespace BAR.Host.Features.Export;

public static class ExportEndpoints
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public static IEndpointRouteBuilder MapExportEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/export").RequireAuthorization("admin");

        group.MapGet("/", async (
            bool? includeBrands, bool? includeCategories,
            GetExportQueryHandler handler, CancellationToken ct) =>
        {
            var query = new GetExportQuery(includeBrands ?? false, includeCategories ?? false);
            var response = await handler.HandleAsync(query, ct);

            var json = JsonSerializer.SerializeToUtf8Bytes(response, SerializerOptions);
            var fileName = $"basar-export-{DateTime.UtcNow:yyyy-MM-dd}.json";
            return Results.File(json, "application/json", fileName);
        });

        return app;
    }
}
```

In `Program.cs`, add this line directly after line 100 (`app.MapSellerTypesEndpoints();`):

```csharp
app.MapExportEndpoints();
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter ExportEndpointsTests`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/Export/ExportEndpoints.cs src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Export/ExportEndpointsTests.cs
git commit -m "feat(bar-backend): add GET /api/export endpoint"
```

---

# Teil B — Export-Feature (Frontend)

### Task 5: `ExportApiService` (blob download)

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/export/export-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/export/export-api.service.spec.ts`

**Interfaces:**
- Produces: `ExportApiService.export(options: { includeBrands: boolean; includeCategories: boolean }): Observable<{ blob: Blob; fileName: string }>` — used by `ExportPage` (Task 6).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ExportApiService } from './export-api.service';

describe('ExportApiService', () => {
  let service: ExportApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ExportApiService]
    });
    service = TestBed.inject(ExportApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests /api/export with includeBrands/includeCategories as query params', () => {
    service.export({ includeBrands: true, includeCategories: false }).subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === '/api/export' && r.params.get('includeBrands') === 'true' && r.params.get('includeCategories') === 'false'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['{}']), { headers: { 'Content-Disposition': 'attachment; filename="basar-export-2026-09-10.json"' } });
  });

  it('extracts the filename from the Content-Disposition header', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export({ includeBrands: false, includeCategories: false }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(() => true);
    req.flush(new Blob(['{}']), { headers: { 'Content-Disposition': 'attachment; filename="basar-export-2026-09-10.json"' } });

    expect(result?.fileName).toBe('basar-export-2026-09-10.json');
  });

  it('falls back to a default filename when the header is missing', () => {
    let result: { blob: Blob; fileName: string } | undefined;
    service.export({ includeBrands: false, includeCategories: false }).subscribe((r) => (result = r));

    const req = httpMock.expectOne(() => true);
    req.flush(new Blob(['{}']));

    expect(result?.fileName).toBe('basar-export.json');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- export-api.service.spec.ts`
Expected: FAIL — `Cannot find module './export-api.service'`.

- [ ] **Step 3: Implement the service**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

export interface ExportOptions {
  includeBrands: boolean;
  includeCategories: boolean;
}

export interface ExportResult {
  blob: Blob;
  fileName: string;
}

@Injectable({ providedIn: 'root' })
export class ExportApiService {
  private readonly http = inject(HttpClient);

  export(options: ExportOptions): Observable<ExportResult> {
    const params = {
      includeBrands: String(options.includeBrands),
      includeCategories: String(options.includeCategories)
    };

    return this.http
      .get('/api/export', { params, responseType: 'blob', observe: 'response' })
      .pipe(
        map((response) => ({
          blob: response.body!,
          fileName: this.extractFileName(response.headers.get('Content-Disposition'))
        }))
      );
  }

  private extractFileName(header: string | null): string {
    const match = header?.match(/filename="?([^"]+)"?/);
    return match?.[1] ?? 'basar-export.json';
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- export-api.service.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/export/export-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/export/export-api.service.spec.ts
git commit -m "feat(bar-app): add ExportApiService with blob download"
```

---

### Task 6: `ExportPage` component

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/export/pages/ExportPage.ts` (replace stub)
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/export/pages/ExportPage.spec.ts`
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/de.json` (add `"export"` key)
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/en.json` (add `"export"` key)

**Interfaces:**
- Consumes: `ExportApiService.export()` (Task 5), shared `InfoArea` (`selector: 'app-info-area'`, inputs `type: InfoAreaType`, `message: string`).
- Produces: none (leaf page).

This component triggers a real browser download as a side effect (`URL.createObjectURL` +
a synthetic `<a>` click) — the test verifies the service call and the resulting info-area
message, not the actual browser download mechanics (not observable in jsdom).

- [ ] **Step 1: Add i18n keys to `de.json`**

Add this top-level key (after the existing `"errors"` key, before the closing `}`):

```json
  ,
  "export": {
    "title": "Export",
    "includeBrands": "Marken einschließen",
    "includeCategories": "Kategorien einschließen",
    "submit": "Exportieren",
    "success": "{{sellerCount}} Verkäufer und {{articleCount}} Artikel exportiert.",
    "error": "Export fehlgeschlagen"
  }
```

- [ ] **Step 2: Add the same keys to `en.json`**

`en.json` is currently `{}`. Replace its content with:

```json
{
  "export": {
    "title": "Export",
    "includeBrands": "Include brands",
    "includeCategories": "Include categories",
    "submit": "Export",
    "success": "{{sellerCount}} sellers and {{articleCount}} articles exported.",
    "error": "Export failed"
  }
}
```

- [ ] **Step 3: Write the failing component test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ExportPage } from './ExportPage';
import { ExportApiService } from '../export-api.service';

function create() {
  vi.stubGlobal('AudioContext', vi.fn().mockImplementation(() => ({
    createOscillator: () => ({ connect: vi.fn(), start: vi.fn(), stop: vi.fn(), frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() } }),
    destination: {},
    currentTime: 0
  })));
  vi.stubGlobal('URL', { createObjectURL: vi.fn().mockReturnValue('blob:mock'), revokeObjectURL: vi.fn() });

  TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [provideHttpClient(), provideHttpClientTesting()]
  });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('de', { export: { success: '{{sellerCount}} Verkäufer und {{articleCount}} Artikel exportiert.', error: 'Export fehlgeschlagen' } });
  translate.use('de');
  const api = TestBed.inject(ExportApiService);
  const fixture = TestBed.createComponent(ExportPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('ExportPage', () => {
  it('calls ExportApiService.export with the checkbox state', () => {
    const { fixture, api } = create();
    const exportSpy = vi.spyOn(api, 'export').mockReturnValue(of({ blob: new Blob(['{"sellers":[],"brands":[],"categories":[]}']), fileName: 'basar-export-2026-09-10.json' }));
    fixture.componentInstance.includeBrands.set(true);

    fixture.componentInstance.onExport();

    expect(exportSpy).toHaveBeenCalledWith({ includeBrands: true, includeCategories: false });
  });

  it('shows an info-area with seller/article counts after a successful export', async () => {
    const { fixture, api } = create();
    const json = JSON.stringify({ sellers: [{ id: 's1', articles: [{ id: 'a1' }, { id: 'a2' }] }, { id: 's2', articles: [{ id: 'a3' }] }], brands: [], categories: [] });
    vi.spyOn(api, 'export').mockReturnValue(of({ blob: new Blob([json]), fileName: 'basar-export-2026-09-10.json' }));

    fixture.componentInstance.onExport();
    await fixture.whenStable();

    expect(fixture.componentInstance.resultMessage()).toBe('2 Verkäufer und 3 Artikel exportiert.');
  });

  it('shows an error info-area when the export request fails', () => {
    const { fixture, api } = create();
    vi.spyOn(api, 'export').mockReturnValue(throwError(() => new Error('network')));

    fixture.componentInstance.onExport();

    expect(fixture.componentInstance.errorMessage()).toBe('Export fehlgeschlagen');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- ExportPage.spec.ts`
Expected: FAIL — `ExportPage` still renders only `<h1>Export</h1>`, no `includeBrands`/`onExport`.

- [ ] **Step 5: Implement `ExportPage`**

```typescript
import { Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { InfoArea } from '../../../shared/info-area/info-area';
import { ExportApiService } from '../export-api.service';

interface ExportJson {
  sellers: { id: string; articles: unknown[] }[];
}

@Component({
  selector: 'app-export-page',
  imports: [TranslateModule, InfoArea],
  template: `
    <h1>{{ 'export.title' | translate }}</h1>

    <p-checkbox [binary]="true" [ngModel]="includeBrands()" (ngModelChange)="includeBrands.set($event)" [label]="'export.includeBrands' | translate" />
    <p-checkbox [binary]="true" [ngModel]="includeCategories()" (ngModelChange)="includeCategories.set($event)" [label]="'export.includeCategories' | translate" />

    <button pButton type="button" [label]="'export.submit' | translate" (click)="onExport()"></button>

    @if (resultMessage(); as message) {
      <app-info-area type="info" [message]="message" />
    }
    @if (errorMessage(); as error) {
      <app-info-area type="error" [message]="error" />
    }
  `
})
export class ExportPage {
  private readonly exportApi = inject(ExportApiService);
  private readonly translate = inject(TranslateService);

  readonly includeBrands = signal(false);
  readonly includeCategories = signal(false);
  readonly resultMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  onExport(): void {
    this.resultMessage.set(null);
    this.errorMessage.set(null);

    this.exportApi.export({ includeBrands: this.includeBrands(), includeCategories: this.includeCategories() }).subscribe({
      next: ({ blob, fileName }) => {
        this.triggerDownload(blob, fileName);
        this.showCounts(blob);
      },
      error: () => this.errorMessage.set(this.translate.instant('export.error'))
    });
  }

  private showCounts(blob: Blob): void {
    blob.text().then((text) => {
      const parsed = JSON.parse(text) as ExportJson;
      const articleCount = parsed.sellers.reduce((sum, s) => sum + s.articles.length, 0);
      this.resultMessage.set(this.translate.instant('export.success', { sellerCount: parsed.sellers.length, articleCount }));
    });
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
```

Note: `blob.text()` is async, so `showCounts` resolves after a microtask — the test uses
`await fixture.whenStable()` to let that promise settle before asserting `resultMessage()`.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- ExportPage.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/export/pages/ExportPage.ts src/advance-registration/frontend/BAR.App/src/app/features/export/pages/ExportPage.spec.ts src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): build ExportPage with download and confirmation banner"
```

---

# Teil C — i18n-Retrofit

Ab hier wird jede noch hartcodierte deutsche Zeichenkette durch einen `ngx-translate`-Key
ersetzt. Gemeinsame Aktions-Labels (Abbrechen/Speichern/Anlegen/Löschen/Bearbeiten/OK)
wandern in einen `common`-Namespace, um dieselben vier Wörter nicht zwanzigmal zu
duplizieren.

### Task 7: `common.*` Keys + EN-Parität für Login/Register/Errors

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/de.json`
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/en.json`
- Test: `src/advance-registration/frontend/BAR.App/src/app/i18n-keys.spec.ts` (new — a lightweight structural test to prevent future key drift)

**Interfaces:**
- Produces: `common.cancel`, `common.save`, `common.create`, `common.delete`, `common.edit`, `common.ok` — consumed by nearly every subsequent task.

- [ ] **Step 1: Write the failing structural test**

This test loads both JSON files directly (not through `HttpClient`) and asserts they have
identical key sets — it will keep failing (and thus keep being useful) throughout Teil C
until every task has added matching keys to both files.

```typescript
import { describe, it, expect } from 'vitest';
import de from '../../public/i18n/de.json';
import en from '../../public/i18n/en.json';

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'object' && value !== null ? collectKeys(value as Record<string, unknown>, path) : [path];
  });
}

describe('i18n key parity', () => {
  it('de.json and en.json declare exactly the same keys', () => {
    expect(collectKeys(en).sort()).toEqual(collectKeys(de).sort());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- i18n-keys.spec.ts`
Expected: FAIL — `en.json` only has the `export` key from Task 6, `de.json` has `login`/`register`/`errors`/`export`.

- [ ] **Step 3: Fill `de.json` and `en.json`**

`de.json` — add `common` (new top-level key, anywhere, e.g. right after the opening `{`):

```json
  "common": {
    "cancel": "Abbrechen",
    "save": "Speichern",
    "create": "Anlegen",
    "delete": "Löschen",
    "edit": "Bearbeiten",
    "ok": "OK"
  },
```

`en.json` — full file becomes:

```json
{
  "common": {
    "cancel": "Cancel",
    "save": "Save",
    "create": "Create",
    "delete": "Delete",
    "edit": "Edit",
    "ok": "OK"
  },
  "login": {
    "title": "Sign in",
    "email": "Email",
    "password": "Password",
    "submit": "Sign in",
    "forgotPassword": "Forgot your password?",
    "forgotPasswordHint": "Please contact the admin to reset your password.",
    "noAccount": "Don't have an account?",
    "registerLink": "Register now"
  },
  "register": {
    "title": "Registration",
    "email": "Email",
    "firstName": "First name",
    "lastName": "Last name",
    "address": "Address",
    "postalCode": "Postal code",
    "city": "City",
    "phone": "Phone",
    "password": "Password",
    "passwordConfirmation": "Confirm password",
    "submit": "Register",
    "hasAccount": "Already have an account?",
    "loginLink": "Go to login",
    "passwordMismatch": "Passwords do not match",
    "notEnabled": "Registration is not open yet."
  },
  "errors": {
    "auth.invalid_credentials": "Invalid credentials",
    "seller.email_taken": "This email is already registered",
    "registration.not_enabled": "Registration is not open yet"
  },
  "export": {
    "title": "Export",
    "includeBrands": "Include brands",
    "includeCategories": "Include categories",
    "submit": "Export",
    "success": "{{sellerCount}} sellers and {{articleCount}} articles exported.",
    "error": "Export failed"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- i18n-keys.spec.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json src/advance-registration/frontend/BAR.App/src/app/i18n-keys.spec.ts
git commit -m "feat(bar-app): add common i18n keys and complete EN parity for existing keys"
```

---

### Task 8: Retrofit Login-Feature

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-form.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-info-panel.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.ts`
- Modify: `de.json` / `en.json` (add `login.demoHint`, `login.invalidCredentials`, `login.phase.*`, `login.commission`, `login.itemFee`)
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-form.spec.ts` (new)

**Interfaces:**
- Consumes: `common.*` (Task 7), existing `login.*` keys (Task 7 parity).
- Produces: fully translated login flow; no other task depends on this one's internals.

- [ ] **Step 1: Add new keys to both files**

`de.json`, inside the existing `"login"` object, add:
```json
    "demoHint": "Demo-Zugang: admin@bazaar.local / Admin123!",
    "invalidCredentials": "Ungültige Anmeldedaten",
    "phaseRegistrationDeadline": "Anmeldeschluss",
    "phaseDropOffFrom": "Abgabe ab",
    "phaseDropOffUntil": "Abgabe bis",
    "phaseBazaarFrom": "Basar ab",
    "phaseBazaarUntil": "Basar bis",
    "commissionSuffix": "% Provision",
    "itemFeeSuffix": "Gebühr pro Artikel"
```

`en.json`, inside `"login"`, add:
```json
    "demoHint": "Demo access: admin@bazaar.local / Admin123!",
    "invalidCredentials": "Invalid credentials",
    "phaseRegistrationDeadline": "Registration deadline",
    "phaseDropOffFrom": "Drop-off from",
    "phaseDropOffUntil": "Drop-off until",
    "phaseBazaarFrom": "Bazaar from",
    "phaseBazaarUntil": "Bazaar until",
    "commissionSuffix": "% commission",
    "itemFeeSuffix": "fee per item"
```

- [ ] **Step 2: Write the failing test for `login-form.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('renders translated labels', () => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('de', { login: { title: 'Anmelden', email: 'E-Mail', password: 'Passwort', submit: 'Anmelden', forgotPassword: 'Passwort vergessen?', forgotPasswordHint: 'Bitte wende dich an den Admin, um dein Passwort zurückzusetzen.', noAccount: 'Noch kein Konto?', registerLink: 'Jetzt registrieren' } });
    translate.use('de');
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Anmelden');
    expect(text).toContain('E-Mail');
    expect(text).toContain('Jetzt registrieren');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- login-form.spec.ts`
Expected: PASS on the literal-German assertions already (strings are hardcoded) but this is
the wrong reason — proceed to Step 4 regardless, since the goal is switching the *source* of
these strings to the translate pipe, verified by re-running after the switch with an
English translation loaded instead (see Step 5).

- [ ] **Step 4: Replace hardcoded strings with translate pipe in `login-form.ts`**

Read the current file first, then apply these replacements to its inline `template:` string
(exact current strings on the left, per the R12 string inventory — replace each):

- `<h1>Anmelden</h1>` → `<h1>{{ 'login.title' | translate }}</h1>`
- `label="E-Mail"` (or equivalent floating label text) → `[label]="'login.email' | translate'"`
- `label="Passwort"` → `[label]="'login.password' | translate"`
- Submit button `label="Anmelden"` → `[label]="'login.submit' | translate"`
- `Passwort vergessen?` → `{{ 'login.forgotPassword' | translate }}`
- `Bitte wende dich an den Admin, um dein Passwort zurückzusetzen.` → `{{ 'login.forgotPasswordHint' | translate }}`
- `Noch kein Konto? Jetzt registrieren` → `{{ 'login.noAccount' | translate }} {{ 'login.registerLink' | translate }}`

Add `imports: [TranslateModule, ...existingImports]` to the `@Component` decorator and
`import { TranslateModule } from '@ngx-translate/core';` to the top of the file.

- [ ] **Step 5: Update the test to assert against an English translation and verify it passes**

```typescript
  it('renders English labels when the active language is en', () => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { login: { title: 'Sign in', email: 'Email', password: 'Password', submit: 'Sign in', forgotPassword: 'Forgot your password?', forgotPasswordHint: 'Please contact the admin to reset your password.', noAccount: "Don't have an account?", registerLink: 'Register now' } });
    translate.use('en');
    const fixture = TestBed.createComponent(LoginForm);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Sign in');
    expect(text).toContain('Register now');
  });
```

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- login-form.spec.ts`
Expected: PASS (both tests) — the German-translation test still passes because `de` keys
are unchanged, and the new English-translation test now passes because the template reads
from the active language instead of a hardcoded literal.

- [ ] **Step 6: Apply the same pipe-swap to `login-info-panel.ts` and `LoginPage.ts`**

In `login-info-panel.ts`: the five phase labels currently live in a `computed()` array of
plain strings — replace each literal (`'Anmeldeschluss'`, `'Abgabe ab'`, `'Abgabe bis'`,
`'Basar ab'`, `'Basar bis'`) with `this.translate.instant('login.phaseRegistrationDeadline')`
etc. (inject `TranslateService`). Replace the `% Provision` / `Gebühr pro Artikel` suffixes
in the template interpolations with
`{{ conditions.commissionRate }} {{ 'login.commissionSuffix' | translate }}` and
`{{ formattedItemFee(conditions.itemFee) }} {{ 'login.itemFeeSuffix' | translate }}`.

In `LoginPage.ts`: replace the `!isProduction` demo-hint literal
`'Demo-Zugang: admin@bazaar.local / Admin123!'` with
`this.translate.instant('login.demoHint')`, and the fallback error literal
`'Ungültige Anmeldedaten'` with `this.translate.instant('login.invalidCredentials')`
(inject `TranslateService` in the constructor/via `inject()`).

- [ ] **Step 7: Run the full login feature test suite**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- login`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/login src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit login feature onto ngx-translate"
```

---

### Task 9: Retrofit Register-Feature

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/register/components/registrierung-form.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/register/pages/RegisterPage.ts`
- Modify: `de.json` / `en.json` (add `register.genericError`)
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/register/components/registrierung-form.spec.ts` (new)

**Interfaces:**
- Consumes: existing `register.*` keys (Task 7 parity).
- Produces: fully translated register flow.

- [ ] **Step 1: Add the missing key to both files**

`de.json`, inside `"register"`: `"genericError": "Registrierung fehlgeschlagen. Bitte versuche es erneut."`
`en.json`, inside `"register"`: `"genericError": "Registration failed. Please try again."`

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RegistrierungForm } from './registrierung-form';

describe('RegistrierungForm', () => {
  it('renders English labels when the active language is en', () => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { register: { title: 'Registration', email: 'Email', firstName: 'First name', lastName: 'Last name', address: 'Address', postalCode: 'Postal code', city: 'City', phone: 'Phone', password: 'Password', passwordConfirmation: 'Confirm password', submit: 'Register', hasAccount: 'Already have an account?', loginLink: 'Go to login', passwordMismatch: 'Passwords do not match' } });
    translate.use('en');
    const fixture = TestBed.createComponent(RegistrierungForm);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Registration');
    expect(text).toContain('First name');
    expect(text).toContain('Register');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- registrierung-form.spec.ts`
Expected: FAIL — template still renders hardcoded German regardless of active language.

- [ ] **Step 4: Replace hardcoded strings in `registrierung-form.ts`**

Apply the pipe swap for each of the 14 strings listed in the R12 string inventory
(`Registrierung`, `E-Mail`, `Diese E-Mail ist bereits registriert. `, `Zum Login`,
`Vorname`, `Nachname`, `Anschrift`, `PLZ`, `Ort`, `Telefon`, `Passwort`,
`Passwort-Bestätigung`, `Passwörter stimmen nicht überein`, `Registrieren`,
`Schon ein Konto? Zum Login`) to their matching `register.*` keys from `de.json`/`en.json`,
same mechanical pattern as Task 8 Step 4. Add `TranslateModule` to `imports`.

- [ ] **Step 5: Replace hardcoded strings in `RegisterPage.ts`**

Replace `'Registrierung ist noch nicht freigeschaltet.'` with
`this.translate.instant('register.notEnabled')` and
`'Registrierung fehlgeschlagen. Bitte versuche es erneut.'` with
`this.translate.instant('register.genericError')`.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- register`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/register src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit register feature onto ngx-translate"
```

---

### Task 10: Retrofit Set-Password-Feature

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/set-password/pages/SetPasswordPage.ts`
- Modify: `de.json` / `en.json` (add new `"setPassword"` namespace)
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/set-password/pages/SetPasswordPage.spec.ts` (new, or extend existing if one already exists — check first)

**Interfaces:**
- Produces: `setPassword.*` keys.

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "setPassword": {
    "title": "Passwort festlegen",
    "newPassword": "Neues Passwort",
    "submit": "Passwort setzen",
    "invalidLink": "Der Link ist ungültig oder abgelaufen.",
    "weakPassword": "Passwort erfüllt die Anforderungen nicht.",
    "genericError": "Passwort konnte nicht gesetzt werden."
  },
```

`en.json`:
```json
  "setPassword": {
    "title": "Set password",
    "newPassword": "New password",
    "submit": "Set password",
    "invalidLink": "The link is invalid or has expired.",
    "weakPassword": "Password does not meet the requirements.",
    "genericError": "Could not set the password."
  },
```

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SetPasswordPage } from './SetPasswordPage';

describe('SetPasswordPage', () => {
  it('renders English labels when the active language is en', () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { setPassword: { title: 'Set password', newPassword: 'New password', submit: 'Set password' } });
    translate.use('en');
    const fixture = TestBed.createComponent(SetPasswordPage);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Set password');
    expect(text).toContain('New password');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- SetPasswordPage.spec.ts`
Expected: FAIL.

- [ ] **Step 4: Replace hardcoded strings in `SetPasswordPage.ts`**

Swap `Passwort festlegen`, `Neues Passwort`, `Passwort setzen` for the translate pipe in the
template, and the three error-fallback literals (`Der Link ist ungültig oder abgelaufen.`,
`Passwort erfüllt die Anforderungen nicht.`, `Passwort konnte nicht gesetzt werden.`) for
`this.translate.instant('setPassword.invalidLink' | 'weakPassword' | 'genericError')` in the
corresponding `catch`/`error` branches. Add `TranslateModule` to `imports`, inject
`TranslateService`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- SetPasswordPage.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/set-password src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit set-password feature onto ngx-translate"
```

---

### Task 11: Retrofit Seller-Types-Feature + `typ-popup`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/seller-types/pages/SellerTypesPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/typ-popup/typ-popup.ts`
- Modify: `de.json` / `en.json` (add `"sellerTypes"` and `"typPopup"` namespaces, use `common.*`)
- Test: `SellerTypesPage.spec.ts` (extend existing), `typ-popup.spec.ts` (new)

**Interfaces:**
- Consumes: `common.cancel`/`common.save`/`common.create`/`common.edit`/`common.delete` (Task 7).
- Produces: `sellerTypes.*`, `typPopup.*` keys.

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "sellerTypes": {
    "title": "Verkäufer-Typen",
    "columnName": "Bezeichnung",
    "columnCommissionRate": "Provision %",
    "columnItemFee": "Gebühr €",
    "columnSellerCount": "Verkäufer",
    "emptyText": "Noch keine Verkäufer-Typen. Ohne Typ ist keine Registrierung möglich — mit + Neu beginnen.",
    "loadError": "Verkäufer-Typen konnten nicht geladen werden",
    "confirmDelete": "Verkäufer-Typ „{{name}}“ wirklich löschen? Betrifft {{sellerCount}} Verkäufer.",
    "deleted": "✓ Verkäufer-Typ gelöscht",
    "inUse": "Verkäufer-Typ wird noch verwendet",
    "deleteFailed": "Löschen fehlgeschlagen"
  },
  "typPopup": {
    "editTitle": "Verkäufer-Typ bearbeiten",
    "createTitle": "Neuer Verkäufer-Typ",
    "name": "Name",
    "commissionRate": "Provision (%)",
    "itemFee": "Gebühr (€)",
    "saved": "✓ Verkäufer-Typ gespeichert",
    "nameTaken": "Bezeichnung existiert bereits",
    "saveFailed": "Speichern fehlgeschlagen"
  },
```

`en.json`:
```json
  "sellerTypes": {
    "title": "Seller types",
    "columnName": "Name",
    "columnCommissionRate": "Commission %",
    "columnItemFee": "Fee €",
    "columnSellerCount": "Sellers",
    "emptyText": "No seller types yet. Registration isn't possible without one — start with + New.",
    "loadError": "Seller types could not be loaded",
    "confirmDelete": "Really delete seller type \"{{name}}\"? Affects {{sellerCount}} sellers.",
    "deleted": "✓ Seller type deleted",
    "inUse": "Seller type is still in use",
    "deleteFailed": "Delete failed"
  },
  "typPopup": {
    "editTitle": "Edit seller type",
    "createTitle": "New seller type",
    "name": "Name",
    "commissionRate": "Commission (%)",
    "itemFee": "Fee (€)",
    "saved": "✓ Seller type saved",
    "nameTaken": "Name already exists",
    "saveFailed": "Save failed"
  },
```

- [ ] **Step 2: Write the failing test for `SellerTypesPage`**

Add to the existing `SellerTypesPage.spec.ts` (alongside its current tests):

```typescript
  it('exposes the translated empty-state text', () => {
    const { fixture } = create();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { sellerTypes: { emptyText: "No seller types yet. Registration isn't possible without one — start with + New." } });
    translate.use('en');

    expect(fixture.componentInstance.emptyText).toContain("isn't possible");
  });
```

This requires `emptyText` to become a `computed()`/getter backed by `TranslateService`
rather than a plain string field — verify this red first (current field is a static
German string, so it will never contain the English text regardless of active language).

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- SellerTypesPage.spec.ts`
Expected: FAIL.

- [ ] **Step 4: Retrofit `SellerTypesPage.ts`**

- Inject `TranslateService`.
- Change `readonly emptyText = '...'` to `get emptyText() { return this.translate.instant('sellerTypes.emptyText'); }`.
- Move `COLUMNS`/`ACTION_COLUMN` from module-level `const` into a `get columns()`/`get actionColumn()` on the class (or a `computed()` if the table accepts signals) so `header`/`ariaLabel` read from `translate.instant('sellerTypes.columnName')` etc. and `'common.edit'`/`'common.delete'` for the action ariaLabels.
- `title="Verkäufer-Typen"` in the template → `[title]="'sellerTypes.title' | translate"`.
- Toast/error strings: `'Verkäufer-Typen konnten nicht geladen werden'` → `this.translate.instant('sellerTypes.loadError')`; confirm message template literal → `` this.translate.instant('sellerTypes.confirmDelete', { name: row.name, sellerCount: row.sellerCount }) ``; `acceptLabel`/`rejectLabel` → `this.translate.instant('common.delete')` / `this.translate.instant('common.cancel')`; `'✓ Verkäufer-Typ gelöscht'` → `this.translate.instant('sellerTypes.deleted')`; 409 fallback → `this.translate.instant('sellerTypes.inUse')`; generic delete failure → `this.translate.instant('sellerTypes.deleteFailed')`.
- Add `TranslateModule` to `imports`.

- [ ] **Step 5: Write the failing test for `typ-popup.ts`, then retrofit it**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TypPopup } from './typ-popup';

describe('TypPopup', () => {
  it('shows the create-mode title in the active language', () => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { typPopup: { createTitle: 'New seller type' }, common: { cancel: 'Cancel', save: 'Save' } });
    translate.use('en');
    const fixture = TestBed.createComponent(TypPopup);
    fixture.componentRef.setInput('item', null);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('New seller type');
  });
});
```

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- typ-popup.spec.ts` → FAIL.

Retrofit `typ-popup.ts`: header ternary `item() ? 'Verkäufer-Typ bearbeiten' : 'Neuer Verkäufer-Typ'`
→ `this.translate.instant(this.item() ? 'typPopup.editTitle' : 'typPopup.createTitle')`
(as a `computed()`); `Name`/`Provision (%)`/`Gebühr (€)` labels → translate pipe;
`Abbrechen`/`Speichern` buttons → `'common.cancel' | translate` / `'common.save' | translate`;
success toast → `this.translate.instant('typPopup.saved')`; 409 fallback →
`this.translate.instant('typPopup.nameTaken')`; generic failure →
`this.translate.instant('typPopup.saveFailed')`. Add `TranslateModule` to `imports`.

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- typ-popup.spec.ts` → PASS.

- [ ] **Step 6: Run the full seller-types test suite**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- seller-types typ-popup`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/seller-types src/advance-registration/frontend/BAR.App/src/app/shared/typ-popup src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit seller-types feature and typ-popup onto ngx-translate"
```

---

### Task 12: Retrofit Brands + Categories + `stammdaten-popup`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/brands/pages/BrandsPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/categories/pages/CategoriesPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/stammdaten-popup/stammdaten-popup.ts`
- Modify: `de.json` / `en.json` (add `"brands"`, `"categories"`, `"stammdatenPopup"`)
- Test: `BrandsPage.spec.ts`, `CategoriesPage.spec.ts`, `stammdaten-popup.spec.ts` (new, or extend if any exist — check first)

**Interfaces:**
- Consumes: `common.*` (Task 7).
- Produces: `brands.*`, `categories.*`, `stammdatenPopup.*` keys. `stammdaten-popup` takes
  `entityLabel` as a caller `@Input` (unchanged) — the popup's own chrome (buttons, "Neue "/"
  bearbeiten" ternary) becomes translated, `entityLabel` itself stays a plain string the
  caller already translates before passing in (see Step 4).

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "brands": {
    "title": "Marken",
    "entityLabel": "Marke",
    "columnName": "Name",
    "columnOriginal": "Original",
    "badgeOriginal": "✓ Original",
    "badgeNew": "Neu",
    "columnArticleCount": "Artikel",
    "loadError": "Marken konnten nicht geladen werden",
    "confirmDelete": "Marke „{{name}}“ wirklich löschen?",
    "deleted": "✓ Marke gelöscht",
    "inUse": "Marke wird noch verwendet",
    "deleteFailed": "Löschen fehlgeschlagen"
  },
  "categories": {
    "title": "Kategorien",
    "entityLabel": "Kategorie",
    "columnName": "Name",
    "columnOriginal": "Original",
    "badgeOriginal": "✓ Original",
    "badgeNew": "Neu",
    "columnArticleCount": "Artikel",
    "loadError": "Kategorien konnten nicht geladen werden",
    "confirmDelete": "Kategorie „{{name}}“ wirklich löschen?",
    "deleted": "✓ Kategorie gelöscht",
    "inUse": "Kategorie wird noch verwendet",
    "deleteFailed": "Löschen fehlgeschlagen"
  },
  "stammdatenPopup": {
    "createPrefix": "Neue ",
    "editSuffix": " bearbeiten",
    "name": "Name",
    "original": "Original",
    "createLabel": "Anlegen",
    "savedSuffix": " gespeichert",
    "nameTaken": "Name existiert bereits",
    "saveFailed": "Speichern fehlgeschlagen"
  },
```

`en.json`:
```json
  "brands": {
    "title": "Brands",
    "entityLabel": "Brand",
    "columnName": "Name",
    "columnOriginal": "Original",
    "badgeOriginal": "✓ Original",
    "badgeNew": "New",
    "columnArticleCount": "Articles",
    "loadError": "Brands could not be loaded",
    "confirmDelete": "Really delete brand \"{{name}}\"?",
    "deleted": "✓ Brand deleted",
    "inUse": "Brand is still in use",
    "deleteFailed": "Delete failed"
  },
  "categories": {
    "title": "Categories",
    "entityLabel": "Category",
    "columnName": "Name",
    "columnOriginal": "Original",
    "badgeOriginal": "✓ Original",
    "badgeNew": "New",
    "columnArticleCount": "Articles",
    "loadError": "Categories could not be loaded",
    "confirmDelete": "Really delete category \"{{name}}\"?",
    "deleted": "✓ Category deleted",
    "inUse": "Category is still in use",
    "deleteFailed": "Delete failed"
  },
  "stammdatenPopup": {
    "createPrefix": "New ",
    "editSuffix": " edit",
    "name": "Name",
    "original": "Original",
    "createLabel": "Create",
    "savedSuffix": " saved",
    "nameTaken": "Name already exists",
    "saveFailed": "Save failed"
  },
```

Note: `stammdatenPopup.editSuffix` in English reads awkwardly appended after the entity
label ("Brand edit") — accept this for the mechanical concatenation approach consistent
with the German source (`entityLabel() + ' bearbeiten'`); a more natural English phrasing
would require restructuring the header to a single parameterized key
(`"editTitle": "Edit {{entity}}"`) instead of prefix/suffix concatenation. Use the
parameterized form instead — it already exists as the better option:

Replace the two `stammdatenPopup` entries above with:
```json
  "stammdatenPopup": {
    "createTitle": "Neue {{entity}}",
    "editTitle": "{{entity}} bearbeiten",
    "name": "Name",
    "original": "Original",
    "createLabel": "Anlegen",
    "saved": "✓ {{entity}} gespeichert",
    "nameTaken": "Name existiert bereits",
    "saveFailed": "Speichern fehlgeschlagen"
  },
```
(EN equivalent: `"createTitle": "New {{entity}}"`, `"editTitle": "Edit {{entity}}"`, `"saved": "✓ {{entity}} saved"`, rest same as above.)

- [ ] **Step 2: Write the failing tests**

`BrandsPage.spec.ts` (new, following the `SellerTypesPage.spec.ts` convention with a
`create()` helper stubbing `MasterDataApiService`):

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { BrandsPage } from './BrandsPage';
import { MasterDataApiService } from '../../../shared/master-data/master-data-api.service';

function create() {
  TestBed.configureTestingModule({
    imports: [TranslateModule.forRoot()],
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService, ConfirmationService]
  });
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation('en', { brands: { title: 'Brands', entityLabel: 'Brand' } });
  translate.use('en');
  const api = TestBed.inject(MasterDataApiService);
  vi.spyOn(api, 'getAllBrands').mockReturnValue(of([]));
  const fixture = TestBed.createComponent(BrandsPage);
  fixture.detectChanges();
  return { fixture };
}

describe('BrandsPage', () => {
  it('renders the translated title', () => {
    const { fixture } = create();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Brands');
  });
});
```

(If the actual service/method name differs from `MasterDataApiService.getAllBrands`, use
the name found when reading `BrandsPage.ts` in Step 3 — this plan's earlier research did not
capture the exact service call, only the template strings, so confirm the real signature
before writing this test's mock.)

`CategoriesPage.spec.ts`: identical structure, substituting `categories`/`Categories`/`Category`.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- BrandsPage.spec.ts CategoriesPage.spec.ts`
Expected: FAIL — titles are still hardcoded German regardless of active language.

- [ ] **Step 4: Retrofit `BrandsPage.ts` and `CategoriesPage.ts`**

For each: `title="Marken"` (static template attribute) → `[title]="'brands.title' | translate"`;
`entityLabel="Marke"` → `[entityLabel]="'brands.entityLabel' | translate"`; `COLUMNS`/
`ACTION_COLUMN` move to a getter/computed reading `translate.instant('brands.columnName')`
etc. and `'common.edit'`/`'common.delete'`; badge labels `'✓ Original'`/`'Neu'` →
`translate.instant('brands.badgeOriginal')`/`translate.instant('brands.badgeNew')`; toast/
confirm strings → `brands.loadError`/`brands.confirmDelete`(`{ name: row.name }`)/
`common.delete`/`common.cancel`/`brands.deleted`/`brands.inUse`/`brands.deleteFailed`. Same
pattern for `CategoriesPage.ts` with the `categories.*` keys. Add `TranslateModule` to
`imports` on both.

- [ ] **Step 5: Retrofit `stammdaten-popup.ts`**

Header computed: `this.mode() === 'create' ? this.translate.instant('stammdatenPopup.createTitle', { entity: this.entityLabel() }) : this.translate.instant('stammdatenPopup.editTitle', { entity: this.entityLabel() })`.
`Name`/`Original` labels → translate pipe. `Abbrechen` → `'common.cancel' | translate`.
Save button: `{{ mode() === 'create' ? ('stammdatenPopup.createLabel' | translate) : ('common.save' | translate) }}`.
Success toast → `this.translate.instant('stammdatenPopup.saved', { entity: this.entityLabel() })`.
409 fallback → `this.translate.instant('stammdatenPopup.nameTaken')`. Generic failure →
`this.translate.instant('stammdatenPopup.saveFailed')`. Add `TranslateModule` to `imports`.

Note: `entityLabel` stays a plain-string `@Input` — `BrandsPage`/`CategoriesPage` now pass
it as `[entityLabel]="'brands.entityLabel' | translate"` (Step 4), so the popup receives an
already-translated noun and only needs to translate its own surrounding chrome.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- BrandsPage CategoriesPage stammdaten-popup`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/brands src/advance-registration/frontend/BAR.App/src/app/features/categories src/advance-registration/frontend/BAR.App/src/app/shared/stammdaten-popup src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit brands, categories and stammdaten-popup onto ngx-translate"
```

---

### Task 13: Retrofit Sellers-Feature + `seller-create-dialog` + `seller-edit-dialog`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/sellers/pages/SellersPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/seller-create-dialog/seller-create-dialog.ts` and `.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/seller-edit-dialog/seller-edit-dialog.ts` and `.html`
- Modify: `de.json` / `en.json` (add `"sellers"`, `"sellerCreateDialog"`, `"sellerEditDialog"`)
- Test: `SellersPage.spec.ts`, `seller-create-dialog.spec.ts` (extend existing), `seller-edit-dialog.spec.ts` (extend existing)

**Interfaces:**
- Consumes: `common.*` (Task 7).
- Produces: `sellers.*`, `sellerCreateDialog.*`, `sellerEditDialog.*` keys.

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "sellers": {
    "title": "Verkäufer",
    "columnStartNumber": "Nr.",
    "columnFirstName": "Vorname",
    "columnLastName": "Nachname",
    "columnPostalCode": "PLZ",
    "columnCity": "Ort",
    "columnSellerType": "Typ",
    "columnCommissionRate": "Provision",
    "columnItemFee": "Gebühr",
    "columnArticleCount": "Artikel",
    "searchPlaceholder": "Suche Name/Ort/E-Mail...",
    "searchButton": "Suchen",
    "emptyText": "Noch keine Verkäufer registriert.",
    "confirmDelete": "Verkäufer „{{firstName}} {{lastName}}“ wirklich löschen? Löscht auch alle Artikel und Nummernblöcke.",
    "deleted": "✓ Verkäufer gelöscht",
    "deleteFailed": "Löschen fehlgeschlagen",
    "loadError": "Verkäufer konnten nicht geladen werden"
  },
  "sellerCreateDialog": {
    "header": "Neuen Verkäufer anlegen",
    "sectionPersonal": "Personendaten",
    "firstName": "Vorname *",
    "lastName": "Nachname *",
    "sectionContact": "Kontakt",
    "address": "Anschrift",
    "postalCode": "PLZ *",
    "city": "Ort *",
    "phone": "Telefon *",
    "email": "E-Mail (= Login) *",
    "sectionConditions": "Konditionen",
    "sellerType": "Verkäufer-Typ *",
    "conditionsSummary": "Provision: {{commissionRate}} % · Gebühr: {{itemFee}} € pro Stück",
    "sectionNumberBlock": "Nummernblock",
    "startNumber": "Startnummer",
    "initialBlockCount": "Anzahl initialer Blöcke",
    "saved": "✓ Verkäufer gespeichert",
    "saveFailed": "Verkäufer konnte nicht gespeichert werden"
  },
  "sellerEditDialog": {
    "header": "Verkäufer bearbeiten",
    "sectionPersonal": "Personendaten",
    "firstName": "Vorname *",
    "lastName": "Nachname *",
    "sectionContact": "Kontakt",
    "address": "Anschrift",
    "postalCode": "PLZ *",
    "city": "Ort *",
    "phone": "Telefon *",
    "email": "E-Mail (= Login) *",
    "sectionConditions": "Konditionen",
    "sellerType": "Verkäufer-Typ *",
    "conditionsSummary": "Provision: {{commissionRate}} % · Gebühr: {{itemFee}} € pro Stück",
    "sectionBlocks": "Nummernblöcke",
    "blockUsage": "{{count}} Nummern · {{used}} vergeben",
    "blockFull": "Voll — nicht löschbar",
    "confirmDeleteBlock": "Diesen Nummernblock wirklich löschen?",
    "reserveAdditional": "Zusätzliche Blöcke reservieren:",
    "blockCount": "Anzahl Blöcke",
    "suggestedStartNumber": "Startnummer (Vorschlag)",
    "reserve": "✓ Reservieren",
    "reserveConflict": "Nummernbereich überschneidet sich mit bestehendem Block",
    "reserveFailed": "Block konnte nicht reserviert werden",
    "reserved": "✓ Block reserviert",
    "sectionOther": "Sonstiges",
    "isAdmin": "Dieser Verkäufer hat Admin-Rechte",
    "generateInvite": "📋 Einladungs-Link generieren",
    "inviteCopied": "✓ Einladungs-Link kopiert!",
    "saved": "✓ Verkäufer gespeichert",
    "saveFailed": "Verkäufer konnte nicht gespeichert werden"
  },
```

`en.json` (mirrored, key structure identical, values translated — e.g. `"header": "Create new seller"`, `"conditionsSummary": "Commission: {{commissionRate}} % · Fee: {{itemFee}} € per item"`, `"blockUsage": "{{count}} numbers · {{used}} assigned"`, `"blockFull": "Full — cannot be deleted"`, `"generateInvite": "📋 Generate invite link"`, `"isAdmin": "This seller has admin rights"`, etc. — apply the same literal-for-literal translation as previous tasks).

- [ ] **Step 2: Write the failing tests**

Add an English-language test to the existing `seller-create-dialog.spec.ts` and
`seller-edit-dialog.spec.ts` following the exact pattern used in Task 8 Step 5/Task 9
(`translate.setTranslation('en', {...}); translate.use('en');` then assert translated text
appears in `nativeElement.textContent`). Add a new `SellersPage.spec.ts` asserting the
translated `emptyText`/title, following the `SellerTypesPage.spec.ts` convention (Task 11
Step 2 gives the exact shape to copy).

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- SellersPage seller-create-dialog seller-edit-dialog`
Expected: FAIL.

- [ ] **Step 4: Retrofit `SellersPage.ts`**

Same mechanical pattern as Task 11 Step 4 (`sellers.*` keys for title, columns, ariaLabels,
placeholder, empty text, confirm/toast messages), applied to all strings listed in the R12
inventory for `SellersPage.ts`.

- [ ] **Step 5: Retrofit `seller-create-dialog.html`/`.ts`**

Replace every literal listed in the inventory (`Neuen Verkäufer anlegen`, `Personendaten`,
`Vorname *`, `Nachname *`, `Kontakt`, `Anschrift`, `PLZ *`, `Ort *`, `Telefon *`,
`E-Mail (= Login) *`, `Konditionen`, `Verkäufer-Typ *`, the `Provision: ... · Gebühr: ...`
interpolation, `Nummernblock`, `Startnummer`, `Anzahl initialer Blöcke`, `Abbrechen`,
`Speichern`) with the matching `sellerCreateDialog.*`/`common.*` key via the translate pipe
in the `.html` template; the two toast strings in `seller-create-dialog.ts` via
`this.translate.instant(...)`. Add `TranslateModule` to `imports`.

- [ ] **Step 6: Retrofit `seller-edit-dialog.html`/`.ts`**

Same treatment for the full list from the inventory (header, section titles, field labels,
conditions summary, block list interpolations, the `🗑`/`📋`/`✓ Reservieren` buttons —
keep the emoji glyphs as literal template characters outside the translated string, e.g.
`🗑<span class="sr-only">{{ 'common.delete' | translate }}</span>` if an accessible label is
added, or at minimum keep the glyph and translate only the trailing text where one exists),
confirm-dialog strings, and all six toast/error strings in the `.ts` file.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- SellersPage seller-create-dialog seller-edit-dialog`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/sellers src/advance-registration/frontend/BAR.App/src/app/shared/seller-create-dialog src/advance-registration/frontend/BAR.App/src/app/shared/seller-edit-dialog src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit sellers feature and seller dialogs onto ngx-translate"
```

---

### Task 14: Retrofit My-Articles-Feature + `artikel-dialog` + `autocomplete-create`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/pages/MyArticlesPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/components/artikel-dialog.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/autocomplete-create/autocomplete-create.ts`
- Modify: `de.json` / `en.json` (add `"myArticles"`, `"articleDialog"`, `"autocompleteCreate"`)
- Test: `MyArticlesPage.spec.ts`, `artikel-dialog.spec.ts`, `autocomplete-create.spec.ts` (extend existing where present)

**Interfaces:**
- Consumes: `common.*` (Task 7).
- Produces: `myArticles.*`, `articleDialog.*`, `autocompleteCreate.*` keys.

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "myArticles": {
    "title": "Meine Artikel",
    "columnNumber": "Nr.",
    "columnName": "Bezeichnung",
    "columnCategory": "Kategorie",
    "columnBrand": "Marke",
    "columnPrice": "Preis",
    "emptyTextPrefix": "Noch keine Artikel angemeldet. Mit ",
    "emptyTextSuffix": " den ersten anlegen.",
    "createButton": "+ Neu",
    "loadError": "Artikel konnten nicht geladen werden",
    "noFreeNumber": "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren"
  },
  "articleDialog": {
    "createHeader": "Artikel anlegen",
    "editHeader": "Artikel bearbeiten",
    "number": "Artikelnummer",
    "numberHint": "wird beim Speichern endgültig vergeben",
    "name": "Bezeichnung",
    "category": "Kategorie",
    "brand": "Marke",
    "size": "Größe",
    "color": "Farbe",
    "price": "Preis",
    "description": "Beschreibung",
    "deleteConfirmHeader": "Artikel wirklich löschen?",
    "saveAndCopyTooltip": "Artikel speichern und einen weiteren mit denselben Werten anlegen",
    "saveAndCopy": "Speichern + kopieren",
    "conflictHeader": "Artikelnummer bereits vergeben",
    "noFreeNumber": "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren",
    "savedAndCopied": "✓ Artikel {{number}} gespeichert — nächste Nummer: {{nextNumber}}",
    "saveFailed": "Speichern fehlgeschlagen",
    "deleteFailed": "Löschen fehlgeschlagen"
  },
  "autocompleteCreate": {
    "dialogHeaderPrefix": "Neuer Eintrag: ",
    "conflict": "Eintrag existiert bereits",
    "createFailed": "Anlegen fehlgeschlagen"
  },
```

`en.json` (mirrored — `"title": "My articles"`, `"emptyTextPrefix": "No articles registered yet. Use "`, `"emptyTextSuffix": " to create the first one."`, `"createButton": "+ New"`, `"numberHint": "assigned permanently on save"`, `"savedAndCopied": "✓ Article {{number}} saved — next number: {{nextNumber}}"`, `"dialogHeaderPrefix": "New entry: "`, etc. — same literal-for-literal approach).

- [ ] **Step 2: Write the failing tests**

New `MyArticlesPage.spec.ts`, `artikel-dialog.spec.ts` (or extended if they exist — check
first), `autocomplete-create.spec.ts`, each asserting English text renders when
`translate.use('en')`, following the exact pattern from Task 8/9/11.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- MyArticlesPage artikel-dialog autocomplete-create`
Expected: FAIL.

- [ ] **Step 4: Retrofit `MyArticlesPage.ts`**

Translate title, columns, the composite empty-state sentence (split into
`{{ 'myArticles.emptyTextPrefix' | translate }}<strong>{{ 'myArticles.createButton' | translate }}</strong>{{ 'myArticles.emptyTextSuffix' | translate }}` to preserve the bolded
`+ Neu` fragment), the `+ Neu` button in the `@else` branch, and the two toast strings.

- [ ] **Step 5: Retrofit `artikel-dialog.ts`**

Translate all 24 strings listed in the R12 inventory for this file using the `articleDialog.*`
keys and `common.cancel`/`common.delete`/`common.save`/`common.ok` where applicable
(`Abbrechen`, `Löschen`, `Speichern`, `OK`). The dynamic header (`mode() === 'create' ? ... : ...`)
becomes a `computed()` reading `translate.instant('articleDialog.createHeader' | 'editHeader')`.

- [ ] **Step 6: Retrofit `autocomplete-create.ts`**

Dynamic header `'Neuer Eintrag: ' + value()` → `this.translate.instant('autocompleteCreate.dialogHeaderPrefix') + this.value()`.
`Abbrechen`/`Anlegen` → `common.cancel`/`common.create`. 409 fallback →
`this.translate.instant('autocompleteCreate.conflict')`. Generic failure →
`this.translate.instant('autocompleteCreate.createFailed')`.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- MyArticlesPage artikel-dialog autocomplete-create`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles src/advance-registration/frontend/BAR.App/src/app/shared/autocomplete-create src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit my-articles feature, article dialog and autocomplete-create onto ngx-translate"
```

---

### Task 15: Retrofit Profile-Feature

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.html`
- Modify: `de.json` / `en.json` (add `"profile"`)
- Test: `ProfilePage.spec.ts` (extend existing if present, else new)

**Interfaces:**
- Produces: `profile.*` keys.

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "profile": {
    "tabSteckbrief": "Steckbrief",
    "tabZugangsdaten": "Zugangsdaten",
    "tabDelete": "Löschen",
    "sectionPersonal": "Personendaten",
    "firstName": "Vorname *",
    "lastName": "Nachname *",
    "address": "Anschrift",
    "postalCode": "PLZ *",
    "city": "Ort *",
    "sectionContact": "Kontakt",
    "phone": "Telefon *",
    "email": "E-Mail",
    "sectionConditions": "Konditionen",
    "sellerType": "Verkäufer-Typ",
    "itemFee": "Gebühr je Stück",
    "commissionRate": "Provision",
    "save": "Speichern",
    "comingSoon": "Verfügbar ab R07.",
    "loadError": "Profil konnte nicht geladen werden",
    "saved": "✓ Profil gespeichert",
    "saveFailed": "Profil konnte nicht gespeichert werden"
  },
```

`en.json` (mirrored — `"tabSteckbrief": "Profile"`, `"tabZugangsdaten": "Credentials"`,
`"tabDelete": "Delete"`, `"comingSoon": "Available from R07."`, etc.).

- [ ] **Step 2: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ProfilePage } from './ProfilePage';

describe('ProfilePage', () => {
  it('renders English tab and section labels when the active language is en', () => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { profile: { tabSteckbrief: 'Profile', sectionPersonal: 'Personal data', firstName: 'First name *', save: 'Save' } });
    translate.use('en');
    const fixture = TestBed.createComponent(ProfilePage);
    const httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpMock.expectOne(() => true).flush({ firstName: 'Anna', lastName: 'Beispiel', postalCode: '76133', city: 'Karlsruhe', phone: '0721', email: 'a@example.com', sellerType: { name: 'Standard', commissionRate: 15, itemFee: 0.5 } });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Personal data');
    expect(text).toContain('First name');
  });
});
```

(Adjust the flushed response shape to match `ProfilePage.ts`'s actual `GET` call once read —
this plan's inventory captured template strings, not the exact profile-load DTO shape.)

- [ ] **Step 3: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- ProfilePage.spec.ts`
Expected: FAIL.

- [ ] **Step 4: Retrofit `ProfilePage.html`**

Replace every literal from the inventory (`Steckbrief`, `Zugangsdaten`, `Löschen` tabs,
`Personendaten`, `Vorname *`, `Nachname *`, `Anschrift`, `PLZ *`, `Ort *`, `Kontakt`,
`Telefon *`, `E-Mail`, `Konditionen`, `Verkäufer-Typ`, `Gebühr je Stück`, `Provision`,
`Speichern`, both `Verfügbar ab R07.` occurrences) with `{{ 'profile.<key>' | translate }}`
or `[label]="'profile.<key>' | translate"` as appropriate to each PrimeNG binding. Add
`TranslateModule` to the component's `imports` in `ProfilePage.ts`.

- [ ] **Step 5: Retrofit `ProfilePage.ts`**

Replace the three signal-assignment literals (`'Profil konnte nicht geladen werden'`,
`'✓ Profil gespeichert'`, `'Profil konnte nicht gespeichert werden'`) with
`this.translate.instant('profile.loadError' | 'saved' | 'saveFailed')`. Inject
`TranslateService`.

- [ ] **Step 6: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- ProfilePage.spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/profile src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit profile feature onto ngx-translate"
```

---

### Task 16: Retrofit Number-Blocks-Feature + `block-liste` + `verkaeufer-nummer`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/number-blocks/pages/NumberBlocksPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/block-liste/block-liste.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/verkaeufer-nummer/verkaeufer-nummer.ts`
- Modify: `de.json` / `en.json` (add `"numberBlocks"`, `"blockListe"`, `"sellerNumber"`)
- Test: `NumberBlocksPage.spec.ts`, `block-liste.spec.ts`, `verkaeufer-nummer.spec.ts` (extend/new)

**Interfaces:**
- Produces: `numberBlocks.*`, `blockListe.*`, `sellerNumber.*` keys.

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "numberBlocks": {
    "title": "Nummernblöcke",
    "loadError": "Nummernblöcke konnten nicht geladen werden"
  },
  "blockListe": {
    "empty": "Noch keine Nummernblöcke zugewiesen",
    "usage": "{{count}} Nummern · {{used}} vergeben"
  },
  "sellerNumber": {
    "title": "Meine Verkäufernummer",
    "copy": "Kopieren",
    "hint": "Am Basar-Tag vorzeigen — das Kassenpersonal scannt den Code.",
    "copied": "✓ Nummer kopiert"
  },
```

`en.json` (mirrored — `"title": "Number blocks"`, `"empty": "No number blocks assigned yet"`,
`"usage": "{{count}} numbers · {{used}} assigned"`, `"title": "My seller number"`,
`"copy": "Copy"`, `"hint": "Show this at the bazaar — staff will scan the code."`,
`"copied": "✓ Number copied"`).

- [ ] **Step 2: Write the failing tests**

New/extended specs for all three files, English-language assertions, same established
pattern.

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- NumberBlocksPage block-liste verkaeufer-nummer`
Expected: FAIL.

- [ ] **Step 4: Retrofit all three files**

`NumberBlocksPage.ts`: `Nummernblöcke` heading and `loadError` signal message →
`numberBlocks.title`/`numberBlocks.loadError`. `block-liste.ts`: empty state and the
`{{ count }} Nummern · {{ used }} vergeben` interpolation → `blockListe.empty`/
`blockListe.usage` (parameterized). `verkaeufer-nummer.ts`: title, `Kopieren` button, hint
text, success toast → `sellerNumber.*`. Add `TranslateModule` to all three components'
`imports`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- NumberBlocksPage block-liste verkaeufer-nummer`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/number-blocks src/advance-registration/frontend/BAR.App/src/app/shared/block-liste src/advance-registration/frontend/BAR.App/src/app/shared/verkaeufer-nummer src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit number-blocks feature, block-liste and verkaeufer-nummer onto ngx-translate"
```

---

### Task 17: Retrofit remaining shared components + placeholder pages

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/password-strength-meter/password-strength-meter.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/countdown/countdown.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/countdown/format-countdown.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/not-found/pages/NotFoundPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/countdown-embed/pages/CountdownEmbedPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/SettingsPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/articles/pages/ArticlesPage.ts`
- Modify: `de.json` / `en.json` (add `"filterPanel"`, `"passwordStrength"`, `"countdown"`, `"home"`, `"notFound"`, `"settings"`, `"articles"`)

**Interfaces:**
- Consumes: active `TranslateService` locale for `format-countdown.ts`'s date formatting.
- Produces: last set of feature-level keys; no further task depends on these.

- [ ] **Step 1: Add keys to both files**

`de.json`:
```json
  "filterPanel": {
    "brandPlaceholder": "Marke",
    "categoryPlaceholder": "Kategorie",
    "searchPlaceholder": "Suche...",
    "searchButton": "Suchen"
  },
  "passwordStrength": {
    "weak": "Schwach",
    "medium": "Mittel",
    "strong": "Stark"
  },
  "countdown": {
    "completed": "Abgeschlossen",
    "dayLabelSingular": "Tag",
    "dayLabelPlural": "Tage"
  },
  "home": { "title": "Home" },
  "notFound": { "title": "Seite nicht gefunden" },
  "settings": { "title": "Einstellungen" },
  "articles": { "title": "Artikel" },
```

`en.json` (mirrored — `"weak": "Weak"`, `"medium": "Medium"`, `"strong": "Strong"`,
`"completed": "Completed"`, `"dayLabelSingular": "day"`, `"dayLabelPlural": "days"`,
`"title": "Home"` unchanged, `"title": "Page not found"`, `"title": "Settings"`,
`"title": "Articles"`).

- [ ] **Step 2: Write the failing tests**

One small spec per non-trivial file (`filter-panel.spec.ts`, `password-strength-meter.spec.ts`,
extend `countdown.spec.ts` if it exists) asserting English text under `translate.use('en')`.
The four placeholder pages (`HomePage`, `NotFoundPage`, `CountdownEmbedPage`, `SettingsPage`)
and `ArticlesPage` get a one-line spec each, e.g.:

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('renders the translated title', () => {
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()] });
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { home: { title: 'Home' } });
    translate.use('en');
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Home');
  });
});
```

(Repeat for `NotFoundPage`/`notFound.title`, `CountdownEmbedPage`/`countdown-embed` — note:
this page has no dedicated key namespace listed above since its only string was the
placeholder `<h1>Countdown</h1>`; add `"countdownEmbed": { "title": "Countdown" }` to both
JSON files alongside the others in Step 1 — `SettingsPage`/`settings.title`,
`ArticlesPage`/`articles.title`.)

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel password-strength-meter HomePage NotFoundPage CountdownEmbedPage SettingsPage ArticlesPage`
Expected: FAIL.

- [ ] **Step 4: Retrofit each file**

`filter-panel.ts`: three placeholders + button label → `filterPanel.*`.
`password-strength-meter.ts`: `Schwach`/`Mittel`/`Stark` labels → `passwordStrength.*`
(inject `TranslateService`, call `translate.instant(...)` in whatever computed/method
currently returns the `LABELS` map value).
`countdown.html`: `Abgeschlossen` → `{{ 'countdown.completed' | translate }}` (add
`TranslateModule` to `countdown.ts`'s `imports`).
`format-countdown.ts`: `formatDaysLabel` — replace the hardcoded `'Tag' : 'Tage'` ternary
with values passed in as parameters (this function is not a component and has no DI
access) — change its signature to accept the two label strings from the caller
(`countdown.ts`, which has `TranslateService`), e.g.
`formatDaysLabel(days: number, singular: string, plural: string): string` and update the
one call site in `countdown.ts` to pass
`this.translate.instant('countdown.dayLabelSingular')`/`this.translate.instant('countdown.dayLabelPlural')`.
Also change `formatDateLabel`'s hardcoded `'de-DE'` locale argument to use
`this.translate.currentLang === 'en' ? 'en-US' : 'de-DE'` at the `countdown.ts` call site
(same reasoning — the pure formatting function takes the locale as a parameter, doesn't
read global state itself).
Each placeholder page: `<h1>X</h1>` → `<h1>{{ '<namespace>.title' | translate }}</h1>`, add
`TranslateModule` to `imports`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel password-strength-meter countdown HomePage NotFoundPage CountdownEmbedPage SettingsPage ArticlesPage`
Expected: PASS.

- [ ] **Step 6: Run the i18n key-parity test one more time**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- i18n-keys.spec.ts`
Expected: PASS — every key introduced across Tasks 7–17 exists in both files with matching structure.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel src/advance-registration/frontend/BAR.App/src/app/shared/password-strength-meter src/advance-registration/frontend/BAR.App/src/app/shared/countdown src/advance-registration/frontend/BAR.App/src/app/features/home src/advance-registration/frontend/BAR.App/src/app/features/not-found src/advance-registration/frontend/BAR.App/src/app/features/countdown-embed src/advance-registration/frontend/BAR.App/src/app/features/settings src/advance-registration/frontend/BAR.App/src/app/features/articles src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json
git commit -m "feat(bar-app): retrofit remaining shared components and placeholder pages onto ngx-translate"
```

---

# Teil D — Responsive-Durchgang

### Task 18: Shared `_breakpoints.scss` + Refactor bestehender Duplikate

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/styles/_breakpoints.scss`
- Modify: `src/advance-registration/frontend/BAR.App/src/styles.scss:9` (add `@use 'styles/breakpoints';`)
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.scss`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.scss`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.scss`
- Modify: `src/advance-registration/frontend/BAR.App/src/styles/_modal.scss`

**Interfaces:**
- Produces: SCSS mixins `tablet` and `mobile` (usable as `@include tablet { ... }` /
  `@include mobile { ... }`) per spec.md §10.1's three-tier breakpoint table (Desktop >1024px
  implicit/default, Tablet ≤1024px, Mobile ≤768px).

This is pure CSS refactoring with no behavior change (verified by the existing Vitest
suite still passing, since no test currently asserts on computed styles) — no new test is
written; instead, Step 4 is a visual smoke-check via the dev server.

- [ ] **Step 1: Create `_breakpoints.scss`**

```scss
@mixin tablet {
  @media (max-width: 1024px) {
    @content;
  }
}

@mixin mobile {
  @media (max-width: 768px) {
    @content;
  }
}
```

- [ ] **Step 2: Import it in `styles.scss`**

Add this line directly after line 9 (`@use 'styles/modal';`):

```scss
@use 'styles/breakpoints';
```

- [ ] **Step 3: Refactor the 4 existing duplicated media queries**

`core/shell/shell.scss` — replace:
```scss
@media (max-width: 768px) {
  .content-body {
    padding: 14px 12px;
  }
}
```
with:
```scss
@include breakpoints.mobile {
  .content-body {
    padding: 14px 12px;
  }
}
```
(and add `@use '../../../styles/breakpoints';` at the top of the file — adjust the relative
path to match this file's actual depth under `src/app/`).

`features/login/components/login-layout.scss` — replace the `@media (max-width: 768px) { ... }`
block wrapping `grid-template-columns: 1fr;` and `&__info { display: none; }` with
`@include breakpoints.mobile { ... }` (same content), plus the matching `@use` import.

`features/profile/pages/ProfilePage.scss` — replace:
```scss
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```
with `@include breakpoints.mobile { .form-grid { grid-template-columns: 1fr; } }`, plus import.

`styles/_modal.scss` — replace:
```scss
@media (max-width: 768px) {
  .p-dialog {
    border-radius: 0;
  }
}
```
with `@include breakpoints.mobile { .p-dialog { border-radius: 0; } }`. Since this file
already lives in `src/styles/`, its `@use` path is `@use 'breakpoints';` (sibling partial,
no relative traversal needed).

- [ ] **Step 4: Smoke-check with the dev server**

Run: `npm --prefix src/advance-registration/frontend/BAR.App start` (or the project's
existing dev-server script), open the app, resize the viewport through 1280px → 1024px →
375px on the login page, a table page (e.g. Sellers) and a modal (e.g. seller-edit-dialog).
Expected: identical visual behavior to before the refactor — this is a pure rename, no new
breakpoint values were introduced yet (that happens in Task 19).

- [ ] **Step 5: Run the full frontend test suite to confirm no regression**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test`
Expected: PASS (no test asserts computed CSS, so this only confirms nothing else broke).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/styles/_breakpoints.scss src/advance-registration/frontend/BAR.App/src/styles.scss src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.scss src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-layout.scss src/advance-registration/frontend/BAR.App/src/app/features/profile/pages/ProfilePage.scss src/advance-registration/frontend/BAR.App/src/styles/_modal.scss
git commit -m "refactor(bar-app): introduce shared breakpoint mixins, dedupe 4 hardcoded 768px queries"
```

---

### Task 19: Manuelle Responsive-Prüfung gegen spec.md §10.1

**Files:** none (verification task — any gaps found get fixed as follow-up edits to the
specific page's `.scss`/`.html`/`.ts` file, committed individually per Step 3 below).

**Interfaces:** none — this task consumes the breakpoint mixins from Task 18 and validates
their application against the normative table in spec.md §10.1:

| Breakpoint | Sidebar | Titelleiste | Modals |
|---|---|---|---|
| Desktop (>1024px) | fest sichtbar | keine | 80% / 90vh |
| Tablet (≤1024px) | Burger-Menü, slide-in | sichtbar | 80% / 90vh |
| Mobile (≤768px) | Burger-Menü, slide-in | sichtbar | 100% / 100vh, kein radius |

Plus: Titelleiste-Hintergrund = Sidebar-Farbe; Sidebar bei `top: 56px` unter der Titelleiste.

- [ ] **Step 1: Start the dev server**

Run: `npm --prefix src/advance-registration/frontend/BAR.App start`

- [ ] **Step 2: Walk every route at 1280px, 1024px and 375px**

For each of the 16 features (login, register, set-password, home, articles, my-articles,
number-blocks, profile, sellers, seller-types, brands, categories, settings, export,
countdown-embed, not-found — the last two and `countdown-embed` may not use the app shell
at all and can be skipped for sidebar/titelleiste checks, but still check any modal they
open), resize the browser to each of the three widths and verify against the table above:
- **Sidebar:** fixed and visible at >1024px; collapses into a burger menu with slide-in
  behavior at ≤1024px (including exactly 1024px) and ≤768px.
- **Titelleiste:** absent at >1024px; present at ≤1024px and ≤768px, background color
  matches the sidebar's, positioned so the sidebar's slide-in starts at `top: 56px`.
- **Modals** (open at least one dialog per feature that has one — seller-create-dialog,
  seller-edit-dialog, artikel-dialog, stammdaten-popup, typ-popup, autocomplete-create):
  80%/90vh at >1024px and ≤1024px; 100%/100vh with no border-radius at ≤768px.

Since Task 18 only introduced the `mobile` (≤768px) mixin plus one still-missing `tablet`
(≤1024px) tier, expect the Tablet-specific behavior (burger menu already at ≤1024px, not
just ≤768px; titelleiste appearing already at ≤1024px) to be **missing** going into this
task — that gap is exactly what this pass finds and fixes.

- [ ] **Step 3: Fix gaps found during the walk**

For each gap (most likely: the shell's sidebar/titelleiste currently only reacts at
≤768px, not ≤1024px), add a `@include breakpoints.tablet { ... }` block to the relevant
component's SCSS (primarily `core/shell/shell.scss` and whatever component renders the
sidebar/titelleiste — read that component when this step is reached, since its exact
current implementation wasn't part of this plan's research scope) implementing the Tablet
row of the table, keeping the existing `@include breakpoints.mobile { ... }` block for the
Mobile-specific overrides (100%/100vh modals, no radius) layered on top. Commit each
feature's fix separately as it's found and fixed:

```bash
git add <changed files for this feature>
git commit -m "fix(bar-app): apply tablet breakpoint behavior to <feature> per spec.md §10.1"
```

- [ ] **Step 4: Final full-suite check**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test`
Expected: PASS.

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- i18n-keys.spec.ts`
Expected: PASS (confirms Teil C didn't regress during this pass, e.g. if any translate key
was touched while fixing a template for responsive reasons).

---

## Nach Abschluss

Roadmap-Fertig-Kriterien 1–6 aus `R12-export-und-auslieferung.md` sind damit erfüllbar
(1–4 Export, 5 i18n, 6 Responsive). Kriterien 7 (Demo-Hinweis in Produktion entfernen) und 8
(Zielumgebung) bleiben für den separaten Deployment-Auftrag, wie in der Spec festgehalten.
