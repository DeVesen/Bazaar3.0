# Tabs und Navigation
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> Wizard-Tabs (`mtTabs`, `mtTabsTab`) und linkes Menü (`mtNavItem`, `mtNavItemGroup`) in der MyTRUMPF-Optik: aktiver Eintrag dunkelblau mit weißer Schrift, Hover hellgrau.

## Überblick

| Direktive/Selektor | Klasse | Rolle | Sitzt an | Datei |
|---|---|---|---|---|
| `[mtTabs]` | `mt-tabs` | Basis | `mat-tab-group` | `src/app/util/directives/mt-tabs.directive.ts`, `src/styles/mt/navigation/_mt-tabs.scss` |
| `[mtTabsTab]` | `mt-tabs-tab` | Verfeinerung | Beschriftung im `mat-tab-label` (Span) | `mt-tabs-tab.directive.ts`, `_mt-tabs-tab.scss` |
| `[mtTabsSubtitle]` | `mt-tabs-subtitle` | Basis | Untertitel im `mat-tab-label` (Span) | `mt-tabs-subtitle.directive.ts`, `_mt-tabs-subtitle.scss` |
| `[mtNavItem]` | `mt-nav-item` | Basis | `a`/`button` mit `mat-list-item` | `mt-nav-item.directive.ts`, `_mt-nav-item.scss` |
| `[mtNavItemGroup]` | `mt-nav-item-group` | Basis | `app-atlas-nav-group` | `mt-nav-item-group.directive.ts`, `_mt-nav-item-group.scss` |
| Partial ohne Direktive | Mixin `nav-item-base` | nur Geometrie | Komponenten-SCSS | `src/styles/_nav-item.scss` |

Alle Direktiven setzen nur die Host-Klasse (`host: { class: '...' }`); die Optik steckt im Partial. Direktiven liegen in `src/frontend/src/app/util/directives/`, Partials in `src/frontend/src/styles/mt/`.

## Verwendung
Linkes Menü (`sidebar.component.html`):

```html
<a mtNavItem mtTooltip class="hyper-link" mat-list-item
   [routerLink]="['/experiments']" routerLinkActive="active"
   [routerLinkActiveOptions]="{ exact: true }">
  <mat-icon fontSet="material-icons-outlined">dashboard</mat-icon> Dashboard
</a>

<app-atlas-nav-group mtNavItemGroup label="Search" icon="travel_explore" ...>
```

Wizard-Tabs (`experiment-wizard-shell.component.html`):

```html
<mat-tab-group mtTabs class="wizard-tabs" mat-stretch-tabs="true" ...>
  <mat-tab>
    <ng-template mat-tab-label>
      <span class="tab-label">
        <span class="tab-label-text" mtTabsTab>{{ step.displayText | titlecase }}</span>
        <span class="tab-label-subtitle" mtTabsSubtitle>{{ subtitle }}</span>
```

Bestand: `mtNavItem` in Sidebar (Dashboard, Search u. a.), `help-link.component.html`, `user-menu.component.html` (Trigger an einem `<button>`: Icon plus Name), `atlas-chat-bots-menu.component.html` (an einem `<button>`), `tools-sidebar.component.html` (6 Einträge); `mtNavItemGroup` nur in der Sidebar; `mtTabs`/`mtTabsTab`/`mtTabsSubtitle` nur im Wizard-Shell.

Regeln:
- Der aktive Eintrag kommt aus `routerLinkActive="active"`; die Klasse heißt `active`.
- Neue Menüeinträge: `mtNavItem` + `mat-list-item`. Die Komponente liefert über `@include nav-item.nav-item-base` nur Geometrie, keine Farben, keine Hover-/Aktiv-Regeln.
- Ohne `mat-list-item` bzw. `mat-tab-group` greift die mt-Optik nicht (Selektor `.mt-nav-item.mat-mdc-list-item`).

## Zielwerte

