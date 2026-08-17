---
id: VSHELL-S04
status: draft
depends-on: [VPROJ-S02]
---

# Story: Auth-Infrastruktur

## Ziel

Die Angular-App verwaltet JWT-Tokens (Access + Refresh), schützt API-Calls über einen HTTP-Interceptor mit automatischem Token-Refresh und stellt `AuthGuard`, `AdminGuard` und einen `RoleService` für den Role-Toggle bereit. Epic_Login kann danach den eigentlichen Login-Endpoint anbinden.

## Kontext

Die Voranmelde-App erfordert Authentifizierung (JWT) und Rollenunterscheidung (Admin vs. Verkäufer). Die Auth-Infrastruktur ist das Fundament: Sie stellt die Guards für das Routing und den RoleService für die rollenabhängige Sidebar bereit. Der konkrete Login-Endpoint und das Passwort-Hashing werden in Epic_Login implementiert.

## Scope

**In Scope:** `AuthService` (Access- und Refresh-Token speichern/lesen/löschen, `isLoggedIn()`, `getRole()`), JWT-HTTP-Interceptor (Bearer-Header für alle API-Calls außer `/health`, `/api/auth/*` und `/api/public/*`; automatischer Refresh-Versuch bei HTTP 401), `AuthGuard` (canActivate), `AdminGuard` (canActivate), `RoleService` (aktive Rolle lesen/setzen, Role-Toggle-Logik).

**Out of Scope:** Login-UI (Epic_Login), konkrete API-Calls für Login/Logout/Registrierung (Epic_Login).

## UI-Spezifikation

```
Auth-Flow (Infrastruktur-Sicht):
                    ┌─────────────────┐
                    │   AuthService   │
                    │  - token (LS)   │
                    │  - isLoggedIn() │
                    │  - getRole()    │
                    │  - logout()     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
       ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────────┐
       │  AuthGuard  │ │ AdminGuard │ │  RoleService  │
       │ canActivate │ │ canActivate│ │ activeRole()  │
       │ → /login    │ │ → /home   │ │ setRole()     │
       └─────────────┘ └────────────┘ └───────────────┘
                             │
                    ┌────────▼────────┐
                    │  JWT Interceptor │
                    │  Authorization:  │
                    │  Bearer <token>  │
                    └─────────────────┘

JWT-Storage: localStorage key = 'bazaar_token' (Access-Token)
Refresh-Storage: localStorage key = 'bazaar_refresh_token'
Aktive Rolle: localStorage key = 'bazaar_active_role' ('admin' | 'seller')
```

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL einen `AuthService` bereitstellen, der das JWT unter dem Key `bazaar_token` im `localStorage` speichert, liest und löscht.
- [ ] **AC-2** — THE SYSTEM SHALL `AuthService.isLoggedIn()` implementieren: gibt `true` zurück, wenn ein nicht-abgelaufenes JWT im localStorage vorhanden ist (Ablaufzeit aus JWT-Payload `exp`).
- [ ] **AC-3** — THE SYSTEM SHALL `AuthService.getRole()` implementieren: liest den `role`-Claim aus dem JWT-Payload und gibt `'admin'` oder `'seller'` zurück.
- [ ] **AC-4** — THE SYSTEM SHALL einen HTTP-Interceptor registrieren, der für alle ausgehenden API-Requests den Header `Authorization: Bearer <token>` setzt — ausgenommen Requests an `/health`, `/api/auth/*` und `/api/public/*`.
- [ ] **AC-5** — THE SYSTEM SHALL einen `AuthGuard` bereitstellen, der nicht eingeloggte Nutzer zu `/login?returnUrl=<ursprüngliche-URL>` weiterleitet.
- [ ] **AC-6** — THE SYSTEM SHALL einen `AdminGuard` bereitstellen, der eingeloggte Nicht-Admins zu `/home` weiterleitet.
- [ ] **AC-7** — THE SYSTEM SHALL einen `RoleService` bereitstellen, der die aktuell aktive Rolle (`admin` | `seller`) im `localStorage` (`bazaar_active_role`) hält und über ein Signal (`activeRole`) bereitstellt.
- [ ] **AC-8** — WHEN ein Admin `RoleService.setRole('seller')` aufruft, THEN SHALL `activeRole` auf `'seller'` wechseln, ohne den JWT zu ändern oder einen Logout auszulösen.
- [ ] **AC-9** — WHEN `AuthService.logout()` aufgerufen wird, THEN SHALL `bazaar_token` und `bazaar_active_role` aus dem localStorage gelöscht und zu `/login` navigiert werden.
- [ ] **AC-10** — IF ein API-Request HTTP 401 zurückgibt, THEN SHALL der Interceptor automatisch `POST /api/auth/refresh` mit dem gespeicherten Refresh-Token aufrufen; bei Erfolg SHALL der ursprüngliche Request mit dem neuen Access-Token wiederholt werden.
- [ ] **AC-11** — IF der Refresh-Aufruf (AC-10) fehlschlägt (Refresh-Token abgelaufen oder ungültig), THEN SHALL der Interceptor `logout()` aufrufen und zu `/login` navigieren.
- [ ] **AC-12** — THE SYSTEM SHALL das Refresh-Token unter dem Key `bazaar_refresh_token` im `localStorage` speichern, lesen und bei `logout()` löschen.

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| VPROJ-S02 | .NET-Backend mit JWT-Middleware muss existieren (auch wenn der Login-Endpoint noch nicht implementiert ist) |

## Tags & Piles

**Tags:** #auth #jwt #guard #interceptor #role-service #role-toggle #angular
