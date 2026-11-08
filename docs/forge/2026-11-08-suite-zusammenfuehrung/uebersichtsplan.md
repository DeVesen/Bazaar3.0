# Übersichtsplan: Zusammenführung der Bazaar Suite

Status: Entwurf v2 (nach Review), wartet auf Entscheidungen des Product Owners
Datum: 2026-11-08
Ebene: Projektleitung / Vorstand / Basar-Orga, **kein Entwicklungsplan**
Vorgänger: [`uebersichtsplan-v1.md`](uebersichtsplan-v1.md) (Entstehung und Änderungen siehe Anhang D)

---

## Auf einen Blick

1. **Empfehlung:** Zwei Backends bleiben getrennt: die Voranmeldung in der Cloud, der Basar-Betrieb im LAN. Sie bekommen **ein gemeinsames Datenmodell** und gleichen sich **automatisch ab**. Die öffentliche Live-Liste kommt als **eigener, last-isolierter Baustein** dazu.
2. **Eine einzige gemeinsame Datenbank** ist nur möglich, wenn der Basar künftig Internet voraussetzt. Davon raten wir ab, weil dann bei einem Leitungsausfall die Kasse steht. Für Verkäufer und Orga wirkt der automatische Abgleich trotzdem wie *eine* Datenbank.
3. **Wichtigste Entscheidung:** E1, ob die Kasse ohne Internet laufen muss. Alles andere hängt davon ab.
4. **Erster sichtbarer Nutzen** nach Etappe 2: Verkäufer sehen online, was verkauft wurde und was sie ausgezahlt bekommen. Dafür ist kein Umbau der Kasse nötig.
5. **Größenordnung:** sechs Etappen. Jede Etappe ist einzeln an einem echten Basar mit Rückfallebene erprobbar. Der nächste Basar wird nicht gefährdet.

---

## 1. Ausgangslage

| | Voranmelde-App | Haupt-App |
|---|---|---|
| Zweck | Verkäufer registrieren sich und erfassen ihre Artikel Wochen vorher | Annahme, Kasse, Rückgabe, Abrechnung am Basar-Tag |
| Betrieb | Cloud | lokales Netz am Veranstaltungsort, **bewusst ohne Internet** |
| Nutzer | Verkäufer, Admin | Admin, Kassenpersonal |

Heute verbindet beide Apps nur eine Datei: Am Basar-Morgen exportiert der Admin sie aus der Voranmelde-App und importiert sie in die Haupt-App. Danach erfährt der Verkäufer online nichts mehr, weder ob seine Artikel abgegeben noch ob sie verkauft wurden, noch was er ausgezahlt bekommt.

Gute Voraussetzung: Beide Apps verwenden dieselbe Technik und dieselben Kennungen für Verkäufer und Artikel. Der Import übernimmt die Kennungen unverändert. Ein gemeinsamer Schlüssel existiert also bereits.

## 2. Ziele des Product Owners

| # | Ziel | Wie der Plan es erfüllt |
|---|---|---|
| Z1 | Beide Apps auf Datenebene zusammenführen | Gemeinsames Datenmodell mit automatischem Abgleich; eine einzige Datenbank nur bei E1 = „Nein“ |
| Z2 | Backend-Zuschnitt neu entscheiden | Entscheidungsvorlage E2 mit drei Optionen (Kap. 4) |
| Z3 | Öffentliche Live-Artikelliste ohne Anmeldung, eigene Last | Eigener Baustein „Katalog“, nur lesend, ohne Personendaten (Kap. 7) |
| Z4 | Zwei getrennte Artikelnummern | Zwei Felder, je für sich eindeutig, getrennte Zahlenbereiche (Kap. 6.2) |
| Z5 | Verkäufer sieht nach Abgabe zusätzlich die Basar-Tag-Nummer | Ab Etappe 4 (Kap. 6.2) |
| Z6 | Änderungssperre für Verkäufer ab „Im Verkauf“ bis „Rückgabe“ | Entscheidungsvorlage E5 mit drei Varianten (Kap. 6.3) |
| Z7 | Frontends bleiben, nur die Backend-Adresse ändert sich | **Gilt bis Etappe 3.** Siehe Hinweis darunter. |

> **Hinweis zu Z7:** Z5 und Z6 sind ohne sichtbare Änderungen an der Voranmelde-Oberfläche nicht erfüllbar: zweite Nummer, Status, Sperrhinweis. Die Haupt-App-Oberfläche ändert sich nur am Annahmetisch, wo es um die Nummernvergabe geht. Der öffentliche Katalog ist ohnehin ein neues Frontend.

### Nicht-Ziele (bewusst ausgeklammert)

Ausdrücklich nicht Teil des Vorhabens sind:
- Online-Reservierung, Online-Kauf, Online-Bezahlung
- Kundenkonten für Interessenten
- Artikelbilder
- Neugestaltung der bestehenden Oberflächen
- Kasse in der Cloud

## 3. Nutzen je Rolle und Erfolgskriterien

