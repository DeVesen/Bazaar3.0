---
status: reviewed
reviewed-date: 2026-08-17
---

# Entity: Artikel

Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

## Felder

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 10.0.1).

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | In der Domäne erzeugt (nanoid-artig), Unique-Check gegen DB vor Insert |
| `number` | int | ✅ | Muss innerhalb des dem Verkäufer zugewiesenen Nummernblocks (`fromNumber`–`toNumber`) liegen — Backend validiert |
| `sellerId` | string (8 Zeichen) | ✅ | Referenz auf Verkäufer, serverseitig aus dem `sub`-Claim gesetzt. Basis für Ownership-Prüfung, `?sellerId=`-Filter und Export-Gruppierung |
| `name` | string | ✅ | Bezeichnung des Artikels |
| `brand` | string | ✅ | Denormalisiert (kein FK), AutoComplete-Create, Freitext möglich |
| `category` | string | ✅ | Denormalisiert (kein FK), AutoComplete-Create, Freitext möglich |
| `price` | decimal | ✅ | `> 0`, 2 Dezimalstellen, kein Max — `decimal`, nicht `double`, weil Geldbeträge exakt bleiben müssen |
| `description` | string | ❌ | Optional |
| `size` | string | ❌ | Optional |
| `color` | string | ❌ | Optional |
| `createdAt` | DateTime | ✅ | Auto beim Anlegen |
| `updatedAt` | DateTime | ✅ | Auto bei jeder Änderung |

**Nicht in der Voranmelde-App** (nur Haupt-App): Alternativpreis und die vier Status-Zeitstempel (angenommen, freigegeben, verkauft, zurückgegeben).

**Kein Artikel-Status.** Das Statusmodell der Haupt-App („Registriert / Im Verkauf / Verkauft / Zurückgegeben") leitet sich ausschließlich aus den vier oben genannten Haupt-App-Zeitstempeln ab. In der Voranmelde-App existiert keines davon — jeder Artikel ist implizit „registriert". Kein persistiertes Statusfeld, kein Status im API-Response.

**Aggregate-Zuschnitt:** `Article` ist ein eigenes Aggregate. `sellerId` ist eine reine ID-Referenz ohne Navigations-Property — der Verkäufer wird für die Admin-Sicht im Query-Adapter aufgelöst, nicht über eine EF-Navigation quer durch die Domäne.

**Marke/Kategorie sind denormalisierte Strings, keine FKs.** Folge: Wird eine Marke oder Kategorie in den Stammdaten umbenannt, zieht das Backend den neuen Namen in allen betroffenen Artikeln nach (siehe [`api/master-data.md`](../api/master-data.md)) — sonst zerfiele der Filter und der Artikel-Zähler der Stammdaten-Tabelle stimmte nicht mehr.

## Verwendung

- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) — Anlage/Bearbeitung eigener Artikel
- [Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) — Read-only-Ansicht aller Artikel
- [Epic_Export](../epics/Epic_Export/epic.md) — Export-Format enthält Artikel je Verkäufer

## Tags & Piles

**Tags:** #entity #artikel #datenmodell
