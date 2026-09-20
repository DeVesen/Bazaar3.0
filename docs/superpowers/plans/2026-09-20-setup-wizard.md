# Setup-Wizard statt Env-Var-Admin-Seed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the env-var-driven `SeedAdminHostedService` with a self-service Setup-Wizard: an empty database redirects the user to `/setup`, where they create the first admin, at least one seller type, and optionally brands/categories, then land back on `/login` to sign in.

**Architecture:** Backend gets a cached `AdminBootstrapState` singleton (computed once at startup) plus two new anonymous endpoints (`GET /api/public/bootstrap-status`, `POST /api/public/bootstrap-admin`) that mirror the already-shipped Voranmelde-App bootstrap pattern. The admin-creation endpoint auto-issues a JWT so the wizard's later steps (seller types, brands, categories) reuse the *existing* admin-protected endpoints unchanged, authenticated with that token. Frontend gets two new route guards (`noAdminGuard`, `adminExistsGuard`) and one new feature (`features/setup/`) with a single smart page component driving a PrimeNG `p-stepper`.

**Tech Stack:** .NET 10 minimal APIs, FluentValidation, xUnit + Moq, Testcontainers (Postgres) for integration tests; Angular (signals, `FormsModule`), PrimeNG 22 (`p-stepper`), Vitest.

**Spec:** `docs/superpowers/specs/2026-09-20-setup-wizard-design.md`

## Global Constraints

- No refresh tokens — a single access token, exactly like `LoginHandler` (see `Bazaar.Application/Auth/LoginHandler.cs`).
- New admin created via the wizard gets `mustChangePassword: false` (the user just chose their own password) — unlike the old seed path's `true`.
- All new backend classes follow the existing hexagonal cut: Domain untouched, `Bazaar.Application/Auth/` for logic, `Bazaar.Api/Features/Public/` for endpoints/DTOs.
- `DiRegistrationTests.AllApplicationHandlers_AreRegisteredInProgram` scans `Program.cs` for `AddScoped<XHandler>()` per `*Handler` class in `Bazaar.Application` — every new handler must be registered with that exact literal shape (no arguments inside the parens).
- Frontend reuses the existing `SellerTypesApi`, `BrandsApi`, `CategoriesApi` (data-layer HTTP wrappers) directly from `features/setup/` — not their feature-local stores — since those wrappers carry no feature-specific state.
- Wire responses stay camelCase (ASP.NET Minimal API default `System.Text.Json` naming policy — same as `SellerTypeDto`).

---

### Task 1: `AdminBootstrapState` singleton

**Files:**
- Create: `src/bazaar-app/backend/Bazaar.Application/Auth/AdminBootstrapState.cs`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Auth/AdminBootstrapStateTests.cs`

**Interfaces:**
- Produces: `AdminBootstrapState` with `bool HasAdmin { get; }`, `void Initialize(bool hasAdmin)`, `void MarkAdminCreated()`. Consumed by Task 2 (`BootstrapAdminHandler`), Task 3 (`BootstrapEndpoints`), Task 4 (`Program.cs` startup init).

- [ ] **Step 1: Write the failing test**

```csharp
namespace Bazaar.Application.UnitTests.Auth;

using Bazaar.Application.Auth;

public class AdminBootstrapStateTests
{
    [Fact]
    public void HasAdmin_BeforeInitialize_IsFalse()
    {
        var state = new AdminBootstrapState();
        Assert.False(state.HasAdmin);
    }

    [Fact]
    public void Initialize_SetsHasAdminToGivenValue()
    {
        var state = new AdminBootstrapState();
        state.Initialize(true);
        Assert.True(state.HasAdmin);
    }

