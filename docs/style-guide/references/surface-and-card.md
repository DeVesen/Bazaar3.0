# Kartenfläche und Karte (mtSurface, mtCard)
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> `mtSurface` ist die Kartenfläche (weiß, rahmenlos, eckig, weicher Schatten); `mtCard` setzt sie an `mat-card` oder einem Seiten-Container ein, die vier Karten-Teile gliedern Kopf, Titel, Inhalt und Aktionen.

## Überblick
| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtSurface]` | `mt-surface` | Querschnitt (Basis der Fläche) | jedes Element, das eine Kartenfläche braucht | `util/directives/mt-surface.directive.ts`, `styles/mt/foundation/_mt-surface.scss` |
| `[mtCard]` | `mt-card` | Basis (schließt `mtSurface` per `hostDirectives` ein) | `mat-card` oder `div` einer Seite | `mt-card.directive.ts`, `_mt-card.scss` |
| `[mtCardHeader]` | `mt-card-header` | Verfeinerung (Klassen-Anker, kein eigenes Partial) | `mat-card-header` | `mt-card-header.directive.ts` |
| `[mtCardTitle]` | `mt-card-title` | Verfeinerung | `mat-card-title` | `mt-card-title.directive.ts`, `_mt-card-title.scss` |
| `[mtCardContent]` | `mt-card-content` | Verfeinerung | `mat-card-content` | `mt-card-content.directive.ts`, `_mt-card-content.scss` |
| `[mtCardActions]` | `mt-card-actions` | Verfeinerung | `mat-card-actions` | `mt-card-actions.directive.ts`, `_mt-card-actions.scss` |

Direktiven liegen unter `src/frontend/src/app/util/directives/`, Partials unter `src/frontend/src/styles/mt/`. Die Fläche wird nicht nur von `mt-card` genutzt: der Platzhalter `%surface` aus `_mt-surface.scss` wird von `mt-select`, `mt-dialog`, `mt-menu` und `mt-snackbar` per `@extend` geerbt (eine gemeinsame Regel im Bundle; Overlay-Panels, siehe [dialog](dialog.md), [menu-and-tooltip](menu-and-tooltip.md), [snackbar](snackbar.md)). Der Tooltip nutzt nur den Schatten-Token.

## Verwendung
```html
<!-- src/app/components/system-logs/system-logs.component.html -->
<mat-card mtCard class="logs-card">
  <mat-card-header mtCardHeader>
    <mat-card-title mtCardTitle>System Logs</mat-card-title>
  ...
  <mat-card-content mtCardContent>
```
```html
<!-- Seiten-Container ohne mat-card: src/app/components/login-failed/login-failed.component.html -->
<div class="login-failed" mtCard>
  <h1 class="mt-page-title">Anmeldung nicht möglich</h1>
