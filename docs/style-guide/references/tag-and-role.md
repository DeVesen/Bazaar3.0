# Tag und Rolle
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 51a253e3 plus verschlanktes Theme (ungecommittet) (2026-10-21)

> `mtRole` gibt einem Element die Farbe einer Rolle (info, success, warning, error, neutral); `mtTag` ist der gefüllte Status-Tag in dieser Farbe.

## Überblick

| Direktive/Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtRole]` (Eingabe `mtRole`, Pflicht) | `mt-role`, `mt-role-<rolle>` | Querschnitt | Text, Icon, Hint; auch von `mtTag` und Snackbar genutzt | `src/app/util/directives/mt-role.directive.ts`, `src/styles/mt/foundation/_mt-role.scss` |
| `[mtTag]` (Wert = Rolle) | `mt-tag` (plus Rollenklassen) | Verfeinerung (Host-Direktive `mtRole`) | `span` mit Status-Text | `mt-tag.directive.ts`, `_mt-tag.scss` |
| (nur Klasse) | `mt-tag-grid` | Variante von `mt-tag`, keine Direktive | `span` in AG-Grid-Zellen, zusätzlich zu `mt-tag` | `_mt-tag.scss` |
| `mtRoleClass(role)` | `mt-role-<rolle>` | Helfer (TS) | HTML-Renderer, Overlays | `mt-role.directive.ts` |
| Rollenwert | Typ `MtRole` | `'info' \| 'success' \| 'warning' \| 'error' \| 'neutral'` | | `mt-role.directive.ts` |

Das Attribut `role` bleibt ARIA vorbehalten, deshalb heißt die Eingabe `mtRole`. `mtTag` reicht seinen Wert durch:

```ts
// mt-tag.directive.ts
host: { class: 'mt-tag' },
hostDirectives: [{ directive: MtRoleDirective, inputs: ['mtRole: mtTag'] }],
```

`mtRoleClass` ist die einzige Stelle, die `mt-role-<rolle>` bildet (Direktive, Overlays, HTML-Renderer): `return \`mt-role-${role}\``.

## Verwendung

```html
<!-- experiment-dashboard-status-cell.component.html -->
<span [mtTag]="experimentStatusRole">{{ experimentStatusText }}</span>

<!-- system-logs.component.html -->
<span [mtTag]="levelRole(row.level)">{{ row.level }}</span>

<!-- result.component.html: nur Schriftfarbe -->
<p class="analysis-message analysis-message--error" mtRole="error">...</p>
<mat-icon class="analysis-icon--success" mtRole="success">check_circle</mat-icon>
```

Weitere `mtRole`-Stellen: `result.component.html` (4), `setup-page.component.html` (2, `mat-hint mtHint mtRole="error"`). Ein Tag in AG-Grid-Zellen ohne Angular-Template (HTML-String im Cell-Renderer) setzt die Klassen von Hand:

```ts
// parameter-table.service.ts
<span class="mt-tag mt-tag-grid mt-role ${mtRoleClass(role)}" ...>${status}</span>
```

Regeln:
- Rolle nie als eigene Farbe in der Komponente; immer `MtRole` über eine zentrale Zuordnung (unten).
- Kein `mtRole` zusätzlich an einen `mtTag` setzen: `mtTag` bringt `mtRole` schon mit.
- Rollenwerte außerhalb der fünf sind ein Typfehler.
- Komponenten-SCSS darf die Rollenfarbe nicht überschreiben (AC-66, Handmessung in der Messliste).

## Zielwerte

Palette (Tokens in `styles/_mt-tokens.scss`):

| Rolle | Farbe | Token | Subtle-Variante (nur Tokens) |
|---|---|---|---|
| info | `#285172` | `role-info` | `#dfe5ea` |
| success | `#bbd03a` | `role-success` | `#f1f6d8` |
| warning | `#ff9032` | `role-warning` | `#ffe9d6` |
| error | `#ff0201` | `role-error` | `#ffe1e1` |
| neutral | `#a1a1a1` | `role-neutral` | |

Status-Tag (`.mt-tag`, AC-28):

