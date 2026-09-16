# BAR.Modules.SellerManagement

**Kind:** library
**Artifact:** `src/advance-registration/backend/BAR.Modules.SellerManagement/BAR.Modules.SellerManagement.csproj` → kompiliert in den BAR.Host-Prozess
**Purpose:** Authentifizierung (Login/Register/Refresh/SetPassword), Verkäufer-Stammdaten (Sellers) und Verkäufer-Profil-Verwaltung.
**Identity:** Einziges Modul mit eigener Security-Infrastruktur (Passwort-Hashing, JWT-Ausstellung) — der Rest des Systems verlässt sich auf seine ausgestellten Tokens.
**Maturity:** reviewed
**Last updated:** 2026-09-15

## Responsibilities
- Auth: Register, Login, Refresh, SetPassword, BootstrapAdmin (JWT-Ausstellung via `JwtTokenIssuer`, Hashing via `BCryptPasswordHasher`)
- Bootstrap: erster Admin ohne fest verdrahteten Seed — `AdminBootstrapState` (einmal pro Prozessstart berechnet) + `BootstrapAdminCommandHandler`, siehe `bootstrap-admin` Feature-Profil
- Seller-CRUD, Invite, `SellerCascadeDeleter` (kaskadiertes Löschen über Registration hinweg), `SellerBlockAllocationCoordinator`
- Profil: GetProfile, UpdateProfile, ChangeEmail, ChangePassword, DeleteProfile
- Nicht zuständig: kennt Verkäufertyp-Konditionen nicht selbst (fragt MasterData), kennt Artikel/Blöcke nicht selbst (fragt Registration)

## Consumed By
- `BAR.Host` — direct (DI-Registrierung `AddSellerManagementModule`, Endpoints)
- `BAR.Application.UnitTests`, `BAR.Domain.UnitTests` — direct, test

## Public Surface
Kein eigener Vertrag über die Modulgrenze — Vertrag ist `ISellerManagementModuleApi` in `bar-modules-sellermanagement-contracts`.

## Talks To
- `BAR.SharedKernel`
- `BAR.Modules.SellerManagement.Contracts` (implementiert dessen Interface)
- `BAR.Modules.MasterData.Contracts` — **einzige einseitige** Cross-Modul-Abhängigkeit im Konstruktor (`IMasterDataModuleApi` direkt injiziert, nicht lazy) für Verkäufertyp-Konditionen/Export-Zuordnung
- `BAR.Modules.Registration.Contracts`, `BAR.Modules.Operations.Contracts` — lazy per `IServiceProvider` (bidirektional)
- JWT-Ausstellung liest `JwtOptions` aus `BAR.Modules.SellerManagement.Contracts.Security` — Host validiert dieselbe Konfiguration

## Structure
`Application/Auth/{BootstrapAdmin,Login,Refresh,Register,SetPassword}/`, `Application/Profile/{ChangeEmail,ChangePassword,DeleteProfile,GetProfile,UpdateProfile}/`, `Application/Sellers/{Create,Delete,Invite,List,Update}/`, `Application/Sellers/{SellerBlockAllocationCoordinator,SellerCascadeDeleter}.cs`, `Domain/Auth/RefreshToken.cs`, `Domain/Sellers/Seller.cs`, `Infrastructure/Security/{BCryptPasswordHasher,JwtTokenIssuer}.cs`, `Infrastructure/Persistence/EfUnitOfWork.cs`.

## Notes
- `SellerManagementModuleApi` injiziert `IMasterDataModuleApi` direkt im Konstruktor statt lazy — laut Code-Kommentar unproblematisch, weil diese Abhängigkeit einseitig ist (MasterData ruft nicht zurück in SellerManagement in dieser Konstellation).
- Last-Admin-Schutz (`ISellerRepository.CountAdminsAsync`) sitzt nicht mehr nur im Delete-Handler: `GetSellersQueryHandler` berechnet daraus pro Zeile das `CanDelete`-Flag (auch `false` für den eigenen Account), `UpdateSellerCommandHandler` berechnet es separat (ohne Self-Check, weil seine Response nicht in der Tabelle landet), `CreateSellerCommandHandler` liefert für frisch angelegte Verkäufer immer `true`.
