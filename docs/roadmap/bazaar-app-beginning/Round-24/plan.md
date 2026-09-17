---
round: Round-24
status: geplant
---

# Plan: Round 24 — Druckfunktionen: Verkäufer-Übersicht

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-23/plan.md](../Round-23/plan.md): `core/print/print.service.ts` bereits
  vorhanden (`printIntakeReceipt` real), Muster für dynamisches Component-
  Rendering + `window.print()` — hier für eine zweite Methode wiederverwendet.
- [Round-20/plan.md](../Round-20/plan.md): `settlement-api.ts`s `getSettlement`
  (liefert `openCount`/`soldCount`/`returnedCount`/`revenue`/`commission`/
  `payout`/`intakeFeePaid`), Stub-Aufrufe `printSellerSummary({sellerId, phase:
  'preliminary'|'final'})`.
- [Round-21/plan.md](../Round-21/plan.md): zweiter Stub-Aufrufer (`phase:
  'final'` nach Buchung).
- [Round-14/plan.md](../Round-14/plan.md): `qr-code`, `sellers-api.ts`s
  `getArticles(sellerId)`.

## Implementationsplan

### Frontend

#### 1. `shared/components/print-verkaeufer-uebersicht/`

`print-verkaeufer-uebersicht.ts`: `@Input() seller`, `@Input() articles:
ArticleSummary[]` (alle des Verkäufers, Component gruppiert selbst nach Status),
`@Input() settlement: {revenue, commission, payout, commissionRate,
intakeFeePaid}`, `@Input() phase: 'preliminary' | 'final'`. Gruppierung als
Computed (`articles().filter(a => a.status === 'selling')` etc.), feste
Reihenfolge im Template. `*ngIf="phase() === 'preliminary'"` für den
Vorläufig-Hinweis am Fuß.

#### 2. `printService.printSellerSummary` — reale Implementierung

`core/print/print.service.ts`: neue Methode, Signatur `{sellerId, phase}`
(unverändert aus Round-20/21). Lädt `getSettlement(sellerId)` (Round-20) und
`getArticles(sellerId)` (Round-14) parallel (`forkJoin`/`Promise.all`), rendert
`print-verkaeufer-uebersicht` über dasselbe dynamische Component-Rendering-Muster
wie `printIntakeReceipt` (Round-23), `window.print()`.

### 3. Verifikation

- `ng test` — Component-Test: Gruppierung korrekt bei gemischten Status,
  leere Gruppe zeigt „—", `phase='preliminary'` zeigt Vorläufig-Hinweis,
  `phase='final'` nicht. Beträge identisch zu `settlement-panel`s Anzeige bei
  gleichem Verkäufer (gemeinsame Datenquelle, kein eigener Rechenweg in der
  Print-Komponente).
- `ng serve`: `/settlement` „Drucken" vor Rückgabe/Abrechnen → Vorschau zeigt
  „Noch im Verkauf" gefüllt + Vorläufig-Hinweis. Nach Abrechnen (Round-21) →
  automatischer Druck zeigt „Noch im Verkauf" leer (—), endgültige Beträge, kein
  Vorläufig-Hinweis. Manuelles Drucken bei bereits abgerechnetem Verkäufer
  (Round-20-Zustand) → ebenfalls `'final'`.

## Reihenfolge

1 → 2 sequenziell. 3 abschließend.
