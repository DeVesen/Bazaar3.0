# Token-System
Stand: Code-Stand Branch dev, Commit 31c0f0a8 plus Grid-Header-Farbe `#56788f` (ungecommittet) (2026-10-27)

> Alle Farben, Schatten, Radien, Schriftgrößen und Bausteinhöhen der MyTRUMPF-Optik stehen genau einmal in `src/frontend/src/styles/_mt-tokens.scss`; Partials lesen sie beim Build über `v()`, Komponenten über `var(--mt-…)`.

## Überblick

| Element | Datei | Zweck |
|---|---|---|
| Token-Map `$defaults` | `src/styles/_mt-tokens.scss` | einzige Quelle der Werte (Größen in `rem`, Zielwerte gelten bei Basisschrift 16 px) |
| `$overrides` | dort, `!default` | abweichende Werte nur für Tests: `@use 'mt-tokens' with ($overrides: (color-primary: #123456))` |
| `$tokens` | dort | `map.merge($defaults, $overrides)` |
| `$runtime` | dort, `(control-height)` | Tokens, die als `var(--mt-…)` bleiben, weil `mtCompact` sie je Bereich ändert |
| Funktion `v($name)` | dort | liefert den Wert, für `$runtime`-Tokens `var(--mt-<name>)`; unbekannter Name bricht den Build (`@error 'Unbekanntes mt-Token …'`) |
| `:root`-Ausgabe | dort | schreibt jedes Token als `--mt-<name>:<wert>` (von `styles.scss` per `@use './styles/mt-tokens'`), außer den Tokens in `$build-only` (nur beim Build über `v()` gelesen; Wächter `scripts/mt-tokens.test.mjs`) |
| Zugriff TS | `src/app/util/style/mt-token.ts` | `readMtToken(name, element = document.documentElement)` liest `--mt-<name>` per `getComputedStyle` |

## Verwendung

In Partials (unter `src/styles/`), echte Auszüge:

```scss
@use '../mt-tokens' as t;                       // _mt-button-primary.scss
filled-container-color: t.v(color-primary),
--mt-control-height: #{t.v(control-height-compact)};   // _mt-compact.scss (in Custom Properties mit #{…})
```

In Komponenten-Stylesheets und Templates nur Verweise, nie Literale:

```scss
color: var(--mt-color-hint);          // atlas-form-multi-select.component.scss
background-color: var(--mt-color-page); // atlas-nav-group.component.scss
```

In TypeScript für Zeichnungen ohne CSS (Canvas):

```ts
point: readMtToken('measure-point'),   // image-measure-tool.component.ts
```

Regeln

| Regel | Durchsetzung |
|---|---|
| Komponenten verwenden nur `var(--mt-…)` für `color`, `background-color`, `border-*-color`, `box-shadow`, `border-radius`, `font-family`, `font-weight`, `font-size` (erlaubt zusätzlich `inherit`, `initial`, `unset`, `none`, `0`) | Stylelint `declaration-property-value-allowed-list` (AC-39) |
| Farbliterale (Hex, Namen, `rgb()`/`hsl()`…) nur unter `src/styles/` | Stylelint `color-no-hex`, `color-named`, `function-disallowed-list`; Override für `src/styles/**/*.scss` |
| Farbliterale in TS nur in `src/app/util/grid/mt-grid-theme.ts` und `src/assets/data/score-colors.ts` | ESLint `no-restricted-syntax` |
| `!important` nur mit Kommentar `/* stylelint-disable-next-line declaration-no-important -- Grund */` | Stylelint `declaration-no-important`, `reportDescriptionlessDisables` |
| Bausteinhöhe nur über `--mt-control-height` | Partials lesen `t.v(control-height)` = `var(--mt-control-height)` |

## Zielwerte

Alle Tokens (px bei 16 px Basisschrift; `rem` im Code). Spalte „Genutzt in“: Partials unter `src/styles/mt/` ohne Präfix `_mt-` bzw. globale Partials; „App“ = Komponenten-Stylesheets/TS über `var(--mt-…)`/`readMtToken`.

### Farben

