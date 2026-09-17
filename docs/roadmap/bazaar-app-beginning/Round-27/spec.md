---
round: Round-27
status: geklärt
---

# Spec: Round 27 — Einstellungen: Benutzerverwaltung

## Fein-Spezifikation

### Ziel

Dritter und letzter Bereich der Einstellungen-Seite: Verwaltung der App-Benutzer.
Nutzt das `User`/`Role`-Modell aus [Round-10](../Round-10/spec.md) unverändert — kein
neues Auth-Konzept, reine CRUD-Oberfläche darüber.

### Frontend

**`user-management`** (`features/settings/components/user-management/`, ergänzt die
Einstellungen-Seite aus Round-25/26): exakt nach
[user-management.md](../../../components/user-management.md).

- Tabelle (nicht paginiert): Benutzername, Rolle (Admin/Kassenpersonal), Status-Badge
  „Wechsel offen" wenn `mustChangePassword`, sonst „—", Aktionen (Bearbeiten/
  Löschen). `passwordHash` erscheint nirgends.
- „+ Neu"-Dialog: Benutzername, Rolle, Initialpasswort, Hinweis „Wird beim ersten
  Login zum Ändern verlangt."
- Bearbeiten-Dialog: Rolle, optional „Neues Passwort setzen" — **kein**
  Benutzername-Feld (nach Anlegen nicht änderbar). Hinweis: Rollenwechsel wirkt erst
  beim nächsten Login (laufendes Token behält seinen `role`-Claim bis `exp`, Round-10,
  kein Blacklisting).
- Löschen mit Bestätigungsdialog, `409 user.last_admin` → Fehlermeldung, keine
  weitere Löschsperre (Benutzer sind keine Verkäufer, berühren keine Artikel/
  Abrechnung).

### Backend

**Application** (`Bazaar.Application/Users/`) — nutzt `User`/`Role` aus
[Round-10](../Round-10/spec.md), keine neue Domain:
- `GetUsersHandler` (`GET /api/users`) — alle Benutzer, `passwordHash` **nie** in der
  Response-DTO.
- `CreateUserHandler` (`POST /api/users`) — `username` unique (Trim,
  case-insensitiv) → `409 user.username_taken`; `initialPassword` min. 8 Zeichen
  (dieselbe FluentValidation-Regel wie `ChangePasswordCommandValidator` aus
  Round-10); setzt `MustChangePassword = true` (identische Mechanik wie
  Seed-Admin/Passwort-Reset).
- `UpdateUserHandler` (`PUT /api/users/{id}`) — zwei Anwendungsfälle in einem
  Command, beide Felder optional, mindestens eines Pflicht (FluentValidation):
  - `role` gesetzt: Rollenwechsel. Würde dem **letzten** verbleibenden Admin die
    Admin-Rolle entziehen → `409 user.last_admin`.
  - `newPassword` gesetzt: hashen, `MustChangePassword = true` setzen (kein
    Self-Service-Reset, kein Mailserver).
- `DeleteUserHandler` (`DELETE /api/users/{id}`) — letzter verbleibender Admin →
  `409 user.last_admin`, sonst löschen. Keine weitere Sperre (kein Artikel-/
  Abrechnungsbezug).
- „Letzter Admin"-Prüfung als gemeinsame Domain-Methode/Query
  (`IsLastRemainingAdmin(userId)`), von `UpdateUserHandler` **und**
  `DeleteUserHandler` verwendet — eine Implementierung der Regel, nicht zwei.

**Infrastructure**: `IUserRepository` (Round-10, bereits vorhanden) — keine neue
Repository-Methode nötig außer einer Zählabfrage „Anzahl Admins" für die
Letzter-Admin-Prüfung.

**Api** (`Bazaar.Api/Features/Users/`):
- `GET/POST /api/users`, `PUT/DELETE /api/users/{id}` — **durchgehend `admin`**
  (anders als `GET /api/settings`: hier gibt es keinen Grund für lesenden Zugriff
  durch Kassenpersonal). DTOs exakt nach
  [`api/users.md`](../../../requirements/bazaar-app/api/users.md).
- `errorCode`: `user.username_taken` (409), `user.last_admin` (409) — bereits
  katalogisiert.

### Akzeptanzkriterien

Epic_Einstellungen AC-6 bis AC-8. `user-management.md` AC-1 bis AC-7 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Application-UnitTests: `CreateUserHandler` (Duplikat), `UpdateUserHandler`
  (Rollenwechsel, Passwort-Reset, Letzter-Admin-Fall), `DeleteUserHandler`
  (Letzter-Admin-Fall), gemeinsame `IsLastRemainingAdmin`-Logik isoliert getestet.
- Frontend: `user-management` — Vitest (Tabelle, beide Dialog-Modi, Schutzregeln-
  Fehleranzeige).
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Der Login-Vorgang selbst und Passwortregeln — bereits [Round-10](../Round-10/spec.md).
