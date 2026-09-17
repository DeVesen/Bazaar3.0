---
round: Round-2
status: geklärt
---

# Spec: Round 2 — .NET Minimal API Backend anlegen

## Fein-Spezifikation

### Ziel

Lauffähiges Backend-Grundgerüst der Haupt-App unter `src/bazaar-app/backend/` im
hexagonalen Vier-Projekt-Schnitt (`Bazaar.Domain` / `.Application` / `.Infrastructure` /
`.Api`), compiler-erzwungene Abhängigkeitsrichtung, `GET /health` ohne Auth, JWT-Bearer-
Middleware registriert (ohne Login-Endpoint), globaler `IExceptionHandler`, generischer
FluentValidation-Filter, CORS nur in Development. Keine Fachlichkeit, keine DB-Anbindung,
keine Docker-Containerisierung (jeweils eigene Rounds/Stories).

### Übernommene Muster aus der Referenz-App

[`src/advance-registration/backend`](../../../../src/advance-registration/backend) ist
zwar ein **modularer Monolith** (andere Architektur-Achse als die hier hexagonale
Haupt-App — siehe CLAUDE.md-Architektur-Tabelle), liefert aber für Querschnittsthemen,
die architekturunabhängig sind, direkt übernehmbare Muster:

- `Directory.Build.props` mit zentralem `TargetFramework=net10.0`,
  `TreatWarningsAsErrors=true`, `Nullable=enable`, `ImplicitUsings=enable` sowie der
  `TestingPlatformDotnetTestSupport`-Property für spätere xUnit-v3-Testprojekte
  (BPROJ-S06) — **hier bereits als Grundlage anlegen**, auch wenn Testprojekte selbst
  erst in BPROJ-S06 entstehen.
- `IExceptionHandler`-Pattern
  ([`BAR.Host/DomainExceptionHandler.cs`](../../../../src/advance-registration/backend/BAR.Host/DomainExceptionHandler.cs)):
  `switch` über eine `DomainException`-Hierarchie → `ProblemDetails` mit `errorCode` in
  `Extensions`. Für Round-2 ohne die App-spezifischen Ausnahmefälle (kein
  `ArticleNumberConflictException`-Sonderfall) — nur das generische Grundgerüst
  `NotFoundException`→404, `ConflictException`→409, `UnauthorizedException`→401,
  `ForbiddenException`→403.
- JWT-Bearer-Registrierung
  ([`BAR.Host/Program.cs`](../../../../src/advance-registration/backend/BAR.Host/Program.cs)
  Zeilen 62–79): `MapInboundClaims = false`, `TokenValidationParameters` aus
  `JwtOptions`-Konfigurationsobjekt, `RoleClaimType`/`NameClaimType` literal `"role"`/
  `"sub"`. AC-8 verlangt hier nur Issuer/Audience/Secret aus Env-Variablen — Audience-
  Validierung bleibt für Round-2 offen (`ValidateAudience = false`, analog Referenz),
  da noch keine konkreten Claims existieren.
- CORS-Policy nur unter `Development`
  ([`Program.cs`](../../../../src/advance-registration/backend/BAR.Host/Program.cs)
  Zeilen 85–96), hier ohne den Produktions-Origin-Zweig (BPROJ-S02 AC-6: in Production
  **keine** CORS-Policy, nicht einmal eine leere).
- `HealthEndpoints`-Pattern
  ([`Features/Public/HealthEndpoints.cs`](../../../../src/advance-registration/backend/BAR.Host/Features/Public/HealthEndpoints.cs)):
  reiner Liveness-Check ohne DB. Die DB-Erweiterung (`/health` liefert `503` bei fehlender
  Verbindung, laut BPROJ-S02 AC-7) kommt erst mit BPROJ-S04 (EF Core) — **kein**
  zusätzlicher `/health/ready`-Endpoint in Round-2, da hier keine Rolle zwischen Liveness
  und Readiness zu unterscheiden ist (die Referenz-App braucht die Trennung wegen
  Datenbank-Wartezeit beim Start, die es in Round-2 noch nicht gibt).

Keine Abweichung von round.md/BPROJ-S02 nötig — die Referenz-App bestätigt die Muster,
widerspricht nichts.

### Akzeptanzkriterien

Wie in [BPROJ-S02](../../../requirements/bazaar-app/epics/Epic_Projektanlage/stories/BPROJ-S02-dotnet-api-anlegen.md)
AC-1 bis AC-10, unverändert übernommen.

### Bewusst nicht in diesem Round

EF Core/Datenbank (BPROJ-S04), konkrete Domain-Entities/Handler/Endpoints (fachliche
Epics), Docker (BPROJ-S03), Login-Endpoint/Passwort-Hashing (Epic_Login), Testprojekte
(BPROJ-S06).