| Token | Wert | Genutzt in / Zweck |
|---|---|---|
| `color-page` | `#eff0f4` | Seitenhintergrund (`app-reset`), Lade-Platzhalter (`skeleton`), App |
| `color-surface` | `#ffffff` | Karte, Panel, Menü, Overlays, Schalter-Knopf, Hover-Weiß (button-primary/-danger), Feldfläche |
| `color-text` | `#000000` | Fließtext, Titel, Eingaben, Labels, Optionen |
| `color-ink` | `#0b0b0b` | Sekundär-/Text-/Icon-Button, Feld-Hover/-Fokus, Tabs, Panel-Kopf, Menü |
| `color-ink-strong` | `#131313` | Checkbox, Radio (Punkt), Mehrfachauswahl-Häkchen |
| `color-border` | `#747474` | Feldrand, Checkbox-/Radio-Rand |
| `color-line` | `#e2e2e2` | Trennlinien, Dialog-Linien, deaktivierter/readonly Rand, Tab-Linie; App |
| `color-placeholder` | `#a3a3a3` | Platzhalter in Feld und Auswahl |
| `color-hint` | `#8c8c8c` | Hinweistext, Tooltip-Text; App |
| `color-anthracite` | `#383e42` | Tab-Untertitel inaktiv (`tabs-subtitle`) |
| `color-hover` | `#eff0f4` | Hover-Fläche (Text-/Icon-Button, Menü, Option, Nav-Item, Panel-Kopf, Datepicker); App |
| `color-selected` | `#c6d4dd` | gewählte Option, Kachel; App |
| `color-primary` | `#bbd03a` | Primär-Button, Zähler am Button, Schalter an |
| `color-on-primary` | `#ffffff` | Schrift auf Primär/Danger/Zähler |
| `color-accent` | `#285172` | aktiver Tab/Nav-Eintrag, Datepicker-Auswahl, Chips; App |
| `color-on-accent` | `#ffffff` | Schrift auf Akzent (Tabs, Nav, Tag, Chips, Sekundär-Hover, Checkbox-Haken) |
| `color-switch-off` | `#c4c4c4` | Schalter aus |
| `color-focus` | `#000000` | Fokusrahmen (Button, AC-10) |
| `color-transparent` | `transparent` | Button-Rand der Basis, Hintergründe Sekundär/Text (Icon-Button: Materials Vorgabe) |
| `color-grid-header` | `#56788f` | App: Schrift des aktiven Einheiten-Umschalters (`unit-header-3.component.scss`); der Grid-Wert selbst steht als Literal in `mt-grid-theme.ts` |

### Rollenpalette

| Token | Wert | Genutzt in / Zweck |
|---|---|---|
| `role-info` | `#285172` | `mt-role-info` (Tag, Snackbar-Rand, Schrift) |
| `role-success` | `#bbd03a` | `mt-role-success`; App (Erfolgstext) |
| `role-warning` | `#ff9032` | `mt-role-warning`; App |
| `role-error` | `#ff0201` | `mt-role-error`, Danger-Button, Fehlertext, Feld-Fehlerrand; App |
| `role-neutral` | `#a1a1a1` | `mt-role-neutral`, Tag, Snackbar |
| `role-success-subtle` | `#f1f6d8` | App (`unit-header`) |
| `role-warning-subtle` | `#ffe9d6` | App (`unit-header`) |
| `role-error-subtle` | `#ffe1e1` | App (`bo-tools-page`) |

Rollen (`info`, `success`, `warning`, `error`, `neutral`) sind der Typ `MtRole` in `mt-role.directive.ts`; die Partials `_mt-role.scss` setzen `--mt-role-color`. Details: [tag-and-role](tag-and-role.md).

### Schatten und Radien

| Token | Wert (16 px) | Genutzt in / Zweck |
|---|---|---|
| `shadow-surface` | `0 5px 25px 0 rgba(19,19,19,.1)` (`0 0.3125rem 1.5625rem 0 …`) | `surface` (Mixin), card, panel, datepicker, autocomplete, tooltip; App (AC-01) |
| `shadow-ring-success` | `0 0 0 3px #f1f6d8` | App (`unit-header`); wiederholt das Farbliteral statt `role-success-subtle` zu verweisen |
| `shadow-ring-warning` | `0 0 0 3px #ffe9d6` | App (`unit-header`); wie oben |
| `shadow-inset-accent` | `inset 0 0 0 2px #285172` | App (`search-result-images-dialog`) |
| `radius-none` | `0` | Karte, Button, Feld, Menü, Dialog, Snackbar, Skeleton (alles eckig) |
| `radius-tag` | `0.125rem` = 2 px | Tag, Checkbox, Chip |
| `radius-badge` | `1.25rem` = 20 px | Zähler am Button |
| `radius-round` | `50%` | App (Bubbles, Score-Skala) |

### Schrift

