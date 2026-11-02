# Auswahl
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit b9dbc15d (2026-10-21)

> Auswahlfelder (`mat-select`), Optionen, Autovervollständigung und die Mehrfach-Varianten mit ihren Panels und Hüllen; sitzen in einem [Formularfeld](field.md).

## Überblick

| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtSelect]` | `mt-select` | Basis | `mat-select` | `mt-select.directive.ts`, `styles/mt/forms/_mt-select.scss` |
| `[mtSelectMulti]` | `mt-select-multi` (+ `mt-select`) | Verfeinerung, schließt `mtSelect` per `hostDirectives` ein | `mat-select multiple` | `mt-select-multi.directive.ts`, `_mt-select-multi.scss` |
| `[mtOption]` | `mt-option` | Basis | `mat-option` (auch in `mat-autocomplete`) | `mt-option.directive.ts`, `_mt-option.scss` |
| `[mtAutocomplete]` | `mt-autocomplete` | Basis | `input matInput` mit `matAutocomplete` | `mt-autocomplete.directive.ts`, `_mt-autocomplete.scss` |
| `[mtAutocompleteMulti]` | `mt-autocomplete-multi` (+ `mt-autocomplete`) | Verfeinerung, schließt `mtAutocomplete` ein | `input matChipInputFor` (Chip-Eingabe) | `mt-autocomplete-multi.directive.ts`, `_mt-autocomplete-multi.scss` |
| Overlay-Klassen `mt-select-panel`, `mt-select-multi-panel`, `mt-autocomplete-panel` | - | Klasse ohne Direktive (per Provider-Voreinstellung am Overlay) | Overlay-Panel | siehe Aufbau |

Pfade: `src/frontend/src/app/util/directives/`, `src/frontend/src/styles/mt/`. Modell: [directive-model](directive-model.md). Kartenfläche der Panels: [surface-and-card](surface-and-card.md).

## Verwendung

```html
<!-- features/experiment-wizard/report/first-step-general/first-step-general.component.html -->
<mat-form-field mtField class="half-width">
  <mat-label mtLabel>Technologies</mat-label>
  <mat-select mtSelectMulti formControlName="technologies" multiple>
    @for (tech of reportTechnologies; track tech) {
      <mat-option mtOption [value]="tech">{{ getTechnologyLabel(tech) }}</mat-option>
    }
  </mat-select>
</mat-form-field>
```

```html
<!-- atlas-form-autocomplete.component.html -->
<input matInput mtAutocomplete mtInputAction [formControl]="control" [matAutocomplete]="auto" />
<mat-autocomplete #auto="matAutocomplete">
  @for (option of filteredOptions; track option) { <mat-option mtOption [value]="option">{{ option }}</mat-option> }
</mat-autocomplete>
```

Chip-Eingabe (`atlas-form-multi-autocomplete.component.html`): `<mat-chip-grid>` mit `<mat-chip-row>` je Wert, `<input mtAutocompleteMulti [matChipInputFor]="chipGrid" [matAutocomplete]="auto" ...>`.

| Fehler | Meldung / Folge |
|---|---|
| `mat-select` ohne `mtSelect \| mtSelectMulti` | `mt/require-directive` |
| `mat-option` ohne `mtOption` | `mt/require-directive` |
| `matChipInputFor` ohne `mtAutocompleteMulti` | `mt/require-directive` |
| `mtSelectMulti` + `mtSelect`, `mtAutocompleteMulti` + `mtAutocomplete` | `mt/no-redundant-base` |
| `mat-select multiple` mit `mtSelect` statt `mtSelectMulti` | kein Lint-Fehler; Panel ohne Mehrfach-Häkchen-Optik |

Schreibweise (AC-20): Wert, Label und Platzhalter bleiben Text wie vom Aufrufer geliefert; nur die Darstellung ändert sich (Label und Platzhalter 13 px bold Versalien, gewählter Wert 15 px Light in unveränderter Schreibweise). Texte nie per Direktive umschreiben.

## Zielwerte

| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Auswahlfeld Höhe | 44 px (Feld, siehe [field](field.md)); Trigger und Pfeil genau 1.125rem hoch | Ruhe | AC-20, `_mt-select.scss` |
| Gewählter Wert | 15 px (`font-size-md`), Light 300, `#000000` | gewählt | AC-20, AC-12 |
| Platzhalter | 13 px (`font-size-sm`), fett, Versalien; Farbe `#A3A3A3` (`color-placeholder`) | leer | AC-20 |
| Label | 13 px fett Versalien, über dem Feld | immer | AC-13, AC-20 |
| Pfeil | `#0B0B0B` (`color-ink`), auch fokussiert | Ruhe/Fokus | `_mt-select.scss` |
| Einfachauswahl | kein Häkchen (`hideSingleSelectionIndicator: true`) | gewählt | Provider |
| Optionsliste | Kartenfläche: weiß, ohne Rand, Radius 0, Schatten `0 5px 25px 0 rgba(19,19,19,0.1)` | offen | AC-19, AC-01 |
| Option | 15 px Light, Text `#000000` | Ruhe | AC-19 |
| Option unter dem Mauszeiger / Fokus | `#EFF0F4` (`color-hover`) | Hover, Fokus | AC-19 |
| Gewählte Option | `#C6D4DD` (`color-selected`), Text `#000000` | gewählt | AC-19 |
| Mehrfach-Häkchen | unselected Rand `#747474`, gewählt `#131313` mit weißem Haken (wie [choice-controls](choice-controls.md) Checkbox) | Multi-Panel | `_mt-select-multi.scss` |
| Autocomplete-Panel | weiß, Radius 0, Schatten wie Karte | offen | AC-19, `_mt-autocomplete.scss` |
| Auswahl-Chip (Tag) | Hintergrund `#285172` (`color-accent`), Schrift weiß, 13 px bold, Radius 2 px, kein Rand, Entfernen-Icon weiß | Chip | AC-21 |

