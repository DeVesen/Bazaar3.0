---
code: BPROJ
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Projektanlage — Haupt-App

## Zweck

Technisches Grundsetup der Haupt-App: Angular-Frontend und .NET-Backend werden als eigenständige Projekte angelegt, containerisiert und mit einer lauffähigen Datenbankverbindung verbunden. Nach Abschluss dieses Epics ist die Entwicklungsumgebung bereit für die Implementierung fachlicher Epics.

## Rollen

- **Entwickler** — richtet die Projektstruktur ein und betreibt die lokale Entwicklungsumgebung.

## Bereiche

- Angular 20 Frontend-Projekt (`frontend/`) mit PrimeNG 22.0.0, Feature-First-Struktur und ESLint-Importgrenzen
- .NET 9 Minimal API Backend (`backend/`) als hexagonaler Vier-Projekt-Schnitt, inkl. JWT-Grundkonfiguration
- Docker Compose für lokales Dev-Setup, separates Overlay für den Insel-Betrieb (nginx + Production-Build)
- Entity Framework Core mit PostgreSQL (ausschließlich in `Bazaar.Infrastructure`)
- Test- und Architektur-Test-Infrastruktur (Jest, xUnit v3, NetArchTest)

## Architektur

Verbindliche Quelle: [`spec.md`](../../spec.md) Abschnitt 7.0.1 — Layering **hexagonal**
(`Bazaar.Domain` / `.Application` / `.Infrastructure` / `.Api`, Abhängigkeitsrichtung
compiler-erzwungen), Deployment **Monolith** im lokalen LAN, Data-Flow **CRUD** mit
eigenen Query-Ports für aggregierte Sichten, Frontend **Feature-First**
(`src/app/features/<feature>/` + `core/` + `shared/`).

Ergänzend aus dem Review dieses Epics:

| Thema | Entscheidung |
|---|---|
| PrimeNG | **22.0.0**, identisch zur Voranmelde-App — eine Major-Version für die ganze Suite |
| Migrations | `MigrateAsync()` bei **jedem** Start; im Insel-Betrieb ist kein Entwickler zur Hand, und es gibt nur einen Backend-Prozess |
| Docker Compose | Basis-File ist **reines Dev**; der Insel-Betrieb kommt als Overlay mit Production-Image und nginx |
| CORS | nur in `Development` — produktiv liefert nginx Frontend und `/api/*` unter demselben Origin |
| DbContext | `BazaarDbContext` in `Bazaar.Infrastructure/Persistence/`, Connection String nur aus `ConnectionStrings__DefaultConnection` |

## Hinweis

Dieses Epic ist ein **technisches Setup-Epic** — kein fachlicher Durchstich (Frontend + Backend zusammen). Es ist Voraussetzung für alle nachfolgenden Epics. Siehe Entwicklungsrichtlinie in [`spec.md`](../../spec.md) Abschnitt 7.0.2.

## Stories

- [BPROJ-S01 — Angular-Projekt anlegen](stories/BPROJ-S01-angular-projekt-anlegen.md)
- [BPROJ-S02 — .NET Minimal API anlegen](stories/BPROJ-S02-dotnet-api-anlegen.md)
- [BPROJ-S03 — Docker Compose Setup](stories/BPROJ-S03-docker-compose-setup.md)
- [BPROJ-S04 — EF Core & Datenbank-Setup](stories/BPROJ-S04-efcore-datenbank-setup.md)
- [BPROJ-S05 — SSL/HTTPS für den Inselbetrieb](stories/BPROJ-S05-ssl-insel-deployment.md)
- [BPROJ-S06 — Test- und Architektur-Test-Setup](stories/BPROJ-S06-test-und-architektur-setup.md)

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #setup #projektanlage #angular #dotnet #docker #efcore
