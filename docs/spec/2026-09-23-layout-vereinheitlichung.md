# Layout-Vereinheitlichung Haupt-App (Page-Header, Breitengrenze, Dialoge, Eingabefelder)

Status: bestätigt am 2026-09-23 · Ergebnis einer Spec-Whiteboarding-Sitzung · 4 Teile

Übergreifende Regel: Alles, was per vw begrenzt ist, steht horizontal zentriert. · `Aussage`

---

# Teil 1: Einheitlicher Page-Header und Breitengrenze für alle Haupt-App-Seiten

## Was, wie, wo, warum
- Die Verkauf-Seite hat einen Titel und ist oberhalb der Tablet-Breite auf 75vw begrenzt und mittig. Dieses Muster soll auf allen Hauptseiten gelten: Artikelannahme, Abrechnung, Verkäufer, Artikel, Marken, Kategorien, Verkäufer-Typen, Statistik, Einstellungen. · `Aussage`
- Warum: ein einheitliches Erscheinungsbild. Heute haben die Seiten unterschiedliche oder gar keine Titel und keine Breitengrenze. · `Aussage` / `Git`

## Theoretisches Verhalten nach Umsetzung
- Jede der 10 Seiten zeigt oben einen Titel im Page-Header-Format (20px, fett). Der Text ist fest und entspricht dem Menüeintrag. · `Git` / `Anhang`
- Über 768px Fensterbreite sind Titel und Inhalt auf 75 % der Fensterbreite begrenzt und stehen horizontal zentriert. Das ist genau das Verhalten der Verkauf-Seite. · `Aussage` / `Git`
- Bis einschließlich 768px nutzen Titel und Inhalt die volle Breite. Der Titel bleibt sichtbar. · `Git`
- Marken, Kategorien, Verkäufer-Typen: Der Titel steht im Page-Header, der „+ Neu“-Button rechts daneben. Die Tabelle hat keinen eigenen Titel mehr. · `Aussage`
- Abrechnung: Über allem steht immer „Abrechnung“, auch vor der Verkäuferauswahl. Die Verkäufer-Kopfzeile mit Name und Buttons folgt unverändert darunter. · `Aussage`
- Artikelannahme: „Artikelannahme“ steht sowohl bei der Verkäufersuche als auch im Assistenten. · `Aussage`
- Artikel: Passt die Tabelle nicht in die Breite, scrollt nur die Tabelle waagerecht. · `Aussage`
- Statistik: Die Kennzahlen-Kacheln brechen rechtzeitig auf weniger pro Reihe um und werden nie gequetscht. · `Aussage`
- Einstellungen: Die Panels behalten ihre Breite und stehen horizontal zentriert in der 75vw-Fläche. · `Aussage`
- Verkäufer: Der „+ Neu“-Button bleibt im Filter-Panel, wie im Epic vorgesehen. · `Anhang`

## Soll-Vorgaben
- Das Verhalten ist identisch mit Verkauf: 75 % der Fensterbreite, nicht der Fläche neben der Sidebar. Verkauf selbst ändert sich nicht. · `Aussage`
- Es gilt der bestehende Breakpoint 768px, kein neuer Wert. · `Git`
- Titel-Format wie in `components/overview.md` „Page-Header-Format“ beschrieben. · `Anhang`
- Die Aufteilung 33/67 und die Warenkorb-Höhe bleiben nur auf Verkauf. · `Git`
- Die Seite selbst scrollt nie waagerecht. · `Aussage`
- Nur PrimeNG. · `Anhang`

