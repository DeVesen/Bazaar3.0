# Umsetzung — Plan: docs/forge/2026-10-18-auswahlliste-sortierung/plan.md

## Abschlussbericht
# Abschlussbericht Umsetzung

Bereich: `forge-base/2026-10-18-auswahlliste-sortierung..HEAD` (4749cac2, db94f63e, 067def09, 8fc93334, e24c6426)
Tasks: 5 von 5 fertig, Task-Reviews sauber, Final-Review sauber (Übergabe: ja).

## Urteile
- Vorab-Scan: 5 offene Consumes-Zeilen als ok eingestuft (verweisen auf Bestandscode oder Task-1-Zusicherung); Glossar-Eintrag „Auswahlliste“ liegt nur uncommittet im Haupt-Checkout und fehlt im Worktree, wird laut Plan nicht angefasst — Kosten falls falsch: Glossar-Eintrag muss separat committet werden.
- Task 2 ⚠️ „kein Ausgabe-Beleg zum Testlauf“ keine Lücke (Befehl und 57/57 grün im Bericht) — Kosten falls falsch: roter Test fiele erst im Final-Review/Abschlusslauf auf.
- Task 3 ⚠️ „Testlauf nur im Bericht belegt“ keine Lücke (7/7 und 1225/1225 grün im Bericht) — Kosten falls falsch: wie oben.
- Task 5 ⚠️ „component.md-Aussage hängt an Task 1“ keine Lücke (OrderBy und Test sind committet) — Kosten falls falsch: Doku-Aussage ungenau.

## Basis
Test-Befehl in der Projekt-Config leer, Basis-rot nicht ermittelt.

## Zurückgestellte Punkte (Review-Hinweise, alle 🟡/🟢)
- 🟡 Frontend-Absicherungstests (Task 2, 3) nutzen aufsteigende Server-Daten, verhindern eine spätere eigene Frontend-Sortierung nicht (Daten laut Plan vorgeschrieben; Final-Review: bleibt).
- 🟡 Ein Test mit zwei `expect` (Task 2, AC-06).
- 🟢 Arrange-Duplikat in Task-1-Tests; doppelte Leerzeile; lange Zeile in seller-detail-modal.spec.ts; Testname settlement-page.spec.ts:31 außerhalb Schema; AC-09-Test schwach; sellers.md §6 Nutzer-Satz.
- 🟢 (Final-Review) Port-Kommentar `IArticlesBySellerQuery` spricht noch von „Placeholder port“, vor dieser Umsetzung veraltet.

## Offene Punkte
Keine tragenden. Nicht gepusht.

## Urteile
- Urteil: Task 2 ⚠️ „kein Ausgabe-Beleg zum Testlauf“ keine Lücke — Bericht nennt Befehl und Ergebnis (57/57 grün), Diff reine Spec-Ergänzung — Kosten falls falsch: roter Test fiele erst im Gesamtlauf/Final-Review auf
- Urteil: Task 3 ⚠️ „Testlauf nur im Bericht belegt“ keine Lücke — Bericht nennt Befehl, 7/7 und Gesamtsuite 1225/1225 grün — Kosten falls falsch: roter Test fiele im Final-Review/Abschlusslauf auf
- Urteil: Task 5 ⚠️ „component.md-Aussage hängt an Task 1 und Absicherungstest“ keine Lücke — Task 1 (OrderBy, 4749cac2) und Test (db94f63e) sind committet und fertig-gebucht — Kosten falls falsch: Doku-Aussage ungenau

## Zurückgestellt und geparkt
- Task 1: zurückgestellt: 🟢 Arrange-Blöcke der zwei neuen Tests fast identisch (Brief schreibt es vor)
- Task 2: zurückgestellt: 🟡 Tests nutzen bereits sortierte Server-Daten, verhindern keine eigene Frontend-Sortierung (Daten laut Brief vorgeschrieben)
- Task 2: zurückgestellt: 🟡 ein Test mit zwei expect (Brief schreibt es vor)
- Task 2: zurückgestellt: 🟢 doppelte Leerzeile am Blockende
- Task 3: zurückgestellt: 🟡 Test mit aufsteigender Eingabe verhindert keine spätere Frontend-Sortierung (Eingabe laut Plan vorgeschrieben)
- Task 3: zurückgestellt: 🟢 sehr lange Zeile in spec.ts:46 (Prettier)
- Task 4: zurückgestellt: 🟢 Testname settlement-page.spec.ts:31 folgt nicht dem Schema (Brief schreibt Namen vor)
- Task 4: zurückgestellt: 🟢 AC-09-Test nah am Vorgänger, belegt schwach (vom Brief verlangt)
- Task 5: zurückgestellt: 🟢 sellers.md §6 nennt Abrechnungs-Ansicht als Nutzer, neuer Satz erwähnt nur Detail-Modal und Auswahlliste (plan-vorgeschrieben, harmlos)

## Stand
- Stand: e24c6426
- Gesamtlauf: 8fc93334 grün (Frontend 1227 Tests)
