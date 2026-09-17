---
round: Round-10
status: geplant
---

# Plan: Round 10 — Login

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-2/plan.md](../Round-2/plan.md): Vier-Projekt-Schnitt, `DomainException`-
  Hierarchie (`NotFoundException`/`ConflictException`/`UnauthorizedException`/
  `ForbiddenException`), `DomainExceptionHandler`, JWT-Bearer bereits registriert
  (`AddAuthentication().AddJwtBearer()`, aber noch ohne konkrete `JwtOptions`-Bindung
  an echte Claims/Policies).
- [Round-3/plan.md](../Round-3/plan.md): `BazaarDbContext`
  (`Bazaar.Infrastructure/Persistence/`), `Configurations/`-Ordner für
  `IEntityTypeConfiguration<T>`, Migrations-Workflow (`dotnet ef migrations add
  <Name> --project Bazaar.Infrastructure --startup-project Bazaar.Api`), Repository-
  Konvention (ein Interface pro Aggregate in `Domain/Ports/`).
- [Round-6/plan.md](../Round-6/plan.md), [Round-9/plan.md](../Round-9/plan.md):
  `core/shell/sidebar/sidebar.ts` injiziert bereits `AuthService`/`RoleService`
  direkt (kein Input-Contract mehr), Footer mit Avatar/Username/Rolle/„Abmelden"
  (eigenständiger Button — wird in diesem Round zum Popover-Menü umgebaut).
  `core/auth/`: `TokenStore`, `JwtDecoder`/`DecodedToken` (bereits mit `mustChangePassword`-
  Feld im Interface, aber ungenutzt), `AuthService` (`login(accessToken)`,
  `mustChangePassword`-Computed bereits vorhanden), `RoleService`, `jwtInterceptor`,
  `authGuard`/`adminGuard` (echte Prüfung, kein Stub mehr).
- [Round-7/plan.md](../Round-7/plan.md): `features/login/login.routes.ts` +
  Platzhalter `LoginPage` (`<p>Login</p>`), `/login` außerhalb des `Shell`-Wrappers in
  `app.routes.ts`. Kein `/change-password`-Eintrag vorhanden.

## Implementationsplan

### Backend

#### 1. `Bazaar.Domain/User/`

`User.cs` (Aggregate Root, kein öffentlicher Setter):

```csharp
public sealed class User
{
    public string Id { get; private init; } = null!;
    public string Username { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public Role Role { get; private set; }
    public bool MustChangePassword { get; private set; }

    public static User Create(string id, string username, string passwordHash, Role role, bool mustChangePassword)
    {
        if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username required.");
        return new User { Id = id, Username = username, PasswordHash = passwordHash, Role = role, MustChangePassword = mustChangePassword };
    }

    public void ChangePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        MustChangePassword = false;
    }
}
```

`Role.cs` (Value Object, `enum Role { Admin, Cashier }` reicht hier — keine
Zusatzdaten je Rolle, kein Value-Object-Wrapper nötig, YAGNI).

#### 2. Ports (`Bazaar.Domain/Ports/`)

`IUserRepository.cs` (`Add`, `GetById`, `GetByUsername` case-insensitive, `Update`),
`IPasswordHasher.cs`, `ITokenIssuer.cs`, `IIdGenerator.cs` — Signaturen exakt wie
spec.md.

#### 3. Infrastructure — Persistence

`UserConfiguration.cs` in `Bazaar.Infrastructure/Persistence/Configurations/`:
`Id` als PK (`string`, `maxLength: 8`), Unique-Index auf `Username` mit
case-insensitiver Collation (`HasIndex(u => u.Username).IsUnique()` +
`.UseCollation("und-x-icu")` bzw. Postgres `citext`-Spaltentyp — Entscheidung:
**`citext`** für `Username`, da Postgres/Npgsql das nativ unterstützt und
`ExistsByUsername`-Abfragen dadurch automatisch case-insensitiv sind, ohne
`.ToLower()`-Vergleiche im Code zu streuen).

`UserRepository.cs` in `Bazaar.Infrastructure/Persistence/Repositories/`.

#### 4. Infrastructure — Security

```
dotnet add Bazaar.Infrastructure package Microsoft.AspNetCore.Identity
```

