# Zielwerte und Abnahme
Stand: Code-Stand Branch dev, Commit 31c0f0a8 plus Grid-Header-Farbe `#56788f` (ungecommittet) (2026-10-27)

> Alle messbaren Zielwerte der Spec, nach Element gruppiert, mit dem Wert im Code, der Quelle (Token/Partial) und der Prüfart (Playwright, Handliste oder ungeprüft).

Quellen: Spec `docs/specs/312482-mytrumpf-optik-mt-direktiven.md` (ACs), Code `src/frontend/src/styles/_mt-tokens.scss`, `styles/mt/**/_mt-*.scss`, `app/util/grid/mt-grid-theme.ts`. Bei Konflikt gilt der **Code-Wert**; Abweichungen sind in der Spalte "Abweichung" markiert (nichts geschätzt).

## Prüfarten

| Kürzel | Bedeutung |
|---|---|
| **PW:T** | Playwright `e2e/tests/mt-targets.spec.ts` (Zielwerte-Test, Basisschrift 16 px bei 1280x900) |
| **PW:F** | Playwright `e2e/tests/mt-foundation.spec.ts` |
| **PW:B** | Playwright `e2e/tests/mt-grid-baseline.spec.ts` (eingefrorener Vorher-Stand) |
| **HL** | Handliste `e2e/mt-messliste.md`, Zeile mit dieser AC-ID; Spalten **Ist** und **ok** sind leer = noch nicht abgenommen |
| **Unit** | Unit-Spec prüft nur Klasse/Voreinstellung/Vererbung, **keinen** Pixel- oder Farbwert |
| **Node** | Node-Tooling-Test (siehe [Durchsetzung](enforcement.md)) |
| **-** | weder Playwright noch Handliste: nur im Code belegt |

## Was jeder Playwright-Test misst

