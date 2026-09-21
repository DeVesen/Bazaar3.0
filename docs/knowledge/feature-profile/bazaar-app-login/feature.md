# Login (Bazaar-App)

**Intent:** Einzige Möglichkeit, sich am operativen Basar-Betrieb (Haupt-App) anzumelden — kein Self-Service-Registrierung, Konten werden ausschließlich von Admins angelegt (siehe `bazaar-app-settings`).
**Coverage:** inventoried
**Last reviewed:** 2026-09-21

## Capabilities
- User enters Benutzername + Passwort with an eye-icon visibility toggle — `features/login/components/login-form/login-form.html`
- User submits via Enter or Button — `login-form.ts` `onSubmit()`
- User sees "Ungültige Anmeldedaten" specifically on 401 — `features/login/pages/login-page/login-page.ts` `onSubmit()`
- User sees a generic fallback error for any other failure ("Anmeldung derzeit nicht möglich…") — `login-page.ts`
- User is logged in and redirected to `/intake` on success — `login-page.ts` (`AuthService.login`, `router.navigateByUrl('/intake')`)
- User is redirected away from `/login` to `/intake` if already logged in — `frontend/src/app/core/auth/guest.guard.ts` (`guestGuard`)
- User is redirected away from `/login` to `/setup` if no admin exists yet — `frontend/src/app/core/bootstrap/no-admin.guard.ts` (shared with `bazaar-app-setup-wizard`)

## Spans
- **Frontend:** `features/login/pages/login-page/login-page.ts`, `features/login/components/login-form/login-form.{ts,html,scss}`, `core/auth/{guest.guard,auth.service}.ts`
- **Backend:** `Bazaar.Api/Features/Auth/AuthEndpoints.cs` (`POST /api/auth/login`, `AllowAnonymous`), `Bazaar.Application/Auth/LoginHandler.cs`

## Notes
- `LoginForm` ist eine reine Presentation-Komponente (`input`/`output`), `LoginPage` macht den HTTP-Call direkt selbst (kein dedizierter `LoginApi`-Service, ruft `HttpClient` inline auf) — abweichend vom `*Api`-Service-Muster, das andere Features (`BootstrapApi`, `SettingsApi`, `UsersApi`) benutzen.
- `mask`-Signal-Pattern (Passwort-Sichtbarkeits-Toggle über `p-iconfield`/`[(mask)]` von `pInputPassword`) ist hier der Ursprung — Setup-Wizard und Change-Password übernehmen dasselbe Muster.
