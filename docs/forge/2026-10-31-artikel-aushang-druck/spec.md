# Artikel-Aushang drucken

Status: Entwurf — wartet auf Bestätigung
Art: verankert
Basis: 3e77fcc

## Was, wie, wo, warum
Die Artikel-Seite der Haupt-App (`/articles`, [Epic_Artikel](../../requirements/bazaar-app/epics/Epic_Artikel/epic.md)) bekommt einen Button „Drucken". Er druckt alle Artikel, die zu den aktiven Filtern passen, als „Artikel-Aushang": eine nach Kategorie gruppierte Liste, die der Betreiber als PDF online veröffentlichen kann. · Aussage

Der Aushang ist ein drittes Druckdokument neben Abgabe-Beleg und Verkäufer-Übersicht ([`print-document`](../../requirements/bazaar-app/components/print-document.md), [Epic_Druckfunktionen](../../requirements/bazaar-app/epics/Epic_Druckfunktionen/epic.md)). Er nutzt dieselbe Basis (A4-Dokument, Druckdialog des Geräts, Markdown-Freitexte), hat aber kein Kennzahl-Kachel-Raster und keinen Verkäufer-Bezug. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender stellt in den Filtern z. B. den Status „Im Verkauf" ein und klickt auf „Drucken". Es öffnet sich der Druckdialog des Geräts mit einer Vorschau, die nur den Aushang zeigt. Darin stehen alle Artikel im Verkauf, nach Kategorie gruppiert, unabhängig davon, wie viele davon die Tabelle auf der aktuellen Seite zeigt. Der Anwender druckt oder wählt „Als PDF speichern". · Aussage

