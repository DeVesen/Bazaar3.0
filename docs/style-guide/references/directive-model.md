# Direktiven-Baukasten
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> Die MyTRUMPF-Optik besteht aus kleinen Attribut-Direktiven (`mt…`), die je eine Klasse (`mt-…`) und Material-Voreinstellungen setzen; die Optik selbst steht in einem Partial je Direktive. Diese Seite erklärt das Modell, die Ablage, die Grenzen und die Schritte zum Anlegen und Ändern.

## Überblick

| Rolle | Bedeutung | Beispiel | Regel |
|---|---|---|---|
| Basis | Legt das Gemeinsame einer Familie fest | `mtButton`, `mtInput`, `mtSelect`, `mtAutocomplete` | Im Template nie allein beim Aufrufer, wenn es eine Verfeinerung gibt (Button: Verfeinerung Pflicht) |
| Verfeinerung | Eigene Direktive, schließt ihre Basis per `hostDirectives` ein | `mtButtonPrimary`, `mtInputNumeric`, `mtSelectMulti`, `mtAutocompleteMulti` | Im Template steht nur die Verfeinerung; je Basis höchstens eine, nur eine Achse (Farbe bzw. Typ) |
| Komposition | Direktive schließt eine Querschnitts-Direktive ein | `mtCard` (schließt `mtSurface` ein), `mtTag` (schließt `mtRole` ein, Eingabe `mtTag` wird als `mtRole` durchgereicht) | wie Verfeinerung: nie zusammen mit dem Eingeschlossenen |
| Querschnitt | Eigenschaft, die mehrere Bausteine teilen oder die sich mit einer Verfeinerung kombinieren lässt | `mtSurface`, `mtCompact`, `mtUnit`, `mtRole`, `mtButtonIcon`, `mtButtonBadge`, `mtButtonTile`, `mtInputAction`, `mtReadonly` | kombinierbar; `mtReadonly` hat kein Template-Attribut, es leitet sich vom `readonly`-Zustand ab |
| Klasse ohne Direktive | Optik ohne Direktive: Overlay-Klassen, Titel, Lade-Platzhalter | `.mt-dialog`, `.mt-snackbar`, `.mt-page-title`, `.mt-section-title`, `ngx-skeleton-loader` | Klasse oder Overlay-Voreinstellung (`MT_OVERLAY_PROVIDERS`), siehe [typography](typography.md), [page-and-layout](page-and-layout.md), [dialog](dialog.md), [snackbar](snackbar.md) |

Grundregel (Spec AC-51/AC-60): Jede Direktive wirkt nur an ihrem eigenen Element. Zwei Ausnahmen:

| Ausnahme | Was | Seite |
|---|---|---|
| `mtCompact` | sitzt am Bereich und setzt `--mt-control-height` für alle mt-Buttons und -Felder darin auf 32 px; einzige Querschnitts-Direktive, die über ihr Element hinaus wirkt | [compact-and-unit](compact-and-unit.md) |
| Verfeinerung am Hüllen-Host | `<app-atlas-btn mtButtonPrimary>` wirkt auf den inneren Button der Hülle | [button](button.md) |

## Verwendung

Verfeinerung (Basis ist eingeschlossen) und Querschnitt kombiniert, echte Beispiele aus dem Code:

```html
<!-- atlas-form-input.component.html: Clear-Button = Icon-Form + Text-Verfeinerung -->
<button matIconButton mtButtonIcon mtButtonText matSuffix type="button">

<!-- experiment-dashboard-toolbar.component.html: Hülle, Verfeinerung am Host -->
<app-atlas-btn mtButtonPrimary ...>

<!-- login-failed.component.html: Karte statt Surface+Card -->
<div class="login-failed" mtCard>
```

Jede Komponente, deren Template ein `mt…`-Attribut trägt, importiert das Barrel (ohne Import ignoriert Angular das Attribut stillschweigend; geprüft durch `scripts/mt-directive-imports.test.mjs`):

```ts
import { MT_DIRECTIVES } from '../util/directives/mt-directives';
// imports: [..., MT_DIRECTIVES]   (oder einzelne MtXxxDirective)
```

Typische Lint-Fehler (ESLint-Plugin `mt`, `eslint-rules/mt-directives.cjs`, Schweregrad `MT_SEVERITY = "error"` in `eslint.config.js`):

