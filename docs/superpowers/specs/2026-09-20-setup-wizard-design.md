# Setup-Wizard statt Env-Var-Admin-Seed (Bazaar-App)

Status: entworfen, wartet auf Review
Datum: 2026-09-20
Betroffene App: Haupt-App (`src/bazaar-app/`)

## Ausgangslage

Der erste Admin-User der Bazaar-App wird aktuell über `SeedAdminHostedService`
(`Bazaar.Infrastructure/Security/SeedAdminHostedService.cs`) beim Backend-Start aus den
Umgebungsvariablen `SEED_ADMIN_USER`/`SEED_ADMIN_PASSWORD` erzeugt. Fehlen diese Variablen,
startet die App gar nicht (Fail-fast via `InvalidOperationException`).

Das soll ersetzt werden durch den Setup-Flow, den die Voranmelde-App bereits produktiv hat:
Ist die Datenbank leer (kein User vorhanden), leitet die App den Anwender beim Aufruf auf eine
Setup-Page um. Dort legt er den ersten Admin selbst an, definiert die ersten Händlertypen
(Pflicht) und kann optional erste Marken/Kategorien anlegen.

## Vorbild: Voranmelde-App Bootstrap-Flow

Referenz-Implementierung, 1:1 als Pattern zu übernehmen:

- `BAR.Modules.SellerManagement/Application/Auth/BootstrapAdmin/BootstrapAdminCommandHandler.cs`
  — Doppel-Check gegen Race Conditions: schneller In-Memory-Check über
  `AdminBootstrapState.HasAdmin`, danach DB-Recheck via `sellers.CountAdminsAsync()`. Wirft
  `ConflictException("bootstrap.already_done", …)`, falls zwischenzeitlich doch ein Admin
  angelegt wurde.
- `AdminBootstrapState.cs` — Singleton, einmalig beim Start berechnet, danach nur noch per
  `MarkAdminCreated()` verändert. Kein Re-Query pro Request.
- `BAR.Host/Program.cs` (`InitializeAdminBootstrapStateAsync`) — Initialisierung nach den
  Migrationen, vor dem ersten Request.
- `BAR.Host/Features/Public/BootstrapStatusEndpoints.cs` — `GET /api/public/bootstrap-status`,
  anonym erreichbar, liefert `{ hasAdmin: bool }` aus dem gecachten State.
- `AuthEndpoints.cs` — `POST /api/auth/bootstrap-admin`, gibt bei Erfolg ein Token-Paar zurück
  (Auto-Login direkt nach dem Bootstrap).
- Frontend: `core/bootstrap/bootstrap-status.service.ts`, `no-admin.guard.ts` (auf `login`/
  `register`, leitet ohne Admin auf `/bootstrap-admin` um), `admin-exists.guard.ts` (auf
  `bootstrap-admin` selbst, sperrt die Route dauerhaft sobald ein Admin existiert), eigenes
  Feature `features/bootstrap-admin/`.

## Ist-Stand Bazaar-App (Wiederverwendbares)

- `User`-Domain (`Bazaar.Domain/User/User.cs`) hat bereits `Create`, `ChangeRole`,
  `ResetPassword`, `ChangePassword`.
- `IUserRepository.AnyAsync()` existiert bereits (aktuell nur von `SeedAdminHostedService`
  genutzt) — direkt wiederverwendbar für den Bootstrap-Status-Check.
- `SellerType` (`Bazaar.Domain/SellerType/SellerType.cs`): `Id`, `Name`, `CommissionRate`
  (0–100), `ItemFee` (≥0). Application-Handler und `POST /api/seller-types` existieren bereits,
  admin-geschützt.
- `Brand`/`Category` (`Bazaar.Domain/Brand/Brand.cs`, `.../Category/Category.cs`): `Id`, `Name`,
  `Original`-Flag. Application-Handler und `POST /api/brands`, `POST /api/categories`
  existieren bereits, admin-geschützt.

## Design

### Backend

1. `SeedAdminHostedService` vollständig entfernen (Klasse + Registrierung in
   `Bazaar.Api/Program.cs`). `SEED_ADMIN_USER`/`SEED_ADMIN_PASSWORD` fallen aus Doku, Compose-
   Dateien und `launchSettings.json` weg, wo sie zu diesem Zweck stehen.
