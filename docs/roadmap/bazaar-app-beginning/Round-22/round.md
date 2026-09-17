# Round 22 — Statistik

## Liefert

Die read-only Kennzahlen-Übersicht des laufenden Basars.

## Umfang

- Seite `/statistics`: KPI-Zeile 1 „Artikel-Übersicht“ (6 Kacheln), KPI-Zeile 2
  „Rückblick“ (3 Kacheln), KPI-Zeile 3 „Finanz-Kennzahlen“ (6 Kacheln, inkl. Unterzeile
  „davon manuell“, nur sichtbar wenn > 0), `p-metergroup` unter Zeile 3.
- Verkäufer-Leaderboard (Komponente `leaderboard`, baut auf der geteilten `table`-
  Komponente auf) mit Typ-Filter-Dropdown, Rang-Badges, max-height 300 px.
- Backend: ein einziger Read-Model-Endpoint `GET /api/statistics` (Query-Port-Pattern,
  kein Repository erweitert, Typ-Filter als Parameter), alles serverseitig berechnet,
  kein Caching, keine Client-Aggregation.
- Zwei getrennte Kennzahlen sauber unterschieden: „Auszahlung erwartet“ (alle
  Verkäufer) vs. „Auszahlung geleistet“ (nur abgerechnete, Summe `payoutAmount`).
- Leaderboard-Spalte „Auszahlung“ zeigt konsistent den erwarteten Betrag, ergänzt um ein
  ✓ bei erfolgter Abrechnung.

## Nicht enthalten

- Jegliche Schreiboperation — die Seite ist vollständig lesend.

## Referenzen

- [Epic_Statistik](../../requirements/bazaar-app/epics/Epic_Statistik/epic.md)
- [entities/verkaeufer.md](../../requirements/bazaar-app/entities/verkaeufer.md)
- [entities/artikel.md](../../requirements/bazaar-app/entities/artikel.md)

## Voraussetzung

Setzt voraus, dass Artikelannahme, Verkauf und Abrechnung bereits existieren (liefern
die Datenbasis für die Kennzahlen).
