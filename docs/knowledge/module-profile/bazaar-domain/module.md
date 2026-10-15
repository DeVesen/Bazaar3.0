# Bazaar.Domain

**Kind:** library
**Artifact:** `src/bazaar-app/backend/Bazaar.Domain/Bazaar.Domain.csproj` → compiled into every other Bazaar.* project
**Purpose:** Domain model and ports for the Bazaar-Haupt-App backend — entities, the `Ports` interfaces every other layer implements or consumes, and domain exceptions. Zero external package references.
**Identity:** The innermost hexagon of the Haupt-App's hexagonal backend (per project CLAUDE.md §7.0.1) — no dependencies on anything else in the solution.
**Maturity:** reviewed
**Last updated:** 2026-10-15

## Responsibilities
- Entities: `Article`, `Brand`, `Category`, `Seller`, `SellerType`, `Settings`, `User` (+ `Role`, `ArticleStatus`), `SettlementCalculation`
- All repository/query/infrastructure-port interfaces (`Ports/I*`) — 19 interfaces, e.g. `IUserRepository`, `IUnitOfWork`, `IPasswordHasher`, `ITokenIssuer`, `IIdGenerator`, plus one dedicated read-model query interface per non-trivial read (`ISellerCardsQuery`, `IStatisticsQuery`, etc.)
- `DomainException` (base for domain-level errors)
- Not responsible for: persistence, HTTP, validation rules beyond what the entities enforce themselves

## Consumed By
- `Bazaar.Application` — direct (project reference)
- `Bazaar.Infrastructure` — direct (project reference)
- `Bazaar.Api` — direct (project reference)
- `Bazaar.Domain.UnitTests` — direct, test (project reference)
- `Bazaar.Infrastructure.UnitTests` — direct, test (project reference)
- `Bazaar.Architecture.Tests` — direct, test (project reference; NetArchTest boundary checks)

## Public Surface
Every public type under `Article/`, `Brand/`, `Category/`, `Seller/`, `SellerType/`, `Settings/`, `Settlement/`, `User/`, `Exceptions/`, `Ports/` is the surface — this is a pure model+contracts library, nothing is internal.

## Talks To
- Nothing outward — leaf of the dependency graph, confirmed via its `.csproj` (no `ProjectReference`, no `PackageReference`).

## Structure
One folder per entity/concept at the root (`Article/`, `Brand/`, `Category/`, `Seller/`, `SellerType/`, `Settings/`, `User/`), plus `Ports/` (all interfaces) and `Exceptions/`. Flat — no sub-namespacing beyond that.

## Notes
- Zero-dependency by design — this is what lets `Bazaar.Application`/`Bazaar.Infrastructure` be swapped/tested independently (matches the hexagonal architecture mandated in the app's own CLAUDE.md).
- Nachtrag 2026-10-15 (aus Commit-Sichtung, `Article.cs`/`IArticleRepository.cs` gelesen): neuer Port `Ports/IArticleTableReader` (Zeilen einer XLSX-/XLS-/CSV-Datei lesen, implementiert in `Bazaar.Infrastructure/Files/ArticleTableReader`); `Article.Renumber(number, now)` ändert die Artikelnummer; `IArticleRepository.GetMaxNumber()`. Beim Seller ist `Ort` Pflicht und `E-Mail` optional (Commits `a8dc75d5`, `d4aba87a`). Die Zahl „19 Interfaces“ oben wurde nicht neu gezählt.