## Akzeptanzkriterien
- Gegeben Fensterbreite 1440px, wenn eine der 9 Seiten geöffnet wird, dann steht oben ihr Menü-Label als Titel und der Inhalt ist höchstens 75vw breit und horizontal zentriert.
- Gegeben Fensterbreite 768px, wenn eine der 9 Seiten geöffnet wird, dann nutzt der Inhalt die volle Breite und der Titel ist sichtbar.
- Gegeben die Seite Marken, wenn sie geöffnet wird, dann steht „+ Neu“ rechts im Page-Header und über der Tabelle steht kein zweiter Titel. Das gilt ebenso für Kategorien und Verkäufer-Typen.
- Gegeben die Abrechnung ohne gewählten Verkäufer, wenn sie geöffnet wird, dann steht dort „Abrechnung“. Nach der Auswahl steht die Verkäufer-Kopfzeile darunter.
- Gegeben die Artikelannahme im Assistenten-Schritt, wenn man hinschaut, dann steht „Artikelannahme“ weiterhin oben.
- Gegeben Artikel bei 800px Fensterbreite, wenn die Spalten nicht passen, dann scrollt nur die Tabelle waagerecht, die Seite nicht. *(Randfall)*
- Gegeben Statistik bei 800px Fensterbreite, wenn die Seite geöffnet wird, dann sind alle Kacheln lesbar, notfalls mit weniger Kacheln pro Reihe. *(Randfall)*
- Gegeben Einstellungen über 768px, wenn die Seite geöffnet wird, dann stehen die Panels horizontal zentriert und behalten ihre Breite.
- Gegeben Verkauf, nach der Umsetzung, dann sieht die Seite unverändert aus. *(Regression)*

## Bereits geklärte Fragen
- **Umfang** · `Aussage`: 9 Seiten plus Verkauf als Vorbild.
- **Titel-Text** · `Git`: fest, gleich dem Menü-Label.
- **Stammdaten-Titel** · `Aussage`: Der Page-Header ersetzt den Tabellentitel, „+ Neu“ steht im Header.
- **Abrechnung** · `Aussage`: Titel oben, die Kopfzeile bleibt darunter.
- **Artikel breit** · `Aussage`: Grenze 75vw, die Tabelle scrollt waagerecht.
- **Annahme-Titel** · `Aussage`: immer sichtbar.
- **Statistik-Kacheln** · `Aussage`: brechen früher um.
- **75vw-Basis** · `Aussage`: Fensterbreite, wie bei Verkauf.
- **Zentrierung** · `Aussage`: Alles, was per vw begrenzt ist, steht horizontal zentriert.
- **Einstellungen-Panels** · `Aussage`: zentriert, eigene Breite (ersetzt die frühere Entscheidung „linksbündig“).

---

# Teil 2: Scan-Dialog „Artikel zurückgeben“ / „Artikel freigeben“

## Was, wie, wo, warum
- Der Dialog „Artikel zurückgeben“ (Abrechnung) bekommt eine gestufte Breite, ein einheitliches Eingabefeld und einen sichtbaren Abstand zwischen Feld und Liste. · `Aussage`
- Das gilt auch für „Artikel freigeben“ (Verkäufer), weil beide derselbe Dialog sind und laut Epic identisch sein müssen. · `Aussage` / `Anhang` / `Git`
- Warum: Heute ist der Dialog auf Desktop 80 % breit, und das Feld sieht anders aus als im Verkauf (schwebende Rund-Buttons, Lupe). · `Git` / `Anhang`

## Theoretisches Verhalten nach Umsetzung
- Breite: ab 1024px höchstens 50 %, bei 768–1023px höchstens 80 %, bis 767px 100 %. Der Dialog steht horizontal zentriert. · `Aussage` / `Anhang`
- Das Feld ist `app-input` mit dem Label „Artikelnummer“ im Feldrahmen (`label`-Parameter). Links gibt es keine Lupe. · `Aussage`
- Die Buttons (Löschen, Übernehmen, Kamera, Nummernblock) sitzen bündig am Feld wie im Verkauf. Kamera und Nummernblock klappen unter dem Feld auf. · `Aussage` / `Git`
- Zwischen Feld und Artikelliste liegen 24px Abstand. · `Aussage`

