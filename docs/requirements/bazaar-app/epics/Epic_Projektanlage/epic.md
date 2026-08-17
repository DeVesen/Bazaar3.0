---
code: BPROJ
status: draft
updated: 2026-07-31
---

# Epic: Projektanlage — Haupt-App

## Zweck

Technisches Grundsetup der Haupt-App: Angular-Frontend und .NET-Backend werden als eigenständige Projekte angelegt, containerisiert und mit einer lauffähigen Datenbankverbindung verbunden. Nach Abschluss dieses Epics ist die Entwicklungsumgebung bereit für die Implementierung fachlicher Epics.

## Rollen

- **Entwickler** — richtet die Projektstruktur ein und betreibt die lokale Entwicklungsumgebung.

## Bereiche

- Angular 20 Frontend-Projekt (`frontend/`) mit Feature-First-Struktur und ESLint-Importgrenzen
- .NET 9 Minimal API Backend (`backend/`) als hexagonaler Vier-Projekt-Schnitt
- Docker Compose für lokales Dev-Setup
- Entity Framework Core mit PostgreSQL (ausschließlich in `Bazaar.Infrastructure`)

## Architektur

Verbindliche Quelle: [`spec.md`](../../spec.md) Abschnitt 7.0.1 — Layering **hexagonal**
(`Bazaar.Domain` / `.Application` / `.Infrastructure` / `.Api`, Abhängigkeitsrichtung
compiler-erzwungen), Deployment **Monolith** im lokalen LAN, Data-Flow **CRUD** mit
eigenen Query-Ports für aggregierte Sichten, Frontend **Feature-First**
(`src/app/features/<feature>/` + `core/` + `shared/`).

> **Nachzuziehen beim Review dieser App:** Die Stories BPROJ-S01/S02/S04 beschreiben
> noch das alte Setup (ein Backend-Projekt, `src/app/epics/`) und kennen weder das
> Test- noch das Architektur-Test-Projekt. Die Voranmelde-App hat dafür die Stories
> VPROJ-S01/S02/S04/S05 als Vorlage.

## Hinweis

Dieses Epic ist ein **technisches Setup-Epic** — kein fachlicher Durchstich (Frontend + Backend zusammen). Es ist Voraussetzung für alle nachfolgenden Epics. Siehe Entwicklungsrichtlinie in [`spec.md`](../../spec.md) Abschnitt 7.0.2.

## Stories

- [BPROJ-S01 — Angular-Projekt anlegen](stories/BPROJ-S01-angular-projekt-anlegen.md)
- [BPROJ-S02 — .NET Minimal API anlegen](stories/BPROJ-S02-dotnet-api-anlegen.md)
- [BPROJ-S03 — Docker Compose Setup](stories/BPROJ-S03-docker-compose-setup.md)
- [BPROJ-S04 — EF Core & Datenbank-Setup](stories/BPROJ-S04-efcore-datenbank-setup.md)
- [BPROJ-S05 — SSL/HTTPS für den Inselbetrieb](stories/BPROJ-S05-ssl-insel-deployment.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #setup #projektanlage #angular #dotnet #docker #efcore
