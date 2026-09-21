# Bazaar.Api

**Kind:** service
**Artifact:** `src/bazaar-app/backend/Bazaar.Api/Bazaar.Api.csproj` (`Microsoft.NET.Sdk.Web`) → ASP.NET Core Kestrel host, the Haupt-App's single backend deployable (per project CLAUDE.md: "Deployment Monolith, ein Container je App")
**Purpose:** Composition root + HTTP surface for the whole Haupt-App backend — wires every DI registration, maps every endpoint group, owns the auth/exception-handling pipeline.
**Identity:** `Bazaar.Api` is literally the process that runs — `dotnet run`/the container entrypoint. Referenced by nothing except its own test projects.
**Maturity:** reviewed
**Last updated:** 2026-09-21

## Responsibilities
- Composition root: ~70 `AddScoped`/`AddSingleton` lines in `Program.cs` wiring every `Domain.Ports` interface to its `Infrastructure` implementation, and every `Application` handler
- Auth: JWT bearer authentication (`Microsoft.AspNetCore.Authentication.JwtBearer`) + one authorization policy (`"admin"`, `RequireClaim("role", "admin")`)
- 15 endpoint-mapping groups (`Features/*/`: Admin, Articles, Auth, Brands, Categories, Import, Intake, Public (Bootstrap+Health), Release, Sales, SellerTypes, Sellers, Settings, Settlement, Statistics, Users)
- Exception handling: `DomainExceptionHandler` (`IExceptionHandler`) + `AddProblemDetails`
- Health check at `/health` (`Features/Public/HealthEndpoints.cs`), DB-context-aware
- Not responsible for: business logic (delegates to Application handlers) or persistence details (delegates to Infrastructure)

## Consumed By
- `Bazaar.Api.IntegrationTests` — direct, test (project reference; spins up the real host, testcontainers-based Postgres)
- `Bazaar.Api.UnitTests` — direct, test (project reference)
- `Bazaar.Architecture.Tests` — direct, test (project reference)
- Frontend (`src/bazaar-app/frontend`) — not a project-reference consumer; talks over HTTP only (`/api/*`), proxied via `proxy.conf.json` → `https://localhost:7006` in dev

## Public Surface
The full HTTP endpoint surface — every `Map*Endpoints()` call in `Program.cs`, e.g. `/api/public/bootstrap-status`, `/api/public/bootstrap-admin`, `/api/public/setup-complete`, `/api/admin/dev-tools/status`+`/reset-database` (dev-only), `/api/auth/*`, `/api/brands`, `/api/categories`, `/api/seller-types`, `/api/settings`, `/api/sellers`, `/api/articles`, `/api/intake`, `/api/release`, `/api/sales`, `/api/settlement`, `/api/statistics`, `/api/import`, `/api/users`, `/health`.

## Talks To
- `Bazaar.Domain`, `Bazaar.Application`, `Bazaar.Infrastructure` — direct (project references, composition root)
- PostgreSQL — via `Bazaar.Infrastructure`'s `BazaarDbContext`
- Angular dev server — CORS policy `"bazaar-dev"`, but only registered/used when `Environment.IsDevelopment()` — no CORS policy object exists at all in Production

## Structure
`Features/<Area>/` per endpoint group (each a static class with one `Map<Area>Endpoints()` extension method + a `Dtos.cs`), `ExceptionHandling/`, `Filters/` (`ValidationFilter<T>` — generic FluentValidation endpoint filter), `Json/AppJsonOptions`, and `Program.cs` as the single wiring point.

## Notes
- Two dev-only features gated identically on `Environment.IsDevelopment()`: the CORS policy, and `Features/Admin/DevToolsEndpoints` + `DatabaseResetService` registration (the Settings "DB zurücksetzen" button's backend half).
- `InternalsVisibleTo` for `Bazaar.Api.IntegrationTests` and `Bazaar.Api.UnitTests` — those two test projects can reach internal types, not just the public endpoint surface.
- `POST /api/public/setup-complete` and `POST /api/public/bootstrap-admin` are both `AllowAnonymous()` — intentional, guarded instead by `AdminBootstrapState`/`IUserRepository.AnyAsync()` checks inside their handlers (409 once an admin exists), not by auth middleware.
