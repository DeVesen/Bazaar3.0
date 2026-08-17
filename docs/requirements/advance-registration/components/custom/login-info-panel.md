---
status: reviewed
reviewed-date: 2026-08-14
updated: 2026-08-17
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
│  📄 markdown-text        │  ← markdown-text (app-lokale Custom-Component)
│                         │
└─────────────────────────┘
```

Sitzt in der linken Spalte von `login-layout`.

## Aufbau

| Box | Element |
|---|---|
| Countdown | Shared-Component `countdown`, `variant="info-box"`, Sequence-Mode über alle 5 Phasen (siehe Epic_Login Abschnitt 2) |
| Default-Konditionen | reines `<div>`, kein PrimeNG-Bezug — zeigt Provision/Gebühr des `defaultTypeId`-Typs |
| Markdown-Info | Custom-Component [`markdown-text`](markdown-text.md), gefüttert mit `infoText` aus Epic_Einstellungen — unterstützter Markdown-Umfang und Fallback für nicht unterstützte Syntax dort in Abschnitt 3.1/3.2 |

## Fehlende Werte

Alle drei Boxen hängen an `GET /api/public/info`, dessen Felder einzeln `null` sein können
([`api/public.md`](../../api/public.md), Abschnitt „Nicht konfigurierte Werte").

| Fehlt | Verhalten |
|---|---|
| Alle 5 Termine `null` | Countdown-Box ausblenden (einzelne Phasen → Countdown-Component, Sequence-Mode) |
| `defaultConditions` `null` | Konditionen-Box ausblenden |
| `infoText` `null`/leer/nur Whitespace | Markdown-Box ausblenden |

Das Ausblenden entscheidet **dieses Panel**, nicht die Kind-Komponenten — `markdown-text`
rendert bei leerem `content` lediglich nichts (markdown-text Abschnitt 3.3). Sind alle drei
Boxen leer, bleibt die linke Spalte als leere dunkle Fläche stehen; die Login-Form rechts
ist davon unberührt (Epic_Login AC-13).

## Styling

Hintergrund `#1b3a4b`, Padding 60 px 48 px. Boxen: `background: rgba(255,255,255,0.06–0.08); border-radius: 10px; padding: 14–18px; margin-bottom: 20px`.

## Akzeptanzkriterien

Siehe Epic_Login Akzeptanzkriterien (Countdown/Default-Konditionen/Markdown-Text sind reine Anzeige, keine eigene Interaktion in diesem Panel).

## Tags & Piles

**Tags:** #login #info-panel #countdown #custom-component