    [Fact]
    public void MarkAdminCreated_SetsHasAdminToTrue()
    {
        var state = new AdminBootstrapState();
        state.Initialize(false);
        state.MarkAdminCreated();
        Assert.True(state.HasAdmin);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter AdminBootstrapStateTests`
Expected: FAIL (compile error — `AdminBootstrapState` does not exist)

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace Bazaar.Application.Auth;

/// <summary>
/// Cached in-memory flag for whether an admin user exists, computed once at startup
/// (Program.cs, after migrations) so GET /api/public/bootstrap-status never hits the
/// database per request. BootstrapAdminHandler re-checks the database directly before
/// creating the admin, closing the race window between two concurrent first requests.
/// </summary>
public sealed class AdminBootstrapState
{
    public bool HasAdmin { get; private set; }

    public void Initialize(bool hasAdmin) => HasAdmin = hasAdmin;

    public void MarkAdminCreated() => HasAdmin = true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter AdminBootstrapStateTests`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/backend/Bazaar.Application/Auth/AdminBootstrapState.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Auth/AdminBootstrapStateTests.cs
git commit -m "feat(bazaar-app): add AdminBootstrapState singleton for setup-wizard"
```

---

### Task 2: `BootstrapAdminCommand` + validator + `BootstrapAdminHandler`

**Files:**
- Create: `src/bazaar-app/backend/Bazaar.Application/Auth/BootstrapAdminCommand.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/Auth/BootstrapAdminCommandValidator.cs`
- Create: `src/bazaar-app/backend/Bazaar.Application/Auth/BootstrapAdminHandler.cs`
- Test: `src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Auth/BootstrapAdminHandlerTests.cs`

**Interfaces:**
- Consumes: `AdminBootstrapState` (Task 1: `HasAdmin`, `MarkAdminCreated()`); `IUserRepository.AnyAsync()`/`Add(User)` (existing, `Bazaar.Domain/Ports/IUserRepository.cs`); `IPasswordHasher.Hash(string)` (existing); `IIdGenerator.Generate()` (existing); `ITokenIssuer.IssueAccessToken(User, DateTime)` (existing); `User.Create(string id, string username, string passwordHash, Role role, bool mustChangePassword)` (existing, `Bazaar.Domain/User/User.cs`); `ConflictException(string message, string errorCode)` (existing, `Bazaar.Domain/Exceptions/DomainException.cs`).
- Produces: `BootstrapAdminCommand { string Username, string Password }`; `BootstrapAdminHandler.Handle(BootstrapAdminCommand) : Task<string>` (returns the issued access token). Consumed by Task 3 (`BootstrapEndpoints`) and Task 4 (`Program.cs` DI registration).

- [ ] **Step 1: Write the failing test**

```csharp
namespace Bazaar.Application.UnitTests.Auth;

using Bazaar.Application.Auth;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

public class BootstrapAdminHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly AdminBootstrapState _state = new();

    private BootstrapAdminHandler CreateSut() =>
        new(_userRepository.Object, _passwordHasher.Object, _idGenerator.Object, _tokenIssuer.Object, _state);

    [Fact]
    public async Task Handle_StateAlreadyHasAdmin_ThrowsConflictWithoutTouchingRepository()
    {
        _state.Initialize(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(new BootstrapAdminCommand { Username = "admin", Password = "changeme1" }));

        Assert.Equal("bootstrap.already_done", exception.ErrorCode);
        _userRepository.Verify(r => r.AnyAsync(), Times.Never);
        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_StateSaysNoAdminButDbHasOne_ThrowsConflict()
    {
        _state.Initialize(false);
        _userRepository.Setup(r => r.AnyAsync()).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(new BootstrapAdminCommand { Username = "admin", Password = "changeme1" }));

        Assert.Equal("bootstrap.already_done", exception.ErrorCode);
        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoAdminYet_CreatesAdminWithoutMustChangePasswordAndReturnsToken()
    {
        _state.Initialize(false);
        _userRepository.Setup(r => r.AnyAsync()).ReturnsAsync(false);
        _passwordHasher.Setup(h => h.Hash("changeme1")).Returns("hashed-password");
        _idGenerator.Setup(g => g.Generate()).Returns("ADMIN001");
        User? addedUser = null;
        _userRepository
            .Setup(r => r.Add(It.IsAny<User>()))
            .Callback<User>(u => addedUser = u)
            .Returns(Task.CompletedTask);
        _tokenIssuer.Setup(t => t.IssueAccessToken(It.IsAny<User>(), It.IsAny<DateTime>())).Returns("issued-token");
        var sut = CreateSut();

        var token = await sut.Handle(new BootstrapAdminCommand { Username = "  admin  ", Password = "changeme1" });

        Assert.Equal("issued-token", token);
        Assert.NotNull(addedUser);
        Assert.Equal("ADMIN001", addedUser!.Id);
        Assert.Equal("admin", addedUser.Username);
        Assert.Equal("hashed-password", addedUser.PasswordHash);
        Assert.Equal(Role.Admin, addedUser.Role);
        Assert.False(addedUser.MustChangePassword);
        Assert.True(_state.HasAdmin);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter BootstrapAdminHandlerTests`
Expected: FAIL (compile error — `BootstrapAdminCommand`/`BootstrapAdminHandler` do not exist)

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace Bazaar.Application.Auth;

public sealed class BootstrapAdminCommand
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
```

```csharp
using FluentValidation;

namespace Bazaar.Application.Auth;

public sealed class BootstrapAdminCommandValidator : AbstractValidator<BootstrapAdminCommand>
{
    public BootstrapAdminCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Passwort muss mindestens 8 Zeichen lang sein");
    }
}
```

```csharp
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;

namespace Bazaar.Application.Auth;

public sealed class BootstrapAdminHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IIdGenerator idGenerator,
    ITokenIssuer tokenIssuer,
    AdminBootstrapState bootstrapState)
{
    public async Task<string> Handle(BootstrapAdminCommand command)
    {
        // Fast in-memory check first, DB recheck second - closes the race window
        // between two concurrent first requests without hitting the DB on every call.
        if (bootstrapState.HasAdmin || await userRepository.AnyAsync())
        {
            throw new ConflictException("Setup wurde bereits abgeschlossen", "bootstrap.already_done");
        }

        var passwordHash = passwordHasher.Hash(command.Password);
        var admin = User.Create(idGenerator.Generate(), command.Username.Trim(), passwordHash, Role.Admin, mustChangePassword: false);
        await userRepository.Add(admin);
        bootstrapState.MarkAdminCreated();

        return tokenIssuer.IssueAccessToken(admin, DateTime.UtcNow);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Application.UnitTests --filter BootstrapAdminHandlerTests`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/backend/Bazaar.Application/Auth/BootstrapAdminCommand.cs src/bazaar-app/backend/Bazaar.Application/Auth/BootstrapAdminCommandValidator.cs src/bazaar-app/backend/Bazaar.Application/Auth/BootstrapAdminHandler.cs src/bazaar-app/backend/tests/Bazaar.Application.UnitTests/Auth/BootstrapAdminHandlerTests.cs
git commit -m "feat(bazaar-app): add BootstrapAdminHandler for self-service admin creation"
```

---

### Task 3: Public bootstrap endpoints

**Files:**
- Create: `src/bazaar-app/backend/Bazaar.Api/Features/Public/BootstrapEndpoints.cs`
- Create: `src/bazaar-app/backend/Bazaar.Api/Features/Public/BootstrapDtos.cs`
- Test: `src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests/BootstrapEndpointsTests.cs`

**Interfaces:**
- Consumes: `AdminBootstrapState.HasAdmin` (Task 1); `BootstrapAdminHandler.Handle(BootstrapAdminCommand)` (Task 2); `ValidationFilter<TRequest>` (existing, `Bazaar.Api/Filters/ValidationFilter.cs`).
- Produces: `IEndpointRouteBuilder.MapBootstrapEndpoints()` extension method, `BootstrapStatusResponse(bool HasAdmin)`, `BootstrapAdminResponse(string AccessToken)`. Consumed by Task 4 (`Program.cs`).

- [ ] **Step 1: Write the failing test**

```csharp
using System.Net;
using System.Net.Http.Json;

namespace Bazaar.Api.IntegrationTests;

public class BootstrapEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BootstrapEndpointsTests(PostgresWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetBootstrapStatus_FreshDatabase_ReturnsHasAdminFalse()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/public/bootstrap-status", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<BootstrapStatusBody>(TestContext.Current.CancellationToken);
        Assert.False(body!.HasAdmin);
    }

    [Fact]
    public async Task PostBootstrapAdmin_FreshDatabase_CreatesAdminAndReturnsToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "first-admin", password = "changeme1" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<BootstrapAdminBody>(TestContext.Current.CancellationToken);
        Assert.False(string.IsNullOrEmpty(body!.AccessToken));
    }

    [Fact]
    public async Task PostBootstrapAdmin_CalledTwice_SecondCallReturnsConflict()
    {
        var client = _factory.CreateClient();
        await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "second-admin-flow", password = "changeme1" },
            TestContext.Current.CancellationToken);

        var response = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "another-admin", password = "changeme1" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private sealed record BootstrapStatusBody(bool HasAdmin);
    private sealed record BootstrapAdminBody(string AccessToken);
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests --filter BootstrapEndpointsTests`
Expected: FAIL (404 — routes don't exist yet)

- [ ] **Step 3: Write minimal implementation**

```csharp
namespace Bazaar.Api.Features.Public;

public sealed record BootstrapStatusResponse(bool HasAdmin);

public sealed record BootstrapAdminResponse(string AccessToken);
```

```csharp
using Bazaar.Api.Filters;
using Bazaar.Application.Auth;

namespace Bazaar.Api.Features.Public;

public static class BootstrapEndpoints
{
    public static IEndpointRouteBuilder MapBootstrapEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/bootstrap-status", (AdminBootstrapState state) =>
            Results.Ok(new BootstrapStatusResponse(state.HasAdmin)))
        .AllowAnonymous();

        app.MapPost("/api/public/bootstrap-admin", async (BootstrapAdminCommand command, BootstrapAdminHandler handler) =>
        {
            var accessToken = await handler.Handle(command);
            return Results.Ok(new BootstrapAdminResponse(accessToken));
        })
        .AllowAnonymous()
        .AddEndpointFilter<ValidationFilter<BootstrapAdminCommand>>();

        return app;
    }
}
```

Note: this task's test will still fail at Step 4 until Task 4 wires `MapBootstrapEndpoints()`, `AddSingleton<AdminBootstrapState>()`, and `AddScoped<BootstrapAdminHandler>()` into `Program.cs` — run both tasks' Step-4 verification together if working strictly task-by-task, or fold Task 4's wiring in before re-running this test.

- [ ] **Step 4: Run test to verify it passes (after Task 4's Program.cs wiring)**

Run: `dotnet test src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests --filter BootstrapEndpointsTests`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/backend/Bazaar.Api/Features/Public/BootstrapEndpoints.cs src/bazaar-app/backend/Bazaar.Api/Features/Public/BootstrapDtos.cs src/bazaar-app/backend/tests/Bazaar.Api.IntegrationTests/BootstrapEndpointsTests.cs
git commit -m "feat(bazaar-app): add public bootstrap-status/bootstrap-admin endpoints"
```

