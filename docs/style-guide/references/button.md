# Button
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> Buttons sind Material-Buttons (`matButton`/`matIconButton`) mit der Basis `mtButton` und genau einer Verfeinerung (Primary, Secondary, Text, Danger); dazu Querschnitts-Formen für Icon, Zähler und Kachel sowie drei Hüllen-Komponenten.

## Überblick

| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `mtButton` | `mt-button` (+ Klasse der Verfeinerung) | Basis | `button[matButton]`, `button[matIconButton]`; nur in Hüllen-Templates direkt, sonst über die Verfeinerung eingeschlossen | `directives/mt-button.directive.ts`, `styles/mt/buttons/_mt-button.scss` |
| `mtButtonPrimary` | `mt-button-primary` | Verfeinerung (schließt `mtButton` per `hostDirectives` ein, Erscheinungsbild `filled`) | Button oder Hüllen-Host | `mt-button-primary.directive.ts`, `_mt-button-primary.scss` |
| `mtButtonSecondary` | `mt-button-secondary` | Verfeinerung (`outlined`) | wie oben | `mt-button-secondary.directive.ts`, `_mt-button-secondary.scss` |
| `mtButtonText` | `mt-button-text` | Verfeinerung (`text`) | wie oben | `mt-button-text.directive.ts`, `_mt-button-text.scss` |
| `mtButtonDanger` | `mt-button-danger` | Verfeinerung (`filled`) | wie oben | `mt-button-danger.directive.ts`, `_mt-button-danger.scss` |
| `mtButtonIcon` | `mt-button-icon` | Querschnitt (keine Basis), quadratische Icon-Form | `button[matIconButton]` | `mt-button-icon.directive.ts`, `_mt-button-icon.scss` |
| `mtButtonBadge` | `mt-button-badge`; Zählerelement `mt-button-badge-count` | Querschnitt | Button mit `matBadge` oder Zählerelement der Action-Button-Hülle | `mt-button-badge.directive.ts`, `_mt-button-badge.scss` |
| `mtButtonTile` | `mt-button-tile`; Kurzlabel `mt-button-tile-label` | Querschnitt, Form des Action-Buttons (Icon über Kurzlabel, in Grid/Liste) | Button der Hülle `app-atlas-action-btn` | siehe [action-button](action-button.md) |
| Token `MT_BUTTON_VARIANT` | - | Injektions-Token, trägt Erscheinungsbild und Klasse der Verfeinerung zur Basis | von jeder Verfeinerung per `providers` bereitgestellt | `mt-button.directive.ts` |

Alle Direktiven stehen im Barrel `directives/mt-directives.ts` (`MT_DIRECTIVES`); Pfade relativ zu `src/frontend/src/app/util/directives/` bzw. `src/frontend/src/styles/mt/`.

## Verwendung

Entscheidungshilfe, welche Verfeinerung wofür:

| Verfeinerung | Wofür | Typisch |
|---|---|---|
| `mtButtonPrimary` | Die eine Hauptaktion einer Ansicht oder eines Dialogs (grün gefüllt) | Search, Create Experiment, Save |
| `mtButtonSecondary` | Gleichrangige Nebenaktion mit sichtbarem Rand | Remove all Filters |
| `mtButtonText` | Unauffällige Aktion ohne Rand: Abbrechen, Toolbar-, Zeilen- und Icon-Aktionen, Aktions-Kacheln | Cancel, Reset filters (Icon) |
| `mtButtonDanger` | Zerstörende oder unumkehrbare Aktion (rot gefüllt); als Icon-Button nur rotes Icon | Delete Experiment, remove-Icon |
| `+ mtButtonIcon` | Nur Icon, quadratisch; immer mit `matIconButton`, Verfeinerung `mtButtonText` oder `mtButtonDanger` | Refresh, Menü-Trigger |

