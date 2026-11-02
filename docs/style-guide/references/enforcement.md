# Durchsetzung und Werkzeuge
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 51a253e3 plus verschlanktes Theme (ungecommittet) (2026-10-21)

> Welche automatischen Prüfungen die mt-Optik absichern (ESLint, Lint-Gate, Stylelint, Build-Budgets, Node-Tests), wie man sie aufruft, und welche Codemods einmalig die Umstellung gemacht haben.

Alle Pfade relativ zu `src/frontend`, sofern nicht anders angegeben. Alle neuen Prüfregeln stehen auf **Fehler** (`MT_SEVERITY = "error"` in `eslint.config.js`, `'error'` in `stylelint.config.mjs`; Task 27, Commit 5dab09a8, AC-54; geprüft von `scripts/mt-severity.test.mjs`).

## Überblick

| Werkzeug | Datei | Prüft | Spec |
|---|---|---|---|
| ESLint-Plugin `mt` | `eslint-rules/mt-directives.cjs` | Templates: rohe Material-Elemente, Button-Verfeinerung, Doppelangabe Verfeinerung + Basis | AC-37, AC-38, AC-59 |
| Zuordnungstabelle | `eslint-rules/mt-directive-map.json` | Element/Attribut -> erlaubte mt-Direktiven; gemeinsame Quelle für Lint und Template-Codemod | AC-38 |
| ESLint-Konfiguration | `eslint.config.js` | Farbliterale und Grid-Theme-Parameter in TS, 100-Zeilen-Grenze je Direktive, Anbindung der `mt/*`-Regeln | AC-41, AC-47 |
| Lint-Gate | `scripts/mt-lint-gate.mjs` | filtert die ESLint-Meldungen auf die mt-Regeln (ohne Bestandsmeldungen) | - |
| Stylelint | `stylelint.config.mjs`, `stylelint-plugins/mt-max-file-size.mjs` | Komponenten-Stylesheets ohne Literale für Farbe/Schatten/Radius/Schrift, kein Farbliteral außerhalb `src/styles/`, `!important` nur mit Grund, Partial höchstens 2 kB | AC-39, AC-40, AC-41, AC-48 |
| Build-Budgets | `angular.json` (`production.budgets`) | Komponenten-Stylesheet, globales Stylesheet-Bundle | AC-42, AC-49 |
| Codemods | `scripts/mt-migrate-templates.mjs`, `mt-migrate-styles.mjs`, `mt-split-styles.mjs` | einmalige Umstellung des Bestands | AC-65 |
| Node-Tooling-Tests | `scripts/mt-*.test.mjs`, `eslint-rules/*.test.cjs`, `stylelint-plugins/*.test.mjs` | Werkzeuge, Konfiguration, Budgets, Tokens, Platzierungen, Messliste | siehe unten |

## ESLint: Plugin `mt` (Templates)

Die Regeln sind in `eslint.config.js` für `**/*.html` aktiv (`ignores: ["**/*.spec.ts/**"]`: Inline-Templates in Specs sind ausgenommen). Inline-Templates normaler Komponenten prüft `angular.processInlineTemplates`. Aus der Konfiguration:

```js
plugins: { mt: mtDirectives },
rules: {
  "mt/require-directive": MT_SEVERITY,
  "mt/button-refinement": MT_SEVERITY,
  "mt/no-redundant-base": MT_SEVERITY,
},
```

| Regel | Zweck | Befund (Beispiel, aus `eslint-rules/mt-directives.test.cjs`) | Meldung |
|---|---|---|---|
| `mt/require-directive` | Material-Buttons und -Felder nur mit mt-Direktive; veraltete Button-Attribute (`mat-button`, `mat-flat-button`, `mat-stroked-button`, `mat-raised-button`, `mat-icon-button`, `mat-fab`, `mat-mini-fab`, `matFab`, `matMiniFab`) sind verboten | `<mat-form-field><input matInput mtInput /></mat-form-field>` (Container ohne `mtField`) | `<mat-form-field> braucht eine mt-Direktive: mtField \| mtGridEditor.` |
| | | `<textarea matInput></textarea>` | `<textarea> braucht eine mt-Direktive: mtTextarea.` |
| | | `<span matTooltip="Hint"></span>` | `<span> braucht eine mt-Direktive: mtTooltip.` |
| | | `<button mat-flat-button mtButtonPrimary>` | `mat-flat-button ist veraltet: matButton bzw. matIconButton mit einer mt-Verfeinerung nutzen.` |
| `mt/button-refinement` | beim Aufrufer trägt jeder Button (`matButton`, `matIconButton`) und jeder Hüllen-Host (`app-atlas-btn`, `app-atlas-icon-button`, `app-atlas-action-btn`) **genau eine** Verfeinerung (`mtButtonPrimary` / `Secondary` / `Text` / `Danger`); `matIconButton` braucht `mtButtonIcon` | `<button matButton>` (keine), `<button matButton mtButtonPrimary mtButtonSecondary>` (zwei), `<app-atlas-btn label="Save" />`, `<button matButton mtButton>` beim Aufrufer | `Button braucht genau eine Verfeinerung (mtButtonPrimary \| mtButtonSecondary \| mtButtonText \| mtButtonDanger), gefunden: keine.` |
| | | `<button matIconButton mtButtonText>` | `matIconButton braucht mtButtonIcon.` |
| `mt/no-redundant-base` | Element trägt eine Verfeinerung/Komposition und zugleich die eingeschlossene Basis | `<input matInput mtInputNumeric mtInput>` | `mtInputNumeric schließt mtInput bereits ein; mtInput entfernen.` |

