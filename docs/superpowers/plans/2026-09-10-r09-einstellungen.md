# R09 — Einstellungen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the admin a working settings form (Basar-Termine, Nummernblock-Parameter, Info-Text) backed by `GET`/`PUT /api/settings`, replacing the currently-empty `SettingsPage` placeholder.

**Architecture:** Hexagonal backend (`BAR.Domain` → `BAR.Application` → `BAR.Infrastructure`/`BAR.Host`), Angular feature-first frontend. Reuses the existing `Settings` singleton entity (adds an `Update()` method and repository write path), the existing `GET /api/public/info` read side (fixes a null-guard bug it needs regardless), the existing `markdown-text` component for the live preview, and the existing admin-guarded `/settings` route.

**Tech Stack:** .NET 10 minimal APIs, EF Core (Npgsql), FluentValidation, xUnit v3 + Moq (backend); Angular (standalone components, signals), PrimeNG 22, Vitest (frontend).

**Spec:** [docs/superpowers/specs/2026-09-10-r09-einstellungen-design.md](../specs/2026-09-10-r09-einstellungen-design.md)

## Global Constraints

- Backend: hexagonal layering — `BAR.Domain` has no dependency on `BAR.Application`/`BAR.Infrastructure`/`BAR.Host`; cross-aggregate lookups (seller-type existence, article-number conflict) happen in `BAR.Application`, never in `BAR.Domain`.
- All 400 responses come from FluentValidation via `ValidationFilter<T>` (`Results.ValidationProblem`) — `BAR.Host.DomainExceptionHandler` only maps `DomainException` subtypes to 404/409/401/403, never 400. Domain methods still defensively validate (throw `ArgumentException`) for callers that bypass the validator (unit tests, future callers), but that is not how the HTTP 400 happens.
- JSON body casing is camelCase both ways (`ConfigureHttpJsonOptions` + `DictionaryKeyPolicy = CamelCase` already configured in `Program.cs`) — C# PascalCase record properties map automatically; no manual casing work needed.
- PrimeNG only, no native HTML form controls (project-wide rule) — `p-datepicker`, `p-select`, `p-inputnumber`, `pTextarea`, `p-popover`, `p-button`.
- Use the project's `dev-mcp` MCP tools for all `dotnet`/`ng`/EF-migration/build/test operations instead of raw shell commands (project convention, BLOCKER if unavailable).
- Frontend tests: Vitest, `TestBed` + `provideHttpClient()`/`provideHttpClientTesting()`, matching `SellerTypesPage.spec.ts` / `seller-type-api.service.spec.ts` conventions.
- Backend tests: xUnit v3 (`TestContext.Current.CancellationToken`, no `[Fact(...)]` timeouts), Moq for unit tests, `PostgresWebApplicationFactory` for integration tests.

---

### Task 1: Domain — make `Settings` fields nullable, add `Update()`

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Settings/Settings.cs`
- Modify: `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Settings/SettingsTests.cs`

**Interfaces:**
- Produces: `Settings.Create(DateTime? registrationDeadline, DateTime? dropOffFrom, DateTime? dropOffUntil, DateTime? bazaarFrom, DateTime? bazaarUntil, string? defaultTypeId, string? infoText, int startNumber, int blockSize, int defaultBlockCount) : Settings` (signature changed from non-nullable to nullable dates/`defaultTypeId`); `settings.Update(...)` — same parameter list, instance method, mutates in place; both throw `ArgumentException` on: `infoText` > 4000 chars, `startNumber`/`blockSize`/`defaultBlockCount` ≤ 0, or non-ascending non-null dates.

Currently `Settings.Create` requires all 5 dates and `DefaultTypeId` as non-nullable, which contradicts `api/settings.md`/`api/public.md` (every field may be `null`, e.g. right after deployment or a partial configuration) and AC-4 ("nicht gesetzte Termine werden übersprungen"). This task fixes that and adds the write-side `Update()`.

- [ ] **Step 1: Write the failing tests**

Replace the full contents of `src/advance-registration/backend/tests/BAR.Domain.UnitTests/Settings/SettingsTests.cs`:

```csharp
using DomainSettings = BAR.Domain.Settings.Settings;

namespace BAR.Domain.UnitTests.Settings;

public class SettingsTests
{
    [Fact]
    public void Create_ValidData_UsesFixedId()
    {
        var now = DateTime.UtcNow;
        var settings = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

        Assert.Equal("settings", settings.Id);
        Assert.Equal(1, settings.StartNumber);
        Assert.Equal(10, settings.BlockSize);
        Assert.Equal(1, settings.DefaultBlockCount);
    }

    [Fact]
    public void Create_AllNullable_AllowsAllNull()
    {
        var settings = DomainSettings.Create(null, null, null, null, null, null, null, 1, 10, 1);

        Assert.Null(settings.RegistrationDeadline);
        Assert.Null(settings.DefaultTypeId);
        Assert.Null(settings.InfoText);
    }

