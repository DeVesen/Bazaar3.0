# Registrierung

**Intent:** Neuer Verkäufer registriert sich selbstständig (Self-Service) für die Voranmelde-App, ohne dass ein Admin ihn zuerst anlegen muss. Kernstück der "Voranmelde"-Idee der App.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- User can self-register as a new seller — `src/advance-registration/frontend/BAR.App/src/app/features/seller-management/register/pages/RegisterPage.ts`
- User is logged in immediately after successful registration, no separate login step — `RegisterPage.ts`
- User sees "email already taken" distinctly from other errors — `RegisterPage.ts` (`seller.email_taken`)
- User sees "registration not enabled" distinctly (registration window closed) — `RegisterPage.ts` (`registration.not_enabled`)
- User sees a generic fallback error for network/500/unknown error codes — `RegisterPage.ts`

## Spans
- **Frontend:** `seller-management/register/pages/RegisterPage.ts`, `shared/registration-form/registration-form.ts`
- **Backend:** `BAR.Modules.SellerManagement.Contracts.ISellerManagementModuleApi.RegisterAsync` — allocates initial number blocks via `IRegistrationModuleApi.AllocateInitialBlocksAsync`

## Notes
- Code-Kommentar zitiert "Epic_Login section 6 flow 1-4, AC-8/AC-9/AC-10/AC-11".
- Bei Registrierung werden automatisch initiale Nummernblöcke zugeteilt (siehe `bar-modules-registration` Modul-Profil, `AllocateInitialBlocksAsync`).
- `registration-form.ts` liegt seit dem `bootstrap-admin`-Feature unter `shared/` statt im eigenen Feature-Ordner — die `bootstrap-admin`-Seite nutzt dieselbe Formular-Komponente unverändert mit, statt sie zu kopieren.
