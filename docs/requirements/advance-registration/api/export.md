---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Export

Erzeugt die JSON-Datei für den manuellen Import in die Haupt-App am
Basar-Morgen.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epic → [Epic_Export](../epics/Epic_Export/epic.md) ·
Component → [`export-panel.md`](../components/export-panel.md) ·
Entities → [`entities/overview.md`](../entities/overview.md)

---

## Endpoint

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/export` | `admin` | Vollständiger Datenexport als JSON-Download |

---

## Query-Parameter

| Parameter | Typ | Default | Bedeutung |
|---|---|---|---|
| `includeBrands` | bool | `false` | Marken-Stammdaten mitexportieren (Checkbox „Marken einschließen") |
| `includeCategories` | bool | `false` | Kategorien-Stammdaten mitexportieren |

Nicht angefordert → das jeweilige Array ist **leer**, nicht weggelassen. Das
Schema bleibt damit über alle Aufrufe stabil.

---

## Response

```
200 OK
Content-Type: application/json
Content-Disposition: attachment; filename="basar-export-2026-08-17.json"
```

**Body** — verbindliches Schema:

```json
{
  "exportedAt": "2026-06-14T08:00:00Z",
  "sellers": [
    {
      "id": "Ab3dEf7G",
      "firstName": "Max",
      "lastName": "Mustermann",
      "address": "Hauptstr. 1",
      "postalCode": "12345",
      "city": "Musterstadt",
      "phone": "0123456789",
      "email": "max@example.com",
      "sellerType": "Privat",
      "articles": [
        {
          "id": "Xy9zWq2P",
          "number": 101,
          "name": "Winterjacke",
          "brand": "Nike",
          "category": "Jacken",
          "price": 25.00,
          "size": "M",
          "color": "Blau",
          "description": "kaum getragen"
        }
      ]
    }
  ],
  "brands": ["Nike", "Adidas"],
  "categories": ["Jacken", "Hosen"]
}
```

| Thema | Regel |
|---|---|
| `sellerType` | **Name** des Verkäufer-Typs, nicht die Id — eine Id dieser App wäre in der Haupt-App bedeutungslos. Der Name ist der app-übergreifende Matching-Schlüssel |
| `brands` / `categories` | Arrays von Namen, keine Objekte: `id` ist app-lokal, `original` ist hier-exklusiv. Passt zur Denormalisierung im Artikel |
| Arrays | Immer vorhanden, leer wenn die zugehörige Checkbox nicht gesetzt war — stabiles Schema über alle Aufrufe |
| `address`, `description` | Optional, werden aber übertragen; beide Felder existieren in der Haupt-App |
| IDs | Verkäufer- und Artikel-IDs werden 1:1 übertragen und dienen dort der Upsert-Erkennung |

Den **Dateinamen** setzt das Backend (`basar-export-YYYY-MM-DD.json`, Datum aus
der Serverzeit). Das Frontend triggert nur den Browser-Download aus der
Response und baut die Datei nicht selbst zusammen — sonst müsste es alle
Datensätze ungepaginiert in den Browser laden.

---

## Serverseitige Filterung

| Regel | Herkunft |
|---|---|
| Nur Verkäufer mit **mindestens einem eigenen Artikel** — Verkäufer ohne Artikel werden ausgelassen | Epic_Export Abschnitt 1, AC-2 |
| Admins zählen wie Verkäufer, sofern sie eigene Artikel haben | Epic_Export Abschnitt 1 |
| Jeder Verkäufer trägt seine vollständige Artikelliste als `articles`-Array | Schema |
| `exportedAt` als ISO-8601-Zeitstempel | AC-3 |

**Keine Konditionen pro Verkäufer.** Der Export enthält weder Provision noch
Gebühr, sondern nur `sellerType` — den **Namen** des Typs, nicht die
Id. Die Haupt-App pflegt eigene Verkäufer-Typen und löst die Konditionen über
den Namen auf; eine Voranmelde-App-Id wäre dort bedeutungslos. Konsistent mit
der Entscheidung, in der Voranmelde-App keinen Override zu führen
(siehe [`seller-types.md`](seller-types.md)).

**Nicht exportiert:** `isAdmin`, `passwordHash`, `inviteToken`,
`inviteTokenExpiresAt`, Nummernblöcke, Refresh-Tokens, das `original`-Flag der
Stammdaten — allesamt Voranmelde-App-interne Daten ohne Entsprechung in der Haupt-App.

**Backend-Verortung:** Der Export ist ein Read-Model und läuft über den Query-Port
`IExportQuery` (direkter EF-/SQL-Zugriff im Adapter), nicht über die Repositories —
Aggregate zu laden, um sie sofort zu flach zu serialisieren, wäre Verschwendung.

**Contract-Sprache:** Die Feldnamen des Export-JSON sind — wie der gesamte
API-Contract — **englisch**. Das betrifft auch den Import auf Haupt-App-Seite
(Epic_Einstellungen dort), der dasselbe Schema lesen muss.

---

## UI-Feedback

Abweichend vom Standardmuster in
[`cross-cutting.md`](cross-cutting.md) Abschnitt 7: Nach dem Download zeigt die
Seite eine Shared `info-area` vom Typ `info` mit der Anzahl exportierter
Verkäufer und Artikel — **kein** Toast, **kein** Auto-Dismiss (Epic_Export AC-4).

Die beiden Zahlen zählt das Frontend aus dem heruntergeladenen JSON; es braucht
dafür keinen zweiten Endpoint.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #export #json #datenschnittstelle #import-vorbereitung
