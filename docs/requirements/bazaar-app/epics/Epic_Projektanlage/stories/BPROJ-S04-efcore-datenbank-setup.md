---
id: BPROJ-S04
status: draft
depends-on: [BPROJ-S02, BPROJ-S03]
---

# Story: EF Core & Datenbank-Setup

## Ziel

Ein Entwickler richtet Entity Framework Core mit PostgreSQL ein, erstellt den `BazaarDbContext`, legt die erste leere Migration an und stellt sicher, dass Migrations bei jedem Start der App automatisch angewendet werden.

## Kontext

Alle Entitäten der Haupt-App (Artikel, Verkäufer, Marken, Kategorien, Verkäufer-Typen, Benutzer) verwenden EF Core mit PostgreSQL. Die erste Migration ist leer und dient als sauberer Startpunkt — Entitäten kommen in den jeweiligen fachlichen Epics.

EF Core lebt ausschließlich in `Bazaar.Infrastructure` (siehe [`spec.md`](../../../spec.md) Abschnitt 7.0.1); der `BazaarDbContext` liegt in `Bazaar.Infrastructure/Persistence/`. Die Entities selbst tragen keine EF-Attribute, das Mapping läuft per Fluent API über `IEntityTypeConfiguration<T>` je Aggregate.

Migrations werden **bei jedem Start** angewendet, nicht nur in Development. Der Produktivbetrieb ist ein LAN-Server ohne Internetzugang und ohne anwesenden Entwickler — dort führt niemand `dotnet ef database update` von Hand aus. Da es genau einen Backend-Prozess gibt (Monolith, keine Replicas), entfallen die üblichen Gegenargumente gegen Auto-Migrate: kein Race zwischen parallelen Instanzen, kein Zero-Downtime-Deployment.

## Scope

**In Scope:** `Npgsql.EntityFrameworkCore.PostgreSQL` installieren, `BazaarDbContext` in `Bazaar.Infrastructure/Persistence/` anlegen, Connection String aus Environment lesen, erste leere Migration `InitialCreate`, `MigrateAsync()` bei jedem App-Start.

**Out of Scope:** Fachliche Entitäten (folgen in den jeweiligen Epics), Seed-Daten.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL `Npgsql.EntityFrameworkCore.PostgreSQL` als NuGet-Paket in `Bazaar.Infrastructure` installieren und den Kontext in `Program.cs` registrieren.
- [ ] **AC-2** — THE SYSTEM SHALL einen `BazaarDbContext` in `Bazaar.Infrastructure/Persistence/` anlegen, der den Connection String ausschließlich aus `ConnectionStrings__DefaultConnection` liest.
- [ ] **AC-3** — THE SYSTEM SHALL eine erste Migration mit dem Namen `InitialCreate` anlegen; die Migration enthält keine Tabellenänderungen (leerer Stand).
- [ ] **AC-4** — WHEN die App startet, THEN SHALL `dbContext.Database.MigrateAsync()` unabhängig von der Environment automatisch ausgeführt werden, sodass die DB auf dem aktuellen Migrations-Stand ist.
- [ ] **AC-4b** — THE SYSTEM SHALL das Entity-Mapping per Fluent API über `IEntityTypeConfiguration<T>` je Aggregate vornehmen; Entity-Klassen SHALL keine EF-Core-Attribute tragen.
- [ ] **AC-5** — IF die Datenbankverbindung beim Start nicht hergestellt werden kann, THEN SHALL die App mit einer lesbaren Fehlermeldung im Log abbrechen (kein unbehandelter Exception-Crash).
- [ ] **AC-6** — WHEN `dotnet ef migrations list` ausgeführt wird, THEN SHALL `InitialCreate` als einzige Migration in der Liste erscheinen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S02 | .NET-Projekt muss existieren, bevor EF Core eingerichtet werden kann |
| BPROJ-S03 | Der `db`-Container muss laufen und auf `localhost:5432` erreichbar sein — `dotnet ef` läuft vom Host |

## Tags & Piles

**Tags:** #efcore #postgresql #migration #datenbank #setup
