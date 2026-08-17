---
status: reviewed
reviewed-date: 2026-08-17
updated: 2026-08-17
---

# Entity: Kategorie

Haupt-App-Sicht. Verbindliche Quelle für diese App; Index → [overview.md](overview.md).

Feldnamen englisch, Doku-Prosa deutsch (Sprachregel → [`spec.md`](../spec.md) Abschnitt 7.0.1).

## Felder

| Feld | Typ | Pflicht | Bemerkung |
|---|---|---|---|
| `id` | string (8 Zeichen) | ✅ | Alphanumerisch, unique |
| `name` | string | ✅ | Bezeichnung, unique case-insensitive (Trim + Lowercase-Vergleich beim Anlegen) |
| `original` | boolean | ✅ | `true` = vom Admin als Stammdatum angelegt, `false` = am Basar-Tag über das AutoComplete-Popup entstanden (`spec.md` Abschnitt 9.2). In Listen als Badge „✓ Original" / „Neu" |

Der Artikel referenziert die Kategorie **über den Namen**, nicht über `id` — siehe
[artikel.md](artikel.md). Ein Umbenennen zieht den neuen Namen in alle betroffenen
Artikel nach.

## Verwendung

- [Epic_Kategorien](../epics/Epic_Kategorien/epic.md) — Verwaltung
- [Epic_Artikelannahme](../epics/Epic_Artikelannahme/epic.md) — AutoComplete-Create während der Annahme
- [Epic_Einstellungen](../epics/Epic_Einstellungen/epic.md) — optionaler Import ([Schema](import-format.md))

## Tags & Piles

**Piles:** #pile/bazaar-app
**Tags:** #entity #kategorie #datenmodell #original-flag
