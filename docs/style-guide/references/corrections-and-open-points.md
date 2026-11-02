# Korrekturen und offene Punkte
Stand: Code-Stand Branch dev, Commit 31c0f0a8 plus Grid-Header-Farbe `#56788f` (ungecommittet) (2026-10-27)

> Gedächtnis des Projekts: was Plan und Spec ursprünglich sagten, was nach Umsetzung und Reviews tatsächlich gilt, was offen blieb und welche Lücken Spec/Plan haben.

Belege: `T<n>` = Task n des Plans `docs/plans/312482-mytrumpf-optik-mt-direktiven.md` (Ledger-Zeilen, `ledger-final.md`), Hashes = Commits dieses Branchs (`git log --oneline cd05cb4e..HEAD`). Es gilt: Code > Umsetzungsbericht/Ledger > Spec > Plan. "Ledger" = Zusammenfassung der Task-Reviews. Elementseiten: siehe Links; Werkzeugseite: [Durchsetzung](enforcement.md); Zielwerte: [Zielwerte](targets.md).

## Commit-Zuordnung der Tasks

| Task | Inhalt | Commit (Ende) | Fix-Runde |
|---|---|---|---|
| T1 | Grid-Vorher-Stand einfrieren, AG-Grid-Version | ab231189 | - |
| T2 | Stylelint, `mt/max-file-size` | 8a9f3407 | - |
| T3 | ESLint-Regeln, Lint-Gate, Zuordnungstabelle | 9ce2cc91 | - |
| T4 | Tokens, Typografie, Seitenfläche | 3e9ffb72 | - |
| T5 | Querschnitts-Direktiven | 0522a4cd | - |
| T6 | Button-Direktiven | e2e6b93a | - |
| T7 | Feld-Direktiven | 57d8f47d | - |
| T8 | Select, Auswahl-Steuerelemente, Schalter | f84b07f6 | - |
| T9 | Flächen-Direktiven (Karte, Panel, Menü, Tooltip) | 38f1df6c | - |
| T10 | Dialog-Direktiven, Overlay-Voreinstellungen | 44d5ece3 | - |
| T11 | Navigation (Tabs, Nav-Item) | 6523c579, 698a7ac5 | 1 (698a7ac5) |
| T12 | zentrales Grid-Theme | 8e4951e2 | - |
| T13 | Template-Codemod über alle Templates | acca17dc | - |
| T14 | Kompakt, Einheit, Titel, Rolle platzieren | 56ea7b9e | - |
| T15 | Dashboard-Status und Log-Level als Tags | 2178051d | - |
| T16 | Button-Hüllen | 14f8a6a8 | - |
| T17 | Formular-Hüllen | d5885eb1 | - |
| T18 | Panel- und Dialog-Hülle | e46be1e9 | - |
| T19 | Style-Codemod, Stylesheet-Aufteilung | cbb95934, 8451a93d | 1 (8451a93d) |
| T20 | `!important` in Komponenten | ba744d8f | - |
| T21 | globale Partials auf mt-Tokens | db1bb0ba | - |
| T22 | Canvas- und Grid-Farben aus Tokens | 254b51ad | - |
| T23 | Budget für globales Stylesheet | 13d3d8f5 | - |
| T24 | Browser-Tests Zielwerte | d4e641a3, 1a0f812f | 1 (1a0f812f) |
| T25 | Messliste | 9a34abee | - |
| T26 | zwei rote Browser-Tests reparieren | 2ad8b4c6 | - |
| T27 | Lint auf Fehler | 5dab09a8 | - |
| Final | Final-Review, Fix-Welle | 6536bb04 | 1 Welle (6536bb04) |
| Doku | Umsetzungsbericht, Glossar | a89f1fff, b9dbc15d | - |

## (a) Korrekturen: Plan/Spec sagten, jetzt gilt, warum

### Reviewer-Befunde 🔴 und Fix-Runden

| Thema | Plan/Spec sagten | Jetzt gilt | Warum | Task / Commit |
|---|---|---|---|---|
| Label-Versatz am Formularfeld | Plan-Code: `left: -1.25rem` am schwebenden Label (Innenabstand ausgleichen) | `left: 0`; Label beginnt am Feldrand | Sichtprüfung: Labelanfang an allen Feldern abgeschnitten, weil die Kerbe schon am Feldrand beginnt; Browser-Messtest ergänzt | nach T27, f4636baf + Änderung (ungecommittet) |
| Import-Reihenfolge `mt-directives.ts` | Plan-Code legte die Navigations-Imports hinter das Array | Alle Imports stehen im Importblock oben | 🔴 Review T11; Fix-Runde 1 | T11, 698a7ac5 |
| Zustandsanzeigen (`has-filters`, `ai-filled`, gewählte Fugenart-Kachel, Spinner-Abdunkelung, Pflichtfeld-Markierung) | Plan-Codemod entfernte Optik-Deklarationen an Material-/Grid-Selektoren, auch an Zustandsklassen | Codemod behält Optik an Zustandsselektoren mit Token und meldet sie als Warnung; die Zustände stehen über `var(--mt-…)` an der eigenen Zustandsklasse; Codemod-Test ergänzt | 🔴 Review T19; Controller-Urteil: Plan-Vorschrift widerspricht der Spec (Funktionen/Seitenaufbau unverändert; Token-Verweise für fachliche Sonderflächen ausdrücklich erlaubt); kein W-Eintrag betroffen | T19, 8451a93d |
| Nav-Item-Fläche | Plan-Partial `_mt-nav-item.scss` setzte nur Material-Token für Fläche und Schrift | Fläche (`background-color: color-surface`) und aktive Schrift (`color: color-on-accent`) stehen zusätzlich direkt am Host; `atlas-chat-bots-menu` verliert den `background: transparent`-Reset | Browser-Test rot: `app-sidebar .mt-nav-item:not(.active)` war `rgba(0,0,0,0)` statt weiß (AC-23); Zielwert bewusst nicht angepasst | T24, 1a0f812f |
| Bausteinhöhen und Optik in Komponenten (Final) | Spec: Komponenten setzen keine Bausteinhöhen; Review prüft das, kein Werkzeug | Final-Review entfernt Maße/Farben aus `experiment-wizard-shell` (`button[mat-stroked-button]`-Höhe, Footer-Button-Höhe), `parameters-page` (Toggle-/Fullscreen-Button 28 px, `min-height`, Padding, Zeilenhöhe), `score-cell-editor` (Maße), `search-wizard-sections` (`panel-header-btn` 28 px, Farbe); Farbliteral `#ba1a1a` in `setup-page.component.html` -> `mtRole="error"`; `ai-filled` im Komponenten-Stylesheet auf `.mat-mdc-form-field ::ng-deep .mdc-text-field--outlined` (Marker über Token) | 3 🔴 + `beheben`-Punkt (`score-cell-editor`) + 2 Controller-🟡 (KI-Markierung, `#ba1a1a`), beide Spec-Verstöße; KI-Markierung im Komponenten-Stylesheet statt im globalen Partial, damit das Bundle nicht wächst; Ledger benennt die drei 🔴 nicht einzeln, Zuordnung zu den Dateien aus dem Diff | Final, 6536bb04 |

