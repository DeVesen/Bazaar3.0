# Plan R10 — Dashboards (Voranmelde-App) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Home-Dashboard for the Voranmelde-App — a seller view (4 KPI tiles, Verkäufernummer-Karte, Info-Panel) and an admin view (5 KPI tiles, 12-week activity heatmap, Info-Panel), switched by the already-existing role-toggle without re-login.

**Architecture:** Backend adds two authenticated Read-Model endpoints (`GET /api/home/seller`, `GET /api/home/admin`) via a new `IHomeQueries` port with a direct-EF implementation (no repository indirection, consistent with `IArticleQueries`/`ISellerListQuery`). Frontend adds two new shared, dumb, PrimeNG-based components (`kpi-tile`/`kpi-grid`, `activity-heatmap`), extends the existing `countdown` component with a `'kpi'` variant, and rewrites the `HomePage` stub to orchestrate role-toggle-driven data fetching and grid composition. Dates and `infoText` are deliberately **not** duplicated in the new endpoints — both views call the existing `GET /api/public/info` for those.

**Tech Stack:** .NET (ASP.NET Core minimal APIs, EF Core/Npgsql, xUnit + Moq), Angular (standalone components, signals, PrimeNG, Vitest).

**Spec:**
- [`docs/requirements/advance-registration/roadmap/R10-dashboards.md`](../../requirements/advance-registration/roadmap/R10-dashboards.md)
- [`docs/requirements/advance-registration/epics/Epic_Home_Verkaeufer/epic.md`](../../requirements/advance-registration/epics/Epic_Home_Verkaeufer/epic.md)
- [`docs/requirements/advance-registration/epics/Epic_Home_Admin/epic.md`](../../requirements/advance-registration/epics/Epic_Home_Admin/epic.md)
- [`docs/requirements/advance-registration/api/home.md`](../../requirements/advance-registration/api/home.md)
- [`docs/requirements/advance-registration/api/public.md`](../../requirements/advance-registration/api/public.md)
- [`docs/requirements/advance-registration/components/home-dashboard.md`](../../requirements/advance-registration/components/home-dashboard.md)
- [`docs/requirements/advance-registration/components/verkaeufer-nummer.md`](../../requirements/advance-registration/components/verkaeufer-nummer.md)
- [`docs/components/kpi-tile/component.md`](../../components/kpi-tile/component.md)
- [`docs/components/activity-heatmap/component.md`](../../components/activity-heatmap/component.md)
- [`docs/components/countdown/component.md`](../../components/countdown/component.md)

## Global Constraints

- PrimeNG only, no native HTML controls, no other UI libraries (CLAUDE.md PrimeNG-Grundregel).
- Backend: hexagonal, four projects (`BAR.Domain`/`BAR.Application`/`BAR.Infrastructure`/`BAR.Host`), assembly prefix `BAR.`.
- Frontend: Feature-First (`features/<feature>/`, `core/`, `shared/`).
- Read-Models bypass repositories — direct EF/SQL access in `BAR.Infrastructure` via a dedicated Query-Port (`api/home.md`).
- `GET /api/home/seller`/`GET /api/home/admin` never return the 5 Basar-Termine or `infoText` — both come exclusively from `GET /api/public/info` (DRY decision, `api/home.md`).
- `GET /api/home/seller` does not check role — an admin in seller-mode gets their own seller data (`api/home.md` "Role-Toggle").
- `heatmapData` window is server-fixed at 12 weeks, no query parameter (`api/home.md`).
- `kpi-tile`/`kpi-grid`/`activity-heatmap` are dumb components: `@Input()` only, no `@Output()`, no HTTP, no store.
- Code, routes, JSON contract: English. Docs/UI copy: German.
- Doku deutsch, UI DE/EN, Code englisch (Bazaar language convention).

---

## Task 1: Backend — `IHomeQueries` port

**Files:**
- Create: `src/advance-registration/backend/BAR.Domain/Ports/Queries/IHomeQueries.cs`

**Interfaces:**
- Produces: `SellerHomeData(int ArticleCount, decimal CommissionRate, decimal ItemFee)`, `AdminHomeData(int SellerCount, int ArticleCount, int CategoryCount, int BrandCount, IReadOnlyList<HeatmapDay> HeatmapData)`, `HeatmapDay(DateOnly Date, int Count)`, `IHomeQueries.GetSellerHomeAsync(string sellerId, CancellationToken) : Task<SellerHomeData?>`, `IHomeQueries.GetAdminHomeAsync(DateTime heatmapSince, CancellationToken) : Task<AdminHomeData>` — consumed by Task 2 (implementation) and Task 3 (handlers).

This is a pure interface/record file — no test needed (matches `IArticleQueries.cs`/`ISellerListQuery.cs`, neither of which has a dedicated test file).

- [ ] **Step 1: Create the port file**

```csharp
namespace BAR.Domain.Ports.Queries;

public sealed record SellerHomeData(int ArticleCount, decimal CommissionRate, decimal ItemFee);

public sealed record HeatmapDay(DateOnly Date, int Count);

public sealed record AdminHomeData(
    int SellerCount,
    int ArticleCount,
    int CategoryCount,
    int BrandCount,
    IReadOnlyList<HeatmapDay> HeatmapData);

public interface IHomeQueries
{
    Task<SellerHomeData?> GetSellerHomeAsync(string sellerId, CancellationToken cancellationToken);

    Task<AdminHomeData> GetAdminHomeAsync(DateTime heatmapSince, CancellationToken cancellationToken);
}
```

- [ ] **Step 2: Build to confirm it compiles**

Run: `dotnet build src/advance-registration/backend/BAR.Domain/BAR.Domain.csproj`
Expected: Build succeeded.

- [ ] **Step 3: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/Queries/IHomeQueries.cs
git commit -m "feat(bar-backend): add IHomeQueries read-model port"
```

---

## Task 2: Backend — `HomeQueries` implementation + integration test

**Files:**
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/HomeQueries.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/HomeQueriesTests.cs`

**Interfaces:**
- Consumes: `IHomeQueries`, `SellerHomeData`, `HeatmapDay`, `AdminHomeData` (Task 1); `BarDbContext` (`dbContext.Sellers`, `dbContext.SellerTypes`, `dbContext.Articles`, `dbContext.Categories`, `dbContext.Brands`).
- Produces: `HomeQueries` class implementing `IHomeQueries`, registered in Task 4's DI step.

