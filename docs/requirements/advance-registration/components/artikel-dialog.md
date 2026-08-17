---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: artikel-dialog (Meine Artikel)

## Kontext

```
Artikel-Dialog (Modal, Standard-Größe):
┌─────────────────────────────────────────┐
│  Artikel bearbeiten                  [✕] │
├─────────────────────────────────────────┤
│  Artikelnummer (readonly)                │
│  Bezeichnung                            │
│  Kategorie ▾+   Marke ▾+                │
│  Größe        Farbe                     │
│  Preis [_____] €                        │
│  Beschreibung [textarea]                │
├─────────────────────────────────────────┤
│  [Löschen]        [Abbrechen] [Speichern]│
└─────────────────────────────────────────┘

Klick "Löschen" →
┌─────────────────────────────────┐
│  ⚠ Artikel wirklich löschen?    │  ← p-confirmdialog
│           [Abbrechen] [Löschen] │
└─────────────────────────────────┘
```

Modal-Muster: Standard-Größe, Footer „Mit Löschen" (siehe `docs/components/modal/component.md`).

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Feld                | PrimeNG                                                                                                                                                                                                                                                                                |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Artikelnummer       | [Input](input.md), Variante Text, readonly                                                                                                                                                                                                                                             |
| Bezeichnung         | [Input](input.md), Variante Text                                                                                                                                                                                                                                                       |
| Kategorie           | Shared [`autocomplete-create`](../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Marke               | Shared [`autocomplete-create`](../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Größe               | [Input](input.md), Variante Text                                                                                                                                                                                                                                                       |
| Farbe               | [Input](input.md), Variante Text                                                                                                                                                                                                                                                       |
| Preis               | Shared [`input-group`](../../../components/input-group/component.md) (`p-inputgroup`+[Input](input.md) Variante Number+`p-inputgroupaddon` „€" rechts) — bewusst **nicht** Variante Icon, Suffix-Betrag passt besser zum InputGroup-Addon-Muster als zu einem Icon-Overlay |
| Beschreibung        | `pTextarea`                                                                                                                                                                                                                                                                            |
| Löschen-Button      | [Button](button.md) danger, Footer links                                                                                                                                                                                                                                               |
| Löschen-Bestätigung | [Confirmdialog](confirmdialog.md) — erst nach Bestätigung `DELETE /api/articles/:id`                                                                                                                                                                                                   |
| Abbrechen/Speichern | [Button](button.md) secondary outlined / primary, Footer rechts                                                                                                                                                                                                                        |

## Validierung

- Preis > 0, sonst Fehlermeldung unterm Feld (Epic_Meine_Artikel AC-6)
- Alle Pflichtfelder aus Abschnitt 3 (Epic-Doku) müssen gefüllt sein, sonst Speichern-Button deaktiviert (AC-2)

## Akzeptanzkriterien

Siehe Epic_Meine_Artikel AC-1, AC-2, AC-5, AC-6 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #meine-artikel #dialog #autocomplete-create #inputgroup #confirmdialog #primeng
