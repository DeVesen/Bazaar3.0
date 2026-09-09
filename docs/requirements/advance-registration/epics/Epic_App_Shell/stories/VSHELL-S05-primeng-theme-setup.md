---
id: VSHELL-S05
status: draft
depends-on: [VPROJ-S01]
---

# Story: PrimeNG Theme & Global Styles

## Ziel

PrimeNG 22.1.0 ist mit dem Industry-Theme der Voranmelde-App konfiguriert (`definePreset` auf
Aura-Basis). Globale CSS Custom Properties stellen Spacing, Shadow, Fonts und den Divider-Ton
einheitlich bereit — Farb-/Surface-Tokens laufen über PrimeNGs eigenes Preset-System, nicht über
eigene `--color-*`-Variablen. ngx-translate ist mit DE (Default) und EN initialisiert.

## Kontext

Die Voranmelde-App verwendet das Design System „Industry" (helle Stahlblau-Palette,
`design/industry-styleguide.md`) — anders als die frühere Teal/Grün-Fassung dieser Story. Die
Accent-Farbramp ersetzt PrimeNGs `primary`-Skala, die Neutral-Ramp ersetzt die `surface`-Skala.

## Scope

**In Scope:** PrimeNG-Theme-Konfiguration (Preset, Primärfarbe `#0e8a5f`), `styles.scss` mit CSS Custom Properties, ngx-translate mit DE/EN, globale Reset-/Basis-Styles. Kein CDN-Verweis erforderlich (Cloud, kein Offline-Zwang — aber npm bevorzugt).

**Out of Scope:** Epic-spezifische Styles, Übersetzungs-Keys für Epics.

## UI-Spezifikation

**CSS Custom Properties (global in `styles.scss`)** — nur die Werte ohne PrimeNG-Token-Äquivalent:

| Variable | Wert | Verwendung |
|---|---|---|
| `--space-1` … `--space-8` | 3.4px … 27.2px (Dichte 0.85) | Abstände |
| `--shadow-sm` / `-md` / `-lg` | siehe Styleguide §4 | Elevation |
| `--font-heading` | `'Barlow Condensed', sans-serif` | Überschriften |
| `--font-body` | `'Barlow', sans-serif` | Fließtext |
| `--color-divider` | `color-mix(in srgb, #1d1f20 16%, transparent)` | Trennlinien, Blueprint-Rahmen |

Farb- und Flächen-Tokens (Sidebar-/Content-Hintergrund, Akzentfarbe, Avatar) laufen über PrimeNGs
generierte Variablen (`--p-primary-*`, `--p-surface-*`) aus dem `definePreset`-Aufruf, nicht über
eigene `--color-*`-Namen.

**PrimeNG-Preset:** `definePreset(Aura, { semantic: { primary: {...Accent-Ramp...}, colorScheme:
{ light: { surface: {...Neutral-Ramp...} } } } })`.

**ngx-translate:**
- Default-Sprache: DE
- Fallback-Sprache: EN
- Übersetzungs-Dateien: `public/i18n/de.json`, `public/i18n/en.json`

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL PrimeNG 22.1.0 mit einem via `definePreset(Aura, …)` konfigurierten
      Preset in `providePrimeNG()` initialisieren, das die Accent-Ramp auf `primary` und die
      Neutral-Ramp auf `surface` (Light-Colorscheme) mapped.
- [ ] **AC-2** — THE SYSTEM SHALL die fünf token-losen CSS Custom Properties (`--space-1`…`--space-8`,
      `--shadow-sm/-md/-lg`, `--font-heading`, `--font-body`, `--color-divider`) in `styles.scss`
      auf `:root` definieren.
- [ ] **AC-3** — THE SYSTEM SHALL `provideTranslateService` in `app.config.ts` initialisieren: DE als
      Standardsprache, EN als Fallback, Loader auf `public/i18n/`.
- [ ] **AC-4** — WHEN eine Komponente `translate.instant('key')` aufruft und der Key in `de.json`
      vorhanden ist, THEN SHALL der deutsche Text zurückgegeben werden.
- [ ] **AC-5** — WHEN eine Komponente `translate.instant('key')` aufruft und der Key nicht in
      `de.json`, aber in `en.json` vorhanden ist, THEN SHALL der englische Text zurückgegeben werden.
- [ ] **AC-6** — WHEN eine PrimeNG-Komponente (`p-button`, `p-table`) gerendert wird, THEN SHALL sie
      die Accent-Ramp über die `primary`-Tokens anwenden (Primary-Button in `--color-accent`,
      `#5980a6`).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S01 | PrimeNG und ngx-translate müssen bereits installiert sein |

## Tags & Piles

**Tags:** #primeng #theme #css-custom-properties #styles #ngx-translate #i18n
