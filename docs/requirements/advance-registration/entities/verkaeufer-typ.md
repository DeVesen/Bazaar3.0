---
status: reviewed
reviewed-date: 2026-08-17
---

# Entity: Verkäufer-Typ

Verbindliche Quelle für diese App; Index → [overview.md](overview.md). Die Haupt-App führt eine eigene, leicht abweichende Fassung.

## Felder

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 10.0.1).

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | In der Domäne erzeugt, Unique-Check gegen DB vor Insert |
| `name` | string | ✅ | Bezeichnung, unique (Dropdown-Unterscheidbarkeit), z. B. „Privat", „Gewerblich", „Verein" |
| `commissionRate` | decimal | ✅ | Verkaufsprovision in Prozent, `0`–`100`, Dezimalstellen erlaubt (z. B. 12,5 %). UI zeigt „%"-Suffix mit `minFractionDigits="2"` |
| `itemFee` | decimal | ✅ | Abgabegebühr pro abgegebenem Artikel |

**Löschschutz:** Typ mit zugewiesenen Verkäufern nicht löschbar — Logik siehe [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) AC (keine Duplizierung hier).

## Verwendung

- [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) — Verwaltung durch Admin
- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — Referenz via `sellerTypeId`

## Tags & Piles

**Tags:** #entity #verkaeufer-typ #datenmodell
