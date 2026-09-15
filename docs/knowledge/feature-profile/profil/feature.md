# Profil

**Intent:** Verkäufer verwaltet die eigenen Stammdaten, E-Mail und Passwort selbst, ohne einen Admin einschalten zu müssen.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- Seller can edit own address data (first/last name, address, postal code, city, phone) — `src/advance-registration/frontend/BAR.App/src/app/features/seller-management/profile/pages/ProfilePage.ts`
- Seller can change own email (requires current password) — `ProfilePage.ts`
- Seller sees distinct errors: wrong current password (401), email already taken (409), invalid format (400) — `ProfilePage.ts`
- Seller can change own password (requires current password + confirmation + minimum strength "medium") — `ProfilePage.ts`
- Seller is re-authenticated (new tokens) immediately after a successful password change — `ProfilePage.ts`
- Seller can delete own account, with a confirmation naming the cascade (articles + number blocks also deleted) — `ProfilePage.ts`
- Admin cannot delete own account — Delete tab shows a hint text instead of the delete action — `ProfilePage.html`
- User sees own seller number — `ProfilePage.ts` (`SellerNumber` component)

## Spans
- **Frontend:** `seller-management/profile/pages/ProfilePage.ts` + `.html`, `seller-management/profile/profile-api.service.ts`, shared `@shared/password-strength-meter`
- **Backend:** `BAR.Modules.SellerManagement.Contracts.ISellerManagementModuleApi` (`GetProfileAsync`, `UpdateProfileAsync`, `ChangeEmailAsync`, `ChangePasswordAsync`, `DeleteProfileAsync`)
