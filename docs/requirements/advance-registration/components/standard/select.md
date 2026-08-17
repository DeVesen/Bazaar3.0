---
status: reviewed
reviewed-date: 2026-08-17
---

# Component: Select

Ein Primitive für „einen Wert aus einer Liste wählen" — in zwei Varianten: **Dropdown** und
**Type-Ahead**. Beide ohne Freitext-Übernahme und ohne Inline-Anlegen.

## Bild

```
Dropdown:
┌─────────────────────────────┐
│ Privat                   ▾ │
└─────────────────────────────┘

Type-Ahead:
┌─────────────────────────────┐
│ 🔍 max                   ▾ │
├─────────────────────────────┤
│ Max Mustermann (#7)        │
│ Maximilian Weber (#12)     │
└─────────────────────────────┘
```

## Varianten

| Variante       | Aufbau                                | Einsatz |
| -------------- | ------------------------------------- | ------- |
| **Dropdown**   | `p-select [options] [(ngModel)]`      | feste/kurze Optionsliste, komplett beim Öffnen sichtbar |
| **Type-Ahead** | `p-autoComplete`                      | große Liste, Filterung live nach Eingabe, nur Auswahl aus der Liste |

## Modifier

| Modifier | Umsetzung | Bemerkung |
|---|---|---|
| Readonly-Anzeige | `[disabled]="true"` | Wert sichtbar, nicht änderbar |

## Abgrenzung

| Fall | Stattdessen |
|---|---|
| Freitext + Inline-Anlegen (z. B. Marke/Kategorie im Artikel-Dialog) | [AutoComplete-Create](../../../../components/autocomplete-create/component.md) (Suite-weit) — hat Anlegen-Modal |
| Freitext ohne Liste | [input.md](input.md) |

## Verwendung

| Epic/Component | Feld | Variante |
|---|---|---|
| [filter-panel.md](../custom/filter-panel.md) | Marke-/Kategorie-Filter | Dropdown |
| [filter-panel.md](../custom/filter-panel.md) | Verkäufer-Filter (nur Alle Artikel) | Type-Ahead — filtert über Vorname/Nachname/Nummer |
| [einstellungen-form.md](../forms/einstellungen-form.md) | `defaultTypeId` | Dropdown — Liste aller Verkäufer-Typen |
| [profil-page.md](../forms/profil-page.md) | Verkäufer-Typ | Dropdown, `[disabled]="true"` |
| [verkaeufer-dialog.md](../forms/verkaeufer-dialog.md) | Verkäufer-Typ | Dropdown — nur bestehende Typen, kein Inline-Anlegen (Feld-Mismatch, siehe dort) |

## Tags & Piles

**Tags:** #select #dropdown #autocomplete #type-ahead #primitive #shared-across-epics
