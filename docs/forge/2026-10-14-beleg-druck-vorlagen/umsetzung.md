# Umsetzung — Plan: docs/forge/2026-10-14-beleg-druck-vorlagen/plan.md

## Abschlussbericht
# Abschluss Umsetzung 2026-10-14-beleg-druck-vorlagen

Bereich: forge-base/2026-10-14-beleg-druck-vorlagen..HEAD (2808876..bad55bf), 12 Tasks, 1 Fix-Runde (Task 10), 1 Final-Fix-Welle.

## Urteile
- Task 6 und 10 mit opus statt sonnet reviewt (security- bzw. umfangsheikel) — kostet nur Tokens.
- Task 10: Kontext-Hinweis „Status in toPrintArticles einschränken" war falsch (wirkungslos, ohne Test); Fix-Runde 1 hat ihn zurückgenommen — kostete eine Runde.
- Plan-Abweichung Task 1: Repository-Test mit SQLite in-memory statt EF InMemory (InMemory kann Complex Properties nicht lesen) — begründet.
- Vorab-Scan: 8 offene Zeilen als ok beurteilt (siehe Ledger).

## Offene Punkte
- Manuelle Druckabnahme (Desktop Chrome/Edge „Als PDF", Mobilgerät): 1 Artikel, 80 Artikel, langer Freitext 3; QR-Höhe im Verkäufer-Block ist knapp (~31 von 32 mm).
- Angular-Build-Warnung Initial-Bundle 795,70 kB > Budget 500 kB; Herkunft nicht gegen Basis geprüft (Final-Reviewer: vermutlich vorher vorhanden).
- Formular „Freitexte" bleibt nach Ladefehler ohne Retry gesperrt (🟡).
- Roadmap Round-23/24 verlinken gelöschte Komponenten-Dokus (🟡).
- Kein Endpoint-Integrationstest für /api/settings/print-texts (🟡, Folge-Ticket empfohlen).
- Weitere zurückgestellte 🟡/🟢 siehe Ledger-Auszug.

## Urteile
- Urteil: Task-6-Review mit opus statt sonnet — HTML-Rendering aus Nutzertext ist security-heikel (Modellwahl-Regel) — kostet nur Tokens
- Urteil: Task-10-Review mit opus — großer, schnittstellenübergreifender Diff (Modellwahl-Regel) — kostet nur Tokens
- Urteil: Kontext-Hinweis „Status in toPrintArticles einschränken“ war falsch (wirkungslos, ohne Test) — Fix-Runde 1 hat ihn zurückgenommen — kostet eine Runde; unbekannter Status fällt weiter still aus groupArticles (🟡 aus Task 8 bleibt offen)

## Zurückgestellt und geparkt
- Task 1: Bedenken: EF InMemory kann Complex Properties nicht lesen; Repository-Test nutzt SQLite in-memory (Abweichung vom Brief, Folge für Task 2/3)
- Task 1: zurückgestellt: 🟡 UpdatePrintTexts(null-Satz) ungetestet; 🟢 Kommentar Arrange & Act
- Task 2: zurückgestellt: 🟡 Validator-Tests nur Text3/Abgabe; 🟡 kein Endpoint-Integrationstest
- Task 3: zurückgestellt: 🟢 Endpoint-Mapping ohne eigenen Test
- Task 4: zurückgestellt: 🟢 URL-Literal doppelt; 🟢 Test prüft zwei Dinge
- Task 5: zurückgestellt: 🟡 print-texts-form: Speichern nach Ladefehler/vor Laden überschreibt Freitexte mit leeren Strings (kein loaded-Gate) — Final-Review entscheidet; 🟢 fieldsets.forEach ohne Mindestanzahl
- Task 6: zurückgestellt: 🟡 Bild-Test prüft Alt-Text nicht; 🟡 Rohausgabe Testlauf fehlt im Bericht; 🟢 npm audit marked; 🟢 Arrange&Act-Kommentare
- Task 7: zurückgestellt: 🟢 PX_PER_MM ohne Test
- Task 8: Bedenken: Abweichung vom Brief: plain() im Spec nutzt String.fromCharCode(160) statt NBSP-Regex-Literal (ESLint no-irregular-whitespace), gleiche Semantik
- Task 8: zurückgestellt: 🟡 formatCurrency/formatPercent dupliziert (plan-vorgeschrieben); 🟡 status:string — unbekannter Status fällt still aus groupArticles (Mapping in Task 10 auf PrintArticleStatus einschränken); 🟡 keine Tests für Prozent-Nachkommastellen/Rundung; 🟢 lange Zeile
- Task 9: Bedenken: QR-Block (~34mm) passt evtl. nicht in sellerBlockMm=36 bei overflow:hidden — jsdom kann es nicht prüfen, Sichtprüfung im Druck nötig
- Task 9: zurückgestellt: 🟡 Kachel-Markup doppelt; 🟡 Gruppenzeilen (Status-Gruppen) ungetestet; 🟡 schwacher Messungs-Test; 🟢 !important; 🟢 QR-Größe als Literal
- Task 10: Bedenken: Abweichungen — toPrintArticles filtert unbekannte Status; MessageService-Stub in intake-wizard.spec/intake-page.spec ergänzt; � statt NBSP; Build-Warnung nicht untersucht
- Task 10: zurückgestellt: 🟡 Build-Warnung (1) nicht zugeordnet; 🟡 kein Test für Fehler von printTextsApi.get()/getSettlement; 🟡 Status-Vertrag backend registered/selling/sold/returned nicht gegengeprüft; 🟢 Act mehrzeilig; 🟢 Preis-Spalte nicht geprüft
- Task 11: Bedenken: Spec-Test setzt zusätzlich totalCountSignal.set(1), sonst rendert die Seite keine Kachel
- Task 11: zurückgestellt: 🟢 Test mit zwei Asserts
- Task 12: Bedenken: Angular-Build-Warnung Initial-Bundle 795,70 kB > Budget 500 kB (Basis nicht geprüft); manuelle Druck-Abnahme (Desktop/Tablet/Smartphone) steht aus
- Task 12: zurückgestellt: 🟡 Build-Warnung Bundle-Budget Herkunft unbelegt; 🟡 Roadmap Round-23/24 verlinken gelöschte Komponenten-Dokus; 🟢 Settlement-Profil Auszahlung

## Stand
- Stand: bad55bf2
- Gesamtlauf: 5c154eae grün (Backend ok, Frontend 1214 Tests, Lint ok)
