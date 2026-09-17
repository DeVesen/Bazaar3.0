---
round: Round-15
status: geplant
---

# Plan: Round 15 — Artikel-Übersicht & Korrektur

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-11/plan.md](../Round-11/plan.md)/[Round-12/plan.md](../Round-12/plan.md):
  `IArticleCountByBrandQuery`/`IArticleCountByCategoryQuery`-Ports plus
  Platzhalterklassen (DI austauschbar), Rename-Cascade-Hooks in
  `UpdateBrandHandler`/`UpdateCategoryHandler` (No-Op-Delegate). `Brand`/`Category`
  real vorhanden.
- [Round-14/plan.md](../Round-14/plan.md): `ISellerCardsQuery`/
  `IArticlesBySellerQuery`/`IArticleCountBySellerQuery`-Ports + Platzhalterklassen,
  `Seller`/`ISellerRepository` real vorhanden.
- [Round-7/plan.md](../Round-7/plan.md): `features/articles/articles.routes.ts` +
  Platzhalter-Page, Route `/articles` bereits registriert.

## Implementationsplan

### Backend

#### 1. `Bazaar.Domain/Article/`

`Article.cs` — Felder wie spec.md, `Status`-Computed-Property (`ArticleStatus`-Enum:
`Registered`/`Selling`/`Sold`/`Returned`). Methoden statt Setter:
`UpdateDetails(name, brand, category, price, size, color, description)` — wirft bei
`SoldAt != null && price != Price` (`409 article.sold`, Domain-Exception mit
`ErrorCode = "article.sold"`); `SetTimestamps(releasedAt, soldAt, returnedAt,
manually: bool)` — wirft bei `soldAt != null && returnedAt != null`
(`article.sold_and_returned`) und bei Kaskaden-Inkonsistenz (späterer Zeitstempel
gesetzt, früherer `null`).

`IArticleRepository.cs` in `Domain/Ports/`.

#### 2. Rückverdrahtung Round-11/12/14 (zuerst, sechs kleine, isolierte Schritte)

Reihenfolge unabhängig voneinander, alle nach demselben Muster (Platzhalterklasse
in `Bazaar.Infrastructure` durch echte Implementierung ersetzen, DI-Zeile
umbiegen, alte Klasse löschen):

1. `ArticleCountByBrandQuery` → `context.Articles.CountAsync(a => a.Brand == name)`.
2. `ArticleCountByCategoryQuery` → analog über `Category`.
3. Rename-Cascade in `UpdateBrandHandler`/`UpdateCategoryHandler`: Delegate-
   Implementierung `context.Articles.Where(a => a.Brand == oldName)
   .ExecuteUpdateAsync(...)` — **in derselben Transaktion** wie das
   Brand/Category-Update (Handler öffnet die Transaktion bereits, Cascade läuft
   davor dem Commit).
4. `ArticleCountBySellerQuery` → `CountAsync(a => a.SellerId == id)`.
5. `ArticlesBySellerQuery` → `context.Articles.Where(a => a.SellerId ==
   id).Select(...).ToListAsync()`, Status aus der Computed-Property.
6. `SellerCardsQuery` → echte Aggregation: pro Seller in der Seite
   `GROUP BY`/Subquery über `Articles` für die vier Zähler und drei Summen (Formeln
   1:1 aus [seller-card.md](../../../components/seller-card.md) §3), `status`
   abgeleitet (`settledAt` gesetzt → `settled`; mind. 1 Artikel `Selling` → `selling`;
   sonst `open`).

#### 3. Infrastructure — Article

`ArticleConfiguration.cs` (`Number` als `int`, Unique-Index — Nummern sind
systemweit eindeutig laut Epic_Artikelannahme, auch wenn dieser Round noch keine
Schreibquelle dafür hat außer dem Korrektur-Dialog selbst). `ArticleRepository.cs`.
`ArticleListQuery.cs` — real, Suchregeln wie bei `SellerSearchQuery` (Round-14),
zusätzlich Token-Matching über vier statt zwei Felder (`Number.ToString()`,
`Name`, `Brand`, `Category`, `SellerName` via Join).