## Soll-Vorgaben
- Der Button „Drucken" steht auf der Artikel-Seite neben dem Filter-Panel. Er ist für Admin und Kassenpersonal sichtbar. · Aussage
- Bei leerem Filterergebnis ist der Button deaktiviert. · Aussage
- Gedruckt werden **alle** Artikel des Filterergebnisses. Die Paginierung der Tabelle gilt nicht. Berücksichtigt werden Freitext, Marke, Kategorie und Status. Die Sortierung der Tabelle hat keinen Einfluss. · Aussage
- Die Artikel sind nach Kategorie gruppiert, eine Überschrift je Kategorie. Die Kategorien sind alphabetisch sortiert. Eine Gruppe „Ohne Kategorie" gibt es nicht, weil die Kategorie bei der Anlage Pflicht ist. Kategorien ohne Artikel im Ergebnis erscheinen nicht. · Aussage
- Innerhalb einer Kategorie sind die Artikel sortiert nach Marke, dann Größe, dann Farbe, dann Bezeichnung. Die Größe wird natürlich sortiert (z. B. 86 vor 104). · Aussage
- Die Spalten sind Bezeichnung, Marke, Farbe, Größe, Preis. Es gibt keine Artikelnummer. Der Preis ist rechtsbündig mit Euro-Format. · Aussage
- Es gibt keine Summen, keine Anzahl und keine Kennzahl-Kacheln. Die aktiven Filter stehen nicht im Dokument. · Aussage
- Format ist DIN A4 hochkant. Der Tabellenkopf wiederholt sich auf jeder Seite. Eine Kategorie-Überschrift steht nie allein am Seitenende. · Aussage
- Kopf- und Fußzeile sind je in drei gleich breite Drittel geteilt (33 %). Links linksbündig, Mitte zentriert, rechts rechtsbündig. · Aussage
- Kopfzeile: links Kopf-Freitext links, Mitte Kopf-Freitext Mitte, rechts Datum und Uhrzeit des Drucks. · Aussage
- Fußzeile: links Fuß-Freitext links, Mitte Fuß-Freitext Mitte, rechts „Seite x von y" (als Text im Dokument, nicht als CSS-Zähler). · Aussage
- Die vier Freitexte pflegt ein Admin in den Einstellungen im Bereich der Beleg-Freitexte als eigene Vorlage „Artikel-Aushang". Markdown mit Überschriften, Fett, Kursiv, Absätzen, Listen und Tabellen; Links, Bilder und HTML werden nicht dargestellt. Höchstens 5000 Zeichen je Text. Änderungen gelten ab dem nächsten Druck. · Aussage
- Leere Freitexte bleiben leer, der Platz bleibt. · Aussage
- Lässt sich die Artikelmenge nicht laden, erscheint ein Toast „Artikel konnten nicht geladen werden" und keine Vorschau. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein Nutzer mit Rolle Admin oder Kassenpersonal, wenn er `/articles` öffnet, dann sieht er den Button „Drucken". · Aussage
- **AC-02** Gegeben ein Filterergebnis ohne Artikel, wenn die Seite angezeigt wird, dann ist der Button deaktiviert. · Aussage
- **AC-03** Gegeben der Statusfilter „Im Verkauf" mit 120 passenden Artikeln und 25 Zeilen pro Tabellenseite, wenn der Anwender „Drucken" klickt, dann enthält der Aushang alle 120 Artikel und keinen mit anderem Status. · Aussage
- **AC-04** Gegeben Filter für Freitext, Marke und Kategorie, wenn der Anwender „Drucken" klickt, dann enthält der Aushang genau die Artikel, die auch die Tabelle über alle Seiten zeigt. · Aussage
- **AC-05** Gegeben Artikel der Kategorien „Schuhe", „Hosen" und „Jacken", wenn der Aushang gedruckt wird, dann stehen die Gruppen in der Reihenfolge Hosen, Jacken, Schuhe, jede mit einer Überschrift. · Aussage
- **AC-06** Gegeben Artikel derselben Kategorie, wenn der Aushang gedruckt wird, dann sind sie nach Marke, Größe, Farbe, Bezeichnung aufsteigend sortiert; bei gleicher Marke steht Größe 86 vor 104. · Aussage
- **AC-07** Gegeben ein Artikel, wenn der Aushang gedruckt wird, dann zeigt seine Zeile Bezeichnung, Marke, Farbe, Größe und Preis und keine Artikelnummer. · Aussage
- **AC-08** Gegeben ein gedrucktes Dokument, wenn es betrachtet wird, dann enthält es weder Summen noch Anzahl noch Kennzahl-Kacheln noch eine Filterübersicht. · Aussage
- **AC-09** Gegeben der Druck am 31.10.2026 um 09:30, wenn der Aushang gedruckt wird, dann steht „31.10.2026, 09:30" rechtsbündig im rechten Drittel der Kopfzeile, auf jeder Seite. · Aussage
- **AC-10** Gegeben ein mehrseitiger Aushang, wenn er betrachtet wird, dann steht in jeder Fußzeile rechtsbündig „Seite x von y". · Aussage
- **AC-11** Gegeben die vier Freitexte „A", „B", „C", „D", wenn der Aushang gedruckt wird, dann steht „A" linksbündig und „B" zentriert in der Kopfzeile, „C" linksbündig und „D" zentriert in der Fußzeile, jeweils im linken bzw. mittleren Drittel. · Aussage
- **AC-12** Gegeben ein Freitext mit Überschrift, Fett, Kursiv, Liste und Tabelle, wenn der Aushang gedruckt wird, dann erscheinen sie formatiert. Gegeben ein Freitext mit Link, Bild und HTML-Tag, dann erscheint nichts davon als Link, Bild oder Element. · Aussage
- **AC-13** Gegeben ein Admin, wenn er die Einstellungen öffnet, dann sieht er für den Artikel-Aushang vier Freitext-Felder und kann sie speichern; der nächste Druck zeigt den neuen Text. · Aussage
- **AC-14** Gegeben ein Nutzer ohne Admin-Rolle, wenn er die Einstellungen aufruft, dann sieht er die Freitext-Felder nicht. · Aussage
- **AC-15** Gegeben ein Aushang mit 200 Artikeln, wenn er gedruckt wird, dann umfasst er mehrere Seiten mit Kopfzeile, Fußzeile und wiederholtem Tabellenkopf; keine Kategorie-Überschrift steht allein am Seitenende. · Aussage
- **AC-16** Gegeben die Artikelmenge lässt sich nicht laden, wenn der Anwender „Drucken" klickt, dann erscheint der Toast „Artikel konnten nicht geladen werden" und die Vorschau öffnet sich nicht. · Aussage
- **AC-17** Gegeben das Format, wenn die Vorschau öffnet, dann ist das Papier DIN A4 hochkant und nur der Aushang sichtbar, ohne Navigation oder Seitenelemente. · Aussage

## Offen für die Umsetzung (technisch, keine Fachfrage)
- Wie die Artikelmenge geladen wird: eigener Endpunkt oder `GET /api/articles` mit „alle". Klärt der Plan anhand von `api/articles.md`.
- Reihenfolge der Größen „natürlich" vs. Freitext-Größen (z. B. „XL"): der Plan legt die Regel fest und ergänzt sie hier.

## Entscheidungen
- 2026-10-31: Datum/Uhrzeit oben rechts (Versehen „links" korrigiert), „Seite x von y" unten rechts. Vier Freitexte statt fünf, weil das rechte Drittel belegt ist.
