# Formularfeld
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit f4636baf plus Label-Korrektur (ungecommittet) (2026-10-21)

> Der Formularfeld-Container (`mat-form-field`) mit Label über dem Feld, Hinweis, Fehler und Readonly-Zustand; Basis aller Eingabe-, Auswahl- und Bereichsfelder (Controls siehe [input](input.md), [select](select.md), [range-and-datepicker](range-and-datepicker.md)).

## Überblick

| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtField]` | `mt-field` | Basis (Container) | `mat-form-field` | `mt-field.directive.ts`, `styles/mt/forms/_mt-field.scss`, `_mt-field-tokens.scss` |
| `[mtLabel]` | `mt-label` | Basis | `mat-label` (auch eigenständig nutzbar) | `mt-label.directive.ts`, `_mt-label.scss` |
| `[mtHint]` | `mt-hint` | Basis | `mat-hint` | `mt-hint.directive.ts`, `_mt-hint.scss` |
| `[mtError]` | `mt-error` | Basis | `mat-error` | `mt-error.directive.ts`, `_mt-error.scss` |
| `input[matInput][readonly]:not(.atlas-optics-trigger-input)`, `textarea[matInput][readonly]`, `mat-select[readonly]`, `input[matChipInputFor][readonly]` | `mt-readonly` | Querschnitt (kein Attribut im Template) | das readonly-Control | `mt-readonly.directive.ts`, `_mt-readonly.scss` |
| `[mtGridEditor]` | `mt-grid-editor` | Variante des Containers (Zell-Editor) | `mat-form-field` in Grid-Zelle | `mt-grid-editor.directive.ts`, `_mt-grid-editor.scss`; Details [grid](grid.md) |
| Regel `field-tokens` | - | gemeinsame Feld-Werte (eine Regel für `mt-field` und `mt-grid-editor`) | - | `styles/mt/forms/_mt-field-tokens.scss` |

Pfade: Direktiven unter `src/frontend/src/app/util/directives/`, Partials unter `src/frontend/src/styles/mt/`. Alle sind im Barrel `MT_DIRECTIVES` (`mt-directives.ts`); jede Komponente mit mt-Attributen im Template importiert `MT_DIRECTIVES`, sonst ignoriert Angular die Attribute stillschweigend. Modell der Direktiven: [directive-model](directive-model.md).

## Verwendung

Container `mtField`, Label `mtLabel`, Control mit eigener Basis (Container und Control sind getrennte Direktiven, keine Vererbung zwischen ihnen):

```html
<!-- features/experiment-wizard/experiment-task/dynamic-input-panel/dynamic-input-panel.component.html -->
<mat-form-field mtField>
  <mat-label mtLabel>{{ field.label }}</mat-label>
  <input mtInputNumeric matInput type="number" ... />
</mat-form-field>
```

Hinweis, Fehler, Einheit (Hülle `atlas-form-minmaxinput`):

```html
<mat-form-field mtField subscriptSizing="dynamic">
  <mat-label mtLabel>{{ label() }}@if (unit()) {<span mtUnit> ({{ unit() }})</span>}</mat-label>
  ...
  <mat-hint mtHint>{{ hint() }}</mat-hint>
  <mat-error mtError>{{ errorMessage() }}</mat-error>
