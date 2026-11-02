# Eingabe-Controls
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> Einzeilige, mehrzeilige und numerische Eingaben (`matInput`) samt Aktion im Feld und den Hüllen `atlas-form-input`, `-textarea`, `-minmaxinput`, `-nomminmaxinput`; sitzen immer in einem [Formularfeld](field.md).

## Überblick

| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtInput]` | `mt-input` | Basis | `input matInput` (text, email, tel, time) | `mt-input.directive.ts`, `styles/mt/forms/_mt-input.scss` |
| `[mtInputNumeric]` | `mt-input-numeric` (+ `mt-input`) | Verfeinerung, schließt `mtInput` per `hostDirectives` ein | `input matInput type="number"` | `mt-input-numeric.directive.ts`, `_mt-input-numeric.scss` |
| `[mtTextarea]` | `mt-textarea` | Basis | `textarea matInput` | `mt-textarea.directive.ts`, `_mt-textarea.scss` |
| `[mtInputAction]` | `mt-input-action` | Querschnitt (ohne Basis, mit jeder Verfeinerung kombinierbar) | Control, dessen Feld eine Suffix-Aktion trägt | `mt-input-action.directive.ts`, `_mt-input-action.scss` |

Pfade: `src/frontend/src/app/util/directives/` und `src/frontend/src/styles/mt/`. Modell (Basis, Verfeinerung, Querschnitt): [directive-model](directive-model.md). Container: [field](field.md). Bereichsfelder (Min/Max): [range-and-datepicker](range-and-datepicker.md).

## Verwendung

```html
<!-- Text: Basis -->
<input mtInput matInput formControlName="createdFromTime" type="time" />

<!-- Zahl: nur die Verfeinerung, nie zusätzlich mtInput (Lint: no-redundant-base) -->
<input mtInputNumeric matInput type="number" [(ngModel)]="modelObj[field.modelKey]" />

<!-- Mehrzeilig -->
<textarea matInput mtTextarea [formControl]="control!"></textarea>

<!-- Aktion im Feld: Querschnitt zusätzlich am Control, Button als matSuffix -->
<input matInput mtInput mtInputAction [formControl]="effectiveControl" />
<button matIconButton mtButtonIcon mtButtonText matSuffix type="button" (click)="onClear()">
  <mat-icon>clear</mat-icon>
