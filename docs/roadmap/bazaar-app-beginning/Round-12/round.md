# Round 12 — Kategorien

## Liefert

Den vollständigen Durchstich für die Kategorien-Stammdatenverwaltung — strukturell
identisch zur Marken-Verwaltung, eigenständige Ressource.

## Umfang

- Seite `/categories`: Tabelle (ID · Name · Original-Badge · Artikel-Anzahl · Aktionen),
  Default-Sortierung Name aufsteigend.
- Popup „+ Neu“/„Edit“ über die geteilte Komponente `master-data-popup`.
- Backend: Entity Kategorie, Endpoints `GET/POST /api/categories` (authenticated),
  `PUT/DELETE /api/categories/{id}` (admin).
- `original`-Flag, Duplikatprüfung, Löschsperre bei zugeordneten Artikeln,
  Namensänderung wird in Artikel nachgezogen — alles analog zu Marken.
- Kategorie ist explizit eine **flache Liste**: kein Eltern-Feld, keine
  Ober-/Unterkategorien, keine Sortierreihenfolge, kein Icon/Farbe.

## Nicht enthalten

- Kategorie-Hierarchie (Ober-/Unterkategorien) — bewusst nicht vorgesehen.
- Import aus der Voranmelde-App (gehört zur Einstellungen-Seite).

## Referenzen

- [Epic_Kategorien](../../requirements/bazaar-app/epics/Epic_Kategorien/epic.md)
- [spec.md §9.2](../../requirements/bazaar-app/spec.md) (`original`-Flag)

## Voraussetzung

Setzt voraus, dass die Marken-Verwaltung (insbesondere die geteilte
`master-data-popup`-Komponente) bereits existiert.
