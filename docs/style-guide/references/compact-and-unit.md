# Kompakt-Stufe und Einheit
Stand: Code-Stand Branch dev, Commit 31c0f0a8 plus Grid-Header-Farbe `#56788f` (ungecommittet) (2026-10-27)

> `mtCompact` setzt am Bereich die Bausteinhöhe aller mt-Buttons und -Felder darin von 44 px auf 32 px; `mtUnit` hält eine Einheit in ihrer ursprünglichen Schreibweise, auch wenn Label oder Header in Versalien stehen.

## Überblick

| Direktive/Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtCompact]` | `mt-compact` | Querschnitt (wirkt über sein Element hinaus) | Bereich: Toolbar, Filterleiste, Zeilenaktion | `src/app/util/directives/mt-compact.directive.ts`, `src/styles/mt/foundation/_mt-compact.scss` |
| `[mtUnit]` | `mt-unit` | Querschnitt | eigenes Element (`span`/`div`) um die Einheit | `mt-unit.directive.ts`, `_mt-unit.scss` |

Beide Direktiven setzen nur die Host-Klasse. `mtCompact` ist die einzige Querschnitts-Direktive, die auf Kind-Elemente wirkt (Spec, R1 AC-51); alle anderen wirken nur an ihrem Element.

## Verwendung

```html
<!-- experiment-dashboard-toolbar.component.html -->
<div class="toolbar" mtCompact> ... </div>

<!-- atlas-form-input.component.html -->
<mat-label mtLabel>{{ label }}@if (unit) {<span mtUnit> ({{ unit }})</span>}</mat-label>

<!-- unit-header.component.html (Grid-Header) -->
<div class="unit" mtUnit>({{ params.unit }})</div>
```

Regeln:
- `mtCompact` an den Bereich, nicht an jeden Button/jedes Feld. Kinder, die selbst `mtCompact` tragen, brauchen es nicht doppelt (AC-51 meint Kinder ohne eigenes `mtCompact`: auch sie werden 32 px).
- Kompakt nur in Grid-Toolbars, Filterleisten und Zeilenaktionen (Spec); sonst 44 px.
- `mtUnit` an ein eigenes Element um die Einheit setzen, nie an das ganze Label; sonst verliert das Label seine Versalien.
- Die Einheit steht mit Klammern im Element, wie im Bestand.

### Stellen mit `mtCompact` im Bestand (Suche `mtCompact` in `src/app`)

| Bereich | Datei (unter `src/app/`) |
|---|---|
| Dashboard-Toolbar | `features/experiment-dashboard/components/experiment-dashboard-toolbar/...component.html` (`div.toolbar`) |
| Parameter-Seite: Umschalter | `features/experiment-wizard/parameters/parameters-page/parameters-page.component.html` (`div.toolbar-toggle`) |
| Parameter-Seite: obere Toolbar | derselbe Template (`div.top-toolbar`) |
| Parameter-Zeilenaktion | `features/experiment-wizard/parameters/action-cell-renderer/action-cell-renderer.component.html` (`div.action-container`) |
| Autopilot-Toolbar | `features/experiment-wizard/parameters/autopilot-toolbar/parameters-autopilot-toolbar.component.html` |
| Such-Lesezeichen-Toolbar | `features/search-strategie/components/search-bookmarks-toolbar/...component.html` |
| Such-Filterleiste | `features/search-strategie/components/search-filter-sidebar/...component.html` (`div.sidebar-panels`) |
| Suchergebnis-Zeilenaktion | `features/search-strategie/components/search-results-grid/search-result-row-actions/...component.html` (`div.actions-row`) |
| Aktivitäten-Filter | `features/tools/components/activity-overview-filter/...component.html` (`div.filter-panel-wrap`) |

Die Dashboard-Aktionszelle (`experiment-dashboard-actions-cell`) besteht aus Action-Buttons ([action-button](action-button.md)) und trägt `mtCompact` am Container (wie die Aktionsspalte der Such-Ergebnisse).

### Stellen mit `mtUnit` im Bestand

| Typ | Stellen |
|---|---|
| Grid-Header | `unit-header.component.html` (Parameter-Tabelle), `search-column-header.component.html` (Suchergebnisse) |
| Feldlabel über Hüllen mit Eingabe `unit` | `atlas-form-input`, `atlas-form-minmaxinput`, `atlas-form-multi-select`, `atlas-form-nomminmaxinput` (jeweils `@if (unit)`) |
| Feldlabel direkt im Template | `material-input.component.html` (Thickness mm), `setup-page.component.html` (ca. 20 Stellen), `result.component.html` (5), `result-measurements.component.html` (2) |

Hüllen-Eingabe: `unit` (`atlas-form-input`, `@Input() unit: string | null`; die drei anderen Hüllen als Signal `unit()`).

## Zielwerte

| Eigenschaft | Wert | Zustand | Quelle |
|---|---|---|---|
| Höhe Button/Feld, Normalstufe | `control-height` = 2,75 rem = 44 px bei 16 px | außerhalb `mt-compact` | AC-11, Token |
| Höhe Button/Feld, Kompakt | `control-height-compact` = 2 rem = 32 px bei 16 px | in `.mt-compact` | AC-11, AC-51, `_mt-compact.scss` |
| Icon-Button | 44 x 44 px, kompakt 32 x 32 px | | AC-07 |
| Skalierung bei Basisschrift 13 px (Fensterhöhe 720 px) | Normal 44 x 13/16 = 35,75 px, Kompakt 32 x 13/16 = 26 px | | Basisschrift `html { font-size: clamp(13px, 1.8vh, 16px) }` in `_app-reset.scss` |
| Einheit | `text-transform: none` | immer | AC-58, `_mt-unit.scss` |
| Einheit im Grid-Header | Farbe wie Label (weiß, vererbt), Deckkraft 1; keine eigene Farbe im Komponenten-SCSS | immer | `unit-header`, `search-column-header` (PW:T) |
| Einheiten-Umschalter im Parameter-Header (`.unit-option`) | Rand und Schrift weiß, Hintergrund transparent; aktiv: Hintergrund weiß, Schrift `#56788F` (Header-Farbe) | R, A | `unit-header-3.component.scss` (`color-on-accent`, `color-grid-header`), PW:T |