---

### Task 4: Remove `SeedAdminHostedService`, wire bootstrap into `Program.cs`

**Files:**
- Delete: `src/bazaar-app/backend/Bazaar.Infrastructure/Security/SeedAdminHostedService.cs`
- Delete: `src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Security/SeedAdminHostedServiceTests.cs`
- Modify: `src/bazaar-app/backend/Bazaar.Api/Program.cs`

**Interfaces:**
- Consumes: `AdminBootstrapState` (Task 1), `BootstrapAdminHandler` (Task 2), `MapBootstrapEndpoints()` (Task 3), existing `IUserRepository`.
- Produces: nothing new — this task only wires already-produced pieces into the composition root.

- [ ] **Step 1: Delete the old seed service and its test**

```bash
git rm src/bazaar-app/backend/Bazaar.Infrastructure/Security/SeedAdminHostedService.cs
git rm src/bazaar-app/backend/tests/Bazaar.Infrastructure.UnitTests/Security/SeedAdminHostedServiceTests.cs
```

- [ ] **Step 2: Run the full backend test suite to confirm nothing else references it**

Run: `dotnet build src/bazaar-app/backend/Bazaar.sln`
Expected: build error — `Program.cs:96` still references `SeedAdminHostedService`. This confirms the reference is exactly where expected before removing it.

- [ ] **Step 3: Edit `Program.cs`**

Remove the hosted-service registration (`Program.cs:96`):

```diff
-builder.Services.AddHostedService<SeedAdminHostedService>();
-
 builder.Services.AddScoped<LoginHandler>();
```

Add the two new registrations right after the existing `AddScoped<LoginHandler>();`/`AddScoped<ChangePasswordHandler>();` pair (`Program.cs:98-99`):

```diff
 builder.Services.AddScoped<LoginHandler>();
 builder.Services.AddScoped<ChangePasswordHandler>();
+builder.Services.AddScoped<BootstrapAdminHandler>();
```

Add the singleton registration next to the other singletons (`Program.cs:93-94`):

```diff
 builder.Services.AddSingleton<ITokenIssuer, JwtTokenIssuer>();
 builder.Services.AddSingleton<IIdGenerator, NanoIdGenerator>();
+builder.Services.AddSingleton<AdminBootstrapState>();
```

Map the new endpoints next to `app.MapAuthEndpoints();` (`Program.cs:191`):

```diff
 app.MapHealthEndpoints();
 app.MapAuthEndpoints();
+app.MapBootstrapEndpoints();
 app.MapBrandEndpoints();
```

Initialize the state after migrations, before `app.Run();` (`Program.cs:206-208`):

```diff
 await ApplyMigrationsAsync(app);
+await InitializeAdminBootstrapStateAsync(app);

 app.Run();
```

Add the new static method next to `ApplyMigrationsAsync` (end of file):

```csharp
static async Task InitializeAdminBootstrapStateAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
    var state = scope.ServiceProvider.GetRequiredService<AdminBootstrapState>();
    state.Initialize(await userRepository.AnyAsync());
}
```

- [ ] **Step 4: Run the full backend test suite**

Run: `dotnet test src/bazaar-app/backend/Bazaar.sln`
Expected: PASS — includes `DiRegistrationTests.AllApplicationHandlers_AreRegisteredInProgram` (confirms `BootstrapAdminHandler` is registered) and Task 3's `BootstrapEndpointsTests` now passing end-to-end.

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/backend/Bazaar.Api/Program.cs
git commit -m "feat(bazaar-app): wire setup-wizard bootstrap into composition root, drop env-var admin seed"
```

---

### Task 5: `BootstrapStatusService` + `noAdminGuard` + `adminExistsGuard`

**Files:**
- Create: `src/bazaar-app/frontend/src/app/core/bootstrap/bootstrap-status.service.ts`
- Create: `src/bazaar-app/frontend/src/app/core/bootstrap/no-admin.guard.ts`
- Create: `src/bazaar-app/frontend/src/app/core/bootstrap/admin-exists.guard.ts`
- Test: `src/bazaar-app/frontend/src/app/core/bootstrap/no-admin.guard.spec.ts`
- Test: `src/bazaar-app/frontend/src/app/core/bootstrap/admin-exists.guard.spec.ts`

**Interfaces:**
- Produces: `BootstrapStatusService.getStatus(): Observable<{ hasAdmin: boolean }>`; `noAdminGuard: CanActivateFn`; `adminExistsGuard: CanActivateFn`. Consumed by Task 9 (`app.routes.ts`).

- [ ] **Step 1: Write the failing tests**

`no-admin.guard.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { noAdminGuard } from './no-admin.guard';
import { BootstrapStatusService } from './bootstrap-status.service';

