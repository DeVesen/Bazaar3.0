---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: filter-panel

**Hinweis zur Abgrenzung:** Dies ist die `card`→Filter-Panel-Variante (eigene Such-Zeile oberhalb der Tabelle), **nicht** das Table-eigene Spalten-Filter-Menü (Trichter-Icon pro Spaltenkopf, siehe `docs/components/table/component.md` Abschnitt 6). Beide existieren parallel — hier bewusst ein separates, explizit abzusendendes Filter-Panel statt Live-Spaltenfilter.

**Verwendung:** beide Apps. Sechs Verwendungsstellen mit identischem Grundmuster, die sich in Filterfeldern und Auslösung unterscheiden:

| App | Variante | Verwendung | Felder | Auslösung |
|---|---|---|---|---|
| Voranmelde-App | Basis | [Epic_Meine_Artikel](../../requirements/advance-registration/epics/Epic_Meine_Artikel/epic.md) | Marke · Kategorie · Freitext | explizit („Suchen") |
| Voranmelde-App | + Verkäufer-Filter | [Epic_Alle_Artikel](../../requirements/advance-registration/epics/Epic_Alle_Artikel/epic.md) | zusätzlich Verkäufer (`p-autoComplete`) | explizit („Suchen") |
| Voranmelde-App | Marken-Tabelle | [Epic_Marken](../../requirements/advance-registration/epics/Epic_Marken/epic.md) | Original/Neu-Status (Select) · Freitext — **kein** Marke-/Kategorie-/Verkäufer-Filter | live, debounced |
| Voranmelde-App | Verkäufer-Verwaltung | [Epic_Verkaeufer](../../requirements/advance-registration/epics/Epic_Verkaeufer/epic.md) | Verkäufer-Typ (Select) · Freitext (Name/Ort/E-Mail) | explizit („Suchen") |
| Haupt-App | Artikel | [Epic_Artikel](../../requirements/bazaar-app/epics/Epic_Artikel/epic.md) | Freitext (volle Breite) · Marke · Kategorie · Artikelstatus | live, debounced |
| Haupt-App | Verkäufer | [Epic_Verkaeufer](../../requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md) | Freitext · Sortierung · Verkäufer-Status | live, debounced |

**Unterschiede, die bewusst so sind:**

| Aspekt | Erläuterung |
|---|---|
| Freitext-Umfang | Voranmelde-App (Basis/Alle Artikel): Bezeichnung, Nummer. Haupt-App: Nummer, Bezeichnung, Marke, Kategorie **und Verkäufername** — am Annahmetisch sucht man nach dem, was man gerade weiß |
| Auslösung | **Kein reines App-Merkmal mehr**, sondern je Verwendungsstelle: die beiden Artikel-Filter der Voranmelde-App lösen explizit über „Suchen" aus (in Ruhe erfasst); die Marken-Tabelle (Voranmelde-App) und beide Haupt-App-Stellen filtern live mit Debounce — dort steht niemand, der erst „Suchen" klicken will, sondern die Liste soll sofort mitlaufen |
| Ort der Filterung | serverseitig, Haupt-App zusätzlich zusammen mit Paginierung und Sortierung |

Welche Auslösung eine Verwendungsstelle bekommt, hängt vom Kontext ab: sitzt jemand in Ruhe an einem Formular (Verkäufer erfasst Artikel) → explizit; steht jemand vor einer immer sichtbaren Verwaltungs-/Kassen-Tabelle → live.

## Kontext

```
Basis (Meine Artikel), ≥ Tablet:
┌─────────────────────────────────────────────────┐
│ [Marke ▾] [Kategorie ▾] [🔍 Suche...] [Suchen] [+ Neu] │
├─────────────────────────────────────────────────┤
│ Nr. │ Bezeichnung │ Kategorie │ Marke │ Preis │✎│

Basis (Meine Artikel), < Tablet:
┌─────────────────────────────┐
│ [🔍 Filter]         [+ Neu] │
├─────────────────────────────┤
│ Nr. │ Bezeichnung │ Preis │✎│

+ Verkäufer-Filter (Alle Artikel), ≥ Tablet:
┌─────────────────────────────────────────────────────────┐
│ [Verkäufer 🔍▾] [Marke ▾] [Kategorie ▾] [🔍 Suche...] [Suchen] │
├─────────────────────────────────────────────────────────┤
│ Nr. │ Bezeichnung │ Kategorie │ Marke │ Preis │Verkäufer│🔍│

Verkäufer-Verwaltung, ≥ Tablet:
┌─────────────────────────────────────────────────┐
│ [Typ ▾] [🔍 Suche Name/Ort/E-Mail...]   [+ Neu] │
├─────────────────────────────────────────────────┤
│ Nr. │ Vorname │ Nachname │ ... │ Typ │ Prov. │✎│

Verkäufer-Verwaltung, < Tablet:
┌─────────────────────────────┐
│ [🔍 Filter]         [+ Neu] │
├─────────────────────────────┤
│ Nr. │ Vorname │ ... │✎│
```

## Aufbau

| Element | PrimeNG | Nur in |
|---|---|---|
| Verkäufer-Filter | [Select](../select/component.md), Variante Type-Ahead — über alle Verkäufer (Vorname/Nachname/Nummer) | Alle Artikel |
| Marke-Filter | [Select](../select/component.md), Variante Dropdown — Liste aller Marken | Basis, Alle Artikel, Haupt-App Artikel |
| Kategorie-Filter | [Select](../select/component.md), Variante Dropdown — Liste aller Kategorien | Basis, Alle Artikel, Haupt-App Artikel |
| Status-Filter | [Select](../select/component.md), Variante Dropdown — Original/Neu | nur Marken-Tabelle |
| Verkäufer-Typ-Filter | [Select](../select/component.md), Variante Dropdown — Liste aller Verkäufer-Typen | nur Verkäufer-Verwaltung |
| Freitext-Feld | [Input](../input/component.md), Variante Icon (Such-Icon) | alle |
| Suchen-Button | [Button](../button/component.md) mit `<svg data-p-icon="search">` + Text „Suchen", ganz rechts im Panel | nur bei expliziter Auslösung — entfällt bei live/debounced Verwendungsstellen |
| Filter-Button (< Tablet) | [Button](../button/component.md) mit `pi-filter` + Text „Filter" — ersetzt alle Filterfelder inkl. Freitext, öffnet `p-drawer` (Sheet von unten) mit den Feldern der jeweiligen Verwendungsstelle | alle |
| Neu-Button | [Button](../button/component.md), Text konfigurierbar über `createLabel` (gleiche Optik wie [Table](../table/component.md) `canAdd`), ganz rechts, außerhalb des Drawers | nur wenn `canAdd` gesetzt (Basis „Meine Artikel", Verkäufer-Verwaltung) |

## Verhalten

Zwei Auslösungsvarianten, je Verwendungsstelle festgelegt (siehe Tabelle oben):

**Explizit** (Basis, + Verkäufer-Filter, Verkäufer-Verwaltung):
- **Kein Live-Filter** beim Tippen/Auswählen — die Suche wird explizit ausgelöst durch:
  - `Enter` im Freitext-Feld
  - `Enter`/Auswahl in einem der `p-select`-/`p-autoComplete`-Filter
  - Klick auf den „Suchen"-Button
- Alle Wege lösen denselben Request aus: `GET /api/articles/mine` (Basis) bzw. `GET /api/articles` inkl. `sellerId` (+ Verkäufer-Filter), jeweils mit den aktuellen Filter-Werten. Query-Parameter → [`api/articles.md`](../../requirements/advance-registration/api/articles.md). Die Verkäufer-Verwaltung ruft `GET /api/sellers` mit `sellerTypeId` und `search` → [`api/sellers.md`](../../requirements/advance-registration/api/sellers.md).

**Live, debounced** (Marken-Tabelle, beide Haupt-App-Stellen):
- Freitext-Feld löst 400 ms nach der letzten Eingabe automatisch aus (Debounce), kein Suchen-Button vorhanden.
- Auswahl in einem `p-select`-Filter (hier: Status) löst sofort aus, ohne Debounce.
- Die Marken-Tabelle ruft `GET /api/brands` mit den aktuellen Filter-Werten (`status`, `search`).

**Neu-Button:** steht in derselben Zeile wie die Filterfelder, ganz rechts, unabhängig vom Breakpoint sichtbar — öffnet über den `create`-Output das Anlege-Formular der jeweiligen Verwendungsstelle (Basis: Artikelanlage-Dialog, Verkäufer-Verwaltung: Dialog „Neuen Verkäufer anlegen"). Nicht mehr im Seitentitel.

## Responsive

Breakpoint identisch zu [Table](../table/component.md) Abschnitt 10.

| Viewport | Verhalten |
|---|---|
| ≥ Tablet (≥ 768 px) | Alle Filterfelder der jeweiligen Verwendungsstelle (Marke, Kategorie, Status, Freitext, ggf. Verkäufer) nebeneinander sichtbar, „+ Neu"-Button ganz rechts |
| < Tablet (< 768 px) | Filterfelder kollabiert zu einem „Filter"-Button ([Button](../button/component.md), Icon `pi-filter`, Text „Filter“, links) — öffnet ein `p-drawer` (Sheet von unten) mit denselben Feldern (inkl. „Suchen"-Button bei expliziter Auslösung). „+ Neu"-Button bleibt daneben sichtbar |

Das Verhalten der Filterfelder selbst (Auslösung explizit oder live/debounced) ändert sich im Drawer nicht — nur die Darstellung wird kollabiert.

## Akzeptanzkriterien

1. **AC-1** — WHEN der Nutzer bei expliziter Auslösung Enter in einem Filterfeld drückt oder auf „Suchen" klickt, THEN SHALL das System die Tabelle mit den aktuellen Filter-Werten neu laden.
2. **AC-2** — WHILE kein Filter gesetzt ist, SHALL das System alle (eigenen bzw. alle) Artikel/Marken/Verkäufer anzeigen.
3. **AC-3** — WHILE der Viewport < 768 px breit ist, SHALL das System die Filterfelder zu einem „Filter"-Button kollabieren; ein Klick öffnet einen `p-drawer` mit denselben Feldern (und bei expliziter Auslösung dem „Suchen"-Button), der „+ Neu"-Button bleibt außerhalb des Drawers sichtbar.
4. **AC-4** — WHEN bei live/debounced Auslösung (Marken-Tabelle) der Nutzer im Freitext-Feld tippt, THEN SHALL das System 400 ms nach der letzten Eingabe automatisch neu laden; WHEN der Status-Filter geändert wird, THEN SHALL das System sofort ohne Debounce neu laden.
5. **AC-5** — WHEN der Nutzer auf „+ Neu" klickt, THEN SHALL das System das Anlege-Formular der jeweiligen Verwendungsstelle öffnen — nur bei Verwendungsstellen mit `canAdd`.

Weitere AC → siehe [Epic_Meine_Artikel](../../requirements/advance-registration/epics/Epic_Meine_Artikel/epic.md), [Epic_Alle_Artikel](../../requirements/advance-registration/epics/Epic_Alle_Artikel/epic.md) AC-2/AC-3 (Verkäufer-Filter-spezifisch) und [Epic_Marken](../../requirements/advance-registration/epics/Epic_Marken/epic.md).

## Tags & Piles

**Tags:** #filter-panel #select #autocomplete #iconfield #search-button #shared-across-epics
