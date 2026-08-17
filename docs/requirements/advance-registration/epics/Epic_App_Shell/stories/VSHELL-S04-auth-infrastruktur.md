---
id: VSHELL-S04
status: draft
depends-on: [VPROJ-S02]
---

# Story: Auth-Infrastruktur

## Ziel

Die Angular-App verwaltet JWT-Tokens (Access + Refresh), schützt API-Calls über einen HTTP-Interceptor mit automatischem Token-Refresh und stellt `authGuard`, `adminGuard` und einen `RoleService` für den Role-Toggle bereit. Epic_Login kann danach den eigentlichen Login-Endpoint anbinden.

## Kontext

Die Voranmelde-App erfordert Authentifizierung (JWT) und Rollenunterscheidung (Admin vs. Verkäufer). Die Auth-Infrastruktur ist das Fundament: Sie stellt die Guards für das Routing und den RoleService für die rollenabhängige Sidebar bereit. Der konkrete Login-Endpoint und das Passwort-Hashing werden in Epic_Login implementiert.

## Scope

**In Scope:** `TokenStore` (localStorage-Adapter), `JwtDecoder` (reine Funktion), `AuthService` (Orchestrator mit `currentUser`-Signal), funktionaler `jwtInterceptor` (Bearer-Header für alle API-Calls außer `/health`, `/api/auth/*` und `/api/public/*`; automatischer Refresh-Versuch bei HTTP 401), `authGuard` und `adminGuard` als `CanActivateFn`, `RoleService` (aktive Rolle lesen/setzen, Role-Toggle-Logik).

**Out of Scope:** Login-UI (Epic_Login), konkrete API-Calls für Login/Logout/Registrierung (Epic_Login).

## Aufbau

Alles liegt in `core/auth/`. Die Verantwortung ist bewusst auf vier Bausteine
verteilt — ein Alles-in-einem-`AuthService` hätte vier Änderungsgründe
(Storage-Zugriff, Token-Parsing, Zustand, Navigation) und müsste `isLoggedIn()`
bei jedem Guard-Aufruf neu parsen.

| Baustein | Verantwortung | Kennt nicht |
|---|---|---|
| `TokenStore` | liest/schreibt/löscht die drei localStorage-Keys | JWT-Format, Router |
| `JwtDecoder` | pure function: Token-String → `{ sub, role, exp }` | Storage, DI |
| `AuthService` | Zustand: `currentUser` (Signal), `isLoggedIn` (computed), `login()`/`logout()` (nur Zustand + Storage, **keine** Navigation) | Router |
| `RoleService` | aktive Rolle für den Role-Toggle (`activeRole`-Signal) | Token-Ausgabe |

Navigation gehört in Guard bzw. Interceptor — nicht in den Service.