Details der Regeln im Code:

- `INCLUDES` (in `mt-directives.cjs`) ist die Liste Verfeinerung -> Basis: `mtButtonPrimary/Secondary/Text/Danger -> mtButton`, `mtInputNumeric -> mtInput`, `mtSelectMulti -> mtSelect`, `mtAutocompleteMulti -> mtAutocomplete`, `mtCard -> mtSurface`, `mtTag -> mtRole`. Wer eine neue Verfeinerung mit `hostDirectives` baut, trägt sie dort ein.
- Hüllen-Hosts (`BUTTON_WRAPPER_HOSTS`) gelten beim Aufrufer als Träger der Verfeinerung. In den **Hüllen-Templates** (`atlas-button.component.html`, `atlas-icon-button.component.html`, `atlas-action-btn.component.html`) ist die Basis `mtButton` allein erlaubt (`BUTTON_WRAPPER_TEMPLATES`).
- Zuordnung Element/Attribut -> Direktive steht in `eslint-rules/mt-directive-map.json`: `elements` (z. B. `mat-form-field -> [mtField, mtGridEditor]`, `mat-select -> [mtSelect, mtSelectMulti]`, `mat-card -> [mtCard]`, `mat-expansion-panel -> [mtPanel]`, `mat-menu -> [mtMenu]`, `mat-tab-group -> [mtTabs]`, `ag-grid-angular -> [mtGrid]`, `app-atlas-nav-group -> [mtNavItemGroup]` u. a.) und `attributes` (z. B. `matInput` an `input` -> `mtInput | mtInputNumeric | mtDatepicker | mtAutocomplete`, an `textarea` -> `mtTextarea`; `matChipInputFor`; `mat-dialog-title`; `mat-menu-item`; `matTooltip`; `mat-list-item`). Mindestens eine der genannten Direktiven muss am Element stehen. Der Template-Codemod liest dieselbe Datei und nimmt jeweils die erste Direktive als Standard; `mt-migrate-templates.test.mjs` prüft die Übereinstimmung (`elementDirectives_SharedDirectiveMap_UseTheFirstDirectiveAllowedByTheLint`).
- Eine neue Direktive an einem neuen Material-Element: Eintrag in `mt-directive-map.json` ergänzen (sonst bleibt das Element ungeprüft).

## ESLint: `eslint.config.js` (TypeScript)

| Block | gilt für | Regel | Zweck |
|---|---|---|---|
| Farbliterale | `src/**/*.ts`, **ausgenommen** `src/**/*.spec.ts`, `src/**/*.testing.ts`, `src/app/util/grid/mt-grid-theme.ts`, `src/assets/data/score-colors.ts` | `no-restricted-syntax` mit `COLOR_LITERAL_SELECTORS` | Farbliterale nur in der Grid-Theme-Datei und in der Score-Palette (AC-52 stützt sich darauf) |
| Grid-Theme | wie oben | `no-restricted-syntax` mit `GRID_THEME_SELECTORS` | `.withParams(`, `.withPart(`, `createPart(` nur in `mt-grid-theme.ts` (AC-47) |
| Direktiven-Größe | `src/app/util/directives/mt-*.directive.ts` | `max-lines` 100 (`skipBlankLines: false`, `skipComments: false`) | eine Direktive je Datei, höchstens 100 Zeilen (AC-41) |
| Selektor-Präfix | `**/*.ts` | `@angular-eslint/directive-selector` Präfix `app`, `atlas`, `mt`, camelCase | Direktiven-Selektoren folgen dem Schema |

Regex der Farbliterale in TypeScript (aus `eslint.config.js`):

```js
"Literal[value=/^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/]"   // Hex 3, 4, 6, 8 Stellen als ganzer String
"Literal[value=/^rgba?\\(/]"                                              // rgb( / rgba( am Stringanfang
"TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b|rgba?\\(/]"              // Hex oder rgb(a) irgendwo in Template-Literalen
```