### Urteile des Controllers (Abweichung bewusst)

| Thema | Plan/Spec sagten | Jetzt gilt | Warum | Task / Commit |
|---|---|---|---|---|
| Codemod-Idempotenz (Templates) | Plan-Code stellte bei erneutem Lauf Hüllen-Hosts erneut um | Guard `hasButtonRefinement` plus Test `migrateTemplate_SecondRunOnMigratedWrapperHosts_LeavesTemplateUnchanged`; ein schon umgestelltes Template erhält nur noch fehlende Importe | Plan-Code war nicht idempotent (Bedenken T13); Wiederaufsetzen nach Abbruch muss gehen | T13, acca17dc |
| Grid-Zentrierung | Spec/AC-25: Dichte unverändert, Dichte-Part setzte `.ag-cell { line-height: 1.4 }` | Regel entfernt, Werte zentriert in allen vier Grids; im Parameter-Grid nur Score und Status fett | Auftraggeber-Wunsch; `line-height: 0` gemessen (Wert 13 px über der Mitte) und verworfen | Grid-Zentrierung, ungecommittet |
| Dashboard-Schriftgewicht | Komponenten-SCSS setzte Experiment-Zeilen fett (`!important`) | Regel entfernt, Zellwerte Light | Auftraggeber-Wunsch: Dashboard wie Suchergebnis-Grid | Dashboard-Light, ungecommittet |
| Action-Button: Icon-Label-Abstand | Spec/AC-09: Kurzlabel 10 px, Zeilenhöhe 1,2 (nur am Label gesetzt) | Schrift und Zeilenhöhe zusätzlich am Material-Wrapper `.mdc-button__label` (`_mt-button-tile.scss`); Browser-Messtest in `mt-targets.spec.ts` | Der Wrapper erbte 13 px und 39 px Zeilenhöhe: Abstand zwischen Icon und Label, Icon aus der 32-px-Kachel geschoben. Gemessen: Wrapper 39 px, Icon 12 px über dem Button. Keine Wertänderung am Zielwert, nur Wirksamkeit | Aktions-Kachel, ungecommittet |
| Grid-Header-Gewicht | AC-24: Header-Schrift 700 für alle Header | Spaltentitel 300 (Light), Gruppen-Header 700 (`headerFontWeight: 300` im Theme, Regel für `.ag-header-group-*` im Dichte-Part, `.label` in `search-column-header`/`unit-header` Light) | Auftraggeber-Wunsch 2026-10-21 (zuerst Suchergebnis-Tabelle, dann für alle Grids) | Header-Gewicht, ungecommittet |
| Grid-Header-Hintergrund | AC-24: Header `#899fb2` | `#56788f` (`headerBackgroundColor`, `headerCellHoverBackgroundColor` in `mt-grid-theme.ts`, Token `color-grid-header`, Ziel `gridHeader` in `e2e/tests/mt-targets.spec.ts`) | Auftraggeber-Wunsch 2026-10-27: Ton zwischen `#24506d` und `#88a0b1`, rechnerische Mitte; weiße Header-Schrift Kontrast 4,7:1 statt 2,7:1 | Header-Farbe, ungecommittet |
| Action-Button als eigene Form | AC-02/AC-09: Button-Schrift fett, Kachel-Kurzlabel 10 px; Spec: Kachel als Button-Form | Eigene Seite [action-button](action-button.md); Kurzlabel 8 px Light mit Ellipsis für jeden Action-Button (kein Modifier, keine Klasse am Host) | Auftraggeber-Entscheid 2026-10-21: Action-Buttons in Grid und Liste sind besondere Buttons; lange Labels ("Sales Report") überlappten in 50 px. Vor dem Restyling war das Label 7 px mit Ellipsis, der Umbau auf `matButton` (Inline-Wrapper) hatte die Ellipsis unwirksam gemacht | Action-Button, ungecommittet |
| Dashboard-Aktionszelle | Eigene `<button class="action-btn">` mit eigenem SCSS (Padding 4 px, Icon 18 px), ohne mt-Direktive | Hülle `app-atlas-action-btn` mit `mtButtonText` und `mtCompact` am Container; Marker-Klassen `upload-btn`/`download-btn` am Host für den Zeilenklick-Schutz; Labels "Upload"/"Download" | Auftraggeber-Wunsch 2026-10-21: Buttons in Grid und Liste verhalten sich einheitlich als Action-Button. Zelle zeigt nun Label statt reinem Icon | Dashboard-Aktionszelle, ungecommittet |
| Status-Tag im Grid | AC-28: Tag 7/15 px | Zusatzklasse `mt-tag-grid` (7/4 px) im Parameter-Grid, Spalte 100/110 px statt 59/69 px, Tag horizontal zentriert | Auftraggeber-Wunsch: "In Progress" vollständig sichtbar, Basis-Tag unverändert | Grid-Tag, ungecommittet |
| Grid-Dichte-Zusatzregel | Plan-Theme enthielt nur die Dichte-Regeln aus dem Brief | `MT_GRID_DENSITY` ergänzt um `.ag-row, .ag-cell { font-size: var(--ag-data-font-size); }` | Checkbox-Zelle hatte 13 px statt 13,12 px, Baseline (AC-25) sonst rot; Commit per amend vervollständigt | T12, 8e4951e2 |
| Zustandsanzeigen über Tokens | Plan: Optik an Material-Selektoren entfällt vollständig | siehe oben: Zustände bleiben als `var(--mt-…)`; fachliche Sonderflächen ohne Baustein dürfen Tokens nutzen | Spec-Entscheidung "Stylelint" erlaubt Token-Verweise für Sonderflächen | T19, 8451a93d |
| Eingaben der Formular-Hüllen: `unit` | Spec: umschließendes Element um Einheiten im Label, Text unverändert; Hüllen verlieren nur Optik-Eingaben | Hüllen `atlas-form-input`, `-minmaxinput`, `-nomminmaxinput` haben die Eingabe `unit` und rendern `<span mtUnit> ({{ unit }})</span>` im Label; `search-wizard-materials-section` übergibt `label='Thickness'` und `unit='mm'`; Spec angepasst (`thicknessInput.label()` = `'Thickness'`, `unit()` = `'mm'`) | zwingend, im Review offengelegt; ohne eigenes Element würden Versalien aus `mm` `MM` machen | T17, d5885eb1 |
| Tooltip | Spec/Vorlage: Innenabstand 30 px; Plan: `mtTooltip` setzt `tooltipClass` | Innenabstand 8 px/12 px (Spec-Entscheidung "Tooltip" ändert AC-31); `MtTooltipDirective` **überschreibt** `tooltipClass` auf `mt-tooltip`, ergänzt nicht | alle Tooltips sind kurze Texte; im Bestand gibt es keinen `matTooltipClass` (T13 geprüft), das Überschreiben ist deshalb folgenlos | T9, 38f1df6c; T13, acca17dc |
| Overlay-Klassen | Spec: zentrale Voreinstellungen von Material; eigene Panel-Klasse ergänzt `mt-dialog` | `MT_OVERLAY_PROVIDERS` (`MAT_DIALOG_DEFAULT_OPTIONS`, `MAT_SNACK_BAR_DEFAULT_OPTIONS`); Aufrufe mit eigener `panelClass` setzen `MT_DIALOG_PANEL_CLASS` selbst als ersten Eintrag; Snackbars mit Rolle über `mtSnackbarPanelClasses(role, …)`; `mtRoleClass(role)` steht in `mt-role.directive.ts` | Material führt eine eigene `panelClass` nicht mit der Voreinstellung zusammen; `mtRoleClass` als einzige Quelle für Direktive, Overlay und HTML-Renderer der Parameter-Tabelle (Plan-Review R1) | T10, 44d5ece3; T15, 2178051d |
| Direktive `mtButtonTile` | Spec-Liste kennt sie nicht | `mt-button-tile` (Querschnitt ohne Basis, Partial `_mt-button-tile.scss`: Kurzlabel 10 px, aktiv in Auswahlfarbe, `aria-disabled` mit Deckkraft 0,4) | Beleg im Bestand (Aktions-Kachel `app-atlas-action-btn`); Spec: "weitere kommen bei Bedarf mit Beleg" (Plan-Review R1 Task 16, 51 Direktiven) | T16, 14f8a6a8 |
| `REMOVED_OPTIC_INPUTS` und `remainingOpticInputs()` | je Hüllen-Spec eigene Liste der entfallenen Optik-Eingaben | gemeinsame Hilfe in `util/directives/testing/mt-directive.testing.ts` | Plan-Review R1 Task 16/17 | T16, T17 |
| Statusrollen-Zuordnung | Plan: Status-Klassen je Seite | `RESULT_STATUS_ROLES`/`resultStatusRole()` in `shared/result-status/parameter-set-result-status.ts`; Dashboard und Parameter-Tabelle nutzen sie; HTML-Renderer bildet die Klasse über `mtRoleClass()` | Direktiven wirken nicht in AG-Grid-String-Renderern (Plan-Entscheidung "Ergebnis-Status der Parameter-Tabelle") | T15, T22 |
| Score-Gewicht | Spec: Gewichte nur 300 und 700; Bestand 600 | Score-Zellen in 700 (`fontWeight: '700'` in `search-results-grid.component.ts`) | AC-64; im Plan-Review R1 festgelegt, Spec-Erwartung angepasst | T12, T22 |
| Datepicker-Panel | Spec: Klasse am Overlay | Kartenfläche über die globale Klasse `.mat-datepicker-content` | Das Kalender-Panel hat am Feld keinen Haken für eine Klasse (im Brief vorgegeben; Review 🟢) | T8, f84b07f6 |
| `mt-range` ohne Override-Mixin | Spec: Partials nutzen zuerst Override-Mixins | `_mt-range.scss` setzt Schrift und Farbe direkt | Brief-vorgegeben; kein Mixin für das Eingabeelement; Review 🟢 | T8, f84b07f6 |
| Bundle-Budget | Spec: Warnung ab +30 %, Fehler ab +50 % der Startgröße | Budget eingeführt, aber **Warnschwelle bewusst überschritten**: 30 933 B (+47,2 %), später 30 966 B | Override-Mixins sind größer als erwartet; erwartete Ersparnis aus T21 (~5 kB) trat nicht ein (T21 maß 30 730 B, +203 B); Plan-Entscheidung "Bundle-Budget": Warnung hinnehmen, Budget nie anheben ohne Rücksprache | T23, 13d3d8f5 |
| Rote Browser-Tests | AC-46: alle Tests grün | Zwei vor der Umsetzung rote Tests (`create-experiment.spec.ts` "creates an experiment from the wizard form", `serverside-validation.spec.ts` "parameter set save failure surfaces an aggregated server-validation snackbar") repariert; Mocks erweitert | vorbestehend rot (Basis-Lauf umfasste nur dotnet und Angular-Unit); Plan-Entscheidung "Rote Browser-Tests": Reparatur-Task | T24 (Urteil), T26, 2ad8b4c6 |
| Messliste | Plan: eine Zeile je manuellem AC | Zusatzzeilen: AC-20 je Baustein, AC-32 Dialog-Hülle gegen Inhalt, AC-66 Rollenfarbe gegen Komponenten-Stylesheet, AC-24/25 Grid-Padding | Controller forderte sie, damit in Reviews gefundene ungemessene Zielwerte nicht verloren gehen; Liste 8 Zeilen länger, AC-25 doppelt geprüft | T25, 9a34abee |
| Header-Padding Messliste | konkretes Soll | "wie Basis-Stand 84752ef9", kein Spec-Wert | Spec nennt keinen Wert | T25 |
| Lint auf Fehler | Plan Task 27: Schweregrad umstellen | `MT_SEVERITY = "error"` in `eslint.config.js` und `'error'` in `stylelint.config.mjs`; `mt-severity.test.mjs` | AC-54 | T27, 5dab09a8 |
| Panel-Header-Button im Such-Wizard | Plan: eigene Maße 28 px | Maße und Farbe entfallen, Button bleibt 44 px (AC-07); keine Kompakt-Ausnahme | Controller-Urteil: Überlauf der Kopfzeile im Fix-Bericht melden, nicht per Ausnahme lösen; Entscheid über Kompakt-Ausnahme beim Menschen | Final, 6536bb04 |
| Icon-Buttons in `mat-option` | Spec kennt keine Ausnahme "Aktion in Option" | bleiben 24 px (`.task-option-copy`, `.task-option-delete`, `setup-page`); nur die Farbe von `-delete` entfällt nicht in dieser Welle | Lücke in Spec/Plan; Final-Review 🟡; Mensch entscheidet | Final, 6536bb04 |
| Unit-Header `height: 32px !important` | Plan-Zwischenstand T13 | geteilte Regel (`overlay-apply-btn`, `inline-modal-btn`, `secondary-btn`) komplett entfernt statt nur `secondary-btn` | T13/T14 meldeten es als Rest; T20 bereinigt | T20, ba744d8f |
| Einheit im Grid-Header: Farbe und Umschalter | Spec AC-58 nennt nur die Schreibweise; Bestand: Einheit grau (`color-hint`, Deckkraft 0,85), Umschalter grau umrandet | Einheit erbt die weiße Header-Schrift (Deckkraft 1); Umschalter (`.unit-option`) weiß umrandet und transparent, aktiv weiß gefüllt mit Schrift in Header-Farbe (`color-grid-header`) | Kontrast auf `#899fb2` zu gering; Wunsch des Auftraggebers im Chat; Spec schweigt zur Farbe, kein Widerspruch zu AC-24/58 | Branch-Stand f4636baf plus Einheit-Farbe (ungecommittet) |
| Atlas-Tokens | Bestand: `--atlas-*` | `src/styles/_tokens.scss` entfällt (180 Zeilen), alle Verweise auf `--mt-*` | T21: globale Partials auf Tokens | T21, db1bb0ba |
| `.filter-panel.has-filters` | Plan: `!important` entfällt | behält begründetes `!important` ("überstimmt die Flächenfarbe der mt-Panel-Voreinstellung"); Notwendigkeit im Browser ungeprüft | Bedenken T20 | T20, ba744d8f |

