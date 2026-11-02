# ATLAS Style-Guide (MyTRUMPF-Optik)

Stand: Code-Stand Branch `feature/312482-mytrumpf-optik-mt-direktiven`, Commit `51a253e3` plus verschlanktes Theme (ungecommittet) (2026-10-21), Workitem 312482.

Diese Referenz beschreibt die Oberfläche von ATLAS **je Element** (Button, Feld, Karte, Grid, ...): was es ist, wie man es im Template benutzt, welche Zielwerte gelten, wie es intern gebaut ist, welche Prüfungen es absichern und wie man es ändert. Sie vereint Spec, Plan und den tatsächlichen Code-Stand inklusive aller Korrekturen aus Umsetzung und Reviews. Wo Quellen sich widersprechen, gilt der **Code**; die Abweichung steht auf der jeweiligen Seite.

## Pflegeregel (verbindlich)

Wer an Optik, Direktiven, Partials, Tokens, Hüllen, Lint- oder Stylelint-Regeln etwas ändert, **korrigiert im selben Zug die betroffene Referenzseite**:

1. Abschnitt der Seite anpassen (Überblick, Zielwerte, Aufbau, Tests).
2. Den Abschnitt „Abweichungen ggü. Spec/Plan" nachziehen, wenn der Code jetzt von Spec oder Plan abweicht, mit Grund.
3. Erledigte Punkte aus „Offene Punkte" streichen, neue eintragen; die Gesamtsicht steht in [corrections-and-open-points](references/corrections-and-open-points.md).
4. Zielwerte und Prüfart in [targets](references/targets.md) nachziehen.
5. Die `Stand:`-Zeile der geänderten Seiten auf Branch, Commit und Datum setzen.

Ein Element ohne passende Seite bekommt eine neue Seite nach der Vorlage unten und einen Eintrag im Index.

## Grundprinzipien