This is a Postgres-backed integration test (same fixture as `ArticleQueriesTests.cs`), so tests are written against the real implementation directly — no separate "write failing test first with a stub" cycle makes sense here (there's nothing to stub against); write the implementation and its test together, then verify both compile and pass.

- [ ] **Step 1: Write `HomeQueries.cs`**

```csharp
using BAR.Domain.Ports.Queries;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class HomeQueries(BarDbContext dbContext) : IHomeQueries
{
    public async Task<SellerHomeData?> GetSellerHomeAsync(string sellerId, CancellationToken cancellationToken)
    {
        var typeInfo = await (
            from seller in dbContext.Sellers
            join type in dbContext.SellerTypes on seller.SellerTypeId equals type.Id
            where seller.Id == sellerId
            select new { type.CommissionRate, type.ItemFee })
            .SingleOrDefaultAsync(cancellationToken);

        if (typeInfo is null)
        {
            return null;
        }

        var articleCount = await dbContext.Articles.CountAsync(a => a.SellerId == sellerId, cancellationToken);

        return new SellerHomeData(articleCount, typeInfo.CommissionRate, typeInfo.ItemFee);
    }

    public async Task<AdminHomeData> GetAdminHomeAsync(DateTime heatmapSince, CancellationToken cancellationToken)
    {
        var sellerCount = await dbContext.Sellers.CountAsync(cancellationToken);
        var articleCount = await dbContext.Articles.CountAsync(cancellationToken);
        var categoryCount = await dbContext.Categories.CountAsync(cancellationToken);
        var brandCount = await dbContext.Brands.CountAsync(cancellationToken);

        var createdDates = dbContext.Articles
            .Where(a => a.CreatedAt >= heatmapSince)
            .Select(a => a.CreatedAt.Date);
        var updatedDates = dbContext.Articles
            .Where(a => a.UpdatedAt >= heatmapSince)
            .Select(a => a.UpdatedAt.Date);

        var counts = await createdDates.Concat(updatedDates)
            .GroupBy(date => date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var heatmapData = counts
            .Select(c => new HeatmapDay(DateOnly.FromDateTime(c.Date), c.Count))
            .OrderBy(d => d.Date)
            .ToList();

        return new AdminHomeData(sellerCount, articleCount, categoryCount, brandCount, heatmapData);
    }
}
```

- [ ] **Step 2: Write `HomeQueriesTests.cs`**

```csharp
using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class HomeQueriesTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public HomeQueriesTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task GetSellerHomeAsync_KnownSeller_ReturnsArticleCountAndResolvedType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Domain.Sellers.Seller.Register("Anna", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 4001, "A1", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 4002, "A2", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);

        var result = await queries.GetSellerHomeAsync(seller.Id, ct);

        Assert.NotNull(result);
        Assert.Equal(2, result!.ArticleCount);
        Assert.Equal(15.0m, result.CommissionRate);
        Assert.Equal(0.5m, result.ItemFee);
    }

    [Fact]
    public async Task GetSellerHomeAsync_UnknownSeller_ReturnsNull()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();

        var result = await queries.GetSellerHomeAsync("unknown1", TestContext.Current.CancellationToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAdminHomeAsync_CountsSellersArticlesCategoriesBrandsAndBuildsHeatmap()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Domain.Sellers.Seller.Register("Bert", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 5001, "A1", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);

        var result = await queries.GetAdminHomeAsync(Now.AddDays(-84), ct);

        Assert.True(result.SellerCount >= 1);
        Assert.True(result.ArticleCount >= 1);
        Assert.Contains(result.HeatmapData, d => d.Date == DateOnly.FromDateTime(Now.Date) && d.Count >= 1);
    }

    [Fact]
    public async Task GetAdminHomeAsync_ArticleOutsideWindow_ExcludedFromHeatmap()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();
        var ct = TestContext.Current.CancellationToken;

        var oldDate = Now.AddDays(-200);
        var seller = Domain.Sellers.Seller.Register("Clara", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 6001, "Alt", "Nike", "Schuhe", 1m, null, null, null, oldDate), null, ct);

        var result = await queries.GetAdminHomeAsync(Now.AddDays(-84), ct);

        Assert.DoesNotContain(result.HeatmapData, d => d.Date == DateOnly.FromDateTime(oldDate.Date));
    }
}
```

- [ ] **Step 3: Run the new tests (expected to fail — `IHomeQueries` not yet registered in DI)**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "FullyQualifiedName~HomeQueriesTests"`
Expected: FAIL — `InvalidOperationException: No service for type 'IHomeQueries' has been registered.`

- [ ] **Step 4: Register `IHomeQueries` in DI**

In `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`, add near the other query registrations:

```csharp
using BAR.Infrastructure.Persistence.Queries; // already imported — no change needed if present
```

Add this line directly below `services.AddScoped<ISellerListQuery, SellerListQuery>();`:

```csharp
services.AddScoped<IHomeQueries, HomeQueries>();
```

- [ ] **Step 5: Run the tests again to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "FullyQualifiedName~HomeQueriesTests"`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/HomeQueries.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/HomeQueriesTests.cs
git commit -m "feat(bar-backend): implement IHomeQueries via direct EF access"
```

---

## Task 3: Backend — `GetSellerHomeQueryHandler` + `GetAdminHomeQueryHandler`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Home/GetSellerHome/SellerHomeResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Home/GetSellerHome/GetSellerHomeQueryHandler.cs`
- Create: `src/advance-registration/backend/BAR.Application/Home/GetAdminHome/AdminHomeResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Home/GetAdminHome/GetAdminHomeQueryHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Home/GetSellerHome/GetSellerHomeQueryHandlerTests.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Home/GetAdminHome/GetAdminHomeQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `IHomeQueries` (Task 1/2), `IClock` (`BAR.Application.Abstractions`, existing — `UtcNow` property), `NotFoundException` (`BAR.Domain.Exceptions`, existing, ctor `(string code, string message)`).
- Produces: `SellerHomeResult(int ArticleCount, TypeConditionsResult TypeConditions)`, `TypeConditionsResult(decimal CommissionRate, decimal ItemFee)`, `GetSellerHomeQueryHandler.HandleAsync(string sellerId, CancellationToken) : Task<SellerHomeResult>` — consumed by Task 4's endpoint. `AdminHomeResult(int SellerCount, int ArticleCount, int CategoryCount, int BrandCount, IReadOnlyList<HeatmapEntryResult> HeatmapData)`, `HeatmapEntryResult(DateOnly Date, int Count)`, `GetAdminHomeQueryHandler.HandleAsync(CancellationToken) : Task<AdminHomeResult>` — consumed by Task 4's endpoint.

### Part A — Seller handler

- [ ] **Step 1: Write the failing test**

```csharp
// src/advance-registration/backend/tests/BAR.Application.UnitTests/Home/GetSellerHome/GetSellerHomeQueryHandlerTests.cs
using BAR.Application.Home.GetSellerHome;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Home.GetSellerHome;

public class GetSellerHomeQueryHandlerTests
{
    private readonly Mock<IHomeQueries> _homeQueries = new();

    private GetSellerHomeQueryHandler CreateHandler() => new(_homeQueries.Object);

    [Fact]
    public async Task HandleAsync_KnownSeller_ReturnsArticleCountAndTypeConditions()
    {
        _homeQueries.Setup(q => q.GetSellerHomeAsync("s0000001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerHomeData(12, 15.0m, 0.5m));

        var result = await CreateHandler().HandleAsync("s0000001", TestContext.Current.CancellationToken);

        Assert.Equal(12, result.ArticleCount);
        Assert.Equal(15.0m, result.TypeConditions.CommissionRate);
        Assert.Equal(0.5m, result.TypeConditions.ItemFee);
    }

    [Fact]
    public async Task HandleAsync_UnknownSeller_ThrowsNotFound()
    {
        _homeQueries.Setup(q => q.GetSellerHomeAsync("unknown1", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SellerHomeData?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => CreateHandler().HandleAsync("unknown1", TestContext.Current.CancellationToken));
    }
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter "FullyQualifiedName~GetSellerHomeQueryHandlerTests"`
Expected: FAIL to compile — `GetSellerHomeQueryHandler`/`SellerHomeResult` don't exist yet.

- [ ] **Step 3: Write `SellerHomeResult.cs`**

```csharp
namespace BAR.Application.Home.GetSellerHome;

public sealed record TypeConditionsResult(decimal CommissionRate, decimal ItemFee);

public sealed record SellerHomeResult(int ArticleCount, TypeConditionsResult TypeConditions);
```

- [ ] **Step 4: Write `GetSellerHomeQueryHandler.cs`**

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Home.GetSellerHome;

public sealed class GetSellerHomeQueryHandler(IHomeQueries homeQueries)
{
    public async Task<SellerHomeResult> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var data = await homeQueries.GetSellerHomeAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        return new SellerHomeResult(data.ArticleCount, new TypeConditionsResult(data.CommissionRate, data.ItemFee));
    }
}
```

- [ ] **Step 5: Run the test again to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter "FullyQualifiedName~GetSellerHomeQueryHandlerTests"`
Expected: PASS (2 tests).

### Part B — Admin handler

- [ ] **Step 6: Write the failing test**

```csharp
// src/advance-registration/backend/tests/BAR.Application.UnitTests/Home/GetAdminHome/GetAdminHomeQueryHandlerTests.cs
using BAR.Application.Abstractions;
using BAR.Application.Home.GetAdminHome;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Home.GetAdminHome;

public class GetAdminHomeQueryHandlerTests
{
    private readonly Mock<IHomeQueries> _homeQueries = new();
    private readonly Mock<IClock> _clock = new();

    private GetAdminHomeQueryHandler CreateHandler() => new(_homeQueries.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_ReturnsCountsAndHeatmapFromQueries()
    {
        var now = new DateTime(2026, 9, 10, 8, 0, 0, DateTimeKind.Utc);
        _clock.Setup(c => c.UtcNow).Returns(now);
        var expectedSince = now.Date.AddDays(-84);
        _homeQueries.Setup(q => q.GetAdminHomeAsync(expectedSince, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AdminHomeData(84, 1372, 14, 63,
                [new HeatmapDay(new DateOnly(2026, 9, 9), 7)]));

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(84, result.SellerCount);
        Assert.Equal(1372, result.ArticleCount);
        Assert.Equal(14, result.CategoryCount);
        Assert.Equal(63, result.BrandCount);
        Assert.Single(result.HeatmapData);
        Assert.Equal(new DateOnly(2026, 9, 9), result.HeatmapData[0].Date);
        Assert.Equal(7, result.HeatmapData[0].Count);
    }
}
```

- [ ] **Step 7: Run it to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter "FullyQualifiedName~GetAdminHomeQueryHandlerTests"`
Expected: FAIL to compile — `GetAdminHomeQueryHandler`/`AdminHomeResult` don't exist yet.

- [ ] **Step 8: Write `AdminHomeResult.cs`**

```csharp
namespace BAR.Application.Home.GetAdminHome;

public sealed record HeatmapEntryResult(DateOnly Date, int Count);

public sealed record AdminHomeResult(
    int SellerCount,
    int ArticleCount,
    int CategoryCount,
    int BrandCount,
    IReadOnlyList<HeatmapEntryResult> HeatmapData);
```

- [ ] **Step 9: Write `GetAdminHomeQueryHandler.cs`**

```csharp
using BAR.Application.Abstractions;
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Home.GetAdminHome;

public sealed class GetAdminHomeQueryHandler(IHomeQueries homeQueries, IClock clock)
{
    private const int HeatmapWeeks = 12;

    public async Task<AdminHomeResult> HandleAsync(CancellationToken cancellationToken)
    {
        var since = clock.UtcNow.Date.AddDays(-(HeatmapWeeks * 7));
        var data = await homeQueries.GetAdminHomeAsync(since, cancellationToken);

        return new AdminHomeResult(
            data.SellerCount,
            data.ArticleCount,
            data.CategoryCount,
            data.BrandCount,
            data.HeatmapData.Select(d => new HeatmapEntryResult(d.Date, d.Count)).ToList());
    }
}
```

- [ ] **Step 10: Run the test again to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter "FullyQualifiedName~GetAdminHomeQueryHandlerTests"`
Expected: PASS (1 test).

- [ ] **Step 11: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Home src/advance-registration/backend/tests/BAR.Application.UnitTests/Home
git commit -m "feat(bar-backend): add GetSellerHomeQueryHandler and GetAdminHomeQueryHandler"
```

---

## Task 4: Backend — `HomeEndpoints` + DI + `Program.cs` wiring + integration tests

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/Home/HomeEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Home/HomeEndpointsTests.cs`

**Interfaces:**
- Consumes: `GetSellerHomeQueryHandler`, `GetAdminHomeQueryHandler` (Task 3); `ClaimsPrincipal.FindFirstValue("sub")` (existing convention, see `ProfileEndpoints.cs`).
- Produces: `GET /api/home/seller` (`RequireAuthorization()`), `GET /api/home/admin` (`RequireAuthorization("admin")`), mapped via `MapHomeEndpoints()`.

- [ ] **Step 1: Write the failing integration test**

```csharp
// src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Home/HomeEndpointsTests.cs
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Home;

public class HomeEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public HomeEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetSellerHome_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/home/seller", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetSellerHome_AfterRegistration_ReturnsZeroArticlesAndResolvedType()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/home/seller", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<SellerHomePayload>(TestContext.Current.CancellationToken);
        Assert.Equal(0, body!.ArticleCount);
        Assert.Equal(15.0m, body.TypeConditions.CommissionRate);
    }

    [Fact]
    public async Task GetAdminHome_AsSeller_Returns403()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/home/admin", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetAdminHome_AsAdmin_ReturnsCounts()
    {
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.GetAsync("/api/home/admin", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<AdminHomePayload>(TestContext.Current.CancellationToken);
        Assert.True(body!.SellerCount >= 1);
    }

    private async Task<HttpClient> RegisterAndAuthenticateAsync()
    {
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

    private async Task<HttpClient> AuthenticateAsAdminAsync()
    {
        var client = _factory.CreateClient();
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@bazaar.local", password = "Admin123!"
        }, TestContext.Current.CancellationToken);
        var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        return client;
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record TypeConditionsPayload(decimal CommissionRate, decimal ItemFee);
    private sealed record SellerHomePayload(int ArticleCount, TypeConditionsPayload TypeConditions);
    private sealed record AdminHomePayload(int SellerCount, int ArticleCount, int CategoryCount, int BrandCount);
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "FullyQualifiedName~HomeEndpointsTests"`
Expected: FAIL — routes `/api/home/seller`/`/api/home/admin` don't exist (404), or compile error if `HomeEndpoints` type is referenced elsewhere. At this point it's a 404, not a compile error, since the test itself has no dependency on `HomeEndpoints`.

- [ ] **Step 3: Write `HomeEndpoints.cs`**

```csharp
using System.Security.Claims;
using BAR.Application.Home.GetAdminHome;
using BAR.Application.Home.GetSellerHome;

namespace BAR.Host.Features.Home;

public static class HomeEndpoints
{
    public static IEndpointRouteBuilder MapHomeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/home/seller", async (ClaimsPrincipal user, GetSellerHomeQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapGet("/api/home/admin", async (GetAdminHomeQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct)))
            .RequireAuthorization("admin");

        return app;
    }
}
```

- [ ] **Step 4: Register the two handlers in DI**

In `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`, add these `using` statements near the other `BAR.Application.*` usings:

```csharp
using BAR.Application.Home.GetAdminHome;
using BAR.Application.Home.GetSellerHome;
```

Add these two lines directly below `services.AddScoped<GetProfileQueryHandler>();`:

```csharp
services.AddScoped<GetSellerHomeQueryHandler>();
services.AddScoped<GetAdminHomeQueryHandler>();
```

- [ ] **Step 5: Wire the endpoint mapping in `Program.cs`**

Add the using:

```csharp
using BAR.Host.Features.Home;
```

Add this line directly below `app.MapProfileEndpoints();`:

```csharp
app.MapHomeEndpoints();
```

- [ ] **Step 6: Run the tests again to verify they pass**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter "FullyQualifiedName~HomeEndpointsTests"`
Expected: PASS (4 tests).

- [ ] **Step 7: Run the full backend test suite to check for regressions**

Run: `dotnet test src/advance-registration/backend`
Expected: PASS, no regressions.

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/Home src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Home
git commit -m "feat(bar-backend): wire GET /api/home/seller and GET /api/home/admin"
```

**Backend is done after this task** — both endpoints exist, are authorized correctly, and return the exact JSON shape from `api/home.md`.

---

## Task 5: Frontend — `kpi-tile` + `kpi-grid` shared components

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-tile.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-tile.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-grid.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-grid.spec.ts`

**Interfaces:**
- Produces: `KpiTile` component, selector `app-kpi-tile`, inputs `label: string`, `value: string | number | null`, `subLabel?: string`, `severity?: 'success' | 'warning' | 'danger' | 'info' | null`. `KpiGrid` component, selector `app-kpi-grid`, input `columns: 3 | 4 | 5 | 6`, projects `ng-content`. Consumed by Task 9 (`HomePage`).

- [ ] **Step 1: Write the failing test for `KpiTile`**

```typescript
// src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-tile.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { KpiTile } from './kpi-tile';

describe('KpiTile', () => {
  let fixture: ComponentFixture<KpiTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KpiTile] }).compileComponents();
    fixture = TestBed.createComponent(KpiTile);
  });

  it('shows label, value and subLabel', () => {
    fixture.componentRef.setInput('label', 'Meine Artikel');
    fixture.componentRef.setInput('value', 12);
    fixture.componentRef.setInput('subLabel', 'Stück');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Meine Artikel');
    expect(text).toContain('12');
    expect(text).toContain('Stück');
  });

  it('shows a dash when value is null', () => {
    fixture.componentRef.setInput('label', 'Leer');
    fixture.componentRef.setInput('value', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('—');
  });

  it('applies a severity class when severity is set', () => {
    fixture.componentRef.setInput('label', 'Status');
    fixture.componentRef.setInput('value', 1);
    fixture.componentRef.setInput('severity', 'success');
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('.kpi-tile');
    expect(host.classList.contains('kpi-tile--success')).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- kpi-tile.spec.ts`
Expected: FAIL — `kpi-tile.ts` doesn't exist yet.

- [ ] **Step 3: Write `kpi-tile.ts`**

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type KpiSeverity = 'success' | 'warning' | 'danger' | 'info' | null;

@Component({
  selector: 'app-kpi-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-tile" [class.kpi-tile--success]="severity() === 'success'"
         [class.kpi-tile--warning]="severity() === 'warning'"
         [class.kpi-tile--danger]="severity() === 'danger'"
         [class.kpi-tile--info]="severity() === 'info'">
      <p class="kpi-tile__label">{{ label() }}</p>
      <p class="kpi-tile__value">{{ value() ?? '—' }}</p>
      @if (subLabel()) {
        <p class="kpi-tile__sub-label">{{ subLabel() }}</p>
      }
    </div>
  `,
  styles: [`
    .kpi-tile {
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .kpi-tile--success { border-top: 3px solid var(--p-green-500); }
    .kpi-tile--warning { border-top: 3px solid var(--p-orange-400); }
    .kpi-tile--danger { border-top: 3px solid var(--p-red-500); }
    .kpi-tile--info { border-top: 3px solid var(--p-blue-500); }
    .kpi-tile__label { font: 600 11px sans-serif; text-transform: uppercase; letter-spacing: 0.5px; color: var(--muted); margin: 0; }
    .kpi-tile__value { font: 800 28px sans-serif; color: #0f1f30; margin: 4px 0 0; }
    .kpi-tile__sub-label { font-size: 12px; color: var(--muted); margin: 2px 0 0; }
  `]
})
export class KpiTile {
  readonly label = input.required<string>();
  readonly value = input<string | number | null>(null);
  readonly subLabel = input<string | null>(null);
  readonly severity = input<KpiSeverity>(null);
}
```

- [ ] **Step 4: Run the test again to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- kpi-tile.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing test for `KpiGrid`**

```typescript
// src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-grid.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { KpiGrid } from './kpi-grid';

@Component({
  imports: [KpiGrid],
  template: `<app-kpi-grid [columns]="5"><div class="probe">A</div></app-kpi-grid>`
})
class HostComponent {}

describe('KpiGrid', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('applies the columns class and projects content', () => {
    const grid = fixture.nativeElement.querySelector('.kpi-grid');
    expect(grid.classList.contains('kpi-grid--c5')).toBe(true);
    expect(fixture.nativeElement.querySelector('.probe').textContent).toBe('A');
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- kpi-grid.spec.ts`
Expected: FAIL — `kpi-grid.ts` doesn't exist yet.

- [ ] **Step 7: Write `kpi-grid.ts`**

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-kpi-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="kpi-grid"
         [class.kpi-grid--c3]="columns() === 3"
         [class.kpi-grid--c4]="columns() === 4"
         [class.kpi-grid--c5]="columns() === 5"
         [class.kpi-grid--c6]="columns() === 6">
      <ng-content />
    </div>
  `,
  styles: [`
    .kpi-grid { display: grid; gap: 12px; }
    .kpi-grid--c3 { grid-template-columns: repeat(3, 1fr); }
    .kpi-grid--c4 { grid-template-columns: repeat(4, 1fr); }
    .kpi-grid--c5 { grid-template-columns: repeat(5, 1fr); }
    .kpi-grid--c6 { grid-template-columns: repeat(6, 1fr); }
    @media (max-width: 1023px) {
      .kpi-grid { grid-template-columns: repeat(3, 1fr) !important; }
    }
    @media (max-width: 767px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
  `]
})
export class KpiGrid {
  readonly columns = input.required<3 | 4 | 5 | 6>();
}
```

- [ ] **Step 8: Run the test again to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- kpi-grid.spec.ts`
Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile
git commit -m "feat(bar-app): add shared kpi-tile and kpi-grid components"
```

---

## Task 6: Frontend — `activity-heatmap` shared component

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/activity-heatmap/heatmap-grid.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/activity-heatmap/heatmap-grid.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/activity-heatmap/activity-heatmap.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/activity-heatmap/activity-heatmap.spec.ts`

**Interfaces:**
- Produces: `HeatmapEntry { date: string; count: number }` type, pure function `buildHeatmapGrid(events: HeatmapEntry[], today?: Date): HeatmapCell[][]` (7 rows × 12 columns, `HeatmapCell { date: string; count: number; level: 0|1|2|3|4 }`), `ActivityHeatmap` component, selector `app-activity-heatmap`, input `events: HeatmapEntry[]`. Consumed by Task 9 (`HomePage`, admin view only).

The grid-building logic (dates, levels, week/day layout) is pure and easiest to TDD in isolation before wiring it into the component template — split into `heatmap-grid.ts` (logic) + `activity-heatmap.ts` (rendering), same split style as `countdown`'s `format-countdown.ts`/`select-active-phase.ts` helpers.

- [ ] **Step 1: Write the failing test for the grid-building logic**

```typescript
// src/advance-registration/frontend/BAR.App/src/app/shared/activity-heatmap/heatmap-grid.spec.ts
import { describe, it, expect } from 'vitest';
import { buildHeatmapGrid } from './heatmap-grid';

describe('buildHeatmapGrid', () => {
  it('returns 7 rows (Mo-So) and 12 columns (weeks)', () => {
    const grid = buildHeatmapGrid([], new Date('2026-09-10T12:00:00Z'));

    expect(grid.length).toBe(7);
    for (const row of grid) {
      expect(row.length).toBe(12);
    }
  });

  it('starts the grid on the Monday 12 weeks back and ends today', () => {
    const today = new Date('2026-09-10T12:00:00Z'); // Thursday
    const grid = buildHeatmapGrid([], today);

    expect(grid[0][0].date).toBe('2026-06-22'); // Monday, 12 weeks back
    expect(grid[3][11].date).toBe('2026-09-10'); // Thursday, last column, today
  });

  it('maps a matching event date to the right cell with count', () => {
    const today = new Date('2026-09-10T12:00:00Z');
    const grid = buildHeatmapGrid([{ date: '2026-09-10', count: 7 }], today);

    const cell = grid.flat().find((c) => c.date === '2026-09-10')!;
    expect(cell.count).toBe(7);
  });

  it('defaults missing days to count 0 and level 0', () => {
    const today = new Date('2026-09-10T12:00:00Z');
    const grid = buildHeatmapGrid([], today);

    const cell = grid.flat().find((c) => c.date === '2026-09-10')!;
    expect(cell.count).toBe(0);
    expect(cell.level).toBe(0);
  });

  it.each([
    [0, 0], [1, 1], [4, 1], [5, 2], [9, 2], [10, 3], [19, 3], [20, 4], [50, 4]
  ])('maps count %i to level %i', (count, level) => {
    const today = new Date('2026-09-10T12:00:00Z');
    const grid = buildHeatmapGrid([{ date: '2026-09-10', count }], today);

    const cell = grid.flat().find((c) => c.date === '2026-09-10')!;
    expect(cell.level).toBe(level);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- heatmap-grid.spec.ts`
Expected: FAIL — `heatmap-grid.ts` doesn't exist yet.

- [ ] **Step 3: Write `heatmap-grid.ts`**

```typescript
export interface HeatmapEntry {
  date: string; // ISO 'YYYY-MM-DD'
  count: number;
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  date: string;
  count: number;
  level: HeatmapLevel;
}

const WEEKS = 12;
const DAYS_PER_WEEK = 7;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function levelFor(count: number): HeatmapLevel {
  if (count >= 20) return 4;
  if (count >= 10) return 3;
  if (count >= 5) return 2;
  if (count >= 1) return 1;
  return 0;
}

/** Grid rows: index 0 = Monday ... index 6 = Sunday. Columns: oldest week first, today's week last. */
export function buildHeatmapGrid(events: HeatmapEntry[], today: Date = new Date()): HeatmapCell[][] {
  const countsByDate = new Map(events.map((e) => [e.date, e.count]));

  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const isoWeekday = todayUtc.getUTCDay() === 0 ? 7 : todayUtc.getUTCDay(); // Mon=1..Sun=7
  const currentWeekMonday = new Date(todayUtc);
  currentWeekMonday.setUTCDate(todayUtc.getUTCDate() - (isoWeekday - 1));

  const gridStartMonday = new Date(currentWeekMonday);
  gridStartMonday.setUTCDate(currentWeekMonday.getUTCDate() - (WEEKS - 1) * DAYS_PER_WEEK);

  const grid: HeatmapCell[][] = Array.from({ length: DAYS_PER_WEEK }, () => []);

  for (let week = 0; week < WEEKS; week++) {
    for (let day = 0; day < DAYS_PER_WEEK; day++) {
      const cellDate = new Date(gridStartMonday);
      cellDate.setUTCDate(gridStartMonday.getUTCDate() + week * DAYS_PER_WEEK + day);
      const iso = toIsoDate(cellDate);
      const count = countsByDate.get(iso) ?? 0;
      grid[day][week] = { date: iso, count, level: levelFor(count) };
    }
  }

  return grid;
}
```

- [ ] **Step 4: Run the test again to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- heatmap-grid.spec.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Write the failing test for the `ActivityHeatmap` component**

```typescript
// src/advance-registration/frontend/BAR.App/src/app/shared/activity-heatmap/activity-heatmap.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ActivityHeatmap } from './activity-heatmap';

describe('ActivityHeatmap', () => {
  let fixture: ComponentFixture<ActivityHeatmap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ActivityHeatmap] }).compileComponents();
    fixture = TestBed.createComponent(ActivityHeatmap);
    fixture.componentRef.setInput('events', [{ date: '2026-09-10', count: 7 }]);
    fixture.detectChanges();
  });

  it('renders 84 cells', () => {
    const cells = fixture.nativeElement.querySelectorAll('.activity-heatmap__cell');
    expect(cells.length).toBe(84);
  });

  it('renders inside a horizontally scrollable container', () => {
    const container = fixture.nativeElement.querySelector('.activity-heatmap');
    expect(getComputedStyle(container).overflowX).toBe('auto');
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- activity-heatmap.spec.ts`
Expected: FAIL — `activity-heatmap.ts` doesn't exist yet.

- [ ] **Step 7: Write `activity-heatmap.ts`**

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { buildHeatmapGrid, HeatmapEntry } from './heatmap-grid';

const WEEKDAY_LABELS = ['Mo', '', 'Mi', '', 'Fr', '', ''];

function formatTooltip(dateIso: string, count: number): string {
  const date = new Date(`${dateIso}T00:00:00Z`);
  const weekday = new Intl.DateTimeFormat('de-DE', { weekday: 'long', timeZone: 'UTC' }).format(date);
  const formattedDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date);
  const label = count === 0 ? 'Keine Aktivität' : count === 1 ? '1 Aktivität' : `${count} Aktivitäten`;
  return `${weekday}, ${formattedDate}\n${label}`;
}

@Component({
  selector: 'app-activity-heatmap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TooltipModule],
  template: `
    <div class="activity-heatmap">
      <div class="activity-heatmap__header">
        <p class="activity-heatmap__title">Aktivität — letzte 12 Wochen</p>
        <div class="activity-heatmap__legend">
          <span>Weniger</span>
          @for (level of [0, 1, 2, 3, 4]; track level) {
            <span class="activity-heatmap__legend-cell activity-heatmap__cell--l{{ level }}"></span>
          }
          <span>Mehr</span>
        </div>
      </div>
      <div class="activity-heatmap__grid">
        @for (row of rows(); track $index; let rowIndex = $index) {
          <span class="activity-heatmap__weekday-label">{{ weekdayLabel(rowIndex) }}</span>
          @for (cell of row; track cell.date) {
            <span class="activity-heatmap__cell activity-heatmap__cell--l{{ cell.level }}"
                  [pTooltip]="tooltipFor(cell.date, cell.count)" tooltipPosition="top"></span>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .activity-heatmap { overflow-x: auto; }
    .activity-heatmap__header { display: flex; justify-content: space-between; align-items: center; }
    .activity-heatmap__title { font: 700 13px sans-serif; margin: 0; }
    .activity-heatmap__legend { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted); }
    .activity-heatmap__legend-cell { width: 10px; height: 10px; border-radius: 2px; }
    .activity-heatmap__grid { display: grid; grid-template-columns: 20px repeat(12, 12px); gap: 3px; margin-top: 8px; min-width: 180px; }
    .activity-heatmap__weekday-label { font-size: 10px; color: var(--muted); align-self: center; }
    .activity-heatmap__cell { width: 12px; height: 12px; border-radius: 2px; }
    .activity-heatmap__cell--l0 { background: #ebedf0; }
    .activity-heatmap__cell--l1 { background: #9be9a8; }
    .activity-heatmap__cell--l2 { background: #40c463; }
    .activity-heatmap__cell--l3 { background: #30a14e; }
    .activity-heatmap__cell--l4 { background: #216e39; }
  `]
})
export class ActivityHeatmap {
  readonly events = input<HeatmapEntry[]>([]);

  readonly rows = computed(() => buildHeatmapGrid(this.events()));

  weekdayLabel(rowIndex: number): string {
    return WEEKDAY_LABELS[rowIndex] ?? '';
  }

  tooltipFor(date: string, count: number): string {
    return formatTooltip(date, count);
  }
}
```

- [ ] **Step 8: Run the test again to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- activity-heatmap.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/activity-heatmap
git commit -m "feat(bar-app): add shared activity-heatmap component"
```

---

## Task 7: Frontend — `countdown` `'kpi'` variant

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/countdown/countdown.scss`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/countdown/countdown.spec.ts` (create if it doesn't exist yet; extend if it does)

**Interfaces:**
- Consumes: existing `Countdown` component (`shared/countdown/countdown.ts`), unchanged `phases`/`variant` inputs.
- Produces: `.countdown--kpi` CSS block so `variant="kpi"` renders correctly. No TypeScript/template change needed — `countdown.html` already interpolates `countdown--{{ variant() }}` as the host class.

- [ ] **Step 1: Check whether `countdown.spec.ts` exists**

Run: `ls src/advance-registration/frontend/BAR.App/src/app/shared/countdown/`

If it exists, read it first and add the new test into its existing `describe` block instead of creating a new file. If it does not exist, create it fresh with the content below (adjusted to also cover the pre-existing `'info-box'` behavior if a prior spec is found to not exist at all — in that case keep this file scoped to the new `'kpi'` case only, since `'info-box'` already ships without a spec today).

- [ ] **Step 2: Write the failing test**

```typescript
// src/advance-registration/frontend/BAR.App/src/app/shared/countdown/countdown.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Countdown } from './countdown';

describe('Countdown', () => {
  let fixture: ComponentFixture<Countdown>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-10T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the kpi variant with the kpi host class', async () => {
    await TestBed.configureTestingModule({ imports: [Countdown] }).compileComponents();
    fixture = TestBed.createComponent(Countdown);
    fixture.componentRef.setInput('variant', 'kpi');
    fixture.componentRef.setInput('phases', [{ label: 'BIS ZUM BASAR', targetDate: new Date('2026-09-13T10:00:00Z') }]);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector('.countdown--kpi');
    expect(host).not.toBeNull();
    expect(host.textContent).toContain('BIS ZUM BASAR');
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- countdown.spec.ts`
Expected: FAIL — `.countdown--kpi` element is present (host class is already dynamic per `variant()`) but with no dedicated styling; the test itself should actually PASS on structure since the class already applies dynamically. If it passes already, skip Step 4 and note in the commit message that only styling (no test-visible behavior) was added — proceed straight to Step 4 for the visual contract and re-run to confirm no regression.

- [ ] **Step 4: Add the `'kpi'` variant styles to `countdown.scss`**

Append to the existing file (leave `.countdown--info-box` untouched):

```scss
.countdown--kpi {
  .countdown__label { font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--muted); }
  .countdown__time { display: flex; flex-direction: column; align-items: center; gap: 0; }
  .countdown__days { font-size: 24px; font-weight: 800; }
  .countdown__clock { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
  .countdown__date { font-size: 12px; color: var(--muted); margin-top: 4px; }
}
```

This requires `countdown.html`'s `<span class="countdown__days">`/`<span class="countdown__clock">` elements — confirm they already exist (they do, per the current template) before appending; no template change needed.

- [ ] **Step 5: Run the test again to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- countdown.spec.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/countdown
git commit -m "feat(bar-app): style countdown 'kpi' variant for home dashboard tiles"
```

---

## Task 8: Frontend — `HomeApiService`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/home/home-api.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/home/home-api.service.spec.ts`

**Interfaces:**
- Produces: `SellerHomeResponse { articleCount: number; typeConditions: { commissionRate: number; itemFee: number } }`, `AdminHomeResponse { sellerCount: number; articleCount: number; categoryCount: number; brandCount: number; heatmapData: { date: string; count: number }[] }`, `HomeApiService.getSellerHome(): Observable<SellerHomeResponse>`, `HomeApiService.getAdminHome(): Observable<AdminHomeResponse>`. Consumed by Task 9 (`HomePage`).

- [ ] **Step 1: Write the failing test**

```typescript
// src/advance-registration/frontend/BAR.App/src/app/features/home/home-api.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HomeApiService } from './home-api.service';

describe('HomeApiService', () => {
  let service: HomeApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), HomeApiService] });
    service = TestBed.inject(HomeApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getSellerHome() fetches GET /api/home/seller', () => {
    service.getSellerHome().subscribe();

    const req = httpMock.expectOne('/api/home/seller');
    expect(req.request.method).toBe('GET');
    req.flush({ articleCount: 3, typeConditions: { commissionRate: 15, itemFee: 0.5 } });
  });

  it('getAdminHome() fetches GET /api/home/admin', () => {
    service.getAdminHome().subscribe();

    const req = httpMock.expectOne('/api/home/admin');
    expect(req.request.method).toBe('GET');
    req.flush({ sellerCount: 1, articleCount: 1, categoryCount: 1, brandCount: 1, heatmapData: [] });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- home-api.service.spec.ts`
Expected: FAIL — `home-api.service.ts` doesn't exist yet.

- [ ] **Step 3: Write `home-api.service.ts`**

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TypeConditions {
  commissionRate: number;
  itemFee: number;
}

export interface SellerHomeResponse {
  articleCount: number;
  typeConditions: TypeConditions;
}

export interface HeatmapEntryResponse {
  date: string;
  count: number;
}

export interface AdminHomeResponse {
  sellerCount: number;
  articleCount: number;
  categoryCount: number;
  brandCount: number;
  heatmapData: HeatmapEntryResponse[];
}

@Injectable({ providedIn: 'root' })
export class HomeApiService {
  private readonly http = inject(HttpClient);

  getSellerHome(): Observable<SellerHomeResponse> {
    return this.http.get<SellerHomeResponse>('/api/home/seller');
  }

  getAdminHome(): Observable<AdminHomeResponse> {
    return this.http.get<AdminHomeResponse>('/api/home/admin');
  }
}
```

- [ ] **Step 4: Run the test again to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- home-api.service.spec.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/home/home-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/home/home-api.service.spec.ts
git commit -m "feat(bar-app): add HomeApiService for /api/home/seller and /api/home/admin"
```

---

## Task 9: Frontend — `HomePage` (seller + admin views, role-toggle wiring)

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.ts` (replace the stub; split into `.ts`/`.html`/`.scss`)
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.scss`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.spec.ts`

**Interfaces:**
- Consumes: `HomeApiService` (Task 8), `PublicInfoService` (existing, `core/public-info/public-info.service.ts`), `RoleService` (existing, `core/auth/role.service.ts`, `activeRole: Signal<Role>`), `AuthService` (existing, `currentUser: Signal<DecodedToken | null>`), `KpiTile`/`KpiGrid` (Task 5), `ActivityHeatmap` (Task 6), `Countdown` `variant="kpi"` (Task 7), `VerkaeuferNummer` (existing), `MarkdownText` (existing).
- Produces: `HomePage` component, selector `app-home-page`, root of `/home` route (unchanged route registration).

This is the orchestrating component — its own logic (deriving KPI values, deciding which endpoint to call, hiding the info panel) is what needs direct tests; the child components are already tested in isolation (Tasks 5–8), so this spec stubs them with fakes rather than re-testing their internals.

- [ ] **Step 1: Write the failing test**

```typescript
// src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HomePage } from './HomePage';
import { HomeApiService } from '../home-api.service';
import { PublicInfoService } from '../../../core/public-info/public-info.service';
import { RoleService } from '../../../core/auth/role.service';
import { AuthService } from '../../../core/auth/auth.service';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let homeApi: { getSellerHome: ReturnType<typeof vi.fn>; getAdminHome: ReturnType<typeof vi.fn> };
  let publicInfo: { get: ReturnType<typeof vi.fn> };
  let roleService: { activeRole: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    homeApi = {
      getSellerHome: vi.fn().mockReturnValue(of({ articleCount: 3, typeConditions: { commissionRate: 15, itemFee: 0.5 } })),
      getAdminHome: vi.fn().mockReturnValue(of({ sellerCount: 2, articleCount: 9, categoryCount: 4, brandCount: 6, heatmapData: [] }))
    };
    publicInfo = { get: vi.fn().mockReturnValue(of({
      registrationDeadline: null, dropOffFrom: '2026-10-05T08:00:00+02:00', dropOffUntil: '2026-10-05T18:00:00+02:00',
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: 'Hinweistext'
    })) };
    roleService = { activeRole: vi.fn().mockReturnValue('seller') };

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        { provide: HomeApiService, useValue: homeApi },
        { provide: PublicInfoService, useValue: publicInfo },
        { provide: RoleService, useValue: roleService },
        { provide: AuthService, useValue: { currentUser: () => ({ sub: 'a3f9c2d1', role: 'seller', exp: 9999999999 }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('loads seller data and shows the 4-column seller grid', () => {
    expect(homeApi.getSellerHome).toHaveBeenCalled();
    expect(homeApi.getAdminHome).not.toHaveBeenCalled();
    const grid = fixture.nativeElement.querySelector('.kpi-grid--c4');
    expect(grid).not.toBeNull();
  });

  it('shows the seller number card in seller mode', () => {
    expect(fixture.nativeElement.querySelector('app-verkaeufer-nummer')).not.toBeNull();
  });

  it('computes total drop-off fee as articleCount × itemFee', () => {
    expect(fixture.nativeElement.textContent).toContain('1.50');
  });

  it('switches to the 5-column admin grid with heatmap when role is admin', () => {
    roleService.activeRole.mockReturnValue('admin');
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(homeApi.getAdminHome).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.kpi-grid--c5')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-activity-heatmap')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-verkaeufer-nummer')).toBeNull();
  });

  it('shows the info panel when infoText is set', () => {
    expect(fixture.nativeElement.querySelector('app-markdown-text')).not.toBeNull();
  });

  it('hides the info panel when infoText is empty', () => {
    publicInfo.get.mockReturnValue(of({
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultConditions: null, infoText: '   '
    }));
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-markdown-text')).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- HomePage.spec.ts`
Expected: FAIL — current `HomePage` is a one-line stub with no such structure.

- [ ] **Step 3: Write `HomePage.ts`**

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KpiTile } from '../../../shared/kpi-tile/kpi-tile';
import { KpiGrid } from '../../../shared/kpi-tile/kpi-grid';
import { ActivityHeatmap } from '../../../shared/activity-heatmap/activity-heatmap';
import { Countdown } from '../../../shared/countdown/countdown';
import { VerkaeuferNummer } from '../../../shared/verkaeufer-nummer/verkaeufer-nummer';
import { MarkdownText } from '../../../shared/markdown-text/markdown-text';
import { HomeApiService, SellerHomeResponse, AdminHomeResponse } from '../home-api.service';
import { PublicInfoService } from '../../../core/public-info/public-info.service';
import { RoleService } from '../../../core/auth/role.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [KpiTile, KpiGrid, ActivityHeatmap, Countdown, VerkaeuferNummer, MarkdownText],
  templateUrl: './HomePage.html',
  styleUrl: './HomePage.scss'
})
export class HomePage {
  private readonly homeApi = inject(HomeApiService);
  private readonly publicInfo = inject(PublicInfoService);
  private readonly roleService = inject(RoleService);
  private readonly authService = inject(AuthService);

  readonly isAdminView = computed(() => this.roleService.activeRole() === 'admin');
  readonly sellerId = computed(() => this.authService.currentUser()?.sub ?? '');

  private readonly info = toSignal(this.publicInfo.get(), { initialValue: null });

  readonly showInfoPanel = computed(() => (this.info()?.infoText ?? '').trim().length > 0);

  private readonly sellerHomeFetch = signal(0);
  private readonly adminHomeFetch = signal(0);

  private readonly sellerHome = toSignal<SellerHomeResponse | null>(this.homeApi.getSellerHome(), { initialValue: null });
  private readonly adminHome = toSignal<AdminHomeResponse | null>(this.homeApi.getAdminHome(), { initialValue: null });

  readonly articleCount = computed(() => this.sellerHome()?.articleCount ?? null);
  readonly commissionRate = computed(() => this.sellerHome()?.typeConditions.commissionRate ?? null);
  readonly itemFee = computed(() => this.sellerHome()?.typeConditions.itemFee ?? null);
  readonly totalFee = computed(() => {
    const count = this.articleCount();
    const fee = this.itemFee();
    return count === null || fee === null ? null : (count * fee).toFixed(2);
  });

  readonly adminSellerCount = computed(() => this.adminHome()?.sellerCount ?? null);
  readonly adminArticleCount = computed(() => this.adminHome()?.articleCount ?? null);
  readonly adminCategoryCount = computed(() => this.adminHome()?.categoryCount ?? null);
  readonly adminBrandCount = computed(() => this.adminHome()?.brandCount ?? null);
  readonly heatmapEvents = computed(() => this.adminHome()?.heatmapData ?? []);

  readonly dropOffPhases = computed(() => {
    const i = this.info();
    if (!i?.dropOffFrom || !i.dropOffUntil) return [];
    return [
      { label: 'ABGABE-START', targetDate: new Date(i.dropOffFrom) },
      { label: 'ABGABE-ENDE', targetDate: new Date(i.dropOffUntil) }
    ];
  });

  readonly adminPhases = computed(() => {
    const i = this.info();
    if (!i) return [];
    return [
      { label: 'ANMELDESCHLUSS', targetDate: i.registrationDeadline ? new Date(i.registrationDeadline) : null },
      { label: 'ABGABE-START', targetDate: i.dropOffFrom ? new Date(i.dropOffFrom) : null },
      { label: 'ABGABE-ENDE', targetDate: i.dropOffUntil ? new Date(i.dropOffUntil) : null },
      { label: 'BASAR-START', targetDate: i.bazaarFrom ? new Date(i.bazaarFrom) : null },
      { label: 'BASAR-ENDE', targetDate: i.bazaarUntil ? new Date(i.bazaarUntil) : null }
    ].filter((phase): phase is { label: string; targetDate: Date } => phase.targetDate !== null);
  });
}
```

- [ ] **Step 4: Write `HomePage.html`**

```html
@if (isAdminView()) {
  <app-kpi-grid [columns]="5">
    <app-kpi-tile label="Bis zum Basar" [value]="null">
      <app-countdown variant="kpi" [phases]="adminPhases()" />
    </app-kpi-tile>
    <a routerLink="/sellers">
      <app-kpi-tile label="Verkäufer" [value]="adminSellerCount()" subLabel="Registriert" />
    </a>
    <a routerLink="/articles">
      <app-kpi-tile label="Artikel gesamt" [value]="adminArticleCount()" subLabel="Artikel" />
    </a>
    <a routerLink="/categories">
      <app-kpi-tile label="Kategorien" [value]="adminCategoryCount()" />
    </a>
    <a routerLink="/brands">
      <app-kpi-tile label="Marken" [value]="adminBrandCount()" />
    </a>
  </app-kpi-grid>

  <app-activity-heatmap [events]="heatmapEvents()" />
} @else {
  <app-kpi-grid [columns]="4">
    <app-kpi-tile label="Bis zur Abgabe" [value]="null">
      <app-countdown variant="kpi" [phases]="dropOffPhases()" />
    </app-kpi-tile>
    <app-kpi-tile label="Meine Artikel" [value]="articleCount()" subLabel="Stück" />
    <app-kpi-tile label="Meine Konditionen" [value]="commissionRate() !== null ? commissionRate() + ' %' : null" [subLabel]="itemFee() !== null ? itemFee() + ' € / Stück' : undefined" />
    <app-kpi-tile label="Abgabegebühr gesamt" [value]="totalFee()" subLabel="€" />
  </app-kpi-grid>

  @if (articleCount() === 0) {
    <p>Noch keine Artikel erfasst. <a routerLink="/my-articles">Jetzt Artikel erfassen</a></p>
  }

  <app-verkaeufer-nummer [sellerId]="sellerId()" />
}

@if (showInfoPanel()) {
  <app-markdown-text [content]="info()?.infoText ?? null" />
}
```

Note: the `<app-countdown variant="kpi" ...>` nested inside `<app-kpi-tile>` deliberately does not use `kpi-tile`'s own `label`/`value` rendering for the countdown tile — it passes `[value]="null"` and projects the countdown as content instead. This requires `kpi-tile.ts`'s template (Task 5) to render an `<ng-content>` slot below its own label/value so the countdown can be projected in when present; if it does not already have one when this task is implemented, add:

```html
<ng-content />
```

directly after the `subLabel` block in `kpi-tile.ts`'s inline template, and update Task 5's test suite (already committed by that point) is not required to change — projected content is additive and doesn't break the existing three tests, but add one more assertion there proactively is optional; this task's own `HomePage.spec.ts` (Step 1) already exercises this path indirectly via the seller/admin grid checks. `RouterLink` needs `RouterModule`/`RouterLink` in `HomePage`'s `imports` array — add `import { RouterLink } from '@angular/router';` and include `RouterLink` in `imports: [...]`.

- [ ] **Step 5: Write `HomePage.scss`**

```scss
:host {
  display: block;
}

a {
  text-decoration: none;
  color: inherit;
}
```

- [ ] **Step 6: Update `HomePage.ts`'s imports to include `RouterLink`**

Add to the top of `HomePage.ts`:

```typescript
import { RouterLink } from '@angular/router';
```

And add `RouterLink` to the `imports: [...]` array alongside `KpiTile, KpiGrid, ActivityHeatmap, Countdown, VerkaeuferNummer, MarkdownText`.

- [ ] **Step 7: Add the `<ng-content />` slot to `kpi-tile.ts` if not already present**

Open `src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-tile.ts` and confirm the template has an `<ng-content />` after the `subLabel` block (added in this step if Task 5 did not already include it):

```html
@if (subLabel()) {
  <p class="kpi-tile__sub-label">{{ subLabel() }}</p>
}
<ng-content />
```

- [ ] **Step 8: Run the test again to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- HomePage.spec.ts`
Expected: PASS (6 tests).

- [ ] **Step 9: Run the full frontend test suite to check for regressions**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test`
Expected: PASS, no regressions (in particular `kpi-tile.spec.ts` still passes after the `<ng-content />` addition).

- [ ] **Step 10: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/home src/advance-registration/frontend/BAR.App/src/app/shared/kpi-tile/kpi-tile.ts
git commit -m "feat(bar-app): build seller and admin home dashboard (R10)"
```

---

## Task 10: Manual verification against the roadmap's "Fertig, wenn" checklist

**Files:** none — manual verification pass, no code changes expected unless a check fails.

Run both apps locally (`dotnet run` for `BAR.Host`, `npm start` for `BAR.App`) and walk through [`R10-dashboards.md`](../../requirements/advance-registration/roadmap/R10-dashboards.md)'s 8 manual checks:

- [ ] **Step 1:** As a seller, open the home page → article count matches the seller's own article list, commission and fee match the assigned type.
- [ ] **Step 2:** The seller-number card shows the correct own number.
- [ ] **Step 3:** The countdown counts down every second and matches the drop-off dates set via Settings (R09).
- [ ] **Step 4:** Create an article, reload the home page → article count and today's heatmap cell (admin view) increase.
- [ ] **Step 5:** As an admin, open the home page → seller/article/category/brand counts match their respective lists.
- [ ] **Step 6:** Toggle the role switcher to "Verkäufer" → admin KPIs and heatmap disappear, seller view appears; switching back restores everything — without re-login.
- [ ] **Step 7:** As a seller without admin rights, the role toggle is not visible (already covered by existing `sidebar.ts` wiring — confirm no regression).
- [ ] **Step 8:** With a date not configured in Settings, the home page doesn't break — it shows the placeholder (confirm `dropOffPhases()`/`adminPhases()` filtering of `null` targetDate produces a sane fallback; if the countdown renders nothing when `phases` is empty, add a short "noch keine Termine festgelegt" fallback text next to the countdown tile).

If Step 8 reveals a gap (empty `phases` array renders a blank tile with no message), fix it as a follow-up within this task:

- [ ] **Step 8a (if needed): Add an empty-state fallback for the countdown KPI tile**

In `HomePage.html`, wrap the countdown tile's projected content:

```html
<app-kpi-tile label="Bis zur Abgabe" [value]="null">
  @if (dropOffPhases().length > 0) {
    <app-countdown variant="kpi" [phases]="dropOffPhases()" />
  } @else {
    <p class="kpi-tile__sub-label">Noch kein Termin festgelegt</p>
  }
</app-kpi-tile>
```

Apply the same pattern to the admin countdown tile with `adminPhases()`.

- [ ] **Step 9: Commit the fallback fix if Step 8a was needed**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/home/pages/HomePage.html
git commit -m "fix(bar-app): show placeholder when no bazaar dates are configured yet"
```

---

## Self-Review Notes

- **Spec coverage:** All 8 AC of `Epic_Home_Verkaeufer` and all 3 AC of `Epic_Home_Admin` are covered — AC-1..AC-4/AC-6/AC-7 (Verkäufer) by Task 9's grid/info-panel/seller-number logic, AC-5 (copy-to-clipboard) by the already-existing, unmodified `VerkaeuferNummer` component, AC-2 (Verkäufer countdown) and Admin AC-1/AC-2/AC-3 (counts, heatmap, tile navigation) by Task 9's template. Roadmap's 8 manual checks are covered by Task 10.
- **Placeholder scan:** no `TBD`/`TODO` left; all code blocks are complete and compilable as written against the investigated codebase state.
- **Type consistency:** `SellerHomeResult`/`SellerHomeResponse`, `AdminHomeResult`/`AdminHomeResponse`, `HeatmapEntryResult`/`HeatmapEntryResponse` intentionally have parallel-but-separate names across the C#/TypeScript boundary (server DTO vs. client DTO) — this matches the existing `PublicInfoResult`/`PublicInfo` split already in the codebase, not a naming bug.
- **Scope check:** single vertical slice covering both `Epic_Home_Verkaeufer` and `Epic_Home_Admin` as agreed during brainstorming — focused enough for one plan; no further decomposition needed.
