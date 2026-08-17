---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: AutoComplete (Type-Ahead)

Type-Ahead-Suche über eine große Liste, **ohne** Inline-Anlegen — Abgrenzung zu [AutoComplete-Create](../../../components/autocomplete-create/component.md) (Suite-weit, hat Inline-Anlegen-Modal).

## Bild

```
┌─────────────────────────────┐
│ 🔍 max                   ▾ │
├─────────────────────────────┤
│ Max Mustermann (#7)        │
│ Maximilian Weber (#12)     │
└─────────────────────────────┘
```

## Aufbau

`p-autoComplete` — Filtert Optionsliste live nach Eingabe, kein Anlegen-Modal, keine Freitext-Übernahme (nur Auswahl aus Liste).

## Verwendung

| Epic/Component | Feld | Filterkriterien |
|---|---|---|
| [filter-panel.md](filter-panel.md) | Verkäufer-Filter (nur Alle Artikel) | Vorname/Nachname/Nummer |

## Tags & Piles

**Tags:** #autocomplete #type-ahead #primitive
