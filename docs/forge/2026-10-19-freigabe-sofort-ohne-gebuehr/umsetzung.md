# Umsetzung — Plan: docs/forge/2026-10-19-freigabe-sofort-ohne-gebuehr/plan.md

## Abschlussbericht
# Abschlussbericht Umsetzung

Bereich: forge-base/2026-10-19-freigabe-sofort-ohne-gebuehr..HEAD (bbce27b1..8f35d4fd)
Tasks: 8 (Tasks 6 und 7 ohne Code, per Gesamtlauf abgedeckt)
Final: Fix-Welle (7dae204e..8f35d4fd), ein Re-Review

## Urteile
- Urteil: Task 6 (nur Gesamtlauf der Frontend-Suite, kein Code, kein Commit) ohne eigenen Umsetzer — Gesamtlauf auf b3751030 (1293/1293 grün, belegt in Task-5-Bericht) deckt Schritt 2 auf unverändertem HEAD ab — kostet: falls der Lauf unzuverlässig wäre, fiele ein Frontend-Rot erst im Final-Review/Abschluss auf
- Urteil: Task 7 (nur Lauf zweier bestehender Absicherungstests, kein Code, kein Commit) ohne eigenen Umsetzer — beide Tests existieren (app.routes.spec.ts:15, admin.guard.spec.ts:16), PUT /api/settings trägt RequireAuthorization("admin") (SettingsEndpoints.cs:18,30), und beide Tests liefen in der grünen Gesamtsuite auf b3751030 — kostet: ein Rot dieser Tests fiele erst im Abschluss-Lauf auf
- Urteil: Restlücke Öffnungs-Race (Antwort von load() trifft in der geschlossenen Phase zwischen Schließen und Wiederöffnen ein; release-dialog.ts ~180-189/262-267, `if (!this.visible()) return;` im .then oder Generation auch beim Schließen erhöhen) bleibt offen — echt, aber eng, nichts baut darauf auf, zweite Fix-Welle gibt es nicht — kostet: in diesem Fenster kann writeMode mitten in der Sitzung von batch auf immediate wechseln und gesammelte Artikel würden weder gebucht noch gemeldet; im Abschlussbericht als offen genannt
- Urteil: Timeout einer Sofort-Buchung (IMMEDIATE_WRITE_TIMEOUT_MS) meldet clientseitig rot, Server kann trotzdem buchen — plan-vorgeschriebene Grenze, Final-Review nennt kein Beheben — kostet: Artikel kann freigegeben sein, steht aber nicht auf dem Abgabe-Beleg; als bekannte Grenze in Doku vermerken wäre offen

## Offene Punkte
- Restlücke Öffnungs-Race im Fenster zwischen Schließen und Wiederöffnen des Freigeben-Popups (release-dialog.ts), siehe Urteil.
- Timeout-Grenze der Sofort-Buchung nicht in der Doku vermerkt.
- Zurückgestellte 🟡/🟢: siehe Ledger-Auszug (Template-Test für valueChange am Schalter, Test-Konventionen plan-vorgeschrieben, Bundle-Budget-Warnung vorbestehend, scan-dialog articleConfirmed vor emitResult).
- Integrationstests bei Task 1 temporär nicht lauffähig (Migration), seit Task 2 grün.

