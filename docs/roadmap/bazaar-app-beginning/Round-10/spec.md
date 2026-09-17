---
round: Round-10
status: geklärt
---

# Spec: Round 10 — Login

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Login: Login-Seite, erzwungener und freiwilliger
Passwortwechsel, Backend-Endpoints, JWT-Ausstellung mit den Rollen Admin und
Kassenpersonal, Seed-Admin.

### Erweiterung gegenüber round.md (mit Nutzer abgestimmt, 2026-09-17)

`round.md` selbst nennt im Umfang nur die Login-Seite. Epic_Login AC-6 verlangt jedoch
erzwungenen Passwortwechsel bei `mustChangePassword`, und sowohl
[Round-7/spec.md](../Round-7/spec.md) als auch [Round-9/spec.md](../Round-9/spec.md)
haben `/change-password` und `passwordChangeGuard` bewusst ausgeklammert mit dem
Vermerk, sie gehörten „vermutlich zu einem späteren, hier nicht geplanten Round
(Epic_Login-Umfeld)". Kein nachfolgender Round (11–27) deckt das ab — echte Lücke, kein
Versehen der Vorgänger-Rounds.

**Entscheidung:** Round-10 schließt diese Lücke und nimmt zusätzlich auf:
- `/change-password`-Seite + `passwordChangeGuard` (erzwungener Wechsel).
- Freiwilligen Passwortwechsel über einen neuen Menüpunkt im Sidebar-Footer
  (Erweiterung über den Epic-Wortlaut hinaus, da kein Bedarf dafür dokumentiert war,
  aber vom Nutzer gewünscht).

### Fehlende Component-Docs

Epic_Login verweist auf `docs/components/login-form.md` und
`docs/components/change-password-page.md` — beide existieren nicht. Mit dem Nutzer
abgestimmt: Layout/Verhalten wird direkt hier in `spec.md` beschrieben, keine
nachträgliche `component.md` angelegt.

### Frontend

