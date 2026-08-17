---
id: BSHELL-S05
status: draft
depends-on: [BPROJ-S01]
---

# Story: Auth-Infrastruktur (`core/auth/`)

## Ziel

Ein Entwickler legt die app-weite Auth-Infrastruktur an: Token-Ablage, Token-Auswertung, ein signalbasierter `AuthService`, der HTTP-Interceptor und die drei funktionalen Guards. Nach dieser Story können Routen geschützt und die Rolle des angemeldeten Nutzers überall abgefragt werden.

## Kontext

Die Haupt-App authentifiziert per JWT (siehe [Epic_Login](../../Epic_Login/epic.md)). Diese Story stellt die Frontend-Seite bereit — die Login-Seite selbst und die Endpoints gehören zum Epic_Login.

**Bewusst kein Refresh-Mechanismus:** Es gibt genau ein Access-Token mit 16 Stunden Lebensdauer und keinen Refresh-Endpoint. Der Interceptor hängt darum nur den `Authorization`-Header an und reagiert auf `401` mit Weiterleitung — die Refresh-Logik der Voranmelde-App (VSHELL-S04) entfällt hier vollständig.

Alles liegt in `core/auth/`, nicht in einem Feature: Es sind app-weite Singletons, und `features/` darf nicht aus `features/` importieren (ESLint-Grenze aus BPROJ-S01).

## Scope

**In Scope:** `TokenStore`, `JwtDecoder`, `AuthService` (Signals), `jwtInterceptor`, `RoleService`, die Guards `authGuard`, `adminGuard` und `passwordChangeGuard`.

**Out of Scope:** Login-Seite und Passwortwechsel-Seite (Epic_Login), Route-Verdrahtung (BSHELL-S03), Refresh-Tokens (existieren nicht).

## Bausteine

| Baustein | Aufgabe |
|---|---|
| `TokenStore` | liest und schreibt `localStorage`, Key `bazaar_token`; kennt nur Strings |
| `JwtDecoder` | dekodiert den Payload, liefert `sub`, `name`, `role`, `mustChangePassword`, `exp` |
| `AuthService` | hält den Zustand als Signals (`isLoggedIn`, `user`, `role`, `mustChangePassword`); `login(token)`, `logout()` |
| `RoleService` | beantwortet `isAdmin()` für Guards und Templates |
| `jwtInterceptor` | hängt `Authorization: Bearer …` an; bei `401` Token verwerfen und auf `/login` leiten |
| `authGuard` | kein oder abgelaufenes Token → `/login?returnUrl=…` |
| `adminGuard` | Rolle ≠ `admin` → `/intake` |
| `passwordChangeGuard` | `mustChangePassword` gesetzt → `/change-password` |

## Akzeptanzkriterien

- [ ] **AC-1** — THE SYSTEM SHALL das Access-Token im `localStorage` unter dem Key `bazaar_token` ablegen; ausschließlich `TokenStore` SHALL auf `localStorage` zugreifen.
- [ ] **AC-2** — THE SYSTEM SHALL Benutzername, Rolle und `mustChangePassword` aus dem Token-Payload lesen; diese Werte SHALL **nicht** zusätzlich vom Server abgefragt oder separat gespeichert werden.
- [ ] **AC-3** — WHEN die App startet, THEN SHALL `AuthService` den `exp`-Claim des vorhandenen Tokens prüfen und ein abgelaufenes Token verwerfen, bevor die erste Route gerendert wird.
- [ ] **AC-4** — THE SYSTEM SHALL den Auth-Zustand als Signals bereitstellen (`isLoggedIn`, `user`, `role`, `mustChangePassword`), sodass Templates ohne manuelles Abonnieren darauf reagieren.
- [ ] **AC-5** — THE SYSTEM SHALL einen funktionalen `jwtInterceptor` registrieren, der jedem Request auf `/api/*` den Header `Authorization: Bearer <token>` anhängt, sofern ein Token vorliegt.
- [ ] **AC-6** — WHEN eine Antwort mit `401` eintrifft, THEN SHALL der Interceptor das Token verwerfen und auf `/login` weiterleiten; ein Refresh-Versuch SHALL **nicht** stattfinden.
- [ ] **AC-7** — THE SYSTEM SHALL `authGuard`, `adminGuard` und `passwordChangeGuard` als funktionale Guards (`CanActivateFn`) bereitstellen.
- [ ] **AC-8** — WHEN `logout()` aufgerufen wird, THEN SHALL das System das Token aus dem `localStorage` entfernen und auf `/login` weiterleiten; ein Server-Request SHALL dabei **nicht** erfolgen (es gibt keinen Logout-Endpoint).
- [ ] **AC-9** — THE SYSTEM SHALL `core/auth/` frei von Feature-Importen halten; ein Verstoß SHALL `ng lint` fehlschlagen lassen (Regel aus BPROJ-S01 AC-6).

## Abhängigkeiten

| Story-ID | Grund |
|---|---|
| BPROJ-S01 | Angular-Projekt mit `core/`-Struktur und ESLint-Grenzen muss existieren |

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #auth #jwt #guards #interceptor #signals #core
