# BAR.Host

**Kind:** service
**Artifact:** `src/advance-registration/backend/BAR.Host/BAR.Host.csproj` → ASP.NET-Core-Prozess (Composition Root); ein Container-Deployment für die gesamte Voranmelde-App-API
**Purpose:** Der einzige deploybare Backend-Prozess der Voranmelde-App. Verdrahtet alle Fach-Module über deren eigene `Add<Modul>Module()`-Extension, mappt sämtliche HTTP-Endpoints, betreibt JWT-Auth/Autorisierung und führt beim Start die Migrationen aller Modul-DbContexts aus.
**Identity:** Composition Root des modularen Monolithen — kennt alle Module, aber keine Abteilung kennt ihn zurück (außer über die Contracts-Facade, die es aufruft).
**Maturity:** reviewed
**Last updated:** 2026-09-15

**Container-Image:** wird per `.github/workflows/advance-registration-docker.yml` gebaut und als `devesen/bazaar-advance-registration-backend` auf Docker Hub veröffentlicht (Trigger: Push auf `master` mit Änderung in `src/advance-registration/**`, oder manuell).

## Responsibilities
- HTTP-Endpoint-Mapping je Feature-Ordner (`Features/Articles`, `Features/Auth`, `Features/Blocks`, `Features/Export`, `Features/Home`, `Features/MasterData`, `Features/Profile`, `Features/Public`, `Features/Sellers`, `Features/SellerTypes`, `Features/Settings`)
- JWT-Bearer-Auth + Autorisierungs-Policies (`authenticated` default, `admin` per Rollen-Claim)
- CORS (Angular-Dev-Origin fix, Produktions-Origin per `CORS_ALLOWED_ORIGIN`)
- Migrations- und DB-Readiness-Check beim Start für alle 4 Modul-DbContexts (Registration, SellerManagement, MasterData, Operations)
- `HomeCompositionService` — modulübergreifende Zusammenstellung für die Home-Seite (Host-seitige Komposition statt in einem Modul)
- Nicht zuständig: keine eigene fachliche Logik — reine Orchestrierung/Transport

## Consumed By
- `BAR.Host.IntegrationTests` — direct, test
- `BAR.Architecture.Tests` — direct, test (prüft Modulgrenzen)

## Public Surface
HTTP-API der Voranmelde-App — Endpoints siehe `Features/*Endpoints.cs`. OpenAPI in Development via `/openapi`. Health-Check `/health/ready`.

## Talks To
- Alle 5 Fach-Module (`MasterData`, `Operations`, `Registration`, `SellerManagement`, `Export`) ausschließlich über deren `.Contracts`-Facade (`I<Modul>ModuleApi`)
- `BAR.SharedKernel`

## Structure
`Program.cs` als Composition Root, `Features/<Bereich>/<Bereich>Endpoints.cs` als Minimal-API-Mapping, `Auth/`, `DomainExceptionHandler.cs` (direkt im Root, kein eigener Unterordner), `Filters/`, `Security/`, `Validation/` (`ValidationFilter`) für Cross-Cutting.

## Notes
- Jedes Modul migriert nur sein eigenes Schema — Reihenfolge der vier Migrationsaufrufe in `Program.cs` ist deshalb irrelevant (Kommentar im Code).
- `DomainExceptionHandler` liegt in `bar-host`, ist also aktuell nicht Bestandteil dieses Profils als eigenes Modul — Teil der Host-Struktur.
- `DomainExceptionHandler` mappt seit 2026-09-15 zusätzlich nackte `ArgumentException` (nicht Teil der `DomainException`-Hierarchie) auf `400 Bad Request`. Grund: Domain-Guard-Clauses wie `Settings.Validate` (Termin-Reihenfolge, `infoText`-Länge) werfen bewusst `ArgumentException` statt eines `DomainException`-Subtyps — ohne diesen Zweig liefen sie unbehandelt durch bis zum generischen 500-Handler.
- Lokaler Dev-Start: `launchSettings.json` Profil `http` → `http://localhost:5001`. Postgres lokal auf Port `5432` (Devcontainer), Connection String in `appsettings.Development.json` (`Host=localhost;Port=5432;Database=bar;Username=bar;Password=dev`). War früher `5433` (Kollisionsvermeidung mit host-seitiger Postgres); seit die `compose.yaml`-DB auf Port `6892` liegt statt auf `5432`, entfällt die Kollision, daher Angleichung auf den Standard-Port.
