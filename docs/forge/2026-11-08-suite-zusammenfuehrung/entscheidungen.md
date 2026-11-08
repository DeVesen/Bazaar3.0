# Entscheidungslog

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](README.md)
Schlagworte: Entscheidung, E-Nummer, offen, empfohlen, entschieden, revidiert

**Einzige Quelle** für Entscheidungen der Suite-Planung. Teildokumente verweisen nur mit der E-Nummer
darauf. Status: `offen` → `empfohlen` (Vorschlag liegt vor) → `entschieden (Datum, wer)` →
ggf. `revidiert (Datum, durch E…)`.

Entscheidungsreihenfolge für die offenen Punkte:
**E20/E13/E14 → E2 → E7/E11 → E3/E4 → E5/E12 → alle übrigen.**

---

| # | Frage | Status | Ergebnis / Empfehlung | Wer | Details in |
|---|---|---|---|---|---|
| **E0** | Zielbild der Infrastruktur | **entschieden** 2026-11-08, PO | **Eine** Infrastruktur mit **einer** Datenbank, lauffähig in der Cloud (bevorzugt) oder als Docker-Stack auf eigenem Server. Kein Import/Export. Übergabe durch Annahme, Rückgabe durch Rückgabe. | PO | [zielbild](architektur/zielbild.md) |
| **E1** | Muss die Kasse ohne Internet laufen? | **entschieden** 2026-11-08 durch E0 | Nein. Die Kasse läuft gegen die gemeinsame Infrastruktur; am Basar-Ort ist Internet nötig. **Revidiert** gegenüber Plan v2 (dort: Offline-Pflicht). Spec Haupt-App §7.2 wird angepasst. | PO | [betrieb](architektur/betrieb.md) |
| E1b | Notbetrieb bei Internetausfall am Basar-Tag | empfohlen | Stufe 1: zweite Leitung (Mobilfunk-Router, anderer Anbieter). Stufe 2: Papier-Kassenliste mit Nacherfassung. Stufe 3 (optional, später): **Inselmodus**, d. h. derselbe Docker-Stack lokal mit Datenstand vom Vorabend und Rückspielen danach. | PO + Orga | [betrieb](architektur/betrieb.md) |
| E2 | Zuschnitt in Container | empfohlen | **Eine Codebasis, drei Container:** Portal-API (Verkäufer/Händler), Basar-API (Team), Katalog (öffentlich). Gemeinsame DB, Schema je Modul. | PO | [zielbild](architektur/zielbild.md) |
| E3 | Welche Nummer steht auf dem Etikett? | empfohlen | **(c')**: Die Voranmelde-Nummer wird bei der Annahme unverändert Basar-Tag-Nummer. Neue Nummern nur für Ausnahmen, aus eigenem Bereich. | PO + Orga | [nummern](querschnitt/nummern.md) |
| E4 | Getrennte Zahlenbereiche, neuer Bereich je Basar | empfohlen | Ja | PO | [nummern](querschnitt/nummern.md) |
| E5 | Ab wann ist der Artikel für den Verkäufer gesperrt? | empfohlen | **Ab Annahme bis Rückgabe** (PO-Wunsch). Mit einem Datenbestand gibt es keine Übernahme-Lücke mehr. Zusätzlich sperrt der Voranmeldeschluss das **Neuanlegen**. Preisänderungen nach dem Etikettenschreiben zeigen einen Hinweis „Etikett anpassen“. | PO | [lebenszyklus](querschnitt/artikel-lebenszyklus.md) |
| E5b | Was gilt nach der Rückgabe? | empfohlen | Der Artikel gehört wieder dem Verkäufer und ist für den nächsten Basar **wiederverwendbar** (neue Voranmelde-Nummer). Verkaufte und abgerechnete Daten bleiben unveränderlich. | PO | [lebenszyklus](querschnitt/artikel-lebenszyklus.md) |
| E6 | Was sieht der Verkäufer live? | empfohlen | Status je Artikel, Basar-Tag-Nummer, Anzahl verkauft, gezahlte Gebühr. Ein Betrag nur als „vorläufiger Verkaufswert vor Provision“. Nach Abrechnung: Auszahlung und Beleg. | PO + Kassenwart | [voranmeldung](fachbereiche/voranmeldung.md) |
| E7 | Mehrere Basare in einem Bestand, Konten dauerhaft? | empfohlen | Ja, mit Basar-Konzept und Löschkonzept | PO + Datenschutz | [datenmodell](querschnitt/datenmodell.md) |
| E8 | Laufkunden (vor Ort angelegt) | empfohlen | Liegen im selben Bestand, zunächst ohne Login. Ein Online-Zugang folgt auf Wunsch per Einladung an die E-Mail. | PO + Datenschutz | [annahme](fachbereiche/annahme.md) |
| E9 | Konditionen live aus Typ oder eingefroren? | empfohlen | Eingefroren mit der ersten Annahme des Verkäufers im Basar | PO + Kassenwart | [rueckgabe-abrechnung](fachbereiche/rueckgabe-abrechnung.md) |
| E10 | Öffentliche Liste: Felder, Zeitfenster | empfohlen | Ohne Artikelnummer, ohne Beschreibung, freigeschaltet ab Verkaufsöffnung, vorher nur eine Übersicht | PO | [katalog](fachbereiche/oeffentlicher-katalog.md) |
| E10a | Katalog als statische Daten oder eigener Dienst? | empfohlen | Eigener schlanker Container, der vorbereitete Daten mit Cache ausliefert. Er berührt die Arbeitsdaten nicht direkt. | PO | [zielbild](architektur/zielbild.md) |
| E11 | Identität und Rollen | empfohlen | **Ein** Kontenbestand für alle, Rollen Verkäufer / Basar-Team / Admin, Händler als Verkäufer-Typ | PO | [identitaet-rollen](querschnitt/identitaet-rollen.md) |
| E12 | Welcher Preis gilt bei Abweichung Etikett ↔ System? | empfohlen | System. Die Annahme zeigt den Systempreis, das Team korrigiert gegebenenfalls das Etikett. | Orga | [annahme](fachbereiche/annahme.md) |
| E13 | Budget für laufende Kosten | offen | Rahmen festlegen | Vorstand | [betrieb](architektur/betrieb.md) |
| E14 | Betreiber von Cloud-Konto und Verträgen | empfohlen | Der Verein, nicht eine Privatperson | Vorstand | [betrieb](architektur/betrieb.md) |
| E15 | Zielbasar je Etappe, Einfrierfenster | offen | festlegen | PO | [roadmap](roadmap.md) |
| E16 | Wer entscheidet am Tag über den Notbetrieb? | empfohlen | Die benannte Technik-Rolle | Orga | [betrieb](architektur/betrieb.md) |
| E17 | Öffentliche Liste überhaupt? | offen | Empfehlung: ja, mit den Vorgaben aus E10 | Vorstand | [katalog](fachbereiche/oeffentlicher-katalog.md) |
| E18 | Spenden statt Rückgabe, Abholfrist | offen | Basarbedingungen prüfen | Orga | [rueckgabe-abrechnung](fachbereiche/rueckgabe-abrechnung.md) |
| E19 | Frontends: dauerhaft drei oder später eins? | offen | Vorerst drei (Voranmeldung, Basar, Katalog). Eine Vereinheitlichung wird nach Etappe 6 neu bewertet. | PO | [ui-grundlagen](querschnitt/ui-grundlagen.md) |
| E20 | Hosting-Ziel | empfohlen | Cloud: Azure Container Apps + verwaltetes PostgreSQL (wie in R12 geplant), EU-Region. Docker-Variante: ein Compose-Stack, z. B. auf einem Vereins-Server oder VPS. | PO + Vorstand | [betrieb](architektur/betrieb.md) |
| E21 | Einheitlicher Breakpoint-Satz | **entschieden** 2026-11-08 durch E25 | **Wie Haupt-App:** Shell zweistufig, Mobile ≤ 768 px / Desktop > 768 px (`bazaar-app/spec.md` §7.1). Stufen auf Komponentenebene bleiben, wie in `docs/components/` beschrieben (z. B. Form-Grid ≤ 1024 px, Modal gestuft). Die Tablet-Stufe der Voranmelde-Shell entfällt. | PO | [ui-grundlagen](querschnitt/ui-grundlagen.md) |
| E22 | Role-Toggle für Admins | **entschieden** 2026-11-08 durch E25 | **Kein Toggle** (wie Haupt-App, `bazaar-app/spec.md` §4). Personen mit mehreren Rollen nutzen das passende Frontend: Portal als Verkäufer, Basar als Team bzw. Admin. | PO | [identitaet-rollen](querschnitt/identitaet-rollen.md) |
| E23 | Welcher Styleguide gilt für die Suite? | **entschieden** 2026-11-08 durch E25 | Der Styleguide der Haupt-App, **„Industry“** ([`bazaar-app/design/industry-styleguide.md`](../../requirements/bazaar-app/design/industry-styleguide.md)). `docs/style-guide/` beschreibt ein fremdes Projekt (ATLAS/MyTRUMPF) und gilt nicht. Ob er entfernt wird, entscheidet der PO. | PO | [ui-grundlagen](querschnitt/ui-grundlagen.md) |
| E24 | Wer darf Verkäufer-Stammdaten am Basar-Tag ändern? | empfohlen | Verkäufer jederzeit (Kontakt). Das Team nur Konditionen und Laufkunden-Daten. | PO | [identitaet-rollen](querschnitt/identitaet-rollen.md) |
| **E25** | Was gilt bei Widersprüchen oder Unklarheiten zwischen den heutigen Apps? | **entschieden** 2026-11-08, PO | **Die Haupt-App ist federführend** (Spec, Epics, Komponenten, Styleguide, Breakpoints, Rechte, API-Querschnitt, Begriffe). Die Voranmelde-App gilt nur, wo die Haupt-App nichts regelt. | PO | [leitplanken](leitplanken.md) L0 |
| E26 | errorCode: Programmlogik oder Übersetzung? | **entschieden** 2026-11-08 durch E25 | Wie Haupt-App: Der errorCode dient der Programmlogik, nicht der Übersetzung (`bazaar-app/api/cross-cutting.md` §4). | PO | [api-konventionen](querschnitt/api-konventionen.md) |

---

## Revisionshinweise

- **2026-11-08:** E0 neu (PO-Vorgabe). Dadurch sind E1 und das Zielbild „zwei Datenbanken mit Abgleich“ aus [Plan v2](historie/uebersichtsplan-v2.md) revidiert. E5 wechselt zur PO-Variante, weil die Übernahme-Lücke entfällt.
- **2026-11-08:** E25 neu (PO): Bei Unklarheiten führt die Haupt-App. Daraus entschieden: E21 (Breakpoints wie Haupt-App), E22 (kein Role-Toggle), E23 (Styleguide „Industry“), E26 (errorCode wie Haupt-App).
