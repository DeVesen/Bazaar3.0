# Übersichtsplan v1: Zusammenführung der Bazaar Suite

Status: Entwurf v1 (vor Review)
Datum: 2026-11-08
Ebene: Projektleitung / Stakeholder, kein Entwicklungsplan
Grundlage: sechs unabhängige Analysen (je Backend: Geschäftsprozess, Daten/Persistenz, Architektur/Betrieb)

---

## 1. Ausgangslage in einem Absatz

Die Suite besteht heute aus zwei getrennten Welten. Die **Voranmelde-App** läuft in der Cloud,
Verkäufer erfassen dort Wochen vorher ihre Artikel. Die **Haupt-App** läuft am Basar-Tag im
lokalen Netz, bewusst **ohne Internet** (Spec Haupt-App §1, §7.2). Verbunden sind beide nur über
eine JSON-Datei, die der Admin am Basar-Morgen exportiert und importiert. Danach erfährt die
Voranmelde-App nichts mehr: kein Abgabe-, Verkaufs- oder Erlösstatus für den Verkäufer.

Beide Backends nutzen denselben Tech-Stack (.NET, PostgreSQL), dasselbe ID-Format (8 Zeichen) und
übernehmen die IDs beim Import 1:1. Es gibt also schon heute einen gemeinsamen Schlüssel, auf den
eine Zusammenführung aufbauen kann.

## 2. Ziele des Vorhabens (vom Product Owner)

| # | Ziel |
|---|---|
| Z1 | Beide Apps auf Datenebene enger zusammenführen, statt Datei-Übergabe |
| Z2 | Backend-Zuschnitt neu entscheiden (ein Monolith oder mehrere Dienste) |
| Z3 | Neue **öffentliche Live-Artikelliste** „Im Verkauf“ ohne Anmeldung, eigenes Frontend + Backend, Last isoliert |
| Z4 | **Zwei getrennte Artikelnummern**: Voranmelde-Nummer und Basar-Tag-Nummer, je für sich eindeutig |
| Z5 | Verkäufer sieht zuerst nur seine Nummer, nach der Abgabe zusätzlich die Basar-Tag-Nummer |
| Z6 | **Änderungssperre** für den Verkäufer ab „Im Verkauf“ bis „Rückgabe“ |
| Z7 | Frontends bleiben vorerst unverändert, nur die Backend-Adresse wird umgestellt |

## 3. Die eine Kernfrage, die alles entscheidet

> **Muss die Kasse am Basar-Tag ohne Internet funktionieren?**

Alle sechs Analysen kommen unabhängig zum selben Punkt:

- **Ja (heutige Spec):** Dann kann es **keine einzige gemeinsame Datenbank** geben. Liegt sie in der
  Cloud, steht die Kasse bei Internetausfall still. Liegt sie im LAN, erreichen die Verkäufer die
  Voranmeldung nicht. „Verschmelzen auf Datenbankebene“ heißt dann: **ein gemeinsames Datenmodell
  mit gemeinsamen Schlüsseln, zwei physische Datenbanken, automatischer Abgleich.**
- **Nein (Internet wird Pflicht):** Dann ist eine gemeinsame Cloud-Datenbank möglich. Preis:
  Kasse und Annahme hängen an der Internetleitung des Veranstaltungsorts, die Latenz an der Kasse
  steigt, ein Ausfall stoppt den Basar.

**Empfehlung:** Offline-Fähigkeit beibehalten. Ein Basar-Tag mit stehender Kasse ist das größte
denkbare Geschäftsrisiko; der Abgleich ist beherrschbar.

## 4. Empfohlenes Zielbild

### 4.1 Drei Bausteine statt eines Monolithen oder vieler Microservices

