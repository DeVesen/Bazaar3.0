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

## Kein Logout, kein Refresh

Es gibt **kein** `POST /api/auth/logout`: Ein ausgegebenes Token bleibt bis `exp` gültig, Logout löscht den `localStorage`-Eintrag im Frontend (BSHELL-S05 AC-8). Eine Token-Blacklist wäre serverseitiger Zustand für einen Fall, den es im LAN nicht gibt.

Es gibt **kein** `POST /api/auth/refresh`: bewusste Abweichung von der Voranmelde-App, begründet in [Epic_Login](../epics/Epic_Login/epic.md) Abschnitt 5.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #auth #jwt #login #passwort