```
- `mtCard` an einem `div` liefert nur die Fläche (über das eingeschlossene `mt-surface`); die Material-Token-Overrides von `mt-card` greifen dort nicht, sie sind für `mat-card` gedacht.
- `mtSurface` allein für Container, die weder Karte noch Overlay sind.
- Lint: `mat-card`, `mat-card-header`, `-title`, `-content`, `-actions` ohne ihre Direktive meldet ESLint (Zuordnung in `eslint-rules/mt-directive-map.json`, siehe [enforcement](enforcement.md)).
- Seitentitel (`mt-page-title`) und Seitenhintergrund: [page-and-layout](page-and-layout.md).

## Zielwerte
| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Hintergrund Karte | #FFFFFF | immer | AC-01, Token `color-surface` |
| Rahmen | keiner (`border: 0`) | immer | AC-01, `_mt-surface.scss` |
| Radius | 0 | immer | AC-01, Token `radius-none` |
| Schatten | `0 5px 25px 0 rgba(19,19,19,0.1)` (Token: `0 0.3125rem 1.5625rem 0 …`) | immer | AC-01, Token `shadow-surface` |
| Seitenhintergrund (Bezug) | #EFF0F4 | immer | AC-01, Token `color-page`, siehe [page-and-layout](page-and-layout.md) |
| Kartentitel | 20 px, Light, Zeilenhöhe 1,3, Farbe `color-text` | immer | `_mt-card-title.scss` (`font-size-xl`, `font-weight-light`) |
| Kopf-Innenabstand | `16px 16px 0` | immer | Materials Vorgabe (`.mat-mdc-card-header`) |
| Inhalt-Innenabstand | `0 16px` | immer | Materials Vorgabe (`.mat-mdc-card-content`) |
| Aktionsleiste | Abstand `0.75rem`, Innenabstand `8px` | immer | `_mt-card-actions.scss` (Abstand), Materials Vorgabe (Innenabstand) |

Materials Card-Styles laden als Komponenten-Styles nach dem globalen Bundle und gewinnen bei gleicher Spezifität; eigene Innenabstände an `mt-card-header/-content/-actions` greifen deshalb nicht (gemessen 2026-10-30, Workitem 314469).

Gemessen wird die Karte im Browser-Test „Karte: Seite Login fehlgeschlagen …“ (`e2e/tests/mt-targets.spec.ts`, AC-01/AC-34). Die Abstände von Kopf/Inhalt/Aktionen stammen aus den Partials, nicht aus einem AC.

## Aufbau (intern)
```ts
// src/app/util/directives/mt-card.directive.ts
@Directive({ selector: '[mtCard]', host: { class: 'mt-card' }, hostDirectives: [MtSurfaceDirective] })
```
```scss
// src/styles/mt/foundation/_mt-surface.scss
@mixin surface {
  background-color: t.v(color-surface);
  border: 0;
  border-radius: t.v(radius-none);
  box-shadow: t.v(shadow-surface);
}
```
- `mt-card` setzt zusätzlich `mat.card-overrides(...)` (elevated Container-Farbe, -Form, Schatten; `outlined` nutzt im Repo keine `mat-card`), weil `mat-card` ihre Fläche aus Material-Tokens liest, nicht aus `background`/`box-shadow` am Host.
- `mt-card-title` überschreibt `title-text-size/-weight/-line-height` über `mat.card-overrides`.
- Tokens: `--mt-color-surface`, `--mt-radius-none`, `--mt-shadow-surface`, `--mt-color-text`, `--mt-font-size-xl`, `--mt-font-weight-light` ([tokens](tokens.md)). Zugriff in Partials immer über `t.v(...)`.
- Reihenfolge: Partials sind in den Gruppen-Indizes eingebunden (`mt-surface` in `foundation`, vor `mt-card*` in `cards`). Direktiven-Modell: [directive-model](directive-model.md).

## Tests
- Unit (`src/app/util/directives/`): `mt-surface.directive.spec.ts`, `mt-card.directive.spec.ts`, `mt-card-header|-title|-content|-actions.directive.spec.ts`; Hilfen in `testing/mt-directive.testing.ts`.
- Browser: `e2e/tests/mt-targets.spec.ts` (Karte auf „Login fehlgeschlagen“).
- Handliste: `e2e/mt-messliste.md` (AC-01).
- Lint/Stylelint: Zuordnung `mat-card*` zu `mt*` (ESLint); `stylelint.config.mjs` verbietet Literale und `!important` ohne Kommentar in `src/styles/mt/**/*.scss`.

## Abweichungen ggü. Spec/Plan
Keine festgestellt.

## Offene Punkte
- Karten-Abstände (Kopf/Inhalt/Aktionen) haben keine Messzeile in Messliste oder e2e.
- Final-Review: ungemessene Bausteinhöhen und rohe px-Werte einzelner Komponenten-Stylesheets liegen außerhalb dieses Elements (Task 27, zurückgestellt).

## Ändern: Checkliste
1. Wert ändern: zuerst Token in `src/styles/_mt-tokens.scss` (`shadow-surface`, `color-surface`, `radius-none`), nur dann Partial. Keine Literale in Komponenten.
2. Fläche für alle Overlays ändern: nur `@mixin surface` in `_mt-surface.scss`; Dialog, Menü und Snackbar erben sie.
3. Neue Karten-Teile: Direktive + Partial + Eintrag in `styles/mt/<gruppe>/_index.scss`, `mt-directives.ts`, `eslint-rules/mt-directive-map.json` + Spec.
4. Kein `!important` ohne Begründungskommentar; Bundle-Budget in `angular.json` nicht anheben.
5. Messliste und e2e-Test mitziehen, danach **diese Referenzseite im selben Zug korrigieren**.
