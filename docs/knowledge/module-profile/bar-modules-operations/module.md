# BAR.Modules.Operations

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.Operations/BAR.Modules.Operations.csproj` → kompiliert in den BAR.Host-Prozess
**Purpose:** Verwaltet die Basar-weiten Einstellungen (Nummernkreis-Parameter, Basar-Zeitraum, Default-Verkäufertyp) und die öffentliche Info-Seite.
**Identity:** Kleinstes der 5 Fach-Module — ein Singleton-artiger Settings-Datensatz statt einer Entitätensammlung.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- Settings CRUD (`StartNumber`, `BlockSize`, `DefaultBlockCount`, `BazaarFrom/Until`, `DefaultTypeId`)
- `GetPublicInfoAsync` — anonym zugängliche Info, intern mit MasterData komponiert
- Nicht zuständig: kennt Verkäufertypen/Artikel nicht selbst, fragt bei MasterData/Registration nach

## Consumed By
- `BAR.Host` — direct (DI-Registrierung `AddOperationsModule`, Endpoints)
- `BAR.Application.UnitTests`, `BAR.Domain.UnitTests` — direct, test

## Public Surface
Kein eigener Vertrag über die Modulgrenze — Vertrag ist `IOperationsModuleApi` in `bar-modules-operations-contracts`.

## Talks To
- `BAR.SharedKernel`
- `BAR.Modules.Operations.Contracts` (implementiert dessen Interface)
- `BAR.Modules.MasterData.Contracts` (Default-Verkäufertyp-Existenzprüfung), `BAR.Modules.Registration.Contracts` (Nummernkreis-Validierung) — bidirektional, lazy per `IServiceProvider`

## Structure
`Application/PublicInfo/GetPublicInfoQueryHandler.cs`, `Application/Settings/{GetSettings,Update}/`, `Application/OperationsModuleApi.cs`, `Domain/Settings.cs`, `Domain/Ports/ISettingsRepository.cs`, `Infrastructure/Persistence/*`.

## Notes
- Gleiches Lazy-Resolution-Muster wie MasterData/Registration/SellerManagement — Vermeidung eines DI-Konstruktionszyklus durch die bidirektionale Contracts-Abhängigkeit.
