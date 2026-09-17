---
round: Round-9
status: geplant
---

# Plan: Round 9 — Auth-Infrastruktur (JWT)

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-1/plan.md](../Round-1/plan.md): ESLint-Boundaries (`core/` importiert nie aus
  `features/`) — relevant für AC-9, das exakt diese bestehende Regel für `core/auth/`
  einfordert; kein neuer ESLint-Code nötig, nur Einhaltung prüfen.
- [Round-6/plan.md](../Round-6/plan.md): `Sidebar`-Komponente mit `input.required<Role>()`
  (`role`), `input.required<string>()` (`username`, `roleLabel`), `output<void>()`
  (`logoutClicked`) — **wird in Round-9 refaktoriert**: Statt der Inputs injiziert die
  Sidebar künftig `AuthService`/`RoleService` direkt (die in Round-6/plan.md
  vorgemerkte Musterentscheidung, dort noch nicht umsetzbar mangels existierender
  Services). `logoutClicked.emit()` entfällt zugunsten eines direkten
  `authService.logout()`-Aufrufs im Klick-Handler.
- [Round-7/plan.md](../Round-7/plan.md): Stub-Guards `authGuard`/`adminGuard`
  (`() => true`) in `core/auth/auth.guard.ts`/`admin.guard.ts`, bereits in
  `app.routes.ts` an den richtigen Routen registriert (`canActivate: [authGuard]` bzw.
  `[authGuard, adminGuard]` an `/settings`). `Shell`-Komponente mit hartcodierten
  Platzhalter-Signals `currentRole()`/`currentUsername()`/`currentRoleLabel()` und
  No-Op-`onLogout()` — **werden in Round-9 entfernt**, die Sidebar bezieht ihre Werte
  dann direkt aus `AuthService`/`RoleService`.

## Implementationsplan

### 1. `TokenStore`

`core/auth/token-store.ts`, reduziert gegenüber der Referenz (nur ein Key):

```typescript
const TOKEN_KEY = 'bazaar_token';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
  setToken(token: string): void { localStorage.setItem(TOKEN_KEY, token); }
  clear(): void { localStorage.removeItem(TOKEN_KEY); }
}
```

AC-1: „ausschließlich `TokenStore` SHALL auf `localStorage` zugreifen" — kein anderer
Baustein darf `localStorage` direkt ansprechen (Nachweis über Code-Review/Grep in
Schritt 7).

### 2. `JwtDecoder`

`core/auth/jwt-decoder.ts`, `decodeBase64UrlToUtf8` 1:1 aus
[Referenz](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt-decoder.ts)
Zeilen 8–15 übernommen, `DecodedToken` erweitert:

```typescript
export interface DecodedToken {
  sub: string;
  name: string;
  role: 'admin' | 'cashier';
  mustChangePassword: boolean;
  exp: number;
}

export function decodeJwt(token: string): DecodedToken | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(decodeBase64UrlToUtf8(parts[1])) as Record<string, unknown>;
    if (
      typeof payload['sub'] !== 'string' ||
      typeof payload['name'] !== 'string' ||
      (payload['role'] !== 'admin' && payload['role'] !== 'cashier') ||
      typeof payload['mustChangePassword'] !== 'boolean' ||
      typeof payload['exp'] !== 'number'
    ) return null;
    return payload as unknown as DecodedToken;
  } catch {
    return null;
  }
}
```

### 3. `AuthService`

`core/auth/auth.service.ts`, Grundstruktur aus
[Referenz](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.service.ts),
ohne Refresh-Token, ohne `registerLogoutReset`, mit aktivem Verwerfen eines abgelaufenen
Tokens beim Start (AC-3 — die Referenz prüft `exp` nur reaktiv in `isLoggedIn`, verwirft
den Token beim Start aber nicht aktiv aus dem `localStorage`; BSHELL-S05 verlangt genau
das):

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStore = inject(TokenStore);

  readonly currentUser = signal<DecodedToken | null>(this.loadValidStoredToken());

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);
  readonly mustChangePassword = computed(() => this.currentUser()?.mustChangePassword ?? false);

  login(accessToken: string): void {
    this.tokenStore.setToken(accessToken);
    this.currentUser.set(decodeJwt(accessToken));
  }

  logout(): void {
    this.tokenStore.clear();
    this.currentUser.set(null);
  }

  private loadValidStoredToken(): DecodedToken | null {
    const token = this.tokenStore.getToken();
    if (!token) return null;
    const decoded = decodeJwt(token);
    if (!decoded || decoded.exp * 1000 <= Date.now()) {
      this.tokenStore.clear();
      return null;
    }
    return decoded;
  }
}
```

`logout()` navigiert hier **nicht** selbst (anders als Referenz) — das übernimmt der
Aufrufer (Sidebar-Klick-Handler, Interceptor), damit `AuthService` keine `Router`-
Abhängigkeit braucht und in Unit-Tests ohne Router-Setup testbar bleibt.

**AC-3 „vor dem ersten Routenrendern":** `AuthService` wird als `providedIn: 'root'`
lazy instanziiert — der erste Zugriff kommt entweder durch `authGuard` (Schritt 6) oder
die `Shell`/`Sidebar`, beide laufen vor dem eigentlichen Seiteninhalt. Ergänzend
`provideAppInitializer(() => { inject(AuthService); })` in `app.config.ts`, damit die
Prüfung garantiert vor der ersten Navigation läuft, unabhängig davon, ob ein Guard
greift.

### 4. `RoleService`

Deutlich schlanker als die Referenz (kein Toggle):

```typescript
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly authService = inject(AuthService);
  readonly isAdmin = computed(() => this.authService.role() === 'admin');
}
```

### 5. `jwtInterceptor`

`core/auth/jwt.interceptor.ts`, Allowlist-Struktur aus
[Referenz](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt.interceptor.ts)
Zeilen 21–37 übernommen, Refresh-Teil (Zeilen 39–71, 96–103) vollständig entfernt:

```typescript
const EXCLUDED_PREFIXES = ['/health', '/api/auth/login'];
const API_PREFIX = '/api/';

