---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: login-layout

Neue, eigene Komponente — 2-Spalten-Container für die Login-Seite (und strukturell für die Registrierungsseite wiederverwendbar).

## Kontext

```
┌─────────────────────────┬─────────────────────────┐
│   login-info-panel       │   login-form            │
│   (50 %)                 │   (50 %)                │
└─────────────────────────┴─────────────────────────┘
```

Reines Layout-Grid, keine eigene Fachlogik — projiziert die zwei Kind-Komponenten per `ng-content` oder Named-Slots.

## Aufbau

| Element | Umsetzung |
|---|---|
| Container | CSS-Grid, `grid-template-columns: 1fr 1fr`, volle Viewport-Höhe |
| Mobile (≤ 768 px) | linke Spalte (`login-info-panel`) ausgeblendet, rechte Spalte volle Breite |

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL auf Desktop beide Spalten je 50 % Breite rendern.
2. **AC-2** — WHILE der Viewport ≤ 768 px ist, SHALL das System nur die rechte Spalte (Login-Form) in voller Breite anzeigen.

## Tags & Piles

**Tags:** #login #layout #custom-component
