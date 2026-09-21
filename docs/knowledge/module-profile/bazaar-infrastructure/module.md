# Bazaar.Infrastructure

**Kind:** library
**Artifact:** `src/bazaar-app/backend/Bazaar.Infrastructure/Bazaar.Infrastructure.csproj` → compiled into `Bazaar.Api`
**Purpose:** Implements every `Bazaar.Domain.Ports` interface against PostgreSQL (EF Core/Npgsql) plus the security primitives (password hashing, JWT issuing, ID generation).
**Identity:** The outer hexagon ring on the persistence/security side — depends on both `Bazaar.Domain` and `Bazaar.Application` (needed for `IUnitOfWork`'s transaction-wrapper delegate signature, per `EfUnitOfWork`).
**Maturity:** sketch (file listing + key files read directly — `BazaarDbContext`, `EfUnitOfWork`, `DatabaseResetService`; the 19 repository/query implementations not opened individually)
**Last updated:** 2026-09-21

## Responsibilities
- `Persistence/BazaarDbContext` + 7 `Configurations/` (one per entity needing EF Core fluent config) + `Migrations/` (6 migrations so far, `InitialCreate` → `AddSettings`)
- `Persistence/Repositories/` — 19 implementations, one per `Domain.Ports` repository/query interface
- `Persistence/EfUnitOfWork` — implements `IUnitOfWork`, wraps a retry-safe DB transaction (`CreateExecutionStrategy`)
- `Persistence/DatabaseResetService` — dev-only `EnsureDeleted`+`Migrate`+`AdminBootstrapState.Initialize(false)`, used by the Settings "DB zurücksetzen" button
- `Security/` — `AspNetPasswordHasher` (`IPasswordHasher`), `JwtTokenIssuer`+`JwtOptions` (`ITokenIssuer`), `NanoIdGenerator` (`IIdGenerator`)
- Not responsible for: exposing anything over HTTP (that's Api)

## Consumed By
- `Bazaar.Api` — direct (project reference; every repository/service here is registered in `Program.cs`)
- `Bazaar.Infrastructure.UnitTests` — direct, test (project reference)
- `Bazaar.Architecture.Tests` — direct, test (project reference)

## Public Surface
Every class implementing a `Bazaar.Domain.Ports.I*` interface, plus `BazaarDbContext` itself (used directly by `DatabaseResetService` and by `Program.cs` for `AddDbContext`/health check).

## Talks To
- `Bazaar.Domain` — direct (entities, `Ports` interfaces it implements)
- `Bazaar.Application` — direct (only for `IUnitOfWork`'s `Func<CancellationToken, Task>` delegate shape in `EfUnitOfWork` — narrow coupling, not a general Application dependency)
- PostgreSQL — via Npgsql.EntityFrameworkCore.PostgreSQL
- ASP.NET Core Identity's password hasher (`Microsoft.AspNetCore.Identity` package) — via `AspNetPasswordHasher`

## Structure
`Persistence/` (DbContext, Configurations, Migrations, Repositories, Queries) and `Security/` — two top-level concerns, no further nesting.

## Notes
- `Class1.cs` at the project root is the unmodified `dotnet new classlib` scaffold leftover (`public class Class1 {}`, empty) — dead code, safe-delete candidate.
- `DatabaseResetService` is constructor-injected with `BazaarDbContext` + `AdminBootstrapState` (from `Bazaar.Application.Auth`) — only registered in DI when `Environment.IsDevelopment()`, never reachable in Production.
- Sketch: the 19 repository/query classes were listed but not opened — no verified claim about their internal quality or patterns beyond "one per Domain.Ports interface, folder `Persistence/Repositories`".
