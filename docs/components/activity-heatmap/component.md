# Component: Activity-Heatmap

**Bibliothek:** Eigener Wrapper — CSS-Grid + `p-tooltip`
**Verwendung:** Voranmelde-App — Admin-Bereich, Home-Seite.

## Index

- Überblick — Konzept
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter
- 3. Grid-Aufbau — Zellenstruktur
- 4. Farb-Palette — Level & Farben
- 5. Visuelle Spezifikationen — Stil
- 6. Tooltip — Hover-Info
- 7. Responsive — Mobilanpassung
- 8. Verwendung in Features — Einsatzorte
- 9. PrimeNG-Basis — Technische Basis

---

## Überblick

Die Activity-Heatmap zeigt die Artikel-Aktivität der letzten **12 Wochen** als farbiges Zellen-Grid — analog zu GitHub's Contribution Graph. Jede Zelle steht für einen Tag; die Farbe codiert die Aktivitätsmenge.

Feature_Home_Admin beschreibt sie explizit als „identisch mit der Verkäufer-Ansicht" — beide Home-Views rendern dieselbe Komponente, parametriert mit unterschiedlichem Datensatz.

**Aktivität** = Anzahl der Ereignisse `erstelltAm` + `updatedAm` aller sichtbaren Artikel an einem Tag.

---

## 1. ASCII-Darstellung

```
  Aktivität — letzte 12 Wochen
                                         Weniger [░][▒][▓][█] Mehr
       Mai                Jun                Jul
  Mo  [░][░][█][░][░][░][░][░][▒][░][░][░]
  Mi  [░][▓][░][░][▒][░][░][░][█][░][░][░]
  Fr  [░][░][░][▓][░][░][░][░][░][▒][░][░]
      W17 W18 W19 W20 W21 W22 W23 W24 W25 W26 W27 W28

Hover auf eine Zelle → Tooltip:
  ┌────────────────────────────┐
  │  Mittwoch, 14.05.2026      │
  │  12 Aktivitäten            │
  └────────────────────────────┘

Leerzustand (keine Daten):
  Mo  [░][░][░][░][░][░][░][░][░][░][░][░]
  Mi  [░][░][░][░][░][░][░][░][░][░][░][░]
  Fr  [░][░][░][░][░][░][░][░][░][░][░][░]
  → alle Zellen in Farbe L0 (leer)
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `events` | `HeatmapEntry[]` | `@Input` | Aktivitäten pro Tag (Liste muss nicht lückenlos sein — fehlende Tage = 0) |

Keine `@Output`-Events — reine Anzeige.

### HeatmapEntry-Typ

```
{
  date:  string   // ISO-Datum 'YYYY-MM-DD'
  count: number   // Anzahl Aktivitäten an diesem Tag
}
```

---

## 3. Grid-Aufbau

- **Spalten:** 12 (eine pro Woche), neueste Woche rechts
- **Zeilen:** 7 (Mo–So) — jedoch nur Mo, Mi, Fr mit sichtbaren Labels links
- **Zellen gesamt:** 84

Das Grid startet immer am **Montag der ältesten Woche** (12 Wochen zurück ab heute) und endet am letzten abgeschlossenen Tag.

---

## 4. Farb-Palette

| Level | Bedingung | Farbe |
|---|---|---|
| L0 (leer) | `count === 0` | `#ebedf0` |
| L1 | `count >= 1` | `#9be9a8` |
| L2 | `count >= 5` | `#40c463` |
| L3 | `count >= 10` | `#30a14e` |
| L4 | `count >= 20` | `#216e39` |

Die Schwellenwerte für L1–L4 sind interne Konstanten; Anpassung über CSS-Variablen wenn nötig.

---

## 5. Visuelle Spezifikationen

| Element | Wert |
|---|---|
| Zellgröße | 12 × 12 px |
| Zellenabstand | 3 px (gap) |
| Zellenform | `border-radius: 2px` |
| Wochentag-Labels | Mo, Mi, Fr — links, 10 px, muted, linksbündig |
| Monats-Labels | Über Grid — erscheinen beim ersten Auftreten des Monats in der Wochenspalte |
| Monats-Label-Stil | 11 px, muted |
| Titel | „Aktivität — letzte 12 Wochen", 13 px, 700 |
| Legende-Position | Oben rechts neben Titel (flex space-between) |
| Legende-Text | „Weniger [L0][L1][L2][L3][L4] Mehr" |
| Legende-Zellgröße | 10 × 10 px (gleiche Form wie Grid-Zellen) |

---

## 6. Tooltip

`p-tooltip` auf jeder Zelle:

```
Wochentag, DD.MM.YYYY
X Aktivitäten          (Plural: „1 Aktivität" vs. „X Aktivitäten")
```

Bei `count === 0`: „Keine Aktivität"

---

## 7. Responsive

Die Heatmap scrollt horizontal bei schmalen Viewports (`overflow-x: auto` am Container).
Mindestbreite des Grids: `12 Wochen × (12px + 3px) = 180 px` — praktisch immer ausreichend.

---

## 8. Verwendung in Features

| Feature | App | Datensatz |
|---|---|---|
| Home — Verkäufer (Admin-Modus) | Voranmelde | Alle Artikel (erstelltAm + updatedAm) |
| Home — Admin | Voranmelde | Alle Artikel (erstelltAm + updatedAm) |

Nicht-Admin-Verkäufer sehen die Heatmap **nicht** — die Sichtbarkeit steuert das Parent.

---

## 9. PrimeNG-Basis

```
p-tooltip       ← Hover-Tooltip auf jeder Zelle
  [pTooltip]="'Datum\nX Aktivitäten'"
  tooltipPosition="top"
```

Grid-Aufbau, Farblogik und Label-Positionierung: reines CSS-Grid + TypeScript.
Keine weitere PrimeNG-Komponente involviert.
