---
status: reviewed
reviewed-date: 2026-08-14
---

# Component: artikel-readonly-modal (Alle Artikel)

Gleiche Feldbasis wie [`artikel-dialog.md`](artikel-dialog.md), aber **alle Felder readonly** und ein zusätzliches Verkäufer-Feld — keine Aktionen außer Schließen.

## Kontext

```
┌─────────────────────────────────────────┐
│  Artikel ansehen                     [✕] │
├─────────────────────────────────────────┤
│  Verkäufer: Max Mustermann (#42)         │  ← zusätzlich, readonly
│  Artikelnummer (readonly)                │
│  Bezeichnung (readonly)                  │
│  Kategorie (readonly)   Marke (readonly) │
│  Größe (readonly)     Farbe (readonly)   │
│  Preis (readonly) €                      │
│  Beschreibung (readonly)                 │
├─────────────────────────────────────────┤
│                            [Schließen]   │
└─────────────────────────────────────────┘
```

Modal-Muster: Standard-Größe, Footer „Nur Schließen" (siehe `docs/components/modal/component.md`).

## Aufbau

Alle Felder wie in `artikel-dialog.md`, aber durchgängig `[readonly]="true"` bzw. `[disabled]="true"` (kein `p-select`/`p-autoComplete`-Interaktion, keine `p-confirmdialog`-Logik). Zusätzliches Feld:

| Feld | PrimeNG |
|---|---|
| Verkäufer (Name + Nummer) | [Input](input.md) readonly |

## Akzeptanzkriterien

Siehe Epic_Alle_Artikel AC-1 — diese Datei ist die Struktur-Referenz, keine eigenen zusätzlichen AC.

## Tags & Piles

**Tags:** #alle-artikel #modal #readonly #primeng
