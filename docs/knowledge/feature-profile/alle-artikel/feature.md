# Alle Artikel

**Intent:** Admin behält den Überblick über sämtliche angemeldeten Artikel aller Verkäufer — zur Kontrolle, nicht zur Bearbeitung.
**Coverage:** inventoried
**Last reviewed:** 2026-09-23

## Capabilities
- Admin can search/filter all articles by brand, category, free text, seller (autocomplete) — `src/advance-registration/frontend/BAR.App/src/app/features/registration/articles/pages/ArticlesPage.ts`
- Below the Tablet breakpoint (< 768px) the filter fields (inside a `p-toolbar`) collapse into a "Filter" button that toggles a `p-popover` dropdown overlay with the same fields — no "+ Neu" button here since this view has none — `shared/filter-panel/filter-panel.ts` (`isMobile()`)
- Admin can sort all articles, server-side — `ArticlesPage.ts`
- Admin can paginate, server-side — `ArticlesPage.ts`
- Admin can view a single article read-only in a modal — `ArticlesPage.ts`, `components/article-readonly-modal.ts`
- Admin sees seller display name with seller number in the row — `ArticlesPage.ts` (`sellerLabel`)

## Spans
- **Frontend:** `registration/articles/pages/ArticlesPage.ts`, `registration/articles/components/article-readonly-modal.ts` + `.html`, `registration/articles/admin-articles-api.service.ts`, `registration/seller-search-api.service.ts`
- **Backend:** `BAR.Modules.Registration.Contracts.IRegistrationModuleApi.GetAllArticlesAsync`/`GetArticleByIdAsync`

## Notes
- Rein lesend — keine Edit-/Delete-Aktion für Admins auf dieser Ansicht (Gegensatz zu `meine-artikel`, wo der Verkäufer selbst editiert).
