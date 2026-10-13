# Umsetzung — Plan: docs/forge/2026-10-13-artikelnummer-aendern/plan.md

## Abschlussbericht
# Abschlussbericht — Artikelnummer beim Bearbeiten ändern

Bereich: `forge-base/2026-10-13-artikelnummer-aendern..HEAD` · 5 Tasks · Branch `docs/feature/artikelnummer-aendern`

## Ergebnis
Die Artikelnummer ist im Dialog „Artikel bearbeiten“ änderbar. Server und Frontend lehnen eine Nummer ab, die an einem anderen Artikel hängt („Artikelnummer n ist bereits vergeben.“); Task-Reviews und Final-Review sind sauber, offen ist nur eine Bestätigung des Menschen.

## Urteile
- Task 5: Der Umsetzer änderte nur die Doku-Dateien und committete erst nach Bestätigung des Doku-Diffs durch den Menschen — Plan-Schritt 2 und Projekt-CLAUDE.md verlangen das — Kosten, falls falsch: Nacharbeit an der Doku. Der Mensch hat den Diff bestätigt, der Commit wurde von ihm freigegeben.

## Offene Punkte
- **Zu bestätigen (Mensch):** `canSave` im Dialog sperrt nur noch bei abgerechnetem Verkäufer, nicht mehr bei verkauftem Artikel (Plan-E-Eintrag „Speichern bei verkauft“). Das ändert das Verhalten über die Nummer hinaus: Bei verkauften Artikeln lassen sich Bezeichnung, Marke usw. wieder speichern, der Preis bleibt gesperrt. AC-10 der Spec verlangt es, die Anforderungs-Doku sah es schon vor.
- Wettlauf zwischen Prüfung und Speichern: der eindeutige Index fängt es ab, es entsteht ein 500 statt `409 article.number_taken` (bewusst, E-Eintrag).
- Zurückgestellt (🟡/🟢, kein Fix nötig): Technische Obergrenze 2147483647 mit Meldung „ganze Zahl ab 1“; Blur-Lookup ohne Schutz gegen Antworten in falscher Reihenfolge; Tests für Lookup-Fehler (nicht 404) und Überlauf fehlen; Fallback-Text ohne `detail` ungetestet; AC-11 der Doku enthält zwei Fehlerfälle; Doc-Kommentar im Dialog bricht mitten im Satz um; `canSave` blockiert nicht, solange ein Server-Nummernfehler für die eingegebene Nummer steht.
- Hinweis: Der Final-Fix-Commit `cbd0ba6` trägt den Trailer „Claude Haiku 5.5“ statt „Sonnet 5.5“ (Folge der Agent-Modellwahl); Doku-Korrektur, ohne Wirkung.

## Commits
`6a3e747` Domain · `5ccd54a` Application · `3f42776` Dialog · `fadd7c8` Seite · `35822f7` Doku · `cbd0ba6` Doku-Korrektur

## Urteile
- Urteil: Task 5 — Umsetzer ändert nur die Doku-Dateien und committet nicht; Diff geht zuerst an den Menschen — Plan-Schritt 2 und Projekt-CLAUDE.md verlangen Bestätigung vor dem Commit — kostet eine Rückfrage, falls der Mensch dem Diff widerspricht: Nacharbeit an Doku

## Zurückgestellt und geparkt
- Task 1: zurückgestellt: 🟢 Theory-Test prüft nicht, dass Number nach Fehlschlag unverändert bleibt (Politur, Guard steht vor Mutation)
- Task 2: Bedenken: PUT /api/articles/{id} ohne number ergibt jetzt 400 (Number=0); Integrationstests und Api-Tests liefen nicht
- Task 2: zurückgestellt: 🟢 Validator-Test ohne Grenzwert 1 (Nice-to-have)
- Task 2: zurückgestellt: 🟡 (außerhalb Scope) Prüfen/Speichern nicht atomar, Wettlauf nur über eindeutigen Index — im Plan als E-Eintrag bewusst entschieden (kein Mapping der DbUpdateException)
- Task 3: Bedenken: Abweichung — [articleId]="editingRow()?.id ?? ''" schon in articles-page.html gebunden (gehört laut Plan zu Task 4); 409-Mapping folgt in Task 4 wie geplant
- Task 3: zurückgestellt: 🟡 MAX_ARTICLE_NUMBER 2147483647 vs. 'ohne Obergrenze' — Meldung 'ganze Zahl ab 1' bei Überlauf irreführend (im Plan als E-Eintrag entschieden)
- Task 3: zurückgestellt: 🟡 Blur-Lookup ohne Schutz gegen Out-of-Order-Antworten (Server entscheidet beim Speichern)
- Task 3: zurückgestellt: 🟡 Tests fehlen: Lookup-Fehler (nicht 404) ignoriert, Zahl über Obergrenze
- Task 3: zurückgestellt: 🟢 Doc-Kommentar bricht mitten im Satz um
- Task 4: zurückgestellt: 🟢 Fallback-Text ohne detail (articles-page.ts) ungetestet
- Task 4: zurückgestellt: 🟢 Test greift per By.directive auf Dialog zu (in Ordnung)
- Task 5: zurückgestellt: 🟡 rohes <n> im Markdown (artikel-dialog.md Felder-Tabelle, AC-8) kann als HTML-Tag verschwinden
- Task 5: zurückgestellt: 🟡 Frontmatter-Daten (artikel-dialog.md reviewed-date, artikel.md updated) nicht nachgeführt
- Task 5: zurückgestellt: 🟢 AC-11 enthält zwei Fehlerfälle

## Stand
- Stand: cbd0ba66
- Gesamtlauf: keiner
