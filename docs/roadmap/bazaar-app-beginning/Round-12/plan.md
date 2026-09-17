---
round: Round-12
status: geplant
---

# Plan: Round 12 — Kategorien

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-11/plan.md](../Round-11/plan.md): 1:1 zu spiegelndes Muster —
  `Brand`/`IBrandRepository`/`BrandRepository`/`BrandConfiguration`/
  `IArticleCountByBrandQuery`-Platzhalter/`BrandEndpoints`/`brands-store`/
  `brands.page.ts`. `shared/components/master-data-popup/` bereits generisch gebaut
  und **wiederverwendbar ohne Änderung** — dieser Round fügt keine neue Popup-Logik
  hinzu, nur eine zweite Verwendungsstelle.
- [Round-7/plan.md](../Round-7/plan.md): `features/categories/categories.routes.ts`
  + Platzhalter-Page, Route `/categories` bereits registriert.

## Implementationsplan

Identische Struktur zu [Round-11/plan.md](../Round-11/plan.md), Ressourcenname
getauscht (`Brand`→`Category`, `brand`→`category` in Pfaden/Feldern):

### Backend

1. `Bazaar.Domain/Category/`: `Category.cs` (`Id`/`Name`/`Original`, gleiche
   Invarianten-Struktur), `ICategoryRepository.cs`,
   `IArticleCountByCategoryQuery.cs` (Platzhalter-Port, analog
   `IBrandArticleLink`-Entscheidung aus Round-11 — hier
   `ICategoryArticleLink` mit `CountByCategoryName`/`RenameArticlesReferencingCategory`).
2. Infrastructure: `CategoryConfiguration.cs` (`Name` als `citext`, Unique-Index),
   `CategoryRepository.cs`, `ArticleCountByCategoryQuery.cs`
   (Platzhalter, `// TODO(Round-15)`, gleiche Kommentar-Konvention wie Round-11).
3. Application (`Bazaar.Application/Categories/`): `GetCategoriesHandler`,
   `CreateCategoryCommand`+`Validator`+`Handler`, `UpdateCategoryCommand`+
   `Validator`+`Handler`, `DeleteCategoryHandler` — Logik identisch zu den
   Brand-Handlern aus Round-11.
4. Api (`Bazaar.Api/Features/Categories/`): `CategoryEndpoints.cs`, vier Routen,
   `Original`-Ableitung aus Rollen-Claim wie bei Brands.

### Frontend

5. `features/categories/`: `data/categories-api.ts`, `categories-store.ts`,
   `pages/categories.page.ts` (ersetzt Round-7-Platzhalter) — verdrahtet dieselbe
   `shared/components/master-data-popup/` aus Round-11 mit `entityLabel="Kategorie"`,
   keine Änderung an der Popup-Komponente selbst.

### 6. Verifikation

- `dotnet test` — Domain-/Application-Tests analog Round-11, Duplikatprüfung,
  `category.in_use` bleibt mit leerer Artikel-Tabelle unerreichbar.
- `ng serve`: `/categories` als Kassenpersonal/Admin — gleiches Rollenverhalten wie
  `/brands`. Popup-Wiederverwendung visuell bestätigen (Titel/Toast zeigen
  „Kategorie", nicht „Marke").

## Reihenfolge

1 → 2 → 3 → 4 sequenziell, 5 nach 4 (Popup existiert bereits aus Round-11, keine
Wartezeit auf einen neuen Frontend-Baustein), 6 abschließend.
