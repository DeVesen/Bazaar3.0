---
id: C-004
status: draft
updated: 2026-07-31
---

# Component: KPI-Tile

**Bibliothek:** Eigener Wrapper — kein PrimeNG-Äquivalent
**Verwendung:** Beide Apps — überall dort, wo Kennzahlen als Kachel-Grid dargestellt werden.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter
- 3. Visuelles Design — Farben & Stil
- 4. Verwendung in Epics — Einsatzorte
- 5. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — Prüfbare Kriterien
- Tags & Piles — Thematische Einordnung

**Beschreibung:** Einzelne Kennzahl-Kachel für KPI-Übersichten, konfigurierbar im Grid c3 bis c6.

**Verwendungszweck:** Wird auf der Statistik-Seite und in Home-Dashboards eingesetzt.

---

## Überblick

Die KPI-Tile ist die Standard-Darstellung für einzelne Kennzahlen. Sie erscheint immer in einem **KPI-Grid** — einem CSS-Grid mit konfigurierbarer Spaltenanzahl (`c3`–`c6`).

**Dumb Component:** Alle Daten kommen per `@Input()`. Kein Klick-Event, keine Interaktion — reine Anzeige.

---

## 1. ASCII-Darstellung

```
Einzelne KPI-Tile:
┌────────────────────────┐
│ GESAMT ARTIKEL         │  ← label (uppercase, klein, muted)
│                        │
│  1.234                 │  ← value (groß, fett)
│  Stück                 │  ← subLabel (optional, klein, muted)
└────────────────────────┘

Mit Severity (Farb-Akzent oben):
┌────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ← 3 px Streifen in Severity-Farbe
│ IM VERKAUF             │
│                        │
│  89                    │
│  Artikel               │
└────────────────────────┘

KPI-Grid c5 (5 Spalten):
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ GESAMT   │ ANGENOM. │ IM VK    │ VERKAUFT │ RETOUR   │
│          │          │          │          │          │
│  1.234   │  1.100   │    89    │   980    │   31     │
│  Artikel │  Artikel │  Artikel │  Artikel │  Artikel │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 2. Input / Output Schnittstelle

### KPI-Tile (einzelne Kachel)

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `label` | `string` | `@Input` | Beschriftung der Kachel (wird uppercase dargestellt) |
| `value` | `string \| number` | `@Input` | Anzuzeigender Hauptwert |
| `subLabel` | `string` | `@Input` | Optionale Einheit / Zusatz unterhalb des Werts |
| `severity` | `'success' \| 'warning' \| 'danger' \| 'info' \| null` | `@Input` | Farb-Akzent-Streifen oben (null = kein Streifen) |

### KPI-Grid (Wrapper)

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `columns` | `3 \| 4 \| 5 \| 6` | `@Input` | Anzahl der Spalten im Grid |

Der KPI-Grid-Wrapper ist ein reines Layout-Element (`display: grid; grid-template-columns: repeat(N, 1fr); gap: 12px`). Die einzelnen `kpi-tile`-Instanzen werden als `ng-content` projiziert.

---

## 3. Visuelles Design

### Kachel-Stil

| Element | Stil |
|---|---|
| Container | `p-card` als Basis; padding 16 px |
| Label | 11 px, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.5px`, muted |
| Wert | 28 px, `font-weight: 800` |
| SubLabel | 12 px, muted, margin-top 2 px |
| Severity-Streifen | 3 px oben, `border-top: 3px solid <severity-color>` |

### Container-Farben & Border

| Eigenschaft | Wert |
|---|---|
| Hintergrund | `#ffffff` |
| Border | `1px solid var(--border)` |
| Border-radius | `8 px` |
| Text-align | `center` |

### Severity-Farben

| Severity | Farbe |
|---|---|
| `success` | `var(--p-green-500)` |
| `warning` | `var(--p-orange-400)` |
| `danger` | `var(--p-red-500)` |
| `info` | `var(--p-blue-500)` |
| `null` | kein Streifen |

### Typografie-Stufen

| Element | Font-Size | Font-Weight | Farbe |
|---|---|---|---|
| Label | 11 px | 600 | `--muted` |
| Hauptwert | 28 px | 800 | `#0f1f30` (Standard) · Severity-Farbe bei Akzent |
| Sub-Label | 12 px | 400 | `--muted` |

### Responsive

| Viewport | Verhalten |
|---|---|
| Desktop (≥ 1024 px) | Konfigurierte Spaltenanzahl |
| Tablet (768–1023 px) | Max. 3 Spalten |
| Mobil (< 768 px) | 2 Spalten |

### Grid-Klassen

| Klasse | Spalten | Einsatz |
|---|---|---|
| `c6` | 6 gleichbreit | Statistik Zeile 1 |
| `c5` | 5 gleichbreit | Statistik Zeile 3 · Admin-Home (Voranmelde) |
| `c4` | 4 gleichbreit | Home (Voranmelde) |
| `c3` | 3 gleichbreit | Statistik Zeile 2 · Abrechnung |

---

## 4. Verwendung in Epics

| Epic | App | Spalten | Kacheln |
|---|---|---|---|
| Statistik (Artikel-Übersicht) | Bazaar | `c6` | Gesamt, Angenommen, Im Verkauf, Verkauft, Retour, Verkaufsquote |
| Statistik (Rückblick) | Bazaar | `c3` | Warenwert Angenom., Warenwert Retour, Offener Warenwert |
| Statistik (Finanz) | Bazaar | `c5` | Einnahmen, Provision, Gebühren, Gesamt, Auszahlung |
| Abrechnung | Bazaar | `c3` | Offene Artikel, Verkaufte Artikel, Umsatz |
| Home — Verkäufer | Voranmelde | `c4` | Countdown, Meine Artikel, Konditionen, Gebühr gesamt |
| Home — Admin | Voranmelde | `c5` | Countdown, Verkäufer, Artikel gesamt, Kategorien, Marken |

---

## 5. PrimeNG-Basis

```
p-card        ← Kachel-Container (Shadow + Border-Radius)
```

Kein weiteres PrimeNG-Element — Layout und Typografie per CSS.

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL die KPI-Tile in einem Grid mit der konfigurierten Spaltenanzahl (3 bis 6) rendern, wobei das Grid `grid-template-columns: repeat(N, 1fr)` mit Gap 12 px verwendet.
2. **AC-2** — WHEN `value` übergeben wird, THEN SHALL das System den Wert in 28 px und `font-weight: 800` anzeigen; ist `subLabel` gesetzt, erscheint dieser in 12 px muted darunter.
3. **AC-3** — WHERE `severity` auf `'success'`, `'warning'`, `'danger'` oder `'info'` gesetzt ist, SHALL das System einen 3 px breiten Streifen in der entsprechenden Severity-Farbe am oberen Rand der Kachel rendern.
4. **AC-4** — WHEN `value` nicht übergeben wird oder `null` ist, THEN SHALL das System „—" an Stelle der Zahl anzeigen.
5. **AC-5** — WHEN der Viewport weniger als 768 px breit ist, THEN SHALL das System das Grid auf 2 Spalten reduzieren, unabhängig von der konfigurierten Spaltenanzahl.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #kpi-tile #kennzahl #grid #dashboard #statistik
