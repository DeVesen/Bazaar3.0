---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: sidebar-title

Neue, eigene Komponente — nicht Teil des PrimeNG-Katalogs. Zeigt Logo-Icon + Markenname im Sidebar-Header.

## Kontext (wo eingebettet)

```
┌──────────────────────────┐
│  🛒 Basar Voranmelde     │  ← <sidebar-title> — diese Komponente
├──────────────────────────┤
│  MEIN BEREICH            │
│  ○ Home                  │
│  ...                     │
```

Sitzt im `p-sidebar-header`-Slot des Sidebar-Compounds (siehe [sidebar.md](sidebar.md)). Kein Collapse-Toggle daneben — der lebt separat im Content-Header (VSHELL-S02).

## ASCII-Darstellung (Komponente isoliert)

```
┌──────────────────────────┐
│  🛒 Basar Voranmelde     │
└──────────────────────────┘
   ↑         ↑
  Icon    Text (zwei Farb-Spans)
```

## Aufbau

| Element | Umsetzung |
|---|---|
| Icon | klassische PrimeIcon-CSS-Klasse (`<i class="pi pi-shopping-cart">` bzw. passendes Icon), 18–20 px |
| Text | ein `<span>` mit zwei Farb-Teilspannen: „Basar" (weiß) + „Voranmelde" (`#0e8a5f`, `font-weight: 700`) |
| Container | einfacher `flex`-Container, `align-items: center`, `gap: 8px` |

## Input / Output Schnittstelle

Keine Inputs/Outputs nötig — reiner statischer Marken-Baustein, keine Parametrisierung erforderlich (Name/Farben sind fix für die Voranmelde-App).

## Akzeptanzkriterien

1. **AC-1** — THE SYSTEM SHALL das Icon (PrimeIcon-Klasse) links vom Text rendern.
2. **AC-2** — THE SYSTEM SHALL „Basar" in weiß und „Voranmelde" in `#0e8a5f`, `font-weight: 700` im selben Textfluss rendern.
3. **AC-3** — WHILE die Sidebar eingeklappt ist (60 px), SHALL das System nur das Icon rendern, der Text-Teil ist ausgeblendet.

## Tags & Piles

**Tags:** #sidebar #logo #app-shell #custom-component
