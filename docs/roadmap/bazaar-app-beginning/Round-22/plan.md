---
round: Round-22
status: geplant
---

# Plan: Round 22 — Statistik

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-21/plan.md](../Round-21/plan.md): `SettlementCalculation.Calculate`
  (`Bazaar.Domain/Settlement/`) — hier pro Verkäufer aufgerufen und summiert,
  keine neue Rundungslogik.
- [Round-15/plan.md](../Round-15/plan.md): `Article`-Status-Ableitung.
- [Round-13/plan.md](../Round-13/plan.md): `SellerType`-Liste für den
  Leaderboard-Filter.
- [Round-7/plan.md](../Round-7/plan.md): `features/statistics/statistics.routes.ts`
  + Platzhalter-Page.

## Implementationsplan

### Backend

#### 1. `IStatisticsQuery`

`Domain/Ports/IStatisticsQuery.cs` — ein DTO mit allen 14 Kennzahlen + Metergroup-
Prozenten + `LeaderboardRow[]`.

#### 2. `GetStatisticsHandler`

`Bazaar.Application/Statistics/GetStatisticsHandler.cs` — dünner Wrapper, ruft
`IStatisticsQuery.Get(sellerTypeId)`. Keine eigene Berechnungslogik im Handler
(die steckt komplett im Query, da es ausschließlich Aggregationen sind — kein
Anwendungsfall-Verzweigungscode, der eine separate Handler-Schicht rechtfertigt,
aber Konvention „ein Handler pro Endpoint" bleibt gewahrt).

#### 3. `StatisticsQuery`

`Bazaar.Infrastructure/Persistence/Queries/StatisticsQuery.cs`:
- Zeile 1/2 direkt per `COUNT`/`SUM` über `Articles`, gruppiert nach
  Status-Bedingungen (`ReleasedAt`/`SoldAt`/`ReturnedAt`-Kombinationen wie
  Round-15s Status-Ableitung, hier als SQL-`CASE`/LINQ-`Where`-Ketten
  nachgebildet, da EF Core die C#-Computed-Property nicht in SQL übersetzen kann).
- Provision: pro Seller `revenue = Sum(Sold-Artikel)`,
  `SettlementCalculation.Calculate(revenue, seller.SalesCommission).Commission`,
  über alle Seller summiert — **In-Memory-Nachaggregation** nötig, da die
  kaufmännische Rundung pro Seller erfolgen muss (nicht auf die Gesamtsumme),
  Rohdaten werden per einer Query geladen (`GroupBy(SellerId)`), Rundung läuft
  in C# nach dem Materialisieren der Gruppen — bleibt dennoch „eine Abfrage" im
  Sinne von spec.md (ein DB-Roundtrip, keine Portgrenzen-Verletzung, die
  Nachverarbeitung ist reine In-Memory-Rechnung auf bereits geladenen Daten).
- Leaderboard: pro Seller (optional gefiltert nach `sellerTypeId`) Zählungen +
  `SettlementCalculation`-Auszahlung, sortiert nach Verkaufsanzahl absteigend
  als Default (Frontend sortiert bei anderen Spalten selbst um — Leaderboard ist
  nicht paginiert/serverseitig sortiert laut spec.md, komplette Liste kommt in
  einer Antwort).

#### 4. Api

`StatisticsEndpoints.cs` (`Bazaar.Api/Features/Statistics/`) — `GET
/api/statistics?sellerTypeId=`.

### Frontend

#### 5. `features/statistics/`

`data/statistics-api.ts`, `statistics.page.ts` ersetzt Round-7-Platzhalter: ein
`load()`-Call bei Seitenaufruf (`ngOnInit`/`effect`), kein Reload bei
Leaderboard-Interaktion außer dem Typ-Filter-Dropdown (löst neuen
`GET /api/statistics?sellerTypeId=...` aus). Drei KPI-Zeilen als
`*ngFor`-Grids über `kpi-tile`, `p-metergroup` mit den drei Prozentwerten aus
der Response.

#### 6. `leaderboard`

`features/statistics/components/leaderboard/leaderboard.ts` — nutzt die
geteilte `table`-Komponente (bereits aus Round-1/Grundgerüst vorhanden als
generische Shared-Component, hier erster fachlicher Verwendungsnachweis mit
client-seitiger Sortierung, da die volle Liste bereits geladen ist).
Rang-Badge-Berechnung (`index + 1` nach Sortierung nach Verkaufsanzahl für die
Erstanzeige) als Pipe/Computed. Typ-Spalte `*ngIf="!selectedTypeId()"`.

### 7. Verifikation

- `dotnet test` — `StatisticsQuery`/`GetStatisticsHandler`: Verkaufsquote bei
  `Angenommen=0` → „–"-Sentinel (`null` im DTO, Frontend rendert „–"),
  Rundungskonsistenz (Summe der pro-Seller gerundeten Provisionen ≠ naiv auf die
  Gesamtsumme gerundeter Wert — Testfall belegt bewusst die pro-Seller-Rundung),
  `soldManually`-Schwellenwert (Summe `0` → Unterzeile im DTO `null`/ausgeblendet).
- `ng serve`: `/statistics` mit den bisherigen Testdaten aus Round-14–21 → alle
  Kacheln zeigen plausible Werte, Leaderboard sortierbar, Typ-Filter blendet
  Typ-Spalte aus.

## Reihenfolge

1 → 2 → 3 → 4 sequenziell. 5 nach 4, 6 nach 5 (oder parallel, da `leaderboard`
nur die Response-Teilstruktur `LeaderboardRow[]` braucht). 7 abschließend.
