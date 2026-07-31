---
code: VPROJ
status: draft
updated: 2026-07-31
---

# Epic: Projektanlage — Voranmelde-App

## Zweck

Technisches Grundsetup der Voranmelde-App: Angular-Frontend und .NET-Backend werden als eigenständige Projekte angelegt, containerisiert und mit einer lauffähigen Datenbankverbindung verbunden. Die App läuft cloud-ready (Azure Container Apps). Nach Abschluss ist die Entwicklungsumgebung bereit für fachliche Epics.

## Rollen

- **Entwickler** — richtet die Projektstruktur ein und betreibt die lokale Entwicklungsumgebung.

## Bereiche

- Angular 20 Frontend-Projekt (`frontend/`) mit ngx-translate (DE/EN)
- .NET 9 Minimal API Backend-Projekt (`backend/`) mit JWT-Auth-Middleware-Grundlage
- Docker Compose für lokales Dev-Setup (cloud-kompatibel)
- Entity Framework Core mit PostgreSQL

## Hinweis

Dieses Epic ist ein **technisches Setup-Epic** — kein fachlicher Durchstich. Es ist Voraussetzung für alle nachfolgenden Epics. Siehe Entwicklungsrichtlinie in `CLAUDE.md`.

Die Voranmelde-App lebt in einem **eigenen Repository** — `frontend/` und `backend/` liegen direkt am Repository-Root.

Der Unterschied zur Haupt-App: Mehrsprachigkeit (ngx-translate) wird hier bereits im Projekt-Setup verankert, und das Backend enthält die Grundkonfiguration für JWT-Authentifizierung.

## Stories

- [VPROJ-S02 — .NET Minimal API anlegen](stories/VPROJ-S02-dotnet-api-anlegen.md)
- [VPROJ-S01 — Angular-Projekt anlegen](stories/VPROJ-S01-angular-projekt-anlegen.md)
- [VPROJ-S03 — Docker Compose Setup](stories/VPROJ-S03-docker-compose-setup.md)
- [VPROJ-S04 — EF Core & Datenbank-Setup](stories/VPROJ-S04-efcore-datenbank-setup.md)

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #setup #projektanlage #angular #dotnet #docker #efcore #jwt #ngx-translate
