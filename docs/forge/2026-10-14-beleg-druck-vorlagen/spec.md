# Abgabe-Beleg und Verkäufer-Übersicht drucken

Status: bestätigt am 2026-10-14
Art: verankert
Basis: e50dff16

## Was, wie, wo, warum
Heute öffnet „Speichern" in der Artikelannahme und die Freigabe eine Druckvorschau, die statt des Abgabe-Belegs den Inhalt der Seite zeigt. Dasselbe gilt für den Druck in der Abrechnung. · Aussage

Die Verkäufer-Kachel der Haupt-App bekommt in ihren Aktionen neben Bearbeiten, Scannen und Importieren einen Druckbutton mit Drucker-Icon. Er öffnet die Druckvorschau des Abgabe-Belegs für diesen Verkäufer. · Anhang

Der Abgabe-Beleg ist eine einzige Vorlage für drei Auslöser: „Speichern" in der Artikelannahme, die Freigabe und den Druckbutton an der Verkäufer-Kachel. Er bekommt ein neues Layout aus Kopfzeile, Verkäufer-Block, Kennzahl-Kacheln, Freitext 3, Artikelliste und Fußzeile. Die Kopfzeile enthält Freitext 1, Freitext 2 und Datum/Uhrzeit. Die Fußzeile enthält Freitext 4, Freitext 5 und „Seite x von y". · Anhang

Die Verkäufer-Übersicht aus der Abrechnung nutzt dieselbe Basis, hat aber mehr Kennzahl-Kacheln. Ihre fünf Freitexte sind eigene Eingabefelder, getrennt von denen des Abgabe-Belegs. · Aussage

Die Freitexte pflegt ein Admin in den Einstellungen. Der Betreiber kann damit Kopf, Fuß und Hinweise des Belegs selbst festlegen und für jede Vorlage unterschiedlich füllen. Der Druck soll auf Desktop, Tablet und Smartphone funktionieren. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender klickt auf das Drucker-Icon der Verkäufer-Kachel, speichert eine Annahme, gibt Artikel frei oder druckt in der Abrechnung. Danach öffnet sich der Druckdialog des Geräts mit einer Vorschau, die nur das Dokument zeigt, ohne Navigation, Kachelliste oder sonstige Seitenelemente. Der Anwender druckt oder wählt „Als PDF speichern". · Aussage

Beim Abgabe-Beleg und bei der Verkäufer-Übersicht erscheinen Freitexte, Kennzahl-Kacheln und die nach Status gruppierte Artikelliste. Bei vielen Artikeln läuft das Dokument über mehrere Seiten. · Aussage

