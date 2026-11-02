# Typografie und Skalierung
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 51a253e3 plus verschlanktes Theme (ungecommittet) (2026-10-21)

> ATLAS nutzt Roboto in nur zwei Gewichten (300 und 700) und skaliert die gesamte Oberfläche proportional über die Basisschrift der Fensterhöhe.

## Überblick

| Teil | Datei | Aufgabe |
|---|---|---|
| Schrift laden | `src/frontend/src/index.html` | `fonts.googleapis.com/css2?family=Roboto:wght@300;700&display=swap` (genau ein Link, nur 300 und 700); Material Icons bleiben |
| Marken-Eingaben | `src/styles/_brand.scss` | `$typography: (brand-family: 'Roboto', plain-family: 'Roboto', regular-weight: 300, medium-weight: 700, bold-weight: 700)` |
| Material-Theme | `src/styles/_theme.scss` (Quelle), `_theme-used.scss` (eingebunden, erzeugt) | `mat.theme((color, typography: brand.$typography, density))` bildet Materials Gewichte regular/medium/bold auf 300/700 ab; 400 und 500 entfallen; `_theme-used.scss` enthält nur die gelesenen Variablen |
| Typografie-Klassen | `src/styles/_mt-typography.scss` | `.mt-page-title`, `.mt-section-title` (Klasse ohne Direktive) |
| Basisschrift, Fließtext | `src/styles/_app-reset.scss` | `html { font-size: clamp(13px, 1.8vh, 16px) }`, `body { font: 16 px Light, schwarz }` |
| Werte | `src/styles/_mt-tokens.scss` | `font-family`, `font-weight-light/bold`, `font-size-*` ([tokens](tokens.md)) |

## Verwendung

Titel sind Klassen, keine Direktiven:

```html
<!-- login-failed.component.html -->
<h1 class="mt-page-title">Anmeldung nicht möglich</h1>
<!-- result.component.html -->
<h2 class="mt-section-title">Cross Section - Parameter Set #{{ paramSetNumber }}</h2>
```

In Komponenten Größen und Gewichte nur über Token-Verweise (`font-size: var(--mt-font-size-lg)`), nie über Literale (Stylelint, AC-39).

## Zielwerte

| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Fließtext (`body`) | 16 px (`font-size-base`), Gewicht 300, `#000000`, Roboto | – | AC-33, `_app-reset.scss` |
| Seitentitel `.mt-page-title` | 23 px (`font-size-2xl` = 1.4375rem), 300, `#000000`, `line-height: 1.3`, `margin: 0` | – | AC-33, `_mt-typography.scss` |
| Abschnittstitel `.mt-section-title` | 20 px (`font-size-xl` = 1.25rem), 300, `#000000`, `line-height: 1.3`, `margin: 0` | – | AC-33 |
| Gewicht 300 | Fließtext, Eingaben (15 px), Auswahlwert, Titel, Tooltip, Dialog, Snackbar, Spaltentitel im Grid-Header (`headerFontWeight: 300`) | – | Partials mit `font-weight-light` |
| Gewicht 700 | Labels (13 px), Buttons (13 px), Tabs, Tags, Nav-Einträge, Panel-Kopf, Gruppen-Header im Grid (0.8125rem), Auswahl-Platzhalter | – | Partials mit `font-weight-bold`, `mt-grid-theme.ts` |
| Basisschrift bei 720 px Fensterhöhe | 13 px; alle Größen im Verhältnis 13/16 | `clamp(13px, 1.8vh, 16px)`: ab 890 px Höhe 16 px, darunter proportional, nie unter 13 px | AC-45 |
| Gerenderte Gewichte | nur 300 und 700 | jede Seite | AC-64 |
| Einheiten | behalten ihre Schreibweise, auch in Versalien-Labels | `mt-unit` | [compact-and-unit](compact-and-unit.md) |

Größenskala (Tokens): 8 (nur Kurzlabel des Action-Buttons, `font-size-3xs`), 10, 12, 13, 15, 16, 18, 20, 23, 28, 32, 40, 48 px (`font-size-2xs` bis `-6xl`), Verteilung siehe [tokens](tokens.md).

