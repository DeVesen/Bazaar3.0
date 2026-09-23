# Verkäufer-Typen

**Intent:** Admin definiert Verkäufer-Kategorien (z.B. Privat/Verein) mit je eigener Provision und Artikelgebühr — Grundlage für die Abrechnung jedes Verkäufers.
**Coverage:** inventoried
**Last reviewed:** 2026-09-23

## Capabilities
- Admin can list/search seller types by name — `src/advance-registration/frontend/BAR.App/src/app/features/master-data/seller-types/pages/SellerTypesPage.ts`
- Admin can create a seller type (name, commission rate, item fee) — `SellerTypesPage.ts`
- Admin can edit a seller type — `SellerTypesPage.ts`
- Admin can delete a seller type — `SellerTypesPage.ts`
- Admin sees seller count per type — `SellerTypesPage.ts`
- Admin sees "in use" delete-conflict including the affected seller count in the message — `SellerTypesPage.ts`
- User sees, below the Tablet breakpoint (< 768px), the filter fields (inside a `p-toolbar`) collapsed behind a "Filter" button that toggles a `p-popover` dropdown overlay with the same fields — `src/advance-registration/frontend/BAR.App/src/app/shared/master-data-filter-toolbar/master-data-filter-toolbar.ts` (`isMobile()`), used by `SellerTypesPage.ts`

## Spans
- **Frontend:** `master-data/seller-types/pages/SellerTypesPage.ts`, `master-data/seller-types/components/seller-type-popup.ts`, `master-data/seller-types/seller-type-api.service.ts`, shared `@shared/master-data-filter-toolbar`
- **Backend:** `BAR.Modules.MasterData.Contracts.IMasterDataModuleApi` (`*SellerTypeAsync`, `GetSellerTypeConditionsAsync`) — Konditionen fließen in Home, SellerManagement, Export

## Notes
- Ein Verkäufertyp kann als "Default" in den Einstellungen (`einstellungen`) hinterlegt sein — Löschung des aktuellen Default-Typs ist über `IOperationsModuleApi.IsDefaultSellerTypeAsync` geschützt (Details siehe `bar-modules-masterdata`).
