# Round 8 — PrimeNG-Theme & globale Styles

## Liefert

Das ausgeprägte visuelle Erscheinungsbild der App (Design System „Industry“) — Farben,
Typografie, globale CSS Custom Properties.

## Umfang

- PrimeNG-22-Theme-Konfiguration nach Styleguide.
- CSS-Tokens: `--color-surface` (Sidebar/Titelleiste `#e9e9ea`), `--color-bg`
  (Content-Hintergrund `#f2f2f3`), `--color-text` (`#1d1f20`), Akzentfarbe Steel Blue
  `#5980a6`.
- Typografie: Barlow (Fließtext), Barlow Condensed 600 (Sidebar-Logo „Bazaar Suite“ mit
  „Suite“ in Akzentfarbe, Topbar-Text „Bazaar Haupt-App“).
- Alle Farben ausschließlich über die CSS-Tokens referenziert — Hex-Werte nur an dieser
  einen Stelle definiert.
- Modal-Grundverhalten laut Breakpoint-Tabelle (Desktop 80 %/90 vh, Mobile 100 %/100 vh
  ohne Radius) als globale Komponenten-Voreinstellung.

## Nicht enthalten

- Fachliche Komponenten selbst — nur deren Theme-Grundlage.
- Die in §11 Punkt 11 als offen markierte Konfliktliste
  (Industry-Styleguide vs. PrimeNG-Grundregel) — falls zum Zeitpunkt der Umsetzung noch
  offen, wird dieses Häppchen um eine Klärung ergänzt, bevor es beginnt.

## Referenzen

- [Epic_App_Shell](../../requirements/bazaar-app/epics/Epic_App_Shell/epic.md) (Story BSHELL-S04)
- [design/industry-styleguide.md](../../requirements/bazaar-app/design/industry-styleguide.md)
- [spec.md §10.1](../../requirements/bazaar-app/spec.md) (Visuelles Branding & Farben)

## Voraussetzung

Setzt voraus, dass das responsive Layout und Routing-Skeleton bereits existieren.
