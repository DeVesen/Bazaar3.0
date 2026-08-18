---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: filter-panel

**Hinweis zur Abgrenzung:** Dies ist die `card`→Filter-Panel-Variante (eigene Such-Zeile oberhalb der Tabelle), **nicht** das Table-eigene Spalten-Filter-Menü (Trichter-Icon pro Spaltenkopf, siehe `docs/components/table/component.md` Abschnitt 6). Beide existieren parallel — hier bewusst ein separates, explizit abzusendendes Filter-Panel statt Live-Spaltenfilter.

**Verwendung:** beide Apps. Vier Verwendungsstellen mit identischem Grundmuster, die sich nur in den Filterfeldern unterscheiden:

| App | Variante | Verwendung | Felder |
|---|---|---|---|
| Voranmelde-App | Basis | [Epic_Meine_Artikel](../../requirements/advance-registration/epics/Epic_Meine_Artikel/epic.md) | Marke · Kategorie · Freitext |
| Voranmelde-App | + Verkäufer-Filter | [Epic_Alle_Artikel](../../requirements/advance-registration/epics/Epic_Alle_Artikel/epic.md) | zusätzlich Verkäufer (`p-autoComplete`) |
| Haupt-App | Artikel | [Epic_Artikel](../../requirements/bazaar-app/epics/Epic_Artikel/epic.md) | Freitext (volle Breite) · Marke · Kategorie · Artikelstatus |
| Haupt-App | Verkäufer | [Epic_Verkaeufer](../../requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md) | Freitext · Sortierung · Verkäufer-Status |

**Unterschiede zwischen den Apps, die bewusst so sind:**

| Aspekt | Voranmelde-App | Haupt-App |
|---|---|---|
| Freitext-Umfang | Bezeichnung, Nummer | Nummer, Bezeichnung, Marke, Kategorie **und Verkäufername** — am Annahmetisch sucht man nach dem, was man gerade weiß |
| Auslösung | explizit über „Suchen"-Button | **automatisch nach Debounce** — die Kasse tippt und liest sofort mit |
| Ort der Filterung | serverseitig | serverseitig, zusammen mit Paginierung und Sortierung |

Die abweichende Auslösung ist der einzige strukturelle Unterschied: In der Voranmelde-App erfasst ein Verkäufer in Ruhe und drückt „Suchen"; in der Haupt-App steht jemand davor und wartet.

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
| Verkäufer-Filter | [Select](../select/component.md), Variante Type-Ahead — über alle Verkäufer (Vorname/Nachname/Nummer) | Alle Artikel |
| Marke-Filter | [Select](../select/component.md), Variante Dropdown — Liste aller Marken | beide |
| Kategorie-Filter | [Select](../select/component.md), Variante Dropdown — Liste aller Kategorien | beide |
| Freitext-Feld | [Input](../input/component.md), Variante Icon (Such-Icon) | beide |
| Suchen-Button | [Button](../button/component.md) mit `<svg data-p-icon="search">` + Text „Suchen", ganz rechts im Panel | beide |

## Verhalten

- **Kein Live-Filter** beim Tippen/Auswählen — die Suche wird explizit ausgelöst durch:
  - `Enter` im Freitext-Feld
  - `Enter`/Auswahl in einem der `p-select`-/`p-autoComplete`-Filter
  - Klick auf den „Suchen"-Button
- Alle Wege lösen denselben Request aus: `GET /api/articles/mine` (Basis) bzw. `GET /api/articles` inkl. `sellerId` (+ Verkäufer-Filter), jeweils mit den aktuellen Filter-Werten. Query-Parameter → [`api/articles.md`](../../requirements/advance-registration/api/articles.md).

## Akzeptanzkriterien

1. **AC-1** — WHEN der Nutzer Enter in einem Filterfeld drückt oder auf „Suchen" klickt, THEN SHALL das System die Tabelle mit den aktuellen Filter-Werten neu laden.
2. **AC-2** — WHILE kein Filter gesetzt ist, SHALL das System alle (eigenen bzw. alle) Artikel anzeigen.

Weitere AC → siehe [Epic_Meine_Artikel](../../requirements/advance-registration/epics/Epic_Meine_Artikel/epic.md) und [Epic_Alle_Artikel](../../requirements/advance-registration/epics/Epic_Alle_Artikel/epic.md) AC-2/AC-3 (Verkäufer-Filter-spezifisch).

## Tags & Piles

**Tags:** #filter-panel #select #autocomplete #iconfield #search-button #shared-across-epics
