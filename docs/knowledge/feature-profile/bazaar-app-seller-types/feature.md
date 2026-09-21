# Seller Types (Händlertypen) — Bazaar-App

**Intent:** Admins pflegen die Verkäufer-Typen (Provisionssatz + Gebühr je Artikel), die bei der Verkäufer-Anlage zwingend zugeordnet werden müssen — ohne Typ kann kein Verkäufer angelegt werden.
**Coverage:** inventoried
**Last reviewed:** 2026-09-21

## Capabilities
- User can view the seller-type list (Name, Provision %, Gebühr, Verkäufer-Anzahl) — `src/bazaar-app/frontend/src/app/features/seller-types/pages/seller-types-page/seller-types-page.html`
- User can sort the list by any column — `seller-types-page.ts` (`onSortChange`, client-side)
- User sees an empty-state hint that a seller can't be created without a type — `seller-types-page.ts` (`EMPTY_TEXT`)
- Admin can add a new seller type (name, commission rate, item fee) via `app-typ-popup` — `seller-types-page.ts` (`onRowAdd`/`onPopupSave`), `components/typ-popup/typ-popup.ts`
- Admin can edit an existing seller type — `seller-types-page.ts` (`onActionClick` mode `edit`); popup shows a hint that changes don't retroactively affect already-assigned sellers — `typ-popup.html` (`typ-popup__hint`)
- Admin can delete a seller type — `seller-types-page.ts` (`deleteSellerType`)
- Non-admin (Verkäufer) sees the list read-only — `seller-types-page.ts` (`actionColumn`/`canAdd` gated on `RoleService.isAdmin()`)
- User sees the Save button disabled until name is non-empty, commission rate is 0–100, and item fee is ≥0 — `typ-popup.ts` (`canSave`)
- User sees field-level server error messages under Name/Provision/Gebühr on a 400 validation response — `seller-types-page.ts` (`fieldErrorsOf`), `typ-popup.html` (`serverErrors`)
- User sees "Name bereits vergeben" on duplicate name — `seller-types-page.ts` (`onPopupSave` → `seller_type.name_taken`)
- User sees "Verkäufer-Typ wird noch verwendet" when deleting a type still assigned to sellers — `seller-types-page.ts` (`deleteSellerType` → `seller_type.in_use`)
- Provision/Gebühr entry uses `p-inputnumber` with German locale formatting (`locale="de-DE"`, `%`/`€` suffix) — `typ-popup.html`

## Spans
- **Frontend:** `features/seller-types/pages/seller-types-page/`, `features/seller-types/components/typ-popup/`, `features/seller-types/seller-types-store.ts`, `features/seller-types/data/seller-types-api.ts`, `features/seller-types/seller-types.routes.ts`
- **Backend:** `Bazaar.Api/Features/SellerTypes/SellerTypeEndpoints.cs` — `GET /api/seller-types` (any authenticated role), `POST/PUT/DELETE /api/seller-types` (admin only)

## Notes
- Not a structural twin of Brands/Categories — has its own popup (`typ-popup`, not `master-data-popup`) because it edits two numeric fields, not just a name.
- `typ-popup`'s `p-inputnumber` fields sit directly in the page's own dialog template (not behind any `ngTemplateOutlet`/stepper), unlike the Setup-Wizard's seller-type row — the NG01203 value-accessor bug found there does not apply here; no fix needed in this feature.
- `SellerTypesStore` mirrors `CategoriesStore`'s sort/mutation pattern.
