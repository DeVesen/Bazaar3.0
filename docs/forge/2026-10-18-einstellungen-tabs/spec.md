# Einstellungen als Tabs

Status: bestätigt am 2026-10-18
Art: verankert
Basis: ec5347cb

## Was, wie, wo, warum
Die Einstellungen der Haupt-App sind heute eine einzige Seite, die fünf Bereiche untereinander stapelt: Scan-Pause, Freitexte der Belege, Stammdaten-Import, Benutzerverwaltung und den Datenbank-Reset (nur im Development-Modus). · Historie
Der Admin will stattdessen eine Einstellungsseite mit einer Tab-Leiste, deren Tabs fachlich geschnitten sind und je eine Caption und ein Icon tragen. · Aussage
Die Tabs sind „Basis-Einstellungen" (mit der Scan-Pause), „User", „Beleg Druck" und „Sonstiges" (mit dem Import und, nur im Development-Modus, dem Bereich „Datenbank zurücksetzen"). · Aussage
Der Bereich, der heute „Entwickler-Werkzeuge" heißt, heißt künftig „Datenbank zurücksetzen". · Aussage
Der Umbau ändert nur Zuschnitt, Darstellung und Navigation; Felder, Regeln und Verhalten der Bereiche bleiben, soweit unten nicht anders genannt. · Aussage

## Theoretisches Verhalten nach Umsetzung
Ein Admin öffnet „Einstellungen" und sieht eine Seite mit vier Tabs. Der Tab „Basis-Einstellungen" ist aktiv. · Aussage
Jeder Tab zeigt Caption und Icon: Basis-Einstellungen mit `pi-cog`, User mit `pi-users`, Beleg Druck mit `pi-print`, Sonstiges mit `pi-ellipsis-h`. · Aussage
Im Tab „Beleg Druck" stehen die zwei Abschnitte „Abgabe-Beleg" und „Verkäufer-Übersicht" untereinander. Jeder Abschnitt zeigt die fünf Freitexte in der Anordnung des Belegs: Freitext 1 und Freitext 2 nebeneinander je 50 % der Breite, darunter Freitext 3 in 100 % der Breite, darunter Freitext 4 und Freitext 5 nebeneinander je 50 %. · Aussage
Die Felder behalten ihre Beschriftungen („Freitext 1 (Kopfzeile links)", „Freitext 2 (Kopfzeile Mitte)", „Freitext 3 (über der Artikelliste)", „Freitext 4 (Fußzeile links)", „Freitext 5 (Fußzeile Mitte)"). Ein gemeinsamer Button „Freitexte speichern" speichert beide Vorlagen. · Aussage
Der aktive Tab steht in der Adresse, sodass ein Neuladen oder ein geteilter Link denselben Tab öffnet. · Aussage
Wer den Tab wechselt, obwohl in „Basis-Einstellungen" oder „Beleg Druck" ungespeicherte Änderungen stehen oder in „Sonstiges" eine Import-Vorschau offen ist, bekommt eine Rückfrage und kann bleiben oder verwerfen. · Aussage

## Soll-Vorgaben
Alle Tabs und ihr Inhalt sind nur für die Rolle Admin sichtbar und erreichbar, wie heute. · Aussage
Das Lesen der Scan-Pause am Annahmetisch durch Kassenpersonal bleibt unberührt. · Historie
Der Bereich „Datenbank zurücksetzen" erscheint nur, wenn das Backend im Development-Modus läuft; sonst gibt es ihn nirgends in der Oberfläche. · Aussage
Der Import ist in jedem Modus im Tab „Sonstiges" sichtbar. · Aussage
Die Tab-Leiste wird mit der Tabs-Komponente der verwendeten UI-Bibliothek umgesetzt. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein angemeldeter Admin, wenn er „Einstellungen" ohne Tab-Angabe in der Adresse öffnet, dann sieht er genau vier Tabs in der Reihenfolge „Basis-Einstellungen", „User", „Beleg Druck", „Sonstiges", und „Basis-Einstellungen" ist aktiv. · Aussage
- **AC-02** Gegeben ein angemeldeter Admin auf der Einstellungsseite, wenn er die Tab-Leiste ansieht, dann trägt jeder Tab seine Caption und sein Icon: „Basis-Einstellungen" mit `pi-cog`, „User" mit `pi-users`, „Beleg Druck" mit `pi-print`, „Sonstiges" mit `pi-ellipsis-h`. · Aussage
- **AC-03** Gegeben der Tab „Basis-Einstellungen" ist aktiv, wenn der Admin die Scan-Pause auf einen Wert zwischen 500 und 15000 ms ändert und speichert, dann erscheint eine Erfolgsmeldung und der Wert gilt danach als gespeichert. · Aussage
- **AC-04** Gegeben der Tab „Basis-Einstellungen" ist aktiv, wenn der Admin die Scan-Pause auf 100 ms setzt und speichert, dann erscheint am Feld eine Fehlermeldung zum Wertebereich 500 bis 15000 ms und der Wert wird nicht gespeichert. · Aussage
- **AC-05** Gegeben der Tab „User" ist aktiv, wenn der Admin ihn öffnet, dann sieht er die Benutzertabelle mit den Funktionen Anlegen, Rolle ändern, Passwort zurücksetzen und Löschen wie bisher, und im Tab steht kein anderer Bereich. · Aussage
- **AC-06** Gegeben der Tab „Beleg Druck" ist aktiv, wenn der Admin ihn öffnet, dann sieht er die Abschnitte „Abgabe-Beleg" und „Verkäufer-Übersicht" untereinander. · Aussage
- **AC-07** Gegeben der Tab „Beleg Druck" ist aktiv, wenn der Admin einen Abschnitt ansieht, dann stehen Freitext 1 und Freitext 2 nebeneinander in je 50 % der Breite, darunter Freitext 3 in 100 % der Breite, darunter Freitext 4 und Freitext 5 nebeneinander in je 50 % der Breite. · Aussage
- **AC-08** Gegeben der Tab „Beleg Druck" ist aktiv, wenn der Admin die Felder ansieht, dann tragen sie die Beschriftungen „Freitext 1 (Kopfzeile links)", „Freitext 2 (Kopfzeile Mitte)", „Freitext 3 (über der Artikelliste)", „Freitext 4 (Fußzeile links)" und „Freitext 5 (Fußzeile Mitte)". · Aussage
- **AC-09** Gegeben der Admin hat Freitexte in beiden Abschnitten geändert, wenn er „Freitexte speichern" wählt, dann werden beide Vorlagen mit einem Klick gespeichert, eine Erfolgsmeldung erscheint, und die Texte gelten ab dem nächsten Druck. · Aussage
- **AC-10** Gegeben der Tab „Sonstiges" ist aktiv und das Backend läuft nicht im Development-Modus, wenn der Admin den Tab ansieht, dann sieht er den Import und keinen Bereich „Datenbank zurücksetzen". · Aussage
- **AC-11** Gegeben der Tab „Sonstiges" ist aktiv und das Backend läuft im Development-Modus, wenn der Admin den Tab ansieht, dann sieht er den Import und zusätzlich den Bereich „Datenbank zurücksetzen". · Aussage
- **AC-12** Gegeben ein beliebiger Modus, wenn der Admin die Einstellungsseite durchsucht, dann gibt es weder einen Tab noch eine Überschrift „Entwickler-Werkzeuge". · Aussage
- **AC-13** Gegeben der Bereich „Datenbank zurücksetzen" ist sichtbar, wenn der Admin den Reset ausführen will, dann ist der Reset-Button erst aktiv, nachdem er „RESET" eingegeben hat. · Aussage
- **AC-14** Gegeben der Admin wechselt auf den Tab „Beleg Druck", wenn die Seite neu geladen wird, dann ist „Beleg Druck" weiter aktiv und die Adresse nennt diesen Tab. · Aussage
- **AC-15** Gegeben die Adresse nennt einen unbekannten Tab, wenn der Admin sie öffnet, dann ist „Basis-Einstellungen" aktiv. · Aussage
- **AC-16** Gegeben ungespeicherte Änderungen in „Basis-Einstellungen" oder „Beleg Druck", wenn der Admin einen anderen Tab wählt, dann erscheint eine Rückfrage mit den Wahlmöglichkeiten „Bleiben" und „Verwerfen". · Aussage
- **AC-17** Gegeben die Rückfrage aus AC-16 ist offen, wenn der Admin „Bleiben" wählt, dann bleibt der bisherige Tab aktiv und die Eingaben sind unverändert. · Aussage
- **AC-18** Gegeben die Rückfrage aus AC-16 ist offen, wenn der Admin „Verwerfen" wählt, dann wechselt die Seite auf den gewählten Tab, und der verlassene Tab zeigt beim Zurückkehren den zuletzt gespeicherten Stand. · Aussage
- **AC-19** Gegeben keine ungespeicherten Änderungen und keine offene Import-Vorschau, wenn der Admin den Tab wechselt, dann erscheint keine Rückfrage. · Aussage
- **AC-20** Gegeben in „Sonstiges" ist eine Import-Vorschau offen, wenn der Admin einen anderen Tab wählt, dann erscheint dieselbe Rückfrage, und „Verwerfen" schließt die Vorschau. · Aussage
- **AC-21** Gegeben ein angemeldeter Benutzer mit der Rolle Kassenpersonal, wenn er die Einstellungsseite per Adresse aufruft, dann sieht er keinen Tab und keinen Einstellungs-Inhalt. · Aussage

## Entscheidungen
- **W · Zuschnitt** · Aussage — Eine Einstellungsseite mit Tabs statt mehrerer Unterseiten; Tabs: Basis-Einstellungen, User, Beleg Druck, Sonstiges.
- **W · Sonstiges** · Aussage — Der vierte Tab heißt „Sonstiges" und enthält den Import, im Development-Modus zusätzlich „Datenbank zurücksetzen".
- **W · Umbenennung** · Aussage — „Entwickler-Werkzeuge" heißt „Datenbank zurücksetzen" und ist nur im Development-Modus sichtbar; der Import ist immer sichtbar.
- **W · Beleg-Darstellung** · Aussage — Zeilen genau 50/50, 100, 50/50 ohne Platzhalter für Datum und „Seite x von y".
- **W · Beschriftung und Speichern** · Aussage — Feldbeschriftungen bleiben; ein gemeinsamer Speichern-Button für beide Vorlagen.
- **W · Icons** · Aussage — pi-cog, pi-users, pi-print, pi-ellipsis-h.
- **W · Start und Adresse** · Aussage — Startreiter „Basis-Einstellungen"; der aktive Tab steht in der Adresse.
- **W · Ungespeicherte Änderungen** · Aussage — Warnung mit Rückfrage bei Tab-Wechsel, auch bei offener Import-Vorschau.
- **W · Zugriff** · Aussage — Alle Tabs nur für Admin.
- **W · Funktionsumfang** · Aussage — Funktionen, Felder und Endpunkte der Bereiche bleiben unverändert.
