---
round: Round-22
status: geklärt
---

# Spec: Round 22 — Statistik

## Fein-Spezifikation

### Ziel

Vollständiger Durchstich für Epic_Statistik: rein lesende Kennzahlen-Übersicht über
einen einzigen Query-Port-Endpoint, keine Schreiboperation.

### Frontend

**Feature-Ordner** `src/app/features/statistics/`, Route `/statistics`, für beide
Rollen erreichbar (keine Guard-Einschränkung außer `authGuard`).

- **KPI-Zeile 1 „ARTIKEL-ÜBERSICHT"** (6× [`kpi-tile`](../../../components/kpi-tile/component.md),
  Grid `c6`): Gesamt, Angenommen, Im Verkauf, Verkauft, Retour, Verkaufsquote (`–`
  wenn `Angenommen = 0`).
- **KPI-Zeile 2 „RÜCKBLICK"** (3× `kpi-tile`, Grid `c3`): Warenwert Angenommen,
  Warenwert Retour, Offener Warenwert.
- **KPI-Zeile 3 „FINANZ-KENNZAHLEN"** (6× `kpi-tile`, Grid `c6`): Einnahmen Brutto
  (mit Unterzeile „davon manuell", nur sichtbar wenn > 0), Verdienst Provision,
  Verdienst Gebühren, Verdienst Gesamt, Auszahlung erwartet, Auszahlung geleistet.
- Abschnitts-Labels über jeder Zeile (12px/700/uppercase/`#4a6080`).
- `p-metergroup` unter Zeile 3: Segmente Im Verkauf (primary)/Verkauft (success)/
  Retour (warn), bezogen auf alle angenommenen Artikel, Prozent + Label je Segment.
- **`leaderboard`** (`shared/components/leaderboard/` — baut auf der geteilten
  `table`-Komponente auf, aber nur Haupt-App-Verwendung, daher gemäß Konvention
  feature-lokal statt in `shared/`: `features/statistics/components/leaderboard/`):
  Typ-Filter-Dropdown („Alle Verkäufer-Typen" / einzelner Typ, Liste aus Round-13),
  Rang-Badge (Gold/Silber/Bronze/Grau, 50px), Spalten Rang/Verkäufer/Typ (nur bei
  „Alle")/Angenommen/Verkauft/Umsatz/Auszahlung (immer erwarteter Betrag, ✓ bei
  abgerechnet), alle sortierbar, Default-Sort Verkaufsanzahl absteigend,
  `max-height: 300px; overflow-y: auto`.

Alle Werte kommen aus **einem** `GET /api/statistics`-Aufruf pro Seitenaufruf, kein
Caching, keine Client-Aggregation, kein erneuter Request bei Filter-Wechsel im
Leaderboard außer dem serverseitigen Typ-Filter-Parameter.

### Backend

**Application** (`Bazaar.Application/Statistics/`):
- `GetStatisticsHandler` (`GET /api/statistics`) — Query-Port `IStatisticsQuery`,
  Parameter `sellerTypeId?` (Leaderboard-Filter). Liefert alle KPI-Werte, Metergroup-
  Prozente und die Leaderboard-Zeilen in **einer** Abfrage (kein `IQueryable` über die
  Portgrenze, kein Repository erweitert).
- Berechnungen: Verkaufsquote `Verkauft/Angenommen×100` (`null`/„–" bei
  `Angenommen=0`); „Verdienst Provision" = Summe `Preis × Seller.SalesCommission`
  über verkaufte Artikel, **kaufmännisch pro Verkäufer gerundet** (dieselbe
  `SettlementCalculation`-Routine aus [Round-21](../Round-21/spec.md), nicht neu
  implementiert); „Verdienst Gebühren" = Summe `Seller.IntakeFeePaid` über alle
  Verkäufer (abgelesen, nicht hochgerechnet); „Auszahlung erwartet" = Einnahmen Brutto
  − Verdienst Gesamt (über **alle** Verkäufer); „Auszahlung geleistet" = Summe
  `Seller.PayoutAmount` über **abgerechnete** Verkäufer; „davon manuell" = Summe der
  Preise mit `SoldManually=true`.

**Infrastructure**:
- `StatisticsQuery` — real implementiert gegen Article-/Seller-Tabellen, nutzt die in
  Round-21 extrahierte gemeinsame Rundungsroutine für die Provisions-Summe.

**Api** (`Bazaar.Api/Features/Statistics/`):
- `GET /api/statistics` (`authenticated`) — DTOs exakt nach
  [`api/statistics.md`](../../../requirements/bazaar-app/api/statistics.md).

### Akzeptanzkriterien

Epic_Statistik AC-1 bis AC-8 vollständig.

### Tests

Nach [Round-5](../Round-5/spec.md)-Konventionen:
- Application-UnitTests: `GetStatisticsHandler` (Verkaufsquote-Kantenfall
  `Angenommen=0`, Rundungskonsistenz mit `SettlementCalculation`, Typ-Filter,
  „davon manuell"-Schwellenwert).
- Frontend: KPI-Zeilen, Metergroup, `leaderboard` (Sortierung, Typ-Filter,
  Spalten-Ein-/Ausblendung) — Vitest.
- Architecture-Tests: Schichten-Regel.

### Bewusst nicht in diesem Round

Jegliche Schreiboperation — die Seite ist vollständig lesend, keine Ausnahme.
