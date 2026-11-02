# Grid (AG Grid)
Stand: Code-Stand Branch dev, Commit 31c0f0a8 plus Grid-Header-Farbe `#56788f` (ungecommittet) (2026-10-27)

> Alle AG Grids bekommen Farben und Dichte aus genau einem Theme (`MT_GRID_THEME`); `mtGrid` hängt es an das Grid, `mtGridEditor` formatiert Formularfelder in Zell-Editoren.

## Überblick

| Direktive/Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `ag-grid-angular[mtGrid]` | `mt-grid` | Basis | `<ag-grid-angular>` | `src/app/util/directives/mt-grid.directive.ts`, `src/styles/mt/grid/_mt-grid.scss` |
| `[mtGridEditor]` | `mt-grid-editor` | Basis (Feld im Editor) | `mat-form-field` in einem Zell-Editor | `mt-grid-editor.directive.ts`, `_mt-grid-editor.scss` |
| (kein Selektor) | Konstanten | zentrales Theme | alle Grids | `src/app/util/grid/mt-grid-theme.ts` |
| (kein Selektor) | Konstanten | Score-Palette | Score-Zellen, Score-Skala | `src/assets/data/score-colors.ts` |

`mtGrid` setzt im Konstruktor das Theme am Grid, die Klasse `mt-grid` ist nur Anker für Lage-Regeln:

```ts
// mt-grid.directive.ts
constructor() { inject(AgGridAngular, { self: true }).theme = MT_GRID_THEME; }
```

`_mt-grid.scss` enthält nur: `.mt-grid .ag-cell .mt-tag { max-height: 100%; vertical-align: middle; }` (Tags in Zellen). Farben und Dichte stehen nicht im Partial.

## Verwendung
Die vier Grids setzen `mtGrid` direkt am Grid (Pfade unter `src/frontend/src/app/`):

| Grid | Komponente | Besonderheit im Template |
|---|---|---|
| Dashboard | `features/experiment-dashboard/components/experiment-dashboard-grid` | `getRowStyle` mit gedämpften Zeilen (`MT_GRID_CELL_COLORS.mutedRow*`) |
| Suchergebnisse | `features/search-strategie/components/search-results-grid` | `[headerHeight]="120"`, Score-Zellen mit `SCORE_COLORS` |
| Parameter | `features/experiment-wizard/parameters/parameters-page` | `[headerHeight]="headerHeight()"` (40), `[groupHeaderHeight]="18"`, `[rowHeight]="28"` |
| Aktivitäten | `features/tools/components/activity-overview-page` | nur Standard |

```html
<ag-grid-angular mtGrid class="grid-fill" [rowData]="..." [columnDefs]="..." />
```

Zell-Editor (`score-cell-editor.component.html`):

```html
<mat-form-field mtGridEditor class="score-comment-field" subscriptSizing="dynamic">
  <input mtInput matInput class="score-comment" ... />
</mat-form-field>
```

Regeln:
- Kein Grid ohne `mtGrid`. Keine eigene Theme-Klasse (`ag-theme-*`) und kein globales Grid-Stylesheet mehr; beide sind entfallen (Commit 8e4951e2 "move all grids to the central mt grid theme").
- Farben für Zellen nur über `MT_GRID_CELL_COLORS` oder `SCORE_COLORS`, nie als Literal in Komponenten.
- Zell-Editoren: `mtGridEditor` an `mat-form-field`, kein Label oben (AC-18). Der Editor-Standard setzt `appearance: 'outline'`, `floatLabel: 'auto'`, `subscriptSizing: 'dynamic'` (`MT_GRID_EDITOR_DEFAULTS`, per `MAT_FORM_FIELD_DEFAULT_OPTIONS` als Provider der Direktive).
- Lint: `withParams`/`withPart`/`createPart` außerhalb der Theme-Datei meldet ESLint (AC-47, `GRID_THEME_SELECTORS` in `eslint.config.js`); Farbliterale (Hex/rgb) in TypeScript sind nur in `mt-grid-theme.ts` und `score-colors.ts` erlaubt.