(nur für `PasswordHasher<T>` — kein volles Identity-Framework, keine `UserManager`.)

`AspNetPasswordHasher.cs`: `PasswordHasher<User>`-Wrapper, `Hash`/`Verify`.

`JwtOptions.cs` (Record: `Issuer`, `Audience`, `SigningKey`, `AccessTokenLifetime =
TimeSpan.FromHours(16)`), Bindung in `Program.cs` an `Jwt`-Konfigurationssektion
(Env-Vars `Jwt__Issuer` etc. — bereits als Muster in Round-2 für
`ConnectionStrings__DefaultConnection` etabliert).

`JwtTokenIssuer.cs`: `IssueAccessToken(User, DateTime nowUtc)`, Claims `sub`
(`user.Id`), `name` (`user.Username`), `role` (`"admin"`/`"cashier"`, lowercase —
matcht `jwt-decoder.ts`s `'admin' | 'cashier'`-Union), `mustChangePassword`
(`"true"`/`"false"` als String-Claim, `JwtDecoder` im Frontend parst via
`Boolean(claim)`/expliziten String-Vergleich — Festlegung: Claim-Wert ist der
JSON-Bool `true`/`false`, nicht String, damit `payload['mustChangePassword'] !==
'boolean'`-Check im Frontend (Round-9) ohne Anpassung durchläuft).

`NanoIdGenerator.cs`: Alphabet `"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"`
(62 Zeichen), `RandomNumberGenerator.GetInt32` je Zeichen, Länge 8.

`SeedAdminHostedService.cs` (`IHostedService`): `StartAsync` prüft
`await userRepository.AnyAsync()` (neue Repository-Methode `AnyAsync` ergänzen), bei
`false` liest `SEED_ADMIN_USER`/`SEED_ADMIN_PASSWORD` aus `IConfiguration`, wirft
`InvalidOperationException` falls eine der beiden fehlt (fail-fast statt stiller
Start ohne Zugang), legt `User` mit `MustChangePassword = true` an. Registrierung:
`builder.Services.AddHostedService<SeedAdminHostedService>();` — läuft **nach** der
Migrations-Anwendung aus Round-3 (Hosted Services starten nach `app.Run()`-Vorlauf,
Migrations laufen explizit vorher in `Program.cs`, Reihenfolge bereits durch
Round-3s Platzierung vor `app.Run()` sichergestellt).

#### 5. Application (`Bazaar.Application/Auth/`)

`LoginCommand.cs`/`LoginCommandValidator.cs`/`LoginHandler.cs`,
`ChangePasswordCommand.cs`/`ChangePasswordCommandValidator.cs`/
`ChangePasswordHandler.cs` — Logik exakt wie spec.md. `LoginHandler` wirft bei
Nichtfinden **und** bei Passwortfehler dieselbe `UnauthorizedException("Ungültige
Anmeldedaten", "auth.invalid_credentials")` — ein einziger Wurf-Pfad, kein
`if/else` mit zwei Exception-Instanzen an unterschiedlichen Stellen (AC-2, kein Leak
über z. B. unterschiedliche Fehlermeldungen im Code-Review).

#### 6. Api (`Bazaar.Api/Features/Auth/`)

`AuthEndpoints.cs`: `MapPost("/api/auth/login", ...).AllowAnonymous()`,
`MapPut("/api/auth/password", ...).RequireAuthorization()`. DTOs
(`LoginRequest`/`LoginResponse`/`ChangePasswordRequest`) in
`Bazaar.Api/Features/Auth/Dtos.cs`. `ChangePasswordHandler`-Aufruf liest
`User.Id` aus `HttpContext.User` (`ClaimTypes`-freier Zugriff über den literalen
`"sub"`-Claim, s. Round-9-Interceptor-Konvention).

Registrierung `AddAuthorization()` mit Policy `"admin"` (`RequireClaim("role",
"admin")`) — **erstmals real**, ersetzt die in Round-2 noch fehlende Policy;
`RequireAuthorization("admin")` künftig für alle admin-only-Endpoints ab diesem Round.

### Frontend

#### 7. `LoginForm`-Component

