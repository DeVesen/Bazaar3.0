# Artikel-Import an der Verkäufer-Kachel

Status: bestätigt am 2026-10-13
Art: verankert
Basis: 53685e86

## Was, wie, wo, warum
Auf der Verkäufer-Kachel der Haupt-App kommt oben rechts ein dritter Button neben Stift und Kamera hinzu. Er zeigt nur ein Icon, keine Beschriftung, und hat das ariaLabel „Importieren". · Aussage

Ein Klick öffnet ein Modal. Dort wählt der Anwender per Drag & Drop oder per Klick mit Dateidialog eine Datei im Format XLSX, XLS oder CSV. Das Modal zeigt danach den Dateinamen. Ein Klick auf „Import" startet den Artikel-Import. · Aussage

Jede Zeile der Datei nach der Kopfzeile ist ein Artikel für den Verkäufer, an dessen Kachel „Import" geklickt wurde. Das Frontend schickt die Datei an das Backend, das Backend liest sie ein und legt die Artikel an. Der Anlass ist, die Artikelliste eines Verkäufers (Beispiel: eine Skibasar-Artikelliste als Excel-Datei) nicht von Hand erfassen zu müssen. · Anhang

Die Datei hat sechs Spalten in fester Reihenfolge: Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Preis. Die Beschriftungen der Kopfzeile dürfen anders heißen, nur die Reihenfolge zählt. Weitere Spalten (z. B. „min. Preis") werden ignoriert. Bei XLSX wird nur das erste Blatt gelesen. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Admin klickt an der Kachel auf das Import-Icon und wählt eine Datei. Nach „Import" sieht er einen Spinner und wartet auf die Antwort. · Aussage

Bei Erfolg wechselt der Spinner animiert in ein Check-Icon. Das Modal schließt nach etwa 1,5 Sekunden, die Kachel zeigt die neuen Zahlen, ein Hinweis nennt die Anzahl der importierten Artikel. · Aussage

Bei einem Fehler wird nichts gespeichert. Das Modal bleibt mit der Fehlermeldung offen, die Datei bleibt gewählt. Neue Artikel sind „Registriert". Das Freigeben zum Verkauf ist ein manueller Folgeschritt und nicht Teil des Imports. · Aussage

## Soll-Vorgaben
- Nur Admins sehen den Import-Button. · Aussage
- Bei einem bereits abgerechneten Verkäufer ist der Button deaktiviert. · Aussage
- Ein Klick auf den Button öffnet nur das Modal, nicht die Detailansicht der Kachel. · Aussage
- Das Modal akzeptiert genau eine Datei, die Endungen .xlsx, .xls und .csv. Andere Typen werden im Modal vor dem Upload abgelehnt. · Aussage
- Maximale Dateigröße 2 MB. · Aussage
- Der Import läuft synchron, ohne asynchrone Rückmeldung. Das Frontend wartet höchstens 3 Minuten auf die Antwort. · Aussage
- Während des Imports ist das Modal nicht schließbar und der Import-Button deaktiviert. · Aussage
- Der Betrieb lässt 2 MB Upload und 3 Minuten Antwortzeit durch den Proxy zu. Aktuell sind es 1 MB und 60 Sekunden. · Git
- Kopfzeile = Zeile 1 der Datei; „Zeilennummer" in Meldungen meint die Zeile in der Datei. · Aussage
- Pflichtfelder je Artikelzeile: Artikelnummer, Bezeichnung, Kategorie, Marke, Preis. Die Größe ist optional. · Aussage
- Eine Zeile, die außer der Artikelnummer nur leere Felder hat, wird ohne Meldung übersprungen. Eine Zeile ohne jeden Inhalt gilt wie eine Nur-Nummer-Zeile als leer und wird ohne Meldung übersprungen. · Aussage
- Fehlt einer Zeile ein anderes Pflichtfeld, bricht der Import ab. Werte aus der Zeile darüber werden nicht übernommen. · Aussage
- Die Artikelnummer muss eine Ganzzahl größer als 0 sein und in der Datei einmalig. · Aussage
- Ist eine Artikelnummer schon vergeben, bricht der Import ab. Gleich ist, welchem Verkäufer sie gehört und welchen Status der Artikel hat. Der Import überschreibt nie. · Aussage
- Der Preis muss eine Ganzzahl größer als 0 sein. Das Dezimalzeichen beim Lesen einer CSV richtet sich nach der Sprache des Browsers. Die Browser-Sprache wird mit dem Import an das Backend übermittelt; das Backend liest die CSV nach dieser Sprache. · Aussage
- CSV-Trennzeichen ist das Semikolon. · Aussage
- Unbekannte Kategorien und Marken werden als „Neu" angelegt. Leerzeichen am Rand werden entfernt, die Werte werden sonst ungeprüft übernommen. Eine vorhandene Kategorie oder Marke wird bei abweichender Groß-/Kleinschreibung wiederverwendet. Der Import legt unbekannte Kategorien und Marken immer als „Neu" an, unabhängig von der Rolle des Anwenders. · Aussage
- Der Import ist alles oder nichts: Bei einem Fehler wird kein Artikel gespeichert. · Aussage
- Eine Fehlermeldung listet alle Fehler mit Zeilennummer, Artikelnummer und Grund, höchstens 10, danach „und n weitere". Bei einer vergebenen Nummer nennt sie den Namen des Verkäufers, dem die Nummer gehört. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein angemeldeter Admin und eine Verkäufer-Kachel eines nicht abgerechneten Verkäufers, wenn die Kachel angezeigt wird, dann steht rechts neben dem Kamera-Button ein dritter Button nur mit Icon und dem ariaLabel „Importieren". · Aussage
- **AC-02** Gegeben ein angemeldeter Benutzer ohne Admin-Rolle, wenn die Kachel angezeigt wird, dann ist der Import-Button nicht vorhanden. · Aussage
- **AC-03** Gegeben ein abgerechneter Verkäufer, wenn seine Kachel angezeigt wird, dann ist der Import-Button deaktiviert. · Aussage
- **AC-04** Gegeben die Kachel eines Verkäufers, wenn der Admin den Import-Button anklickt, dann öffnet sich das Modal und die Detailansicht des Verkäufers öffnet sich nicht. · Aussage
- **AC-05** Gegeben das geöffnete Modal ohne Datei, wenn der Admin eine .xlsx-, .xls- oder .csv-Datei per Drag & Drop ablegt oder per Dateidialog wählt, dann zeigt das Modal den Dateinamen und der Button „Import" ist aktiv. · Aussage
- **AC-06** Gegeben das geöffnete Modal, wenn der Admin eine .pdf-Datei wählt, dann zeigt das Modal einen Hinweis auf die erlaubten Formate, der Button „Import" bleibt inaktiv und es wird nichts hochgeladen. · Aussage
- **AC-07** Gegeben das geöffnete Modal, wenn der Admin zwei Dateien gleichzeitig ablegt, dann zeigt das Modal „Bitte genau eine Datei wählen" und übernimmt keine der beiden. · Aussage
- **AC-08** Gegeben eine gewählte Datei, wenn der Admin eine andere gültige Datei wählt, dann ersetzt der neue Dateiname den bisherigen. · Aussage
- **AC-09** Gegeben eine Datei von mehr als 2 MB, wenn der Admin „Import" klickt, dann erscheint eine Fehlermeldung zur Dateigröße und es wird kein Artikel gespeichert. · Aussage
- **AC-10** Gegeben eine gewählte gültige Datei, wenn der Admin „Import" klickt, dann erscheint ein Spinner, das Modal lässt sich nicht schließen, der Button „Import" ist deaktiviert und es wird genau ein Request gesendet. · Aussage
- **AC-11** Gegeben eine Datei mit einer Kopfzeile und 3 gültigen Zeilen mit bisher nicht vergebenen Nummern, wenn der Import startet, dann entstehen 3 Artikel für den Verkäufer der Kachel mit Nummer, Bezeichnung, Kategorie, Marke, Größe und Preis aus der Datei im Status „Registriert". · Aussage
- **AC-12** Gegeben eine Datei, deren Kopfzeile andere Spaltenbeschriftungen trägt und die eine siebte Spalte hat, wenn der Import startet, dann werden die ersten sechs Spalten nach Reihenfolge zugeordnet und die siebte Spalte wird ignoriert. · Aussage
- **AC-13** Gegeben ein erfolgreicher Import von 3 Artikeln, wenn die Antwort eintrifft, dann wechselt der Spinner animiert in ein Check-Icon, das Modal schließt nach etwa 1,5 Sekunden, ein Hinweis nennt „3 Artikel importiert" und die Kachel zeigt die neue Artikelanzahl. · Aussage
- **AC-14** Gegeben eine Datei mit 5 Datenzeilen, von denen 2 nur eine Artikelnummer enthalten, wenn der Import startet, dann entstehen 3 Artikel und es gibt keine Fehlermeldung. Dasselbe gilt, wenn statt der 2 Nur-Nummer-Zeilen 2 völlig leere Zeilen in der Datei stehen. · Aussage
- **AC-15** Gegeben eine Datei, in der Zeile 4 eine Artikelnummer und einen Preis, aber keine Bezeichnung hat, wenn der Import startet, dann bricht er ab, kein Artikel wird gespeichert und die Meldung nennt Zeile 4 und das fehlende Feld „Bezeichnung". · Aussage
- **AC-16** Gegeben eine Datei, in der Zeile 3 die Artikelnummer „A12" trägt, wenn der Import startet, dann bricht er ab und die Meldung nennt Zeile 3 und dass die Artikelnummer keine Ganzzahl ist. · Aussage
- **AC-17** Gegeben eine Datei, in der Zeile 5 die Artikelnummer 0 (oder −3) trägt, wenn der Import startet, dann bricht er ab und die Meldung nennt Zeile 5 und dass die Artikelnummer größer als 0 sein muss. · Aussage
- **AC-18** Gegeben eine Datei, in der die Nummer 3001 in Zeile 3 und Zeile 9 steht, wenn der Import startet, dann bricht er ab und die Meldung nennt Zeile 9 und dass die Nummer in der Datei doppelt vorkommt. · Aussage
- **AC-19** Gegeben die Nummer 3001 gehört schon dem Verkäufer „Anna Meier" (in beliebigem Status), wenn eine Datei mit 3001 in Zeile 6 importiert wird, dann bricht der Import ab und die Meldung nennt Zeile 6, die Nummer 3001 und „Anna Meier". Das gilt auch, wenn „Anna Meier" der Verkäufer der Kachel ist, und kein Artikel wird überschrieben. · Aussage
- **AC-20** Gegeben eine Datei, in der der Preis in Zeile 4 „199,95" lautet, wenn der Import startet, dann bricht er ab und die Meldung nennt Zeile 4 und dass der Preis eine Ganzzahl größer als 0 sein muss. Dasselbe gilt für den Preis 0. · Aussage
- **AC-21** Gegeben die Browser-Sprache Deutsch und eine CSV mit dem Preis „199,00", wenn der Import startet, dann wird der Preis 199 übernommen. Gegeben die Browser-Sprache Englisch und dieselbe CSV mit „199.00", dann wird ebenfalls 199 übernommen. · Aussage
- **AC-22** Gegeben eine Datei mit 12 fehlerhaften Zeilen, wenn der Import abbricht, dann listet die Meldung 10 Fehler mit Zeilennummer, Artikelnummer und Grund und danach „und 2 weitere". · Aussage
- **AC-23** Gegeben eine Datei mit der Marke „ Icepeak " und der Kategorie „Ski Jacke", die beide noch nicht existieren, wenn der Import erfolgreich ist, dann existieren Marke „Icepeak“ und Kategorie „Ski Jacke“ als „Neu“ und der Artikel trägt sie, auch wenn der Import von einem Admin ausgelöst wird; sie erscheinen in den Admin-Listen mit dem Badge „Neu". · Aussage
- **AC-24** Gegeben eine Datei mit nur der Kopfzeile oder nur Zeilen mit Artikelnummer oder völlig leeren Zeilen, wenn der Import startet, dann zeigt das Modal „Datei enthält keine Artikel" und es wird nichts gespeichert. · Aussage
- **AC-25** Gegeben eine XLSX mit zwei Blättern, wenn der Import startet, dann werden nur die Zeilen des ersten Blatts verarbeitet. · Aussage
- **AC-26** Gegeben eine nicht lesbare oder beschädigte Datei, wenn der Import startet, dann zeigt das Modal eine Fehlermeldung und es wird nichts gespeichert. · Aussage
- **AC-27** Gegeben ein Import, der abbricht, wenn die Fehlermeldung erscheint, dann endet der Spinner, das Modal bleibt offen, die Datei bleibt gewählt und die Kachel ist unverändert. · Aussage
- **AC-28** Gegeben ein Import ohne Antwort, wenn 3 Minuten vergangen sind, dann endet der Spinner, eine Fehlermeldung nennt die Zeitüberschreitung, das Modal bleibt offen und die Datei bleibt gewählt. · Aussage
- **AC-29** Gegeben eine Datei von knapp 2 MB, deren Import 2 Minuten dauert, wenn sie im Betrieb über den Proxy gesendet wird, dann kommt die Anfrage an und die Antwort erreicht das Frontend, ohne dass der Proxy die Anfrage abweist oder die Verbindung abbricht. · Git
- **AC-30** Gegeben die Kategorie „Ski Jacke" und die Marke „Icepeak" existieren, wenn eine Datei mit „ski jacke" und „ICEPEAK" importiert wird, dann tragen die Artikel die vorhandenen Einträge und es entstehen keine neuen. · Aussage

## Entscheidungen
- **W · Importziel** · Aussage — Die Artikel gehören dem Verkäufer der Kachel, an der „Import" geklickt wurde.
- **W · Dateiformat** · Aussage — XLSX, XLS, CSV mit sechs Spalten in fester Reihenfolge, Kopfzeile Zeile 1, Beschriftungen frei, weitere Spalten ignoriert.
- **W · Überschreiben entfällt** · Aussage — Erst „gleicher Verkäufer überschreibt", dann vom Menschen ersetzt: Vergebene Nummer ist immer ein Fehler.
- **W · Zeilenfehler und Pflichtfelder** · Aussage — Nur-Nummer-Zeilen überspringen, fehlendes Pflichtfeld bricht ab, keine Übernahme aus Zeile darüber.
- **W · Zahlenregeln** · Aussage — Nummer Ganzzahl > 0, Preis Ganzzahl > 0, Dezimalzeichen nach Browser-Sprache, CSV mit Semikolon.
- **W · Status** · Aussage — Neue Artikel „Registriert", Freigabe außerhalb des Imports.
- **W · Kategorie und Marke** · Aussage — Unbekannte als „Neu" anlegen, trimmen, ungeprüft.
- **W · Fehlerausgabe** · Aussage — Alle Fehler bis 10, dann „und n weitere"; Verkäufername bei vergebener Nummer.
- **W · Erfolgsablauf** · Aussage — Spinner → Check-Icon animiert, Modal schließt nach etwa 1,5 s, Hinweis, Kachel aktualisiert.
- **W · Wartezeit** · Aussage — 3 Minuten fix, ersetzt „3 × Default".
- **W · Limit und Typprüfung** · Aussage — 2 MB, Typprüfung im Modal vor dem Upload.
- **W · Berechtigung** · Aussage — Nur Admin; bei abgerechnetem Verkäufer ist der Button deaktiviert.
- **W · Unbrauchbare Dateien** · Aussage — Keine importierbare Zeile ist ein Fehler, nur erstes Blatt, beschädigte Datei Fehler.
- **W · Dateiwahl** · Aussage — Genau eine Datei, Ersetzen bei neuer Wahl, Modal während Import gesperrt.
- **W · Proxy** · Aussage — Proxy-Konfiguration auf 2 MB und 3 Minuten gehört in den Auftrag.
- **W · Icon** · Aussage — Icon-Button ohne Beschriftung, ariaLabel „Importieren", Klick löst die Kachel nicht aus.
- **F · AC-23** — geändert — Vorschlag 1: Soll-Vorgabe zu Kategorie und Marke legt fest, dass der Import Unbekannte immer als „Neu" anlegt, unabhängig von der Rolle; AC-23 prüft das auch bei Auslösung durch einen Admin samt Badge „Neu" in den Admin-Listen.
- **F · Soll-Vorgaben** — geändert — Vorschlag 1: Neues AC-30 prüft die Wiederverwendung vorhandener Kategorien und Marken bei abweichender Groß-/Kleinschreibung; Soll-Vorgabe ergänzt, dass die Browser-Sprache mit dem Import ans Backend geht; völlig leere Zeilen werden wie Nur-Nummer-Zeilen übersprungen, AC-14 und AC-24 entsprechend erweitert.
