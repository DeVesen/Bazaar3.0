# Verkäufer-Typen

**Intent:** Admin definiert Verkäufer-Kategorien (z.B. Privat/Verein) mit je eigener Provision und Artikelgebühr — Grundlage für die Abrechnung jedes Verkäufers.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Admin can list/search seller types by name — `src/advance-registration/frontend/BAR.App/src/app/features/master-data/seller-types/pages/SellerTypesPage.ts`
- Admin can create a seller type (name, commission rate, item fee) — `SellerTypesPage.ts`
- Admin can edit a seller type — `SellerTypesPage.ts`
- Admin can delete a seller type — `SellerTypesPage.ts`
- Admin sees seller count per type — `SellerTypesPage.ts`
- Admin sees "in use" delete-conflict including the affected seller count in the message — `SellerTypesPage.ts`

## Spans
- **Frontend:** `master-data/seller-types/pages/SellerTypesPage.ts`, `master-data/seller-types/components/seller-type-popup.ts`, `master-data/seller-types/seller-type-api.service.ts`
- **Backend:** `BAR.Modules.MasterData.Contracts.IMasterDataModuleApi` (`*SellerTypeAsync`, `GetSellerTypeConditionsAsync`) — Konditionen fließen in Home, SellerManagement, Export

## Notes
- Ein Verkäufertyp kann als "Default" in den Einstellungen (`einstellungen`) hinterlegt sein — Löschung des aktuellen Default-Typs ist über `IOperationsModuleApi.IsDefaultSellerTypeAsync` geschützt (Details siehe `bar-modules-masterdata`).
