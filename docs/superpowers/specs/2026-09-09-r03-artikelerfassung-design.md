---
id: DESIGN-R03
status: draft
updated: 2026-09-09
roadmap: docs/requirements/advance-registration/roadmap/R03-artikelerfassung.md
---

# Design R03 — Artikelerfassung

## Ausgangslage

Frontend-Feature-Ordner `my-articles`, `brands`, `categories` existieren bereits
als reine Platzhalter (`MyArticlesPage.ts`, `BrandsPage.ts` mit Minimal-Inhalt,
Routing verdrahtet). Backend-Ordner `BAR.Domain/Articles`,
`BAR.Domain/MasterData`, `BAR.Application/Articles`, `BAR.Application/MasterData`
existieren nur als `.gitkeep`. `NumberBlock` (Domain), `NumberBlockAllocator`
(Vergabe-Kaskade Stufe 1–2 für Block-Neuvergabe), Exclusion-Constraint und
`GET /api/blocks/mine` sind aus R01/R02 vollständig durchgestochen und werden
wiederverwendet, nicht neu gebaut. Die Shared-Komponente `autocomplete-create`
existiert noch nirgends (weder Code noch andere Doku-Referenz außer der
Komponentenbeschreibung) — sie wird hier zum ersten Mal gebaut.

Dieses Dokument beschreibt nur, was für R03 **noch fehlt**.

## Scope

Siehe [Roadmap R03](../../requirements/advance-registration/roadmap/R03-artikelerfassung.md)
„Umfang" / „Nicht in diesem Schritt". Kurz: Kernteil von Epic_Meine_Artikel —
Tabelle, Anlege-/Bearbeiten-Dialog, Löschen mit Rückfrage, `artikel`-Entität,
`marke`/`kategorie`-Entitäten samt AutoComplete-Create.

