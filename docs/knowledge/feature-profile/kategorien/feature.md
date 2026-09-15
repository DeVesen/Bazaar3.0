# Kategorien

**Intent:** Admin pflegt die Liste erlaubter Kategorien, aus der Verkäufer beim Artikel-Anlegen wählen. Strukturell identisch zu Marken, fachlich eigenständig.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Admin can list all categories — `src/advance-registration/frontend/BAR.App/src/app/features/master-data/categories/pages/CategoriesPage.ts`
- Admin can filter categories by name and by "original" flag — `CategoriesPage.ts`
- Admin can create a category — `CategoriesPage.ts`
- Admin can edit a category (name, original flag) — `CategoriesPage.ts`
- Admin can delete a category — `CategoriesPage.ts`
- Admin sees article count per category — `CategoriesPage.ts`
- Admin sees "in use, cannot delete" (HTTP 409) distinctly from a generic delete failure — `CategoriesPage.ts`

## Spans
- **Frontend:** `master-data/categories/pages/CategoriesPage.ts`, `master-data/master-data-api.service.ts`, shared `@shared/master-data-popup`, `@shared/master-data-filter-toolbar`
- **Backend:** `BAR.Modules.MasterData.Contracts.IMasterDataModuleApi` (`*CategoryAsync`) — renaming raises `CategoryRenamed` integration event, consumed by Registration

## Notes
- Renaming a category triggers a cross-module integration event (`CategoryRenamed`) picked up by `bar-modules-registration`.
