---
status: reviewed
reviewed-date: 2026-08-17
---

# API: Nummernblöcke

Kanonische Stelle für **alle** Nummernblock-Routen — auch für die beiden, die
pfadmäßig unter `/api/sellers/{id}/` hängen. Die Vergaberegeln
(Überschneidungsfreiheit, Vorschlagsberechnung, Löschsperre, automatische
Erweiterung) stehen dadurch an einem Ort statt über zwei Dateien verteilt.

Querschnitts-Regeln → [`cross-cutting.md`](cross-cutting.md).

Epics → [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) (Verkäufer-Sicht) ·
[Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) Panel 04 (Admin-Verwaltung) ·
Entity → [`entities/nummernblock.md`](../entities/nummernblock.md) ·
Component → [`block-liste.md`](../components/block-liste.md)

---

## Endpoints

| Endpoint | Auth | Zweck |
|---|---|---|
| `GET /api/blocks/mine` | `authenticated` | Eigene Blöcke, rein lesend |
| `GET /api/blocks/next-free` | `admin` | Startnummer-Vorschlag für Panel 04 |
| `POST /api/sellers/{id}/blocks` | `admin` | Block(e) für einen Verkäufer reservieren |
| `DELETE /api/sellers/{id}/blocks/{blockId}` | `admin` | Leeren Block wieder freigeben |

---

## Block-Objekt

```json
{
  "id": "n8x4k2m0",
  "verkaeuferId": "a3f9c2d1",
  "vonNummer": 101,
  "bisNummer": 110,
  "anzahlNummern": 10,
  "vergeben": 3,
  "zugewiesenAm": "2026-08-14T10:00:00+02:00"
}
```

| Feld | Bemerkung |
|---|---|
| `vonNummer` / `bisNummer` | Grenzen des Blocks, **beide persistiert**. `bisNummer` wird beim Anlegen aus `blockSize` errechnet und danach nicht mehr neu berechnet — sonst verschöbe eine spätere Änderung von `blockSize` rückwirkend alle Blockgrenzen und damit die Zuordnung bereits vergebener Artikelnummern. |
| `anzahlNummern` | `bisNummer - vonNummer + 1` |
| `vergeben` | Anzahl Artikel mit `nummer` in `[vonNummer, bisNummer]`. Speist die Anzeige „10 Nummern · 3 vergeben" **und** die Löschsperre — beide können damit nicht auseinanderlaufen. |

**Überschneidungsfreiheit** gilt global: `[vonNummer, bisNummer]` darf sich mit
keinem Block irgendeines Verkäufers überschneiden.

---

## 1. `GET /api/blocks/mine`

Alle Blöcke des eingeloggten Nutzers, aufsteigend nach `vonNummer`.
Nicht paginiert ([`cross-cutting.md`](cross-cutting.md) Abschnitt 4).

**Response `200`**
```json
[ { "id": "n8x4k2m0", "vonNummer": 101, "bisNummer": 110, "anzahlNummern": 10, "vergeben": 3, "zugewiesenAm": "…" } ]
```

Leeres Array, wenn noch kein Block zugewiesen ist — das Frontend zeigt dann
„Noch keine Nummernblöcke zugewiesen" (Epic_Nummernbloecke AC-2).

**Rein lesend.** Es gibt bewusst keinen Endpoint, über den ein Verkäufer Blöcke
ändern oder beantragen könnte (AC-3).

---

## 2. `GET /api/blocks/next-free`

Liefert den Startnummer-Vorschlag für Panel 04. Ohne diesen Endpoint könnte das
Frontend den Vorschlag nicht bilden — es kennt die Blöcke anderer Verkäufer
nicht.

**Query-Parameter**

| Parameter | Pflicht | Bedeutung |
|---|---|---|
| `blockCount` | ✅ | Anzahl gewünschter zusammenhängender Blöcke |

**Response `200`**
```json
{ "startNumber": 31 }
```

**Berechnung:** kleinste Nummer ≥ `startNumber` (Einstellungen), ab der
`blockCount × blockSize` Nummern **lückenlos frei** sind.

> Beispiel: `blockSize = 10`, `blockCount = 2` → 20 freie Nummern nötig.
> Belegt sind 1–10 und 21–30 → Vorschlag `31` (nicht `11`, dort passen nur 10).

Das Frontend ruft diesen Endpoint beim Öffnen von Panel 04 und bei jeder
Änderung von „Anzahl Blöcke" — der Vorschlag hängt von `blockCount` ab und
kann daher nicht einmalig mit dem Verkäufer-Objekt geliefert werden.

**Fehler:** `409` „Kein zusammenhängender freier Nummernbereich verfügbar"

---

## 3. `POST /api/sellers/{id}/blocks`

Reserviert einen oder mehrere zusammenhängende Blöcke (Panel 04,
„✓ Reservieren").

**Request**
```json
{ "startNumber": 31, "blockCount": 2 }
```

Beide Felder optional — Defaults: Vorschlag aus Abschnitt 2 bzw.
`defaultBlockCount`.

**Serverseitig** wird vor dem Anlegen erneut auf Überschneidung geprüft: Der
Vorschlag kann zwischen Abruf und Klick durch einen parallelen Vorgang veraltet
sein.

**Response `201`** — Array der angelegten Blöcke

**Fehler**

| Code | `detail` |
|---|---|
| `404` | Unbekannte Verkäufer-ID |
| `409` | „Nummernbereich überschneidet sich mit bestehendem Block" (Epic_Verkaeufer AC-6) |

---

## 4. `DELETE /api/sellers/{id}/blocks/{blockId}`

**Response `204`** — der Bereich ist danach wieder frei für andere Zuweisungen.

**Fehler**

| Code | `detail` |
|---|---|
| `404` | Block unbekannt **oder** gehört nicht zu `{id}` — der Verkäufer-Teil des Pfades wird geprüft, nicht nur mitgeführt |
| `409` | „Block enthält bereits vergebene Nummern" — sobald `vergeben > 0` (Epic_Verkaeufer AC-8) |

Das Frontend blendet den Löschen-Button bei `vergeben > 0` ohnehin aus und zeigt
stattdessen das Badge „Voll — nicht löschbar"; der Endpoint prüft es zusätzlich
serverseitig. Vor dem Löschen fragt ein
[Confirmdialog](../components/confirmdialog.md) nach (AC-7).

---

## 5. Automatische Blockerweiterung

Kein eigener Endpoint. Ist der aktuelle Block eines Verkäufers aufgebraucht und
legt er einen weiteren Artikel an, weist **`POST /api/articles`** ihm in
derselben Transaktion automatisch den nächsten freien Block zu
(Epic_Nummernbloecke AC-4, kanonische Regel dort Abschnitt 2).

Der neue Block erscheint anschließend in `GET /api/blocks/mine`. Existiert
global kein freier Bereich mehr, schlägt das Anlegen mit `409` fehl
(siehe [`articles.md`](articles.md)).

---

## Parameter aus den Einstellungen

| Parameter | Wirkung |
|---|---|
| `startNumber` | Erste Artikelnummer überhaupt — untere Grenze der Vergabe |
| `blockSize` | Nummern pro Block; bestimmt `bisNummer` **beim Anlegen** |
| `defaultBlockCount` | Default für `blockCount` bei Anlage und Selbstregistrierung |

Pflege → [`settings.md`](settings.md)

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #nummernblock #vergabe #admin #artikelnummer
