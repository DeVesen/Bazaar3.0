# Etiketten-Vordruck (Haupt-App)

Status: bestätigt am 2026-11-02
Art: verankert
Basis: 0eb693b9

## Was, wie, wo, warum
Im Basar-Betrieb der Haupt-App werden Etiketten auf die Artikel geklebt. Sie werden vorab als Blanko-Vordrucke auf Etikettenbögen gedruckt (Avery); größere Verkäufer bekommen sie vor dem Basartag und bekleben und beschriften sie selbst. Bei der Artikelerfassung wird der Preis von Hand auf das Etikett geschrieben, die Artikelnummer gescannt oder abgetippt. · Aussage

Neu ist die Seite „Etiketten-Vordruck": ein eigener Menüeintrag in der Gruppe „System" der Haupt-App, direkt über „Einstellungen", nur für Admin. Die Seite steht für sich und hat keinen Bezug zu Artikeln: Die Nummern sind fortlaufende Zahlen ohne Prüfung, Reservierung oder Verkäuferzuordnung. · Aussage

Die Seite hat drei Bereiche. Jeder Bereich zeigt links die Eingaben (ein Drittel der Breite) und rechts die Vorschau (zwei Drittel), die mit der Breite ihres Containers skaliert. · Aussage
- **Bereich A, Bogenformat:** Etikettgröße (Etikettbreite, Etiketthöhe), Bogengröße (Bogenbreite, Bogenhöhe), leerer Rand (oben, rechts, unten, links), Abstand zwischen den Etiketten (waagerecht, senkrecht), Spalten und Zeilen; die Anzahl Etiketten pro Seite ist Spalten × Zeilen und wird berechnet angezeigt. Alle Maße in mm. Bogenformate lassen sich unter einem Namen speichern, über ein Auswahlfeld laden, überschreiben und löschen. Die Vorschau zeigt den Bogen mit Rand und Etikettenraster. · Aussage
- **Bereich B, Etiketten-Inhalt (pro Druck):** Startnummer, Anzahl Etiketten, Verkäufer-Symbol, Logo, Währungssymbol (Standard „€"). Verkäufer-Symbol und Logo wählt man aus einer Icon-Liste oder lädt ein eigenes Bild hoch. Das Währungssymbol ist reiner Text (1 bis 3 Zeichen). Die Vorschau zeigt ein einzelnes Etikett mit allen Elementen. · Aussage
- **Bereich C, Angebrochener Bogen:** Ein Eingabefeld „Startposition" für den ersten Bogen. Die Plätze davor bleiben leer und erscheinen in der Vorschau ausgegraut. · Aussage

Aufbau eines Etiketts (105 × 35 mm, quer): Eine senkrechte Mittellinie ist die Falzlinie (manche Etiketten werden um einen Kabelbinder gefaltet, z. B. an Jacken). Links stehen der QR-Code (kodiert die Artikelnummer) mit der Artikelnummer im Klartext darunter, QR-Code und Klartext sind derselbe Wert, und neben dem QR-Code das Logo. Rechts steht das Preisfeld: eine Schreiblinie plus Währungssymbol. Das Verkäufer-Symbol steht oben rechts und unten links. · Aussage

Ausgegeben wird über den Druckdialog des Browsers, wie bei den Belegen; die Seite weist auf „Skalierung 100 %, keine Seitenränder" hin. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Admin öffnet „Etiketten-Vordruck", wählt oder erfasst ein Bogenformat, trägt Startnummer, Anzahl, Symbol, Logo und Währung ein und gibt bei einem angebrochenen Bogen die Startposition an. Mit „Drucken" öffnet sich der Druckdialog mit allen Etikettenbögen. Die Etiketten werden zeilenweise gesetzt (in der Zeile von links nach rechts, dann die nächste Zeile); die Nummern laufen in derselben Reihenfolge ab der Startnummer hoch. Folgebögen beginnen bei Platz 1. Beispiel 16er-Bogen (2 Spalten × 8 Zeilen): Zeile 1 = Platz 1 und 2, Zeile 2 = Platz 3 und 4; Startposition 7 beginnt in Zeile 4 links. · Aussage

Bogenformate und eigene Bilder liegen im Backend und stehen auf jedem Gerät zur Verfügung. Logo, Verkäufer-Symbol und Währungssymbol des letzten Drucks sind beim nächsten Öffnen vorbelegt; Startnummer, Anzahl und Startposition nie. · Aussage

## Soll-Vorgaben
- Alle Maße sind in mm; Etikettgröße und Bogengröße > 0, Ränder und Abstände ≥ 0, höchstens eine Nachkommastelle; Spalten und Zeilen ganzzahlig ≥ 1. Die Grenze „Maße > 0" aus der Entscheidung zu den Eingabegrenzen gilt für Etikettgröße und Bogengröße; Ränder und Abstände dürfen 0 sein, die Grenze „höchstens eine Nachkommastelle" gilt für alle Maße. · Aussage
- Ein Bogenformat ist widersprüchlich, wenn Spalten × Etikettbreite + (Spalten − 1) × waagerechter Abstand + Rand links + Rand rechts die Bogenbreite um mehr als 0,5 mm übersteigt, oder Zeilen × Etiketthöhe + (Zeilen − 1) × senkrechter Abstand + Rand oben + Rand unten die Bogenhöhe um mehr als 0,5 mm übersteigt. · Aussage
- Startnummer 1 bis 2147483646, und Startnummer + Anzahl − 1 höchstens 2147483646; Anzahl Etiketten 1 bis 5000; Währungssymbol 1 bis 3 Zeichen; Startposition 1 bis Anzahl pro Seite, leer = 1. · Aussage
- Eigene Bilder: PNG, JPEG oder SVG, höchstens 1 MB. · Aussage
- Die Falzlinie erscheint nur in der Vorschau, nicht im Druck. · Aussage
- Inhalt eines Etiketts skaliert mit der Etikettgröße; die Maße 105 × 35 mm sind der Maßstab 1. Bei anderem Seitenverhältnis gilt das kleinere der beiden Verhältnisse. · ungeklärt
- Die Bogenformat-Namen sind eindeutig (exakt gleicher Name = gleiches Format). Beim Start ist kein Bogenformat gespeichert; die Felder sind mit Avery 16er vorbelegt (A4 210 × 297, Etikett 105 × 35, Ränder oben/unten 8,5, links/rechts 0, Abstand 0, 2 Spalten × 8 Zeilen). · Aussage
- Die Seite prüft keine Nummern gegen Artikel und legt keine Artikel an oder ändert sie. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben ein angemeldeter Admin, wenn er das Menü der Haupt-App öffnet, dann steht „Etiketten-Vordruck" in der Gruppe „System" direkt über „Einstellungen". · Aussage
- **AC-02** Gegeben ein angemeldeter Benutzer mit der Rolle Kassenpersonal, wenn er das Menü öffnet oder die Adresse der Seite aufruft, dann sieht er keinen Menüeintrag „Etiketten-Vordruck" und gelangt nicht auf die Seite. · Aussage
- **AC-03** Gegeben die geöffnete Seite, wenn sie angezeigt wird, dann zeigen die Bereiche A, B und C je links die Eingaben mit einem Drittel und rechts die Vorschau mit zwei Dritteln der Breite. · Aussage
- **AC-04** Gegeben die Seite bei erstem Öffnen ohne gespeichertes Bogenformat, wenn Bereich A erscheint, dann zeigt er A4 210 × 297, Etikett 105 × 35, Ränder oben 8,5 / rechts 0 / unten 8,5 / links 0, Abstand 0 / 0, 2 Spalten, 8 Zeilen und „16 Etiketten pro Seite" (nicht editierbar). · Aussage
- **AC-05** Gegeben Bereich A, wenn der Admin einen Wert ändert, dann zeigt die Vorschau sofort den Bogen mit dem Rand und dem Raster aus Spalten × Zeilen. · Aussage
- **AC-06** Gegeben Bogenbreite 210, Ränder links/rechts 0, Etikettbreite 105, wenn der Admin 3 Spalten einträgt, dann erscheint ein Fehler am Feld und „Speichern" und „Drucken" sind gesperrt. · Aussage
- **AC-07** Gegeben das Avery-16er-Format, wenn der Admin Rand oben auf 8,9 setzt (Summe 297,4 mm), dann erscheint kein Fehler; bei 9,1 (Summe 297,6 mm) erscheint ein Fehler am Feld und „Speichern" und „Drucken" sind gesperrt. · Aussage
- **AC-08** Gegeben ein Maßfeld in Bereich A, wenn der Admin 0 für Etikettgröße oder Bogengröße, einen Wert mit zwei Nachkommastellen, einen negativen Rand oder 0 Spalten einträgt, dann erscheint ein Fehler am Feld und „Speichern" und „Drucken" sind gesperrt. · Aussage
- **AC-09** Gegeben ein gültiges Bogenformat und der Name „Avery 12er", wenn der Admin „Speichern" wählt, dann erscheint „Avery 12er" im Auswahlfeld und ist nach Neuladen der Seite sowie auf einem anderen Gerät vorhanden. · Aussage
- **AC-10** Gegeben gespeicherte Bogenformate, wenn der Admin eines im Auswahlfeld wählt, dann füllen sich alle Felder von Bereich A mit dessen Werten und die Vorschau passt sich an. · Aussage
- **AC-11** Gegeben ein gespeichertes Bogenformat „Avery 12er", wenn der Admin unter exakt diesem Namen speichert, dann fragt die Seite „Überschreiben?"; bei Bestätigung ersetzt das neue Format das alte, bei Abbruch bleibt das alte unverändert. · Aussage
- **AC-12** Gegeben ein gespeichertes Bogenformat, wenn der Admin „Löschen" wählt und bestätigt, dann ist das Format nicht mehr im Auswahlfeld; ohne Bestätigung bleibt es erhalten. · Aussage
- **AC-13** Gegeben Bereich A, wenn der Name leer ist, dann ist „Speichern" gesperrt. · Aussage
- **AC-14** Gegeben ein erstes Öffnen ohne gemerkte Werte, wenn Bereich B erscheint, dann ist das Währungssymbol „€", das Logo leer, das Verkäufer-Symbol leer, und Startnummer sowie Anzahl sind leer. · Aussage
- **AC-15** Gegeben Bereich B, wenn der Admin für Verkäufer-Symbol oder Logo ein eigenes Bild als PNG, JPEG oder SVG bis 1 MB wählt, dann zeigt die Vorschau das Bild; bei einer anderen Dateiart oder über 1 MB erscheint eine Fehlermeldung und das Bild wird nicht übernommen. · Aussage
- **AC-16** Gegeben Bereich B, wenn der Admin für Verkäufer-Symbol oder Logo ein Icon aus der Icon-Liste wählt, dann zeigt die Vorschau dieses Icon. · Aussage
- **AC-17** Gegeben ein Druck mit Logo X, Symbol Y und Währungssymbol „$", wenn der Admin die Seite danach auf einem anderen Gerät öffnet, dann sind X, Y und „$" vorbelegt, Startnummer, Anzahl und Startposition sind leer. · Aussage
- **AC-18** Gegeben Startnummer 1000 und das Avery-16er-Format, wenn Bereich B die Vorschau zeigt, dann zeigt sie ein Etikett mit QR-Code links und dem Klartext „1000" direkt darunter, dem Logo neben dem QR-Code, der Schreiblinie plus Währungssymbol rechts und dem Verkäufer-Symbol oben rechts und unten links. · Aussage
- **AC-19** Gegeben ein Etikett mit Nummer 1000, wenn der QR-Code gescannt wird, dann liefert er genau „1000" ohne weitere Zeichen. · Aussage
- **AC-20** Gegeben die Vorschau des Etiketts, wenn sie angezeigt wird, dann ist die senkrechte Mittellinie (Falzlinie) sichtbar; im Druck erscheint sie nicht. · Aussage
- **AC-21** Gegeben die Etikettgröße 52,5 × 17,5 mm (halb so groß wie 105 × 35), wenn die Vorschau erscheint, dann ist jedes Element halb so groß wie bei 105 × 35 mm. · Aussage
- **AC-22** Gegeben das Avery-16er-Format, Startnummer 1000, Anzahl 4 und Startposition 7, wenn der Admin druckt, dann stehen auf dem Bogen 1000 in Zeile 4 links, 1001 in Zeile 4 rechts, 1002 in Zeile 5 links, 1003 in Zeile 5 rechts, und die Plätze 1 bis 6 bleiben leer. · Aussage
- **AC-23** Gegeben das Avery-16er-Format, Startnummer 1000, Anzahl 4 und leere Startposition, wenn der Admin druckt, dann stehen 1000 und 1001 in Zeile 1, 1002 und 1003 in Zeile 2. · Aussage
- **AC-24** Gegeben das Avery-16er-Format, Startnummer 1000, Anzahl 12 und Startposition 7, wenn der Admin druckt, dann trägt Bogen 1 die Plätze 7 bis 16 mit 1000 bis 1009, und Bogen 2 trägt die Plätze 1 und 2 mit 1010 und 1011. · Aussage
- **AC-25** Gegeben Startposition, wenn die Vorschau von Bereich C erscheint, dann sind die Plätze vor der Startposition ausgegraut. · Aussage
- **AC-26** Gegeben das Avery-16er-Format, wenn der Admin als Startposition 0 oder 17 einträgt, dann erscheint ein Fehler am Feld und „Drucken" ist gesperrt. · Aussage
- **AC-27** Gegeben Bereich B, wenn der Admin Startnummer 0, Startnummer 2147483647, Anzahl 0, Anzahl 5001, ein Währungssymbol mit 4 Zeichen oder ein leeres Währungssymbol einträgt, dann erscheint ein Fehler am Feld und „Drucken" ist gesperrt. · Aussage
- **AC-28** Gegeben Bereich B, wenn der Admin Startnummer 2147483000 und Anzahl 1000 einträgt, dann erscheint ein Fehler am Feld und „Drucken" ist gesperrt. · Aussage
- **AC-29** Gegeben eine gültige Eingabe in allen Bereichen, wenn der Admin „Drucken" wählt, dann öffnet sich der Druckdialog des Browsers mit allen Etikettenbögen; die Seite zeigt den Hinweis „Skalierung 100 %, keine Seitenränder". · Aussage
- **AC-30** Gegeben die Seite, wenn sie die Nummer 1000 druckt und ein Artikel mit Nummer 1000 existiert oder nicht, dann druckt sie in beiden Fällen ohne Fehler und legt keinen Artikel an und ändert keinen. · Aussage
- **AC-31** Gegeben die geöffnete Seite, wenn sich die Breite des Vorschau-Bereichs ändert (z. B. Fenster halbiert), dann ändert sich die Vorschau proportional mit, bleibt vollständig sichtbar und behält das Seitenverhältnis des Bogens bzw. Etiketts. · Aussage
- **AC-32** Gegeben die Etikettgröße 105 × 17,5 mm (Breite wie Maßstab, Höhe halb so groß), wenn die Vorschau erscheint, dann ist jedes Element halb so groß wie bei 105 × 35 mm (kleineres Verhältnis 0,5) und liegt vollständig innerhalb des Etiketts. · Aussage

## Entscheidungen
- **W · Menü-Position** · Aussage — Eigener Eintrag in der Gruppe „System" direkt über „Einstellungen" (Q1).
- **W · Rolle** · Aussage — Nur Admin (Q2).
- **W · Anzahl pro Seite** · Aussage — Spalten und Zeilen sind Eingaben, die Anzahl pro Seite wird berechnet (Q3).
- **W · Bogengröße** · Aussage — Breite und Höhe einstellbar, Vorgabe A4 (Q4).
- **W · Abstand** · Aussage — Abstand waagerecht und senkrecht einstellbar, Vorgabe 0 (Q5).
- **W · Persistenz Inhalt** · Aussage — Logo, Verkäufer-Symbol, Währungssymbol bleiben als letzte Werte gespeichert; Startnummer, Anzahl, Startposition nie (Q6).
- **W · Speicherort** · Aussage — Bogenformate und eigene Bilder im Backend (Q7).
- **W · Ausgabe** · Aussage — Browser-Druckdialog wie bei den Belegen, mit Hinweis auf 100 % Skalierung (Q8).
- **W · Bilder** · Aussage — PNG, JPEG, SVG bis 1 MB (Q9).
- **W · Falzlinie** · Aussage — nur in der Vorschau (Q10).
- **W · Skalierung** · Aussage — Etikett-Inhalt skaliert proportional mit der Etikettgröße (Q11).
- **W · Toleranz** · Aussage — Maße-Widerspruch mit 0,5 mm Toleranz (Q12).
- **W · Eingabegrenzen** · Aussage — Startnummer 1 bis 2147483646, Anzahl 1 bis 5000, Währung höchstens 3 Zeichen, Maße > 0 mit einer Nachkommastelle (Q13).
- **W · Bogenformat-Verwaltung** · Aussage — Eindeutiger Name, Überschreiben mit Rückfrage, Löschen mit Bestätigung, kein vorinstalliertes Format (Q14).
- **W · Startposition-Grenze** · Aussage — 1 bis Anzahl pro Seite, leer = 1 (Q15).
- **W · Begriffe** · Aussage — Etikett, Etikettenbogen, Bogenformat, Etiketten-Vordruck, Startposition, Verkäufer-Symbol in `CONTEXT.md` (Q16).
- **W · Startposition-Lesart** · Aussage — Position des ersten gedruckten Etiketts, nicht Anzahl verbrauchter Plätze.
- **W · Icon-Liste** · Aussage — Verkäufer-Symbol und Logo werden aus einer festen Icon-Liste gewählt.
- **W · Logo-Vorbelegung** · Aussage — Beim ersten Öffnen ist das Logo leer; ein Maskottchen-Bild wird nicht mitgeliefert.
- **W · Maßbegriffe** · Aussage — Etikettbreite und Etiketthöhe, Bogenbreite und Bogenhöhe; „Etikettgröße" ist der Sammelbegriff.
- **W · Währungssymbol** · Aussage — Das Währungssymbol ist reiner Text, kein Bild.
- **W · Sperre** · Aussage — Bei ungültiger Eingabe ist die Schaltfläche sofort gesperrt, der Fehler steht am Feld.
- **W · Klartext-Lage** · Aussage — Der Klartext steht unter dem QR-Code, das Logo neben dem QR-Code.
- **R1 · AC-03** — geändert — Neues Verhalten, Beleg: Spec · Was, wie, wo, warum — Das Skalieren der Vorschau mit der Breite ihres Containers ist dort festgelegt, aber von keinem Kriterium abgedeckt; neues Kriterium AC-31 prüft es beobachtbar.
- **R1 · Soll-Vorgaben** — geändert — Neues Verhalten, Beleg: Spec · Soll-Vorgaben — Die Regel „bei anderem Seitenverhältnis gilt das kleinere der beiden Verhältnisse" ist dort festgelegt, AC-21 deckt nur gleiches Seitenverhältnis ab; neues Kriterium AC-32 prüft den Fall 105 × 17,5 mm.
- **R2 · Soll-Vorgaben** — geändert — Klarstellung: Der Widerspruch zwischen „Ränder und Abstände ≥ 0" und „Maße > 0" der Entscheidung Eingabegrenzen löst sich aus der Spec selbst: Die Entscheidung Abstand legt die Vorgabe 0 fest, die Entscheidung Maßbegriffe nennt nur Etikett- und Bogengröße als Maße, und das Standardformat (AC-04, AC-07) setzt Ränder 0 voraus. Die Soll-Vorgabe hält jetzt fest, dass „> 0" nur für Etikett- und Bogengröße gilt; der W-Eintrag bleibt unverändert.
