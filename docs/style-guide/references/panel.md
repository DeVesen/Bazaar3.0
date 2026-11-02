# Panel (mtPanel, mtPanelHeader, atlas-panel)
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> Aufklappbares Panel auf Basis von `mat-expansion-panel` in Kartenoptik; `app-atlas-panel` ist die Hülle, die beide Direktiven setzt und Kopf-Aktionen projiziert.

## Überblick
| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtPanel]` | `mt-panel` | Basis (kein `mtSurface`; eigene Material-Overrides mit den gleichen Tokens) | `mat-expansion-panel` | `util/directives/mt-panel.directive.ts`, `styles/mt/cards/_mt-panel.scss` |
| `[mtPanelHeader]` | `mt-panel-header` | Verfeinerung | `mat-expansion-panel-header` | `mt-panel-header.directive.ts`, `_mt-panel-header.scss` |
| `app-atlas-panel` | `atlas-panel` | Hülle | wo ein Panel mit Titel und Kopf-Aktionen gebraucht wird | `src/app/components/common/atlas-panel/` |

Direktiven unter `src/frontend/src/app/util/directives/`, Partials unter `src/frontend/src/styles/mt/`. 13 Templates nutzen `mtPanel` oder `app-atlas-panel` (Experiment-Wizard, Such-Wizard, Tools).

## Verwendung
```html
<!-- Hülle (Normalfall); Aktionen im Kopf wie in search-wizard.component.html -->
<app-atlas-panel header="Materials" [collapsible]="true" [expanded]="true" [headerActionsAlignEnd]="true">
  <button mtButtonIcon mtButtonText atlas-panel-actions matIconButton class="panel-header-btn">…</button>
  Inhalt