## Zielwerte

| Eigenschaft | Wert (bei Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Header Hintergrund | `#56788f` | immer (auch Hover) | AC-24, `headerBackgroundColor`, `headerCellHoverBackgroundColor` |
| Header Schrift (Spaltentitel) | weiß, 13 px (`0.8125rem`), **300 (Light)**, Versalien | immer | AC-24, `headerTextColor/FontSize/FontWeight` (300), Dichte-Part (`text-transform: uppercase`) |
| Header Schrift (Gruppen-Header) | weiß, 13 px, **700**, Versalien | immer | Dichte-Part (`.ag-header-group-cell, .ag-header-group-text { font-weight: 700 }`); eingeklappte Gruppen-Spalten der Suche (`group-summary-header`) ebenfalls 700 |
| Einheit im Header | weiß wie das Label (vererbt, Deckkraft 1), Schreibweise unverändert | immer | AC-58, `unit-header`, `search-column-header` (kein `color` im SCSS) |
| Einheiten-Umschalter im Parameter-Header | Rand/Schrift weiß, transparent; aktiv: weiß gefüllt, Schrift `#56788f` | R, A | `unit-header-3.component.scss` ([compact-and-unit](compact-and-unit.md)) |
| Zeilen | abwechselnd `#ffffff` / `#eaedf2` | gerade / ungerade | AC-24, `backgroundColor`, `oddRowBackgroundColor` |
| Linien (Zeile, Spalte, Rahmen) | 1 px `#e2e2e2` | immer | AC-24, `rowBorder`, `columnBorder`, `wrapperBorder` |
| Gewählte Zeile | `#c6d4dd` | selektiert | AC-24, `selectedRowBackgroundColor` |
| Zeile unter Maus | `#f7fae9` | Hover | AC-24, `rowHoverColor` |
| Akzent | `#285172` | Auswahl-/Fokus-Elemente | `accentColor` |
| Radius | 0 | immer | `borderRadius`, `wrapperBorderRadius` |
| Schrift Grundgröße / Familie / Gewicht | 12 px, Roboto, 300 | immer | `fontSize`, `fontFamily`, `fontWeight` |
| Zellschrift | `0.82rem` = 13,12 px | immer | `dataFontSize`, Baseline `cellFontSize` |
| Zellabstand | links 2 px (`0.125rem`), rechts 0 | nicht im Editieren | AC-25, Dichte-Part |
| Zeilenhöhe | 42 px; Parameter-Grid 28 px | immer | AC-25, Baseline `rowHeight`/`parametersRowHeight` |
| Zellwert vertikal | zentriert (Mitte des Textes höchstens 1,5 px neben der Zellmitte), alle vier Grids | immer | `line-height` des AG-Grid-Standards (`--ag-internal-content-line-height`, Zeilenhöhe minus Rand); kein eigenes `line-height` im Dichte-Part |
| Schriftgewicht Parameter-Grid | Zellwerte 300; nur Score und Ergebnis-Status (Tag) 700 | immer | `fontWeight: '700'` der Score-Zelle, `.mt-tag` |
| Schriftgewicht Dashboard | Zellwerte der Experiment-Zeilen 300 (Light) | immer | Theme `fontWeight: 300`; keine eigene Regel in `experiment-dashboard-grid.component.scss` |
| Status-Spalte Parameter-Grid | Breite 100 px, höchstens 110 px (Tag "In Progress" mit 4 px Innenabstand ist 94,7 px breit); Tag horizontal zentriert (Mitte höchstens 2 px neben der Zellmitte) | immer | `parameter-table.service.ts` (`width`, `maxWidth`, `cellStyle: { textAlign: 'center' }`, wie die Score-Spalte) |
| Eingaberahmen im Grid | 1 px `#747474`; Fokus 2 px `#0b0b0b` | Editor | `inputBorder`, `inputFocusBorder` |
| Farben in allen vier Grids gleich | Header, Zeilen, Linien | immer | AC-26 |

Header-Gewicht prüft `e2e/tests/mt-targets.spec.ts` ("Grid <Name>: Spalten-Header in Light, Gruppen-Header fett", alle vier Grids). Zentrierung, Status-Tag-Innenabstand und Schriftgewicht der Zellen prüft `e2e/tests/mt-targets.spec.ts` ("Grid <Name>: Zellwerte vertikal zentriert", "Grid Parameter: Status-Tag mit 7/4 px Innenabstand, Status vollständig in der Zelle", "Grid Parameter: nur Score und Ergebnis-Status fett, übrige Zellwerte Light", "Grid Parameter: Status-Tag horizontal in der Zelle zentriert", "Grid Dashboard: Zellwerte der Experiment-Zeilen in Light"). Einheit und Umschalter prüft `e2e/tests/mt-targets.spec.ts` ("Einheit im Header in derselben weißen Schrift wie das Label", "Einheiten-Umschalter weiß umrandet ..."). Zielwerte AC-24 und AC-26 prüft `e2e/tests/mt-targets.spec.ts` ("Grid <Name>: TRUMPF-Tabellenfarben ...", "Auswahl #C6D4DD und Hover #F7FAE9 aus dem zentralen Theme", Dashboard-Header in Versalien 13 px). AC-25/27 prüft `e2e/tests/mt-grid-baseline.spec.ts`.

## Aufbau (intern)
Datei `src/app/util/grid/mt-grid-theme.ts`, drei Teile:

1. `MT_GRID_DENSITY` (`createPart`, nicht exportiert): CSS-Part, der nach den Grid-Basisregeln eingefügt wird und deshalb ohne `!important` auskommt, solange die Selektoren mindestens so spezifisch sind wie die Basisregeln. Inhalt (Auszug):
   ```ts
   .ag-row, .ag-cell { font-size: var(--ag-data-font-size); }
   .ag-ltr .ag-cell:not(.ag-cell-inline-editing), .ag-rtl ... { padding-left: 0.125rem; padding-right: 0; }
   .ag-header-cell, .ag-header-group-cell { padding: 0 0.125rem; overflow: visible; line-height: 1; }
   .ag-header-cell-text, .ag-header-group-text { word-break: break-word; text-transform: uppercase; }
   .ag-body-viewport { padding-bottom: 40px; }
   .mt-unit { text-transform: none; }
   ```
   Kein `line-height` für `.ag-cell`: AG Grid setzt es selbst auf Zeilenhöhe minus Rand, das zentriert Zellwerte. Eine frühere Regel `.ag-cell { line-height: 1.4 }` ließ sie am oberen Rand sitzen und ist entfallen.
   Weitere Regeln: Header-Gruppen ohne Padding, umbrechende Header-Labels (`white-space: normal`), Menü-/Filter-Buttons im Kopf um 90 Grad gedreht.
2. `MT_GRID_THEME = themeAlpine.withPart(MT_GRID_DENSITY).withParams({...})`: alle Farb- und Maß-Parameter aus der Zieltabelle. Einzige Quelle der Grid-Farben.
3. `MT_GRID_CELL_COLORS` (`as const`): fachliche Zellfarben.

Zusatzregel `.ag-row, .ag-cell { font-size: var(--ag-data-font-size) }`: Ohne sie erbte die Checkbox-Zelle die Zeilenschrift (13 px) statt 13,12 px, die Baseline (`cellFontSize: 13.12px`) wäre rot geblieben. Sie wurde in Task 12 gegenüber dem Brief-Theme ergänzt.

Zeilenhöhe: Im Code nur im Parameter-Grid gesetzt (`[rowHeight]="28"`, `parameters-page.component.html`). Die 42 px der übrigen Grids stammen aus dem Alpine-Standard von AG Grid 35.3.1; das Theme setzt keinen Höhenparameter. Eine AG-Grid-Änderung kann sie daher verschieben (Absicherung unten).

### MT_GRID_CELL_COLORS (Schlüssel und Verbraucher)

| Schlüssel | Wert | Verwendet in |
|---|---|---|
| `defaultBackground` | `#ffffff` | `parameter-table.service.ts` (`CELL_DEFAULT_BG`) |
| `calculatedBackground` | `#f0f0f0` | `parameter-table.service.ts` (berechnete Zellen, 3 Stellen) |
| `calculatedText` | `#666666` | `parameter-table.service.ts` (berechnete Zellen, 3 Stellen) |
| `rowAboveDiffBackground` | `#fff8c4` | `parameter-table.service.ts` (`ROW_ABOVE_DIFF_BG`, geänderte Zeile) |
| `scoreText` | `#000000` | Score-Zellen in `parameter-table.service.ts` und `search-results-grid.component.ts` |
| `mutedRowBackground` | `#f8f9fa` | `experiment-dashboard-grid.component.ts` (`getRowStyle`) |
| `mutedRowText` | `#6c757d` | `experiment-dashboard-grid.component.ts` (`getRowStyle`) |

### Score-Palette und Score-Zellen
`src/assets/data/score-colors.ts` (gleichzeitig Quelle der Result-Seite, siehe [tag-and-role](tag-and-role.md)):

| Note | `SCORE_COLORS` | Note | `SCORE_COLORS` |
|---|---|---|---|
| 1 | `#b9d4b0` | 4 | `#f0cfa0` |
| 2 | `#e0e8b8` | 5 | `#e8bfb0` |
| 3 | `#f0e6a0` | 6 | `#dba0a0` |

`SCORE_TEXT_ON_DARK = '#ffffff'`, `SCORE_TEXT_ON_LIGHT = '#000000'` (Textfarbe der Score-Skala nach Helligkeit, `score-scale.component.ts`). Score-Zellen (Suchergebnisse `OverallScore`, Parameter-Spalte `score`) setzen `backgroundColor: SCORE_COLORS[n]`, `color: MT_GRID_CELL_COLORS.scoreText`, `fontWeight: '700'`, zentriert. Das Suchergebnis-Grid enthält keine eigenen Farbliterale (AC-52); AC-27 verlangt unveränderte Werte, geprüft im Baseline-Test (`SCORE_BACKGROUNDS`).

### Parameter-Tabelle
`src/app/services/states/parameter-table.service.ts` baut die Spalten. Die Spalte `resultStatus` (Breite 100, höchstens 110 px, zentriert) rendert ihren Status als Tag: `<span class="mt-tag mt-tag-grid mt-role ${mtRoleClass(role)}">`; `mt-tag-grid` kürzt nur den seitlichen Innenabstand auf 4 px (7 px oben/unten), siehe [tag-and-role](tag-and-role.md) mit `role = resultStatusRole(status)` (Zuordnung siehe [tag-and-role](tag-and-role.md)). Parameter-Grid-Maße: Zeile 28 px, Kopf 40 px, Gruppenkopf 18 px.

## Hüllen-Komponenten
Keine Hülle. Der Score-Zell-Editor (`score-cell-editor.component`, Popup-Editor der Parameter-Tabelle) nutzt `mtGridEditor` für das Kommentarfeld; sein Wert ist ein zusammengesetztes Objekt (`overallScore`, `overallScoreComment`), nicht ein Skalar. Details: [field](field.md).

## Tests
- Unit: `mt-grid.directive.spec.ts` (Klasse `mt-grid`, Theme = `MT_GRID_THEME` über Stub-Komponente), `mt-grid-editor.directive.spec.ts`.
- Skript: `scripts/mt-ag-grid-version.test.mjs` hält AG Grid auf 35.3.1 (AC-55): `package.json`, Lockfile und installierte Pakete (`ag-grid-angular`, `ag-grid-community`, `ag-grid-enterprise`). Aufruf `node --test scripts/mt-ag-grid-version.test.mjs`. Ein Upgrade ist nur zusammen mit neuer Messung der Dichte zulässig, da die 42 px aus dem Standard kommen.
- Browser: `e2e/tests/mt-grid-baseline.spec.ts` (Vorher-Stand, AC-25/27): Zeilenhöhe 42 (Parameter 28), Zellschrift `13.12px`, Zellabstand `2px`/`0px` für alle vier Grids, Score-Hintergründe; Werte eingefroren, gelten unverändert nach der Umstellung. `e2e/tests/mt-targets.spec.ts`: Farben (AC-24/26). Seiten: `/experiments`, `/search`, `/tools/activity-overview`, Parameter-Seite (`PARAMETERS_URL`), Mock `e2e/fixtures/mt-grid-pages-api-mock`.
- Handliste: `e2e/mt-messliste.md` Zeilen AC-24 (Kopfzelle-Padding) und AC-25.
- Lint: ESLint `no-restricted-syntax` (Grid-Theme-Parameter, Farbliterale), Konfig `eslint.config.js`; Ausnahmen für Specs und `*.testing.ts`.

## Abweichungen ggü. Spec/Plan
- Header-Gewicht: einfache Spaltentitel sind Light (300), nur Gruppen-Header bleiben 700. Spec/AC-24 nennt 700 für alle Header. Auftraggeber-Wunsch 2026-10-21, gilt für alle Grids. Eigene Header-Komponenten (`search-column-header`, `unit-header`) setzen `.label` ebenfalls auf `font-weight-light`, nur der Gruppen-Name (eingeklappte Spalte) bleibt bold.
- Header-Hintergrund `#56788f` statt `#899fb2` (Spec/AC-24): Auftraggeber-Wunsch 2026-10-27, Ton zwischen `#24506d` und `#88a0b1` (rechnerische Mitte). Gilt für alle Grids (Suche, Parametersatz, Dashboard, Aktivitäten) inkl. Hover und Schrift des aktiven Einheiten-Umschalters (`color-grid-header`). Weiße Header-Schrift hat darauf Kontrast 4,7:1 (vorher 2,7:1).
- Zentrierung: Der Dichte-Part enthält keine `.ag-cell { line-height: 1.4 }` mehr (Auftraggeber-Wunsch, alle vier Grids). Spec/AC-25 verlangt "Dichte unverändert"; Zeilenhöhe, Schrift und Zellabstand bleiben, nur die Lage des Wertes in der Zelle ändert sich (vorher oben, jetzt Mitte). Der Wunsch `line-height: 0` wurde gemessen und verworfen: er setzt den Wert 13 px über die Mitte.
- Status-Tag im Parameter-Grid: eigene Klasse `mt-tag-grid` (Innenabstand 7 px / 4 px), Basis-Tag unverändert (AC-28). Spec kennt keine Grid-Variante.
- Dashboard: Regel `.experiment-parent-row { font-weight: bold !important }` im Komponenten-SCSS entfernt (Auftraggeber-Wunsch, Light wie Suchergebnis-Grid); Spec/Plan nennen kein Gewicht der Dashboard-Zeilen. Klasse `experiment-parent-row` bleibt für `.experiment-expanded`.
- Status-Spalte von 59/69 px auf 100/110 px verbreitert, damit "In Progress" vollständig sichtbar ist (Auftraggeber-Wunsch).
- Dichte-Part um `.ag-row, .ag-cell { font-size: var(--ag-data-font-size); }` ergänzt (Task 12): Brief-Theme ließ die Checkbox-Zelle bei 13 px, Baseline rot.
- Der Dichte-Part enthält zusätzlich `.mt-unit { text-transform: none; }`, damit Einheiten im Kopf nicht in Versalien erscheinen ([compact-and-unit](compact-and-unit.md), AC-58).
- Farbe der Einheit und des Umschalters im Header (siehe Zielwerte) ergänzt die Spec (AC-58 nur Schreibweise); Auftraggeber-Wunsch.
- Der Selektor der Editor-Direktive ist `[mtGridEditor]` (nicht `mat-form-field[mtGridEditor]`); der Brief war hier widersprüchlich (Task 12, 🟢).

## Offene Punkte
- Dashboard: Schriftfarbe und -art entsprechen dem Suchergebnis-Grid (schwarz, Roboto 300); eine weitere Angleichung (z. B. Einrückung, Titelzeile) wurde nicht geprüft.
- Das Suchergebnis-Grid zentriert zusätzlich über Komponenten-SCSS (`.ag-cell { display: flex; align-items: center }` in `search-results-grid.component.scss`); mit der Theme-Zentrierung wohl überflüssig, ungeprüft.
- `mt-grid-baseline.spec.ts` (4 Tests) läuft in Timeout: `measureFirstDataCell` sucht `.ag-center-cols-container .ag-row .ag-cell`, der Selektor trifft im Browser nichts (2026-10-21 gemessen, vor und nach der Zentrierung); nicht behoben.
- Im Gesamtlauf von `mt-targets.spec.ts`/`mt-grid-baseline.spec.ts` (gegen den Dev-Server auf 4200, 2026-10-21) schlugen 9 Grid-Tests fehl (Header-Hintergrund `rgba(0,0,0,0)`, Baseline der vier Grids); auch ohne die Einheit-Änderung rot, Ursache nicht geklärt.
- Task 25: Messliste AC-24 (Kopfzellen-Innenabstand) ohne konkreten Sollwert ("wie Basis-Stand"), nichts im Browser gemessen; AC-25 doppelt zur Baseline.
- Kopfzellen-Padding im Theme ist `0 0.125rem`; ein fester Zielwert aus der Spec fehlt (Lücke).
- Task 1: Score-Test in `mt-grid-baseline.spec.ts` ohne Retry (mögliche Flake-Quelle); `.sort()` ohne Komparator.
- Task 27 (außerhalb Scope): Bausteinmaße in Komponenten (`score-cell-editor` min-height 36 px, `parameters-page` min-height 32/26 px, `line-height` 26 px) blieben stehen; im Final-Fix wurde das Kompaktieren der Kommentar-Feldhöhe im Score-Editor entfernt (Commit 6536bb04), Feldhöhe kommt nun aus mt-field/`mtGridEditor`, optisch im Browser nicht geprüft.
- `MT_GRID_CELL_COLORS.scoreText` und `SCORE_TEXT_ON_LIGHT` sind beide `#000000` (Dopplung, Task 22 🟢).
- Zeilenhöhe 42 px hängt am AG-Grid-Standard, nicht an einem Parameter.

## Ändern: Checkliste
1. Farben und Maße des Grids nur in `src/app/util/grid/mt-grid-theme.ts` ändern (`withParams` bzw. Dichte-Part), nie in Komponenten-SCSS oder globalen Styles.
2. Zellfarben fachlich: `MT_GRID_CELL_COLORS` ergänzen und verwenden; Score nur über `score-colors.ts`.
3. Neue Dichte-Regel: Selektor mindestens so spezifisch wie die AG-Basisregel, kein `!important`.
4. Neues Grid: `mtGrid` setzen, in `mt-grid-baseline.spec.ts` (`GRID_PAGES`) und `mt-targets.spec.ts` aufnehmen.
5. AG Grid nicht upgraden (35.3.1 fixiert); sonst Baseline neu messen und `scripts/mt-ag-grid-version.test.mjs` anpassen.
6. Zeilen-/Zellmaße ändern heißt: `BASELINE` in `mt-grid-baseline.spec.ts` und Messliste bewusst anpassen.
7. Budget in `angular.json` nicht anheben.
8. Diese Referenzseite im selben Zug korrigieren.

Verwandt: [tokens](tokens.md), [directive-model](directive-model.md), [field](field.md), [button](button.md), [surface-and-card](surface-and-card.md), [tag-and-role](tag-and-role.md).
