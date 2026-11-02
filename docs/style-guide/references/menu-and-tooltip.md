# Menü und Tooltip (mtMenu, mtMenuItem, mtTooltip)
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> `mtMenu` gibt dem Panel eines `mat-menu` die Kartenfläche, `mtMenuItem` die Baustein-Höhe der Einträge, `mtTooltip` macht `matTooltip` weiß mit grauem Text und Kartenschatten.

## Überblick
| Direktive / Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `mat-menu[mtMenu]` | `mt-menu` (Konstante `MT_MENU_PANEL_CLASS`), am Overlay-Panel | Basis, ergänzt `overlayPanelClass` | `mat-menu` | `util/directives/mt-menu.directive.ts`, `styles/mt/overlays/_mt-menu.scss` |
| `[mtMenuItem]` | `mt-menu-item` | Verfeinerung | `button[mat-menu-item]` | `mt-menu-item.directive.ts`, `_mt-menu-item.scss` |
| `[matTooltip][mtTooltip]` | `mt-tooltip` (Konstante `MT_TOOLTIP_CLASS`), am Tooltip-Element | Basis, setzt `tooltipClass` | jedes Element mit `matTooltip` | `mt-tooltip.directive.ts`, `_mt-tooltip.scss` |

Direktiven unter `src/frontend/src/app/util/directives/`, Partials unter `src/frontend/src/styles/mt/`. Menü-Panel und Tooltip liegen im Overlay-Container außerhalb des Templates, deshalb bekommen sie ihre Klasse per Material-Eingabe statt per Host-Klasse.

## Verwendung
```html
<!-- src/app/components/user-menu/user-menu.component.html -->
<mat-menu mtMenu #userMenu="matMenu" class="user-menu-panel">
  @if (auth.isAdmin()) {
    <a mtMenuItem mat-menu-item routerLink="/admin">…</a>
    <mat-divider />
  }
  <button mtMenuItem mat-menu-item (click)="onLogout()">…</button>
```
```html
<!-- src/app/components/system-logs/system-logs.component.html -->
<button mtButtonIcon mtButtonText mtTooltip matIconButton (click)="loadLogs()" matTooltip="Refresh">
```
- `mtTooltip` immer zusammen mit `matTooltip` (Selektor `[matTooltip][mtTooltip]`); ESLint meldet `matTooltip` ohne `mtTooltip`, `mat-menu` ohne `mtMenu`, `mat-menu-item` ohne `mtMenuItem` ([enforcement](enforcement.md)).
- Benutzermenü (`user-menu.component.html`): Auslöser ist ein Sidebar-Eintrag mit Namen ([tabs-and-nav](tabs-and-nav.md)); im Menü stehen nur `Admin` (nur mit Admin-Gruppe, `AuthService.isAdmin`, dieselbe Bedingung wie `AdminGuard`), ein `mat-divider` (nur zusammen mit `Admin`) und `Logout`. Der Name steht nicht mehr im Menü.
- Ein eigenes `class="…"` an `mat-menu` (z. B. `views-menu`, `chat-bots-menu`) bleibt erhalten; `mtMenu` ergänzt `mt-menu` zusätzlich.
- Ein eigenes `matTooltipClass` würde von `mtTooltip` überschrieben (siehe Aufbau); im Bestand existiert keines.
- 43 Template-Stellen nutzen `mtMenu` oder `mtTooltip`. Rollenfarben und Tags: [tag-and-role](tag-and-role.md).

## Zielwerte
| Eigenschaft | Wert (Basisschrift 16 px) | Zustand | Quelle |
|---|---|---|---|
| Menü-Panel | Kartenfläche: #FFFFFF, rahmenlos, Radius 0, Schatten `0 5px 25px 0 rgba(19,19,19,0.1)` | offen | AC-31 (Fläche aus AC-01), `.mt-menu .mat-mdc-menu-panel` mit Platzhalter `%surface` (`@extend`), [surface-and-card](surface-and-card.md) |
| Menü-Eintrag Hover/Fokus | Fläche #EFF0F4 (`color-hover`) | Hover, Fokus | `_mt-menu.scss` (`item-hover/-focus-state-layer-color`) |
| Menü-Eintrag Schrift/Icon | Schrift `color-text`, Icon `color-ink` | immer | `_mt-menu.scss` |
| Menü-Eintrag Höhe | mindestens 44 px (`control-height`) | immer | `_mt-menu-item.scss` |
| Tooltip Hintergrund | #FFFFFF | sichtbar | AC-31, `color-surface` |
| Tooltip Text | #8C8C8C (`color-hint`), 13 px, Light | sichtbar | AC-31, `_mt-tooltip.scss` |
| Tooltip Schatten | wie Karte | sichtbar | AC-31, `shadow-surface` |
| Tooltip Innenabstand | 8 px oben/unten, 12 px seitlich (`0.5rem 0.75rem`) | sichtbar | AC-31 |
| Tooltip Radius | 0 | sichtbar | `container-shape: radius-none` |

Grund für 8/12 px (Spec, Abschnitt „W · Tooltip“, ändert AC-31): die Vorlage kennt ein Info-Popover mit 30 px Innenabstand; alle Tooltips der Anwendung zeigen kurze Texte, deshalb 8 px/12 px statt 30 px.

