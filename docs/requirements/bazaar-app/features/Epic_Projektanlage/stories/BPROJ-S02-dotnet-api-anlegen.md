---
id: BPROJ-S02
status: draft
depends-on: []
---

# Story: .NET Minimal API Projekt anlegen

## Ziel

Ein Entwickler legt das .NET 9 Minimal API Backend-Projekt der Haupt-App an, richtet die Feature-basierte Projektstruktur ein und stellt über einen Health-Check-Endpoint sicher, dass das Backend erreichbar ist.

## Kontext

Das Backend der Haupt-App ist eine .NET 9 Minimal API. Da die App offline im LAN läuft, ist kein externer Auth-Service erforderlich. Die Struktur folgt dem Feature-Slice-Muster, damit spätere fachliche Features eigenständig in eigenen Ordnern leben.

## Scope

**In Scope:** `dotnet new webapi`, Feature-Slice-Verzeichnisstruktur, CORS für Angular Dev-Server, `/health`-Endpoint, Konfiguration über `appsettings.json` und Environment-Variablen.

**Out of Scope:** Datenbankverbindung (folgt in BPROJ-S04), fachliche Endpoints.

## UI-Spezifikation

```
GET /health
→ 200 OK
   { "status": "healthy" }
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL ein .NET 9 Minimal API Projekt mit dem Befehl `dotnet new webapi` anlegen.
- [ ] **AC-2** — THE SYSTEM SHALL die Verzeichnisstruktur `Features/<FeatureName>/` (Endpoints, DTOs, Services je Feature) als Konvention etablieren.
- [ ] **AC-3** — THE SYSTEM SHALL CORS so konfigurieren, dass Requests von `http://localhost:4200` (Angular Dev) erlaubt sind; in Production wird der Origin per Environment-Variable gesetzt.
- [ ] **AC-4** — THE SYSTEM SHALL einen `GET /health` Endpoint bereitstellen, der `{ "status": "healthy" }` mit HTTP 200 zurückgibt.
- [ ] **AC-5** — WHEN die App mit `dotnet run` gestartet wird, THEN SHALL `GET /health` unter `http://localhost:5000/health` erreichbar sein.
- [ ] **AC-6** — THE SYSTEM SHALL alle konfigurierbaren Werte (Port, CORS-Origin, Connection String) aus `appsettings.json` bzw. Environment-Variablen lesen — keine Hardcodes.

## Tags & Piles

**Tags:** #dotnet #setup #minimal-api #health-check #cors
