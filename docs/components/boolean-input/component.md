---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: Boolean-Input

Ein Primitive für Ja/Nein-Werte — in zwei Varianten: **Checkbox** und **Switch**.

## Bild

```
Checkbox:
[ ✓ ]  Marken einschließen

Switch:
Original   [●─────]   (an)
Original   [─────○]   (aus)
```

## Varianten

| Variante     | Aufbau                                                | Einsatz |
| ------------ | ----------------------------------------------------- | ------- |
| **Checkbox** | `p-checkbox` + `<label>` nebeneinander, `gap: 10px`   | Option innerhalb eines Formulars, die erst mit „Absenden"/„Speichern" wirkt |
| **Switch**   | `p-toggleswitch [(ngModel)]`                          | Flag-Umschalter, der als Zustand gelesen wird (An/Aus-Charakter) |

## Verwendung

| Epic/Component | Feld | Variante |
|---|---|---|
| [export-panel.md](../../requirements/advance-registration/components/export-panel.md) | Marken/Kategorien einschließen | Checkbox |
| [verkaeufer-dialog.md](../../requirements/advance-registration/components/verkaeufer-dialog.md) | Admin-Rechte | Checkbox |
| [stammdaten-popup.md](../stammdaten-popup/component.md) | `original`-Flag (Marke, Kategorie — nur Edit-Modus) | Switch |

## Tags & Piles

**Tags:** #boolean-input #checkbox #toggle-switch #primitive #shared-across-epics
