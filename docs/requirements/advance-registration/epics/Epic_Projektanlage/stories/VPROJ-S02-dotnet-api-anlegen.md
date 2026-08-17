---
id: VPROJ-S02
status: draft
depends-on: []
---

# Story: .NET Minimal API Projekt anlegen

## Ziel

Ein Entwickler legt das .NET 10 Minimal API Backend der Voranmelde-App als hexagonale Projektstruktur (vier csproj) an und konfiguriert die Grundlage für JWT-Authentifizierung, zentrale Fehlerabbildung, Validierung sowie einen Health-Check-Endpoint.

## Kontext

Das Backend der Voranmelde-App läuft in der Cloud (Azure Container Apps). Es benötigt JWT-Authentifizierung für Login, Rollenprüfungen und geschützte Endpoints. Die JWT-Grundkonfiguration (Middleware, Token-Validation-Parameter) wird hier eingerichtet; die konkreten Auth-Endpoints folgen im Epic_Login.

Die Architektur ist **hexagonal** (verbindliche Quelle: [`spec.md`](../../../spec.md) Abschnitt 10.0.1): Die Domäne
kennt weder EF Core noch ASP.NET. Erzwungen wird das über getrennte Projekte — der
Compiler blockt eine falsche Abhängigkeitsrichtung, nicht bloß eine Konvention.

## Scope

**In Scope:** vier csproj-Projekte samt Solution und Referenzrichtung, CORS für Angular Dev-Server, `/health`-Endpoint, JWT-Bearer-Middleware (`Microsoft.AspNetCore.Authentication.JwtBearer`) installieren und registrieren (ohne konkreten Endpoint), globaler `IExceptionHandler`, generischer FluentValidation-Endpoint-Filter, Konfiguration über `appsettings.json` und Environment-Variablen.

**Out of Scope:** Login-Endpoint, Passwort-Hashing, konkrete Protected-Endpoints (folgen in Epic_Login und fachlichen Epics).

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

Die Feature-Ordner sind ein reiner Ordnerschnitt innerhalb von `Application` und `Api` —
**kein** Hexagon pro Feature. Es gibt einen Bounded Context („Voranmeldung"), dessen
Aggregate (Verkäufer, Artikel, Nummernblock, Stammdaten) sich gegenseitig referenzieren;
Mini-Hexagone würden Ports duplizieren.

## UI-Spezifikation

```
GET /health
→ 200 OK
   { "status": "healthy" }

Alle anderen Endpoints (außer /health, /api/auth/* und /api/public/*):
→ 401 Unauthorized wenn kein gültiges Bearer-Token
```

`/api/public/*` (z. B. `GET /api/public/info`, siehe Epic_Countdown_Widget) ist bewusst ohne Auth — enthält keine sensiblen Daten.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL vier .NET 10 Projekte anlegen — `Bazaar.Api` (`dotnet new webapi`), `Bazaar.Application`, `Bazaar.Domain`, `Bazaar.Infrastructure` (jeweils `classlib`) — und in einer Solution `Bazaar.sln` zusammenfassen.
- [ ] **AC-2** — THE SYSTEM SHALL die Projektreferenzen ausschließlich in dieser Richtung setzen: `Api` → `Application`, `Infrastructure`, `Domain`; `Infrastructure` → `Application`, `Domain`; `Application` → `Domain`; `Domain` → **keine**. `Bazaar.Domain` SHALL kein NuGet-Paket von EF Core, ASP.NET oder Serialisierung referenzieren.
- [ ] **AC-2b** — THE SYSTEM SHALL innerhalb von `Application` und `Api` je Feature einen Ordner `<FeatureName>/` als Konvention etablieren (ein Handler pro Use Case in `Application`, Endpoint-Registrierung + Request-/Response-DTOs in `Api`).
- [ ] **AC-2c** — THE SYSTEM SHALL einen globalen `IExceptionHandler` registrieren, der Domain-Exceptions als einziger Ort auf `ProblemDetails` abbildet (`NotFoundException` → 404, `ConflictException` → 409, `UnauthorizedException` → 401) und dabei zusätzlich zu `detail` das Extension-Member `errorCode` setzt (siehe [`cross-cutting.md`](../../../api/cross-cutting.md) Abschnitt 3).
- [ ] **AC-2d** — THE SYSTEM SHALL `FluentValidation` installieren und einen generischen Endpoint-Filter `ValidationFilter<TRequest>` bereitstellen, der bei Verstoß `Results.ValidationProblem()` mit dem `errors`-Dictionary (Schlüssel = englischer DTO-Feldname) liefert.
- [ ] **AC-3** — THE SYSTEM SHALL CORS konfigurieren: Angular Dev (`http://localhost:4200`) erlaubt; Production-Origin über die Environment-Variable `CORS_ALLOWED_ORIGIN` konfigurierbar.
- [ ] **AC-4** — THE SYSTEM SHALL einen `GET /health` Endpoint bereitstellen, der ohne Auth `{ "status": "healthy" }` mit HTTP 200 zurückgibt und **keine** Datenbankprüfung enthält — er dient als Liveness-Probe. Der Readiness-Endpoint `GET /health/ready` mit Datenbankprüfung entsteht in [VPROJ-S04](VPROJ-S04-efcore-datenbank-setup.md).
- [ ] **AC-4b** — THE SYSTEM SHALL Endpoints unter `/api/public/*` von der Auth-Pflicht ausnehmen (analog `/health` und `/api/auth/*`).
- [ ] **AC-5** — THE SYSTEM SHALL `Microsoft.AspNetCore.Authentication.JwtBearer` installieren und in `Program.cs` mit `AddAuthentication().AddJwtBearer()` registrieren; Token-Parameter (Issuer, Audience, Secret) aus Environment-Variablen lesen.
- [ ] **AC-6** — WHEN die App mit `dotnet run` gestartet wird, THEN SHALL `GET /health` unter `http://localhost:5001/health` mit HTTP 200 antworten.
- [ ] **AC-7** — THE SYSTEM SHALL alle Secrets (JWT-Secret, DB-Passwort) ausschließlich über Environment-Variablen oder User Secrets lesen — keine Hardcodes.

## Tags & Piles

**Tags:** #dotnet #setup #minimal-api #jwt #health-check #cors
