# Bootstrap-Admin

**Intent:** Solange kein Administrator-Konto existiert, kann sich die erste Administratorin bzw. der erste Administrator selbst mit eigenem Namen und eigener E-Mail anlegen — Voraussetzung dafür, dass das System überhaupt administrierbar wird, ohne fest verdrahteten Seed-Account.
**Coverage:** inventoried
**Last reviewed:** 2026-09-15

## Capabilities
- User is redirected from `/login` or `/register` to `/bootstrap-admin` when no admin exists yet — `src/advance-registration/frontend/BAR.App/src/app/core/bootstrap/no-admin.guard.ts`
- User can create the first admin with own name/email via the same form as self-registration — `features/bootstrap-admin/pages/BootstrapAdminPage.ts` (reuses `shared/registration-form/registration-form.ts`)
- User is logged in immediately after creating the first admin, no separate login step — `BootstrapAdminPage.ts`
- User sees "email already taken" distinctly — `BootstrapAdminPage.ts` (`seller.email_taken`)
- User sees a generic, i18n-translated fallback error for other failures — `BootstrapAdminPage.ts` (`bootstrapAdmin.genericError`)
- User is redirected away from `/bootstrap-admin` to `/login` once an admin already exists — `core/bootstrap/admin-exists.guard.ts` (permanent lock, not just unlinked)

## Spans
- **Frontend:** `features/bootstrap-admin/pages/BootstrapAdminPage.ts`, `features/bootstrap-admin/bootstrap-admin.routes.ts`, `core/bootstrap/{no-admin.guard,admin-exists.guard,bootstrap-status.service}.ts`
- **Backend:** `BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin.{BootstrapAdminCommandHandler,AdminBootstrapState}`, exposed via `ISellerManagementModuleApi.BootstrapAdminAsync`/`HasAdminAsync`, `POST /api/auth/bootstrap-admin`, `GET /api/public/bootstrap-status`

## Notes
- `AdminBootstrapState` wird einmal beim Prozessstart berechnet (`ISellerRepository.CountAdminsAsync`), nie pro Request neu — flippt nur einmalig `false`→`true` nach erfolgreicher Anlage, nie zurück. Bewusster Trade-off (F1-Entscheidung), siehe [`docs/superpowers/plans/2026-09-15-bootstrap-admin.md`](../../../superpowers/plans/2026-09-15-bootstrap-admin.md).
- Ersetzt den vorherigen fest verdrahteten Migrations-Seed (`admin@bazaar.local`/`Admin123!`) — kein Seed mehr in irgendeiner Umgebung, siehe `login`-Feature-Profil (Demo-Hinweis entfernt).
- Der Bootstrap-Admin bekommt denselben Platzhalter-Verkäufertyp (`t0000001`) wie zuvor der Seed-Admin — ein Admin hat keinen kommerziellen Verkäufertyp.
- `BootstrapAdminCommandHandler` prüft zusätzlich zum In-Memory-Flag direkt vor dem Insert per `CountAdminsAsync` gegen die echte Datenbank (schützt vor zwei gleichzeitigen Bootstrap-Requests bzw. mehreren Replikas).
