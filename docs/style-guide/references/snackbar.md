# Snackbar (mt-snackbar, mt-role-*)
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> Jede Snackbar ist weiß mit Kartenschatten und einem 1-px-Rand in der Farbe ihrer Rolle (Erfolg, Fehler, …); die Klassen kommen zentral aus den Overlay-Voreinstellungen und dem `SnackbarService`, nicht aus einer Direktive.

## Überblick
| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| keine Direktive | `mt-snackbar` (`MT_SNACKBAR_PANEL_CLASS`) | Klasse ohne Direktive | Overlay-Panel jeder Snackbar | `util/overlay/mt-overlay-defaults.ts`, `styles/mt/overlays/_mt-snackbar.scss` |
| keine Direktive | `mt-role-info\|success\|warning\|error\|neutral` (`mtRoleClass(role)`) | Querschnitt (Rollenfarbe als `--mt-role-color`) | Overlay-Panel, zusätzlich zu `mt-snackbar` | `util/directives/mt-role.directive.ts`, `styles/mt/foundation/_mt-role.scss` |
| `SnackbarService` | – | Dienst | `providedIn: 'root'` | `src/app/services/snackbar/snackbar.service.ts` |

Pfade relativ zu `src/frontend/src`. Rollen und Farben allgemein: [tag-and-role](tag-and-role.md).

## Verwendung
Normalfall: über den Dienst.
```ts
// src/app/services/snackbar/snackbar.service.ts
showMessage(message: string, type: 'success' | 'error' = 'success', duration = 3000, extraPanelClass?: string): void
```
```ts
// Beispiel: src/app/shared/upload/upload-rejection-notifier.service.ts
this.snackbar.showMessage(this.lines.join('\n'), 'error', UPLOAD_REJECTION_MESSAGE_DURATION_MS, UPLOAD_REJECTION_PANEL_CLASS);
```
Direktaufruf von `MatSnackBar` mit eigener `panelClass`: die Klassen mit dem Helfer bilden, nicht von Hand schreiben.
```ts
// util/overlay/mt-overlay-defaults.ts
mtSnackbarPanelClasses(role: MtRole, ...extraClasses: string[]): string[]  // ['mt-snackbar', 'mt-role-<role>', ...extra]
```
Ohne eigene `panelClass` greift die Voreinstellung (`mt-snackbar` + `mt-role-neutral`). Material führt eine eigene `panelClass` nicht mit der Voreinstellung zusammen, deshalb muss ein Aufruf mit `panelClass` `mt-snackbar` und die Rolle selbst liefern (AC-50).
Der Dienst kennt nur `success` und `error`; weitere Rollen (`info`, `warning`, `neutral`) nur über `mtSnackbarPanelClasses` im Direktaufruf.

## Zielwerte
| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Fläche | #FFFFFF, Radius 0, Schatten `0 5px 25px 0 rgba(19,19,19,0.1)` | erscheint | AC-30 (Kartenfläche aus AC-01), `.mt-snackbar .mat-mdc-snackbar-surface` mit Platzhalter `%surface` (`@extend`), [surface-and-card](surface-and-card.md) |
| Rand | 1 px, Farbe `var(--mt-role-color, role-neutral)` | erscheint | AC-30, `_mt-snackbar.scss` |
| Rollenfarben | info #285172, success #BBD03A, warning #FF9032, error #FF0201, neutral #A1A1A1 | je Rolle | Tokens `role-*` in `_mt-tokens.scss` |
| Schrift | 13 px, Light, Farbe `color-text` | erscheint | `_mt-snackbar.scss` (`supporting-text-*`) |
| Aktionsbutton | Farbe `color-ink` | erscheint | `button-color` |
| Klassen am Overlay | `mt-snackbar` und `mt-role-<rolle>`, ohne Rolle `mt-role-neutral` | jede Snackbar | AC-50 |

## Aufbau (intern)
```ts
// src/app/util/overlay/mt-overlay-defaults.ts
{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { ...new MatSnackBarConfig(), panelClass: mtSnackbarPanelClasses('neutral') } },
```
- Eingebunden über `MT_OVERLAY_PROVIDERS` in `app/app.config.ts`.
- `_mt-snackbar.scss`: `mat.snack-bar-overrides` (Farbe, Form, Text, Button) und `.mat-mdc-snackbar-surface { @extend %surface; border: 1px solid var(--mt-role-color, …) }`. Die Rollenklasse setzt nur `--mt-role-color`; da `mt-role` (ohne Suffix) nicht am Panel steht, färbt sie die Schrift nicht.
- Tokens: `--mt-color-surface|text|ink`, `-radius-none`, `-shadow-surface`, `-role-*`, `-font-size-sm`, `-font-weight-light` ([tokens](tokens.md)). Modell: [directive-model](directive-model.md).
- `src/styles/_snackbar.scss` (Bestand, nur Geometrie): `.upload-rejection-snackbar .mat-mdc-snack-bar-label { white-space: pre-line }`, damit der Upload-Dienst eine Zeile je abgelehnter Datei zeigt.

### Snackbar-Aufrufer im Bestand
| Stelle | Art | Klassen |
|---|---|---|
| `SnackbarService.showMessage` | Dienst | `mtSnackbarPanelClasses(type, extra)` |
| `upload-rejection-notifier.service.ts` | über Dienst | Rolle error + `upload-rejection-snackbar` |
| `experiment-wizard-shell.component.ts` `showMessage` | direkt `MatSnackBar.open` | `mtSnackbarPanelClasses(type)` (Zeile ~695) |
| ebd., drei weitere `snackBar.open(...)` (Löschen des Experiments) | direkt, ohne `panelClass` | Voreinstellung (`mt-snackbar`, neutral) |

## Tests
- Unit: `util/overlay/mt-overlay-defaults.spec.ts` (`snackbarDefaults_OpenWithoutPanelClass_AddsMtSnackbarAndNeutralRole`, `mtSnackbarPanelClasses_RoleAndExtraClass_ReturnsSnackbarRoleAndExtra`), `services/snackbar/snackbar.service.spec.ts` (Klassenliste mit und ohne Extra-Klasse).
- Browser: kein Snackbar-Test in `e2e/tests/mt-*.spec.ts`.
- Handliste: `e2e/mt-messliste.md` AC-30 (Aktion mit Erfolgsmeldung: Fläche / Rand / Schatten).
- Lint: keine Regel prüft `panelClass` bei Snackbars.

## Abweichungen ggü. Spec/Plan
Keine festgestellt.

## Offene Punkte
- Folgeaufgabe, bewusst nicht Teil der Arbeit: die Direktaufrufe im Wizard-Shell (`experiment-wizard-shell.component.ts`: `showMessage` und drei `snackBar.open`) auf den `SnackbarService` umstellen.
- Der Dienst unterstützt nur `success` und `error` als Rolle.
- Browser-Wirkung von Rand und Schatten nur über die Messliste.

## Ändern: Checkliste
1. Rand/Fläche ändern: `_mt-snackbar.scss` bzw. `@mixin surface`; Rollenfarben als Token in `_mt-tokens.scss`.
2. Neue Snackbar-Aufrufe über `SnackbarService` oder `mtSnackbarPanelClasses`; nie `panelClass`-Literale `'mt-snackbar'`/`'mt-role-…'`.
3. Neue Rolle für den Dienst: `type` von `showMessage` erweitern, Spec ergänzen.
4. Kein `!important` ohne Kommentar; Budget nicht anheben; Messliste mitziehen.
5. **Diese Referenzseite im selben Zug korrigieren.**
