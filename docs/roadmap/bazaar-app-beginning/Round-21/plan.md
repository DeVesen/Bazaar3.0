---
round: Round-21
status: geplant
---

# Plan: Round 21 — Abrechnung: Abrechnen & Auszahlung

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-20/plan.md](../Round-20/plan.md): `Bazaar.Domain/Settlement/
  SettlementCalculation.cs` (bereits extrahiert, wird hier **wiederverwendet, nicht
  neu geschrieben**), `ISellerSettlementQuery`/`GetSellerSettlementHandler`,
  `settlement.page.ts` mit Platzhalter-Hinweis am „Abrechnen"-Button,
  `printService.printSellerSummary`-Stub.

## Implementationsplan

### Backend

#### 1. `Seller`-Aggregate erweitern

`Seller.cs` (Round-14) — `Settle(decimal payoutAmount)`-Methode bereits als
Rumpf angelegt (Round-14/plan.md Schritt 1), hier scharf geschaltet: setzt
`SettledAt = now`, `PayoutAmount = payoutAmount`.

#### 2. `SettleSellerHandler`

`Bazaar.Application/Settlement/SettleSellerCommand`(`SellerId`,
`PayoutAmount`)+`Validator`+`Handler` — Transaktion
(`CreateExecutionStrategy`-Muster wie Intake/Release):

1. Artikel des Sellers laden, `openCount = Count(Status == Selling)`.
2. `openCount > 0` → `ConflictException("...", "settlement.articles_open")` mit
   `Extensions["openCount"]`.
3. `Seller.SettledAt.HasValue` → `409 settlement.already_settled`.
4. `revenue = Sum(Status == Sold, a => a.Price)`,
   `(commission, payout) = SettlementCalculation.Calculate(revenue,
   seller.SalesCommission)`.
5. `payoutAmount != payout` (Toleranz 0, beide bereits centgenau) →
   `400`-Validierungsfehler (kein Domain-`ConflictException`, sondern
   FluentValidation-artiger Fehler — Entscheidung: Wurf einer eigenen
   `ValidationException`-artigen Klasse oder Rückgabe über den
   `ValidationFilter`-Mechanismus ist hier nicht passend, da der Vergleichswert
   erst zur Laufzeit bekannt ist; stattdessen wirft der Handler
   `BadRequestException` (neue, vierte `DomainException`-Unterklasse analog den
   bestehenden vier aus Round-2, mappt auf `400` mit `errors`-Dictionary).
6. `seller.Settle(payoutAmount)`.
7. Alle Artikel mit `ReleasedAt == null` per `IArticleRepository`
   `RemoveRange`/`ExecuteDeleteAsync` entfernen, `removedArticleCount` merken.
8. Commit — Response `{settledAt, payoutAmount, removedArticleCount}`.

(Kleine Ergänzung an `Bazaar.Domain/Exceptions/`: `BadRequestException` — nötig,
da bisher kein Domain-Exception-Typ auf `400` mit Feldfehlern mappt, das lief
bisher ausschließlich über FluentValidation vor dem Handler. `DomainExceptionHandler`,
Round-2, um den fünften `switch`-Zweig ergänzen.)

#### 3. Api

`SettlementEndpoints.cs` (Round-20) um `POST /api/sellers/{id}/settlement`
ergänzt.

### Frontend

#### 4. `settlement-panel`

`features/settlement/components/settlement-panel/settlement-panel.ts` —
`@Input() settlement: SellerSettlementDto` (dieselbe DTO wie Round-20s Read-
Model, keine neue Schnittstelle), drei Zeilen + bedingter Hinweistext, „Buchen"
→ `Output() confirmed`. `settlement.page.ts`: „Abrechnen"-Klick öffnet dieses
Popup statt des Round-20-Platzhalter-Toasts (Toast-Aufruf entfernt).

`confirmed` → `settlement-api.ts`s `settle(sellerId, payoutAmount)` → `POST
/api/sellers/{id}/settlement`. Erfolg: Ansicht neu laden (`getSettlement`), UI
wechselt in den bereits in Round-20 vorbereiteten schreibgeschützten Zustand
(`settledAt` jetzt gesetzt, Buttons deaktivieren sich über denselben Computed
wie dort), `printService.printSellerSummary({sellerId, phase: 'final'})`.
`409`/`400` → Fehlermeldung im Popup, Popup bleibt offen (außer
`already_settled` — dort Popup schließen + Ansicht neu laden, da der Zustand
sich bereits geändert hat).

### 5. Verifikation

- `dotnet test` — `SettlementCalculation` bereits aus Round-20 getestet, hier nur
  der 87,50€/15%-Fall zusätzlich gegen `SettleSellerHandler` end-to-end
  (Rundungskonsistenz-Nachweis zwischen Anzeige und Buchung). `SettleSellerHandler`:
  `articles_open`, `already_settled`, erfolgreicher Pfad inkl.
  `removedArticleCount`-Zählung (Fixture mit zwei `ReleasedAt=null`-Artikeln).
- `ng serve`: Verkäufer mit ausschließlich `Sold`/`Returned`-Artikeln (aus
  Round-19/20) → „Abrechnen" aktiv → Popup zeigt korrekte Beträge → Buchen →
  Ansicht schreibgeschützt, Badge mit Zeitstempel/Betrag. Danach `DELETE
  /api/sellers/{id}/settlement` (Round-14, Verkäufer-Seite) → Ansicht wieder
  bearbeitbar (Storno-Nachweis über bestehenden Endpoint).

## Reihenfolge

Backend 1 → 2 → 3 sequenziell. Frontend 4 nach 3. 5 abschließend.
