# Round 15 — Artikel-Übersicht & Korrektur

## Liefert

Den vollständigen Durchstich für die zentrale Artikel-Übersicht — die Korrekturstelle
für Tippfehler und (Admin-only) Zeitstempel-Korrekturen über alle Verkäufer hinweg.

## Umfang

- Seite `/articles`: Filter-Panel (Freitext über Nummer/Bezeichnung/Marke/Kategorie/
  Verkäufername + Marken-/Kategorien-/Status-Dropdown, serverseitig), 50 Zeilen pro
  Seite.
- Tabelle (Nr. · Bezeichnung · Kategorie · Marke · Preis · Status · Verkäufer ·
  Aktionen) — **kein** „+ Neu“, Artikel entstehen ausschließlich über Artikelannahme
  oder Import.
- Edit-Dialog (Artikelnummer read-only, Löschen-Button nur Admin, solange `soldAt`
  leer ist).
- Artikelstatus-Popup (nur Admin): Zeitstempel setzen/löschen mit Kaskadierungsregel
  (nachfolgende Zeitstempel werden bei Löschen eines früheren automatisch `NULL`, mit
  Bestätigungsdialog, der die betroffenen Felder benennt), `soldManually`-Flag bei
  manuellem Setzen von „Verkauft am“, gegenseitige Sperre `soldAt`/`returnedAt`.
- Backend: Entity Artikel (Status ist abgeleitet aus den Zeitstempeln, kein eigenes
  Statusfeld), Endpoints `GET /api/articles` (authenticated), `PUT /api/articles/{id}`
  (authenticated — beide Rollen dürfen Stammfelder korrigieren), `DELETE
  /api/articles/{id}` (admin), `PUT /api/articles/{id}/timestamps` (admin).
- Gestaffelte Sperrregeln: `soldAt` gesetzt → nur `price` gesperrt (`409` „Verkauf
  zuerst stornieren“); `settledAt` gesetzt → alles gesperrt (`409` „Abrechnung zuerst
  stornieren“).

## Nicht enthalten

- Das Entstehen von Artikeln selbst (Artikelannahme, Import).
- Der reguläre Verkaufs-/Freigabe-/Abrechnungsvorgang — nur die nachträgliche Korrektur.

## Referenzen

- [Epic_Artikel](../../requirements/bazaar-app/epics/Epic_Artikel/epic.md)
- [entities/artikel.md](../../requirements/bazaar-app/entities/artikel.md)

## Voraussetzung

Setzt voraus, dass Marken, Kategorien und Verkäufer bereits existieren (Filterfelder,
Verknüpfungen); die Artikel-Entität selbst kann bereits vor der Artikelannahme
angelegt werden, da diese Seite reine Verwaltung ist.
