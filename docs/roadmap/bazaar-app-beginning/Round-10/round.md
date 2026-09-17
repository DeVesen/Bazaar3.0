# Round 10 — Login

## Liefert

Den vollständigen Durchstich für die Anmeldung: Login-Seite, Backend-Endpoints, JWT-Ausstellung
mit den beiden Rollen Admin und Kassenpersonal.

## Umfang

- Login-Seite (`/login`, außerhalb der AppShell, einspaltig `p-card`, max-width 360 px):
  Benutzername + Passwort, kein Self-Service-Reset-Link.
- Backend, hexagonaler Schnitt: `User`-Aggregate + `Role`-Value-Object in
  `Bazaar.Domain/User/`, `IPasswordHasher`/`ITokenIssuer` in `Domain/Ports/`,
  Implementierungen in `Infrastructure`, `LoginHandler`/`ChangePasswordHandler` in
  `Application/Auth/`, Endpoints/DTOs in `Api/Features/Auth/`.
- Endpoints: `POST /api/auth/login` (öffentlich), `PUT /api/auth/password`
  (authenticated).
- JWT-Claims: `sub`, `name`, `role`, `mustChangePassword`, `exp` — 16 h Lebensdauer, kein
  Refresh-Token.
- Seed-Admin-Mechanismus (`SEED_ADMIN_USER`/`SEED_ADMIN_PASSWORD`), greift ausschließlich
  beim allerersten Start, solange noch kein Benutzer existiert.
- Passwortregel: mindestens 8 Zeichen, keine Stärke-Klassen, kein Stärke-Meter.

## Nicht enthalten

- Benutzerverwaltung (Anlegen/Rolle ändern/Reset/Löschen weiterer Benutzer) — gehört zur
  Einstellungen-Seite.
- Brute-Force-Schutz, Refresh-Tokens/Blacklist, Selbstregistrierung, E-Mail-Reset,
  Audit-Log — bewusst kein MVP-Umfang.

## Referenzen

- [Epic_Login](../../requirements/bazaar-app/epics/Epic_Login/epic.md)
- [spec.md §4.1](../../requirements/bazaar-app/spec.md) (Rechte-Matrix)

## Voraussetzung

Setzt voraus, dass die Auth-Infrastruktur (Token-Handling, Interceptor, Guards) im
Frontend bereits existiert und das Backend-Grundgerüst inkl. Datenbankanbindung steht.
