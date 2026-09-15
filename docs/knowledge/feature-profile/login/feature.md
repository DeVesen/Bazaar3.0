# Login

**Intent:** Verkäufer meldet sich mit E-Mail/Passwort an, um Zugriff auf die Voranmelde-App zu erhalten. Grundvoraussetzung für jede weitere Interaktion mit dem System.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15 (Demo-Hinweis entfernt — kein Demo-Account mehr, siehe `bootstrap-admin` Feature-Profil)

## Capabilities
- User can login with email and password — `src/advance-registration/frontend/BAR.App/src/app/features/login/pages/LoginPage.ts`
- User sees error message on invalid credentials — `LoginPage.ts`
- User sees an info panel with public bazaar info (dates, info text) once loaded — `LoginPage.ts` (`PublicInfoService`)
- User is redirected to the originally targeted deep link after login, not just `/home` — `LoginPage.ts` (`returnUrl` query param, set by `core/auth/auth.guard.ts`)

## Spans
- **Frontend:** `login/pages/LoginPage.ts`, `login/components/{login-form,login-info-panel,login-layout}.ts` — form + layout composition
- **Backend:** `BAR.Modules.SellerManagement.Contracts.ISellerManagementModuleApi.LoginAsync` — issues JWT token pair

## Notes
- Code-Kommentar zitiert "Epic_Login section 4, AC-1/AC-2/AC-3" für den Login-Flow.
- Registrierung (Sign-up) ist als eigenes Feature-Profil erfasst (`registrierung`), obwohl derselbe Epic (`Epic_Login`) beide Abschnitte (4 und 6) beschreibt.