Meldung bei Treffer: `Farbliterale nur in src/app/util/grid/mt-grid-theme.ts oder src/assets/data/score-colors.ts.` Grenzen: Die beiden `Literal`-Selektoren erfassen nur Strings, die **ausschließlich** aus dem Hexwert bestehen bzw. mit `rgb(`/`rgba(` beginnen; ein Hex mitten in einem normalen String (`'color: #fff'`) fällt nur in Template-Literalen (Backticks) auf. Farbliterale in **externen HTML-Templates** (z. B. `style="color: #ba1a1a"`) prüft kein Werkzeug; das Final-Review fand `#ba1a1a` in `setup-page.component.html` von Hand und entfernte es (Commit 6536bb04, siehe [Korrekturen und offene Punkte](corrections-and-open-points.md)).

Bei Grid-Theme-Meldung: `Grid-Theme-Parameter nur in src/app/util/grid/mt-grid-theme.ts.`

## Lint-Gate `scripts/mt-lint-gate.mjs`

Lintet die übergebenen Pfade mit `eslint.config.js` und meldet **nur** Befunde der Regeln `mt/*`, `no-restricted-syntax`, `max-lines`, `@angular-eslint/directive-selector` (`MT_GATE_RULES`). Bestandsmeldungen (`no-explicit-any`, A11y-Warnungen, `no-this-alias`) bleiben außen vor; sie gehören nicht zu diesem Workitem.

```
cd src/frontend && node scripts/mt-lint-gate.mjs <datei|verzeichnis> [...]
```

Ausgabe je Befund `<datei relativ zu cwd>:<zeile> <regel> <text>`, am Ende `mt-lint-gate: <n> Befund(e)`; Exit 1 bei mindestens einem Befund, sonst 0 mit `mt-lint-gate: 0 Befund(e)` (Plan-Befehl "mt-Lint-Gate", Global Constraints). Letzter Gesamtlauf auf 6536bb04: 0 Befunde.

## Verschlanktes Material-Theme (`scripts/mt-theme-tokens.mjs`)

Stand 2026-10-21, Anweisung im Chat. `src/styles/_theme.scss` (mit `_brand.scss`, dem Austauschpunkt der Marke) bleibt die Quelle, wird aber nicht mehr in `styles.scss` eingebunden. Stattdessen bindet `styles.scss` die **erzeugte** Datei `src/styles/_theme-used.scss` ein; sie enthält nur die `--mat-sys-*`-Variablen, die das Production-Build liest (82 von 165, rund 3,6 kB weniger im Bundle). Die Liste steht in `src/styles/mt-theme-tokens.json`.

| Aufgabe | Befehl (in `src/frontend`) |
|---|---|
| Datei neu erzeugen (nach Änderung an `_brand.scss` oder `_theme.scss`) | `node scripts/mt-theme-tokens.mjs --write` |
| Liste neu aus dem Build berechnen (nach neuer Material-Komponente oder Material-Update; vorher `dv-angular-build`) | `node scripts/mt-theme-tokens.mjs --write --from-dist` |
| Wächter prüfen | `node --test scripts/mt-theme-tokens.test.mjs` |

Der Wächter-Test prüft: (1) `_theme-used.scss` ist aktuell zur Marke (sonst Hinweis auf `--write`), (2) jedes Token der Liste existiert im Theme, (3) die Datei definiert genau die Listen-Tokens, (4) `styles.scss` bindet `theme-used` ein, nicht `theme`, (5) das Build unter `dist/trumpf_frontend/browser` liest nur definierte Tokens (ohne Build übersprungen). Fehlt eine Variable (z. B. weil eine neue Material-Komponente `--mat-sys-title-large` braucht), schlägt (5) fehl; Behebung: `dv-angular-build`, dann `--write --from-dist`.

## Stylelint `stylelint.config.mjs`

`customSyntax: 'postcss-scss'`, `defaultSeverity` = `MT_SEVERITY` (`error`), `reportDescriptionlessDisables: [true, { severity }]` (ein `stylelint-disable` ohne ` -- Grund` ist selbst ein Fehler).

| Regel | Wirkung | Spec |
|---|---|---|
| `declaration-no-important` | `!important` verboten; erlaubt nur mit Kommentar direkt davor: `/* stylelint-disable-next-line declaration-no-important -- <Grund> */` | AC-48 |
| `color-no-hex`, `color-named: never`, `function-disallowed-list` (`rgb`, `rgba`, `hsl`, `hsla`, `hwb`, `lab`, `lch`, `oklab`, `oklch`) | keine Farbliterale | AC-40 |
| `declaration-property-value-allowed-list` | Allowlist für `color`, `background-color`, `border*-color`, `box-shadow`, `border*-radius`, `font-family`, `font-weight`, `font-size`: erlaubt sind `var(--mt-<name>)` (Regex `^var\(--mt-[a-z0-9-]+\)$`), `inherit`, `initial`, `unset`, `none`, `0` (Verbotsliste = alle anderen Werte) | AC-39 |
| `mt/max-file-size` (Plugin) | Dateigröße in Byte | AC-41 |

