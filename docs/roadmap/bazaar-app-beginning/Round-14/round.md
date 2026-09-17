# Round 14 — Verkäufer-Stammdaten

## Liefert

Den vollständigen Durchstich für die Verkäufer-Verwaltung als Stammdaten-Pflege:
Verkäufer suchen, anlegen, bearbeiten, ansehen, löschen — ohne den
Artikel-Freigabe-Prozess.

## Umfang

- Seite `/sellers`: Filter-Panel (Freitext, Sortierung, Status-Dropdown, serverseitig),
  60 Karten pro Seite.
- Verkäufer-Karte (Kopf/Adresse/Status-Badge/Stats-Grid/Footer-Grid mit Angenommenem
  Warenwert/Offenem Warenwert/Umsatz).
- Status-Badge-Popup mit Abrechnungs-Zeitstempel und Admin-only-Reset (`settledAt`/
  `payoutAmount` zurücksetzen) — Endpoint `DELETE /api/sellers/{id}/settlement` (admin).
- Verkäufer-Bearbeiten-Dialog (Panels Personendaten/Kontakt/Konditionen/Sonstiges) — kein
  Admin-Rechte-Toggle, da Verkäufer keine Benutzer der App sind.
- Verkäufer-Detail-Modal (rein lesend: Nummer im Klartext + QR-Code + Artikelliste) —
  nutzt die Shared-Komponente `qr-code`.
- Backend: Entity Verkäufer, Query-Port für das Karten-Aggregat (eigenes Read-Model,
  kein `IQueryable` über die Port-Grenze), Endpoints `GET /api/sellers`,
  `GET /api/sellers/search`, `POST/PUT /api/sellers`, `DELETE /api/sellers/{id}`,
  `GET /api/sellers/{id}/articles`.
- Konditionsfelder (`salesCommission`, `feePerItem`) beim Anlegen aus dem gewählten
  Verkäufer-Typ vorbelegt; nur Admin darf sie überschreiben, Kassenpersonal sieht sie
  schreibgeschützt (`PUT` mit diesen Feldern nur mit Rolle admin wirksam, sonst `403`).
- Löschen nur, solange der Verkäufer keine Artikel hat (`409` sonst); `DELETE` bewusst
  `authenticated`, nicht `admin` — die Datenbedingung trägt die Sicherheit.

## Nicht enthalten

- Artikel-Freigeben-Popup (Scan-Dialog, Sammelscan, `POST /api/release`) — eigenes
  Häppchen, folgt nach der Artikelannahme, da es deren Scan-/Payment-Komponenten
  wiederverwendet.
- Storno einer Abrechnung im Sinne von „Abrechnung rückgängig machen“ ist hier nur der
  reine Reset-Endpoint; der fachliche Abrechnungsvorgang selbst gehört zum
  Abrechnung-Epic.

## Referenzen

- [Epic_Verkaeufer](../../requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md) (Story VERK-S01)
- [entities/verkaeufer.md](../../requirements/bazaar-app/entities/verkaeufer.md)
- [spec.md §9.7](../../requirements/bazaar-app/spec.md) (Verkäufer-Konditionen)

## Voraussetzung

Setzt voraus, dass Verkäufer-Typen bereits existieren (Konditionsvorbelegung) und
App-Shell/Login stehen.
