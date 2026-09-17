# Round 20 — Abrechnung: Verkäufer-Auswahl, Ansicht & Rückgabe

## Liefert

Den ersten Teil des Abrechnungs-Wizards: Verkäufer wählen, Kennzahlen und Artikelliste
ansehen, nicht verkaufte Artikel als zurückgegeben erfassen.

## Umfang

- Seite `/settlement` als Wizard, Schritt 1: Verkäufer-Selektion (`seller-search`,
  `showCreateButton=false`).
- Schritt 2: Abrechnungs-Ansicht — Kopfzeile mit Aktions-Buttons, KPI-Kacheln
  (Komponente `kpi-tile`, dreispaltig) und eine rein lesende Artikelliste, sortiert nach
  Artikelnummer.
- Zurückgeben-Popup (Wiederverwendung der Komponente `scan-dialog` aus Round 18, hier mit
  `targetField="returnedAt"`).
- Backend: Read-Model-Endpoint `GET /api/sellers/{id}/settlement`, Endpoint
  `PUT /api/articles/{id}/return`.
- Ein bereits abgerechneter Verkäufer bleibt in der Auswahl sichtbar und wählbar, aber
  schreibgeschützt (mit Badge) — kein Verstecken.

## Nicht enthalten

- Der eigentliche Abrechnen-Vorgang (Berechnung, `settledAt`, Auszahlung) — folgt direkt
  danach.
- Das Stornieren einer bereits abgeschlossenen Abrechnung — das liegt im
  Reset-Endpoint der Verkäufer-Verwaltung (Round 14).

## Referenzen

- [Epic_Abrechnung](../../requirements/bazaar-app/epics/Epic_Abrechnung/epic.md)
- [entities/verkaeufer.md](../../requirements/bazaar-app/entities/verkaeufer.md)
- [entities/artikel.md](../../requirements/bazaar-app/entities/artikel.md)

## Voraussetzung

Setzt voraus, dass Verkäufer-Verwaltung, Verkauf (für `soldAt`) und die
Scan-Dialog-Komponente bereits existieren.
