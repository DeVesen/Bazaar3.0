# Dialog (mtDialogHeader, mtDialogContent, mtDialogActions, mt-dialog)
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit b9dbc15d (2026-10-21)

> Dialoge bekommen ihre Fläche über die Overlay-Klasse `mt-dialog` (zentral gesetzt) und ihre einheitliche Kopf-, Inhalts- und Aktionsoptik über drei Direktiven; `app-atlas-dialog-shell` bündelt beides für neue Dialoge.

## Überblick
| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtDialogHeader]` | `mt-dialog-header` | Basis, eigenständig (kein `hostDirectives`) | `h2[mat-dialog-title]` | `util/directives/mt-dialog-header.directive.ts`, `styles/mt/overlays/_mt-dialog-header.scss` |
| `[mtDialogContent]` | `mt-dialog-content` | Basis, eigenständig | `mat-dialog-content` | `mt-dialog-content.directive.ts`, `_mt-dialog-content.scss` |
| `[mtDialogActions]` | `mt-dialog-actions` | Basis, eigenständig | `mat-dialog-actions` | `mt-dialog-actions.directive.ts`, `_mt-dialog-actions.scss` |
| keine Direktive | `mt-dialog` | Klasse ohne Direktive, am Overlay-Pane per `panelClass` | CDK-Overlay des Dialogs | `util/overlay/mt-overlay-defaults.ts`, `_mt-dialog.scss` |
| `app-atlas-dialog-shell` | – | Hülle | Dialoge mit Titel, Inhalt, Aktionen links/rechts | `src/app/components/common/atlas-dialog-shell/` |

Pfade: Direktiven `src/frontend/src/app/util/directives/`, Partials `src/frontend/src/styles/mt/`.

## Verwendung
Dialog ohne Hülle (Direktiven an den vorhandenen Elementen, Struktur unverändert), aus `util/confirm-dialog/confirm-dialog.component.html`:
```html
<h2 mtDialogHeader mat-dialog-title>{{ data.title }}</h2>
<mat-dialog-content mtDialogContent>{{ data.message }}</mat-dialog-content>
<mat-dialog-actions mtDialogActions align="end">
```
Dialog mit Hülle (`atlas-dialog-shell.component.spec.ts`):
```html
<app-atlas-dialog-shell title="..." titleId="...">
  <span atlas-dialog-header>…</span>
  <div atlas-dialog-content>…</div>
  <button atlas-dialog-actions-left>…</button>
  <button atlas-dialog-actions-right>…</button>