| Fehler im Template | Regel / Meldung |
|---|---|
| `<mat-form-field>` ohne `mtField`/`mtGridEditor`, `<input matInput>` ohne `mtInput`/`mtInputNumeric`/`mtDatepicker`/`mtAutocomplete` usw. | `mt/require-directive`: `<{{element}}> braucht eine mt-Direktive: …` |
| `mat-button`, `mat-flat-button`, `mat-icon-button`, `mat-fab` u. a. | `mt/require-directive` (`legacyButton`): `matButton` bzw. `matIconButton` mit Verfeinerung nutzen |
| Button ohne oder mit zwei Verfeinerungen (auch `app-atlas-btn`, `app-atlas-icon-button`, `app-atlas-action-btn`) | `mt/button-refinement`: `Button braucht genau eine Verfeinerung (…)` |
| `matIconButton` ohne `mtButtonIcon` | `mt/button-refinement` (`missingIconShape`) |
| `mtButtonPrimary` zusammen mit `mtButton` (oder `mtCard`+`mtSurface`, `mtTag`+`mtRole` usw.) | `mt/no-redundant-base`: `X schließt Y bereits ein; Y entfernen` |
| Farbliteral oder Grid-Theme-Parameter in TS außerhalb `mt-grid-theme.ts`/`score-colors.ts` | `no-restricted-syntax` |
| `mt-*.directive.ts` über 100 Zeilen | `max-lines` |

## Zielwerte

Nicht zutreffend (Werte stehen je Element auf den Elementseiten). Grenzen des Modells:

| Grenze | Wert | Prüfung | Quelle |
|---|---|---|---|
| Partial `src/styles/mt/<gruppe>/_mt-*.scss` | höchstens 2048 Byte | Stylelint `mt/max-file-size` (`stylelint.config.mjs`, Override für `src/styles/mt/**/*.scss`) | AC-41 |
| TS-Datei `mt-*.directive.ts` | höchstens 100 Zeilen (inkl. Leerzeilen und Kommentaren) | ESLint `max-lines` (`eslint.config.js`) | AC-41 |
| Komponenten-Stylesheet | Warnung ab 3 kB, Fehler ab 6,5 kB | `angular.json` `anyComponentStyle` | AC-42 |
| Globales Stylesheet-Bundle | Basis 21015 B, Warnung +30 %, Fehler +50 % (31522 B) | `angular.json` Budget `styles`; Test `scripts/mt-budgets.test.mjs` | Task 23 |

Größtes Partial heute: `_mt-field.scss` 1456 B.

## Aufbau (intern)

**Namensschema**

| Teil | Schema | Beispiel |
|---|---|---|
| Attribut (Selektor) | camelCase `mt<Basis><Verfeinerung>` | `mtButtonPrimary`, `mtInputNumeric` |
| Klasse | kebab `mt-<basis>-<verfeinerung>` | `mt-button-primary`, `mt-input-numeric` |
| Klasse (Rolle) | `mt-role-<rolle>` aus `mtRoleClass()` | `mt-role-error` |
| TS-Datei | `mt-<kebab>.directive.ts` | `mt-button-primary.directive.ts` |
| Partial | `_mt-<kebab>.scss` | `_mt-button-primary.scss` |
| ESLint-Selektor-Präfix | `app`, `atlas`, `mt` (camelCase) | `eslint.config.js` `@angular-eslint/directive-selector` |

**Ablage**

