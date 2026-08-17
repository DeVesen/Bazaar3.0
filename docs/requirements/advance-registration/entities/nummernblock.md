---
status: reviewed
reviewed-date: 2026-08-17
---

# Entity: Nummernblock

Nur in dieser App. Verbindliche Quelle; Index → [overview.md](overview.md).

## Felder

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 10.0.1).

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | In der Domäne erzeugt, Unique-Check gegen DB vor Insert |
| `sellerId` | string | ✅ | ID-Referenz auf den Verkäufer, 1:n — ein Verkäufer kann mehrere zusammenhängende Blöcke haben. **Kein** Navigations-Property zurück |
| `fromNumber` | int | ✅ | Erste Nummer des Blocks; überlappungsfrei über alle Verkäufer (Backend-Validierung) |
| `toNumber` | int | ✅ | **Persistiert.** Beim Anlegen aus `fromNumber + blockSize - 1` errechnet (`blockSize` aus [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 2), danach unveränderlich — würde man bei jedem Lesen neu rechnen, verschöbe eine spätere Änderung von `blockSize` rückwirkend alle Blockgrenzen und damit die Zuordnung bereits vergebener Artikelnummern |
| `assignedAt` | DateTime | ✅ | Auto bei Zuweisung |

**Constraints:**
- Kein Overlap: `[fromNumber, toNumber]` darf sich mit keinem anderen Block überschneiden (über alle Verkäufer hinweg).
- 1:n-Beziehung Verkäufer↔Block: initial ein Block bei Anlage, automatische Erweiterung um weiteren Block sobald der aktuelle aufgebraucht ist (siehe [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) Abschnitt 2).

**Aggregate und Invariante:** `NumberBlock` ist ein **eigenes Aggregate**. Die
Überlappungsfreiheit ist eine globale Invariante — kein Seller-Aggregate kann sie
schützen, es sieht nur seine eigenen Blöcke. Sie lebt daher im Domain-Service
`NumberBlockAllocator` (`Bazaar.Domain`), den alle Vergabewege gemeinsam nutzen
(Selbstregistrierung, Admin-Anlage, Reservierung, Auto-Erweiterung). Zusätzlich
sichert ein PostgreSQL-Exclusion-Constraint auf `int4range(fromNumber, toNumber + 1)`
gegen zwei parallele Vergaben ab — eine Vorprüfung im Code allein ist nicht
race-sicher.

## Verwendung

- [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) — Zuweisung/Übersicht durch Admin
- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) — `number`-Validierung gegen zugewiesenen Block
- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — `blockSize`/`startNumber`/`defaultBlockCount` als globale Parameter

## Tags & Piles

**Tags:** #entity #nummernblock #datenmodell