| Datei | Test | misst |
|---|---|---|
| PW:T | Primär-Button: 44 px, grün, weiße fette Versalien 13 px, eckig, Innenabstand 36 px | Button "Search" im Such-Wizard: Höhe 44, Hintergrund und Rand `rgb(187,208,58)`, Schrift weiß, Gewicht 700, 13 px, `uppercase`, Radius 0, Padding links/rechts 36 px |
| PW:T | Primär-Button unter dem Mauszeiger | Hover: Hintergrund weiß, Schrift und Rand grün |
| PW:T | Formularfeld: 44 px, weiß, Rand 1 px grau, eckig, Label oben ... | Feld "Machine" (mat-select): Wrapper-Höhe 44, Hintergrund weiß, Outline `rgb(116,116,116)` 1 px, Radius 0, Padding links 20 px, Wert 15 px/300, Label 13 px/700/uppercase/schwarz, Abstand Label zu Feld 9 bis 11 px |
| PW:T | Formularfeld: Label beginnt am linken Feldrand und ist nicht abgeschnitten | alle `mat-form-field` mit Label im Such-Wizard: `mat-label`-Box links höchstens 1 px vom `.mat-mdc-text-field-wrapper` entfernt |
| PW:T | Karte: Seite "Login fehlgeschlagen" ... | `app-login-failed .mt-card`: Hintergrund weiß, Rand 0, Radius 0, Schatten `rgba(19,19,19,0.1) 0 5px 25px 0`; `body` `rgb(239,240,244)`; `.mt-page-title` 23 px / 300 |
| PW:T | Grid <Dashboard, Suchergebnisse, Aktivitäten, Parameter>: TRUMPF-Tabellenfarben (je Seite) | `.ag-header` `#56788F`, `.ag-row-odd` `#EAEDF2`, `.ag-row-even` weiß, Zeilen-Unterkante `#E2E2E2` |
| PW:T | Grid <je Seite>: Auswahl #C6D4DD und Hover #F7FAE9 aus dem zentralen Theme | die Theme-Variablen `--ag-selected-row-background-color` und `--ag-row-hover-color` (über eine Probe aufgelöst), **nicht** eine gerenderte gewählte Zeile |
| PW:T | Grid <je Seite>: Spalten-Header in Light, Gruppen-Header fett | `.ag-header-cell-text` und `.label` in Spalten-Headern (ohne `group-summary-header`): Gewicht 300; `.ag-header-group-text`: 700 |
| PW:T | Grid Dashboard: Header in weißen Versalien 13 px, Zeile unter dem Mauszeiger #F7FAE9 | Header-Text weiß/`uppercase`/13 px; Hover-Farbe am `::before` der Zeile |
| PW:T | Grid Suchergebnisse: Einheit im Header ... | `.mt-unit` Text `(mm/s)`, `text-transform: none`; `.label` `uppercase` |
| PW:T | Grid Suchergebnisse: Einheit im Header in derselben weißen Schrift wie das Label | `.mt-unit` und `.label` Farbe `rgb(255,255,255)`, Einheit Deckkraft 1 |
| PW:T | Grid Parameter: Einheiten-Umschalter weiß umrandet, aktiv weiß gefüllt mit Schrift in Header-Farbe | `.unit-option` (Spalte `WeldingSpeed` im Mock): Rand/Schrift weiß, Hintergrund transparent; `.active`: Hintergrund weiß, Schrift `rgb(137,159,178)` |
| PW:T | Grid Parameter: Status-Tag mit 7/4 px Innenabstand, Status vollständig in der Zelle | `.ag-cell[col-id=resultStatus] .mt-tag` (Mock: Created, In Progress): Padding `7px 4px`, Tag liegt ganz in der Zelle |
| PW:T | Grid Parameter: Status-Tag horizontal in der Zelle zentriert | Mitte des `.mt-tag` höchstens 2 px neben der Mitte der Zelle `resultStatus` |
| PW:T | Grid Dashboard: Zellwerte der Experiment-Zeilen in Light | Zelle `lacId`: `font-weight` 300 |
| PW:T | Grid <je Seite>: Zellwerte vertikal zentriert | erste Zelle mit Text: Mitte des Textbereichs höchstens 1,5 px neben der Zellmitte |
| PW:T | Grid Parameter: nur Score und Ergebnis-Status fett, übrige Zellwerte Light | Status-Tag 700; Zellen `parametSetNumber`, `LaserPower` 300 |
| PW:T | Status-Tag Dashboard: 30 px, Radius 2 px, 7/15 px ... | `.mt-tag` "active": Höhe 30, Radius 2px, Padding `7px 15px`, 13 px/700/`uppercase`, Zeichenabstand `0.39px`, Schrift weiß, Hintergrund `rgb(40,81,114)` (Rolle Info) |
| PW:T | Linkes Menü: Einträge weiß, aktiver Eintrag #285172 ... | `app-sidebar .mt-nav-item`: Ruhe weiß, aktiv `rgb(40,81,114)` mit weißer Schrift, Hover `rgb(239,240,244)` |
| PW:T | Wizard-Tabs: Untertitel im aktiven Tab weiß, im inaktiven Tab Anthrazit | `#probe-active`/`#probe-inactive` mit Klasse `.mt-tabs-subtitle` in `.mt-tabs`/`.mdc-tab(--active)`, in die Seite `/experiments` eingefügt: aktiv `rgb(255,255,255)`, inaktiv `rgb(56,62,66)` (der Wizard-Shell zeigt mit den Mocks keine Tabs, daher synthetisch) |
| PW:T | Grid Suchergebnisse: Action-Button mit Icon direkt über dem Kurzlabel, Inhalt innerhalb der 32 px | erster `app-search-result-row-actions app-atlas-action-btn button` (Viewport 1600x900): Höhe von `.mdc-button__label` höchstens Höhe von `.mt-button-tile-label`, Abstand Icon-Unterkante zu Wrapper-Oberkante 0, Icon-Oberkante und Wrapper-Unterkante innerhalb des Buttons |
| PW:T | Grid Suchergebnisse: Action-Buttons (auch Like/Dislike) mit 8 px Light, Kurzlabel bleibt in der Kachel (Ellipsis bei Platzmangel) | erste Zeile, 6 `app-atlas-action-btn button` (Viewport 1600x900): `.mt-button-tile-label` Gewicht 300 und 8 px; Label-Box ragt links/rechts nicht über die Kachel |
| PW:T | Grid Dashboard: Aktionszelle mit Action-Buttons (Upload, Download) in 8 px Light innerhalb der Zeile | Mock: Experiment `Finished` mit Upload-/Download-Recht; Labels `Upload`, `Download`, Gewicht 300 und 8 px, Button liegt in der Zeile |
| PW:T | Kompakt-Stufe und Hüllen | Dashboard-Toolbar: Hüllen-Button `app-atlas-btn button` 32 px hoch und grün; Suchfeld-Wrapper 32 px; `mat-form-field` so breit wie sein Host `app-atlas-form-input.toolbar__search` (bündelt drei Aussagen) |
| PW:T | Skalierung: Primär-Button 44 px x 13/16 (Viewport 1280x720) | Button-Höhe = 44 x 13/16 = 35,75 (`toBeCloseTo(..., 1)`) |
| PW:F | Seite: Hintergrund #EFF0F4, Fließtext 16 px Light schwarz | `body`: `rgb(239,240,244)`, 300, 16 px, `rgb(0,0,0)` |
| PW:F | Schrift: Roboto nur 300 und 700 | der `<link>` auf Google Fonts enthält `wght@300;700` (prüft die Anforderung, nicht gerenderte Gewichte) |
| PW:F | Skalierung: Basisschrift 13 px (720 px Höhe) | `html` `font-size` = 13 px |
| PW:B | Grid <je Seite>: Zeilenhöhe, Schriftgröße, Zellabstand | erste Datenzelle: Zeilenhöhe 42 (Parameter 28), Zellschrift `13.12px`, Padding links `2px`, rechts `0px` (eingefroren) |
| PW:B | Score-Zellen: Bewertungsfarben | `OverallScore`-Zellen: Hintergründe `rgb(185,212,176)` (1), `(224,232,184)` (2), `(240,230,160)` (3), `(240,207,160)` (4), `(232,191,176)` (5), `(219,160,160)` (6) |

