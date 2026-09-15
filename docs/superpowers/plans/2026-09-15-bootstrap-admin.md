# Bootstrap-Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the hardcoded demo admin (`admin@bazaar.local` / `Admin123!`) from the database seed and replace it with a runtime bootstrap flow: on a fresh system (zero admins), the Voranmelde-App routes the first visitor to a dedicated "create the first admin" screen instead of login, so the master admin registers themselves with their own name and email.

**Architecture:** Backend gets a new `AdminBootstrapState` in-memory singleton, computed once at startup from `ISellerRepository.CountAdminsAsync()` (never re-queried per request — F1 decision) and flipped to `true` the moment the bootstrap handler creates the first admin. A new `POST /api/auth/bootstrap-admin` endpoint (reusing the existing `RegisterCommand` contract/validator) creates that seller with `IsAdmin = true` and logs them in immediately, mirroring `RegisterCommandHandler`. A new `GET /api/public/bootstrap-status` endpoint exposes the flag. Frontend gets two functional guards built on that endpoint: one redirects `login`/`register` to a new `/bootstrap-admin` route while no admin exists, the other locks `/bootstrap-admin` once one does (F2 decision — permanent lock, not just unlinked). The bootstrap page reuses the existing `RegistrationForm` component with its own welcome text (F3 decision).

**Tech Stack:** .NET 9 minimal APIs, EF Core/PostgreSQL, xUnit + Moq + Testcontainers (backend); Angular standalone components, PrimeNG, Vitest (frontend).

**Spec:** This plan has no dedicated spec document — it implements the alignment reached in conversation (four confirmed decisions E1-E3, F4) rather than a written `docs/requirements/` spec. `docs/requirements/advance-registration/api/auth.md` documents the existing `/api/auth/*` endpoints this plan extends; update it in Task 10.

## Global Constraints

- Code, routes and JSON payloads stay English; documentation stays German (project CLAUDE.md).
- No new abstraction beyond what's needed: reuse `RegisterCommand`/`RegisterCommandValidator`/`RegistrationForm` as-is rather than duplicating them for the bootstrap flow.
- The bootstrap admin's `SellerTypeId` is the literal `"t0000001"` placeholder (seeded by `MasterData.InitialCreate`, same value the old hardcoded admin row used) — an admin has no commercial seller type, and picking one is out of scope.
- `AdminBootstrapState.HasAdmin` is computed exactly once at process startup and only ever flips `false → true` (never back) — this is the accepted F1 trade-off, not a bug to fix later.

---

### Task 1: Remove the hardcoded admin seed and reset the SellerManagement migration history

**Files:**
- Delete: `src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Persistence/Migrations/20260911154115_InitialCreate.cs`
- Delete: `src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Persistence/Migrations/20260911154115_InitialCreate.Designer.cs`
- Delete: `src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Persistence/Migrations/SellerManagementDbContextModelSnapshot.cs`
- Create (generated): a fresh `..._InitialCreate.cs` / `.Designer.cs` / snapshot under the same folder

