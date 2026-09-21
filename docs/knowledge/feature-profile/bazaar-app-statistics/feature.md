# Statistics (Statistik)

**Intent:** Read-only Kennzahlen-Dashboard für den laufenden Basar — Artikel-Durchsatz, Warenwerte, Finanz-Kennzahlen und ein sortierbares Verkäufer-Leaderboard.
**Coverage:** partial
**Last reviewed:** 2026-09-21

## Capabilities
- User sees Artikel-Übersicht KPIs (Gesamt/Angenommen/Im Verkauf/Verkauft/Retour/Verkaufsquote) — `pages/statistics-page/statistics-page.html`
- User sees Rückblick-Warenwerte (Angenommen/Retour/Offen) — `statistics-page.html`
- User sees Finanz-Kennzahlen (Einnahmen Brutto inkl. manueller Anteil, Provision, Gebühren, Verdienst Gesamt, Auszahlung erwartet/geleistet) — `statistics-page.ts` (`grossIncomeDisplay`, `grossIncomeManualSubLabel`)
- User sees a meter/progress breakdown of accepted articles into Im Verkauf/Verkauft/Retour (percent of accepted, not of total) — `statistics-page.ts` (`meterItems`)
- User can filter the whole page by Verkäufer-Typ, triggering a fresh `GET /api/statistics?sellerTypeId=...` — `statistics-page.ts` (`onTypeFilterChange`) — the only interaction that re-fetches
- User can sort the leaderboard by any column client-side (Rang/Verkäufer/Typ/Angenommen/Verkauft/Umsatz/Auszahlung) without a new request — `components/leaderboard/leaderboard.ts` (`onSortChange`, `sortedRows`)
- User sees leaderboard rank recomputed live to match the currently displayed sort order, never the backend's default order — `leaderboard.ts`
- User sees Rang badges colored Gold/Silber/Bronze for the top 3 — `leaderboard.ts` (`rankSeverity`)
- User sees a "✓" badge next to Auszahlung when that seller is already settled — `leaderboard.ts` (`secondaryBadge`)
- User sees the "Typ" column hidden in the leaderboard when a single Verkäufer-Typ is already selected — `leaderboard.ts` (`typeColumnVisible`)
- User sees "—" instead of a fake 0 when a KPI value is null (e.g. Verkaufsquote with zero articles) — `statistics-page.ts` (`sellRateDisplay`)

## Spans
- **Frontend:** `features/statistics/pages/statistics-page/`, `features/statistics/components/leaderboard/`, `features/statistics/data/statistics-api.ts`; cross-feature read-only import of `seller-types/data/seller-types-api` for the type-filter dropdown
- **Backend:** `Bazaar.Api/Features/Statistics/StatisticsEndpoints.cs` (`GET /api/statistics`, single endpoint, `GetStatisticsHandler`)

## Notes
- No client-side aggregation at all — every number comes straight from the one backend response; the leaderboard's re-sort is the only client-side computation, and it's display-order only (source rows untouched).
- `GetStatisticsHandler`'s query/aggregation logic (Bazaar.Application/Infrastructure) not walked — only the Api-layer DTO shape.
- Coverage `partial`: frontend templates/handlers walked at signature level; backend query implementation not read.