### Spec-Änderungen durch Review R1 und `W`-Einträge

Die Spec wurde im Review R1 und durch die W-Einträge der Entscheidungen mehrfach geändert (Quelle: Abschnitt "Entscheidungen" der Spec). Wer eine Elementseite ändert, soll diese Fassung kennen:

| Eintrag | Änderung | Wirkung |
|---|---|---|
| R1 · AC-51 | Klarstellung: `mt-compact` ist Ausnahme der Regel "jede Direktive wirkt nur an ihrem Element" | [Kompakt und Einheit](compact-and-unit.md) |
| R1 · AC-60 | Klarstellung: Verfeinerung am Hüllen-Host wirkt auf den inneren Button | [Button](button.md) |
| R1 · Flächen | Trennung Direktiven (mt-dialog-header/-content/-actions) und Klassen ohne Direktive (`mt-dialog`, `mt-snackbar`); Tests je Direktive nur für Direktiven | [Dialog](dialog.md), [Snackbar](snackbar.md) |
| R1 · Querschnitts-Direktiven | `mt-compact` einzige Querschnitts-Direktive mit Wirkung über ihr Element | [Kompakt und Einheit](compact-and-unit.md) |
| R1 · Theoretisches Verhalten | "Alle Formen eckig" wird zu Radius 0 mit Ausnahmen Zähler 20 px, Tag und Checkbox 2 px | [Zielwerte](targets.md) |
| R1 · Soll-Vorgaben (Frage) + W · Soll-Vorgaben | Erfolgs-/Fehlertexte der Result-Seite: nur Schriftfarbe ohne Fläche/Rahmen (neues AC-66) | [Tag und Rolle](tag-and-role.md) |
| W · Doppelangabe | ersetzt die frühere Fassung von AC-37 (Doppelangabe harmlos): Lint meldet Fehler | [Durchsetzung](enforcement.md) |
| W · Ort von mt-field | `mt-field` am Container, Control-Direktiven eigene Basen; ersetzt "mt-field ist Basis aller Feld-Direktiven", präzisiert AC-36 | [Formularfeld](field.md), [Eingabe](input.md) |
| W · Eine Achse je Verfeinerung | Kombi-Direktiven entfallen; `mt-button-icon`, `mt-button-badge`, `mt-input-action` ohne Basis | [Button](button.md), [Eingabe](input.md) |
| W · Hüllen mit Verhalten | alle Hüllen bleiben; ersetzt die Einordnung als reine Optik-Hüllen in AC-44 | [Button](button.md), [Panel](panel.md), [Dialog](dialog.md) |
| W · Stylelint | Literale verboten, Token-Verweise für Sonderflächen erlaubt; präzisiert AC-39 | [Durchsetzung](enforcement.md) |
| W · Wert im Auswahlfeld | nur Label und Platzhalter in Versalien, gewählter Wert 15 px Light; präzisiert AC-20 | [Auswahl](select.md) |
| W · Tooltip | Innenabstand 8/12 px statt 30 px; ändert AC-31 | [Menü und Tooltip](menu-and-tooltip.md) |
| W · Grid-Farben | TRUMPF-Tabellenwerte ersetzen die zuvor geratenen | [Grid](grid.md) |
| W · Grid-Theme | alte Theme-Klasse und globales Grid-Stylesheet entfallen; die abweichende Selektionsfarbe des Suchergebnis-Grids wird vereinheitlicht | [Grid](grid.md) |
| W · Vorher-Stand | erster Schritt ist ein Playwright-Messtest; AC-46 auf grüne Tests, Build, Texte und Routen präzisiert | [Zielwerte](targets.md) |
| W · Workitem | 312482 ersetzt 000000, Basis dev | - |
| W · Dialoge ohne Hülle | 11 Dialoge erhalten die Direktiven an ihren Elementen; Ausgangslage korrigiert auf 3 von 14 | [Dialog](dialog.md) |
| W · Button-Syntax, Pflicht-Verfeinerung, Umstellungsregel, Icon-Danger | `matButton`/`matIconButton` mit genau einer Verfeinerung; Raised entfällt; "Delete Experiment" bewusst rot; Icon-Danger transparent mit rotem Icon | [Button](button.md) |
| W · Schriftgewichte | Roboto nur 300 und 700 | [Typografie](typography.md) |
| W · Erscheinungsbild-Eingabe | Eingabe für das Erscheinungsbild der Formular-Hüllen entfällt | [Formularfeld](field.md) |

