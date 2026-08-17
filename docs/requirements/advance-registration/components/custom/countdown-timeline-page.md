---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: countdown-timeline-page

## Kontext

```
┌─────────────────────────────────────────┐
│  (kein Shell, transparenter Hintergrund) │
│                                           │
│  ● Voranmeldung endet     ✓ Abgeschlossen │
│  ● Abgabe beginnt         ⏱ 2T 04:12:33  │
│  ○ Abgabe endet           Bevorstehend    │
│  ○ Basar beginnt          Bevorstehend    │
│  ○ Basar endet            Bevorstehend    │
└─────────────────────────────────────────┘
```

Route `/embed/countdown`, öffentlich, kein AppShell (siehe Epic_App_Shell VSHELL-S03 AC-8).

## Aufbau

Die `variant="timeline"` der Shared `countdown`-Komponente (siehe `docs/components/countdown/component.md`) wird intern mit PrimeNG `p-timeline` umgesetzt:

| Slot | Inhalt |
|---|---|
| `[value]` | die 5 Phasen aus `GET /api/public/info` |
| `#opposite` | Phasen-Label (z. B. „Voranmeldung endet") |
| `#marker` | Status-Icon+Farbe: `✓` grün (abgeschlossen) · `⏱` Akzentfarbe (läuft) · `○` grau (bevorstehend) |
| `#content` | je nach Status: „Abgeschlossen" / Live-Countdown bis zur nächsten Phase / „Bevorstehend" |

Hintergrund transparent, kein eigener Card-Rahmen (passt sich fremdem Wordpress-Theme an, siehe Epic_Countdown_Widget Abschnitt 2/4).

## Akzeptanzkriterien

Siehe [Epic_Countdown_Widget](../../epics/Epic_Countdown_Widget/epic.md) — **alle** dortigen Akzeptanzkriterien; diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #countdown-widget #timeline #embed #primeng
