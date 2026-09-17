---
round: Round-15
status: geklärt
---

# Spec: Round 15 — Artikel-Übersicht & Korrektur

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Artikel: zentrale Artikel-Tabelle, Korrektur-Dialog,
Admin-only Zeitstempel-Popup. Gleichzeitig der Round, der die Artikel-Entität real
einführt und damit alle in Round-11/12/14 bewusst offen gelassenen
Platzhalter-Query-Ports auflöst (s. u.).

### Rückverdrahtung der Platzhalter aus Round-11/12/14

Reines Infrastructure-/DI-Update — **keine Änderung an den Application-Handlern** aus
den Vorgänger-Rounds, die sind bereits gegen die jeweiligen Ports codiert:

| Platzhalter | Herkunft | Reale Implementierung in Round-15 |
|---|---|---|
| `ArticleCountByBrandQuery` | [Round-11](../Round-11/spec.md) | `COUNT(*) WHERE Brand = @name` |
| `ArticleCountByCategoryQuery` | [Round-12](../Round-12/spec.md) | `COUNT(*) WHERE Category = @name` |
| Rename-Cascade in `UpdateBrandHandler`/`UpdateCategoryHandler` | Round-11/12 | `UPDATE Articles SET Brand/Category = @newName WHERE … = @oldName`, in derselben Transaktion wie das Stammdaten-Update |
| `ArticleCountBySellerQuery` | [Round-14](../Round-14/spec.md) | `COUNT(*) WHERE SellerId = @id` |
| `ArticlesBySellerQuery` | Round-14 | alle Artikel eines Verkäufers, Status abgeleitet |
| `SellerCardsQuery` | Round-14 | echte Zählungen (`articleCount`/`releasedCount`/`soldCount`/`returnedCount`) und Preissummen (`acceptedValue`/`openValue`/`revenue`) nach den Formeln aus [seller-card.md](../../../components/seller-card.md); `status` abgeleitet aus `settledAt`/freigegebenen Artikeln |

`ISellerCountBySellerTypeQuery` (Round-13) ist **nicht** Teil dieser Liste — die wurde
bereits in [Round-14](../Round-14/spec.md) real verdrahtet (Nachtrag dort), da sie an
der Seller-, nicht der Artikel-Tabelle hängt.

### Frontend

**Feature-Ordner** `src/app/features/articles/`:
- `pages/articles.page.ts`, `data/articles-api.ts` (`GET/PUT/DELETE /api/articles`,
  `PUT /api/articles/{id}/timestamps`), `articles-store.ts` (Signals, serverseitig:
  Suche, Filter, Sortierung, Paginierung 50/Seite).

**Filter-Panel** (zweizeilig — Haupt-App-Sonderfall laut [filter-panel.md](../../../components/filter-panel/component.md)):
- Zeile 1: Freitext, volle Breite (Nummer, Bezeichnung, Marke, Kategorie,
  Verkäufername).
- Zeile 2: Marken-Dropdown · Kategorien-Dropdown · Artikelstatus-Dropdown, 3-Spalten-
  Grid, Gap 10px, bricht < Tablet auf 1 Spalte.
- Live, debounced 300 ms (Haupt-App-Regel aus [cross-cutting.md](../../../requirements/bazaar-app/api/cross-cutting.md), siehe Doku-Hinweis in [Round-14/spec.md](../Round-14/spec.md)). Kein „+ Neu" — Artikel entstehen nur über Annahme/Import.
- Kein Verkäufer-Status-Filter (bewusst, beantwortet auf einer Artikelliste keine
  Frage, Epic_Artikel Abschnitt 1).

**Tabelle**: Spalten Nr./Bezeichnung/Kategorie/Marke/Preis/Status/Verkäufer/Aktionen —
alle außer Aktionsspalte sortierbar (Multi-Sort). `number` ist eine echte Zahl
(Barcode-Grundlage), anders als bei Marken/Kategorien. „manuell"-Badge neben Status
bei `soldManually`. Kein „+ Neu".

**`artikel-dialog`** (`features/articles/components/artikel-dialog/`, feature-lokal,
eigene Datei — nicht die Voranmelde-App-Variante):
- Artikelnummer read-only oben. Felder: Bezeichnung* (Input), Kategorie*/Marke*,
  Preis*, Größe/Farbe/Beschreibung (optional).
