# Seitenfläche und Rahmen
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 51a253e3 plus verschlanktes Theme (ungecommittet) (2026-10-21)

> Die Seite steht auf dem hellgrau-blauen Hintergrund `#EFF0F4`; Inhalt liegt auf weißen Karten. Diese Seite beschreibt die globale Fläche, die Reihenfolge der globalen Stylesheets, Lade-Platzhalter, App-weite Resets und die Seiten ohne eigene Direktive („Login fehlgeschlagen“, „Zugriff anfragen“, Result-Texte).

## Überblick

| Teil | Datei | Rolle | Inhalt |
|---|---|---|---|
| Einstieg | `src/frontend/src/styles.scss` | globales Stylesheet | Reihenfolge der `@use` |
| Seitenfläche, Reset | `src/styles/_app-reset.scss` | Klasse ohne Direktive (global) | `html`/`body`: Höhe 100 %, Basisschrift, Fließtext, Seitenhintergrund, Number-Spinner entfernt |
| Layout-Helfer | `src/styles/_layout.scss` | Mixins, opt-in | `flex-col` (Standard-Abstand `var(--mt-space-2)`); per `@use` in der Komponente, nicht in `styles.scss` |
| Lade-Platzhalter | `src/styles/_mt-skeleton.scss` | Klasse ohne Direktive | Farben von `ngx-skeleton-loader` über Tokens |
| Overlay-/Dialog-Rahmen | `_dialogs.scss`, `_overlays.scss`, `_snackbar.scss` | global | Panel-Klassen; `_overlays.scss` hebt nur den CDK-Overlay-Container über die Vollbild-Karte (`.fullscreen-active`), für das Autopilot-Overlay (`.overlay`) gibt es bewusst keine globale Regel (z-index/pointer-events in `unit-header.component.scss`, `position: fixed` inline); Optik siehe [dialog](dialog.md), [snackbar](snackbar.md) |
| Nav, Menüs | `_nav-item.scss`, `_views-menu.scss`, `_chat-bots-menu.scss` | global | Geometrie bzw. Overlay-Rahmen; Optik siehe [tabs-and-nav](tabs-and-nav.md), [menu-and-tooltip](menu-and-tooltip.md) |
| Grid-Helfer | `_align-static-header.scss` | Mixin | Header-Ausrichtung, siehe [grid](grid.md) |
| Result-Resets | `_result-overrides.scss` | global | Material-/Slider-Overrides der Result-Seite (nur Layout) |
| Karte | Direktive `mtCard` | siehe [surface-and-card](surface-and-card.md) | Seitenkarten |
| Titel | `.mt-page-title` | siehe [typography](typography.md) | Seitentitel |

## Verwendung

Reihenfolge in `src/styles.scss` (maßgeblich; spätere gleich spezifische Regeln gewinnen):

```scss
@use './styles/theme-used';     // verschlanktes Material-Theme (erzeugt aus _theme.scss, Marke: _brand.scss)
@use './styles/mt-tokens';      // :root { --mt-* }
@use './styles/mt-typography';  // .mt-page-title / .mt-section-title
@use './styles/mt-skeleton';
@use './styles/mt';             // Index aller Direktiven-Partials (styles/mt/_index.scss, bindet die Gruppen-Indizes ein)
@use './styles/app-reset';
@use './styles/dialogs';
@use './styles/overlays';
@use './styles/snackbar';
@use './styles/views-menu';
@use './styles/chat-bots-menu';
@use './styles/result-overrides';
```

Seiten „Login fehlgeschlagen“ und „Zugriff anfragen“ (AC-34) sind Karte plus Seitentitel:

```html
<!-- login-failed.component.html -->
<div class="login-failed" mtCard>
  <mat-icon aria-hidden="true">error_outline</mat-icon>
  <h1 class="mt-page-title">Anmeldung nicht möglich</h1>
  ...
</div>
<!-- request-access.component.html -->
<div class="access-denied-container" mtCard>
  <h2 class="mt-page-title"><mat-icon>do_disturb</mat-icon> Access Denied</h2>
```

