# Setup-Wizard (Bazaar-App)

**Intent:** Erlaubt die Erstinbetriebnahme der Haupt-App, ohne fest verdrahteten Seed-Account — solange keine Datenbank-Admin existiert, kann die erste Person sich selbst als Admin anlegen und dabei gleich die Basis-Stammdaten (Händlertypen, optional Marken/Kategorien) hinterlegen, bevor der Basar-Betrieb beginnt.
**Coverage:** inventoried
**Last reviewed:** 2026-09-21

## Capabilities
- User is redirected from `/setup` to `/login` once an admin already exists — `frontend/src/app/core/bootstrap/admin-exists.guard.ts` (`adminExistsGuard`, permanent lock)
- User is redirected from `/login` and from the Shell's root routes to `/setup` when no admin exists yet — `frontend/src/app/core/bootstrap/no-admin.guard.ts` (`noAdminGuard`), wired on `/login` and on the `Shell`-Route in `app.routes.ts`
- User steps through a 3-step linear `p-stepper` ("Admin-Konto" → "Händlertypen" → "Marken & Kategorien") — `frontend/src/app/features/setup/pages/setup-page/setup-page.html`
- User enters Benutzername/Passwort/Passwort-Bestätigung with a per-field eye-icon visibility toggle (`p-iconfield`/`p-inputicon`, `[(mask)]`) — `setup-page.html` step 1
- User cannot advance from step 1 until username is non-empty, password ≥8 Zeichen and matches confirmation — `setup-page.ts` `canSubmitAdmin`
- User adds Händlertypen one at a time (Name/Provision %/Gebühr €, in einer Zeile mit p-inputgroup-addon) purely client-side, no request per Typ — `setup-page.ts` `addSellerType()`, `setup-page.html` step 2
- User sees a local error when adding a duplicate seller-type name (case-insensitive) — `setup-page.ts` `sellerTypeError`
- User cannot proceed past step 2 with zero seller types — `setup-page.ts` `canProceedPastSellerTypes`
- User enters Marken and Kategorien as one-name-per-line text areas (`pTextarea`), optional — `setup-page.html` step 3
- User completes the whole setup with a single "Setup abschließen" click — everything collected across all three steps (admin credentials, seller types, brand/category lines) is submitted in one `POST /api/public/setup-complete` call, not persisted before that — `setup-page.ts` `finish()`
- User sees a conflict message with a "Zum Login"-Link when setup was already completed by someone else in the meantime (409) — `setup-page.ts` `finish()` error handler, `setupAlreadyDone`
- User is sent to `/login` on successful completion (no auto-login) — `setup-page.ts` `finish()` → `router.navigateByUrl('/login')`
- User can navigate back through the wizard at any step ("Zurück") without side effects — nothing is persisted before "Setup abschließen", so back-navigation is always safe

## Spans
- **Frontend:** `features/setup/pages/setup-page/setup-page.{ts,html,scss}`, `features/setup/data/bootstrap-api.ts` (`BootstrapApi.completeSetup`/`bootstrapAdmin`), `core/bootstrap/{no-admin.guard,admin-exists.guard,bootstrap-status.service}.ts`
- **Backend:** `Bazaar.Api/Features/Public/BootstrapEndpoints.cs` (`POST /api/public/setup-complete`, `POST /api/public/bootstrap-admin`, `GET /api/public/bootstrap-status`), `Bazaar.Application/Auth/CompleteSetupHandler.cs` (+ `CompleteSetupCommand`/`Validator`), `Bazaar.Application/Auth/{BootstrapAdminHandler,AdminBootstrapState}.cs`, reuses `CreateSellerTypeHandler`/`CreateBrandHandler`/`CreateCategoryHandler` inside one `IUnitOfWork` transaction

## Notes
- `setup-complete` ersetzt ein älteres Design, das pro Wizard-Schritt sofort persistierte (Admin sofort angelegt, jeder Händlertyp/jede Marke einzeln per Request) — das brach die "Zurück"-Buttons, weil z. B. das Admin-Konto beim Zurückgehen zu Schritt 1 schon existierte. `bootstrap-admin` (Einzel-Endpoint) bleibt im Code bestehen, wird vom Wizard aber nicht mehr aufgerufen.
- `CompleteSetupHandler` läuft in einer Transaktion (`IUnitOfWork.ExecuteInTransactionAsync`) — Admin, Händlertypen, Marken, Kategorien werden alle oder keins angelegt.
- Guard-Namen sind gegenläufig zur Intuition: `adminExistsGuard` sperrt `/setup` (aktiv wenn Admin **existiert**), `noAdminGuard` sperrt `/login`+App-Root (aktiv wenn **kein** Admin existiert) — beide gegen denselben `bootstrap-status`-Endpoint.
- Bekannter PrimeNG-Fallstrick: `p-inputNumber` mit `ngModel` bricht (`NG01203`) sobald es innerhalb einer dynamisch erzeugten View liegt (`*ngTemplateOutlet`, `@if`, sogar eigene Kind-Komponenten) — `p-step-panel` rendert seinen Inhalt genau so. Deshalb nutzt Schritt 2 native `<input type="number" pInputText>` statt `p-inputNumber`.
- Ebenfalls gefunden: PrimeNG `p-motion` (genutzt von `p-step-panel`) setzt beim ersten Rendern `display:none` und setzt es nicht zuverlässig zurück — global mit `.p-steppanel .p-motion { display: grid !important; }` in `frontend/src/styles.scss` übersteuert.
