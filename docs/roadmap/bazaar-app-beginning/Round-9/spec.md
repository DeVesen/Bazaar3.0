---
round: Round-9
status: geklärt
---

# Spec: Round 9 — Auth-Infrastruktur (JWT)

## Fein-Spezifikation

### Ziel

`core/auth/` vollständig: `TokenStore`, `JwtDecoder`, `AuthService` (Signals),
`jwtInterceptor`, `RoleService`, sowie **echte** Prüflogik in `authGuard`/`adminGuard`
(ersetzt die Stub-Guards aus Round 7). Kein Login/Passwortwechsel (Epic_Login), keine
Benutzerverwaltung.

### Eingeschränkter Umfang: kein `passwordChangeGuard`

BSHELL-S05 führt zusätzlich `passwordChangeGuard` (AC-7, Bausteine-Tabelle) auf.
Dieses round.md selbst nennt in seinem „Umfang" nur `authGuard`/`adminGuard` —
konsistent mit der bereits in [Round-7/plan.md](../Round-7/plan.md) dokumentierten
Einschränkung (dort fehlten `/change-password` und `passwordChangeGuard` ebenfalls, da
[`Round-7/round.md`](../Round-7/round.md) sie ausklammert). Round-9 übernimmt dieselbe
Einschränkung: **kein** `passwordChangeGuard`,
**kein** `mustChangePassword`-Redirect-Verhalten — nur das Signal/Feld selbst wird aus
dem Token gelesen (BSHELL-S05 AC-2 verlangt das unabhängig vom Guard), aber nicht
verdrahtet. Gehört vermutlich zu einem späteren, hier nicht geplanten Round
(Epic_Login-Umfeld).

### Abweichung von der Referenz-App: kein Refresh-Mechanismus

BSHELL-S05 ist hier eindeutig und widerspricht der Referenz-Implementierung
absichtlich: „Bewusst kein Refresh-Mechanismus … Der Interceptor hängt darum nur den
`Authorization`-Header an und reagiert auf `401` mit Weiterleitung." Die Referenz-App
([`jwt.interceptor.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt.interceptor.ts),
[`token-store.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/token-store.ts),
[`role.service.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/role.service.ts))
hat Refresh-Token-Ablage, Refresh-Request-Logik und einen Rollen-**Toggle** — alle drei
entfallen hier explizit, keine Abstimmung mit dem Nutzer nötig, da die Story das bereits
eindeutig festlegt (kein offener Punkt). `TokenStore` verwaltet daher **nur** den Key
`bazaar_token` (kein `bazaar_refresh_token`, kein `bazaar_active_role` — es gibt keinen
Rollen-Toggle, BSHELL-S01 AC-3d).

### Übernommene Muster aus der Referenz-App

Trotz der beiden obigen Abweichungen strukturell direkt übertragbar:

- **`JwtDecoder`**
  ([`jwt-decoder.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/jwt-decoder.ts)):
  Base64Url-Dekodierung (`decodeBase64UrlToUtf8`) 1:1 übernehmbar — reine
  RFC-7519-Mechanik, app-unabhängig. `DecodedToken`-Interface erweitert um
  `mustChangePassword: boolean` und `name` (BSHELL-S05 Bausteine-Tabelle: „liefert
  `sub`, `name`, `role`, `mustChangePassword`, `exp`"), `role` als
  `'admin' | 'cashier'` statt `'admin' | 'seller'`.
- **`AuthService`-Grundstruktur**
  ([`auth.service.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.service.ts)):
  `signal<DecodedToken | null>` + `computed(isLoggedIn)`-Muster übernehmbar, aber
  `login(accessToken: string)` mit **einem** Parameter (kein `refreshToken`), kein
  `registerLogoutReset`-Mechanismus nötig (der diente dort nur dem Rollen-Toggle-Reset,
  den es hier nicht gibt).
- **`jwtInterceptor`-Grundstruktur**: Allowlist-Ansatz (`shouldAttachToken`, nur
  eigene `/api/*`-Requests bekommen den Header) übernehmbar, aber **ohne**
  `refreshAccessToken`/`refreshInFlight`/`isBusinessLogicUnauthorized` — bei `401`
  direkt `authService.logout()` und Redirect, kein zweiter Versuch (BSHELL-S05 AC-6).
- **Funktionale Guards** (`CanActivateFn`,
  [`auth.guard.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/auth.guard.ts)/
  [`admin.guard.ts`](../../../../src/advance-registration/frontend/BAR.App/src/app/core/auth/admin.guard.ts)):
  Struktur (`inject`, `Router.createUrlTree`) exakt übernehmbar, nur Redirect-Ziele
  anpassen (`/intake` statt `/home`).

### Akzeptanzkriterien

Wie in [BSHELL-S05](../../../requirements/bazaar-app/epics/Epic_App_Shell/stories/BSHELL-S05-auth-infrastruktur.md)
AC-1 bis AC-9, mit Ausnahme des `passwordChangeGuard`-Teils von AC-7 (s. o., „Bewusst
nicht in diesem Round"). AC-2 wird für `mustChangePassword` nur „gelesen und im Signal
bereitgestellt", nicht „zur Umleitung genutzt".

### Bewusst nicht in diesem Round

`passwordChangeGuard` und dessen Verdrahtung, Login-Seite/Passwortwechsel-Seite
(Epic_Login), Benutzerverwaltung, jeglicher Refresh-Mechanismus (existiert nicht, s. o.),
Rollen-Toggle (existiert in der Haupt-App nicht).

