# BAR.Modules.Operations.Contracts

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.Operations.Contracts/BAR.Modules.Operations.Contracts.csproj`
**Purpose:** Der einzige erlaubte Zugriffspunkt auf das Operations-Modul — definiert `IOperationsModuleApi` und DTOs.
**Identity:** Contracts-Projekt im dotnet-modulith-bridge-Muster.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- `IOperationsModuleApi`: Settings CRUD + Cross-Modul-Abfragen
- DTOs: `SettingsDto`, `PublicInfoDto`, `NumberingConfigDto`, `BazaarScheduleDto`

## Consumed By
- `BAR.Host` — direct
- `BAR.Modules.MasterData` — direct (`IsDefaultSellerTypeAsync` beim Löschen eines Verkäufertyps)
- `BAR.Modules.Registration` — direct (`GetNumberingConfigAsync` für Blockallokation)
- `BAR.Modules.SellerManagement` — direct (Projektreferenz vorhanden — genauer Verwendungszweck nicht verifiziert, vermutlich Home-Komposition; **Inferenz, nicht gelesen**)
- **Nicht** konsumiert von `BAR.Modules.Export` (Export braucht keine Settings, s. `bar-modules-export`)

## Public Surface
`IOperationsModuleApi`:
- `GetSettingsAsync` / `UpdateSettingsAsync`
- `GetPublicInfoAsync` — anonym, intern mit MasterData komponiert
- `GetNumberingConfigAsync` — für Registration
- `GetBazaarScheduleAsync` — für Home (Host-Komposition)
- `IsDefaultSellerTypeAsync` — für MasterData (Lösch-Schutz)

## Talks To
- `BAR.SharedKernel`

## Structure
`IOperationsModuleApi.cs` im Root, DTOs als Records im selben Namespace.

## Notes
- `SellerManagement`-Konsum ist aus der `.csproj`-Referenz abgeleitet, nicht durch einen tatsächlichen Aufruf im gelesenen Application-Code bestätigt — als Lücke markiert statt geraten zu behaupten.
