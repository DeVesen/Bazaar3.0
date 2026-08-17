---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: filter-panel

**Hinweis zur Abgrenzung:** Dies ist die `card`→Filter-Panel-Variante (eigene Such-Zeile oberhalb der Tabelle), **nicht** das Table-eigene Spalten-Filter-Menü (Trichter-Icon pro Spaltenkopf, siehe `docs/components/table/component.md` Abschnitt 6). Beide existieren parallel — hier bewusst ein separates, explizit abzusendendes Filter-Panel statt Live-Spaltenfilter.

Zwei Verwendungsstellen mit identischem Grundmuster, eine davon um einen zusätzlichen Filter erweitert:

| Variante | Verwendung | Unterschied |
|---|---|---|
| Basis | [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) | Marke + Kategorie + Freitext |
| + Verkäufer-Filter | [Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) | zusätzlich Verkäufer-Filter (`p-autoComplete`) |

## Kontext

```
Basis (Meine Artikel):
┌─────────────────────────────────────────────────┐
│ Meine Artikel                        [+ Neu]    │
├─────────────────────────────────────────────────┤
│ [Marke ▾] [Kategorie ▾] [🔍 Suche...] [🔍Suchen] │
├─────────────────────────────────────────────────┤
│ Nr. │ Bezeichnung │ Kategorie │ Marke │ Preis │✎│

+ Verkäufer-Filter (Alle Artikel):
┌─────────────────────────────────────────────────────────┐
│ Alle Artikel                                            │
├─────────────────────────────────────────────────────────┤
│ [Verkäufer 🔍▾] [Marke ▾] [Kategorie ▾] [🔍 Suche...] [Suchen] │
├─────────────────────────────────────────────────────────┤
│ Nr. │ Bezeichnung │ Kategorie │ Marke │ Preis │Verkäufer│🔍│
```

## Aufbau

| Element | PrimeNG | Nur in |
|---|---|---|
| Verkäufer-Filter | [AutoComplete (Type-Ahead)](autocomplete-typeahead.md) — über alle Verkäufer (Vorname/Nachname/Nummer) | Alle Artikel |
| Marke-Filter | [Select](select.md) — Liste aller Marken | beide |
| Kategorie-Filter | [Select](select.md) — Liste aller Kategorien | beide |
| Freitext-Feld | [Input](input.md), Variante Icon (Such-Icon) | beide |
| Suchen-Button | [Button](button.md) `icon="pi pi-search"` + Text „Suchen", ganz rechts im Panel | beide |

## Verhalten

- **Kein Live-Filter** beim Tippen/Auswählen — die Suche wird explizit ausgelöst durch:
  - `Enter` im Freitext-Feld
  - `Enter`/Auswahl in einem der `p-select`-/`p-autoComplete`-Filter
  - Klick auf den „Suchen"-Button
- Alle Wege lösen denselben Request aus: `GET /api/articles/mine` (Basis) bzw. `GET /api/articles` inkl. `sellerId` (+ Verkäufer-Filter), jeweils mit den aktuellen Filter-Werten. Query-Parameter → [`api/articles.md`](../api/articles.md).

## Akzeptanzkriterien

1. **AC-1** — WHEN der Nutzer Enter in einem Filterfeld drückt oder auf „Suchen" klickt, THEN SHALL das System die Tabelle mit den aktuellen Filter-Werten neu laden.
2. **AC-2** — WHILE kein Filter gesetzt ist, SHALL das System alle (eigenen bzw. alle) Artikel anzeigen.

Weitere AC → siehe [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) und [Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) AC-2/AC-3 (Verkäufer-Filter-spezifisch).

## Tags & Piles

**Tags:** #filter-panel #select #autocomplete #iconfield #search-button #shared-across-epics
