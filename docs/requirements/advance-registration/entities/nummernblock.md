---
status: reviewed
reviewed-date: 2026-08-14
---

# Entity: Nummernblock

Nur Voranmelde-App (☁️) — kanonische Quelle: [entities.md](../../entities.md).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Backend-generiert, Unique-Check gegen DB vor Insert |
| `verkaeuferId` | string | ✅ | FK auf Verkäufer, 1:n — ein Verkäufer kann mehrere zusammenhängende Blöcke haben |
| `vonNummer` | int | ✅ | Erste Nummer des Blocks; überlappungsfrei über alle Verkäufer (Backend-Validierung) |
| `bisNummer` | int | ✅ | **Persistiert.** Beim Anlegen aus `vonNummer + blockSize - 1` errechnet (`blockSize` aus [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) Abschnitt 2), danach unveränderlich — würde man bei jedem Lesen neu rechnen, verschöbe eine spätere Änderung von `blockSize` rückwirkend alle Blockgrenzen und damit die Zuordnung bereits vergebener Artikelnummern |
| `zugewiesenAm` | DateTime | ✅ | Auto bei Zuweisung |

**Constraints:**
- Kein Overlap: `[vonNummer, bisNummer]` darf sich mit keinem anderen Block überschneiden (über alle Verkäufer hinweg).
- 1:n-Beziehung Verkäufer↔Block: initial ein Block bei Anlage, automatische Erweiterung um weiteren Block sobald der aktuelle aufgebraucht ist (siehe [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) Abschnitt 2).

## Verwendung

- [Epic_Nummernbloecke](../epics/Epic_Nummernbloecke/epic.md) — Zuweisung/Übersicht durch Admin
- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) — `nummer`-Validierung gegen zugewiesenen Block
- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — `blockSize`/`startNumber`/`defaultBlockCount` als globale Parameter

## Tags & Piles

**Tags:** #entity #nummernblock #datenmodell
