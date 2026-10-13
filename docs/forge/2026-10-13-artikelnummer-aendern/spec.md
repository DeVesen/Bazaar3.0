# Artikelnummer beim Bearbeiten ändern

Status: bestätigt am 2026-10-13
Art: frei
Basis: 936e0045

## Was, wie, wo, warum
In der Haupt-App ist die Artikelnummer im Dialog „Artikel bearbeiten“ bisher nur lesbar. Künftig kann der Anwender sie dort ändern, etwa um sie an ein Etikett anzupassen. · Aussage
Eine neue Nummer ist nur zulässig, wenn sie noch an keinem Artikel vergeben ist oder die aktuelle Nummer des bearbeiteten Artikels bleibt. · Aussage
Die Prüfung läuft im Frontend und im Server. Der Server entscheidet endgültig und lehnt beim Speichern eine vergebene Nummer ab. · Aussage

## Theoretisches Verhalten nach Umsetzung
Der Anwender öffnet „Artikel bearbeiten“ und sieht die Artikelnummer als bearbeitbares Feld. · Aussage
Verlässt der Anwender das Feld mit einer Nummer, die an einem anderen Artikel hängt, erscheint am Feld ein Fehlertext und Speichern ist nicht möglich. · Aussage
Speichert der Anwender trotzdem (z. B. weil die Nummer zwischenzeitlich vergeben wurde), lehnt der Server ab und der Fehlertext erscheint am Feld. · Aussage
Ändert der Anwender die Nummer auf einen gültigen Wert, erscheint unter dem Feld ein Hinweis, das Etikett neu zu drucken bzw. anzubringen. · Aussage
Nach dem Speichern trägt der Artikel die neue Nummer. · Aussage

## Soll-Vorgaben
Die Nummer ist eine ganze Zahl ab 1; die größte erlaubte Nummer ist 2147483646. Leer, 0, negativ, Text oder eine Nummer darüber ergeben einen Feldfehler. · Aussage
Der Fehlertext bei vergebener Nummer lautet „Artikelnummer <Nummer> ist bereits vergeben.“ und nennt keinen anderen Artikel. · Aussage
Alle Rollen, die den Dialog bearbeiten dürfen, dürfen die Nummer ändern. · Aussage
Die Nummer unterliegt denselben Sperren wie die übrigen Felder. Bei abgerechnetem Verkäufer ist das Feld deaktiviert und der Server lehnt die Änderung ab. Nach dem Verkauf bleibt die Nummer änderbar. · Aussage
Der Vorschlag „nächste Nummer“ bleibt die höchste vergebene Nummer plus 1. Eine bewusst hohe Nummer ist erlaubt und verschiebt diesen Vorschlag. · Aussage
Eine Nummernänderung wird nicht protokolliert. · Aussage

## Akzeptanzkriterien
- **AC-01** Gegeben der Dialog „Artikel bearbeiten“ eines Artikels mit Nummer 1043 und nicht abgerechnetem Verkäufer, wenn der Anwender den Dialog öffnet, dann ist das Feld Artikelnummer mit 1043 vorbelegt und bearbeitbar. · Aussage
- **AC-02** Gegeben Artikel A (Nr. 1043) und Artikel B (Nr. 1044), wenn der Anwender bei A die Nummer 1044 eingibt und das Feld verlässt, dann zeigt das Feld „Artikelnummer 1044 ist bereits vergeben.“ und „Speichern“ ist nicht auslösbar. · Aussage
- **AC-03** Gegeben Artikel A (Nr. 1043), wenn der Anwender die Nummer unverändert lässt und speichert, dann wird gespeichert ohne Nummernfehler. · Aussage
- **AC-04** Gegeben Artikel A (Nr. 1043) und keine Artikelnummer 2000 im System, wenn der Anwender 2000 einträgt und speichert, dann trägt A danach die Nummer 2000. · Aussage
- **AC-05** Gegeben Artikel A (Nr. 1043), das Frontend hält die Nummer 1050 für frei, aber ein anderer Artikel hat sie inzwischen erhalten, wenn der Anwender speichert, dann lehnt der Server ab, die Nummer von A bleibt 1043 und am Feld steht „Artikelnummer 1050 ist bereits vergeben.“ · Aussage
- **AC-06** Gegeben der Dialog mit geänderter, gültiger Nummer, wenn der Anwender die Nummer ändert, dann erscheint unter dem Feld ein Hinweis zum Etikett; bei Rückkehr zur ursprünglichen Nummer verschwindet der Hinweis. · Aussage
- **AC-07** Gegeben der Dialog, wenn der Anwender das Feld leert oder 0, −5 oder „abc“ einträgt und speichern will, dann zeigt das Feld einen Fehler und es wird nicht gespeichert. · Aussage
- **AC-08** Gegeben ein abgerechneter Verkäufer, wenn der Anwender den Dialog eines seiner Artikel öffnet, dann ist das Feld Artikelnummer deaktiviert. · Aussage
- **AC-09** Gegeben ein abgerechneter Verkäufer, wenn eine Anfrage mit geänderter Nummer ankommt, dann lehnt der Server ab und die Nummer bleibt unverändert. · Aussage
- **AC-10** Gegeben ein verkaufter Artikel eines nicht abgerechneten Verkäufers, wenn der Anwender die Nummer auf eine freie Zahl ändert und speichert, dann wird gespeichert. · Aussage
- **AC-11** Gegeben die höchste vergebene Nummer 1044, wenn bei Artikel A die Nummer auf 9999 geändert und gespeichert wird, dann ist der Vorschlag für die nächste Neuvergabe 10000. · Aussage
- **AC-12** Gegeben ein Anwender mit Rolle Kassenpersonal, wenn er die Nummer ändert und speichert, dann gilt dieselbe Prüfung wie für Admins und die Änderung wird gespeichert. · Aussage

## Entscheidungen
- **W · Prüfzeitpunkt** · Aussage — Prüfung beim Verlassen des Feldes im Frontend, Server entscheidet endgültig.
- **W · Fehlertext** · Aussage — Text ohne Nennung des Besitzer-Artikels.
- **W · Wertebereich** · Aussage — Ganze Zahl von 1 bis 2147483646, sonst Feldfehler.
- **W · Berechtigung** · Aussage — Alle Rollen, die den Dialog bearbeiten dürfen.
- **W · Etikett-Hinweis** · Aussage — Kurzer Hinweis unter dem Feld bei geänderter Nummer.
- **W · Nummernkreis** · Aussage — Hohe Nummer erlaubt, Vorschlag folgt der höchsten Nummer.
- **W · Protokoll** · Aussage — Keine Spur der Änderung.
- **W · Sperren** · Aussage — Wie übrige Felder; abgerechneter Verkäufer sperrt, Verkauf nicht.
- **W · Ablage** · Aussage — Spec im Worktree.
- **W · Obergrenze (Nachtrag 2026-10-13)** · Aussage — größte erlaubte Nummer 2147483646, damit der Vorschlag „höchste Nummer plus 1“ nicht überläuft; Review-Befund, vom Menschen bestätigt.
