---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: stammdaten-popup (Anlegen + Bearbeiten)

Ein Popup-Muster für die einfachen Stammdaten-Listen **Marke** und **Kategorie** — reine
Instanziierung, keine eigenen PrimeNG-Entscheidungen. Gleiches Modal für Anlegen und
Bearbeiten (Bearbeiten: Felder vorausgefüllt, zusätzlich „Original"-Toggle).

## Kontext

```
Anlegen (Modal sm):        Bearbeiten (Modal sm):
┌─────────────────┐        ┌─────────────────────┐
│ Neue <Entität>[✕]│        │ <Entität> bearb. [✕] │
├─────────────────┤        ├─────────────────────┤
│ Name             │        │ Name                 │
│ [___________]   │        │ [___________]        │
│                  │        │ ☐ Original            │  ← p-toggleswitch
├─────────────────┤        ├─────────────────────┤
│ [Abbr.] [Anlegen]│        │ [Abbr.] [Speichern]  │
└─────────────────┘        └─────────────────────┘
```

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Feld | PrimeNG |
|---|---|
| Name | [Input](input.md), Variante Text |
| Original (nur Edit) | [Boolean-Input](boolean-input.md), Variante Switch |
| Footer | [Button](button.md) secondary outlined (Abbrechen) / primary (Anlegen bzw. Speichern) |
| Save-Feedback | [Toast](toast.md) |

## Ausprägungen

| Entität | Titel (Anlegen / Bearbeiten) | Toast-Text | Epic |
|---|---|---|---|
| Marke | „Neue Marke" / „Marke bearbeiten" | „✓ Marke gespeichert" | [Epic_Marken](../epics/Epic_Marken/epic.md) |
| Kategorie | „Neue Kategorie" / „Kategorie bearbeiten" | „✓ Kategorie gespeichert" | [Epic_Kategorien](../epics/Epic_Kategorien/epic.md) |

## Abgrenzung

Verkäufer-Typ hat einen abweichenden Feldsatz (Name + Provision + Gebühr, kein Original-Flag)
→ eigenes [typ-popup.md](typ-popup.md).

## Akzeptanzkriterien

Siehe Epic_Marken AC-1 bis AC-4 bzw. Epic_Kategorien AC-1 bis AC-4 — diese Datei ist die
Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #marken #kategorien #stammdaten #popup #modal #toggleswitch #primeng
