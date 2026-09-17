---
round: Round-18
status: geklärt
---

# Spec: Round 18 — Verkäufer: Artikel-Freigabe

## Fein-Spezifikation

### Ziel

Freigabe-Prozess für vorangemeldete Artikel innerhalb der Verkäufer-Verwaltung —
Abschluss von [Epic_Verkaeufer](../../../requirements/bazaar-app/epics/Epic_Verkaeufer/epic.md)
Abschnitt 6, der in [Round-14](../Round-14/spec.md) bewusst ausgeklammert war.

### Geteilte Komponente `scan-dialog` — erster Bau

`scan-dialog` wird von mehreren Epic-Dokumenten referenziert, aber bisher in keinem
Round tatsächlich gebaut ([Round-14](../Round-14/spec.md) hat Abschnitt 6 explizit
ausgeklammert). Round-18 baut sie als geteilte Komponente
(`shared/components/scan-dialog/`) exakt nach
[scan-dialog.md](../../../components/scan-dialog/component.md):
- Artikelnummer-Feld als `input-group` (Round-16, `modes=['keyboard','camera','numpad']`).
- Kamera-Modus nutzt `barcode-scanner` + `scan-feedback` (Ton/Vibration/Countdown-
  Overlay, Round-16) — **zweiter Einsatz** dieser Komponenten nach Round-17.
- **Persistenz-Override für diesen Einsatzfall (bereits in Epic_Verkaeufer Abschnitt 6
  dokumentiert, keine neue Entscheidung):** Anders als `scan-dialog.md`s generische
  AC-2 (die einen sofortigen Zeitstempel-Write suggeriert) schreibt dieser Einsatzfall
  **nicht** pro Scan. Der Dialog validiert jeden Scan/jede Eingabe read-only gegen
  `GET /api/articles/by-number/{number}` (gehört der Artikel zum `sellerId`, ist
  `releasedAt` leer), markiert ihn intern als „in dieser Sitzung erfasst" (verschwindet
  aus der AutoComplete-Liste der ausstehenden Artikel, die der Dialog per
  `GET /api/sellers/{id}/articles` lädt) und emittiert `scanComplete`. Das Parent
  (Freigeben-Popup) sammelt die `articleId`s aus `scanComplete` mit `result:
  'success'} eigenständig; ein DB-Write erfolgt **erst** über `POST /api/release` beim
  Abschluss — „wie der Warenkorb an der Kasse" (Epic_Verkaeufer Abschnitt 6).

### Frontend

**Freigeben-Popup** (`features/sellers/components/release-dialog/`, feature-lokal,
erreichbar über den Scanner-Button der `seller-card` aus [Round-14](../Round-14/spec.md)
— dort bisher nur ein Platzhalter-Hinweis, wird jetzt durch den echten Dialog ersetzt):
- `scan-dialog` mit `targetField="releasedAt"`, `sellerId` des Verkäufers, Titel
  „Artikel freigeben".
- Zustände der AutoComplete-Liste: leer → alle ausstehenden Artikel; Eingabe →
  gefiltert; kein Treffer → „Artikel nicht bekannt"; alle erfasst → „Alle Artikel
  freigegeben."
- Beim Verlassen des Dialogs (Schließen-Button oder Escape): **sofern mindestens ein
  Artikel in dieser Sitzung erfasst wurde**, öffnet
  [`payment-panel`](../../../components/payment-panel/component.md) (Round-17,
  wiederverwendet) mit `totalLabel="Gesamtgebühr"`, `totalAmount` =
  `Anzahl erfasster Artikel × Verkäufer.feePerItem`, `confirmLabel="Buchen"`. Wurde
  nichts erfasst, schließt der Dialog ohne Payment-Panel.
- `confirmed`-Event → `POST /api/release` mit `sellerId`, `feeAmount`, den
  gesammelten `articleId`s.
- `409 article.not_releasable` → Fehlermeldung mit den genannten Artikelnummern,
  Sitzung bleibt im Dialog erhalten (analog zum Nummernkonflikt bei `POST /api/intake`
  aus Round-17).
- Erfolg → Druck-Trigger (wiederverwendet, gleicher Stub-Service aus
  [Round-17](../Round-17/spec.md): `printService.printIntakeReceipt({articleIds,
  sellerId, feeAmount})` — **zweiter Auslöser desselben Dokuments**, echter Inhalt
  weiterhin erst [Round-23](../Round-23/round.md)).

### Backend

**Application** (`Bazaar.Application/Release/`):
- `ReleaseHandler` (`POST /api/release`) — eine Transaktion über `IArticleRepository`
  und `ISellerRepository`:
  1. Alle übergebenen `articleId`s laden, **erneut** prüfen: gehören zu `sellerId`,
     `ReleasedAt` leer. Verstoß → **gesamter** Vorgang `409 article.not_releasable`
     mit den betroffenen Artikelnummern, keine Teilverarbeitung.
  2. `ReleasedAt = now` an allen Artikeln setzen.
  3. `feeAmount` gegen `Anzahl Artikel × Seller.FeePerItem` prüfen (`400` bei
     Abweichung), auf `Seller.IntakeFeePaid` addieren.
  4. Commit — Response `{releasedCount, intakeFeePaid}`.
- FluentValidation: `sellerId`/`articleIds`-Liste nicht leer.

**Api** (`Bazaar.Api/Features/Release/`):
- `POST /api/release` (`authenticated`) — DTOs exakt nach
  [`api/release.md`](../../../requirements/bazaar-app/api/release.md).
- `errorCode`: `article.not_releasable` (409) — bereits katalogisiert.

### Akzeptanzkriterien

Epic_Verkaeufer AC-11 (Freigeben-Dialog listet ausschließlich `releasedAt = null`-
Artikel) — die letzte in Round-14 zurückgestellte Acceptance-Criteria. `scan-dialog`
eigene AC-1 bis AC-8, mit dem oben dokumentierten Persistenz-Override für AC-2/AC-3.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Component-Test `scan-dialog` (Vitest) — Moduswechsel, AutoComplete-Filterung,
  Sitzungssammlung, Kamera-Feedback (gemockt).
- Application-UnitTest `ReleaseHandler` (Transaktions-Atomarität, erneute Prüfung
  gegen Race Conditions, Gebührenprüfung).
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Anlegen neuer Artikel (läuft ausschließlich über die Artikelannahme, Round-16/17).
Abgabe-Beleg-Inhalt selbst — → Round-23.
