# Datenschutz

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [leitplanken](../leitplanken.md) (L4, L11) · [datenmodell](datenmodell.md)
Entscheidungen: E7, E8, E10, E14, E17, E20
Schlagworte: Datenschutz, DSGVO, AVV, Auftragsverarbeitung, Rechtsgrundlage, Positivliste, öffentliche Felder, Löschkonzept, Löschfrist, Aufbewahrung, Laufkunde, Cookies, Tracking, Verschlüsselung

## Zweck und Abgrenzung

Hier stehen die Datenschutz-Vorgaben der Suite: Rechtsgrundlagen, Verträge, öffentliche Felder,
Löschkonzept und Geräte. Rechtlich verbindlich prüft es die bzw. der Datenschutzverantwortliche des Vereins.

## Heute

- In den Specs gibt es keine Datenschutz-Fundstelle.
- Personendaten liegen in der Cloud (Voranmeldung) und lokal (Haupt-App, auch Laufkunden).
- Keine Löschfristen über Basare hinweg.

## Ziel

### Verträge und Hosting

- **Auftragsverarbeitungsvertrag** (Art. 28 DSGVO) mit dem Cloud-Anbieter und gegebenenfalls dem CDN, Hosting in der **EU-Region** (E20).
- **Vertragspartner ist der Verein** (E14).
- Ein Eintrag im **Verzeichnis der Verarbeitungstätigkeiten**.

### Rechtsgrundlagen

| Verarbeitung | Grundlage (Vorschlag, zu prüfen) |
|---|---|
| Konto, Artikel, Annahme, Verkauf, Abrechnung | Durchführung des Kommissionsvertrags (Art. 6 Abs. 1 b) |
| Live-Status und Ergebnis für den Verkäufer | ebenso, keine Einwilligung nötig |
| Laufkunden am Annahmetisch | ebenso. Information per Aushang oder Infoblatt (Art. 13). |
| Einladung eines Laufkunden zum Online-Konto (E8) | auf Wunsch. Die E-Mail wird mit Hinweis erfasst. |
| Öffentlicher Katalog | keine Personendaten. Keine Cookies, kein Tracking. |

### Öffentliche Felder (Positivliste, gilt für Katalog und alles Anonyme)

| Erlaubt | Nie öffentlich |
|---|---|
| Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis, Zustand „im Verkauf“ | Name, Kennung, Kontakt, Adresse von Verkäufern |
| aggregierte Zahlen (Anzahl je Kategorie und Größe) | **jede Artikelnummer** (verrät die Zugehörigkeit zum Verkäufer) |
| | Freitext-Beschreibung |
| | Gebühren, Erlöse, Zeitstempel, Konditionen |

- Die Bezeichnung ist ebenfalls Freitext. Deshalb gibt es einen Hinweis bei der Erfassung („wird öffentlich angezeigt“), und der Admin kann einzelne Einträge ausblenden.
- Die Projektion wird technisch so gebaut, dass verbotene Felder **gar nicht erst** hineinkommen (L4).

### Löschkonzept (E7, Vorschlag)

| Daten | Frist |
|---|---|
| Artikeldaten eines Basars | anonymisiert X Monate nach Abrechnung |
| Abrechnungssummen je Verkäufer | nach den Aufbewahrungspflichten des Vereins (Kassenwart klärt) |
| Konten ohne Teilnahme seit zwei Basar-Jahren | Löschung nach Ankündigung per E-Mail |
| Laufkunden ohne Konto | nach Abrechnung und Ablauf der Aufbewahrung |
| Konto-Löschung auf Wunsch | sofort, außer bei offenen Artikeln oder Abrechnungen (Art. 17 Abs. 3). Der Verkäufer bekommt eine Begründung. |

### Geräte und Zugriff

- Kassengeräte ohne lokale Datenhaltung (Cloud-Variante). Im Inselmodus ist die Festplatte verschlüsselt, und die Daten werden nach dem Rückspielen bereinigt.
- Rollen nach dem Minimalprinzip ([identitaet-rollen](identitaet-rollen.md)). Das Team sieht Kontaktdaten nur, soweit sie für Annahme und Auszahlung nötig sind.

## Berührungspunkte

- [oeffentlicher-katalog](../fachbereiche/oeffentlicher-katalog.md): Positivliste
- [identitaet-rollen](identitaet-rollen.md): Einladung, Löschung
- [betrieb](../architektur/betrieb.md): Region, Backup-Aufbewahrung

## Offene Fragen

1. Wie lange muss der Verein Abrechnungsdaten aufbewahren?
2. Wer ist im Verein datenschutzverantwortlich?
3. Braucht die Homepage mit dem eingebundenen Katalog eine Anpassung der Datenschutzerklärung?

## Nächste Planungsschritte

- Abstimmung mit der bzw. dem Datenschutzverantwortlichen.
- Text-Entwurf für Datenschutzhinweis und Aushang.
