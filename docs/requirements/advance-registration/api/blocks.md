---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
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
Component → [`block-liste.md`](../components/custom/block-liste.md)

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
  "sellerId": "a3f9c2d1",
  "fromNumber": 101,
  "toNumber": 110,
  "numberCount": 10,
  "usedCount": 3,
  "assignedAt": "2026-08-14T10:00:00+02:00"
}
```

| Feld | Bemerkung |
|---|---|
| `fromNumber` / `toNumber` | Grenzen des Blocks, **beide persistiert**. `toNumber` wird beim Anlegen aus `blockSize` errechnet und danach nicht mehr neu berechnet — sonst verschöbe eine spätere Änderung von `blockSize` rückwirkend alle Blockgrenzen und damit die Zuordnung bereits vergebener Artikelnummern. |
| `numberCount` | `toNumber - fromNumber + 1` |
| `usedCount` | Anzahl Artikel mit `number` in `[fromNumber, toNumber]`. Speist die Anzeige „10 Nummern · 3 vergeben" **und** die Löschsperre — beide können damit nicht auseinanderlaufen. |

**Überschneidungsfreiheit** gilt global: `[fromNumber, toNumber]` darf sich mit
keinem Block irgendeines Verkäufers überschneiden.

**Verortung im Backend:** `NumberBlock` ist ein **eigenes Aggregate** — `sellerId` ist
eine reine ID-Referenz, kein Navigations-Property zurück auf den Verkäufer. Die globale
Invariante kann kein Seller-Aggregate schützen (es sieht nur seine eigenen Blöcke),
darum liegt sie in einem Domain-Service `NumberBlockAllocator` (`Bazaar.Domain`), den
alle Vergabewege gemeinsam nutzen: Selbstregistrierung, Admin-Anlage, Reservierung und
automatische Erweiterung. Als letzte Verteidigungslinie gegen zwei parallele Vorgänge
kommt ein PostgreSQL-Exclusion-Constraint auf `int4range(fromNumber, toNumber + 1)`
hinzu — die serverseitige Vorprüfung allein schützt nicht gegen Races.

---

## 1. `GET /api/blocks/mine`

Alle Blöcke des eingeloggten Nutzers, aufsteigend nach `fromNumber`.
Nicht paginiert ([`cross-cutting.md`](cross-cutting.md) Abschnitt 4).

**Response `200`**
```json
[ { "id": "n8x4k2m0", "fromNumber": 101, "toNumber": 110, "numberCount": 10, "usedCount": 3, "assignedAt": "…" } ]
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

**Fehler:** `409` `errorCode: block.no_free_range` — „Kein zusammenhängender freier
Nummernbereich verfügbar"

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
| `409` | `errorCode: block.overlap` — „Nummernbereich überschneidet sich mit bestehendem Block" (Epic_Verkaeufer AC-6) |

---

## 4. `DELETE /api/sellers/{id}/blocks/{blockId}`

**Response `204`** — der Bereich ist danach wieder frei für andere Zuweisungen.

**Fehler**

| Code | `detail` |
|---|---|
| `404` | Block unbekannt **oder** gehört nicht zu `{id}` — der Verkäufer-Teil des Pfades wird geprüft, nicht nur mitgeführt |
| `409` | `errorCode: block.in_use` — „Block enthält bereits vergebene Nummern", sobald `usedCount > 0` (Epic_Verkaeufer AC-8) |

Das Frontend blendet den Löschen-Button bei `usedCount > 0` ohnehin aus und zeigt
stattdessen das Badge „Voll — nicht löschbar"; der Endpoint prüft es zusätzlich
serverseitig. Vor dem Löschen fragt ein
[Confirmdialog](../components/standard/confirmdialog.md) nach (AC-7).

---

## 5. Automatische Blockerweiterung

Kein eigener Endpoint. Ist der aktuelle Block eines Verkäufers aufgebraucht und
legt er einen weiteren Artikel an, weist **`POST /api/articles`** ihm in
derselben Transaktion automatisch den nächsten freien Block zu
(Epic_Nummernbloecke AC-4, kanonische Regel dort Abschnitt 2).

