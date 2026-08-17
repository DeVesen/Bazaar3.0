---
id: BPROJ-S02
status: draft
depends-on: []
---

# Story: .NET Minimal API Projekt anlegen

## Ziel

Ein Entwickler legt das .NET 10 Minimal API Backend der Haupt-App als hexagonale Projektstruktur (vier csproj) an und konfiguriert die Grundlage für JWT-Authentifizierung, zentrale Fehlerabbildung, Validierung sowie einen Health-Check-Endpoint.

## Kontext

Die Architektur ist **hexagonal** (verbindliche Quelle: [`spec.md`](../../../spec.md) Abschnitt 7.0.1): Die Domäne kennt weder EF Core noch ASP.NET. Erzwungen wird das über getrennte Projekte — der Compiler blockt eine falsche Abhängigkeitsrichtung, nicht bloß eine Konvention.

Die Haupt-App hat Login mit Rollen (Admin, Kassenpersonal — siehe [Epic_Login](../../Epic_Login/epic.md)). Die JWT-Grundkonfiguration (Middleware, Token-Validation-Parameter) wird hier eingerichtet; die konkreten Auth-Endpoints folgen im Epic_Login.

CORS wird **ausschließlich in der Development-Umgebung** gebraucht: Dort läuft der Angular Dev-Server auf `localhost:4200` gegen das Backend auf `localhost:5000`, also zwei Origins. Im Insel-Betrieb liefert nginx Frontend und `/api/*` unter demselben Origin aus (siehe [BPROJ-S05](BPROJ-S05-ssl-insel-deployment.md)) — dort ist CORS per Definition nicht beteiligt. Eine Policy, die produktiv nichts tut, aber konfiguriert werden muss, ist eine Fehlerquelle ohne Nutzen.

## Scope

**In Scope:** vier csproj-Projekte samt Solution und Referenzrichtung, `/health`-Endpoint, CORS für den Angular Dev-Server (nur Development), JWT-Bearer-Middleware installieren und registrieren (ohne konkreten Endpoint), globaler `IExceptionHandler`, generischer FluentValidation-Endpoint-Filter, Konfiguration über `appsettings.json` und Environment-Variablen.

**Out of Scope:** Login-Endpoint, Passwort-Hashing, konkrete Protected-Endpoints (folgen in Epic_Login und den fachlichen Epics), Datenbankverbindung (folgt in [BPROJ-S04](BPROJ-S04-efcore-datenbank-setup.md)), Testprojekte (folgen in [BPROJ-S06](BPROJ-S06-test-und-architektur-setup.md)).

## Projektstruktur

```
backend/
├── Bazaar.sln
├── Bazaar.Domain/          ← referenziert NICHTS
│   ├── <Aggregate>/        ← Entities, Value Objects, Domain-Services
│   └── Ports/              ← Repository- und Query-Interfaces
├── Bazaar.Application/     ← → Domain
│   └── <Feature>/          ← ein Handler pro Use Case
├── Bazaar.Infrastructure/  ← → Domain, Application
│   └── Persistence/        ← BazaarDbContext, Configurations/, Repositories/, Queries/
└── Bazaar.Api/             ← → alle
    ├── Features/<Feature>/ ← Endpoint-Registrierung (Map…-Extension) + Request/Response-DTOs
    ├── Filters/            ← ValidationFilter<TRequest>
    └── ExceptionHandling/  ← Exception-Typ → ProblemDetails
```

Die Feature-Ordner sind ein reiner Ordnerschnitt innerhalb von `Application` und `Api` — **kein** Hexagon pro Feature. Es gibt einen Bounded Context („Basar-Betrieb"), dessen Aggregate (Verkäufer, Artikel, Stammdaten, Benutzer) sich gegenseitig referenzieren; Mini-Hexagone würden Ports duplizieren.

Aggregierte Sichten (Statistik, Abrechnung) laufen über eigene **Query-Ports** in `Domain/Ports/` mit Implementierung in `Infrastructure/Persistence/Queries/` — ein Repository pro Aggregate, kein generisches `IRepository<T>`, kein `IQueryable` über die Portgrenze.

## UI-Spezifikation

```
GET /health
→ 200 OK
   { "status": "healthy" }

Alle anderen Endpoints (außer /health und /api/auth/login):
→ 401 Unauthorized wenn kein gültiges Bearer-Token
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL vier .NET 10 Projekte anlegen — `Bazaar.Api` (`dotnet new webapi`), `Bazaar.Application`, `Bazaar.Domain`, `Bazaar.Infrastructure` (jeweils `classlib`) — und in einer Solution `Bazaar.sln` zusammenfassen.
- [ ] **AC-2** — THE SYSTEM SHALL die Projektreferenzen ausschließlich in dieser Richtung setzen: `Api` → `Application`, `Infrastructure`, `Domain`; `Infrastructure` → `Application`, `Domain`; `Application` → `Domain`; `Domain` → **keine**. `Bazaar.Domain` SHALL kein NuGet-Paket von EF Core, ASP.NET oder Serialisierung referenzieren.
- [ ] **AC-3** — THE SYSTEM SHALL innerhalb von `Application` und `Api` je Feature einen Ordner `<FeatureName>/` als Konvention etablieren (ein Handler pro Use Case in `Application`, Endpoint-Registrierung + Request-/Response-DTOs in `Api`).
- [ ] **AC-4** — THE SYSTEM SHALL einen globalen `IExceptionHandler` registrieren, der Domain-Exceptions als einziger Ort auf `ProblemDetails` (RFC 9457) abbildet (`NotFoundException` → 404, `ConflictException` → 409, `UnauthorizedException` → 401).
- [ ] **AC-5** — THE SYSTEM SHALL `FluentValidation` installieren und einen generischen Endpoint-Filter `ValidationFilter<TRequest>` bereitstellen, der bei Verstoß `Results.ValidationProblem()` mit dem `errors`-Dictionary (Schlüssel = englischer DTO-Feldname) liefert.
- [ ] **AC-6** — THE SYSTEM SHALL CORS ausschließlich in der `Development`-Umgebung registrieren und dort `http://localhost:4200` erlauben. In `Production` SHALL keine CORS-Policy registriert werden.
- [ ] **AC-7** — THE SYSTEM SHALL einen `GET /health` Endpoint bereitstellen, der ohne Auth `{ "status": "healthy" }` mit HTTP 200 zurückgibt.
- [ ] **AC-8** — THE SYSTEM SHALL `Microsoft.AspNetCore.Authentication.JwtBearer` installieren und in `Program.cs` mit `AddAuthentication().AddJwtBearer()` registrieren; Token-Parameter (Issuer, Audience, Secret) aus Environment-Variablen lesen.
- [ ] **AC-9** — WHEN die App mit `dotnet run` gestartet wird, THEN SHALL `GET /health` unter `http://localhost:5000/health` mit HTTP 200 antworten.
- [ ] **AC-10** — THE SYSTEM SHALL alle konfigurierbaren Werte (Port, JWT-Secret, Connection String) aus `appsettings.json` bzw. Environment-Variablen lesen — keine Hardcodes.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #dotnet #setup #minimal-api #hexagonal #jwt #health-check #cors
