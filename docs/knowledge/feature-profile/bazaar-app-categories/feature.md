# Categories (Kategorien) — Bazaar-App

**Intent:** Admins pflegen die Kategorienliste, die Verkäufern beim Artikel-Erfassen zur Auswahl steht — importierte Original-Kategorien aus der Voranmelde-App und lokal in der Haupt-App nachgetragene neue Kategorien bleiben unterscheidbar.
**Coverage:** inventoried
**Last reviewed:** 2026-09-21

## Capabilities
- User can view the category list (ID, Name, Original-Badge, Artikel-Anzahl) — `src/bazaar-app/frontend/src/app/features/categories/pages/categories-page/categories-page.html`
- User can sort the category list by any column — `categories-page.ts` (`onSortChange`, client-side)
- User sees "✓ Original" (success) vs. "Neu" (warn) badge per row — `categories-page.ts` (`originalLabel`)
- User sees an empty-state hint mentioning the Voranmelde-App import when no categories exist — `categories-page.ts` (`EMPTY_TEXT`)
- Admin can add a new category (name only) via popup — `categories-page.ts` (`onRowAdd`/`onPopupSave`), `shared/components/master-data-popup/master-data-popup`
- Admin can edit a category's name and its Original-flag — `categories-page.ts` (`onActionClick` mode `edit`)
- Admin can delete a category — `categories-page.ts` (`deleteCategory`)
- Non-admin (Verkäufer) sees the list read-only — `categories-page.ts` (`actionColumn`/`canAdd` gated on `RoleService.isAdmin()`)
- User sees "Name bereits vergeben" on duplicate name — `categories-page.ts` (`onPopupSave` → `category.name_taken`)
- User sees "Kategorie wird noch verwendet" when deleting a category still linked to articles — `categories-page.ts` (`deleteCategory` → `category.in_use`)

## Spans
- **Frontend:** `features/categories/pages/categories-page/`, `features/categories/categories-store.ts`, `features/categories/data/categories-api.ts`, `features/categories/categories.routes.ts`; shared `shared/components/master-data-popup/` (also used by `bazaar-app-brands`)
- **Backend:** `Bazaar.Api/Features/Categories/CategoryEndpoints.cs` — `GET/POST /api/categories` (any authenticated role), `PUT/DELETE /api/categories/{id}` (admin only); `Original` set server-side from role claim

## Notes
- 1:1 structural twin of `bazaar-app-brands` — see that profile's note.
- Same sort/mutation pattern as `bazaar-app-brands` (`CategoriesStore`).
