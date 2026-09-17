---
round: Round-8
status: geplant
---

# Plan: Round 8 — PrimeNG-Theme & globale Styles

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-1/plan.md](../Round-1/plan.md): PrimeNG 22 + `@primeuix/themes` bereits
  installiert, `providePrimeNG({ options: { darkModeSelector: false } })` in
  `app.config.ts` **ohne** `theme.preset` — Round-8 ergänzt genau dieses `theme.preset`.
  `@fontsource/barlow`/`@fontsource/barlow-condensed` bereits in `styles.scss`
  importiert (Round-1 Schritt 5).
- [Round-6/plan.md](../Round-6/plan.md): Sidebar referenziert bereits
  `var(--color-surface)`, `var(--color-accent)`, `var(--color-divider)` per Namen, ohne
  Werte — Round-8 liefert genau diese Werte nach.
- [Round-7/plan.md](../Round-7/plan.md): Shell-Layout (`content-body`-Padding) und
  Print-Regel bereits vorhanden (`shell.scss`) — Round-8 ergänzt keine neuen
  Layout-Regeln, nur Farb-/Typo-Tokens.

## Implementationsplan

### 1. PrimeNG-Preset (AC-1, AC-5)

**Referenz-App hat exakt dieses Preset bereits, 1:1 übernehmbar:**
[`core/theme/industry-preset.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/theme/industry-preset.ts)
setzt `semantic.primary` auf die komplette **Accent-Ramp** aus dem Styleguide (§2) und
`semantic.colorScheme.light.surface` auf die **Neutral-Ramp** — beides sind
suite-weite, App-unabhängige Werte aus demselben `industry-styleguide.md`, den auch
Round-8 zugrunde legt. Kein Voranmelde-App-spezifischer Wert darin (Farben kommen
direkt aus dem gebundenen Design System, nicht aus VPROJ-Branding) — Datei unverändert
nach `bazaar-app/frontend/src/app/core/theme/industry-preset.ts` kopieren:

```typescript
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const IndustryPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eef6ff', 100: '#eef6ff', 200: '#d6ebff', 300: '#b5d9fd', 400: '#94bce3',
      500: '#749dc4', 600: '#597ea3', 700: '#416180', 800: '#2c455d', 900: '#1d2d3d', 950: '#1d2d3d',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff', 50: '#f5f5f8', 100: '#f5f5f8', 200: '#e7e7ea', 300: '#d4d4d7',
          400: '#b7b7ba', 500: '#98989b', 600: '#7a7a7d', 700: '#5d5d60', 800: '#424244', 900: '#2b2b2d', 950: '#2b2b2d',
        },
      },
    },
  },
});
```

`app.config.ts`, `providePrimeNG` um `theme.preset` erweitern (Round-1s
`darkModeSelector: false` bleibt erhalten):

```typescript
import { IndustryPreset } from './core/theme/industry-preset';

providePrimeNG({
  theme: { preset: IndustryPreset, options: { darkModeSelector: false } },
});
```

**Abgleich mit AC-1** („Primärfarbe auf `#2e86c1` setzen" — der alte Navy/Blau-Wert):
Wie im Vorab-Klärungsabschnitt entschieden, gilt statt `#2e86c1` die Industry-Akzentfarbe.
`primary.600` (`#597ea3`) liegt am nächsten an `--color-accent` (`#5980a6`) und ist der
Wert, den PrimeNG standardmäßig für gefüllte Primary-Buttons zieht (Aura-Preset-Konvention:
Button-Hintergrund = `primary.600` im Light-Mode) — Nachweis in Schritt 7.

### 2. Globale CSS Custom Properties (AC-2)

`src/styles.scss`, `:root`-Block ergänzen:

```scss
:root {
  --color-bg: #f2f2f3;
  --color-surface: #e9e9ea;
  --color-text: #1d1f20;
  --color-accent: #5980a6;
  --color-accent-2: #728fab;
  --color-divider: color-mix(in srgb, #1d1f20 16%, transparent);
}
```