function shouldAttachToken(url: string): boolean {
  let path: string;
  try {
    const parsed = new URL(url, window.location.origin);
    if (parsed.origin !== window.location.origin) return false;
    path = parsed.pathname;
  } catch {
    return false;
  }
  return path.startsWith(API_PREFIX) && !EXCLUDED_PREFIXES.some((p) => path.startsWith(p));
}

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!shouldAttachToken(req.url)) return next(req);

  const token = tokenStore.getToken();
  const authorizedReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorizedReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
```

Registrierung in `app.config.ts`: `provideHttpClient(withInterceptors([jwtInterceptor]))`
(noch nicht in Round-1/-7 vorhanden — hier erstmals ergänzen).

### 6. Guards mit echter Prüflogik (ersetzt Round-7-Stubs)

`core/auth/auth.guard.ts`:

```typescript
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

`core/auth/admin.guard.ts`:

```typescript
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.role() === 'admin') return true;
  return router.createUrlTree(['/intake']);
};
```

Ersetzt die `() => true`-Stubs aus Round-7/plan.md Schritt 5 — `app.routes.ts` selbst
ändert sich nicht, nur der Guard-Rumpf.

### 7. Sidebar/Shell an echte Services anschließen (Anschluss an Round-6/Round-7)

`core/shell/sidebar/sidebar.ts` (Round-6): `role`/`username`/`roleLabel`/
`openArticlesCount`-Inputs und `logoutClicked`-Output entfernen, stattdessen:

```typescript
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);

  readonly isAdmin = this.roleService.isAdmin;
  readonly username = computed(() => this.authService.currentUser()?.name ?? '');
  readonly roleLabel = computed(() => (this.isAdmin() ? 'Admin' : 'Kassenpersonal'));
  readonly initials = computed(() => this.username().charAt(0).toUpperCase());
  readonly openArticlesCount = signal(0); // Datenanbindung folgt mit Epic_Artikelannahme

  logout(): void {
    this.authService.logout();
    // Navigation nach /login übernimmt der aufrufende Router-Call, s. u.
  }
}
```

`core/shell/shell.ts` (Round-7): `currentRole()`/`currentUsername()`/
`currentRoleLabel()`-Platzhalter-Signals und die entsprechenden Sidebar-Input-Bindings
im Template entfernen — `<app-sidebar />` ohne Inputs, `(logoutClicked)`-Binding
entfällt (Sidebar ruft jetzt `authService.logout()` selbst auf und navigiert per
injiziertem `Router` direkt zu `/login`).

Nachweis AC-9 (`core/auth/` frei von Feature-Importen): `ng lint` nach diesem Schritt
erneut laufen lassen.

### 8. Verifikation

- Unit-Test `jwt-decoder.spec.ts`: gültiges/ungültiges/abgelaufenes Token → korrektes
  Decode-Ergebnis bzw. `null`.
- Unit-Test `auth.service.spec.ts`: `localStorage` mit abgelaufenem Token vorbelegen,
  `AuthService` instanziieren → `isLoggedIn()` ist `false`, `localStorage` wurde
  geleert (AC-3).
- Unit-Test `auth.guard.spec.ts`/`admin.guard.spec.ts` analog
  [Referenz](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.guard.spec.ts):
  `TestBed` mit gemocktem `AuthService`, Guard-Rückgabewert (`true` bzw. `UrlTree`)
  prüfen.
- `ng serve`: ohne Token `/intake` aufrufen → Redirect auf `/login?returnUrl=/intake`
  (AC-2 aus BSHELL-S03, jetzt real statt Stub). Mit manuell in `localStorage` gesetztem
  gültigem Token (Rolle `cashier`) → `/settings` aufrufen → Redirect auf `/intake`
  (AC-3 aus BSHELL-S03).
- Manueller `401`-Test: Backend kurz stoppen oder Token manuell korrumpieren, einen
  `/api/*`-Call auslösen → Token wird gelöscht, Redirect auf `/login`, kein zweiter
  Request (AC-6, Abgrenzung zur Referenz-App bestätigt).
- `ng lint` — `core/auth/` importiert nichts aus `features/` (AC-9).

## Reihenfolge

1 → 2 → 3 sequenziell (TokenStore vor Decoder-Nutzung vor AuthService). 4 nach 3, 5 nach
3 (nutzt `AuthService`/`TokenStore`), 6 nach 3, 7 nach 3–4 (nutzt beide Services), 8
abschließend nach allem.