| Was | Wo |
|---|---|
| Direktive + Spec | `src/frontend/src/app/util/directives/` (flach, keine Unterordner) |
| Barrel `MT_DIRECTIVES` | `.../directives/mt-directives.ts` (Importblock oben, dann `as const`-Array) |
| Testhilfe | `.../directives/testing/mt-directive.testing.ts` (`renderMtTemplate`, `queryElement`, `REMOVED_OPTIC_INPUTS`, `remainingOpticInputs`) |
| Partial je Direktive | `src/frontend/src/styles/mt/<gruppe>/_mt-<name>.scss`, Selektor = Klasse der Direktive; Gruppe nach Fachlichkeit (Tabelle unten) |
| Partial-Index | je Gruppe `src/frontend/src/styles/mt/<gruppe>/_index.scss` (`@use 'mt-<name>';`) und der Wurzel-Index `src/frontend/src/styles/mt/_index.scss` (`@use '<gruppe>';` in der Reihenfolge `foundation`, `buttons`, `forms`, `cards`, `overlays`, `navigation`, `grid`); Reihenfolge zählt: spätere gewinnen bei gleicher Spezifität; `mt-button-tile` steht am Ende von `buttons`. Gegen Materials Komponentenstyles hilft die Reihenfolge nicht: Material fügt sie zur Laufzeit nach dem globalen Stylesheet ein und gewinnt bei gleicher Spezifität, das Partial braucht dann eine Klasse mehr (z. B. `.mt-radio.mat-mdc-radio-button …`, `#314470`) |
| Einbindung | `src/frontend/src/styles.scss`: `@use './styles/mt-tokens';` … `@use './styles/mt';` (Reihenfolge siehe [page-and-layout](page-and-layout.md)) |
| Lint-Zuordnung | `src/frontend/eslint-rules/mt-directive-map.json` (gemeinsam mit Codemod `scripts/mt-migrate-templates.mjs`) und Konstante `INCLUDES` in `eslint-rules/mt-directives.cjs` |
| Tokens | [tokens](tokens.md) |

**Gruppen der Partials** (`src/frontend/src/styles/mt/<gruppe>/`, Stand 2026-10-21, Workitem 312482; Inhalt je Gruppe, ohne Präfix `_mt-`):

| Gruppe | Partials |
|---|---|
| `foundation` | `surface`, `compact`, `unit`, `role`, `tag` |
| `buttons` | `button`, `button-primary`, `button-secondary`, `button-text`, `button-danger`, `button-icon`, `button-badge`, `button-tile` |
| `forms` | `field-tokens`, `field`, `label`, `hint`, `error`, `input`, `input-numeric`, `input-action`, `textarea`, `readonly`, `select`, `select-multi`, `option`, `autocomplete`, `autocomplete-multi`, `range`, `datepicker`, `checkbox`, `radio`, `switch` |
| `cards` | `card`, `card-header`, `card-title`, `card-content`, `card-actions`, `panel`, `panel-header` |
| `overlays` | `menu`, `menu-item`, `tooltip`, `dialog-header`, `dialog-content`, `dialog-actions`, `dialog`, `snackbar` |
| `navigation` | `tabs`, `tabs-tab`, `tabs-subtitle`, `nav-item`, `nav-item-group` |
| `grid` | `grid`, `grid-editor` |

Partials, die einander einbinden, nennen die Gruppe im Pfad (`@use '../foundation/mt-surface';`, `@use '../forms/mt-field-tokens';`). Die kompilierte Ausgabe blieb bei der Umgruppierung regelgleich und gleich groß (36 501 B unminifiziert); nur die vier Regeln von `mt-button-tile` stehen nun vor `forms` statt ganz am Ende (geprüft: kein Konflikt, die Kachel steckt nie in einem Eingabefeld-Suffix).


Basis plus Verfeinerung, echter Auszug (`mt-button-primary.directive.ts`):

```ts
@Directive({
  selector: '[mtButtonPrimary]',
  host: { class: 'mt-button-primary' },
  hostDirectives: [MtButtonDirective],
  providers: [{ provide: MT_BUTTON_VARIANT, useValue: { appearance: 'filled', cssClass: 'mt-button-primary' } }],
})
export class MtButtonPrimaryDirective {}
```

`hostDirectives` schließt die Basis ein (Klasse `mt-button` kommt automatisch). Die Button-Basis liest die Verfeinerung über das Token `MT_BUTTON_VARIANT` (`InjectionToken`) am eigenen Element oder, im Hüllen-Template, am Host der Hülle. Andere Voreinstellungen setzen Direktiven über `providers` (`MAT_FORM_FIELD_DEFAULT_OPTIONS`, `MAT_SELECT_CONFIG`, `MAT_AUTOCOMPLETE_DEFAULT_OPTIONS`) oder per `ngOnInit` (`MtMenuDirective`, `MtTooltipDirective`).

**Hüllen-Konzept**

