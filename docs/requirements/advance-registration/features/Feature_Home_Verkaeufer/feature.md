# Feature: Home — Verkäufer-Ansicht

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Home
**Sichtbar für:** Alle (Verkäufer + Admins im Verkäufer-Modus)

---

## Überblick

Die Home-Seite ist die **Einstiegsseite** nach dem Login. Sie zeigt dem Verkäufer auf einen Blick alle relevanten Informationen zum bevorstehenden Basar.

---

## 1. KPI-Kacheln (4 Stück, Grid `c4`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c4`
→ Countdown-Kachel: [Countdown](../../../../components/countdown/component.md) — `variant="kpi"`

| Kachel | Inhalt |
|---|---|
| **Countdown** | Countdown bis zum Abgabe-Starttermin (Tage / HH:MM:SS, live). Darunter: Datum des Basars. |
| **Meine Artikel** | Anzahl der bisher erfassten Artikel des eingeloggten Verkäufers. |
| **Meine Konditionen** | Provision (%) und Abgabegebühr pro Stück aus dem Verkäufer-Entity (eigene Felder). |
| **Abgabegebühr gesamt** | `Artikel-Anzahl × Abgabegebühr/Stück` — zu erwartende Gesamtgebühr. |

---

## 2. Aktivitäts-Heatmap

→ Komponente: [Activity-Heatmap](../../../../components/activity-heatmap/component.md)

**Sichtbarkeit: nur für Admins** (wenn Role-Toggle auf „Admin" steht). Verkäufer sehen die Heatmap nicht.

Admins sehen die Aktivität **aller Artikel** (nicht nur eigene).

### Inhalt

- Zeigt die letzten **12 Wochen** als Grid (Spalte = Woche, Zeile = Wochentag, 7 × 12 Zellen)
- **Aktivität** = Anzahl der Ereignisse `erstelltAm` + `updatedAm` aller Artikel an diesem Tag
- Hover-Tooltip: Datum + Anzahl Aktivitäten
- Monats-Labels oberhalb des Grids
- Wochentag-Labels (Mo/Mi/Fr) links
- Legende (Weniger → Mehr) oben rechts

### Visuelles Design

| Parameter | Wert |
|---|---|
| Zellgröße | 12 × 12 px |
| Zellenabstand | 3 px |
| Zellenform | abgerundete Ecken (2 px radius) |
| Farb-Palette | leer: `#ebedf0` · L1: `#9be9a8` · L2: `#40c463` · L3: `#30a14e` · L4: `#216e39` |
| Legende-Position | oben rechts neben Heatmap-Titel |
| Legende-Text | „Weniger [Farbscala] Mehr" |
| Wochentag-Labels | Mo, Mi, Fr (links, linksbündig) |
| Monats-Labels | über Grid, linksbündig pro erstem Auftreten |

---

## 3. Info-Panel

Unterhalb der Heatmap: freies **Informations-Panel** mit mehrzeiligem Text.

- Text wird vom **Admin** in den Einstellungen gepflegt (`infoText`-Parameter)
- **Markdown-Formatierung** unterstützt (Überschriften, Fettdruck, Listen, Trennlinien, Code)
- Zweck: Hinweise zu Abgaberegeln, Öffnungszeiten, organisatorischen Details
- Gleicher Text wie auf der Login-Seite (Info-Area)
