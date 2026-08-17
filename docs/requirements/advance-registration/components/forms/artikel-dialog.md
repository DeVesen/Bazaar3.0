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
| Artikelnummer       | [Input](../standard/input.md), Variante Text, readonly                                                                                                                                                                                                                                             |
| Bezeichnung         | [Input](../standard/input.md), Variante Text                                                                                                                                                                                                                                                       |
| Kategorie           | Shared [`autocomplete-create`](../../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Marke               | Shared [`autocomplete-create`](../../../../components/autocomplete-create/component.md)                                                                                                                                                                                                   |
| Größe               | [Input](../standard/input.md), Variante Text                                                                                                                                                                                                                                                       |
| Farbe               | [Input](../standard/input.md), Variante Text                                                                                                                                                                                                                                                       |
| Preis               | Shared [`input-group`](../../../../components/input-group/component.md) (`p-inputgroup`+[Input](../standard/input.md) Variante Number+`p-inputgroupaddon` „€" rechts) — bewusst **nicht** Variante Icon, Suffix-Betrag passt besser zum InputGroup-Addon-Muster als zu einem Icon-Overlay |
| Beschreibung        | `pTextarea`                                                                                                                                                                                                                                                                            |
| Löschen-Button      | [Button](../standard/button.md) danger, Footer links                                                                                                                                                                                                                                               |
| Löschen-Bestätigung | [Confirmdialog](../standard/confirmdialog.md) — erst nach Bestätigung `DELETE /api/articles/:id`                                                                                                                                                                                                   |
| Abbrechen/Speichern | [Button](../standard/button.md) secondary outlined / primary, Footer rechts                                                                                                                                                                                                                        |

## Validierung

Feldregeln nach [form.md](form.md) R-1/R-2. Dialog-spezifisch: Preis > 0
(Epic_Meine_Artikel AC-6), Pflichtfelder aus Abschnitt 3 der Epic-Doku (AC-2).

## Akzeptanzkriterien

Siehe Epic_Meine_Artikel AC-1, AC-2, AC-5, AC-6 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #meine-artikel #dialog #autocomplete-create #inputgroup #confirmdialog #primeng
