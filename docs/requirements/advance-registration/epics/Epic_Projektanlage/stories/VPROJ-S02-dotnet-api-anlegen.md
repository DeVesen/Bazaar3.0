---
id: VPROJ-S02
status: draft
depends-on: []
---

# Story: .NET Minimal API Projekt anlegen

## Ziel

Ein Entwickler legt das .NET 9 Minimal API Backend-Projekt der Voranmelde-App an, richtet die Feature-basierte Projektstruktur ein und konfiguriert die Grundlage für JWT-Authentifizierung sowie einen Health-Check-Endpoint.

## Kontext

Das Backend der Voranmelde-App läuft in der Cloud (Azure Container Apps). Es benötigt JWT-Authentifizierung für Login, Rollenprüfungen und geschützte Endpoints. Die JWT-Grundkonfiguration (Middleware, Token-Validation-Parameter) wird hier eingerichtet; die konkreten Auth-Endpoints folgen im Epic_Login.

## Scope

**In Scope:** `dotnet new webapi`, Feature-Slice-Verzeichnisstruktur, CORS für Angular Dev-Server, `/health`-Endpoint, JWT-Bearer-Middleware (`Microsoft.AspNetCore.Authentication.JwtBearer`) installieren und registrieren (ohne konkreten Endpoint), Konfiguration über `appsettings.json` und Environment-Variablen.

**Out of Scope:** Login-Endpoint, Passwort-Hashing, konkrete Protected-Endpoints (folgen in Epic_Login und fachlichen Epics).

## UI-Spezifikation

```
GET /health
→ 200 OK
   { "status": "healthy" }

Alle anderen Endpoints (außer /health und /api/auth/*):
→ 401 Unauthorized wenn kein gültiges Bearer-Token
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL ein .NET 9 Minimal API Projekt mit dem Befehl `dotnet new webapi` anlegen.
- [ ] **AC-2** — THE SYSTEM SHALL die Verzeichnisstruktur `Features/<FeatureName>/` (Endpoints, DTOs, Services je Feature) als Konvention etablieren.
- [ ] **AC-3** — THE SYSTEM SHALL CORS konfigurieren: Angular Dev (`http://localhost:4200`) erlaubt; Production-Origin über die Environment-Variable `CORS_ALLOWED_ORIGIN` konfigurierbar.
- [ ] **AC-4** — THE SYSTEM SHALL einen `GET /health` Endpoint bereitstellen, der ohne Auth `{ "status": "healthy" }` mit HTTP 200 zurückgibt.
- [ ] **AC-5** — THE SYSTEM SHALL `Microsoft.AspNetCore.Authentication.JwtBearer` installieren und in `Program.cs` mit `AddAuthentication().AddJwtBearer()` registrieren; Token-Parameter (Issuer, Audience, Secret) aus Environment-Variablen lesen.
- [ ] **AC-6** — WHEN die App mit `dotnet run` gestartet wird, THEN SHALL `GET /health` unter `http://localhost:5001/health` mit HTTP 200 antworten.
- [ ] **AC-7** — THE SYSTEM SHALL alle Secrets (JWT-Secret, DB-Passwort) ausschließlich über Environment-Variablen oder User Secrets lesen — keine Hardcodes.

## Tags & Piles

**Tags:** #dotnet #setup #minimal-api #jwt #health-check #cors
