---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# API: Artikel

Eine Ressource, zwei Sichten: der Verkäufer verwaltet seine eigenen Artikel
(volles CRUD), der Admin sieht alle — ausschließlich lesend.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epics → [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) ·
[Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) ·
Entity → [`entities/artikel.md`](../entities/artikel.md) ·
Components → [`artikel-dialog.md`](../components/artikel-dialog.md),
[`artikel-readonly-modal.md`](../components/artikel-readonly-modal.md),
[`filter-panel.md`](../../../components/filter-panel/component.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/articles/mine` | `authenticated` | Eigene Artikel, paginiert + gefiltert |
| `GET /api/articles/next-number` | `authenticated` | Nummern-Vorschlag für den Anlege-Dialog |
| `POST /api/articles` | `authenticated` | Artikel anlegen, Antwort inkl. `nextNumber` |
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
(siehe [`filter-panel.md`](../../../components/filter-panel/component.md)).

---

## 1. `GET /api/articles/mine`

Eigene Artikel des eingeloggten Nutzers.

`search` durchsucht: `number`, `name`, `category`, `brand`.

**Response `200`** — paginierte Hülle mit Artikel-Objekten:

```json
{ "items": [ /* Artikel */ ], "totalCount": 12, "page": 1, "pageSize": 25 }
```

---

## 2. `GET /api/articles/next-number`

Liefert die Artikelnummer, die der eingeloggte Verkäufer beim nächsten Anlegen
bekäme. Das Frontend ruft den Endpoint beim Öffnen des Anlege-Dialogs und zeigt
den Wert im schreibgeschützten Feld „Artikelnummer" — der Verkäufer kennt seine
Nummer damit vor dem Speichern und kann sie direkt aufs Etikett schreiben
(Epic_Meine_Artikel AC-1).

**Response `200`**
```json
{ "number": 104 }
```

**Berechnung:** dieselbe Vergabe-Kaskade wie beim echten Anlegen, nur ohne zu
schreiben (→ [`blocks.md`](blocks.md) Abschnitt 5): Stufe 1 liefert den nächsten
freien Platz in den bestehenden Blöcken, Stufe 2 die `fromNumber` des Blocks, den
die automatische Erweiterung anlegen würde, Stufe 3 den `409`.

**Der Vorschlag ist unverbindlich und reserviert nichts.** Der Endpoint schreibt
nicht — er legt keinen Block an und vergibt keine Nummer. Zwei parallele
Anlegevorgänge desselben Verkäufers (zwei Tabs, zwei Geräte) sehen daher beide
dieselbe Nummer; der zweite läuft beim Speichern in den Konflikt aus
Abschnitt 3. Eine echte Reservierung mit Ablauf-Logik wurde bewusst verworfen:
sie brächte TTL-Verwaltung, einen Cleanup-Job und Nummernlücken bei jedem
Dialog-Abbruch.

**Implementierung:** derselbe `NumberBlockAllocator` wie die echte Vergabe, nur
im Dry-Run-Pfad — die Vergaberegel darf nicht in zwei Code-Pfaden getrennt
existieren, sonst laufen Vorschlag und tatsächliche Nummer auseinander.

**Fehler:** `409` `errorCode: article.no_free_number` — gleiche Meldung wie in
Abschnitt 3, gleicher **Notfall-Pfad** (Stufe 3 der Kaskade). Das Anlegen scheitert
damit bereits beim Öffnen des Dialogs statt erst nach vollständiger Eingabe. Ein
aufgebrauchter Block des Verkäufers ist **kein** Grund für diesen Fehler — der
Dry-Run liefert dann die `fromNumber` aus Stufe 2.

---

## 3. `POST /api/articles`

**Request**
```json
{
  "name": "Winterjacke",
  "brand": "Jako-O",
  "category": "Jacken",
  "price": 12.50,
  "size": "116",
  "color": "rot",
  "description": "kaum getragen",
  "expectedNumber": 104
}
```

**Keine `number` im Request.** Die Artikelnummer vergibt das Backend aus dem
nächsten freien Platz im Nummernblock des Verkäufers; ein Verkäufer kann sie
nicht wählen. Ist der aktuelle Block aufgebraucht, weist das Backend in
derselben Transaktion automatisch den nächsten freien Block zu (kanonische Regel
→ [`blocks.md`](blocks.md) Abschnitt 5, Epic_Nummernbloecke Abschnitt 2).

`sellerId` wird aus dem `sub`-Claim gesetzt, nicht aus dem Request
übernommen.

### `expectedNumber` — Vorbedingung, keine Wahl

Optionales Feld. Es enthält den Vorschlag aus Abschnitt 2, den der Verkäufer im
Dialog gesehen hat, und wirkt als **Vorbedingung**: Weicht die Nummer, die der
Allocator jetzt vergeben würde, von `expectedNumber` ab, bricht das Backend mit
`409` ab statt still eine andere Nummer zu speichern. Der Verkäufer wählt seine
Nummer damit weiterhin nicht — er bestätigt nur, welche Nummer ihm angezeigt
wurde.

Fehlt das Feld, vergibt das Backend ohne Prüfung. Damit bleiben Aufrufer ohne
vorherigen `next-number`-Abruf (Selbstregistrierung, Skripte, Tests) unverändert
lauffähig.

**Legt `brand`/`category` nicht automatisch als Stammdatum an.** Das passiert
separat über das AutoComplete-Anlegen-Modal gegen
[`POST /api/brands`](master-data.md) bzw. `POST /api/categories`, bevor der
Artikel gespeichert wird.

**Response `201`** — angelegter Artikel, plus `nextNumber`:

```json
{
  "id": "b7c2e991", "number": 104, "sellerId": "a3f9c2d1",
  "name": "Winterjacke", "brand": "Jako-O", "category": "Jacken",
  "price": 12.50, "size": "116", "color": "rot", "description": "kaum getragen",
  "createdAt": "…", "updatedAt": "…",
  "nextNumber": 105
}
```

### `nextNumber` im `201`

Die Nummer, die derselbe Verkäufer beim **nächsten** Anlegen bekäme — dieselbe
Berechnung wie Abschnitt 2, im selben Dry-Run-Pfad, nach der Vergabe von
`number`. Sie bedient „Speichern + kopieren"
([`artikel-dialog.md`](../components/artikel-dialog.md)): der Dialog bleibt
offen und braucht die Folgenummer sofort. Gleiches Argument wie beim `409`:
spart den zweiten `next-number`-Roundtrip und schließt das Fenster, in dem der
Wert bereits wieder veraltet wäre.

**Unverbindlich und reserviert nichts** — identisch zu Abschnitt 2. Kann eine
Nummer nicht mehr vergeben werden, **fehlt das Feld**; der `201` bleibt gültig,
der Artikel ist angelegt. Kein `409` dafür — das Anlegen ist gelungen, nur die
Fortsetzung nicht (Epic_Meine_Artikel AC-10).

**Fehler**

| Code | Bedeutung |
|---|---|
| `400` | Pflichtfeld fehlt, oder `price` ≤ 0 → `errors.price: ["Preis muss größer als 0 sein"]` (Epic_Meine_Artikel AC-6) |
| `409` | `errorCode: article.number_taken` — `expectedNumber` ist inzwischen vergeben. Nichts wurde gespeichert. Zusätzliches Extension-Member `nextNumber` trägt den neuen Vorschlag: `{ "errorCode": "article.number_taken", "detail": "Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105", "nextNumber": 105 }` (Epic_Meine_Artikel AC-7) |
| `409` | `errorCode: article.no_free_number` — „Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren". **Notfall-Pfad**: nur erreichbar über Stufe 3 der Vergabe-Kaskade (→ [`blocks.md`](blocks.md) Abschnitt 5), also wenn global kein freier Bereich der Größe `blockSize` mehr existiert. Da keine Obergrenze des Nummernkreises gepflegt wird, tritt das im Normalbetrieb nicht ein. Ein aufgebrauchter Block des Verkäufers allein löst diesen Fehler **nicht** aus |

`nextNumber` erspart dem Frontend einen zweiten `next-number`-Roundtrip und
schließt das Zeitfenster, in dem auch dieser Wert schon wieder veraltet wäre.
Ganz ausschließen lässt sich die Wiederholung nicht: theoretisch kann derselbe
Konflikt beim nächsten Speichern erneut auftreten. Ein Retry-Limit gibt es
bewusst nicht — jeder Durchlauf ist eine explizite Nutzer-Entscheidung
(Speichern-Klick), keine automatische Schleife.

---

## 4. `PUT /api/articles/{id}`

Gleicher Request-Body wie `POST`, ohne `expectedNumber` — beim Bearbeiten steht
die Nummer bereits fest, es gibt nichts zu prüfen. `number` und `sellerId` sind
**nicht** änderbar; die Artikelnummer ist im Dialog schreibgeschützt.

**Response `200`** — aktualisierter Artikel · **`404`** bei fremdem oder
unbekanntem Artikel

`updatedAt` wird serverseitig gesetzt und speist die Aktivitäts-Heatmap
(siehe [`home.md`](home.md)).

---

## 5. `DELETE /api/articles/{id}`

Hard-Delete. Die freigewordene `number` wird **nicht** wiederverwendet — der
Nummernblock zählt weiter hoch.

**Response `204`** · **`404`** bei fremdem oder unbekanntem Artikel

Das Frontend fragt vorher über einen
[Confirmdialog](../../../components/confirmdialog/component.md) nach
(Epic_Meine_Artikel AC-5).

---

## 6. `GET /api/articles` (Admin)

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

## 7. `GET /api/articles/{id}` (Admin)

Readonly-Detail für das Modal — dasselbe Objekt wie ein Item aus Abschnitt 6,
inklusive `seller`. Das Modal hat nur einen Schließen-Button, es gibt daher
bewusst **kein** `PUT`/`DELETE` auf fremde Artikel.

**Response `200`** · **`404`** bei unbekannter ID

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #artikel #crud #filter #pagination #ownership
