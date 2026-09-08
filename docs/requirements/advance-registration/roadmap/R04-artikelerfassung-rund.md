---
id: ROADMAP-R04
status: draft
updated: 2026-09-08
---

# R04 — Artikelerfassung rund

**Voranmelde-App · Roadmap-Schritt 4 von 12**

## Worum es geht

Die Artikelerfassung aus R03 wird alltagstauglich: Wer dreißig Artikel einträgt, will sie
in Serie anlegen, wiederfinden und sich nicht um volle Nummernblöcke kümmern müssen.

## Umfang

- Filter-Panel von [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md): Marke, Kategorie,
  Freitext. Suche wird über Enter oder den „Suchen"-Button ausgelöst, **kein** Live-Filter.
- Paginierung und Sortierung der Artikeltabelle
- „Speichern + kopieren": Dialog bleibt offen, Felder bleiben stehen, die Antwort liefert
  `nextNumber` für den nächsten Artikel
- **Automatische Blockerweiterung** nach [`spec.md`](../spec.md) §6: ist der aktuelle Block
  voll, wird beim nächsten Artikel der nächste freie Block zugewiesen
- `expectedNumber` als Vorbedingung beim Anlegen, `409` bei Abweichung, und die
  Behandlung dieses Konflikts in der Oberfläche
- Anzeige „N Nummern · M vergeben" auf der Nummernblock-Seite zählt korrekt mit

## Nicht in diesem Schritt

- Verwaltungsseiten für Stammdaten — R05
- Artikelübersicht des Admins — R08
- Barcode, Etikettendruck und alles, was laut Epic der Haupt-App gehört

## Setzt voraus

[R03](R03-artikelerfassung.md) — Artikel lassen sich anlegen, ändern und löschen.

## Fertig, wenn — von Hand prüfbar

1. Bei Blockgröße 10 zehn Artikel anlegen → der elfte Artikel bekommt eine Nummer aus einem
   neu zugewiesenen Block, die Nummernblock-Seite zeigt jetzt zwei Blöcke.
2. Mit „Speichern + kopieren" fünf ähnliche Artikel hintereinander anlegen, ohne den Dialog
   zu schließen — jeder bekommt die nächste Nummer.
3. Filter auf eine Marke setzen und suchen → nur passende Artikel; Filter zurücksetzen →
   wieder alle.
4. Freitext-Suche nach einem Teil einer Artikelbezeichnung findet den Artikel.
5. Bei mehr Artikeln als einer Seite: Blättern funktioniert, Sortierung nach Nummer und nach
   Bezeichnung greift über die gesamte Liste, nicht nur über die sichtbare Seite.
6. Nummernblock-Seite zeigt für den ersten Block „10 Nummern · 10 vergeben".

## Quellen

- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) Abschnitte 1, 4, 5
- [`api/articles.md`](../api/articles.md) · [`api/blocks.md`](../api/blocks.md)
- [components/filter-panel](../../../components/filter-panel/component.md) ·
  [components/table](../../../components/table/component.md)
- [`spec.md`](../spec.md) §6 Nummernblock-System

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #artikel #nummernblock
