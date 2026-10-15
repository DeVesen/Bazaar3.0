# Brands (Marken) — Bazaar-App

**Intent:** Admins pflegen die Markenliste, die Verkäufern beim Artikel-Erfassen zur Auswahl steht — importierte Original-Marken aus der Voranmelde-App und lokal in der Haupt-App nachgetragene neue Marken bleiben unterscheidbar.
**Coverage:** inventoried
**Last reviewed:** 2026-10-15

## Capabilities
- User can view the brand list (ID, Name, Original-Badge, Artikel-Anzahl) — `src/bazaar-app/frontend/src/app/features/brands/pages/brands-page/brands-page.html`
- User can sort the brand list by any column — `brands-page.ts` (`onSortChange`, client-side, no server round-trip)
- User sees "✓ Original" (success) vs. "Neu" (warn) badge per row — `brands-page.ts` (`originalLabel`)
- User sees an empty-state hint mentioning the Voranmelde-App import when no brands exist — `brands-page.ts` (`EMPTY_TEXT`)
- Admin can add a new brand (name only) via popup — `brands-page.ts` (`onRowAdd`/`onPopupSave`), `shared/components/master-data-popup/master-data-popup`
- Admin can edit a brand's name and its Original-flag — `brands-page.ts` (`onActionClick` mode `edit`)
- Admin can delete a brand — `brands-page.ts` (`deleteBrand`)
- Non-admin (Verkäufer) sees the list read-only — no add/edit/delete actions rendered — `brands-page.ts` (`actionColumn`/`canAdd` gated on `RoleService.isAdmin()`)
- User sees "Name bereits vergeben" when creating/editing with a duplicate name — `brands-page.ts` (`onPopupSave` → `brand.name_taken`)
- User sees "Marke wird noch verwendet" when deleting a brand still linked to articles — `brands-page.ts` (`deleteBrand` → `brand.in_use`)
- User sees +-Button (nur Admin), Suchfeld und Original-Filter in einer Leiste über der Tabelle statt eines Neu-Buttons in der Titelzeile — `pages/brands-page/brands-page.html` (`.brands-page__toolbar`)
- User can search brands by name und nach Original filtern (Select, leerbar); die Tabelle filtert clientseitig — `brands-page.ts` (`onSearchChange`, `onOriginalChange`)
- User sees „Keine Marken gefunden.“, wenn Suche oder Filter nichts treffen, und den Voranmelde-Hinweis nur bei leerem Bestand — `brands-page.ts` (`emptyText`, `NOT_FOUND_TEXT`, `EMPTY_TEXT`)

## Spans
- **Frontend:** `features/brands/pages/brands-page/`, `features/brands/brands-store.ts`, `features/brands/data/brands-api.ts`, `features/brands/brands.routes.ts`; shared `shared/components/master-data-popup/` (also used by `bazaar-app-categories`)
- **Backend:** `Bazaar.Api/Features/Brands/BrandEndpoints.cs` — `GET/POST /api/brands` (any authenticated role), `PUT/DELETE /api/brands/{id}` (admin only); `Original` is set server-side from the caller's role claim, never client input

## Notes
- 1:1 structural twin of `bazaar-app-categories` (identical store/page/API shape, only entity name differs) — a change to one very likely needs the same change in the other.
- `BrandsStore`/`CategoriesStore` keep their own canonical name-ascending sort after every mutation; the table's `sortChange` is purely a display-order override the page applies on top, never persisted.
- Backend endpoint list read directly (signatures); Application-layer handler internals (`CreateBrandHandler` etc.) not walked — out of scope for a feature profile's frontend-surface focus.