## Aufbau (intern)

Provider-Voreinstellungen setzen die Overlay-Klasse (Panels leben im Overlay-Container, nicht im Feld):

```ts
// mt-select.directive.ts
export const MT_SELECT_CONFIG: MatSelectConfig = {
  overlayPanelClass: 'mt-select-panel',
  hideSingleSelectionIndicator: true,
};
// mt-select-multi.directive.ts
export const MT_SELECT_MULTI_CONFIG: MatSelectConfig = {
  ...MT_SELECT_CONFIG,
  overlayPanelClass: ['mt-select-panel', 'mt-select-multi-panel'],
};
// mt-autocomplete.directive.ts
export const MT_AUTOCOMPLETE_DEFAULTS: MatAutocompleteDefaultOptions = {
  overlayPanelClass: 'mt-autocomplete-panel',
};
```

`mtSelectMulti` stellt zusätzlich einen eigenen `MAT_SELECT_CONFIG`-Provider bereit, der den Provider der eingeschlossenen Basis überschreibt (Spec `providers_OpenSelect_AddsMultiPanelClassToOverlay`). `mtAutocompleteMulti` hat keinen eigenen Provider.

| Partial | Selektor und Inhalt |
|---|---|
| `_mt-select.scss` | `.mt-select`: `mat.select-overrides` (Trigger-Schrift 15 px/300, Zeilenhöhe 1.125rem, Farben, Pfeil); `&.mat-mdc-select { display: flex }` (keine Grundlinien-Lücke); `.mat-mdc-select-trigger, .mat-mdc-select-arrow-wrapper { height: 1.125rem }`; `.mat-mdc-select-placeholder` 13 px bold uppercase. `.mt-select-panel .mat-mdc-select-panel` erbt die Fläche per `@extend %surface` (`@use 'mt-surface'`). |
| `_mt-select-multi.scss` | `.mt-select-multi-panel`: `mat.pseudo-checkbox-overrides` (Rand, gewählt, Haken) |
| `_mt-option.scss` | `.mt-option.mat-mdc-option`: `mat.option-overrides` (Label-, Hover-, Fokus-, Selected-Layer) |
| `_mt-autocomplete.scss` | `.mt-autocomplete-panel`: `mat.autocomplete-overrides` (Hintergrund, Radius, Schatten) |
| `_mt-autocomplete-multi.scss` | `.mat-mdc-form-field:has(.mt-autocomplete-multi)`: `mat.chips-overrides` (Chip-Farbe, Schrift, Radius `radius-tag`, `outline-width: 0`, Trailing-Icon) |

Das Chip-Element `mat-chip-row` trägt keine mt-Direktive (kein `mtTag`); die Tag-Optik kommt allein über die Chip-Overrides am Container. Index-Reihenfolge: `mt-select`, `mt-select-multi`, `mt-option`, `mt-autocomplete`, `mt-autocomplete-multi`, danach `mt-datepicker` (`styles/mt/forms/_index.scss`).

## Hüllen-Komponenten

Pfad `src/frontend/src/app/components/common/`. Gemeinsame Regeln: [field](field.md).

