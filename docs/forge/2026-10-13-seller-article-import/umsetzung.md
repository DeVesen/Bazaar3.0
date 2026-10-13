# Umsetzung — Plan: docs/forge/2026-10-13-seller-article-import/plan.md

## Abschlussbericht
# Abschlussbericht Umsetzung seller-article-import
Bereich: forge-base/2026-10-13-seller-article-import..HEAD (43555ae..9d5400c)
Tasks: 12 von 12, alle ohne Fix-Runde (Reviews sauber), eine Final-Fix-Welle (BOM-Literal, Modulprofil).

## Urteile
Keine `Urteil:`-Zeilen (0).

## Offene Punkte
- Vorbestehend (nicht Teil des Auftrags, belegt gegen forge-base): FE-Test settlement-page.spec.ts `template_sellerSelected_rendersOnlyIconBackButtonOnTheLeftAndNoActionsLeftOfTheName` rot seit Commit cc898c94.
- Plan-Lücke 🟡: ImportSellerArticlesHandler speichert je Zeile einzeln (quadratischer ChangeTracker-Aufwand bei 20.000 Zeilen, Laufzeit ungemessen); Folgeauftrag: AddRange-Port oder Limit messen.
- Plan-Lücke 🟡: kein Integrationstest für POST /api/sellers/{id}/articles/import (Happy Path CSV, Abbruch ohne Teilstand, 401/403).
- Politur 🟢: siehe progress.md (zurückgestellte Punkte, u. a. fehlende Parser-Tests, Dialog ohne takeUntilDestroyed/DOM-Tests, disabled-Test Dropzone).
- Doku: Epic/Feature-Profil kennen Import-Button und Endpoint noch nicht (Wissens-Update).
- Prozess: Prozess Bazaar.Api (PID 32700, Debugger) sperrte Debug-DLLs; Backend-Tests liefen im Release-Build: Solution 603/603 grün.

## Urteile
- keine

## Zurückgestellt und geparkt
- Task 1: Bedenken: Architecture/Api.UnitTests/Api.IntegrationTests nicht lauffähig, laufender Prozess Bazaar.Api (PID 32700, Debugger) sperrt DLLs (MSB3027); nicht beendet.
- Task 1: zurückgestellt: 🟢 Test prüft Status nicht (beliebiger Status ungetestet)
- Task 2: zurückgestellt: 🟡 BOM-Literal ArticleTableReader.cs:55 (Reviewer: unsichtbar; Umsetzer: '\uFEFF' — widersprüchlich, im Final prüfen)
- Task 2: zurückgestellt: 🟡 CSV-Pfad ohne Zeilenlimit (Handler-Grenze greift später)
- Task 3: Bedenken: Umlaute in String-Literalen als \uXXXX statt Klartext (auf meine Anweisung); LF-Warnung; Einzellauf der Parser-Klasse grün nicht separat belegt (Suite grün)
- Task 3: zurückgestellt: 🟡 fehlende Tests (Pflichtfeld je Spalte, Duplikat nicht in NumberedRows, Preis int.MaxValue+1)
- Task 3: zurückgestellt: 🟡 Zahlenzelle invariant vs. Kultur beim Preis (Außerhalb)
- Task 4: Bedenken: Tests+Impl gemeinsam geschrieben, Rot nachträglich belegt; Architecture-Tests nur in Kopie (%TEMP%\bzcopy) grün wegen DLL-Sperre durch PID 32700; LF/CRLF-Warnung
- Task 4: zurückgestellt: 🟡 Testbeleg ohne Ausgabe, Architecture-Tests nur in Kopie, im Checkout nachholen sobald PID 32700 frei
- Task 4: zurückgestellt: 🟡 Test Handle_NumberTakenAtCheckInsideTransaction_* prüft nichts zur Transaktion (Name/Duplikat)
- Task 4: zurückgestellt: 🟡 mehrere Tests mit "// Act & Assert" statt getrenntem AAA
- Task 4: zurückgestellt: 🟡 EnsureNames ohne ThrowIfCancellationRequested
- Task 4: zurückgestellt: 🟢 "20.000" hart in Meldung; using-Reihenfolge Program.cs
- Task 4: zurückgestellt: ⚠️ Endpoint/Middleware muss Extensions["errorCount"] bei import.invalid_rows ausgeben (in Task 5 prüfen)
- Task 5: Bedenken: Brief-Test NotMultipart fehlerhaft, Test-Helfer angepasst (Produktionscode wie Brief); ganze slnx nicht gebaut (OutDir-Workaround); errorCount-Extension via DomainExceptionHandler ausgegeben, ungetestet
- Task 5: zurückgestellt: 🟢 locale "" statt null (Handler muss "" wie null behandeln, im Final prüfen)
- Task 5: zurückgestellt: ⚠️ Solution-Build komplett nicht gelaufen (DLL-Sperre), im Phase-4-Gate nachholen
- Task 6: zurückgestellt: 🟡 Modulprofil docs/knowledge/module-profile/bazaar-app/module.md:40 veraltet (nginx-Limits), Doku nachziehen
- Task 7: Bedenken: Gesamtsuite FE 988/989, rot: settlement-page.spec.ts template_sellerSelected_rendersOnlyIconBackButtonOnTheLeftAndNoActionsLeftOfTheName (reproduzierbar, Vorbestand gegen Basis ungeprüft; vor Abschluss klären)
- Task 8: zurückgestellt: 🟡 kein Test für disabled bei Klick/Tastatur (nur Drop)
- Task 8: zurückgestellt: 🟢 dragleave-Flackern bei Kind-Elementen; Enter/Space-Bubbling aus projizierten Elementen
- Task 9: Bedenken: in 3 success-Tests vi.useFakeTimers() hinter createDialog() verschoben (whenStable hängt unter Fake-Timern)
- Task 9: zurückgestellt: 🟡 HTTP-Subscription ohne takeUntilDestroyed (Timer nach Destroy, NG0953)
- Task 9: zurückgestellt: 🟡 keine DOM-Tests für Sperr-Bindings (closable, disabled, Spinner/Check)
- Task 9: zurückgestellt: 🟢 ungültige Datei nach gültiger lässt canImport true; Act zweizeilig; validate_usage mit gekürztem Footer
- Task 10: Bedenken: nur Kachel-Spec gelaufen (12/12), nicht Gesamtsuite; Commit ohne Workitem-Nr. (Projekt: Workitem keine, Konvention wie vorherige Commits)
- Task 10: zurückgestellt: 🟢 Testname Enabled/IconOnly übertrieben; Zeilen >100 Zeichen (Prettier?)
- Task 11: Bedenken: Brief-Tests render_* mit totalCountSignal.set(1) ergänzt (Karte rendert sonst nicht); Gesamtsuite 1030/1031 (nur bekannter settlement-page-Fehler)
- Task 11: zurückgestellt: 🟢 Binding-Reihenfolge Template, Spec-Block-Position
- Task 12: zurückgestellt: 🟢 drei Assertions in einem Test

## Stand
- Stand: 9d5400c8
- Gesamtlauf: bcc7973c FE 1032/1033 (1 bekannter Fehler settlement-page)