### Plan-Review R1 (Änderungen am Plan vor der Umsetzung, die im Code stehen)

| Änderung | Wirkung im Code | Task |
|---|---|---|
| Lint-Gate `scripts/mt-lint-gate.mjs` und gemeinsame `mt-directive-map.json` | beide existieren; Lint und Template-Codemod lesen dieselbe Zuordnung | T3 |
| Version von AG Grid als Node-Test (`readFileSync`, kein `require`) | `scripts/mt-ag-grid-version.test.mjs` | T1 |
| `mtRoleClass()` neben `MtRole` | `mt-role.directive.ts` | T10 |
| Ablage: Partials unter `src/styles/mt/<gruppe>/` (2026-10-21 nach Fachlichkeit gruppiert, Index je Gruppe und Wurzel-Index `_index.scss`), Token-Map, Typografie und Lade-Platzhalter direkt unter `src/styles/` | die 2-kB-Grenze gilt nur für `src/styles/mt/**/*.scss` | Plan-Entscheidung E |
| Partials in Fachgruppen (2026-10-21, Anweisung im Chat, bestätigte Abweichung von der Ablage `styles/mt/_mt-<name>.scss`) | Gruppen `foundation`, `buttons`, `forms`, `cards`, `overlays`, `navigation`, `grid` mit je eigenem `_index.scss`; Stylelint-Override jetzt `src/styles/mt/**/*.scss`; Ausgabe regelgleich (nur `mt-button-tile` rückt nach vorn, kein Konflikt) | Ordnung nach Fachlichkeit, Grundlage für späteres Nachladen einzelner Bereiche | Anweisung 2026-10-21 |
| Barrel `MT_DIRECTIVES` | Komponenten importieren ein Array statt Einzelimporte; `mt-directive-imports.test.mjs` sichert ab | Plan-Entscheidung E |
| Stylesheets über 3000 Byte teilt ein Skript (`<name>-<n>.component.scss`) | z. B. `parameters-page-2.component.scss`, `sidebar-2.component.scss` | T19 |
| Basisschrift `clamp(13px, 1.8vh, 16px)` läuft nicht durch den Style-Codemod | `_app-reset.scss` unverändert | Plan-Entscheidung E |
| Zeilenhöhe Parameter-Grid `[rowHeight]="28"` im Template | ein Theme für alle Grids | T12 |