| Rolle | Nutzen |
|---|---|
| **Verkäufer** | Sieht online, ob seine Artikel abgegeben, verkauft oder zurückgegeben sind und welches Ergebnis er erwarten kann. Es gibt weniger Rückfragen an die Orga. |
| **Annahme / Kasse** | Kein Doppelverkauf mehr. Der Annahmeablauf bleibt vertraut: Am Artikel steht genau eine Nummer. |
| **Admin** | Kein Datei-Hantieren mehr am Basar-Morgen. Eine Anzeige zeigt, wann zuletzt abgeglichen wurde. |
| **Interessent** | Sieht während des Verkaufs live, was es gibt, auf der Homepage, ohne Anmeldung. |
| **Vorstand** | Der Basar wird attraktiver und lenkt Besucher besser. Betrieb und Kosten bleiben für das Ehrenamt tragbar. |

**Erfolgskriterien (Vorschlag):**
- 0 Minuten Kassenstillstand durch das Vorhaben
- 0 Doppelverkäufe
- Datenübernahme vor dem Basar in unter 5 Minuten
- Die öffentliche Liste ist höchstens 1 Minute alt, solange die Internetleitung steht
- Mindestens die Hälfte der Verkäufer ruft ihr Ergebnis online ab

## 4. Zielbild

### 4.1 Die Kernfrage

> **E1: Muss die Kasse am Basar-Tag ohne Internet funktionieren?**

**Ja** (heutige Spec, Empfehlung):
- Cloud und Basar-Ort haben je eine eigene Datenbank, die sich automatisch abgleichen.
- Die Kasse läuft immer.
- „Live“-Funktionen (Liste, Verkäufer-Sicht) hängen trotzdem an der Leitung vor Ort. Fällt sie aus, veralten sie nur.

**Nein** (Internet wird Pflicht):
- Eine einzige Cloud-Datenbank ist möglich.
- Fällt die Leitung aus, stehen Kasse und Annahme still.

Die heutige Spec sagt wörtlich „ohne Internetzugang“. Auch bei „Ja“ braucht der Basar-Server künftig **zeitweise** eine Leitung nach außen und Zugangsdaten zur Cloud. Das ist eine Spec-Änderung, die bewusst beschlossen werden muss.

**Vor E1 messen:** Wie gut ist die Internetleitung am Veranstaltungsort? Das ist Teil von Etappe 0.

### 4.2 Optionen für den Zuschnitt (E2)

| | A: Ein Monolith für alles | **B: Zwei Backends + Katalog** (Empfehlung) | C: Microservices je Fachbereich |
|---|---|---|---|
| Kurzbeschreibung | Ein Programm, eine Datenbank | Voranmeldung (Cloud) und Basar-Betrieb (LAN) als eigenständige Programme, dazu ein öffentlicher Katalog | Viele kleine Dienste (Verkäufer, Artikel, Kasse, Abrechnung …) |
| Kasse ohne Internet | nicht möglich | ja | nur mit großem Aufwand |
| Last der öffentlichen Liste isoliert | nein | **ja, vollständig** | ja |
| Betriebsaufwand fürs Ehrenamt | gering | gering bis mittel | hoch |
| Laufende Kosten | niedrig | niedrig, der Katalog kostet fast nichts | deutlich höher |
| Folgen eines Ausfalls | alles steht | Teile laufen weiter | schwer zu überblicken |

Ihr Ziel, die Last der öffentlichen Liste abzutrennen und auch Voranmeldung und Basar-Betrieb voneinander zu entkoppeln, erfüllt **Option B vollständig**. B ist bereits eine Aufteilung in eigenständige Dienste, nur ohne die Kleinteiligkeit von C. Jedes der beiden Backends bleibt intern sauber in Fachbereiche gegliedert („modularer Monolith in Hexagonal-Architektur“). Ein späteres Herauslösen einzelner Dienste bleibt dadurch möglich, falls es je nötig wird.

### 4.3 Bild der Option B

```
            CLOUD                                         BASAR-ORT (LAN)
 ┌──────────────────────────┐                     ┌──────────────────────────┐
 │ Voranmeldung             │  ① Basar-System     │ Basar-Betrieb            │
 │ Verkäufer, Artikel,      │ ◄── holt Daten ──── │ Annahme, Kasse,          │
 │ Nummern, Stammdaten      │                     │ Rückgabe, Abrechnung     │
 │                          │  ② Basar-System     │                          │
 │ zeigt Verkäufern Status  │ ◄── meldet Stand ── │                          │
 └────────────┬─────────────┘    (alle ~60 s)     └──────────────────────────┘
              │ ③ bereinigte Liste ohne Personendaten
 ┌────────────▼─────────────┐
 │ Öffentlicher Katalog     │  ← Interessenten auf der Homepage
 │ statische Seite + Datei  │
 └──────────────────────────┘
```

