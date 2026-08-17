---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Entity: Verkäufer

Haupt-App-Sicht. Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Alphanumerisch, unique. Beim Import aus der Voranmelde-App übernommen — Grundlage der Upsert-Erkennung |
| `firstName` | string | ✅ | Vorname |
| `lastName` | string | ✅ | Nachname |
| `address` | string | ❌ | Anschrift, optional |
| `postalCode` | string | ❌ | PLZ — am Annahmeplatz optional, siehe unten |
| `city` | string | ❌ | Ort — optional |
| `phone` | string | ❌ | Telefon — optional |
| `email` | string | ✅ | Kontakt. **Kein Login** — die Haupt-App hat keine Verkäufer-Anmeldung |
| `sellerTypeId` | string (8 Zeichen) | ✅ | ID-Referenz auf den Verkäufer-Typ. Dient nur als Vorlage, siehe unten |
| `salesCommission` | decimal | ✅ | Verkaufsprovision in Prozent, die der Basar einbehält |
| `feePerItem` | decimal | ✅ | Gebühr pro abgegebenem Artikel — der **Satz**, mit dem am Tisch gerechnet wird |
| `intakeFeePaid` | decimal | ✅ | Default `0`. Summe der tatsächlich kassierten Annahmegebühren; wird bei jedem Annahme- und Freigabevorgang erhöht ([Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) Abschnitt 4) |
| `settledAt` | DateTime? | — | Zeitpunkt der Abrechnung; `null` = noch offen |
| `payoutAmount` | decimal? | — | Tatsächlich ausgezahlter Betrag, beim Abrechnen gesetzt und beim Stornieren auf `null` zurückgesetzt ([Epic_Abrechnung](../epics/Epic_Abrechnung/epic.md) Abschnitt 4) |

**Nicht in dieser App** (nur Voranmelde-App): `isAdmin`, `passwordHash`,
`inviteToken`/`inviteTokenExpiresAt`, Refresh-Tokens, Nummernblöcke.

`intakeFeePaid` ist der **gezahlte Betrag**, `feePerItem` der **Satz** — beide sind nötig:
Der Satz kann sich ändern oder pro Verkäufer abweichen, der gezahlte Betrag ist das, was
in der Geldschublade liegt. Ohne das Feld wäre am Abend nicht feststellbar, wie viel
Gebühren-Bargeld eingenommen wurde. Der Betrag geht **nicht** von der Auszahlung ab — er
ist am Annahmetisch schon bezahlt.

`intakeFeePaid` und `payoutAmount` sind die beiden **gespeicherten** Geldsummen je
Verkäufer — eingenommen und ausgezahlt. Beide könnten theoretisch nachgerechnet werden,
aber nur solange nichts storniert und neu abgerechnet wurde; genau dann bräuchte die
Kassenabstimmung sie am dringendsten. Was Geld bewegt, wird festgehalten, nicht
rekonstruiert.

**Pflichtfelder sind hier schmaler als in der Voranmelde-App:** Pflicht sind nur
`firstName`, `lastName`, `email` und `sellerTypeId`. Adresse, PLZ, Ort und Telefon
bleiben optional, weil Laufkundschaft am Annahmeplatz erfasst wird, während eine Schlange
wartet (siehe [ANNAHME-S02](../epics/Epic_Artikelannahme/stories/ANNAHME-S02-seller-form-layout.md)).
Die Voranmelde-App verlangt sie, weil dort der Verkäufer selbst und ohne Zeitdruck tippt.

## Konditionen gehören dem Verkäufer

`salesCommission` und `feePerItem` sind **eigene Felder** des Verkäufers, nicht
abgeleitete Werte. Beim Anlegen oder Typwechsel werden sie aus dem Verkäufer-Typ
vorbelegt und sind danach individuell überschreibbar (`spec.md` Abschnitte 9.6/9.7).

Maßgeblich für **alle** Berechnungen sind die Felder am Verkäufer — nicht die aktuellen
Werte seines Typs. Eine spätere Änderung des Typs verändert bereits erfasste Verkäufer
nicht, sonst würden sich Abrechnungen rückwirkend verschieben.

> Unterschied zur Voranmelde-App: dort gibt es keinen Override, die Konditionen werden
> immer aus dem Typ aufgelöst. Der Import überträgt deshalb nur den **Namen** des Typs,
> und diese App belegt daraus die eigenen Felder ([import-format.md](import-format.md)).

## Verwendung

- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — Stammdatenpflege
- [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) — Verkäufer-Auswahl
- [Epic_Abrechnung](../epics/Epic_Abrechnung/epic.md) — `salesCommission`, `feePerItem`, `settledAt`
- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Import

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entity #verkaeufer #datenmodell #konditionen
