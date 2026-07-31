---
id: C-009
status: draft
updated: 2026-07-31
---

# Component: Countdown

## Index

- Überblick — Konzept & Varianten
- 1. ASCII-Darstellung — Layoutskizze
- 2. Input / Output Schnittstelle — Parameter
- 3. Berechnungslogik — Zeitberechnung
- 4. Darstellung der Zeiteinheiten — Format
- 5. Stil-Details — Varianten-Design
- 6. Verwendung in Epics — Einsatzorte
- 7. PrimeNG-Basis — Technische Basis
- Akzeptanzkriterien — EARS-Kriterien
- Tags & Piles — Ablage

**Bibliothek:** Eigener Wrapper — kein PrimeNG-Äquivalent (Timer-Logik)
**Verwendung:** Voranmelde-App — überall dort, wo ein live laufender Countdown bis zu einem Zieldatum angezeigt wird.

---

## Überblick

Der Countdown zeigt die verbleibende Zeit bis zu einem konfigurierbaren Zieldatum als **Tage + HH:MM:SS** an und aktualisiert sich jede Sekunde. Beim Erreichen des Zieldatums zeigt er `0 Tage 00:00:00`.

Zwei visuelle Varianten für unterschiedliche Verwendungsstellen:

| Variante | Verwendung |
|---|---|
| `'kpi'` | Eingebettet in eine KPI-Tile (Home-Seite) |
| `'info-box'` | Eigenständige Info-Box auf dunklem Hintergrund (Login-Seite) |

---

## 1. ASCII-Darstellung

```
Variante 'kpi' — innerhalb einer KPI-Tile:
┌──────────────────────────────┐
│ BIS ZUM BASAR                │  ← label
│                              │
│   3 Tage                     │  ← Tage (groß)
│  14:32:07                    │  ← HH:MM:SS (groß, Monospace)
│                              │
│  Samstag, 05.09.2026         │  ← dateLabel (klein, muted)
└──────────────────────────────┘

Variante 'info-box' — auf dunklem Login-Hintergrund:
┌─────────────────────────────────────────┐  ← rgba-Hintergrund
│                                         │
│  BIS ZUM BASAR                          │  ← label (11 px, uppercase)
│                                         │
│  3 TAGE   14:32:07                      │  ← Tage + Zeit nebeneinander (32 px, 800)
│                                         │
│  Samstag, 05.09.2026                    │  ← dateLabel (13 px)
│                                         │
└─────────────────────────────────────────┘

Abgelaufen (targetDate in der Vergangenheit):
┌──────────────────────────────┐
│ BIS ZUM BASAR                │
│                              │
│   0 Tage                     │
│  00:00:00                    │
│                              │
│  Samstag, 05.09.2026         │
└──────────────────────────────┘
```

---

## 2. Input / Output Schnittstelle

| Parameter | Typ | Richtung | Beschreibung |
|---|---|---|---|
| `targetDate` | `Date` | `@Input` | Zieldatum und -uhrzeit für den Countdown |
| `label` | `string` | `@Input` | Beschriftung über dem Countdown (z. B. „BIS ZUM BASAR") |
| `variant` | `'kpi' \| 'info-box'` | `@Input` | Visuelle Darstellungsvariante (Default: `'kpi'`) |

Keine `@Output`-Events — die Komponente ist reine Anzeige.

---

## 3. Berechnungslogik

```
remainingMs  = targetDate.getTime() - Date.now()
totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))

days    = Math.floor(totalSeconds / 86400)
hours   = Math.floor((totalSeconds % 86400) / 3600)
minutes = Math.floor((totalSeconds % 3600) / 60)
seconds = totalSeconds % 60
```

Der Timer läuft via `setInterval(fn, 1000)`. Die Komponente **räumt den Interval in `ngOnDestroy` auf** (`clearInterval`).

---

## 4. Darstellung der Zeiteinheiten

| Wert | Darstellung |
|---|---|
| Tage | Zahl ohne führende Null (z. B. `3 Tage`, `1 Tag`, `0 Tage`) |
| HH | 2-stellig mit führender Null (`02`, `14`) |
| MM | 2-stellig mit führender Null |
| SS | 2-stellig mit führender Null |
| Datum (`targetDate`) | Lokales Format: `EEEE, dd.MM.yyyy` (z. B. „Samstag, 05.09.2026") |

Singular/Plural: `1 Tag` vs. `X Tage`.

---

## 5. Stil-Details

### Variante `'kpi'`

| Element | Stil |
|---|---|
| Label | 11 px, `font-weight: 600`, uppercase, muted |
| Tage | 24 px, `font-weight: 800` |
| HH:MM:SS | 22 px, `font-weight: 800`, `font-variant-numeric: tabular-nums` (kein Layout-Sprung) |
| Datum | 12 px, muted, margin-top 4 px |

### Variante `'info-box'`

| Element | Stil |
|---|---|
| Container | `background: rgba(255,255,255,0.07); border-radius: 10px; padding: 16px 18px` |
| Label | 11 px, uppercase, `color: rgba(255,255,255,0.6)`, letter-spacing 0.5 px |
| Tage + Zeit | 32 px, `font-weight: 800`, `color: white`, nebeneinander mit Gap 12 px |
| Datum | 13 px, `color: rgba(255,255,255,0.7)`, margin-top 4 px |

---

## 6. Verwendung in Epics

| Epic | App | Variante | Zieldatum |
|---|---|---|---|
| Home — Verkäufer (KPI-Kachel) | Voranmelde | `'kpi'` | `abgabeVon` (Abgabe-Starttermin) |
| Home — Admin (KPI-Kachel) | Voranmelde | `'kpi'` | `basarDatum` |
| Login (Info-Box) | Voranmelde | `'info-box'` | `basarDatum` |

---

## 7. PrimeNG-Basis

Keine PrimeNG-Komponente involviert — reines Template + Timer-Logik.
Typografie und Layout per CSS.

---

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL den Countdown jede Sekunde aktualisieren und Tage, Stunden, Minuten und Sekunden im Format `D Tage HH:MM:SS` anzeigen, wobei HH, MM, SS stets zweistellig mit führender Null dargestellt werden.
2. **AC-2** — WHEN `targetDate` in der Vergangenheit liegt, THEN SHALL das System `0 Tage 00:00:00` anzeigen und nicht in negative Werte wechseln.
3. **AC-3** — WHEN die Komponente aus dem DOM entfernt wird, THEN SHALL das System den `setInterval`-Timer via `clearInterval` in `ngOnDestroy` aufräumen.
4. **AC-4** — WHERE die Variante `'kpi'` konfiguriert ist, SHALL das System den Countdown als KPI-Kachel mit Tagen und Zeit untereinander rendern.
5. **AC-5** — WHERE die Variante `'info-box'` konfiguriert ist, SHALL das System den Countdown als Info-Box mit rgba-Hintergrund und Tagen + Zeit nebeneinander rendern.
6. **AC-6** — THE SYSTEM SHALL Singular und Plural korrekt unterscheiden: `1 Tag` vs. `X Tage`.

## Tags & Piles

**Piles:** #pile/shared-components
**Tags:** #countdown #live #timer #zieldatum #varianten #voranmeldung
