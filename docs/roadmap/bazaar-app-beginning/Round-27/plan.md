---
round: Round-27
status: geplant
---

# Plan: Round 27 — Einstellungen: Benutzerverwaltung

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-10/plan.md](../Round-10/plan.md): `User.cs` (`Create`, `ChangePassword`),
  `IUserRepository`, `AspNetPasswordHasher`. Hier zusätzlich benötigte
  Aggregate-Methode `ChangeRole(Role)` neu ergänzen (bisher nicht vorhanden, da
  Round-10 nur Login/Passwortwechsel brauchte).
- [Round-25/plan.md](../Round-25/plan.md)/[Round-26/plan.md](../Round-26/plan.md):
  `settings.page.ts` (dritter Bereich wird hier ergänzt).

## Implementationsplan

### Backend

#### 1. `User.cs` erweitern

`ChangeRole(Role newRole)`-Methode (Round-10-Aggregate, private Setter bereits
vorhanden) ergänzen. `IUserRepository` (Round-10) um `CountByRole(Role role):
Task<int>` erweitern — Basis für die Letzter-Admin-Prüfung.

#### 2. Gemeinsame Letzter-Admin-Logik

`Bazaar.Application/Users/LastAdminGuard.cs` (kleine statische Hilfsklasse oder
Domain-Service): `IsLastRemainingAdmin(User user, int adminCount) => user.Role ==
Role.Admin && adminCount <= 1`. Von `UpdateUserHandler` und `DeleteUserHandler`
aufgerufen (`adminCount` per `IUserRepository.CountByRole(Role.Admin)` geladen).

#### 3. Application (`Bazaar.Application/Users/`)

`GetUsersHandler` — Response-DTO ohne `PasswordHash`-Feld (Mapping stellt das
sicher, kein Vergessen möglich). `CreateUserCommand`+`Validator`
(`initialPassword` min. 8 Zeichen — Validator-Regel textgleich zu Round-10s
`ChangePasswordCommandValidator`, aus Testbarkeit als eigene Regel dupliziert,
da unterschiedliche Command-Typen; keine gemeinsame Validator-Basisklasse nötig
für eine Ein-Zeilen-Regel)+`Handler` (`409 user.username_taken` bei Duplikat).
`UpdateUserCommand`(`Role?`, `NewPassword?`)+`Validator`(mind. eines gesetzt)+
`Handler` (Rollenwechsel → `LastAdminGuard`-Check vor `ChangeRole`; Passwort →
hashen + `ChangePassword`-Methode wiederverwendet, die setzt bereits
`MustChangePassword = true`, Round-10). `DeleteUserHandler` — `LastAdminGuard`-
Check vor `Remove`.

#### 4. Api

`UserEndpoints.cs` (`Bazaar.Api/Features/Users/`) — vier Routen, durchgehend
`RequireAuthorization("admin")`.

### Frontend

#### 5. `user-management`

`features/settings/components/user-management/user-management.ts` — `data/
users-api.ts` (vier Methoden), Tabelle (`p-table`, nicht paginiert, kein Bezug
zur vollen Shared-`table`-Komponente nötig — analog Artikelliste in Round-20).
Ein Dialog für beide Modi (`mode: 'create' | 'edit'`, Felder wie spec.md).
Löschen mit `p-confirmdialog`, `409 user.last_admin` → Fehlermeldung statt
Löschen.

`settings.page.ts` (Round-25/26) um dritten Bereich ergänzt.

### 6. Verifikation

- `dotnet test` — `CreateUserHandler` Duplikat-Fall, `UpdateUserHandler`
  Rollenwechsel (Erfolg + Letzter-Admin-Blockade), Passwort-Reset (`MustChangePassword`
  danach `true`), `DeleteUserHandler` Letzter-Admin-Blockade,
  `LastAdminGuard` isoliert (zwei Admins vorhanden → Wechsel/Löschen eines davon
  erlaubt; nur einer → blockiert).
- `ng serve`: `/settings` als Admin → Benutzer anlegen (Kassenpersonal), Rolle
  auf Admin wechseln, zurück auf Kassenpersonal — Versuch, den **letzten**
  verbleibenden Admin (Seed-Admin aus Round-10) zu degradieren oder zu löschen
  → `409`-Fehlermeldung sichtbar. Login mit dem neu angelegten Benutzer → Zwang
  zum Passwortwechsel greift (Round-10-Guard, unverändert).

## Reihenfolge

Backend 1 → 2 → 3 → 4 sequenziell. Frontend 5 nach 4. 6 abschließend.