    [Fact]
    public void Create_InfoTextOverLimit_Throws()
    {
        var now = DateTime.UtcNow;
        var tooLong = new string('a', 4001);

        Assert.Throws<ArgumentException>(() => DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", tooLong, 1, 10, 1));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_NonPositiveStartNumber_Throws(int startNumber)
    {
        Assert.Throws<ArgumentException>(() => DomainSettings.Create(null, null, null, null, null, null, null, startNumber, 10, 1));
    }

    [Fact]
    public void Create_DescendingDates_Throws()
    {
        var now = DateTime.UtcNow;
        var earlier = now.AddDays(-1);

        Assert.Throws<ArgumentException>(() => DomainSettings.Create(now, earlier, now, now, now, null, null, 1, 10, 1));
    }

    [Fact]
    public void Create_PartialDatesSkippingNulls_DoesNotThrow()
    {
        var now = DateTime.UtcNow;

        var settings = DomainSettings.Create(now, null, null, now.AddDays(1), null, null, null, 1, 10, 1);

        Assert.Equal(now, settings.RegistrationDeadline);
        Assert.Equal(now.AddDays(1), settings.BazaarFrom);
    }

    [Fact]
    public void Update_ValidData_ChangesValues()
    {
        var now = DateTime.UtcNow;
        var settings = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Alt", 1, 10, 1);

        settings.Update(now, now, now, now, now, "t9999999", "Neu", 2, 20, 3);

        Assert.Equal("t9999999", settings.DefaultTypeId);
        Assert.Equal("Neu", settings.InfoText);
        Assert.Equal(2, settings.StartNumber);
        Assert.Equal(20, settings.BlockSize);
        Assert.Equal(3, settings.DefaultBlockCount);
    }

    [Fact]
    public void Update_DescendingDates_ThrowsAndLeavesValuesUnchanged()
    {
        var now = DateTime.UtcNow;
        var settings = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Alt", 1, 10, 1);

        Assert.Throws<ArgumentException>(() => settings.Update(now, now.AddDays(-1), now, now, now, "t1b2c3d4", "Alt", 1, 10, 1));
        Assert.Equal(now, settings.DropOffFrom);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Domain.UnitTests" filter="FullyQualifiedName~SettingsTests"
```

Expected: compile errors (`Create_AllNullable_AllowsAllNull` etc. fail — `Update` doesn't exist, `Create` doesn't accept `null` for dates).

- [ ] **Step 3: Implement**

Replace the full contents of `src/advance-registration/backend/BAR.Domain/Settings/Settings.cs`:

```csharp
namespace BAR.Domain.Settings;

public sealed class Settings
{
    public const string SingletonId = "settings";
    private const int InfoTextMaxLength = 4000;

    private Settings() { }

    public string Id { get; private init; } = SingletonId;
    public DateTime? RegistrationDeadline { get; private set; }
    public DateTime? DropOffFrom { get; private set; }
    public DateTime? DropOffUntil { get; private set; }
    public DateTime? BazaarFrom { get; private set; }
    public DateTime? BazaarUntil { get; private set; }
    public string? DefaultTypeId { get; private set; }
    public string? InfoText { get; private set; }
    public int StartNumber { get; private set; }
    public int BlockSize { get; private set; }
    public int DefaultBlockCount { get; private set; }

    public static Settings Create(
        DateTime? registrationDeadline, DateTime? dropOffFrom, DateTime? dropOffUntil,
        DateTime? bazaarFrom, DateTime? bazaarUntil, string? defaultTypeId, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        Validate(registrationDeadline, dropOffFrom, dropOffUntil, bazaarFrom, bazaarUntil, infoText, startNumber, blockSize, defaultBlockCount);

        return new Settings
        {
            RegistrationDeadline = registrationDeadline, DropOffFrom = dropOffFrom,
            DropOffUntil = dropOffUntil, BazaarFrom = bazaarFrom, BazaarUntil = bazaarUntil,
            DefaultTypeId = defaultTypeId, InfoText = infoText, StartNumber = startNumber,
            BlockSize = blockSize, DefaultBlockCount = defaultBlockCount
        };
    }

    public void Update(
        DateTime? registrationDeadline, DateTime? dropOffFrom, DateTime? dropOffUntil,
        DateTime? bazaarFrom, DateTime? bazaarUntil, string? defaultTypeId, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        Validate(registrationDeadline, dropOffFrom, dropOffUntil, bazaarFrom, bazaarUntil, infoText, startNumber, blockSize, defaultBlockCount);

        RegistrationDeadline = registrationDeadline; DropOffFrom = dropOffFrom;
        DropOffUntil = dropOffUntil; BazaarFrom = bazaarFrom; BazaarUntil = bazaarUntil;
        DefaultTypeId = defaultTypeId; InfoText = infoText; StartNumber = startNumber;
        BlockSize = blockSize; DefaultBlockCount = defaultBlockCount;
    }

    private static void Validate(
        DateTime? registrationDeadline, DateTime? dropOffFrom, DateTime? dropOffUntil,
        DateTime? bazaarFrom, DateTime? bazaarUntil, string? infoText,
        int startNumber, int blockSize, int defaultBlockCount)
    {
        if (infoText is { Length: > InfoTextMaxLength })
        {
            throw new ArgumentException($"infoText darf maximal {InfoTextMaxLength} Zeichen haben.", nameof(infoText));
        }

        if (startNumber <= 0) throw new ArgumentException("startNumber muss > 0 sein.", nameof(startNumber));
        if (blockSize <= 0) throw new ArgumentException("blockSize muss > 0 sein.", nameof(blockSize));
        if (defaultBlockCount <= 0) throw new ArgumentException("defaultBlockCount muss > 0 sein.", nameof(defaultBlockCount));

        DateTime? previous = null;
        foreach (var value in new[] { registrationDeadline, dropOffFrom, dropOffUntil, bazaarFrom, bazaarUntil })
        {
            if (value is null) continue;
            if (previous is not null && value < previous)
            {
                throw new ArgumentException("Termine müssen aufsteigend sein.");
            }
            previous = value;
        }
    }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Domain.UnitTests" filter="FullyQualifiedName~SettingsTests"
```

Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Settings/Settings.cs src/advance-registration/backend/tests/BAR.Domain.UnitTests/Settings/SettingsTests.cs
git commit -m "feat(bar-backend): make Settings dates/defaultTypeId nullable, add Update()"
```

---

### Task 2: Fix `GetPublicInfoQueryHandler` for a nullable `DefaultTypeId`

**Files:**
- Modify: `src/advance-registration/backend/BAR.Application/Public/GetInfo/GetPublicInfoQueryHandler.cs`
- Modify: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Public/GetInfo/GetPublicInfoQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `Settings.DefaultTypeId` is now `string?` (Task 1) — the handler currently calls `sellerTypes.GetByIdAsync(settings.DefaultTypeId, ...)` unconditionally, which used to be safe only because `DefaultTypeId` was guaranteed non-null. With Task 1 landed, this compiles (nullable warning at most) but is a real behavior bug: a settings row with `DefaultTypeId == null` must not look it up, and must return `defaultConditions: null`.

This task is a small, independent, testable fix — it doesn't depend on the rest of R09 and should land before the settings write-path so a partially-configured settings row (no `defaultTypeId` yet) never breaks the public endpoint.

- [ ] **Step 1: Write the failing test**

Add to `src/advance-registration/backend/tests/BAR.Application.UnitTests/Public/GetInfo/GetPublicInfoQueryHandlerTests.cs` (inside the existing class, after `HandleAsync_NoSettingsRow_ReturnsAllNull`):

```csharp
    [Fact]
    public async Task HandleAsync_SettingsRowWithNullDefaultTypeId_ReturnsNullConditionsWithoutLookup()
    {
        var deadline = DateTime.UtcNow;
        var settings = Domain.Settings.Settings.Create(
            deadline, deadline, deadline, deadline, deadline, null, "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Null(result.DefaultConditions);
        _sellerTypes.Verify(t => t.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Application.UnitTests" filter="FullyQualifiedName~GetPublicInfoQueryHandlerTests.HandleAsync_SettingsRowWithNullDefaultTypeId_ReturnsNullConditionsWithoutLookup"
```

Expected: FAIL — `Times.Never` verification fails because the handler currently calls `GetByIdAsync` unconditionally (with `null`, which Moq's loose mock returns `null` for, so the result assertion may pass but the `Verify` fails).

- [ ] **Step 3: Implement**

In `src/advance-registration/backend/BAR.Application/Public/GetInfo/GetPublicInfoQueryHandler.cs`, replace:

```csharp
        var defaultType = await sellerTypes.GetByIdAsync(settings.DefaultTypeId, cancellationToken);
        var conditions = defaultType is null ? null : new ConditionsResult(defaultType.CommissionRate, defaultType.ItemFee);
```

with:

```csharp
        var defaultType = settings.DefaultTypeId is null
            ? null
            : await sellerTypes.GetByIdAsync(settings.DefaultTypeId, cancellationToken);
        var conditions = defaultType is null ? null : new ConditionsResult(defaultType.CommissionRate, defaultType.ItemFee);
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Application.UnitTests" filter="FullyQualifiedName~GetPublicInfoQueryHandlerTests"
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Public/GetInfo/GetPublicInfoQueryHandler.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/Public/GetInfo/GetPublicInfoQueryHandlerTests.cs
git commit -m "fix(bar-backend): guard GetPublicInfoQueryHandler against a null DefaultTypeId"
```

---

### Task 3: Persistence — `ISettingsRepository.SaveAsync`, nullable columns, migration

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Ports/ISettingsRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SettingsRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs`
- Create: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/<timestamp>_MakeSettingsFieldsNullable.cs` (generated)
- Create: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/SettingsRepositoryTests.cs`

**Interfaces:**
- Produces: `ISettingsRepository.SaveAsync(Settings settings, CancellationToken ct) : Task` — upsert (insert if the `"settings"` row doesn't exist yet, replace otherwise).
- Consumes: `Settings` from Task 1 (nullable dates/`DefaultTypeId`).

There is an existing raw-SQL seed (`src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/20260909131857_AddLoginAndRegistration.cs`, lines 144–157) that inserts a fully-populated settings row and marks the 5 date columns + `default_type_id` as `NOT NULL`. Per the brainstorming decision, the empty/`null` state right after deployment is the intended normal state (matches `api/public.md`), so this task removes that seed row and makes the columns nullable — via a **new** migration on top, not by hand-editing the already-committed `AddLoginAndRegistration` migration (its generated `Designer.cs`/`ModelSnapshot.cs` are error-prone to hand-patch; a small additive migration is the standard, safe way to evolve an already-created schema).

- [ ] **Step 1: Write the failing integration test**

Create `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/SettingsRepositoryTests.cs`:

```csharp
using BAR.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class SettingsRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SettingsRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task SaveAsync_NoExistingRow_Inserts()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISettingsRepository>();
        var ct = TestContext.Current.CancellationToken;

        var settings = Domain.Settings.Settings.Create(null, null, null, null, null, null, null, 1, 10, 1);
        await repo.SaveAsync(settings, ct);

        var reloaded = await repo.GetAsync(ct);
        Assert.NotNull(reloaded);
        Assert.Null(reloaded!.RegistrationDeadline);
        Assert.Equal(1, reloaded.StartNumber);
    }

    [Fact]
    public async Task SaveAsync_ExistingRow_Replaces()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ISettingsRepository>();
        var ct = TestContext.Current.CancellationToken;

        var settings = Domain.Settings.Settings.Create(null, null, null, null, null, null, null, 1, 10, 1);
        await repo.SaveAsync(settings, ct);

        var reloaded = await repo.GetAsync(ct);
        reloaded!.Update(null, null, null, null, null, null, null, 5, 20, 2);
        await repo.SaveAsync(reloaded, ct);

        var reReloaded = await repo.GetAsync(ct);
        Assert.Equal(5, reReloaded!.StartNumber);
        Assert.Equal(20, reReloaded.BlockSize);
    }
}
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Host.IntegrationTests" filter="FullyQualifiedName~SettingsRepositoryTests"
```

Expected: compile error — `ISettingsRepository` has no `SaveAsync`.

- [ ] **Step 3: Add `SaveAsync` to the port and adapter**

`src/advance-registration/backend/BAR.Domain/Ports/ISettingsRepository.cs`:

```csharp
namespace BAR.Domain.Ports;

public interface ISettingsRepository
{
    Task<BAR.Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken);
    Task SaveAsync(BAR.Domain.Settings.Settings settings, CancellationToken cancellationToken);
}
```

`src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SettingsRepository.cs`:

```csharp
using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SettingsRepository(BarDbContext dbContext) : ISettingsRepository
{
    public Task<Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken) =>
        dbContext.Settings.SingleOrDefaultAsync(cancellationToken);

    public async Task SaveAsync(Domain.Settings.Settings settings, CancellationToken cancellationToken)
    {
        var exists = await dbContext.Settings.AnyAsync(s => s.Id == settings.Id, cancellationToken);
        if (exists)
        {
            dbContext.Settings.Update(settings);
        }
        else
        {
            dbContext.Settings.Add(settings);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

- [ ] **Step 4: Make the columns nullable, remove `.IsRequired()`**

In `src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs`, change:

```csharp
        builder.Property(s => s.DefaultTypeId).HasMaxLength(8).IsRequired().HasColumnName("default_type_id");
```

to:

```csharp
        builder.Property(s => s.DefaultTypeId).HasMaxLength(8).HasColumnName("default_type_id");
```

(The date properties need no change here — their nullability now comes from the CLR type `DateTime?` set in Task 1; EF Core infers the nullable column from that automatically.)

- [ ] **Step 5: Generate the migration**

```
mcp__dev-mcp__run_ef_migration action="add" name="MakeSettingsFieldsNullable" backend_path="src/advance-registration/backend" database_project="BAR.Infrastructure" startup_project="BAR.Host"
```

Open the generated `Up(MigrationBuilder migrationBuilder)` method and insert this line as the **first** statement (before the generated `AlterColumn` calls), so the row is gone before its columns are altered to `NOT NULL`-incompatible defaults are no longer an issue:

```csharp
            migrationBuilder.Sql("DELETE FROM settings;");
```

Verify the rest of the generated migration turns `registration_deadline`, `drop_off_from`, `drop_off_until`, `bazaar_from`, `bazaar_until`, and `default_type_id` into `nullable: true` `AlterColumn` calls — if EF instead generated a drop/recreate of the table, stop and re-check that Task 1/Step 4 and this task's Step 4 were applied before generating.

- [ ] **Step 6: Apply the migration to the local dev database**

```
mcp__dev-mcp__run_ef_migration action="database-update" backend_path="src/advance-registration/backend" database_project="BAR.Infrastructure" startup_project="BAR.Host"
```

- [ ] **Step 7: Run the tests to verify they pass**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Host.IntegrationTests" filter="FullyQualifiedName~SettingsRepositoryTests"
```

Expected: PASS (2 tests).

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/ISettingsRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/SettingsRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Configurations/SettingsConfiguration.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Migrations/ src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/SettingsRepositoryTests.cs
git commit -m "feat(bar-backend): add Settings upsert, make settings columns nullable, drop initial seed"
```

---

### Task 4: `IArticleRepository.ExistsNumberBelowAsync` (startNumber-conflict check)

**Files:**
- Modify: `src/advance-registration/backend/BAR.Domain/Ports/IArticleRepository.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/ArticleRepository.cs`
- Modify: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleRepositoryTests.cs` (create if it doesn't already cover this repository — check first)

**Interfaces:**
- Produces: `IArticleRepository.ExistsNumberBelowAsync(int number, CancellationToken ct) : Task<bool>` — `true` if any persisted article has `Number < number`.

Per `api/settings.md`: a new `startNumber` is rejected with `409` when it "liegt über einer bereits vergebenen Artikelnummer" — i.e. when at least one already-assigned article number is **below** the new `startNumber` (that article would fall outside the valid range). This means the check needs the *lowest* assigned number, not the highest — `ExistsNumberBelowAsync(startNumber)` expresses exactly that without fetching all numbers.

- [ ] **Step 1: Check for an existing `ArticleRepositoryTests.cs`**

```bash
mcp__dev-mcp__find_file pattern="ArticleRepositoryTests.cs"
```

If it exists, add the test below into that file's class instead of creating a new file (adjust the "Create" file entry above to "Modify" accordingly).

- [ ] **Step 2: Write the failing test**

Add (or create the file with):

```csharp
using BAR.Domain.Articles;
using BAR.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class ArticleRepositoryExistsNumberBelowTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleRepositoryExistsNumberBelowTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task ExistsNumberBelowAsync_NoArticles_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();

        var result = await repo.ExistsNumberBelowAsync(1, TestContext.Current.CancellationToken);

        Assert.False(result);
    }

    [Fact]
    public async Task ExistsNumberBelowAsync_ArticleNumberBelowThreshold_ReturnsTrue()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;

        var article = Article.Create(
            sellerId: $"s-{Guid.NewGuid():N}", number: 5, name: "Testartikel", brand: "Marke",
            category: "Kategorie", price: 10m, size: null, color: null, description: null, nowUtc: DateTime.UtcNow);
        await repo.CreateAsync(article, newBlock: null, ct);

        var result = await repo.ExistsNumberBelowAsync(10, ct);

        Assert.True(result);
    }
}
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Host.IntegrationTests" filter="FullyQualifiedName~ExistsNumberBelow"
```

Expected: compile error — `IArticleRepository` has no `ExistsNumberBelowAsync`.

- [ ] **Step 4: Implement**

In `src/advance-registration/backend/BAR.Domain/Ports/IArticleRepository.cs`, add to the interface:

```csharp
    Task<bool> ExistsNumberBelowAsync(int number, CancellationToken cancellationToken);
```

In `src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/ArticleRepository.cs`, add:

```csharp
    public Task<bool> ExistsNumberBelowAsync(int number, CancellationToken cancellationToken) =>
        dbContext.Articles.AnyAsync(a => a.Number < number, cancellationToken);
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Host.IntegrationTests" filter="FullyQualifiedName~ExistsNumberBelow"
```

Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Domain/Ports/IArticleRepository.cs src/advance-registration/backend/BAR.Infrastructure/Persistence/Repositories/ArticleRepository.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/
git commit -m "feat(bar-backend): add IArticleRepository.ExistsNumberBelowAsync for the startNumber conflict check"
```

---

### Task 5: Application — `GetSettingsQueryHandler`, `SettingsResult`

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Settings/SettingsResult.cs`
- Create: `src/advance-registration/backend/BAR.Application/Settings/GetSettings/GetSettingsQueryHandler.cs`
- Create: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/GetSettings/GetSettingsQueryHandlerTests.cs`

**Interfaces:**
- Consumes: `ISettingsRepository.GetAsync` (Task 3), `Settings` (Task 1).
- Produces: `SettingsResult(DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil, DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText, int? StartNumber, int? BlockSize, int? DefaultBlockCount)` — used by both `GET` (this task) and `PUT` (Task 6) responses. `GetSettingsQueryHandler.HandleAsync(CancellationToken ct) : Task<SettingsResult>`.

- [ ] **Step 1: Write the failing tests**

Create `src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/GetSettings/GetSettingsQueryHandlerTests.cs`:

```csharp
using BAR.Application.Settings.GetSettings;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Settings.GetSettings;

public class GetSettingsQueryHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();

    private GetSettingsQueryHandler CreateHandler() => new(_settings.Object);

    [Fact]
    public async Task HandleAsync_NoRow_ReturnsAllNull()
    {
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Settings.Settings?)null);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Null(result.RegistrationDeadline);
        Assert.Null(result.DefaultTypeId);
        Assert.Null(result.StartNumber);
    }

    [Fact]
    public async Task HandleAsync_ExistingRow_ReturnsValues()
    {
        var now = DateTime.UtcNow;
        var settings = Domain.Settings.Settings.Create(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(now, result.RegistrationDeadline);
        Assert.Equal("t1b2c3d4", result.DefaultTypeId);
        Assert.Equal(1, result.StartNumber);
        Assert.Equal(10, result.BlockSize);
        Assert.Equal(1, result.DefaultBlockCount);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Application.UnitTests" filter="FullyQualifiedName~GetSettingsQueryHandlerTests"
```

Expected: compile error — namespace/handler doesn't exist yet.

- [ ] **Step 3: Implement**

Create `src/advance-registration/backend/BAR.Application/Settings/SettingsResult.cs`:

```csharp
namespace BAR.Application.Settings;

public sealed record SettingsResult(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText,
    int? StartNumber, int? BlockSize, int? DefaultBlockCount);
```

Create `src/advance-registration/backend/BAR.Application/Settings/GetSettings/GetSettingsQueryHandler.cs`:

```csharp
using BAR.Domain.Ports;

namespace BAR.Application.Settings.GetSettings;

public sealed class GetSettingsQueryHandler(ISettingsRepository settingsRepository)
{
    public async Task<SettingsResult> HandleAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);

        return settings is null
            ? new SettingsResult(null, null, null, null, null, null, null, null, null, null)
            : new SettingsResult(
                settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
                settings.BazaarFrom, settings.BazaarUntil, settings.DefaultTypeId, settings.InfoText,
                settings.StartNumber, settings.BlockSize, settings.DefaultBlockCount);
    }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Application.UnitTests" filter="FullyQualifiedName~GetSettingsQueryHandlerTests"
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Settings/ src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/
git commit -m "feat(bar-backend): add GetSettingsQueryHandler"
```

---

### Task 6: Application — `UpdateSettingsCommand`, validator, handler

**Files:**
- Create: `src/advance-registration/backend/BAR.Application/Settings/Update/UpdateSettingsCommand.cs`
- Create: `src/advance-registration/backend/BAR.Application/Settings/Update/UpdateSettingsCommandValidator.cs`
- Create: `src/advance-registration/backend/BAR.Application/Settings/Update/UpdateSettingsCommandHandler.cs`
- Create: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/Update/UpdateSettingsCommandHandlerTests.cs`
- Create: `src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/Update/UpdateSettingsCommandValidatorTests.cs`

**Interfaces:**
- Consumes: `SettingsResult` (Task 5), `ISettingsRepository.SaveAsync`/`GetAsync` (Task 3), `IArticleRepository.ExistsNumberBelowAsync` (Task 4), `ISellerTypeRepository.GetByIdAsync` (existing), `Settings.Create`/`Update` (Task 1).
- Produces: `UpdateSettingsCommand(DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil, DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText, int StartNumber, int BlockSize, int DefaultBlockCount)`; `UpdateSettingsCommandHandler.HandleAsync(UpdateSettingsCommand command, CancellationToken ct) : Task<SettingsResult>`; throws `ConflictException("settings.start_number_conflict", ...)` on startNumber conflict (409, via the existing `DomainExceptionHandler`).

- [ ] **Step 1: Write the failing handler tests**

Create `src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/Update/UpdateSettingsCommandHandlerTests.cs`:

```csharp
using BAR.Application.Settings.Update;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Settings.Update;

public class UpdateSettingsCommandHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<IArticleRepository> _articles = new();

