---
round: Round-14
status: geplant
---

# Plan: Round 14 — Verkäufer-Stammdaten

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-13/plan.md](../Round-13/plan.md): `SellerType`/`ISellerTypeRepository`
  real vorhanden, `ISellerCountBySellerTypeQuery`-Platzhalter (`// TODO(Round-14)`)
  wird in diesem Round durch die reale Implementierung **ersetzt** (DI-Registrierung
  auf neue Klasse umbiegen, Platzhalterklasse entfernen).
- [Round-11/plan.md](../Round-11/plan.md): Platzhalter-Query-Port-Konvention
  (eigene Klasse, DI-Zeile austauschbar, `// TODO(Round-x)`-Kommentar) — hier für
  drei neue Ports (`ISellerCardsQuery`, `IArticlesBySellerQuery`,
  `IArticleCountBySellerQuery`) übernommen, Round-15 tauscht sie später aus.
- [Round-7/plan.md](../Round-7/plan.md): `features/sellers/sellers.routes.ts` +
  Platzhalter-Page, Route `/sellers` bereits registriert.
- [Round-9/plan.md](../Round-9/plan.md): `RoleService.isAdmin` für
  Konditions-Schreibschutz im Dialog.

## Implementationsplan

### Backend

#### 1. `Bazaar.Domain/Seller/`

`Seller.cs` — Felder wie spec.md, private Setter,
`UpdateConditions(decimal salesCommission, decimal feePerItem)` und
`ResetSettlement()`/`Settle(decimal payoutAmount)` als benannte Methoden statt
öffentlicher Setter (Letztere zwei werden erst in Round-20/21 vom Handler
aufgerufen, aber die Methoden hier bereits anlegen, da `Seller` das Aggregate ist,
das sie kapselt).

`ISellerRepository.cs`. Drei Platzhalter-Ports:
`ISellerCardsQuery.cs`, `IArticlesBySellerQuery.cs`,
`IArticleCountBySellerQuery.cs`. Echte, sofort funktionsfähige `ISellerSearchQuery.cs`.

#### 2. Rückverdrahtung Round-13 (zuerst, klein und isoliert)

`SellerCountBySellerTypeQuery.cs` in `Bazaar.Infrastructure` neu implementieren:
`await context.Sellers.CountAsync(s => s.SellerTypeId == id)`. DI-Zeile in
`Program.cs`/Extension-Methode von der Round-13-Platzhalterklasse auf diese
umstellen. Platzhalterklasse löschen (nicht nur ungenutzt lassen).

#### 3. Infrastructure — Seller

`SellerConfiguration.cs` (`Email` **kein** Unique-Index — nicht dokumentiert als
Pflicht-unique, nur `NOT NULL`). `SellerRepository.cs`. `SellerSearchQuery.cs` —
real: `ILIKE '%token%'` über `FirstName`/`LastName`/`Id`, Token-Zerlegung per
`query.Split(' ')`, jedes Token muss in mindestens einem der Felder vorkommen
(Kombination aus AND über Tokens, OR über Felder je Token).

Drei Platzhalter: `SellerCardsQuery.cs` (liefert reale Stammfelder +
Paginierung/Sortierung/Status-Filter bereits korrekt, aber `status`/Zähler/Summen
hartcodiert `"open"`/`0`), `ArticlesBySellerQuery.cs` (`Task.FromResult(new
List<ArticleSummaryDto>())`), `ArticleCountBySellerQuery.cs`
(`Task.FromResult(0)`) — alle mit `// TODO(Round-15)`-Kommentar.

#### 4. Application (`Bazaar.Application/Sellers/`)