**Login-Seite** (`/login`, Stub-Route seit [Round-7](../Round-7/spec.md)):
- `LoginPage` → `LoginForm`-Component. Signal-basiertes Template-Form (`ngModel`, kein
  `FormGroup`) — Muster 1:1 aus der Referenz-App übernommen
  ([`login-form.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/features/login/components/login-form.ts)):
  `signal('')` für `username`/`password`, `signal(true)` für Passwort-Mask-Toggle.
- Felder: Benutzername (`p-iconfield` + User-Icon + `input pInputText`), Passwort
  (`p-iconfield` + Schloss-Icon + `input pInputPassword` + klickbarer Eye/Eye-Slash-Toggle
  rechts). Kein E-Mail-Feld — Anmeldung per Benutzername (Epic_Login Abschnitt 1).
- Statischer Hinweistext „Passwort vergessen? Wende dich an den Admin." — **kein** Link,
  **kein** Popover (abweichend von der Referenz-App, die hier einen Popover hat;
  Epic_Login AC-13 verlangt explizit kein Formular).
- Container `p-card`, einspaltig, `max-width: 360px`, zentriert. Enter im Passwortfeld
  löst Submit aus (AC-3, Standard-`form`-Submit-Verhalten).
- Submit → `AuthService.login(accessToken)` (Round-9) nach erfolgreichem
  `POST /api/auth/login`; bei `401` Fehlermeldung „Ungültige Anmeldedaten" unter dem
  Formular (kein Feld-Highlight, da nicht unterscheidbar welches Feld falsch war, AC-2).
- Bei Erfolg: Redirect zur Startseite (`/intake`, siehe [Round-7](../Round-7/spec.md)),
  unabhängig von der Rolle.

**Change-Password-Seite** (`/change-password`, neu):
- Felder: `currentPassword`, `newPassword`, `confirmPassword` (alle `pInputPassword` mit
  Eye-Toggle wie Login). `confirmPassword` ist reine Client-Prüfung
  (`newPassword === confirmPassword`, Submit-Button disabled bei Mismatch) — geht nicht an
  den Server.
- Submit → `PUT /api/auth/password` mit `{currentPassword, newPassword}`.
  - Response `200 { accessToken }` (Flag war gesetzt): `AuthService.login(accessToken)`
    erneut aufrufen (ersetzt Token, `mustChangePassword` jetzt `false`), Redirect zur
    Startseite.
  - Response `204` (Flag war nicht gesetzt, freiwilliger Wechsel): Erfolgsmeldung
    (Toast), Redirect zur Startseite.
  - Response `401`: Meldung „Aktuelles Passwort ist falsch" unter `currentPassword`.
  - Response `400`: Validierungsfehler aus `errors.newPassword` unter dem Feld anzeigen.
- Kein `p-card`/Standalone-Layout wie Login — läuft **innerhalb** der AppShell (im
  Gegensatz zu `/login`), da sowohl erzwungener als auch freiwilliger Aufruf einen
  bereits angemeldeten Benutzer voraussetzen.

**`passwordChangeGuard`** (`CanActivateFn`, `core/auth/password-change.guard.ts`):
- Liest `mustChangePassword`-Signal aus `AuthService` (seit Round-9 vorhanden, aber bisher
  nicht verdrahtet).
- `mustChangePassword() === true` und Zielroute ≠ `/change-password` →
  `router.createUrlTree(['/change-password'])`, sonst `true`.
- In `app.routes.ts` an dieselben Feature-Routen gehängt wie `authGuard`
  ([Round-7](../Round-7/spec.md)). `/change-password` selbst trägt **nur** `authGuard`,
  **nicht** `passwordChangeGuard` (sonst Redirect-Loop).

**Sidebar-Footer-Erweiterung** (Round-6/Round-9 Footer):
- Avatar/Name-Bereich im Footer wird klickbar, öffnet `p-popover` mit zwei Einträgen:
  „Passwort ändern" (`routerLink="/change-password"`) und „Abmelden".
- „Abmelden" ruft weiterhin `authService.logout()` auf (Round-9), wandert aber vom
  eigenständigen Footer-Button in dieses Popover-Menü — kleine Umstrukturierung des in
  Round-9 gebauten Footers, kein neuer Service.

### Backend

**Domain** (`Bazaar.Domain/User/`):
- `User`-Aggregate: `Id` (string, 8 Zeichen), `Username` (string, unique
  case-insensitive), `PasswordHash` (string), `Role` (Value Object: `Admin` | `Cashier`),
  `MustChangePassword` (bool, Default `false`).
- Invarianten: Username darf nicht leer sein; Rollenwechsel/Passwortänderung nur über
  definierte Methoden auf dem Aggregate (kein öffentlicher Setter).
- Ports in `Domain/Ports/`:
  - `IPasswordHasher` — `Hash(string plain) → string`, `Verify(string hash, string plain) → bool`.
  - `ITokenIssuer` — `IssueAccessToken(User user, DateTime nowUtc) → string`.
  - `IIdGenerator` — `Generate() → string`. **Neu, gilt ab sofort für alle Entitäten**
    (mit Nutzer abgestimmt, 2026-09-17): Round-10 ist der erste Round mit echter
    Persistenz und legt damit das ID-Generierungsmuster für die gesamte App fest.

**Infrastructure** (`Bazaar.Infrastructure/`):
- `AspNetPasswordHasher : IPasswordHasher` — dünner Wrapper um ASP.NET
  `PasswordHasher<User>` (Epic_Login Abschnitt 5 / AC-12: kein Klartext, keine
  reversible Verschlüsselung, kein BCrypt wie in der Referenz-App — bewusste
  Abweichung, bereits im Epic entschieden).
- `JwtTokenIssuer : ITokenIssuer` — Struktur wie
  [`JwtTokenIssuer.cs`](../../../../src/advance-registration/backend/BAR.Modules.SellerManagement/Infrastructure/Security/JwtTokenIssuer.cs)
  der Referenz-App, aber ohne Refresh-Token-Methode und mit den vier zusätzlichen
  Claims `sub`, `name`, `role`, `mustChangePassword`, `exp` (16h Lebensdauer). Literale
  Claim-Types (kein ASP.NET-URI-Mapping), damit `jwt-decoder.ts` (Round-9) sie ohne
  Umweg liest.
- `NanoIdGenerator : IIdGenerator` — Zufallsgenerator über ein Base62-Alphabet
  (`0-9A-Za-z`), 8 Zeichen. Kollisionsbehandlung: DB-Unique-Constraint auf `Id` +
  Retry beim Speichern (max. 3 Versuche, danach Exception — Kollisionswahrscheinlichkeit
  bei 8 Zeichen Base62 vernachlässigbar, Retry ist Absicherung, keine erwartete
  Normal-Situation).
- `SeedAdminHostedService : IHostedService` — läuft einmalig beim Start, legt bei leerer
  `Users`-Tabelle genau einen Admin aus `SEED_ADMIN_USER`/`SEED_ADMIN_PASSWORD` an,
  `MustChangePassword = true` (Epic_Login Abschnitt 4 / AC-5).

**Application** (`Bazaar.Application/Auth/`):
- `LoginHandler`: lädt `User` per `Username` (case-insensitive), `IPasswordHasher.Verify`;
  bei Fehlschlag (User nicht gefunden **oder** Passwort falsch — kein Unterschied nach
  außen) wirft er, der `IExceptionHandler` mappt auf `401`/`auth.invalid_credentials`
  (AC-2, kein Leak welcher Wert falsch war). Bei Erfolg `ITokenIssuer.IssueAccessToken`.
- `ChangePasswordHandler`: `IPasswordHasher.Verify(currentPassword)`, bei Fehlschlag
  `401`/`auth.invalid_credentials`. Bei Erfolg neues Passwort hashen, speichern; war
  `MustChangePassword` vorher `true`, wird es jetzt `false` gesetzt **und** ein neues
  Token zurückgegeben (`200`); war es bereits `false` (freiwilliger Wechsel), nur `204`.
- FluentValidation-Validatoren: `LoginCommandValidator` (Pflichtfelder),
  `ChangePasswordCommandValidator` (`newPassword` min. 8 Zeichen → `400` mit
  `errors.newPassword`).

**Api** (`Bazaar.Api/Features/Auth/`):
- `POST /api/auth/login` (`public`) — Request `{username, password}`, Response
  `200 {accessToken}` / `401`. DTOs exakt nach [`api/auth.md`](../../../requirements/bazaar-app/api/auth.md).
- `PUT /api/auth/password` (`authenticated`) — Request
  `{currentPassword, newPassword}`, Response `204` oder `200 {accessToken}` / `400` /
  `401`.
- Fehler laufen über den globalen `IExceptionHandler` aus
  [Round-2](../Round-2/spec.md)/BPROJ-S02 — Endpoint/Domäne werfen nur Exceptions, kein
  eigener Try-Catch-Code hier. `errorCode: auth.invalid_credentials` ist bereits im
  Katalog ([`cross-cutting.md`](../../../requirements/bazaar-app/api/cross-cutting.md)).

### Akzeptanzkriterien

Epic_Login AC-1 bis AC-13 vollständig (im Gegensatz zu Round-7/Round-9, die AC-6/AC-7
teilweise ausklammerten — Round-10 schließt genau diese Lücke, s. o.).

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- **Domain-UnitTests:** `User`-Invarianten (Rollenwerte, `MustChangePassword`-Übergänge).
- **Application-UnitTests:** `LoginHandler`/`ChangePasswordHandler` mit gemockten Ports
  (`IPasswordHasher`, `ITokenIssuer`, Repository).
- **Architecture-Tests:** Auth-Feature folgt derselben Schichten-Regel wie jedes
  fachliche Feature (kein Sonderfall, BPROJ-S06).
- **Frontend:** `LoginPage`, `ChangePasswordPage`, `passwordChangeGuard` — Vitest,
  Component-/Unit-Tests nach den bestehenden Projekt-Konventionen.

### Bewusst nicht in diesem Round

Benutzerverwaltung (Anlegen/Rolle ändern/Löschen weiterer Benutzer, → Round-27),
Brute-Force-Schutz, Refresh-Tokens/Blacklist, Selbstregistrierung, E-Mail-Reset,
Audit-Log (Epic_Login Abschnitt 6, bewusst kein MVP-Umfang).