    private UpdateSettingsCommandHandler CreateHandler() => new(_settings.Object, _articles.Object);

    private static UpdateSettingsCommand ValidCommand(DateTime now) =>
        new(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

    [Fact]
    public async Task HandleAsync_StartNumberBelowExistingArticle_ThrowsConflict()
    {
        _articles.Setup(a => a.ExistsNumberBelowAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CreateHandler().HandleAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken));

        Assert.Equal("settings.start_number_conflict", ex.ErrorCode);
        _settings.Verify(s => s.SaveAsync(It.IsAny<Domain.Settings.Settings>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_NoExistingRow_CreatesAndSaves()
    {
        _articles.Setup(a => a.ExistsNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Settings.Settings?)null);

        var result = await CreateHandler().HandleAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.StartNumber);
        _settings.Verify(s => s.SaveAsync(It.IsAny<Domain.Settings.Settings>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ExistingRow_UpdatesInPlaceAndSaves()
    {
        var now = DateTime.UtcNow;
        var existing = Domain.Settings.Settings.Create(now, now, now, now, now, "t1b2c3d4", "Alt", 1, 10, 1);
        _articles.Setup(a => a.ExistsNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(existing);

        var result = await CreateHandler().HandleAsync(
            new UpdateSettingsCommand(now, now, now, now, now, "t9999999", "Neu", 2, 20, 3),
            TestContext.Current.CancellationToken);

        Assert.Equal("t9999999", result.DefaultTypeId);
        Assert.Equal("Neu", result.InfoText);
        _settings.Verify(s => s.SaveAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 2: Write the failing validator tests**

Create `src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/Update/UpdateSettingsCommandValidatorTests.cs`:

```csharp
using BAR.Application.Settings.Update;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.Settings.Update;

public class UpdateSettingsCommandValidatorTests
{
    private readonly Mock<ISellerTypeRepository> _sellerTypes = new();

    private UpdateSettingsCommandValidator CreateValidator() => new(_sellerTypes.Object);

    private static UpdateSettingsCommand ValidCommand(DateTime now) =>
        new(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

    [Fact]
    public async Task Validate_ValidCommand_NoErrors()
    {
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(SellerType.Create("Standard", 15m, 0.5m));

        var result = await CreateValidator().ValidateAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Validate_UnknownDefaultTypeId_HasError()
    {
        _sellerTypes.Setup(t => t.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((SellerType?)null);
        var command = ValidCommand(DateTime.UtcNow) with { DefaultTypeId = "unknown" };

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSettingsCommand.DefaultTypeId));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task Validate_NonPositiveStartNumber_HasError(int startNumber)
    {
        var command = ValidCommand(DateTime.UtcNow) with { StartNumber = startNumber };

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task Validate_InfoTextOverLimit_HasError()
    {
        var command = ValidCommand(DateTime.UtcNow) with { InfoText = new string('a', 4001) };

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task Validate_DescendingDates_MarksBothAffectedFields()
    {
        var now = DateTime.UtcNow;
        var command = ValidCommand(now) with { DropOffFrom = now.AddDays(-1) };
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(SellerType.Create("Standard", 15m, 0.5m));

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSettingsCommand.RegistrationDeadline));
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSettingsCommand.DropOffFrom));
    }

    [Fact]
    public async Task Validate_PartialDatesWithNullsSkipped_NoDateError()
    {
        var now = DateTime.UtcNow;
        var command = ValidCommand(now) with { DropOffFrom = null, DropOffUntil = null };
        _sellerTypes.Setup(t => t.GetByIdAsync("t1b2c3d4", It.IsAny<CancellationToken>())).ReturnsAsync(SellerType.Create("Standard", 15m, 0.5m));

        var result = await CreateValidator().ValidateAsync(command, TestContext.Current.CancellationToken);

        Assert.True(result.IsValid);
    }
}
```

- [ ] **Step 3: Run the tests to verify they fail**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Application.UnitTests" filter="FullyQualifiedName~Settings.Update"
```

Expected: compile errors — none of `UpdateSettingsCommand`/`Validator`/`Handler` exist yet.

- [ ] **Step 4: Implement**

Create `src/advance-registration/backend/BAR.Application/Settings/Update/UpdateSettingsCommand.cs`:

```csharp
namespace BAR.Application.Settings.Update;

public sealed record UpdateSettingsCommand(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText,
    int StartNumber, int BlockSize, int DefaultBlockCount);
```

Create `src/advance-registration/backend/BAR.Application/Settings/Update/UpdateSettingsCommandValidator.cs`:

```csharp
using BAR.Domain.Ports;
using FluentValidation;

namespace BAR.Application.Settings.Update;

public sealed class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
{
    public UpdateSettingsCommandValidator(ISellerTypeRepository sellerTypes)
    {
        RuleFor(c => c.StartNumber).GreaterThan(0);
        RuleFor(c => c.BlockSize).GreaterThan(0);
        RuleFor(c => c.DefaultBlockCount).GreaterThan(0);

        RuleFor(c => c.InfoText)
            .MaximumLength(4000)
            .WithMessage("Info-Text darf maximal 4000 Zeichen lang sein");

        RuleFor(c => c.DefaultTypeId)
            .MustAsync(async (id, ct) => id is null || await sellerTypes.GetByIdAsync(id, ct) is not null)
            .WithMessage("Unbekannter Verkäufer-Typ");

        RuleFor(c => c).Custom((command, context) =>
        {
            var phases = new (string Name, DateTime? Value)[]
            {
                (nameof(command.RegistrationDeadline), command.RegistrationDeadline),
                (nameof(command.DropOffFrom), command.DropOffFrom),
                (nameof(command.DropOffUntil), command.DropOffUntil),
                (nameof(command.BazaarFrom), command.BazaarFrom),
                (nameof(command.BazaarUntil), command.BazaarUntil)
            };

            DateTime? previousValue = null;
            string? previousName = null;
            foreach (var (name, value) in phases)
            {
                if (value is null) continue;
                if (previousValue is not null && value < previousValue)
                {
                    context.AddFailure(previousName!, "Termine müssen aufsteigend sein.");
                    context.AddFailure(name, "Termine müssen aufsteigend sein.");
                }
                previousValue = value;
                previousName = name;
            }
        });
    }
}
```

Create `src/advance-registration/backend/BAR.Application/Settings/Update/UpdateSettingsCommandHandler.cs`:

```csharp
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Settings.Update;

public sealed class UpdateSettingsCommandHandler(ISettingsRepository settingsRepository, IArticleRepository articles)
{
    public async Task<SettingsResult> HandleAsync(UpdateSettingsCommand command, CancellationToken cancellationToken)
    {
        if (await articles.ExistsNumberBelowAsync(command.StartNumber, cancellationToken))
        {
            throw new ConflictException("settings.start_number_conflict", "Startnummer liegt über bereits vergebenen Artikelnummern");
        }

        var existing = await settingsRepository.GetAsync(cancellationToken);
        Domain.Settings.Settings settings;
        if (existing is null)
        {
            settings = Domain.Settings.Settings.Create(
                command.RegistrationDeadline, command.DropOffFrom, command.DropOffUntil,
                command.BazaarFrom, command.BazaarUntil, command.DefaultTypeId, command.InfoText,
                command.StartNumber, command.BlockSize, command.DefaultBlockCount);
        }
        else
        {
            existing.Update(
                command.RegistrationDeadline, command.DropOffFrom, command.DropOffUntil,
                command.BazaarFrom, command.BazaarUntil, command.DefaultTypeId, command.InfoText,
                command.StartNumber, command.BlockSize, command.DefaultBlockCount);
            settings = existing;
        }

        await settingsRepository.SaveAsync(settings, cancellationToken);

        return new SettingsResult(
            settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
            settings.BazaarFrom, settings.BazaarUntil, settings.DefaultTypeId, settings.InfoText,
            settings.StartNumber, settings.BlockSize, settings.DefaultBlockCount);
    }
}
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Application.UnitTests" filter="FullyQualifiedName~Settings.Update"
```

Expected: PASS (10 tests).

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Application/Settings/Update/ src/advance-registration/backend/tests/BAR.Application.UnitTests/Settings/Update/
git commit -m "feat(bar-backend): add UpdateSettingsCommand, validator and handler"
```

---

### Task 7: Host — `SettingsEndpoints`, DI wiring, integration tests

**Files:**
- Create: `src/advance-registration/backend/BAR.Host/Features/Settings/SettingsEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Modify: `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`
- Create: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Settings/SettingsEndpointsTests.cs`

**Interfaces:**
- Consumes: `GetSettingsQueryHandler` (Task 5), `UpdateSettingsCommand`/`Handler`/`Validator` (Task 6), `ValidationFilter<T>` (existing, `BAR.Host.Validation`).
- Produces: `GET /api/settings` (admin), `PUT /api/settings` (admin) — wired the same way as `SellerTypesEndpoints`/`MapSellerTypesEndpoints`.

- [ ] **Step 1: Write the failing integration tests**

Create `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Settings/SettingsEndpointsTests.cs`:

```csharp
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Settings;

public class SettingsEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SettingsEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private async Task<(HttpClient Client, string SellerTypeId)> CreateAdminClientAsync()
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
        return (client, seedType.Id);
    }

    [Fact]
    public async Task Get_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/settings", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Put_ValidPayload_Returns200AndPersists()
    {
        var (client, sellerTypeId) = await CreateAdminClientAsync();
        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now, dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = sellerTypeId,
            infoText = "Hinweis", startNumber = 1, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var getResponse = await client.GetAsync("/api/settings", TestContext.Current.CancellationToken);
        var body = await getResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        Assert.Equal(sellerTypeId, body.GetProperty("defaultTypeId").GetString());
    }

    [Fact]
    public async Task Put_UnknownDefaultTypeId_Returns400()
    {
        var (client, _) = await CreateAdminClientAsync();
        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now, dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = "does-not-exist",
            infoText = (string?)null, startNumber = 1, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Put_DescendingDates_Returns400()
    {
        var (client, sellerTypeId) = await CreateAdminClientAsync();
        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now.AddDays(-1), dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = sellerTypeId,
            infoText = (string?)null, startNumber = 1, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Put_StartNumberBelowExistingArticle_Returns409()
    {
        var (client, sellerTypeId) = await CreateAdminClientAsync();
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var article = Domain.Articles.Article.Create(
            sellerId: $"s-{Guid.NewGuid():N}", number: 50, name: "Testartikel", brand: "Marke",
            category: "Kategorie", price: 10m, size: null, color: null, description: null, nowUtc: DateTime.UtcNow);
        await articles.CreateAsync(article, newBlock: null, ct);

        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now, dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = sellerTypeId,
            infoText = (string?)null, startNumber = 100, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Host.IntegrationTests" filter="FullyQualifiedName~SettingsEndpointsTests"
```

Expected: FAIL — `/api/settings` returns 404 (no endpoint mapped yet).

- [ ] **Step 3: Implement the endpoint**

Create `src/advance-registration/backend/BAR.Host/Features/Settings/SettingsEndpoints.cs`:

```csharp
using BAR.Application.Settings.GetSettings;
using BAR.Application.Settings.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.Settings;

public static class SettingsEndpoints
{
    public static IEndpointRouteBuilder MapSettingsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/settings", async (GetSettingsQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPut("/api/settings", async (UpdateSettingsCommand command, UpdateSettingsCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSettingsCommand>>().RequireAuthorization("admin");

        return app;
    }
}
```

In `src/advance-registration/backend/BAR.Host/Program.cs`, add next to the existing `app.MapSellerTypesEndpoints();` line:

```csharp
app.MapSettingsEndpoints();
```

- [ ] **Step 4: Wire DI**

In `src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs`, add the two `using` statements next to the existing `BAR.Application.SellerTypes.*` ones:

```csharp
using BAR.Application.Settings.GetSettings;
using BAR.Application.Settings.Update;
```

and add these three lines next to the existing `services.AddScoped<GetAllSellerTypesQueryHandler>();` block:

```csharp
        services.AddScoped<GetSettingsQueryHandler>();
        services.AddScoped<UpdateSettingsCommandHandler>();
        services.AddScoped<IValidator<UpdateSettingsCommand>, UpdateSettingsCommandValidator>();
```

- [ ] **Step 5: Run the tests to verify they pass**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend/tests/BAR.Host.IntegrationTests" filter="FullyQualifiedName~SettingsEndpointsTests"
```

Expected: PASS (5 tests).

- [ ] **Step 6: Run the full backend test suite**

```bash
mcp__dev-mcp__test_dotnet_solution path="src/advance-registration/backend"
```

Expected: PASS (no regressions from Tasks 1–7).

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/backend/BAR.Host/Features/Settings/ src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/BAR.Infrastructure/DependencyInjection.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Settings/
git commit -m "feat(bar-backend): expose GET/PUT /api/settings"
```

---

### Task 8: Frontend — `SettingsApiService`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/settings/settings-api.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/settings/settings-api.service.spec.ts`

**Interfaces:**
- Produces: `SettingsDto` (all 9 fields nullable, matches `GET`/`PUT` response shape), `SettingsPayload` (same fields, but `startNumber`/`blockSize`/`defaultBlockCount` required `number`, matches `PUT` request shape), `SettingsApiService.get(): Observable<SettingsDto>`, `SettingsApiService.update(payload: SettingsPayload): Observable<SettingsDto>`.

- [ ] **Step 1: Write the failing test**

Create `src/advance-registration/frontend/BAR.App/src/app/features/settings/settings-api.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SettingsApiService, SettingsDto, SettingsPayload } from './settings-api.service';

describe('SettingsApiService', () => {
  let service: SettingsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), SettingsApiService]
    });
    service = TestBed.inject(SettingsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('get() requests /api/settings', () => {
    service.get().subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('GET');
    const dto: SettingsDto = {
      registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultTypeId: null, infoText: null,
      startNumber: null, blockSize: null, defaultBlockCount: null
    };
    req.flush(dto);
  });

  it('update() puts payload to /api/settings', () => {
    const payload: SettingsPayload = {
      registrationDeadline: '2026-09-30T23:59:00+02:00', dropOffFrom: null, dropOffUntil: null,
      bazaarFrom: null, bazaarUntil: null, defaultTypeId: null, infoText: null,
      startNumber: 1, blockSize: 10, defaultBlockCount: 1
    };

    service.update(payload).subscribe();

    const req = httpMock.expectOne('/api/settings');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ ...payload });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```
mcp__dev-mcp__test_angular_project project_root="src/advance-registration/frontend/BAR.App" test_name_pattern="settings-api.service"
```

Expected: FAIL — `./settings-api.service` module doesn't exist.

- [ ] **Step 3: Implement**

Create `src/advance-registration/frontend/BAR.App/src/app/features/settings/settings-api.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SettingsDto {
  registrationDeadline: string | null;
  dropOffFrom: string | null;
  dropOffUntil: string | null;
  bazaarFrom: string | null;
  bazaarUntil: string | null;
  defaultTypeId: string | null;
  infoText: string | null;
  startNumber: number | null;
  blockSize: number | null;
  defaultBlockCount: number | null;
}

export interface SettingsPayload {
  registrationDeadline: string | null;
  dropOffFrom: string | null;
  dropOffUntil: string | null;
  bazaarFrom: string | null;
  bazaarUntil: string | null;
  defaultTypeId: string | null;
  infoText: string | null;
  startNumber: number;
  blockSize: number;
  defaultBlockCount: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);

  get(): Observable<SettingsDto> {
    return this.http.get<SettingsDto>('/api/settings');
  }

  update(payload: SettingsPayload): Observable<SettingsDto> {
    return this.http.put<SettingsDto>('/api/settings', payload);
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

```
mcp__dev-mcp__test_angular_project project_root="src/advance-registration/frontend/BAR.App" test_name_pattern="settings-api.service"
```

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/settings/settings-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/settings/settings-api.service.spec.ts
git commit -m "feat(bar-app): add SettingsApiService"
```

---

### Task 9: Frontend — `SettingsPage` form

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/SettingsPage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/SettingsPage.html`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/SettingsPage.spec.ts`

**Interfaces:**
- Consumes: `SettingsApiService` (Task 8), `SellerTypeApiService.getAll()` (existing, `src/advance-registration/frontend/BAR.App/src/app/features/seller-types/seller-type-api.service.ts`), `MarkdownText` (existing, `app-markdown-text`, `src/advance-registration/frontend/BAR.App/src/app/shared/markdown-text/markdown-text.ts`), `InfoArea` (existing, `app-info-area`, `src/advance-registration/frontend/BAR.App/src/app/shared/info-area/info-area.ts`).

This is the last task — it fully replaces the `<h1>Einstellungen</h1>` placeholder with the form from `components/einstellungen-form.md`. The route (`settings.routes.ts`) and the admin guard (`app.routes.ts`: `{ path: 'settings', canActivate: [authGuard, adminGuard], ... }`) are already wired — no route changes needed.

- [ ] **Step 1: Write the failing tests**

Create `src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/SettingsPage.spec.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { SettingsPage } from './SettingsPage';
import { SettingsApiService, SettingsDto } from '../settings-api.service';
import { SellerTypeApiService } from '../../seller-types/seller-type-api.service';

const EMPTY_SETTINGS: SettingsDto = {
  registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
  bazaarFrom: null, bazaarUntil: null, defaultTypeId: null, infoText: null,
  startNumber: null, blockSize: null, defaultBlockCount: null
};

function create(initial: SettingsDto = EMPTY_SETTINGS) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), MessageService]
  });
  const api = TestBed.inject(SettingsApiService);
  const sellerTypeApi = TestBed.inject(SellerTypeApiService);
  vi.spyOn(api, 'get').mockReturnValue(of(initial));
  vi.spyOn(sellerTypeApi, 'getAll').mockReturnValue(of([{ id: 't1', name: 'Standard', commissionRate: 15, itemFee: 0.5, sellerCount: 0 }]));
  const fixture = TestBed.createComponent(SettingsPage);
  fixture.detectChanges();
  return { fixture, api };
}

describe('SettingsPage', () => {
  it('loads settings on init', () => {
    const { fixture } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });

    expect(fixture.componentInstance.startNumber()).toBe(1);
    expect(fixture.componentInstance.blockSize()).toBe(10);
  });

  it('infoTextLength reflects the current infoText', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('Hallo');

    expect(fixture.componentInstance.infoTextLength()).toBe(5);
  });

  it('infoTextNearLimit is true from 3800 characters', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('a'.repeat(3800));

    expect(fixture.componentInstance.infoTextNearLimit()).toBe(true);
  });

  it('infoTextNearLimit is false below 3800 characters', () => {
    const { fixture } = create();

    fixture.componentInstance.infoText.set('a'.repeat(3799));

    expect(fixture.componentInstance.infoTextNearLimit()).toBe(false);
  });

  it('save() calls SettingsApiService.update with the current field values and shows a success toast', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    const updateSpy = vi.spyOn(api, 'update').mockReturnValue(of({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 }));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');
    fixture.componentInstance.infoText.set('Hallo');

    fixture.componentInstance.save();

    expect(updateSpy).toHaveBeenCalledWith(expect.objectContaining({ infoText: 'Hallo', startNumber: 1, blockSize: 10, defaultBlockCount: 1 }));
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
  });

