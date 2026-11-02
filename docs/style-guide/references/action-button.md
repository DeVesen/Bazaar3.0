# Action-Button
Stand: Code-Stand Branch feature/312482-mytrumpf-optik-mt-direktiven, Commit 49c125b5 plus Partial-Gruppen (ungecommittet) (2026-10-21)

> Der Action-Button ist ein bewusst **eigener** Button für Aktionen, die direkt in einer Tabellen- oder Listenzeile sitzen (Icon über einem Kurzlabel, 50 px breit). Er ist kein regulärer Button: kleinere Schrift, Light, Ellipsis, eigene Hülle. Reguläre Buttons: [button](button.md).

## Überblick

| Baustein | Klasse | Rolle | Datei |
|---|---|---|---|
| Hülle `app-atlas-action-btn` | - | Komponente mit Verhalten (Tooltip, Disabled-Grund, Zähler, aktiv) | `components/common/atlas-action-btn/` |
| `mtButtonTile` | `mt-button-tile`; Kurzlabel `mt-button-tile-label` | Querschnitt, Form des Action-Buttons; im Template der Hülle gesetzt, nie beim Aufrufer | `directives/mt-button-tile.directive.ts`, `styles/mt/buttons/_mt-button-tile.scss` |
| Verfeinerung am Host | `mtButtonText` | Pflicht beim Aufrufer (Lint `mt/button-refinement`), Standard des Codemods | - |

Wann Action-Button, wann regulärer Button:

| Situation | Baustein |
|---|---|
| Aktion in einer Grid- oder Listenzeile (Like, Dislike, Report, Bilder, "Go to Exp.") | **Action-Button** |
| Aktion in Toolbar, Dialog, Formular, Fußzeile | regulärer Button (`app-atlas-btn` / `matButton` mit Verfeinerung) |
| Nur Icon, ohne Label | `app-atlas-icon-button` (`mtButtonIcon`) |

## Verwendung

```html
<app-atlas-action-btn mtButtonText
  icon="preview"
  label="Sales Report"
  tooltip="Create Sales Report"
  [disabled]="!canOpenSalesReport"
  [disabledTooltip]="salesReportDisabledReason"
  [active]="isActive"
  [badge]="count"
  (clicked)="openSalesReportPreview()" />
```

Regeln:
- Ein neuer Action-Button in einem Grid oder einer Liste nutzt immer die Hülle `app-atlas-action-btn`. Kein eigener `<button class="action-btn">` mit eigenem SCSS und kein regulärer Button, der verkleinert wird.
- Es gibt keine Klasse und keinen Schalter für die Optik: 8 px, Light und Ellipsis gelten für jeden Action-Button.
- `label` bleibt der volle Text (die Ellipsis kürzt nur die Darstellung); `tooltip` ist Pflicht und nennt die ganze Aktion.
- Disabled per `aria-disabled` (der Tooltip mit dem Grund bleibt erreichbar), nicht per `disabled`-Attribut.
- Größen, Schrift und Farbe nie im Komponenten-SCSS der Zeile setzen.

## Zielwerte

Bei Basisschrift 16 px; Werte skalieren mit der Schrift.

