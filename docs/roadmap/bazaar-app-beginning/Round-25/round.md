# Round 25 — Einstellungen: Systemparameter

## Liefert

Den ersten Bereich der Einstellungen-Seite: den einen konfigurierbaren
Systemparameter.

## Umfang

- Seite `/settings` (nur über `adminGuard` erreichbar) mit Bereich Systemparameter
  (Komponente `settings-form`), genau ein Feld `scannerPauseMs`.
- Backend: Entity Einstellungen (eine Zeile), Endpoints `GET/PUT /api/settings` —
  `GET` bewusst `authenticated` (Kassenpersonal braucht den Wert beim Scannen, siehe
  Round 16), `PUT` `admin`.
- Ablösung des in Round 16 verwendeten Default-Werts (3 000 ms) durch den tatsächlich
  konfigurierten, serverseitig gespeicherten Wert.
- Einstellungen werden serverseitig gespeichert, nicht im `localStorage` — gelten für
  alle Geräte.

## Nicht enthalten

- JSON-Import und Benutzerverwaltung — je eigenes Häppchen.

## Referenzen

- [Epic_Einstellungen](../../requirements/bazaar-app/epics/Epic_Einstellungen/epic.md)
- [entities/einstellungen.md](../../requirements/bazaar-app/entities/einstellungen.md)
- [spec.md §8](../../requirements/bazaar-app/spec.md) (Einstellungen)

## Voraussetzung

Setzt voraus, dass App-Shell/Login stehen und die Artikelannahme (Verwendung von
`scannerPauseMs`) bereits existiert.