Beide Komponenten importieren `MT_DIRECTIVES`; ihr Stylesheet enthält nur Anordnung (Flex, Abstand), keine Optik. Das Icon von „Zugriff anfragen“ nutzt `var(--mt-role-error)` und `var(--mt-font-size-5xl)`.

Erfolgs-/Fehlertext der Result-Seite (AC-66, nur Schriftfarbe der Rolle, keine Fläche, kein Rahmen):

```html
<!-- result.component.html -->
<p class="analysis-message analysis-message--error" mtRole="error">{{ analysisError() }}</p>
<mat-icon class="analysis-icon--success" mtRole="success">check_circle</mat-icon>
```

Layout-Klassen am Host: Der Aufrufer setzt Layout (Breite, Ausrichtung) per `class` am Host der Hülle; die Hülle füllt ihren Host (`:host { display: block; }`, inneres `mat-form-field { width: 100%; }`).

```html
<app-atlas-form-input class="toolbar__search" ...>   <!-- experiment-dashboard-toolbar.component.html -->
```

## Zielwerte

| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Seitenhintergrund | `#EFF0F4` (`color-page`) | `body` | AC-01 |
| Karte | `#FFFFFF`, rahmenlos, Radius 0, Schatten `0 5px 25px 0 rgba(19,19,19,.1)` | `mtCard` | AC-01 |
| Seitentitel | 23 px Light, `#000000` | `.mt-page-title` | AC-33 |
| Fließtext | 16 px Light, `#000000` | `body` | AC-33 |
| Login fehlgeschlagen / Zugriff anfragen | Karte nach AC-01 auf dem Seitenhintergrund, Titel nach AC-33, Buttons nach AC-02 (Seiten tragen derzeit keine Buttons) | – | AC-34 |
| Result Erfolgstext | Schrift `#BBD03A` (`role-success`), keine Fläche | `mtRole="success"` | AC-66 |
| Result Fehlertext | Schrift `#FF0201` (`role-error`), keine Fläche | `mtRole="error"` | AC-66 |
| Lade-Platzhalter | Fläche `#EFF0F4`, Schimmer `#FFFFFF`, Radius 0 | `ngx-skeleton-loader` | AC-63 |
| Basisschrift | `clamp(13px, 1.8vh, 16px)` | `html` | AC-45 |

## Aufbau (intern)

```scss
// src/styles/_mt-skeleton.scss
ngx-skeleton-loader .skeleton-loader.progress {
  --ngx-skeleton-loader-base-color:#{t.v(color-page)};
  --ngx-skeleton-loader-light-mode-color:#{t.v(color-surface)};
  --ngx-skeleton-loader-light-mode-color-to:#{t.v(color-page)};
  border-radius: t.v(radius-none);
}
```

Die Bibliothek setzt ihre Variablen gekapselt am Element `.skeleton-loader`; deshalb ist der Selektor mit der Animationsklasse `progress` spezifischer als der Bibliotheks-Selektor. Die App nutzt nur die Standard-Animation `progress`; ein `.pulse`-Zweig erst, wenn ein `ngx-skeleton-loader` `animation="pulse"` bekommt. Custom Properties ohne Leerzeichen nach dem Doppelpunkt schreiben, der Minifier kürzt sie nicht. `_mt-skeleton.scss` liegt bewusst nicht im `mt/`-Index (kein Direktiven-Partial, kein 2-kB-Limit).

```scss
// src/styles/_app-reset.scss
html, body { height: 100%; }
html { font-size: clamp(13px, 1.8vh, 16px); }
body { margin: 0; font-family: var(--mt-font-family); font-size: var(--mt-font-size-base);
       font-weight: var(--mt-font-weight-light); color: var(--mt-color-text); background-color: var(--mt-color-page); }
input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
input[type="number"] { -moz-appearance: textfield; }
```

Weitere Punkte

