---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: marke-popup (Anlegen + Bearbeiten)

Reine Instanziierung — keine neuen PrimeNG-Entscheidungen (`p-toggleswitch` fürs Original-Flag bereits in der PrimeNG-Mapping-Tabelle festgelegt).

## Kontext

```
Anlegen (Modal sm):        Bearbeiten (Modal sm):
┌─────────────────┐        ┌─────────────────────┐
│ Neue Marke   [✕] │        │ Marke bearbeiten [✕] │
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
| Name | [Input](input.md) |
| Original (nur Edit) | [Toggle-Switch](toggle-switch.md) |
| Footer | [Button](button.md) secondary outlined / primary |
| Save-Feedback | [Toast](toast.md) „✓ Marke gespeichert" |

## Akzeptanzkriterien

Siehe Epic_Marken AC-1 bis AC-4 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #marken #popup #toggleswitch #primeng