```
            CLOUD                                         LAN am Basar-Tag
 ┌──────────────────────────┐                     ┌──────────────────────────┐
 │ Voranmelde-Backend       │  ① Übernahme (Pull) │ Basar-Backend            │
 │ (heute BAR)              │ ◄────────────────── │ (heute Haupt-App)        │
 │ Verkäufer, Artikel,      │                     │ Annahme, Kasse, Rückgabe,│
 │ Nummernblöcke, Stammdaten│  ② Status (Push)    │ Abrechnung               │
 │ + Empfang Statusmeldungen│ ◄────────────────── │ + Ausgangs-Warteschlange │
 └────────────┬─────────────┘                     └──────────────────────────┘
              │ ③ Projektion ohne Personendaten
 ┌────────────▼─────────────┐
 │ Öffentlicher Katalog     │  ← Interessenten (Homepage), ohne Login, mit Cache/CDN
 │ (neu, nur lesend)        │
 └──────────────────────────┘
```

- **Jeder Baustein ist für sich ein modularer Monolith in Hexagonal-Architektur.** Das entspricht
  dem heutigen Stil beider Apps und hält den Betrieb für ein kleines Team einfach.
- **Keine feingranularen Microservices.** Die Lastmengen (zweistellige bis niedrige dreistellige
  Verkäuferzahl, rund 20 Geräte am Tag) rechtfertigen weder Broker noch Service-Mesh.
- **Lastisolation entsteht durch die drei Bausteine:** Der öffentliche Verkehr trifft nur den
  Katalog; Voranmeldung und Kasse bleiben unberührt.
- **Verbindungen gehen immer vom LAN nach außen.** Das LAN braucht keinen offenen Port.

### 4.2 Was „Verschmelzen auf Datenebene“ konkret bedeutet

| Gemeinsam | Getrennt |
|---|---|
| Ein fachliches Datenmodell (Verkäufer, Artikel, Stammdaten, Basar) mit **denselben IDs** | Physische Datenbanken (Cloud, LAN, Katalog) |
| Gemeinsame Begriffe und ein gemeinsames Glossar | Schreibrechte: je Lebensphase hat genau **ein** System die Hoheit |
| Ein gemeinsames Austauschformat (Vertrag) für den Abgleich | Benutzerkonten der Kasse (bleiben lokal, offline anmeldbar) |
| Gemeinsame Konventionen (Benennung, Schemas je Fachbereich) | Personendaten nie im öffentlichen Katalog |

### 4.3 Datenhoheit über den Lebenszyklus

Die Hoheit wechselt **pro Phase**, nicht pro Tabelle. So gibt es keine Schreibkonflikte.

| Daten | Vor dem Basar | Am Basar-Tag | Nach dem Basar |
|---|---|---|---|
| Verkäuferkonto, Kontakt, Login | Voranmeldung | Voranmeldung (Basar liest) | Voranmeldung |
| Artikel-Stammdaten, Voranmelde-Nummer | Voranmeldung | **Basar** (ab Abgabe) | Basar → zurück an Voranmeldung |
| Basar-Tag-Nummer, Status, Verkauf, Rückgabe | – | **Basar** | Basar (Cloud projiziert nur) |
| Konditionen, Annahmegebühr, Abrechnung | Voranmeldung (Typ) | **Basar** (eingefroren) | Basar |
| Marken, Kategorien, Verkäufer-Typen | Voranmeldung (Master) | Basar darf ergänzen → Rückmeldung | Voranmeldung |
| Kassenkonten, Etiketten, Drucktexte | – | Basar | Basar |

## 5. Fachliches Kernstück: gemeinsamer Artikel-Lebenszyklus

### 5.1 Zustände

| Zustand | Bedeutung | Verkäufer darf | Öffentlich sichtbar |
|---|---|---|---|
| **Entwurf** | vorangemeldet, noch nicht übergeben | alles ändern/löschen | nein |
| **Übernommen** | Basar-System hat die Daten geholt | nichts mehr (siehe 5.3) | nein |
| **Abgegeben / Im Verkauf** | physisch angenommen, Basar-Tag-Nummer vergeben | nichts | **ja** |
| **Verkauft** | an der Kasse bezahlt | nichts | nein (oder „verkauft“) |
| **Zurückgegeben** | an Verkäufer zurück | offen (Entscheidung E5) | nein |
| **Nicht abgegeben** | angemeldet, aber nie gebracht | offen | nein |
| *Verkäufer abgerechnet* | Auszahlung erfolgt | nichts, sieht Erlös | – |

