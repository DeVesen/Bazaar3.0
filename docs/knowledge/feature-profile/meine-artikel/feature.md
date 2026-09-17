# Meine Artikel

**Intent:** Verkäufer erfasst und pflegt die eigenen zum Basar angemeldeten Artikel — das eigentliche "Anmelden" in der Voranmelde-App.
**Coverage:** inventoried
**Last reviewed:** 2026-09-17

## Capabilities
- Seller can list own articles, server-side paginated — `src/advance-registration/frontend/BAR.App/src/app/features/registration/my-articles/pages/MyArticlesPage.ts`
- Seller can filter own articles by brand, category, free text — `MyArticlesPage.ts`
- Below the Tablet breakpoint (< 768px) the filter fields collapse into a "Filter" button that toggles a `p-popover` dropdown overlay with the same fields — `shared/filter-panel/filter-panel.ts` (`isMobile()`)
- Seller can sort own articles — `MyArticlesPage.ts`
- Seller can create an article, system suggests the next free article number — `MyArticlesPage.ts` (`getNextNumber`)
- Seller can edit an own article — `MyArticlesPage.ts`
- Seller can create a new brand/category inline from the article dialog — `MyArticlesPage.ts` (`onBrandCreated`/`onCategoryCreated`), `components/article-dialog.ts`
- Seller sees an empty-state prompt with a "create" call-to-action when no articles exist yet — `MyArticlesPage.ts`
- User sees "no free number available" warning distinctly — `MyArticlesPage.ts`
- Seller can export all own articles (plus empty rows for unused number-block slots) as CSV — `MyArticlesPage.ts` (`onExport`), `articles-import-export-api.service.ts` (`export`), split-button dropdown next to "+ Neu"
- Seller can download a blank CSV template (Vorlage — numbers only, never article data) — `MyArticlesPage.ts` (`onTemplate`), `articles-import-export-api.service.ts` (`template`)
- Seller can bulk import own articles via CSV/XLSX upload (create/update/delete per row, derived from number + existing article + row content) — `MyArticlesPage.ts` (`onFileSelected`), `articles-import-export-api.service.ts` (`import`)
- Seller sees a row-level error dialog when an import file has any invalid row (all-or-nothing — nothing is saved) — `components/import-result-dialog.ts`
- Seller sees a created/updated/deleted summary and gets the list reloaded after a successful import — `components/import-result-dialog.ts`, `MyArticlesPage.ts` (`onImportDialogClosed`)
- Unknown brands/categories in an import file are auto-created as master data — backend, `ImportArticlesCommandHandler`

## Spans
- **Frontend:** `registration/my-articles/pages/MyArticlesPage.ts`, `registration/my-articles/components/article-dialog.ts`, `registration/my-articles/articles-api.service.ts`, `registration/my-articles/articles-import-export-api.service.ts`, `registration/my-articles/components/import-result-dialog.ts`, `shared/filter-panel/filter-panel.ts` (`splitButtonItems` input)
- **Backend:** `BAR.Modules.Registration.Contracts.IRegistrationModuleApi` (`CreateArticleAsync`, `UpdateArticleAsync`, `GetMyArticlesAsync`, `GetNextNumberAsync`, `GetArticleExportCsvAsync`, `GetArticleTemplateCsvAsync`, `ImportArticlesAsync`), `BAR.Host/Features/Articles/ArticleImportExportEndpoints.cs`

## Notes
- Artikelnummer wird aus dem eigenen Nummernblock vergeben (siehe `nummernbloecke`) — "keine freie Nummer" ist ein eigenständiger Fehlerzustand, kein generischer Fehler.
- Import gilt als vollständige Eingabe: ein Update per Import setzt Farbe/Beschreibung auf leer, weil die CSV/XLSX dafür keine Spalten hat — ein unveränderter Re-Import ist deshalb kein echtes No-Op, sondern meldet den Artikel als "aktualisiert".
- Import-Zeilennummern werden per Ausnahme direkt aus der Datei vergeben (nicht über den normalen `ArticleNumberAllocator`), aber nur wenn die Nummer im eigenen Nummernkreis liegt und frei ist.
- Import-Datei-Größenlimit: 2 MB, serverseitig geprüft bevor die Datei gelesen wird.
