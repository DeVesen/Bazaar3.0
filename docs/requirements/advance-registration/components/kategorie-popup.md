---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: kategorie-popup (Anlegen + Bearbeiten)

Identisch zu [`marke-popup.md`](marke-popup.md) — reine Instanziierung, keine neuen PrimeNG-Entscheidungen.

## Kontext

```
Anlegen (Modal sm):        Bearbeiten (Modal sm):
┌─────────────────┐        ┌─────────────────────┐
│ Neue Kategorie[✕]│        │ Kategorie bearb. [✕] │
├─────────────────┤        ├─────────────────────┤
│ Name             │        │ Name                 │
│ [___________]   │        │ [___________]        │
│                  │        │ ☐ Original            │  ← p-toggleswitch
├─────────────────┤        ├─────────────────────┤
│ [Abbr.] [Anlegen]│        │ [Abbr.] [Speichern]  │
└─────────────────┘        └─────────────────────┘
```

## Aufbau

| Feld | PrimeNG |
|---|---|
| Name | [Input](input.md), Variante Text |
| Original (nur Edit) | [Toggle-Switch](toggle-switch.md) |
| Footer | [Button](button.md) secondary outlined / primary |
| Save-Feedback | [Toast](toast.md) „✓ Kategorie gespeichert" |

## Akzeptanzkriterien

Siehe Epic_Kategorien AC-1 bis AC-4 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #kategorien #popup #toggleswitch #primeng
