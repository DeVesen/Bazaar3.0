---
id: F-AR-003
status: draft
updated: 2026-07-31
---

# Feature: Home — Admin-Ansicht

## Index
- Überblick — Konzept
- 1. KPI-Kacheln — Kennzahlen
- 2. Aktivitäts-Heatmap — Aktivitätsverlauf
- 3. Info-Panel — Freitext
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Home
**Sichtbar für:** Admins (wenn Role-Toggle auf „Admin" steht)

**Ziel:** Admin sieht auf der Home-Seite eine Übersicht aller Registrierungen und Systemkennzahlen.

**User Story:** Als Admin möchte ich auf der Home-Seite die wichtigsten Kennzahlen der Voranmelde-Phase sehen, damit ich den Vorbereitungsstand des Basars beurteilen kann.

---

## Überblick

Das Admin-Dashboard zeigt einen schnellen Überblick über den aktuellen Stand der Voranmeldephase.

---

## 1. KPI-Kacheln (5 Stück, Grid `c5`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c5`
→ Countdown-Kachel: [Countdown](../../../../components/countdown/component.md) — `variant="kpi"`

| Kachel | Inhalt |
|---|---|
| **Countdown** | Countdown bis zum Basar (live, Tage + HH:MM:SS). Darunter: Datum des Basars. |
| **Verkäufer** | Anzahl registrierter Verkäufer |
| **Artikel gesamt** | Anzahl aller erfassten Artikel |
| **Kategorien** | Anzahl aktiver Kategorien |
| **Marken** | Anzahl aktiver Marken |

---

## 2. Aktivitäts-Heatmap

→ Komponente: [Activity-Heatmap](../../../../components/activity-heatmap/component.md)

Identisch mit der Verkäufer-Ansicht — nur für Admin sichtbar.
Details → [Feature_Home_Verkaeufer](../Feature_Home_Verkaeufer/feature.md) Abschnitt 2.

---

## 3. Info-Panel

Identisch mit der Verkäufer-Ansicht.
Details → [Feature_Home_Verkaeufer](../Feature_Home_Verkaeufer/feature.md) Abschnitt 3.

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Admin sich anmeldet, THEN SHALL das System die Admin-Home-Seite mit systemweiten Kennzahlen (Anzahl Verkäufer, Artikel, Nummernblöcke) laden und anzeigen.
2. **AC-2** — THE SYSTEM SHALL eine Aktivitäts-Heatmap der letzten 12 Wochen mit Registrierungsaktivität anzeigen.
3. **AC-3** — WHEN eine Kennzahl-Kachel für Verkäufer oder Artikel angeklickt wird, THEN SHALL das System zur entsprechenden Verwaltungsseite navigieren.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #home #admin #dashboard #kennzahlen #registrierung
