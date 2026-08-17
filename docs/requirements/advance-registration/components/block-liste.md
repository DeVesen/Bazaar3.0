---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: block-liste (Verkäufer, read-only)

Reine Anzeige, kein PrimeNG-Bezug — passt zur bereits im Epic dokumentierten Stil-Vorgabe (`display: flex; background: #f5f9f6; border: 1px solid #d4e8dc`).

## Kontext

```
┌─────────────────────────────────────┐
│  101 – 110         10 Nummern · 3 vergeben │  ← <div>, pro Block
│  111 – 120         10 Nummern · 0 vergeben │
└─────────────────────────────────────┘

Kein Block zugewiesen:
┌─────────────────────────────────────┐
│  Noch keine Nummernblöcke zugewiesen │  ← Empty-State-Text
└─────────────────────────────────────┘
```

## Aufbau

| Element | Umsetzung |
|---|---|
| Block-Item | reines `<div>`, `display: flex; justify-content: space-between; align-items: center` |
| Bereich-Text | `<span>`, 700, 14 px, `--primary` (grün) |
| Zähler-Text | `<span>`, 12 px, muted |
| Empty-State | `<p>`, zentriert |

## Akzeptanzkriterien

Siehe Epic_Nummernbloecke AC-1 bis AC-4 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #nummernbloecke #readonly #custom-component