Genau diese sechs Properties, keine zusätzlichen (BSHELL-S04 AC-2 verlangt exakt sechs —
Interpretation: sechs Tokens, nicht zwingend dieselben Namen wie in der Story
wörtlich, s. Abweichungsvermerk oben).

### 3. Typografie (Styleguide §3, §7)

`src/styles.scss`:

```scss
:root {
  --font-heading: 'Barlow Condensed', sans-serif;
  --font-body: 'Barlow', sans-serif;
}
body { font-family: var(--font-body); color: var(--color-text); background: var(--color-bg); }
h1, h2, h3, .sidebar-logo { font-family: var(--font-heading); font-weight: 600; }
```

Kein Google-Fonts-Import (Styleguide §7 ausdrücklich: „wird **nicht** verwendet") — die
`@fontsource`-Imports aus Round-1 decken Barlow 400/500/700 und Barlow Condensed 400/600
bereits ab (AC-3: kein CDN-Verweis).

### 4. Sidebar-Logo-Akzent nachziehen (Round-6-Anschluss)

Round-6/plan.md Schritt 4 nutzt bereits `<span class="accent">Suite</span>` — hier in
`styles.scss` oder `sidebar.scss` global ergänzen:

```scss
.accent { color: var(--color-accent); }
```

Kein neuer Code in der Sidebar-Komponente selbst nötig, nur die Klassen-Definition, die
in Round-6 noch fehlte (dort war nur die Template-Struktur, nicht der Farbwert, Teil des
Plans).

### 5. Modal-Grundverhalten (Breakpoint-Tabelle aus spec.md §7.1)

Globale PrimeNG-Dialog-Voreinstellung (nicht Komponenten-Styling der fachlichen Dialoge
selbst, sondern die Basis-Regel):

```scss
.p-dialog {
  width: 80%;
  max-height: 90vh;
}
@media (max-width: 768px) {
  .p-dialog { width: 100%; max-height: 100vh; border-radius: 0; }
}
```

### 6. Prüfung: keine CDN-Referenz im Build (AC-3, AC-4)

`angular.json` gegenprüfen: PrimeNG-Basis-Styles laufen über das `theme`-Preset-System
(kein `primeng.min.css`-Link nötig — das ist PrimeNG-≤17-Terminologie; PrimeNG 22 mit
`@primeuix/styled` injiziert Styles zur Laufzeit über das Preset selbst, kein
`styles`-Array-Eintrag in `angular.json` erforderlich). Sicherstellen, dass kein
`<link>` auf `fonts.googleapis.com` in `index.html` steht (Round-1 hat dort nie einen
gesetzt — reine Gegenprüfung).

### 7. Verifikation

- `ng build --configuration production`, `grep -r "fonts.googleapis\|cdn.jsdelivr"
  dist/` → keine Treffer (AC-3).
- `ng serve`, eine `p-button`/`p-table`-Testinstanz (temporär in einer Platzhalter-Seite
  aus Round 7) rendern → Primary-Button-Hintergrund `#597ea3` (`primary.600`, AC-5, per
  DevTools gegenprüfen).
- Sidebar aus Round 6 optisch prüfen: Hintergrund `#e9e9ea`, „Suite" in `#5980a6` (Round-6/
  Round-8-Zusammenspiel nachweisen).
- `document.documentElement` im Browser: `getComputedStyle(...).getPropertyValue('--color-accent')`
  → `#5980a6` (AC-2, alle sechs Properties durchgehen).
- Dialog-Test (`p-dialog` temporär öffnen): Desktop-Breite 80 %/90 vh, Viewport auf
  ≤ 768 px verkleinern → 100 %/100 vh ohne Radius.

## Reihenfolge

1 und 2 können parallel entstehen (unabhängige Dateien), 3 nach 2 (nutzt `--color-text`/
`--color-bg`), 4 nach 2, 5 unabhängig, jederzeit nach 1, 6 Gegenprüfung nach 1–3, 7
abschließend nach allem.