  it('save() on 400 sets fieldErrors instead of a toast', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    vi.spyOn(api, 'update').mockReturnValue(
      throwError(() => ({ status: 400, error: { errors: { defaultTypeId: ['Unbekannter Verkäufer-Typ'] } } }))
    );

    fixture.componentInstance.save();

    expect(fixture.componentInstance.fieldErrors()['defaultTypeId']).toEqual(['Unbekannter Verkäufer-Typ']);
  });

  it('save() on 409 sets saveError to the server detail', () => {
    const { fixture, api } = create({ ...EMPTY_SETTINGS, startNumber: 1, blockSize: 10, defaultBlockCount: 1 });
    vi.spyOn(api, 'update').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Startnummer liegt über bereits vergebenen Artikelnummern' } }))
    );

    fixture.componentInstance.save();

    expect(fixture.componentInstance.saveError()).toBe('Startnummer liegt über bereits vergebenen Artikelnummern');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```
mcp__dev-mcp__test_angular_project project_root="src/advance-registration/frontend/BAR.App" test_name_pattern="SettingsPage"
```

Expected: FAIL — `SettingsPage` has none of these members yet (it's still the `<h1>` placeholder).

- [ ] **Step 3: Implement the component class**

Replace the full contents of `src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/SettingsPage.ts`:

```typescript
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { PopoverModule } from 'primeng/popover';
import { MessageService } from 'primeng/api';
import { InfoArea } from '../../../shared/info-area/info-area';
import { MarkdownText } from '../../../shared/markdown-text/markdown-text';
import { SettingsApiService, SettingsDto, SettingsPayload } from '../settings-api.service';
import { SellerTypeApiService, SellerType } from '../../seller-types/seller-type-api.service';

const INFO_TEXT_MAX_LENGTH = 4000;
const INFO_TEXT_WARN_THRESHOLD = 3800;

interface ValidationProblem {
  errors?: Record<string, string[]>;
  detail?: string;
}

@Component({
  selector: 'app-settings-page',
  imports: [FormsModule, ButtonModule, DatePickerModule, SelectModule, InputNumberModule, TextareaModule, PopoverModule, InfoArea, MarkdownText],
  templateUrl: './SettingsPage.html'
})
export class SettingsPage {
  private readonly api = inject(SettingsApiService);
  private readonly sellerTypeApi = inject(SellerTypeApiService);
  private readonly messageService = inject(MessageService);

  readonly INFO_TEXT_MAX_LENGTH = INFO_TEXT_MAX_LENGTH;

  readonly sellerTypes = signal<SellerType[]>([]);
  readonly registrationDeadline = signal<Date | null>(null);
  readonly dropOffFrom = signal<Date | null>(null);
  readonly dropOffUntil = signal<Date | null>(null);
  readonly bazaarFrom = signal<Date | null>(null);
  readonly bazaarUntil = signal<Date | null>(null);
  readonly defaultTypeId = signal<string | null>(null);
  readonly infoText = signal<string>('');
  readonly startNumber = signal<number | null>(null);
  readonly blockSize = signal<number | null>(null);
  readonly defaultBlockCount = signal<number | null>(null);

  readonly fieldErrors = signal<Record<string, string[]>>({});
  readonly saveError = signal<string | null>(null);

  readonly infoTextLength = computed(() => this.infoText().length);
  readonly infoTextNearLimit = computed(() => this.infoTextLength() >= INFO_TEXT_WARN_THRESHOLD);

  constructor() {
    this.sellerTypeApi.getAll().subscribe((types) => this.sellerTypes.set(types));
    this.api.get().subscribe((dto) => this.applySettings(dto));
  }

  save(): void {
    this.fieldErrors.set({});
    this.saveError.set(null);

    const payload: SettingsPayload = {
      registrationDeadline: this.toIso(this.registrationDeadline()),
      dropOffFrom: this.toIso(this.dropOffFrom()),
      dropOffUntil: this.toIso(this.dropOffUntil()),
      bazaarFrom: this.toIso(this.bazaarFrom()),
      bazaarUntil: this.toIso(this.bazaarUntil()),
      defaultTypeId: this.defaultTypeId(),
      infoText: this.infoText() || null,
      startNumber: this.startNumber() ?? 0,
      blockSize: this.blockSize() ?? 0,
      defaultBlockCount: this.defaultBlockCount() ?? 0
    };

    this.api.update(payload).subscribe({
      next: (dto) => {
        this.applySettings(dto);
        this.messageService.add({ severity: 'success', summary: '✓ Einstellungen gespeichert' });
      },
      error: (response: { status: number; error?: ValidationProblem }) => {
        if (response.status === 400 && response.error?.errors) {
          this.fieldErrors.set(response.error.errors);
        } else if (response.status === 409) {
          this.saveError.set(response.error?.detail ?? 'Startnummer liegt über bereits vergebenen Artikelnummern');
        } else {
          this.saveError.set('Einstellungen konnten nicht gespeichert werden');
        }
      }
    });
  }

  private applySettings(dto: SettingsDto): void {
    this.registrationDeadline.set(this.toDate(dto.registrationDeadline));
    this.dropOffFrom.set(this.toDate(dto.dropOffFrom));
    this.dropOffUntil.set(this.toDate(dto.dropOffUntil));
    this.bazaarFrom.set(this.toDate(dto.bazaarFrom));
    this.bazaarUntil.set(this.toDate(dto.bazaarUntil));
    this.defaultTypeId.set(dto.defaultTypeId);
    this.infoText.set(dto.infoText ?? '');
    this.startNumber.set(dto.startNumber);
    this.blockSize.set(dto.blockSize);
    this.defaultBlockCount.set(dto.defaultBlockCount);
  }

  private toDate(iso: string | null): Date | null {
    return iso ? new Date(iso) : null;
  }

  private toIso(date: Date | null): string | null {
    return date ? date.toISOString() : null;
  }
}
```

- [ ] **Step 4: Implement the template**

Create `src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/SettingsPage.html`:

```html
<form (ngSubmit)="save()">
  <div class="panel-block">
    <p class="panel-block__title">Basar-Konfiguration</p>
    <div class="form-grid">
      <div>
        <label for="registrationDeadline">Voranmeldeschluss</label>
        <p-datepicker inputId="registrationDeadline" [ngModel]="registrationDeadline()" (ngModelChange)="registrationDeadline.set($event)" name="registrationDeadline" [showTime]="true" dateFormat="dd.mm.yy" />
        @if (fieldErrors()['registrationDeadline']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        <label for="dropOffFrom">Abgabe von</label>
        <p-datepicker inputId="dropOffFrom" [ngModel]="dropOffFrom()" (ngModelChange)="dropOffFrom.set($event)" name="dropOffFrom" [showTime]="true" dateFormat="dd.mm.yy" />
        @if (fieldErrors()['dropOffFrom']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        <label for="dropOffUntil">Abgabe bis</label>
        <p-datepicker inputId="dropOffUntil" [ngModel]="dropOffUntil()" (ngModelChange)="dropOffUntil.set($event)" name="dropOffUntil" [showTime]="true" dateFormat="dd.mm.yy" />
        @if (fieldErrors()['dropOffUntil']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        <label for="bazaarFrom">Basar von</label>
        <p-datepicker inputId="bazaarFrom" [ngModel]="bazaarFrom()" (ngModelChange)="bazaarFrom.set($event)" name="bazaarFrom" [showTime]="true" dateFormat="dd.mm.yy" />
        @if (fieldErrors()['bazaarFrom']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        <label for="bazaarUntil">Basar bis</label>
        <p-datepicker inputId="bazaarUntil" [ngModel]="bazaarUntil()" (ngModelChange)="bazaarUntil.set($event)" name="bazaarUntil" [showTime]="true" dateFormat="dd.mm.yy" />
        @if (fieldErrors()['bazaarUntil']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        <label for="defaultTypeId">Standard-Verkäufer-Typ</label>
        <p-select inputId="defaultTypeId" [options]="sellerTypes()" [ngModel]="defaultTypeId()" (ngModelChange)="defaultTypeId.set($event)" name="defaultTypeId" optionLabel="name" optionValue="id" [showClear]="true" />
        @if (fieldErrors()['defaultTypeId']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
    </div>
  </div>

  <div class="panel-block">
    <p class="panel-block__title">Nummernblock-Parameter</p>
    <div class="form-grid">
      <div>
        <label for="startNumber">Startnummer</label>
        <p-inputnumber inputId="startNumber" [ngModel]="startNumber()" (ngModelChange)="startNumber.set($event)" name="startNumber" [min]="1" />
        @if (fieldErrors()['startNumber']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        <label for="blockSize">Blockgröße</label>
        <p-inputnumber inputId="blockSize" [ngModel]="blockSize()" (ngModelChange)="blockSize.set($event)" name="blockSize" [min]="1" />
        <small>Bestehende Blöcke behalten ihre Größe — nur künftig angelegte Blöcke bekommen die neue.</small>
        @if (fieldErrors()['blockSize']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        <label for="defaultBlockCount">Standard-Blockanzahl</label>
        <p-inputnumber inputId="defaultBlockCount" [ngModel]="defaultBlockCount()" (ngModelChange)="defaultBlockCount.set($event)" name="defaultBlockCount" [min]="1" />
        @if (fieldErrors()['defaultBlockCount']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
    </div>
  </div>

  <div class="panel-block">
    <div class="panel-block__title-row">
      <p class="panel-block__title">Info-Text</p>
      <button type="button" pButton icon="pi pi-info-circle" [text]="true" [rounded]="true" (click)="syntaxHelp.toggle($event)" aria-label="Unterstützte Formatierung"></button>
      <p-popover #syntaxHelp>
        <table>
          <thead>
            <tr><th>Element</th><th>Syntax</th><th>Rendering</th></tr>
          </thead>
          <tbody>
            <tr><td>Absatz</td><td>Leerzeile zwischen Textblöcken</td><td>&lt;p&gt;</td></tr>
            <tr><td>Zeilenumbruch</td><td>einfacher Umbruch</td><td>&lt;br&gt;</td></tr>
            <tr><td>Überschrift</td><td># bis ###</td><td>&lt;h1&gt;–&lt;h3&gt;</td></tr>
            <tr><td>Fettdruck</td><td>**Text**</td><td>&lt;strong&gt;</td></tr>
            <tr><td>Kursiv</td><td>*Text*</td><td>&lt;em&gt;</td></tr>
            <tr><td>Aufzählung</td><td>- / *</td><td>&lt;ul&gt;&lt;li&gt;</td></tr>
            <tr><td>Nummerierte Liste</td><td>1.</td><td>&lt;ol&gt;&lt;li&gt;</td></tr>
            <tr><td>Trennlinie</td><td>---</td><td>&lt;hr&gt;</td></tr>
            <tr><td>Inline-Code</td><td>`Code`</td><td>&lt;code&gt;</td></tr>
            <tr><td>Code-Block</td><td>Fence aus drei Backticks</td><td>&lt;pre&gt;&lt;code&gt;</td></tr>
            <tr><td>Link</td><td>[Text](url)</td><td>&lt;a&gt; — nur http/https/mailto</td></tr>
          </tbody>
        </table>
        <p>Nicht aufgeführte Syntax bleibt als Klartext stehen.</p>
      </p-popover>
    </div>
    <div class="info-text-grid">
      <div>
        <textarea pTextarea rows="8" [ngModel]="infoText()" (ngModelChange)="infoText.set($event)" name="infoText" [maxlength]="INFO_TEXT_MAX_LENGTH"></textarea>
        <small [class.field-warn]="infoTextNearLimit()">{{ infoTextLength() }} / {{ INFO_TEXT_MAX_LENGTH }}</small>
        @if (fieldErrors()['infoText']; as errors) {
          <p class="field-error">{{ errors[0] }}</p>
        }
      </div>
      <div>
        @if (infoText()) {
          <app-markdown-text [content]="infoText()" />
        } @else {
          <p class="preview-placeholder">Keine Vorschau — Info-Text ist leer</p>
        }
      </div>
    </div>
  </div>

  @if (saveError()) {
    <app-info-area type="error" [message]="saveError()!" />
  }

  <p-button type="submit" label="Speichern" />
</form>
```

- [ ] **Step 5: Run the tests to verify they pass**

```
mcp__dev-mcp__test_angular_project project_root="src/advance-registration/frontend/BAR.App" test_name_pattern="SettingsPage"
```

Expected: PASS (7 tests).

- [ ] **Step 6: Run the full frontend test suite**

```
mcp__dev-mcp__test_angular_project project_root="src/advance-registration/frontend/BAR.App"
```

Expected: PASS (no regressions).

- [ ] **Step 7: Manually verify in the browser**

Start the app (backend + frontend), log in as admin, open **System → Einstellungen**:
- Set all 5 termine + Standard-Verkäufer-Typ + Nummernblock-Parameter + Info-Text (including a `## Überschrift`), save, reload the page → values are still there and the popover/preview/counter behave per `einstellungen-form.md`.
- Save termine out of order → rejected, fields marked, nothing persisted.
- Log in as a non-admin seller → `/settings` is neither shown in the nav nor reachable directly.

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/settings/pages/
git commit -m "feat(bar-app): implement the Einstellungen form (R09)"
```