</mat-form-field>
```

Layout-Klasse: nur am Container, nie Optik. `<mat-form-field mtField class="half-width">` (`report/first-step-general`).

| Fehler im Template | Lint-Meldung (`mt/require-directive`, `mt/no-redundant-base`) |
|---|---|
| `<mat-form-field>` ohne `mtField` oder `mtGridEditor` | `<mat-form-field> braucht eine mt-Direktive: mtField \| mtGridEditor.` |
| `<mat-label>` ohne `mtLabel`, `<mat-hint>` ohne `mtHint`, `<mat-error>` ohne `mtError` | `braucht eine mt-Direktive: ...` |
| `<input matInput>` ohne `mtInput \| mtInputNumeric \| mtDatepicker \| mtAutocomplete` | siehe [input](input.md) |
| `mtReadonly` im Template | gibt es nicht; `readonly` am Control reicht |

### Zusammenspiel Container / Control

| Element | Direktive | Hinweis |
|---|---|---|
| `mat-form-field` | `mtField` | Outline, Höhe, Rand, Label oben, Hover/Fokus/Fehler |
| `input matInput` | `mtInput` oder `mtInputNumeric` | Schrift des Eingabetexts |
| `textarea matInput` | `mtTextarea` | |
| `mat-select` | `mtSelect` oder `mtSelectMulti` | |
| `input matInput` + `matAutocomplete` | `mtAutocomplete` | |
| `input matChipInputFor` | `mtAutocompleteMulti` | |
| `input matInput` + `matDatepicker` | `mtDatepicker` | |
| Bereichs-Control `div` | `mtRange` | |
| beliebiges Control mit Suffix-Aktion | zusätzlich `mtInputAction` | Querschnitt, siehe [input](input.md) |

## Zielwerte

Bei Basisschrift 16 px (Messung per Browser-Test, siehe Tests). rem-Werte skalieren mit der Basisschrift (AC-45).

| Eigenschaft | Wert | Zustand | Quelle |
|---|---|---|---|
| Feldhöhe | 44 px (`control-height` 2.75rem); Kompakt 32 px (`control-height-compact`) | Ruhe | AC-12, AC-11/51, Token |
| Hintergrund | `#FFFFFF` (`color-surface`) | Ruhe | AC-12 |
| Rand | 1 px `#747474` (`color-border`), Radius 0 | Ruhe | AC-12 |
| Eingabetext | 15 px (`font-size-md`), Light 300, Zeilenhöhe 1.125rem | Ruhe | AC-12 |
| Innenabstand | 13 px oben/unten (`(control-height - 1.125rem) / 2`), 20 px seitlich (`padding: 0 1.25rem`) | Ruhe | AC-12 |
| Platzhalter | `#A3A3A3` (`color-placeholder`) | Ruhe | AC-12 |
| Label | 13 px (`font-size-sm`), fett 700, Versalien, `#000000`; steht über dem Feld, 10 px Abstand | immer (`floatLabel: 'always'`) | AC-13 |
| Label seitlich | Textanfang am linken Feldrand (Abstand zum Wrapper höchstens 1 px), nichts abgeschnitten | immer | AC-13 |
| Pflicht-Stern | `' *'` nach dem Label | Pflichtfeld | AC-13 |
| Rand Hover | `#0B0B0B` (`color-ink`) | Hover | AC-14 |
| Rand Fokus | 2 px `#0B0B0B` | Fokus | AC-14, AC-10 |
| Rand und Fehlertext | `#FF0201` (`role-error`), Text 13 px | Fehler (auch Hover/Fokus) | AC-14 |
| Rand | `#E2E2E2` (`color-line`), Deckkraft 0,4 | Disabled (`.mat-form-field-disabled`) | AC-14 |
| Hinweis | 13 px, `#8C8C8C` (`color-hint`) | Ruhe | AC-15 |
| Readonly | Rand `#E2E2E2`, Hintergrund `#FFFFFF`, Deckkraft 1 | Control `readonly` | AC-17 |
| Grid-Zell-Editor | wie Feld, ohne Label oben, füllt Zelle (`width/height: 100%`) | aktiv | AC-18 |
| Layout-Klasse am Hüllen-Host | Feld füllt Hostbreite (`mat-form-field { width: 100% }`, `:host { display: block }`) | immer | AC-61 |

## Aufbau (intern)

`mtField` setzt Klasse und Material-Voreinstellungen per Provider (Sitz: `mt-field.directive.ts`):

```ts
export const MT_FIELD_DEFAULTS: MatFormFieldDefaultOptions = {
  appearance: 'outline',
  floatLabel: 'always',
  hideRequiredMarker: false,
};
// @Directive({ selector: '[mtField]', host: { class: 'mt-field' },
//   providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: MT_FIELD_DEFAULTS }] })
```

`_mt-field-tokens.scss` (eine Regel für `.mt-field.mat-mdc-form-field, .mt-grid-editor.mat-mdc-form-field`, damit die Werte nur einmal im Bundle stehen) setzt über `mat.form-field-overrides` Höhe (`container-height`, `container-vertical-padding`), Schrift, Radius `radius-none`, Rand-/Hover-/Fokus-/Fehler-/Disabled-Farben (Randbreiten 1 px / 2 px Fokus sind Materials Vorgabe), Platzhalter, Fehlertext und `subscript-text-size`. Zusätzlich plain CSS: `.mdc-text-field--outlined { padding: 0 1.25rem; background-color }` und `&.mat-form-field-disabled { opacity: 0.4 }`.

