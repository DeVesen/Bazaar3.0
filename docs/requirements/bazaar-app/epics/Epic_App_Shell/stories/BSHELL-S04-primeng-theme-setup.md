---
id: BSHELL-S04
status: draft
depends-on: [BPROJ-S01]
---

# Story: PrimeNG Theme & Global Styles

## Ziel

PrimeNG 22.0.0 ist mit einem konsistenten Theme konfiguriert. Globale CSS Custom Properties stellen Farben, Borders und Abstände einheitlich bereit. Kein Verweis auf externe CDNs — alle Styles sind lokal im Bundle.

## Kontext

PrimeNG 22 nutzt das `@primeuix/styled`-System mit konfigurierbaren Tokens. Die Haupt-App verwendet Navy/Blau als Branding. CSS Custom Properties (`--border`, `--muted`, etc.) werden global gesetzt, damit alle Feature-Komponenten dieselben Basiswerte nutzen ohne Hardcodes.

## Scope

**In Scope:** PrimeNG-Theme-Konfiguration in `app.config.ts` (Preset, Farb-Tokens), `styles.scss` mit CSS Custom Properties, globale Reset-/Basis-Styles, `@media print`-Basisregel, Fonts ausschließlich per npm/Bundle.

**Out of Scope:** Feature-spezifische Styles, Komponenten-Styles.

## UI-Spezifikation

**CSS Custom Properties (global in `styles.scss`):**

| Variable | Wert | Verwendung |
|---|---|---|
| `--sidebar-bg` | `#1a2e4a` | Sidebar, Topbar |
| `--accent` | `#2e86c1` | Aktive Nav-Items, Primär-Buttons |
| `--content-bg` | `#f0f2f5` | Content-Bereich Hintergrund |
| `--title-color` | `#0f1f30` | Seitentitel |
| `--border` | `#dde6ee` | Card-Borders, Panel-Borders |
| `--muted` | `#6b7c93` | Sekundäre Texte, Labels |

**PrimeNG-Farb-Tokens** werden auf die Akzentfarbe `#2e86c1` gemappt (Primary-Palette).

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL PrimeNG 22.0.0 mit einem konfigurierten Preset in `providePrimeNG()` initialisieren, das die Primärfarbe auf `#2e86c1` setzt.
- [ ] **AC-2** — THE SYSTEM SHALL alle sechs CSS Custom Properties (`--sidebar-bg`, `--accent`, `--content-bg`, `--title-color`, `--border`, `--muted`) in `styles.scss` auf `:root` definieren.
- [ ] **AC-3** — WHEN `ng build --configuration production` ausgeführt wird, THEN SHALL der Build-Output keine Verweise auf `fonts.googleapis.com`, `cdn.jsdelivr.net` oder andere externe CDNs enthalten.
- [ ] **AC-4** — THE SYSTEM SHALL PrimeNG-Basis-Styles (`primeng/resources/primeng.min.css` oder äquivalent für v22) über `angular.json` einbinden, nicht per CDN-Link in `index.html`.
- [ ] **AC-5** — WHEN eine PrimeNG-Komponente (`p-button`, `p-table`) gerendert wird, THEN SHALL sie die konfigurierten Farb-Tokens korrekt anwenden (Primary-Button in `#2e86c1`).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S01 | PrimeNG muss bereits installiert sein |

## Tags & Piles

**Tags:** #primeng #theme #css-custom-properties #styles #offline
