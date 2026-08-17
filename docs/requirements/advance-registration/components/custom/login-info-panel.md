---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: login-info-panel

Neue, eigene Komponente. **Nicht** der Shared-`info-area`-Component (das ist der Feedback-Banner success/error/warn/info) — bewusst anderer Name wegen Kollision.

## Kontext

```
┌─────────────────────────┐
│  (dunkler Hintergrund)  │
│                         │
│  ⏱ Countdown            │  ← countdown (shared), variant="info-box"
│  💰 Default-Konditionen  │  ← eigenes <div>
│  📄 markdown-text        │  ← markdown-text (neu, shared innerhalb Voranmelde-App)
│                         │
└─────────────────────────┘
```

Sitzt in der linken Spalte von `login-layout`.

## Aufbau

| Box | Element |
|---|---|
| Countdown | Shared-Component `countdown`, `variant="info-box"`, Sequence-Mode über alle 5 Phasen (siehe Epic_Login Abschnitt 2) |
| Default-Konditionen | reines `<div>`, kein PrimeNG-Bezug — zeigt Provision/Gebühr des `defaultTypeId`-Typs |
| Markdown-Info | Shared-Component `markdown-text` (siehe [`docs/components/markdown-text/component.md`](../../../../components/markdown-text/component.md)), gefüttert mit `infoText` aus Epic_Einstellungen |

## Styling

Hintergrund `#1b3a4b`, Padding 60 px 48 px. Boxen: `background: rgba(255,255,255,0.06–0.08); border-radius: 10px; padding: 14–18px; margin-bottom: 20px`.

## Akzeptanzkriterien

Siehe Epic_Login Akzeptanzkriterien (Countdown/Default-Konditionen/Markdown-Text sind reine Anzeige, keine eigene Interaktion in diesem Panel).

## Tags & Piles

**Tags:** #login #info-panel #countdown #custom-component
