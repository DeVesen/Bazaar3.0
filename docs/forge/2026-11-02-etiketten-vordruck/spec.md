# Etiketten-Vordruck (Haupt-App)

Status: bestätigt am 2026-11-02
Art: verankert
Basis: 0eb693b9

## Was, wie, wo, warum
Im Basar-Betrieb der Haupt-App werden Etiketten auf die Artikel geklebt. Sie werden vorab als Blanko-Vordrucke auf Etikettenbögen gedruckt (Avery); größere Verkäufer bekommen sie vor dem Basartag und bekleben und beschriften sie selbst. Bei der Artikelerfassung wird der Preis von Hand auf das Etikett geschrieben, die Artikelnummer gescannt oder abgetippt. · Aussage

Neu ist die Seite „Etiketten-Vordruck": ein eigener Menüeintrag in der Gruppe „System" der Haupt-App, direkt über „Einstellungen", nur für Admin. Die Seite steht für sich und hat keinen Bezug zu Artikeln: Die Nummern sind fortlaufende Zahlen ohne Prüfung, Reservierung oder Verkäuferzuordnung. · Aussage

Die Seite hat drei Bereiche. Jeder Bereich zeigt links die Eingaben (ein Drittel der Breite) und rechts die Vorschau (zwei Drittel), die mit der Breite ihres Containers skaliert. · Aussage
- **Bereich A, Bogenformat:** Etikettgröße (Etikettbreite, Etiketthöhe), Bogengröße (Bogenbreite, Bogenhöhe), leerer Rand (oben, rechts, unten, links), Abstand zwischen den Etiketten (waagerecht, senkrecht), Spalten und Zeilen; die Anzahl Etiketten pro Seite ist Spalten × Zeilen und wird berechnet angezeigt. Alle Maße in mm. Bogenformate lassen sich unter einem Namen speichern, über ein Auswahlfeld laden, überschreiben und löschen. Die Vorschau zeigt den Bogen mit Rand und Etikettenraster. · Aussage
- **Bereich B, Etiketten-Inhalt (pro Druck):** Startnummer, Anzahl Etiketten, Verkäufer-Symbol, Logo, Währungssymbol (Standard „€"). Verkäufer-Symbol und Logo wählt man aus einer Icon-Liste, aus der Bilder-Bibliothek oder lädt ein eigenes Bild hoch, das dabei in die Bibliothek kommt (Abschnitt „Bilder-Bibliothek“). Das Währungssymbol ist reiner Text (1 bis 3 Zeichen). Nach dem Währungssymbol folgen die Elementgrößen (Abschnitt „Elementgrößen“). Die Vorschau zeigt ein einzelnes Etikett mit allen Elementen. · Aussage
- **Bereich C, Angebrochener Bogen:** Ein Eingabefeld „Startposition" für den ersten Bogen. Die Plätze davor bleiben leer und erscheinen in der Vorschau ausgegraut. · Aussage

Aufbau eines Etiketts (105 × 35 mm, quer): Eine senkrechte Mittellinie ist die Falzlinie (manche Etiketten werden um einen Kabelbinder gefaltet, z. B. an Jacken). Links stehen der QR-Code (kodiert die Artikelnummer) mit der Artikelnummer im Klartext darunter (groß, unten mittig in der linken Hälfte), QR-Code und Klartext sind derselbe Wert, und neben dem QR-Code das Logo. Rechts steht das Preisfeld: eine Schreiblinie plus Währungssymbol. Das Verkäufer-Symbol steht oben rechts und unten links. · Aussage

Ausgegeben wird über den Druckdialog des Browsers, wie bei den Belegen; die Seite weist auf „Skalierung 100 %, keine Seitenränder" hin. · Aussage

## Bilder-Bibliothek
Ergänzung vom 2026-11-05. Eigene Bilder für Logo und Verkäufer-Symbol sammelt eine gemeinsame Bibliothek im Backend (nur Admin). Wer in Bereich B ein eigenes Bild hochlädt, legt es dort ab und wählt es für das Feld; später wählt er es bei Logo oder Verkäufer-Symbol erneut aus. Im Picker erscheint dafür der Abschnitt „Bibliothek“ mit Vorschaubild und Namen je Bild und der Anzeige „{n} von 50 Bildern“; er erscheint nur, wenn mindestens ein Bild vorhanden ist. Ein Bild, das noch nicht geladen ist, steht als deaktivierter Button mit seinem Namen da. Jedes Bild hat einen Lösch-Button („Bild „{Name}“ löschen“) mit Bestätigung. · Aussage

Die Bibliothek ist **Kopierquelle, keine Referenz**: Wählen kopiert das Bild in das Etikett und in die gemerkten Werte des letzten Drucks; es gibt keinen Verweis auf das Bibliotheks-Bild. · Aussage

Soll-Vorgaben der Bibliothek:
- Bilder: PNG, JPEG oder SVG, höchstens 1 MB (wie AC-15); Name 1 bis 50 Zeichen, an den Enden getrimmt, vorgeschlagen wird der Dateiname ohne Endung, kein Umbenennen. · Aussage
- Höchstens 50 Bilder; eine gemeinsame Bibliothek für Logo und Verkäufer-Symbol. Bei gleichzeitigen Uploads kann die Grenze kurzzeitig um wenige Bilder überschritten werden; für einen lokalen Admin bewusst hingenommen. · Aussage
- Inhaltsgleiche Bilder (SHA-256 der Bildbytes) legen keinen zweiten Eintrag an; das vorhandene Bild wird gewählt, auch bei voller Bibliothek. · Aussage
- Beim ersten Start nach dem Update werden Bilder, die schon als Logo oder Verkäufer-Symbol gemerkt sind, mit den Namen „Logo“ bzw. „Verkäufer-Symbol“ in die Bibliothek übernommen, sofern ihr Inhalt dort fehlt. · Aussage
- Meldungen: Bibliothek voll → „Bibliothek voll“ / „Bitte zuerst ein Bild löschen.“; Upload-Fehler → „Bild nicht übernommen“; Löschfehler → „Bild konnte nicht gelöscht werden“; Lösch-Bestätigung „Bild löschen“ / „Bild „{Name}“ aus der Bibliothek löschen?“ mit „Löschen“ und „Abbrechen“. · Aussage
- Alle Endpunkte der Bibliothek sind nur für Admin; Kassenpersonal erhält 403. · Aussage

## Elementgrößen
Ergänzung vom 2026-11-05. Im Bereich B stehen nach „Währungssymbol“ vier Pflichtfelder: „Größe QR-Code (mm)“, „Größe Verkäufer-Symbol (mm)“, „Höhe Artikel-Nummer (mm)“ und „Höhe Währungssymbol (mm)“. Gültig sind 0,1 bis 100 mm mit höchstens einer Nachkommastelle (Fehler „Zahl von 0,1 bis 100 mit höchstens 1 Nachkommastelle“); Vorgaben 21,5 / 5 / 10,5 / 12. Die Werte gelten absolut in mm auf dem gedruckten Etikett, sie skalieren nicht mit der Etikettgröße. Sie werden wie Logo, Verkäufer-Symbol und Währungssymbol mit dem letzten Druck gemerkt. · Aussage

Lage der Elemente: Der QR-Code steht oben links 1,5 mm vom linken und oberen Rand und wächst nach unten rechts. Das Verkäufer-Symbol oben rechts ist rechts und oben verankert, das unten links unten und links; beide haben dieselbe Größe. Die Artikel-Nummer bleibt horizontal zentriert, ihre Unterkante steht fest, die Schrift ist so hoch wie das Feld. Das Währungssymbol steht rechtsbündig mit demselben rechten Rand wie das Symbol oben rechts, die Schrift ist so hoch wie das Feld; die Schreiblinie links davon schrumpft auf den verbleibenden Platz. Das Logo hat kein Größenfeld: Es füllt die Fläche zwischen rechter Kante des QR-Codes + 1,5 mm, Falzlinie − 1,5 mm, oberem Rand + 1,5 mm und Oberkante der Artikel-Nummer − 1,5 mm, so groß wie möglich, nie verzerrt und zentriert; ohne Fläche entfällt es. Es gibt keine Kollisionsprüfung, Elemente dürfen sich überlappen. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Admin öffnet „Etiketten-Vordruck", wählt oder erfasst ein Bogenformat, trägt Startnummer, Anzahl, Symbol, Logo und Währung ein und gibt bei einem angebrochenen Bogen die Startposition an. Mit „Drucken" öffnet sich der Druckdialog mit allen Etikettenbögen. Die Etiketten werden zeilenweise gesetzt (in der Zeile von links nach rechts, dann die nächste Zeile); die Nummern laufen in derselben Reihenfolge ab der Startnummer hoch. Folgebögen beginnen bei Platz 1. Beispiel 16er-Bogen (2 Spalten × 8 Zeilen): Zeile 1 = Platz 1 und 2, Zeile 2 = Platz 3 und 4; Startposition 7 beginnt in Zeile 4 links. · Aussage

Bogenformate und die Bilder-Bibliothek liegen im Backend und stehen auf jedem Gerät zur Verfügung. Logo, Verkäufer-Symbol, Währungssymbol und Elementgrößen des letzten Drucks sind beim nächsten Öffnen vorbelegt; Startnummer, Anzahl und Startposition nie. · Aussage

## Soll-Vorgaben
- Alle Maße sind in mm; Etikettgröße und Bogengröße > 0, Ränder und Abstände ≥ 0, höchstens eine Nachkommastelle; Spalten und Zeilen ganzzahlig ≥ 1. Die Grenze „Maße > 0" aus der Entscheidung zu den Eingabegrenzen gilt für Etikettgröße und Bogengröße; Ränder und Abstände dürfen 0 sein, die Grenze „höchstens eine Nachkommastelle" gilt für alle Maße. · Aussage
- Ein Bogenformat ist widersprüchlich, wenn Spalten × Etikettbreite + (Spalten − 1) × waagerechter Abstand + Rand links + Rand rechts die Bogenbreite um mehr als 0,5 mm übersteigt, oder Zeilen × Etiketthöhe + (Zeilen − 1) × senkrechter Abstand + Rand oben + Rand unten die Bogenhöhe um mehr als 0,5 mm übersteigt. · Aussage
- Startnummer 1 bis 2147483646, und Startnummer + Anzahl − 1 höchstens 2147483646; Anzahl Etiketten 1 bis 5000; Währungssymbol 1 bis 3 Zeichen; Startposition 1 bis Anzahl pro Seite, leer = 1. · Aussage
- Eigene Bilder: PNG, JPEG oder SVG, höchstens 1 MB. · Aussage
- Die Falzlinie erscheint in der Vorschau und im Druck. · Aussage
- Ränder und Anker eines Etiketts skalieren mit der Etikettgröße; die Maße 105 × 35 mm sind der Maßstab 1. Bei anderem Seitenverhältnis gilt das kleinere der beiden Verhältnisse. Ausgenommen sind die 1,5 mm um QR-Code und Logo-Fläche; sie sind absolut. Die Elementgrößen (QR-Code, Verkäufer-Symbol, Artikel-Nummer, Währungssymbol) sind absolut in mm und skalieren nicht; das Logo füllt die freie Fläche neben dem QR-Code. · Aussage
- Die Bogenformat-Namen sind eindeutig (exakt gleicher Name = gleiches Format). Beim Start ist kein Bogenformat gespeichert; die Felder sind mit Avery 16er vorbelegt (A4 210 × 297, Etikett 105 × 35, Ränder oben/unten 8,5, links/rechts 0, Abstand 0, 2 Spalten × 8 Zeilen). · Aussage
- Die Seite prüft keine Nummern gegen Artikel und legt keine Artikel an oder ändert sie. · Aussage
- Leere Pflichtfelder gelten als ungültig: Ein leeres Maßfeld in Bereich A, eine leere Startnummer oder eine leere Anzahl zeigt einen Fehler am Feld; „Drucken" ist gesperrt, bei Maßfeldern auch „Speichern". · Aussage
- Logo und Verkäufer-Symbol dürfen leer bleiben; das Element entfällt dann im Etikett, sein Platz bleibt leer. · Aussage
- Der Name eines Bogenformats wird an den Enden von Leerzeichen befreit; ein Name nur aus Leerzeichen gilt als leer; höchstens 50 Zeichen. · Aussage
- Die Icon-Liste bietet mindestens ein wählbares Icon für Verkäufer-Symbol und Logo; ihr Inhalt ist nicht Teil dieser Spec. · Aussage
- Speichert ein Admin unter einem Namen, den ein anderer Admin inzwischen gespeichert hat, erscheint die Rückfrage „Überschreiben?" wie in AC-11. · Aussage

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
- **AC-18** Gegeben Startnummer 1000 und das Avery-16er-Format, wenn Bereich B die Vorschau zeigt, dann zeigt sie ein Etikett mit QR-Code links und dem Klartext „1000" darunter, unten mittig in der linken Hälfte auf der Unterkante des Verkäufer-Symbols unten links, dem Logo neben dem QR-Code, der Schreiblinie plus Währungssymbol rechts und dem Verkäufer-Symbol oben rechts und unten links. · Aussage
- **AC-19** Gegeben ein Etikett mit Nummer 1000, wenn der QR-Code gescannt wird, dann liefert er genau „1000" ohne weitere Zeichen. · Aussage
- **AC-20** Gegeben die Vorschau des Etiketts, wenn sie angezeigt wird, dann ist die senkrechte Mittellinie (Falzlinie) sichtbar; im Druck erscheint sie ebenfalls. · Aussage
- **AC-21** Gegeben die Etikettgröße 52,5 × 17,5 mm (halb so groß wie 105 × 35) und unveränderte Elementgrößen, wenn die Vorschau erscheint, dann sind die skalierenden Ränder und Anker halb so groß wie bei 105 × 35 mm, QR-Code, Verkäufer-Symbol, Artikel-Nummer und Währungssymbol behalten ihre Größe in mm. · Aussage
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
- **AC-32** Gegeben die Etikettgröße 105 × 17,5 mm (Breite wie Maßstab, Höhe halb so groß) und unveränderte Elementgrößen, wenn die Vorschau erscheint, dann sind die skalierenden Ränder und Anker halb so groß wie bei 105 × 35 mm (kleineres Verhältnis 0,5), QR-Code, Verkäufer-Symbol, Artikel-Nummer und Währungssymbol behalten ihre Größe in mm; Elemente dürfen sich überlappen (keine Kollisionsprüfung). · Aussage
- **AC-33** Gegeben ein erstes Öffnen mit leerer Startnummer und leerer Anzahl, wenn der Admin Bereich B ansieht, dann erscheint an beiden Feldern ein Fehler und „Drucken" ist gesperrt. · Aussage
- **AC-34** Gegeben Bereich A, wenn der Admin ein Maßfeld leert, dann erscheint ein Fehler am Feld und „Speichern" und „Drucken" sind gesperrt. · Aussage
- **AC-35** Gegeben ein gültiges Bogenformat, gültige Angaben in Bereich B, leeres Logo und leeres Verkäufer-Symbol, wenn der Admin „Drucken" wählt, dann öffnet sich der Druckdialog und die Etiketten tragen weder Logo noch Verkäufer-Symbol. · Aussage
- **AC-36** Gegeben Bereich A, wenn der Admin als Namen nur Leerzeichen oder mehr als 50 Zeichen einträgt, dann ist „Speichern" gesperrt. · Aussage
- **AC-37** Gegeben ein gültiges Bogenformat, wenn der Admin den Namen „ Avery 12er " (mit Leerzeichen an beiden Enden) speichert, dann erscheint das Format als „Avery 12er" im Auswahlfeld. · Aussage
- **AC-38** Gegeben zwei Geräte mit geöffneter Seite und noch kein Format „Avery 12er", wenn Admin A dort „Avery 12er" speichert und danach Admin B ohne Neuladen unter demselben Namen speichert, dann fragt die Seite bei B „Überschreiben?"; bei Bestätigung gilt das Format von B, bei Abbruch bleibt das von A. · Aussage
- **B-1** Gegeben die Seite „Etiketten-Vordruck", wenn der Admin bei Logo oder Verkäufer-Symbol ein PNG, JPEG oder SVG bis 1 MB hochlädt, dann liegt das Bild in der Bibliothek und ist für dieses Feld gewählt. · Aussage
- **B-2** Gegeben ein Bild in der Bibliothek, wenn der Admin die Seite auf einem anderen Gerät öffnet, dann zeigt die Auswahl bei Logo und Verkäufer-Symbol dieses Bild als Vorschaubild mit Namen. · Aussage
- **B-3** Gegeben ein Bild in der Bibliothek, wenn der Admin es bei Logo oder Verkäufer-Symbol anklickt, dann zeigt die Etikett-Vorschau dieses Bild im jeweiligen Feld. · Aussage
- **B-4** Gegeben eine andere Dateiart oder ein Bild über 1 MB, wenn der Admin es hochlädt, dann erscheint eine Fehlermeldung und die Bibliothek bleibt unverändert (wie AC-15). · Aussage
- **B-5** Gegeben ein Bild in der Bibliothek, wenn der Admin es löscht und bestätigt, dann fehlt es in der Auswahl; ein damit bereits gewähltes Logo oder Symbol bleibt im Etikett erhalten. · Aussage
- **B-6** Gegeben ein Bild, das inhaltsgleich schon in der Bibliothek liegt, wenn der Admin es erneut hochlädt, dann entsteht kein zweiter Eintrag; das vorhandene Bild wird gewählt. · Aussage
- **B-7** Gegeben die Bibliothek ist voll (50 Bilder), wenn der Admin ein weiteres Bild hochlädt, dann erscheint eine Fehlermeldung „Bibliothek voll" und nichts wird gespeichert. · Aussage
- **B-8** Gegeben ein Kassenpersonal-Konto, wenn es die Bibliotheks-Endpunkte aufruft, dann antwortet das Backend mit 403. · Aussage

## Entscheidungen
- **W · Menü-Position** · Aussage — Eigener Eintrag in der Gruppe „System" direkt über „Einstellungen" (Q1).
- **W · Rolle** · Aussage — Nur Admin (Q2).
- **W · Anzahl pro Seite** · Aussage — Spalten und Zeilen sind Eingaben, die Anzahl pro Seite wird berechnet (Q3).
- **W · Bogengröße** · Aussage — Breite und Höhe einstellbar, Vorgabe A4 (Q4).
- **W · Abstand** · Aussage — Abstand waagerecht und senkrecht einstellbar, Vorgabe 0 (Q5).
- **W · Persistenz Inhalt** · Aussage — Logo, Verkäufer-Symbol, Währungssymbol und die vier Elementgrößen bleiben als letzte Werte gespeichert; Startnummer, Anzahl, Startposition nie (Q6; geändert 2026-11-05, siehe Elementgrößen einstellbar).
- **W · Speicherort** · Aussage — Bogenformate und eigene Bilder im Backend (Q7).
- **W · Ausgabe** · Aussage — Browser-Druckdialog wie bei den Belegen, mit Hinweis auf 100 % Skalierung (Q8).
- **W · Bilder** · Aussage — PNG, JPEG, SVG bis 1 MB (Q9).
- **W · Falzlinie** · Aussage — in Vorschau und Druck (Q10; geändert 2026-11-02, siehe Abweichung Falzlinie).
- **W · Skalierung** · Aussage — Ränder und Anker skalieren proportional mit der Etikettgröße; QR-Code, Verkäufer-Symbol, Artikel-Nummer und Währungssymbol sind absolut in mm, das Logo füllt die freie Fläche (Q11; geändert 2026-11-05, siehe Elementgrößen einstellbar).
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
- **W · Klartext-Lage** · Aussage — Der Klartext steht unter dem QR-Code, unten mittig in der linken Hälfte, das Logo neben dem QR-Code (geändert 2026-11-02, siehe Abweichung Etikett-Layout).
- **W · Skalierung-Zeile** · Aussage — Die Soll-Vorgabe zu Maßstab 105 × 35 mm und „kleineres Verhältnis" gilt als bestätigt (Q1 Grill).
- **W · Leere Pflichtfelder** · Aussage — Leere Maßfelder, leere Startnummer und leere Anzahl sind ungültig; Fehler am Feld, „Drucken" gesperrt, bei Maßfeldern auch „Speichern" (Q2 Grill).
- **W · Logo/Symbol leer** · Aussage — Beide dürfen leer bleiben; das Element entfällt beim Druck (Q3 Grill).
- **W · Format-Name** · Aussage — Name wird getrimmt, nur Leerzeichen gilt als leer, höchstens 50 Zeichen (Q4 Grill).
- **W · Icon-Liste-Umfang** · Aussage — Die Spec verlangt mindestens ein wählbares Icon; der Inhalt entsteht in der Umsetzung (Q5 Grill).
- **W · Gleichzeitiges Speichern** · Aussage — Die Rückfrage „Überschreiben?" aus AC-11 greift auch, wenn ein anderer Admin den Namen inzwischen angelegt hat (Q6 Grill).
- **Abweichung Etikett-Layout (2026-11-02)** · Aussage — Nach Sichtprüfung der Vorschau: Klartext dreimal so groß (10,5 mm statt 3,5 mm bei 105 × 35 mm), unten auf der Unterkante des Verkäufer-Symbols unten links und horizontal mittig zwischen diesem Symbol und der Falzlinie; QR-Code größer (21,5 mm) in der Ecke oben links; Schreiblinie und Währungssymbol auf derselben Unterkante, Währungssymbol doppelt so groß. Grund: bessere Lesbarkeit der Artikelnummer und des Preisfelds; Wunsch des Anwenders.
- **Abweichung Falzlinie (2026-11-02)** · Aussage — Die Falzlinie wird mitgedruckt (vorher nur Vorschau, Q10). Grund: Die gedruckte Linie zeigt beim Falten um den Kabelbinder, wo geknickt wird; Wunsch des Anwenders.
- **R1 · AC-03** — geändert — Neues Verhalten, Beleg: Spec · Was, wie, wo, warum — Das Skalieren der Vorschau mit der Breite ihres Containers ist dort festgelegt, aber von keinem Kriterium abgedeckt; neues Kriterium AC-31 prüft es beobachtbar.
- **R1 · Soll-Vorgaben** — geändert — Neues Verhalten, Beleg: Spec · Soll-Vorgaben — Die Regel „bei anderem Seitenverhältnis gilt das kleinere der beiden Verhältnisse" ist dort festgelegt, AC-21 deckt nur gleiches Seitenverhältnis ab; neues Kriterium AC-32 prüft den Fall 105 × 17,5 mm.
- **R2 · Soll-Vorgaben** — geändert — Klarstellung: Der Widerspruch zwischen „Ränder und Abstände ≥ 0" und „Maße > 0" der Entscheidung Eingabegrenzen löst sich aus der Spec selbst: Die Entscheidung Abstand legt die Vorgabe 0 fest, die Entscheidung Maßbegriffe nennt nur Etikett- und Bogengröße als Maße, und das Standardformat (AC-04, AC-07) setzt Ränder 0 voraus. Die Soll-Vorgabe hält jetzt fest, dass „> 0" nur für Etikett- und Bogengröße gilt; der W-Eintrag bleibt unverändert.
- **R3 · Entscheidungen** — nicht geändert — W-Eintrag ist bindend
- **Bilder-Bibliothek ist Kopierquelle, keine Referenz (2026-11-05)** · Aussage — Die Bibliothek ergänzt W · Speicherort und W · Bilder (Q7, Q9); AC-15 und AC-17 gelten weiter. Wählen kopiert die Data-URL in das Etikett (`LabelGraphic` mit `kind: 'image'`) und in die gemerkten Werte; `LabelPrintDefaults`, Druck und Etikett-Darstellung bleiben unverändert, Löschen eines Bibliotheks-Bildes kann kein gewähltes Logo oder Symbol zerstören (B-5). Kosten: Das Bild liegt bis zu zweimal in der Datenbank (je höchstens 1 MB), vertretbar. Bestätigt von Sven Reichert am 2026-11-05 (Plan `docs/forge/2026-11-05-etiketten-bilder-bibliothek/plan.md`). Projekt führt keine ADR-Ablage, daher hier.
- **Bilder-Bibliothek, bestätigte Defaults (2026-11-05)** · Aussage — F-1 Löschen eines gewählten Bildes erlaubt, Logo/Symbol bleibt (Kopie); F-2 höchstens 50 Bilder; F-3 Name = Dateiname ohne Endung, gekürzt auf 50 Zeichen, kein Umbenennen; F-4 eine gemeinsame Bibliothek für Logo und Verkäufer-Symbol; F-5 hochgeladenes Bild kommt sofort in die Bibliothek und ist gewählt; F-6 vorhandene Logo-/Symbol-Bilder werden beim Start einmalig übernommen (Duplikat-Regel greift). Schutzbedarf der Bilder: normal (F-7).
- **Elementgrößen einstellbar (2026-11-05)** · Aussage — Ergänzt W · Persistenz Inhalt um die vier Elementgrößen und ändert W · Skalierung sowie die Abweichung Etikett-Layout: QR-Code, Verkäufer-Symbol, Artikel-Nummer und Währungssymbol haben einstellbare Größen in mm, absolut statt mit der Etikettgröße skaliert (Feld zeigt, was gedruckt wird); die bisherigen festen Werte bei 105 × 35 mm sind die Vorgaben. Ränder und Anker skalieren weiter mit der Etikettgröße, außer den 1,5 mm um QR-Code und Logo-Fläche. Grund: Auftrag des Anwenders, die Größen einzeln einzustellen; absolut, damit das Feld zeigt, was gedruckt wird. Bestätigt von Sven Reichert am 2026-11-05 (Plan `docs/forge/2026-11-05-etiketten-elementgroessen/plan.md`, E7, E9).
- **Abweichung Logo-Lage und Preisfeld (2026-11-05)** · Aussage — Das Logo hat keine feste Größe mehr, sondern füllt eingepasst und zentriert die freie Fläche neben dem QR-Code; der QR-Code rückt auf 1,5 mm vom oberen Rand; das Währungssymbol ist rechtsbündig mit dem Rand des Verkäufer-Symbols oben rechts (auf 105 × 35 etwa 5 mm weiter rechts als vorher), die Schreiblinie schrumpft auf den Restplatz. Grund: Die freie Fläche ist selten quadratisch und ein verzerrtes Logo ist nicht gewollt; die Breite des Währungssymbols ist vorab nicht berechenbar, daher schrumpft die Linie; Entscheidung des Anwenders. Bestätigt von Sven Reichert am 2026-11-05 (Plan `docs/forge/2026-11-05-etiketten-elementgroessen/plan.md`, E4, E8).