| Eigenschaft | Wert | Zustand | Quelle |
|---|---|---|---|
| Breite | 50 px (`min-width` = `max-width` = 50 px) | alle | `atlas-action-btn.component.scss` |
| Höhe | Button-Höhe des Bereichs (in `mtCompact` 32 px) | alle | AC-07; `_mt-compact.scss` |
| Icon | 18 px, liegt direkt über dem Label ohne Lücke | alle | AC-09; Test unten |
| Kurzlabel | 8 px (`font-size-3xs`), Gewicht 300 (`font-weight-light`), Versalien, Zeilenhöhe 1,2 | alle | Auftraggeber-Entscheid (Abweichung) |
| Zeilenhöhe am Wrapper `.mdc-button__label` | 1,2 wie das Label (sonst erbt er 13 px / 39 px und schiebt das Icon aus der Kachel) | alle | `_mt-button-tile.scss` |
| Überlauf | Label als Block, `max-width` 44 px, `overflow: hidden`, Ellipsis ("SALES RE…") | wenn Label zu lang | `atlas-action-btn.component.scss` |
| Inhalt in der Höhe | Icon und Label liegen innerhalb des Buttons | alle | Test unten |
| aktiv | Hintergrund `color-selected` (#C6D4DD) | aktiv | AC-09 |
| deaktiviert | Deckkraft 0,4, Cursor `not-allowed` (`aria-disabled="true"`) | Disabled | AC-09 |
| Zähler | wie Zähler am regulären Button ([button](button.md)), Klasse `mt-button-badge-count` | `badge > 0` | AC-08 |
| Farbe, Hover | wie `mtButtonText` ([button](button.md)) | Ruhe / Hover | AC-05 |

## Aufbau (intern)

- Hülle: `button[matButton mtButton mtButtonBadge mtButtonTile]`, Tooltip (`matTooltip` + `mtTooltip`), `[aria-disabled]`, Zähler als `span.mt-button-badge-count`, Klick bei `disabled` unterdrückt. Eingaben nur Verhalten: `icon`, `label`, `tooltip`, `disabled`, `disabledTooltip`, `active`, `badge`; Ausgabe `clicked`.
- `_mt-button-tile.scss`: `.mt-button-tile.mat-mdc-button-base` setzt `font-weight-light`, für `.mdc-button__label` und `.mt-button-tile-label` `font-size-3xs` und Zeilenhöhe 1,2, dazu `.active` und `[aria-disabled='true']`. Der Wrapper steht in derselben Regel wie das Label, weil Material Schrift und Zeilenhöhe des Buttons dort vererbt.
- `atlas-action-btn.component.scss` (nur Anordnung): Spalte, Breite 50 px, Padding 2 px / 4 px, Label als Block mit `max-width` und Ellipsis. Block ist nötig, weil Material das Label in einen Inline-Wrapper setzt; dort wirken `max-width` und Ellipsis nicht (nach dem Restyling auf `matButton` war die Ellipsis dadurch wirkungslos).
- Tokens: `font-size-3xs`, `font-weight-light`, `color-selected`, `control-height` (laufzeitfähig, wird in `.mt-compact` überschrieben) und die Farben von `mtButtonText`.

Verwendung im Bestand: Aktionsspalte der Such-Ergebnisse (`search-result-row-actions`: Sales Report, Full Report, Param Pics, Go to Exp.), Like/Dislike (`search-result-vote-button`) und Aktionszelle des Dashboards (`experiment-dashboard-actions-cell`: Upload, Download).

In einer Zelle mit eigenem Klick auf die Zeile (Dashboard) trägt der Host der Hülle eine Marker-Klasse (`upload-btn`, `download-btn`), damit `onRowClicked` den Klick nicht als Zeilenklick wertet. Die Zelle setzt `mtCompact` am Container.

## Tests

- Unit: `mt-button-tile.directive.spec.ts`, `atlas-action-btn.component.spec.ts`, `search-result-vote-button.component.spec.ts`, `search-result-row-actions.component.spec.ts`, `experiment-dashboard-actions-cell.component.spec.ts` (Upload/Download rendern, Klick ruft `onUpload`/`onDownload`).
- Browser (`e2e/tests/mt-targets.spec.ts`, erste Zeile der Such-Ergebnisse, Viewport 1600x900):
  - "Action-Button mit Icon direkt über dem Kurzlabel, Inhalt innerhalb der 32 px": Wrapper nicht höher als das Label, Abstand Icon zu Wrapper 0, Inhalt im Button.
  - "Action-Buttons (auch Like/Dislike) mit 8 px Light, Kurzlabel bleibt in der Kachel": 6 Kacheln mit Gewicht 300 und 8 px, Label-Box ragt nicht über die Kachel.
  - "Grid Dashboard: Aktionszelle mit Action-Buttons (Upload, Download) in 8 px Light innerhalb der Zeile" (Mock: Experiment `Finished` mit Upload-/Download-Recht): Labels `Upload`, `Download`, 300/8 px, Button liegt in der Zeile.
- Lint: `app-atlas-action-btn` braucht beim Aufrufer genau eine Verfeinerung (`mt/button-refinement`).

## Abweichungen ggü. Spec/Plan

| Thema | Jetzt (Code) | Spec/Plan | Grund |
|---|---|---|---|
| Schrift des Action-Buttons | 8 px, Light, Ellipsis | AC-02/AC-09: Button-Schrift fett, Kachel-Kurzlabel 10 px | Auftraggeber-Entscheid 2026-10-21: lange Labels ("Sales Report") überlappten in 50 px; Text und Kachelgröße bleiben. Gilt für jeden Action-Button |
| Eigene Seite | Action-Button hat eine eigene Seite, getrennt von [button](button.md) | Spec behandelt die Kachel als Button-Form | Action-Buttons in Grid und Liste sind bewusst besondere Buttons |

## Offene Punkte

- Messliste `e2e/mt-messliste.md`: keine Zeile für den Action-Button, Sichtabnahme steht aus.
- Die Dashboard-Aktionszelle zeigt jetzt sichtbare Labels ("Upload", "Download") statt reiner Icons (Hülle verlangt `label`); Sichtabnahme steht aus.
- Das Label kann bei 50 px abgeschnitten werden ("SALES RE…", "FULL REP…", "PARAM PI…"); gewollt, kein Fehler.

## Ändern: Checkliste

1. Optik des Action-Buttons ändern: Wert in `styles/mt/buttons/_mt-button-tile.scss` über Token (`_mt-tokens.scss`), nicht als Literal; Anordnung (Breite, Ellipsis) in `atlas-action-btn.component.scss`.
2. Neuer Action-Button in Grid oder Liste: Hülle `app-atlas-action-btn` mit `mtButtonText` am Host; nichts weiter.
3. Danach den Browser-Test in `mt-targets.spec.ts` prüfen (Gewicht, Größe, Überlauf) und `dv-angular-build` mit `--show warnings` laufen lassen (Bundle-Budget `styles`, siehe [enforcement](enforcement.md)).
4. Diese Seite im selben Zug korrigieren (Zielwerte, Tabellen, Offene Punkte, Stand-Zeile) und [targets](targets.md) nachziehen.
