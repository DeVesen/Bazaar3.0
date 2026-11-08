# Fachbereich Öffentlicher Katalog (Live-Liste ohne Anmeldung)

Status: Skizze · Stand: 2026-11-08 · Teil von: [README](../README.md)
Lesen zusammen mit: [datenschutz](../querschnitt/datenschutz.md) · [zielbild](../architektur/zielbild.md) · [leitplanken](../leitplanken.md) (L4)
Entscheidungen: E10, E10a, E17

## Zweck und Abgrenzung

Eine öffentliche Seite, eingebunden in die Homepage, die Interessenten **ohne Anmeldung** zeigt, was gerade im
Verkauf ist. Sie hat ein eigenes Frontend und einen eigenen Container, ihre Last ist isoliert.

## Heute

- Gibt es nicht.
- Verwandt sind der **Artikel-Aushang** (Druck, bewusst ohne Nummer, [`forge/2026-10-31-artikel-aushang-druck`](../../2026-10-31-artikel-aushang-druck/spec.md)) und die öffentlichen Endpunkte der Voranmeldung (`/api/public/info`, Countdown).

## Ziel

### Inhalt (Positivliste aus [datenschutz](../querschnitt/datenschutz.md))

- **Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis.**
- **Keine Artikelnummer:** Sie verrät die Zugehörigkeit zum Verkäufer und lädt zu Reservierungswünschen ein.
- **Keine Beschreibung.**
- Filter und Gruppierung nach Kategorie und Größe, Suche nach Bezeichnung und Marke.

### Zeitfenster (E10)

| Phase | Anzeige |
|---|---|
| vor dem Basar | Termine, Countdown, gegebenenfalls Übersicht (Anzahl je Kategorie und Größe) |
| ab **Verkaufsöffnung** | Live-Liste der Artikel „Im Verkauf“ |
| nach Verkaufsende | geschlossen, Hinweis auf den nächsten Basar |

### Ehrlichkeit und Fairness

- Im Listenkopf steht **„Stand hh:mm – Artikel können bereits im Einkaufskorb liegen. Keine Reservierung.“**
- Ist die Aktualisierung älter als 10 Minuten, erscheint „Live-Aktualisierung unterbrochen“.
- Keine Reservierung, kein Export oder Download.
- Für Besucher ohne Internet gibt es den Aushang am Eingang ([druck-etiketten](druck-etiketten.md)).

### Technik (für Stakeholder)

- Eigener schlanker Container. Er liest nur eine **vorbereitete Liste ohne Personenbezug**, die etwa jede Minute erneuert wird (E10a).
- Davor sitzt ein Cache bzw. CDN. Viele Besucher belasten weder die Kasse noch die Voranmeldung.
- Einbindung in die Vereins-Homepage per Link oder eingebettet (offen).
- Keine Cookies, kein Tracking.

### Admin

- Einzelne Einträge ausblenden, z. B. wenn die Bezeichnung Personenbezug hat.
- Katalog für einen Basar ein- und ausschalten.

## Berührungspunkte

- [datenschutz](../querschnitt/datenschutz.md): Positivliste
- [lebenszyklus](../querschnitt/artikel-lebenszyklus.md): nur „Im Verkauf“
- [verkauf-kasse](verkauf-kasse.md): Aktualität nach dem Verkauf
- [ui-grundlagen](../querschnitt/ui-grundlagen.md): Branding, Mobile-first

## Offene Fragen

1. E17: Will der Vorstand den Katalog (Nutzen, Haftung, Impressum)?
2. Später Bilder? Das ist Nicht-Ziel der ersten Ausbaustufe (Upload, Moderation, Bildrechte).
3. Einbettung in die Homepage: Link, iFrame oder Web-Komponente?
4. Erwartete Besucherzahl am Basar-Tag?

## Nächste Planungsschritte

- E17 im Vorstand klären.
- Bildschirm-Skizze (Mobile) erstellen.