Regeln: Pro Button genau eine Verfeinerung. Die Basis `mtButton` nie beim Aufrufer notieren. Farben, Höhe, Schrift, Rand nie per Komponenten-SCSS setzen. Kompakt (32 px) kommt vom Bereich, nicht vom Button: `mtCompact` am Container (siehe [compact-and-unit](compact-and-unit.md)).

```html
<!-- Aufrufer: Material-Button mit genau einer Verfeinerung -->
<button matButton mtButtonPrimary>Search</button>
<button matButton mtButtonDanger>Delete Experiment</button>

<!-- Icon-Button: matIconButton + mtButtonIcon + Verfeinerung (aus system-logs.component.html) -->
<button mtButtonIcon mtButtonText mtTooltip matIconButton matTooltip="Refresh">...</button>

<!-- Hülle: Verfeinerung am Host (aus experiment-dashboard-toolbar.component.html) -->
<app-atlas-btn mtButtonPrimary ...></app-atlas-btn>
<app-atlas-action-btn mtButtonText icon="preview" label="Sales Report" tooltip="Create Sales Report" ...></app-atlas-action-btn>
```

Syntax: Alle Buttons nutzen `matButton` bzw. `matIconButton`. Die alten Attribute `mat-button`, `mat-flat-button`, `mat-stroked-button`, `mat-raised-button`, `mat-icon-button`, `mat-fab`, `mat-mini-fab`, `matFab`, `matMiniFab` meldet der Lint. Raised entfällt als Erscheinungsbild; die Verfeinerung setzt das Material-Erscheinungsbild selbst (`filled`/`outlined`/`text`), ein Template-Wert für `matButton` ist nicht nötig.

Umstellungsregel der Bestands-Buttons (AC-65, Codemod `buttonRefinement`):

| Bestand | Ziel |
|---|---|
| Warnfarbe (`color="warn"`), unabhängig vom Typ | `mtButtonDanger` |
| flat / raised (Primärfarbe) | `mtButtonPrimary` |
| stroked | `mtButtonSecondary` |
| basic (`mat-button`) | `mtButtonText` |
| Icon-Button (`mat-icon-button`) | `mtButtonIcon` + `mtButtonText`, mit Warnfarbe `mtButtonIcon` + `mtButtonDanger` |

Typische Fehler und Lint-Meldungen (alle Severity `error`):

| Fehler | Regel / Meldung |
|---|---|
| `matButton` ohne Verfeinerung | `mt/button-refinement`: "Button braucht genau eine Verfeinerung (mtButtonPrimary \| mtButtonSecondary \| mtButtonText \| mtButtonDanger), gefunden: keine." |
| Zwei Verfeinerungen am selben Button | `mt/button-refinement`, "gefunden: mtButtonPrimary, mtButtonDanger" |
| `matIconButton` ohne `mtButtonIcon` | `mt/button-refinement`: "matIconButton braucht mtButtonIcon." |
| `mtButton` zusammen mit einer Verfeinerung (Doppelangabe) | `mt/no-redundant-base`: "mtButtonPrimary schließt mtButton bereits ein; mtButton entfernen." |
| `mtButton` allein beim Aufrufer | `mt/button-refinement` (gefunden: keine); Basis allein ist nur in den Templates der Hüllen erlaubt |
| Veraltetes Attribut (`mat-flat-button` usw.) | `mt/require-directive`: "mat-flat-button ist veraltet: matButton bzw. matIconButton mit einer mt-Verfeinerung nutzen." |
| `<app-atlas-btn>`, `<app-atlas-icon-button>`, `<app-atlas-action-btn>` ohne Verfeinerung am Host | `mt/button-refinement` (Hüllen-Hosts zählen als Button) |

## Zielwerte

Bei Basisschrift 16 px (1 rem = 16 px); Werte skalieren mit der Schrift (Test: Primär-Button 44 px mal 13/16). Hex-Werte: `src/frontend/src/styles/_mt-tokens.scss`.