| Token | Wert (16 px) | Genutzt in / Zweck |
|---|---|---|
| `font-family` | `Roboto, 'Helvetica Neue', sans-serif` | `app-reset`, Eingaben, Labels, Titel; App |
| `font-family-mono` | `ui-monospace, 'Roboto Mono', monospace` | App (Tools-Seiten) |
| `font-weight-light` | 300 | Fließtext, Eingaben, Titel, Tooltip, Dialog |
| `font-weight-bold` | 700 | Label, Button, Tab, Tag, Nav, Panel-Kopf, Auswahl-Platzhalter |
| `font-size-3xs` | 0.5rem = 8 px | Kurzlabel des Action-Buttons (`button-tile`, [action-button](action-button.md)) |
| `font-size-2xs` | 0.625rem = 10 px | Einheit im Grid-Header, Sort-Indikator; App |
| `font-size-xs` | 0.75rem = 12 px | Zähler am Button; App |
| `font-size-sm` | 0.8125rem = 13 px | Label, Hinweis, Fehler, Button, Tag, Tabs, Tooltip, Snackbar |
| `font-size-md` | 0.9375rem = 15 px | Eingabetext, Auswahlwert, Datum, Bereich |
| `font-size-base` | 1rem = 16 px | `body`, Dialog, Panel |
| `font-size-lg` | 1.125rem = 18 px | Nav-Eintrag; App |
| `font-size-xl` | 1.25rem = 20 px | Kartentitel, Dialogtitel, `.mt-section-title` |
| `font-size-2xl` | 1.4375rem = 23 px | `.mt-page-title` |
| `font-size-3xl` | 1.75rem = 28 px | nur App |
| `font-size-4xl` | 2rem = 32 px | nur App |
| `font-size-5xl` | 2.5rem = 40 px | nur App |
| `font-size-6xl` | 3rem = 48 px | nur App |
| `letter-spacing-tag` | 0.03em | Tag |

Typografie-Regeln: [typography](typography.md).

### Bausteinhöhe und Abstände

| Token | Wert | Genutzt in / Zweck |
|---|---|---|
| `control-height` | 2.75rem = 44 px (Laufzeit: `var(--mt-control-height)`) | Button, Feld, Icon-Button, Menüeintrag, Nav-Item, Panel-Kopf |
| `control-height-compact` | 2rem = 32 px | nur `mt-compact` setzt `--mt-control-height` darauf |
| `space-2` | 8px | `layout`-Mixin `flex-col` |

### Messwerkzeug (Canvas)

| Token | Wert | Zweck |
|---|---|---|
| `measure-point` | `#ff4081` | Messpunkt (`readMtToken` in `image-measure-tool.component.ts`) |
| `measure-line` | `#00e5ff` | Messlinie |
| `measure-text` | `#ffffff` | Beschriftung |
| `measure-label-background` | `rgba(0,0,0,.7)` | Label-Hintergrund |
| `measure-pending-background` | `rgba(0,0,0,.6)` | Hintergrund wartender Messung |
| `measure-pending-text` | `#ffcdd2` | Text wartender Messung |

### Score-Palette

`src/assets/data/score-colors.ts` bleibt unverändert und ist kein mt-Token: `SCORE_COLORS` (Note 1 bis 6: `#b9d4b0`, `#e0e8b8`, `#f0e6a0`, `#f0cfa0`, `#e8bfb0`, `#dba0a0`), `SCORE_TEXT_ON_DARK` `#ffffff`, `SCORE_TEXT_ON_LIGHT` `#000000`. Erlaubte Ausnahme für Farbliterale in TS (ESLint, Parameter-Tabelle und Score-Skala).

## Aufbau (intern)

| Punkt | Detail |
|---|---|
| Build-Zeit-Werte | Partials binden `@use '../mt-tokens' as t;` und nutzen `t.v(name)`. In Custom Properties und Interpolationen `#{t.v(…)}` (Sass wertet sonst nicht aus; Test `compile_AllPartialsWithDefaultTokens_ResolveEveryTokenCall`) |
| Laufzeit-Token | nur `control-height`; `.mt-compact { --mt-control-height: #{t.v(control-height-compact)}; }` |
| Material-Override-Mixins zuerst | `@include mat.button-overrides((…))`, `mat.form-field-overrides((…))` mit `t.v()`-Werten; erst danach eigene Selektoren. Geteilte Mixins: `field-tokens` (`mt-field-tokens`, von `mt-field` und `mt-grid-editor`), `surface` (`mt-surface`, von mt-dialog, mt-menu, mt-snackbar) |
| Einbindung | `styles.scss`: `mt-tokens` vor `mt-typography`, `mt-skeleton`, `mt` (Reihenfolge siehe [page-and-layout](page-and-layout.md)) |
| Rem-Werte | Größen in `rem`, daher skalieren alle Maße mit `html { font-size: clamp(13px, 1.8vh, 16px) }` (AC-45) |

