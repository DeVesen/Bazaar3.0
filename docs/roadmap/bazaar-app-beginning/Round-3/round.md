# Round 3 — EF Core & Datenbankanbindung

## Liefert

Die funktionierende Persistenzschicht: `BazaarDbContext`, PostgreSQL-Anbindung,
Migrations-Mechanik — noch ohne fachliche Entities.

## Umfang

- EF Core ausschließlich in `Bazaar.Infrastructure` verdrahtet (Domain kennt kein EF Core).
- `BazaarDbContext` mit Verbindungsaufbau über `ConnectionStrings__DefaultConnection`
  (ausschließlich Umgebungsvariable, kein Klartext in Konfigurationsdateien).
- `MigrateAsync()` beim Anwendungsstart (kein manueller Migrationsschritt möglich, da im
  Insel-Betrieb kein Entwickler vor Ort ist).
- Muster für Entity-Mapping per Fluent API: ein `IEntityTypeConfiguration<T>` je
  Aggregate, Entities selbst ohne EF-Attribute.
- Muster für Repository-Interfaces in `Domain/Ports/` (ein Repository pro Aggregate,
  kein generisches `IRepository<T>`, kein `IQueryable` über die Port-Grenze) und deren
  Implementierung in `Infrastructure`.

## Nicht enthalten

- Konkrete fachliche Entities (User, Verkäufer, Artikel, …) — die entstehen mit den
  jeweiligen fachlichen Epics.
- Docker-Compose-Datenbankdienst (eigenes Häppchen).

## Referenzen

- [Epic_Projektanlage](../../requirements/bazaar-app/epics/Epic_Projektanlage/epic.md) (Story BPROJ-S04)
- [spec.md §7.0.1](../../requirements/bazaar-app/spec.md) (Architektur — Repository-Muster)

## Voraussetzung

Setzt voraus, dass das .NET-Backend-Grundgerüst im hexagonalen Vier-Projekt-Schnitt
bereits existiert.