## Soll-Vorgaben
- Die Breakpoints sind identisch mit dem Bezahlen-Dialog (≥1024 / 768–1023 / ≤767). · `Aussage` / `Anhang`
- Keine Pixel-Obergrenze. Die Modal-Doku (80 %/max. 700px für die Rückgabe) wird entsprechend korrigiert. · `Aussage`
- Das Feld verhält sich wie das Verkauf-Feld „Artikelnummer“. Nur das Label steht im Rahmen statt darüber. · `Aussage`
- Die fachliche Funktion bleibt unverändert: Suche, Übernehmen, Zurückgeben bzw. Freigeben. · `Anhang`
- Maximale Höhe 90vh und Mobil-Darstellung ohne abgerundete Ecken bleiben. · `Anhang`
- Nur PrimeNG. · `Anhang`

## Akzeptanzkriterien
- Gegeben Fensterbreite 1440px, wenn „Artikel zurückgeben“ geöffnet wird, dann ist der Dialog höchstens 720px (50 %) breit und steht horizontal zentriert.
- Gegeben Fensterbreite 900px, wenn der Dialog geöffnet wird, dann ist er höchstens 80 % breit.
- Gegeben Fensterbreite 767px, wenn der Dialog geöffnet wird, dann füllt er die volle Breite. *(Randfall: Grenze)*
- Gegeben Fensterbreite 1024px, wenn der Dialog geöffnet wird, dann gilt 50 %. *(Randfall: Grenze)*
- Gegeben der geöffnete Dialog, dann steht „Artikelnummer“ im Feldrahmen, es gibt keine Lupe, und die Buttons sitzen bündig wie im Verkauf.
- Gegeben die angezeigte Trefferliste, dann liegen 24px zwischen Feld und Liste.
- Gegeben „Artikel freigeben“ bei den Verkäufern, wenn der Dialog geöffnet wird, dann gelten dieselbe Breite, dasselbe Feld und derselbe Abstand.
- Gegeben eine Artikelnummer wird eingegeben und übernommen, dann wird der Artikel wie bisher zurückgegeben bzw. freigegeben. *(Regression)*

## Bereits geklärte Fragen
- **Umfang** · `Aussage`: Zurückgeben und Freigeben.
- **Breakpoints** · `Aussage`: wie der Bezahlen-Dialog.
- **Eingabefeld** · `Aussage`: wie das Verkauf-Feld, als `app-input`.
- **Label** · `Aussage`: im Rahmen (`label`-Parameter), angeglichen an Teil 3 und 4.
- **Abstand** · `Aussage`: 24px.
- **Lupe** · `Aussage`: keine.
- **Pixel-Obergrenze** · `Aussage`: keine, die Doku wird korrigiert.

---

# Teil 3: Verkäufer-Dialog (Anlegen/Bearbeiten) und Kachelliste

## Was, wie, wo, warum
- Der Dialog „Neuer Verkäufer“ bzw. „Verkäufer bearbeiten“ bekommt dieselbe gestufte Breite wie der Scan-Dialog. · `Aussage`
- Er bekommt außerdem eine neue Feldanordnung, einheitliche Eingabefelder mit Label im Rahmen und rote Pflicht-Sterne. · `Aussage`
- Anlegen und Bearbeiten sind derselbe Dialog, damit verhalten sich beide automatisch gleich. · `Git`
- Schritt 1 im Annahme-Wizard übernimmt dieselbe Anordnung, weil das Epic Identität verlangt. · `Aussage` / `Anhang`
- Die Kachelliste der Verkäufer-Seite scrollt ab Tablet in einem eigenen Bereich, der Paginator fällt weg. · `Aussage`
- Warum: Heute ist der Dialog 32rem breit und das Formular nutzt rohe Textfelder ohne Stern. Die ganze Seite scrollt. · `Git`

