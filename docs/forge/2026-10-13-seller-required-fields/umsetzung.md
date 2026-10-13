# Umsetzung — Plan: docs/forge/2026-10-13-seller-required-fields/plan.md

## Abschlussbericht
# Umsetzungsbericht — Pflichtfelder Verkäufer (Haupt-App)

Bereich: `forge-base/2026-10-13-seller-required-fields..HEAD` (c6ba5b6..7021881), Branch `docs/feature/seller-required-fields`.
Tasks: 8 (alle mit Task-Review sauber), dazu eine Final-Fix-Runde (1 Doku-Zeile).

## Ergebnis
Dialog, Wizard Schritt 1, API-Validatoren, Domain und JSON-Import verlangen Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr, Provision; die E-Mail ist optional (nullable Spalte, EF-Migration `MakeSellerEmailOptional`). Backend-Suite 624 Tests, Frontend-Suite 1124 Tests, Lint und Build grün.

## Urteile
- Task-8-🟡 (Epic_Verkaeufer AC-6) beheben statt parken — Widerspruch zu Spec AC-11 — kostet bei Irrtum eine Doku-Zeile.
- Co-Author-Trailer der Haiku-Commits (Task 4, Final-Fix) unverändert — Historie nicht umschreiben — kostet nur kosmetische Attribution.

## Offene Punkte
- Bundle-Budget-Warnung des Frontend-Builds (initial 795 kB gegen 500 kB): laut Umsetzern vorbestehend, nicht gegen die Basis belegt.
- Altbestand-Verkäufer ohne Ort: im Bearbeiten-Dialog ist „Speichern“ gesperrt, die Meldung erscheint erst nach Verlassen des Ort-Felds (🟢, entspricht der W-Entscheidung).
- Konditionen-Mockup-Zeilen in ANNAHME-S02 und VERK-S01 sind länger als der ASCII-Rahmen (🟢, plan-vorgeschrieben, kosmetisch).
- Migrationsdateien haben im Working Tree CRLF/BOM (EF-Standard), im Index LF durch `.gitattributes` (🟢).
- Sechs offene Formulierungs-Hinweise aus dem Spec-Review sowie der Worktree-Pfad-Hinweis aus dem Plan-Review sind nicht eingearbeitet.
- Die EF-Migration ist nicht gegen die Dev-DB angewendet (läuft beim Start per `Migrate()`).

## Urteile
- Urteil: Task-8-🟡 (Epic_Verkaeufer AC-6) beheben statt parken — Widerspruch zu Spec AC-11 (konsistente Doku) — kostet bei Irrtum eine Doku-Zeile
- Urteil: Co-Author-Trailer der Haiku-Commits (Task 4, Final-Fix) bleiben unverändert — Historie nicht umschreiben — kostet nur kosmetische Attribution

## Zurückgestellt und geparkt
- Task 1: zurückgestellt: 🟢 Seller.City bleibt string? (Altbestand, laut Brief)
- Task 2: zurückgestellt: 🟢 englischer Kommentar enthält "Haupt-App" (Brief-Vorgabe)
- Task 3: zurückgestellt: 🟢 Create-Handler-Test verifiziert Add nur über Id (reicht)
- Task 4: Bedenken: Co-Authored-By im Commit nennt Haiku statt Sonnet (Harness-Vorgabe), Commit mit expliziten Dateipfaden
- Task 4: zurückgestellt: 🟢 kein Test für whitespace-only Ort im Parser (IsNullOrWhiteSpace deckt ab)
- Task 4: zurückgestellt: 🟢 Commit-Footer Haiku statt Sonnet (kosmetisch, Commit nicht umgeschrieben)
- Task 5: zurückgestellt: 🟢 sellerTypeId ohne trim (Select-Wert, Brief-Vorgabe)
- Task 6: zurückgestellt: 🟢 required.reset() im Effect schreibt nur ein ungelesenes Signal (keine Schleife)
- Task 7: zurückgestellt: 🟢 Touched-Test deckt nur Vorname/Ort ab (Lücke, kein Fehler)
- Task 7: zurückgestellt: 🟢 Bundle-Budget-Warnung 795 kB laut Umsetzern vorbestehend (Tasks 5-7), nicht gegen Basis belegt
- Task 8: zurückgestellt: 🟢 Konditionen-Mockup-Zeilen in ANNAHME-S02/VERK-S01 länger als Rahmen (plan-vorgeschrieben, kosmetisch)
- Task 8: zurückgestellt: 🟡 Epic_Verkaeufer/epic.md AC-6 beschreibt noch altes Verhalten ("Fehlermeldung beim Speichern"), widerspricht VERK-S01 AC-7 (außerhalb Brief-Scope)

## Stand
- Stand: 70218814
- Gesamtlauf: e95dcf3 grün (Frontend 1124 Tests, Lint sauber, Build OK)
