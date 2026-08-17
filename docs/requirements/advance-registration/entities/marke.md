---
status: reviewed
reviewed-date: 2026-08-17
---

# Entity: Marke

Verbindliche Quelle für diese App; Index → [overview.md](overview.md). Die Haupt-App führt eine eigene, leicht abweichende Fassung.

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | In der Domäne erzeugt, Unique-Check gegen DB vor Insert |
| `name` | string | ✅ | Bezeichnung, unique case-insensitive (Trim + Lowercase-Vergleich beim Anlegen) |
| `original` | boolean | ✅ | `true` bei Admin-Anlage, `false` bei Verkäufer-AutoComplete-Create; nachträglich vom Admin umschaltbar |

## Verwendung

- [Epic_Marken](../epics/Epic_Marken/epic.md) — Verwaltung durch Admin
- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) — AutoComplete-Create beim Artikel-Feld `brand`
- [Epic_Export](../epics/Epic_Export/epic.md) — optional exportierbar

## Tags & Piles

**Tags:** #entity #marke #datenmodell
