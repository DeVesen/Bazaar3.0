# Round 13 — Verkäufer-Typen

## Liefert

Den vollständigen Durchstich für die Verkäufer-Typen-Verwaltung — die Vorlagen, aus
denen ein Verkäufer seine Abrechnungskonditionen bezieht.

## Umfang

- Seite `/seller-types`: Tabelle (Name · Provision % · Gebühr € · Verkäufer-Anzahl ·
  Aktionen, **keine** ID-Spalte), Default-Sortierung Name aufsteigend.
- Popup „+ Neu“/„Edit“ (Name, Provision %, Gebühr €), serverseitige
  Wertebereichsprüfung (Provision 0–100 %, Gebühr ≥ 0).
- Backend: Entity Verkäufer-Typ (`id`, `name`, `commissionRate`, `itemFee`), Endpoints
  `GET /api/seller-types` (authenticated — Kassenpersonal braucht die Liste beim
  Verkäufer-Anlegen), `POST/PUT/DELETE /api/seller-types` (admin).
- Kein automatisches Anlegen unbekannter Typen (z. B. beim späteren Import) — Provision
  und Gebühr sind nicht erfindbar.

## Nicht enthalten

- Das eigentliche Zuweisen eines Typs zu einem Verkäufer und das Kopieren der
  Konditionen — das entsteht mit der Verkäufer-Verwaltung.
- Auflösung unbekannter Typnamen beim JSON-Import — gehört zur Einstellungen-Seite.

## Referenzen

- [Epic_Verkaeufer_Typen](../../requirements/bazaar-app/epics/Epic_Verkaeufer_Typen/epic.md)
- [entities/verkaeufer-typ.md](../../requirements/bazaar-app/entities/verkaeufer-typ.md)

## Voraussetzung

Setzt voraus, dass App-Shell und Login bereits existieren; keine fachliche Abhängigkeit
zu Marken/Kategorien.