| Eigenschaft | Wert | Zustand | Quelle |
|---|---|---|---|
| Wizard-Tab Hintergrund | `#285172` (`--mt-color-accent`) | aktiv | AC-22, `_mt-tabs.scss` (`.mdc-tab--active`) |
| Wizard-Tab Schrift | weiß (`color-on-accent`), fett 700, Versalien | aktiv | AC-22, `active-*-label-text-color`, `_mt-tabs-tab.scss` |
| Wizard-Tab inaktiv | keine Fläche, Schrift `#0B0B0B` (`color-ink`) | inaktiv, Focus, Hover | AC-22 |
| Linie unter den Tabs | 1 px `#E2E2E2` (`color-line`), Indikator-Höhe 0 | immer | AC-22, `divider-color` (Höhe 1 px ist Materials Vorgabe), `active-indicator-height` |
| Tab-Untertitel (zweite Zeile) | Anthrazit `#383E42` (`color-anthracite`), `font-size-xs` 12 px, 300 | inaktiv | Anweisung 2026-10-21, `_mt-tabs-subtitle.scss` |
| Tab-Untertitel (zweite Zeile) | weiß (`color-on-accent`), wie die Beschriftung invertiert | aktiv (`.mdc-tab--active`) | Anweisung 2026-10-21, `_mt-tabs-subtitle.scss` |
| Tab-Schriftgröße | `font-size-sm` = 0,8125 rem (13 px) | immer | `label-text-size` |
| Menü Hintergrund | `#FFFFFF` (`color-surface`) | Ruhe | AC-23 |
| Menü Hover | `#EFF0F4` (`color-hover`) | Hover | AC-23 |
| Menü aktiv | Fläche `#285172`, Schrift und Icon weiß, auch im Fokus (nach Klick) | `.active`, `:focus` | AC-23 |
| Menü Schrift | `font-size-sm`, 700, Versalien, Farbe `color-text` | Ruhe/Hover | `list-item-label-*` |
| Zuletzt-Eintrag, zweite Zeile (`.last-wizard-target`) | `font-weight-light` 300 statt Menügewicht 700, sonst wie Menü | immer | Anweisung 2026-10-21, `_mt-nav-item.scss` |
| Zuletzt-Eintrag, Breite | Text endet 5 px vor dem rechten Rand der Sidebar, zu langer Text mit „…“ gekürzt | immer | Anweisung 2026-10-21, `sidebar-2.component.scss` |
| Menü Icon | `color-ink` | Ruhe | `list-item-leading-icon-color` |
| Menü Zeilenhöhe (Material-Token) | `control-height` = 2,75 rem (44 px), Radius 0 | immer | `list-item-one-line-container-height` |
| Geometrie Eintrag (Mixin) | Höhe 40 px, Padding `0 12px 0 16px`, Icon 18 px, Abstand 10 px | immer | `src/styles/_nav-item.scss` |

AC-23 prüft ein Browser-Test (`e2e/tests/mt-targets.spec.ts`); AC-22 steht nur in der Handliste `e2e/mt-messliste.md`.

## Aufbau (intern)
`_mt-nav-item.scss` setzt Material-Token über `mat.list-overrides` und zusätzlich Fläche und Schrift direkt am Host:

```scss
.mt-nav-item.mat-mdc-list-item {
  @include mat.list-overrides(( list-item-container-shape: t.v(radius-none), ..., list-item-leading-icon-color: t.v(color-ink) ));
  background-color: t.v(color-surface);
  text-transform: uppercase;
  &:hover { background-color: t.v(color-hover); }
  &.active {
    @include mat.list-overrides(( ...on-accent... ));
    background-color: t.v(color-accent);
    color: t.v(color-on-accent);
  }
}
```