describe('noAdminGuard', () => {
  function setup(status: { hasAdmin: boolean } | 'error') {
    const bootstrapStatus = {
      getStatus: () => (status === 'error' ? throwError(() => new Error('down')) : of(status)),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: BootstrapStatusService, useValue: bootstrapStatus }],
    });
    return TestBed.runInInjectionContext(() => noAdminGuard({} as never, {} as never));
  }

  it('allows navigation when an admin already exists', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: true }) as ReturnType<typeof of<boolean>>);
    expect(result).toBe(true);
  });

  it('redirects to /setup when no admin exists yet', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: false }) as ReturnType<typeof of<UrlTree>>);
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('fails open (allows navigation) when the status check errors', async () => {
    const result = await firstValueFrom(setup('error') as ReturnType<typeof of<boolean>>);
    expect(result).toBe(true);
  });
});
```

`admin-exists.guard.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { UrlTree } from '@angular/router';
import { of, firstValueFrom, throwError } from 'rxjs';
import { adminExistsGuard } from './admin-exists.guard';
import { BootstrapStatusService } from './bootstrap-status.service';

describe('adminExistsGuard', () => {
  function setup(status: { hasAdmin: boolean } | 'error') {
    const bootstrapStatus = {
      getStatus: () => (status === 'error' ? throwError(() => new Error('down')) : of(status)),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: BootstrapStatusService, useValue: bootstrapStatus }],
    });
    return TestBed.runInInjectionContext(() => adminExistsGuard({} as never, {} as never));
  }

  it('redirects to /login when an admin already exists', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: true }) as ReturnType<typeof of<UrlTree>>);
    expect(result).toBeInstanceOf(UrlTree);
  });

  it('allows navigation to /setup when no admin exists yet', async () => {
    const result = await firstValueFrom(setup({ hasAdmin: false }) as ReturnType<typeof of<boolean>>);
    expect(result).toBe(true);
  });

  it('fails open (allows navigation) when the status check errors', async () => {
    const result = await firstValueFrom(setup('error') as ReturnType<typeof of<boolean>>);
    expect(result).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm --prefix src/bazaar-app/frontend test -- --run bootstrap-status`
Expected: FAIL (modules under `core/bootstrap/` don't exist)

- [ ] **Step 3: Write minimal implementation**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BootstrapStatus {
  hasAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class BootstrapStatusService {
  private readonly http = inject(HttpClient);

  getStatus(): Observable<BootstrapStatus> {
    return this.http.get<BootstrapStatus>('/api/public/bootstrap-status');
  }
}
```

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

// Fails open (returns true) when the status check errors — the guard is a
// convenience redirect only, the real gate is the backend's admin-protected
// endpoints, which fail correctly on their own if the app is misconfigured.
export const noAdminGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);
  return bootstrapStatus.getStatus().pipe(
    map((status) => (status.hasAdmin ? true : router.createUrlTree(['/setup']))),
    catchError(() => of(true)),
  );
};
```

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { BootstrapStatusService } from './bootstrap-status.service';

export const adminExistsGuard: CanActivateFn = () => {
  const bootstrapStatus = inject(BootstrapStatusService);
  const router = inject(Router);
  return bootstrapStatus.getStatus().pipe(
    map((status) => (status.hasAdmin ? router.createUrlTree(['/login']) : true)),
    catchError(() => of(true)),
  );
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm --prefix src/bazaar-app/frontend test -- --run bootstrap-status`
Expected: PASS (6 tests across both guard specs)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/core/bootstrap/
git commit -m "feat(bazaar-app): add bootstrap-status service and no-admin/admin-exists guards"
```

---

### Task 6: `BootstrapApi` (setup feature data layer)

**Files:**
- Create: `src/bazaar-app/frontend/src/app/features/setup/data/bootstrap-api.ts`
- Test: `src/bazaar-app/frontend/src/app/features/setup/data/bootstrap-api.spec.ts`

**Interfaces:**
- Produces: `BootstrapApi.bootstrapAdmin(username: string, password: string): Observable<{ accessToken: string }>`. Consumed by Task 7 (`SetupPage`).

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { BootstrapApi } from './bootstrap-api';

describe('BootstrapApi', () => {
  let api: BootstrapApi;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(BootstrapApi);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('posts username/password and returns the access token', () => {
    let result: { accessToken: string } | undefined;
    api.bootstrapAdmin('admin', 'changeme1').subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/public/bootstrap-admin');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'admin', password: 'changeme1' });
    req.flush({ accessToken: 'token-123' });

    expect(result).toEqual({ accessToken: 'token-123' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/bazaar-app/frontend test -- --run bootstrap-api`
