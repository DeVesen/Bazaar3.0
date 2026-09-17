---
round: Round-24
status: geklärt
---

# Spec: Round 24 — Druckfunktionen: Verkäufer-Übersicht

## Fein-Spezifikation

### Ziel

Reales Druck-Dokument für die beiden Stub-Aufrufe aus [Round-20](../Round-20/spec.md)
(manuelles „Drucken", `printService.printSellerSummary({sellerId, phase:
'preliminary'})`) und [Round-21](../Round-21/spec.md) (automatisch nach Abrechnen,
`phase: 'final'`) — ein Dokument, zwei Reifegrade, kein zweiter Button.

### Frontend

**`print-verkaeufer-uebersicht`** (`shared/components/print-verkaeufer-uebersicht/`
— von zwei Aufrufstellen aus Round-20/21 genutzt, daher `shared/`): eigene
Druckansicht exakt nach
[print-verkaeufer-uebersicht.md](../../../components/print-verkaeufer-uebersicht.md).
- Kopf: statischer Titel „Basar — Verkäufer-Übersicht" (analog Round-23, kein
  Systemparameter), Verkäufer-Name/Ort, QR-Code + Klartext
  ([`qr-code`](../../../components/qr-code/component.md)).
- Drei Artikelgruppen in fester Reihenfolge **Noch im Verkauf → Verkauft →
  Zurückgegeben**, je mit Anzahl in der Überschrift; leere Gruppe zeigt „—" statt zu
  fehlen. Keine vierte Gruppe „Sonstige" — Datenmodell kennt nur vier Zeitstempel-
  Zustände (Round-15).
- Abrechnungsposten Umsatz/Provision/Auszahlung — **exakt dieselben Werte** wie
  `settlement-panel` (Round-20/21, gemeinsame `SettlementCalculation`-Routine,
  Round-21), plus Hinweiszeile zur bereits bezahlten Annahmegebühr (kein Abzug).
- **Reifegrad**, gesteuert über den `phase`-Parameter des Aufrufs:
  - `'preliminary'` (Aufruf aus Round-20, solange Artikel im Verkauf sind): Gruppe
    „Noch im Verkauf" gefüllt, alle Beträge mit deutlich sichtbarem Hinweis
    „VORLÄUFIG — es sind noch Artikel im Verkauf." am Fuß.
  - `'final'` (Aufruf aus Round-21 nach erfolgreichem Abrechnen, oder manuell aus
    Round-20 bei bereits abgerechnetem Verkäufer): vollständige Gruppen, endgültige
    Beträge, kein Vorläufig-Vermerk.
  - Kein zweites Dokument, keine zweite Komponente — ein Template mit
    `@Input() phase`.

**`printService.printSellerSummary(...)` — reale Implementierung** (ersetzt die
Stubs aus Round-20/21, Aufrufstellen unverändert): lädt die Daten über
`GET /api/sellers/{id}/settlement` (Round-20, liefert bereits alle nötigen Felder
inkl. Artikelgruppen-Zählungen) sowie `GET /api/sellers/{id}/articles` (Round-14, für
die vollständige Artikelliste je Gruppe), rendert `print-verkaeufer-uebersicht` und
ruft `window.print()`.

### Backend

Keine neuen Endpoints — reine Anzeige bereits vorhandener Daten (Round-14/15/20/21).

### Akzeptanzkriterien

Epic_Druckfunktionen AC-4, AC-5, AC-6, AC-7, AC-8 (Verkäufer-Übersicht-Teile).
`print-verkaeufer-uebersicht.md` AC-1 bis AC-7 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Component-Test `print-verkaeufer-uebersicht` (Vitest) — Gruppierung, leere Gruppe
  „—", Reifegrad-Umschaltung (`phase`), Rundungskonsistenz mit `settlement-panel`.
- Frontend: beide Aufrufstellen (manuell Round-20, automatisch Round-21) liefern
  konsistenten Reifegrad.

### Bewusst nicht in diesem Round

Eigene Endpoints — ausschließlich bereits vorhandene Daten werden gedruckt.
