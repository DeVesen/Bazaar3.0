---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Benutzer

Benutzerverwaltung durch den Admin. Fachliche Quelle → [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 3 und [Epic_Login](../epics/Epic_Login/epic.md), Entity → [`entities/benutzer.md`](../entities/benutzer.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/users` | `admin` |
| `POST /api/users` | `admin` |
| `PUT /api/users/{id}` | `admin` |
| `DELETE /api/users/{id}` | `admin` |

**Durchgehend `admin`** — im Gegensatz zu den Einstellungen gibt es hier keinen Grund für lesenden Zugriff durch Kassenpersonal.

---

## 1. `GET /api/users`

**Nicht paginiert** — ein Basar-Team ist einstellig bis zweistellig.

```
GET /api/users

→ 200 OK
[
  { "id": "c4e7b2a1", "username": "anna", "role": "admin",
    "mustChangePassword": false },
  { "id": "d9f1c8e3", "username": "kasse1", "role": "cashier",
    "mustChangePassword": true }
]
```

`passwordHash` verlässt den Server **nie** — in keiner Antwort, auch nicht maskiert.

---

## 2. `POST /api/users`

```
POST /api/users
{ "username": "kasse2", "role": "cashier", "initialPassword": "…" }

→ 201 Created   Location: /api/users/e2a6d4b8
→ 400 Bad Request  errors: { "initialPassword": ["Passwort muss mindestens 8 Zeichen lang sein"] }
→ 409 Conflict     errorCode: user.username_taken
```

Der Server setzt **`mustChangePassword = true`** — der neue Benutzer muss beim ersten Login wechseln. Ein vom Admin vergebenes Passwort ist ein Übergabewert, kein Dauerzustand.

`username` unique nach Trim und ohne Berücksichtigung der Groß-/Kleinschreibung.

---

## 3. `PUT /api/users/{id}`

Zwei Anwendungsfälle in einem Endpoint — Rolle ändern und Passwort zurücksetzen. Beide Felder optional, mindestens eines erforderlich.

```
PUT /api/users/{id}
{ "role": "admin" }

PUT /api/users/{id}
{ "newPassword": "…" }

→ 204 No Content
→ 400 Bad Request   errors: { … }
→ 409 Conflict      errorCode: user.last_admin
```

**Passwort zurücksetzen setzt `mustChangePassword = true`** — dieselbe Mechanik wie beim Anlegen, kein zweites Konzept. Einen Self-Service-Reset gibt es nicht: Ohne Mailserver im LAN existiert kein Zustellweg für einen Reset-Link.

**Rollenwechsel wirkt beim nächsten Login.** Das laufende Token behält seinen `role`-Claim bis `exp` — es gibt keine Token-Blacklist ([`auth.md`](auth.md)). Bei einem Wechsel von `admin` auf `cashier` behält die betroffene Person also bis zu 16 Stunden ihre Admin-Rechte. Das ist im geschlossenen LAN vertretbar; wer es sofort braucht, ändert zusätzlich das Passwort — dann erzwingt der nächste Request ohnehin eine neue Anmeldung.

**`user.last_admin`:** Dem letzten verbleibenden Admin kann die Admin-Rolle nicht entzogen werden — sonst sperrt sich das Team selbst aus.

---

## 4. `DELETE /api/users/{id}`

```
DELETE /api/users/{id}

→ 204 No Content
→ 409 Conflict   errorCode: user.last_admin
                 detail: "Das letzte Admin-Konto kann nicht gelöscht werden"
```

Benutzer sind **keine Verkäufer** — das Löschen eines Kontos berührt keine Artikel, keine Abrechnung und keinen Verkäuferdatensatz ([`entities/benutzer.md`](../entities/benutzer.md)). Darum gibt es hier keine Löschsperre wegen vorhandener Daten, nur die Absicherung des letzten Admins.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #benutzer #rollen #admin #passwort
