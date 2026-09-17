---
round: Round-12
status: geklärt
---

# Spec: Round 12 — Kategorien

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Kategorien — strukturell identisch zu
[Round-11](../Round-11/spec.md) (Marken), eigenständige Ressource. Diese Spec
beschreibt nur, was kategoriespezifisch ist; das Gemeinsame steht in Round-11.

### Bewusst offener Punkt (identisch zu Round-11): Artikel-Kopplung

Wie bei Marken setzen `articleCount`, Löschsperre und Rename-Cascade eine
Artikel-Tabelle voraus, die erst ab [Round-15](../Round-15/round.md) existiert. Round-12
implementiert dieselben drei Stellen gegen Platzhalter-Query-Ports
(`IArticleCountByCategoryQuery`, No-Op bis Round-15) — gleiche Entscheidung wie in
Round-11, hier nicht erneut zur Diskussion gestellt.

### Frontend

**Feature-Ordner** `src/app/features/categories/`:
- `pages/categories.page.ts`, `data/categories-api.ts`
  (`GET/POST/PUT/DELETE /api/categories`), `categories-store.ts` (Signals, In-Memory
  Sort/Filter — API unpaginiert).

**Tabelle** (Route `/categories`):
- Spalten: `id`, `name`, `original` (Badge „✓ Original"/„Neu"), `articleCount` — alle
  sortierbar, Default `name` aufsteigend.
- Aktionsspalte nur für Admin, wie Round-11.
- `emptyText`: „Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit
  übernommen." (Epic_Kategorien AC-9).

**`master-data-popup`**: wiederverwendet aus `shared/components/master-data-popup/`
([Round-11](../Round-11/spec.md)), `entityLabel="Kategorie"`, Titel „Neue
Kategorie"/„Kategorie bearbeiten", Toast „✓ Kategorie gespeichert".

### Backend

**Domain** (`Bazaar.Domain/Category/`):
- `Category`-Aggregate: `Id` (8 Zeichen, `IIdGenerator`), `Name` (nicht leer),
  `Original` (bool).
- Port `ICategoryRepository` in `Domain/Ports/` — gleiche Methoden wie
  `IBrandRepository` (Round-11).

**Application** (`Bazaar.Application/Categories/`):
- `GetCategoriesHandler`, `CreateCategoryHandler`, `UpdateCategoryHandler`,
  `DeleteCategoryHandler` — identische Logik zu den Brand-Handlern aus Round-11
  (Duplikatprüfung Trim+case-insensitiv, `Original` aus Rollen-Claim, Löschsperre über
  Platzhalter-Query-Port).
- FluentValidation: `name` Pflichtfeld.

**Infrastructure**:
- `CategoryRepository : ICategoryRepository` (EF Core, Unique-Index auf `Name`
  case-insensitiv).
- `ArticleCountByCategoryQuery`-Platzhalterimplementierung (konstant `0`/`false`, TODO
  Round-15).

**Api** (`Bazaar.Api/Features/Categories/`):
- `GET /api/categories` (`authenticated`), `POST /api/categories` (`authenticated`),
  `PUT/DELETE /api/categories/{id}` (`admin`) — DTOs nach
  [`api/master-data.md`](../../../requirements/bazaar-app/api/master-data.md).
- `errorCode`: `category.name_taken` (409), `category.in_use` (409) — bereits
  katalogisiert.

### Explizit flache Liste

Keine Kategorie-Hierarchie, kein Eltern-Feld, keine feste Sortierreihenfolge, kein
Icon/Farbe — Entity trägt ausschließlich `id`/`name`/`original` (Epic_Kategorien
Abschnitt 7, entities/kategorie.md).

### Akzeptanzkriterien

Epic_Kategorien AC-1 bis AC-9 — mit derselben Einschränkung wie Round-11: AC-5
(Löschsperre) und Rename-Cascade bis Round-15 strukturell, nicht wirksam.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen, analog Round-11:
- Domain-UnitTests: `Category`-Invarianten.
- Application-UnitTests: Handler mit gemockten Ports.
- Architecture-Tests: Schichten-Regel.
- Frontend: `CategoriesPage`/`categories-store` — Vitest.

### Bewusst nicht in diesem Round

Kategorie-Hierarchie (bewusst nicht vorgesehen, s. o.), Import aus der Voranmelde-App
(→ Einstellungen-Epic).