| Eigenschaft | Wert | Zustand | Quelle |
|---|---|---|---|
| Höhe | 44 px (`control-height` 2.75rem); in `.mt-compact` 32 px (`control-height-compact` 2rem) | alle | AC-02, AC-07; `_mt-button.scss`, `_mt-compact.scss` |
| Radius | 0 (`radius-none`) | alle | AC-02 |
| Innenabstand seitlich | 36 px (2.25rem) | alle (nicht Icon) | AC-02 |
| Schrift | 13 px (`font-size-sm`), fett, Versalien | alle | AC-02 |
| Rand | 1 px, Grundfarbe transparent (Verfeinerung färbt) | alle | `_mt-button.scss` |
| Übergang | 0,15 s auf Hintergrund, Schrift, Rand | Hover | `_mt-button.scss` |
| Fokus | 2 px Outline `color-focus` (#000000), Abstand 2 px (`:focus-visible`) | Fokus | AC-10 |
| Deckkraft | 0,4 (`:disabled`, `.mat-mdc-button-disabled`); Farben bleiben wie Ruhe, Klick löst nichts aus | Disabled | AC-09 |
| **Primary** Hintergrund, Rand, Schrift | #BBD03A, #BBD03A, weiß #FFFFFF | Ruhe | AC-02 |
| Primary | Hintergrund weiß, Schrift und Rand #BBD03A | Hover | AC-03 |
| **Secondary** Hintergrund, Rand, Schrift | transparent, #0B0B0B, #0B0B0B | Ruhe | AC-04 |
| Secondary | Hintergrund #0B0B0B, Schrift weiß | Hover | AC-04 |
| **Text** Rand, Hintergrund, Schrift | keiner (transparent), transparent, #0B0B0B | Ruhe | AC-05 |
| Text | Hintergrund #EFF0F4 (`color-hover`) | Hover | AC-05 |
| **Danger** Hintergrund, Rand, Schrift | #FF0201 (`role-error`), #FF0201, weiß | Ruhe | AC-06 |
| Danger | Hintergrund weiß, Schrift und Rand #FF0201 | Hover | AC-06 |
| **Icon** Größe | 44 x 44 px, kompakt 32 x 32 px, ohne Rand, Radius 0 | Ruhe | AC-07 |
| Icon Farbe | Icon #0B0B0B, Hintergrund transparent; Hover Hintergrund #EFF0F4 | Ruhe / Hover | AC-07 |
| Icon + Danger | Icon #FF0201, Hintergrund transparent; Hover Hintergrund #EFF0F4 | Ruhe / Hover | AC-56 |
| **Zähler** (Badge) | Hintergrund #BBD03A, Schrift weiß 12 px (`font-size-xs`) fett, Radius 20 px (`radius-badge`), Innenabstand 2 px / 5 px | immer | AC-08 |
| **Action-Button** (Kachel) | eigene Form mit eigenen Zielwerten (8 px Light, Ellipsis, 50 px breit): siehe [action-button](action-button.md) | alle | AC-09 |

Zusammenspiel Verfeinerung und Icon/Badge: AC-57 (beide wirken ohne Laufzeitfehler); Verfeinerung an Hüllen-Host: AC-60.

## Aufbau (intern)

Basis liest die Verfeinerung über den Token und setzt Klasse und Material-Erscheinungsbild (`src/app/util/directives/mt-button.directive.ts`):

```ts
export const MT_BUTTON_VARIANT = new InjectionToken<MtButtonVariant>('MT_BUTTON_VARIANT');
...
private readonly button = inject(MatButton, { self: true, optional: true });
private readonly variant = inject(MT_BUTTON_VARIANT, { optional: true });
readonly hostClasses = this.variant ? `mt-button ${this.variant.cssClass}` : 'mt-button';
ngOnInit(): void {
  if (this.button && this.variant) { this.button.setAppearance(this.variant.appearance); }
}
```

Eine Verfeinerung schließt die Basis per `hostDirectives` ein und stellt den Token bereit (`mt-button-primary.directive.ts`):

```ts
host: { class: 'mt-button-primary' },
hostDirectives: [MtButtonDirective],
providers: [{ provide: MT_BUTTON_VARIANT, useValue: { appearance: 'filled', cssClass: 'mt-button-primary' } }],
```

| Verfeinerung | `appearance` | `cssClass` |
|---|---|---|
| Primary | `filled` | `mt-button-primary` |
| Secondary | `outlined` | `mt-button-secondary` |
| Text | `text` | `mt-button-text` |
| Danger | `filled` | `mt-button-danger` |

Wirkungsweise des Tokens:
- Am Button selbst: Verfeinerung und Basis liegen am selben Element; die Basis findet den Token am eigenen Element, setzt Klasse und Erscheinungsbild.
- Am Hüllen-Host (`<app-atlas-btn mtButtonPrimary>`): der Token liegt im Element-Injector des Hosts. Die Basis im Template der Hülle (`<button matButton mtButton>`) findet ihn beim Nachschlagen nach oben und setzt Klasse und Erscheinungsbild am inneren Button. Der Host selbst trägt ebenfalls die Klasse der Verfeinerung (`host: { class }`); die Partials zielen auf `.mat-mdc-button-base`, wirken also nur am Material-Button.
- Verschachtelungs-Hinweis (Ledger Task 6): Buttons sind nie verschachtelt, deshalb findet die Suche nach oben nur die eigene Verfeinerung. Läge ein Button im Inneren einer Hülle, die selbst eine Verfeinerung trägt, würde er sie erben. Neue Hüllen beachten das (nur ein Button je Hüllen-Host).
- `hostClasses` und `cssClass` sind doppelt gepflegt (Ledger Task 6, zurückgestellt): Klasse einer neuen Verfeinerung an beiden Stellen eintragen.

Partials (Gruppe `styles/mt/buttons/`, Index `_index.scss`), Selektoren:
- `_mt-button.scss`: `.mt-button.mat-mdc-button-base`; setzt per `mat.button-overrides` für `text`, `filled`, `outlined` je `container-height` (`control-height`), `container-shape` (`radius-none`), `horizontal-padding` (2.25rem), Schriftgröße (`font-size-sm`), `font-weight-bold`, `uppercase`, `hover-state-layer-opacity: 0`; plus Rand, Übergang, Fokus, Disabled.
- Verfeinerungs-Partials: `.mt-button-<name>.mat-mdc-button-base:not(.mt-button-icon)`, Farben über `mat.button-overrides` (`filled-*`, `outlined-*`, `text-*`, jeweils auch `*-disabled-*`), Hover über `&:hover:not(:disabled)`. Der Ausschluss `:not(.mt-button-icon)` hält Füll-/Rand-Farben vom Icon-Button fern.
- `_mt-button-icon.scss`: `.mt-button-icon.mat-mdc-icon-button`; `mat.icon-button-overrides` (`state-layer-size`, `container-shape`, `icon-color`, `hover-state-layer-opacity: 0`), Breite/Höhe leitet Material aus `state-layer-size` (`control-height`) ab, Hover-Fläche `color-hover`; `.mt-button-danger` darin setzt `icon-color` auf `role-error`.
- `_mt-button-badge.scss`: `.mt-button-badge` setzt `mat.badge-overrides` (Material-Badge); `.mt-button-badge .mt-button-badge-count` gestaltet das eigene Zählerelement (absolut oben rechts, Zielwerte wie Zähler).
- `_mt-button-tile.scss`: Form des Action-Buttons, siehe [action-button](action-button.md).
- Tokens: `color-primary`, `color-on-primary`, `color-surface`, `color-ink`, `color-on-accent`, `color-hover`, `color-selected`, `color-focus`, `color-transparent`, `role-error`, `control-height` (laufzeitfähig, wird in `.mt-compact` überschrieben), `control-height-compact`, `radius-none`, `radius-badge`, `font-size-2xs/xs/sm`, `font-weight-bold`.
- Spezifität: Selektoren hängen an `.mat-mdc-button-base` bzw. `.mat-mdc-icon-button`, damit sie die Material-Theme-Werte schlagen, ohne `!important`.

## Hüllen-Komponenten

Pfad: `src/frontend/src/app/components/common/`. Der Aufrufer setzt die Verfeinerung am Host; Layout-Klassen (z. B. `drag-handle-btn`, `trash-btn`) per `class` am Host. Der innere Button trägt nur die Basis `mtButton` (erlaubt, weil Hüllen-Template, siehe Lint).

| Hülle (Selektor) | Eingaben | Ausgaben | Innen |
|---|---|---|---|
| `atlas-button` (`app-atlas-btn`) | `label` (Pflicht), `icon`, `loading`, `disabled`, `badge`, `fullWidth` (Standard `true`) | `clicked` | `button[matButton mtButton mtButtonBadge]`, Ladeanzeige `mat-progress-spinner` (18), Icon `mat-icon`, Zähler per `matBadge`; `disabled` = `disabled() \|\| loading()` |
| `atlas-action-btn` (`app-atlas-action-btn`, **Action-Button**, eigene Seite [action-button](action-button.md)) | `icon` (Pflicht), `label` (Pflicht), `tooltip` (Pflicht), `disabled`, `disabledTooltip`, `active`, `badge` | `clicked` | `button[matButton mtButton mtButtonBadge mtButtonTile]`, Tooltip (`matTooltip` + `mtTooltip`), `[aria-disabled]` statt `disabled` (Tooltip bleibt erreichbar), Zähler als `span.mt-button-badge-count` bei `badge > 0`, Klick bei `disabled` unterdrückt |
| `atlas-icon-button` (`app-atlas-icon-button`) | `icon` (Pflicht), `ariaLabel` (Pflicht), `disabled`, `cdkDragHandle` | `clicked` | `button[matIconButton mtButton mtButtonIcon]`, bei `cdkDragHandle` mit `cdkDragHandle`; Verfeinerung `mtButtonText` oder `mtButtonDanger` |

Entfallen (Commit 14f8a6a8, Optik-Eingaben): bei `atlas-button` `variant`, `color`, `badgeColor`, `badgePosition`, `btnClass`, `btnStyle`; bei `atlas-icon-button` `color`, `btnClass`. Ersatz: Verfeinerung und Layout-Klasse am Host. `atlas-action-btn` hat nur Verhaltens-Eingaben; `mtButtonText` ist Standard des Codemods für diese Hülle.

Layout-Reste der Hüllen-SCSS (nur Anordnung, keine Optik): `atlas-button.component.scss` (`full-width` 100 %, Icon-Abstand, `z-index` des Badges), `atlas-action-btn.component.scss` (siehe [action-button](action-button.md)), `atlas-icon-button.component.scss` (Cursor `grab`/`grabbing` bei `.drag-handle-btn`).

## Tests

- Unit: `directives/mt-button.directive.spec.ts` (Basis, Erscheinungsbild-Voreinstellung, Verfeinerung am Hüllen-Host wirkt auf inneren Button), `mt-button-primary|secondary|text|danger.directive.spec.ts`, `mt-button-icon|badge|tile.directive.spec.ts`, Hüllen-Specs `atlas-button.component.spec.ts` und `atlas-icon-button.component.spec.ts` (nutzen `remainingOpticInputs`: keine Optik-Eingaben mehr), `atlas-action-btn.component.spec.ts`. Test-Hilfe `directives/testing/mt-directive.testing.ts`.
- Browser: `e2e/tests/mt-targets.spec.ts` (Primär-Button 44 px/grün/13 px/Versalien/Radius 0/Innenabstand 36 px; Hover weiß mit grüner Schrift; Kompakt-Höhe 32 px am Create-Button der Dashboard-Toolbar; Skalierung 44 x 13/16; Aktions-Kachel im Suchergebnis-Grid: Label-Wrapper nicht höher als das Label, kein Abstand zwischen Icon und Label, Inhalt innerhalb des Buttons; Aktions-Kacheln und Like/Dislike 8 px Light, kein Label ragt über die Kachel).
- Handliste `e2e/mt-messliste.md`: Zeilen AC-04 bis AC-10 und AC-56 (Orte: Such-Wizard "Remove all Filters", Dialog "Save view", Wizard-Fußzeile "Delete Experiment", Systemprotokolle, Such-Seitenleiste "Search"); Spalten für Messung noch leer.
- Lint: ESLint `mt/require-directive`, `mt/button-refinement`, `mt/no-redundant-base` (`eslint-rules/mt-directives.cjs`, Zuordnung `mt-directive-map.json`, Konfiguration `eslint.config.js`, Severity `error` über `MT_SEVERITY`); Regel-Tests `eslint-rules/mt-directives.test.cjs`, `mt-config.test.cjs`. Stylelint und Lint-Gate: siehe [enforcement](enforcement.md).
- Codemod-Test: `scripts/mt-migrate-templates.test.mjs`.

### Codemod `scripts/mt-migrate-templates.mjs` (Button-Teil)

Einmal-Codemod, Aufruf `node scripts/mt-migrate-templates.mjs <datei.html|datei.ts> [...]`; arbeitet auf dem Template-AST und ändert nur Attribute im Start-Tag.
- `migrateButton`: ersetzt `mat-button|mat-flat-button|mat-raised-button|mat-stroked-button|mat-icon-button` durch `matButton`/`matIconButton`, entfernt `color`, fügt die Verfeinerung nach `buttonRefinement(type, color)` ein (Icon zusätzlich `mtButtonIcon`). Dynamisches `[color]` wird als "MANUELL: dynamische color" gezählt.
- `migrateButtonWrapperHost` (`app-atlas-btn`) und `migrateIconButtonWrapperHost` (`app-atlas-icon-button`): setzen die Verfeinerung am Host aus `variant`/`color`, verschieben `btnClass` nach `class`, entfernen `variant`, `color`, `btnStyle`, `badgeColor`, `badgePosition`. Dynamisches `variant` wird als "MANUELL" gemeldet. `app-atlas-action-btn` erhält `mtButtonText`.
- Guard `hasButtonRefinement(element)`: trägt das Element schon eine der vier Verfeinerungen, fasst der Codemod die Hüllen-Hosts nicht erneut an (Idempotenz bei zweitem Lauf und Handumstellung).
- Hüllen-Templates (`atlas-button/icon-button/action-btn.component.html` u. a.) stehen in `MANUAL_TEMPLATES` und wurden von Hand umgestellt.

## Abweichungen ggü. Spec/Plan

| Thema | Jetzt (Code) | Spec/Plan | Grund |
|---|---|---|---|
| Codemod-Idempotenz | Guard `hasButtonRefinement` vor Hüllen-Hosts | Brief-Code ohne Guard | Zweiter Lauf hätte Verfeinerungen doppelt gesetzt (Ledger Task 13) |
| Zähler-Klasse | `mt-button-badge-count` wird in der Hülle `atlas-action-btn` vergeben | Plan: Task 16 (Hülle) | geklärt in Ledger Task 6, keine inhaltliche Abweichung |

Der Action-Button (Grid-/Listenzeile) hat eigene Abweichungen auf [action-button](action-button.md). Sonst keine Abweichungen bei Zielwerten (AC-02 bis AC-10, AC-56 stimmen mit Partials überein).

## Offene Punkte

- Icon-Buttons in `mat-option` (`.task-option-copy`, `.task-option-delete`, Experiment-Task, Setup-Seite; 24 px): Spec kennt keine Ausnahme "Aktion in Option"; weichen von AC-07 ab, Mensch entscheidet (Final-Review).
- `.panel-header-btn` (Such-Wizard, 7 Stellen, `search-strategie/styles/search-wizard-sections.scss`): ohne Kompakt-Ausnahme, Maße entfallen, Button bleibt 44 px (AC-07); Überlauf in der Kopfzeile im Browser nicht geprüft; Entscheid (Kompakt-Ausnahme) beim Menschen.
- Bausteinhöhen in Komponenten-Stylesheets: `unit-header.component.scss` (Z. 159-163 `height: 32px !important` am Host, Plan-Zwischenstand aus Task 13; Task 20 sollte bereinigen); `.filter-panel.has-filters` behält begründetes `!important` (Browser-Notwendigkeit ungeprüft, Task 20).
- Wizard-Fußleiste und Such-Wizard-Kopfzeile: Überlauf im Browser nicht geprüft.
- Ungeprüft: Toolbar-Icon-Button der Parameter-Toolbar (32 x 32 unskaliert), `autopilot-unified__toggle` (86 x 38).
- `mat-button-toggle` (Score-Editor, Bewertungsgruppe, Sales-Report) hat weder mt-Direktive noch Lint-Regel; Spec-Lücke (Styles in `_result-overrides.scss`).
- Task 6 (zurückgestellt): `hostClasses`/`cssClass` doppelt gepflegt; Badge-Spec prüft nur Host-Klasse; Verschachtelungs-Hinweis zu `MT_BUTTON_VARIANT` für künftige Hüllen.
- Task 3 (zurückgestellt): `mt-config.test.cjs` deckt `button-refinement`/`no-redundant-base` über die Config nicht ab.
- Task 13: dynamisches `[color]` an einer Hülle ergäbe stilles `primary` (Bestand: kommt nicht vor); `mt-migrate-templates.test` mit `assert.throws` ohne Matcher.
- Task 16: Hüllen ohne TDD-Rot-Phase umgesetzt.
- Alle Zielwerte sind nur teilweise im Browser gemessen: Messliste hat leere Messspalten; Browser-Test deckt nur Primary und Kompakt ab.

## Ändern: Checkliste

1. Optik einer Verfeinerung ändern: Wert im Partial `styles/mt/buttons/_mt-button-<name>.scss` über Token (`_mt-tokens.scss`), nicht als Literal; Wert, der alle Buttons betrifft: `_mt-button.scss`.
2. Neue Verfeinerung: Direktive (mit `hostDirectives: [MtButtonDirective]`, `host.class`, Provider `MT_BUTTON_VARIANT`), Partial samt Eintrag in `_index.scss`, Barrel `mt-directives.ts`, `INCLUDES` und `BUTTON_REFINEMENTS` in `eslint-rules/mt-directives.cjs`, `BUTTON_REFINEMENTS` im Codemod, Spec, Messliste-Zeile.
3. Hülle ändern: Eingaben nur für Verhalten; keine Optik-Eingaben, Verfeinerung bleibt am Host; Template-Name in `BUTTON_WRAPPER_TEMPLATES`/`BUTTON_WRAPPER_HOSTS` (Lint) und `MANUAL_TEMPLATES` (Codemod) pflegen.
4. Nicht tun: keine Farb-, Höhen-, Schrift- oder Rand-Literale in Komponenten-SCSS; kein `!important` ohne Kommentar; `mtButton` nie beim Aufrufer; Budget in `angular.json` nicht anheben; Raised/Fab nicht wieder einführen; Kompakt nicht per fester Höhe, sondern über `mtCompact`.
5. Tests nachziehen: Direktiven-Spec, Hüllen-Spec, ggf. `e2e/tests/mt-targets.spec.ts`, `e2e/mt-messliste.md`; Lint und Stylelint laufen lassen (siehe [enforcement](enforcement.md)).
6. Diese Referenzseite im selben Zug korrigieren (Zielwerte, Tabellen, Offene Punkte, Stand-Zeile).
