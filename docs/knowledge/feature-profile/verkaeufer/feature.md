# Verkäufer

**Intent:** Admin verwaltet die Liste registrierter Verkäufer — anlegen (statt Self-Service-Registrierung), bearbeiten, löschen, und die Passwort-Erstvergabe nach einer Admin-Einladung.
**Coverage:** inventoried
**Last reviewed:** 2026-09-16

## Capabilities
- Admin can search sellers by name, server-side paginated/sorted — `src/advance-registration/frontend/BAR.App/src/app/features/seller-management/sellers/pages/SellersPage.ts`
- Admin can create a seller directly (without seller self-registration) — `SellersPage.ts`, `components/seller-create-dialog.ts`
- Admin can edit a seller — `SellersPage.ts`, `components/seller-edit-dialog.ts`
- Admin can delete a seller, außer sich selbst und außer dem letzten verbliebenen Admin (Lösch-Button per `canDelete`-Flag auf dem `SellerDto` ausgeblendet, serverseitig via `seller.last_admin`/`seller.self_delete_via_profile` erzwungen) — `SellersPage.ts`, `components/seller-edit-dialog.ts` (`onDeleteSeller()`, gleiches Flag/Endpoint, Danger-Button im Dialog-Footer), `GetSellersQueryHandler.cs`
- Admin sees seller type name, commission rate, item fee, article count per seller (flattened from nested `sellerType`) — `SellersPage.ts`
- User can set an initial password via an admin invite link (public route, token as query param) — `seller-management/set-password/pages/SetPasswordPage.ts`
- User sees distinct errors for expired/used invite token vs. weak password — `SetPasswordPage.ts`
- User is auto-logged-in and redirected to `/home` after setting the password — `SetPasswordPage.ts`

## Spans
- **Frontend:** `seller-management/sellers/pages/SellersPage.ts` + create/edit dialogs, `seller-management/sellers/sellers-api.service.ts`, `seller-management/set-password/pages/SetPasswordPage.ts`, `seller-management/set-password/data/set-password-api.service.ts`
- **Backend:** `BAR.Modules.SellerManagement.Contracts.ISellerManagementModuleApi` (`CreateSellerAsync`, `UpdateSellerAsync`, `DeleteSellerAsync`, `InviteSellerAsync`, `SetPasswordAsync`)

## Notes
- Set-Password ist hier statt als eigenes Profil aufgenommen, weil es fachlich die Fortsetzung des Admin-Invite-Flows ist (kein eigenes Epic gefunden — Doku-Lücke).
- Löschen eines Verkäufers löst kaskadierendes Löschen von dessen Artikeln/Nummernblöcken aus (`DeleteAllForSellerAsync`, best effort) — siehe `bar-modules-registration`.