- **Vorläufige Feld-Implementierung (mit Nutzer abgestimmt, 2026-09-17):**
  [`artikel-dialog.md`](../../../components/artikel-dialog.md) verlangt für
  Kategorie/Marke die Komponente `autocomplete-create` und für Preis `input-group`
  (Numpad-Modus) — beide werden laut Roadmap aber erst in
  [Round-16](../Round-16/round.md) als geteilte Komponenten gebaut, existieren zum
  Zeitpunkt von Round-15 also noch nicht. Round-15 implementiert die beiden Felder
  darum vorläufig einfacher:
  - Kategorie/Marke: `p-select` (Dropdown) über die Listen aus
    `GET /api/brands`/`/categories` (Round-11/12, real) — **ohne** Inline-Create; ein
    unbekannter Name kann in Round-15 nicht direkt aus dem Dialog heraus angelegt
    werden (Fallback: Admin legt den Stammdatensatz vorher auf `/brands`/`/categories`
    an).
  - Preis: PrimeNG `p-inputNumber` (Geld-Variante, 2 Dezimalstellen), kein
    Numpad-Modus.
  - Round-16 rüstet den Dialog auf `autocomplete-create` bzw. `input-group` um, sobald
    beide Komponenten existieren — reiner Component-Austausch, keine Änderung an
    Backend-Contract oder Validierung.
- Verkäufer erscheint **nicht** als Feld — nicht änderbar.
- Gestaffelte Sperre: `soldAt` gesetzt → Preisfeld deaktiviert + Hinweis „Verkauf
  zuerst stornieren"; Seller abgerechnet → alle Felder deaktiviert + Banner „Abrechnung
  zuerst stornieren" mit Verweis auf die Verkäufer-Seite. Serverseitig durchgesetzt,
  die deaktivierten Felder sind nur die Bequemlichkeit.
- Löschen-Button (danger, links im Footer), nur Admin, nur solange `soldAt` leer.

**`article-status-popup`** (`features/articles/components/article-status-popup/`,
feature-lokal, nur Admin — Status-Badge für Kassenpersonal nicht klickbar):
- Zeilen Erstellt Am (read-only) / Freigegeben Am / Verkauft Am / Rückgegeben Am
  (jeweils Setzen-/Löschen-Icon) / Abgerechnet Am (read-only).
- Kaskaden-Bestätigungsdialog nennt die konkreten betroffenen Zeitstempel mit Datum
  und Uhrzeit, nicht nur Feldnamen — Bestätigung vor dem Löschen.
- Gegenseitige Sperre: `soldAt` gesetzt → Setzen-Icon bei `returnedAt` deaktiviert und
  umgekehrt.
- Manuelles Setzen von „Verkauft Am" → Warnhinweis „Dieser Verkauf entsteht ohne
  Kassenvorgang und fehlt in der Kassenabstimmung." vor Bestätigung.
- Seller abgerechnet → alle Icons deaktiviert, Hinweiszeile „Abrechnung zuerst
  stornieren", verlinkt zur Verkäufer-Seite.

### Backend

**Domain** (`Bazaar.Domain/Article/`):
- `Article`-Aggregate: `Id` (8 Zeichen, `IIdGenerator`), `Number` (int), `SellerId`,
  `Name`, `Brand`, `Category` (Strings, denormalisiert — kein FK, AutoComplete-Create),
  `Price`, `Description?`, `Size?`, `Color?`, `CreatedAt`, `UpdatedAt` (serverseitig,
  nicht editierbar), `AcceptedAt?`, `ReleasedAt?`, `SoldAt?`, `ReturnedAt?`,
  `SoldManually` (Default `false`).
- `Status` als **berechnete Property**, kein persistiertes Feld: `Registered`
  (`ReleasedAt = null`), `Selling` (`ReleasedAt` gesetzt, `SoldAt`/`ReturnedAt` leer),
  `Sold` (`SoldAt` gesetzt), `Returned` (`ReturnedAt` gesetzt).