Rechenregel: Maße sind in rem, also immer Faktor (Basisschrift / 16).

## Aufbau (intern)
`mt-compact` überschreibt nur die Laufzeit-Variable der Bausteinhöhe; alle mt-Buttons und -Felder lesen sie:

```scss
// _mt-compact.scss
.mt-compact { --mt-control-height: #{t.v(control-height-compact)}; }
```

`control-height` ist im Token-Partial als Laufzeit-Variable (`$runtime: (control-height)`) deklariert, weil `mt-compact` sie je Bereich ändert. Verbraucher von `t.v(control-height)`: `_mt-button.scss` (Container-Höhe je Appearance), `_mt-button-icon.scss` (State-Layer, daraus Breite und Höhe), `_mt-field.scss`/`_mt-field-tokens.scss` (Feldhöhe, Label-Position), `_mt-menu-item.scss`, `_mt-nav-item.scss`, `_mt-panel-header.scss`. Die Vererbung läuft über die CSS-Variable, daher greifen auch Kinder ohne eigenes `mtCompact` (AC-51). Siehe [tokens](tokens.md).

`mt-unit`: `.mt-unit { text-transform: none; }`. Zusätzlich steht dieselbe Regel im Grid-Dichte-Part (`.mt-unit { text-transform: none; }` in `src/app/util/grid/mt-grid-theme.ts`), damit sie im Grid-Header nicht von `.ag-header-cell-text { text-transform: uppercase }` überstimmt wird ([grid](grid.md)).

## Hüllen-Komponenten
Die Hüllen `atlas-form-input`, `-minmaxinput`, `-multi-select`, `-nomminmaxinput` setzen `mtUnit` selbst um die Einheit, wenn die Eingabe `unit` gesetzt ist. Das Feldlabel steht in Versalien ([field](field.md)), die Einheit nicht. Keine Hülle sitzt selbst als Kompakt-Bereich; `mtCompact` wird am umgebenden Bereich gesetzt. Primär-Hülle `atlas-btn`: Kompakt wirkt über die Variable ([button](button.md)).