## Aufbau (intern)
```ts
// src/app/util/directives/mt-menu.directive.ts
ngOnInit(): void {
  const current = this.menu.overlayPanelClass;
  const classes = (Array.isArray(current) ? current : [current]).filter((cssClass) => !!cssClass);
  this.menu.overlayPanelClass = [...classes, MT_MENU_PANEL_CLASS];
}
```
```ts
// src/app/util/directives/mt-tooltip.directive.ts
ngOnInit(): void { this.tooltip.tooltipClass = MT_TOOLTIP_CLASS; }
```
- Menü: ergänzt die Panel-Klasse statt sie zu überschreiben; das Anhängen läuft in `ngOnInit`, also genau einmal pro Instanz. Wird `overlayPanelClass` danach von außen neu gesetzt, geht `mt-menu` verloren.
- Tooltip: überschreibt `tooltipClass` (setzt nicht zusammen). Das ist eine bekannte Asymmetrie zu `mtMenu`.
- `_mt-menu.scss`: `mat.menu-overrides` (Eintragsfarben, Hover/Fokus) plus `.mat-mdc-menu-panel { @extend %surface }`; den Radius setzt `%surface` mit (0,2,0) auf genau die Fläche, die `container-shape` sonst färbt, daher kein Form-Token.
- `_mt-menu-item.scss`: `.mt-menu-item.mat-mdc-menu-item` (Doppelklasse). Materials `.mat-mdc-menu-item { min-height: 48px }` ist gleich spezifisch wie eine Einzelklasse und wird nach `styles.css` geladen; mit Einzelklasse blieb der Eintrag 48 px (gemessen 2026-10-30, #314472).
- `_mt-tooltip.scss`: `mat.tooltip-overrides` (Farbe, Form, Textfarbe/-größe/-gewicht), `.mdc-tooltip__surface` mit Innenabstand und Schatten.
- Tokens: `--mt-color-surface|text|ink|hint|hover`, `-radius-none`, `-shadow-surface`, `-control-height`, `-font-size-sm`, `-font-weight-light` ([tokens](tokens.md)). Modell: [directive-model](directive-model.md).

### Globale Menü-Partials in src/styles (Bestand)
| Partial | Inhalt | Zustand |
|---|---|---|
| `_chat-bots-menu.scss` | `.chat-bots-menu.mat-mdc-menu-panel { max-width: none }` (hebt Materials 280-px-Grenze für lange Bot-Namen; Breite je Eintrag aus dem Trigger) | aktiv, nur Geometrie |
| `_views-menu.scss` | `.views-menu .mat-mdc-menu-item { min-width: 150px }` und die Zeile `.view-row` (Flex, Checkbox, Name mit Ellipsis, Löschen-Button) | aktiv, nur Geometrie/Anordnung |
| `_user-menu.scss` | gelöscht (Rahmen entfiel durch `mt-menu`, Datei war nur noch Kommentar) | entfernt |

## Tests
- Unit: `mt-menu.directive.spec.ts`, `mt-menu-item.directive.spec.ts`, `mt-tooltip.directive.spec.ts`, `user-menu.component.spec.ts` (Admin nur mit Rolle, Reihenfolge Admin, Divider, Logout).
- Browser: kein Menü-/Tooltip-Test in `e2e/tests/mt-*.spec.ts`.
- Handliste: `e2e/mt-messliste.md` AC-31 (Menü „Views“, Tooltip am Messwerkzeug: Fläche; #8C8C8C, 8 px 12 px).
- Lint: Zuordnung in `eslint-rules/mt-directive-map.json` (`mat-menu`, `mat-menu-item`, `matTooltip`).

## Abweichungen ggü. Spec/Plan
- Tooltip-Innenabstand 8/12 px statt 30 px der Vorlage: von der Spec selbst so festgelegt (siehe Zielwerte), nicht Plan-Drift.
- Benutzermenü (2026-10-21, Anweisung im Chat): Admin zog aus der Sidebar ins Menü, der Name aus dem Menü in den Auslöser. `mat-divider` ist ohne mt-Direktive (kein Eintrag in `mt-directive-map.json`), Farbe und Dicke kommen von Material.
- Sonst keine.

## Offene Punkte
- Task 9: `mt-menu.directive.spec.ts` testet nur den Fall ohne bestehende `overlayPanelClass`.
- Task 9: `mtTooltip` überschreibt `tooltipClass` statt zu ergänzen; Task 13 prüfte den Bestand, es gibt keinen mit eigener `matTooltipClass`.
- Task 9: `mtMenu` setzt `overlayPanelClass` nur einmal in `ngOnInit` (kosmetisch).
- Browser-Wirkung der Menü- und Tooltip-Werte nur über die Messliste, nicht automatisiert.

## Ändern: Checkliste
1. Fläche des Menüs ändern: `@mixin surface` (`_mt-surface.scss`), nicht `_mt-menu.scss`; Tooltip-Werte in `_mt-tooltip.scss`; Werte als Token in `_mt-tokens.scss`.
2. Kein neues `matTooltipClass` im Bestand einführen (würde von `mtTooltip` überschrieben); Menü-Panel-Klassen per `class` am `mat-menu`.
3. Globale Menü-Partials (`_views-menu.scss`, `_chat-bots-menu.scss`) nur für Geometrie, keine Farben/Schatten.
4. Neue Menü-Stellen: `mtMenu` + `mtMenuItem` setzen, sonst meldet ESLint; Spec und Messliste mitziehen; Budget nicht anheben.
5. **Diese Referenzseite im selben Zug korrigieren.**
