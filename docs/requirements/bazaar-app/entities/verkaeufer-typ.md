---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Entity: Verkäufer-Typ

Haupt-App-Sicht. Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Alphanumerisch, unique |
| `name` | string | ✅ | Bezeichnung, unique — z. B. „Privat", „Gewerblich", „Verein" |
| `commissionRate` | decimal | ✅ | Verkaufsprovision in Prozent, `0`–`100`, Dezimalstellen erlaubt |
| `itemFee` | decimal | ✅ | Gebühr pro abgegebenem Artikel |

## Vorlage, kein verbindlicher Join

Der Typ ist eine **Vorlage**: Beim Anlegen oder Typwechsel eines Verkäufers belegt er
dessen Felder `salesCommission` und `feePerItem` vor, die danach überschreibbar sind
(`spec.md` Abschnitte 9.6/9.7). Berechnungen lesen immer die Felder am Verkäufer.

Der `name` ist außerdem der **app-übergreifende Matching-Schlüssel**: Der Import aus
der Voranmelde-App liefert nur den Typnamen, diese App löst ihn gegen ihre eigenen Typen
auf ([import-format.md](import-format.md)).

## Verwendung

- [Epic_Verkaeufer_Typen](../epics/Epic_Verkaeufer_Typen/epic.md) — Verwaltung
- [Epic_Verkaeufer](../epics/Epic_Verkaeufer/epic.md) — Vorbelegung der Konditionen
- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — Auflösung beim Import

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entity #verkaeufer-typ #datenmodell #konditionen