Expected: FAIL (module doesn't exist)

- [ ] **Step 3: Write minimal implementation**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BootstrapAdminResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class BootstrapApi {
  private readonly http = inject(HttpClient);

  bootstrapAdmin(username: string, password: string): Observable<BootstrapAdminResponse> {
    return this.http.post<BootstrapAdminResponse>('/api/public/bootstrap-admin', { username, password });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/bazaar-app/frontend test -- --run bootstrap-api`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/setup/data/
git commit -m "feat(bazaar-app): add BootstrapApi for setup feature"
```

---

### Task 7: `SetupPage` — Step 1 (Admin-Konto)

**Files:**
- Create: `src/bazaar-app/frontend/src/app/features/setup/setup.routes.ts`
- Create: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.ts`
- Create: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.html`
- Create: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.scss`
- Test: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.spec.ts`

**Interfaces:**
- Consumes: `BootstrapApi.bootstrapAdmin` (Task 6); `AuthService.login(accessToken: string)` (existing, `core/auth/auth.service.ts`).
- Produces: `SetupPage` component with signals `activeStep`, `username`, `password`, `passwordConfirm`, `adminError`, `adminSaving`, `canSubmitAdmin`, method `submitAdmin(activateCallback: (step: number) => void): void`. Task 8 and Task 9 extend this same class with seller-type/brand/category signals and methods — this task establishes the file and Step 1 only.

- [ ] **Step 1: Write the failing test**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { SetupPage } from './setup-page';
import { BootstrapApi } from '../../data/bootstrap-api';
import { AuthService } from '../../../../core/auth/auth.service';
import { SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { BrandsApi } from '../../../brands/data/brands-api';
import { CategoriesApi } from '../../../categories/data/categories-api';

describe('SetupPage - Admin step', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;
  let bootstrapApi: { bootstrapAdmin: jasmine.Spy };
  let authService: { login: jasmine.Spy };

  beforeEach(() => {
    bootstrapApi = { bootstrapAdmin: jasmine.createSpy() };
    authService = { login: jasmine.createSpy() };

    TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: bootstrapApi },
        { provide: AuthService, useValue: authService },
        { provide: SellerTypesApi, useValue: { create: jasmine.createSpy() } },
        { provide: BrandsApi, useValue: { create: jasmine.createSpy() } },
        { provide: CategoriesApi, useValue: { create: jasmine.createSpy() } },
      ],
    });
    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  it('rejects submit when password and confirmation differ', () => {
    component.username.set('admin');
    component.password.set('changeme1');
    component.passwordConfirm.set('different1');
    expect(component.canSubmitAdmin()).toBe(false);
  });

  it('logs in and advances to step 2 on successful bootstrap', () => {
    bootstrapApi.bootstrapAdmin.and.returnValue(of({ accessToken: 'token-123' }));
    component.username.set('admin');
    component.password.set('changeme1');
    component.passwordConfirm.set('changeme1');
    const activateCallback = jasmine.createSpy();

    component.submitAdmin(activateCallback);

    expect(authService.login).toHaveBeenCalledWith('token-123');
    expect(activateCallback).toHaveBeenCalledWith(2);
    expect(component.adminError()).toBeNull();
  });

  it('shows a conflict message when setup was already completed', () => {
    bootstrapApi.bootstrapAdmin.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409 })),
    );
    component.username.set('admin');
    component.password.set('changeme1');
    component.passwordConfirm.set('changeme1');

    component.submitAdmin(jasmine.createSpy());

    expect(component.adminError()).toContain('bereits abgeschlossen');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/bazaar-app/frontend test -- --run setup-page`
Expected: FAIL (module doesn't exist)

- [ ] **Step 3: Write minimal implementation**

```typescript
import { Routes } from '@angular/router';
import { SetupPage } from './pages/setup-page/setup-page';

export const SETUP_ROUTES: Routes = [{ path: '', component: SetupPage }];
```

```typescript
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputPasswordModule } from 'primeng/inputpassword';
import { InputTextModule } from 'primeng/inputtext';
import { StepperModule } from 'primeng/stepper';
import { AuthService } from '../../../../core/auth/auth.service';
import { BootstrapApi } from '../../data/bootstrap-api';
import { SellerType, SellerTypesApi } from '../../../seller-types/data/seller-types-api';
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
import { Category, CategoriesApi } from '../../../categories/data/categories-api';

