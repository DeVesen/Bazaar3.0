---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: Select

Standard-Dropdown für feste/geladene Optionslisten (kein Freitext, kein Inline-Anlegen).

## Bild

```
┌─────────────────────────────┐
│ Privat                   ▾ │
└─────────────────────────────┘
```

## Aufbau

`p-select [options] [(ngModel)]` — zeigt Liste beim Öffnen, ein Wert wählbar.

## Abgrenzung

- Braucht der Nutzer Freitext + Inline-Anlegen (z. B. Marke/Kategorie) → [AutoComplete-Create](../../../components/autocomplete-create/component.md) (Suite-weit), **nicht** `p-select`.
- Braucht der Nutzer Type-Ahead über eine große Liste ohne Anlegen (z. B. Verkäufer-Suche) → [AutoComplete (Type-Ahead)](autocomplete-typeahead.md).

## Verwendung

| Epic/Component | Feld | Bemerkung |
|---|---|---|
| [filter-panel.md](filter-panel.md) | Marke-/Kategorie-Filter | |
| [einstellungen-form.md](einstellungen-form.md) | `defaultTypeId` | Liste aller Verkäufer-Typen |
| [profil-page.md](profil-page.md) | Verkäufer-Typ | `[disabled]="true"` (read-only-Anzeige) |
| [verkaeufer-dialog.md](verkaeufer-dialog.md) | Verkäufer-Typ | nur bestehende Typen, kein Inline-Anlegen (Feld-Mismatch, siehe dort) |

## Tags & Piles

**Tags:** #select #dropdown #primitive #shared-across-epics