</app-atlas-panel>
```
Direkt (ohne Hülle) müssen beide Direktiven zusammen stehen: `<mat-expansion-panel mtPanel>` mit `<mat-expansion-panel-header mtPanelHeader>`. Fehlt eine, meldet ESLint (Zuordnung `mat-expansion-panel` -> `mtPanel`, `mat-expansion-panel-header` -> `mtPanelHeader`, siehe [enforcement](enforcement.md)).
Buttons im Kopf: Direktiven nach [button](button.md); ein Klick im Kopf-Slot klappt das Panel nicht auf oder zu (`stopPropagation` am Host-Span der Hülle).

## Zielwerte
| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Fläche | wie Karte: #FFFFFF, rahmenlos, Radius 0, Schatten `0 5px 25px 0 rgba(19,19,19,0.1)` | immer | `_mt-panel.scss` (`color-surface`, `radius-none`, `shadow-surface`), [surface-and-card](surface-and-card.md), AC-01 |
| Inhaltsschrift | 16 px, Light, Farbe `color-text` | immer | `_mt-panel.scss` |
| Kopfzeile Höhe | 44 px (`control-height`; kompakt 32 px) | zu und offen | `_mt-panel-header.scss` |
| Kopfschrift | fett, 13 px, Versalien | immer | `_mt-panel-header.scss` (`font-size-sm`, `font-weight-bold`, `text-transform: uppercase`) |
| Kopf-Hover | Fläche #EFF0F4 (`color-hover`) | Maus darüber | `header-hover-state-layer-color` |
| Indikator | Farbe `color-ink` | immer | `header-indicator-color` |
| Deaktivierter Kopf | Schriftfarbe bleibt `color-text`, keine Abdunklung | `collapsible=false` | `header-disabled-state-text-color`, `atlas-panel.component.scss` (`opacity: 1`) |
| Kopf-Innenabstand (Hülle) | `0 12px 0 13px` | immer | `atlas-panel.component.scss` |
| Körper-Innenabstand (Hülle) | 16 px | immer | `atlas-panel.component.scss` |

Die Spec nennt für das Panel keinen eigenen AC-Wert; die Fläche folgt AC-01.

## Aufbau (intern)
```scss
// src/styles/mt/cards/_mt-panel.scss
.mt-panel.mat-expansion-panel {
  @include mat.expansion-overrides((
    container-background-color: t.v(color-surface),
    container-shape: t.v(radius-none),
    container-elevation-shadow: t.v(shadow-surface),
    ...
```
- Panel und Kopf überschreiben Material-Tokens über `mat.expansion-overrides`; der Selektor `.mt-panel.mat-expansion-panel` erhöht die Spezifität. Der Kopf setzt `header-collapsed-state-height` und `header-expanded-state-height` auf `t.v(control-height)`; die Kompakt-Stufe verkleinert den Token-Wert ([compact-and-unit](compact-and-unit.md)).
- Tokens: `--mt-color-surface`, `-radius-none`, `-shadow-surface`, `-font-size-base|sm`, `-font-weight-light|bold`, `-color-text`, `-color-ink`, `-color-hover`, `-control-height` ([tokens](tokens.md)).

## Hüllen-Komponenten
`AtlasPanelComponent` (`app-atlas-panel`, Host-Klasse `atlas-panel`, OnPush, importiert `MT_DIRECTIVES` und `MatExpansionModule`).
| Ein-/Ausgabe | Typ, Standard | Wirkung |
|---|---|---|
| `header` | `string` | Titel in `mat-panel-title` |
| `headerActionsAlignEnd` | `boolean`, false | projizierte `[atlas-panel-actions]` rechts im Kopf vor dem Indikator; setzt Host-Klasse `atlas-panel--header-actions-end` |
| `collapsible` | `boolean`, false | false: immer offen, Kopf deaktiviert (`disabled`), Indikator versteckt (`hideToggle`) |
| `expanded` | `boolean`, false | nur bei `collapsible=true`: Startzustand |
| `closed` | Ausgabe `void` | beim Schließen (nur bei `collapsible=true`) |

Entfallen sind alle Optik-Eingaben der früheren Hülle; der Spec-Test `inputs_AfterMigration_HaveNoOpticInputs` erzwingt genau diese 4 Eingaben. Fläche, Kopfzeile und Schrift kommen aus den Direktiven; das Stylesheet der Hülle enthält nur Abstände und Anordnung (per `::ng-deep` auf Material-Klassen).

## Tests
- Unit: `mt-panel.directive.spec.ts`, `mt-panel-header.directive.spec.ts`, `atlas-panel.component.spec.ts` (Klassen, Disabled/Expanded, Titel, Eingaben).
- Browser/Handliste: keine eigene Zeile für das Panel in `e2e/tests/mt-targets.spec.ts` oder `e2e/mt-messliste.md`.
- Lint: ESLint-Zuordnung wie oben; Stylelint für `src/styles/mt/**/*.scss`.

## Abweichungen ggü. Spec/Plan
Keine festgestellt.

## Offene Punkte
- Task 18: `eslint --max-warnings 0` meldet 2 Bestandswarnungen am `<span class="atlas-panel-actions-host" (click)="$event.stopPropagation()">` in `atlas-panel.component.html` (Markup stammt aus dem Plan, war vorher schon so).
- Task 18: Kommentar-Sprachmischung in `atlas-panel.component.scss` (zurückgestellt, kosmetisch).
- Task 27 / Final-Review: `.panel-header-btn` im Such-Wizard (7 Stellen; `search-strategie/styles/search-wizard-sections.scss` hält nur noch `padding: 0; padding-top: 2px`) hat keine Kompakt-Ausnahme; Breite/Höhe/Zeilenhöhe/Farbe entfielen, der Button bleibt 44 px (AC-07). Such-Wizard-Panel-Köpfe wirken dadurch größer; Überlauf in der Kopfzeile ist im Browser nicht geprüft. Entscheid über eine Kompakt-Ausnahme liegt beim Menschen.

## Ändern: Checkliste
1. Optik nur über `_mt-panel.scss` / `_mt-panel-header.scss` und Tokens ändern; keine Optik-Eingaben an der Hülle wieder einführen.
2. Anordnung (Abstände, Aktionen-Slot) bleibt im Stylesheet der Hülle; Material-Klassen nur per `::ng-deep` dort.
3. `atlas-panel.component.spec.ts` (Eingaben-Zählung) anpassen, falls Eingaben dazukommen.
4. Kein `!important` ohne Kommentar; Budget nicht anheben.
5. **Diese Referenzseite im selben Zug korrigieren.**