## Hüllen-Komponenten

Nicht zutreffend.

## Tests

| Test | Datei | Aussage |
|---|---|---|
| AC-35 | `scripts/mt-tokens.test.mjs` | kompiliert `mt` mit `$overrides` (`color-primary`, `shadow-surface`, `color-border`, `radius-tag`, `role-info` …) und prüft, dass Primär-Button, Karte, Feldrand, Tag und Rolle den neuen Wert tragen; Lauf: `node --test scripts/mt-tokens.test.mjs` |
| Token-Zugriff TS | `src/app/util/style/mt-token.spec.ts` | `readMtToken` |
| Messwerte | `e2e/tests/mt-foundation.spec.ts`, `mt-targets.spec.ts` | Seite, Schrift, Skalierung, Zielwerte |
| Stylelint | `stylelint.config.mjs`, `stylelint-plugins/mt-stylelint.test.mjs` | Literale in Komponenten |

## Abweichungen ggü. Spec/Plan

| Thema | Jetzt (Code) | Spec/Plan | Grund |
|---|---|---|---|
| Grid-Tokens | `color-grid-row-alt`, `color-grid-row-hover` ohne Verbraucher entfernt (`color-grid-header` nur im Umschalter-SCSS); die Grid-Farben stehen als Literale in `mt-grid-theme.ts` | nicht geprüft, ob Spec/Plan Verbraucher vorsahen | Farbliterale in TS sind dort erlaubt ([grid](grid.md)) |
| Zustandsanzeigen | `role-*-subtle`, `shadow-ring-*`, `shadow-inset-accent` nur in Komponenten genutzt | Plan-Codemod (Task 19) entfernte Zustandsanzeigen | Ledger-Urteil Task 19: Wiederherstellung über `var(--mt-…)` an der eigenen Zustandsklasse (Spec erlaubt Token-Verweise für fachliche Sonderflächen) |
| Entfernte Tokens | `role-info-subtle`, `space-1`, `space-3`, `space-4`, `space-5` ohne Verbraucher aus der Map gestrichen | Plan nannte sie | Bytes im Bundle; Stand per Grep |

## Offene Punkte

- Task 4: `shadow-ring-*` und `shadow-inset-accent` wiederholen Farbliterale statt auf Rollen-Tokens zu verweisen; ein `///`-Kommentar in `_mt-tokens.scss` wirkt wie Sassdoc.
- Task 19: durchscheinende Abdunkelungen wurden durch deckende Tokens ersetzt; ein Scrim-Token fehlt.
- Task 23: `mt-tokens.test.mjs` schneidet `ruleBody` am ersten `}` (nur flache Regeln prüfbar).
- Die Verbraucherliste oben ist ein Stand per Grep; neue Verbraucher selbst nachtragen.

## Ändern: Checkliste

**Wert zentral ändern (AC-35)**

1. Nur den Wert in `$defaults` von `src/styles/_mt-tokens.scss` ändern. Kein Wert in Partials oder Komponenten.
2. `node --test scripts/mt-tokens.test.mjs` und Build laufen lassen; Messwerte in `e2e/tests/mt-targets.spec.ts`/`e2e/mt-messliste.md` und Zielwert-Tabelle der betroffenen Elementseite anpassen.
3. Zielwerte stehen bei 16 px: rem-Wert = px / 16.

**Neues Token**

1. Nur mit Verbraucher im selben Zug anlegen, kein Token auf Vorrat (jedes Token kostet ohne `$build-only` eine `:root`-Variable im Bundle).
2. In `$defaults` eintragen (Name `<gruppe>-<name>`, Größen in `rem`); Verbraucher über `t.v(name)` bzw. `var(--mt-name)`; nur Laufzeit-Variablen zusätzlich in `$runtime`. Liest nur ein Partial das Token über `t.v()` (kein `var(--mt-…)`, kein `readMtToken`), gehört es in `$build-only`; der Wächter `compile_DefaultTokens_DefinesEveryMtVariableTheAppReads` meldet ein fälschlich eingetragenes.
3. Tabelle auf dieser Seite ergänzen. Bundle-Budget beachten (Partials höchstens 2048 B; Regeln gegen unnötige Bytes: [enforcement](enforcement.md#bytes-sparen-was-nicht-ins-css-gehört)).

Nicht tun: Literale in Komponenten, Token-Wert in einem Partial überschreiben, `$overrides` im Produktivcode setzen (nur Tests), Budget anheben. **Diese Referenzseite im selben Zug korrigieren.**