Overrides:

| Dateien | Wirkung |
|---|---|
| `src/styles/**/*.scss` | `color-no-hex`, `color-named`, `function-disallowed-list` und die Allowlist sind **aus** (Farbliterale und Direktwerte gehören dorthin; `declaration-no-important` und `reportDescriptionlessDisables` gelten weiter) |
| `src/styles/mt/**/*.scss` | `mt/max-file-size: 2048` (Partial höchstens 2 kB = 2048 Byte; `Buffer.byteLength` der Quelle) |

Befund-Beispiele (Tests in `stylelint-plugins/mt-stylelint.test.mjs`): `color: #ff0000` in einer Komponente -> Fehler; `color: var(--mt-color-text)` -> kein Befund; `!important` ohne Kommentar -> Fehler; Disable-Kommentar ohne `-- Grund` -> Fehler (descriptionless); Partial über 2048 Byte -> `Stylesheet ist <n> Byte groß, erlaubt sind höchstens 2048 Byte.`

Grenzen der Allowlist: Sie prüft nur die genannten Eigenschaften. `padding`, Höhen und Maße (`height`, `min-height`) prüft kein Werkzeug; Bausteinhöhen in Komponenten sind eine Review-Frage (Spec: "Höhen nur im Review"; Final-Review hat sie von Hand entfernt, Commit 6536bb04). Der Codemod `mt-migrate-styles.mjs` setzt für `::ng-deep`-Selektoren den Kommentar `stylelint-disable-next-line selector-pseudo-element-no-unknown -- ::ng-deep ist Angular-Syntax`; die Regel selbst ist in der Konfiguration nicht aktiviert, der Kommentar ist harmlos.

Stand `!important` in `src/**/*.scss` (Zählung am Commit b9dbc15d): 42 Vorkommen, alle mit `stylelint-disable-next-line declaration-no-important -- <Grund>` (Gründe: AG Grid setzt Theme-CSS/Inline-Styles nach den Komponenten, Vollbild-Karte, Autopilot-Overlay/z-index, Material-Padding bei Bild-/Berichtsdialogen).

## Bytes sparen: was nicht ins CSS gehört

Stand 2026-10-21, Anweisung im Chat. Gemessen wird die minifizierte `styles-*.css` des Production-Builds. Kommentare zählen nicht (der Build entfernt sie), gleiche Blöcke direkt hintereinander fasst der Minifier selbst zusammen. Die Regeln unten betreffen, was der Minifier **nicht** wegnimmt:

| Regel | Warum | Beispiel (entfernt) |
|---|---|---|
| Kein Override, dessen Wert ein festes Material-Literal wiederholt | Material liest `var(--mat-…, <Vorgabe>)` ohnehin mit diesem Wert | `outlined-outline-width: 1px`, `outlined-focus-outline-width: 2px`, `tabs divider-height: 1px`, `chips disabled-container-opacity: 1` |
| Keine Eigenschaft, die Material schon so setzt | doppelt, ohne Wirkung | Dialog: `height: 100%`, Flex-Spalte, `flex-shrink: 0` an Titel/Aktionen, `flex: 1 1 auto` am Inhalt, `margin: 0` an den Aktionen; Icon-Button: Breite/Höhe (aus `state-layer-size`), `background-color: transparent` |
| Keine Variable, die die eingesetzte Material-Version nicht liest | ungelesen | `checkbox selected-pressed-icon-color` |
| Keine Eigenschaft, die eine spätere Regel gleicher Specificity überschreibt oder die im Layout nichts bewirkt | tot | `align-self: center` unter `align-items: center`, `margin-left: auto` neben einem wachsenden Geschwister, Toggle-Höhe/-Breite in `_result-overrides.scss` (setzt die Komponente) |
| Kein Wert, den ein Partial für dasselbe Element schon setzt | doppelt | Disabled-Rand in `mt-readonly` (kommt aus `field-tokens`) |
| Gemeinsame Werte einmal ausgeben: eine Regel mit Selektorliste oder `@extend %platzhalter`, kein Mixin, das in mehreren Regeln landet | ein Mixin steht je `@include` vollständig im Bundle | Feld-Tokens (`mt-field`, `mt-grid-editor`) als eine Regel; Kartenfläche als `%surface` |
| Tokens, Mixins, Klassen und Selektor-Zweige erst mit Verbraucher | jedes Token ist eine `:root`-Variable, jeder Zweig ein Selektor | `space-1/3/4/5`, `color-grid-row-*`, `role-info-subtle`, Mixins `flex-row-center`/`flex-between`, `.skeleton-loader.pulse`, `_user-menu.scss` |
| Nur zur Build-Zeit gelesene Tokens in `$build-only` | sonst eine ungenutzte `:root`-Variable | siehe [tokens](tokens.md) |
| Custom Properties ohne Leerzeichen nach dem Doppelpunkt, Werte kurz (`#fff`, `0` statt `0px`) | der Minifier lässt Custom-Property-Werte unverändert | `_mt-tokens.scss` (`:root`), `_mt-skeleton.scss`, Generator `mt-theme-tokens.mjs` (`compactValue`) |