| Aspekt | Regel |
|---|---|
| Wann Hülle | Nur Komponenten mit Verhalten (Ladeanzeige, Beschriftung, Tooltip, Aufklappen, Titelbezug) bleiben: `app-atlas-btn`, `app-atlas-icon-button`, `app-atlas-action-btn`, `app-atlas-panel`, `app-atlas-dialog-shell`, `app-atlas-form-*` |
| Verfeinerung | Der Aufrufer setzt sie am Host; die Hülle trägt intern nur die Basis (`mtButton`) |
| Optik-Eingaben | Keine (AC-44): Variante, Farbe, Zusatzklasse, Inline-Stil, Erscheinungsbild entfallen; geprüft über `REMOVED_OPTIC_INPUTS`/`remainingOpticInputs` in den Hüllen-Specs |
| Layout | Aufrufer setzt Layout-Klassen per `class` am Host; Hüllen setzen `:host { display: block; }` und der Inhalt füllt den Host (`width: 100%`) |
| Lint | Hüllen-Host gilt als Träger der Verfeinerung (`BUTTON_WRAPPER_HOSTS`); in Hüllen-Templates (`BUTTON_WRAPPER_TEMPLATES`) darf der innere Button nur `mtButton` tragen |

Details je Hülle auf den Elementseiten ([button](button.md), [panel](panel.md), [dialog](dialog.md), [field](field.md)).

## Hüllen-Komponenten

Siehe Abschnitt „Hüllen-Konzept" oben.

## Tests

| Was | Wo |
|---|---|
| Unit-Spec je Direktive | `mt-<name>.directive.spec.ts` neben der Direktive; Pflicht nach AC-43: Klasse und Voreinstellungen, bei Verfeinerung zusätzlich ein Test für die Klasse der Basis (Vererbungstest, z. B. `hostDirectives_OnlyRefinementInTemplate_AddsBaseClass`) |
| Naming | `<Methode>_<Situation>_<Erwartung>` mit AAA-Kommentaren (CLAUDE.md) |
| Lint-Regeln | `eslint-rules/mt-directives.test.cjs`, `eslint-rules/mt-config.test.cjs` |
| Import-Prüfung | `scripts/mt-directive-imports.test.mjs` |
| Gate | `node scripts/mt-lint-gate.mjs <pfad>` meldet nur die mt-Regeln (`mt/*`, `no-restricted-syntax`, `max-lines`, `directive-selector`) |
| Stylelint | `stylelint "src/**/*.scss"` (`npm run lint:styles`), Plugin-Test `stylelint-plugins/mt-stylelint.test.mjs` |
| Alle Node-Tests | `npm run check:tooling` |

## Abweichungen ggü. Spec/Plan

| Thema | Jetzt (Code) | Spec/Plan | Grund |
|---|---|---|---|
| Schweregrad der Regeln | `MT_SEVERITY = "error"` | Plan: während der Umsetzung `warn` | Task 27 hob alle Regeln auf Fehler |
| Barrel | `mt-button-tile` ist im Barrel und im Gruppen-Index `buttons/_index.scss` (zuletzt) | Task 6 kannte nur Icon-Form und Zähler | Kachel-Form für `app-atlas-action-btn` kam in Task 16 dazu |
| Lint-Zuordnung | zwei Stellen: `mt-directive-map.json` (Elemente/Attribute) und `INCLUDES` in `mt-directives.cjs` (eingeschlossene Basen) | Brief nennt nur die Map | `INCLUDES` steuert `no-redundant-base`; Verfeinerungen dort ebenfalls eintragen |
| Wirkungsbereich | zwei Ausnahmen (`mtCompact`, Verfeinerung am Hüllen-Host) | ursprünglich keine | Spec R1 zu AC-51/AC-60 |

## Offene Punkte