Neu gegenüber heute: **„Übernommen“** und **„Nicht abgegeben“**. Heute löscht die Abrechnung
nicht abgegebene Artikel; künftig wird markiert statt gelöscht.

### 5.2 Zwei Artikelnummern

| | Voranmelde-Nummer | Basar-Tag-Nummer |
|---|---|---|
| Wer vergibt | Voranmeldung, aus dem Nummernblock des Verkäufers | Basar-System bei der Abgabe |
| Wann | beim Anlegen | bei der Annahme |
| Pflicht | nein (Laufkunden haben keine) | ab Abgabe ja |
| Eindeutig | je Basar | je Basar |
| Wofür | Zuordnung bis zur Abgabe | Etikett, Kasse, Rückgabe, Abrechnung, öffentliche Liste |
| Sieht Verkäufer | immer | ab Abgabe |

**Verwechslungsschutz:** Beide Nummern sind Zahlen und für Menschen sichtbar. Ein falsch gescanntes
Voranmelde-Etikett darf an der Kasse nie einen fremden Artikel treffen. Daher **getrennte
Zahlenbereiche** (z. B. Voranmeldung ab 2001, Basar-Tag ab 50000) oder eine Kennung im QR-Code.

**Offene Kernfrage Etikett (E3):** Welche Nummer klebt physisch am Artikel?
- (a) Am Annahmetisch wird ein neues Etikett gedruckt (braucht Einzeldruck/Etikettendrucker).
- (b) Vorgedrucktes Blanko-Etikett wird bei der Abgabe zugeordnet (zwei Scans).
- (c) Basar-Tag-Nummer = Voranmelde-Nummer, wenn frei; neue Nummer nur im Konfliktfall.
  Einfachster Ablauf, aber dann keine getrennten Zahlenbereiche.

### 5.3 Änderungssperre

- Gewünscht: Sperre von „Im Verkauf“ bis „Rückgabe“.
- **Befund:** Heute fallen „Angenommen“ und „Im Verkauf“ in der Annahme zusammen. Zwischen
  Übernahme der Daten am Morgen und der Abgabe am Tisch entsteht eine **Lücke**: Ändert der
  Verkäufer dann noch, geht die Änderung verloren oder kollidiert mit Korrekturen der Kasse.
- **Empfehlung:** Sperre ab **Übernahme** (bzw. ab Beginn des Abgabezeitraums), nicht erst ab
  „Im Verkauf“. Die Sperre gilt im Fachmodell, nicht nur in der Oberfläche, und deckt auch Import,
  Löschen des Kontos und Admin-Aktionen ab.

## 6. Öffentliche Live-Artikelliste

| Erlaubt | Verboten |
|---|---|
| Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis, Status | Verkäufername, Verkäufer-ID, Kontakt, Adresse |
| Basar-Tag-Nummer (optional, zum Finden vor Ort) | Voranmelde-Nummer (verrät Zugehörigkeit zum Verkäufer) |
| Hinweis „Stand hh:mm, ohne Gewähr“ | Freitext-Beschreibung (kann Personendaten enthalten) – nur geprüft oder gar nicht |
| | Gebühren, Erlöse, Zeitstempel, Konditionen |

- **Aktualität:** Sekunden bis ca. 1 Minute genügen. Die Liste ist Information, keine Reservierung.
- **Bei Internetausfall am Basar-Ort** veraltet die Liste nur; die Kasse merkt nichts.
- **Bilder** gibt es heute nicht. Sie wären eine neue Anforderung (Upload, Moderation, Bildrechte).
- **Sicherheit:** Eigener Dienst, eigene Daten ohne Personenbezug, Cache/CDN, Begrenzung der
  Anfragen gegen Bots.

