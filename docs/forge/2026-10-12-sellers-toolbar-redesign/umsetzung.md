# Umsetzung — Plan: docs/forge/2026-10-12-sellers-toolbar-redesign/plan.md

## Abschlussbericht
# Abschlussbericht — sellers-toolbar-redesign

Bereich: `forge-base/2026-10-12-sellers-toolbar-redesign..HEAD` (67e5dc1..a002618), 3 Tasks, 3 Commits.

- 1882e8c feat: Filterleiste Verkäuferseite als gerahmte Leiste
- f7b314e feat: Leere-Ansicht verweist auf +-Button
- a002618 test: Absicherung Sortierung und Filter-Chips

## Urteile
Keine `Urteil:`-Zeilen (0).

## Offene Punkte
1. 🟡 Doku: `docs/requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md` (Z. 51, 253) und `docs/components/filter-panel/component.md` (Z. 84, 93, 112, 120) beschreiben weiter den Button „+ Neu" rechts. Der Plan enthält keinen Doku-Task; Nachzug bzw. Verankerung offen.
2. 🟡 Sichtprüfung AC-07 (Select wächst, Text nicht gekürzt) und AC-11 (keine waagerechte Bildlaufleiste) im Dev-Server (Desktop und Mobile, Sortierung „Angenommener Warenwert") nicht gelaufen (Login/Backend nötig). Nur auf Regel-Ebene belegt.
3. Hinweis: Task-Umsetzer sahen Kaltstart-Timeouts (5000 ms) in Suite-Läufen; Wiederholung grün, Final-Review sieht Ursache im Environment-Start.
4. Hinweis: `CLAUDE.md` im Haupt-Checkout wurde um `## dv-forge` / `- Worktree: ja` ergänzt (uncommittet, nicht im Feature-Branch).

## Urteile
- keine

## Zurückgestellt und geparkt
- Task 1: Bedenken: Grün-Läufe 1-2 mit 5000-ms-Timeouts (Kaltstart), Lauf 3 grün; Sichtprüfung im Dev-Server nicht möglich (Login/Backend); npm ci im Worktree (gitignored)
- Task 1: zurückgestellt: 🟡 mögliche Flakiness (Kaltstart-Timeouts 5000 ms) — Final-Review entscheidet; 🟢 leere Arrange/Act-Kommentare (Plan-Vorgabe)
- Task 2: zurückgestellt: 🟢 Test hängt an Schreibweise +-Button im Template
- Task 3: zurückgestellt: 🟡 template_noFilterActive_rendersNoChips prüft nur Abwesenheit (schwach, Mutation brach ihn nicht); 🟢 Platzhalterwert acceptedValue

## Stand
- Stand: a0026185
- Gesamtlauf: a002618 grün (857 Tests; Spec-Datei 31/31 im Final-Review)

## Nachtrag Review-Followup: Sichtprüfung AC-07 / AC-11 (offen)

Stand: **nicht durchgeführt, ausdrücklich offener manueller Prüfschritt.** Im Dev-Server ist die Verkäuferseite ohne Login und Backend nicht erreichbar; eine Sichtprüfung war in dieser Umsetzung daher nicht möglich. Belegt ist nur die Regel-Ebene (Test `styles_pageOpened_searchGrowsSelectsKeepMinWidthAndToolbarWraps`: `min-width`, `flex-grow`, `flex-shrink`, `flex-wrap`). Das Wachsen des Auswahlfelds und der ungekürzte Text (AC-07) sowie das Fehlen einer waagerechten Bildlaufleiste (AC-11) sind **nicht** belegt.

Manuell zu prüfen (Desktop und Mobil, z. B. 1280 px und 375 px Breite):
1. Sortierung „Angenommener Warenwert" wählen: Das Auswahlfeld wird breiter als 150 px und zeigt den Text ohne Ellipsis.
2. Dasselbe für den längsten Status-Eintrag.
3. Bei schmalem Fenster bricht die Leiste um, keine waagerechte Bildlaufleiste.

Falls der Text gekürzt wird: In `sellers-page.scss` die Breite des Select-Elements auf `fit-content` bzw. `width: auto` setzen und das innere Label ohne Ellipsis darstellen. Diese Stiländerung ist bewusst noch nicht umgesetzt, weil sie ohne Sichtprüfung ungeprüft wäre.

Ergebnis der Prüfung: _ausstehend_ (Datum, Prüfer, Befund hier eintragen).
