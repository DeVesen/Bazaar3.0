---
status: reviewed
reviewed-date: 2026-08-14
---

# Entity: Marke

Gilt für beide Apps identisch — kanonische Quelle: [entities.md](../../entities.md).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Backend-generiert, Unique-Check gegen DB vor Insert |
| `bezeichnung` | string | ✅ | Unique case-insensitive (Trim + Lowercase-Vergleich beim Anlegen) |
| `original` | boolean | ✅ | `true` bei Admin-Anlage, `false` bei Verkäufer-AutoComplete-Create; nachträglich vom Admin umschaltbar |

## Verwendung

- [Epic_Marken](../epics/Epic_Marken/epic.md) — Verwaltung durch Admin
- [Epic_Meine_Artikel](../epics/Epic_Meine_Artikel/epic.md) — AutoComplete-Create beim Artikel-Feld `marke`
- [Epic_Export](../epics/Epic_Export/epic.md) — optional exportierbar

## Tags & Piles

**Tags:** #entity #marke #datenmodell
