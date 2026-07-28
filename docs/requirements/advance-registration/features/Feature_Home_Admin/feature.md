# Feature: Home — Admin-Ansicht

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Home
**Sichtbar für:** Admins (wenn Role-Toggle auf „Admin" steht)

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