## Theoretisches Verhalten nach Umsetzung
- Dialogbreite: ab 1024px höchstens 50 %, bei 768–1023px höchstens 80 %, bis 767px 100 %. Der Dialog steht horizontal zentriert. · `Aussage`
- Die Überschriften Personendaten, Kontakt und Konditionen bleiben. · `Aussage`
- Feldanordnung ab 768px:
  - Vorname 50 % | Nachname 50 % · `Aussage`
  - Anschrift 100 % · `Aussage`
  - PLZ 33 % | Ort 67 % · `Aussage`
  - Telefon 50 % | E-Mail 50 % · `Aussage`
  - Verkäufer-Typ 33 % | Gebühr 33 % | Provision 33 % · `Aussage`
- Bis 767px stehen alle Felder untereinander, jedes 100 % breit. · `Aussage`
- Die Textfelder sind `app-input` mit Label im Feldrahmen (`label`-Parameter). · `Aussage`
- Auswahlfeld und Zahlenfelder bekommen dieselbe Label-Optik. · `Aussage`
- Pflichtfelder Vorname, Nachname, E-Mail und Verkäufer-Typ zeigen einen roten `*` am Label. · `Git` / `Aussage`
- Bei den Textfeldern setzt `app-input` den `*` selbst, sobald das Feld Pflicht ist. · `Aussage`
- Verkäufer-Seite über 768px:
  - Filterzeilen oben bleiben stehen. · `Aussage`
  - Nur die Kachelliste scrollt, ihre Höhe ist die Fensterhöhe abzüglich Shell-Abstand, Page-Header und Filter. · `Aussage`
- Verkäufer-Seite bis 768px: Die Seite scrollt normal. · `Aussage`
- Es gibt keinen Paginator. Am Listenende kommen automatisch die nächsten 60 Verkäufer dazu. · `Aussage` / `Anhang`

## Soll-Vorgaben
- Die Breakpoints sind identisch mit dem Scan- und Bezahlen-Dialog. · `Aussage`
- Suche, Filter und Paging bleiben auf dem Server, 60 pro Nachladen. · `Anhang`
- Gebühr und Provision bleiben Zahlenfelder, nur für Admin änderbar. „Löschen“ bleibt nur für Admin. · `Git` / `Anhang`
- Die Doku wird angepasst:
  - Story VERK-S01: PLZ/Ort- und Typ-Aufteilung, Größe
  - Modal-Doku: Größe
  - app-input-Doku: Stern
  - Epic Verkäufer: Paginator · `Aussage`
- Nur PrimeNG. · `Anhang`

## Akzeptanzkriterien
- Gegeben 1440px, wenn „+ Neu“ geklickt wird, dann ist der Dialog höchstens 50 % breit. Bei 900px höchstens 80 %, bei 767px 100 %.
- Gegeben der offene Dialog ab 768px, dann stehen Vorname/Nachname je 50 %, Anschrift 100 %, PLZ/Ort 33/67, Telefon/E-Mail je 50 % sowie Typ/Gebühr/Provision je 33 % unter ihren bisherigen Überschriften.
- Gegeben der Dialog bei 767px, dann steht jedes Feld auf einer eigenen Zeile. *(Randfall)*
- Gegeben der Dialog, dann tragen Vorname, Nachname, E-Mail und Verkäufer-Typ einen roten `*`. Anschrift, PLZ, Ort, Telefon, Gebühr und Provision tragen keinen.
- Gegeben „Verkäufer bearbeiten“ über das Stift-Symbol, dann gelten dieselbe Breite, Anordnung und Sterne wie beim Anlegen.
- Gegeben Artikelannahme, Wizard Schritt 1, dann sind die Felder genauso angeordnet wie im Dialog.
- Gegeben die Verkäufer-Seite bei 1440px mit mehr Kacheln als Platz, wenn gescrollt wird, dann scrollt nur die Kachelliste und die Filter bleiben sichtbar.
- Gegeben mehr als 60 Verkäufer, wenn das Listenende erreicht wird, dann erscheinen die nächsten 60, ohne Paginator. *(Randfall)*
- Gegeben die Verkäufer-Seite bei 768px, dann scrollt die ganze Seite wie bisher.
- Gegeben ein Nicht-Admin öffnet den Dialog, dann sind Gebühr und Provision gesperrt, und „Löschen“ fehlt wie bisher. *(Regression)*