Gesamtlauf `6536bb04`: Playwright 36 passed, 3 skipped (Ledger). Die 18 Tests in `mt-targets.spec.ts` sind grün; die Test-Reihenfolge ist im Plan vorgegeben, Namen sind frei formuliert (Task 24, 🟡).

## Zielwerte nach Element

Alle Werte bei Basisschrift 16 px; Token-/Partial-Pfade relativ zu `src/frontend/src/styles/`. "Zustand": R = Ruhe, H = Hover, F = Fokus, D = deaktiviert, A = aktiv.

### Seite, Karte, Typografie (siehe [Typografie](typography.md), [Seite und Layout](page-and-layout.md), [Fläche und Karte](surface-and-card.md))

| Element | Eigenschaft | Wert | Zustand | AC | Code-Quelle | Prüfart |
|---|---|---|---|---|---|---|
| Seite | Hintergrund | #EFF0F4 | R | AC-01 | `color-page`; `_app-reset.scss` (`body`) | PW:T, PW:F |
| Karte | Hintergrund / Rand / Radius | #FFFFFF / keiner / 0 | R | AC-01 | `mt-surface` (`color-surface`, `border: 0`, `radius-none`) | PW:T |
| Karte | Schatten | 0 5px 25px 0 rgba(19,19,19,0.1) | R | AC-01 | `shadow-surface` (`0 0.3125rem 1.5625rem 0 rgba(19,19,19,0.1)`, rem skaliert) | PW:T |
| Seitentitel | Größe / Gewicht / Farbe | 23 px / 300 / #000000 | R | AC-33 | `.mt-page-title`, `font-size-2xl` (1,4375 rem) | PW:T (23 px, 300); Farbe HL |
| Abschnittstitel, Kartentitel | Größe / Gewicht | 20 px / 300 | R | AC-33 | `.mt-section-title`, `mt-card-title` (`font-size-xl`) | HL |
| Fließtext | Größe / Gewicht / Farbe | 16 px / 300 / #000000 | R | AC-33 | `font-size-base`, `font-weight-light`, `color-text` | PW:F (Body) |
| Schriftgewichte | gerendert | nur 300 und 700 | - | AC-64 | `_mt-tokens.scss` (`font-weight-light/-bold`); `index.html` `Roboto:wght@300;700` | PW:F (Link), HL (gerendert) |
| Lade-Platzhalter | Fläche / Schimmer | #EFF0F4 / #FFFFFF | R | AC-63 | `_mt-skeleton.scss` (`--ngx-skeleton-loader-base-color: color-page`, `light-mode-color: color-surface`) | HL |
| Seiten "Login fehlgeschlagen"/"Zugriff anfragen" | Karte, Titel, Buttons | Karte nach AC-01, Titel AC-33, Buttons AC-02 | R | AC-34 | `mtCard`, `.mt-page-title` | PW:T (Login-failed-Karte) |

### Button (siehe [Button](button.md))

