# Umsetzung — Plan: docs/forge/2026-10-12-settlement-actionbar-redesign/plan.md

## Abschlussbericht
# Abschlussbericht Umsetzung settlement-actionbar-redesign

Bereich: forge-base/2026-10-12-settlement-actionbar-redesign..HEAD (89cbe9c8..d4afc55e), 3 Tasks, alle fertig, Final-Review sauber.

Urteile: 0.

Offene Punkte:
- Sichtprüfung (AC-05, AC-08, AC-16) nicht ausgeführt; besonders Tag "Abgerechnet am …" bei Containerbreite ca. 52–60 rem auf Überlappung mit "Drucken" prüfen (Final-Review 🟡: ggf. Schwelle anheben oder `min-width: min-content` an `.settlement-page__bar-center`).
- Glossar: Merge-Konflikt mit uncommitteten Einträgen "Verkäufer-Kachel"/"Kachelliste" im Haupt-Checkout absehbar; beide Blöcke behalten, "Aktionsleiste" dahinter.
- Narrow-Test per cssText-Regex, AC-08-Test nur Negativprüfung (🟡 zurückgestellt).
- Gesamtsuite: Timeouts (5000 ms) in fremden Specs unter Last, Wiederholung grün.

## Urteile
- keine

## Zurückgestellt und geparkt
- Task 1: Bedenken: Sichtprüfung (Schritt 5) nicht erfolgt; node_modules-Junction im Worktree; Test-Regex flex: 0 0 100% angepasst; Gesamtsuite 6 Timeouts in 4 fremden Dateien, Wiederholung grün
- Task 1: zurückgestellt: spec.ts:432 Narrow-Test prüft cssText per Regex (Browser-Serialisierung), keine berechnete Wirkung
- Task 1: zurückgestellt: spec.ts:420 AC-08 nur Negativprüfung textOverflow; overflow-Prüfung fehlt
- Task 1: zurückgestellt: Sichtprüfung Schritt 5 (AC-05/08/16) nicht ausgeführt
- Task 1: zurückgestellt: 🟢 spec.ts:97 lange Zeile; leere AAA-Kommentare (brief-vorgegeben)
- Task 2: Bedenken: Volle Suite Timeouts (5000ms) in fremden Specs unter Last, Wiederholung 891/893; keiner in settlement-page
- Task 2: zurückgestellt: 🟡 spec.ts:38-41 Beschriftung/Icons der drei Buttons nicht explizit geprüft (AC-09/11)
- Task 2: zurückgestellt: 🟢 leere AAA-Kommentare; Überschneidung mit canReturn-Block
- Task 3: Bedenken: Glossar-Eintrag Kachelliste fehlt im Worktree (uncommittete Änderung im Haupt-Checkout); Aktionsleiste ans Dateiende gehängt
- Task 3: zurückgestellt: 🟢 Confidence user-confirmed vs confirmed bei Nachbarn (brief-vorgegeben)

## Stand
- Stand: d4afc55e
- Gesamtlauf: keiner

## Sichtprüfung 2026-10-13 (Browser, Mock-API)
Messung im Dev-Server des Worktrees, abgerechneter Verkäufer mit langem Namen und langer Adresse.

| Container | Layout | Horizontaler Scroll | Tag überlappt „Drucken" | Mitte vs. Leistenzentrum |
|---|---|---|---|---|
| 40 rem | umgebrochen | nein | nein | mittig |
| 51,8 rem | umgebrochen | nein | nein | mittig |
| 54,8 rem | eine Zeile | nein | nein | 122 px links versetzt |
| 57,8 rem | eine Zeile | nein | nein | 122 px links versetzt |
| 70 rem | eine Zeile | nein | nein | 122 px links versetzt |

- AC-16: erfüllt. AC-08: erfüllt.
- AC-05: bei langem Inhalt verletzt (Mitte nicht mittig, ab Umbruchpunkt aufwärts). Bei kurzem Inhalt exakt mittig. Ursache: Mitte belegt volle Textbreite, „Ende" (3 Buttons) braucht mehr als die Hälfte des Rests, „Start" bekommt nur den Rest. Behebung per Followup (siehe unten).

## Fix AC-05 und Nachmessung 2026-10-13
Commit 5dd318c1: `.settlement-page__bar-start` und `__bar-end` mit gleicher Untergrenze `min-width: 18.5rem` (Container-Query < 52 rem setzt `min-width: 0`), Tag mit `max-width: 100%` und `white-space: normal`. Re-Review: alle behoben, keine neuen 🔴.

Nachmessung im Browser, gleiche Bedingungen (langer Name/Adresse, abgerechnet):

| Container | Layout | Versatz Mitte | Horizontaler Scroll | Tag überlappt | Tag-Zeilen |
|---|---|---|---|---|---|
| 40 rem | umgebrochen | 0 | nein | nein | 1 |
| 51,8 rem | umgebrochen | 0 | nein | nein | 1 |
| 53,4 rem | eine Zeile | 0 | nein | nein | 2 (Umbruch) |
| 54,8 rem | eine Zeile | 0 | nein | nein | 1 |
| 57,8 rem | eine Zeile | 0 | nein | nein | 1 |
| 70 rem | eine Zeile | 0 | nein | nein | 1 |

AC-05, AC-08, AC-16 damit im Browser belegt. Start und Ende gleich breit (296 px).
