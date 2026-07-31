---
id: F-AR-002
status: draft
updated: 2026-07-31
---

# Epic: Home — Verkäufer-Ansicht

## Index
- Überblick — Konzept
- 1. KPI-Kacheln — Kennzahlen
- 2. Aktivitäts-Heatmap — Aktivitätsverlauf
- 3. Info-Panel — Freitext
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Home
**Sichtbar für:** Alle (Verkäufer + Admins im Verkäufer-Modus)

**Ziel:** Verkäufer sieht auf der Home-Seite eine Übersicht seines Registrierungsstatus.

**User Story:** Als Verkäufer möchte ich auf meiner Home-Seite den Status meiner Registrierung und meiner Artikel sehen, damit ich weiß, ob ich für den Basar vorbereitet bin.

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

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Verkäufer sich anmeldet, THEN SHALL das System seine Home-Seite mit aktuellen Kennzahlen (Anzahl Artikel, Registrierungsstatus) laden und anzeigen.
2. **AC-2** — THE SYSTEM SHALL einen Countdown bis zum Basar-Datum anzeigen, sofern dieses in den Einstellungen hinterlegt ist.
3. **AC-3** — WHEN der Verkäufer noch keine Artikel erfasst hat, THEN SHALL das System einen Hinweis „Noch keine Artikel erfasst" und einen Link zu „Meine Artikel" anzeigen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #home #verkäufer #dashboard #registrierung #countdown