- `.mat-mdc-list-item` erzeugt Material; `_mt-tabs.scss` hat `.mt-tabs { @include mat.tabs-overrides((...)); .mdc-tab--active { background-color: accent } }`. `.mdc-tab--active` erzeugt Material; die Fläche des aktiven Tabs ist nicht über ein Override-Token setzbar, daher die direkte Regel.
- `_mt-tabs-subtitle.scss`: `.mt-tabs-subtitle` setzt Größe, Gewicht und Anthrazit; `.mt-tabs .mdc-tab--active .mt-tabs-subtitle` setzt Weiß. Die Direktive `mtTabsSubtitle` sitzt am `.tab-label-subtitle`-Span; Layout (Ellipsis, `max-width: 12vw`) bleibt in der Shell.
- Die Fläche des Eintrags kommt nur aus `background-color` am Host (0,2,0); ein `list-item-container-color`-Token wäre doppelt, Materials `.mdc-list-item` (0,1,0) verliert ohnehin.
- `_mt-nav-item-group.scss`: `.mt-nav-item-group .nav-group-header` setzt nur Gewicht (fett) und Versalien. Höhe 40 px, Schriftgröße `font-size-sm` und Akzentfarbe setzt `atlas-nav-group.component.scss` mit gleicher Spezifität und späterem Laden, die Schriftart erbt vom `body`. Gemessen 2026-10-30 (#314472): 40 px, `color-accent`, 700, Versalien. Entscheidung: 40 px bleiben, nicht `control-height`.
- Tokens: `--mt-color-surface|hover|accent|on-accent|ink|text|line`, `--mt-control-height`, `--mt-font-size-sm`, `--mt-font-weight-bold`, `--mt-radius-none` (siehe [tokens](tokens.md)), im SCSS über `t.v(...)`.
- Partial `src/styles/_nav-item.scss`, Mixin `nav-item-base` (nur Geometrie): `display:flex`, `align-items:center`, `height:40px`, `padding:0 12px 0 16px`, `cursor:pointer`, `text-decoration:none`; `mat-icon`/`.nav-icon` 18 x 18 px, `margin-right:10px`. Eingebunden in `sidebar.component.scss` (`%nav-item-base`, `.hyper-link`), `help-link.component.scss`, `sidebar-2.component.scss` und `atlas-chat-bots-menu.component.scss` (gekapselte Kind-Komponente, die der Sidebar-Stil nicht erreicht).
- Tools-Sidebar: gleiche `mtNavItem`-Einträge mit Klasse `hyper-link`, Geometrie über die Sidebar-Stile.

## Hüllen-Komponenten
- `app-atlas-nav-group` (`components/common/atlas-nav-group`): bekommt `mtNavItemGroup` am Host. Der Kopf `.nav-group-header` hat in der Komponente noch eigenes SCSS (Höhe 40 px, `background: var(--mt-color-hover)`, `border-left: 3px solid var(--mt-color-accent)`, Schrift/Icon `--mt-color-accent`).
- `app-atlas-chat-bots-menu`: Auslöser `<button mtNavItem mat-list-item class="chat-bots-trigger-item">`; die Komponente setzt nur Geometrie (Mixin) plus Button-Reset (`border: none`, `width: 100%`, `text-align: left`, `font: inherit`, `font-size: var(--mt-font-size-sm)`). `background: transparent` ist entfernt.
- `app-user-menu` (`components/user-menu`): Auslöser `<button mtNavItem mat-list-item class="user-menu-trigger">` mit Icon `account_circle` und dem Namensteil der E-Mail (Teil vor dem `@`, Ellipsis bei langem Namen); die Komponente setzt nur Geometrie (Mixin) plus Button-Reset, wie `atlas-chat-bots-menu`. Der Eintrag steht im `admin-container` unter `app-help-link`. Inhalt des Menüs: [menu-and-tooltip](menu-and-tooltip.md).
- Wizard-Shell (`experiment-wizard-shell.component.scss`) behält Layout für `.wizard-tabs`: Höhe 60 px, `flex: 1 1 0`, feste Breite 90/200 px für Result/Parameters, Tab-Body ausgeblendet, Untertitel `.tab-label-subtitle` nur als Layout (`white-space`, `overflow`, `text-overflow`, `max-width`); Größe, Gewicht und Farbe des Untertitels kommen aus `mtTabsSubtitle`.

## Tests
- Unit: `mt-tabs.directive.spec.ts`, `mt-tabs-tab.directive.spec.ts`, `mt-nav-item.directive.spec.ts`, `mt-nav-item-group.directive.spec.ts` (prüfen nur die Host-Klasse).
- Browser: `e2e/tests/mt-targets.spec.ts`, Test "Linkes Menü: Einträge weiß, aktiver Eintrag #285172 mit weißer Schrift, Eintrag unter dem Mauszeiger #EFF0F4" (`app-sidebar .mt-nav-item.active` / `:not(.active)`).
- Browser: `mt-targets.spec.ts`, Test "Linkes Menü: aktiver Eintrag behält im Fokus die weiße Schrift" (Klick auf den aktiven Eintrag, misst die Schrift von `.mdc-list-item__primary-text`).
- Browser: `mt-targets.spec.ts`, Test "Linkes Menü: zweite Zeile des Zuletzt-Eintrags Light, erste Zeile fett" (misst an Markup der Klassen, das in die echte Menüliste eingefügt wird; der echte Eintrag erscheint nur mit gemerktem Wizard-Ort).
- Unit: `sidebar.component.spec.ts` (Zuletzt-Eintrag: `padding-right` 5 px, `.last-wizard-text` mit `min-width: 0` und `flex: 1 1 0%`; die Breite selbst ist per Hand am Browser gemessen: Text endet 5 px vor dem Rand, vorher 269 px darüber).
- Browser: `mt-targets.spec.ts`, Test "Wizard-Tabs: Untertitel im aktiven Tab weiß, im inaktiven Tab Anthrazit" (misst das globale Partial an synthetischem Markup der Klassen `.mt-tabs`, `.mdc-tab--active`, `.mt-tabs-subtitle`; der Wizard-Shell rendert mit den Mocks keine Tabs).
- Unit: `mt-tabs-subtitle.directive.spec.ts`.
- Unit: `user-menu.component.spec.ts` (Trigger ist `mt-nav-item`, Icon `account_circle`, Name im Trigger), `sidebar.component.spec.ts` (kein Admin-Link in der Sidebar; Reihenfolge Hilfe, Benutzermenü).
- Handliste: `e2e/mt-messliste.md`, Zeilen AC-22 und AC-23.
- Skripttest `scripts/mt-placements.test.mjs` (Platzierung der Direktiven); Stylelint meldet Farb-/px-Literale außerhalb `src/styles/` (AC-40, siehe [enforcement](enforcement.md)).

## Abweichungen ggü. Spec/Plan
- Fläche und aktive Schrift am Host (Task 24, Commit 1a0f812f): Der Plan setzte nur Material-Token. Im Browser blieb die Ruhefläche `rgba(0,0,0,0)` statt Weiß (Test AC-23 rot). Jetzt gilt: zusätzlich `background-color: surface` am Host und im Zustand `.active` zusätzlich `color: on-accent`.
- Chat-Bots-Button (Task 24): `background: transparent` im Button-Reset der Komponente entfernt, es überdeckte die Fläche. Der übrige Reset bleibt.
- Tab-Untertitel (2026-10-21): bisher setzte die Shell `color: var(--mt-color-hint)` am `.tab-label-subtitle`; der aktive Tab zeigte deshalb Grau auf Dunkelblau. Jetzt Direktive `mtTabsSubtitle` mit Anthrazit (inaktiv, vorher `color-hint` #8C8C8C) und Weiß (aktiv). Farbe, Größe und Gewicht sind aus dem Shell-SCSS entfernt (Werte unverändert bis auf die Farbe). AC-22 nannte den Untertitel nicht.
- Zuletzt-Eintrag (2026-10-21, Anweisung im Chat, bestätigte Abweichung): Menü-Schrift ist laut Zielwert 700 (`list-item-label-text-weight`). Die zweite Zeile (LAC-ID und Titel, `.last-wizard-target`) steht auf `font-weight-light` (300), die erste bleibt 700. Die Regel steht zentral in `_mt-nav-item.scss` (`.mt-nav-item .last-wizard-target`), nicht im Komponenten-SCSS; Größe und Farbe (`font-size-xs`, `color-hint`) stehen weiter in `sidebar-2.component.scss` (Bestand, nicht angefasst).
- Zuletzt-Eintrag, Breite (2026-10-21, Anweisung im Chat): Der Text ragte über die Sidebar hinaus (gemessen 269 px). Jetzt `padding-right: 5px` am Link und `min-width: 0` plus `flex` an `.mdc-list-item__content`, dem Unscoped-Content und `.last-wizard-text`; die bestehende Ellipsis an `.last-wizard-target` greift dadurch. Layout, keine Optik; rohe px wie im Bestand.
- Fokus im aktiven Eintrag (2026-10-21, Befund des Auftraggebers): Nach einem Klick zeigte der aktive Eintrag dunkle Schrift auf dunkelblauer Fläche, weil Material im Fokus die Token `list-item-focus-label-text-color` (dunkel) nutzt und unser Aktiv-Override nur Ruhe und Hover abdeckte. `.active` setzt jetzt zusätzlich `list-item-focus-label-text-color: on-accent`. Gemessen an `.mdc-list-item__primary-text` (am Host stand schon Weiß).
- Benutzermenü (2026-10-21, Anweisung im Chat): Der Admin-Eintrag steht nicht mehr als `mtNavItem` in der Sidebar, sondern im Benutzermenü (siehe [menu-and-tooltip](menu-and-tooltip.md)); der Avatar-`mtButtonIcon`-Auslöser wurde ein `mtNavItem` mit Namen. Kein Zielwert geändert; der Eintrag erscheint wie die übrigen Einträge (weiß, Hover `#EFF0F4`, Gruppenfarbe nur bei `app-atlas-nav-group`, nicht für Hilfe und Benutzermenü). AC-23 nannte Admin und Benutzermenü nicht.
- Sidebar-Anordnung (2026-10-21, Anweisung im Chat): Der Block Chatbots/infoApplication (`.links-container`) und der Block Hilfe/Benutzermenü (`.admin-container`) hängen immer am unteren Rand der Sidebar; `.links-container` hat 10 px Abstand nach oben (Trennlinie) und 10 px nach unten. `.nav-container` (Dashboard, Search, Search-Filter) füllt per Flex die gesamte Resthöhe (`flex: 1 1 0%`, Mindesthöhe `15rem`, darunter scrollt die ganze Sidebar). Die Kette `.sidebar-layout` (`min-height: 0`), `mat-nav-list`, `app-atlas-nav-group`, `.nav-group`, `.nav-group-content`, `app-search-filter-sidebar` ist Flex mit `min-height: 0`; die Panel-Liste `.sidebar-panels` scrollt selbst, `.sidebar-actions` (Search, Clear, Edit) bleibt sichtbar. Dafür steht im Haupt-Layout (`main-layout.component.scss`) `grid-template-rows: minmax(0, 1fr)` statt `1fr`, sonst wächst die Sidebar über das Fenster hinaus. Das frühere feste `max-height: 400px` der Panel-Liste (Commit 7121a082) ist damit ersetzt. Keine festen Höhen außer der Mindesthöhe; rohe px (10, 8) und `15rem` in Komponenten-SCSS wie bisher außerhalb der Token.
- Infoapplication-Bild (`.infoApp-img`): keine Prozentbreite mehr, sondern die Höhe `1,4 x font-size-sm` bei automatischer Breite und linksbündig, damit die Zeichenhöhe der Menüschrift entspricht; Schriftart und Kleinschreibung bleiben (Bild).
- Selektoren `.mat-mdc-list-item`, `.mdc-tab--active`, `.nav-group-header` stammen aus dem Plan; ihre Wirkung war bei Task 11 unverifiziert. Nav-Item ist inzwischen durch Test AC-23 belegt, Tab und Gruppenkopf durch keinen Playwright-Test.

## Offene Punkte
- Tab-Untertitel: Anthrazit-Wert `#383E42` ist von uns gewählt (Anweisung nannte nur "Anthrazit, dunkleres Grau als zuvor"); Wert nur im Token `color-anthracite` ändern. Gemessen nur an synthetischem Markup, nicht am echten Wizard-Shell; Sichtabnahme steht aus.
- Task 11/13: Wirkung von `.mdc-tab--active` und `.nav-group-header` im Browser nicht per Test belegt (AC-22 nur Handliste).
- Task 27 (außerhalb Scope): rohe px-Maße in Komponenten, u. a. Sidebar-Kopf 64 px, `.wizard-tabs` 60 px, `_nav-item.scss` 40/12/16/18/10 px; kein Token dafür.
- Der Menü-Test prüft nur Farben, nicht die Zeilenhöhe.
- Benutzermenü-Trigger: Sichtabnahme steht aus (Name neben dem Icon, Ellipsis bei langem Namen); die Messliste kennt ihn nicht.

## Ändern: Checkliste
1. Optik (Farbe, Schrift, Hover, aktiv) nur in `_mt-nav-item.scss`, `_mt-tabs.scss`, `_mt-tabs-tab.scss`, `_mt-nav-item-group.scss`; Werte als Token aus `src/styles/_mt-tokens.scss`, nie als Literal ([tokens](tokens.md)).
2. Geometrie nur im Mixin `src/styles/_nav-item.scss`; nicht in Komponenten duplizieren.
3. Kein Button-Reset mit `background` in Komponenten, der `mtNavItem` überdeckt.
4. Tab-Beschriftung `mtTabsTab`, Tab-Untertitel `mtTabsSubtitle`; neue Menü-/Tab-Stelle: Direktive setzen, Messliste ergänzen.
5. Neue Direktive: Barrel `mt-directives.ts` und `styles/mt/<gruppe>/_index.scss` ergänzen ([directive-model](directive-model.md)); Budget in `angular.json` nicht anheben (Bundle knapp unter der Grenze, Task 23/24).
6. Specs, `e2e/tests/mt-targets.spec.ts` und `e2e/mt-messliste.md` anpassen.
7. Diese Referenzseite im selben Zug korrigieren.

Verwandt: [tokens](tokens.md), [directive-model](directive-model.md), [button](button.md), [surface-and-card](surface-and-card.md), [field](field.md).