## 7. Voraussetzungen und technische Altlasten (vor der Zusammenführung zu lösen)

Diese Punkte haben die Analysen als **Blocker** für einen verlässlichen Abgleich gefunden:

| # | Befund | Warum kritisch |
|---|---|---|
| V1 | Umnummerieren in der Annahme **löscht** den Artikel und legt ihn mit neuer ID neu an | Verbindung zur Voranmeldung geht verloren |
| V2 | Erneuter Import **löscht und ersetzt** Verkäufer samt Artikeln | Passt nicht zu dauerhaftem Abgleich |
| V3 | Abrechnung **löscht** nicht abgegebene Artikel | Verkäufer verliert Artikel aus seiner Sicht |
| V4 | Es gibt **kein Basar-/Saison-Konzept**; Nummern und Einstellungen gelten global | Gemeinsame Daten über mehrere Jahre nicht trennbar |
| V5 | Keine Sperre gegen gleichzeitiges Verkaufen desselben Artikels an zwei Kassen | Doppelverkauf möglich (auch heute schon) |
| V6 | Voranmelde-Artikelnummer ist in der DB nicht eindeutig abgesichert | Doppelte Nummern bei gleichzeitiger Anlage möglich |
| V7 | Termine (Voranmeldeschluss, Abgabe) werden nur angezeigt, nicht durchgesetzt | Sperre braucht durchgesetzte Phasen |
| V8 | Vorangemeldete Artikel bekommen beim Freigabe-Scan nie „angenommen“ gesetzt | Lebenszyklus uneinheitlich |
| V9 | Sicherheit Voranmeldung: Anmelde-Token 5 Tage gültig, keine Bremse gegen Passwort-Raten | Vor Öffnung weiterer öffentlicher Endpunkte beheben |
| V10 | Voranmelde-Backend kann nur als eine Instanz laufen (Migration beim Start) | Skalierung und sichere Updates |

## 8. Widersprüche zur bestehenden Spec (brauchen bewusste Entscheidung)

- Haupt-App §1/§7.2 „vollständig offline“ – bleibt erhalten (Empfehlung), muss aber um den Abgleich ergänzt werden.
- Voranmelde-App §11.1 und `entities.md` „Datei ist einziger Berührungspunkt, kein Rückkanal“ – entfällt.
- Voranmelde-App §10.0.1 „keine Microservices“ / „Monolith, ein Container je App“ (CLAUDE.md) – wird zu „drei Bausteine“.
- „Artikel hat keinen Status“ (Voranmelde-Entities) – entfällt.
- „Diese App vergibt keine Nummern“ (Haupt-App, Artikelannahme) – entfällt.
- Begriffe: „Abgabegebühr“ vs. „Annahmegebühr“; `original`-Kennzeichen mit zwei Bedeutungen;
  Admin ist einmal Verkäufer, einmal Benutzer; Konditionen einmal live, einmal überschreibbare Kopie.

## 9. Entscheidungen, die der Product Owner treffen muss

