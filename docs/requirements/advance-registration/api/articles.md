---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Artikel

Eine Ressource, zwei Sichten: der Verkäufer verwaltet seine eigenen Artikel
(volles CRUD), der Admin sieht alle — ausschließlich lesend.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epics → [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) ·
[Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) ·
Entity → [`entities/artikel.md`](../entities/artikel.md) ·
Components → [`artikel-dialog.md`](../components/forms/artikel-dialog.md),
[`artikel-readonly-modal.md`](../components/forms/artikel-readonly-modal.md),
[`filter-panel.md`](../components/custom/filter-panel.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/articles/mine` | `authenticated` | Eigene Artikel, paginiert + gefiltert |
| `POST /api/articles` | `authenticated` | Artikel anlegen |
| `PUT /api/articles/{id}` | `authenticated` | Eigenen Artikel ändern |
| `DELETE /api/articles/{id}` | `authenticated` | Eigenen Artikel löschen |
| `GET /api/articles` | `admin` | Alle Artikel aller Verkäufer, paginiert + gefiltert |
| `GET /api/articles/{id}` | `admin` | Readonly-Detail inkl. Verkäufer |

**Ownership:** `PUT`/`DELETE` und `/mine` prüfen `sellerId` gegen den
`sub`-Claim. Ein fremder Artikel liefert `404`, nicht `403`
(siehe [`cross-cutting.md`](cross-cutting.md) Abschnitt 6).

Ein Admin bearbeitet seine eigenen Artikel über dieselben
`authenticated`-Endpoints wie jeder Verkäufer. Fremde Artikel kann **niemand**
bearbeiten — die Admin-Sicht ist rein lesend (Epic_Alle_Artikel Überblick).

---

## Artikel-Objekt

```json
{
  "id": "b7c2e991",
  "number": 104,
  "sellerId": "a3f9c2d1",
  "name": "Winterjacke",
  "brand": "Jako-O",
  "category": "Jacken",
  "price": 12.50,
  "size": "116",
  "color": "rot",
  "description": "kaum getragen",
  "createdAt": "2026-08-14T10:22:31+02:00",
  "updatedAt": "2026-08-14T10:22:31+02:00"
}
```

**Pflicht:** `name`, `brand`, `category`, `price`.
**Optional:** `size`, `color`, `description`.
Alles Übrige wird serverseitig gesetzt.

**Kein Status-Feld.** Das Statusmodell beruht auf vier Zeitstempeln, die alle
Haupt-App-exklusiv sind (siehe [`entities/artikel.md`](../entities/artikel.md)). In der Voranmelde-App ist jeder Artikel implizit
„registriert".

**`brand` und `category` sind denormalisierte Strings, keine FKs** — daher
filtert man nach Namen, nicht nach IDs (siehe unten und
[`master-data.md`](master-data.md)).

---

## Query-Parameter (beide Listen-Endpoints)

| Parameter | Typ | Gilt für | Bedeutung |
|---|---|---|---|
| `brand` | string | beide | exakter Match auf `brand` |
| `category` | string | beide | exakter Match auf `category` |
| `search` | string | beide | Freitext, Felder je Endpoint (siehe unten) |
| `sellerId` | string | nur `GET /api/articles` | Match auf `sellerId` |
| `page`, `pageSize` | int | beide | [`cross-cutting.md`](cross-cutting.md) Abschnitt 4 |
| `sort` | string | beide | z. B. `sort=number:asc,price:desc` — Reihenfolge = Sortier-Priorität, deckt Multi-Sort per Shift+Klick ab |

Alle Filter sind UND-verknüpft. Kein Filter gesetzt → vollständige (paginierte)
Liste.

**Suche wird explizit ausgelöst** — kein Live-Filter beim Tippen. Enter im
Freitext- oder Select-Feld oder Klick auf „Suchen" feuern denselben Request
(siehe [`filter-panel.md`](../components/custom/filter-panel.md)).

---

## 1. `GET /api/articles/mine`

Eigene Artikel des eingeloggten Nutzers.

`search` durchsucht: `number`, `name`, `category`, `brand`.

**Response `200`** — paginierte Hülle mit Artikel-Objekten:

```json
{ "items": [ /* Artikel */ ], "totalCount": 12, "page": 1, "pageSize": 25 }
```

---

## 2. `POST /api/articles`

**Request**
```json
{
  "name": "Winterjacke",
  "brand": "Jako-O",
  "category": "Jacken",
  "price": 12.50,
  "size": "116",
  "color": "rot",
  "description": "kaum getragen"
}
```

**Keine `number` im Request.** Die Artikelnummer vergibt das Backend aus dem
nächsten freien Platz im Nummernblock des Verkäufers; ein Verkäufer kann sie
nicht wählen. Ist der aktuelle Block aufgebraucht, weist das Backend in
derselben Transaktion automatisch den nächsten freien Block zu (kanonische Regel
→ [`blocks.md`](blocks.md) Abschnitt 5, Epic_Nummernbloecke Abschnitt 2).

`sellerId` wird aus dem `sub`-Claim gesetzt, nicht aus dem Request
übernommen.

**Legt `brand`/`category` nicht automatisch als Stammdatum an.** Das passiert
separat über das AutoComplete-Anlegen-Modal gegen
[`POST /api/brands`](master-data.md) bzw. `POST /api/categories`, bevor der
Artikel gespeichert wird.

**Response `201`** — angelegter Artikel

**Fehler**

| Code | Bedeutung |
|---|---|
| `400` | Pflichtfeld fehlt, oder `price` ≤ 0 → `errors.price: ["Preis muss größer als 0 sein"]` (Epic_Meine_Artikel AC-6) |
| `409` | `errorCode: article.no_free_number` — „Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren", wenn global keine Nummer mehr vergeben werden kann |

---

## 3. `PUT /api/articles/{id}`

Gleicher Request-Body wie `POST`. `number` und `sellerId` sind **nicht**
änderbar — die Artikelnummer ist im Dialog schreibgeschützt.

**Response `200`** — aktualisierter Artikel · **`404`** bei fremdem oder
unbekanntem Artikel

`updatedAt` wird serverseitig gesetzt und speist die Aktivitäts-Heatmap
(siehe [`home.md`](home.md)).

---

## 4. `DELETE /api/articles/{id}`

Hard-Delete. Die freigewordene `number` wird **nicht** wiederverwendet — der
Nummernblock zählt weiter hoch.

**Response `204`** · **`404`** bei fremdem oder unbekanntem Artikel

Das Frontend fragt vorher über einen
[Confirmdialog](../components/standard/confirmdialog.md) nach
(Epic_Meine_Artikel AC-5).

---

## 5. `GET /api/articles` (Admin)

Alle Artikel aller Verkäufer.

`search` durchsucht: `number`, `name`, `category`, `brand`,
**Verkäufer-Vorname und -Nachname** (Epic_Alle_Artikel AC-3).

Jedes Item trägt zusätzlich den aufgelösten Verkäufer für die Spalte
„Verkäufer" und die Sortierung danach:

```json
{
  "items": [
    {
      "id": "b7c2e991", "number": 104, "name": "Winterjacke",
      "brand": "Jako-O", "category": "Jacken", "price": 12.50,
      "size": "116", "color": "rot", "description": "kaum getragen",
      "createdAt": "…", "updatedAt": "…",
      "seller": { "id": "a3f9c2d1", "startNumber": 101, "firstName": "Anna", "lastName": "Beispiel" }
    }
  ],
  "totalCount": 1372, "page": 1, "pageSize": 25
}
```

`seller.startNumber` ist die Verkäufer-Kennnummer aus der Admin-Tabelle
(= `fromNumber` seines ersten Nummernblocks, siehe [`sellers.md`](sellers.md)),
**nicht** die Artikelnummer.

---

## 6. `GET /api/articles/{id}` (Admin)

Readonly-Detail für das Modal — dasselbe Objekt wie ein Item aus Abschnitt 5,
inklusive `seller`. Das Modal hat nur einen Schließen-Button, es gibt daher
bewusst **kein** `PUT`/`DELETE` auf fremde Artikel.

**Response `200`** · **`404`** bei unbekannter ID

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #artikel #crud #filter #pagination #ownership
