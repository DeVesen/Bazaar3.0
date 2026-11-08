# Risiken

Status: Entwurf · Stand: 2026-11-08 · Teil von: [README](README.md)
Lesen zusammen mit: [betrieb](architektur/betrieb.md) · [roadmap](roadmap.md)
Schlagworte: Risiko, Wahrscheinlichkeit, Gegenmaßnahme, Verantwortlich

| # | Risiko | Wahrsch. | Wirkung | Gegenmaßnahme | Verantwortlich | Siehe |
|---|---|---|---|---|---|---|
| R1 | **Internetausfall am Basar-Ort** (durch E0 neu kritisch) | mittel | Annahme und Kasse stehen | Leitungstest, zweite Leitung (Mobilfunk), Papier-Notbetrieb, optional Inselmodus | Technik-Rolle | [betrieb](architektur/betrieb.md), E1b |
| R2 | Langsame Kasse durch Cloud-Latenz oder Last | niedrig–mittel | Schlangen | eigener Container Basar-API, Zielwerte, Last-Test, Kasse hat Vorrang | Entwicklung | [zielbild](architektur/zielbild.md), L5 |
| R3 | Verwechslung von Nummern, Vorjahres-Etiketten | mittel | falscher Artikel, falscher Preis | getrennte Bereiche je Basar, Sichtabgleich an der Kasse | Orga | [nummern](querschnitt/nummern.md) |
| R4 | Etikett-Preis ≠ System-Preis nach Online-Änderung | mittel | Diskussion an der Kasse | Hinweis „Etikett anpassen“, Systempreis bei der Annahme zeigen (E12) | Orga | [lebenszyklus](querschnitt/artikel-lebenszyklus.md) |
| R5 | Datenschutzverstoß im Katalog | niedrig | rechtlich, Vertrauen | Positivliste, keine Nummern, Ausblenden | Datenschutz | [datenschutz](querschnitt/datenschutz.md) |
| R6 | Know-how bei einer Person | hoch | Stillstand | dieser Planungs-Hub, einfache Architektur, Vertretung | Vorstand | – |
| R7 | Umbau kollidiert mit dem Basar-Kalender | mittel | unfertige Etappe zum Basar | Einfrierfenster, alte Apps bleiben bis Etappe 4 | PO | [roadmap](roadmap.md) |
| R8 | Datenübernahme: Dubletten, Altdaten | mittel | Fehler beim Start | Bereinigung, Start mit neuem Basar | Entwicklung | [migration](architektur/migration.md) |
| R9 | Laufende Kosten höher als erwartet | mittel | Budget | Kostenschätzung, Docker-Variante als Alternative | Vorstand | E13, E20 |
| R10 | Flickenteppich durch Planung in Einzelteilen | mittel | uneinheitliche Suite | Leitplanken, Querschnitt vor Fachbereich, Entscheidungslog | PO | [README](README.md) §4 |
| R11 | Enttäuschung „online da, real weg“ | hoch | Beschwerden | Hinweis im Katalog, keine Reservierung | PO | [katalog](fachbereiche/oeffentlicher-katalog.md) |
| R12 | Verkäufer akzeptieren neue Regeln nicht (Sperre, Neuanlage-Schluss) | mittel | Mehraufwand am Tisch | früh ankündigen (Infomail, FAQ) | PO | [voranmeldung](fachbereiche/voranmeldung.md) |
| R13 | Doppelverkauf im heutigen Betrieb | mittel | falsche Abrechnung | Etappe 1 (V5) | Entwicklung | [migration](architektur/migration.md) |
