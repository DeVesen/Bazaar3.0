---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Verkäufer (Admin)

Verwaltung fremder Verkäufer-Datensätze durch den Admin. Die Selbstverwaltung
des eigenen Profils liegt in [`profile.md`](profile.md), die Nummernblock-Routen
in [`blocks.md`](blocks.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epic → [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) ·
Entity → [`entities/verkaeufer.md`](../entities/verkaeufer.md) ·
Component → [`verkaeufer-dialog.md`](../components/verkaeufer-dialog.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/sellers` | `admin` | Liste aller Verkäufer, paginiert + Freitext |
| `POST /api/sellers` | `admin` | Verkäufer anlegen (ohne Passwort) + Initialblöcke |
| `PUT /api/sellers/{id}` | `admin` | Stammdaten, Typ und Admin-Recht ändern |
| `DELETE /api/sellers/{id}` | `admin` | Verkäufer samt Artikeln und Blöcken löschen |
| `POST /api/sellers/{id}/invite` | `admin` | Einladungs-Link erzeugen |

**Nummernblock-Routen** (`POST /api/sellers/{id}/blocks`,
`DELETE /api/sellers/{id}/blocks/{blockId}`) hängen zwar unter diesem Pfad, sind
aber fachlich Nummernblock-Verwaltung → [`blocks.md`](blocks.md).

---

## Verkäufer-Objekt

```json
{
  "id": "a3f9c2d1",
  "startNumber": 101,
  "firstName": "Anna",
  "lastName": "Beispiel",
  "address": "Hauptstr. 1",
  "postalCode": "76133",
  "city": "Karlsruhe",
  "phone": "0721 12345",
  "email": "anna@example.com",
  "sellerTypeId": "t1b2c3d4",
  "sellerType": {
    "id": "t1b2c3d4",
    "name": "Standard",
    "commissionRate": 15.0,
    "itemFee": 0.50
  },
  "isAdmin": false,
  "articleCount": 12,
  "hasPendingInvite": false
}
```

| Feld | Bemerkung |
|---|---|
| `startNumber` | `fromNumber` des **ersten** Nummernblocks — das ist die Spalte „Nr." der Admin-Tabelle. **Kein eigenes Feld in der Entity**, sondern abgeleitet: eine zweite fortlaufende Nummernwelt neben den Artikelnummern wäre nur verwechslungsanfällig, und am Basar-Tag wird ohnehin nach „Verkäufer 101" gesucht. `null`, solange kein Block zugewiesen ist. |
| `sellerType` | Serverseitig aufgelöst — die Tabelle zeigt Provision und Gebühr als read-only Spalten, abgeleitet vom Typ. **Kein Override pro Verkäufer** in dieser App (siehe [`entities/verkaeufer-typ.md`](../entities/verkaeufer-typ.md)); eigene Konditionsfelder gibt es erst in der Haupt-App. |
| `isAdmin` | Quelle des `role`-Claims im JWT. Gepflegt über die Checkbox in Panel 05. |
| `articleCount` | Anzahl eigener Artikel — Spalte „Artikel" |
| `hasPendingInvite` | `true`, solange ein unverbrauchtes, nicht abgelaufenes `inviteToken` existiert. Das Token selbst wird **nie** ausgeliefert. |

**Nie ausgeliefert:** `passwordHash` und `inviteToken` — sie existieren nur in der
Entität (siehe [`entities/verkaeufer.md`](../entities/verkaeufer.md)). Refresh-Tokens
liegen in einer eigenen Tabelle und erscheinen in keinem Verkäufer-DTO.

---

## 1. `GET /api/sellers`

**Query-Parameter**

| Parameter | Bedeutung |
|---|---|
| `search` | Freitext über Vorname, Nachname, Ort, E-Mail; Vergleichsregeln → [`cross-cutting.md`](cross-cutting.md) Abschnitt 4 |
| `page`, `pageSize`, `sort` | [`cross-cutting.md`](cross-cutting.md) Abschnitt 4 |

Sortierbar: `startNumber`, `firstName`, `lastName`, `postalCode`, `city`,
`sellerType.name`, `commissionRate`, `itemFee`, `articleCount`
(Multi-Sort per Shift+Klick).

**Response `200`** — paginierte Hülle mit Verkäufer-Objekten

---

## 2. `POST /api/sellers`

Legt den Verkäufer **ohne Passwort** an. Der Zugang entsteht erst über den
Einladungs-Link (Abschnitt 5) und `POST /api/auth/set-password`.

**Request**
```json
{
  "firstName": "Anna", "lastName": "Beispiel",
  "address": "Hauptstr. 1", "postalCode": "76133", "city": "Karlsruhe",
  "phone": "0721 12345", "email": "anna@example.com",
  "sellerTypeId": "t1b2c3d4",
  "isAdmin": false,
  "startNumber": 101,
  "blockCount": 2
}
```

| Feld | Pflicht | Bemerkung |
|---|---|---|
| `firstName`, `lastName`, `postalCode`, `city`, `phone`, `email` | ✅ | Panel 01–02 |
| `address` | ❌ | Panel 02 |
| `sellerTypeId` | ✅ | Panel 03, nur bestehende Typen — **kein Inline-Anlegen** wie bei Marke/Kategorie, weil ein Typ zwingend Provision und Gebühr braucht, das AutoComplete-Modal aber nur ein Namensfeld hat |
| `isAdmin` | ❌ | Default `false` |
| `startNumber` | ❌ | Default: nächste freie Nummer |
| `blockCount` | ❌ | Default: `defaultBlockCount` aus den [Einstellungen](settings.md) |

**Serverseitig:** Verkäufer anlegen und `blockCount` zusammenhängende Blöcke ab
`startNumber` reservieren — **derselbe** `NumberBlockAllocator` wie bei
`POST /api/sellers/{id}/blocks` und `POST /api/auth/register`
([`blocks.md`](blocks.md)). Die Vergaberegel existiert genau einmal im Code.

**Response `201`** — angelegter Verkäufer

**Fehler**

| Code | `detail` |
|---|---|
| `400` | Pflichtfeld fehlt oder E-Mail-Format ungültig |
| `409` | `errorCode: seller.email_taken` — „Diese E-Mail ist bereits registriert" |
| `409` | `errorCode: block.overlap` — „Nummernbereich überschneidet sich mit bestehendem Block" |

---

## 3. `PUT /api/sellers/{id}`

Gleicher Body wie `POST`, **ohne** `startNumber`/`blockCount` — Blöcke werden
über die eigenen Routen verwaltet.

`email` ist hier änderbar (anders als in `PUT /api/profile`): Der Admin
korrigiert Tippfehler, ohne das Passwort des Verkäufers zu kennen.

**Response `200`** — aktualisierter Verkäufer

**Fehler:** `400` Validierung · `404` unbekannte ID · `409` E-Mail vergeben

---

## 4. `DELETE /api/sellers/{id}`

> **Neuer Endpoint.** Epic_Verkaeufer hatte keinen Delete, obwohl Epic_Profil
> Abschnitt 4 festhält, dass die Löschung eines Admin-Accounts „nur durch einen
> anderen Admin über die Verkäufer-Verwaltung" möglich ist. Ohne diese Route
> gäbe es in der ganzen App keinen Weg, einen fremden Account zu entfernen.

**Kaskade** — identisch mit der Selbstlöschung in [`profile.md`](profile.md):
1. alle Artikel des Verkäufers löschen
2. anschließend alle seine Nummernblöcke freigeben
3. alle seine Refresh-Token-Zeilen löschen — der Zugang ist damit sofort tot, statt
   noch bis zu 30 Tage refreshbar zu bleiben

Hard-Delete ([`cross-cutting.md`](cross-cutting.md) Abschnitt 5).

**Response `204`**

**Fehler**

| Code | `detail` |
|---|---|
| `404` | Unbekannte ID |
| `409` | `errorCode: seller.last_admin` — „Der letzte Admin kann nicht gelöscht werden", verhindert, dass sich das System ohne Admin wiederfindet |
| `409` | `errorCode: seller.self_delete_via_profile` — „Zum Löschen des eigenen Accounts das Profil verwenden"; Selbstlöschung läuft über `DELETE /api/profile`, das für Admins seinerseits `403` liefert |

---

## 5. `POST /api/sellers/{id}/invite`

Erzeugt ein einmaliges `inviteToken` (7 Tage gültig,
`inviteTokenExpiresAt`) und gibt den fertigen Link zurück.

**Response `200`**
```json
{
  "inviteUrl": "https://voranmeldung.example.org/set-password?token=6f3a…",
  "expiresAt": "2026-08-24T12:00:00+02:00"
}
```

Das Backend baut die **vollständige URL** aus seiner konfigurierten Basis-URL —
das Frontend setzt keine URLs zusammen, es kopiert nur in die Zwischenablage und
zeigt den Toast „✓ Einladungs-Link kopiert!" (Epic_Verkaeufer AC-9).

**Wiederholter Aufruf** erzeugt ein **neues** Token und entwertet das alte —
ein versehentlich verschickter Link lässt sich so zurückziehen.

Eingelöst wird der Link über
[`POST /api/auth/set-password`](auth.md), das das Token verbraucht.

**Fehler:** `404` unbekannte ID

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #verkaeufer #admin #invite #crud #pagination
