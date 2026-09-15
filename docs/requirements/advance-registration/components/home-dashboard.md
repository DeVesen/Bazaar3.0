---
status: draft
reviewed-date: 2026-08-14
updated: 2026-08-17
---

# Component: home-dashboard

Reine Instanziierung bereits entschiedener Shared-Components — keine neuen PrimeNG-Entscheidungen nötig. Zwei rollenabhängige Belegungen derselben Grid-Struktur:

| Variante | Verwendung | Kacheln |
|---|---|---|
| Verkäufer | [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md) | 4 (`columns="4"`) |
| Admin | [Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md) | 5 — **kein** einzelnes Shared-Grid mehr: große Countdown-Kachel + eigenes 2×2-CSS-Grid (siehe unten) + Activity-Heatmap |

## Kontext (volle Seite)

```
Verkäufer:
┌────────────┬────────────┬────────────┬────────────┐
│ Countdown  │ Meine      │ Meine      │ Abgabe-    │
│            │ Artikel    │ Konditionen│ gebühr ges.│
└────────────┴────────────┴────────────┴────────────┘

🔢 Verkäufernummer-Karte (Nummer + QR-Code)

📄 Markdown-Info-Panel

Admin (≥ 768 px):
┌────────────────────┬────────────┬────────────┐
│                    │ Verkäufer  │ Artikel    │
│  Countdown (2 Zln) │            │ gesamt     │
│                    ├────────────┼────────────┤
│                    │ Kategorien │ Marken     │
└────────────────────┴────────────┴────────────┘

Admin (< 768 px, gestapelt):
┌─────────────────────┐
│ Countdown            │
├────────────┬─────────┤
│ Verkäufer  │ Artikel │
├────────────┼─────────┤
│ Kategorien │ Marken  │
└────────────┴─────────┘

Aktivität — letzte 12 Wochen
[Heatmap-Grid, 7×12 Zellen]

📄 Markdown-Info-Panel
```

## Aufbau

| Element | Component | Verkäufer | Admin |
|---|---|---|---|
| Äußerer Grid-Wrapper | Verkäufer: Shared `kpi-tile`-Grid — Admin: eigenes CSS-Grid (`.admin-dashboard` in `HomePage.scss`), **nicht** die Shared-`kpi-tile`-Grid-Component | `columns="4"` (Klasse `c4`) | `.admin-dashboard`: Countdown-Kachel `grid-row: 1 / span 2` neben `.admin-dashboard__kpis` (eigenes 2-Spalten-CSS-Grid für die 4 übrigen Kacheln); < 768 px gestapelt — Details → [Epic_Home_Admin Abschnitt 1](../epics/Epic_Home_Admin/epic.md) |
| Kachel — Countdown | Shared `kpi-tile` + Shared `countdown` (`variant="kpi"`) | Phasen `dropOffFrom` → `dropOffUntil` | volle 5-Phasen-Sequence; Kachel füllt die volle Höhe der 2-Zeilen-Spanne (`::ng-deep .kpi-tile { height:100% }` in `HomePage.scss`) |
| Kachel — Meine Artikel | Shared `kpi-tile`, `value` = Artikel-Anzahl aus `GET /api/home/seller` | ✅ | — |
| Kachel — Meine Konditionen | Shared `kpi-tile`, `value`/`subLabel` = Provision/Gebühr (typ-abgeleitet, siehe `entities/verkaeufer-typ.md`) | ✅ | — |
| Kachel — Abgabegebühr gesamt | Shared `kpi-tile`, `value` = `Artikel-Anzahl × Gebühr` (Frontend-Berechnung) | ✅ | — |
| Kachel — Verkäufer | Shared `kpi-tile`, klickbar → `/verkaeufer` | — | ✅ |
| Kachel — Artikel gesamt | Shared `kpi-tile`, klickbar → `/all-articles` | — | ✅ |
| Kachel — Kategorien | Shared `kpi-tile`, klickbar → `/kategorien` | — | ✅ |
| Kachel — Marken | Shared `kpi-tile`, klickbar → `/marken` | — | ✅ |
| Activity-Heatmap | Shared `activity-heatmap`-Component, Datensatz = alle Artikel (nicht nur eigene) | — | ✅ |
| Verkäufernummer-Karte | [verkaeufer-nummer](verkaeufer-nummer.md), Variante `card`, unterhalb des Kachel-Grids; `sellerId` aus dem `sub`-Claim | ✅ | — (nur Verkäufer-Modus, siehe Epic_Home_Verkaeufer Abschnitt 2) |
| Markdown-Info-Panel | Custom-Component [`markdown-text`](markdown-text.md), `content` = `infoText` aus `GET /api/public/info`; unterstützter Umfang und Fallback → dort Abschnitt 3.1/3.2 | ✅ | ✅ |

**Fehlender `infoText`:** Ist `infoText` `null`, leer oder nur Whitespace, blendet
`home-dashboard` das Markdown-Info-Panel aus. Das Ausblenden entscheidet dieses Dashboard,
nicht `markdown-text` — die Leaf-Komponente rendert bei leerem `content` lediglich nichts
(markdown-text Abschnitt 3.3). Gilt in beiden Varianten identisch.

## Akzeptanzkriterien

Siehe [Epic_Home_Verkaeufer](../epics/Epic_Home_Verkaeufer/epic.md) bzw. [Epic_Home_Admin](../epics/Epic_Home_Admin/epic.md) — jeweils **alle** dortigen Akzeptanzkriterien; diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC. Bewusst ohne AC-Nummern: beide Epics werden weiter ergänzt, eine Nummernspanne hier wäre sofort veraltet.

## Tags & Piles

**Tags:** #home #dashboard #kpi-tile #activity-heatmap #markdown-text #instanziierung #shared-across-epics
