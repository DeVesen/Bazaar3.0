# Round 11 — Marken

## Liefert

Den vollständigen Durchstich für die Marken-Stammdatenverwaltung.

## Umfang

- Seite `/brands`: Tabelle (ID · Name · Original-Badge · Artikel-Anzahl · Aktionen),
  Default-Sortierung Name aufsteigend.
- Popup „+ Neu“ (nur Admin, Feld „Name“, kein `original`-Toggle) und „Edit“ (Name +
  `original`-Toggle) — als geteilte Komponente `master-data-popup` gebaut (wird in Round
  12 wiederverwendet).
- Backend: Entity Marke, Endpoints `GET/POST /api/brands` (authenticated — Kassenpersonal
  braucht sie für AutoComplete/Filter), `PUT/DELETE /api/brands/{id}` (admin).
- `original`-Flag serverseitig aus der Rolle des Aufrufers gesetzt (Admin → `true`,
  Kassenpersonal → `false`); Badge „✓ Original“ (grün) / „Neu“ (orange) in der Liste.
- Duplikatprüfung (Trim + case-insensitiv) → `409`.
- Löschsperre, solange der Marke Artikel zugeordnet sind → `409`.
- Namensänderung wird in alle zugeordneten Artikel nachgezogen (Marke ist im Artikel ein
  denormalisierter String, kein Fremdschlüssel).

## Nicht enthalten

- Import aus der Voranmelde-App (gehört zur Einstellungen-Seite).
- Implizites Anlegen über AutoComplete während der Artikelannahme (nutzt diese
  Endpoints, entsteht aber erst mit dem Artikelannahme-Häppchen).
- Kategorien — eigenes Häppchen, trotz identischer Struktur bewusst getrennt.

## Referenzen

- [Epic_Marken](../../requirements/bazaar-app/epics/Epic_Marken/epic.md)
- [spec.md §9.2](../../requirements/bazaar-app/spec.md) (`original`-Flag)
- [spec.md §9.3](../../requirements/bazaar-app/spec.md) (AutoComplete-Verhalten)

## Voraussetzung

Setzt voraus, dass App-Shell (Routing, Guards, Theme) und Login bereits existieren.
