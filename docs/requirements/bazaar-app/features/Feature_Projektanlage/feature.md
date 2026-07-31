---
code: BPROJ
status: draft
updated: 2026-07-31
---

# Feature: Projektanlage — Haupt-App

## Zweck

Technisches Grundsetup der Haupt-App: Angular-Frontend und .NET-Backend werden als eigenständige Projekte angelegt, containerisiert und mit einer lauffähigen Datenbankverbindung verbunden. Nach Abschluss dieses Features ist die Entwicklungsumgebung bereit für die Implementierung fachlicher Features.

## Rollen

- **Entwickler** — richtet die Projektstruktur ein und betreibt die lokale Entwicklungsumgebung.

## Bereiche

- Angular 20 Frontend-Projekt (`frontend/`)
- .NET 9 Minimal API Backend-Projekt (`backend/`)
- Docker Compose für lokales Dev-Setup
- Entity Framework Core mit PostgreSQL

## Hinweis

Dieses Feature ist ein **technisches Setup-Feature** — kein fachlicher Durchstich (Frontend + Backend zusammen). Es ist Voraussetzung für alle nachfolgenden Features. Siehe Entwicklungsrichtlinie in `CLAUDE.md`.

## Stories

- [BPROJ-S01 — Angular-Projekt anlegen](stories/BPROJ-S01-angular-projekt-anlegen.md)
- [BPROJ-S02 — .NET Minimal API anlegen](stories/BPROJ-S02-dotnet-api-anlegen.md)
- [BPROJ-S03 — Docker Compose Setup](stories/BPROJ-S03-docker-compose-setup.md)
- [BPROJ-S04 — EF Core & Datenbank-Setup](stories/BPROJ-S04-efcore-datenbank-setup.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #setup #projektanlage #angular #dotnet #docker #efcore