- Task 6: `hostClasses` und `cssClass` in `MtButtonDirective`/Verfeinerungen doppelt gepflegt (Klassenname steht in `host.class` und im `MT_BUTTON_VARIANT`).
- Task 6: `MT_BUTTON_VARIANT`-Kommentar: ein verschachtelter Button in einer Hülle mit Verfeinerung erbt diese.
- Task 3: `mt-config.test.cjs` deckt Teile der Config nicht ab (`button-refinement`/`no-redundant-base` über Config, Spec-Template-Ausnahme, `runGate`); `ELEMENT_REQUIREMENTS` wird doppelt gelesen.
- Task 5/7/11: viele Specs prüfen nur die Host-Klasse (brief-konform), `mt-readonly.spec` nur den `input`-Zweig.
- Task 11: Selektoren `.mat-mdc-list-item`, `.mdc-tab--active`, `.nav-group-header` stammen aus dem Plan; Wirkung im Browser nur teilweise gemessen.
- Task 23: globales Stylesheet-Bundle 30,97 kB, nur etwa 589 B unter der Fehlergrenze; jede Partial-Erweiterung kann den Build kippen, Budget anheben nur nach Rücksprache.
- `mat-button-toggle` hat keine mt-Direktive (Spec-Lücke, Final-Review).
- Autovervollständigung ist auf der Seite [select](select.md) eingeordnet (Optionslisten-Familie); Zuordnung ist eine Festlegung, keine Vorgabe des Codes.

## Ändern: Checkliste

**Neue Direktive anlegen**

1. TS-Datei `src/app/util/directives/mt-<name>.directive.ts` (höchstens 100 Zeilen): `@Directive({ selector: '[mt<Name>]', host: { class: 'mt-<name>' } })`; bei Material-Voreinstellungen `providers`; bei eingeschlossener Basis `hostDirectives`.
2. Partial `src/styles/mt/<gruppe>/_mt-<name>.scss` (höchstens 2048 Byte): Selektor `.mt-<name>`, Werte nur über `t.v(…)` (`@use '../../mt-tokens' as t;`), Material über `mat.*-overrides`-Mixins zuerst, danach Selektoren.
3. `@use 'mt-<name>';` in `src/styles/mt/<gruppe>/_index.scss` (Reihenfolge beachten: Basis vor Verfeinerung); neue Gruppe: Ordner mit `_index.scss` anlegen und in `src/styles/mt/_index.scss` einbinden.
4. Import und Eintrag in `MT_DIRECTIVES` (`mt-directives.ts`).
5. Lint-Map: Zielelement/Attribut in `eslint-rules/mt-directive-map.json` (`elements` bzw. `attributes[].required`) eintragen, falls das Material-Element die Direktive verlangen soll; schließt die Direktive eine andere ein, in `INCLUDES` (`eslint-rules/mt-directives.cjs`) eintragen. Gehört sie zu den Button-Verfeinerungen, in `BUTTON_REFINEMENTS` ergänzen.
6. Spec `mt-<name>.directive.spec.ts` mit `renderMtTemplate`/`queryElement` (Klasse, Voreinstellung; Verfeinerung: Vererbungstest der Basis-Klasse). Test-Template bindet nur die nötigen Material- und mt-Direktiven.
7. Zielwerte im Browser belegen: `e2e/tests/mt-targets.spec.ts` oder Zeile in `e2e/mt-messliste.md`.
8. Template-Aufrufer: Komponente importiert `MT_DIRECTIVES`; danach `node scripts/mt-lint-gate.mjs src`, `npm run lint:styles`, `npm run check:tooling`, Build (Budget prüfen).
9. Diese Referenzseite und die Elementseite im selben Zug korrigieren.

**Verfeinerung ergänzen**

1. Neue Direktive wie oben, zusätzlich `hostDirectives: [<Basis>]`; bei Button außerdem `providers: [{ provide: MT_BUTTON_VARIANT, useValue: { appearance, cssClass } }]`.
2. Partial erweitert nur die Besonderheit der Verfeinerung; Gemeinsames bleibt in der Basis.
3. `INCLUDES` in `mt-directives.cjs` um `<verfeinerung>: ['<basis>']` ergänzen (sonst meldet der Lint die Kombination nicht); bei Button `BUTTON_REFINEMENTS` ergänzen.
4. Vererbungstest in der Spec: nur die Verfeinerung im Template, Klasse der Basis muss am Element stehen.
5. Barrel und `_index.scss` ergänzen, Direktive in der Tabelle unten und auf der Elementseite nachtragen.

Nicht tun: Literale in Komponenten-Stylesheets, `!important` ohne Begründungskommentar, Budget anheben, Optik-Eingaben an Hüllen, mehrere Verfeinerungen am selben Element, Basis zusammen mit Verfeinerung im Template.

