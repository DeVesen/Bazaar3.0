---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Entity: Artikel

Haupt-App-Sicht. Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Alphanumerisch, unique. Beim Import aus der Voranmelde-App übernommen |
| `number` | int | ✅ | Artikelnummer, Grundlage für Barcode/QR |
| `sellerId` | string (8 Zeichen) | ✅ | ID-Referenz auf den Verkäufer. Basis für Abrechnung und Verkäufer-Filter |
| `name` | string | ✅ | Bezeichnung des Artikels |
| `brand` | string | ✅ | Marke — denormalisierter String, kein FK (AutoComplete-Create, Freitext möglich) |
| `category` | string | ✅ | Kategorie — denormalisierter String, kein FK |
| `price` | decimal | ✅ | Verkaufspreis, 2 Dezimalstellen |
| `description` | string | ❌ | Beschreibung, optional |
| `size` | string | ❌ | Größe, optional |
| `color` | string | ❌ | Farbe, optional |
| `createdAt` | DateTime | ✅ | Beim Anlegen serverseitig gesetzt; bei Neuanlage gilt `updatedAt = createdAt` |
| `updatedAt` | DateTime | ✅ | Bei jeder Änderung serverseitig gesetzt |
| `acceptedAt` | DateTime? | — | Artikelannahme (Buchen in Wizard-Schritt 2) |
| `releasedAt` | DateTime? | — | Freigabe zum Verkauf; wird beim Buchen der Annahme gleichzeitig mit `acceptedAt` gesetzt |
| `soldAt` | DateTime? | — | Kassenvorgang |
| `returnedAt` | DateTime? | — | Rückgabe an den Verkäufer |
| `soldManually` | boolean | ✅ | Default `false`. `true`, wenn `soldAt` über das Artikelstatus-Popup von Hand gesetzt wurde — also ohne Kassenvorgang. Der Kassenvorgang setzt es nicht, der Import nie |

`createdAt` und `updatedAt` sind nicht editierbar (`spec.md` Abschnitt 9.4).

## Änderbarkeit

Je näher ein Feld am Geld liegt, desto strenger die Sperre — verbindlich beschrieben in
[Epic_Artikel](../epics/Epic_Artikel/epic.md) Abschnitt 4:

| Zustand | Gesperrt |
|---|---|
| `soldAt` gesetzt | `price` |
| Verkäufer abgerechnet (`settledAt` gesetzt) | alle Felder und alle Zeitstempel |

Der Preis ist ab dem Verkauf gesperrt, weil er **der Umsatz** ist. Gelöst wird die Sperre
nur über das Stornieren (Verkauf bzw. Abrechnung), damit eine ausgezahlte Summe
nachvollziehbar bleibt.

`soldManually` erlaubt es, Verkäufe ohne Kassenvorgang bei der Kassenabstimmung zu
benennen; ohne dieses Feld wäre eine Differenz in der Geldschublade keiner Ursache
zuzuordnen.

## Status

Der Status ist **abgeleitet**, kein persistiertes Feld:

| Status | Bedingung |
|---|---|
| Registriert | `releasedAt` = `null` |
| Im Verkauf | `releasedAt` gesetzt, `soldAt` = `null`, `returnedAt` = `null` |
| Verkauft | `soldAt` gesetzt |
| Zurückgegeben | `returnedAt` gesetzt |

`releasedAt` ist der statusgebende Zeitstempel (Lastenheft 7.4). Ein eigenes
Status-Feld würde neben den Zeitstempeln zur zweiten, driftenden Quelle.

## Marke und Kategorie sind Strings

`brand` und `category` tragen den **Namen**, keinen Fremdschlüssel — begründet durch
das AutoComplete-Create am Annahmeplatz (ein Kassierer soll eine unbekannte Marke
sofort anlegen können). Folge: Wird ein Stammdatum umbenannt, muss der neue Name in
allen betroffenen Artikeln nachgezogen werden, sonst zerfallen Filter und Zähler.

## Verwendung

- [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) — Annahme und Freigabe
- [Epic_Verkauf](../epics/Epic_Verkauf/epic.md) — `soldAt`
- [Epic_Abrechnung](../epics/Epic_Abrechnung/epic.md) — `returnedAt`, Umsatzermittlung
- [Epic_Artikel](../epics/Epic_Artikel/epic.md) — Stammdatenpflege
- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Import ([Schema](import-format.md))

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entity #artikel #datenmodell #status
