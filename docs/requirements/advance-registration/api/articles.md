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

**Ownership:** `PUT`/`DELETE` und `/mine` prüfen `verkaeuferId` gegen den
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
  "nummer": 104,
  "verkaeuferId": "a3f9c2d1",
  "bezeichnung": "Winterjacke",
  "marke": "Jako-O",
  "kategorie": "Jacken",
  "preis": 12.50,
  "groesse": "116",
  "farbe": "rot",
  "beschreibung": "kaum getragen",
  "erstelltAm": "2026-08-14T10:22:31+02:00",
  "updatedAm": "2026-08-14T10:22:31+02:00"
}
```

**Pflicht:** `bezeichnung`, `marke`, `kategorie`, `preis`.
**Optional:** `groesse`, `farbe`, `beschreibung`.
Alles Übrige wird serverseitig gesetzt.

**Kein Status-Feld.** Das Statusmodell aus
[`entities.md`](../../entities.md) beruht auf vier Zeitstempeln, die alle
Haupt-App-exklusiv sind. In der Voranmelde-App ist jeder Artikel implizit
„registriert".

**`marke` und `kategorie` sind denormalisierte Strings, keine FKs** — daher
filtert man nach Namen, nicht nach IDs (siehe unten und
[`master-data.md`](master-data.md)).

---

## Query-Parameter (beide Listen-Endpoints)

| Parameter | Typ | Gilt für | Bedeutung |
|---|---|---|---|
| `brand` | string | beide | exakter Match auf `marke` |
| `category` | string | beide | exakter Match auf `kategorie` |
| `search` | string | beide | Freitext, Felder je Endpoint (siehe unten) |
| `sellerId` | string | nur `GET /api/articles` | Match auf `verkaeuferId` |
| `page`, `pageSize` | int | beide | [`cross-cutting.md`](cross-cutting.md) Abschnitt 4 |
| `sort` | string | beide | z. B. `sort=nummer:asc,preis:desc` — Reihenfolge = Sortier-Priorität, deckt Multi-Sort per Shift+Klick ab |

Alle Filter sind UND-verknüpft. Kein Filter gesetzt → vollständige (paginierte)
Liste.

**Suche wird explizit ausgelöst** — kein Live-Filter beim Tippen. Enter im
Freitext- oder Select-Feld oder Klick auf „Suchen" feuern denselben Request
(siehe [`filter-panel.md`](../components/custom/filter-panel.md)).

---

## 1. `GET /api/articles/mine`

Eigene Artikel des eingeloggten Nutzers.

`search` durchsucht: `nummer`, `bezeichnung`, `kategorie`, `marke`.

**Response `200`** — paginierte Hülle mit Artikel-Objekten:

```json
{ "items": [ /* Artikel */ ], "totalCount": 12, "page": 1, "pageSize": 25 }
```

---

## 2. `POST /api/articles`

**Request**
```json
{
  "bezeichnung": "Winterjacke",
  "marke": "Jako-O",
  "kategorie": "Jacken",
  "preis": 12.50,
  "groesse": "116",
  "farbe": "rot",
  "beschreibung": "kaum getragen"
}
```

**Keine `nummer` im Request.** Die Artikelnummer vergibt das Backend aus dem
nächsten freien Platz im Nummernblock des Verkäufers; ein Verkäufer kann sie
nicht wählen. Ist der aktuelle Block aufgebraucht, weist das Backend in
derselben Transaktion automatisch den nächsten freien Block zu (kanonische Regel
→ [`blocks.md`](blocks.md) Abschnitt 5, Epic_Nummernbloecke Abschnitt 2).

`verkaeuferId` wird aus dem `sub`-Claim gesetzt, nicht aus dem Request
übernommen.

**Legt `marke`/`kategorie` nicht automatisch als Stammdatum an.** Das passiert
separat über das AutoComplete-Anlegen-Modal gegen
[`POST /api/brands`](master-data.md) bzw. `POST /api/categories`, bevor der
Artikel gespeichert wird.

**Response `201`** — angelegter Artikel

**Fehler**

| Code | Bedeutung |
|---|---|
| `400` | Pflichtfeld fehlt, oder `preis` ≤ 0 → `errors.preis: ["Preis muss größer als 0 sein"]` (Epic_Meine_Artikel AC-6) |
| `409` | „Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren" — wenn global keine Nummer mehr vergeben werden kann |

---

## 3. `PUT /api/articles/{id}`

Gleicher Request-Body wie `POST`. `nummer` und `verkaeuferId` sind **nicht**
änderbar — die Artikelnummer ist im Dialog schreibgeschützt.

**Response `200`** — aktualisierter Artikel · **`404`** bei fremdem oder
unbekanntem Artikel

`updatedAm` wird serverseitig gesetzt und speist die Aktivitäts-Heatmap
(siehe [`home.md`](home.md)).

---

## 4. `DELETE /api/articles/{id}`

Hard-Delete. Die freigewordene `nummer` wird **nicht** wiederverwendet — der
Nummernblock zählt weiter hoch.

**Response `204`** · **`404`** bei fremdem oder unbekanntem Artikel

Das Frontend fragt vorher über einen
[Confirmdialog](../components/standard/confirmdialog.md) nach
(Epic_Meine_Artikel AC-5).

---

## 5. `GET /api/articles` (Admin)

Alle Artikel aller Verkäufer.

`search` durchsucht: `nummer`, `bezeichnung`, `kategorie`, `marke`,
**Verkäufer-Vorname und -Nachname** (Epic_Alle_Artikel AC-3).

Jedes Item trägt zusätzlich den aufgelösten Verkäufer für die Spalte
„Verkäufer" und die Sortierung danach:

```json
{
  "items": [
    {
      "id": "b7c2e991", "nummer": 104, "bezeichnung": "Winterjacke",
      "marke": "Jako-O", "kategorie": "Jacken", "preis": 12.50,
      "groesse": "116", "farbe": "rot", "beschreibung": "kaum getragen",
      "erstelltAm": "…", "updatedAm": "…",
      "verkaeufer": { "id": "a3f9c2d1", "startNummer": 101, "vorname": "Anna", "nachname": "Beispiel" }
    }
  ],
  "totalCount": 1372, "page": 1, "pageSize": 25
}
```

`verkaeufer.startNummer` ist die Verkäufer-Kennnummer aus der Admin-Tabelle
(= `vonNummer` seines ersten Nummernblocks, siehe [`sellers.md`](sellers.md)),
**nicht** die Artikelnummer.

---

## 6. `GET /api/articles/{id}` (Admin)

Readonly-Detail für das Modal — dasselbe Objekt wie ein Item aus Abschnitt 5,
inklusive `verkaeufer`. Das Modal hat nur einen Schließen-Button, es gibt daher
bewusst **kein** `PUT`/`DELETE` auf fremde Artikel.

**Response `200`** · **`404`** bei unbekannter ID

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #artikel #crud #filter #pagination #ownership