- **Abgleich als „Gesamtstand“ statt Einzelmeldungen.** Der Basar-Server schickt etwa jede Minute den kompletten aktuellen Artikelstand. Fällt die Leitung aus, stimmt nach ihrer Rückkehr der nächste Stand einfach wieder. Eine Warteschlange, Reihenfolgeprobleme oder verlorene Meldungen gibt es so nicht. Das ist für ein kleines Team die robusteste Lösung. Erst wenn es sich als nötig erweist, wird auf Einzelmeldungen umgestellt.
- **Verbindungen gehen immer vom Basar-Ort nach außen.** Das LAN braucht keinen offenen Zugang aus dem Internet.
- **Öffentlicher Katalog als statische Seite mit Datendatei**, ausgeliefert über einen Cache-Dienst (CDN). Er hält beliebig viele Besucher aus, braucht keine eigene Datenbank und kostet fast nichts. Ein eigenes Katalog-Backend kann später folgen, etwa für Suche oder Filter. **Entscheidung E10a:** Genügt dem PO diese „Datenquelle statt Backend“-Lösung?

### 4.4 Wer darf wann was ändern

Jede Phase hat für jede Datenart **genau einen** Verantwortlichen. So entstehen keine widersprüchlichen Änderungen.

| Daten | Vor dem Basar | Ab Übernahme / Basar-Tag | Nach der Abrechnung |
|---|---|---|---|
| Verkäuferkonto, Kontakt, Login | Voranmeldung | Voranmeldung (der Basar liest nur) | Voranmeldung |
| Artikelangaben, Voranmelde-Nummer | Voranmeldung (Verkäufer) | **Basar-Betrieb** (Korrekturen nur am Annahmetisch) | archiviert |
| Basar-Tag-Nummer, Status, Verkauf, Rückgabe | – | **Basar-Betrieb** | archiviert |
| Konditionen, Annahmegebühr, Abrechnung | Voranmeldung (Verkäufer-Typ) | **Basar-Betrieb** (beim Abgeben eingefroren) | archiviert |
| Marken, Kategorien, Verkäufer-Typen | Voranmeldung | Basar darf ergänzen, Abgleich über den Namen | Voranmeldung |
| Kassenkonten, Etiketten, Drucktexte | – | Basar-Betrieb | Basar-Betrieb |

**Feste Regeln für den Phasenwechsel:**
- Die Übernahme findet **nach dem Voranmeldeschluss** statt, am besten am Vorabend.
- Eine erneute Übernahme **führt zusammen** und löscht nie.
- Wer nach dem Voranmeldeschluss kommt, wird am Annahmetisch erfasst.
- Vor Ort angelegte Verkäufer und Artikel bekommen einen eigenen Kennungs-Bereich, damit sie nie mit Cloud-Kennungen kollidieren.

## 5. Voraussetzungen, die zuerst behoben werden müssen

Klartext-Fassung; die Details stehen in Anhang B.

| # | Was heute passiert | Folge | Wann |
|---|---|---|---|
| V5 | Derselbe Artikel kann gleichzeitig an zwei Kassen verkauft werden | Doppelverkauf, falsche Abrechnung | **sofort** (Etappe 1) |
| V2 | Ein erneuter Import am Basar-Tag löscht bereits abgegebene, noch unverkaufte Artikel samt kassierter Annahmegebühr | Gebühren verschwinden aus der Kasse | **sofort** (Etappe 1) |
| V1 | Wird bei der Annahme umnummeriert, entsteht ein neuer Artikel; der alte wird gelöscht | Der Verkäufer verliert den Artikel aus seiner Online-Sicht | Etappe 1 |
| V4 | Die Software kennt nur „den einen Basar“ | Mehrere Jahre oder Saisons lassen sich nicht trennen | Etappe 4 |
| V7 | Termine wie der Voranmeldeschluss werden nur angezeigt, nicht durchgesetzt | Die Sperre ist nicht umsetzbar | Etappe 4 |
| V9 | Die Anmeldung an der Voranmeldung ist schwach abgesichert: 5 Tage gültig, kein Schutz gegen Passwort-Raten | Sicherheitsrisiko | Etappe 1 |
| B1 | Es gibt keine Datensicherung, Updates laufen „immer die neueste Version“ | Datenverlust oder Überraschungen am Basar-Tag | Etappe 1 |

## 6. Fachliches Kernstück

### 6.1 Gemeinsamer Artikel-Lebenszyklus

| Zustand | Bedeutung | Verkäufer darf | Öffentlich |
|---|---|---|---|
| **Entwurf** | vorangemeldet | ändern, löschen (bis zur Sperre, E5) | nein |
| **Angemeldet** | Voranmeldeschluss erreicht, Daten übernommen | nichts | nein |
| **Abgelehnt** *(neu)* | bei der Annahme nicht angenommen, z. B. wegen Flecken, Saison oder Rückruf; mit Grund | sieht den Grund | nein |
| **Im Verkauf** | abgegeben, hängt an der Stange | nichts | **ja** |
| **Verkauft** | an der Kasse bezahlt | nichts | nein |
| **Zurückgegeben** | an den Verkäufer zurück | nichts (E5b) | nein |
| **Nicht abgegeben** *(neu)* | angemeldet, aber nie gebracht; wird markiert statt gelöscht | nichts | nein |
| **Verlust** *(neu)* | nicht auffindbar, blockiert die Abrechnung nicht mehr | sieht den Vermerk | nein |
| **Gespendet** *(neu, optional)* | Verkäufer wählt „Spenden statt Rückgabe“, oder es gilt die Abholfrist | nichts | nein |

Wird die Abrechnung des Verkäufers erstellt, ist alles abgeschlossen. Der Verkäufer sieht dann den verbindlichen Beleg.

