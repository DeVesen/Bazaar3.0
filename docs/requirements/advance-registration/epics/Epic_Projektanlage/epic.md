---
code: VPROJ
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Projektanlage — Voranmelde-App

## Zweck

Technisches Grundsetup der Voranmelde-App: Angular-Frontend und .NET-Backend werden als eigenständige Projekte angelegt, containerisiert und mit einer lauffähigen Datenbankverbindung verbunden. Die App läuft cloud-ready (Azure Container Apps). Nach Abschluss ist die Entwicklungsumgebung bereit für fachliche Epics.

## Rollen

- **Entwickler** — richtet die Projektstruktur ein und betreibt die lokale Entwicklungsumgebung.

## Bereiche

- Angular 22 Frontend-Projekt (`frontend/`) mit ngx-translate (DE/EN), Feature-First-Struktur und ESLint-Importgrenzen
- .NET 10 Minimal API Backend (`backend/`) als hexagonaler Vier-Projekt-Schnitt mit JWT-Auth-Middleware-Grundlage
- Docker Compose für lokales Dev-Setup (cloud-kompatibel)
- Entity Framework Core mit PostgreSQL (ausschließlich in `Bazaar.Infrastructure`)
- Test- und Architektur-Test-Infrastruktur (Jest, xUnit, NetArchTest)

## Architektur

Verbindliche Quelle: [`spec.md`](../../spec.md) Abschnitt 10.0.1 — Layering
**hexagonal** (ein Hexagon pro App), Deployment **Monolith**, Data-Flow **CRUD** mit
eigenen Query-Ports für Read-Models, Frontend **Feature-First**. Code, Routen und
JSON-Contract sind englisch, Doku bleibt deutsch.

## Hinweis

Dieses Epic ist ein **technisches Setup-Epic** — kein fachlicher Durchstich. Es ist Voraussetzung für alle nachfolgenden Epics. Siehe Entwicklungsrichtlinie in [`spec.md`](../../spec.md) Abschnitt 10.0.2.

Die Voranmelde-App lebt in einem **eigenen Repository** — `frontend/` und `backend/` liegen direkt am Repository-Root.

Der Unterschied zur Haupt-App: Mehrsprachigkeit (ngx-translate) wird hier bereits im Projekt-Setup verankert, und das Backend enthält die Grundkonfiguration für JWT-Authentifizierung.

## Werkzeug-Voraussetzungen

Node.js in einer von der Angular CLI 22 akzeptierten Version (`^22.22.3`, `^24.15.0` oder `>= 26.0.0`), das .NET-SDK 10.x und ein laufender Docker-Daemon — für die lokale Datenbank **und** die Integrationstests.

Vollständige Tabellen mit Begründung → [VPROJ-S01](stories/VPROJ-S01-angular-projekt-anlegen.md) Abschnitt „Voraussetzungen an die Entwicklungsumgebung" und [VPROJ-S05](stories/VPROJ-S05-test-und-architektur-setup.md) Abschnitt „Voraussetzungen an die Testumgebung".

## Stories

- [VPROJ-S02 — .NET Minimal API anlegen](stories/VPROJ-S02-dotnet-api-anlegen.md)
- [VPROJ-S01 — Angular-Projekt anlegen](stories/VPROJ-S01-angular-projekt-anlegen.md)
- [VPROJ-S03 — Docker Compose Setup](stories/VPROJ-S03-docker-compose-setup.md)
- [VPROJ-S04 — EF Core & Datenbank-Setup](stories/VPROJ-S04-efcore-datenbank-setup.md)
- [VPROJ-S05 — Test- und Architektur-Test-Setup](stories/VPROJ-S05-test-und-architektur-setup.md)

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #setup #projektanlage #angular #dotnet #docker #efcore #jwt #ngx-translate
