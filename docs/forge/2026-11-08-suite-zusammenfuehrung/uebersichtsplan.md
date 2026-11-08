# Übersichtsplan Bazaar Suite 2

Status: Entwurf v3 · Stand: 2026-11-08 · Teil von: [README](README.md)
Ebene: Vorstand / Basar-Orga / Projektleitung, **kein Entwicklungsplan**
Vorgänger: [v1](historie/uebersichtsplan-v1.md), [v2](historie/uebersichtsplan-v2.md)
Schlagworte: Stakeholder, Vorstand, Gesamtbild, Ziele, Nutzen, Erfolgskriterien, Nicht-Ziele, Kurzfassung

---

## Auf einen Blick

1. **Eine Suite auf einer Infrastruktur:** Voranmelde-App und Haupt-App teilen sich künftig **eine Datenbank** und **eine Codebasis**. Sie laufen bevorzugt **in der Cloud**, alternativ als **Docker-Stack** auf eigenem Server (E0, entschieden).
2. **Kein Import/Export mehr:** Verkäufer und Händler erfassen online. Das Basar-Team übernimmt die Artikel **durch die Annahme**, und **durch die Rückgabe** gehen sie zurück an den Verkäufer.
3. **Lastisolation ohne Microservices:** Ein Code wird in **drei Container** ausgeliefert: Portal (Verkäufer), Basar (Team), Katalog (öffentlich). Ein Ansturm auf eine Seite bremst die anderen nicht (E2).
4. **Neue Abhängigkeit:** Am Basar-Ort ist Internet nötig. Gegenmaßnahmen sind eine zweite Leitung, Papier-Notbetrieb und optional ein Inselmodus (E1b).
5. **Weg dorthin:** Erst die heutigen Apps härten, dann die Suite aufbauen. Voranmeldung und Basar-Betrieb ziehen nacheinander um, danach folgen Verkäufer-Sicht und öffentlicher Katalog ([Roadmap](roadmap.md)).

## Ausgangslage

Heute sind es zwei getrennte Apps mit zwei Datenbanken:
- **Voranmeldung:** Cloud, Verkäufer erfassen vorab.
- **Haupt-App:** lokal, Basar-Tag.

Am Basar-Morgen wird eine Datei exportiert und importiert. Danach sieht der Verkäufer nichts mehr. Die
Analyse hat zudem akute Schwächen gefunden, z. B. einen möglichen Doppelverkauf an zwei Kassen und Gebührenverlust bei
erneutem Import ([Altlasten](architektur/migration.md)).

## Ziele

| # | Ziel | Erfüllt durch |
|---|---|---|
| Z1 | Beide Apps auf Datenebene zusammenführen | eine Datenbank, ein Artikel-Datensatz von Erfassung bis Abrechnung ([datenmodell](querschnitt/datenmodell.md)) |
| Z2 | Backend-Zuschnitt | eine Codebasis, drei Container ([zielbild](architektur/zielbild.md)) |
| Z3 | Öffentliche Live-Liste mit eigener Last | Katalog-Container + Cache ([katalog](fachbereiche/oeffentlicher-katalog.md)) |
| Z4 | Zwei getrennte Artikelnummern | Voranmelde- und Basar-Tag-Nummer ([nummern](querschnitt/nummern.md)) |
| Z5 | Verkäufer sieht nach Abgabe die Basar-Tag-Nummer | [lebenszyklus](querschnitt/artikel-lebenszyklus.md), Etappe 5 |
| Z6 | Änderungssperre ab „Im Verkauf“ bis „Rückgabe“ | [lebenszyklus](querschnitt/artikel-lebenszyklus.md) (E5) |
| Z7 | Frontends bleiben, nur die Backend-Adresse ändert sich | gilt für den Umzug (Etappen 3–4). Für Z5/Z6 wird das Voranmelde-Frontend erweitert. |
| Z8 | Eine Infrastruktur, Cloud oder Docker, Übergabe durch Annahme/Rückgabe (neu, 2026-11-08) | [leitplanken](leitplanken.md) L1/L2, [zielbild](architektur/zielbild.md) |

## Zielbild in einem Bild

```
 Verkäufer/Händler ──► Portal-API ─┐
                                   ├──► eine Datenbank ──► Katalog ──► Interessenten (Homepage)
 Basar-Team ─────────► Basar-API ──┘        (Cloud bevorzugt / Docker möglich)
```

**Der Artikel wandert, nicht die Daten:**

```
 Entwurf ──(Annahme)──► Im Verkauf ──(Kasse)──► Verkauft ──► Abrechnung
 Verkäufer              Basar-Team    └──(Rückgabe)──► Zurückgegeben → wieder Verkäufer
```

## Nutzen je Rolle

| Rolle | Nutzen |
|---|---|
| Verkäufer / Händler | erfassen online, sehen Annahme, Verkauf und Ergebnis live, können Artikel für den nächsten Basar wiederverwenden |
| Basar-Team | kein Doppelverkauf, vertrauter Ablauf (am Etikett genau eine Nummer), kein lokaler Server mehr |
| Admin | kein Datei-Hantieren, alles an einem Ort, Auswertung über mehrere Basare |
| Interessent | sieht das Angebot live auf der Homepage |
| Vorstand | ein System statt zwei, attraktiverer Basar, tragbarer Betrieb |

**Erfolgskriterien (Vorschlag):**
- 0 Doppelverkäufe.
- Kein Basar-Stillstand durch das Vorhaben (Notbetrieb greift).
- Kein Import/Export mehr.
- Der Katalog ist höchstens 1 Minute alt.
- Mindestens die Hälfte der Verkäufer ruft ihr Ergebnis online ab.

## Nicht-Ziele

Online-Reservierung, Online-Kauf, Online-Bezahlung, Kundenkonten für Interessenten, Artikelbilder (erste Stufe),
Neugestaltung der Oberflächen.

## Wichtigste offene Entscheidungen

Vollständige Liste: [entscheidungen](entscheidungen.md)

| # | Frage | Empfehlung |
|---|---|---|
| E20 / E13 / E14 | Hosting, Budget, Betreiber | Cloud (EU), Verein als Vertragspartner |
| E2 | Zuschnitt | eine Codebasis, drei Container |
| E1b | Notbetrieb ohne Internet | zweite Leitung + Papier, Inselmodus optional |
| E3 / E4 | Etikett, Zahlenbereiche | Voranmelde-Nummer übernehmen, Ausnahmen aus eigenem Bereich |
| E5 | Sperre | ab Annahme bis Rückgabe; Neuanlage endet mit dem Voranmeldeschluss |
| E11 | Konten | ein Kontenbestand für alle Rollen |
| E17 | Katalog überhaupt | ja, ohne Nummern, ab Verkaufsöffnung |

## Etappen (Kurzfassung)

0 Klären → 1 Heutige Apps härten → 2 Suite-Fundament → 3 Voranmeldung zieht um → 4 Basar-Betrieb zieht um
(Ziel E0 erreicht) → 5 Verkäufer-Sicht → 6 Öffentlicher Katalog → 7 Optionales. Details: [roadmap](roadmap.md)

## Größte Risiken

Internet am Basar-Ort (R1), Wissen bei einer Person (R6), Kollision mit dem Basar-Kalender (R7), Flickenteppich
durch Planung in Einzelteilen (R10). Details: [risiken](risiken.md)