```
Auth-Flow (Infrastruktur-Sicht):

      ┌────────────┐        ┌──────────────┐
      │ TokenStore │        │  JwtDecoder  │
      │ (localStg) │        │ (pure fn)    │
      └──────┬─────┘        └──────┬───────┘
             └────────┬────────────┘
                      ▼
            ┌───────────────────────┐
            │      AuthService      │
            │  currentUser: Signal  │
            │  isLoggedIn: computed │
            │  logout()  (kein Nav) │
            └───────────┬───────────┘
        ┌───────────────┼───────────────┬────────────────┐
        ▼               ▼               ▼                ▼
   authGuard       adminGuard      jwtInterceptor    RoleService
  CanActivateFn   CanActivateFn   HttpInterceptorFn  activeRole()
   → /login        → /home        Bearer + Refresh    setRole()

JWT-Storage: localStorage key = 'bazaar_token' (Access-Token)
Refresh-Storage: localStorage key = 'bazaar_refresh_token'
Aktive Rolle: localStorage key = 'bazaar_active_role' ('admin' | 'seller')
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL einen `TokenStore` bereitstellen, der als einziger Baustein auf `localStorage` zugreift und Access-Token (`bazaar_token`), Refresh-Token (`bazaar_refresh_token`) und aktive Rolle (`bazaar_active_role`) speichert, liest und löscht.
- [ ] **AC-1b** — THE SYSTEM SHALL einen `JwtDecoder` als reine Funktion bereitstellen, die einen Token-String auf `{ sub, role, exp }` abbildet und ohne Angular-DI testbar ist.
- [ ] **AC-2** — THE SYSTEM SHALL `AuthService.isLoggedIn` als `computed()` über dem `currentUser`-Signal bereitstellen: `true`, solange ein nicht-abgelaufenes Token vorliegt (`exp` aus dem dekodierten Payload). Das Token SHALL beim App-Start **einmal** dekodiert werden, nicht bei jedem Guard-Aufruf.
- [ ] **AC-3** — THE SYSTEM SHALL die Rolle über `AuthService.currentUser()?.role` (`'admin'` | `'seller'`) aus dem `role`-Claim bereitstellen.
- [ ] **AC-4** — THE SYSTEM SHALL einen funktionalen `jwtInterceptor` (`HttpInterceptorFn`) registrieren, der für alle ausgehenden API-Requests den Header `Authorization: Bearer <token>` setzt — ausgenommen Requests an `/health`, `/api/auth/*` und `/api/public/*`.
- [ ] **AC-5** — THE SYSTEM SHALL einen `authGuard` als `CanActivateFn` bereitstellen, der nicht eingeloggte Nutzer zu `/login?returnUrl=<ursprüngliche-URL>` weiterleitet.
- [ ] **AC-6** — THE SYSTEM SHALL einen `adminGuard` als `CanActivateFn` bereitstellen, der eingeloggte Nicht-Admins zu `/home` weiterleitet.
- [ ] **AC-7** — THE SYSTEM SHALL einen `RoleService` bereitstellen, der die aktuell aktive Rolle (`admin` | `seller`) über den `TokenStore` persistiert und über ein Signal (`activeRole`) bereitstellt.
- [ ] **AC-8** — WHEN ein Admin `RoleService.setRole('seller')` aufruft, THEN SHALL `activeRole` auf `'seller'` wechseln, ohne den JWT zu ändern oder einen Logout auszulösen.
- [ ] **AC-9** — WHEN `AuthService.logout()` aufgerufen wird, THEN SHALL alle drei localStorage-Keys gelöscht und `currentUser` auf `null` gesetzt werden. Die Navigation nach `/login` SHALL der Aufrufer auslösen (Guard, Interceptor oder Logout-Button) — nicht der Service.
- [ ] **AC-10** — IF ein API-Request HTTP 401 zurückgibt, THEN SHALL der Interceptor automatisch `POST /api/auth/refresh` mit dem gespeicherten Refresh-Token aufrufen; bei Erfolg SHALL der ursprüngliche Request mit dem neuen Access-Token wiederholt werden. Parallele 401er SHALL denselben Refresh-Aufruf teilen (kein Refresh-Sturm).
- [ ] **AC-11** — IF der Refresh-Aufruf (AC-10) fehlschlägt (Refresh-Token abgelaufen oder ungültig), THEN SHALL der Interceptor `logout()` aufrufen und zu `/login` navigieren.
- [ ] **AC-12** — THE SYSTEM SHALL das bei `/refresh` zurückgegebene **neue** Refresh-Token speichern (Rotation, siehe [`api/auth.md`](../../../api/auth.md) Abschnitt 3) und das alte verwerfen.
- [ ] **AC-13** — THE SYSTEM SHALL alle vier Bausteine (`TokenStore`, `JwtDecoder`, `AuthService`, `RoleService`) in `core/auth/` ablegen; kein Feature SHALL direkt auf `localStorage` oder auf den Token-String zugreifen.
- [ ] **AC-14** — WHEN `PUT /api/profile/password` erfolgreich antwortet, THEN SHALL der Client das zurückgegebene Token-Paar über den `TokenStore` ersetzen und angemeldet bleiben — der Server hat dabei alle anderen Sitzungen des Nutzers beendet (siehe [`api/profile.md`](../../../api/profile.md) Abschnitt 4).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S02 | .NET-Backend mit JWT-Middleware muss existieren (auch wenn der Login-Endpoint noch nicht implementiert ist) |

## Tags & Piles

**Tags:** #auth #jwt #guard #interceptor #role-service #role-toggle #angular
