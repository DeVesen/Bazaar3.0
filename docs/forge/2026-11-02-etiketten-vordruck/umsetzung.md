# Umsetzung — Plan: docs/forge/2026-11-02-etiketten-vordruck/plan.md

## Abschlussbericht
# Abschlussbericht Umsetzung 2026-11-02-etiketten-vordruck
Bereich: forge-base/2026-11-02-etiketten-vordruck..HEAD (ab8c5ece), 13 von 13 Tasks fertig, Task-Reviews freigegeben, Final-Review `mit-korrekturen` (0 🔴, 0 beheben).
Gesamtlauf: Test in der Projekt-Konfiguration leer, kein verify-run-Lauf; Umsetzer meldeten je Task grüne Suiten (Backend, Frontend 1531 Tests, Lint).
Offene Punkte:
- 🟡 label-sheet.scss:24 graue übersprungene Plätze erscheinen auch im Druck (Planfehler Task 8); Fix: nur in Vorschau + Test.
- 🟡 5000 Etiketten rendern sehr viele DOM-Knoten, nicht gemessen.
- 🟢 BSHELL-S03-routing-skeleton.md: Route /blank-labels fehlt.
- 🟢 Concurrency-Rennen Löschen/Überschreiben → 500 statt 404.
Urteile: siehe progress.md (Obergrenzen 10000 mm / 1000, Final-Review ohne Fixer).

## Urteile
- Urteil: ⚠️ aus Task 2 (EF-Mapping/JSON-Konverter, Validator vor ArgumentException) — liegen in Task 3/6 laut Plan, dort Kontext mitgeben — falls falsch: 500 statt 400 bei Fehlern
- Urteil: Task 4 Validator-Obergrenzen (Maße ≤10000 mm, Spalten/Zeilen 1..1000) über Brief hinaus behalten — verhindert decimal-Overflow/500, aus Task-1-Review gefordert — falls falsch: unnötige Einschränkung; Frontend (Task 10) muss Grenzen spiegeln, sonst 400
- Urteil: Final-Review URTEIL mit-korrekturen bei 0 🔴/0 beheben — kein Fixer (Liste leer), 🟡 (graue Platzhalter im Druck, 5000-Etiketten-Rendering) und 🟢 (BSHELL-S03-Route) im Abschlussbericht — falls falsch: graue Plätze werden gedruckt

## Zurückgestellt und geparkt
- Task 1: zurückgestellt: Tests nutzen ThrowsAny<ArgumentException> statt exaktem Typ
- Task 1: zurückgestellt: kein Test für GapHorizontal/GapVertical in der Passformel
- Task 1: zurückgestellt: OverflowException bei extremen decimal-Werten, Obergrenzen in späterer Validierung (Task 4/6)
- Task 2: zurückgestellt: leere Bild-Nutzlast (0 Byte) gilt als gültig in LabelGraphic.IsValid
- Task 2: zurückgestellt: Tests prüfen nur ArgumentException, nicht den Typ
- Task 3: Bedenken: Postgres-Unique-Violation-Pfad nur per Docker-Integrationstest abdeckbar; EF-Migrationsdateien CRLF→LF durch gitattributes
- Task 3: zurückgestellt: Unique-Violation-Pfad in LabelSheetFormatRepository.Add ungetestet, Abdeckung per Integrationstest in Task 6
- Task 3: zurückgestellt: gleichzeitiges Erst-Add der LabelPrintDefaults kann PK-Verletzung (500) auslösen, Task 5 bedenken
- Task 4: Bedenken: Race bei Overwrite=true: anderer Admin legt Namen gleichzeitig neu an → 409 statt Überschreiben (selten)
- Task 4: zurückgestellt: Grenzwerte (Columns/Rows 1001, genau 1000/10000) ungetestet
- Task 4: zurückgestellt: Obergrenzen nicht in Spec, Frontend-Prüfregeln (Task 10) spiegeln
- Task 5: zurückgestellt: Validator-Tests ohne ungültiges SellerSymbol, SVG, Größengrenze
- Task 5: zurückgestellt: paralleles Erst-Add des Singletons → PK-Verletzung (500), nur Admin, selten
- Task 6: zurückgestellt: kein Integrationstest für DELETE unbekannte id (404), Sortierung nach Name, PUT ungültiges Währungssymbol
- Task 6: zurückgestellt: Bericht nennt 11 statt 10 Tests; Nginx-Testbeschreibung nennt nur Artikel-Import
- Task 7: zurückgestellt: fitsSheetWidth ohne positiven Testfall (label-geometry.spec.ts)
- Task 8: zurückgestellt: Specs label-card/label-sheet mit mehreren Asserts je Test, Act+Arrange kombiniert (plan-vorgeschrieben)
- Task 10: zurückgestellt: loadFormats im Store verschluckt Fehler (Liste []), Task 12 soll Ladefehler anzeigen
- Task 10: zurückgestellt: kein Store-Test für saveFormat-Fehlerpfad
- Task 11: Bedenken: graphic-picker 'Keins'-Button Text als Inhalt statt label-Attribut (Lint elements-content)
- Task 11: zurückgestellt: kein Test für formatSelected/nameChange/remove in sheet-format-form
- Task 11: zurückgestellt: graphic-picker-Spec ohne Test für ausgewählten Zustand
- Task 12: Bedenken: loadFormats-Ladefehler wird nicht angezeigt (Brief ohne Behandlung); Fehlerfarbe dupliziert
- Task 12: zurückgestellt: loadDefaults überschreibt asynchron bereits geänderte Eingaben (Logo/Symbol/Währung)
- Task 13: Bedenken: bazaar-infrastructure/module.md nennt veraltet '6 migrations' (real 15), nicht im Brief
- Task 13: zurückgestellt: bazaar-infrastructure/module.md nennt veraltet '6 migrations' (vorbestehend, außerhalb Scope)

## Stand
- Stand: ab8c5ece
- Gesamtlauf: keiner

## Kennzahlen
- Tasks fertig: 13/13
- Fix-Runden: 0
- Urteile: 3
- Geparkt: 0
- Zurückgestellt: 21
- TDD ok task 1
- TDD ok task 2
- TDD ok task 3
- TDD ok task 4
- TDD ok task 5
- TDD ok task 6
- TDD ok task 7
- TDD ok task 8
- TDD ok task 9
- TDD ok task 10
- TDD ok task 11
- TDD ok task 12
- TDD fehlt-test task 13
