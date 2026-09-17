# Round 9 — Auth-Infrastruktur (JWT)

## Liefert

Die technische Grundlage für Anmeldung und Rechteprüfung im Frontend — noch ohne die
eigentliche Login-Seite, aber mit allem, was sie und alle geschützten Routen brauchen.

## Umfang

- `core/auth/` mit `TokenStore` (Ablage ausschließlich im `localStorage`, ausschließlich
  für das JWT), `JwtDecoder`, `AuthService` (Signals-basiert, prüft `exp` beim
  App-Start), `RoleService`.
- `jwtInterceptor` (ohne Refresh-Mechanik — ein Access-Token, 16 h Lebensdauer), leitet
  bei `401` auf `/login` weiter.
- `authGuard`/`adminGuard` aus Round 7 werden hier mit echter Prüflogik verdrahtet.
- Rollen-Claim (`role`) steuert `RoleService`/Sidebar-Sichtbarkeit aus Round 6 — noch
  ohne echten Login-Vorgang, aber technisch vollständig verdrahtet.

## Nicht enthalten

- Die Login-Seite selbst und der Login-Endpoint (eigenes Epic direkt danach).
- Benutzerverwaltung.

## Referenzen

- [Epic_App_Shell](../../requirements/bazaar-app/epics/Epic_App_Shell/epic.md) (Story BSHELL-S05)
- [spec.md §7.0](../../requirements/bazaar-app/spec.md) (Auth — JWT-Bearer)

## Voraussetzung

Setzt voraus, dass Routing-Skeleton mit Guards und die Sidebar bereits existieren.