| # | Frage | Empfehlung |
|---|---|---|
| E1 | Muss die Kasse ohne Internet laufen? | **Ja**, Offline beibehalten |
| E2 | Zielbild: ein Monolith, drei Bausteine oder Microservices? | **Drei Bausteine**, jeder ein modularer Monolith |
| E3 | Welche Nummer steht auf dem Etikett (a/b/c)? | (b) oder (c), abhängig von Drucker-Ausstattung |
| E4 | Getrennte Zahlenbereiche für beide Nummern? | Ja, falls E3 ≠ (c) |
| E5 | Ab wann Sperre, und nach Rückgabe wieder frei? | Ab Übernahme; nach Rückgabe frei nur für nächsten Basar |
| E6 | Sieht der Verkäufer Verkaufsstatus und Erlös live? | Status ja, Erlös vorläufig ja, mit Hinweis |
| E7 | Ein Basar oder mehrere Saisons in einer Datenbank? Konten dauerhaft? | Mehrere; Basar als neues Konzept |
| E8 | Werden Laufkunden (vor Ort angelegt) in die Cloud übertragen? | Nur Artikel-Status ohne Personendaten; Konto nur auf Wunsch |
| E9 | Konditionen: live aus dem Verkäufer-Typ oder Snapshot? | Snapshot ab Abgabe |
| E10 | Öffentliche Liste: mit Basar-Tag-Nummer, Beschreibung, Bildern? Ab wann sichtbar? | Nummer ja, Beschreibung nein, Bilder später; sichtbar ab Basar-Beginn |
| E11 | Admin-Konten zusammenführen? | Gemeinsames Rollenmodell, Kassenkonten lokal |

## 10. Vorgehen in Etappen (ohne Big Bang)

Leitplanke: **Der nächste Basar darf nicht gefährdet werden.** Der Datei-Weg bleibt bis zum Ende
als Rückfallebene erhalten.

| Etappe | Inhalt | Ergebnis für Stakeholder |
|---|---|---|
| **0 – Entscheiden** | E1–E11 klären, Spec und Glossar anpassen | Freigegebenes Zielbild |
| **1 – Härten** | V5 (Doppelverkauf), Backups, Versions-Tags statt „latest“, V9 | Sicherer Basar-Betrieb, unabhängig vom Umbau |
| **2 – Fundament** | Basar-Konzept (V4), zwei Nummern (Z4), stabile IDs (V1–V3), Lebenszyklus (V8), durchgesetzte Termine (V7) | Gemeinsames Fachmodell in beiden Apps |
| **3 – Übernahme** | Basar-System holt die Daten per Knopfdruck aus der Cloud, statt Datei | Kein Datei-Hantieren mehr am Basar-Morgen |
| **4 – Rückmeldung** | Statusmeldungen vom Basar in die Cloud, mit Warteschlange bei Internetausfall; erst Probebetrieb | Cloud kennt Abgabe, Verkauf, Rückgabe |
| **5 – Verkäufer-Sicht** | Basar-Tag-Nummer, Status, Erlös, Änderungssperre in der Voranmelde-App | Ziele Z5, Z6 erfüllt |
| **6 – Öffentliche Liste** | Neuer Katalog-Dienst + Frontend, Cache, Datenschutz-Prüfung | Ziel Z3 erfüllt |
| **7 – Optional** | Gemeinsame Code-Basis/Verträge, Haupt-App in Module zerlegen, Konten vereinheitlichen | Wartbarkeit |

Abhängigkeiten: 2 vor 3, 3 vor 4, 4 vor 5 und 6. Etappe 1 kann sofort und parallel laufen.

## 11. Risiken

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Internetausfall am Basar-Tag | Liste und Verkäufer-Sicht veralten | Offline-Betrieb, Warteschlange, Anzeige „Stand hh:mm“ |
| Nummernverwechslung beim Scannen | Falscher Artikel, falscher Preis | Getrennte Bereiche oder QR-Kennung |
| Datenschutzverstoß in öffentlicher Liste | Rechtliches Risiko | Positivliste der Felder, eigener Datenbestand ohne Personendaten |
| Migration alter Daten | Herkunft alter Nummern nicht erkennbar | Bereinigungslauf, Start mit neuem Basar |
| Betriebsaufwand für kleines Team | Überlastung | Drei Bausteine statt Microservices, kein eigenes Gateway |
| Doppelte Begriffe | Missverständnisse in Umsetzung | Glossar vor Etappe 2 |
| Uplink am Veranstaltungsort unbekannt | „Live“-Versprechen nicht haltbar | Vorab messen, Erwartung kommunizieren |