| Element | Eigenschaft | Wert | Zustand | AC | Code-Quelle | Prüfart | Abweichung |
|---|---|---|---|---|---|---|---|
| Primär | Höhe | 44 px | R | AC-02 | `control-height` 2,75 rem (`_mt-button.scss`) | PW:T | |
| Primär | Hintergrund / Rand | #BBD03A / #BBD03A | R | AC-02 | `color-primary` | PW:T | Rand ist `1px solid transparent` aus `.mt-button`, `border-color` kommt von der Verfeinerung |
| Primär | Schrift | weiß, 700, 13 px, Versalien | R | AC-02 | `color-on-primary`, `font-size-sm`, `font-weight-bold`, `uppercase` | PW:T | |
| Primär | Radius / Innenabstand seitlich | 0 / 36 px | R | AC-02 | `radius-none`, `horizontal-padding: 2.25rem` | PW:T | |
| Primär | Hintergrund / Schrift / Rand | #FFFFFF / #BBD03A / #BBD03A | H | AC-03 | `_mt-button-primary.scss` (`&:hover:not(:disabled)`) | PW:T | |
| Sekundär | Hintergrund / Rand / Schrift | transparent / #0B0B0B / #0B0B0B | R | AC-04 | `color-ink` | HL | |
| Sekundär | Hintergrund / Schrift | #0B0B0B / #FFFFFF | H | AC-04 | `color-ink`, Schrift über `color-on-accent` (= #FFFFFF) | HL | Token-Name `color-on-accent` irreführend für "weiß auf Schwarz" |
| Text | Rand / Hintergrund / Schrift | keiner / transparent / #0B0B0B | R | AC-05 | `_mt-button-text.scss` | HL | Code: Rand `1px solid transparent` (aus `.mt-button`), also Breite 1 px, nicht "keiner"; unsichtbar, aber gemessen `border-width: 1px` |
| Text | Hintergrund | #EFF0F4 | H | AC-05 | `color-hover` | HL | |
| Danger | Hintergrund und Rand / Schrift | #FF0201 / weiß | R | AC-06 | `role-error` | HL | |
| Danger | Hintergrund / Schrift und Rand | #FFFFFF / #FF0201 | H | AC-06 | `_mt-button-danger.scss` | HL | |
| Icon-Button | Größe / Rand | 44 x 44 px (kompakt 32 x 32) / keiner | R | AC-07 | `_mt-button-icon.scss` (`width/height: control-height`, `border: 0`) | HL | Aufrufer-Reste: Icon-Buttons in `mat-option` 24 px, Parameter-Toolbar-Icon 32 x 32 unskaliert, `autopilot-unified__toggle` 86 x 38 |
| Icon-Button Danger | Hintergrund / Icon | transparent / #FF0201 | R | AC-56 | `.mt-button-icon.mt-button-danger` (`icon-color: role-error`) | HL | |
| Icon-Button Danger | Hintergrund | #EFF0F4 | H | AC-56 | `color-hover` | HL | |
| Zähler | Hintergrund / Schrift / Radius | #BBD03A / weiß 12 px / 20 px | R | AC-08 | `_mt-button-badge.scss` (`color-primary`, `font-size-xs`, `radius-badge` 1,25 rem) | HL | |
| Zähler | Innenabstand | 2 px oben/unten, 5 px seitlich | R | AC-08 | `0.125rem 0.3125rem` | HL | |
| Button | deaktiviert | Deckkraft 0,4, keine Aktion | D | AC-09 | `.mt-button:disabled` (`opacity: 0.4`); Action-Button über `aria-disabled` ([action-button](action-button.md)) | HL | |
| Button und Feld | Fokus per Tastatur | 2 px schwarzer Rahmen | F | AC-10 | Button `outline: 2px solid color-focus (#000000)`, `outline-offset: 2px`; Feld Fokus-Rand 2 px (Materials Vorgabe), Farbe `color-ink` (#0B0B0B) | HL | Button #000000 mit 2 px Abstand, Feld #0B0B0B (AC-14) |
| Button, Feld | Höhe Standard / Kompakt | 44 px / 32 px | R | AC-11, AC-51 | `--mt-control-height` (`control-height` 2,75 rem), `mt-compact` setzt `2rem` | PW:T (Dashboard-Toolbar 32 px); Rest HL (AC-07) | |
| Hülle mit Verfeinerung am Host | Zielwerte der Verfeinerung am inneren Button | wie Verfeinerung | R | AC-60 | Hülle trägt nur `mtButton`, Verfeinerung am Host | PW:T (Hüllen-Button grün, 32 px) | |

### Formularfeld (siehe [Formularfeld](field.md), [Eingabe](input.md), [Auswahl](select.md), [Bereich und Datum](range-and-datepicker.md), [Auswahl-Steuerelemente](choice-controls.md))

| Element | Eigenschaft | Wert | Zustand | AC | Code-Quelle | Prüfart | Abweichung |
|---|---|---|---|---|---|---|---|
| Feld | Höhe | 44 px | R | AC-12 | `container-height: control-height` (`_mt-field-tokens.scss`) | PW:T | |
| Feld | Hintergrund / Rand / Radius | #FFFFFF / 1 px #747474 / 0 | R | AC-12 | `color-surface`, `outlined-outline-color: color-border`, Randbreite 1 px (Materials Vorgabe), `radius-none` | PW:T | |
| Feld | Eingabetext | 15 px Light | R | AC-12 | `font-size-md` (0,9375 rem), `font-weight-light` | PW:T (mat-select) | |
| Feld | Innenabstand | 13 px oben/unten, 20 px seitlich | R | AC-12 | `container-vertical-padding: (control-height - 1.125rem)/2`, `.mdc-text-field--outlined { padding: 0 1.25rem }` | PW:T (nur links 20 px) | Vertikal nicht gemessen |
| Feld | Platzhalter | #A3A3A3 | R | AC-12 | `color-placeholder` | - | nicht gemessen |
| Label | Größe / Gewicht / Versalien / Farbe | 13 px / 700 / ja / #000000 | R | AC-13 | `_mt-field.scss`, `_mt-label.scss` | PW:T | |
| Label | linker Rand | am Feldrand (Wrapper-Abstand höchstens 1 px) | R | AC-13 | `left: 0` in `_mt-field.scss` | PW:T | |
| Label | Abstand zum Feld | 10 px | R | AC-13 | `padding-top: calc(font-size-sm * 1.2 + 0.625rem)` | PW:T (9 bis 11 px) | |
| Label | Pflichtfeld | folgt " *" | R | AC-13 | `.mdc-floating-label--required::after { content: ' *' }` | - | nicht gemessen |
| Feld | Rand Hover / Fokus | #0B0B0B / 2 px #0B0B0B | H, F | AC-14 | `outlined-hover-outline-color`, `outlined-focus-outline-*` | HL | |
| Feld | Rand und Fehlertext (13 px) | #FF0201 | Fehler | AC-14 | `role-error`, `subscript-text-size: font-size-sm` | HL | |
| Feld | Rand / Deckkraft | #E2E2E2 / 0,4 | D | AC-14 | `outlined-disabled-outline-color: color-line`, `.mat-form-field-disabled { opacity: 0.4 }` | HL | |
| Hinweis | Größe / Farbe | 13 px / #8C8C8C | R | AC-15 | `_mt-hint.scss` (`color-hint`) | HL | |
| Aktion im Feld | Icon / Abstand rechts | 16 px / 16 px | R | AC-16 | `_mt-input-action.scss` (`1rem`, nur mit `.mat-mdc-form-field-icon-suffix`) | HL | |
| Schreibgeschütztes Feld | Rand / Hintergrund / Deckkraft | #E2E2E2 / #FFFFFF / 1 | R | AC-17 | `_mt-readonly.scss` | HL | |
| Zell-Editor | ohne Label, Rand/Farbe/Radius wie AC-12 | wie Feld | A | AC-18 | `_mt-grid-editor.scss` (`field-tokens`, `width/height: 100%`) | - (Unit: Klasse) | |
| Optionsliste | Fläche / Hover / gewählt | Kartenfläche / #EFF0F4 / #C6D4DD | H, A | AC-19 | `mt-surface` im Overlay, `_mt-option.scss` (`color-hover`, `color-selected`); Datumsfeld über globale Klasse `.mat-datepicker-content` | HL | Datepicker-Selektor ist global (kein Klassen-Haken am Overlay), Task 8 |
| Checkbox | Größe / Rand / Radius | 20 x 20 px / #747474 / 2 px | R | AC-20 | `_mt-checkbox.scss` (`1.25rem`, `border-width: 1px`, `radius-tag`) | HL | |
| Radio | Außenmaß / Punkt | 20 px / 8 px #131313 | R | AC-20 | `_mt-radio.scss` (`scale(0.4)` von 20 px, `color-ink-strong`) | HL | Punkt 8 px ist abgeleitet (0,4 x 20), nicht direkt gesetzt |
| Schalter | Größe / Farbe | 48 x 27 px / #BBD03A an, #C4C4C4 aus | R | AC-20 | `_mt-switch.scss` (`3rem` x `1.6875rem`, `color-primary`, `color-switch-off`) | HL | |
| Auswahlfeld | Höhe; Label und Platzhalter; Wert | 44 px; 13 px fett Versalien; 15 px Light | R | AC-20 | `_mt-select.scss`, `_mt-field.scss` | PW:T (Höhe, Wert, Label); Platzhalter HL | |
| Auswahl-Chip | Hintergrund / Schrift | #285172 / weiß | R | AC-21 | `_mt-autocomplete-multi.scss` (`elevated-container-color: color-accent`, `radius-tag`) | HL | |
| Einheit | Schreibweise im Label/Header | unverändert, Rest Versalien | R | AC-58 | `_mt-unit.scss` (`text-transform: none`) | PW:T (Header) |
| Einheit im Grid-Header | Farbe / Deckkraft | wie Label (weiß) / 1 | R | AC-58 (Ergänzung) | kein `color`/`opacity` in `unit-header*.scss`, `search-column-header.component.scss` | PW:T (Suchergebnisse) |
| Einheiten-Umschalter (Parameter-Header) | Rand, Schrift, Hintergrund | weiß, weiß, transparent | R | Ergänzung | `unit-header-3.component.scss` (`color-on-accent`) | PW:T |
| Einheiten-Umschalter aktiv | Hintergrund / Schrift | weiß / #56788F | A | Ergänzung | `color-on-accent` / `color-grid-header` | PW:T | |

### Tabs, Navigation (siehe [Tabs und Navigation](tabs-and-nav.md))

| Element | Eigenschaft | Wert | Zustand | AC | Code-Quelle | Prüfart |
|---|---|---|---|---|---|---|
| Wizard-Tab | Hintergrund / Schrift | #285172 / weiß, fett, Versalien | A | AC-22 | `_mt-tabs.scss` (`color-accent`, `color-on-accent`) | HL |
| Wizard-Tab | inaktiv: Fläche / Schrift / Linie | keine / #0B0B0B / 1 px #E2E2E2 | R | AC-22 | `inactive-label-text-color: color-ink`, `divider-color: color-line` (Linienhöhe 1 px ist Materials Vorgabe) | HL |
| Wizard-Tab-Untertitel | Farbe / Größe / Gewicht | #383E42 / 12 px / 300 | R | AC-22 (Anweisung 2026-10-21) | `_mt-tabs-subtitle.scss` (`color-anthracite`, `font-size-xs`, `font-weight-light`) | PW:T (synthetisches Markup) |
| Wizard-Tab-Untertitel | Farbe | weiß | A | AC-22 (Anweisung 2026-10-21) | `.mt-tabs .mdc-tab--active .mt-tabs-subtitle` (`color-on-accent`) | PW:T (synthetisches Markup) |
| Linkes Menü | Hintergrund / aktiv / Hover | #FFFFFF / #285172 weiß / #EFF0F4 | R, A, H | AC-23 | `_mt-nav-item.scss` (Fläche und `color` am Host, Fix 1a0f812f) | PW:T, HL |
| Linkes Menü | Schrift im aktiven Eintrag nach Klick (Fokus) | weiß | A | AC-23 | `_mt-nav-item.scss` (`list-item-focus-label-text-color`) | PW:T |
| Linkes Menü | Zuletzt-Eintrag, zweite Zeile | Gewicht 300 (Light), erste Zeile 700 | R | Anweisung 2026-10-21 | `_mt-nav-item.scss` (`.last-wizard-target`) | PW:T |
| Linkes Menü | Zuletzt-Eintrag, rechter Rand | Text endet 5 px vor dem Rand, Ellipsis | R | Anweisung 2026-10-21 | `sidebar-2.component.scss` (`.last-wizard-link`, `.last-wizard-text`) | Unit (CSS-Regeln), Handmessung im Browser |

### Grid (siehe [Grid](grid.md))

| Element | Eigenschaft | Wert | Zustand | AC | Code-Quelle | Prüfart | Abweichung |
|---|---|---|---|---|---|---|---|
| Grid-Header | Hintergrund / Schrift | #56788F / weiß, Versalien, 13 px | R | AC-24 | `mt-grid-theme.ts` (`headerBackgroundColor`, `headerTextColor`, `headerFontSize: 0.8125rem`, `text-transform: uppercase` im Part) | PW:T | |
| Zeilen | gerade / ungerade | #FFFFFF / #EAEDF2 | R | AC-24 | `backgroundColor`, `oddRowBackgroundColor` | PW:T | |
| Linien | Farbe | #E2E2E2 | R | AC-24 | `borderColor`, `rowBorder`, `columnBorder` | PW:T (Zeilen-Unterkante) | |
| Zeile | gewählt | #C6D4DD | A | AC-24 | `selectedRowBackgroundColor` | PW:T (Theme-Variable) | Gerenderte gewählte Zeile nicht gemessen |
| Zeile | unter dem Mauszeiger | #F7FAE9 | H | AC-24 | `rowHoverColor` | PW:T (Dashboard `::before`; übrige über Theme-Variable) | |
| Alle vier Grids | Farben und Ränder gleich | gleich | R | AC-26 | ein Theme, `MT_GRID_THEME` | PW:T (je Grid) | |
| Grid-Zeile | Höhe | 42 px (Parameter 28 px) | R | AC-25 | Standard bzw. `[rowHeight]="28"` im Template | PW:B | |
| Grid-Zelle | Schriftgröße | 13,12 px (0,82 rem) | R | AC-25 | `dataFontSize: '0.82rem'`, Zusatzregel `.ag-row, .ag-cell { font-size: var(--ag-data-font-size) }` | PW:B | Zusatzregel nicht im Brief des Plans (Task 12) |
| Grid-Zelle | Innenabstand links / rechts | 2 px / 0 | R | AC-25 | `.ag-ltr .ag-cell:not(.ag-cell-inline-editing) { padding-left: 0.125rem; padding-right: 0 }` | PW:B | |
| Grid-Kopfzelle | Innenabstand | gleich in allen Grids, Wert des Basis-Stands | R | AC-24/25 | `.ag-header-cell { padding: 0 0.125rem }` (und `cellHorizontalPadding: 4` als Parameter) | HL (Zeile ohne konkretes Soll) | Spec nennt keinen Wert; Soll "wie Basis-Stand 84752ef9" (Task 25) |
| Score-Zellen | Bewertungsfarben | unverändert | R | AC-27 | `src/assets/data/score-colors.ts` | PW:B | |

### Tag, Rolle, Meldungen (siehe [Tag und Rolle](tag-and-role.md), [Snackbar](snackbar.md))

| Element | Eigenschaft | Wert | Zustand | AC | Code-Quelle | Prüfart | Abweichung |
|---|---|---|---|---|---|---|---|
| Status-Tag | Höhe / Radius / Innenabstand | 30 px / 2 px / 7 px 15 px | R | AC-28 | `_mt-tag.scss` (`1.875rem`, `radius-tag`, `0.4375rem 0.9375rem`) | PW:T | |
| Status-Tag im Grid | Innenabstand | 7 px 4 px (Klasse `mt-tag-grid`, nur Parameter-Tabelle) | R | Ergänzung zu AC-28 | `_mt-tag.scss` (`0.4375rem 0.25rem`) | PW:T | Spec kennt keine Grid-Variante |
| Grid-Zelle | Wert vertikal | zentriert | R | Ergänzung zu AC-25 | kein `line-height` im Dichte-Part, AG-Standard | PW:T (je Grid) | vorher `line-height: 1.4`, oben ausgerichtet |
| Parameter-Grid, Spalte Ergebnis-Status | Breite, Ausrichtung | 100 px, höchstens 110 px; Tag horizontal zentriert | R | Ergänzung | `parameter-table.service.ts` (`cellStyle: { textAlign: 'center' }`) | PW:T (Tag liegt in der Zelle) | vorher 59/69 px, Tag abgeschnitten |
| Status-Tag | Schrift | 13 px fett Versalien, Zeichenabstand 0,03 em, weiß | R | AC-28 | `font-size-sm`, `letter-spacing-tag`, `color-on-accent` | PW:T | |
| Status-Tag | Hintergrund | Farbe der Rolle | R | AC-28, AC-29 | `var(--mt-role-color, role-neutral)`; Paletten `role-*` | PW:T (Rolle Info) | Schrift ist immer weiß, auch auf Erfolg (#BBD03A) und Warnung (#FF9032); Kontrast dort nicht bewertet |
| Palette | Info / Erfolg / Warnung / Fehler / neutral | #285172 / #BBD03A / #FF9032 / #FF0201 / #A1A1A1 | R | AC-28 | `role-info/-success/-warning/-error/-neutral` | PW:T (nur Info) | |
| Erfolgs-/Fehlertext (Result-Seite) | Schriftfarbe, keine Fläche/Rahmen | #BBD03A bzw. #FF0201 | R | AC-66 | `.mt-role:not(.mt-tag) { color: var(--mt-role-color) }` | HL (3 Zeilen) | |
| Snackbar | Fläche / Rand / Schatten | weiß / 1 px Rollenfarbe / Kartenschatten | R | AC-30 | `_mt-snackbar.scss` (`border: 1px solid var(--mt-role-color, role-neutral)`) | HL | |

### Flächen: Dialog, Menü, Tooltip, Panel (siehe [Dialog](dialog.md), [Menü und Tooltip](menu-and-tooltip.md), [Panel](panel.md))

| Element | Eigenschaft | Wert | Zustand | AC | Code-Quelle | Prüfart | Abweichung |
|---|---|---|---|---|---|---|---|
| Dialog, Menü | Fläche | Kartenfläche (AC-01) | R | AC-31 | `_mt-dialog.scss` (`.mat-mdc-dialog-surface`), `_mt-menu.scss` (`.mat-mdc-menu-panel`) mit `@extend %surface` | HL | |
| Tooltip | Hintergrund / Text / Schatten | #FFFFFF / #8C8C8C / Kartenschatten | R | AC-31 | `_mt-tooltip.scss` (`color-surface`, `color-hint`, `shadow-surface`) | HL | |
| Tooltip | Innenabstand | 8 px oben/unten, 12 px seitlich | R | AC-31 | `padding: 0.5rem 0.75rem` | HL | Spec-Entscheidung "Tooltip" ersetzt den Vorlagen-Wert 30 px |
| Dialoge | Kopf-, Fuß-, Aktionsleiste gleich | Abstände, Rand, Titelschrift gleich (Titel 20 px Light) | R | AC-32 | Header `1.25rem 1.5rem 1rem`, Rand unten 1 px `color-line`, 20 px Light; Content `1.25rem 1.5rem`; Aktionen `1rem 1.5rem 1.25rem`, Rand oben 1 px, Lücke 0,75 rem | HL (2 Zeilen) | Spec nennt keine Zahlen; Zahlen sind Code-Stand. Dialog-Hülle setzt Innenabstand 0 gegen `mt-dialog-content` (Messliste prüft) |

## Skalierungsregel

- Die Zielwerte gelten bei **Basisschrift 16 px**. Die Basisschrift ist `clamp(13px, 1.8vh, 16px)` (`_app-reset.scss`, bleibt bewusst so, Plan-Entscheidung "Basisschrift"). 16 px erreicht sie ab rund 890 Fensterhöhe (1,8 vh = 16 px bei 888,9 px), 13 px bis rund 722 px.
- Größen sind **rem-basiert** (Tokens in rem), die Oberfläche skaliert deshalb proportional. AC-45: bei 720 px Fensterhöhe ist die Basisschrift 13 px und alle Größen sind mit 13/16 skaliert (44 px -> 35,75 px; 32 px -> 26 px). Geprüft: Basisschrift (PW:F) und die Höhe des Primär-Buttons (PW:T). Weitere Größen sind bei 720 px nicht gemessen.
- **Nicht skalierend** (px im Code): Rand- und Outline-Breiten (1 px, 2 px), das Token `space-2` (8 px, `_mt-tokens.scss`; weitere Abstands-Tokens erst mit Verbraucher), im Grid-Theme `fontSize: 12`, `cellHorizontalPadding: 4`, `.ag-body-viewport { padding-bottom: 40px }`.
- Die Laufzeit-Variable `--mt-control-height` wird je Bereich überschrieben (`.mt-compact`); alle anderen Token sind beim Build eingesetzt (`v()`), siehe [Token](tokens.md).
- Messen im Browser bei Fensterhöhe ab 890 px (Hinweis der Messliste).

## Weiße Schrift auf Primärgrün (bewusst)

Weiße Schrift auf #BBD03A (Kontrast etwa 1,7:1, unter WCAG AA) ist Spec-Entscheidung "Primärfarbe und Kontrast" (AC-02, AC-03). Sie wird nicht als Barrierefreiheitsfehler korrigiert; sonst verfehlen Primär-Buttons AC-02/AC-03. Im Code: `color-on-primary: #ffffff` für Button und Zähler (`_mt-button-primary.scss`, `_mt-button-badge.scss`).

## Abnahme

1. **Messbar:** Playwright (siehe oben) für Primär-Button, Formularfeld, Karte, Grid, Status-Tag, Skalierung; Node-Tests für Tokens (AC-35), AG-Grid-Version (AC-55), Budgets (AC-42, AC-49), Severity (AC-54); Unit-Specs für Klasse/Voreinstellung/Vererbung (AC-43).
2. **Handliste** `e2e/mt-messliste.md`: 39 Tabellenzeilen mit AC-ID für die übrigen Zielwerte (ACs: AC-04 bis AC-10, AC-14 bis AC-17, AC-19 bis AC-25, AC-30 bis AC-33, AC-36, AC-56, AC-63, AC-64, AC-66). Spalten **Ist** und **ok** sind in jeder Zeile leer: **keine Zeile ist abgenommen**. `mt-messliste.test.mjs` erzwingt, dass jeder manuelle AC (`MANUAL_ACS`, 25 ACs) mindestens eine Zeile hat und Ist/ok leer sind.
   - AC-24 ist nicht in `MANUAL_ACS` und hat kein konkretes Soll ("wie Basis-Stand 84752ef9"); AC-25-Zeile doppelt zu PW:B (Task 25, 🟡).
   - Zusatzzeilen über den Brief hinaus (AC-20 je Baustein, AC-32 Dialog-Hülle, AC-66 Rollenfarbe, AC-24/25 Grid-Padding) bleiben auf Controller-Urteil (Task 25).
3. **Sichtabnahme** durch den Auftraggeber gegen die MyTRUMPF-Referenzbilder (Anmeldung, Startseite, Download-Karten): **steht aus**.
4. **Nicht im Browser geprüft** (Abschlussbericht): Überlauf der Wizard-Fußleiste, Umbruch der Such-Wizard-Kopfzeilen nach Entfernen der 28-px-Maße, `ai-filled`-Markierung.

Anzahl der Zeilen gezählt aus `e2e/mt-messliste.md` (Tabellenzeilen ab `| AC-`).

## Abweichungen ggü. Spec/Plan

- AC-05: Der Text-Button hat im Code `border: 1px solid transparent`; Spec/Messliste erwarten "keinen Rand".
- AC-10: Button-Fokus #000000 mit `outline-offset: 2px`; Feld-Fokus 2 px #0B0B0B.
- Grid-Zelle: Zusatzregel für `font-size` (Task 12), weil die Baseline sonst rot war (Checkbox-Zelle 13 px statt 13,12 px).
- AC-31 Tooltip: Innenabstand 8/12 statt Vorlagenwert 30 px (Spec-Entscheidung "Tooltip").
- Grid-Header: Spaltentitel Light (300), Gruppen-Header 700 statt 700 für alle, Auftraggeber-Entscheid 2026-10-21, siehe [grid](grid.md).
- Action-Button (Grid-/Listenzeile): Kurzlabel 8 px Light statt 10 px fett, Auftraggeber-Entscheid 2026-10-21, siehe [action-button](action-button.md).
- AC-64: Score-Zellen laufen in 700 statt 600 (Plan-Review R1, Tasks 12/22).
- Weitere Einzelheiten in [Korrekturen und offene Punkte](corrections-and-open-points.md).

## Offene Punkte

- Alle Handlisten-Zeilen unabgenommen; Sichtabnahme steht aus.
- Nicht gemessen und nicht auf der Handliste: Platzhalterfarbe #A3A3A3 (AC-12), vertikaler Feld-Innenabstand 13 px, Pflicht-Stern (AC-13), gerenderte gewählte Grid-Zeile.
- Icon-Buttons in `mat-option` 24 px, Toolbar-Icon-Button `parameters-page` 32 x 32 unskaliert, `autopilot-unified__toggle` 86 x 38: Abweichung von AC-07, Mensch entscheidet.
- Header-Padding der Grids ohne festen Spec-Wert.

## Ändern: Checkliste

1. Wert ändern: nur im Token (`_mt-tokens.scss`) bzw. Partial bzw. `mt-grid-theme.ts`; nie in Komponenten-Stylesheets.
2. Danach Playwright-Tests in `mt-targets.spec.ts` bzw. `mt-foundation.spec.ts` anpassen, Zeile in `e2e/mt-messliste.md` (Soll) ändern, Ist/ok leer lassen, `mt-tokens.test.mjs` prüfen.
3. Eingefrorene Werte in `mt-grid-baseline.spec.ts` (AC-25/27) nur auf ausdrückliche Anweisung ändern.
4. Bundle-Budget beachten (siehe [Durchsetzung](enforcement.md)).
5. **Diese Referenzseite und die betroffene Elementseite im selben Zug korrigieren.**