### Vergabe-Kaskade des `NumberBlockAllocator`

Verbindliche Auswertungsreihenfolge. Jede Stufe beendet bei Erfolg die Kaskade.
Beide Aufrufwege nutzen dieselbe Kaskade — `POST /api/articles` schreibend,
`GET /api/articles/next-number` im Dry-Run.

| Stufe | Vorbedingung | Ergebnis |
|---|---|---|
| 1 | Der Verkäufer hat mindestens einen Block mit freier Nummer in `[fromNumber, toNumber]` | Kleinste freie Nummer über alle seine Blöcke (aufsteigend nach `fromNumber`) vergeben. Kein neuer Block. **Fertig.** |
| 2 | Alle Blöcke des Verkäufers sind aufgebraucht **und** es existiert global ein freier Bereich von `blockSize` Nummern ab `startNumber` — nachgewiesen über die Freiheitsprüfung aus Abschnitt 6 | Neuen Block für diesen `sellerId` anlegen (`fromNumber` = erste Nummer des Bereichs, `toNumber` = `fromNumber + blockSize - 1`), dessen `fromNumber` vergeben. **In derselben Transaktion** wie der Artikel. **Fertig.** |
| 3 | Stufe 2 findet keinen freien Bereich | `409` `errorCode: article.no_free_number` — **Notfall-Pfad**, siehe unten |

**Stufe 3 ist ausschließlich über die Bedingung in ihrer Zeile erreichbar.** Ein
aufgebrauchter eigener Block allein erreicht sie **nicht** — das ist genau der
Fall, für den Stufe 2 existiert. Ein Allocator, der nur die bereits zugewiesenen
Blöcke des Verkäufers durchsucht und beim Fehltreffer `no_free_number` liefert,
ist nicht spec-konform.

**Stufe 3 ist ein Notfall-Pfad und greift im Normalbetrieb nie.** Es gibt bewusst
**keine** konfigurierbare Obergrenze des Nummernkreises — ein Block ist über
`fromNumber` und die Länge `blockSize` bestimmt, ein globales Ende wird nicht
gepflegt. Die Vergabe läuft ab `startNumber` aufwärts, ein freier Bereich existiert
daher praktisch immer. Erreichbar ist Stufe 3 nur, wenn der Wertebereich des
`int`-Feldes ausgeschöpft ist oder die Suche technisch scheitert.

Konsequenzen daraus:

- Stufe 3 wird **implementiert und getestet**, aber nicht als fachlicher
  Regelfall behandelt — sie ist kein Grund, Verkäufern eine Warnung „Nummern
  gehen zur Neige" anzuzeigen oder ein Kontingent-Konzept einzuführen.
- Wer die Meldung „Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren"
  im Test oder Betrieb sieht, hat mit hoher Wahrscheinlichkeit **einen Fehler in
  Stufe 2**, keinen ausgeschöpften Nummernkreis. Erste Prüfung ist dann immer, ob
  Stufe 2 überhaupt implementiert ist (Epic_Nummernbloecke AC-5).

Stufe 2 vergibt **einen** Block, nicht `defaultBlockCount` — dieser Parameter
gilt nur für Erstanlage und Selbstregistrierung. Der neue Block muss **nicht**
an die bestehenden Blöcke des Verkäufers anschließen; er liegt dort, wo global
Platz ist, und kann daher eine Lücke zu den vorhandenen Blöcken haben.

Der neue Block erscheint anschließend in `GET /api/blocks/mine` (aufsteigend
nach `fromNumber` einsortiert, nicht zwingend zusammenhängend).

`GET /api/articles/next-number` liefert dieselbe Nummer als **Vorschau**, ohne
etwas zu vergeben — beide Wege nutzen denselben `NumberBlockAllocator`, einmal
schreibend und einmal im Dry-Run (siehe [`articles.md`](articles.md)
Abschnitt 2).

---

## 6. Freiheitsprüfung bei jeder Blockvergabe

