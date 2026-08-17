---
id: VPROJ-S04
status: draft
depends-on: [VPROJ-S02, VPROJ-S03]
---

# Story: EF Core & Datenbank-Setup

## Ziel

Ein Entwickler richtet Entity Framework Core mit PostgreSQL ein, erstellt einen `AppDbContext`, legt die erste leere Migration an und stellt sicher, dass Migrations beim Start der App automatisch angewendet werden.

## Kontext

Alle Entitäten der Voranmelde-App (Artikel, Verkäufer, Marken, Kategorien, Verkäufer-Typen, Nummernblöcke) verwenden EF Core mit PostgreSQL. Der Cloud-Betrieb erfordert, dass Migrations sowohl lokal als auch in Azure Container Apps zuverlässig angewendet werden.

## Scope

**In Scope:** `Npgsql.EntityFrameworkCore.PostgreSQL` installieren, `AppDbContext` anlegen, Connection String aus Environment lesen, erste leere Migration `InitialCreate`, `MigrateAsync()` beim App-Start.

**Verortung (Hexagonal, siehe VPROJ-S02):** `AppDbContext`, Migrations, Entity-Konfigurationen
und Repository-Implementierungen liegen ausschließlich in `Bazaar.Infrastructure`. Die
Entity-Klassen selbst liegen in `Bazaar.Domain` und tragen **keine** EF-Attribute — das
Mapping passiert per Fluent API in `Infrastructure/Persistence/Configurations/`
(`IEntityTypeConfiguration<T>` je Aggregate).

**Out of Scope:** Fachliche Entitäten (folgen in den jeweiligen Epics), Seed-Daten, Datenbankschema für User/Auth (folgt in Epic_Login).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL `Npgsql.EntityFrameworkCore.PostgreSQL` als NuGet-Paket **in `Bazaar.Infrastructure`** installieren und den DbContext über eine `AddInfrastructure()`-Extension in `Program.cs` registrieren (`Bazaar.Api` referenziert Npgsql nicht direkt).
- [ ] **AC-2** — THE SYSTEM SHALL einen `AppDbContext` in `Bazaar.Infrastructure/Persistence/` anlegen, der den Connection String aus der Environment-Variable `DATABASE_URL` (alternativ `ConnectionStrings__DefaultConnection`) liest.
- [ ] **AC-3** — THE SYSTEM SHALL eine erste Migration mit dem Namen `InitialCreate` im Projekt `Bazaar.Infrastructure` anlegen (`dotnet ef migrations add InitialCreate -p Bazaar.Infrastructure -s Bazaar.Api`); die Migration enthält keine Tabellenänderungen (leerer Stand).
- [ ] **AC-4** — WHEN die App startet (unabhängig von der Umgebung), THEN SHALL `dbContext.Database.MigrateAsync()` automatisch ausgeführt werden, sodass Migrations sowohl lokal als auch in Azure Container Apps automatisch angewendet werden.
- [ ] **AC-5** — IF die Datenbankverbindung beim Start nicht hergestellt werden kann, THEN SHALL die App mit einer lesbaren Fehlermeldung im Log abbrechen (kein unbehandelter Exception-Crash).
- [ ] **AC-6** — WHEN `dotnet ef migrations list` ausgeführt wird, THEN SHALL `InitialCreate` als einzige Migration in der Liste erscheinen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S02 | .NET-Projekt muss existieren, bevor EF Core eingerichtet werden kann |
| VPROJ-S03 | PostgreSQL-Container muss laufen, damit die Migration angewendet werden kann |

## Tags & Piles

**Tags:** #efcore #postgresql #migration #datenbank #setup #cloud
