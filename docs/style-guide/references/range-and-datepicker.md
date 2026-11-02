# Bereichsfeld und Datumsfeld
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> `mtRange` für die Min/Max-Bereichseingaben und `mtDatepicker` für Datumsfelder samt Kalender-Panel; beide sitzen als Control in einem [Formularfeld](field.md).

## Überblick

| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtRange]` | `mt-range` | Basis (Marker am Control, ohne eigenes CSS) | `div` mit `atlasNumberRangeControl` bzw. `atlasNomNumberRangeControl` (eigenes `MatFormFieldControl`) | `mt-range.directive.ts` |
| `[mtDatepicker]` | `mt-datepicker` | Basis | `input matInput` mit `matDatepicker` | `mt-datepicker.directive.ts`, `_mt-datepicker.scss` |
| `.mat-datepicker-content` | - | globale Material-Klasse ohne Direktive (Kalender-Panel) | Overlay | `_mt-datepicker.scss` |

Pfade: `src/frontend/src/app/util/directives/`, `src/frontend/src/styles/mt/`. Modell: [directive-model](directive-model.md).

## Verwendung

```html
<!-- atlas-form-minmaxinput.component.html (Auszug) -->
<mat-form-field mtField subscriptSizing="dynamic">
  <mat-label mtLabel>{{ label() }}@if (unit()) {<span mtUnit> ({{ unit() }})</span>}</mat-label>
  <div class="custom-input-range-wrapper" mtRange mtInputAction atlasNumberRangeControl ...>
    <input class="number-range-input" type="number" ... />
    <span class="number-range-separator" aria-hidden="true">–</span>
    <input class="number-range-input" type="number" ... />
  </div>
</mat-form-field>
```

```html
<!-- features/tools/components/activity-overview-filter/activity-overview-filter.component.html -->
<mat-form-field mtField>
  <mat-label mtLabel>Created von</mat-label>
  <input mtDatepicker matInput [matDatepicker]="pickerFrom" formControlName="createdFrom" />
  <mat-datepicker-toggle matSuffix [for]="pickerFrom"></mat-datepicker-toggle>
  <mat-datepicker #pickerFrom></mat-datepicker>
</mat-form-field>
```

Verwendungsstellen: `mtRange` nur in den beiden Min/Max-Hüllen (siehe [input](input.md)); `mtDatepicker` nur im Aktivitäten-Filter (`activity-overview-filter`, Felder „Created von/bis"; „Created bis" trägt zusätzlich `mtInputAction` mit Löschen-Button).

| Fehler | Folge |
|---|---|
| `<input matInput>` mit `matDatepicker` ohne `mtDatepicker` (oder anderer Control-Direktive) | `mt/require-directive` (Liste `mtInput \| mtInputNumeric \| mtDatepicker \| mtAutocomplete`) |
| `mtRange` an einem Control ohne umgebendes `mtField` | Rahmen/Höhe fehlen, Lint meldet es nicht |
| Eigene Panel-Klasse am Datepicker zur Optik | unnötig; Panel-Optik kommt global |

## Zielwerte

| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Bereichs-Eingabetext (alle `input` im Control) | 15 px, Light 300, `#000000`, Roboto | Ruhe | AC-12 (wie `mt-input`), geerbt vom `mt-field`-Container |
| Bereichsfeld Rahmen/Höhe/Label | wie Formularfeld, siehe [field](field.md) | | AC-12 bis AC-14 |
| Trenner zwischen den Bereichsfeldern | `var(--mt-color-hint)` (`#8C8C8C`), Padding 0 8 px (Nom/Min/Max: 0 6 px, `:` fett mit 0 8 px) | Ruhe | `_atlas-custom-range-field.scss` (Layout der Hülle) |
| Datumstext | 15 px, Light 300 | Ruhe | AC-12, `_mt-datepicker.scss` |
| Kalender-Fläche | weiß, Radius 0, Schatten `0 5px 25px 0 rgba(19,19,19,0.1)` | offen | AC-19, AC-01 |
| Kalender gewähltes Datum | `#285172` (`color-accent`) | gewählt | `_mt-datepicker.scss` (siehe Abweichungen) |
| Kalender Datum unter dem Mauszeiger | `#EFF0F4` (`color-hover`) | Hover | AC-19 |

## Aufbau (intern)

Beide Direktiven setzen nur ihre Klasse, kein Provider.

`mt-range` hat kein eigenes CSS (Workitem 314470): Die Wrapper-Inputs in der Hülle erben Schrift und Farbe per `font: inherit; color: inherit` (Mixin `range-wrapper` in `components/common/_atlas-custom-range-field.scss`) vom `mt-field`-Container. Eine `.mt-range input`-Regel würde von diesem Mixin ohnehin überschrieben.