Gilt **ohne Ausnahme für alle vier Vergabewege**: Selbstregistrierung
([`auth.md`](auth.md)), Admin-Anlage (`POST /api/sellers`), Reservierung
(Abschnitt 3) und automatische Erweiterung (Abschnitt 5, Stufe 2). Es gibt keinen
Weg, auf dem ein Block ohne diese Prüfung entsteht — sie liegt daher im
`NumberBlockAllocator`, nicht im jeweiligen Aufrufer.

Ein neu zu vergebender Block ist durch `fromNumber` und die Länge `blockSize`
bestimmt; seine letzte Nummer ist `fromNumber + blockSize - 1`. Beim Anlegen wird
dieser Wert als `toNumber` **persistiert** und danach nie neu berechnet
([`entities/nummernblock.md`](../entities/nummernblock.md)) — bestehende Blöcke
werden deshalb über ihr gespeichertes `[fromNumber, toNumber]` verglichen, nicht
über das aktuelle `blockSize`. Nur so bleibt die Prüfung auch dann korrekt, wenn
`blockSize` nach der Vergabe geändert wurde.

Geprüft wird immer der **gesamte Bereich**, nicht nur die Startnummer.

### Prüf-Kaskade — verbindliche Reihenfolge je Vergabe

| Stufe | Prüfung | Bei Verstoß |
|---|---|---|
| 1 | `fromNumber` ≥ `startNumber` aus den Einstellungen | Ablehnen — `409` `block.overlap` bzw. `article.no_free_number` je Aufrufweg |
| 2 | Der komplette Bereich `[fromNumber, fromNumber + blockSize - 1]` überschneidet sich mit **keinem** bestehenden Block — auch nicht mit einem Block eines **anderen** Verkäufers, auch nicht teilweise, auch nicht randberührend | Ablehnen, siehe Stufe 1 |
| 3 | Bei mehreren gewünschten Blöcken (`blockCount > 1`): der zusammenhängende Gesamtbereich `blockCount × blockSize` ist **lückenlos** frei — nicht jeder Block einzeln | Ablehnen, siehe Stufe 1 |
| 4 | Insert innerhalb derselben Transaktion wie die Prüfung, abgesichert durch den PostgreSQL-Exclusion-Constraint auf `int4range(fromNumber, toNumber + 1)` | Constraint-Verstoß = anderer Vorgang war schneller. Kein `500`: der Vorgang wird als Konflikt behandelt — Aufrufweg „Reservierung" antwortet `409` `block.overlap`, Aufrufweg „automatische Erweiterung" wiederholt die Suche **einmal** mit dem dann aktuellen Stand und antwortet erst bei erneutem Verstoß `409` |

**Stufe 2 und 3 werden unmittelbar vor dem Insert erneut ausgeführt**, auch wenn
der Bereich aus einem Vorschlag (`GET /api/blocks/next-free`) stammt oder aus
einer Suche derselben Anfrage: zwischen Vorschlag/Suche und Insert kann ein
paralleler Vorgang denselben Bereich belegt haben. Ein einmal berechneter
Vorschlag gilt nie als geprüft.

**Stufe 4 ersetzt Stufe 2 und 3 nicht, und umgekehrt.** Die Vorprüfung liefert die
fachliche Fehlermeldung, der Constraint schützt gegen die Race Condition. Eine
Implementierung mit nur einem der beiden ist nicht spec-konform.

---

## Parameter aus den Einstellungen

| Parameter | Wirkung |
|---|---|
| `startNumber` | Erste Artikelnummer überhaupt — untere Grenze der Vergabe |
| `blockSize` | Nummern pro Block; bestimmt `toNumber` **beim Anlegen** |
| `defaultBlockCount` | Default für `blockCount` bei Anlage und Selbstregistrierung |

Pflege → [`settings.md`](settings.md)

Die drei Werte werden **nicht** über einen Port in die Domäne injiziert: Der aufrufende
Handler lädt sie einmal über `ISettingsRepository` und übergibt sie dem
`NumberBlockAllocator` als Parameter. Damit bleibt der Allocator ohne Mock testbar.

---

## Tags & Piles

**Piles:** #pile/advance-registration
**Tags:** #api #nummernblock #vergabe #admin #artikelnummer
