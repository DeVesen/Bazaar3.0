---
id: F-AR-003
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Epic: Home — Admin-Ansicht

## Index
- Überblick — Konzept
- 1. KPI-Kacheln — Kennzahlen
- 2. Aktivitäts-Heatmap — Aktivitätsverlauf
- 3. Info-Panel — Freitext
- 4. Backend & API — Endpoint
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Home

Component-Details → [`components/custom/home-dashboard.md`](../../components/custom/home-dashboard.md)
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
| **Countdown** | Sequence-Mode-Phasen `registrationDeadline` → `dropOffFrom` → `dropOffUntil` → `bazaarFrom` → `bazaarUntil` (live, Tage + HH:MM:SS) — zeigt automatisch die aktuell relevante Phase. Darunter: Datum der jeweiligen Phase. |
| **Verkäufer** | Anzahl registrierter Verkäufer |
| **Artikel gesamt** | Anzahl aller erfassten Artikel |
| **Kategorien** | Anzahl aktiver Kategorien |
| **Marken** | Anzahl aktiver Marken |

---

## 2. Aktivitäts-Heatmap

→ Komponente: [Activity-Heatmap](../../../../components/activity-heatmap/component.md)

**Nur für Admin sichtbar** (Role-Toggle „Admin"). Zeigt die Aktivität **aller Artikel** (nicht nur eigene). Ownership dieser Section liegt hier (Sichtbarkeits-Epic) — Epic_Home_Verkaeufer verweist nur zurück.

### Inhalt

- Zeigt die letzten **12 Wochen** als Grid (Spalte = Woche, Zeile = Wochentag, 7 × 12 Zellen)
- **Aktivität** = Anzahl der Ereignisse `createdAt` + `updatedAt` aller Artikel an diesem Tag
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

Identisch mit der Verkäufer-Ansicht.
Details → [Epic_Home_Verkaeufer](../Epic_Home_Verkaeufer/epic.md) Abschnitt 3.

---

## 4. Backend & API

API-Details → [`api/home.md`](../../api/home.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/home/admin` | `admin` | Gibt `{ sellerCount, articleCount, categoryCount, brandCount, heatmapData }` zurück — **weder Termine noch `infoText`**, beides kommt aus `GET /api/public/info` (DRY, siehe Epic_Countdown_Widget). `heatmapData` exakt im Component-Contract-Format: `{ date: string, count: number }[]` (siehe [Activity-Heatmap](../../../../components/activity-heatmap/component.md)), festes Fenster von 12 Wochen. |

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Admin sich anmeldet, THEN SHALL das System die Admin-Home-Seite mit systemweiten Kennzahlen (Anzahl Verkäufer, Artikel, Kategorien, Marken) laden und anzeigen.
2. **AC-2** — THE SYSTEM SHALL eine Aktivitäts-Heatmap der letzten 12 Wochen mit Artikel-Aktivität anzeigen.
3. **AC-3** — WHEN eine Kennzahl-Kachel (Verkäufer, Artikel, Kategorien oder Marken) angeklickt wird, THEN SHALL das System zur entsprechenden Verwaltungsseite navigieren. Die Countdown-Kachel ist nicht klickbar.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #home #admin #dashboard #kennzahlen #registrierung
