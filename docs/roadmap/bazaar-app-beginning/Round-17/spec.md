---
round: Round-17
status: geklärt
---

# Spec: Round 17 — Artikelannahme: Artikeleingabe & Buchen

## Fein-Spezifikation

### Ziel

Zweiter Teil des Artikelannahme-Wizards: Artikeleingabe, Sitzungsliste, atomares
Buchen über `POST /api/intake`. Füllt den in [Round-16](../Round-16/spec.md) als
Platzhalter angelegten Schritt-2-Tab.

### Nachtrag: Umrüstung Round-15-Artikel-Dialog (mit Nutzer abgestimmt, 2026-09-17)

[Round-16/spec.md](../Round-16/spec.md) hatte offen gelassen, wann der Artikel-Dialog
aus [Round-15](../Round-15/spec.md) (Artikel-Übersicht, `/articles`) von den dortigen
Übergangslösungen (`p-select` für Marke/Kategorie, `p-inputNumber` für Preis) auf die
jetzt fertigen geteilten Komponenten umgerüstet wird — keiner der verbleibenden Rounds
berührt diesen Dialog inhaltlich sonst noch einmal. **Round-17 übernimmt das
zusätzlich zum eigenen Umfang:**
- Marke/Kategorie im Round-15-Artikel-Dialog → `autocomplete-create`.
- Preis im Round-15-Artikel-Dialog → `input-group` (Preis-Variante, `modes =
  ['keyboard', 'numpad']`, `showDecimal="true"`), ersetzt `p-inputNumber`.
- Reiner Component-Austausch, keine Änderung an Backend-Contract, Validierung oder
  Sperrlogik aus Round-15.

### Frontend

**Wizard Schritt 2** (füllt den Platzhalter aus [Round-16](../Round-16/spec.md)):
Layout `7fr 3fr`, gap 14px.

**Artikeleingabe (links, 70%)**, 2-Spalten-Grid, Reihenfolge nach Epic_Artikelannahme
Abschnitt 2:
1. Artikelnummer* — [`input-group`](../../../components/input-group/component.md),
   kein Addon, `modes=['keyboard','camera','numpad']`. **Erster echter Einsatz** der in
   Round-16 gebauten, bis dahin konsumentenlosen Komponenten `barcode-scanner` und
   `scan-feedback` (Kamera-Modus mit Countdown/Ton/Vibration nach ANNAHME-S01). Kehrt
   nach einem Treffer in den vorherigen Modus zurück.
2. Bezeichnung* (volle Breite).
3. Kategorie*/Marke* (je 50%) — [`autocomplete-create`](../../../components/autocomplete-create/component.md)
   (**erster echter Einsatz**), `options` aus `GET /api/brands`/`/categories`
   (Round-11/12, real), `entryCreated` → Parent ruft `POST /api/brands`/`/categories`
   auf (Duplikatprüfung serverseitig, `409` bei Race).
4. Preis* — `input-group` (Preis-Variante, €-Addon rechts, `modes=['keyboard','numpad']`,
   `showDecimal="true"`).
5. Größe/Farbe (je 50%, optional).
6. Beschreibung (Textarea, volle Breite, optional).

„Übernehmen"-Button deaktiviert solange ein Pflichtfeld leer (AC-5).

**Artikelnummer-Prüfung** (ENTER oder Feld-Verlassen): `GET
/api/articles/by-number/{number}` (real, gegen die Artikel-Tabelle aus Round-15).
- `404` → Nummer frei, normale Neuanlage.
- `200` und Artikel gehört **nicht** zu diesem Verkäufer oder hat bereits `releasedAt`
  gesetzt → „Artikelnummer bereits vergeben", „Übernehmen" deaktiviert (AC-6).
- `200`, Artikel gehört zu **diesem** Verkäufer **und** `releasedAt` ist leer
  (vorangemeldet, noch nicht abgegeben) → Felder aus dem gefundenen Artikel
  vorausgefüllt, alle Felder bleiben bearbeitbar (Epic Abschnitt 2, Sonderfall
  importierter Verkäufer). **In diesem Round faktisch nie erreichbar**, da der
  JSON-Import erst in [Round-26](../Round-26/round.md) entsteht — die Logik ist
  korrekt implementiert, hat aber bis dahin keine realen Testdaten; kein
  Platzhalter nötig, da die Bedingung einfach nie zutrifft.

Bei leerem Artikelnummer-Feld und neu angelegtem Verkäufer ohne Voranmeldung: Vorschlag
aus `GET /api/articles/next-number` (Round-16, real), überschreibbar (AC-10).

**Übersicht (rechts, 30%)**:
- Artikelliste (Nr. + Bezeichnung) der Sitzung — **rein Frontend-seitig**, noch nicht
  in der DB. Klick auf Eintrag → kleines, feature-lokales Popup
  (`features/intake/components/session-item-popup/`) mit Bezeichnung/Kategorie/Marke/
  Preis änderbar (dieselben Feldkomponenten wie oben, kein Bezug zum
  Round-15-Artikel-Dialog — unterschiedliche Zwecke, keine gemeinsame Komponente).
  Löschen-Button pro Eintrag, keine DB-Auswirkung.
