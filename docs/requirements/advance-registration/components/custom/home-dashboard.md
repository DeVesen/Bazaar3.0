---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: home-dashboard

Reine Instanziierung bereits entschiedener Shared-Components — keine neuen PrimeNG-Entscheidungen nötig. Zwei rollenabhängige Belegungen derselben Grid-Struktur:

| Variante | Verwendung | Kacheln |
|---|---|---|
| Verkäufer | [Epic_Home_Verkaeufer](../../epics/Epic_Home_Verkaeufer/epic.md) | 4 (`columns="4"`) |
| Admin | [Epic_Home_Admin](../../epics/Epic_Home_Admin/epic.md) | 5 (`columns="5"`) + Activity-Heatmap |

## Kontext (volle Seite)

```
Verkäufer:
┌────────────┬────────────┬────────────┬────────────┐
│ Countdown  │ Meine      │ Meine      │ Abgabe-    │
│            │ Artikel    │ Konditionen│ gebühr ges.│
└────────────┴────────────┴────────────┴────────────┘

📄 Markdown-Info-Panel

Admin:
┌────────────┬────────────┬────────────┬────────────┬────────────┐
│ Countdown  │ Verkäufer  │ Artikel    │ Kategorien │ Marken     │
│            │            │ gesamt     │            │            │
└────────────┴────────────┴────────────┴────────────┴────────────┘

Aktivität — letzte 12 Wochen
[Heatmap-Grid, 7×12 Zellen]

📄 Markdown-Info-Panel
```

## Aufbau

| Element | Component | Verkäufer | Admin |
|---|---|---|---|
| Äußerer Grid-Wrapper | Shared `kpi-tile`-Grid | `columns="4"` (Klasse `c4`) | `columns="5"` (Klasse `c5`) |
| Kachel — Countdown | Shared `kpi-tile` + Shared `countdown` (`variant="kpi"`) | Phasen `abgabeVon` → `abgabeBis` | volle 5-Phasen-Sequence |
| Kachel — Meine Artikel | Shared `kpi-tile`, `value` = Artikel-Anzahl aus `GET /api/home/seller` | ✅ | — |
| Kachel — Meine Konditionen | Shared `kpi-tile`, `value`/`subLabel` = Provision/Gebühr (typ-abgeleitet, siehe `entities.md`) | ✅ | — |
| Kachel — Abgabegebühr gesamt | Shared `kpi-tile`, `value` = `Artikel-Anzahl × Gebühr` (Frontend-Berechnung) | ✅ | — |
| Kachel — Verkäufer | Shared `kpi-tile`, klickbar → `/verkaeufer` | — | ✅ |
| Kachel — Artikel gesamt | Shared `kpi-tile`, klickbar → `/alle-artikel` | — | ✅ |
| Kachel — Kategorien | Shared `kpi-tile`, klickbar → `/kategorien` | — | ✅ |
| Kachel — Marken | Shared `kpi-tile`, klickbar → `/marken` | — | ✅ |
| Activity-Heatmap | Shared `activity-heatmap`-Component, Datensatz = alle Artikel (nicht nur eigene) | — | ✅ |
| Markdown-Info-Panel | Shared-Component `markdown-text` (siehe [`docs/components/markdown-text/component.md`](../../../../components/markdown-text/component.md)) | ✅ | ✅ |

## Akzeptanzkriterien

Siehe [Epic_Home_Verkaeufer](../../epics/Epic_Home_Verkaeufer/epic.md) AC-1 bis AC-3 bzw. [Epic_Home_Admin](../../epics/Epic_Home_Admin/epic.md) AC-1 bis AC-3 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #home #dashboard #kpi-tile #activity-heatmap #markdown-text #instanziierung #shared-across-epics
