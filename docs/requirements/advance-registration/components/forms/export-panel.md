---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: export-panel

## Kontext

```
┌─────────────────────────────────────────┐
│ Export                                   │
├─────────────────────────────────────────┤
│ ☐ Marken einschließen                    │
│ ☐ Kategorien einschließen                │
│                                           │
│ [ Exportieren ]                          │
│                                           │
│ ℹ 12 Verkäufer, 87 Artikel exportiert.  │  ← Info-Area (bleibt stehen)
└─────────────────────────────────────────┘
```

## Aufbau

Querschnitts-Regeln (Validierung, Submit-Sperre, Enter, Feedback) → [form.md](form.md).

| Element | PrimeNG |
|---|---|
| Marken/Kategorien einschließen | [Boolean-Input](../../../../components/boolean-input/component.md), Variante Checkbox |
| Exportieren-Button | [Button](../../../../components/button/component.md) primary |
| Bestätigungsmeldung | Shared [`info-area`](../../../../components/info-area/component.md) (Typ `info`), bleibt stehen — kein Auto-Dismiss wie [Toast](../../../../components/toast/component.md), besser lesbar für die Zahlen |

## Akzeptanzkriterien

Siehe [Epic_Export](../../epics/Epic_Export/epic.md) — **alle** dortigen Akzeptanzkriterien; diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #export #boolean-input #checkbox #info-area #primeng