This is the only migration in the SellerManagement module, so "reset the migration history" and "remove the seed" are the same action here: delete all three generated files and let EF Core regenerate them from the current model (which has no seed call left once it's regenerated from a model with no raw-SQL step wired in — see step 2).

- [ ] **Step 1: Delete the three existing migration files**

```bash
rm src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Persistence/Migrations/20260911154115_InitialCreate.cs
rm src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Persistence/Migrations/20260911154115_InitialCreate.Designer.cs
rm src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Persistence/Migrations/SellerManagementDbContextModelSnapshot.cs
```

- [ ] **Step 2: Regenerate a clean `InitialCreate` migration without the seed**

Run from `src/advance-registration/backend/`:

```bash
dotnet ef migrations add InitialCreate --project BAR.Modules.SellerManagement --startup-project BAR.Host --context SellerManagementDbContext --output-dir Infrastructure/Persistence/Migrations
```

Open the freshly generated `Migrations/<timestamp>_InitialCreate.cs` and confirm `Up()` contains only `CreateTable`/`CreateIndex` calls — no `migrationBuilder.Sql(...)` block and no mention of `admin@bazaar.local`.

- [ ] **Step 3: Build to confirm the migration compiles and the module still registers**

```bash
dotnet build src/advance-registration/backend/BAR.Host
```

Expected: build succeeds, no reference to the deleted migration class names remains anywhere (nothing else in the codebase names a migration class directly, so this should be a clean regeneration).

- [ ] **Step 4: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Persistence/Migrations
git commit -m "fix(advance-registration): remove hardcoded admin seed, reset SellerManagement migration history"
```

**After this task, tell the user directly (not just in the commit):** their local Postgres database for this app must be dropped and recreated — the new `InitialCreate` migration has a different timestamp/hash than the one already applied there, so `dotnet ef database update` will refuse to reconcile old and new history. Running the app fresh (`Program.cs`'s `ApplyMigrationsAsync`) against an empty database applies the new migration cleanly.

---

### Task 2: `AdminBootstrapState` — the in-memory "does an admin exist yet" flag

**Files:**
- Create: `src/advance-registration/backend/BAR.Modules.SellerManagement/Application/Auth/BootstrapAdmin/AdminBootstrapState.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerManagement/Auth/BootstrapAdmin/AdminBootstrapStateTests.cs`

**Interfaces:**
- Produces: `AdminBootstrapState` with `bool HasAdmin { get; }`, `void Initialize(bool hasAdmin)`, `void MarkAdminCreated()` — used by Task 3's handler, Task 4's DI/Program.cs wiring, and Task 5's module API.

- [ ] **Step 1: Write the failing tests**

```csharp
using BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;

namespace BAR.Application.UnitTests.SellerManagement.Auth.BootstrapAdmin;

public class AdminBootstrapStateTests
{
    [Fact]
    public void HasAdmin_BeforeInitialize_IsFalse()
    {
        var state = new AdminBootstrapState();

        Assert.False(state.HasAdmin);
    }

    [Fact]
    public void Initialize_WithTrue_SetsHasAdmin()
    {
        var state = new AdminBootstrapState();

        state.Initialize(true);

        Assert.True(state.HasAdmin);
    }

    [Fact]
    public void MarkAdminCreated_AfterInitializeFalse_FlipsToTrue()
    {
        var state = new AdminBootstrapState();
        state.Initialize(false);

        state.MarkAdminCreated();

        Assert.True(state.HasAdmin);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter AdminBootstrapStateTests
```

Expected: FAIL — `AdminBootstrapState` does not exist yet.

- [ ] **Step 3: Implement `AdminBootstrapState`**

```csharp
namespace BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;

/// <summary>
/// Whether an admin exists, computed once at process startup
/// (<c>Program.cs</c>) from <c>ISellerRepository.CountAdminsAsync</c> and
/// never re-queried per request. Deliberately does not re-check the database
/// later - the only way this changes at runtime is
/// <see cref="MarkAdminCreated"/>, called by the bootstrap handler right
/// after it creates the first admin, so the newly-locked
/// <c>/bootstrap-admin</c> route reflects reality without a restart.
/// </summary>
public sealed class AdminBootstrapState
{
    private volatile bool _hasAdmin;

    public bool HasAdmin => _hasAdmin;

    public void Initialize(bool hasAdmin) => _hasAdmin = hasAdmin;

    public void MarkAdminCreated() => _hasAdmin = true;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter AdminBootstrapStateTests
```

Expected: PASS (3/3).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.SellerManagement/Application/Auth/BootstrapAdmin/AdminBootstrapState.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerManagement/Auth/BootstrapAdmin/AdminBootstrapStateTests.cs
git commit -m "feat(advance-registration): add AdminBootstrapState"
```

---

### Task 3: `BootstrapAdminCommandHandler` — create the first admin and log them in

**Files:**
- Create: `src/advance-registration/backend/BAR.Modules.SellerManagement/Application/Auth/BootstrapAdmin/BootstrapAdminCommandHandler.cs`
- Test: `src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerManagement/Auth/BootstrapAdmin/BootstrapAdminCommandHandlerTests.cs`

**Interfaces:**
- Consumes: `ISellerRepository` (`GetByEmailAsync`, `AddAsync` — `Domain/Ports/ISellerRepository.cs`), `IRefreshTokenRepository.AddAsync` (`Domain/Ports/IRefreshTokenRepository.cs`), `IPasswordHasher.Hash(string)`, `ITokenIssuer.IssueAccessToken(string sellerId, string role, DateTime nowUtc)` / `GenerateRefreshTokenPlainText()`, `IClock.UtcNow`, `IUnitOfWork.ExecuteInTransactionAsync(Func<CancellationToken, Task>, CancellationToken)`, `Seller.Register(...)` (`Domain/Sellers/Seller.cs`), `RefreshToken.Issue(...)` (`Domain/Auth/RefreshToken.cs`), `RegisterCommand` (`BAR.Modules.SellerManagement.Contracts.Auth`), `TokenPairDto` (`BAR.Modules.SellerManagement.Contracts`), `AdminBootstrapState` (Task 2).
- Produces: `BootstrapAdminCommandHandler.HandleAsync(RegisterCommand command, CancellationToken cancellationToken) : Task<TokenPairDto>` — used by Task 5's module API.

- [ ] **Step 1: Write the failing tests**

```csharp
using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Auth.BootstrapAdmin;

public class BootstrapAdminCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly AdminBootstrapState _bootstrapState = new();

    public BootstrapAdminCommandHandlerTests()
    {
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private BootstrapAdminCommandHandler CreateHandler() => new(
        _sellers.Object, _refreshTokens.Object, _hasher.Object, _tokenIssuer.Object,
        _clock.Object, _unitOfWork.Object, _bootstrapState);

    private void SetUpHappyPath()
    {
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _hasher.Setup(h => h.Hash("geheim123")).Returns("hashed");
        _tokenIssuer.Setup(t => t.IssueAccessToken(It.IsAny<string>(), "admin", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
    }

    private static RegisterCommand ValidCommand(string email = "anna@example.com") =>
        new(email, "geheim123", "Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 12345");

    [Fact]
    public async Task HandleAsync_NoAdminYet_CreatesAdminSellerAndReturnsTokenPair()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-plain", result.RefreshToken);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x =>
            x.Email == "anna@example.com" && x.IsAdmin && x.SellerTypeId == "t0000001" &&
            x.FirstName == "Anna" && x.LastName == "Beispiel"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_NoAdminYet_MarksBootstrapStateDone()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.True(_bootstrapState.HasAdmin);
    }

    [Fact]
    public async Task HandleAsync_AdminAlreadyExists_ThrowsConflictAndDoesNotTouchRepository()
    {
        SetUpHappyPath();
        _bootstrapState.Initialize(true);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("bootstrap.already_done", ex.ErrorCode);
        _sellers.Verify(s => s.AddAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "x"));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }
}
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter BootstrapAdminCommandHandlerTests
```

Expected: FAIL — `BootstrapAdminCommandHandler` does not exist yet.

- [ ] **Step 3: Implement `BootstrapAdminCommandHandler`**

```csharp
using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;

/// <summary>
/// Creates the very first admin on an otherwise empty system and logs them
/// in immediately - the counterpart to the hardcoded migration seed this
/// replaces. Reuses <see cref="RegisterCommand"/>/its validator (same form
/// fields as normal self-registration) since only the resulting role and
/// the seller-type placeholder differ from <see cref="Register.RegisterCommandHandler"/>.
/// </summary>
public sealed class BootstrapAdminCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork,
    AdminBootstrapState bootstrapState)
{
    /// <summary>An admin has no commercial seller type - this placeholder is
    /// the same value the old hardcoded migration seed used, seeded once by
    /// MasterData.InitialCreate.</summary>
    private const string BootstrapSellerTypeId = "t0000001";

    public async Task<TokenPairDto> HandleAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        if (bootstrapState.HasAdmin)
        {
            throw new ConflictException("bootstrap.already_done", "Es existiert bereits ein Administrator-Konto");
        }

        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var passwordHash = passwordHasher.Hash(command.Password);
        var seller = Seller.Register(
            firstName: command.FirstName, lastName: command.LastName, address: command.Address,
            postalCode: command.PostalCode, city: command.City, phone: command.Phone,
            email: command.Email, sellerTypeId: BootstrapSellerTypeId, passwordHash: passwordHash, isAdmin: true);

        TokenPairDto? result = null;

        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            await sellers.AddAsync(seller, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, "admin", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairDto(accessToken, refreshPlainText);
        }, cancellationToken);

        bootstrapState.MarkAdminCreated();

        return result!;
    }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
dotnet test src/advance-registration/backend/tests/BAR.Application.UnitTests --filter BootstrapAdminCommandHandlerTests
```

Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.SellerManagement/Application/Auth/BootstrapAdmin/BootstrapAdminCommandHandler.cs src/advance-registration/backend/tests/BAR.Application.UnitTests/SellerManagement/Auth/BootstrapAdmin/BootstrapAdminCommandHandlerTests.cs
git commit -m "feat(advance-registration): add BootstrapAdminCommandHandler"
```

---

### Task 4: Wire `AdminBootstrapState` and the new handler into DI and startup

**Files:**
- Modify: `src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/DependencyInjection.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`

**Interfaces:**
- Consumes: `AdminBootstrapState` (Task 2), `BootstrapAdminCommandHandler` (Task 3), `ISellerRepository.CountAdminsAsync(CancellationToken)` (already exists).
- Produces: `AdminBootstrapState` and `BootstrapAdminCommandHandler` resolvable from DI; `AdminBootstrapState.HasAdmin` correctly initialized before the first request is served.

- [ ] **Step 1: Register the new types in `DependencyInjection.cs`**

In `AddSellerManagementModule`, next to the other handler registrations:

```csharp
services.AddSingleton<AdminBootstrapState>();
services.AddScoped<BootstrapAdminCommandHandler>();
```

Add `using BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;` to the file's usings.

- [ ] **Step 2: Initialize the state right after migrations run, in `Program.cs`**

Add `using BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;` and `using BAR.Modules.SellerManagement.Domain.Ports;` to `Program.cs`'s usings, then change:

```csharp
await ApplyMigrationsAsync(app);
```

to:

```csharp
await ApplyMigrationsAsync(app);
await InitializeAdminBootstrapStateAsync(app);
```

and add the new local function next to `ApplyMigrationsAsync`/`TryMigrateAsync`/`WaitForDatabaseAsync`:

```csharp
/// <summary>
/// Computes AdminBootstrapState.HasAdmin exactly once, right after migrations
/// run and before the first request is served (F1 decision - no per-request
/// re-check afterwards).
/// </summary>
static async Task InitializeAdminBootstrapStateAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
    var state = scope.ServiceProvider.GetRequiredService<AdminBootstrapState>();

    var adminCount = await sellers.CountAdminsAsync(CancellationToken.None);
    state.Initialize(adminCount > 0);
}
```

- [ ] **Step 3: Build**

```bash
dotnet build src/advance-registration/backend/BAR.Host
```

Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/DependencyInjection.cs src/advance-registration/backend/BAR.Host/Program.cs
git commit -m "feat(advance-registration): wire AdminBootstrapState into startup"
```

---

### Task 5: Expose bootstrap-admin and bootstrap-status through the module API and HTTP endpoints

**Files:**
- Modify: `src/advance-registration/backend/BAR.Modules.SellerManagement.Contracts/ISellerManagementModuleApi.cs`
- Modify: `src/advance-registration/backend/BAR.Modules.SellerManagement/Application/SellerManagementModuleApi.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Features/Auth/AuthEndpoints.cs`
- Create: `src/advance-registration/backend/BAR.Host/Features/Public/BootstrapStatusEndpoints.cs`
- Modify: `src/advance-registration/backend/BAR.Host/Program.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Auth/BootstrapAdminEndpointsTests.cs`

**Interfaces:**
- Consumes: `BootstrapAdminCommandHandler` and `AdminBootstrapState` (Tasks 2-3), `RegisterCommand`/`TokenPairDto` (existing contracts), `ValidationFilter<T>` (`BAR.Host.Validation`, already used by `/register`).
- Produces: `ISellerManagementModuleApi.BootstrapAdminAsync(RegisterCommand, CancellationToken) : Task<TokenPairDto>` and `.HasAdminAsync(CancellationToken) : Task<bool>`; HTTP `POST /api/auth/bootstrap-admin` and `GET /api/public/bootstrap-status` (`{ "hasAdmin": bool }`) — used by the frontend in Task 8.

- [ ] **Step 1: Write the failing integration test**

```csharp
using System.Net;
using System.Net.Http.Json;

namespace BAR.Host.IntegrationTests.Features.Auth;

/// <summary>
/// Own PostgresWebApplicationFactory instance (own Testcontainer, own
/// database) - AdminBootstrapState is computed once at that container's
/// startup, so this class must not share a database with any test that
/// seeds an admin directly (e.g. AdminTestSeed-based classes), or
/// HasAdmin would already be true before these tests run.
/// </summary>
public class BootstrapAdminEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BootstrapAdminEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record ProblemPayload(string? Detail, string? ErrorCode);
    private sealed record BootstrapStatus(bool HasAdmin);

    private static object ValidPayload(string email, string password = "geheim123!") => new
    {
        email, password,
        firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
        postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
    };

    [Fact]
    public async Task BootstrapLifecycle_OnFreshSystem_CreatesFirstAdminThenLocksItself()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = _factory.CreateClient();

        var beforeStatus = await client.GetFromJsonAsync<BootstrapStatus>("/api/public/bootstrap-status", ct);
        Assert.False(beforeStatus!.HasAdmin);

        var email = $"{Guid.NewGuid()}@example.com";
        var createResponse = await client.PostAsJsonAsync("/api/auth/bootstrap-admin", ValidPayload(email), ct);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var tokens = await createResponse.Content.ReadFromJsonAsync<TokenPair>(ct);
        Assert.False(string.IsNullOrEmpty(tokens!.AccessToken));

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, ct);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var afterStatus = await client.GetFromJsonAsync<BootstrapStatus>("/api/public/bootstrap-status", ct);
        Assert.True(afterStatus!.HasAdmin);

        var secondAttempt = await client.PostAsJsonAsync(
            "/api/auth/bootstrap-admin", ValidPayload($"{Guid.NewGuid()}@example.com"), ct);
        Assert.Equal(HttpStatusCode.Conflict, secondAttempt.StatusCode);
        var body = await secondAttempt.Content.ReadFromJsonAsync<ProblemPayload>(ct);
        Assert.Equal("bootstrap.already_done", body!.ErrorCode);
    }
}
```

- [ ] **Step 2: Run to verify it fails**

```bash
dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter BootstrapAdminEndpointsTests
```

Expected: FAIL — `/api/auth/bootstrap-admin` and `/api/public/bootstrap-status` don't exist (404).

- [ ] **Step 3: Add the two module API methods**

In `ISellerManagementModuleApi.cs`, next to `RegisterAsync`:

```csharp
Task<TokenPairDto> BootstrapAdminAsync(RegisterCommand command, CancellationToken cancellationToken);

/// <summary>For the public "has an admin been created yet" check (Host BootstrapStatusEndpoints).</summary>
Task<bool> HasAdminAsync(CancellationToken cancellationToken);
```

In `SellerManagementModuleApi.cs`, add `using BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;` and, next to `RegisterAsync`:

```csharp
public Task<TokenPairDto> BootstrapAdminAsync(RegisterCommand command, CancellationToken cancellationToken) =>
    Resolve<BootstrapAdminCommandHandler>().HandleAsync(command, cancellationToken);

public Task<bool> HasAdminAsync(CancellationToken cancellationToken) =>
    Task.FromResult(Resolve<AdminBootstrapState>().HasAdmin);
```

- [ ] **Step 4: Add the `POST /api/auth/bootstrap-admin` endpoint**

In `AuthEndpoints.cs`, next to the `/register` mapping:

```csharp
group.MapPost("/bootstrap-admin", async (RegisterCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
{
    var result = await sellerManagement.BootstrapAdminAsync(command, ct);
    return Results.Created("/api/auth/bootstrap-admin", new TokenPairResponse(result.AccessToken, result.RefreshToken));
}).AddEndpointFilter<ValidationFilter<RegisterCommand>>();
```

- [ ] **Step 5: Add the `GET /api/public/bootstrap-status` endpoint**

```csharp
using BAR.Modules.SellerManagement.Contracts;

namespace BAR.Host.Features.Public;

/// <summary>
/// Lets the frontend decide, before rendering login, whether to route to
/// /bootstrap-admin instead (no admin exists yet). Reads
/// AdminBootstrapState (computed once at startup) via the module API - no
/// per-request database query.
/// </summary>
public static class BootstrapStatusEndpoints
{
    public static IEndpointRouteBuilder MapBootstrapStatusEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/bootstrap-status", async (ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
            Results.Ok(new BootstrapStatusResponse(await sellerManagement.HasAdminAsync(ct))))
            .AllowAnonymous();

        return app;
    }
}

public sealed record BootstrapStatusResponse(bool HasAdmin);
```

- [ ] **Step 6: Map the new endpoint group in `Program.cs`**

Next to `app.MapPublicInfoEndpoints();`:

```csharp
app.MapBootstrapStatusEndpoints();
```

- [ ] **Step 7: Run the test to verify it passes**

```bash
dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter BootstrapAdminEndpointsTests
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/advance-registration/backend/BAR.Modules.SellerManagement.Contracts/ISellerManagementModuleApi.cs src/advance-registration/backend/BAR.Modules.SellerManagement/Application/SellerManagementModuleApi.cs src/advance-registration/backend/BAR.Host/Features/Auth/AuthEndpoints.cs src/advance-registration/backend/BAR.Host/Features/Public/BootstrapStatusEndpoints.cs src/advance-registration/backend/BAR.Host/Program.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Auth/BootstrapAdminEndpointsTests.cs
git commit -m "feat(advance-registration): expose bootstrap-admin and bootstrap-status endpoints"
```

---

### Task 6: Tidy the now-accurate `AdminTestSeed` comment

**Files:**
- Modify: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Public/AdminTestSeed.cs`

This is F4: the doc comment already claims the hardcoded migration seed was removed — which becomes true only after Task 1. No behavior change needed (the helper already creates the admin itself via the repository), just reword the comment from a forward-looking claim to a plain statement of fact.

- [ ] **Step 1: Update the doc comment**

Replace:

```csharp
/// <summary>
/// Since the raw SQL data seed was removed (the same change that
/// RegistrationTestSeed documents for settings - the old admin account
/// "admin@bazaar.local", hardcoded in the migration, no longer exists), there
/// is no longer a pre-seeded admin account. Existing endpoint tests use this
/// account only as setup to obtain an admin token; they now create it
/// themselves before logging in. SellerTypeId is a plain string with no
/// cross-schema FK (MasterData lives in a different schema) - any 8-character
/// placeholder is valid.
/// </summary>
```

with:

```csharp
/// <summary>
/// No admin is pre-seeded in the database (the hardcoded migration seed was
/// removed in favor of the runtime bootstrap-admin flow, BootstrapAdminCommandHandler).
/// Endpoint tests that need an admin token create one directly through this
/// helper rather than going through /api/auth/bootstrap-admin, since most of
/// them share a database with other tests where an admin already exists.
/// SellerTypeId is a plain string with no cross-schema FK (MasterData lives
/// in a different schema) - any 8-character placeholder is valid.
/// </summary>
```

- [ ] **Step 2: Run the full backend test suite to confirm nothing else assumed the old comment's claim was false**

```bash
dotnet test src/advance-registration/backend
```

Expected: PASS (all existing tests unaffected — `AdminTestSeed` behavior itself is unchanged).

- [ ] **Step 3: Commit**

```bash
git add src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Features/Public/AdminTestSeed.cs
git commit -m "docs(advance-registration): correct now-accurate AdminTestSeed comment"
```

---

### Task 7: Frontend — bootstrap-status service and the two routing guards

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/bootstrap/bootstrap-status.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/bootstrap/bootstrap-status.service.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/bootstrap/no-admin.guard.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/bootstrap/no-admin.guard.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/bootstrap/admin-exists.guard.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/core/bootstrap/admin-exists.guard.spec.ts`

**Interfaces:**
- Consumes: `HttpClient` (standard Angular DI, matching `AuthApiService`/`PublicInfoService`'s pattern).
- Produces: `BootstrapStatusService.hasAdmin(): Observable<boolean>`; `noAdminGuard`/`adminExistsGuard` as `CanActivateFn` — used by `app.routes.ts` in Task 9.

- [ ] **Step 1: Write the failing service spec**

```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { BootstrapStatusService } from './bootstrap-status.service';

describe('BootstrapStatusService', () => {
  it('maps the hasAdmin field from /api/public/bootstrap-status', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    const service = TestBed.inject(BootstrapStatusService);
    const httpMock = TestBed.inject(HttpTestingController);

    const result = firstValueFrom(service.hasAdmin());
    httpMock.expectOne('/api/public/bootstrap-status').flush({ hasAdmin: true });

    expect(await result).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npx vitest run bootstrap-status.service.spec.ts
```

Expected: FAIL — `BootstrapStatusService` does not exist yet.

- [ ] **Step 3: Implement `BootstrapStatusService`**

```ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

interface BootstrapStatusResponse {
  hasAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class BootstrapStatusService {
  private readonly http = inject(HttpClient);

  hasAdmin(): Observable<boolean> {
    return this.http
      .get<BootstrapStatusResponse>('/api/public/bootstrap-status')
      .pipe(map((response) => response.hasAdmin));
  }
}
```

- [ ] **Step 4: Run to verify it passes**

```bash
npx vitest run bootstrap-status.service.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Write the failing guard specs**

```ts
// no-admin.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';
import { noAdminGuard } from './no-admin.guard';

describe('noAdminGuard', () => {
  const route: any = { paramMap: convertToParamMap({}) };
  const state: any = { url: '/login' };

  function setUp(hasAdmin: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: BootstrapStatusService, useValue: { hasAdmin: () => of(hasAdmin) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue('url-tree') } }
      ]
    });
  }

  it('allows navigation when an admin already exists', async () => {
    setUp(true);
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => noAdminGuard(route, state) as any));
    expect(result).toBe(true);
  });

  it('redirects to /bootstrap-admin when no admin exists yet', async () => {
    setUp(false);
    const router = TestBed.inject(Router);
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => noAdminGuard(route, state) as any));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/bootstrap-admin']);
    expect(result).toBe('url-tree');
  });
});
```

```ts
// admin-exists.guard.spec.ts
import { TestBed } from '@angular/core/testing';
import { Router, convertToParamMap } from '@angular/router';
import { of, firstValueFrom } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { BootstrapStatusService } from './bootstrap-status.service';
import { adminExistsGuard } from './admin-exists.guard';

