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

| Feld | PrimeNG |
|---|---|
| Name | [Input](input.md) |
| Provision (%) | [Number-Input](number-input.md), 2 Nachkommastellen |
| Gebühr (€) | [Number-Input](number-input.md), 2 Nachkommastellen |
| Footer | [Button](button.md) secondary outlined (Abbrechen) / primary (Speichern) |
| Save-Feedback | [Toast](toast.md) „✓ Verkäufer-Typ gespeichert" |

## Akzeptanzkriterien

Siehe Epic_Verkaeufer_Typen AC-1 bis AC-4 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #verkaeufer-typen #popup #modal #primeng