2. Neu, `Bazaar.Application`/`Bazaar.Infrastructure` (Namen/Ordner analog zur Voranmelde-App
   anpassen an Bazaar-App-Konventionen):
   - `AdminBootstrapState` — Singleton mit `HasAdmin` (bool) und `MarkAdminCreated()`.
   - Initialisierung in `Bazaar.Api/Program.cs` nach den Migrationen, vor dem ersten Request,
     via `userRepository.AnyAsync()`.
   - `BootstrapAdminCommand`/`BootstrapAdminHandler` — Doppel-Check (In-Memory + erneutes
     `AnyAsync()`), legt `User` mit `Role.Admin` an (`mustChangePassword: false`, da der
     Anwender das Passwort ja gerade selbst frei gewählt hat), gibt Access-/Refresh-Token
     zurück, ruft `MarkAdminCreated()`.
3. Neue Api-Endpoints (`Bazaar.Api/Features/Public/` oder passender Ort nach bestehender
   Feature-Struktur), beide anonym erreichbar:
   - `GET /api/public/bootstrap-status` → `{ hasAdmin: bool }`.
   - `POST /api/public/bootstrap-admin` → Body `{ username, password }` → Token-Paar oder
     Conflict (409), falls bereits ein Admin existiert.
4. Keine weiteren neuen Endpoints: Händlertypen/Marken/Kategorien werden im Setup-Wizard über
   die bestehenden admin-geschützten Endpoints angelegt, authentifiziert mit dem Token aus
   Schritt 3.

### Frontend

1. `core/bootstrap/`:
   - `bootstrap-status.service.ts` — ruft `/api/public/bootstrap-status` ab.
   - `no-admin.guard.ts` — auf `login` und alle Shell-Routes angewendet; ohne Admin Redirect
     nach `/setup`.
   - `admin-exists.guard.ts` — auf `setup` selbst angewendet; sobald ein Admin existiert,
     Redirect nach `/login` (Route danach dauerhaft gesperrt).
2. Neues Feature `features/setup/` mit PrimeNG Stepper, drei Schritte:
   - **Schritt 1 — Admin:** Formular Username + Passwort (+ Bestätigung). Submit ruft
     `bootstrap-admin` auf, speichert das zurückgegebene Token im Auth-State (Auto-Login),
     schaltet zu Schritt 2 weiter.
   - **Schritt 2 — Händlertypen (Pflicht):** Formular/Liste zum Anlegen von Händlertypen (Name,
     Provision, Artikelgebühr), mindestens ein Eintrag erforderlich um weiterzukommen, beliebig
     viele möglich. Persistiert über das bestehende `POST /api/seller-types` (jetzt
     authentifiziert über das Token aus Schritt 1).
   - **Schritt 3 — Marken/Kategorien (optional):** Analoge Listen für Marken und Kategorien,
     über `POST /api/brands`/`POST /api/categories`. Überspringen möglich.
   - **Abschluss:** Auth-State/Token verwerfen (Logout), `window.location.reload()` — App startet
     neu, Guards leiten auf `/login`, Anwender meldet sich frisch mit dem gerade angelegten
     Admin-Konto an.
3. `app.routes.ts`: Route `setup` (Guard `adminExistsGuard`), `login` + alle bestehenden
   Shell-Routes zusätzlich mit `noAdminGuard` versehen.

### Fehlerbehandlung

- `bootstrap-admin` bei bereits existierendem Admin → 409 Conflict, Frontend zeigt Fehler und
  leitet (via Guard beim nächsten Navigationsversuch ohnehin) auf `/login` um.
- Schritt 2/3 Requests scheitern (z. B. Netzwerkfehler) → Fehleranzeige im jeweiligen Schritt,
  kein automatisches Zurückspringen zu Schritt 1 (Admin ist bereits angelegt und eingeloggt).

### Tests

- Backend: Unit-Tests `BootstrapAdminHandler` (Erfolg, Conflict bei Race), Endpoint-Tests
  (`bootstrap-status` liefert korrekten Wert, `bootstrap-admin` anonym erreichbar, zweiter
  Aufruf liefert 409).
- Frontend: Guard-Specs (`no-admin.guard.spec.ts`, `admin-exists.guard.spec.ts`), Component-Specs
  für den Setup-Wizard (Stepper-Navigation, Pflicht-Validierung Schritt 2, Skip in Schritt 3).

## Out of Scope

- Keine Änderung an bestehenden `SellerType`/`Brand`/`Category`-Endpoints oder deren
  Berechtigungen — sie bleiben admin-geschützt, der Setup-Wizard nutzt sie nur als
  authentifizierter Erstbenutzer.
- Kein Mehrfach-Admin-Bootstrap, kein "Setup später fortsetzen" — der Wizard läuft in einem
  Durchgang; bricht der Anwender ab, bleibt der Admin angelegt und er kann sich direkt
  einloggen, um Händlertypen/Marken/Kategorien regulär über die bestehenden Verwaltungsseiten
  nachzupflegen.