**Bewusst behalten:** Overrides mit `t.v(…)`, deren Wert zufällig dem `_brand`-Theme gleicht (Schriftgewicht 300/700, `#fff`). Sie halten die mt-Tokens als einzige Quelle (AC-35); ohne sie würde eine Token-Änderung dort nicht mehr wirken.

Prüfen: Build, dann `grep -o` auf die neue Deklaration in `dist/trumpf_frontend/browser/styles-*.css` und mit Materials Komponenten-CSS (`node_modules/@angular/material/fesm2022/*.mjs`, Fallback in `var(--mat-…, …)`) vergleichen.

## Build-Budgets (`angular.json`, `production.budgets`)

| Budget | Warnung | Fehler | Anmerkung |
|---|---|---|---|
| `initial` | 6 mb | 7 mb | Bestand |
| `anyComponentStyle` | **3 kb** | 6,5 kb | je Komponenten-Stylesheet; 1 kB = 1000 Byte, gemessen an der komprimierten CSS-Ausgabe (AC-42) |
| `bundle` `styles` | `+30 %` | `+50 %` | `baseline: "21015b"` (gemessen 2026-10-20, Beginn der Umsetzung), AC-49 |

Rechnung `styles`: Warnung ab 27 320 B (21015 * 1,3 = 27 319,5), Fehler ab 31 522 B (21015 * 1,5 = 31 522,5).

**Aktueller Stand und Luft** (Quelle: Ledger/Umsetzungsbericht, nicht neu gemessen):

| Messpunkt | Bundle | zur Basis | Luft bis Fehlergrenze |
|---|---|---|---|
| Task 21 (`db1bb0ba`) | 30 730 B | +46 % | 792 B |
| Task 23 (`13d3d8f5`), Budget eingeführt | 30 933 B | +47,2 % | 589 B |
| Task 24 Fix (`1a0f812f`) | 30 966 B | +47,4 % | 556 B |
| Gesamtlauf `6536bb04` | "30,97 kB" | +47 % | rund 550 B; der Abschlussbericht nennt weiter "589 B" (Wert von Task 23, nicht aktualisiert) |
| Tab-Untertitel (Arbeitsstand, ungecommittet, zusammen mit Label-Korrektur) | "31,11 kB" (Build-Meldung) | +48 % | rund 410 B |
| `mt-tag-grid` (Arbeitsstand, ungecommittet) | "31,15 kB" (Build-Meldung) | +48 % | rund 370 B |
| Action-Button (Arbeitsstand, ungecommittet, zusammen mit Benutzermenü der Parallel-Session) | "31,28 kB" (Build-Meldung) | +49 % | rund 240 B |
| Fokus-Schrift im aktiven Menüeintrag und Light-Zeile des Zuletzt-Eintrags | "31,38 kB" (Build-Meldung) | +49 % | rund 140 B |
| Verschlanktes Material-Theme (`_theme-used.scss`, `6d8c8ce9`) | "27,75 kB" (Build-Meldung) | +32 % | rund 3 770 B |
| Globale Partials verschlankt (`c0dfa999`) | 26 335 B | +25,3 % | 5 187 B |
| Weitere globale Partials (`91aeb4a7`) | 26 090 B | +24,1 % | 5 432 B |
| mt-Partials verschlankt (Arbeitsstand) | 24 310 B | +15,7 % | 7 212 B (Warnschwelle 3 010 B entfernt) |