describe('adminExistsGuard', () => {
  const route: any = { paramMap: convertToParamMap({}) };
  const state: any = { url: '/bootstrap-admin' };

  function setUp(hasAdmin: boolean) {
    TestBed.configureTestingModule({
      providers: [
        { provide: BootstrapStatusService, useValue: { hasAdmin: () => of(hasAdmin) } },
        { provide: Router, useValue: { createUrlTree: vi.fn().mockReturnValue('url-tree') } }
      ]
    });
  }

  it('allows navigation when no admin exists yet', async () => {
    setUp(false);
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => adminExistsGuard(route, state) as any));
    expect(result).toBe(true);
  });

  it('redirects to /login once an admin already exists (F2: locked permanently)', async () => {
    setUp(true);
    const router = TestBed.inject(Router);
    const result = await firstValueFrom(TestBed.runInInjectionContext(() => adminExistsGuard(route, state) as any));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toBe('url-tree');
  });
});
```

- [ ] **Step 6: Run to verify both fail**

```bash
npx vitest run no-admin.guard.spec.ts admin-exists.guard.spec.ts
```

Expected: FAIL — neither guard file exists yet.

- [ ] **Step 7: Implement the two guards**

```ts
// no-admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

/**
 * Guards login/register: as long as no admin exists yet, every visitor is
 * sent to /bootstrap-admin instead (V3/V4 - the "naked system" screen).
 */