`_mt-field.scss` (Selektor `.mt-field.mat-mdc-form-field`) ergänzt nur, was nur `mt-field` braucht:

| Baustein | Mittel |
|---|---|
| Label-Schrift | `mat.form-field-overrides` `outlined-*-label-text-*` (13 px, bold, schwarz) |
| Label über dem Feld | `padding-top: calc(font-size-sm * 1.2 + 0.625rem)` am Container; `--mat-mdc-form-field-floating-label-scale: 1`; `--mat-mdc-form-field-label-transform: translateY(calc(-1 * (control-height / 2 + 0.625rem + font-size-sm * 1.2)))` an `.mdc-floating-label--float-above`; `left: 0` (Material setzt `4px`; die Kerbe beginnt schon am Feldrand, jede negative Verschiebung schneidet den Labelanfang ab) |
| Randlücke schließen | `.mdc-notched-outline--notched .mdc-notched-outline__notch { border-top-style: solid; border-top-width: var(--mat-form-field-outlined-outline-width, 1px) }` |
| Pflicht-Stern | `.mdc-floating-label--required::after { content: ' *'; margin-left: 0 }` |

Die Label-Verschiebung nutzt `--mt-control-height` (Laufzeit-Token, `mt-compact` ändert es), das Label folgt damit der Kompakt-Stufe. `mt-label` setzt 13 px bold uppercase zusätzlich als eigene Klassenregel (Partial `_mt-label.scss`); `mt-label`, `mt-hint`, `mt-error` verwenden nur Tokens (`font-size-sm`, `color-hint`, `role-error`).

`mtReadonly` (Partial `_mt-readonly.scss`, Selektor `.mat-mdc-form-field:has(.mt-readonly)`) überschreibt über `form-field-overrides` Rand und Hover-Rand (`color-line`), Disabled-Text/-Label und über `chips-overrides` die Chip-Labelfarbe; den Disabled-Rand (`color-line`) setzt schon `field-tokens`, die Chip-Deckkraft 1 ist Materials Vorgabe, beide nicht wiederholen; `&.mat-form-field-disabled { opacity: 1 }` hebt die 0,4 aus `field-tokens` auf, damit auch eine von der Hülle zusätzlich deaktivierte readonly-Instanz volle Deckkraft hat. Die Direktive hat ein Eingabe-`readonly` (boolean-Transform) und bindet `[class.mt-readonly]`; sie hängt an vier Selektor-Zweigen (siehe Überblick). Der Auslöser der Optik-Gruppierung (`.atlas-optics-trigger-input`, technisch readonly) ist per `:not` ausgenommen. Der ESLint-Disable am Selektor ist begründet (`directive-selector`: kein eigenes Attribut).

Reihenfolge im Partial-Index (`styles/mt/_index.scss`): `mt-field-tokens`, `mt-field`, `mt-label`, `mt-hint`, `mt-error`, `mt-input`, `mt-input-numeric`, `mt-input-action`, `mt-textarea`, `mt-readonly`, `mt-select`, ... `mt-readonly` steht bewusst nach `mt-field`/`mt-input-action` und vor `mt-select`: `.mt-field.mat-mdc-form-field` und `.mat-mdc-form-field:has(.mt-readonly)` haben dieselbe Spezifität (0,2,0), die spätere Regel gewinnt. Reihenfolge nicht ändern.

Token-Zugriff in Partials: `@use '../mt-tokens' as t;` und `t.v(<name>)`; `control-height` bleibt Laufzeit-Variable `var(--mt-control-height)` (Tokens siehe [tokens](tokens.md)).

## Hüllen-Komponenten

Hüllen `atlas-form-*` (Pfad `src/frontend/src/app/components/common/atlas-form-*/`) tragen Verhalten (Formularanbindung, Fehlertexte, Löschen-Aktion) und nutzen die Direktiven intern. Gemeinsame Regeln (AC-44, AC-61):

