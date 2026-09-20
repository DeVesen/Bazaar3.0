---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Auth

Anmeldung und Passwortwechsel. Fachliche Quelle → [Epic_Login](../epics/Epic_Login/epic.md), Entity → [`entities/benutzer.md`](../entities/benutzer.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `POST /api/auth/login` | `public` |
| `PUT /api/auth/password` | `authenticated` |
| `GET /api/public/bootstrap-status` | `public` |
| `POST /api/public/bootstrap-admin` | `public` |

---

## 1. `POST /api/auth/login`

```
POST /api/auth/login
{ "username": "anna", "password": "…" }

→ 200 OK
   { "accessToken": "eyJ…" }

→ 401 Unauthorized   errorCode: auth.invalid_credentials
```

**Antwort bewusst nur mit `accessToken`.** Rolle, Benutzername und `mustChangePassword` stehen als Claims im Token — sie zusätzlich im Body zu liefern wäre eine zweite, driftende Quelle. Das Frontend liest sie über den `JwtDecoder` (BSHELL-S05 AC-2).

**JWT-Claims:** `sub` (User-ID), `name` (Benutzername), `role` (`admin` \| `cashier`), `mustChangePassword` (bool), `exp`.

**Lebensdauer 16 Stunden, kein Refresh-Token.** Ein Token, das mitten im Kassenvorgang abläuft, ist ein Betriebsschaden; 16 Stunden decken jeden Basar-Tag ab. Begründung → [Epic_Login](../epics/Epic_Login/epic.md) Abschnitt 5.

**Fehlermeldung ohne Details:** `401` unterscheidet nicht, ob Benutzername oder Passwort falsch war (AC-2).

**Kein Lockout**, keine Fehlversuchszählung — die App läuft im abgeschlossenen LAN.

---

## 2. `PUT /api/auth/password`

```
PUT /api/auth/password
{ "currentPassword": "…", "newPassword": "…" }

→ 204 No Content
→ 400 Bad Request     errors: { "newPassword": ["Passwort muss mindestens 8 Zeichen lang sein"] }
→ 401 Unauthorized    errorCode: auth.invalid_credentials   (aktuelles Passwort falsch)
```

**Nach erfolgreichem Wechsel stellt der Server ein neues Token ohne `mustChangePassword` aus** — sonst hängt der Nutzer in der eigenen Weiterleitung fest, weil `passwordChangeGuard` weiterhin auf `/change-password` umleitet. Das neue Token kommt im Antwortkörper:

```
→ 204 No Content   (Flag war nicht gesetzt)
→ 200 OK           { "accessToken": "eyJ…" }   (Flag war gesetzt, neues Token ohne Flag)
```

**Passwort-Regel:** mindestens 8 Zeichen. Keine Stärke-Klassen, kein Meter — die Konten legt der Admin an, es registriert sich niemand selbst.

---

## 3. `GET /api/public/bootstrap-status`

```
GET /api/public/bootstrap-status

→ 200 OK
   { "hasAdmin": false }
```

**Anonym, ohne DB-Zugriff pro Request.** Liefert das beim Programmstart einmal ermittelte,
im Speicher gehaltene Flag (`AdminBootstrapState`) — nicht bei jedem Aufruf neu aus der
Datenbank gelesen. Fachliche Quelle → [Epic_Login](../epics/Epic_Login/epic.md) Abschnitt 4.

Frontend-Nutzung: `noAdminGuard`/`adminExistsGuard` entscheiden anhand `hasAdmin`, ob auf
`/setup` bzw. `/login` umgeleitet wird.

---

## 4. `POST /api/public/bootstrap-admin`

```
POST /api/public/bootstrap-admin
{ "username": "admin", "password": "…" }

→ 200 OK
   { "accessToken": "eyJ…" }

→ 409 Conflict        errorCode: bootstrap.already_done
→ 400 Bad Request     errors: { "username": ["…"], "password": ["Passwort muss mindestens 8 Zeichen lang sein"] }
```

**Anonym, nur solange kein Benutzer existiert.** Legt das erste Admin-Konto an
(`mustChangePassword: false` — der Anwender hat das Passwort gerade selbst gewählt) und gibt
sofort ein Access-Token zurück, damit Schritt 2/3 des Setup-Wizards authentifiziert
weiterlaufen können.

**`409 bootstrap.already_done`**, sobald irgendein Benutzer existiert — unabhängig davon, ob
er über diesen Endpoint oder anders angelegt wurde. Zwei gleichzeitige erste Requests auf
eine leere Datenbank werden serverseitig serialisiert (`AdminBootstrapState`), damit nicht
beide durchkommen.

**Validierung:** Benutzername darf nicht leer sein, Passwort mindestens 8 Zeichen — dieselbe
Regel wie bei `PUT /api/auth/password`.

---

## Kein Logout, kein Refresh

Es gibt **kein** `POST /api/auth/logout`: Ein ausgegebenes Token bleibt bis `exp` gültig, Logout löscht den `localStorage`-Eintrag im Frontend (BSHELL-S05 AC-8). Eine Token-Blacklist wäre serverseitiger Zustand für einen Fall, den es im LAN nicht gibt.

Es gibt **kein** `POST /api/auth/refresh`: bewusste Abweichung von der Voranmelde-App, begründet in [Epic_Login](../epics/Epic_Login/epic.md) Abschnitt 5.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #auth #jwt #login #passwort