`features/login/components/login-form/login-form.ts` — Struktur 1:1 wie in
spec.md/Referenz-App beschrieben (`signal('')`/`signal(true)`, `ngModel`,
`p-iconfield` + `pInputPassword`). `LoginPage` (ersetzt Round-7-Platzhalter)
orchestriert: injiziert `HttpClient`/`AuthService`/`Router`, `onSubmit()` →
`POST /api/auth/login`, bei Erfolg `authService.login(token)` +
`router.navigateByUrl('/intake')`, bei `401` `errorMessage.set('Ungültige
Anmeldedaten')`.

#### 8. `ChangePasswordPage`

`features/change-password/pages/change-password-page/` (eigenes Feature, da nicht
Teil von `login` — läuft innerhalb der AppShell). `change-password.routes.ts`, in
`app.routes.ts` **innerhalb** des `Shell`-Kinder-Arrays ergänzt (`canActivate:
[authGuard]`, kein `passwordChangeGuard` an dieser Route selbst).

Formular: drei `pInputPassword`-Felder + Eye-Toggle (gleiche Struktur wie
`LoginForm`), `confirmPassword`-Client-Check via `computed(() => new() ===
confirm())`, Submit-Button `disabled` bei Mismatch oder leeren Pflichtfeldern.
`onSubmit()` → `PUT /api/auth/password`; Response-Handling exakt nach spec.md
(`200` → `authService.login(newToken)` + Redirect, `204` → Toast + Redirect, `401`/
`400` → Feldfehler).

#### 9. `passwordChangeGuard`

`core/auth/password-change.guard.ts`:

```typescript
export const passwordChangeGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.mustChangePassword() && state.url !== '/change-password') {
    return router.createUrlTree(['/change-password']);
  }
  return true;
};
```

`app.routes.ts`: an alle zehn Fach-Routen aus Round-7 zusätzlich zu `authGuard`
gehängt (`canActivate: [authGuard, passwordChangeGuard]`), `/change-password`
selbst behält nur `[authGuard]`.

#### 10. Sidebar-Footer-Popover

`core/shell/sidebar/sidebar.ts`/`.html` (Round-6/9): Avatar/Name-Bereich erhält
Klick-Handler `(click)="footerMenu.toggle($event)"`, `p-popover #footerMenu` mit
zwei `p-button [text]="true"`-Zeilen: „Passwort ändern" (`routerLink="/change-
password"`) und „Abmelden" (`(click)="logout()"`, bestehende Methode aus Round-9
unverändert). Der bisherige eigenständige „Abmelden"-Button im Footer entfällt.

### 11. Verifikation

- `dotnet test` — Domain-/Application-UnitTests aus spec.md „Tests"-Abschnitt.
- Backend-Start ohne existierende Users, `SEED_ADMIN_USER=admin`/
  `SEED_ADMIN_PASSWORD=…` gesetzt → `SELECT * FROM "Users"` zeigt genau einen
  Eintrag, `MustChangePassword=true`.
- `POST /api/auth/login` mit Seed-Zugangsdaten → `200 {accessToken}`, JWT-Payload
  (jwt.io oder `curl` + manuelles Base64-Decode) enthält `mustChangePassword: true`.
- Frontend `ng serve`: Login mit Seed-Admin → Redirect landet auf
  `/change-password` (nicht `/intake`) wegen `passwordChangeGuard`. Passwort ändern
  → Redirect `/intake`, erneuter Login → kein Zwang mehr.
- Login mit falschem Passwort → „Ungültige Anmeldedaten" unter dem Formular, kein
  Feld hervorgehoben.
- Footer-Popover: „Passwort ändern" öffnet `/change-password` auch **ohne**
  `mustChangePassword` (freiwilliger Wechsel), Response `204` → Toast, kein neues
  Token nötig (Session bleibt mit altem, weiterhin gültigem Token bestehen).
- `ng lint` — `core/auth/` weiterhin ohne Feature-Importe (Round-9-Regel
  unverändert gültig).

## Reihenfolge

Backend 1 → 2 → 3 → 4 → 5 → 6 sequenziell (Domain vor Infrastructure vor
Application vor Api). Frontend 7 unabhängig von Backend startbar (gegen die
API-Contracts aus spec.md), 8 nach 7 (teilt Formular-Muster), 9 nach 8 (braucht die
Zielroute), 10 zuletzt (hängt an nichts Neuem, nur Umbau des bestehenden Footers).
11 abschließend nach Backend + Frontend.