| Thema | Stand |
|---|---|
| Wegfall | Eingaben `appearance`, `cssClass`, `fieldsetStyle` und weitere Optik-Eingaben (`variant`, `color`, `btnClass`, `btnStyle`, `badgeColor`, `badgePosition`) entfallen; Liste in `REMOVED_OPTIC_INPUTS` (`testing/mt-directive.testing.ts`), Prüfung je Hülle über `remainingOpticInputs` |
| Beschriftung | Eingabe `label`; Eingabe `unit` (nullable; vorhanden an Input, Min/Max, Nom/Min/Max, Multi-Select; nicht an Textarea, Select, Autocomplete) rendert `@if (unit) {<span mtUnit> ({{ unit }})</span>}` direkt hinter dem Label-Text; Schreibweise bleibt, Versalien nur im Label ([compact-and-unit](compact-and-unit.md)) |
| Layout | Aufrufer setzt Layout-Klasse per `class` am Host (z. B. `toolbar__search`); Hülle: `:host { display: block }`, `mat-form-field { width: 100% }` |
| Readonly | `@Input() readOnly` mit `@HostBinding('class.atlas-readonly')`; Optik kommt von `mtReadonly` (Control `[readonly]`), die Hülle sperrt nur das Verhalten (`pointer-events: none`, ausgeblendeter Select-Pfeil bei `disabled-field`) |
| Disabled | `setDisabledState` setzt `isDisabledX` und die Klasse `disabled-field`; Optik über `mtField` (Deckkraft 0,4) |
| Fehlertexte | `<mat-error mtError>` je Validierungsfehler (`required`, `htmlTagsNotAllowed`, `email`, `pattern`, `lacIdExists`, `maxlength`, `serverError`) |
| `subscriptSizing` | Eingabe, Default `dynamic` |

Hüllen im Einzelnen: [input](input.md) (`atlas-form-input`, `-textarea`, `-minmaxinput`, `-nomminmaxinput`), [select](select.md) (`-select`, `-multi-select`, `-autocomplete`, `-multi-autocomplete`), [choice-controls](choice-controls.md) (`-slidetoggle`).

### Grid-Zell-Editor

`mtGridEditor` (Klasse `mt-grid-editor`) am `mat-form-field` eines Zell-Editors, z. B. `<mat-form-field mtGridEditor class="score-comment-field" subscriptSizing="dynamic">` (`score-cell-editor.component.html`). Voreinstellungen `MT_GRID_EDITOR_DEFAULTS`: `appearance: 'outline'`, `floatLabel: 'auto'`, `subscriptSizing: 'dynamic'`. Partial: Feld-Werte aus der gemeinsamen Regel in `_mt-field-tokens.scss`, eigene Regel nur `width: 100%; height: 100%`; kein Label-Block, keine Label-Verschiebung. Lint: `mat-form-field` akzeptiert `mtField` oder `mtGridEditor`, keine Ausnahme nötig (AC-38). Weiteres: [grid](grid.md).

## Tests

| Art | Ort |
|---|---|
| Unit | `mt-field.directive.spec.ts` (Klasse, Provider: outline, floatLabel always, hideRequiredMarker false), `mt-label`, `mt-hint`, `mt-error`, `mt-readonly.directive.spec.ts` (readonly an matInput, `[readonly]=false`, Optik-Trigger ausgenommen), `mt-grid-editor.directive.spec.ts` |
| Hüllen-Unit | `atlas-form-*.component.spec.ts`: `inputs_AfterMigration_HaveNoOpticInputs`, `template_UnitSet_RendersUnitInMtUnitAfterLabel`, `readOnly_*_AtlasReadonlyHostClass` |
| Browser | `e2e/tests/mt-targets.spec.ts` „Formularfeld: 44 px, weiß, Rand 1 px grau, eckig, Label oben 13 px fett in Versalien mit 10 px Abstand" (Such-Wizard „Machine", misst Höhe, Hintergrund, Rand, Radius, Innenabstand, Wert, Label, Abstand 9 bis 11 px); „Formularfeld: Label beginnt am linken Feldrand und ist nicht abgeschnitten" (alle Felder des Such-Wizards, Label-Box zu Wrapper-Box höchstens 1 px); „Kompakt-Stufe und Hüllen" (Suchfeld 32 px, füllt seinen Host, AC-61) |
| Messliste | `e2e/mt-messliste.md`: AC-10 (Tastaturfokus), AC-14 (Hover/Fokus, Fehler, Disabled), AC-15 (Hinweis), AC-16, AC-17 (Readonly) |
| ESLint | `mt/require-directive` (Elemente `mat-form-field`, `mat-label`, `mat-hint`, `mat-error`; Zuordnung in `eslint-rules/mt-directive-map.json`), `mt/no-redundant-base` (`eslint-rules/mt-directives.cjs`); Gate `scripts/mt-lint-gate.mjs` |
| Stylelint | Komponenten-Stylesheets: keine Literale für Farbe, Schatten, Radius, Schrift; `mt/max-file-size` 2048 B je Partial unter `styles/mt/` (`stylelint.config.mjs`) |

