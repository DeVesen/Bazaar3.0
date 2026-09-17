---
round: Round-19
status: geklärt
---

# Spec: Round 19 — Verkauf

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Verkauf: Kassenvorgang mit Artikelnummer-Eingabe,
Warenkorb, Bezahlpopup, Storno des letzten Vorgangs.

### Frontend

**Feature-Ordner** `src/app/features/checkout/`, Route `/checkout`. Outer-Grid `1fr
1fr`, gap 14px.

**Links — Artikelnummer-Eingabe** (`pages/checkout.page.ts` orchestriert):
- [`input-group`](../../../components/input-group/component.md) (Round-16),
  `modes=['keyboard','camera','numpad']`. Startmodus Tastatur — USB-Barcode-Scanner
  tippt direkt hinein.
- **Kamera-Modus-Sonderfall:** beendet sich nach einem Treffer selbst und kehrt in den
  vorherigen Modus zurück — anders als der Dauerscan der Artikelannahme
  ([ANNAHME-S01](../../../requirements/bazaar-app/epics/Epic_Artikelannahme/stories/ANNAHME-S01-inline-camera-mode.md)).
  Grund: Der erkannte Artikel geht erst nach Klick auf den Preis-Button in den
  Warenkorb, ein weiterlaufender Scanner würde währenddessen den nächstbesten Artikel
  im Bild miterfassen ([VERKAUF-S01](../../../requirements/bazaar-app/epics/Epic_Verkauf/stories/VERKAUF-S01-eingabemodi.md)).
  Diese Ausprägung ist neuer Code, keine Erweiterung von `input-group`/`barcode-scanner`
  selbst (die Komponenten bleiben dumm, das Feature-Template bindet `active` entsprechend).
- InfoArea mit sechs unterschiedlichen Zuständen statt eines generischen Fehlers:
  erkannt+im Verkauf (grün, Preis), bereits im Warenkorb (gelb, kein Preis-Button),
  unbekannt/nicht freigegeben/verkauft/zurückgegeben (je rot, eigener Text nach Epic
  Abschnitt 2). Lookup über `GET /api/articles/by-number/{number}` (real seit
  Round-15/17).
- Preis-Button (volle Breite, `severity="success"`, Caption ausschließlich der Preis)
  erscheint nur bei „erkannt & im Verkauf". Klick → Artikel in Warenkorb, Feld leert
  sich, Fokus zurück, InfoArea „Nächsten Artikel eingeben …" (grün).
- Seiteneinstieg: Fokus auf Eingabefeld, InfoArea „Ersten Artikel eingeben …" (blau).

**Rechts — `cart`** (`features/checkout/components/cart/`, feature-lokal, nur
Haupt-App): reiner Frontend-Zustandshalter, **keine eigene Kassenvorgang-Entität**
(bewusste Design-Entscheidung, Epic Abschnitt 3). Cart-Item-Zeilen, Löschen-Button pro
Zeile, Gesamt-Zeile, Footer mit „Leeren"/„BUCHEN" (nur sichtbar wenn nicht leer).
Doppelte Nummer → gelbe Meldung statt zweitem Eintrag (Epic Abschnitt 2/`cart.md`
AC-2). Fokus kehrt nach jeder Korb-Aktion ins Eingabefeld zurück.

**Bezahlpopup**: „BUCHEN" öffnet
[`payment-panel`](../../../components/payment-panel/component.md) (Round-17,
wiederverwendet, **dritter Einsatz**) — `totalLabel="Gesamtbetrag"`,
`totalAmount`=Warenkorbsumme, `confirmLabel="Bezahlt"`, **ohne** erneute
Artikelauflistung im Popup.
- `confirmed` → `POST /api/sales` mit den Warenkorb-Artikel-IDs.
- Erfolg → Warenkorb leeren, Eingabefeld leeren, InfoArea „Ersten Artikel eingeben
  bitte …" (blau), Storno-Button „Letzten Vorgang stornieren" erscheint neben der
  InfoArea.
- `409 article.not_sellable` → Warenkorb bleibt **unverändert**, betroffener Eintrag
  markiert, kein Artikel gebucht.

**Storno**: „Letzten Vorgang stornieren" — rein sitzungsgebunden (Artikel-IDs im
Frontend-Speicher, kein Persistenz-Flag), sichtbar bis zum nächsten Scan, für **beide**
Rollen. Klick → `POST /api/sales/undo` mit den IDs des eben gebuchten Vorgangs;
Artikel gehen **nicht** zurück in den Warenkorb (Epic Abschnitt 5). Nach Reload ist
Korrektur wieder Admin-Sache über das Artikelstatus-Popup (Round-15).

### Backend

**Application** (`Bazaar.Application/Sales/`):
- `RecordSaleHandler` (`POST /api/sales`) — Transaktion über `IArticleRepository` und
  (für die Abrechnungsprüfung) `ISellerRepository`:
  1. Für jede `articleId`: erneut prüfen, verkäuflich (`ReleasedAt` gesetzt, `SoldAt`/
     `ReturnedAt` leer) **und** zugehöriger Seller nicht abgerechnet (Absicherung
     gegen von Hand verdrehte Zeitstempel, regulär unerreichbar — Abrechnen ist
     gesperrt solange ein Artikel im Verkauf ist).
  2. Verstoß → **gesamter** Vorgang `409 article.not_sellable` mit der betroffenen
     Artikelnummer, keine Teilverarbeitung.
  3. `SoldAt = now` an allen Artikeln, `SoldManually` bleibt `false`.
  4. Commit — Response `{soldCount, total, soldAt}` (`total` nur zur Anzeige, nicht
     persistiert).
- `UndoSaleHandler` (`POST /api/sales/undo`) — setzt `SoldAt = null` an den übergebenen
  Artikel-IDs; `409 settlement.locked` falls der Seller inzwischen abgerechnet wurde.
  Keine serverseitige „letzter Vorgang"-Logik — die IDs kommen vollständig vom
  Frontend (Epic Abschnitt 5: bewusst keine Vorgangs-Entität).
- FluentValidation: `articleIds`-Liste nicht leer.

**Api** (`Bazaar.Api/Features/Sales/`):
- `POST /api/sales`, `POST /api/sales/undo` (beide `authenticated`) — DTOs exakt nach
  [`api/sales.md`](../../../requirements/bazaar-app/api/sales.md).
- `errorCode`: `article.not_sellable` (409), `settlement.locked` (409) — bereits
  katalogisiert.
- `GET /api/articles/by-number/{number}` ist bereits aus Round-15/17 real vorhanden,
  keine Änderung nötig.

### Akzeptanzkriterien

Epic_Verkauf AC-1 bis AC-13 vollständig. `cart.md` AC-1 bis AC-7 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Application-UnitTests: `RecordSaleHandler` (Transaktions-Atomarität, erneute
  Statusprüfung inkl. Abrechnungs-Absicherung), `UndoSaleHandler`
  (`settlement.locked`-Fall).
- Frontend: `CheckoutPage`, `cart` (Vitest — Doppel-Erkennung, Fokus-Rückkehr,
  Leerzustand), Payment-Panel-Integration, Kamera-Selbstbeendigung nach Treffer.
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Nachträgliche, Admin-only Korrektur eines Verkaufs außerhalb der laufenden Sitzung —
läuft über das Artikelstatus-Popup der Artikel-Übersicht (Round-15).