### Verfahrensabweichungen (wirken nicht auf den Code, aber auf das Vertrauen in einen Task)

| Task | Abweichung | Folge |
|---|---|---|
| T10 | Arbeitsbaum enthielt beim Start Teile des Tasks (unterbrochener Umsetzer); ROT-Lauf nicht dokumentiert | Review sauber, aber 🟡 |
| T12 | kein ROT-Lauf; Commit per amend vervollständigt (lokal) | 🟢 |
| T16 | TDD nicht eingehalten (Implementierung vor erstem Testlauf) | 🟡 |
| T19 | Hook blockiert `npm run`; Umsetzer rief `lint:styles`/`check:tooling` direkt über `npx`/`node` | Stylelint- und Suite-Belege nur im Bericht; Fix-Lauf wiederholte sie |
| T25 | Umsetzer schrieb keinen Bericht; Controller übernahm den Hand-back | - |
| T26 | Schritt 1 (ROT vor Änderung) nicht separat gelaufen | 🟢 |
| T13, T19 | Review mit opus statt sonnet wegen großer Diffs (126 Dateien bzw. Codemod über ~60 Stylesheets) | nur Token-Kosten |
| T18 | `eslint --max-warnings 0` Exit 1 wegen 2 Bestandswarnungen am `<span (click)="$event.stopPropagation()">` in `atlas-panel.component.html` (Plan-Markup, vorher schon so) | mt-Befunde nicht betroffen |

## (b) Offene Punkte und zurückgestellte Befunde nach Element

Quelle: Ledger-Zeilen "zurückgestellt", "Bedenken", "Final:". 🟡 = relevant, 🟢 = Nachsicht.