| Eigenschaft | Wert | Quelle |
|---|---|---|
| Höhe | 30 px (`1.875rem`) | `_mt-tag.scss` |
| Innenabstand | 7 px / 15 px (`0.4375rem 0.9375rem`) | `_mt-tag.scss` |
| Radius | 2 px (`radius-tag`, `0.125rem`) | Token |
| Schrift | 13 px (`font-size-sm`), 700, Versalien, weiß (`color-on-accent`) | Token |
| Zeichenabstand | 0,03 em (`letter-spacing-tag`) | Token |
| Hintergrund | `var(--mt-role-color, role-neutral)` | `_mt-role.scss` |
| Sonstiges | `inline-flex`, `align-items:center`, `box-sizing:border-box`, `line-height:1`, `white-space:nowrap` | |
| Rollentext ohne Tag | Schriftfarbe = Rollenfarbe, keine Fläche, kein Rahmen (AC-66) | `.mt-role:not(.mt-tag)` |

Variante im Grid (`.mt-tag-grid`, nur Parameter-Tabelle, Spalte Ergebnis-Status): Innenabstand 7 px / 4 px (`0.4375rem 0.25rem`), alles andere wie `.mt-tag`. Der Basis-Tag bleibt bei 7/15 px.

Maße in rem skalieren mit der Basisschrift. In Grid-Zellen: `max-height:100%; vertical-align:middle` ([grid](grid.md)).

## Aufbau (intern)
`_mt-role.scss` setzt je Rollenklasse nur die Variable und färbt Text ohne Tag:

```scss
.mt-role-info { --mt-role-color: #{t.v(role-info)}; }
...
.mt-role:not(.mt-tag) { color: var(--mt-role-color); }
```

`mt-tag` füllt die Fläche aus `--mt-role-color`; auch die Snackbar liest sie (`border: 1px solid var(--mt-role-color, ...)`, [snackbar](snackbar.md)). Die Direktive `mtRole` setzt die Klassen über `host: { '[class]': 'roleClasses()' }`, berechnet aus `mt-role mt-role-<rolle>`.

### Zuordnungen (einzige Quellen)

| Anzeige | Datei und Symbol | Zuordnung |
|---|---|---|
| Dashboard Experiment-Status | `features/experiment-dashboard/rules/experiment-dashboard-tree.rules.ts`, `getStatusRole(status)` | active -> info; finished, completed -> success; on hold, paused -> warning; cancelled -> error; sonst neutral (Vergleich in Kleinschreibung); Status leer: Text "N/A", neutral |
| Log-Level | `components/system-logs/log-level-role.ts`, `logLevelRole(level)` | trace -> neutral; debug -> info; information -> success; warning -> warning; error, critical -> error; sonst neutral (Groß-/Kleinschreibung egal) |
| Parameter-Ergebnis-Status | `shared/result-status/parameter-set-result-status.ts`, `RESULT_STATUS_ROLES`, `resultStatusRole(status)` | Created -> success; In Progress -> warning; N/A -> error; unbekannt -> neutral |
| Dashboard-Ergebnis-Badge | `experiment-dashboard-tree.rules.ts`, `PARAMETER_RESULT_BADGES`, `getParameterResultBadge` | "Result N/A" (error), "Result In Progress" (warning), "Result created" (success), Rollen aus `RESULT_STATUS_ROLES` |
| Parameter-Tabelle Status | `parameter-table.service.ts`, Spalte `resultStatus` | Tag mit `resultStatusRole(status)` |
| Snackbar | `util/overlay/mt-overlay-defaults.ts`, `mtSnackbarPanelClasses(role, ...)` | Klasse `mt-snackbar` plus `mt-role-<rolle>`; ohne Rolle neutral |

Bedeutung der Farben (AC-29, unverändert zu vorher: grün/gelb/rot/blau werden zu success/warning/error/info): Info = Standardzustand "aktiv/Debug" in Markenblau, Erfolg = fertig/erfolgreich, Warnung = in Arbeit/angehalten, Fehler = fehlt/abgebrochen/Fehler, neutral = unbekannt oder deaktiviert.

### Neue Rolle oder Zuordnung ergänzen
- Neuer Status in bestehender Anzeige: nur die Zuordnung der Tabelle oben ergänzen (Switch/Record), keine Farbe.
- Neue Rolle: `MtRole`-Union in `mt-role.directive.ts`, Token `role-<name>` (und Subtle) in `_mt-tokens.scss`, Klasse in `_mt-role.scss`; Spec ergänzen; ggf. Snackbar-Test. Die Palette hat bewusst fünf Rollen (Spec).
- Neue Anzeige mit Status: `[mtTag]="role"` mit zentraler Zuordnungsfunktion, nie `[ngClass]` mit Farben.

