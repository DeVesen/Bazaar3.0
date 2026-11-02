# Auswahl-Controls: Checkbox, Radio, Schalter
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> `mtCheckbox`, `mtRadio` und `mtSwitch` gestalten `mat-checkbox`, `mat-radio-button` und `mat-slide-toggle`; sie stehen ohne Formularfeld-Container und haben keine Basis.

## Überblick

| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtCheckbox]` | `mt-checkbox` | Basis (ohne Verfeinerung) | `mat-checkbox` | `mt-checkbox.directive.ts`, `styles/mt/forms/_mt-checkbox.scss` |
| `[mtRadio]` | `mt-radio` | Basis | `mat-radio-button` | `mt-radio.directive.ts`, `_mt-radio.scss` |
| `[mtSwitch]` | `mt-switch` | Basis | `mat-slide-toggle` | `mt-switch.directive.ts`, `_mt-switch.scss` |
| `mat-button-toggle` | - | keine Direktive (Lücke) | `mat-button-toggle(-group)` | siehe Offene Punkte |

Pfade: `src/frontend/src/app/util/directives/`, `src/frontend/src/styles/mt/`. Modell: [directive-model](directive-model.md). Die Direktiven setzen nur die Klasse (kein Provider, kein `hostDirectives`).

## Verwendung

```html
<mat-checkbox mtCheckbox [checked]="accepted" (change)="accepted = $event.checked">  <!-- instructions-for-use -->
<mat-radio-button mtRadio value="all">Any</mat-radio-button>                          <!-- search-boolean-column-filter -->
<mat-slide-toggle mtSwitch [formControl]="effectiveControl" ...>{{ label }}</mat-slide-toggle>  <!-- atlas-form-slidetoggle -->
```

| Fehler | Meldung |
|---|---|
| `mat-checkbox` ohne `mtCheckbox`, `mat-radio-button` ohne `mtRadio`, `mat-slide-toggle` ohne `mtSwitch` | `mt/require-directive` (`mt-directive-map.json`, Elemente `mat-checkbox`, `mat-radio-button`, `mat-slide-toggle`) |
| `mat-button-toggle` ohne Direktive | kein Lint, keine Direktive (Lücke) |
| Komponente ohne `MT_DIRECTIVES`-Import | Attribute werden ignoriert |

Verwendungsstellen: Checkbox u. a. in Experiment anlegen, Setup/Parameter-Seite, Such-Wizard, Sales-Report-Dialog, `atlas-form-multi-select` (Optics-Panel); Radio in Experiment-Task, Result, Such-Wizard, Boolean-Spaltenfilter; Schalter über die Hülle `atlas-form-slidetoggle` (Material-Filter „fixed Sequence", Materialsektion).

## Zielwerte

| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Checkbox Größe | 20 x 20 px (`1.25rem`), Rand 1 px, Radius 2 px (`radius-tag`) | Ruhe | AC-20 |
| Checkbox Rand | `#747474` (`color-border`); Hover/Fokus `#0B0B0B` (`color-ink`) | ungewählt | AC-20, Partial |
| Checkbox gewählt | Fläche `#131313` (`color-ink-strong`), Haken weiß (`color-on-accent`) | gewählt (auch Hover/Fokus/Pressed) | AC-20 |
| Radio Größe | 20 px (Material-Standard, nicht überschrieben); Punkt 8 px: `scale(0.4)` am `.mdc-radio__inner-circle` | Ruhe/gewählt | AC-20 |
| Radio Farben | Rand `#747474`, Hover `#0B0B0B`; gewählt und Punkt `#131313` | ungewählt/gewählt | AC-20 |
| Schalter | 48 x 27 px (`track-width 3rem`, `track-height 1.6875rem`), kein Track-Rand, Icons im Griff ausgeblendet | Ruhe | AC-20 |
| Schalter Farbe | an `#BBD03A` (`color-primary`), aus `#C4C4C4` (`color-switch-off`), Griff `#FFFFFF` (`color-surface`) in allen Zuständen | an/aus | AC-20 |
| Label (Checkbox, Radio) | Farbe `#000000` (`color-text`) | Ruhe | Partial |

## Aufbau (intern)

Alle drei Partials nutzen nur Material-Override-Mixins plus je eine CSS-Regel, wo es keinen Override gibt:

| Partial | Mixin | Eigenes CSS |
|---|---|---|
| `_mt-checkbox.scss` | `mat.checkbox-overrides` (Icon-Farben, Haken, Label) | `.mdc-checkbox__background { width/height: 1.25rem; border-width: 1px; border-radius: radius-tag }` |
| `_mt-radio.scss` | `mat.radio-overrides` | `.mdc-radio__native-control:checked + .mdc-radio__background .mdc-radio__inner-circle { transform: scale(0.4) }` |
| `_mt-switch.scss` | `mat.slide-toggle-overrides` (Track-Maße, Track-/Griff-Farben je Zustand) | `.mdc-switch__icons { display: none }` |

Die Pseudo-Checkbox der Mehrfachauswahl-Optionen (`mt-select-multi-panel`) nutzt dieselben Token-Werte, ist aber ein eigener Partial ([select](select.md)).

