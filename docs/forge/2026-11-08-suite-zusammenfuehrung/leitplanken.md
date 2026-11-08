# Leitplanken – Ein-Guss-Regeln der Suite

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](README.md)
Lesen zusammen mit: [glossar](glossar.md) · Entscheidungen: E0, E2, E7, E11, E21, E25
Schlagworte: Grundsätze, Ein Guss, Haupt-App führend, eine Datenbank, Container, Kasse Vorrang, PrimeNG, Rechte-Matrix, Datenschutz

Diese Regeln gelten für **jedes** Teildokument und später für jede Umsetzung. Wer davon abweichen
will, ändert diese Datei und loggt die Entscheidung. Das passiert bewusst und nie nebenbei.

---

## L0 – Bei Unklarheiten führt die Haupt-App (E25)

Widersprechen sich die heutigen Apps oder ist eine Regel unklar, gilt die **Haupt-App**. Das betrifft
Spec, Epics, Komponenten, Styleguide, Breakpoints, Rechte-Matrix, API-Querschnitt und Begriffe. Sie ist
bewährt und ausgereifter. Die Voranmelde-App gilt nur dort, wo die Haupt-App nichts regelt
(z. B. Selbstregistrierung, Nummernblöcke). Bewusste Ausnahmen werden als Entscheidung geloggt.

## L1 – Eine Suite, ein Datenbestand

- Es gibt **eine Infrastruktur** mit **einer gemeinsamen Datenbank**, bevorzugt in der Cloud, alternativ als Docker-Stack auf eigenem Server (E0).
- Beide Betriebsarten nutzen **dieselben Images und dieselbe Konfigurationslogik**. Unterschiede liegen nur in Umgebungswerten, nie im Code.
- **Kein Import und kein Export** zwischen den Apps. Ein Artikel ist **ein** Datensatz von der Erfassung bis zur Abrechnung. Er wird nie kopiert und nie gelöscht und neu angelegt.

## L2 – Übergabe durch fachliche Handlungen, nicht durch Technik

- Die Verantwortung für einen Artikel wechselt **durch die Annahme** vom Verkäufer zum Basar-Team.
- Sie wechselt **durch die Rückgabe** zurück zum Verkäufer.
- Wer wann was ändern darf, regelt allein der [Artikel-Lebenszyklus](querschnitt/artikel-lebenszyklus.md).

## L3 – Ein Code, mehrere Bausteine

- **Eine Codebasis**, fachlich in Module gegliedert (modularer Monolith in Hexagonal-Architektur), mit einem Modul je Fachbereich.
- Für die Lastisolation wird sie in **mehrere Container** ausgeliefert (siehe [Zielbild](architektur/zielbild.md), E2). Keine feingranularen Microservices.
- Module sprechen einander nur über ihre veröffentlichten Schnittstellen an. Die Datenhoheit liegt je Modul in einem eigenen Schema.
- **Für die Fachplanung gesetzt:** Das Backend ist ein **hexagonaler Monolith**. Seine technische Architektur ist nicht Gegenstand der Fachgespräche. Fachlich geklärt wird nur, was Frontend (Anzeige, Bedienung) und was Backend (Regeln, Daten) ist.

## L4 – Öffentliches ist strikt getrennt

- Alles ohne Anmeldung (Katalog, Countdown, Basar-Infos) liest nur **bereinigte, vorbereitete Daten** ohne Personenbezug.
- Es greift nie direkt auf die Arbeitsdaten zu und belastet weder die Kasse noch die Voranmeldung.

## L5 – Die Kasse hat Vorrang

- Am Basar-Tag ist der Kassenvorgang die wichtigste Funktion.
- Keine andere Funktion darf ihn verlangsamen oder blockieren: weder Hintergrundarbeit noch öffentlicher Verkehr noch Auswertungen.
- Für einen Ausfall der Internetleitung gibt es einen geübten Notbetrieb ([Betrieb](architektur/betrieb.md), E1b).

## L6 – Einheitliche Begriffe, einheitliche Oberfläche

- Es gelten die Begriffe aus dem [Glossar](glossar.md). Die heutigen Doppelbegriffe werden abgelöst.
- **Nur PrimeNG**, Dumb Components und geteilte Komponenten aus `docs/components/` (Grundregel aus [`docs/components/overview.md`](../../components/overview.md)).
- **Ein** Breakpoint-Satz, **ein** Branding und **ein** Feedback-Muster (Toasts, Dialoge) für alle Frontends. Maßstab ist jeweils die Haupt-App (L0): Shell-Breakpoint 768 px und Styleguide „Industry“ ([UI-Grundlagen](querschnitt/ui-grundlagen.md), E21, E23).
- Gleiches Feld heißt gleich, sieht gleich aus und verhält sich gleich. Beispiele: Marke/Kategorie per AutoComplete, Preis, Größe, Verkäufer-Suche ([Auswahlfelder](querschnitt/auswahlfelder-stammdaten.md)).

## L7 – Eine Identität, klare Rollen

- **Ein** Kontenbestand für alle Menschen: Verkäufer (privat/Händler), Basar-Team, Admin.
- **Eine** Rechte-Matrix für die ganze Suite ([Identität und Rollen](querschnitt/identitaet-rollen.md), E11).
- Frontend-Prüfungen sind Bequemlichkeit. **Das Backend ist die Regel.**

## L8 – Einheitliche Schnittstellen

- Code, Routen und JSON-Verträge sind englisch, die Doku ist deutsch.
- Für alle Backends gelten **eine** Fehlerstruktur, **ein** errorCode-Katalog, **eine** Paginierungs- und Suchkonvention und **ein** ID-Format ([API-Konventionen](querschnitt/api-konventionen.md)).

## L9 – Mehrere Basare, ein Bestand

- Der **Basar** (Termin oder Saison) ist ein eigenes Konzept. Nummern, Termine, Einstellungen und Abrechnungen gelten je Basar.
- Verkäuferkonten bestehen über mehrere Basare (E7) und werden nach dem [Löschkonzept](querschnitt/datenschutz.md) gelöscht.

## L10 – Sanfter Übergang

- Der nächste Basar mit den heutigen Apps wird nicht gefährdet.
- Die heutigen Frontends laufen gegen die neuen Backends weiter (Z7). Geändert wird nur dort, wo neue Fähigkeiten es erfordern.
- Jede Etappe ist an einem echten Basar erprobbar und hat eine Rückfallebene ([Roadmap](roadmap.md)).

## L11 – Datenschutz von Anfang an

- Datenminimierung, Positivlisten für öffentliche Felder, Löschkonzept, Auftragsverarbeitung ([Datenschutz](querschnitt/datenschutz.md)).
- Personenbezogene Daten verlassen nie den geschützten Bereich.