## Soll-Vorgaben
- Format ist DIN A4 hochkant. · Aussage
- Es gilt der Druckdialog des Geräts, auch unter Android und iOS. Ein echter Drucker muss nicht ansprechbar sein, „Als PDF speichern" genügt. · Aussage
- Der Druckbutton an der Verkäufer-Kachel ist für alle Rollen sichtbar, die die Kachel sehen. · Aussage
- Hat der Verkäufer keine Artikel, bleibt der Druckbutton aktiv. Die Artikelliste ist dann leer. · Aussage
- Der Beleg für den Druckbutton enthält alle Artikel des Verkäufers außer „Registriert". · Aussage
- Der Beleg für „Speichern" in der Artikelannahme enthält die gerade gebuchten Artikel. Sie sind alle „Registriert", die Gruppe „Registriert" erscheint dort. · Aussage
- Der Beleg für die Freigabe enthält die freigegebenen Artikel. · Aussage
- Die Artikelliste ist nach Status gruppiert, in der Reihenfolge „Im Verkauf", „Verkauft", „Zurückgegeben". Bei Speichern in der Artikelannahme steht die Gruppe „Registriert" allein. Innerhalb jeder Gruppe steigt die Artikelnummer auf. · Aussage
- „Anzahl abgegebener Artikel" ist immer die Zahl der Artikel, die im Dokument stehen. · Aussage
- Datum/Uhrzeit ist der Zeitpunkt des Drucks. · Aussage
- Der Verkäufer-Block enthält Vorname, Nachname, Straße sowie Postleitzahl und Ort in einer Zeile. Telefon und E-Mail entfallen. · Aussage
- Der Verkäufer-Block enthält links die Anschrift und rechts den QR-Code der Verkäufer-ID. Darunter steht die Verkäufer-ID als Text. · Anhang
- **Kennzahl-Kachel** ist der Begriff für einen Infoblock auf dem Beleg. Er hat links oben einen Titel und darunter einen größeren, dickeren Wert, linksbündig. „Kachel" allein bleibt die Verkäufer-Kachel. · Aussage
- Zeile A der Kennzahl-Kacheln beim Abgabe-Beleg enthält Verkäufer-ID als Text und Anzahl abgegebener Artikel. Zeile B ist halb so hoch wie Zeile A und enthält Gebühr und Provision. · Aussage
- Die Gebühr-Kachel hat den Titel „Gebühr Y € / Artikel" und den Wert „Anzahl abgegebener Artikel × Y". Es erscheint der berechnete, nicht der tatsächlich bezahlte Betrag. · Aussage
- Die Provision-Kachel im Abgabe-Beleg hat den Titel „Provision" und als Wert den Provisionssatz „X %". · Aussage
- Zeile A der Kennzahl-Kacheln bei der Verkäufer-Übersicht enthält Verkäufer-ID, Anzahl abgegebener Artikel, Anzahl offener Artikel (= „Im Verkauf"), Anzahl verkaufter Artikel und Einnahmen (= Umsatz des Verkäufers). Zeile B enthält Gebühr, Provision und Verdienst. · Aussage
- Die Provision-Kachel der Verkäufer-Übersicht hat den Titel „Provision X %" und den Wert „Umsatz × X / 100". Verdienst ist „Umsatz − Provision" und ersetzt die bisherige Auszahlung. Die Gebühr-Kachel rechnet wie im Abgabe-Beleg. · Aussage
- Die Verkäufer-Übersicht folgt denselben Status-Gruppen und derselben Sortierung wie der Beleg für den Druckbutton. Der Unterschied zwischen vorläufig und endgültig entfällt. · Aussage
- Die Spalten der Artikelliste sind Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Farbe und Preis. Die Liste ist eine Tabelle, keine Kachel pro Artikel. · Anhang
- Freitext 1 bis 5 gibt es je Vorlage als eigenes Eingabefeld, zusammen zehn Felder in den Einstellungen. Alle zehn unterstützen Markdown mit Überschriften, Fett, Kursiv, Absätzen, Listen und Tabellen. Links, Bilder und HTML sind ausgeschlossen. · Aussage
- Ausrichtung: Freitext 1 und 4 linksbündig, Freitext 2 und 5 zentriert. Datum/Uhrzeit und „Seite x von y" rechtsbündig. · Anhang
- Ein leerer Freitext 3 nimmt keinen Platz ein, die Artikelliste beginnt direkt unter den Kennzahl-Kacheln. Leere Freitexte in Kopf- und Fußzeile bleiben leer, der Platz bleibt. · Aussage
- Die Artikelliste füllt die Seitenhöhe bis zur Fußzeile. · Anhang
- Ab Seite 2 gibt es die Kopfzeile, darunter eine Zeile mit Verkäufer-ID und Anschrift in voller Breite, darunter die Fortsetzung der Artikelliste mit wiederholtem Tabellenkopf, unten die Fußzeile. Kennzahl-Kacheln, QR-Code und Freitext 3 stehen nur auf Seite 1. · Aussage
- Die Freitexte pflegt nur ein Admin. Änderungen gelten ab dem nächsten Druck. · Aussage
- Der Inhalt der Verkäufer-Übersicht ändert sich nur wie oben beschrieben. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein angemeldeter Nutzer ohne Admin-Rolle, wenn er die Verkäufer-Seite öffnet, dann zeigt jede Verkäufer-Kachel ein Drucker-Icon neben den Aktionen Bearbeiten und Scannen. · Anhang
- **AC-02** Gegeben ein Verkäufer mit Artikeln, wenn der Anwender das Drucker-Icon der Verkäufer-Kachel anklickt, dann öffnet sich die Druckvorschau des Geräts, die nur den Abgabe-Beleg dieses Verkäufers zeigt, ohne Navigation, Kachelliste oder andere Seitenelemente. · Aussage
- **AC-03** Gegeben die Verkäufer-Seite, wenn der Anwender das Drucker-Icon anklickt, dann öffnet sich die Detailansicht des Verkäufers nicht. · Aussage
- **AC-04** Gegeben ein Verkäufer ohne Artikel, wenn der Anwender das Drucker-Icon anklickt, dann öffnet sich die Vorschau mit leerer Artikelliste, „Anzahl abgegebener Artikel" 0 und der Gebühr-Kachel mit Wert 0,00 €. · Aussage
- **AC-05** Gegeben die Daten für den Beleg lassen sich nicht laden, wenn der Anwender das Drucker-Icon anklickt, dann erscheint eine sichtbare Fehlermeldung und die Druckvorschau öffnet sich nicht. · Aussage
- **AC-06** Gegeben ein Annahme-Vorgang mit 3 Artikeln, wenn der Anwender „Speichern" wählt und die Buchung gelingt, dann öffnet sich die Druckvorschau mit dem Abgabe-Beleg dieser 3 Artikel in der Gruppe „Registriert". · Aussage
- **AC-07** Gegeben ein Freigabe-Vorgang für 2 Artikel, wenn die Freigabe gelingt, dann öffnet sich die Druckvorschau mit dem Abgabe-Beleg dieser 2 Artikel in der Gruppe „Im Verkauf". · Aussage
- **AC-08** Gegeben eine geöffnete Druckvorschau, wenn der Anwender sie schließt, dann zeigt die App wieder die Seite mit allen Elementen und der Anwender kann sie normal bedienen. · Aussage
- **AC-09** Gegeben ein Verkäufer mit 3 Artikeln „Im Verkauf", 2 „Verkauft", 1 „Zurückgegeben" und 2 „Registriert", wenn der Anwender das Drucker-Icon anklickt, dann zeigt der Beleg 6 Artikelzeilen in den Gruppen „Im Verkauf", „Verkauft", „Zurückgegeben" in dieser Reihenfolge, „Anzahl abgegebener Artikel" lautet 6 und die „Registriert" fehlen. · Aussage
- **AC-10** Gegeben Artikel mit den Nummern 12, 5 und 9 in derselben Gruppe, wenn der Beleg gedruckt wird, dann stehen sie in der Reihenfolge 5, 9, 12. · Aussage
- **AC-11** Gegeben ein gedruckter Abgabe-Beleg, wenn Seite 1 betrachtet wird, dann zeigt sie von oben nach unten: Kopfzeile, Verkäufer-Block mit QR-Code, Zeile A der Kennzahl-Kacheln, Zeile B, Freitext 3, Artikelliste und Fußzeile. · Anhang
- **AC-12** Gegeben Freitext 1 „A", Freitext 2 „B" und der Druck am 14.10.2026 um 09:30, wenn der Beleg gedruckt wird, dann steht in der Kopfzeile „A" linksbündig, „B" zentriert und „14.10.2026, 09:30" rechtsbündig. · Anhang
- **AC-13** Gegeben ein Verkäufer „Anna Meier", Musterstraße 5, 76133 Karlsruhe, Telefon und E-Mail gepflegt, wenn der Beleg gedruckt wird, dann stehen im Verkäufer-Block „Anna Meier", „Musterstraße 5" und „76133 Karlsruhe" in einer Zeile, Telefon und E-Mail stehen nirgends. · Aussage
- **AC-14** Gegeben ein Verkäufer mit der ID „a3f9c2d1", wenn der Beleg gedruckt wird, dann zeigt der QR-Code den String „a3f9c2d1" und „a3f9c2d1" steht zusätzlich als Text in Zeile A. · Anhang
- **AC-15** Gegeben 4 gedruckte Artikel und Gebühr 0,50 € pro Artikel, wenn der Beleg gedruckt wird, dann zeigt die Gebühr-Kachel den Titel „Gebühr 0,50 € / Artikel" und den Wert „2,00 €". · Aussage
- **AC-16** Gegeben ein Provisionssatz von 20 %, wenn der Abgabe-Beleg gedruckt wird, dann zeigt die Provision-Kachel den Titel „Provision" und den Wert „20 %". · Aussage
- **AC-17** Gegeben ein Abgabe-Beleg, wenn Zeile B betrachtet wird, dann ist sie halb so hoch wie Zeile A. · Aussage
- **AC-18** Gegeben Freitext 3 mit einer Überschrift, einem fett gesetzten Wort, einem kursiven Wort, einer Liste und einer Tabelle, wenn der Beleg gedruckt wird, dann erscheinen alle fünf Elemente formatiert und nicht als Markdown-Zeichen. · Aussage
- **AC-19** Gegeben Freitext 3 mit einem Link, einem Bild und einem HTML-Tag, wenn der Beleg gedruckt wird, dann erscheint weder ein klickbarer Link noch ein Bild noch ein ausgeführtes HTML-Element. · Aussage
- **AC-20** Gegeben Freitext 3 ist leer, wenn der Beleg gedruckt wird, dann beginnt die Artikelliste direkt unter Zeile B. · Aussage
- **AC-21** Gegeben Freitext 1 und Freitext 5 sind leer, wenn der Beleg gedruckt wird, dann bleiben die zugehörigen Felder in Kopf- und Fußzeile leer und behalten ihren Platz. · Aussage
- **AC-22** Gegeben ein Verkäufer mit 80 Artikeln, wenn der Beleg gedruckt wird, dann umfasst er mehr als eine Seite, jede Seite trägt die Kopfzeile und die Fußzeile mit „Seite x von y" und der Tabellenkopf wiederholt sich auf jeder Seite. · Aussage
- **AC-23** Gegeben ein mehrseitiger Beleg, wenn Seite 2 betrachtet wird, dann zeigt sie nach der Kopfzeile eine Zeile mit Verkäufer-ID und Anschrift in voller Breite, darunter die Artikelliste. Kennzahl-Kacheln, QR-Code und Freitext 3 stehen nur auf Seite 1. · Aussage
- **AC-24** Gegeben ein Beleg, wenn die Druckvorschau öffnet, dann ist das Papierformat DIN A4 hochkant. · Aussage
- **AC-25** Gegeben ein Admin, wenn er die Einstellungen öffnet, dann sieht er für Abgabe-Beleg und Verkäufer-Übersicht je fünf Freitext-Eingabefelder, jedes mit Markdown nutzbar, und kann sie speichern. · Aussage
- **AC-26** Gegeben ein gespeicherter Freitext, wenn der nächste Beleg gedruckt wird, dann erscheint der neue Text. · Aussage
- **AC-27** Gegeben ein Nutzer ohne Admin-Rolle, wenn er die Einstellungen aufrufen will, dann sieht er die Freitext-Felder nicht. · Aussage
- **AC-28** Gegeben eine Abrechnung, wenn der Anwender den Druck auslöst, dann öffnet sich die Druckvorschau mit der Verkäufer-Übersicht und ohne Seitenelemente der App. · Aussage
- **AC-29** Gegeben eine Verkäufer-Übersicht, wenn Seite 1 betrachtet wird, dann zeigt Zeile A die Kennzahl-Kacheln Verkäufer-ID, Anzahl abgegebener Artikel, Anzahl offener Artikel, Anzahl verkaufter Artikel und Einnahmen, Zeile B die Kacheln Gebühr, Provision und Verdienst. · Aussage
- **AC-30** Gegeben ein Umsatz von 200,00 € und ein Provisionssatz von 20 %, wenn die Verkäufer-Übersicht gedruckt wird, dann zeigt die Kachel Einnahmen „200,00 €", die Kachel „Provision 20 %" den Wert „40,00 €" und die Kachel Verdienst „160,00 €". · Aussage
- **AC-31** Gegeben 3 Artikel „Im Verkauf", 2 „Verkauft" und 2 „Registriert", wenn die Verkäufer-Übersicht gedruckt wird, dann sind „Anzahl offener Artikel" 3, „Anzahl verkaufter Artikel" 2, die Registriert fehlen in der Liste und die Gruppen stehen in der Reihenfolge „Im Verkauf", „Verkauft", „Zurückgegeben". · Aussage
- **AC-32** Gegeben der Freitext 3 der Verkäufer-Übersicht ist leer und der Freitext 3 des Abgabe-Belegs gepflegt, wenn beide gedruckt werden, dann erscheint der gepflegte Text nur im Abgabe-Beleg. · Aussage

## Entscheidungen
- **W · Fehler Druckvorschau** · Aussage — Die Browser-Vorschau zeigt heute den Seiteninhalt statt des Belegs. Das Ziel ist ein Dokument ohne Seitenelemente.
- **W · Druckbutton Kachel** · Aussage — Drucker-Icon, sichtbar für alle, aktiv auch ohne Artikel.
- **W · Geräte** · Aussage — Der Druckdialog des Geräts genügt, „Als PDF speichern" zählt.
- **W · Name** · Aussage — „Abgabe-Beleg" bleibt. Neu ist „Kennzahl-Kachel" für den Infoblock auf dem Beleg.
- **W · Auslöser und Artikelmenge** · Aussage — Druckbutton: alle außer „Registriert". Speichern: gebuchte Artikel inklusive „Registriert". Freigabe: freigegebene Artikel.
- **W · Reihenfolge** · Aussage — Status-Gruppen „Im Verkauf", „Verkauft", „Zurückgegeben", Nummer aufsteigend.
- **W · Layout** · Anhang — Kopfzeile, Verkäufer-Block, zwei Zeilen Kennzahl-Kacheln, Freitext 3, Artikelliste, Fußzeile. Ab Seite 2 gekürzter Kopf.
- **W · Freitexte** · Aussage — Fünf je Vorlage, Markdown mit Tabellen, ohne Links, Bilder, HTML. Pflege durch Admin in den Einstellungen.
- **W · Gebühr und Provision** · Aussage — Berechnete Gebühr, Satz als Provision im Abgabe-Beleg.
- **W · Verkäufer-Übersicht** · Aussage — Dieselbe Basis, mehr Kacheln, Verdienst ersetzt die Auszahlung, Unterschied vorläufig/endgültig entfällt.
- **W · Format und Zeit** · Aussage — DIN A4 hochkant, Zeitpunkt des Drucks.
- **W · Adresse** · Aussage — Straße sowie Postleitzahl und Ort. Telefon und E-Mail entfallen.
- **W · Fehlerfall** · Aussage — Eine sichtbare Fehlermeldung, keine Vorschau.
