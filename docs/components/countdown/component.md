# Component: Countdown

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

## 6. Verwendung in Features

| Feature | App | Variante | Zieldatum |
|---|---|---|---|
| Home — Verkäufer (KPI-Kachel) | Voranmelde | `'kpi'` | `abgabeVon` (Abgabe-Starttermin) |
| Home — Admin (KPI-Kachel) | Voranmelde | `'kpi'` | `basarDatum` |
| Login (Info-Box) | Voranmelde | `'info-box'` | `basarDatum` |

---

## 7. PrimeNG-Basis

Keine PrimeNG-Komponente involviert — reines Template + Timer-Logik.
Typografie und Layout per CSS.