## Alle vorhandenen Direktiven

Selektor und Klasse stammen aus den `mt-*.directive.ts`; Klasse = `host.class` (bei `mtButton`, `mtRole`, `mtReadonly` dynamisch, bei `mtMenu`/`mtTooltip` am Overlay).

| Direktive (Selektor) | Klasse | Rolle | Sitzt an | Beschrieben in |
|---|---|---|---|---|
| `[mtButton]` | `mt-button` (+ Klasse der Verfeinerung) | Basis | Element mit `matButton`, im Hüllen-Template der innere Button | [button](button.md) |
| `[mtButtonPrimary]` | `mt-button-primary` | Verfeinerung (schließt mtButton ein) | Button, Hüllen-Host | [button](button.md) |
| `[mtButtonSecondary]` | `mt-button-secondary` | Verfeinerung | Button, Hüllen-Host | [button](button.md) |
| `[mtButtonText]` | `mt-button-text` | Verfeinerung | Button, Hüllen-Host | [button](button.md) |
| `[mtButtonDanger]` | `mt-button-danger` | Verfeinerung | Button, Hüllen-Host | [button](button.md) |
| `[mtButtonIcon]` | `mt-button-icon` | Querschnitt (Icon-Form) | `matIconButton` | [button](button.md) |
| `[mtButtonBadge]` | `mt-button-badge` | Querschnitt (Zähler) | Button | [button](button.md) |
| `[mtButtonTile]` | `mt-button-tile` | Querschnitt (Form des Action-Buttons) | Button in `app-atlas-action-btn` | [action-button](action-button.md) |
| `[mtField]` | `mt-field` | Basis (Container) | `mat-form-field` | [field](field.md) |
| `[mtLabel]` | `mt-label` | Basis | `mat-label` | [field](field.md) |
| `[mtHint]` | `mt-hint` | Basis | `mat-hint` | [field](field.md) |
| `[mtError]` | `mt-error` | Basis | `mat-error` | [field](field.md) |
| `[mtInput]` | `mt-input` | Basis | `input[matInput]` | [input](input.md) |
| `[mtInputNumeric]` | `mt-input-numeric` | Verfeinerung (mtInput) | `input` (type number) | [input](input.md) |
| `[mtInputAction]` | `mt-input-action` | Querschnitt (Aktion im Feld) | Control | [input](input.md) |
| `[mtTextarea]` | `mt-textarea` | Basis | `textarea[matInput]` | [input](input.md) |
| `input[matInput][readonly]:not(.atlas-optics-trigger-input), textarea[matInput][readonly], mat-select[readonly], input[matChipInputFor][readonly]` | `mt-readonly` (an, wenn `readonly`) | Querschnitt (automatisch) | readonly-Control | [field](field.md) |
| `[mtSelect]` | `mt-select` | Basis | `mat-select` | [select](select.md) |
| `[mtSelectMulti]` | `mt-select-multi` | Verfeinerung (mtSelect) | `mat-select multiple` | [select](select.md) |
| `[mtOption]` | `mt-option` | Basis | `mat-option` | [select](select.md) |
| `[mtAutocomplete]` | `mt-autocomplete` | Basis | `input[matAutocomplete]` | [select](select.md) |
| `[mtAutocompleteMulti]` | `mt-autocomplete-multi` | Verfeinerung (mtAutocomplete) | Chip-Eingabe (`matChipInputFor`) | [select](select.md) |
| `[mtRange]` | `mt-range` | Basis | Wrapper-`div` in `atlas-form-minmaxinput`/`-nomminmaxinput` | [range-and-datepicker](range-and-datepicker.md) |
| `[mtDatepicker]` | `mt-datepicker` | Basis | `input[matDatepicker]` | [range-and-datepicker](range-and-datepicker.md) |
| `[mtCheckbox]` | `mt-checkbox` | Basis | `mat-checkbox` | [choice-controls](choice-controls.md) |
| `[mtRadio]` | `mt-radio` | Basis | `mat-radio-button` | [choice-controls](choice-controls.md) |
| `[mtSwitch]` | `mt-switch` | Basis | `mat-slide-toggle` | [choice-controls](choice-controls.md) |
| `[mtSurface]` | `mt-surface` | Querschnitt (Kartenfläche) | beliebiger Container | [surface-and-card](surface-and-card.md) |
| `[mtCard]` | `mt-card` | Komposition (mtSurface) | `mat-card`, Seiten-Container | [surface-and-card](surface-and-card.md) |
| `[mtCardHeader]` | `mt-card-header` | Basis | `mat-card-header` | [surface-and-card](surface-and-card.md) |
| `[mtCardTitle]` | `mt-card-title` | Basis | `mat-card-title` | [surface-and-card](surface-and-card.md) |
| `[mtCardContent]` | `mt-card-content` | Basis | `mat-card-content` | [surface-and-card](surface-and-card.md) |
| `[mtCardActions]` | `mt-card-actions` | Basis | `mat-card-actions` | [surface-and-card](surface-and-card.md) |
| `[mtPanel]` | `mt-panel` | Basis | `mat-expansion-panel` | [panel](panel.md) |
| `[mtPanelHeader]` | `mt-panel-header` | Basis | `mat-expansion-panel-header` | [panel](panel.md) |
| `[mtDialogHeader]` | `mt-dialog-header` | Basis | `[mat-dialog-title]` | [dialog](dialog.md) |
| `[mtDialogContent]` | `mt-dialog-content` | Basis | `mat-dialog-content` | [dialog](dialog.md) |
| `[mtDialogActions]` | `mt-dialog-actions` | Basis | `mat-dialog-actions` | [dialog](dialog.md) |
| `mat-menu[mtMenu]` | `mt-menu` (Overlay-Klasse, ergänzt `overlayPanelClass`) | Basis | `mat-menu` | [menu-and-tooltip](menu-and-tooltip.md) |
| `[mtMenuItem]` | `mt-menu-item` | Basis | `[mat-menu-item]` | [menu-and-tooltip](menu-and-tooltip.md) |
| `[matTooltip][mtTooltip]` | `mt-tooltip` (setzt `tooltipClass`) | Basis | Element mit `matTooltip` | [menu-and-tooltip](menu-and-tooltip.md) |
| `[mtTabs]` | `mt-tabs` | Basis | `mat-tab-group` | [tabs-and-nav](tabs-and-nav.md) |
| `[mtTabsTab]` | `mt-tabs-tab` | Basis | `span` mit Tab-Text | [tabs-and-nav](tabs-and-nav.md) |
| `[mtTabsSubtitle]` | `mt-tabs-subtitle` | Basis | `span` mit Tab-Untertitel | [tabs-and-nav](tabs-and-nav.md) |
| `[mtNavItem]` | `mt-nav-item` | Basis | `[mat-list-item]` im linken Menü | [tabs-and-nav](tabs-and-nav.md) |
| `[mtNavItemGroup]` | `mt-nav-item-group` | Basis | `app-atlas-nav-group` | [tabs-and-nav](tabs-and-nav.md) |
| `ag-grid-angular[mtGrid]` | `mt-grid` | Basis (setzt Theme) | `ag-grid-angular` | [grid](grid.md) |
| `[mtGridEditor]` | `mt-grid-editor` | Basis | `mat-form-field` im Zell-Editor | [grid](grid.md) |
| `[mtRole]` (Eingabe `mtRole`) | `mt-role mt-role-<rolle>` | Querschnitt | Text, Icon, Tag | [tag-and-role](tag-and-role.md) |
| `[mtTag]` (Eingabe `mtTag` = Rolle) | `mt-tag` (+ `mt-role …`) | Komposition (mtRole) | Status-Tag | [tag-and-role](tag-and-role.md) |
| `[mtCompact]` | `mt-compact` | Querschnitt (Bereich) | Bereich/Toolbar | [compact-and-unit](compact-and-unit.md) |
| `[mtUnit]` | `mt-unit` | Querschnitt | Einheit in Label/Header | [compact-and-unit](compact-and-unit.md) |

Hinweis: `[mtButton]` steht im Template einer Hülle direkt am inneren Button; beim Aufrufer nie allein (immer Verfeinerung). Nicht zu den mt-Direktiven gehören `prevent-number-wheel-scroll.directive.ts` und `truncate.pipe.ts` im selben Ordner.