@Component({
  selector: 'app-setup-page',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    InputPasswordModule,
    InputTextModule,
    StepperModule,
  ],
  templateUrl: './setup-page.html',
  styleUrl: './setup-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupPage {
  private readonly bootstrapApi = inject(BootstrapApi);
  private readonly sellerTypesApi = inject(SellerTypesApi);
  private readonly brandsApi = inject(BrandsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly authService = inject(AuthService);

  // Step 1 - Admin-Konto
  readonly username = signal('');
  readonly password = signal('');
  readonly passwordConfirm = signal('');
  readonly adminError = signal<string | null>(null);
  readonly adminSaving = signal(false);
  readonly canSubmitAdmin = computed(
    () =>
      this.username().trim().length > 0 &&
      this.password().length >= 8 &&
      this.password() === this.passwordConfirm() &&
      !this.adminSaving(),
  );

  // Step 2 - Haendlertypen (Task 8)
  readonly sellerTypeName = signal('');
  readonly sellerTypeCommissionRate = signal(0);
  readonly sellerTypeItemFee = signal(0);
  readonly sellerTypes = signal<SellerType[]>([]);
  readonly sellerTypeSaving = signal(false);
  readonly canAddSellerType = computed(() => this.sellerTypeName().trim().length > 0 && !this.sellerTypeSaving());
  readonly canProceedPastSellerTypes = computed(() => this.sellerTypes().length > 0);

  // Step 3 - Marken/Kategorien (Task 9)
  readonly brandName = signal('');
  readonly brands = signal<Brand[]>([]);
  readonly categoryName = signal('');
  readonly categories = signal<Category[]>([]);

  submitAdmin(activateCallback: (step: number) => void): void {
    if (!this.canSubmitAdmin()) return;
    this.adminError.set(null);
    this.adminSaving.set(true);
    this.bootstrapApi.bootstrapAdmin(this.username().trim(), this.password()).subscribe({
      next: ({ accessToken }) => {
        this.authService.login(accessToken);
        this.adminSaving.set(false);
        activateCallback(2);
      },
      error: (error: unknown) => {
        this.adminSaving.set(false);
        if (error instanceof HttpErrorResponse && error.status === 409) {
          this.adminError.set('Setup wurde bereits abgeschlossen. Bitte melde dich an.');
        } else {
          this.adminError.set('Admin-Konto konnte nicht angelegt werden. Bitte erneut versuchen.');
        }
      },
    });
  }
}
```

```html
<div class="setup-page">
  <p-stepper [value]="1" [linear]="true">
    <p-step-list>
      <p-step [value]="1">Admin-Konto</p-step>
      <p-step [value]="2">Händlertypen</p-step>
      <p-step [value]="3">Marken &amp; Kategorien</p-step>
    </p-step-list>
    <p-step-panels>
      <p-step-panel [value]="1">
        <ng-template #content let-activateCallback="activateCallback">
          <p-card>
            <form (ngSubmit)="submitAdmin(activateCallback)">
              <input pInputText [ngModel]="username()" (ngModelChange)="username.set($event)" name="setup-username" placeholder="Benutzername" required />
              <input pInputPassword [ngModel]="password()" (ngModelChange)="password.set($event)" name="setup-password" placeholder="Passwort" required />
              <input pInputPassword [ngModel]="passwordConfirm()" (ngModelChange)="passwordConfirm.set($event)" name="setup-password-confirm" placeholder="Passwort bestätigen" required />
              @if (adminError()) {
                <p class="setup-page__error">{{ adminError() }}</p>
              }
              <p-button type="submit" label="Weiter" [disabled]="!canSubmitAdmin()" />
            </form>
          </p-card>
        </ng-template>
      </p-step-panel>
      <p-step-panel [value]="2">
        <ng-template #content let-activateCallback="activateCallback">
          <p>Händlertypen folgen in Task 8.</p>
        </ng-template>
      </p-step-panel>
      <p-step-panel [value]="3">
        <ng-template #content let-activateCallback="activateCallback">
          <p>Marken/Kategorien folgen in Task 9.</p>
        </ng-template>
      </p-step-panel>
    </p-step-panels>
  </p-stepper>
</div>
```

```scss
.setup-page {
  max-width: 480px;
  margin: 48px auto;
}

.setup-page__error {
  color: var(--p-red-500);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/bazaar-app/frontend test -- --run setup-page`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/setup/setup.routes.ts src/bazaar-app/frontend/src/app/features/setup/pages/
git commit -m "feat(bazaar-app): add SetupPage step 1 (admin account)"
```

---

### Task 8: `SetupPage` — Step 2 (Händlertypen, Pflicht)

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.html`
- Modify: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.spec.ts`

**Interfaces:**
- Consumes: `SellerTypesApi.create(name, commissionRate, itemFee): Observable<SellerType>` (existing, `features/seller-types/data/seller-types-api.ts`).
- Produces: `SetupPage.addSellerType(): void`, appends to the already-declared `sellerTypes` signal. `canProceedPastSellerTypes` (already declared in Task 7) gates the "Weiter" button in this step's template.

- [ ] **Step 1: Write the failing test**

Append to `setup-page.spec.ts`:

```typescript
describe('SetupPage - Seller types step', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;
  let sellerTypesApi: { create: jasmine.Spy };

  beforeEach(() => {
    sellerTypesApi = { create: jasmine.createSpy() };
    TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: { bootstrapAdmin: jasmine.createSpy() } },
        { provide: AuthService, useValue: { login: jasmine.createSpy() } },
        { provide: SellerTypesApi, useValue: sellerTypesApi },
        { provide: BrandsApi, useValue: { create: jasmine.createSpy() } },
        { provide: CategoriesApi, useValue: { create: jasmine.createSpy() } },
      ],
    });
    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  it('cannot proceed with zero seller types', () => {
    expect(component.canProceedPastSellerTypes()).toBe(false);
  });

  it('adds a seller type and allows proceeding afterwards', () => {
    sellerTypesApi.create.and.returnValue(
      of({ id: 'ST1', name: 'Kleidung', commissionRate: 10, itemFee: 0.5, sellerCount: 0 }),
    );
    component.sellerTypeName.set('Kleidung');
    component.sellerTypeCommissionRate.set(10);
    component.sellerTypeItemFee.set(0.5);

    component.addSellerType();

    expect(sellerTypesApi.create).toHaveBeenCalledWith('Kleidung', 10, 0.5);
    expect(component.sellerTypes()).toEqual([
      { id: 'ST1', name: 'Kleidung', commissionRate: 10, itemFee: 0.5, sellerCount: 0 },
    ]);
    expect(component.sellerTypeName()).toBe('');
    expect(component.canProceedPastSellerTypes()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/bazaar-app/frontend test -- --run setup-page`
Expected: FAIL (`addSellerType` does not exist)

- [ ] **Step 3: Write minimal implementation**

Add to `SetupPage` class (`setup-page.ts`), after `submitAdmin`:

```typescript
  addSellerType(): void {
    if (!this.canAddSellerType()) return;
    this.sellerTypeSaving.set(true);
    this.sellerTypesApi
      .create(this.sellerTypeName().trim(), this.sellerTypeCommissionRate(), this.sellerTypeItemFee())
      .subscribe({
        next: (sellerType) => {
          this.sellerTypes.set([...this.sellerTypes(), sellerType]);
          this.sellerTypeName.set('');
          this.sellerTypeCommissionRate.set(0);
          this.sellerTypeItemFee.set(0);
          this.sellerTypeSaving.set(false);
        },
        error: () => this.sellerTypeSaving.set(false),
      });
  }
```

Replace the Step 2 placeholder in `setup-page.html`:

```html
      <p-step-panel [value]="2">
        <ng-template #content let-activateCallback="activateCallback">
          <p-card>
            <ul>
              @for (sellerType of sellerTypes(); track sellerType.id) {
                <li>{{ sellerType.name }} — {{ sellerType.commissionRate }}% / {{ sellerType.itemFee }} €</li>
              }
            </ul>
            <input pInputText [ngModel]="sellerTypeName()" (ngModelChange)="sellerTypeName.set($event)" name="seller-type-name" placeholder="Name" />
            <p-inputNumber [ngModel]="sellerTypeCommissionRate()" (ngModelChange)="sellerTypeCommissionRate.set($event)" name="seller-type-commission" [suffix]="'%'" />
            <p-inputNumber [ngModel]="sellerTypeItemFee()" (ngModelChange)="sellerTypeItemFee.set($event)" name="seller-type-fee" mode="currency" currency="EUR" />
            <p-button label="Hinzufügen" [disabled]="!canAddSellerType()" (onClick)="addSellerType()" />
            <div class="setup-page__actions">
              <p-button severity="secondary" label="Zurück" (onClick)="activateCallback(1)" />
              <p-button label="Weiter" [disabled]="!canProceedPastSellerTypes()" (onClick)="activateCallback(3)" />
            </div>
          </p-card>
        </ng-template>
      </p-step-panel>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/bazaar-app/frontend test -- --run setup-page`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/
git commit -m "feat(bazaar-app): add SetupPage step 2 (seller types, required)"
```

---

### Task 9: `SetupPage` — Step 3 (Marken/Kategorien, optional) + Abschluss

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.ts`
- Modify: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.html`
- Modify: `src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/setup-page.spec.ts`

**Interfaces:**
- Consumes: `BrandsApi.create(name): Observable<Brand>`, `CategoriesApi.create(name): Observable<Category>` (existing); `AuthService.logout(): void` (existing).
- Produces: `SetupPage.addBrand(): void`, `SetupPage.addCategory(): void`, `SetupPage.finish(): void` (logs out and reloads the page).

- [ ] **Step 1: Write the failing test**

Append to `setup-page.spec.ts`:

```typescript
describe('SetupPage - Brands/categories step and finish', () => {
  let fixture: ComponentFixture<SetupPage>;
  let component: SetupPage;
  let brandsApi: { create: jasmine.Spy };
  let categoriesApi: { create: jasmine.Spy };
  let authService: { login: jasmine.Spy; logout: jasmine.Spy };
  let reloadSpy: jasmine.Spy;

  beforeEach(() => {
    brandsApi = { create: jasmine.createSpy() };
    categoriesApi = { create: jasmine.createSpy() };
    authService = { login: jasmine.createSpy(), logout: jasmine.createSpy() };
    reloadSpy = spyOn(window.location, 'reload').and.stub();

    TestBed.configureTestingModule({
      imports: [SetupPage],
      providers: [
        { provide: BootstrapApi, useValue: { bootstrapAdmin: jasmine.createSpy() } },
        { provide: AuthService, useValue: authService },
        { provide: SellerTypesApi, useValue: { create: jasmine.createSpy() } },
        { provide: BrandsApi, useValue: brandsApi },
        { provide: CategoriesApi, useValue: categoriesApi },
      ],
    });
    fixture = TestBed.createComponent(SetupPage);
    component = fixture.componentInstance;
  });

  it('adds a brand and clears the input', () => {
    brandsApi.create.and.returnValue(of({ id: 'B1', name: 'Nike', original: true, articleCount: 0 }));
    component.brandName.set('Nike');

    component.addBrand();

    expect(brandsApi.create).toHaveBeenCalledWith('Nike');
    expect(component.brands()).toEqual([{ id: 'B1', name: 'Nike', original: true, articleCount: 0 }]);
    expect(component.brandName()).toBe('');
  });

  it('adds a category and clears the input', () => {
    categoriesApi.create.and.returnValue(of({ id: 'C1', name: 'Schuhe', original: true, articleCount: 0 }));
    component.categoryName.set('Schuhe');

    component.addCategory();

    expect(categoriesApi.create).toHaveBeenCalledWith('Schuhe');
    expect(component.categories()).toEqual([{ id: 'C1', name: 'Schuhe', original: true, articleCount: 0 }]);
    expect(component.categoryName()).toBe('');
  });

  it('finish logs out and reloads the page', () => {
    component.finish();

    expect(authService.logout).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/bazaar-app/frontend test -- --run setup-page`
Expected: FAIL (`addBrand`/`addCategory`/`finish` do not exist)

- [ ] **Step 3: Write minimal implementation**

Add to `SetupPage` class (`setup-page.ts`), after `addSellerType`:

```typescript
  addBrand(): void {
    const name = this.brandName().trim();
    if (!name) return;
    this.brandsApi.create(name).subscribe((brand) => {
      this.brands.set([...this.brands(), brand]);
      this.brandName.set('');
    });
  }

  addCategory(): void {
    const name = this.categoryName().trim();
    if (!name) return;
    this.categoriesApi.create(name).subscribe((category) => {
      this.categories.set([...this.categories(), category]);
      this.categoryName.set('');
    });
  }

  finish(): void {
    this.authService.logout();
    window.location.reload();
  }
```

Replace the Step 3 placeholder in `setup-page.html`:

```html
      <p-step-panel [value]="3">
        <ng-template #content let-activateCallback="activateCallback">
          <p-card>
            <section>
              <h3>Marken (optional)</h3>
              <ul>
                @for (brand of brands(); track brand.id) {
                  <li>{{ brand.name }}</li>
                }
              </ul>
              <input pInputText [ngModel]="brandName()" (ngModelChange)="brandName.set($event)" name="brand-name" placeholder="Markenname" />
              <p-button label="Marke hinzufügen" [disabled]="!brandName().trim()" (onClick)="addBrand()" />
            </section>
            <section>
              <h3>Kategorien (optional)</h3>
              <ul>
                @for (category of categories(); track category.id) {
                  <li>{{ category.name }}</li>
                }
              </ul>
              <input pInputText [ngModel]="categoryName()" (ngModelChange)="categoryName.set($event)" name="category-name" placeholder="Kategoriename" />
              <p-button label="Kategorie hinzufügen" [disabled]="!categoryName().trim()" (onClick)="addCategory()" />
            </section>
            <div class="setup-page__actions">
              <p-button severity="secondary" label="Zurück" (onClick)="activateCallback(2)" />
              <p-button label="Setup abschließen" (onClick)="finish()" />
            </div>
          </p-card>
        </ng-template>
      </p-step-panel>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/bazaar-app/frontend test -- --run setup-page`
Expected: PASS (8 tests)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/features/setup/pages/setup-page/
git commit -m "feat(bazaar-app): add SetupPage step 3 (brands/categories) and finish flow"
```

---

### Task 10: Wire routes and guards

**Files:**
- Modify: `src/bazaar-app/frontend/src/app/app.routes.ts`

**Interfaces:**
- Consumes: `noAdminGuard`, `adminExistsGuard` (Task 5); `SETUP_ROUTES` (Task 7).
- Produces: `/setup` route reachable only while no admin exists; `/login` and all Shell-based routes redirect to `/setup` while no admin exists.

- [ ] **Step 1: Write the failing test**

There is no dedicated routing spec in this codebase (`app.routes.ts` has no `.spec.ts`); this task's verification is the full frontend test run plus a manual route check, per Step 4. Skip to Step 3.

- [ ] **Step 2: (skipped — no isolated failing test for a routes array)**

- [ ] **Step 3: Edit `app.routes.ts`**

```diff
 import { Routes } from '@angular/router';
 import { Shell } from './core/shell/shell';
 import { authGuard } from './core/auth/auth.guard';
 import { adminGuard } from './core/auth/admin.guard';
 import { guestGuard } from './core/auth/guest.guard';
 import { passwordChangeGuard } from './core/auth/password-change.guard';
+import { noAdminGuard } from './core/bootstrap/no-admin.guard';
+import { adminExistsGuard } from './core/bootstrap/admin-exists.guard';

 export const routes: Routes = [
-  { path: 'login', canActivate: [guestGuard], loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
+  { path: 'setup', canActivate: [adminExistsGuard], loadChildren: () => import('./features/setup/setup.routes').then((m) => m.SETUP_ROUTES) },
+  { path: 'login', canActivate: [guestGuard, noAdminGuard], loadChildren: () => import('./features/login/login.routes').then((m) => m.LOGIN_ROUTES) },
   {
     path: '',
     component: Shell,
+    canActivate: [noAdminGuard],
     children: [
```

- [ ] **Step 4: Run the full frontend test suite**

Run: `npm --prefix src/bazaar-app/frontend test -- --run`
Expected: PASS (no regressions in existing guard/route-dependent specs)

- [ ] **Step 5: Commit**

```bash
git add src/bazaar-app/frontend/src/app/app.routes.ts
git commit -m "feat(bazaar-app): wire /setup route and no-admin guard into app routing"
```

---

### Task 11: Sync requirements docs and deployment config

**Files:**
- Modify: `docs/requirements/bazaar-app/epics/Epic_Login/epic.md`
- Modify: `docs/requirements/bazaar-app/entities/benutzer.md`
- Modify: `docs/requirements/bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S03-docker-compose-setup.md`
- Modify: `docker-compose.local.yml`
- Modify: `.env.example`

**Interfaces:** none (documentation/config only; no code interfaces).

- [ ] **Step 1: Update `Epic_Login/epic.md`**

Bump frontmatter `updated: 2026-09-20`. Change the index line:

```diff
-- 4. Erststart — Seed-Admin
+- 4. Erststart — Setup-Wizard
```

Replace section 4 body:

```diff
-## 4. Erststart — Seed-Admin
+## 4. Erststart — Setup-Wizard

-Beim ersten Start existiert **genau ein** Admin-Konto. Benutzername und Initialpasswort kommen aus den Environment-Variablen `SEED_ADMIN_USER` und `SEED_ADMIN_PASSWORD`; die App legt das Konto nur an, wenn noch kein Benutzer in der Datenbank steht.
-
-Beim ersten Login mit diesem Konto erzwingt die App den Passwortwechsel. Damit gibt es weder einen Zustand, in dem niemand hereinkommt, noch ein Passwort im Repository.
+Existiert noch kein Benutzer in der Datenbank, leitet die App jeden Aufruf auf `/setup` um (siehe
+[Epic_App_Shell](../Epic_App_Shell/epic.md) für den Guard-Mechanismus). Dort legt der Anwender
+selbst das erste Admin-Konto an (Benutzername + Passwort, sofort ohne Zwangswechsel gültig — er hat
+es ja gerade selbst gewählt), definiert danach mindestens einen Händlertyp
+([Epic_Verkaeufer_Typen](../Epic_Verkaeufer_Typen/epic.md)) und kann optional erste Marken
+([Epic_Marken](../Epic_Marken/epic.md)) und Kategorien ([Epic_Kategorien](../Epic_Kategorien/epic.md))
+anlegen. Nach Abschluss verwirft die App die Sitzung und lädt neu — der Anwender meldet sich mit dem
+gerade angelegten Konto regulär über `/login` an.
+
+Damit gibt es weder einen Zustand, in dem niemand hereinkommt, noch ein Passwort im Repository, und
+kein Environment-Variablen-Geheimnis, das vor dem ersten Start bekannt sein müsste.
```

Replace AC-5:

```diff
-5. **AC-5** — WHEN kein Benutzer in der Datenbank existiert, THEN SHALL das System beim Start genau ein Admin-Konto aus `SEED_ADMIN_USER` und `SEED_ADMIN_PASSWORD` anlegen.
+5. **AC-5** — WHEN kein Benutzer in der Datenbank existiert, THEN SHALL das System jeden Aufruf auf `/setup` umleiten, wo der Anwender selbst Benutzername und Passwort des ersten Admin-Kontos festlegt.
```

- [ ] **Step 2: Update `entities/benutzer.md`**

```diff
-## Seed-Admin
+## Erststart — Setup-Wizard

-Existiert kein Benutzer, legt die App beim Start genau ein Admin-Konto aus den
-Environment-Variablen `SEED_ADMIN_USER` und `SEED_ADMIN_PASSWORD` an, mit
-`mustChangePassword = true`. Damit gibt es weder einen Zustand, in dem niemand hereinkommt,
-noch ein Passwort im Repository.
+Existiert kein Benutzer, leitet die App auf `/setup` um; dort legt der Anwender selbst
+Benutzername und Passwort des ersten Admin-Kontos fest (`mustChangePassword = false` — er hat
+das Passwort gerade selbst gewählt). Damit gibt es weder einen Zustand, in dem niemand
+hereinkommt, noch ein Passwort im Repository, noch ein vorab zu verteilendes Geheimnis.
```

```diff
-- [Epic_Login](../epics/Epic_Login/epic.md) — Anmeldung, Passwortwechsel, Seed-Admin
+- [Epic_Login](../epics/Epic_Login/epic.md) — Anmeldung, Passwortwechsel, Setup-Wizard
```

- [ ] **Step 3: Update `BPROJ-S03-docker-compose-setup.md`**

```diff
-| `SEED_ADMIN_USER` · `SEED_ADMIN_PASSWORD` | erstes Admin-Konto beim Erststart | [Epic_Login](../../Epic_Login/epic.md) Abschnitt 4 |
 | `LOCAL_HOSTNAME` | Hostname im Insel-Betrieb | [BPROJ-S05](BPROJ-S05-ssl-insel-deployment.md) |
```

```diff
-Die Liste steht hier vollständig, weil sonst beim ersten Start auffällt, dass der Seed-Admin nicht angelegt werden kann — und niemand weiß, warum. Neue Variablen späterer Stories werden hier ergänzt.
+Die Liste steht hier vollständig, damit beim ersten Start jede erwartete Variable bekannt ist. Neue Variablen späterer Stories werden hier ergänzt.
```

- [ ] **Step 4: Update `docker-compose.local.yml` and `.env.example`**

`docker-compose.local.yml`:

```diff
       Jwt__SigningKey: ${Jwt__Secret}
-      SEED_ADMIN_USER: ${SEED_ADMIN_USER}
-      SEED_ADMIN_PASSWORD: ${SEED_ADMIN_PASSWORD}
     depends_on:
```

`.env.example`:

```diff
 Jwt__Secret=changeme-min-32-chars
-SEED_ADMIN_USER=admin
-SEED_ADMIN_PASSWORD=changeme
 LOCAL_HOSTNAME=bazaar.local
```

- [ ] **Step 5: Commit**

```bash
git add docs/requirements/bazaar-app/epics/Epic_Login/epic.md docs/requirements/bazaar-app/entities/benutzer.md docs/requirements/bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S03-docker-compose-setup.md docker-compose.local.yml .env.example
git commit -m "docs(bazaar-app): sync Epic_Login/benutzer/compose docs with setup-wizard flow"
```

---

## Self-Review Notes

- **Spec coverage:** Admin-Erzeugung (Task 2/3), Pflicht-Händlertypen (Task 8), optionale Marken/Kategorien (Task 9), Hot-Reload + Redirect auf Login (Task 9 `finish()` + Task 10 guards), Voranmelde-App-Pattern (Task 1 `AdminBootstrapState`/Task 2 double-check) — all covered. Doc/infra sync (Task 11) added beyond the original design doc because `docs/requirements/` is this project's source of truth (`CLAUDE.md`) and three requirement files plus `docker-compose.local.yml`/`.env.example` hard-code the old env-var contract.
- **Type consistency checked:** `BootstrapAdminResponse.accessToken` (backend camelCase wire shape) matches the frontend's `{ accessToken: string }` in `BootstrapApi`/`SetupPage`. `SellerType`/`Brand`/`Category` shapes reused verbatim from their existing `data/*.ts` files, not redefined.
- **Task 3/4 ordering:** Task 3's integration test cannot pass until Task 4 wires DI — called out explicitly in Task 3 Step 4 rather than hidden.