## Aufbau (intern)

```scss
// src/styles/_mt-typography.scss
.mt-page-title,
.mt-section-title { margin: 0; font-family: t.v(font-family); font-weight: t.v(font-weight-light); line-height: 1.3; color: t.v(color-text); }
.mt-page-title { font-size: t.v(font-size-2xl); }
.mt-section-title { font-size: t.v(font-size-xl); }
```

```scss
// src/styles/_app-reset.scss
html { font-size: clamp(13px, 1.8vh, 16px); }
body { font-family: var(--mt-font-family); font-size: var(--mt-font-size-base); font-weight: var(--mt-font-weight-light); color: var(--mt-color-text); background-color: var(--mt-color-page); }
```

Skalierung: Alle Größen sind `rem`-Tokens, die einzige Stellschraube ist `html { font-size }`. Pixel-Literale in Komponenten würden nicht mitskalieren (Ledger Task 17/27: rohe px in Komponenten-Stylesheets sind bekannte Reste). Das Grid skaliert über `dataFontSize: '0.82rem'`, `headerFontSize: '0.8125rem'` in `mt-grid-theme.ts` ([grid](grid.md)).

Reihenfolge in `styles.scss`: `theme` (Material-Typografie) vor `mt-tokens`, `mt-typography`, `mt`, danach `app-reset`.

## Hüllen-Komponenten

Nicht zutreffend.

## Tests

| Was | Wo |
|---|---|
| Seite: Hintergrund `#EFF0F4`, Fließtext 16 px Light schwarz | `e2e/tests/mt-foundation.spec.ts` |
| Roboto nur `wght@300;700` geladen (AC-64) | `e2e/tests/mt-foundation.spec.ts` |
| Skalierung: Basisschrift 13 px bei 720 px Höhe (AC-45) | `e2e/tests/mt-foundation.spec.ts`; Primär-Button 44 px x 13/16 in `mt-targets.spec.ts` |
| Seitentitel 23 px Light | `e2e/tests/mt-targets.spec.ts` (Karte „Login fehlgeschlagen“) |
| Titel/Text AC-33, gerenderte Gewichte AC-64 | Handliste `e2e/mt-messliste.md` (Zeilen AC-33, AC-64) |
| Literale | Stylelint `declaration-property-value-allowed-list` (`font-family`, `font-weight`, `font-size`) |

## Abweichungen ggü. Spec/Plan

Keine festgestellt: Spec (W · Schriftgewichte, W · Skalierung) und Code stimmen überein.

## Offene Punkte

- AC-33 (Abschnittstitel 20 px, Fließtext) und AC-64 (alle Elemente nur 300/700) sind nur als Handliste/teilweise automatisch belegt; der Browser-Test deckt Fließtext, Seitentitel und den Font-Link ab.
- Task 17/27: rohe px und feste Höhen in Komponenten-Stylesheets (z. B. `score-cell-editor` min-height 36px, `dynamic-input-panel` 56px) skalieren nicht mit; zurückgestellt (Final-Review).
- Toolbar-Icon-Button `parameters-page` 32x32 px unskaliert (Final-Review, ungeprüft).

## Ändern: Checkliste

1. Größe oder Gewicht ändern: Token in `_mt-tokens.scss` ändern, nicht im Partial. Neue Gewichte (z. B. 400) nur nach Rücksprache: `index.html` (`wght@…`), `_brand.scss` `$typography`, `mt-foundation.spec.ts` und AC-64 mit anpassen.
2. Basisschrift ändern: nur `html { font-size }` in `_app-reset.scss`; `mt-foundation.spec.ts` (13 px) und Skalierungstest in `mt-targets.spec.ts` nachziehen.
3. Titel: nur `.mt-page-title`/`.mt-section-title` verwenden, keine eigenen Titelgrößen in Komponenten.
4. Nicht tun: `font-*`-Literale in Komponenten, Gewichte 400/500, Größen in `px` statt `rem`.
5. Diese Referenzseite im selben Zug korrigieren.