- Domain-Invarianten (im Aggregate, nicht nur FluentValidation): `SoldAt` und
  `ReturnedAt` nie gleichzeitig gesetzt (wirft → Handler mappt `409
  article.sold_and_returned`); Preisänderung nach `SoldAt` wirft (`409 article.sold`).
  Die Sperre „Seller abgerechnet" prüft der Handler (braucht `Seller.SettledAt`, kein
  Cross-Aggregate-Read im Article-Aggregate selbst) → `409 settlement.locked`.
- Port `IArticleRepository` in `Domain/Ports/` (`Add`, `GetById`, `Update`, `Remove`,
  `GetAllBySellerId`).

**Application** (`Bazaar.Application/Articles/`):
- `GetArticlesHandler` (`GET /api/articles`) — Query-Port `IArticleListQuery`,
  paginiert 50/Seite, Parameter `q`/`brand`/`category`/`status`/`sort`, Response
  inkl. `sellerName` (Read-Model-Join gegen Seller-Stammdaten).
- `UpdateArticleHandler` (`PUT /api/articles/{id}`) — Stammfelder, lädt zusätzlich
  `Seller.SettledAt` zur Sperrprüfung, gestaffelte Sperre über Domain-Invariante plus
  Settlement-Check.
- `UpdateArticleTimestampsHandler` (`PUT /api/articles/{id}/timestamps`, admin) —
  Vollersetzung der drei setzbaren Zeitstempel (`releasedAt`/`soldAt`/`returnedAt`),
  Kaskade **serverseitig geprüft** (inkonsistente Kombination — späterer Zeitstempel
  gesetzt, früherer `null` — wird abgelehnt, nicht nur im Frontend verhindert), setzt
  `SoldManually = true` wenn `soldAt` hierüber gesetzt wird.
- `DeleteArticleHandler` (admin) — `409 article.sold` wenn `SoldAt` gesetzt, `409
  settlement.locked` wenn Seller abgerechnet.
- FluentValidation: `name`/`price`/`category`/`brand` Pflicht bei
  `UpdateArticleCommand`.

**Infrastructure**:
- `ArticleRepository : IArticleRepository` (EF Core,
  `IEntityTypeConfiguration<Article>`).
- `ArticleListQuery` — real, Suchregeln nach [cross-cutting.md §6](../../../requirements/bazaar-app/api/cross-cutting.md)
  (`ILIKE`, Teilwort, Token-Zerlegung über Name/Brand/Category/SellerName).
- Die sechs Rückverdrahtungen aus der Tabelle oben — ersetzen die
  Platzhalterimplementierungen aus Round-11/12/14, keine neuen Interfaces.

**Api** (`Bazaar.Api/Features/Articles/`):
- `GET /api/articles` (`authenticated`), `PUT /api/articles/{id}` (`authenticated`
  — beide Rollen dürfen Stammfelder korrigieren), `PUT /api/articles/{id}/timestamps`
  (`admin`), `DELETE /api/articles/{id}` (`admin`) — DTOs exakt nach
  [`api/articles.md`](../../../requirements/bazaar-app/api/articles.md).
- **Nicht** in diesem Round: `GET /api/articles/by-number/{number}`,
  `GET /api/articles/next-number` — gehören zur Artikelannahme (Round-16/17) bzw. zum
  Verkauf (Round-19), obwohl in `api/articles.md` mitdokumentiert.
- `errorCode`: `article.sold`, `article.sold_and_returned`, `settlement.locked` —
  bereits katalogisiert.

### Akzeptanzkriterien

Epic_Artikel AC-1 bis AC-12 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Domain-UnitTests: `Article`-Status-Ableitung, Sperrinvarianten, Kaskadenlogik.
- Application-UnitTests: alle vier neuen Handler mit gemockten Ports; **zusätzlich**
  neue Testfälle in den bestehenden Round-11/12/14-Testklassen für die sechs real
  ersetzten Query-Ports (keine neuen Testklassen, dieselben wie dort angelegt).
- Architecture-Tests: Schichten-Regel.
- Frontend: `ArticlesPage`/`articles-store`/`artikel-dialog`/`article-status-popup` —
  Vitest.

### Bewusst nicht in diesem Round

Das Entstehen von Artikeln selbst (Artikelannahme → Round-16/17, Import →
Einstellungen-Epic), der reguläre Verkaufs-/Freigabe-/Abrechnungsvorgang (nur die
nachträgliche Korrektur ist hier Thema), `by-number`/`next-number`-Endpoints (s. o.).
