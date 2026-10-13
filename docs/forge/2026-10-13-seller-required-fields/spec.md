# Spec: Pflichtfelder Verkäufer (Haupt-App)

Status: freigegeben (Mensch, 2026-10-13), Spec-Review offen

## Ziel

Beim Anlegen und Ändern eines Verkäufers in der Haupt-App gelten andere Pflichtfelder.

| | Vorher | Nachher |
|---|---|---|
| Pflicht | Vorname, Nachname, E-Mail, Verkäufer-Typ | Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr, Provision |
| Optional | Anschrift, PLZ, Ort, Telefon, Gebühr, Provision | Anschrift, PLZ, Telefon, E-Mail |

## Geltungsbereich

- Bearbeiten-/Anlegen-Dialog (`verkaeufer-dialog`), VERK-S01.
- Wizard Artikelannahme Schritt 1 (`intake-wizard`), ANNAHME-S02.
- REST-API `POST/PUT /api/sellers` (Validator) und Domain `Seller`.
- JSON-Import aus der Voranmelde-App (`ImportFileParser`, `RunImportHandler`).
- Nicht betroffen: Voranmelde-App.

## Entscheidungen

- E-Mail wird nullable (`string?`) in Domain und DB, Migration nötig. Leere Eingabe wird als `null` gespeichert.
- Gebühr und Provision sind „gesetzt", wenn ein Wert vorliegt. `0` ist gültig (Gebühr-0-Feature bleibt). Ein geleertes Zahlenfeld (`null`) ist ungültig.
- Ist eine E-Mail eingegeben, prüft der Wizard weiterhin das Format. Dialog und Schnittstelle prüfen das Format nicht neu; eine leere E-Mail ist nie ein Fehler (siehe AC-12).
- Import: Der Parser verlangt statt `email` nun `city`. Import-Zeilen ohne Ort gelten als ungültiges Format (wie bisher bei fehlendem Pflichtfeld). Vom Menschen bestätigt, auch wenn bestehende Exportdateien ohne Ort danach abgelehnt werden.
- Nicht-Admin bearbeitet Gebühr/Provision nicht direkt; sie bleiben mit den Typ-Werten vorbelegt und erfüllen die Pflicht.
- **R1 · Entscheidungen** — frage an den menschen — E-Mail-Teil als Klarstellung umformuliert (der Satz schloss Dialog und Schnittstelle bereits selbst aus) und AC-12 ergänzt (Neues Verhalten, Beleg: src/bazaar-app/backend/Bazaar.Application/Sellers/CreateSellerCommandValidator.cs — die Schnittstelle prüft das E-Mail-Format heute nicht). Offen bleibt die Import-Entscheidung: Sie ist als „zur Bestätigung durch den Menschen“ markiert, der Status sagt „freigegeben“. Frage: Sollen Import-Dateien mit einem Verkäufer ohne Ort künftig abgelehnt werden? Naheliegende Antworten: (a) ja, bestätigt, Hinweis entfällt; (b) nein, Verkäufer ohne Ort beim Import erlauben bzw. anders behandeln; AC-10 und der Parser-Teil werden angepasst.
- **W · Entscheidungen** · Aussage — Antwort auf „R1 · Entscheidungen“: a — Import lehnt eine Datei mit einem Verkäufer ohne Ort ab (bestätigt).

## Akzeptanzkriterien

- **AC-1** WENN Vorname, Nachname, Ort, Verkäufer-Typ, Gebühr und Provision gefüllt sind, DANN lässt sich der Dialog speichern, auch ohne E-Mail.
- **AC-2** WENN eines dieser sechs Felder leer ist, DANN ist „Speichern" gesperrt bzw. zeigt eine Inline-Fehlermeldung unter dem Feld (Dialog und Wizard Schritt 1 „Weiter").
- **AC-3** Gebühr `0` und Provision `0` zählen als gesetzt. Leeres Zahlenfeld zählt als fehlend.
- **AC-4** Pflichtfelder tragen im Dialog und im Wizard einen roten `*`: Vorname, Nachname, Ort, Typ, Gebühr, Provision. E-Mail trägt keinen.
- **AC-5** `POST /api/sellers` und `PUT /api/sellers/{id}` antworten mit `400` und Feldfehler, wenn Vorname, Nachname, Ort oder Typ fehlen. E-Mail fehlt nie als Fehler. Gebühr und Provision werden serverseitig nicht als Pflicht geprüft (Create leitet sie ab, Update leitet sie bei Typ-Wechsel ab).
- **AC-6** Create leitet Gebühr und Provision weiterhin aus dem Verkäufer-Typ ab (`CreateSellerCommand` unverändert). Die Pflicht für Gebühr und Provision gilt nur in der UI (Dialog, Wizard), wo die Felder immer vorbelegt sind. Update verhält sich unverändert bei Typ-Wechsel (Server leitet ab).
- **AC-7** `Seller.Create`, `CreateFromImport` und `UpdateDetails` werfen bei leerem Ort, nicht aber bei leerer E-Mail.
- **AC-8** Eine Verkäuferin ohne E-Mail lässt sich speichern, laden, in Suche, Karte, Abrechnung und Druck anzeigen, ohne Fehler (Anzeige leer statt `null`).
- **AC-9** DB-Migration macht `Sellers.Email` nullable. Bestehende Zeilen bleiben unverändert.
- **AC-10** Import lehnt Dateien mit einem Verkäufer ohne `city` ab, akzeptiert Verkäufer ohne `email`.
- **AC-11** Anforderungs-Doku (VERK-S01 AC-2/AC-7, ANNAHME-S02, `entities/verkaeufer.md`, API-Doku Sellers/Import), Glossar und Profile sind nachgeführt.
- **AC-12** WENN im Wizard Schritt 1 eine E-Mail eingegeben ist und ihr Format ungültig ist, DANN zeigt der Wizard eine Inline-Fehlermeldung unter dem Feld und „Weiter“ ist gesperrt. Dialog und Schnittstelle prüfen das E-Mail-Format nicht. Eine leere E-Mail ist in Dialog, Wizard und Schnittstelle nie ein Fehler.

## Offene Punkte für den Plan

- Anzeigeorte von `email` im Frontend (Karte, Druckbelege, Abrechnung) auf `null` prüfen.
