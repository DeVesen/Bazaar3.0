---
status: reviewed
reviewed-date: 2026-08-14
---

# Entity: Artikel

Voranmelde-App-Sicht — kanonische Quelle: [entities.md](../../entities.md).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Backend-generiert (nanoid-artig), Unique-Check gegen DB vor Insert |
| `nummer` | int | ✅ | Muss innerhalb des dem Verkäufer zugewiesenen Nummernblocks (`vonNummer`–`bisNummer`) liegen — Backend validiert |
| `verkaeuferId` | string (8 Zeichen) | ✅ | FK auf Verkäufer, serverseitig aus dem `sub`-Claim gesetzt. Basis für Ownership-Prüfung, `?sellerId=`-Filter und Export-Gruppierung |
| `bezeichnung` | string | ✅ | |
| `marke` | string | ✅ | Denormalisiert (kein FK), AutoComplete-Create, Freitext möglich |
| `kategorie` | string | ✅ | Denormalisiert (kein FK), AutoComplete-Create, Freitext möglich |
| `preis` | double | ✅ | `> 0`, 2 Dezimalstellen, kein Max |
| `beschreibung` | string | ❌ | Optional |
| `groesse` | string | ❌ | Optional |
| `farbe` | string | ❌ | Optional |
| `erstelltAm` | DateTime | ✅ | Auto beim Anlegen |
| `updatedAm` | DateTime | ✅ | Auto bei jeder Änderung |

**Nicht in der Voranmelde-App** (nur Haupt-App): `alternativPreis`, `angenommenAm`, `freigegebenAm`, `verkauftAm`, `rückgegebenAm`.

**Kein Artikel-Status.** Das Statusmodell in [`entities.md`](../../entities.md) („Registriert / Im Verkauf / Verkauft / Zurückgegeben") leitet sich ausschließlich aus den vier oben genannten Haupt-App-Zeitstempeln ab. In der Voranmelde-App existiert keines davon — jeder Artikel ist implizit „registriert". Kein persistiertes Statusfeld, kein Status im API-Response.

**Marke/Kategorie sind denormalisierte Strings, keine FKs.** Folge: Wird eine Marke oder Kategorie in den Stammdaten umbenannt, zieht das Backend den neuen Namen in allen betroffenen Artikeln nach (siehe [`api/master-data.md`](../api/master-data.md)) — sonst zerfiele der Filter und der Artikel-Zähler der Stammdaten-Tabelle stimmte nicht mehr.

## Verwendung

- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) — Anlage/Bearbeitung eigener Artikel
- [Epic_Alle_Artikel](../epics/Epic_Alle_Artikel/epic.md) — Read-only-Ansicht aller Artikel
- [Epic_Export](../epics/Epic_Export/epic.md) — Export-Format enthält Artikel je Verkäufer

## Tags & Piles

**Tags:** #entity #artikel #datenmodell
