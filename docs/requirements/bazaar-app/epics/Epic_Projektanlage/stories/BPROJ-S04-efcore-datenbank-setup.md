---
id: BPROJ-S04
status: draft
depends-on: [BPROJ-S02, BPROJ-S03]
---

# Story: EF Core & Datenbank-Setup

## Ziel

Ein Entwickler richtet Entity Framework Core mit PostgreSQL ein, erstellt einen `AppDbContext`, legt die erste leere Migration an und stellt sicher, dass Migrations beim Start der App automatisch angewendet werden.

## Kontext

Alle Entitäten der Haupt-App (Artikel, Verkäufer, Marken, Kategorien, Verkäufer-Types) verwenden EF Core mit PostgreSQL. Die erste Migration ist leer und dient als sauberer Startpunkt — Entitäten kommen in den jeweiligen fachlichen Epics.

## Scope

**In Scope:** `Npgsql.EntityFrameworkCore.PostgreSQL` installieren, `AppDbContext` anlegen, Connection String aus Environment lesen, erste leere Migration `InitialCreate`, `MigrateAsync()` beim App-Start (Development).

**Out of Scope:** Fachliche Entitäten (folgen in den jeweiligen Epics), Seed-Daten.

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL `Npgsql.EntityFrameworkCore.PostgreSQL` als NuGet-Paket installieren und in `Program.cs` registrieren.
- [ ] **AC-2** — THE SYSTEM SHALL einen `AppDbContext` anlegen, der den Connection String aus der Environment-Variable `DATABASE_URL` (alternativ `ConnectionStrings__DefaultConnection`) liest.
- [ ] **AC-3** — THE SYSTEM SHALL eine erste Migration mit dem Namen `InitialCreate` anlegen; die Migration enthält keine Tabellenänderungen (leerer Stand).
- [ ] **AC-4** — WHEN die App in der `Development`-Umgebung startet, THEN SHALL `dbContext.Database.MigrateAsync()` automatisch ausgeführt werden, sodass die DB auf dem aktuellen Migrations-Stand ist.
- [ ] **AC-5** — IF die Datenbankverbindung beim Start nicht hergestellt werden kann, THEN SHALL die App mit einer lesbaren Fehlermeldung im Log abbrechen (kein unbehandelter Exception-Crash).
- [ ] **AC-6** — WHEN `dotnet ef migrations list` ausgeführt wird, THEN SHALL `InitialCreate` als einzige Migration in der Liste erscheinen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S02 | .NET-Projekt muss existieren, bevor EF Core eingerichtet werden kann |
| BPROJ-S03 | PostgreSQL-Container muss laufen, damit die Migration angewendet werden kann |

## Tags & Piles

**Tags:** #efcore #postgresql #migration #datenbank #setup