Sieben Handler exakt nach spec.md. `CreateSellerHandler` lädt `SellerType` per
`ISellerTypeRepository.GetById` (Round-13) — `NotFoundException` falls
`sellerTypeId` ungültig (FluentValidation prüft nur „vorhanden", nicht
„existiert", die Existenzprüfung ist Handler-Sache gegen die DB).
`UpdateSellerHandler`: Rollen-Parameter kommt vom Endpoint (Claim-Auswertung wie
bei `CreateBrandHandler`, Round-11), Command trägt ein `bool
CallerIsAdmin`-Flag statt die Rolle selbst zu kennen (Application-Schicht bleibt
frei von HTTP-/Claims-Wissen).

#### 5. Api (`Bazaar.Api/Features/Sellers/`)

`SellerEndpoints.cs` — sechs Routen (fünf `authenticated`, `DELETE .../settlement`
`admin`). DTOs (`SellerCardDto`, `SellerDetailDto`, `CreateSellerRequest`,
`UpdateSellerRequest`, `ArticleSummaryDto`) in `Dtos.cs`.

### Frontend

#### 6. `features/sellers/` — Daten-/Store-Schicht

`data/sellers-api.ts` (sechs HTTP-Methoden), `sellers-store.ts` — Signals für
`items`, `totalCount`, `page`, `filters` (`q`/`status`/`sort`), alle
Änderungen lösen `load()` neu aus (kein In-Memory, serverseitige Quelle der
Wahrheit).

#### 7. `seller-card`

`features/sellers/components/seller-card/seller-card.ts` — Dumb Component,
`@Input() card: SellerCardDto`, Outputs `edit`/`scan`/`statusClick`/`cardClick`.
Scanner-Button-Klick emittiert `scan`, Page zeigt Toast/Hinweis „Freigabe folgt in
einem späteren Häppchen" (kein Popup-Component in diesem Round, reiner
Text-Hinweis über bestehenden Toast-Mechanismus).

#### 8. `verkaeufer-dialog`

`features/sellers/components/verkaeufer-dialog/` — Panels wie spec.md, PrimeNG
`p-select` für Typ (Liste aus `seller-types-api.ts`, Round-13, hier read-only
importiert). Typwechsel-Bestätigung: `p-confirmdialog` mit Template-String, der
alte/neue `feePerItem`/`salesCommission` interpoliert.

#### 9. `seller-detail-modal`

`features/sellers/components/seller-detail-modal/` — `qr-code`
(`shared/components/qr-code/` — **neuer** echter Cross-App-Shared-Component,
erstmals hier gebaut, da noch nirgends vorher gebraucht; Wrapper um
`@zxing/library`s `BrowserQRCodeSvgWriter`, Props/Verhalten exakt nach
`docs/components/qr-code/component.md`). Artikelliste als einfache
`<table>`/`p-table` ohne die volle `Table`-Komponente (nicht paginiert, keine
Sortierung laut spec — reine Anzeige reicht, kein Overkill mit der vollen
Table-Komponente für eine statische Liste).

#### 10. `pages/sellers.page.ts`

Ersetzt Round-7-Platzhalter. Orchestriert Filter-Panel (live, 300ms Debounce),
Karten-Grid (`*ngFor` über `seller-card`), Detail-Modal, Bearbeiten-Dialog,
Status-Popup (klein, inline im Page-Template oder eigene Komponente
`settlement-status-popup` — Entscheidung: eigene kleine Komponente
`features/sellers/components/settlement-badge-popup/`, da drei verschiedene
Aufrufer diese Logik später potenziell brauchen könnten, aber YAGNI hier: **inline
im `sellers.page.ts` belassen**, da aktuell nur ein Aufrufer existiert — Extraktion
erst bei zweitem Bedarf).

### 11. Verifikation

- `dotnet test` — sieben Handler, insb. `UpdateSellerHandler`
  (`seller.conditions_admin_only`-Fall, `settlement.locked`-Fall),
  `SellerSearchQuery` Token-Zerlegung.
- `SellerCountBySellerTypeQuery`-Rückverdrahtung: `GET /api/seller-types` zeigt nach
  Anlegen eines Verkäufers ein korrektes `sellerCount > 0` (erster echter
  End-to-End-Nachweis der Round-13→14-Verkettung).
- `ng serve`: `/sellers` — Anlegen, Bearbeiten (Kassenpersonal sieht Konditionen
  read-only), Löschen (nur ohne Artikel — in diesem Round immer möglich, da
  `IArticleCountBySellerQuery` konstant `0`), Detail-Modal zeigt QR-Code + leere
  Artikelliste („Noch keine Artikel erfasst.").
- Status-Badge zeigt für **jeden** Verkäufer „Offen" (Platzhalter-Query),
  bewusst so erwartet und im Test dokumentiert.

## Reihenfolge

1 → 2 (klein, zuerst erledigen) → 3 → 4 → 5 sequenziell. 6 kann parallel zu 3–5
beginnen (gegen die DTO-Contracts aus spec.md). 7/8/9 unabhängig voneinander nach
6 startbar, 10 nach 6–9, 11 abschließend.