### 6.2 Zwei Artikelnummern

| | Voranmelde-Nummer | Basar-Tag-Nummer |
|---|---|---|
| Wer vergibt sie | Voranmeldung, aus dem Nummernblock des Verkäufers | Basar-Betrieb bei der Abgabe |
| Pflicht | nein, Laufkunden haben keine | ab Abgabe ja |
| Eindeutig | je Basar | je Basar |
| Wofür | Zuordnung bis zur Abgabe | Kasse, Rückgabe, Abrechnung |
| Sieht der Verkäufer | immer | ab Abgabe |

**Welche Nummer klebt am Artikel? (E3)** Heute schreiben die Verkäufer ihre Nummer zu Hause auf Blanko-Etiketten. Dafür gibt es drei Varianten:

| Variante | Ablauf am Annahmetisch | Bewertung |
|---|---|---|
| (a) Neues Etikett drucken | Jeder Artikel wird neu beklebt | Bei 40–80 Artikeln je Kiste entsteht eine Schlange, und am Artikel stehen zwei Nummern. **Nicht praxistauglich.** |
| (b) Vorgedrucktes Etikett zuordnen | Pro Artikel zwei Scans | Langsam und fehleranfällig |
| **(c') Übernehmen, nur Ausnahmen neu** (Empfehlung) | Die Voranmelde-Nummer wird unverändert zur Basar-Tag-Nummer. Neue Nummern gibt es nur für Laufkunden, Nachmeldungen und unleserliche Etiketten, aus einem **eigenen Zahlenbereich** (z. B. ab 50000) | Der Ablauf bleibt vertraut |

Bei (c') gibt es fachlich weiterhin zwei Nummern, wie in Z4 gefordert. Am Artikel steht aber immer genau eine. Der Verkäufer sieht eine abweichende Basar-Tag-Nummer genau dann, wenn eine vergeben wurde.

**Schutz vor Verwechslung (E4):**
- Getrennte Zahlenbereiche sind Pflicht, auch gegen **Etiketten vom Vorjahr**. Dafür bekommt jeder Basar einen neuen Startbereich oder eine eigene Etikettenfarbe.
- Die Kasse zeigt neben dem Preis auch Bezeichnung und Größe an, damit das Personal sie mit dem Artikel vergleichen kann.
- Ein QR-Code allein schützt nicht: Handgeschriebene Etiketten haben keinen.

**Welcher Preis gilt (E12)?** Weichen Etikett und System voneinander ab, braucht es eine Regel für die Kasse. Vorschlag: Es gilt das System. Jede Preiskorrektur wird am Annahmetisch auch auf dem Etikett nachgetragen.

### 6.3 Änderungssperre (E5)

| Variante | Sperre ab | Folge für den Verkäufer | Risiko |
|---|---|---|---|
| A (PO-Wunsch) | Abgabe / „Im Verkauf“ | kann bis zum Annahmetisch online ändern | Online-Änderungen nach der Übernahme gehen verloren. Ein online geänderter Preis passt nicht mehr zum Etikett. |
| B | Übernahme am Vorabend | gesperrt ab einem Zeitpunkt, den er nicht sieht | schwer zu erklären |
| **C (Empfehlung)** | **Voranmeldeschluss** (2–3 Tage vor der Annahme) | gesperrt ab einem klar angekündigten Termin; Korrekturen danach nur am Annahmetisch | gering; braucht durchgesetzte Termine (V7) |

Die Sperre wirkt in der Fachlogik, nicht nur in der Oberfläche. Sie gilt auch für den Datei-Import, für das Löschen des eigenen Kontos und für Admin-Aktionen.

**E5b, nach der Rückgabe:** Empfehlung: Der abgeschlossene Basar bleibt dauerhaft schreibgeschützt. Artikel lassen sich als neuer Entwurf mit neuer Nummer in den nächsten Basar übernehmen.

**Konto löschen während der Sperre** ist erst nach der Abrechnung möglich. Der Verkäufer bekommt dafür eine Begründung (gesetzliche Aufbewahrung).

### 6.4 Was der Verkäufer live sieht (E6)

| Wann | Was der Verkäufer sieht |
|---|---|
| Während des Basars | Status je Artikel, Anzahl verkauft, gezahlte Annahmegebühr. Ein Betrag erscheint nur als „vorläufiger Verkaufswert vor Provision, verbindlich ist der Abrechnungsbeleg“. |
| Nach der Abrechnung | Auszahlungsbetrag und Beleg |

## 7. Öffentliche Live-Artikelliste

| Öffentlich | Nicht öffentlich |
|---|---|
| Bezeichnung, Kategorie, Marke, Größe, Farbe, Preis | Verkäufername, Kennung, Kontakt, Adresse |
| „Stand hh:mm“ und Hinweise (siehe unten) | **Jede Artikelnummer**: sie verrät, welche Artikel zum selben Verkäufer gehören, und lädt zu Reservierungswünschen ein (auch der heutige Aushang zeigt keine) |
| | Freitext-Beschreibung |
| | Gebühren, Erlöse, Zeitstempel |

**Zeitpunkt der Freischaltung (E10):**
- Die Liste wird mit der **Verkaufsöffnung** freigeschaltet. „Basar-Beginn“ wäre mehrdeutig, weil die Annahme oft Stunden oder einen Tag vor dem Verkauf liegt.
- Vorher zeigt die Seite nur eine Übersicht: Anzahl je Kategorie und Größe.
- Nach Verkaufsende wird die Liste geschlossen.

**Ehrlich kommunizieren:**
- Im Listenkopf steht *„Stand 10:42 – Artikel können bereits im Einkaufskorb liegen. Keine Reservierung.“*
- Ist der letzte Abgleich älter als 10 Minuten, erscheint *„Live-Aktualisierung unterbrochen“*.

**Fairness:** Für Besucher ohne Internet gibt es am Eingang einen Aushang mit derselben Feldliste. Den Druck dafür gibt es schon.

**Missbrauch:**
- Keine Export- oder Download-Funktion.
- Keine Reservierungen, weder telefonisch noch online.
- Der Admin kann einzelne Einträge ausblenden, falls die Bezeichnung persönliche Angaben enthält, z. B. „Jacke von Lena, Kita X“.
- Bei der Erfassung weist ein Hinweis darauf hin, dass Bezeichnungen öffentlich werden.

**E17:** Will der Vorstand die öffentliche Liste überhaupt? Dazu gehören Nutzen, Haftung, Impressum und die Datenschutzerklärung der Homepage.

## 8. Datenschutz (Voraussetzung vor Etappe 2)

- **Auftragsverarbeitung:** Mit Cloud-Anbieter und Cache-Dienst (CDN) sind Verträge zur Auftragsverarbeitung nötig, Hosting in einer EU-Region. Das CDN verarbeitet die IP-Adressen der Besucher.
- **Neue Verarbeitung:** Die Statusrückmeldung an den Verkäufer verarbeitet Daten neu. Die Datenschutzhinweise werden aktualisiert. Rechtsgrundlage ist die Durchführung des Kommissionsvertrags, eine Einwilligung ist nicht nötig. Das bestätigt der Datenschutz-Verantwortliche des Vereins.
- **Laufkunden** werden am Annahmetisch informiert, per Aushang oder Infoblatt. Ihre Personendaten bleiben lokal. In die Cloud geht nur ihr Artikelstatus ohne Personenbezug. Ein Online-Konto bekommen sie nur auf Wunsch, mit einem geregelten Ablauf (E8).
- **Öffentlicher Katalog:** keine Cookies, kein Tracking.
- **Löschkonzept (E7):**
  - Artikeldaten eines Basars werden X Monate nach der Abrechnung anonymisiert.
  - Abrechnungssummen bleiben entsprechend den Aufbewahrungspflichten des Vereins erhalten. Das klärt der Kassenwart.
  - Konten ohne Teilnahme seit zwei Basar-Jahren werden nach Ankündigung gelöscht.
- **Basar-Laptop:** verschlüsselte Festplatte. Die lokalen Daten werden nach dem Abschluss bereinigt.
- Eintrag ins **Verzeichnis der Verarbeitungstätigkeiten**.

## 9. Betrieb und Notfallplan

| Thema | Festlegung |
|---|---|
| Übernahme | am **Vorabend**, zusätzlich eine Datei-Sicherung auf USB. Der Datei-Import bleibt als Rückfallebene erhalten, bis Etappe 5 zwei Basare lang stabil gelaufen ist. |
| Datensicherung | Cloud: täglich. Basar-Server: während des Basars alle 15 Minuten auf ein externes Medium. Die Wiederherstellung wird vorher geübt. |
| Überwachung | Beim Admin steht „Letzter Abgleich: hh:mm“, bei Störung ein deutlicher Hinweis. |
| Ausfall Internet | Die Kasse läuft weiter. Liste und Verkäufer-Sicht zeigen den letzten Stand. |
| Ausfall Basar-Server | Ein Ersatzgerät mit letzter Sicherung. Bis dahin hilft eine Papier-Kassenliste (Nummer, Preis), die nachträglich erfasst wird. |
| Updates | Versionen werden **X Wochen vor jedem Basar eingefroren**. Der Basar-Server bekommt Updates auch ohne Internet, über ein mitgebrachtes Paket. |
| Generalprobe | Jede neue Etappe läuft vor dem Echtbetrieb einmal komplett auf einer Testumgebung, die erste Live-Rückmeldung als **Schattenbetrieb** an einem echten Basar. |
| Technik-Rolle | Am Basar-Tag gibt es eine benannte Person für die Technik, mit Vertretung. Sie entscheidet auch über den Rückfall auf den Datei-Weg (E16). |
| Mehrtägige Basare | Annahme, Verkauf und Rückgabe bekommen eigene Datums- und Uhrzeitangaben je Basar. |

## 10. Kommunikation und Schulung

- **Infomail an Verkäufer vor der Saison.** Inhalt: der Termin der Sperrfrist, dass am Etikett nur eine Nummer steht, der Live-Status „ohne Gewähr“ und gegebenenfalls die Spenden-Option.
- **FAQ** auf der Voranmelde-Seite.
- **Kassen- und Annahmepersonal:** ein Spickzettel je Station und 15 Minuten Einweisung. Mit Variante (c') gilt weiter: „Es zählt die Nummer auf dem Etikett.“
- **Vorstand:** kurzer Bericht nach jeder Etappe.

## 11. Entscheidungen

Reihenfolge: **E1 → E2 / E7 → E3 / E4 → E5 / E12 → alle übrigen.**

| # | Frage | Optionen | Empfehlung | Wer entscheidet | Hängt ab von |
|---|---|---|---|---|---|
| E1 | Muss die Kasse ohne Internet laufen? Spec-Änderung „zeitweise Leitung nach außen“ annehmen? | Ja / Nein | **Ja**, Spec anpassen | PO + Vorstand | Leitungsmessung |
| E2 | Zuschnitt der Backends | A / B / C (Kap. 4.2) | **B** | PO | E1 |
| E3 | Welche Nummer klebt am Artikel? | a / b / c' | **c'** | PO + Basar-Orga | – |
| E4 | Getrennte Zahlenbereiche, neuer Bereich je Basar | Ja / Nein | **Ja** | PO | E3 |
| E5 | Ab wann gilt die Sperre? | A / B / C (Kap. 6.3) | **C** | PO | V7 |
| E5b | Nach der Rückgabe wieder bearbeitbar? | Ja / Kopie für den nächsten Basar | **Kopie** | PO | E7 |
| E6 | Was sieht der Verkäufer live? | nur Status / Status + vorläufiger Wert | **Status + vorläufiger Wert mit Hinweis** | PO + Kassenwart | – |
| E7 | Mehrere Basare in einer Datenbank, Konten dauerhaft? | ja / nein | **Cloud: ja, mit Löschkonzept. Basar-Server: frische Datenbank je Basar** | PO + Datenschutz | – |
| E8 | Laufkunden in die Cloud? | ja / nein / auf Wunsch | **nur Status, Konto auf Wunsch** | PO + Datenschutz | E7 |
| E9 | Konditionen live aus dem Typ oder eingefroren? | live / eingefroren | **eingefroren ab Abgabe** | PO + Kassenwart | – |
| E10 | Öffentliche Liste: Felder, Zeitfenster | Kap. 7 | **ohne Nummer, ab Verkaufsöffnung** | PO | E17 |
| E10a | Katalog als statische Seite statt eigenes Backend? | statisch / Dienst | **statisch zuerst** | PO | E2 |
| E11 | Anmeldung vereinheitlichen? | gemeinsam / getrennt | **gemeinsames Rollenmodell, Kassenkonten bleiben lokal** | PO | E2 |
| E12 | Welcher Preis gilt bei Abweichung zwischen Etikett und System? | Etikett / System | **System, Etikett wird korrigiert** | Basar-Orga | E5 |
| E13 | Budget für die laufenden Kosten (Cloud, CDN) | – | Rahmen festlegen | Vorstand | E2 |
| E14 | Wer betreibt Cloud-Konto und Verträge? | Verein / Person | **Verein** | Vorstand | – |
| E15 | Zielbasar je Etappe, Einfrierfenster | – | festlegen | PO | Basar-Kalender |
| E16 | Wer entscheidet am Tag über den Rückfall? | – | Technik-Rolle | Basar-Orga | – |
| E17 | Öffentliche Liste überhaupt? | Ja / Nein | Ja, mit Kap. 7 | Vorstand | Datenschutz |
| E18 | Optional: Spenden statt Rückgabe, Abholfrist | Ja / Nein | Basarbedingungen prüfen | Basar-Orga | – |

## 12. Etappen

Leitplanke: **Der nächste Basar wird nicht gefährdet.** Jede Etappe bringt einen eigenen Nutzen, wird an einem echten Basar erprobt und lässt sich zurücknehmen.

Größen: **S** = wenige Tage, **M** = einige Wochen, **L** = mehrere Wochen bis Monate (ein Entwickler im Nebenamt).

| Etappe | Inhalt | Nutzen | Größe | Abnahme (Go/No-Go) |
|---|---|---|---|---|
| **0 – Klären** | Entscheidungen E1–E18, Leitungsmessung am Veranstaltungsort, Spec und Glossar anpassen, Datenschutz-Paket anstoßen | Freigegebenes Zielbild | S | PO hat E1–E5 entschieden |
| **1 – Härten** | Doppelverkauf verhindern (V5), Import-Fehler beheben (V2), Umnummerieren ohne Löschen (V1), Datensicherung, feste Versionen, Login-Schutz (V9) | **Sicherer Basar-Betrieb**, sinnvoll unabhängig vom Umbau | S–M | Test mit zwei Kassen auf denselben Artikel. Wiederherstellung geübt. |
| **2 – Ergebnis für Verkäufer** | Der Basar-Server meldet den Stand an die Cloud: zuerst einmalig nach der Abrechnung, dann im Schattenbetrieb minütlich. Verkäufer sehen Status und Ergebnis (nur lesend). | **Erster sichtbarer Nutzen für Verkäufer** | M | Schattenbetrieb an einem Basar ohne Kassenstörung |
| **3 – Öffentliche Liste** | Statischer Katalog, gespeist aus dem Stand von Etappe 2, mit Datenschutz-Prüfung | **Interessenten sehen das Angebot live** | S–M | Last-Test, Datenschutz-Freigabe |
| **4 – Gemeinsames Fundament** | Basar-Konzept (V4), zwei Nummern mit getrennten Bereichen, erweiterter Lebenszyklus, durchgesetzte Termine (V7), Änderungssperre, Basar-Tag-Nummer für den Verkäufer sichtbar | Ziele Z4–Z6 erfüllt | L | Generalprobe des Annahmeablaufs mit Orga-Team |
| **5 – Übernahme per Knopfdruck** | Das Basar-System holt die Daten aus der Cloud, statt eine Datei zu verwenden; zusammenführend und wiederholbar | Kein Datei-Hantieren mehr | S–M | Zwei Basare stabil, danach erst Datei-Weg als Hauptweg ablösen |
| **6 – Optional** | Gemeinsame Code-Basis und Austauschformate, Haupt-App in Fachbereiche gliedern, Katalog-Backend mit Suche | Wartbarkeit, Komfort | M–L | nach Bedarf |

**Abhängigkeiten:** 0 → 1 → 2 → 3. Etappe 4 kann nach 1 parallel zu 2 und 3 starten. Etappe 5 kommt nach 4.

## 13. Risiken

| Risiko | Wahrscheinlichkeit | Wirkung | Gegenmaßnahme | Verantwortlich |
|---|---|---|---|---|
| Internetausfall am Basar-Ort | mittel | Liste und Verkäufer-Sicht veralten | Offline-Kasse, Abgleich per Gesamtstand, Hinweis „unterbrochen“ | Technik-Rolle |
| Verwechslung von Nummern, Vorjahres-Etiketten | mittel | falscher Artikel, falscher Preis | getrennte Bereiche je Basar, Sichtabgleich an der Kasse | Basar-Orga |
| Etikett-Preis ≠ System-Preis | mittel | Diskussionen an der Kasse | Sperre ab Voranmeldeschluss, Regel E12 | Basar-Orga |
| Datenschutzverstoß in der öffentlichen Liste | niedrig | rechtlich, Vertrauen | Positivliste, keine Nummern, Ausblenden durch Admin | Datenschutz |
| Verlorener Laptop | niedrig | Datenpanne | Verschlüsselung, Bereinigung nach dem Basar | Technik-Rolle |
| Verkäufer akzeptieren die Sperre nicht | mittel | Unmut, Mehraufwand am Tisch | früh ankündigen, klarer Termin, Korrektur am Tisch möglich | PO |
| Enttäuschung „online da, real weg“ | hoch | Beschwerden | Hinweis im Listenkopf, keine Reservierung | PO |
| Know-how bei einer Person | hoch | Stillstand bei Ausfall | Dokumentation, Vertretung, einfache Lösungen (Option B, Gesamtstand) | Vorstand |
| Zeitplan kollidiert mit dem Basar-Kalender | mittel | unfertige Etappe am Basar | Einfrierfenster, jede Etappe einzeln abschaltbar | PO |
| Migration alter Daten | mittel | Herkunft alter Nummern unklar | Fundament mit einem neuen Basar starten, Altdaten archivieren | Entwicklung |
| Datei-Weg parallel pflegen | sicher | Mehraufwand | klare Ablösefrist (Etappe 5 + zwei Basare) | PO |

---

## Anhang A: Kurzglossar

| Begriff | Bedeutung |
|---|---|
| Abgleich | automatische Übertragung von Daten zwischen Cloud und Basar-Server |
| Gesamtstand | Der Basar-Server schickt jedes Mal den kompletten aktuellen Artikelstatus, nicht einzelne Änderungen |
| Baustein / Backend | eigenständig laufendes Programm auf dem Server |
| CDN / Cache-Dienst | Dienst, der eine Seite weltweit zwischenspeichert und viele Besucher ohne Last auf unseren Servern bedient |
| Modularer Monolith | ein Programm, intern sauber in Fachbereiche getrennt |
| Übernahme | Das Basar-System holt die Voranmeldedaten (heute: Datei-Import) |
| Voranmeldeschluss | Termin, ab dem Verkäufer online nichts mehr ändern |

## Anhang B: Technische Befunde (geprüft am Code)

| # | Befund | Fundstelle |
|---|---|---|
| V1 | Umnummerieren in der Annahme löscht den Artikel und legt ihn mit neuer Kennung neu an. Die Fachlogik kann bereits ohne Löschen umnummerieren, der Fix ist klein. | `src/bazaar-app/backend/Bazaar.Application/Intake/IntakeHandler.cs`, `Bazaar.Domain/Article/Article.cs` (`Renumber`) |
| V2 | Ein erneuter Import überspringt nur verkaufte oder abgerechnete Verkäufer. Bei allen anderen gehen Freigabe und kassierte Annahmegebühr verloren. Die Kennungen selbst bleiben stabil. | `Bazaar.Application/Import/RunImportHandler.cs`, `Bazaar.Domain/Seller/Seller.cs` |
| V3 | Die Abrechnung löscht nicht abgegebene Artikel, das ist abwählbar (Standard: an) | `Bazaar.Application/Settlement/SettleSellerHandler.cs` |
| V4 | Kein Basar- oder Saison-Konzept, Einstellungen sind global | `BAR.Modules.Operations/Domain/Settings.cs`, Haupt-App `Settings` |
| V5 | Keine Sperre gegen gleichzeitige Änderung (kein Concurrency-Token); betrifft Verkauf, Freigabe, Rückgabe | `Bazaar.Application/Sales/RecordSaleHandler.cs`, `Bazaar.Infrastructure/Persistence/EfUnitOfWork.cs` |
| V6 | Voranmelde-Artikelnummer ohne Eindeutigkeit in der Datenbank. Geringes Risiko, weil die Nummernblöcke per Datenbank-Constraint überschneidungsfrei sind. | `BAR.Modules.Registration/Infrastructure/Persistence/…/ArticleConfiguration.cs`, Migration `AddNumberBlockOverlapExclusion` |
| V7 | Termine werden nur angezeigt | `BAR.Modules.Operations/…/GetPublicInfoQueryHandler.cs` |
| V8 | Vorangemeldete Artikel erhalten nie „angenommen“; ein Code-Kommentar behauptet das Gegenteil | `Bazaar.Domain/Article/Article.cs` |
| V9 | Anmelde-Token 5 Tage gültig, keine Bremse gegen Passwort-Raten, Audience ungeprüft | `BAR.Modules.SellerManagement.Contracts/…/JwtOptions.cs`, `BAR.Host/Program.cs` |
| V10 | Die Voranmeldung läuft nur als eine Instanz, wegen eines einmalig beim Start berechneten Zustands. Für die Last kein Problem. | `BAR.Host/Program.cs` (`AdminBootstrapState`) |
| B1 | Keine Datensicherung konfiguriert, Images mit `:latest` | `src/bazaar-app/portainer-stack.yml`, `docker-compose*.yml` |

## Anhang C: Widersprüche zur bestehenden Spec (bewusst zu ändern)

- Haupt-App §1/§7.2: „ohne Internetzugang“ → wird zu „Kasse offline-fähig, zeitweise Leitung nach außen für den Abgleich“.
- Voranmelde-App §11.1 und `entities.md`: „Datei ist einziger Berührungspunkt, kein Rückkanal“ → entfällt.
- Voranmelde-App §10.0.1 und CLAUDE.md: „Monolith, ein Container je App“ → bleibt je Backend gültig; der Katalog kommt als statischer Baustein dazu.
- Voranmelde-Entities: „Artikel hat keinen Status“ → entfällt.
- Haupt-App, Artikelannahme: „Diese App vergibt keine Nummern“ → entfällt (eigener Bereich für Ausnahmen).
- Begriffe vereinheitlichen:
  - „Abgabegebühr“ / „Annahmegebühr“
  - das Kennzeichen `original` hat zwei Bedeutungen
  - der Admin ist einmal ein Verkäufer, einmal ein Benutzer
  - Konditionen sind einmal live, einmal eine überschreibbare Kopie

## Anhang D: Entstehung und Änderungen gegenüber v1

**Grundlage:**
- Sechs unabhängige Analysen: je Backend Geschäftsprozess, Daten/Persistenz und Architektur/Betrieb.
- Ein Übersichtsplan v1.
- Drei unabhängige Reviews: Stakeholder-Tauglichkeit, Architektur-Kritik, Basar-Praxis/Risiko/Datenschutz.

**Wesentliche Änderungen gegenüber v1:**
- Kurzfassung vorangestellt. Z1 wird wörtlich beantwortet, der Konflikt mit Z7 offengelegt.
- Nicht-Ziele, Nutzen je Rolle und Erfolgskriterien ergänzt.
- E2 und E5 als echte Optionsvorlagen. Die PO-Wünsche stehen fair als eigene Variante.
- Abgleich per **Gesamtstand** statt Ereignis-Warteschlange (einfacher, selbstheilend).
- Katalog als **statische Seite** statt eigenem Dienst (E10a).
- Etikett-Variante **(c')** neu und empfohlen. Getrennte Zahlenbereiche sind Pflicht, auch gegen Vorjahres-Etiketten.
- Sperre-Empfehlung von „ab Übernahme“ auf **„ab Voranmeldeschluss“** geändert.
- Öffentliche Liste **ohne Nummer**, ab Verkaufsöffnung, mit Hinweisen und Aushang.
- Neue Zustände: Abgelehnt, Verlust, Gespendet.
- Neue Kapitel: Datenschutz, Betrieb und Notfallplan, Kommunikation und Schulung.
- Etappen umgestellt: Sichtbarer Nutzen kommt früher (Etappe 2 und 3 vor dem großen Fundament). Jede Etappe hat eine Größe und ein Abnahmekriterium.
- Befunde korrigiert:
  - V2 ist ein akuter Fehler (Gebührenverlust) und kommt nach Etappe 1.
  - V3 ist abwählbar.
  - V10 hat eine andere Ursache.
  - V6 ist entschärft, weil die Nummernblöcke abgesichert sind.
- Entscheidungen E12–E18 ergänzt: Preisregel, Budget, Betreiber, Zielbasar, Rückfall, Liste überhaupt, Spenden.
