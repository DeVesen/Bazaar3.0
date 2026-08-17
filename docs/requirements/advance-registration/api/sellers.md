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
Component → [`verkaeufer-dialog.md`](../components/forms/verkaeufer-dialog.md)

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
  "startNummer": 101,
  "vorname": "Anna",
  "nachname": "Beispiel",
  "anschrift": "Hauptstr. 1",
  "plz": "76133",
  "ort": "Karlsruhe",
  "telefon": "0721 12345",
  "email": "anna@example.com",
  "verkaueferTypeId": "t1b2c3d4",
  "sellerType": {
    "id": "t1b2c3d4",
    "bezeichnung": "Standard",
    "verkaufsprovisionAnteil": 15.0,
    "abgabegebuehr": 0.50
  },
  "istAdmin": false,
  "articleCount": 12,
  "hatOffeneEinladung": false
}
```

| Feld | Bemerkung |
|---|---|
| `startNummer` | `vonNummer` des **ersten** Nummernblocks — das ist die Spalte „Nr." der Admin-Tabelle. **Kein eigenes Feld in der Entity**, sondern abgeleitet: eine zweite fortlaufende Nummernwelt neben den Artikelnummern wäre nur verwechslungsanfällig, und am Basar-Tag wird ohnehin nach „Verkäufer 101" gesucht. `null`, solange kein Block zugewiesen ist. |
| `sellerType` | Serverseitig aufgelöst — die Tabelle zeigt Provision und Gebühr als read-only Spalten, abgeleitet vom Typ. **Kein Override pro Verkäufer** in der Voranmelde-App (siehe [`entities.md`](../../entities.md)); `umsatzVerkaufsprovision`/`gebuehrProStueck` sind Haupt-App-exklusiv. |
| `istAdmin` | Quelle des `role`-Claims im JWT. Gepflegt über die Checkbox in Panel 05. |
| `articleCount` | Anzahl eigener Artikel — Spalte „Artikel" |
| `hatOffeneEinladung` | `true`, solange ein unverbrauchtes, nicht abgelaufenes `inviteToken` existiert. Das Token selbst wird **nie** ausgeliefert. |

---

## 1. `GET /api/sellers`

**Query-Parameter**

| Parameter | Bedeutung |
|---|---|
| `search` | Freitext über Vorname, Nachname, Ort, E-Mail |
| `page`, `pageSize`, `sort` | [`cross-cutting.md`](cross-cutting.md) Abschnitt 4 |

Sortierbar: `startNummer`, `vorname`, `nachname`, `plz`, `ort`,
`sellerType.bezeichnung`, `verkaufsprovisionAnteil`, `abgabegebuehr`,
`articleCount` (Multi-Sort per Shift+Klick).

**Response `200`** — paginierte Hülle mit Verkäufer-Objekten

---

## 2. `POST /api/sellers`

Legt den Verkäufer **ohne Passwort** an. Der Zugang entsteht erst über den
Einladungs-Link (Abschnitt 5) und `POST /api/auth/set-password`.

**Request**
```json
{
  "vorname": "Anna", "nachname": "Beispiel",
  "anschrift": "Hauptstr. 1", "plz": "76133", "ort": "Karlsruhe",
  "telefon": "0721 12345", "email": "anna@example.com",
  "verkaueferTypeId": "t1b2c3d4",
  "istAdmin": false,
  "startNumber": 101,
  "blockCount": 2
}
```

| Feld | Pflicht | Bemerkung |
|---|---|---|
| `vorname`, `nachname`, `plz`, `ort`, `telefon`, `email` | ✅ | Panel 01–02 |
| `anschrift` | ❌ | Panel 02 |
| `verkaueferTypeId` | ✅ | Panel 03, nur bestehende Typen — **kein Inline-Anlegen** wie bei Marke/Kategorie, weil ein Typ zwingend Provision und Gebühr braucht, das AutoComplete-Modal aber nur ein Namensfeld hat |
| `istAdmin` | ❌ | Default `false` |
| `startNumber` | ❌ | Default: nächste freie Nummer |
| `blockCount` | ❌ | Default: `defaultBlockCount` aus den [Einstellungen](settings.md) |

**Serverseitig:** Verkäufer anlegen und `blockCount` zusammenhängende Blöcke ab
`startNumber` reservieren — dieselbe Vergabe- und Überschneidungsprüfung wie
`POST /api/sellers/{id}/blocks` ([`blocks.md`](blocks.md)).

**Response `201`** — angelegter Verkäufer

**Fehler**

| Code | `detail` |
|---|---|
| `400` | Pflichtfeld fehlt oder E-Mail-Format ungültig |
| `409` | „Diese E-Mail ist bereits registriert" |
| `409` | „Nummernbereich überschneidet sich mit bestehendem Block" |

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

Hard-Delete ([`cross-cutting.md`](cross-cutting.md) Abschnitt 5).

**Response `204`**

**Fehler**

| Code | `detail` |
|---|---|
| `404` | Unbekannte ID |
| `409` | „Der letzte Admin kann nicht gelöscht werden" — verhindert, dass sich das System ohne Admin wiederfindet |
| `409` | „Zum Löschen des eigenen Accounts das Profil verwenden" — Selbstlöschung läuft über `DELETE /api/profile`, das für Admins seinerseits `403` liefert |

---

## 5. `POST /api/sellers/{id}/invite`

Erzeugt ein einmaliges `inviteToken` (7 Tage gültig,
`inviteTokenExpiresAt`) und gibt den fertigen Link zurück.

**Response `200`**
```json
{
  "inviteUrl": "https://voranmeldung.example.org/passwort-setzen?token=6f3a…",
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
