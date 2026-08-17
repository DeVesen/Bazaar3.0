---
status: reviewed
reviewed-date: 2026-08-14
---

# Entity: Verkäufer-Typ

Gilt für beide Apps identisch — kanonische Quelle: [entities.md](../../entities.md).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Backend-generiert, Unique-Check gegen DB vor Insert |
| `bezeichnung` | string | ✅ | Unique (Dropdown-Unterscheidbarkeit), z. B. „Privat", „Gewerblich", „Verein" |
| `verkaufsprovisionAnteil` | double | ✅ | `0`–`100`, Dezimalstellen erlaubt (z. B. 12,5 %). UI zeigt „%"-Suffix mit `minFractionDigits="2"` — die frühere Angabe „ganze Prozentzahl" widersprach dieser bereits reviewten Darstellung |
| `abgabegebuehr` | double | ✅ | Gebühr pro abgegebenem Artikel |

**Löschschutz:** Typ mit zugewiesenen Verkäufern nicht löschbar — Logik siehe [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) AC (keine Duplizierung hier).

## Verwendung

- [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) — Verwaltung durch Admin
- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — Referenz via `verkaueferTypeId`

## Tags & Piles

**Tags:** #entity #verkaeufer-typ #datenmodell