export const noAdminGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);

  return bootstrapStatus.hasAdmin().pipe(
    map((hasAdmin) => (hasAdmin ? true : router.createUrlTree(['/bootstrap-admin'])))
  );
};
```

```ts
// admin-exists.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

/**
 * Guards /bootstrap-admin itself: once an admin exists, the route is locked
 * permanently (F2 decision) rather than merely left unlinked.
 */
export const adminExistsGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);

  return bootstrapStatus.hasAdmin().pipe(
    map((hasAdmin) => (hasAdmin ? router.createUrlTree(['/login']) : true))
  );
};
```

- [ ] **Step 8: Run to verify all pass**

```bash
npx vitest run bootstrap-status.service.spec.ts no-admin.guard.spec.ts admin-exists.guard.spec.ts
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/bootstrap
git commit -m "feat(advance-registration): add bootstrap-status service and routing guards"
```

---

### Task 8: Frontend — `AuthApiService.bootstrapAdmin` and the `BootstrapAdminPage`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/auth/auth-api.service.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/bootstrap-admin/pages/BootstrapAdminPage.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/bootstrap-admin/pages/BootstrapAdminPage.spec.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/bootstrap-admin/bootstrap-admin.routes.ts`

**Interfaces:**
- Consumes: `AuthApiService.bootstrapAdmin` (this task), `AuthService.login` (existing), `RegistrationForm`/`RegistrationFormValue` (`../seller-management/register/components/registration-form`, existing, unmodified).
- Produces: `BootstrapAdminPage` component, `BOOTSTRAP_ADMIN_ROUTES` — used by `app.routes.ts` in Task 9.