- Gebühr-Anzeige: `Anzahl Artikel × Verkäufer.feePerItem`.
- „Speichern"-Button (volle Breite, `severity="success"`) → öffnet
  [`payment-panel`](../../../components/payment-panel/component.md) (**geteilte
  Komponente, erster Einsatz** — auch von Verkauf/Freigabe später wiederverwendet):
  `totalLabel="Gesamtgebühr"`, `totalAmount` = die oben berechnete Gebühr,
  `confirmLabel="Buchen"`.
  - `confirmed`-Event → `POST /api/intake` mit `sellerId`, `feeAmount` (= `totalAmount`
    aus dem Event), Artikelliste der Sitzung.
  - `409 article.number_taken` → Sitzungsliste bleibt erhalten, betroffene Nummern
    (`takenNumbers`) markiert, `nextNumber` als Korrekturvorschlag übernommen (AC-8).
  - Erfolg → Druck-Trigger (Stub, s. u.), danach Wizard verlassen/zurück zur
    Such-Ansicht.

**Druck-Trigger** (Stub, Inhalt folgt in [Round-23](../Round-23/round.md)): nach
erfolgreicher `POST /api/intake`-Antwort ruft das Frontend
`printService.printIntakeReceipt({articleIds, sellerId, feeAmount})` auf — Service
existiert als leerer/Log-Stub, kein echtes Druck-Layout in diesem Round. Wird in
Round-23 durch die reale Implementierung ersetzt, Aufrufstelle bleibt unverändert.

### Backend

**Application** (`Bazaar.Application/Intake/`):
- `IntakeHandler` (`POST /api/intake`) — **eine Transaktion** über `IArticleRepository`
  und `ISellerRepository` (Unit-of-Work aus Round-2/3):
  1. Für jeden Artikel der Liste: `GetByNumber(number)` — existiert er, gehört zum
     selben `sellerId` **und** `ReleasedAt` ist leer → aktualisieren (vorangemeldeter
     Artikel); existiert er sonst irgendwo → in `takenNumbers` sammeln; sonst → neu
     anlegen (`IIdGenerator`, Round-10).
  2. Sind `takenNumbers` nicht leer → Transaktion verwerfen, `409 article.number_taken`
     mit `takenNumbers` + frischem `nextNumber`.
  3. An jedem verarbeiteten Artikel `AcceptedAt = ReleasedAt = now` setzen.
  4. `feeAmount` gegen `Anzahl Artikel × Seller.FeePerItem` prüfen (`400` bei
     Abweichung), dann auf `Seller.IntakeFeePaid` addieren.
  5. Commit — Response `{articleIds, intakeFeePaid}`.
- `GetArticleByNumberHandler` (`GET /api/articles/by-number/{number}`) — `404
  article.number_unknown` oder `200` mit `{id, number, name, price, status, sellerId,
  sellerName}` (Status abgeleitet, Round-15).
- FluentValidation: `sellerId`/`articles`-Liste nicht leer, jedes Element mit
  Pflichtfeldern (`number`, `name`, `brand`, `category`, `price`).

**Infrastructure**:
- `IArticleRepository` (Round-15) erweitert um `GetByNumber(int number)` (bereits um
  `GetMaxNumber()` aus Round-16 ergänzt).

**Api** (`Bazaar.Api/Features/Intake/`, `Bazaar.Api/Features/Articles/`):
- `POST /api/intake` (`authenticated`) — DTOs exakt nach
  [`api/intake.md`](../../../requirements/bazaar-app/api/intake.md).
- `GET /api/articles/by-number/{number}` (`authenticated`) — DTOs nach
  [`api/articles.md`](../../../requirements/bazaar-app/api/articles.md) Abschnitt 2.
- `errorCode`: `article.number_taken` (409), `article.number_unknown` (404) — bereits
  katalogisiert.

### Akzeptanzkriterien

Epic_Artikelannahme AC-5 bis AC-9 vollständig (Artikeleingabe, Buchen, Fehlerfall,
Gebühr). AC-10 (Nummernvorschlag) und AC-1 bis AC-4/AC-11/AC-12 bereits aus Round-16.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Application-UnitTests: `IntakeHandler` (Transaktions-Atomarität, Nummernkonflikt,
  Gebührenprüfung, vorangemeldeter-Artikel-Zweig), `GetArticleByNumberHandler`.
- Frontend: Artikeleingabe-Grid, Sitzungsliste, `session-item-popup`, Payment-Panel-
  Integration — Vitest. Component-Test für `payment-panel` selbst (Rückgeld-Berechnung,
  Numpad-Integration).
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Abgabe-Beleg-Inhalt (Layout, QR-Code) — → [Round-23](../Round-23/round.md). Freigeben-
Popup der Verkäufer-Verwaltung (Sammelscan vorangemeldeter Bestandsartikel) — eigenes
Häppchen, folgt danach.