`mt-datepicker` setzt nur Schriftgröße und -gewicht am `input`; der Rest kommt vom `mt-field`-Container. Das Kalender-Panel hat am Feld keinen Haken für eine Klasse und wird deshalb global gestaltet:

```scss
// styles/mt/forms/_mt-datepicker.scss
.mat-datepicker-content {
  @include mat.datepicker-overrides((
    calendar-container-background-color: t.v(color-surface),
    calendar-container-shape: t.v(radius-none),
    calendar-container-elevation-shadow: t.v(shadow-surface),
    calendar-date-selected-state-background-color: t.v(color-accent),
    calendar-date-hover-state-background-color: t.v(color-hover),
  ));
}
```

Begründung (Kommentar im Partial): `matDatepicker` bietet keinen Provider für eine Panel-Klasse wie Select/Autocomplete; der globale Selektor trifft damit jedes Kalender-Panel der App, auch solche ohne `mtDatepicker`. Stylelint (Komponenten-Regeln) greift unter `src/styles/` nicht.

Bezug zu den Min/Max-Hüllen: `mtRange` und `mtInputAction` stehen beide am selben `div` (Querschnitt kombiniert, AC-57); `mtInputAction` wirkt über den Feld-Container und das `matSuffix`-Löschen-Icon (siehe [input](input.md)). Der Bereichsinhalt ist bei leerem, unfokussiertem Control per `custom-input-range-wrapper--hidden` (Deckkraft 0) ausgeblendet, es erscheint der Platzhalter des Controls (`min – max` bzw. `norm : min - max`); Label steht dauerhaft oben (`floatLabel: 'always'`).

## Hüllen-Komponenten

`app-atlas-form-minmaxinput` und `app-atlas-form-nomminmaxinput`: Eingaben, Ausgaben und Verhalten in [input](input.md). Das Datumsfeld hat keine Hülle (Template-Direktiven direkt im Aktivitäten-Filter).

## Tests

| Art | Ort |
|---|---|
| Unit | `mt-range.directive.spec.ts`, `mt-datepicker.directive.spec.ts` (Klasse); Hüllen-Specs der Min/Max-Hüllen (`atlas-form-minmaxinput`, `-nomminmaxinput`), `atlas-number-range-control.directive.spec.ts` |
| Browser | kein eigener Test |
| Messliste | AC-16 (Aktivitäten-Filter „Source" mit Wert); Bereichs- und Kalender-Optik nicht als eigene Zeile |
| Lint/Stylelint | `mt/require-directive` für `matInput`; Partial höchstens 2 kB |

## Abweichungen ggü. Spec/Plan

- AC-19 (Kalender als Optionsliste: gewählt `#C6D4DD`): Code setzt im Kalender das gewählte Datum auf `#285172` (`color-accent`), nicht `#C6D4DD`; Fläche und Hover entsprechen AC-19. Plan-Entwurf (Task 8) enthält dieselbe Zeile; Ledger nennt keinen Grund.
- Globaler Selektor `.mat-datepicker-content` statt Direktiven-Klasse: Spec W · Partial je Direktive sagt, der Selektor sei die Klasse der Direktive; hier nicht möglich (siehe Aufbau). Ledger Task 8: „Brief-vorgegeben" (🟢).

## Offene Punkte

- Task 8 (zurückgestellt): globaler `.mat-datepicker-content`-Selektor, `_mt-range.scss` ohne Override-Mixin (beide Brief-vorgegeben).
- Kalender-Panel und Bereichsfeld nicht im Browser gemessen; Messliste/Sichtabnahme stehen aus.
- Ungemessen: `mtInputAction` am Datepicker-Feld wirkt auch auf den Kalender-Toggle-Button im selben Suffix.

## Ändern: Checkliste

1. Schrift des Eingabetexts: Tokens `font-size-md`, `font-weight-light`; `_mt-datepicker.scss`, `_mt-input.scss` konsistent halten.
2. Kalender-Farben nur in `_mt-datepicker.scss` über `mat.datepicker-overrides`; globalen Selektor nicht auf weitere Elemente ausweiten.
3. Neue Bereichs-Hülle: `mtRange` am Control-`div`, `mtField` am Container, `MT_DIRECTIVES` importieren.
4. Bundle-Budget beachten (rund 3 kB bis zur Warnung, 7,2 kB bis zum Fehler; [Bytes sparen](enforcement.md#bytes-sparen-was-nicht-ins-css-gehört)), Partial höchstens 2 kB.
5. Specs und Messliste nachziehen. **Diese Referenzseite im selben Zug korrigieren.**