- [ ] **Step 1: Add `bootstrapAdmin` to `AuthApiService`**

```ts
bootstrapAdmin(payload: RegisterPayload): Observable<TokenPair> {
  return this.http.post<TokenPair>('/api/auth/bootstrap-admin', payload);
}
```

(Same `RegisterPayload`/`TokenPair` types already exported by this file — no new type needed, the request body is identical to `register`'s.)

- [ ] **Step 2: Write the failing page spec**

```ts
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '@core/auth/auth.service';
import { BootstrapAdminPage } from './BootstrapAdminPage';

describe('BootstrapAdminPage', () => {
  let fixture: ComponentFixture<BootstrapAdminPage>;
  let httpMock: HttpTestingController;
  let router: Router;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BootstrapAdminPage],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        provideRouter([{ path: 'home', children: [] }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BootstrapAdminPage);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('on successful submission logs the new admin in and navigates to /home', () => {
    const navigateSpy = vi.spyOn(router, 'navigateByUrl');
    const loginSpy = vi.spyOn(authService, 'login');

    fixture.componentInstance.onSubmitted({
      email: 'chef@example.com', password: 'geheim123!', firstName: 'Chef', lastName: 'Basar',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 1'
    });

    const req = httpMock.expectOne('/api/auth/bootstrap-admin');
    req.flush({ accessToken: 'a', refreshToken: 'r' });

    expect(loginSpy).toHaveBeenCalledWith('a', 'r');
    expect(navigateSpy).toHaveBeenCalledWith('/home');
  });

  it('on email-taken conflict shows the emailTakenError state', () => {
    fixture.componentInstance.onSubmitted({
      email: 'chef@example.com', password: 'geheim123!', firstName: 'Chef', lastName: 'Basar',
      address: '', postalCode: '76133', city: 'Karlsruhe', phone: '0721 1'
    });

    const req = httpMock.expectOne('/api/auth/bootstrap-admin');
    req.flush({ errorCode: 'seller.email_taken' }, { status: 409, statusText: 'Conflict' });

    expect(fixture.componentInstance.emailTakenError()).toBe(true);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

```bash
npx vitest run BootstrapAdminPage.spec.ts
```

Expected: FAIL — `BootstrapAdminPage` does not exist yet.

- [ ] **Step 4: Implement `BootstrapAdminPage`**

```ts
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthApiService } from '@core/auth/auth-api.service';
import { AuthService } from '@core/auth/auth.service';
import { RegistrationForm, RegistrationFormValue } from '../../seller-management/register/components/registration-form';

