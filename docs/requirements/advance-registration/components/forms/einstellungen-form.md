---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: einstellungen-form

Reine Formulare — keine neuen PrimeNG-Entscheidungen.

## Kontext

```
BASAR-KONFIGURATION
  Voranmeldeschluss    [📅 Datum + Uhrzeit]
  Abgabe von           [📅 Datum + Uhrzeit]
  Abgabe bis           [📅 Datum + Uhrzeit]
  Basar von            [📅 Datum + Uhrzeit]
  Basar bis            [📅 Datum + Uhrzeit]
  Standard-Verkäufer-Typ [p-select]

NUMMERNBLOCK-PARAMETER
  Startnummer          [_____]
  Blockgröße           [_____]
  Standard-Blockanzahl [_____]

INFO-TEXT
  [Markdown-Textarea]

                              [Speichern]
```

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Feld | PrimeNG |
|---|---|
| Die 5 Basar-Termine | [Datepicker](../standard/datepicker.md) |
| `defaultTypeId` | [Select](../standard/select.md), Variante Dropdown — Liste aller Verkäufer-Typen |
| `startNumber` / `blockSize` / `defaultBlockCount` | [Input](../standard/input.md), Variante Number |
| `infoText` | `pTextarea` |
| Speichern-Button | [Button](../standard/button.md) primary |
| Save-Feedback | [Toast](../standard/toast.md) „✓ Einstellungen gespeichert" |

## Akzeptanzkriterien

Siehe Epic_Einstellungen AC-1 bis AC-3 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #einstellungen #datepicker #inputnumber #select #textarea #primeng
