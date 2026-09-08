---
id: ROADMAP-R09
status: draft
updated: 2026-09-08
---

# R09 — Einstellungen

**Voranmelde-App · Roadmap-Schritt 9 von 12**

## Worum es geht

Die seit R01 fest verdrahteten Seed-Werte werden pflegbar: Basar-Termine, Nummernblock-Parameter,
Default-Verkäufer-Typ und der Info-Text. Damit lässt sich die App zum ersten Mal für einen
konkreten Basar konfigurieren, ohne die Datenbank anzufassen.

Zusätzlich entsteht hier `GET /api/public/info` — der öffentliche Endpoint, aus dem sowohl die
Startseiten (R10) als auch das Countdown-Widget (R11) ihre Termine ziehen.

## Umfang

- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) vollständig — Basar-Konfiguration
  (die fünf Termine), Nummernblock-Parameter (`startNumber`, `blockSize`, `defaultBlockCount`),
  Default-Verkäufer-Typ, Info-Text
- `GET /api/settings` und `PUT /api/settings` als **Vollersetzung**, sofort wirksam
- Validierung: `400` bei nicht aufsteigenden Terminen, unbekanntem `defaultTypeId` oder einem
  Info-Text über 4000 Zeichen; `409`, wenn `startNumber` über einer bereits vergebenen
  Artikelnummer läge
- `GET /api/public/info` (öffentlich, ohne Anmeldung): die fünf Termine als ISO-8601,
  `defaultConditions` und `infoText`; nicht gepflegte Werte sind `null`
- Die Seeds aus R01 bleiben als Anfangswerte bestehen, sind ab jetzt aber über die Oberfläche
  änderbar

## Nicht in diesem Schritt

- Countdown-Anzeige und Timeline-Darstellung — R10 und R11
- Export — R12

## Setzt voraus

[R05](R05-stammdaten.md) — Verkäufer-Typen existieren, damit ein Default-Typ ausgewählt werden
kann. [R03](R03-artikelerfassung.md) liefert vergebene Artikelnummern, gegen die die
`startNumber`-Prüfung greift.

## Fertig, wenn — von Hand prüfbar

1. Als Admin die fünf Termine setzen und speichern, Seite neu laden → Werte stehen noch da.
2. Termine in falscher Reihenfolge speichern (z. B. Basar-Ende vor Basar-Beginn) →
   Fehlermeldung, nichts wird gespeichert.
3. `startNumber` auf einen Wert über einer bereits vergebenen Artikelnummer setzen →
   Speichern wird mit Hinweis abgelehnt.
4. `blockSize` ändern → ein danach neu registrierter Verkäufer bekommt Blöcke der neuen Größe,
   bestehende Blöcke bleiben unverändert.
5. Default-Verkäufer-Typ wechseln → ein danach registrierter Verkäufer bekommt den neuen Typ.
6. Info-Text setzen und `GET /api/public/info` **ohne Anmeldung** aufrufen → Termine und
   Info-Text kommen zurück; ein nicht gepflegter Termin ist `null`.
7. Als Verkäufer angemeldet ist die Einstellungsseite weder sichtbar noch direkt erreichbar.

## Quellen

- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md)
- [`api/settings.md`](../api/settings.md) · [`api/public.md`](../api/public.md)
- [components/einstellungen-form.md](../components/einstellungen-form.md)
- [`spec.md`](../spec.md) §6 Nummernblock-System

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #einstellungen #admin