/**
 * V3/V4: shown instead of login when AdminBootstrapState (backend) reports
 * no admin yet. Reuses the normal registration form as-is (F3 decision:
 * same fields, own welcome text) and calls /api/auth/bootstrap-admin
 * instead of /api/auth/register.
 */
@Component({
  selector: 'app-bootstrap-admin-page',
  imports: [RegistrationForm, TranslatePipe],
  template: `
    <h1>{{ 'bootstrapAdmin.title' | translate }}</h1>
    <p>{{ 'bootstrapAdmin.welcomeText' | translate }}</p>
    @if (genericError(); as message) {
      <p class="bootstrap-admin-page__error" data-testid="bootstrap-admin-generic-error">{{ message }}</p>
    }
    <app-registration-form [emailTakenError]="emailTakenError()" (submitted)="onSubmitted($event)" />
  `
})
export class BootstrapAdminPage {
  private readonly authApi = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly emailTakenError = signal(false);
  readonly genericError = signal<string | null>(null);

  onSubmitted(value: RegistrationFormValue): void {
    this.emailTakenError.set(false);
    this.genericError.set(null);
    this.authApi.bootstrapAdmin(value).subscribe({
      next: (tokens) => {
        this.authService.login(tokens.accessToken, tokens.refreshToken);
        void this.router.navigateByUrl('/home');
      },
      error: (err: HttpErrorResponse) => {
        if (err.error?.errorCode === 'seller.email_taken') {
          this.emailTakenError.set(true);
        } else {
          this.genericError.set(err.error?.detail ?? 'Anlage fehlgeschlagen. Bitte erneut versuchen.');
        }
      }
    });
  }
}
```

- [ ] **Step 5: Add the routes file**

```ts
import { Routes } from '@angular/router';
import { BootstrapAdminPage } from './pages/BootstrapAdminPage';

