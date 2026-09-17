---
round: Round-18
status: geplant
---

# Plan: Round 18 — Verkäufer: Artikel-Freigabe

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-16/plan.md](../Round-16/plan.md): `shared/components/input-group/`,
  `barcode-scanner/`, `scan-feedback/`.
- [Round-17/plan.md](../Round-17/plan.md): `shared/components/payment-panel/`,
  `articles-api.ts`s `getByNumber(number)`, `core/print/print.service.ts`
  (`printIntakeReceipt`-Stub).
- [Round-14/plan.md](../Round-14/plan.md): `seller-card.ts` mit
  Scanner-Button-Output `scan` (bisher nur Toast-Hinweis), `sellers-api.ts`s
  `getArticles(sellerId)`.
- [Round-15/plan.md](../Round-15/plan.md): `ArticleEndpoints.cs` (`by-number`
  seit Round-17 ergänzt).

## Implementationsplan

### Backend

#### 1. `Bazaar.Application/Release/`

`ReleaseCommand`(`SellerId`, `FeeAmount`, `ArticleIds`)+`Validator`+`ReleaseHandler`
— Transaktionsmuster identisch zu `IntakeHandler` (Round-17):
`Database.CreateExecutionStrategy().ExecuteAsync`, erneute Prüfung pro Artikel
(`SellerId` passt, `ReleasedAt is null`), bei Verstoß `ConflictException` mit
`Extensions["articleNumbers"]` (gleiche `Extensions`-Erweiterung der
`DomainException`-Basisklasse aus Round-17, hier wiederverwendet).

#### 2. Api

`ReleaseEndpoints.cs` (`Bazaar.Api/Features/Release/`) — `POST /api/release`.

### Frontend

#### 3. `shared/components/scan-dialog/`

`scan-dialog.ts`: `@Input() sellerId`, `@Input() targetField: 'releasedAt' |
'returnedAt'`, `@Input() title`, `@Output() scanComplete`
(`{articleId, result}`), `@Output() sessionArticleIds` (laufende Liste, damit das
Parent die Gebühr live berechnen kann, ohne selbst mitzuzählen — alternative
Umsetzung: Parent zählt `scanComplete`-Events selbst; Entscheidung: **Component
hält die Sitzungsliste intern und emittiert sie komplett bei jeder Änderung**,
da sowohl Freigabe- als auch künftiges Rückgabe-Popup dieselbe Zählung brauchen
und sie nicht doppelt im jeweiligen Parent nachbauen sollen).

Intern: `input-group` (`modes=['keyboard','camera','numpad']`) für die
Nummerneingabe, `p-listbox` für die AutoComplete-Liste (gespeist aus
`GET /api/sellers/{id}/articles`, gefiltert auf `releasedAt == null`, abzüglich
bereits in der Sitzung erfasster IDs). Bei Eingabe/Scan: `GET
/api/articles/by-number/{number}` → Treffer prüfen (`sellerId` passt,
`releasedAt` leer) → in Sitzungsliste aufnehmen, `scanComplete` mit `result:
'success'` emittieren, `scan-feedback` triggern; sonst `result: 'unknown'` +
rotes Feedback.

#### 4. `release-dialog`

`features/sellers/components/release-dialog/` — hostet `scan-dialog`
(`targetField="releasedAt"`), lauscht auf dessen Sitzungslisten-Output für die
Gebühren-Anzeige. Schließen-Handler: Sitzungsliste nicht leer → öffnet
`payment-panel` (Round-17); `confirmed` → `release-api.ts`s
`bookRelease(sellerId, feeAmount, articleIds)` → `POST /api/release`. `409
article.not_releasable` → Fehlermeldung im Dialog, Sitzung bleibt (Dialog nicht
geschlossen). Erfolg → `printService.printIntakeReceipt(...)` (Round-17-Stub,
zweiter Aufrufer), Dialog schließt.

`seller-card.ts` (Round-14): Scanner-Button-Handler in `sellers.page.ts` von
„Toast-Hinweis" auf „öffnet `release-dialog` mit `sellerId`" umgestellt — einzige
Änderung an bestehendem Code in diesem Round.

### 5. Verifikation

- `dotnet test` — `ReleaseHandler`: Erfolgsfall, Race-Condition-Fall (Artikel
  zwischen Scan und Buchen anderweitig verändert — Test setzt `ReleasedAt` direkt
  nach dem Laden, vor dem Commit), Gebührenabweichung.
- `ng test` — `scan-dialog`: Filterung der AutoComplete-Liste, Sitzungssammlung
  ohne Duplikate, Feedback-Farben je Ergebnis.
- `ng serve`: Verkäufer mit vorangemeldeten, nicht freigegebenen Artikeln nötig —
  da Import (Round-26) noch nicht existiert, Testdaten über direkten
  Repository-/SQL-Insert erzeugen (`ReleasedAt = null`, `SellerId` gesetzt).
  Freigeben-Popup öffnen, Artikel scannen/eintippen, Payment-Panel bestätigen →
  `GET /api/sellers/{id}/articles` zeigt `releasedAt` gesetzt.

## Reihenfolge

Backend 1 → 2. Frontend 3 unabhängig startbar (gegen Round-16/17-Komponenten und
die Backend-Contracts aus spec.md), 4 nach 3 und nach Backend 1–2, 5 abschließend.