## Urteile
- Urteil: Task 6 (nur Gesamtlauf der Frontend-Suite, kein Code, kein Commit) ohne eigenen Umsetzer — Gesamtlauf auf b3751030 (1293/1293 grün, belegt in Task-5-Bericht) deckt Schritt 2 auf unverändertem HEAD ab — kostet: falls der Lauf unzuverlässig wäre, fiele ein Frontend-Rot erst im Final-Review/Abschluss auf
- Urteil: Task 7 (nur Lauf zweier bestehender Absicherungstests, kein Code, kein Commit) ohne eigenen Umsetzer — beide Tests existieren (app.routes.spec.ts:15, admin.guard.spec.ts:16), PUT /api/settings trägt RequireAuthorization("admin") (SettingsEndpoints.cs:18,30), und beide Tests liefen in der grünen Gesamtsuite auf b3751030 — kostet: ein Rot dieser Tests fiele erst im Abschluss-Lauf auf
- Urteil: Restlücke Öffnungs-Race (Antwort von load() trifft in der geschlossenen Phase zwischen Schließen und Wiederöffnen ein; release-dialog.ts ~180-189/262-267, `if (!this.visible()) return;` im .then oder Generation auch beim Schließen erhöhen) bleibt offen — echt, aber eng, nichts baut darauf auf, zweite Fix-Welle gibt es nicht — kostet: in diesem Fenster kann writeMode mitten in der Sitzung von batch auf immediate wechseln und gesammelte Artikel würden weder gebucht noch gemeldet; im Abschlussbericht als offen genannt
- Urteil: Timeout einer Sofort-Buchung (IMMEDIATE_WRITE_TIMEOUT_MS) meldet clientseitig rot, Server kann trotzdem buchen — plan-vorgeschriebene Grenze, Final-Review nennt kein Beheben — kostet: Artikel kann freigegeben sein, steht aber nicht auf dem Abgabe-Beleg; als bekannte Grenze in Doku vermerken wäre offen

## Zurückgestellt und geparkt
- Task 1: Bedenken: Integrationstests laufen auf Task-1-Stand nicht (PendingModelChangesWarning, Migration fehlt); Behebung durch Task 2
- Task 1: zurückgestellt: 🟢 bestehender Test in UpdateSettingsHandlerTests ohne AAA-Kommentare (Politur)
- Task 2: zurückgestellt: 🟢 Schema-Test prüft SQLite-Default statt Postgres (plan-vorgeschrieben, Migration per has-pending-model-changes abgesichert)
- Task 3: Bedenken: Build meldet 1 Warnung (nicht untersucht, vermutlich vorbestehend); Service/Api-Impl entstand vor dem Rot-Lauf, Rot per git stash nachgestellt
- Task 3: zurückgestellt: 🟡 settings-form.spec.ts: kein Test löst valueChange am gerenderten app-boolean-input aus (Template-Bindung (valueChange)="onReleaseOnCloseChange($event)" ungesichert)
- Task 3: zurückgestellt: 🟢 Reihenfolge showValue/releaseOnClose.set in ngAfterViewInit; TDD-Rot-Nachweis per Stash nachgeholt
- Task 4: zurückgestellt: 🟢 Testname "immediate mode releasedAt: …" folgt nicht dem Namensschema (stammt aus dem Brief, passt zu Nachbartests)
- Task 5: zurückgestellt: 🟡 release-dialog.ts refreshReleaseOnClose (Z.178/257): spätes load()-Promise einer früheren Öffnung setzt settingsLoaded=true nach Schließen; beim Wiederöffnen kann writeMode mitten in der Sitzung auf immediate wechseln — beheben (Öffnungs-Generation oder Verwerfen bei !visible, plus Test)
- Task 5: zurückgestellt: 🟡 release-dialog.spec.ts mehrere Tests mit mehreren Behauptungen/zwei Act-Phasen (plan-vorgeschrieben)
- Task 5: zurückgestellt: 🟢 veraltete Kommentare in release-dialog.ts:59 ("no separate is-scan-dialog-visible flag") und release-dialog.spec.ts:75; überlange Kommentarzeile release-dialog.ts:55
- Task 5: zurückgestellt: 🟡 außerhalb Scope: Bundle-Budget-Warnung im Build (vorbestehend); scan-dialog.ts:355-356 articleConfirmed vor emitResult('success') (nur bei synchroner Fehlerantwort)
- Task 8: zurückgestellt: 🟡 requirements/bazaar-app/components/settings-form.md:12 Index-Zeile "Ein Parameter" veraltet — beheben
- Task 8: zurückgestellt: 🟡 requirements/bazaar-app/components/settings-form.md: Schalter fehlt in ASCII-Skizze und AC-Liste (Brief verlangt es nicht)
- Task 8: zurückgestellt: 🟢 docs/components/settings-form/component.md: Index ohne Abschnitt 1a, "Das Formular" ohne Hinweis auf zwei Felder

## Stand
- Stand: 8f35d4fd
- Gesamtlauf: 0450dc08 grün (1295 Tests, Frontend)