## Abweichungen ggü. Spec/Plan

Keine inhaltliche Abweichung bei Zielwerten der Felder. Code-Korrektur nach Sichtprüfung (2026-10-21): Das Label stand mit `left: -1.25rem` 15 px links vom Feldrand und war an allen Eingabe-, Auswahl- und Bereichsfeldern am Anfang abgeschnitten; die Kerbe des Outlines beginnt aber schon am Feldrand, die Verschiebung um den Innenabstand war falsch. Jetzt `left: 0`, neuer Browser-Messtest. Hinweis: die Spec-Fassung `mt-field` als Basis aller Feld-Direktiven wurde schon in der Spec selbst ersetzt (W · Ort von mt-field): `mt-field` sitzt nur am Container, jede Control-Direktive ist eigene Basis, jede Direktive wirkt nur an ihrem Element.

## Offene Punkte

- Task 7: `mt-readonly.spec` testet nur den Zweig `input[matInput][readonly]`, nicht `textarea`, `mat-select`, `matChipInputFor` (zurückgestellt, 🟡).
- Task 7: Pseudo-Arrange `imports = IMPORTS` in `mt-field.spec` (🟢).
- Task 23: globales Stylesheet-Bundle 30,97 kB, nur 589 B unter der Fehlergrenze (+50 %); jede Partial-Ergänzung kann den Production-Build kippen, Budget anheben nur nach Rücksprache.
- Task 17 und Task 27 (außerhalb Scope, Final-Review): rohe px und Bausteinhöhen in Komponenten-Stylesheets (z. B. `score-cell-editor` `min-height 36px`, `dynamic-input-panel` `min-height 56px`); Hüllen `atlas-form-textarea` hat `textarea { height: 14rem }` als Layout-Höhe.
- Final: Überlauf und Optik nicht im Browser geprüft (Messliste und Sichtabnahme gegen Referenzbilder stehen aus).
- Ungeprüfte Annahme: `mtInputAction` greift auch auf den Toggle-Button eines `mat-datepicker-toggle` im selben `icon-suffix` (Selektor `.mat-mdc-form-field-icon-suffix .mat-mdc-icon-button`); Wirkung nicht gemessen.

## Ändern: Checkliste

1. Wert ändern: Token in `src/frontend/src/styles/_mt-tokens.scss` (`$defaults`), nicht in Partial oder Komponente. Feld-Werte stehen in `_mt-field-tokens.scss` (gilt auch für `mt-grid-editor`), nur-Container-Werte in `_mt-field.scss`.
2. Material-Werte zuerst über `mat.form-field-overrides`; eigenes CSS nur, wo es keinen Override gibt; kein `!important` ohne Grundkommentar (`/* stylelint-disable-next-line declaration-no-important -- Grund */`).
3. Partial höchstens 2 kB (`mt/max-file-size`), TS-Datei höchstens 100 Zeilen; Budget des globalen Stylesheets nicht anheben.
4. Keine Farb-/Schrift-/Radius-Literale in Komponenten-Stylesheets; in Hüllen nur Layout, Abstände und `var(--mt-…)` für fachliche Sonderflächen.
5. Reihenfolge in `styles/mt/_index.scss` bei gleicher Spezifität beachten (`mt-readonly` nach `mt-field`).
6. Neue Direktive: Datei, Spec (Klasse und Voreinstellung), Eintrag in `MT_DIRECTIVES`, Partial plus `_index.scss`, ggf. `eslint-rules/mt-directive-map.json`.
7. Specs, `e2e/tests/mt-targets.spec.ts` und `e2e/mt-messliste.md` nachziehen.
8. Diese Referenzseite im selben Zug korrigieren (auch [input](input.md), [select](select.md), [tokens](tokens.md) bei Berührung).