#### 4. Application (`Bazaar.Application/Articles/`)

`GetArticlesHandler`, `UpdateArticleCommand`+`Validator`+`Handler`,
`UpdateArticleTimestampsCommand`+`Handler` (kein Validator im FluentValidation-
Sinn — die Kaskadenregel ist eine Domain-Invariante, kein Formatfehler),
`DeleteArticleHandler`. `UpdateArticleHandler`/`UpdateArticleTimestampsHandler`/
`DeleteArticleHandler` laden zusätzlich `Seller.SettledAt` (via
`ISellerRepository.GetById(article.SellerId)`) für die Settlement-Sperre — ein
kleiner Cross-Aggregate-Read im Handler, nicht im Domain-Aggregate selbst (spec.md
hält das bereits fest).

#### 5. Api (`Bazaar.Api/Features/Articles/`)

`ArticleEndpoints.cs` — vier Routen (`GET`/`PUT` `authenticated`,
`PUT .../timestamps`/`DELETE` `admin`). DTOs in `Dtos.cs`.

### Frontend

#### 6. `features/articles/`

`data/articles-api.ts`, `articles-store.ts` (serverseitige Suche/Filter/
Sortierung/Paginierung 50/Seite, analog `sellers-store.ts` aus Round-14).
`pages/articles.page.ts` ersetzt Round-7-Platzhalter: zweizeiliges Filter-Panel
(Freitext volle Breite, darunter 3-Spalten-Grid Marke/Kategorie/Status), `table`
mit acht Spalten, „manuell"-Badge via `ng-template` auf der Status-Spalte.

#### 7. `artikel-dialog`

`features/articles/components/artikel-dialog/` — Felder wie spec.md, Marke/
Kategorie als `p-select` (Optionen aus `brands-api.ts`/`categories-api.ts`, Round-
11/12, hier nur lesend importiert), Preis als `p-inputNumber`. Sperrlogik:
`@Input() locked: 'none' | 'sold' | 'settled'` steuert Feld-`disabled`-Zustände +
Banner-Text.

#### 8. `article-status-popup`

`features/articles/components/article-status-popup/` — fünf Zeilen, Icon-Buttons
nur bei den drei mittleren. Kaskaden-Bestätigung: `p-confirmdialog` mit
dynamischer Nachrichten-Liste (welche Folge-Zeitstempel mit Wert entfernt würden).
Gegenseitige Sperre `soldAt`/`returnedAt` als Computed im Component.

### 9. Verifikation

- `dotnet test` — alle sechs rückverdrahteten Query-Ports: **bestehende**
  Testklassen aus Round-11/12/14 um neue Testfälle ergänzen (z. B.
  `CreateBrandHandlerTests`/`GetSellerCardsHandlerTests` bekommen jetzt Fälle mit
  tatsächlich vorhandenen Artikeln), nicht neu anlegen.
- Manueller End-to-End-Nachweis: Marke umbenennen → (sobald in Round-17 Artikel
  existieren) Artikel zeigt neuen Namen — in Round-15 selbst nur über direkten
  DB-Insert eines Test-Artikels nachweisbar, da die UI zum Artikel-Anlegen erst
  Round-16/17 kommt.
- `ng serve`: `/articles` zeigt leere Tabelle (keine Artikel vorhanden) mit
  generischem Leerzustand (kein Sondertext laut Table-Doku für Artikel).
  Korrektur-Dialog und Status-Popup lassen sich gegen manuell per SQL eingefügte
  Test-Artikel durchspielen.

## Reihenfolge

1 → 2 (sechs Teilschritte, beliebige Reihenfolge untereinander) → 3 → 4 → 5
sequenziell. 6 kann parallel zu 3–5 beginnen. 7/8 nach 6, 9 abschließend.
