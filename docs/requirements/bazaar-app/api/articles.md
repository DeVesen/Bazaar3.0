---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Artikel

Artikelliste, Korrektur und Zeitstempel. Fachliche Quelle → [Epic_Artikel](../epics/Epic_Artikel/epic.md), Entity → [`entities/artikel.md`](../entities/artikel.md).

Artikel **entstehen** nicht hier, sondern über [`intake.md`](intake.md) oder [`import.md`](import.md). Zustandswechsel im Tagesgeschäft: [`release.md`](release.md), [`sales.md`](sales.md), [`settlement.md`](settlement.md).

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md), insbesondere Abschnitt 7 (Sperrregeln).

| Endpoint | Auth |
|---|---|
| `GET /api/articles` | `authenticated` |
| `GET /api/articles/by-number/{number}` | `authenticated` |
| `GET /api/articles/next-number` | `authenticated` |
| `PUT /api/articles/{id}` | `authenticated` |
| `PUT /api/articles/{id}/timestamps` | `admin` |
| `DELETE /api/articles/{id}` | `admin` |

---

## 1. `GET /api/articles` — Liste

Paginiert, 50 je Seite. Freitext, Filter und Sortierung serverseitig.

```
GET /api/articles?page=1&pageSize=50&q=jacke&brand=Nike&category=Jacken&status=selling&sort=number:asc

→ 200 OK
{
  "items": [
    { "id": "e5b2c9a4", "number": 1043, "name": "Winterjacke",
      "brand": "Nike", "category": "Jacken", "price": 12.00,
      "status": "selling", "soldManually": false,
      "sellerId": "a3f9c2d1", "sellerName": "Anna Meier" }
  ],
  "totalCount": 812, "page": 1, "pageSize": 50
}
```

| Parameter | Werte |
|---|---|
| `q` | Freitext über **Nummer, Bezeichnung, Marke, Kategorie und Verkäufername** |
| `brand`, `category` | exakter Name |
| `status` | `registered` \| `selling` \| `sold` \| `returned` |
| `sort` | `number`, `name`, `category`, `brand`, `price`, `status`, `sellerName` — Default `number:asc` |

Einen Filter über den *Verkäufer-Status* gibt es hier bewusst nicht — er beantwortet auf einer Artikelliste keine Frage ([Epic_Artikel](../epics/Epic_Artikel/epic.md) Abschnitt 1).

---

## 2. `GET /api/articles/by-number/{number}` — Nummernsuche

Ein Endpoint, zwei Lesarten. Genutzt von der Kasse zur Artikel-Erkennung und von der Artikelannahme zur Eindeutigkeitsprüfung.

```
GET /api/articles/by-number/1043

→ 200 OK
   { "id": "e5b2c9a4", "number": 1043, "name": "Winterjacke",
     "price": 12.00, "status": "selling",
     "sellerId": "a3f9c2d1", "sellerName": "Anna Meier" }

→ 404 Not Found   errorCode: article.number_unknown
```

| Aufrufer | Lesart |
|---|---|
| [Verkauf](../epics/Epic_Verkauf/epic.md) | `200` → Status prüfen: `selling` ist verkäuflich, alles andere führt zur roten InfoArea |
| [Artikelannahme](../epics/Epic_Artikelannahme/epic.md) | `404` → **Nummer ist frei**, `200` → „Artikelnummer bereits vergeben" |

Ein zweiter Endpoint, der dieselbe Zeile sucht und nur ein Boolean liefert, wäre derselbe Vertrag mit weniger Information — darum gibt es kein `number-available`.

---

## 3. `GET /api/articles/next-number` — Nummernvorschlag

```
GET /api/articles/next-number

→ 200 OK   { "nextNumber": 1288 }
```

Liefert die **nächste freie Nummer oberhalb des höchsten vergebenen Werts** — als Vorschlag für Verkäufer ohne Voranmeldung, damit sie nicht in einen vorangemeldeten Nummernbereich hineinlaufen.

**Der Vorschlag reserviert nichts.** Zwei parallele Annahmevorgänge sehen denselben Wert; die Eindeutigkeit entscheidet erst `POST /api/intake` ([`intake.md`](intake.md)). Diese App vergibt keine Nummern, sie prüft sie — ein Nummernblock-System gibt es nur in der Voranmelde-App.

---

## 4. `PUT /api/articles/{id}` — Stammfelder

```
PUT /api/articles/{id}
{ "name": "Winterjacke", "brand": "Nike", "category": "Jacken",
  "price": 12.00, "size": "128", "color": "rot", "description": null }

→ 204 No Content
→ 409 Conflict   errorCode: article.sold          (price nach Verkauf)
→ 409 Conflict   errorCode: settlement.locked     (Verkäufer abgerechnet)
```

**Beide Rollen dürfen bearbeiten** — ein Tippfehler beim Preis muss korrigierbar sein, solange der Verkäufer noch am Tisch steht; der Weg über den Admin würde die Schlange aufhalten.

**Gestaffelte Sperre** (Details → [`cross-cutting.md`](cross-cutting.md) Abschnitt 7):

| Zustand | Änderbar |
|---|---|
| im Verkauf | alles |
| `soldAt` gesetzt | alles **außer `price`** — der Preis *ist* der Umsatz |
| Verkäufer abgerechnet | nichts |

`number` und `sellerId` sind **nie** änderbar: Die Nummer klebt physisch am Artikel, und ein Artikel wechselt nicht den Besitzer.

---

## 5. `PUT /api/articles/{id}/timestamps` — Zeitstempel korrigieren

Das Artikelstatus-Popup. **Admin-only.**

```
PUT /api/articles/{id}/timestamps
{ "releasedAt": "2026-08-17T08:12:00Z",
  "soldAt": null,
  "returnedAt": null }

→ 204 No Content
→ 409 Conflict   errorCode: settlement.locked
→ 409 Conflict   errorCode: article.sold_and_returned
```

**Vollersetzung der drei setzbaren Zeitstempel.** `createdAt` und der Abrechnungszeitpunkt sind nicht Teil des Requests — der erste ist unveränderlich, der zweite gehört dem Verkäufer, nicht dem Artikel.

**Kaskade:** Wird ein früherer Zeitstempel auf `null` gesetzt, müssen alle nachfolgenden ebenfalls `null` sein. Der Server prüft das und lehnt inkonsistente Kombinationen ab; welche Zeitstempel dabei mitgehen, zeigt das Frontend **vorher** im Bestätigungsdialog ([Epic_Artikel](../epics/Epic_Artikel/epic.md) AC-11).

**Gegenseitige Sperre:** `soldAt` und `returnedAt` dürfen nicht gleichzeitig gesetzt sein → `409`.

**Manueller Verkauf:** Wird `soldAt` über diesen Endpoint gesetzt, setzt der Server zugleich `soldManually = true`. Der Kassenvorgang ([`sales.md`](sales.md)) tut das nicht. Ohne dieses Bit wäre eine Differenz in der Geldschublade keiner Ursache zuzuordnen.

---

## 6. `DELETE /api/articles/{id}`

```
DELETE /api/articles/{id}

→ 204 No Content
→ 409 Conflict   errorCode: article.sold           (soldAt gesetzt)
→ 409 Conflict   errorCode: settlement.locked
```

**Admin-only, und nur solange `soldAt` leer ist.** Ein verkaufter Artikel ist ein Geldvorgang, kein Datensatz — ihn zu entfernen würde die Kassenabstimmung unmöglich machen. Für Fehleingaben vor dem Verkauf bleibt Löschen frei.

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #api #artikel #zeitstempel #sperren #pagination
