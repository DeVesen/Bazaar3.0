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

| Element | PrimeNG |
|---|---|
| Marken/Kategorien einschließen | [Checkbox](checkbox.md) |
| Exportieren-Button | [Button](button.md) primary |
| Bestätigungsmeldung | Shared [`info-area`](../../../components/info-area/component.md) (Typ `info`), bleibt stehen — kein Auto-Dismiss wie [Toast](toast.md), besser lesbar für die Zahlen |

## Akzeptanzkriterien

Siehe Epic_Export AC-1 bis AC-4 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #export #checkbox #info-area #primeng
