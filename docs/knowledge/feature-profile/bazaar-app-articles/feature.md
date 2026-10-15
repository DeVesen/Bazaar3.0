# Articles (Artikel)

**Intent:** Übersicht und Korrektur aller Artikel im laufenden Basar — durchsuchen, filtern, sortieren, Stammdaten korrigieren, Status-Zeitstempel verwalten (Admin).
**Coverage:** partial
**Last reviewed:** 2026-10-15

## Capabilities
- User can search articles by number/name (debounced) — `pages/articles-page/articles-page.ts` (`onQInputChange`)
- User can filter by Marke/Kategorie/Status (immediate, no debounce) — `articles-page.ts` (`onBrandChange`/`onCategoryChange`/`onStatusChange`)
- User sees a lazy-loaded, server-side sortable/paginated table (`app-table [lazy]="true"`) — `articles-page.html`
- User sees status as a colored badge, plus a "manuell" secondary badge when sold manually — `articles-page.ts` (`STATUS_SEVERITY`, `secondaryBadge`)
- User can edit an article's Artikelnummer/Bezeichnung/Kategorie/Marke/Preis/Größe/Farbe/Beschreibung via dialog — `components/artikel-dialog/artikel-dialog.ts`
- User can create a new Marke/Kategorie inline from the edit dialog via autocomplete — `artikel-dialog.html` (`app-autocomplete-create`, `onBrandCreated`/`onCategoryCreated`)
- User sees the price field locked once sold, and all fields locked once the seller is settled — `artikel-dialog.html` (`priceDisabled`, `fieldsDisabled`, banner linking to `/sellers`)
- User can delete an article (only surfaced when allowed) — `artikel-dialog.ts` (`canDelete`, `deleteRequested`)
- User sees an error and cannot save when the entered Artikelnummer belongs to another article (checked on blur via `GET /api/articles/by-number/{number}`, enforced by `PUT /api/articles/{id}` as 409 `article.number_taken`) and a label hint when the number was changed — `artikel-dialog.ts` (`onNumberBlur`, `numberError`, `showLabelHint`), `UpdateArticleHandler`
- User (admin only) can open a Status popup to view/set/delete Freigegeben-/Verkauft-/Rückgegeben-Zeitstempel — `components/article-status-popup/article-status-popup.ts`, `PUT /api/articles/{id}/timestamps`
- User sees settlement-locked state in the status popup with a link to `/sellers` — `article-status-popup.html`
- User sees a specific error when a timestamp combination is invalid (sold+returned) — `articles-page.ts` (`article.sold_and_returned`)
- Both roles (not just admin) can edit basic Stammfelder — `PUT /api/articles/{id}` is `authenticated`, not `admin`
- User sees Suche (mittig) und die Auswahlfelder Marke, Kategorie und Status (rechts) in einer gerahmten Filterleiste über der Tabelle — `pages/articles-page/articles-page.html` (`p-toolbar.articles-page__filterbar`, Templates `#center`/`#end`)

## Spans
- **Frontend:** `features/articles/pages/articles-page/`, `features/articles/components/{artikel-dialog,article-status-popup}/`, `features/articles/{articles-store.ts, data/articles-api.ts}`; cross-feature read-only imports of `brands/data/brands-api` and `categories/data/categories-api` for filter dropdown options
- **Backend:** `Bazaar.Api/Features/Articles/ArticleEndpoints.cs` (`GET /api/articles`, `GET /api/articles/next-number`, `GET /api/articles/by-number/{number}`, `GET/PUT/DELETE /api/articles/{id}`, `PUT /api/articles/{id}/timestamps`)

## Notes
- `artikel-dialog`'s price field uses shared `app-input-group` (variant "price"), not a plain input — worth knowing before touching price UX elsewhere.
- Application-layer handlers and domain rules (`article.sold`, `settlement.locked`, cascade rule in `Article.SetTimestamps`) not walked, only the errorCodes surfaced to the frontend.
- Coverage `partial`: page/component templates walked; `articles-store.ts` and backend Application/Domain layers not read.