</button>
```
(Auszüge aus `dynamic-input-panel`, `atlas-form-textarea`, `atlas-form-input`.)

Kombination Verfeinerung + Querschnitt: `<input type="number" mtInputNumeric mtInputAction />` trägt `mt-input-action`, `mt-input-numeric` und `mt-input` und läuft ohne Laufzeitfehler (AC-57, Test in `mt-input-action.directive.spec.ts`).

| Fehler | Meldung / Folge |
|---|---|
| `<input matInput>` ohne `mtInput \| mtInputNumeric \| mtDatepicker \| mtAutocomplete` | `mt/require-directive` |
| `<textarea matInput>` ohne `mtTextarea` | `mt/require-directive` |
| `mtInputNumeric` zusammen mit `mtInput` | `mtInputNumeric schließt mtInput bereits ein; mtInput entfernen.` (`mt/no-redundant-base`, AC-37) |
| `mtInputAction` ohne Suffix-Icon im Feld | wirkungslos (Selektor verlangt `.mat-mdc-form-field-icon-suffix`) |
| Komponente ohne `MT_DIRECTIVES`-Import | Attribute werden ignoriert, keine Optik |

## Zielwerte

| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Eingabetext | 15 px (`font-size-md`), Light 300, `#000000`, Roboto | Ruhe | AC-12, `_mt-input.scss`, `_mt-textarea.scss` |
| Feld (Höhe, Rand, Hintergrund, Innenabstand, Platzhalter) | siehe [field](field.md) | | AC-12, AC-14 |
| Zahlenfeld | wie `mt-input`, Ziffern gleich breit (`font-variant-numeric: tabular-nums`); Feld 44 px, Rand 1 px `#747474`, Label oben | Ruhe | AC-36 (Messliste: Setup-Seite „Nominal Power (W)") |
| Textarea | wie `mt-input`, vertikal ziehbar (`resize: vertical` aus Materials `.mat-mdc-form-field-textarea-control`) | Ruhe | `_mt-textarea.scss` |
| Aktion im Feld | Icon 16 px (Button 16 x 16, `padding: 0`, Icon `font-size: 1rem`), rechts 16 px Abstand zum Rand (`padding-right: 1rem` am Suffix, Innenabstand rechts des Feldes 0); nur solange die Aktion angezeigt wird | Aktion sichtbar | AC-16 |

## Aufbau (intern)

Die Basis-Direktiven setzen nur ihre Klasse (kein Provider):

```ts
// mt-input-numeric.directive.ts
@Directive({
  selector: '[mtInputNumeric]',
  host: { class: 'mt-input-numeric' },
  hostDirectives: [MtInputDirective],
})
```

| Partial | Inhalt |
|---|---|
| `_mt-input.scss` | `.mt-input { font-family, font-size-md, font-weight-light, color-text }` (Tokens `t.v(...)`) |
| `_mt-input-numeric.scss` | `.mt-input-numeric { font-variant-numeric: tabular-nums }` |
| `_mt-textarea.scss` | wie `mt-input` (`resize` liefert Material) |
| `_mt-input-action.scss` | `.mat-mdc-form-field:has(.mt-input-action):has(.mat-mdc-form-field-icon-suffix)`: `.mdc-text-field--outlined { padding-right: 0 }`; `.mat-mdc-form-field-icon-suffix { padding-right: 1rem }` mit `.mat-mdc-icon-button` 1rem x 1rem und `.mat-icon` 1rem |

Die Querschnitts-Wirkung sitzt am Feld-Container (`:has`), die Direktive nur als Marker am Control. Der Selektor trifft jeden `mat-mdc-icon-button` im Suffix, also auch einen Datepicker-Toggle im selben Suffix (ungemessen).

## Hüllen-Komponenten

Pfad `src/frontend/src/app/components/common/`. Gemeinsame Regeln (Wegfall `appearance`/`cssClass`/`fieldsetStyle`, `unit`, Layout-Klasse am Host, Readonly): [field](field.md). Alle Hüllen verlieren die Optik-Eingaben (Test `inputs_AfterMigration_HaveNoOpticInputs`).

| Hülle | Eingaben | Ausgaben | Verhalten |
|---|---|---|---|
| `app-atlas-form-input` | `label`, `unit`, `type` (`text`\|`email`\|`tel`), `control`, `placeholder`, `clearable`, `readOnly`, `subscriptSizing` | `valueChange`, `cleared` | `mtField` + `mtLabel` (+ `mtUnit`), `input matInput mtInput mtInputAction`; ohne `control` internes `FormControl`; Löschen-Button (`matIconButton mtButtonIcon mtButtonText matSuffix`, Icon `clear`) nur bei `clearable` und gefülltem Wert, `onClear` setzt `''` und emittiert `cleared`; `serverError` wird beim nächsten Wert entfernt |
| `app-atlas-form-textarea` | `label`, `type`, `control` (Pflicht), `placeholder`, `subscriptSizing`, `readOnly` | `valueChange` | `textarea matInput mtTextarea`, kein `unit`, keine Löschen-Aktion; Layout-Höhe `textarea { height: 14rem }` in der Hülle |
| `app-atlas-form-minmaxinput` | `label` (Pflicht), `unit`, `min`, `max` (Platzhaltertexte, Default `min`/`max`), `minValue`, `maxValue`, `clearable`, `disabled`, `hasError`, `hint`, `errorMessage` | `minValueChanged`, `maxValueChanged`, `cleared` | `div mtRange mtInputAction atlasNumberRangeControl` mit zwei `input type=number`, Trenner „–"; Bereichsinhalt sichtbar nur bei Fokus oder Wert (`custom-input-range-wrapper--hidden`: Deckkraft 0), sonst Platzhalter `min – max` des Controls; Fehlerzustand nur `hasError && touched`; `mat-hint mtHint`, `mat-error mtError` |
| `app-atlas-form-nomminmaxinput` | `label` (Pflicht), `unit`, `tolerance` (Pflicht, in %), `nomValue`, `minValue`, `maxValue`, `clearable`, `hasError` | `nomValueChanged`, `minValueChanged`, `maxValueChanged`, `cleared` | wie Min/Max mit drei Feldern `norm : min - max`; Änderung von `nom` berechnet `min`/`max` = `nom -/+ nom * tolerance / 100`, gerundet auf 2 Nachkommastellen; `nom` leer leert `min` und `max`; kein `hint`, kein `disabled` |

Die beiden Min/Max-Hüllen teilen die Shell-Mixins in `_atlas-custom-range-field.scss` (`shell-host`, `range-wrapper`, `range-separators`; nur Layout, Trenner mit `var(--mt-color-hint)`, Wrapper-Inputs ohne Rand/Hintergrund, `font: inherit`). Optik des Bereichs: [range-and-datepicker](range-and-datepicker.md).

## Tests

| Art | Ort |
|---|---|
| Unit | `mt-input.directive.spec.ts`, `mt-input-numeric.directive.spec.ts` (Klasse; `hostDirectives_OnlyRefinementInTemplate_AddsBaseClass`), `mt-textarea.directive.spec.ts`, `mt-input-action.directive.spec.ts` (Klasse; Kombination mit `mtInputNumeric`, AC-57) |
| Hüllen | `atlas-form-input`, `-textarea`, `-minmaxinput`, `-nomminmaxinput` `.component.spec.ts` (keine Optik-Eingaben, `unit` in `mtUnit`, Readonly-Hostklasse, Verhalten) |
| Browser | `e2e/tests/mt-targets.spec.ts` (Feldmaße, siehe [field](field.md)); Suchfeld füllt Host und 32 px in Kompakt (AC-61, AC-51) |
| Messliste | `e2e/mt-messliste.md`: AC-16 (Aktivitäten-Filter „Source": Icon 16 px, 16 px Abstand, Klick leert), AC-36 (Zahlenfeld Setup-Seite) |
| Lint | `mt/require-directive` (`matInput` an `input`/`textarea`), `mt/no-redundant-base` (`mtInputNumeric` + `mtInput`) |

## Abweichungen ggü. Spec/Plan

- `mt-input-numeric` setzt zusätzlich `tabular-nums`; die Spec nennt nur die Klasse von `mt-input` (AC-36). Keine Gegenrede im Ledger.
- Sonst keine.

## Offene Punkte

- Task 17 (außerhalb Scope): rohe px-Werte (Layout) in `atlas-form-multi-select`- und `atlas-form-nomminmaxinput`-SCSS (`.nom-range-separator` padding 6/8 px).
- Task 18/Final: Optik im Browser nicht gegen Referenzbilder abgenommen; AC-16 und AC-36 nur über die Messliste (leer, nicht ausgefüllt).
- Task 27 (Final): Bausteinhöhen in Komponenten, z. B. `dynamic-input-panel` `min-height 56px`.
- Ungemessen: `mtInputAction` auf Datepicker-Toggle im selben Suffix.

## Ändern: Checkliste

1. Schrift des Eingabetexts: Token (`font-size-md`, `font-weight-light`) in `_mt-tokens.scss`, nicht in den drei Partials duplizieren; bei Änderung `_mt-input.scss`, `_mt-textarea.scss`, `_mt-datepicker.scss` gemeinsam prüfen.
2. Aktion im Feld: nur `_mt-input-action.scss`; Hüllen setzen `mtInputAction` immer, die Wirkung hängt am Suffix.
3. Neue Hülle: `MT_DIRECTIVES` importieren, `mtField`/`mtLabel` am Container, Control-Direktive, keine Optik-Eingaben, Spec `inputs_AfterMigration_HaveNoOpticInputs`.
4. Keine Literale in Hüllen-SCSS; kein `!important` ohne Grund; Budget des globalen Stylesheets nicht anheben (rund 3 kB bis zur Warnung, 7,2 kB bis zum Fehler; [Bytes sparen](enforcement.md#bytes-sparen-was-nicht-ins-css-gehört)).
5. Specs und Messliste nachziehen. **Diese Referenzseite im selben Zug korrigieren.**
