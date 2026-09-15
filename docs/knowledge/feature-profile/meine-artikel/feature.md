# Meine Artikel

**Intent:** Verkäufer erfasst und pflegt die eigenen zum Basar angemeldeten Artikel — das eigentliche "Anmelden" in der Voranmelde-App.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Seller can list own articles, server-side paginated — `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/pages/MyArticlesPage.ts`
- Seller can filter own articles by brand, category, free text — `MyArticlesPage.ts`
- Below the Tablet breakpoint (< 768px) the filter fields collapse into a "Filter" button that opens a bottom drawer with the same fields — `shared/filter-panel/filter-panel.ts`
- Seller can sort own articles — `MyArticlesPage.ts`
- Seller can create an article, system suggests the next free article number — `MyArticlesPage.ts` (`getNextNumber`)
- Seller can edit an own article — `MyArticlesPage.ts`
- Seller can create a new brand/category inline from the article dialog — `MyArticlesPage.ts` (`onBrandCreated`/`onCategoryCreated`), `components/article-dialog.ts`
- Seller sees an empty-state prompt with a "create" call-to-action when no articles exist yet — `MyArticlesPage.ts`
- User sees "no free number available" warning distinctly — `MyArticlesPage.ts`

## Spans
- **Frontend:** `registration/my-articles/pages/MyArticlesPage.ts`, `registration/my-articles/components/article-dialog.ts`, `registration/my-articles/articles-api.service.ts`
- **Backend:** `BAR.Modules.Registration.Contracts.IRegistrationModuleApi` (`CreateArticleAsync`, `UpdateArticleAsync`, `GetMyArticlesAsync`, `GetNextNumberAsync`)

## Notes
- Artikelnummer wird aus dem eigenen Nummernblock vergeben (siehe `nummernbloecke`) — "keine freie Nummer" ist ein eigenständiger Fehlerzustand, kein generischer Fehler.