| Punkt | Detail |
|---|---|
| `_result-overrides.scss` | bewusst global (Component-Style-Budget); nur `.mat-button-toggle-appearance-standard` unter `app-result`; **keine** Rollenfarbe, diese kommt von `mtRole` |
| `_dialogs.scss` | `!important` an Dialog-Inhalten nur mit Begründungskommentar (`stylelint-disable-next-line declaration-no-important -- …`) |
| Budgets | globales Bundle `styles`: Basis 21015 B, Warnung +30 %, Fehler +50 % (`angular.json`); Komponenten-Stylesheets Warnung 3 kB, Fehler 6,5 kB |

## Hüllen-Komponenten

Hüllen übernehmen die Fläche ihres Hosts: `:host { display: block; }`, Kinder `width: 100%`. Optik-Eingaben gibt es nicht; Layout liefert der Aufrufer über `class` am Host ([directive-model](directive-model.md), Abschnitt Hüllen-Konzept).

## Tests

| Was | Wo |
|---|---|
| Hintergrund, Fließtext, Font-Link, Skalierung | `e2e/tests/mt-foundation.spec.ts` |
| Karte „Login fehlgeschlagen“: Fläche, Schatten, Titel | `e2e/tests/mt-targets.spec.ts` |
| Lade-Platzhalter (AC-63), Titel/Text (AC-33), AC-66 Rollenfarbe | Handliste `e2e/mt-messliste.md` |
| Token-Auflösung der Partials inkl. `mt-skeleton` | `scripts/mt-tokens.test.mjs` (`compile_AllPartialsWithDefaultTokens_ResolveEveryTokenCall`) |
| Platzierungen (`mtCard`, `mtRole` in Templates) | `scripts/mt-placements.test.mjs` |
| Budgets | `scripts/mt-budgets.test.mjs`, Build |

## Abweichungen ggü. Spec/Plan

| Thema | Jetzt (Code) | Spec/Plan | Grund |
|---|---|---|---|
| Buttons auf „Login fehlgeschlagen“/„Zugriff anfragen“ | keine Buttons in den Templates | AC-34 nennt Buttons nach AC-02 | Aussage gilt nur, wenn Buttons vorhanden sind; Texte und Routen bleiben unverändert (AC-46) |

## Offene Punkte

- Task 19: `setup-page` Pflichtfeld-Markierung schwächer als vorher; `report.component` Spinner-Abdunkelung über `--mt-color-text` mit `opacity` (`color-mix` ist verboten); Scrim-Token fehlt.
- Final-Review: Überlauf Wizard-Fußleiste, Such-Wizard-Kopfzeile und KI-Markierung (`ai-filled`) im Browser nicht geprüft.
- Task 24: Ob `.mt-role:not(.mt-tag)` (Rollenfarbe nur Schrift) gegen Komponenten-CSS gewinnt, stand zunächst ungemessen (Messliste AC-66).
- Bundle `styles`: Task 23 lag 589 B unter der Fehlergrenze; nach der Verschlankung (2026-10-21) 24,31 kB, 7,2 kB Luft.

## Ändern: Checkliste

1. Seitenhintergrund oder Fließtext ändern: Token (`color-page`, `color-text`, `font-size-base`) in `_mt-tokens.scss`, nicht in `_app-reset.scss`.
2. Neue globale Partial-Datei: in `styles.scss` an der richtigen Stelle einbinden (nach `mt`, wenn sie Direktiven-Optik überschreiben darf); keine Literale außerhalb `src/styles/`.
3. Lade-Platzhalter: nur Token-Verweise in `_mt-skeleton.scss`; Selektor mit Animationsklasse beibehalten.
4. Neue Seite: Karte per `mtCard`, Titel per `.mt-page-title`, Komponente importiert `MT_DIRECTIVES`; keine Optik im Komponenten-Stylesheet.
5. Nicht tun: Budget anheben, `!important` ohne Begründung, Optik von Rollenfarbe über Fläche/Rahmen lösen (AC-66 nur Schrift).
6. Tests anpassen (`mt-foundation.spec.ts`, `mt-targets.spec.ts`, `mt-messliste.md`) und **diese Referenzseite im selben Zug korrigieren**.