Hülle `app-atlas-form-slidetoggle` (`src/frontend/src/app/components/common/atlas-form-slidetoggle/`):

| Eingaben | Ausgaben | Verhalten |
|---|---|---|
| `label`, `name`, `control` (Setter), `value` (Setter, normalisiert zu boolean) | `checkedChange` | Template `mat-slide-toggle mtSwitch [formControl]="effectiveControl" [attr.name]="name || null"`; ControlValueAccessor mit internem Control; Disabled über `setDisabledState`; keine Optik-Eingaben (Test `inputs_AfterMigration_HaveNoOpticInputs`); Host-SCSS nur `display: inline-flex; align-items: center` |

### Zustandsstile an eigener Klasse (aus Task 19 wiederhergestellt)

Der Style-Codemod (Task 19) entfernte Zustandsanzeigen; sie wurden per Fix-Runde über Tokens an der eigenen Zustandsklasse wiederhergestellt (Ledger Task 19, Urteil; Commit `8451a93d`). Beispiel für diese Seite: die gewählte Fugenart-Kachel im Such-Wizard. Dort ist `mat-checkbox` (`mtCheckbox`, Klasse `joint-type-checkbox`) die Kachel; das Kästchen ist ausgeblendet, die ganze Kachel ist Klickziel:

```scss
// features/search-strategie/components/search-wizard-task-section/search-wizard-task-section.component.scss
.joint-type-checkbox {
  ::ng-deep .mdc-checkbox { display: none; }
  .radio-container { border: 1px solid var(--mt-color-line); ... &:hover { border-color: var(--mt-color-accent); } }
  &.mat-mdc-checkbox-checked .radio-container {
    border-color: var(--mt-color-accent);
    background-color: var(--mt-color-selected);
  }
}
```

Regel: Zustandsfarben einer fachlichen Sonderfläche ohne Baustein dürfen als `var(--mt-…)` in der Komponente stehen (Spec, Soll-Vorgaben); Literale nicht (Stylelint). Ein Zustand wie `.mat-mdc-checkbox-checked` darf beim Aufräumen nie ersatzlos gestrichen werden.

## Tests

| Art | Ort |
|---|---|
| Unit | `mt-checkbox.directive.spec.ts`, `mt-radio.directive.spec.ts`, `mt-switch.directive.spec.ts` (Klasse am Host); `atlas-form-slidetoggle.component.spec.ts` (CVA, keine Optik-Eingaben) |
| Browser | kein automatischer Maß-Test |
| Messliste | `e2e/mt-messliste.md`: AC-20 Checkbox (Experiment anlegen: 20 x 20, `#747474`, 2 px), Radio (Experiment-Task: 20 px, Punkt 8 px `#131313`), Schalter (Material-Filter: 48 x 27, `#BBD03A`/`#C4C4C4`) |
| Codemod | `scripts/mt-migrate-styles.test.mjs` (Zustandserhalt, Task 19) |
| Lint | `mt/require-directive` |

## Abweichungen ggü. Spec/Plan

- Der Plan (Task 19) schrieb vor, Zustandsanzeigen im Codemod zu entfernen; das widerspricht der Spec (Funktionen/Seitenaufbau unverändert). Jetzt gilt: Zustandsstile bleiben über Tokens erhalten (Ledger Task 19, Urteil, plus Final-Fixwelle).
- Sonst keine.

## Offene Punkte

- `mat-button-toggle` (Score-Editor, Bewertungsgruppe `evaluation-toggle-group`, Sales-Report-Dialog) hat weder mt-Direktive noch Lint-Regel; Lücke in Spec und Plan, im Abschlussbericht gemeldet.
- Task 8/24 (zurückgestellt): Zielwerte Schalter/Checkbox/Radio erst über Messliste (Task 25) aufgenommen, im Browser nicht gemessen.
- Task 19 (zurückgestellt): Pflichtfeld-Markierung in `setup-page` schwächer als vorher (🟢).
- Final: Bundle 30,97 kB, 589 B bis zur Fehlergrenze; Partial-Ergänzungen vermeiden.

## Ändern: Checkliste

1. Maße und Farben: Tokens (`color-border`, `color-ink`, `color-ink-strong`, `color-on-accent`, `color-primary`, `color-switch-off`, `radius-tag`) in `_mt-tokens.scss`; Partial nur über Override-Mixins, eigenes CSS nur für Maße ohne Override.
2. Zustandsklassen in Komponenten (z. B. `.mat-mdc-checkbox-checked`) beim Bereinigen behalten.
3. Pseudo-Checkbox der Mehrfachauswahl ([select](select.md)) bei Checkbox-Änderungen mitprüfen.
4. Keine Literale in Komponenten, kein `!important` ohne Grund; Partial höchstens 2 kB.
5. Neue Direktive für `mat-button-toggle`: Direktive, Partial, `MT_DIRECTIVES`, Eintrag in `eslint-rules/mt-directive-map.json`, Spec, Messliste.
6. Specs und Messliste nachziehen. **Diese Referenzseite im selben Zug korrigieren.**
