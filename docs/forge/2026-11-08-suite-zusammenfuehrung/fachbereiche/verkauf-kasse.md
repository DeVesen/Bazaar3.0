# Fachbereich Verkauf / Kasse

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [artikel-lebenszyklus](../querschnitt/artikel-lebenszyklus.md) · [betrieb](../architektur/betrieb.md) · [leitplanken](../leitplanken.md) (L5) · [datenfluesse](../querschnitt/datenfluesse.md)
Entscheidungen: E1, E1b, E12
Schlagworte: Kasse, Verkauf, Warenkorb, Kassenvorgang, Storno, Doppelverkauf, Scan, Antwortzeit, Notbetrieb, Nacherfassung, Preisaktion, Datenfluss

## Zweck und Abgrenzung

Der Kassenvorgang: Artikel scannen, Warenkorb, bezahlen, Storno. Rückgabe und Auszahlung stehen in
[rueckgabe-abrechnung](rueckgabe-abrechnung.md).

## Heute

Haupt-App: [`Epic_Verkauf`](../../../requirements/bazaar-app/epics/Epic_Verkauf/epic.md).

- Scan der Nummer, Warenkorb, `POST /api/sales` atomar.
- Storno nur für den letzten Vorgang.
- **Kein Kassenvorgang als eigener Datensatz.** Nur `soldAt` je Artikel.
- **Doppelverkauf an zwei Kassen möglich** (V5).
- Läuft im LAN ohne Internet.

## Ziel

- **Suche ausschließlich per Basar-Tag-Nummer** ([nummern](../querschnitt/nummern.md)).
- Die Anzeige je Position zeigt Preis, **Bezeichnung und Größe** zum Sichtabgleich.
- **Kassenvorgang als eigener Datensatz** mit Positionen, Kassierer, Zeitpunkt und Summe. Das ist die Grundlage für Storno, Nachvollziehbarkeit und Statistik ([datenmodell](../querschnitt/datenmodell.md)).
- **Doppelverkauf ist ausgeschlossen.** Zwei Kassen können denselben Artikel nicht verkaufen. Die zweite Kasse bekommt eine klare Meldung.
- **Storno:** heute nur der letzte Vorgang. Ob mehr nötig ist (Admin), ist offen.
- **Tempo und Vorrang (L5):**
  - Die Kasse antwortet spürbar sofort.
  - Sie hat einen eigenen Container (Basar-API) und ist nicht durch Katalog oder Voranmeldung belastet.
- **Notbetrieb (E1b):**
  - Bei Leitungsausfall schaltet die zweite Leitung um.
  - Sonst wird eine Papier-Kassenliste mit Basar-Tag-Nummer und Preis geführt und später nacherfasst.
  - Die Nacherfassung braucht eine eigene, schnelle Eingabemaske (offen).
- **Wirkung nach außen:**
  - Ein verkaufter Artikel verschwindet innerhalb etwa einer Minute aus dem Katalog.
  - Der Verkäufer sieht „verkauft“.

## Datenflüsse: rein / raus

Nummern laut [datenfluesse](../querschnitt/datenfluesse.md). Änderungen an Flüssen werden dort eingetragen, nicht hier.

| Richtung | Flüsse |
|---|---|
| **rein** (nutzt) | D9 Artikel im Verkauf mit Basar-Tag-Nummer und Preis |
| **raus** (liefert) | **D12 Kassenvorgang**, D13 Sicht für den Verkäufer, D11 öffentliche Liste (verkauft → weg) |

## Berührungspunkte

- [lebenszyklus](../querschnitt/artikel-lebenszyklus.md): Im Verkauf ↔ Verkauft
- [oeffentlicher-katalog](oeffentlicher-katalog.md): Aktualität
- [betrieb](../architektur/betrieb.md): Konnektivität, Notbetrieb
- [statistik-auswertung](statistik-auswertung.md): Umsätze aus Kassenvorgängen

## Offene Fragen

1. Wie viele Kassen gleichzeitig? Wie lange darf ein Scan höchstens dauern (Zielwert)?
2. Preisaktionen am Nachmittag (z. B. −50 %)? Wie wirken sie auf Kasse, Katalog und Abrechnung?
3. Kartenzahlung bzw. Kassenbuch: bleibt es bei bar?
4. Braucht es einen Bon für Käufer?

## Nächste Planungsschritte

- Zielwerte für Antwortzeit und Kassenanzahl festlegen.
- Notbetrieb mit Nacherfassung als Ablauf skizzieren.
