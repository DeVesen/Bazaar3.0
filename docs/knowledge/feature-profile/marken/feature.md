# Marken

**Intent:** Admin pflegt die Liste erlaubter Marken, aus der Verkäufer beim Artikel-Anlegen wählen. Verhindert Tippfehler-Wildwuchs in Freitextfeldern.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Admin can list all brands — `src/advance-registration/frontend/BAR.App/src/app/features/master-data/brands/pages/BrandsPage.ts`
- Admin can filter brands by name and by "original" flag — `BrandsPage.ts`
- Admin can create a brand — `BrandsPage.ts`
- Admin can edit a brand (name, original flag) — `BrandsPage.ts`
- Admin can delete a brand — `BrandsPage.ts`
- Admin sees article count per brand — `BrandsPage.ts`
- Admin sees "in use, cannot delete" (HTTP 409) distinctly from a generic delete failure — `BrandsPage.ts`

## Spans
- **Frontend:** `master-data/brands/pages/BrandsPage.ts`, `master-data/master-data-api.service.ts`, shared `@shared/master-data-popup`, `@shared/master-data-filter-toolbar`
- **Backend:** `BAR.Modules.MasterData.Contracts.IMasterDataModuleApi` (`*BrandAsync`) — renaming raises `BrandRenamed` integration event, consumed by Registration

## Notes
- Renaming a brand triggers a cross-module integration event (`BrandRenamed`) picked up by `bar-modules-registration` — relevant if planning changes to brand rename behavior.
