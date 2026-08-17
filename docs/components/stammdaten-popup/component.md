---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: stammdaten-popup (Anlegen + Bearbeiten)

Ein Popup-Muster für die einfachen Stammdaten-Listen **Marke** und **Kategorie** — reine
Instanziierung, keine eigenen PrimeNG-Entscheidungen. Gleiches Modal für Anlegen und
Bearbeiten (Bearbeiten: Felder vorausgefüllt, zusätzlich „Original"-Toggle).

**Verwendung:** beide Apps, in vier Ausprägungen — Aufbau und Verhalten identisch, nur die Bezeichnung wechselt:

| App | Ausprägung | Epic |
|---|---|---|
| Voranmelde-App | Marke · Kategorie | [Epic_Marken](../../requirements/advance-registration/epics/Epic_Marken/epic.md) · [Epic_Kategorien](../../requirements/advance-registration/epics/Epic_Kategorien/epic.md) |
| Haupt-App | Marke · Kategorie | [Epic_Marken](../../requirements/bazaar-app/epics/Epic_Marken/epic.md) · [Epic_Kategorien](../../requirements/bazaar-app/epics/Epic_Kategorien/epic.md) |

**In beiden Apps gleich:** Anlegen zeigt nur „Name" (kein `original`-Toggle — was der Admin anlegt, ist per Definition kuratiert, der Server setzt das Flag aus der Rolle), Bearbeiten zeigt „Name" **und** den Toggle.

**Einziger Unterschied:** Wer das Popup öffnen darf. In der Voranmelde-App nur der Admin; in der Haupt-App ebenfalls nur der Admin, aber dort sieht Kassenpersonal die Tabelle **ohne** Aktionsspalte, weil es Marken ausschließlich implizit über das AutoComplete-Popup der Artikelannahme anlegt ([autocomplete-create](../autocomplete-create/component.md)).

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

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](../../requirements/advance-registration/components/forms/form.md).

| Feld | PrimeNG |
|---|---|
| Name | [Input](../input/component.md), Variante Text |
| Original (nur Edit) | [Boolean-Input](../boolean-input/component.md), Variante Switch |
| Footer | [Button](../button/component.md) secondary outlined (Abbrechen) / primary (Anlegen bzw. Speichern) |
| Save-Feedback | [Toast](../toast/component.md) |

## Ausprägungen

| Entität | Titel (Anlegen / Bearbeiten) | Toast-Text | Epic |
|---|---|---|---|
| Marke | „Neue Marke" / „Marke bearbeiten" | „✓ Marke gespeichert" | [Epic_Marken](../../requirements/advance-registration/epics/Epic_Marken/epic.md) |
| Kategorie | „Neue Kategorie" / „Kategorie bearbeiten" | „✓ Kategorie gespeichert" | [Epic_Kategorien](../../requirements/advance-registration/epics/Epic_Kategorien/epic.md) |

## Abgrenzung

Verkäufer-Typ hat einen abweichenden Feldsatz (Name + Provision + Gebühr, kein Original-Flag)
→ eigenes [typ-popup.md](../typ-popup/component.md).

## Akzeptanzkriterien

Siehe [Epic_Marken](../../requirements/advance-registration/epics/Epic_Marken/epic.md) bzw. [Epic_Kategorien](../../requirements/advance-registration/epics/Epic_Kategorien/epic.md)
— jeweils **alle** dortigen Akzeptanzkriterien; diese Datei ist die Struktur-Referenz,
keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #marken #kategorien #stammdaten #popup #modal #toggleswitch #primeng
