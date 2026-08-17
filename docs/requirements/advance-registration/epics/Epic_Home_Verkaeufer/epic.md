---
id: F-AR-002
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-14
---

# Epic: Home — Verkäufer-Ansicht

## Index
- Überblick — Konzept
- 1. KPI-Kacheln — Kennzahlen
- 2. Aktivitäts-Heatmap — Verweis (Admin-only)
- 3. Info-Panel — Freitext
- 4. Backend & API — Endpoint
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Voranmelde-App
**Navigation:** Mein Bereich → Home

Component-Details → [`components/custom/home-dashboard.md`](../../components/custom/home-dashboard.md)
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
| **Countdown** | Sequence-Mode-Phasen `abgabeVon` → `abgabeBis` (Tage / HH:MM:SS, live) — zeigt automatisch Start oder Restzeit der Abgabe. Darunter: Datum der jeweiligen Phase. |
| **Meine Artikel** | Anzahl der bisher erfassten Artikel des eingeloggten Verkäufers. |
| **Meine Konditionen** | Provision (%) und Abgabegebühr pro Stück — read-only, abgeleitet vom zugewiesenen Verkäufer-Typ (kein eigenes Override-Feld in der Voranmelde-App, siehe `entities.md`). |
| **Abgabegebühr gesamt** | `Artikel-Anzahl × Abgabegebühr/Stück` — zu erwartende Gesamtgebühr. |

---

## 2. Aktivitäts-Heatmap

**Nur für Admins sichtbar** (Role-Toggle „Admin") — gehört inhaltlich zum Admin-Dashboard, nicht zur Verkäufer-Ansicht.
Vollständig spezifiziert → [Epic_Home_Admin](../Epic_Home_Admin/epic.md) Abschnitt 2.

---

## 3. Info-Panel

Unterhalb der Heatmap: freies **Informations-Panel** mit mehrzeiligem Text.

- Text wird vom **Admin** in den Einstellungen gepflegt (`infoText`-Parameter)
- **Markdown-Formatierung** unterstützt (Überschriften, Fettdruck, Listen, Trennlinien, Code)
- Zweck: Hinweise zu Abgaberegeln, Öffnungszeiten, organisatorischen Details
- Gleicher Text wie auf der Login-Seite (Info-Area)

---

## 4. Backend & API

API-Details → [`api/home.md`](../../api/home.md)

| Endpoint | Auth | Beschreibung |
|---|---|---|
| `GET /api/home/seller` | `authenticated` | Gibt `{ articleCount, typeConditions: { verkaufsprovisionAnteil, abgabegebuehr } }` zurück (Konditionen vom zugewiesenen Verkäufer-Typ, kein Override). **Weder Termine noch `infoText`** — beides kommt aus `GET /api/public/info`, das die Seite für den Countdown ohnehin ruft (DRY, siehe Epic_Countdown_Widget). |

---

## Akzeptanzkriterien

1. **AC-1** — WHEN ein Verkäufer sich anmeldet, THEN SHALL das System seine Home-Seite mit aktuellen Kennzahlen (Anzahl Artikel, eigene Konditionen, Abgabegebühr gesamt) laden und anzeigen.
2. **AC-2** — THE SYSTEM SHALL einen Countdown im Sequence-Mode über die Phasen Abgabe-Start und Abgabe-Ende anzeigen, sofern diese in den Einstellungen hinterlegt sind.
3. **AC-3** — WHEN der Verkäufer noch keine Artikel erfasst hat, THEN SHALL das System einen Hinweis „Noch keine Artikel erfasst" und einen Link zu „Meine Artikel" anzeigen.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #home #verkäufer #dashboard #registrierung #countdown