| Hülle | Eingaben | Ausgaben | Verhalten |
|---|---|---|---|
| `app-atlas-form-select` | `label`, `multiple`, `control`, `placeholder`, `options` (`SelectOption { key, displayText }`), `clearable`, `subscriptSizing`, `readOnly`, `value` (Setter) | `valueChange`, `cleared` | `mat-select matInput mtSelect mtInputAction`, `mat-option mtOption`; Löschen-Button bei `clearable` und Wert != null; Disabled blendet den Pfeil aus; `multiple` ist in keinem Aufrufer gesetzt (sonst nur `mtSelect`, nicht `mtSelectMulti`) |
| `app-atlas-form-multi-select` | `label`, `unit`, `control`, `placeholder`, `options`, `clearable`, `subscriptSizing`, `opticsGrouping`, `selectAllLabel`, `value` | `valueChange`, `cleared` | Normalfall `mat-select mtSelectMulti mtInputAction multiple`; Schnellwahl-Link `selectAllLabel` über dem Feld; `opticsGrouping`: schreibgeschützter `input matInput mtInput mtInputAction` als Auslöser (`.atlas-optics-trigger-input`, von `mtReadonly` ausgenommen) mit CDK-Overlay-Panel (`mtSurface`, Gruppen „Fixed optics"/„Scanner optics", `mtCheckbox` je Gruppe/Option), Pfeil-Icon in `color-hint` |
| `app-atlas-form-autocomplete` | `label`, `value`, `options` (string[]), `clearable`, `subscriptSizing` (Signals) | `valueChange`, `cleared` | `input matInput mtAutocomplete mtInputAction`, Löschen-Button (Icon `close`) |
| `app-atlas-form-multi-autocomplete` | `label`, `control`, `placeholder`, `options`, `subscriptSizing`, `emptyArrayWhenCleared`, `readOnly` | `valueChange` | `mat-chip-grid` + `input mtAutocompleteMulti` (kein `matInput`), `mat-error mtError` bei `required`; Eingabe-Padding `2px 6px` in der Hülle (Layout) |

## Tests

| Art | Ort |
|---|---|
| Unit | `mt-select.directive.spec.ts` (Klasse, Overlay-Klasse `mt-select-panel`), `mt-select-multi.directive.spec.ts` (Klasse, Basisklasse, Overlay mit Multi-Klasse), `mt-option`, `mt-autocomplete.directive.spec.ts` (Klasse, Overlay `mt-autocomplete-panel`), `mt-autocomplete-multi.directive.spec.ts` (Klasse, Basisklasse) |
| Hüllen | `atlas-form-select`, `-multi-select` (+ `optics-grouping.util.spec.ts`), `-autocomplete`, `-multi-autocomplete` `.component.spec.ts` (keine Optik-Eingaben, Verhalten) |
| Browser | `e2e/tests/mt-targets.spec.ts` misst am `mat-select` des Such-Wizard-Felds „Machine" Wertgröße 15 px und Gewicht 300 |
| Messliste | `e2e/mt-messliste.md`: AC-19 (Such-Wizard „Machine" geöffnet: Fläche, Hover, gewählt), AC-20 Auswahlfeld (44 px, Label/Platzhalter, Wert), AC-21 Auswahl-Chip („Ownership") |
| Lint | `mt/require-directive` (`mat-select`, `mat-option`, `matChipInputFor`), `mt/no-redundant-base` |

## Abweichungen ggü. Spec/Plan

- AC-19 nennt für die Optionsliste eines Datumsfelds die gewählte Option `#C6D4DD`. Im Code ist im Kalender-Panel die gewählte Datumszelle `#285172` (`color-accent`), Hover `#EFF0F4` (siehe [range-and-datepicker](range-and-datepicker.md)); der Plan hat das so entworfen, das Ledger hält keine Begründung fest. `#C6D4DD` gilt für `mat-option`.
- AC-21 spricht von „Mehrfachauswahl-Feld"; der Tag-Chip existiert nur in der Chip-Eingabe (`mtAutocompleteMulti`). `mat-select multiple` zeigt gewählte Werte als Text, nicht als Chips.

## Offene Punkte

- Task 11 (zurückgestellt): Selektoren-Wirkung teils im Bestand-Markup unverifiziert; für diese Seite: Panel-Selektor `.mt-select-panel .mat-mdc-select-panel` und `mat.chips-overrides` nur über Browser-Test und Messliste gedeckt.
- Final: Icon-Buttons in `mat-option` (`.task-option-copy/-delete`, `setup-page`, 24 px) weichen von AC-07 ab, Ausnahme „Aktion in Option" liegt beim Menschen.
- Final: Messliste (`e2e/mt-messliste.md`) und Sichtabnahme gegen die Referenzbilder stehen aus; AC-19 bis AC-21 nur dort gedeckt.
- Task 17 (außerhalb Scope): rohe px im Multi-Select-SCSS (`max-height 320px`, `padding 8px` am Optics-Panel).
- Final: Bundle 30,97 kB, 589 B bis Fehlergrenze.

## Ändern: Checkliste

1. Farben der Option: Tokens `color-hover`, `color-selected` in `_mt-tokens.scss`; Option-Zustände nur in `_mt-option.scss` über `mat.option-overrides`.
2. Neue Overlay-Klasse: in `MT_SELECT_CONFIG` / `MT_AUTOCOMPLETE_DEFAULTS` ergänzen und Spec für die Overlay-Klasse mitziehen; `mtSelectMulti` kopiert die Basis per Spread, bei Änderung beide prüfen.
3. Panel-Fläche nur über `@extend %surface` aus `mt-surface`, nicht neu bauen.
4. Hüllen ohne Optik-Eingaben halten; `unit` als `mtUnit` im Label.
5. Partial höchstens 2 kB; globales Bundle nicht über Budget heben.
6. Specs, Browser-Test, Messliste nachziehen. **Diese Referenzseite im selben Zug korrigieren.**