| Element (Seite) | Punkt | Task / Commit |
|---|---|---|
| [Direktiven-Modell](directive-model.md) | 🟢 `hostClasses`/`cssClass` doppelt gepflegt (Button-Direktiven) | T6, e2e6b93a |
| | 🟡 `MT_BUTTON_VARIANT`-Kommentar: verschachtelter Button in einer Hülle mit Verfeinerung erbt; Hüllen-Tasks beachten | T6, e2e6b93a |
| | 🟢 `mt-tag.spec` Imports doppelt; `mt-role.spec` prüft nur den Wert `error` | T5, 0522a4cd |
| | 🟡 Specs prüfen nur Host-Klasse (brief-konform) | T11, 698a7ac5 |
| [Token](tokens.md) | 🟢 `_mt-tokens.scss:229` `///`-Kommentar wirkt wie Sassdoc | T4, 3e9ffb72 |
| | 🟢 `shadow-ring-*`/`shadow-inset-accent` wiederholen Farbliterale statt Token-Verweis | T4, 3e9ffb72 |
| | 🟡 durchscheinende Abdunkelungen (`atlas-a-000000-6`, `atlas-a-ecf1f6-85`) -> deckende Tokens; Scrim-Token fehlt | T19, cbb95934 |
| | 🟢 `mt-tokens.test` `ruleBody` schneidet am ersten `}` | T23, 13d3d8f5 |
| [Typografie](typography.md), [Seite und Layout](page-and-layout.md) | 🟡 geteilte Stylesheets: Kommentare zerrissen/falschem Teil zugeordnet, `$measurement-block-gap` in `result.component.scss` ungenutzt | T19, cbb95934 |
| | 🟡 verwaiste Kommentare in `experiment-dashboard-grid.component.scss:5` und `experiment-wizard-shell.component.scss:39` | T19, cbb95934 |
| | 🟡 Codemod-Tests ohne Randfälle für Kommentare an Teilgrenzen | T19, cbb95934 |
| | ✅ `_user-menu.scss` (nur Kommentar) gelöscht und aus `styles.scss` entfernt | T21, db1bb0ba |
| | 🟢 Leerzeile in `_result-overrides.scss` | T21 |
| | 🟢 Kommentar-Sprachmischung in `atlas-panel.component.scss` | T18, e46be1e9 |
| [Button](button.md) | 🟡 Icon-Buttons `.task-option-copy`/`.task-option-delete` in `mat-option` 24 px (Lücke Spec, Mensch entscheidet) | Final, 6536bb04 |
| | 🟢 Toolbar-Icon-Button `parameters-page` 32 x 32 unskaliert; `autopilot-unified__toggle` 86 x 38 (ungeprüft) | Final |
| | 🟡 `panel-header-btn` (Such-Wizard, 7 Stellen) bleibt 44 px; Überlauf der Kopfzeile ungeprüft; Kompakt-Ausnahme Entscheid beim Menschen | Final |
| | 🟢 stilles `primary` bei dynamischem `[color]` an der Hülle (kommt im Bestand nicht vor) | T13, acca17dc |
| | 🟢 `hasButtonRefinement` steht vor `hasName` im Codemod | T13 |
| | 🟡 kein ROT-Lauf bei den Button-Hüllen | T16, 14f8a6a8 |
| | 🟢 `badge`-Spec prüft nur die Host-Klasse | T6 |
| | 🟢 `mt-button-badge-count` laut Plan in T16 vergeben | T6/T16 (geklärt) |
| [Formularfeld](field.md), [Eingabe](input.md) | 🟡 `mt-readonly.spec` testet nur den Zweig `input[matInput][readonly]`, nicht `textarea`/`mat-select`/`matChipInputFor` | T7, 57d8f47d |
| | 🟢 `mt-field.spec` Pseudo-Arrange `imports = IMPORTS` | T7 |
| | 🟡 rohe px-Werte (`max-height: 320px`, `padding: 8px`, `line-height`) in `multi-select`/`nomminmax`-Stylesheets (außerhalb Scope) | T17, d5885eb1 |
| | 🟢 `mat-error` Formatierung (Bestand) | T17 |
| | 🟢 Pflichtfeld-Markierung in `setup-page` schwächer als vorher | T19, cbb95934 |
| | `ai-filled`-Markierung (`result-measurements`) im Browser nicht geprüft | Final, 6536bb04 |
| | 🟢 `request-access.component.scss` verschachteltes `mat-icon { color }` bleibt | T14, 56ea7b9e |
| [Auswahl](select.md), [Bereich und Datum](range-and-datepicker.md) | 🟢 `_mt-datepicker.scss` globaler Selektor `.mat-datepicker-content` (Brief-vorgegeben) | T8, f84b07f6 |
| | 🟢 `_mt-range.scss` ohne Override-Mixin | T8 |
| [Auswahl-Steuerelemente](choice-controls.md) | Zielwerte Schalter/Checkbox/Radio/Chip erst in T24/T25 aufgenommen (Messliste), nicht im Browser gemessen | T8, T25 |
| [Fläche und Karte](surface-and-card.md) | 🟡 `.mt-role:not(.mt-tag)` gegen Komponenten-CSS: Rollenfarbe-Vorrang nur im Browser prüfbar (Messliste AC-66) | T14, T25 |
| [Panel](panel.md) | 🟡 `.filter-panel.has-filters` behält `!important`; Begründung `search-filter-sidebar.component.scss:450-453` ungeprüft (Browser) | T20, ba744d8f |
| | 🟡 `parameters-page.component.scss:253-255` Bausteinmaße (`min-height` 32/26 px, `line-height` 26 px) — im Final-Review behandelt | T20 -> Final |
| | 🟢 Optik-Gleichheit Hülle gegen Dialoge ohne Hülle (`padding: 0` ohne `!important` gegen `mt-dialog-content`) nur im Browser prüfbar | T18, e46be1e9 |
| [Dialog](dialog.md) | 🟡 `_dialogs.scss:4` Kommentar nennt `MT_DIALOG_PANEL_CLASS` nicht | T10, 44d5ece3 |
| | 🟢 `atlas-wizard-dialogs.ts` Import vor Datei-Kommentar | T10 |
| | Dialog-Hülle gegen Inhalt (AC-32): Messliste-Zeile, nicht gemessen | T25 |
| [Menü und Tooltip](menu-and-tooltip.md) | 🟡 `mt-menu.spec` testet nur den Fall ohne bestehende `panelClass` | T9, 38f1df6c |
| | 🟡 `mt-tooltip` überschreibt `tooltipClass` statt zu ergänzen (kein Bestand mit `matTooltipClass`, T13 geprüft) | T9, T13 |
| | 🟢 `mt-menu` `ngOnInit` setzt `overlayPanelClass` nur einmal | T9 |
| [Tabs und Navigation](tabs-and-nav.md) | 🟡 Selektoren `.mat-mdc-list-item`, `.mdc-tab--active`, `.nav-group-header` aus dem Plan: Wirkung im Bestand-Markup in T13 geprüft (`.nav-group-header` existiert, die beiden anderen erzeugt Material), Browser: Nav-Item seit T24/1a0f812f gemessen; Tab-Wirkung nur Messliste | T11, T13, T24 |
| | 🟡 Verschlanktes Theme (2026-10-21): `_theme-used.scss` ist erzeugt, der Abdeckungs-Wächter läuft nur mit einem Build unter `dist/trumpf_frontend` (sonst übersprungen); nach neuer Material-Komponente oder Material-Update `--write --from-dist` ausführen | Anweisung 2026-10-21 |
| | 🟡 Zuletzt-Eintrag (2026-10-21): zweite Zeile `font-weight-light` (bestätigte Abweichung vom Menü-Zielwert 700), Breite auf Sidebar begrenzt (5 px Rand, Ellipsis); Sichtabnahme am echten Eintrag mit gemerktem Wizard-Ort steht aus | Anweisung 2026-10-21 |
| | 🟡 Benutzermenü (2026-10-21): Name im Sidebar-Auslöser (`mtNavItem`), Admin im Menü mit Divider vor Logout; Sichtabnahme steht aus, `mat-divider` ohne mt-Direktive | Anweisung 2026-10-21 |
| | 🟡 Tab-Untertitel (2026-10-21): Anthrazit `#383E42` gewählt, Wert nicht vom Auftraggeber genannt; Messung nur an synthetischem Markup; Sichtabnahme steht aus | Anweisung 2026-10-21 |
| | AC-23 aktiver Eintrag: Browser-Test grün seit 1a0f812f | T24 |
| [Grid](grid.md) | 🟡 `mt-grid-baseline.spec.ts:342-345` Score-Test ohne Retry (mögliche Flake-Quelle) | T1, ab231189 |
| | 🟢 `.sort()` ohne Komparator (Baseline-Test) | T1 |
| | 🟢 Selektor `[mtGridEditor]` gegen `mat-form-field[mtGridEditor]` (Brief intern widersprüchlich) | T12, 8e4951e2 |
| | 🟢 `MT_GRID_CELL_COLORS`-Schlüssel ohne Verbraucher bis T22 (T22 verbindet sie) | T12 -> T22 |
| | 🟢 doppelte Leerzeilen nach Block-Entfernung | T12 |
| | Dichte/Header-Padding-Abdeckung der Baseline und Theme-Vorrang: in T24 gemessen; Kopfzellen-Padding ohne konkretes Soll | T12, T25 |
| [Tag und Rolle](tag-and-role.md) | 🟢 `scoreText` und `SCORE_TEXT_ON_LIGHT` doppelt (`#000000`, Brief-vorgegeben) | T22, 254b51ad |
| | 🟢 Klassen-Literal `'mt-tag mt-role'` neben `mtRoleClass` | T22 |
| | 🟢 `CommonModule`-Import in `status-cell` überflüssig; `experimentStatusRole='neutral'` redundant | T15, 2178051d |
| | 🟢 `report.component` Spinner-Abdunkelung `::before` mit `--mt-color-text` `opacity: 0.4` (`color-mix` verboten) | T19 |
| [Snackbar](snackbar.md) | keine eigenen offenen Punkte; Direktaufrufe im Wizard erhalten Klassen direkt, Umstellung auf den Snackbar-Service ist Nicht-Ziel der Spec | Spec |
| [Kompakt und Einheit](compact-and-unit.md) | Überlauf der Wizard-Fußleiste und der Such-Wizard-Kopfzeile im Browser nicht geprüft | Final, 6536bb04 |
| | 🟢 `mt-placements.test` prüft nur Textvorkommen (plan-vorgeschrieben) | T14, 56ea7b9e |
| | 🟡 Farben des Einheiten-Umschalters (`.unit-option`) stehen als `var(--mt-…)` im Komponenten-SCSS (`unit-header-3.component.scss`), nicht in einem zentralen Partial: Prinzip "keine Farbe in Komponenten" nur dem Wortlaut nach (Stylelint erlaubt Token-Verweise); zentral wäre erst nach Budget-Entscheid möglich (rund 0,5 kB Luft, Build meldet zuletzt 31,11 kB bei Fehlergrenze 31,52 kB) | Einheit-Farbe, ungecommittet |
| Werkzeuge ([Durchsetzung](enforcement.md)) | 🟡 `mt-config.test.cjs` deckt Config-Teile nicht ab | T3, 9ce2cc91 |
| | 🟡 `mt-stylelint.test.mjs` nur mit `cwd = src/frontend` | T2, 8a9f3407 |
| | 🟢 `ELEMENT_REQUIREMENTS` doppelt gelesen (Lint und Codemod) | T3 |
| | 🟡 `mt-migrate-templates.test` `assert.throws` ohne Matcher (Brief-Code) | T13 |
| | 🟢 `mt-severity.test` "// Arrange / Act" zusammengefasst; Regex ohne Treffer -> unklare Meldung | T27, 5dab09a8 |
| | 🟢 Test-Name `UpTo2048Bytes` prüft die Grenze nicht exakt; `package.json` Whitespace; transitive Lockfile-Anhebungen | T2 |
| | 🟡 `mt-targets.spec` Testnamen frei formuliert (Plan-Code); "Kompakt-Stufe und Hüllen" bündelt drei Aussagen mit strukturellem Selektor | T24, d4e641a3 |
| | 🟢 `serverside-validation.spec.ts:280` Zeile ~130 Zeichen; `mockedUsers` dupliziert Struktur aus `create-experiment-api-mock.ts` | T26, 2ad8b4c6 |
| | Bestandsfehler `no-this-alias` in `experiment-dashboard.service.spec.ts:166` (`dv-angular-lint`), nicht Teil der Arbeit | Bericht |
| Budget | ✅ verschlankt (2026-10-21): 24,31 kB von 31 522 B (vorher 31,38 kB, dann 27,75 kB mit verschlanktem Theme); Warnschwelle wieder eingehalten, Regeln in [enforcement](enforcement.md#bytes-sparen-was-nicht-ins-css-gehört) | T23, T24, Bericht |

## (c) Spec-/Plan-Lücken

| Lücke | Stand | Wo |
|---|---|---|
| Icon-Buttons in `mat-option` (24 px) | Spec kennt keine Ausnahme "Aktion in Option"; Mensch entscheidet (Ausnahme oder Kompakt-Stufe) | [Button](button.md), Final 🟡 |
| `mat-button-toggle` (Score-Editor, Bewertungsgruppe, Sales-Report) | weder Direktive noch Lint-Regel (Eintrag in `mt-directive-map.json` fehlt) | Bericht, [Durchsetzung](enforcement.md) |
| Bundle-Budget | 24,31 kB, rund 3 kB bis zur Warnung, 7,2 kB bis zum Fehler; Plan verbietet Anheben ohne Rücksprache | [Durchsetzung](enforcement.md) |
| Header-Padding der Grids | Spec nennt keinen festen Wert; Code setzt `0 0.125rem` (Dichte-Part); Messliste "wie Basis-Stand" | [Grid](grid.md), T25 |
| Panel-Header-Button im Such-Wizard | Spec kennt keine Kompakt-Ausnahme für 28-px-Header-Buttons; Kopfzeile wirkt evtl. größer | [Button](button.md), Final |
| Text-Button-Rand | Spec: "keinen Rand"; Code: `1px solid transparent` | [Button](button.md), [Zielwerte](targets.md) |
| Rand für Eingabefokus an Buttons | Spec: "schwarzer Rahmen"; Code: Button #000000 mit Abstand 2 px, Feld #0B0B0B | [Zielwerte](targets.md) |
| Dialog-Maße | AC-32 "gleich", keine Zahlen; Zahlen stehen nur im Code (Header `1.25rem 1.5rem 1rem`, Content `1.25rem 1.5rem`, Aktionen `1rem 1.5rem 1.25rem`) | [Dialog](dialog.md) |
| Scrim-Token | durchscheinende Abdunkelungen sind auf deckende Tokens abgebildet; ein Scrim-Token fehlt | [Token](tokens.md), T19 |
| Hex-Farben in externen HTML-Templates | kein Werkzeug prüft sie (Stylelint prüft SCSS, ESLint-Selektoren TS); `#ba1a1a` wurde von Hand gefunden | [Durchsetzung](enforcement.md), Final |
| Bausteinhöhen in Komponenten | nur im Review prüfbar, kein Werkzeug | [Durchsetzung](enforcement.md) |
| Browser-Abnahme | Messliste unabgenommen (39 Zeilen, Ist/ok leer), Sichtabnahme gegen Referenzbilder steht aus | [Zielwerte](targets.md) |
| ungemessene Zielwerte | Platzhalter #A3A3A3, vertikaler Feld-Innenabstand, Pflicht-Stern, gerenderte gewählte Grid-Zeile | [Zielwerte](targets.md) |

## (d) Stand der Gesamtprüfung

Letzter Gesamtlauf auf **6536bb04** (Ledger und Umsetzungsbericht, nicht neu ausgeführt; danach nur Dokumentations-Commits a89f1fff, b9dbc15d):

| Prüfung | Ergebnis |
|---|---|
| Angular-Unit | 2208 Tests grün |
| Playwright | 36 passed, 3 skipped |
| Node-Tooling-Tests | 142/142 |
| Stylelint | ohne Befund |
| mt-Lint-Gate | 0 Befunde |
| dotnet-Suite | 0 Failed (auf 5dab09a8) |
| Production-Build | ohne Fehler; globales Stylesheet 30,97 kB (+47 %), Warnschwelle (+30 %) überschritten (erwartet), Fehlergrenze 31 522 B |
| Tasks | 27 von 27 umgesetzt und reviewt, danach Final-Review mit Fix-Welle (3 🔴 + `beheben`-Punkt + 2 Controller-🟡 behoben, Re-Review ohne neue 🔴) |
| Messliste, Sichtabnahme | stehen aus |

Verlauf der Gesamtläufe (Angular-Unit, jeweils auf dem genannten Commit, Ledger): 0522a4cd 2105, e2e6b93a 2123, 57d8f47d 2137, f84b07f6 2152, 44d5ece3 2171, 6523c579 2175, 698a7ac5 2175, 8e4951e2 2179, acca17dc 2179, 56ea7b9e 2179, 2178051d 2181, 14f8a6a8 2185, d5885eb1 2198, e46be1e9 2204, cbb95934 2204, 8451a93d 2204, ba744d8f 2204, db1bb0ba 2204, 254b51ad 2208, danach 2208 bis 6536bb04.

## Ändern: Checkliste

1. Änderung an einem Element: zuerst die Elementseite lesen, dann diese Seite nach dem Element durchsuchen (offene Punkte, bewusste Abweichungen), damit ein bewusster Stand nicht rückgängig gemacht wird.
2. Neue Abweichung von Spec/Plan oder neuer offener Punkt: hier mit Task-Nummer oder Commit-Hash eintragen (Tabelle (a) bzw. (b)).
3. Behobener offener Punkt: Zeile in (b)/(c) streichen und in (a) nachtragen.
4. Gesamtprüfung nach Änderungen neu laufen lassen und den Abschnitt (d) mit neuem Commit-Hash aktualisieren.
5. **Diese Referenzseite im selben Zug korrigieren.**