## Tests
- Unit: `mt-compact.directive.spec.ts`, `mt-unit.directive.spec.ts` (Host-Klasse).
- Browser: `e2e/tests/mt-targets.spec.ts`: "Kompakt-Stufe und Hüllen: Dashboard-Toolbar mit 32 px, Primär-Hülle grün, Suchfeld füllt seinen Host" (Button 32 px, Feld-Wrapper 32 px), "Skalierung: Primär-Button 44 px x 13/16" (Fenster 1280 x 720), "Grid Suchergebnisse: Einheit im Header behält ihre Schreibweise, Label in Versalien" (`.mt-unit` `text-transform: none`, `.label` `uppercase`), "Grid Suchergebnisse: Einheit im Header in derselben weißen Schrift wie das Label" (Farbe weiß, Deckkraft 1), "Grid Parameter: Einheiten-Umschalter weiß umrandet, aktiv weiß gefüllt mit Schrift in Header-Farbe" (Mock `WeldingSpeed` in `e2e/fixtures/mt-grid-pages-api-mock.ts`).
- Skript: `scripts/mt-placements.test.mjs` (Platzierungen), Handliste `e2e/mt-messliste.md` (AC-11 nicht separat; AC-07 und Skalierung siehe Datei).
- Lint: Direktiv-Map und Elementanforderungen siehe [enforcement](enforcement.md); `mt-directive-imports.test.mjs` prüft Direktiv-Importe.

## Abweichungen ggü. Spec/Plan
Spec AC-58 regelt nur die Schreibweise; die Farbe der Einheit im Grid-Header (weiß, vererbt) und der Umschalter (weiß/aktiv weiß gefüllt) sind eine Ergänzung auf Wunsch des Auftraggebers, kein Widerspruch. Hinweis: Die Skalierung der Kompaktstufe (26 px bei 13 px Basisschrift) ist nicht per eigenem Test gemessen; der Skalierungstest prüft nur die Normalstufe (35,75 px).

## Offene Punkte
- Final-Review 🟡: Icon-Buttons in `mat-option` (`task-option-copy/-delete`, `setup-page`, 24 px) weichen von AC-07 ab; Ausnahme "Aktion in Option" braucht Entscheidung des Menschen.
- Final-Urteil: `panel-header-btn` im Such-Wizard (7 Stellen) bekommt keine Kompakt-Stufe; Breite/Höhe/Zeilenhöhe/Farbe entfielen, Button bleibt 44 px, Überlauf der Kopfzeile ungeprüft.
- Final 🟢: Toolbar-Icon-Button der Parameter-Seite 32 x 32 px unskaliert, `autopilot-unified__toggle` 86 x 38 px (ungeprüft).
- Task 27 (außerhalb Scope): rohe px-Maße in Komponenten bleiben, u. a. `score-cell-editor` min-height 36 px, Sidebar 64 px, `dynamic-input-panel` min-height 56 px, `parameters-page` min-height 32/26 px und `line-height` 26 px; Task 17: `max-height: 320px`, `padding: 8px` in Multi-Select/nomminmax-SCSS.
- Task 14: `unit-header` setzt noch `height: 32px !important`; Einheit-Versalien und Einheit-Farbe im Browser nur über den Suchergebnis-Header gemessen, nicht im Parameter-Header (dort nur der Umschalter) und nicht im Feldlabel.
- Die Farben des Umschalters stehen im Komponenten-SCSS (`var(--mt-…)`), nicht zentral; Grund: Budget des globalen Stylesheets (siehe [corrections-and-open-points](corrections-and-open-points.md)).
- Task 17: im Such-Wizard-Spec wurde das Label "Thickness" mit `unit()` "mm" angepasst (zwingend, offengelegt).
- Das Dashboard-Aktions-SCSS enthält 18 px und 4 px Padding als Literale.

## Ändern: Checkliste
1. Kompakt-Höhe nur über Token `control-height-compact` in `src/styles/_mt-tokens.scss` ändern; `control-height` bleibt Laufzeit-Variable (`$runtime`).
2. Neue kompakte Stelle: `mtCompact` am Bereich setzen, nicht Höhe in der Komponente; Eintrag in dieser Tabelle und ggf. Platzierungstest ergänzen.
3. Neues mt-Element, das die Höhe beachten soll: `t.v(control-height)` verwenden, kein px-Literal.
4. Einheit nur mit `mtUnit` an eigenem Element; Regel auch im Grid-Dichte-Part prüfen.
5. Messtests in `mt-targets.spec.ts` und Messliste mitziehen; Budget in `angular.json` nicht anheben.
6. Diese Referenzseite im selben Zug korrigieren.

Verwandt: [tokens](tokens.md), [directive-model](directive-model.md), [field](field.md), [button](button.md), [surface-and-card](surface-and-card.md), [grid](grid.md).