## Hüllen-Komponenten
`app-experiment-dashboard-status-cell` (Cell-Renderer, `agInit`, setzt Rolle und Text je Zeilentyp `experiment` bzw. `parameter`) und `system-logs.component` nutzen `mtTag`. Keine eigenen Hüllen für `mtRole`.

## Tests
- Unit: `mt-role.directive.spec.ts` (Rollenklassen für `error`; `mtRoleClass` für `warning`), `mt-tag.directive.spec.ts` (Klasse `mt-tag`; Rolle wird durchgereicht), `log-level-role.spec.ts`.
- Browser: `e2e/tests/mt-targets.spec.ts`, Test "Grid Parameter: Status-Tag mit 7/4 px Innenabstand, Status vollständig in der Zelle" und Test "Status-Tag Dashboard: 30 px, Radius 2 px, 7/15 px, fette Versalien 13 px, weiß auf Rollenfarbe".
- Handliste: `e2e/mt-messliste.md`, Zeile AC-66 (Erfolgs-Icon gegen Komponenten-Stylesheet, `mat-icon.analysis-icon--success`, Soll `#BBD03A`).
- Skript: `scripts/mt-placements.test.mjs` belegt die `mtRole`-Stellen in `result.component.html`. Stylelint/ESLint: Farbliterale außerhalb `src/styles/` bzw. TS-Ausnahmen (siehe [enforcement](enforcement.md)).

## Abweichungen ggü. Spec/Plan
- Zusatzklasse `mt-tag-grid` für Tags in Grid-Zellen (Innenabstand 7 px / 4 px statt 7 px / 15 px). Spec AC-28 nennt nur 7/15 px. Auftraggeber-Wunsch, damit "In Progress" in der schmalen Status-Spalte passt; Basis-Tag unverändert. Klasse ohne Direktive, weil der Cell-Renderer ein HTML-String ist.

Sonst keine bekannten. Hinweis: Der Plan nannte `PARAMETER_RESULT_BADGES` als Task-15-Artefakt; im Code ist es nicht exportiert (modulintern in `experiment-dashboard-tree.rules.ts`), Zugriff über `getParameterResultBadge`.

## Offene Punkte
- Task 14/24: Vorrang von `.mt-role:not(.mt-tag)` gegenüber Komponenten-CSS nur im Browser prüfbar; Task 25 nahm AC-66 als Handmessung auf, nicht im Browser gemessen.
- Komponenten setzen weiter `var(--mt-role-*)` direkt (z. B. `request-access`, `material-input`, `dynamic-input-panel`, `action-cell-renderer`, `unit-header` mit Subtle-Farben): Palette stimmt, aber ohne `mtRole`.
- Task 22 🟢: Klassen-Literal `mt-tag mt-role` im Cell-Renderer neben `mtRoleClass`.
- Task 5 🟢: `mt-role.directive.spec` prüft nur den Wert `error`.
- Task 14 (außerhalb Scope): `unit-header` mit `height: 32px !important`.

## Ändern: Checkliste
1. Farbwerte nur in `src/styles/_mt-tokens.scss` (`role-*`), nie in Komponenten.
2. Tag-Maße (auch `.mt-tag-grid`) in `_mt-tag.scss` über Tokens; AC-28-Test (`mt-targets.spec.ts`) mitziehen.
3. Zuordnung nur in den Quellen der Tabelle ändern; Spec `log-level-role.spec.ts` und weitere Rules-Specs anpassen.
4. `mtRoleClass` als einzigen Klassenbildner behalten.
5. Budget (`angular.json`) nicht anheben (Bundle 24,31 kB, 7,2 kB Luft; [Bytes sparen](enforcement.md#bytes-sparen-was-nicht-ins-css-gehört)).
6. Diese Referenzseite im selben Zug korrigieren.

Verwandt: [tokens](tokens.md), [directive-model](directive-model.md), [field](field.md), [button](button.md), [surface-and-card](surface-and-card.md), [grid](grid.md).
