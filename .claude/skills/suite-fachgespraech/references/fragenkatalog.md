# Fragenkatalog je Stimme

Fragen als Werkzeugkasten. Nicht alle stellen, sondern nur die, die für den Fokus der Runde offen sind und
sich nicht aus Spec oder Plan beantworten lassen.

## Fachpersonal (Basar-Orga, Kassenpersonal, Annahme, Verkäufer)

**Ablauf**
- Was passiert am Tisch, Schritt für Schritt, wenn alles glattläuft?
- Wie viele Personen, Tische, Geräte? Wie viele Artikel oder Verkäufer pro Stunde?
- Was hält der Mensch in der Hand: Etikett, Beleg, Kiste, Handy?

**Ausnahmen**
- Was geht typischerweise schief (unleserlich, falsche Nummer, fehlender Artikel, Streit über den Preis)?
- Was passiert, wenn das Gerät oder das Internet ausfällt?
- Wer entscheidet vor Ort bei einem Sonderfall?

**Verständlichkeit**
- Was muss der Verkäufer oder Helfer verstehen, ohne geschult zu sein?
- Welche Begriffe benutzt ihr am Tisch?

## Projektleiter

- Was davon ist schon entschieden (E-Nummer)? Was widerspricht der heutigen Spec?
- Wer entscheidet die offenen Punkte (PO, Vorstand, Orga, Kassenwart, Datenschutz), und bis wann?
- Welche Annahme treffen wir vorläufig, damit es weitergeht?
- Gilt hier die Haupt-App-Regel (E25), oder brauchen wir bewusst eine Ausnahme?

## Projektmanager

- Welchen Nutzen bringt das für welche Rolle?
- In welcher Etappe der [Roadmap](../../../../docs/forge/2026-11-08-suite-zusammenfuehrung/roadmap.md) wird es gebraucht?
- Welche anderen Fachbereiche hängen davon ab bzw. davor?
- Was ist das Minimum für den ersten Basar mit der Suite? Was kann später kommen?
- Welches Risiko entsteht, wenn wir es weglassen oder verschieben?

## Fachlicher Architekt

**Datenflüsse**
- Welche Daten entstehen in diesem Schritt? Wer liefert sie (Fachbereich, Rolle)?
- Wer nutzt sie danach, ab wann? Was ist der Auslöser?
- Gibt es den Fluss schon in `datenfluesse.md` (D-Nummer), oder ist er neu?

**Verantwortung und Zustand**
- Wer ist vor und nach dem Schritt für den Artikel bzw. Verkäufer verantwortlich?
- Welcher Zustand ändert sich? Wer darf danach was ändern?
- Kann der Schritt rückgängig gemacht werden? Von wem?

**Regeln**
- Welche Prüfung muss immer gelten, auch wenn jemand die Oberfläche umgeht? Das gehört ins Backend.
- Was ist nur Anzeige oder Komfort? Das gehört ins Frontend.

**Datenschutz**
- Sind Personendaten betroffen? Wer darf sie sehen? Wird etwas öffentlich (Positivliste)?
