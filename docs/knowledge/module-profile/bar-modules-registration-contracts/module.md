# BAR.Modules.Registration.Contracts

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.Registration.Contracts/BAR.Modules.Registration.Contracts.csproj`
**Purpose:** Der einzige erlaubte Zugriffspunkt auf das Registration-Modul — definiert `IRegistrationModuleApi`, DTOs und die Exception `ArticleNumberConflictException`.
**Identity:** Contracts-Projekt im dotnet-modulith-bridge-Muster; am breitesten konsumierte Contracts-Schnittstelle neben SellerManagement.Contracts.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- `IRegistrationModuleApi`: Article/Block CRUD + zahlreiche Cross-Modul-Abfragen
- DTOs: `ArticleDto`, `BlockDto`, `RegistrationDashboardStatsDto`, weitere Result-DTOs
- `ArticleNumberConflictException`

## Consumed By
- `BAR.Host` — direct
- `BAR.Modules.Export` — direct (`GetArticlesForExportAsync`)
- `BAR.Modules.MasterData` — direct (`CountArticlesWithBrandNameAsync`/`CountArticlesWithCategoryNameAsync` — In-Use-Check beim Löschen)
- `BAR.Modules.Operations` — direct (`ExistsArticleNumberBelowAsync` — Validierung neuer Startnummer in den Settings)
- `BAR.Modules.SellerManagement` — direct (`AllocateInitialBlocksAsync`, `DeleteAllForSellerAsync`, `GetBlockSummariesForSellersAsync`)
- `BAR.Modules.Registration` — direct (implementiert das Interface)

## Public Surface
`IRegistrationModuleApi` — u.a.:
- Article/Block CRUD, `GetNextNumberAsync`
- `AllocateInitialBlocksAsync` — für SellerManagement bei Register/CreateSeller
- `CountArticlesWithBrandNameAsync`/`CountArticlesWithCategoryNameAsync` — für MasterData
- `ExistsArticleNumberBelowAsync` — für Operations
- `CountArticlesForSellerAsync`, `GetDashboardStatsAsync` — für Home (Host-Komposition, Seller- bzw. Admin-Ansicht)
- `GetBlockSummariesForSellersAsync` — für die Verkäuferliste (N+1 vermeiden)
- `GetArticlesForExportAsync` — für Export
- `DeleteAllForSellerAsync` — kaskadierendes Löschen (best effort) für SellerManagement

## Talks To
- `BAR.SharedKernel`

## Structure
`IRegistrationModuleApi.cs` im Root, `Articles/ArticleDto.cs`, `Blocks/BlockDto.cs`, `ArticleNumberConflictException.cs`, `RegistrationDashboardStatsDto.cs`.

## Notes
- Jede Cross-Modul-Methode ist per XML-Doc-Kommentar dem aufrufenden Konsumenten zugeordnet — direkt im Interface nachlesbar.