## Bereits geklärte Fragen
- **Anlegen = Bearbeiten** · `Git`: derselbe Dialog.
- **Feldart** · `Aussage`: `app-input` mit `label`-Parameter.
- **Kontakt** · `Aussage`: je 50 %.
- **Wizard** · `Aussage`: gleiche Anordnung.
- **Paginator** · `Aussage`: entfällt, Nachladen beim Scrollen.
- **Stern** · `Aussage`: `app-input` zeigt ihn selbst bei Pflichtfeldern.
- **Andere Felder** · `Aussage`: gleiche Label-Optik, `*` am Typ.
- **Mobil** · `Aussage`: Felder untereinander, Liste ohne eigenen Scrollbereich.

---

# Teil 4: Verkäufersuche (Artikelannahme und Abrechnung)

## Was, wie, wo, warum
- Die Verkäufersuche, die Artikelannahme und Abrechnung gemeinsam nutzen, bekommt ein `app-input`-Feld statt der Mehrmodus-Eingabegruppe. · `Aussage` / `Git`
- Titel und 75vw-Regel sind in Teil 1 geregelt: Der Titel steht immer, auch während der Verkäuferauswahl. · `Aussage`
- Warum: Heute ist das Feld anders gebaut als im Verkauf, und die Karte ist uneinheitlich breit (Code 500px, tatsächlich volle Breite). · `Git` / `Anhang`

## Theoretisches Verhalten nach Umsetzung
- Die Suchkarte füllt die volle 75vw-Fläche, steht horizontal zentriert und schließt bündig mit dem Titel ab. · `Aussage`
- Das Feld ist `app-input` mit dem Label „Verkäufer“ im Rahmen. · `Aussage`
- Links gibt es keine Lupe. Die Buttons (Löschen, Übernehmen, Nummernblock, Kamera, soweit heute vorhanden) sitzen bündig am Feld wie im Verkauf. · `Aussage`
- Der Hinweistext bleibt direkt unter dem Feld. Zur Verkäuferliste sind es 24px Abstand. · `Aussage`
- Suche, Enter-Logik (1 Treffer öffnet den Wizard) und Anlegen-Button (nur in der Annahme) bleiben unverändert. · `Git` / `Anhang`

## Soll-Vorgaben
- Die Änderung gilt für Annahme und Abrechnung, weil beide denselben Baustein nutzen. · `Git`
- Die heutigen Modi bleiben erhalten, nur ihre Darstellung ändert sich. · `Aussage`
- Die 500px-Begrenzung entfällt. · `Aussage`
- Nur PrimeNG. · `Anhang`

## Akzeptanzkriterien
- Gegeben Artikelannahme bei 1440px, dann steht „Artikelannahme“ oben und die Suchkarte ist genauso breit wie der Titel (höchstens 75vw, horizontal zentriert).
- Gegeben Abrechnung ohne gewählten Verkäufer, dann gilt dasselbe mit dem Titel „Abrechnung“.
- Gegeben die Suchkarte, dann trägt das Feld das Label „Verkäufer“ im Rahmen, es gibt keine Lupe, und die Buttons sitzen bündig am Feld.
- Gegeben eine angezeigte Trefferliste, dann liegen 24px zwischen Hinweistext und Liste.
- Gegeben genau ein Treffer in der Annahme, wenn Enter gedrückt wird, dann öffnet sich der Wizard wie bisher. *(Regression)*
- Gegeben kein Treffer in der Abrechnung, dann erscheint kein Anlegen-Button. *(Regression)*

## Bereits geklärte Fragen
- **Titel/vw** · `Aussage`: in Teil 1 geregelt.
- **Kartenbreite** · `Aussage`: volle 75vw-Fläche.
- **Label** · `Aussage`: `label`-Parameter, Text „Verkäufer“.
- **Lupe/Buttons** · `Aussage`: wie Teil 2.
- **Abstand** · `Aussage`: 24px.
