---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Einstellungen

Systemweite Konfiguration der Voranmelde-App: Basar-Termine, Default-Typ,
Info-Text und Nummernblock-Parameter. Ein einziger Datensatz, kein CRUD.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epic → [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) ·
Entity → [`entities/einstellungen.md`](../entities/einstellungen.md) ·
Component → [`einstellungen-form.md`](../components/einstellungen-form.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/settings` | `admin` | Alle Einstellungen |
| `PUT /api/settings` | `admin` | Einstellungen ersetzen — sofort wirksam |

Die öffentlich sichtbaren Teile (Termine, aufgelöste Default-Konditionen,
`infoText`) liefert [`GET /api/public/info`](public.md) ohne Auth — dieselbe
Quelle, keine Duplizierung der Werte.

---

## Objekt

```json
{
  "registrationDeadline": "2026-09-30T23:59:00+02:00",
  "dropOffFrom":          "2026-10-05T08:00:00+02:00",
  "dropOffUntil":         "2026-10-05T18:00:00+02:00",
  "bazaarFrom":           "2026-10-06T09:00:00+02:00",
  "bazaarUntil":          "2026-10-06T16:00:00+02:00",
  "defaultTypeId": "t1b2c3d4",
  "infoText": "## Hinweise\n\nBitte bringen Sie …",
  "startNumber": 101,
  "blockSize": 10,
  "defaultBlockCount": 1
}
```

| Feld | Typ | Bemerkung |
|---|---|---|
| `registrationDeadline` … `bazaarUntil` | ISO 8601 \| `null` | Die 5 Phasen der Countdown-Sequence, in dieser Reihenfolge (Voranmeldeschluss, Abgabe von/bis, Basar von/bis). Pflege per `p-datepicker` (Datum + Uhrzeit). |
| `defaultTypeId` | string \| `null` | Standard-Verkäufer-Typ für die Selbstregistrierung und die Konditions-Anzeige der Login-Seite |
| `infoText` | Markdown \| `null` | Freitext für Verkäufer-Home und Login-Seite, **max. 4000 Zeichen** Rohtext ([`entities/einstellungen.md`](../entities/einstellungen.md)) |
| `startNumber` | int | Erste Artikelnummer überhaupt |
| `blockSize` | int | Nummern pro Nummernblock |
| `defaultBlockCount` | int | Standard-Anzahl Blöcke für neue Verkäufer |

Alle Termine, `defaultTypeId` und `infoText` dürfen `null` sein — der
Normalzustand direkt nach dem Deployment (siehe [`public.md`](public.md)).

---

## 1. `GET /api/settings`

**Response `200`** — das vollständige Objekt

---

## 2. `PUT /api/settings`

**Vollersetzung.** Der Request enthält alle Felder; ein `null` löscht den
betreffenden Wert. Die Einstellungsseite ist ein einziges Formular, das ohnehin
alles lädt und komplett speichert — eine PATCH-Semantik bräuchte die
Unterscheidung „Feld fehlt" vs. „Feld ist `null`" ohne UI-Bedarf.

**Response `200`** — gespeichertes Objekt.
Änderungen sind **sofort wirksam**, ohne App-Neustart (Epic_Einstellungen AC-3).

### Validierung

| Code | Fall |
|---|---|
| `400` | **Termin-Reihenfolge:** Die gesetzten Termine müssen aufsteigend sein (`registrationDeadline` ≤ `dropOffFrom` ≤ `dropOffUntil` ≤ `bazaarFrom` ≤ `bazaarUntil`). `null`-Werte werden übersprungen, Teilkonfiguration bleibt erlaubt. Sonst wäre der Countdown-Sequence-Mode unsinnig. |
| `400` | `defaultTypeId` verweist auf keinen existierenden Typ → `errors.defaultTypeId: ["Unbekannter Verkäufer-Typ"]` |
| `400` | `startNumber`, `blockSize`, `defaultBlockCount` ≤ 0 |
| `400` | `infoText` länger als 4000 Zeichen → `errors.infoText: ["Info-Text darf maximal 4000 Zeichen lang sein"]`. Gezählt wird der Markdown-Rohtext. Serverseitig geprüft, nicht nur im Formular — der Endpoint ist auch ohne UI erreichbar. |
| `409` | `errorCode: settings.start_number_conflict` — „Startnummer liegt über bereits vergebenen Artikelnummern", siehe unten |

### Änderungen an den Nummernblock-Parametern

Beide Parameter wirken **nur auf künftige Vergaben**; bestehende Blöcke bleiben
unberührt, weil `toNumber` persistiert ist und nicht neu gerechnet wird
(siehe [`blocks.md`](blocks.md),
[`entities/nummernblock.md`](../entities/nummernblock.md)).

| Parameter | Verhalten bei Änderung |
|---|---|
| `blockSize` | Erlaubt. Neue Blöcke bekommen die neue Größe, alte behalten ihre — danach existieren Blöcke unterschiedlicher Größe nebeneinander. Das Formular weist per Hinweistext darauf hin. |
| `startNumber` | Erlaubt, solange der neue Wert **nicht über** einer bereits vergebenen Artikelnummer liegt. Sonst `409` — bestehende Artikelnummern lägen sonst rückwirkend außerhalb des gültigen Bereichs. |

### Wirkung auf andere Ansichten

| Geändertes Feld | Schlägt sofort durch auf |
|---|---|
| Die 5 Termine | Login-Seite, Home Verkäufer, Home Admin, `/embed/countdown` — alle über [`GET /api/public/info`](public.md) |
| `defaultTypeId` | „Default-Konditionen" der Login-Seite; Typzuweisung bei Selbstregistrierung ([`auth.md`](auth.md)) |
| `infoText` | Info-Panel auf Verkäufer-Home und Login-Seite |
| `defaultBlockCount` | Vorbelegung im Verkäufer-Dialog ([`sellers.md`](sellers.md)) und Blockvergabe bei Selbstregistrierung |

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #einstellungen #konfiguration #termine #nummernblock