- **Baukasten aus kleinen Attribut-Direktiven.** Eine Direktive `mt<Baustein>` sitzt als Attribut an einem Material-Element, setzt ihre Klasse `mt-...` und die Material-Voreinstellungen. Verhalten von Material (Panels, Validierung, Formularanbindung) bleibt unverändert. Details: [directive-model](references/directive-model.md).
- **Basis, Verfeinerung, Querschnitt.** Eine Verfeinerung (`mtButtonPrimary`) schließt ihre Basis (`mtButton`) per `hostDirectives` ein; im Template steht nur die Verfeinerung, beides zusammen meldet der Lint. Querschnitts-Direktiven (`mtSurface`, `mtRole`, `mtCompact`, `mtReadonly`, `mtUnit`, `mtButtonIcon`, `mtButtonBadge`, `mtInputAction`) haben keine Basis und kombinieren sich mit einer Verfeinerung.
- **Optik steht zentral.** Je Direktive ein Partial unter `src/frontend/src/styles/mt/<gruppe>/` (höchstens 2 kB; Gruppen `foundation`, `buttons`, `forms`, `cards`, `overlays`, `navigation`, `grid`, je mit eigenem `_index.scss`), alle Werte als Tokens `--mt-*` aus `src/frontend/src/styles/_mt-tokens.scss`. Komponenten-Stylesheets setzen nur Anordnung und Abstände, keine Farbe, keinen Schatten, keinen Radius, keine Schrift, keine Bausteinhöhe. [tokens](references/tokens.md)
- **Hüllen bleiben, weil sie Verhalten tragen.** `atlas-*`-Komponenten haben keine Eingaben für Variante, Farbe, Zusatzklasse, Inline-Stil oder Erscheinungsbild mehr. Der Aufrufer setzt die Verfeinerung am Host (`<app-atlas-btn mtButtonPrimary>`), Layout-Klassen per `class` am Host.
- **Zwei Höhen.** Bausteine sind 44 px hoch, im Bereich mit `mtCompact` 32 px. [compact-and-unit](references/compact-and-unit.md)
- **Eine Palette für Status und Rollen:** Info `#285172`, Erfolg `#BBD03A`, Warnung `#FF9032`, Fehler `#FF0201`, neutral `#A1A1A1`. Die Score-Farben der Bewertungsnoten bleiben unverändert. [tag-and-role](references/tag-and-role.md)
- **Nur Bytes, die wirken.** Kein Override, das Materials Vorgabe wiederholt, keine ungelesene Variable, kein Token, Mixin oder Selektor-Zweig auf Vorrat, gemeinsame Werte einmal ausgeben (Selektorliste oder `@extend`). [enforcement](references/enforcement.md#bytes-sparen-was-nicht-ins-css-gehört)
- **Maschinell abgesichert.** ESLint-Regeln, Lint-Gate, Stylelint, Budgets und Node-/Browser-Tests, alle auf Fehler. [enforcement](references/enforcement.md)
- **Zielwerte gelten bei Basisschrift 16 px** und skalieren proportional (bei 720 px Fensterhöhe 13/16). [typography](references/typography.md)

## Was will ich? Welche Seite?

| Aufgabe | Seite |
|---|---|
| Button einbauen oder ändern (Primär, Sekundär, Text, Löschen, Icon, Zähler) | [button](references/button.md) |
| Aktion in einer Grid- oder Listenzeile (Action-Button: Icon über Kurzlabel) | [action-button](references/action-button.md) |
| Formularfeld einbauen (Label, Hinweis, Fehler, Schreibschutz) | [field](references/field.md) |
| Eingabe, Zahl, Textfeld, Aktion im Feld | [input](references/input.md) |
| Auswahl, Mehrfachauswahl, Autovervollständigung | [select](references/select.md) |
| Min/Max-Bereich, Datumsfeld | [range-and-datepicker](references/range-and-datepicker.md) |
| Checkbox, Radio, Schalter | [choice-controls](references/choice-controls.md) |
| Karte, Kartenfläche | [surface-and-card](references/surface-and-card.md) |
| Aufklappbares Panel | [panel](references/panel.md) |
| Dialog öffnen oder neu bauen | [dialog](references/dialog.md) |
| Menü, Tooltip | [menu-and-tooltip](references/menu-and-tooltip.md) |
| Snackbar-Meldung | [snackbar](references/snackbar.md) |
| Wizard-Tabs, linkes Menü | [tabs-and-nav](references/tabs-and-nav.md) |
| Tabelle (AG Grid), Zell-Editor, Score-Zellen | [grid](references/grid.md) |
| Status-Tag, Rollenfarbe, Erfolgs-/Fehlertext | [tag-and-role](references/tag-and-role.md) |
| Dichte (32 px), Einheiten in Labels | [compact-and-unit](references/compact-and-unit.md) |
| Seitenhintergrund, Layout, Lade-Platzhalter | [page-and-layout](references/page-and-layout.md) |
| Schrift, Größen, Titel | [typography](references/typography.md) |
| Farbe, Schatten, Radius, Maß ändern | [tokens](references/tokens.md) |
| Neue Direktive oder Verfeinerung anlegen | [directive-model](references/directive-model.md) |
| Lint, Stylelint, Budget, Codemods, Tests | [enforcement](references/enforcement.md) |
| Zielwerte nachschlagen, Prüfart | [targets](references/targets.md) |
| Was wich von Spec/Plan ab, was ist offen | [corrections-and-open-points](references/corrections-and-open-points.md) |

## Index

**Grundlagen**
- [directive-model](references/directive-model.md): Baukasten-Modell, Namensschema, Ablage, Hüllen, neue Direktive anlegen, Tabelle aller Direktiven
- [tokens](references/tokens.md): Token-System, alle Tokens, zentrale Änderung
- [typography](references/typography.md): Roboto 300/700, Skalierung, Titel
- [page-and-layout](references/page-and-layout.md): Seitenfläche, globale Stylesheets, Lade-Platzhalter, Resets

**Elemente**
- [button](references/button.md), [action-button](references/action-button.md), [field](references/field.md), [input](references/input.md), [select](references/select.md), [range-and-datepicker](references/range-and-datepicker.md), [choice-controls](references/choice-controls.md)
- [surface-and-card](references/surface-and-card.md), [panel](references/panel.md), [dialog](references/dialog.md), [menu-and-tooltip](references/menu-and-tooltip.md), [snackbar](references/snackbar.md)
- [tabs-and-nav](references/tabs-and-nav.md), [grid](references/grid.md), [tag-and-role](references/tag-and-role.md), [compact-and-unit](references/compact-and-unit.md)

**Absicherung und Gedächtnis**
- [enforcement](references/enforcement.md), [targets](references/targets.md), [corrections-and-open-points](references/corrections-and-open-points.md)

## Änderung durchführen (Ablauf)

1. Betroffene Elementseite und [directive-model](references/directive-model.md) lesen; Abschnitt „Ändern: Checkliste" der Seite befolgen.
2. Test zuerst: Unit-Spec der Direktive bzw. Browser-Messtest anpassen oder ergänzen und rot sehen.
3. Wert zentral ändern (Token oder Partial), nie in einer Komponente. Material-Werte zuerst über die Override-Mixins, aber nur Werte, die von Materials Vorgabe abweichen; eigenes CSS nur wo es keinen passenden Wert gibt; `!important` nur mit Kommentar, der den Grund nennt.
4. Prüfen (Befehle und Hinweise zur Umgebung in [enforcement](references/enforcement.md)): Unit-Tests, Stylelint, ESLint mit Lint-Gate, Production-Build ohne neue Budget-Meldung (das globale Stylesheet liegt bei 24,31 kB: rund 3 kB bis zur Warnung bei 27 320 B, 7,2 kB bis zur Fehlergrenze bei 31 522 B; das Budget wird nicht angehoben), Browser-Messtests.
5. Referenz nach der Pflegeregel oben korrigieren.

## Vorlage einer Elementseite

Überblick (Tabelle), Verwendung (Template-Beispiele und typische Lint-Fehler), Zielwerte (mit AC-ID), Aufbau intern (Direktive, Partial, Tokens), Hüllen-Komponenten, Tests, Abweichungen ggü. Spec/Plan, Offene Punkte, Ändern: Checkliste. Kopfzeile jeder Seite: `# <Element>` und die `Stand:`-Zeile.

## Offene Punkte (Gesamtsicht)

Die vollständige, nach Element gruppierte Liste steht in [corrections-and-open-points](references/corrections-and-open-points.md). Die wichtigsten:

- Sichtabnahme gegen die Referenzbilder und die Handliste `src/frontend/e2e/mt-messliste.md` (Spalten Ist/ok leer) stehen aus.
- Das globale Stylesheet-Bundle liegt nach der Verschlankung bei 24,31 kB, rund 3 kB unter der +30 %-Warnschwelle und 7,2 kB unter der Fehlergrenze; neue Bytes nur nach den Regeln in [enforcement](references/enforcement.md#bytes-sparen-was-nicht-ins-css-gehört).
- Icon-Buttons in `mat-option` (24 px) und `mat-button-toggle` (ohne Direktive) sind Lücken in Spec und Plan.

## Herkunft

- Spec: `docs/specs/312482-mytrumpf-optik-mt-direktiven.md` (Zielwerte `AC-01` bis `AC-66`)
- Plan: `docs/plans/312482-mytrumpf-optik-mt-direktiven.md`
- Umsetzungsbericht: `docs/plans/312482-mytrumpf-optik-mt-direktiven-umsetzung.md`
- Glossar: `docs/application/glossary/frontend-terms.md`, Modulprofil: `docs/application/modules/trumpf-frontend/module.md`

## Spätere Verwendung als Projekt-Skill

Die Struktur ist so gewählt, dass ein lokaler Skill nur Prinzipien, die Tabelle „Was will ich? Welche Seite?" und die Pflegeregel enthalten muss und die Seiten unter `references/` bei Bedarf nachlädt (eine Seite je Aufgabe).