export const BOOTSTRAP_ADMIN_ROUTES: Routes = [
  { path: '', component: BootstrapAdminPage }
];
```

- [ ] **Step 6: Run to verify the spec passes**

```bash
npx vitest run BootstrapAdminPage.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/core/auth/auth-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/bootstrap-admin
git commit -m "feat(advance-registration): add BootstrapAdminPage"
```

---

### Task 9: Wire the `/bootstrap-admin` route and the two guards into `app.routes.ts`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `noAdminGuard`, `adminExistsGuard` (Task 7), `BOOTSTRAP_ADMIN_ROUTES` (Task 8).

- [ ] **Step 1: Add the import and the new top-level route, and guard `login`/`register`**

```ts
import { noAdminGuard } from './core/bootstrap/no-admin.guard';
import { adminExistsGuard } from './core/bootstrap/admin-exists.guard';
```

```ts
export const routes: Routes = [
  { path: 'embed/countdown', loadChildren: () => import('./features/countdown-embed/countdown-embed.routes').then((m) => m.COUNTDOWN_EMBED_ROUTES) },
  { path: 'bootstrap-admin', canActivate: [adminExistsGuard], loadChildren: () => import('./features/bootstrap-admin/bootstrap-admin.routes').then((m) => m.BOOTSTRAP_ADMIN_ROUTES) },
  { path: 'login', canActivate: [noAdminGuard], loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
  { path: 'register', canActivate: [noAdminGuard], loadChildren: () => import('./features/seller-management/register/register.routes').then((m) => m.REGISTER_ROUTES) },
  { path: 'set-password', loadChildren: () => import('./features/seller-management/set-password/set-password.routes').then((m) => m.SET_PASSWORD_ROUTES) },
  // ... rest unchanged
```

- [ ] **Step 2: Manually verify the redirect chain**

Start the app against a fresh (post-Task-1) empty database (`ng serve` + `dotnet run` on `BAR.Host`), open `http://localhost:4200/` in a browser: expect a redirect through `/login` straight to `/bootstrap-admin`. Submit the form; expect a redirect to `/home`. Reload `/bootstrap-admin` directly: expect an immediate redirect to `/login` (F2 lock).

- [ ] **Step 3: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/app.routes.ts
git commit -m "feat(advance-registration): route to /bootstrap-admin while no admin exists"
```

---

### Task 10: i18n, remove the stale demo hint, and update the API doc

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/de.json`
- Modify: `src/advance-registration/frontend/BAR.App/public/i18n/en.json`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.spec.ts`
- Modify: `docs/requirements/advance-registration/api/auth.md`

- [ ] **Step 1: Add the `bootstrapAdmin` i18n namespace, remove `login.demoHint`**

In `de.json`, inside `"login"`, delete the `"demoHint": "Demo-Zugang: admin@bazaar.local / Admin123!",` line (no valid demo account exists anymore), and add a new top-level section next to `"login"`:

```json
"bootstrapAdmin": {
  "title": "Willkommen beim Bazaar",
  "welcomeText": "Es existiert noch kein Administrator-Konto. Legen Sie sich hier als erste Administratorin bzw. erster Administrator an."
}
```

In `en.json`, delete `"demoHint": "Demo access: admin@bazaar.local / Admin123!",` and add:

```json
"bootstrapAdmin": {
  "title": "Welcome to the bazaar",
  "welcomeText": "No administrator account exists yet. Create yourself as the first administrator here."
}
```

- [ ] **Step 2: Remove the demo-hint block from `LoginPage.ts`**

Remove the `isProduction` property and the `@if (!isProduction) { ... }` block (including its `<small data-testid="demo-hint">` content) from the component's template and class body — nothing else in `LoginPage.ts` reads `isProduction`.

- [ ] **Step 3: Update `LoginPage.spec.ts`**

Delete the two tests that assert the removed behavior:

```ts
it('shows the demo hint outside production builds', () => { ... });
it('exposes isProduction from the environment', () => { ... });
```

- [ ] **Step 4: Run the frontend test suite**

```bash
npx vitest run LoginPage.spec.ts BootstrapAdminPage.spec.ts bootstrap-status.service.spec.ts no-admin.guard.spec.ts admin-exists.guard.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Document the new endpoints**

In `docs/requirements/advance-registration/api/auth.md`, add a section documenting `POST /api/auth/bootstrap-admin` (same request/response shape as `/register`, but `409 bootstrap.already_done` once an admin exists, and no `registration.not_enabled` check) and `GET /api/public/bootstrap-status` (`{ "hasAdmin": boolean }`, public, no token). Follow the existing formatting of the other endpoint sections in that file.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/public/i18n/de.json src/advance-registration/frontend/BAR.App/public/i18n/en.json src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.ts src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.spec.ts docs/requirements/advance-registration/api/auth.md
git commit -m "feat(advance-registration): bootstrap-admin i18n, drop stale demo hint, document new endpoints"
```

---

### Task 11: Full-suite verification

- [ ] **Step 1: Run the whole backend test suite**

```bash
dotnet test src/advance-registration/backend
```

Expected: PASS, including every existing `AdminTestSeed`-based test (unaffected by Task 1/6) and the new `BootstrapAdminEndpointsTests`/`BootstrapAdminCommandHandlerTests`/`AdminBootstrapStateTests`.

- [ ] **Step 2: Run the whole frontend test suite**

```bash
cd src/advance-registration/frontend/BAR.App && npx vitest run
```

Expected: PASS.

- [ ] **Step 3: Manual smoke test against a genuinely fresh database**

Drop the local `bar_dev` (or equivalent) database entirely, start `BAR.Host` (applies the regenerated `InitialCreate` migration from Task 1 — no admin row), start `ng serve`, open the app: confirm the `/bootstrap-admin` screen appears, create the master admin with a real name and email, confirm login works afterwards and `/bootstrap-admin` now redirects to `/login`.

- [ ] **Step 4: Commit if step 3 required any fix-up**

```bash
git add -A
git commit -m "fix(advance-registration): address bootstrap-admin smoke-test findings"
```
