# Round 24 — Druckfunktionen: Verkäufer-Übersicht

## Liefert

Das Abrechnungs-Übersichtsdokument für den Verkäufer, manuell auslösbar und
automatisch nach dem Abrechnen gedruckt.

## Umfang

- Druckansicht `print-verkaeufer-uebersicht`: drei Artikelgruppen (Noch im Verkauf /
  Verkauft / Zurückgegeben), Abrechnungsposten, mit zwei Reifegraden „vorläufig“ (vor
  dem Abrechnen) und „endgültig“ (nach dem Abrechnen) — ein Dokument, kein zweites für
  den jeweils anderen Zustand.
- Auslöser: manueller „Drucken“-Klick in der Abrechnungs-Ansicht (Round 20) sowie
  automatisch nach erfolgreichem Abschluss des Abrechnens (Round 21).
- Verbindliche Reihenfolge im Ablauf: Drucken → einsammeln → Rückgabe-Scan →
  Abrechnen → Drucken.
- Verwendet dieselbe Rundungsregel wie das Abrechnen-Popup (Round 21) — ein Wert, an
  drei Stellen identisch dargestellt.

## Nicht enthalten

- Der Abgabe-Beleg — eigenes, bereits vorhandenes Dokument.

## Referenzen

- [Epic_Druckfunktionen](../../requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md)

## Voraussetzung

Setzt voraus, dass die Abrechnung (Auswahl/Ansicht/Rückgabe und Abrechnen/Auszahlung)
bereits vollständig existiert.
