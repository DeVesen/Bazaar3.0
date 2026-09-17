---
round: Round-21
status: geklärt
---

# Spec: Round 21 — Abrechnung: Abrechnen & Auszahlung

## Fein-Spezifikation

### Ziel

Abschluss des Abrechnungs-Wizards: das Abrechnen-Popup mit Auszahlungsberechnung und
der reale `POST /api/sellers/{id}/settlement`-Endpoint. Füllt den in
[Round-20](../Round-20/spec.md) als Platzhalter belassenen „✓ Abrechnen"-Button.

### Frontend

**`settlement-panel`** (`features/settlement/components/settlement-panel/`,
feature-lokal, `sm`): ersetzt den Round-20-Platzhalterhinweis am „✓ Abrechnen"-Button.
- Drei Zeilen: Umsatz, Provision (`− `, danger-Farbe), Auszahlung (Total-Zeile,
  success-Farbe, 18px/700, border-top 2px). **Keine** vierte Zeile für die
  Annahmegebühr — die ist bereits am Tisch bezahlt (`intakeFeePaid`), ein Abzug hier
  wäre Doppelzahlung.
- Werte kommen unverändert aus dem bereits in Round-20 real berechneten Read-Model
  (`GET /api/sellers/{id}/settlement`) — das Popup rechnet nichts neu, zeigt nur an.
- Hinweis „‹notDeliveredCount› nicht abgegebene Artikel werden entfernt" wenn > 0.
- „Buchen"-Button → `POST /api/sellers/{id}/settlement` mit `{payoutAmount}` (dem
  angezeigten, bereits vom Server berechneten Wert — Server prüft ihn gegen die
  eigene Rechnung erneut, `400` bei Abweichung, kann in der Praxis nur bei
  zwischenzeitlicher Datenänderung auftreten).
- Erfolg → Popup schließt, Ansicht wechselt in den schreibgeschützten
  „abgerechnet"-Zustand (Badge, Buttons deaktiviert — bereits in Round-20 als
  UI-Zustand vorbereitet), Druck-Trigger (s. u.).
- `409 settlement.articles_open` / `settlement.already_settled` → Fehlermeldung,
  Popup bleibt offen bzw. schließt mit Hinweis, kein Zustand verändert.

**„✓ Abrechnen"-Button-Enabled-Regel**: unverändert aus Round-20 (`canSettle` aus dem
Read-Model) — keine neue Frontend-Logik, nur der bisher fehlende Klick-Handler wird
ergänzt.

**Druck-Trigger** (Stub, Inhalt folgt in [Round-24](../Round-24/round.md)): nach
erfolgreicher Buchung ruft das Frontend denselben Stub-Service wie der manuelle
„Drucken"-Button aus Round-20 auf:
`printService.printSellerSummary({sellerId, phase: 'final'})` — **zweiter,
automatischer Auslöser** desselben Dokuments (manuell = `'preliminary'`, automatisch
nach Abrechnen = `'final'`), reale Umsetzung weiterhin erst Round-24.

### Backend

**Application** (`Bazaar.Application/Settlement/`):
- `SettleSellerHandler` (`POST /api/sellers/{id}/settlement`) — eine Transaktion über
  `ISellerRepository` und `IArticleRepository`:
  1. `canSettle`-Bedingung erneut serverseitig prüfen (mindestens ein Artikel
     freigegeben, keiner mehr offen im Verkauf) → `409
     settlement.articles_open` mit der Anzahl offener Artikel, falls verletzt.
  2. Bereits abgerechnet (`SettledAt` gesetzt) → `409 settlement.already_settled`.
  3. Umsatz aufsummieren (Preise aller Artikel mit `SoldAt`, bereits centgenau),
     Provision = `Umsatz × Seller.SalesCommission` **kaufmännisch auf 2
     Dezimalstellen gerundet**, Auszahlung = `Umsatz − gerundete Provision`. **Exakt
     dieselbe Rechenroutine wie in [Round-20](../Round-20/spec.md)s
     `ISellerSettlementQuery`** — eine gemeinsame Domain-/Application-Funktion, nicht
     zwei Implementierungen derselben Formel.
  4. Übergebenes `payoutAmount` gegen die eigene Berechnung prüfen → `400` bei
     Abweichung.
  5. `Seller.SettledAt = now`, `Seller.PayoutAmount = payoutAmount` setzen.
  6. Alle Artikel des Sellers mit leerem `ReleasedAt` **entfernen** (`DELETE`, kein
     Soft-Delete, keine History — bewusst, Epic_Abrechnung Abschnitt 5).
  7. Commit — Response `{settledAt, payoutAmount, removedArticleCount}`.
- FluentValidation: `payoutAmount` erforderlich, numerisch.

**Domain**: Die Rundungsroutine (Umsatz→Provision runden→Differenz) lebt als
gemeinsame Methode/Value-Object in `Bazaar.Domain` (z. B. `SettlementCalculation`),
von `ISellerSettlementQuery` (Round-20, Anzeige) **und** `SettleSellerHandler`
(Round-21, Buchung) verwendet — verhindert, dass Anzeige und Buchung um einen Cent
auseinanderlaufen.

**Api** (`Bazaar.Api/Features/Settlement/`):
- `POST /api/sellers/{id}/settlement` (`authenticated`) — DTOs exakt nach
  [`api/settlement.md`](../../../requirements/bazaar-app/api/settlement.md)
  Abschnitt 3.
- `errorCode`: `settlement.articles_open` (409), `settlement.already_settled` (409) —
  bereits katalogisiert.

### Akzeptanzkriterien

Epic_Abrechnung AC-4 bis AC-9, AC-11 (Druck-Auslöser, Inhalt folgt Round-24)
vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Domain-UnitTests: `SettlementCalculation` (Rundungsfälle, u. a. das 87,50€/15%-
  Beispiel aus dem Epic).
- Application-UnitTests: `SettleSellerHandler` (Transaktions-Atomarität,
  `articles_open`/`already_settled`-Fälle, Entfernen nicht abgegebener Artikel,
  Payout-Abweichungsprüfung).
- Frontend: `settlement-panel` — Vitest (Anzeige, Buchen-Klick, Fehlerfälle).
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Inhalt der Verkäufer-Übersicht als Druckdokument — → Round-24. Stornieren einer
Abrechnung — bereits Round-14 (`DELETE /api/sellers/{id}/settlement`).
