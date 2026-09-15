# BAR.Modules.SellerManagement.Contracts

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.SellerManagement.Contracts/BAR.Modules.SellerManagement.Contracts.csproj`
**Purpose:** Der einzige erlaubte Zugriffspunkt auf das SellerManagement-Modul — definiert `ISellerManagementModuleApi`, Auth-/Profil-/Seller-DTOs und `JwtOptions`.
**Identity:** Contracts-Projekt im dotnet-modulith-bridge-Muster; einziges Contracts-Projekt, das auch Security-Konfiguration (`JwtOptions`) trägt, weil Host dieselbe Konfiguration für die Token-Validierung braucht.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- `ISellerManagementModuleApi`: Auth, Seller-CRUD, Profil-CRUD + Cross-Modul-Abfragen
- DTOs: `SellerDto`, `ProfileDto`, `TokenPairDto`, `PagedResultDto<T>`, weitere
- `JwtOptions` — von SellerManagement zum Signieren, von Host zum Validieren gelesen (siehe `bar-host`)

## Consumed By
- `BAR.Host` — direct (Auth-Endpoints + JWT-Validierungskonfiguration)
- `BAR.Modules.Export` — direct (`GetAllSellersForExportAsync`)
- `BAR.Modules.MasterData` — direct (`CountSellersByTypeAsync` — Lösch-Schutz für Verkäufertypen)
- `BAR.Modules.Operations` — direct (Projektreferenz vorhanden, konkreter Aufruf nicht verifiziert — **Inferenz**)
- `BAR.Modules.Registration` — direct (`GetSellerNamesAsync`, `FindSellerIdsByNameAsync` für Admin-Artikelübersicht/-Suche)
- `BAR.Modules.SellerManagement` — direct (implementiert das Interface)

## Public Surface
`ISellerManagementModuleApi` — u.a.:
- Auth: `RegisterAsync`, `LoginAsync`, `RefreshAsync`, `SetPasswordAsync`
- Sellers: `GetSellersAsync` (paged), `CreateSellerAsync`, `UpdateSellerAsync`, `DeleteSellerAsync`, `InviteSellerAsync`
- Profile: `GetProfileAsync`, `UpdateProfileAsync`, `ChangeEmailAsync`, `ChangePasswordAsync`, `DeleteProfileAsync`
- `CountSellersByTypeAsync` — für MasterData
- `GetSellerConditionsAsync` — für Home (Host-Komposition, Seller-Ansicht)
- `GetAllSellersForExportAsync`, `GetSellerCountAsync` — für Export bzw. Home (Admin-Ansicht)
- `GetSellerNamesAsync`/`FindSellerIdsByNameAsync` — für Registration

## Talks To
- `BAR.SharedKernel`

## Structure
`ISellerManagementModuleApi.cs` im Root, `Auth/{AuthCommands,JwtOptions liegt in Security/}`, `Profile/ProfileDto.cs`, `Sellers/SellerDto.cs`, `Common.cs` (`PagedResultDto<T>`), `Security/JwtOptions.cs`.

## Notes
- `Operations`-Konsum ist aus der `.csproj`-Referenz abgeleitet, nicht durch gelesenen Application-Code bestätigt — als Lücke markiert.
