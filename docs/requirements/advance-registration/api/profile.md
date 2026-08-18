---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Profil

Selbstverwaltung der eigenen Stammdaten, Zugangsdaten und des eigenen Accounts.
Alle Endpoints beziehen sich immer auf den eingeloggten Nutzer — es gibt keine
ID im Pfad, die Auflösung passiert über den `sub`-Claim.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epic → [Epic_Profil](../epics/Epic_Profil/epic.md) ·
Component → [`profil-page.md`](../components/profil-page.md) ·
Entity → [`entities/verkaeufer.md`](../entities/verkaeufer.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/profile` | `authenticated` | Eigene Profildaten (Tab „Steckbrief") |
| `PUT /api/profile` | `authenticated` | Stammdaten ändern (Panel 01–02) |
| `PUT /api/profile/email` | `authenticated` | E-Mail ändern (Tab „Zugangsdaten") |
| `PUT /api/profile/password` | `authenticated` | Passwort ändern (Tab „Zugangsdaten") |
| `DELETE /api/profile` | `authenticated` | Eigenen Account löschen (Tab „Löschen") |

> **Pfad-Änderung:** Das Löschen hieß in Epic_Profil ursprünglich
> `DELETE /api/profile/me`. Das `/me`-Suffix ist redundant — die anderen vier
> Routen tragen es auch nicht, und `/api/profile` ist per Definition immer die
> eigene Ressource (siehe [`cross-cutting.md`](cross-cutting.md) Abschnitt 1).

---

## 1. `GET /api/profile`

**Response `200`**

```json
{
  "id": "a3f9c2d1",
  "firstName": "Anna",
  "lastName": "Beispiel",
  "address": "Hauptstr. 1",
  "postalCode": "76133",
  "city": "Karlsruhe",
  "phone": "0721 12345",
  "email": "anna@example.com",
  "sellerType": {
    "id": "t1b2c3d4",
    "name": "Standard",
    "commissionRate": 15.0,
    "itemFee": 0.50
  }
}
```

`sellerType` wird **serverseitig aufgelöst** mitgeliefert, nicht nur als
`sellerTypeId`. Grund: Panel 03 der Profil-Seite zeigt Typ, Provision und
Gebühr read-only an, ein Verkäufer hat aber keinen Zugriff auf
[`GET /api/seller-types`](seller-types.md) (`admin`). Ohne Auflösung bliebe das
Panel leer.

Alle Werte in `sellerType` sind vom Typ abgeleitet — kein Override pro Verkäufer
in dieser App (siehe [`entities/verkaeufer-typ.md`](../entities/verkaeufer-typ.md)).

---

## 2. `PUT /api/profile`

Ändert ausschließlich Panel 01–02 (Personendaten + Telefon).

**Request**
```json
{
  "firstName": "Anna",
  "lastName": "Beispiel",
  "address": "Hauptstr. 1",
  "postalCode": "76133",
  "city": "Karlsruhe",
  "phone": "0721 12345"
}
```

`email`, `sellerTypeId` und Konditionen sind hier **nicht** änderbar.
Werden sie trotzdem mitgeschickt, ignoriert das Backend sie stillschweigend
statt mit `400` abzulehnen — so darf das Frontend das gelesene Objekt einfach
zurücksenden.

**Response `200`** — aktualisiertes Profil in der Form von Abschnitt 1

**Fehler:** `400` mit `errors` je Pflichtfeld (`firstName`, `lastName`,
`postalCode`, `city`, `phone`) — das Frontend rendert sie unter dem jeweiligen Feld
(Epic_Profil AC-3).

**UI-Feedback:** Standardmuster aus
[`cross-cutting.md`](cross-cutting.md) Abschnitt 7 — Toast „✓ Profil
gespeichert" bzw. Error-InfoArea „Profil konnte nicht gespeichert werden"
(Epic_Profil AC-7/AC-8).

---

## 3. `PUT /api/profile/email`

**Request**
```json
{ "newEmail": "neu@example.com", "currentPassword": "geheim123" }
```

**Response `200`** — ohne Body.

**Kein neues Token nötig:** Der `sub`-Claim enthält die User-ID, nicht die
E-Mail (siehe [`auth.md`](auth.md)). Das bestehende Access-Token bleibt gültig.

**Fehler**

| Code | Bedeutung |
|---|---|
| `400` | E-Mail-Format ungültig |
| `401` | `currentPassword` falsch |
| `409` | `errorCode: seller.email_taken` — „Diese E-Mail ist bereits registriert" |

---

## 4. `PUT /api/profile/password`

**Request**
```json
{
  "currentPassword": "geheim123",
  "newPassword": "nochgeheimer456",
  "newPasswordConfirmation": "nochgeheimer456"
}
```

**Response `200`** — Token-Hülle wie in [`auth.md`](auth.md)
(`{ accessToken, refreshToken }`).

**Fehler**

| Code | Bedeutung |
|---|---|
| `400` | Neues Passwort erfüllt die Stärke-Anforderung nicht, oder Bestätigung stimmt nicht überein (Epic_Profil AC-4) |
| `401` | `currentPassword` falsch |

### Wirkung auf Sitzungen

1. **Alle** Refresh-Token-Zeilen des Verkäufers werden gelöscht — jedes andere Gerät
   ist damit abgemeldet, sobald sein Access-Token abläuft
   (siehe [`entities/refresh-token.md`](../entities/refresh-token.md)).
2. Für das **aufrufende** Gerät wird direkt eine neue Zeile angelegt und das neue
   Token-Paar zurückgegeben. Das Frontend ersetzt seine gespeicherten Tokens damit
   (VSHELL-S04 AC-14) und bleibt angemeldet.

Ohne Schritt 2 würde sich der Nutzer beim Ändern seines eigenen Passworts nach
höchstens 5 Tagen selbst aussperren — technisch korrekt, aber unnötig unfreundlich.

**Bestehende Access-Tokens anderer Geräte bleiben gültig** (max. 5 Tage Restlaufzeit) —
sie werden nicht geprüft, das bräuchte eine Blacklist außerhalb des MVP.

---

## 5. `DELETE /api/profile`

Löscht den eigenen Account **hart** (siehe
[`cross-cutting.md`](cross-cutting.md) Abschnitt 5).

**Kaskade** (Epic_Profil AC-5):
1. alle eigenen Artikel löschen
2. anschließend alle eigenen Nummernblöcke freigeben — nach Schritt 1 sind sie
   leer
3. alle eigenen Refresh-Token-Zeilen löschen

Identische Kaskadenregel wie `DELETE /api/sellers/{id}` → siehe
[`sellers.md`](sellers.md).

**Response `204`**

**Fehler**

| Code | `detail` |
|---|---|
| `403` | `errorCode: profile.admin_self_delete` — „Admin-Accounts können nur von einem anderen Admin gelöscht werden". verhindert, dass sich der letzte Admin selbst aussperrt. Das Frontend blendet den Tab „Löschen" für Admins ohnehin aus (Epic_Profil AC-6), der Endpoint prüft es zusätzlich serverseitig. |

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #profil #stammdaten #zugangsdaten #account-loeschung
