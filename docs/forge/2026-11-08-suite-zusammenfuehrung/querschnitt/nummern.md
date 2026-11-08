# Nummern: Voranmelde-Nummer, Basar-Tag-Nummer, Etikett

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [artikel-lebenszyklus](artikel-lebenszyklus.md) · [glossar](../glossar.md)
Entscheidungen: E3, E4, E12
Schlagworte: Nummer, Artikelnummer, Voranmelde-Nummer, Basar-Tag-Nummer, Etikett, QR, Nummernblock, Zahlenbereich, Ausnahme-Bereich, Verwechslung, Vorjahres-Etikett, Blanko-Etikett

## Zweck und Abgrenzung

Hier steht, welche Nummern es gibt, wer sie wann vergibt, wie sie eindeutig bleiben und was physisch auf dem
Etikett steht. Die Kennung des Verkäufers (QR am Profil) gehört zu [identitaet-rollen](identitaet-rollen.md).

## Heute

- **Voranmeldung:** Die Nummer kommt aus dem Nummernblock des Verkäufers (Start 2001, Blockgröße 25), ist unveränderlich und hat keinen DB-Unique (V6). Der Verkäufer schreibt sie selbst auf ein Blanko-Etikett.
- **Haupt-App:** **Eine** Spalte `Number`, systemweit eindeutig, jederzeit änderbar. Quellen sind Import, „höchste + 1“, Etiketten-Vordruck (ohne Prüfung), XLSX-Import und Umnummerieren (V1).
- Dieselbe Spalte bedeutet damit zweierlei. Blanko-Vordruck-Nummern können mit Blocknummern kollidieren.

## Ziel

### Zwei Felder am selben Artikel (Z4)

| | Voranmelde-Nummer | Basar-Tag-Nummer |
|---|---|---|
| Vergabe | Portal, beim Anlegen, aus dem Nummernblock | Annahme |
| Pflicht | nein (Laufkunden haben keine) | ab „Im Verkauf“ |
| Eindeutig | je Basar (DB-Constraint) | je Basar (DB-Constraint) |
| Änderbar | nein | nur durch Kassenpersonal/Admin, solange nicht verkauft |
| Genutzt von | Verkäufer, Annahme (Zuordnung) | Kasse, Rückgabe, Abrechnung, Statistik |
| Sieht der Verkäufer | immer | ab Annahme |

### Was steht auf dem Etikett? (E3)

| Variante | Ablauf | Bewertung |
|---|---|---|
| (a) neues Etikett drucken | jeden Artikel am Tisch neu bekleben | bei 40–80 Artikeln je Kiste eine Schlange; zwei Nummern am Artikel → **nein** |
| (b) Vordruck zuordnen | zwei Scans je Artikel | langsam, fehleranfällig |
| **(c') übernehmen, Ausnahmen neu** | Die Voranmelde-Nummer wird unverändert Basar-Tag-Nummer. Neue Nummern gibt es nur für Laufkunden, Nachmeldungen und unleserliche Etiketten, aus **eigenem Bereich** auf Blanko-Etiketten | **Empfehlung**: vertrauter Ablauf, am Artikel genau eine Nummer |

Bei (c') bleiben es fachlich **zwei Felder**. Meist tragen sie denselben Wert, eine Abweichung ist
sichtbar und nachvollziehbar.

### Verwechslungsschutz (E4)

- **Getrennte Zahlenbereiche** je Basar, z. B. Voranmeldung ab 2001, Ausnahmen ab 50000.
- **Neuer Startbereich oder eine Etikettenfarbe je Basar**, damit Etiketten vom Vorjahr nicht greifen.
- Die Kasse zeigt neben dem Preis **Bezeichnung und Größe** zum Sichtabgleich.
- Der QR-Code allein schützt nicht, denn handgeschriebene Etiketten haben keinen.

### Nummernblöcke

- Gelten je Basar und Verkäufer. Die Bereichsgrößen sind Basar-Einstellungen ([verwaltung](../fachbereiche/verwaltung.md)).
- Händler erhalten mehr Blöcke bzw. größere Blöcke (über den Verkäufer-Typ, offen).
- Der Blanko-Etiketten-Vordruck zieht aus dem **Ausnahme-Bereich** und wird gegen vergebene Nummern geprüft.

## Berührungspunkte

- [annahme](../fachbereiche/annahme.md): Vergabe der Basar-Tag-Nummer, Ausnahmefälle
- [druck-etiketten](../fachbereiche/druck-etiketten.md): Vordruck, QR-Inhalt
- [verkauf-kasse](../fachbereiche/verkauf-kasse.md): Suche nur per Basar-Tag-Nummer
- [oeffentlicher-katalog](../fachbereiche/oeffentlicher-katalog.md): **keine** Nummer öffentlich
- [datenmodell](datenmodell.md): Constraints je Basar

## Offene Fragen

1. Bleiben Nummern von Basar zu Basar gleich (Verkäufer behält seine Blöcke) oder gibt es einen neuen Bereich je Basar? Das steht im Spannungsfeld zum Vorjahres-Schutz.
2. Größe des Ausnahme-Bereichs und QR-Inhalt künftig mit Basar-Kennung?
3. Händler-Blöcke: feste Größe je Typ oder auf Anfrage?

## Nächste Planungsschritte

- E3 und E4 mit der Basar-Orga abstimmen.
- Probelauf am Annahmetisch planen.
