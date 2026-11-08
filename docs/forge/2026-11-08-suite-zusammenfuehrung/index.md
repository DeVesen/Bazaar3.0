# Stichwortindex

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](README.md)
Lesen zusammen mit: [glossar](glossar.md) · [glossar-technik](glossar-technik.md)
Schlagworte: Index, Stichwort, Suche, Fundstelle, Synonym

**So sucht man:** Mit Grep nach dem Wort in **dieser Datei** suchen (Groß- und Kleinschreibung egal). Jede Zeile
enthält Stichwort, Synonyme bzw. englische Code-Namen, die **Hauptstelle** (dort steht die Regel) und weitere
Fundstellen. Nur die Hauptstelle laden. Weitere Stellen nur bei Bedarf.
Findet sich nichts, über alle Köpfe suchen: Grep nach `^Schlagworte:.*<wort>` im Hub (siehe Skill `suite-plan`).

Pfade relativ zu diesem Ordner. `E…` = [entscheidungen](entscheidungen.md), `L…` = [leitplanken](leitplanken.md),
`V…` = Altlasten in [migration](architektur/migration.md), `R…` = [risiken](risiken.md).

| Stichwort | Synonyme / Code | Hauptstelle | Weitere / Entscheidungen |
|---|---|---|---|
| Abgabe-Beleg | Annahmebeleg, Quittung | fachbereiche/druck-etiketten.md | fachbereiche/annahme.md |
| Abgelehnt | Ablehnung, Qualitätskontrolle, rejected | querschnitt/artikel-lebenszyklus.md | fachbereiche/annahme.md |
| Abholung durch Dritte | Legitimation, abgeholt durch | fachbereiche/rueckgabe-abrechnung.md | – |
| Abrechnung | Settlement, Auszahlung, Payout | fachbereiche/rueckgabe-abrechnung.md | querschnitt/datenmodell.md, E9 |
| Admin | Administrator, Organisator | querschnitt/identitaet-rollen.md | fachbereiche/verwaltung.md, E11 |
| Änderungssperre | Sperre, gesperrt, Lock, read-only | querschnitt/artikel-lebenszyklus.md | E5, E5b, Z6 |
| Altlasten | Befunde, technische Schulden, V1–V10, B1 | architektur/migration.md | roadmap.md (Etappe 1) |
| Annahme | Artikelannahme, Intake, Abgabe, Freigabe-Scan, Übergabe | fachbereiche/annahme.md | querschnitt/artikel-lebenszyklus.md, L2 |
| Annahmegebühr | Abgabegebühr, IntakeFee, Gebühr pro Stück, feePerItem | glossar.md | fachbereiche/annahme.md, E9 |
| API-Konventionen | Schnittstelle, Endpunkt, Route, cross-cutting | querschnitt/api-konventionen.md | L8, E26 |
| Artikel | Article, Datensatz | querschnitt/datenmodell.md | querschnitt/artikel-lebenszyklus.md, L1 |
| Artikel-Aushang | Aushang, Papierliste am Eingang | fachbereiche/druck-etiketten.md | fachbereiche/oeffentlicher-katalog.md |
| Artikelnummer | Nummer, Number | querschnitt/nummern.md | E3, E4 |
| Auth / Anmeldung | Login, Authentifizierung, JWT, Token | querschnitt/identitaet-rollen.md | V9 |
| AutoComplete | AutoComplete-Create, Auswahlfeld, Dropdown, Anlegen-Modal | querschnitt/auswahlfelder-stammdaten.md | docs/components/autocomplete-create |
| Backup | Datensicherung, Restore | architektur/betrieb.md | B1 |
| Basar | Bazaar, Veranstaltung, Saison, Event | querschnitt/datenmodell.md | L9, E7, fachbereiche/verwaltung.md |
| Basar-API | Container 2, Team-Backend | architektur/zielbild.md | E2 |
| Basar-Tag-Nummer | BazaarNumber, Etikettnummer, Tag-Nummer | querschnitt/nummern.md | E3, E4, Z4, Z5 |
| Basar-Team | Organisationsseite, Kassenpersonal + Admin | glossar.md | querschnitt/artikel-lebenszyklus.md |
| Betrieb | Hosting, Operations, Run | architektur/betrieb.md | E13, E14, E20 |
| Blanko-Etikett | Vordruck, Etiketten-Vordruck, blank labels | fachbereiche/druck-etiketten.md | querschnitt/nummern.md |
| Branding | Farben, Logo, Schrift, Styleguide, Industry | querschnitt/ui-grundlagen.md | E23 |
| Breakpoint | Responsive, Mobile, Desktop, Tablet, 768 | querschnitt/ui-grundlagen.md | E21 |
| Cache / CDN | Zwischenspeicher | architektur/zielbild.md | fachbereiche/oeffentlicher-katalog.md, E10a |
| Cloud | Azure, Hosting | architektur/zielbild.md | architektur/betrieb.md, E0, E20 |
| Container | Image, Baustein, Deployable | architektur/zielbild.md | E2, glossar-technik.md |
| Countdown | Termin-Anzeige, Countdown-Widget | fachbereiche/voranmeldung.md | fachbereiche/oeffentlicher-katalog.md |
| Datenbank | DB, PostgreSQL, Schema | architektur/zielbild.md | querschnitt/datenmodell.md, E0 |
| Datenhoheit | Ownership, wer schreibt, Verantwortung | querschnitt/datenmodell.md | querschnitt/artikel-lebenszyklus.md |
| Datenmodell | Entität, Entity, Tabelle | querschnitt/datenmodell.md | – |
| Datenschutz | DSGVO, AVV, Löschkonzept, Privacy | querschnitt/datenschutz.md | L11 |
| Docker | Compose, Stack, Self-Hosting, VPS | architektur/zielbild.md | architektur/betrieb.md, E0, E20 |
| Doppelverkauf | Concurrency, zwei Kassen, Race Condition | architektur/migration.md (V5) | fachbereiche/verkauf-kasse.md, R13 |
| Druck | Drucken, Print, Beleg | fachbereiche/druck-etiketten.md | – |
| Einfrierfenster | Freeze, Code-Freeze | architektur/betrieb.md | roadmap.md, E15 |
| Einstellungen | Settings, Konfiguration | fachbereiche/verwaltung.md | querschnitt/datenmodell.md |
| Entscheidung | Decision, E-Nummer | entscheidungen.md | README.md §4 |
| Entwurf | Draft, vorangemeldet, registriert | querschnitt/artikel-lebenszyklus.md | – |
| errorCode | ProblemDetails, Fehlercode, Fehlermeldung | querschnitt/api-konventionen.md | E26 |
| Etappe | Phase, Meilenstein, Roadmap | roadmap.md | – |
| Etikett | Label, Preisschild, QR | querschnitt/nummern.md | fachbereiche/druck-etiketten.md, E3 |
| Export / Import (JSON) | Datei-Übergabe, Stammdaten-Import | architektur/migration.md | E0 (entfällt), roadmap.md Etappe 3 |
| Feld-Katalog | Formularfelder, gleiche Felder | querschnitt/auswahlfelder-stammdaten.md | L6 |
| Frontend | Oberfläche, UI, Portal, Basar, Katalog | querschnitt/ui-grundlagen.md | E19, Z7 |
| Generalprobe | Probelauf, Staging, Testumgebung | architektur/betrieb.md | roadmap.md |
| Gespendet | Spende, Abholfrist | querschnitt/artikel-lebenszyklus.md | fachbereiche/rueckgabe-abrechnung.md, E18 |
| Glossar | Begriffe, Definitionen | glossar.md | glossar-technik.md |
| Händler | Dealer, Gewerblich, Verkäufer-Typ | fachbereiche/voranmeldung.md | querschnitt/identitaet-rollen.md |
| Haupt-App führend | Unklarheit, Widerspruch, maßgeblich | leitplanken.md (L0) | E25 |
| Hexagonal | Ports & Adapter, Clean Architecture | architektur/zielbild.md | L3, glossar-technik.md |
| Im Verkauf | Selling, released, freigegeben | querschnitt/artikel-lebenszyklus.md | fachbereiche/oeffentlicher-katalog.md |
| Inselmodus | Offline, Notbetrieb lokal | architektur/betrieb.md | E1b |
| Internet am Basar-Ort | Leitung, Konnektivität, Uplink, WLAN | architektur/betrieb.md | E1, E1b, R1 |
| Kasse | Verkauf, Checkout, Sales, Warenkorb | fachbereiche/verkauf-kasse.md | L5 |
| Kassenpersonal | cashier, Kassierer, Helfer | querschnitt/identitaet-rollen.md | glossar.md |
| Kassenvorgang | Bon, Sale, Bezahlvorgang | fachbereiche/verkauf-kasse.md | querschnitt/datenmodell.md |
| Katalog | öffentliche Liste, Live-Liste, Catalog | fachbereiche/oeffentlicher-katalog.md | E10, E10a, E17, L4 |
| Kategorie | Category | querschnitt/auswahlfelder-stammdaten.md | – |
| Komponenten | Components, PrimeNG, Dumb Component | querschnitt/ui-grundlagen.md | docs/components/overview.md |
| Konditionen | Provision, Gebühr, commission, feePerItem | querschnitt/auswahlfelder-stammdaten.md | fachbereiche/rueckgabe-abrechnung.md, E9 |
| Konto | Account, Benutzer, User | querschnitt/identitaet-rollen.md | E11 |
| Kosten | Budget, laufende Kosten | architektur/betrieb.md | E13, R9 |
| Laufkunde | Walk-in, vor Ort angelegt | fachbereiche/annahme.md | querschnitt/identitaet-rollen.md, E8 |
| Lastisolation | Last, Traffic, Skalierung | architektur/zielbild.md | L4, L5, E2 |
| Lebenszyklus | Zustand, Status, State | querschnitt/artikel-lebenszyklus.md | – |
| Leitplanken | Grundsätze, Regeln, Ein Guss | leitplanken.md | – |
| Löschkonzept | Löschfrist, Aufbewahrung, Anonymisierung | querschnitt/datenschutz.md | E7 |
| Marke | Brand | querschnitt/auswahlfelder-stammdaten.md | – |
| Microservices | Dienste, Services | architektur/zielbild.md | E2 (verworfen: Option C) |
| Migration | Umzug, Übergang, Strangler | architektur/migration.md | roadmap.md |
| Modul | Module, Bounded Context, Fachbereich | architektur/zielbild.md | L3 |
| Modularer Monolith | Monolith | architektur/zielbild.md | L3, glossar-technik.md |
| Nicht abgegeben | not delivered, nie gebracht | querschnitt/artikel-lebenszyklus.md | fachbereiche/rueckgabe-abrechnung.md, V3 |
| Nicht-Ziele | Out of Scope, ausgeklammert | uebersichtsplan.md | – |
| Notbetrieb | Notfall, Fallback, Papier-Kassenliste | architektur/betrieb.md | fachbereiche/verkauf-kasse.md, E1b, E16 |
| Nummernblock | NumberBlock, Nummernkreis, Block | querschnitt/nummern.md | fachbereiche/voranmeldung.md |
| original | Original/Neu, Badge, Stammdaten-Herkunft | querschnitt/auswahlfelder-stammdaten.md | glossar.md, E25 |
| Portal-API | Container 1, Verkäufer-Backend | architektur/zielbild.md | E2 |
| Positivliste | öffentliche Felder, erlaubte Felder | querschnitt/datenschutz.md | fachbereiche/oeffentlicher-katalog.md |
| Preis | Price, Etikett-Preis, Systempreis | querschnitt/auswahlfelder-stammdaten.md | E12, R4 |
| Profil | Profile, Kontaktdaten | fachbereiche/voranmeldung.md | E24 |
| Provision | Commission, Prozentsatz | glossar.md | fachbereiche/rueckgabe-abrechnung.md |
| QR-Code | Barcode, Scan | querschnitt/nummern.md | fachbereiche/druck-etiketten.md |
| Rechte-Matrix | Berechtigung, Permissions, Rollen | querschnitt/identitaet-rollen.md | L7 |
| Registrierung | Selbstregistrierung, Einladung, Sign-up | fachbereiche/voranmeldung.md | querschnitt/identitaet-rollen.md |
| Reservierung | zurücklegen | fachbereiche/oeffentlicher-katalog.md | Nicht-Ziel |
| Risiko | Risk | risiken.md | – |
| Role-Toggle | Rollenwechsel | querschnitt/identitaet-rollen.md | E22 (entfällt) |
| Rückgabe | Return, Rückgabe-Scan | fachbereiche/rueckgabe-abrechnung.md | querschnitt/artikel-lebenszyklus.md, L2 |
| Scanner | Barcode-Scanner, Kamera | querschnitt/ui-grundlagen.md | fachbereiche/verkauf-kasse.md |
| Shell | Sidebar, Navigation, Burger, Titelleiste | querschnitt/ui-grundlagen.md | E21, E22 |
| Stammdaten | Master Data, Marken, Kategorien, Typen | querschnitt/auswahlfelder-stammdaten.md | fachbereiche/verwaltung.md |
| Statistik | Auswertung, KPI, Dashboard | fachbereiche/statistik-auswertung.md | – |
| Storno | Undo, Rückbuchung | fachbereiche/verkauf-kasse.md | – |
| Styleguide | Industry, Design System, style-guide | querschnitt/ui-grundlagen.md | E23 |
| Termine | Voranmeldeschluss, Abgabezeitraum, Verkaufszeitraum, Rückgabezeitraum | glossar.md | fachbereiche/verwaltung.md, V7 |
| Toast | Meldung, Feedback, Result-Overlay | querschnitt/ui-grundlagen.md | – |
| Übergabe | Handover, Verantwortungswechsel | querschnitt/artikel-lebenszyklus.md | L2 |
| Umnummerieren | Renumber, Artikelwandlung | architektur/migration.md (V1) | querschnitt/nummern.md |
| Verkäufer | Seller, Privatverkäufer | glossar.md | querschnitt/identitaet-rollen.md, querschnitt/datenmodell.md |
| Verkäufer-Teilnahme | Teilnahme am Basar | querschnitt/datenmodell.md | – |
| Verkäufer-Typ | SellerType, Privat, Händler | querschnitt/auswahlfelder-stammdaten.md | E9 |
| Verkauft | Sold | querschnitt/artikel-lebenszyklus.md | fachbereiche/verkauf-kasse.md |
| Verlust | verloren, gestohlen, Lost | querschnitt/artikel-lebenszyklus.md | fachbereiche/rueckgabe-abrechnung.md |
| Verwaltung | Admin-Bereich, Administration | fachbereiche/verwaltung.md | – |
| Voranmelde-Nummer | PreRegistrationNumber, Blocknummer | querschnitt/nummern.md | E3, E4, Z4 |
| Voranmeldeschluss | RegistrationDeadline, Anmeldeschluss | querschnitt/artikel-lebenszyklus.md | E5, V7 |
| Voranmeldung | Portal, Advance Registration, BAR | fachbereiche/voranmeldung.md | – |
| Wiederverwenden | nächster Basar, übernehmen | querschnitt/artikel-lebenszyklus.md | E5b |
| Zielbild | Architektur, Target Picture | architektur/zielbild.md | E0, E2 |
| Zurückgegeben | Returned | querschnitt/artikel-lebenszyklus.md | fachbereiche/rueckgabe-abrechnung.md |