</app-atlas-dialog-shell>
```
Öffnen mit eigener Panel-Klasse: `mt-dialog` selbst ergänzen (siehe Aufbau). Beispiel `features/experiment-wizard/atlas-wizard-dialogs.ts`:
```ts
panelClass: [MT_DIALOG_PANEL_CLASS, 'atlas-dialog-panel'],
```
Ohne eigene `panelClass` genügt `MatDialog.open(...)`; die Voreinstellung setzt `mt-dialog`.
Lint: `mat-dialog-content`, `mat-dialog-actions` ohne Direktive und Attribut `mat-dialog-title` ohne `mtDialogHeader` meldet ESLint (`eslint-rules/mt-directive-map.json`, [enforcement](enforcement.md)). Es gibt keine Lint-Regel, die `panelClass` ohne `MT_DIALOG_PANEL_CLASS` erkennt; die Regel ist Konvention (siehe Offene Punkte).

## Zielwerte
| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Dialogfläche | #FFFFFF, rahmenlos, Radius 0, Schatten `0 5px 25px 0 rgba(19,19,19,0.1)` | immer | AC-31 (Kartenfläche aus AC-01), `.mt-dialog .mat-mdc-dialog-surface` mit Platzhalter `%surface` (`@extend`), [surface-and-card](surface-and-card.md) |
| Container-Form | Radius 0 | immer | `%surface` an `.mt-dialog .mat-mdc-dialog-surface` (Materials `container-shape` liest nur diese Fläche, daher kein Token) |
| Inhaltsschrift | 16 px, Light, Farbe `color-text` | immer | `_mt-dialog.scss` (`supporting-text-*`) |
| Titelzeile | Schrift 20 px Light, Zeilenhöhe 1,3, Innenabstand `1.25rem 1.5rem 1rem`, Rand unten 1 px `color-line` (#E2E2E2), `margin: 0` | immer | AC-32, `_mt-dialog-header.scss` |
| Inhalt | Innenabstand `1.25rem 1.5rem` | immer | AC-32, `_mt-dialog-content.scss` |
| Aktionsleiste | Abstand `0.75rem`, Innenabstand `1rem 1.5rem 1.25rem`, Rand oben 1 px `color-line`; `margin: 0` kommt von Material, nicht setzen | immer | AC-32, `_mt-dialog-actions.scss` |
| Hülle: Innenabstand | die Hülle setzt `padding: 0` am `mat-dialog-content` (`.atlas-dialog-shell-content`); Soll der Messliste: Innenabstand der Dialogfläche 0, `mt-dialog-content` nicht überschrieben | immer | `atlas-dialog-shell.component.scss`, Messliste AC-32 (ungemessen) |
| Klassen am Overlay | `mt-dialog` | jeder Dialog | AC-50 |
| Klassen an Titel/Inhalt/Aktionen der 11 Dialoge ohne Hülle | `mt-dialog-header`, `-content`, `-actions` | jeder dieser Dialoge | AC-62 |

## Aufbau (intern)
```ts
// src/app/util/overlay/mt-overlay-defaults.ts
export const MT_DIALOG_PANEL_CLASS = 'mt-dialog';
export const MT_OVERLAY_PROVIDERS: Provider[] = [
  { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { ...new MatDialogConfig(), panelClass: MT_DIALOG_PANEL_CLASS } },
  ...
];
```
- Eingebunden in `app/app.config.ts` (`...MT_OVERLAY_PROVIDERS`).
- Warum die Regel „Aufrufe mit eigener Panel-Klasse ergänzen `mt-dialog`": Material führt eine `panelClass` im Aufruf nicht mit der `panelClass` der `MAT_DIALOG_DEFAULT_OPTIONS` zusammen, es gewinnt die aufrufende Konfiguration. Wer `panelClass` setzt, muss `MT_DIALOG_PANEL_CLASS` selbst aufnehmen. Alle bestehenden Aufrufe tun das (z. B. `main-layout.component.ts`, `parameters-page.component.ts`, `unit-header.component.ts` mit `panelClass: MT_DIALOG_PANEL_CLASS`).
- `_mt-dialog.scss`: `mat.dialog-overrides` (Inhaltsschrift) plus `.mat-mdc-dialog-surface { @extend %surface }`. Die drei Teil-Partials nutzen die Selektoren `.mt-dialog-header.mat-mdc-dialog-title` usw. (0,2,0); `.mt-dialog-header::before` wird ausgeblendet.
- Material lädt seine Dialog-Styles zur Laufzeit nach `styles.css` und gewinnt jeden Gleichstand (gemessen 2026-10-30, #314472). Gegen `.mat-mdc-dialog-container .mat-mdc-dialog-title|content` (0,2,0) wirken deshalb nur Tokens: Titelschrift und -farbe über `subhead-*` am Titel, Inhaltsabstand über `content-padding` und `with-actions-content-padding` am Inhalt. Komponenten-Overrides des Inhalts-Padding (Hülle, Sales-Report, Add-Material, Bookmark) greifen damit weiter. Nur `padding-top` direkt unter dem Titel braucht eine eigene Regel (0,4,0) gegen Materials `.mat-mdc-dialog-title + .mat-mdc-dialog-content` (0,3,0). Abstände und Rand von Titel und Aktionsleiste schlagen Materials (0,1,0) direkt.
- Tokens: `--mt-color-surface`, `-radius-none`, `-shadow-surface`, `-color-text`, `-color-line`, `-font-family`, `-font-size-base|xl`, `-font-weight-light` ([tokens](tokens.md)).
- Globale Partials `src/styles/_dialogs.scss` (nur Geometrie, keine Optik): `.cdk-overlay-pane.atlas-dialog-panel` (`max-height: 100vh`; an der Fläche `min-height: 0`, `overflow: hidden`; Höhe 100 %, Flex-Spalte und `flex-shrink: 0` an Titel/Aktionen setzt Material selbst, nicht wiederholen), `…experiment-parameters-report-dialog-panel` (`max-height: 90vh`), drei Bild-/Berichts-Panel-Klassen (`search-result-images-…`, `search-result-image-preview-…`, `experiment-report-preview-…`, ein Selektor per `:is()`) mit `min-height: 0`, `max-height: none`, `overflow: hidden` und `padding: 0 !important` am `.mat-mdc-dialog-content` (Begründung im Stylelint-Kommentar: Bild- bzw. Berichtsfläche füllt den Inhalt, übersteuert das Material-Padding). Kein z-index am Dialog-Panel: Die Pane liegt im CDK-Overlay-Container (eigener Stapelkontext), ein z-index dort wirkt nicht gegen Elemente außerhalb; das Autopilot-Overlay blendet `unit-header` während des Validierungsdialogs selbst aus. Optik der Aktionsleiste kommt aus `mt-dialog-actions`.
- Wizard-Konstanten `src/app/features/experiment-wizard/atlas-wizard-dialogs.ts`: `atlasWizardConfirmDialogConfig` mit `width: '420px'`, `height: '240px'`, `maxWidth: '95vw'`, `maxHeight: '90vh'`, `panelClass: [MT_DIALOG_PANEL_CLASS, 'atlas-dialog-panel']`.

## Hüllen-Komponenten
`AtlasDialogShellComponent` (`app-atlas-dialog-shell`, OnPush, importiert `MT_DIRECTIVES` und `MatDialogModule`).
| Eingabe | Standard | Wirkung |
|---|---|---|
| `title` | `''` | Titel als `h2[mat-dialog-title][mtDialogHeader]`; leer: kein Titel, `aria-labelledby` entfällt |
| `titleId` | `'atlas-dialog-title'` | `id` des Titels, `aria-labelledby` des Inhalts |
Slots: `[atlas-dialog-header]`, `[atlas-dialog-content]`, `[atlas-dialog-actions-left]`, `[atlas-dialog-actions-right]`. Die Hülle setzt `mtDialogHeader`, `mtDialogContent`, `mtDialogActions`; ihr Stylesheet ordnet nur an (Flex, `gap: 12px`, Titel mit Ellipsis, Inhalt scrollt in `.dialog-content-area`, Padding 0 am Inhalt).

Die 11 Dialoge ohne Hülle (Direktiven an den vorhandenen Elementen, Struktur unverändert): `hidden-parameters-dialog`, `parameters-unsaved-changes-dialog`, `add-material-filter-dialog`, `search-bookmark-save-dialog`, `sales-report-dialog`, `search-result-images-dialog`, `confirm-delete-param`, `confirm-dialog`, `input-dialog`, `save-view-dialog`, `validation-dialog`.

## Tests
- Unit: `mt-dialog-header|-content|-actions.directive.spec.ts`, `util/overlay/mt-overlay-defaults.spec.ts` (Dialog ohne `panelClass` trägt `mt-dialog`, Material-Voreinstellungen bleiben), `atlas-dialog-shell.component.spec.ts` (`template_DialogParts_CarryMtDialogClasses`).
- Browser: kein Dialog-Test in `e2e/tests/mt-*.spec.ts`.
- Handliste (`e2e/mt-messliste.md`): AC-31 (Dialog „Save view“), AC-32 (zwei Dialoge: „Save view“ und „Unsaved changes“), AC-32 Dialog-Hülle gegen Dialog-Inhalt (Innenabstand `mat-mdc-dialog-surface` 0, `mt-dialog-content` nicht überschrieben).
- Lint: ESLint-Zuordnung (siehe Verwendung); Stylelint verlangt Begründungskommentar zu `!important` in `src/styles/**`.

## Abweichungen ggü. Spec/Plan
Keine festgestellt.

## Offene Punkte
- Task 10: der Kommentar am Kopf von `src/styles/_dialogs.scss` nennt `MT_DIALOG_PANEL_CLASS` nicht (er verweist nur auf `atlas-dialog-panel`); Lint dafür kam erst mit Task 27, keine Regel prüft, dass `panelClass` `mt-dialog` enthält.
- Task 10: `atlas-wizard-dialogs.ts` hat den Import vor dem Datei-Kommentar (kosmetisch).
- Task 18: Optik-Gleichheit Hülle gegen Dialoge ohne Hülle (`padding: 0` der Hülle ohne `!important` gegen `mt-dialog-content`) ist nur im Browser prüfbar; Messzeile in der Messliste, Messwerte stehen aus.
- Task 24: Soll-Wert Dialog-Hülle-`padding` und Titel/Aktionen-Gleichheit sind ungemessen.
- `_dialogs.scss`: die `!important`-Stellen sind begründet, aber Browserwirkung ohne `!important` nicht geprüft.

## Ändern: Checkliste
1. Optik der Dialoge nur in `_mt-dialog*.scss` und Tokens ändern, nie je Dialog; `_dialogs.scss` bleibt Geometrie (Höhen, Überlauf) und enthält nur, was von Materials Dialog-Vorgabe abweicht.
2. Neuer Dialog: `panelClass` weglassen oder `MT_DIALOG_PANEL_CLASS` aufnehmen; Titel/Inhalt/Aktionen mit den Direktiven versehen oder `app-atlas-dialog-shell` nehmen; ESLint meldet fehlende Direktiven.
3. Neues `!important` nur mit Stylelint-Begründungskommentar; Budget (`angular.json`) nicht anheben.
4. Messliste und Specs (`mt-overlay-defaults.spec.ts`, Hüllen-Spec) mitziehen.
5. **Diese Referenzseite im selben Zug korrigieren.**