**Abweichung von der Roadmap-Ausschlussliste (mit Nutzer abgestimmt):** Die
Roadmap nennt Paginierung, Filter, Sortierung, „Speichern + kopieren",
automatische Blockerweiterung und `expectedNumber`-Konfliktbehandlung als
„nicht in diesem Schritt". Die kanonische API-Doku
([`api/articles.md`](../../requirements/advance-registration/api/articles.md),
[`api/blocks.md`](../../requirements/advance-registration/api/blocks.md))
verlangt für `POST /api/articles` jedoch zwingend automatische
Blockerweiterung und `expectedNumber`/`409`, und für `GET /api/articles/mine`
Pagination/Filter/Sort als festen Vertrag. Entscheidung: **Backend wird in R03
bereits vollständig nach API-Doku gebaut** (Vollvertrag), um keine zweite
Migration/Breaking-Change in R04 zu brauchen und den Allocator nicht doppelt
anzufassen. Das **Frontend** bleibt beim Roadmap-Ausschluss: kein
Filter-Panel, keine Pagination-/Sortier-UI, kein „Speichern + kopieren"-Button,
kein Nummernkonflikt-Dialog (Abschnitt „Fehlerbehandlung" unten). Diese
Frontend-Teile kommen in R04, ohne dass sich am Backend-Vertrag noch etwas
ändert.

## Backend — Domain (`BAR.Domain`)

**`Articles/Article.cs`** — Aggregate nach
[`entities/artikel.md`](../../requirements/advance-registration/entities/artikel.md):
`Id`, `Number`, `SellerId`, `Name`, `Brand`, `Category`, `Price` (`decimal`),
`Description`/`Size`/`Color` (optional), `CreatedAt`/`UpdatedAt`. Statische
Factory `Create(...)` (Pflichtfeldprüfung `Name`/`Brand`/`Category`, `Price >
0`), Mutator `Update(...)` (ändert nicht `Number`/`SellerId`).

**`MasterData/Brand.cs`, `MasterData/Category.cs`** — identischer Aufbau:
`Id`, `Name`, `Original` (bool). Factory `Create(name, original)`.

**`Articles/ArticleNumberAllocator.cs`** — neuer Domain-Service, ergänzt
`NumberBlockAllocator` um die volle Vergabe-Kaskade aus
[`api/blocks.md`](../../requirements/advance-registration/api/blocks.md)
Abschnitt 5:
- Stufe 1: kleinste freie Nummer über alle Blöcke des Verkäufers (aufsteigend
  nach `FromNumber`) — neue reine Domänenlogik, iteriert `Article`-Nummern
  gegen `NumberBlock`-Bereiche.
- Stufe 2: alle eigenen Blöcke voll → ruft bestehenden
  `NumberBlockAllocator.Allocate(existingBlocks: alle Blöcke global, sellerId,
  blockCount: 1, startNumber, blockSize, now)` auf, vergibt `FromNumber` des
  neuen Blocks.
- Stufe 3: `NoFreeRangeException` aus Stufe 2 → `409 article.no_free_number`.

Ein Handler ruft den Allocator zweimal auf: schreibend in `POST
/api/articles` (Block ggf. anlegen, Artikelnummer vergeben, `Article`
persistieren — eine Transaktion), im Dry-Run für `GET
/api/articles/next-number` (Ergebnis verworfen, nichts persistiert).

## Backend — Application (`BAR.Application`)

**`Articles/`:**
- `GetMine/GetMyArticlesQueryHandler` — Pagination/Filter (`brand`,
  `category`, `search` über `number`/`name`/`category`/`brand`)/Sort, hart auf
  `sellerId` aus dem `sub`-Claim beschränkt.
- `GetNextNumber/GetNextNumberQueryHandler` — `ArticleNumberAllocator`
  Dry-Run.
- `Create/CreateArticleCommand(Validator)/CreateArticleCommandHandler` —
  lädt Settings (`ISettingsRepository`), prüft `expectedNumber` (falls
  gesetzt) gegen den Allocator-Vorschlag vor dem eigentlichen Vergeben → bei
  Abweichung `409 article.number_taken` samt neuem `nextNumber`, sonst
  Allocator schreibend aufrufen, `Article` anlegen, danach Dry-Run für
  `nextNumber` in der Response.
- `Update/UpdateArticleCommandHandler` — Ownership-Check (`sellerId` gegen
  `sub`-Claim, sonst `404`), `Number`/`SellerId` unveränderlich.
- `Delete/DeleteArticleCommandHandler` — Ownership-Check, Hard-Delete.
- `GetAll/GetAllArticlesQueryHandler` (Admin) — wie `GetMine`, aber alle
  Verkäufer, plus aufgelöster `seller` je Item, zusätzlich `search` über
  Vorname/Nachname.
- `GetById/GetArticleByIdQueryHandler` (Admin) — Readonly-Detail inkl.
  `seller`.

**`MasterData/`:** je Ressource (`Brands`, `Categories`) `GetAll`, `Create`,
`Update` (admin), `Delete` (admin) — vier Handler-Paare mit identischer Logik,
kein generischer Typ (Konsistenz mit „eine Datei pro Handler"-Stil der
bestehenden Ordner).
- `Create` setzt `Original` serverseitig aus der Rolle (`admin` → `true`,
  sonst `false`), Duplikat-Check case-insensitiv nach Trim → `409
  master_data.name_taken`.
- `Update` (admin) schreibt bei Namensänderung in derselben Transaktion den
  neuen Namen in alle betroffenen `Article`-Zeilen (`brand`/`category`
  denormalisiert) — sonst zerfällt Filter und `articleCount`.
- `Delete` (admin) → `409 brand.in_use`/`category.in_use`, sobald
  `articleCount > 0` (Namens-Match gegen `Article`).

## Backend — Infrastructure (`BAR.Infrastructure`)

**Ports:** `IArticleRepository`, `IBrandRepository`, `ICategoryRepository` in
`BAR.Domain/Ports/` — Methoden analog `INumberBlockRepository`
(`GetForSellerAsync`, `AddAsync`, `GetByIdAsync`, `UpdateAsync`,
`DeleteAsync`, plus Query-Methoden für Pagination/Filter/Sort als eigener
Query-Port unter `Ports/Queries/`, wie in der Projekt-CLAUDE.md für
Read-Models vorgesehen).

**EF-Configurations** `ArticleConfiguration`, `BrandConfiguration`,
`CategoryConfiguration` unter `Persistence/Configurations/`.

**Repositories** `ArticleRepository`, `BrandRepository`, `CategoryRepository`
unter `Persistence/Repositories/`. Query-Implementierungen unter
`Persistence/Queries/` (Pagination/Filter/Sort direkt gegen `DbSet<Article>`,
Multi-Sort-Parser für `sort=feld:richtung,...`).

**Migration** `AddArticlesAndMasterData`: drei Tabellen `article`, `brand`,
`category`. Unique-Index case-insensitiv auf `brand.name`/`category.name`
(funktionaler Index auf `lower(name)`, konsistent mit bestehendem Muster für
case-insensitive Vergleiche im Projekt — dort prüfen, was R01/R02 für die
E-Mail-Eindeutigkeit bereits verwenden, und gleich ziehen). Kein zusätzlicher
Exclusion-Constraint nötig (nur `NumberBlock` braucht ihn).

## Backend — API (`BAR.Host`)

**`Features/Articles/ArticlesEndpoints.cs`:** `GET /api/articles/mine`,
`GET /api/articles/next-number`, `POST /api/articles`, `PUT
/api/articles/{id}`, `DELETE /api/articles/{id}` (alle `authenticated`), `GET
/api/articles`, `GET /api/articles/{id}` (`admin`). Ownership-Logik lebt im
Application-Handler, Endpoint reicht nur `sub`-Claim durch.

**`Features/MasterData/BrandsEndpoints.cs`,
`Features/MasterData/CategoriesEndpoints.cs`:** `GET`/`POST`
(`authenticated`), `PUT`/`DELETE` (`admin`) je Ressource — zwei separate
Endpoint-Dateien trotz identischer Semantik, damit die Routen (`/api/brands`
vs. `/api/categories`) nicht über Reflection/Parametrisierung verschleiert
werden.

DTOs 1:1 nach den JSON-Beispielen in `api/articles.md`/`api/master-data.md`.
`articleCount` nur im Admin-Response-DTO für Marken/Kategorien enthalten
(separates `AdminMasterDataResponse`-DTO neben `MasterDataResponse`).

In `Program.cs` registrieren: `app.MapArticlesEndpoints()`,
`app.MapBrandsEndpoints()`, `app.MapCategoriesEndpoints()`.

## Frontend

**`shared/autocomplete-create/`** (neue Shared-Component) — nach
[`autocomplete-create/component.md`](../../../components/autocomplete-create/component.md):
`items` (`input()`, `{id, name, original}[]`), `value`/`valueChange`
(`model()`), `createEndpoint` oder Callback-`input()` für den `POST`-Aufruf
beim Anlegen. ▾-Modus: Dropdown bei Fokus/Klick, gefiltert nach Eingabe.
+-Modus: kein exakter Treffer → Button wechselt zu grünem `+` → Modal „Neue
Marke/Kategorie anlegen" (Name-Feld, Abbrechen/Anlegen) → bei `201` Wert
übernehmen und Liste lokal ergänzen, bei `409 master_data.name_taken`
Fehlermeldung im Modal. Tastatur: `↓`/`↑` navigieren, `Enter`
bestätigt/öffnet, `Escape` schließt. Leaf-Komponente, kein eigener Store —
Parent lädt die Liste einmal (z. B. beim Dialog-Öffnen) und reicht sie herein.

**`features/my-articles/`:**
- `ArticlesApiService` (analog `BlocksApiService`) —
  `GET /api/articles/mine`, `GET /api/articles/next-number`,
  `POST`/`PUT`/`DELETE /api/articles`.
- `MasterDataApiService` (oder zwei kleine Services `BrandsApiService`/
  `CategoriesApiService`, je nachdem was zum bestehenden Stil passt) —
  `GET`/`POST /api/brands`, `GET`/`POST /api/categories`, für das
  AutoComplete.
- `artikel-dialog`-Component (neu, unter `features/my-articles/components/`
  o. Ä.) — ein Dialog, zwei Modi, nach
  [component.md](../../requirements/advance-registration/components/artikel-dialog.md),
  **ohne** „Speichern + kopieren"-Button, **ohne** Nummernkonflikt-Dialog
  (siehe „Fehlerbehandlung"). Pflichtfeld-Validierung (Bezeichnung, Kategorie,
  Marke, Preis), Preis `> 0`, Löschen-Button nur im Bearbeiten-Modus +
  `p-confirmdialog` (AC-5).
- `MyArticlesPage`: lädt `GET /api/articles/mine` ohne Query-Parameter
  (Server-Defaults), rendert `table`-Komponente (Spalten Nr./Bezeichnung/
  Kategorie/Marke/Preis, Leerzustand-Text „Noch keine Artikel angemeldet. Mit
  **+ Neu** den ersten anlegen."), „+ Neu"-Button öffnet `artikel-dialog` im
  Anlege-Modus (vorher `GET /api/articles/next-number`; `409
  article.no_free_number` → Dialog öffnet nicht, Toast „Keine freie
  Artikelnummer verfügbar — bitte Admin kontaktieren", AC-8), Edit-Button pro
  Zeile öffnet Bearbeiten-Modus. Liste aktualisiert sich nach
  Anlegen/Bearbeiten/Löschen.

**`features/brands/`, `features/categories/`:** bleiben in R03 leere
Platzhalter-Seiten wie bisher — kein eigenes UI, nur die Services aus
`MasterDataApiService` werden vom AutoComplete genutzt. Verwaltungsseiten
(Tabelle, `PUT`/`DELETE`-UI) sind R05.

## Fehlerbehandlung

- `POST /api/articles` `400` (Pflichtfeld/Preis) → Feldfehler im Dialog
  (analog Profil-Muster aus R02).
- `POST /api/articles` `409 article.number_taken` → in R03 **kein**
  Spezial-Dialog (das ist R04, Epic_Meine_Artikel AC-7). Stattdessen
  generischer Error-Toast mit dem `detail`-Text aus der Response, Dialog
  bleibt offen, Eingaben bleiben erhalten, Nummernfeld wird **nicht**
  automatisch aktualisiert — der Verkäufer muss den Dialog neu öffnen, um
  eine aktuelle Nummer zu bekommen. Das weicht von AC-7 ab; bewusst, weil
  AC-7 laut Roadmap-Ausschlussliste erst R04 verlangt.
- `GET /api/articles/next-number` `409 article.no_free_number` → Toast, Dialog
  öffnet nicht (AC-8, unverändert Teil von R03).
- `PUT`/`DELETE /api/articles/{id}` `404` (fremder/unbekannter Artikel) →
  generischer Error-Toast, Liste wird neu geladen (Artikel könnte inzwischen
  von einer anderen Session gelöscht worden sein).
- `POST /api/brands`/`categories` `409 master_data.name_taken` → Fehlermeldung
  im AutoComplete-Anlegen-Modal, Modal bleibt offen.

## Testing

- **Domain (xUnit):** `ArticleNumberAllocator` — alle drei Kaskadenstufen
  (Stufe 1 eigene Blöcke, Stufe 2 Auto-Erweiterung über
  `NumberBlockAllocator`, Stufe 3 `NoFreeRangeException`), analog bestehendem
  `NumberBlockAllocator`-Test.
- **Application (xUnit):** `CreateArticleCommandHandler`
  (`expectedNumber`-Konflikt, Blockerweiterung, `no_free_number`,
  Pflichtfeld-/Preis-Validierung), `UpdateArticleCommandHandler`/
  `DeleteArticleCommandHandler` (Ownership-Check, `404` bei fremdem Artikel),
  `CreateBrandCommandHandler`/`CreateCategoryCommandHandler` (Duplikat-Check
  case-insensitiv), `UpdateBrandCommandHandler`/`UpdateCategoryCommandHandler`
  (Namens-Kaskade in Artikel).
- **Infrastructure/Integration:** gegen echte Postgres-Testdatenbank —
  Unique-Index case-insensitiv auf Marken-/Kategorienamen, Pagination/Filter/
  Sort-Query gegen `GET /api/articles/mine`.
- **Frontend (Vitest):** `artikel-dialog` (Pflichtfeld-Validierung AC-2, Preis
  `> 0` AC-6, Löschen-Bestätigung AC-5, readonly Artikelnummer), `
  autocomplete-create` (▾/+-Modus-Umschaltung, Anlegen-Modal Erfolg/409,
  Tastatur-Navigation), `MyArticlesPage` (Leerzustand, Liste nach CRUD
  aktuell, AC-8-Pfad).
- **Manuell:** die 7 „Fertig, wenn"-Punkte aus dem Roadmap-Dokument.

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #roadmap #artikel #stammdaten #autocomplete-create #design