Die Warnschwelle (+30 %) war zeitweise überschritten (Plan-Entscheidung "W · Bundle-Budget": Warnung hinnehmen, Budget nicht anheben); nach der Verschlankung der globalen und der mt-Partials (2026-10-21, 24,31 kB) hält der Build sie wieder ein. Regeln dazu: [Bytes sparen](#bytes-sparen-was-nicht-ins-css-gehört). Keine Warnung gibt es für Komponenten-Stylesheets. Jede Ergänzung eines globalen Partials (`src/styles/**`) kann den Production-Build auf **Fehler** kippen. Budget anheben nur nach Rücksprache mit dem Menschen. `scripts/mt-budgets.test.mjs` hält die Werte fest (`baseline '21015b'`, `maximumWarning '30%'`, `maximumError '50%'`, Komponenten-Warnung `3kb`).

Komponenten-Stylesheets über 3000 Byte teilt `mt-split-styles.mjs` auf (Dateien `<name>-<n>.component.scss`, z. B. `parameters-page-2.component.scss`).

## Codemods (einmalig)

Alle drei haben die Umstellung des Bestands erledigt; sie gehören nicht zum laufenden Betrieb. Aufruf jeweils aus `src/frontend` mit Dateipfaden (Skripte laufen über `import.meta.url == process.argv[1]`, sonst nur als Modul für die Tests).

| Skript | Zweck | Aufruf | Idempotenz |
|---|---|---|---|
| `scripts/mt-migrate-templates.mjs` (Task 13, acca17dc) | Template-AST (`@angular/compiler`): ergänzt mt-Direktiven an Material-Elementen nach `mt-directive-map.json`, stellt Buttons auf `matButton`/`matIconButton` mit genau einer Verfeinerung um (Umstellungsregel: Warnfarbe -> `mtButtonDanger`, flat/raised primär -> `mtButtonPrimary`, stroked -> `mtButtonSecondary`, basic -> `mtButtonText`, Icon-Button -> `mtButtonIcon` + Danger/Text), ergänzt `MT_DIRECTIVES`-Import in der Komponente. Ändert nur Attribute im Start-Tag. Hüllen-Templates (`MANUAL_TEMPLATES`: `atlas-button`, `atlas-icon-button`, `atlas-action-btn`, `atlas-panel`, `atlas-dialog-shell`, `atlas-form-*` u. a.) übersprungen, von Hand umgestellt | `node scripts/mt-migrate-templates.mjs <datei.html\|datei.ts> [...]` | **Ja, nachträglich hergestellt.** Der Plan-Code war nicht idempotent (ein zweiter Lauf hätte Wrapper-Hosts erneut umgestellt); der Umsetzer ergänzte den Guard `hasButtonRefinement` plus Test `migrateTemplate_SecondRunOnMigratedWrapperHosts_LeavesTemplateUnchanged`. Ist ein Template schon umgestellt, ergänzt der Lauf nur noch fehlende Importe (`planFileMigration`) |
| `scripts/mt-migrate-styles.mjs` (Task 19, cbb95934; Fix 8451a93d) | `var(--atlas-...)` -> `var(--mt-...)` (Tabelle `ATLAS_TO_MT`), Literale bei Farbe/Schrift/Radius -> mt-Token, Optik-Deklarationen an Material-/AG-Grid-Selektoren entfernen; seit Fix 8451a93d **bleiben** Optik-Deklarationen an Zustandsselektoren (`has-filters`, `ai-filled`, ...) mit Token und werden als WARNUNG gemeldet; unbekannte Atlas-Tokens bleiben stehen und warnen | `node scripts/mt-migrate-styles.mjs <datei.scss> [...]` | Idempotenz nicht durch einen Test belegt (nach dem Lauf stehen keine Atlas-Tokens mehr im Stylesheet, ein zweiter Lauf hat damit kaum etwas zu ändern). Ausgabe: `<datei>: <n> Bausteinangaben entfernt` plus `WARNUNG ...` |
| `scripts/mt-split-styles.mjs` (Task 19) | teilt Stylesheets über dem Komponenten-Budget an Regelgrenzen (Zielgröße 2850 B, Budget 3000 B; Sass komprimiert gemessen), stellt die Komponente auf `styleUrls` um; `@use`-Module mit eigener CSS-Ausgabe werden eigene styleUrl; Prelude (`@use`/`@forward`/`@mixin`/`$var`) steht in jedem Teil | `node scripts/mt-split-styles.mjs <datei.component.scss> [...]` | Ja: unter Budget -> `unverändert`; Teil-Dateien (`-<n>.component.scss`) werden übersprungen; fehlt der `styleUrl`-Eintrag, wirft es und lässt alle Dateien unverändert |

Hinweis: Das Task-19-Review fand zudem geteilte Stylesheets mit zerrissenen Kommentaren und einen ungenutzten `$measurement-block-gap` in `result.component.scss`; Codemod-Tests decken Kommentare an Teilgrenzen nicht ab (zurückgestellt, siehe [Korrekturen und offene Punkte](corrections-and-open-points.md)).

## Node-Tooling-Tests

Gesamt: 142 Tests grün (Gesamtlauf `6536bb04`, Tooling 142/142). Test-Stil: AAA, Namen `<Methode>_<Situation>_<Erwartung>` (Projekt-Konvention).

| Datei | Prüft |
|---|---|
| `eslint-rules/mt-directives.test.cjs` | `RuleTester` für `mt/require-directive`, `mt/button-refinement`, `mt/no-redundant-base` (valid/invalid, Hülle vs. Aufrufer) |
| `eslint-rules/mt-config.test.cjs` | `eslint.config.js` per `ESLint.lintText`: Grid-Theme-Parameter außerhalb/in Theme-Datei, Farbliteral in Komponente, `max-lines` bei Direktive > 100 Zeilen, `mt/require-directive` an rohem Material-Feld. Lücke: `button-refinement`/`no-redundant-base` über die Konfig, Spec-Template-Ausnahme, score-colors-Ausnahme und `runGate` sind nicht abgedeckt (Task 3, zurückgestellt) |
| `scripts/mt-lint-gate.test.mjs` | `isGateMessage`, `gateFindings` (nur Gate-Regeln, Datei und Zeile) |
| `stylelint-plugins/mt-stylelint.test.mjs` | Allowlist (Farbe, Radius/Schrift/Schatten, Token ok), `color-no-hex` außerhalb/innerhalb `src/styles`, `!important` ohne/mit Grund, descriptionless Disable, `mt/max-file-size`. Läuft nur mit `cwd = src/frontend` (relative `codeFilename`) |
| `scripts/mt-severity.test.mjs` | `MT_SEVERITY` in beiden Konfigurationen = `error` (AC-54) |
| `scripts/mt-budgets.test.mjs` | Budgets in `angular.json` (AC-42, AC-49) |
| `scripts/mt-tokens.test.mjs` | AC-35: kompiliert alle Partials mit geänderten Tokens (`color-primary`, `shadow-surface`, `color-border`, `radius-tag`, Rollenfarbe) und prüft, dass Primär-Button, Kartenfläche, Feldrand, Tag und Rolle den neuen Wert tragen; alle Partials lösen jeden `v()`-Aufruf auf. Schwäche: `ruleBody` schneidet am ersten `}` |
| `scripts/mt-ag-grid-version.test.mjs` | AG Grid 35.3.1 in `package.json`, Lockfile und `node_modules` (AC-55) |
| `scripts/mt-directive-imports.test.mjs` | jede Komponente, deren Template ein `mt…`-Attribut trägt, importiert `MT_DIRECTIVES` oder die Direktive einzeln (ohne Import ignoriert Angular das Attribut stillschweigend) |
| `scripts/mt-placements.test.mjs` | Textvorkommen der Platzierungen, die kein Codemod setzt (Kompakt-Bereiche, Tab-Beschriftung, Karten, Titel, Einheiten, Rollen, Aktion im Feld, Header-Versalien, Importe); prüft nur Textvorkommen, kein Rendering |
| `scripts/mt-messliste.test.mjs` | Messliste: jeder manuelle AC (`MANUAL_ACS`, 25 ACs) hat mindestens eine Zeile; jede Zeile hat 7 Spalten, **Ist und ok leer** |
| `scripts/mt-migrate-templates.test.mjs`, `mt-migrate-styles.test.mjs`, `mt-split-styles.test.mjs` | die drei Codemods (u. a. Umstellungsregel, Idempotenz, Zustandsklassen, Aufteilung) |

Die Browser-Tests (Playwright) stehen in [Zielwerte](targets.md).

## Befehle

Der Hook der Umgebung **blockiert `npm run`** (Ledger Task 19); der Umsetzer rief `lint:styles` und `check:tooling` deshalb direkt über `npx`/`node` mit denselben Argumenten auf. Projekt-Konvention laut `CLAUDE.md`: Build, Test und Lint über die `dv-angular-*`-Befehle bzw. den Skill `dv-angular:toolchain`; die Befehle werden nicht erfunden. Belegt (Plan, Global Constraints):

| Zweck | Befehl (cwd `src/frontend`, `<R>` = Repo-Wurzel) | Beleg |
|---|---|---|
| Unit-Tests | `dv-angular-test --root <R>/src/frontend` (gezielt: `-- --include <spec-pfad>`) | Plan, CLAUDE.md |
| Production-Build | `dv-angular-build --root <R>/src/frontend` (Warnungen inkl. Budget: `--show warnings`) | Plan |
| ESLint gesamt | `dv-angular-lint --root <R>/src/frontend` (Bestandsfehler `@typescript-eslint/no-this-alias` in `experiment-dashboard.service.spec.ts:166`) | Plan, Umsetzungsbericht |
| ESLint je Dateiliste | `npx eslint --max-warnings 0 <dateien>` (Bestandswarnungen können Exit 1 liefern, z. B. 2 A11y-Warnungen in `atlas-panel.component.html`; dann Lint-Gate nutzen) | Plan, Ledger Task 18 |
| mt-Lint-Gate | `node scripts/mt-lint-gate.mjs <dateien\|verzeichnisse>` | Plan |
| Stylelint | `npx stylelint --max-warnings 0 <dateien>`; gesamt entspricht `lint:styles` = `stylelint "src/**/*.scss"` | Plan, `package.json` |
| Node-Tooling-Tests | gesamt entspricht `check:tooling` = `node --test "scripts/*.test.mjs" "eslint-rules/*.test.cjs" "stylelint-plugins/*.test.mjs"`; einzeln `node --test <datei>` | Plan, `package.json` |
| Browser-Tests | Dev-Server zuerst selbst starten (`npm start` im Hintergrund, warten bis `http://localhost:4200` antwortet; der `webServer`-Block hat 60 s und reicht für einen kalten Build nicht), dann `npx playwright test <spec>`; Server danach beenden | Plan, Projekt-Memory `project_e2e_run_convention` |

Die CI-Pipelines führen **keine Tests** aus (Memory `project_ci_no_test_step`); der Gesamtlauf der Tooling-Tests gehört zur Abschlussprüfung.

### `package.json`-Skripte (`src/frontend/package.json`)

| Skript | Inhalt |
|---|---|
| `ng` | `ng` |
| `start` | `ng serve` |
| `build` | `ng build` |
| `watch` | `ng build --watch --configuration development` |
| `test` | `ng test` |
| `e2e` | `playwright test` |
| `e2e:ui` | `playwright test --ui` |
| `e2e:headed` | `playwright test --headed` |
| `e2e:ci` | `playwright test --reporter=junit,html` |
| `lint` | `ng lint` |
| `lint:styles` | `stylelint "src/**/*.scss"` |
| `check:tooling` | `node --test "scripts/*.test.mjs" "eslint-rules/*.test.cjs" "stylelint-plugins/*.test.mjs"` |

Dev-Abhängigkeiten dieser Werkzeuge: `stylelint` 17.16.0, `postcss-scss` 4.0.9 (exakt gepinnt), `angular-eslint` 21.4.0, `typescript-eslint` 8.59.2.

## Abweichungen ggü. Spec/Plan

- Codemod-Idempotenz: der Plan-Code war nicht idempotent; jetzt Guard `hasButtonRefinement` + Test (Task 13). Details in [Korrekturen und offene Punkte](corrections-and-open-points.md).
- Das Lint-Gate (`mt-lint-gate.mjs`) und die gemeinsame Zuordnung `mt-directive-map.json` stehen nicht in der Spec; sie kamen im Plan-Review R1 (Task 3) hinzu, damit Bestandsmeldungen nicht blockieren und Lint/Codemod nicht auseinanderlaufen.
- Die Stylelint-Allowlist (nur `var(--mt-…)`, `inherit`, `initial`, `unset`, `none`, `0`) setzt AC-39 als Positivliste um; die Spec formuliert es als Verbot von Literalen.

## Offene Punkte

- `mt-config.test.cjs` deckt Teile der Konfiguration nicht ab (Task 3, 🟡).
- `mt-stylelint.test.mjs` läuft nur mit `cwd = src/frontend` (Task 2, 🟡).
- `Regex ohne Treffer -> unklare Meldung` bei `mt-severity.test` (Task 27, 🟢).
- Bausteinhöhen und rohe px-Werte in Komponenten prüft kein Werkzeug (nur Review).
- Bundle-Budget `styles`: 24,31 kB, rund 3 kB unter der Warnschwelle (27 320 B), 7,2 kB unter der Fehlergrenze (siehe oben).
- `mat-button-toggle` hat weder Direktive noch Lint-Regel (Spec-Lücke).

## Ändern: Checkliste

1. Neue Direktive an einem Material-Element: `eslint-rules/mt-directive-map.json` ergänzen; bei `hostDirectives`-Verfeinerung `INCLUDES` in `mt-directives.cjs` ergänzen; Tests in `mt-directives.test.cjs` und `mt-migrate-templates.test.mjs` nachziehen.
2. Neue Partial-Datei: höchstens 2048 Byte, in `src/styles/mt/<gruppe>/_index.scss` einbinden, **Bundle-Budget `styles` beachten (rund 3 kB bis zur Warnung, 7,2 kB bis zum Fehler)** und die Regeln unter [Bytes sparen](#bytes-sparen-was-nicht-ins-css-gehört) einhalten; vor dem Einchecken Build mit `--show warnings`.
3. Neue Direktiven-TS-Datei: höchstens 100 Zeilen (`max-lines`), Selektor mit Präfix `mt`.
4. `MT_SEVERITY` nicht senken; `mt-severity.test.mjs` würde rot.
5. Budgets in `angular.json` nicht anheben (nur nach Rücksprache); `mt-budgets.test.mjs` nachziehen, falls doch.
6. `!important` nur mit `stylelint-disable-next-line declaration-no-important -- <Grund>`.
7. Codemods nicht erneut über den Bestand laufen lassen, ohne vorher das Verhalten zu prüfen (einmalig gedacht).
8. **Diese Referenzseite im selben Zug korrigieren** (Testanzahl 142, Budget-Stand, Regeltabellen).
