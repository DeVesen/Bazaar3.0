---
id: F-BA-004
status: draft
updated: 2026-07-31
---

# Epic: Statistik

## Index
- Überblick — Live-Kennzahlen
- 1. KPI-Zeile 1 — Artikel-Übersicht
- 2. KPI-Zeile 2 — Rückblick
- 3. KPI-Zeile 3 — Finanz-KPIs
- 4. Metergroup — Segmentbalken
- 5. Verkäufer-Leaderboard — Rangliste
- 6. Abschnitts-Labels — Beschriftungen
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**App:** Bazaar Haupt-App
**Navigation:** System → Statistik

**Ziel:** Admin sieht eine aktuelle Übersicht der Basar-Kennzahlen ohne Caching.

**User Story:** Als Admin möchte ich bei jedem Seitenaufruf aktuelle Kennzahlen sehen, damit ich den Veranstaltungsfortschritt jederzeit beurteilen kann.

---

## Überblick

Die Statistik-Seite bietet eine aktuelle Übersicht des Basar-Stands (Berechnung bei jedem Seitenaufruf, kein Caching). Sie ist schreibgeschützt und rein informativ.

**Technisch:** Alle Berechnungen erfolgen **clientseitig** auf Basis des aktuellen Anwendungszustands. Kein separater Backend-Endpunkt. Die Seite wird bei jedem Aufruf neu berechnet (kein Caching).

---

## 1. KPI-Zeile 1 — ARTIKEL-ÜBERSICHT (6 Kacheln, Grid `c6`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c6`

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Gesamt | Anzahl aller erfassten Artikel |
| 2 | Angenommen | Alle je angenommenen Artikel — `releasedAt` gesetzt, unabhängig davon ob inzwischen verkauft oder zurückgegeben |
| 3 | Im Verkauf | Artikel im Verkauf: `releasedAt` gesetzt, `soldAt` und `returnedAt` leer |
| 4 | Verkauft | Artikel mit `soldAt` gesetzt |
| 5 | Retour | Zurückgegebene Artikel — `returnedAt` gesetzt |
| 6 | Verkaufsquote | Verkauft / Angenommen × 100 % |

---

## 2. KPI-Zeile 2 — RÜCKBLICK (3 Kacheln, Grid `c3`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c3`

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Warenwert Angenommen | Summe der Preise aller angenommenen Artikel (alle mit `releasedAt` gesetzt) |
| 2 | Warenwert Retour | Summe der Preise zurückgegebener Artikel (`returnedAt` gesetzt) |
| 3 | Offener Warenwert | Summe der Preise noch im Verkauf (`releasedAt` gesetzt, `soldAt` und `returnedAt` leer) |

---

## 3. KPI-Zeile 3 — FINANZ-KENNZAHLEN (5 Kacheln, Grid `c5`)

→ Komponente: [KPI-Tile](../../../../components/kpi-tile/component.md) im Grid `c5`

| # | Kennzahl | Beschreibung |
|---|---|---|
| 1 | Einnahmen Brutto | Summe der Verkaufspreise aller verkauften Artikel |
| 2 | Verdienst Provision | Anteil des Veranstalters aus dem Provisions-Satz des Verkäufer-Typs |
| 3 | Verdienst Gebühren | Pauschalgebühr pro verkauftem Artikel × Anzahl Verkäufe |
| 4 | Verdienst Gesamt | Provision + Gebühren |
| 5 | Auszahlung VK | Einnahmen Brutto − Verdienst Gesamt |

---

## 4. Metergroup (unter Zeile 3)

`p-metergroup` direkt unterhalb der Finanz-KPI-Zeile:
- Im Verkauf (primary) · Verkauft (success) · Retour (warn) von allen Angenommenen
- Label: Prozent-Wert + Bezeichnung je Segment

---

## 5. Verkäufer-Leaderboard

→ Komponente: [Table](../../../../components/table/component.md)

Standard-Card. Header-Zeile:
- Titel links (700, 14 px) + Dropdown rechts — `display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px`

**Dropdown-Filter:** Umschalten zwischen „Alle Verkäufer-Typen" und einzelnem Typ.

**Tabelle:** Sortiert nach Verkaufsanzahl (Standard).

| Spalte | Hinweis |
|---|---|
| Rang | Rang-Badge (Gold/Silber/Bronze/Grau), Breite 50 px |
| Verkäufer | Name |
| Typ | Nur bei „Alle Verkäufer-Typen" sichtbar; bei gefilterter Ansicht ausgeblendet |
| Angenommen | Anzahl angenommener Artikel |
| Verkauft | Anzahl verkaufter Artikel |
| Umsatz | Verkaufserlös |
| Auszahlung | Auszahlungsbetrag an Verkäufer |

**Alle Spalten sortierbar** (Multi-Sort per Shift+Klick).
**Maximale Höhe: 300 px** — bei mehr Einträgen vertikales Scrollen.

Tabellen-Wrapper: `max-height: 300px; overflow-y: auto`.

---

## 6. Abschnitts-Labels über KPI-Zeilen

| KPI-Zeile | Label |
|---|---|
| Zeile 1 | `ARTIKEL-ÜBERSICHT` |
| Zeile 2 | `RÜCKBLICK` |
| Zeile 3 | `FINANZ-KENNZAHLEN` |

Stil: 12 px, 700, uppercase, 0.8 px letter-spacing, `#4a6080`, mb 8 px, mt 6 px (bei Folgezeilen).

## Akzeptanzkriterien

1. **AC-1** — WHEN die Statistik-Seite aufgerufen wird, THEN SHALL das System alle KPI-Werte clientseitig aus dem aktuellen Anwendungszustand berechnen, ohne einen separaten Backend-Endpunkt aufzurufen.
2. **AC-2** — THE SYSTEM SHALL die Verkaufsquote als `(Anzahl verkauft + abgerechnet) / Anzahl angenommen × 100` berechnen und als Prozentwert anzeigen.
3. **AC-3** — WHEN kein Filter gesetzt ist, THEN SHALL das System das Leaderboard nach Verkaufsanzahl absteigend sortiert anzeigen und die Spalte „Typ" einblenden.
4. **AC-4** — WHEN ein Verkäufer-Typ im Dropdown-Filter ausgewählt wird, THEN SHALL das System das Leaderboard auf diesen Typ filtern und die Spalte „Typ" ausblenden.
5. **AC-5** — THE SYSTEM SHALL die Metergroup direkt unterhalb der Finanz-KPI-Zeile rendern mit den Segmenten Im Verkauf (primary), Verkauft (success) und Retour (warn), bezogen auf alle angenommenen Artikel.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #statistik #kpi #leaderboard #finanz #metergroup #verkaufsquote
