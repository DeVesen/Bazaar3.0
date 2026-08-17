---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: typ-popup (Anlegen + Bearbeiten)

Reine Instanziierung — keine neuen PrimeNG-Entscheidungen. Gleiches Popup für Anlegen und Bearbeiten (Bearbeiten: Felder vorausgefüllt).

## Kontext

```
┌─────────────────────────┐
│  Neuer Verkäufer-Typ [✕]│  ← Modal sm
├─────────────────────────┤
│  Name                    │
│  [_____________]        │
│  Provision (%)           │
│  [_____________]        │
│  Gebühr (€)              │
│  [_____________]        │
├─────────────────────────┤
│  [Abbrechen] [Speichern] │
└─────────────────────────┘
```

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Feld | PrimeNG |
|---|---|
| Name | [Input](../standard/input.md), Variante Text |
| Provision (%) | [Input](../standard/input.md), Variante Number, 2 Nachkommastellen |
| Gebühr (€) | [Input](../standard/input.md), Variante Number, 2 Nachkommastellen |
| Footer | [Button](../standard/button.md) secondary outlined (Abbrechen) / primary (Speichern) |
| Save-Feedback | [Toast](../standard/toast.md) „✓ Verkäufer-Typ gespeichert" |

## Akzeptanzkriterien

Siehe [Epic_Verkaeufer_Typen](../../epics/Epic_Verkaeufer_Typen/epic.md) — **alle** dortigen Akzeptanzkriterien; diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #verkaeufer-typen #popup #modal #primeng
