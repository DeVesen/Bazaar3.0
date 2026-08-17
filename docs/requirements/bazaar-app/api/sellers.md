---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Verkäufer

Stammdaten der Verkäufer. Fachliche Quelle → [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) und [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md), Entity → [`entities/verkaeufer.md`](../entities/verkaeufer.md).

Abrechnung liegt in [`settlement.md`](settlement.md), Freigabe-Vorgang in [`release.md`](release.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md)

| Endpoint | Auth |
|---|---|
| `GET /api/sellers` | `authenticated` |
| `GET /api/sellers/search` | `authenticated` |
| `POST /api/sellers` | `authenticated` |
| `PUT /api/sellers/{id}` | `authenticated` (Konditionsfelder nur `admin`) |
| `DELETE /api/sellers/{id}` | `authenticated` (nur ohne Artikel) |
| `GET /api/sellers/{id}/articles` | `authenticated` |

---

## 1. `GET /api/sellers` — Liste mit Aggregaten

Für das Karten-Grid der Verkäufer-Seite. Paginiert, 60 je Seite.

```
GET /api/sellers?page=1&pageSize=60&q=meier&status=selling&sort=revenue:desc

→ 200 OK
{
  "items": [
    {
      "id": "a3f9c2d1",
      "firstName": "Anna", "lastName": "Meier",
      "postalCode": "76133", "city": "Karlsruhe",
      "sellerType": "Privat",
      "status": "selling",
      "articleCount": 42, "releasedCount": 40,
      "soldCount": 31, "returnedCount": 9,
      "acceptedValue": 512.50, "openValue": 96.00, "revenue": 380.50,
      "settledAt": null
    }
  ],
  "totalCount": 137, "page": 1, "pageSize": 60
}
```

| Parameter | Werte |
|---|---|
| `q` | Freitext über ID, Vor- und Nachname, Ort |
| `status` | `open` \| `selling` \| `settled` |
| `sort` | `name`, `acceptedValue`, `openValue`, `revenue` — Default `name:asc` |

**Die Aggregate kommen aus einem Query-Port**, nicht aus dem Repository — ein Read-Model für die ganze Seite. Würde das Frontend rechnen, müsste es alle Artikel aller Verkäufer laden; würde jede Karte einzeln nachfragen, wären es bei 200 Verkäufern 200 Requests.

`status` ist **abgeleitet**, kein Feld: `settled` wenn `settledAt` gesetzt, `selling` wenn mindestens ein Artikel freigegeben und nicht abgerechnet, sonst `open`.

---

## 2. `GET /api/sellers/search` — schmale Suche

Für die Verkäufer-Auswahl in Artikelannahme und Abrechnung. **Nicht paginiert**, ohne Aggregate.

```
GET /api/sellers/search?q=mei

→ 200 OK
[
  { "id": "a3f9c2d1", "firstName": "Anna", "lastName": "Meier",
    "city": "Karlsruhe", "sellerType": "Privat" }
]
```

**Warum ein eigener Endpoint** und nicht `GET /api/sellers` mit `q`: Die Suche läuft nach jedem Tastendruck (Debounce) — sie darf keine Summen über alle Artikel auslösen. Ein `view`-Parameter auf einem Endpoint würde dieselbe Trennung erzeugen, sie aber im Vertrag verstecken.

Bei leerem `q` liefert der Endpoint alle Verkäufer, weil die Such-Ansicht ohne Eingabe die vollständige Liste zeigt ([Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) Abschnitt 1).

---

## 3. `POST /api/sellers`

```
POST /api/sellers
{
  "firstName": "Anna", "lastName": "Meier",
  "email": "anna@example.org",
  "sellerTypeId": "b7c1e4f2",
  "address": null, "postalCode": null, "city": null, "phone": null
}

→ 201 Created   Location: /api/sellers/a3f9c2d1
→ 400 Bad Request   errors: { "sellerTypeId": ["Verkäufer-Typ ist erforderlich"] }
```

**Pflicht:** `firstName`, `lastName`, `email`, `sellerTypeId`. Adresse, PLZ, Ort und Telefon bleiben optional, weil Laufkundschaft erfasst wird, während eine Schlange wartet.

**Der Server belegt `salesCommission` und `feePerItem` aus dem Typ** — sie werden im Request **nicht** akzeptiert. Ein Kassenvorgang darf keine Konditionen setzen ([`seller-types.md`](seller-types.md)).

`intakeFeePaid` startet bei `0`, `payoutAmount` und `settledAt` bleiben leer.

---

## 4. `PUT /api/sellers/{id}`

```
PUT /api/sellers/{id}
{
  "firstName": "Anna", "lastName": "Meier", "email": "…",
  "address": "…", "postalCode": "…", "city": "…", "phone": "…",
  "sellerTypeId": "c2d8a1b9",
  "salesCommission": 12.5, "feePerItem": 0.50
}

→ 204 No Content
→ 403 Forbidden   errorCode: seller.conditions_admin_only
→ 409 Conflict    errorCode: settlement.locked
```

**Feldbezogene Rollenprüfung — die einzige der API:** `salesCommission` und `feePerItem` wirken nur mit Rolle `admin`. Sendet Kassenpersonal sie mit, antwortet der Endpoint `403` statt sie stillschweigend zu ignorieren — stilles Verwerfen würde im Frontend wie ein Erfolg aussehen.

**Typwechsel überschreibt die Konditionen** mit den Werten des neuen Typs, auch manuell gesetzte. Die Bestätigung dafür holt das Frontend vorher ein ([Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) Abschnitt 3).

Ist der Verkäufer abgerechnet, sind alle Felder gesperrt (`409`, siehe [`cross-cutting.md`](cross-cutting.md) Abschnitt 7).

---

## 5. `DELETE /api/sellers/{id}`

```
DELETE /api/sellers/{id}

→ 204 No Content
→ 409 Conflict   errorCode: seller.has_articles
                 detail: "Verkäufer hat noch 12 Artikel"
```

**`authenticated`, nicht `admin`** — die Sicherheit trägt hier die Datenbedingung, nicht die Rolle: **Löschbar nur, wenn der Verkäufer keine Artikel hat.**

Begründung: Ein Verkäufer ohne Artikel ist entweder eine gerade entstandene Fehleingabe (Wizard-Abbruch, doppelt angelegt) oder ein Laufkunde, der nie abgegeben hat — es geht nichts verloren. Importierte Verkäufer haben immer mindestens einen Artikel, weil der Export der Voranmelde-App nur solche mitnimmt. Ein Sonderrecht für den Admin würde nichts zusätzlich schützen, aber Kassenpersonal daran hindern, die eigene Fehleingabe zurückzunehmen.

Der Grenzfall „Verkäufer mit Artikeln entfernen" existiert nur beim Import, und dort ist es ein **Ersetzen** desselben Verkäufers in neuerem Stand ([`import.md`](import.md)).

---

## 6. `GET /api/sellers/{id}/articles`

Artikelliste eines Verkäufers für das Detail-Modal ([Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) Abschnitt 5) und die Abrechnungs-Ansicht. **Nicht paginiert** — ein Verkäufer hat Dutzende Artikel, keine Tausende.

```
GET /api/sellers/{id}/articles

→ 200 OK
[
  { "id": "e5b2c9a4", "number": 1043, "name": "Winterjacke",
    "brand": "Nike", "category": "Jacken", "price": 12.00,
    "status": "sold", "soldManually": false }
]
```

`status` ist abgeleitet (`registered` \| `selling` \| `sold` \| `returned`), siehe [`entities/artikel.md`](../entities/artikel.md).

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #verkaeufer #query-port #pagination
