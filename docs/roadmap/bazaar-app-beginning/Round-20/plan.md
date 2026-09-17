---
round: Round-20
status: geplant
---

# Plan: Round 20 — Abrechnung: Verkäufer-Auswahl, Ansicht & Rückgabe

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-16/plan.md](../Round-16/plan.md): `shared/components/seller-search/`.
- [Round-18/plan.md](../Round-18/plan.md): `shared/components/scan-dialog/` —
  bisher nur der **Sammel-Modus** (Freigabe) implementiert; dieser Round ergänzt
  einen zweiten Schreib-Modus, s. Schritt 3.
- [Round-15/plan.md](../Round-15/plan.md): `Article`-Aggregate (Status-Ableitung),
  `IArticleRepository`.
- [Round-14/plan.md](../Round-14/plan.md): `ISellerRepository`, `Seller`-Aggregate.
- [Round-7/plan.md](../Round-7/plan.md): `features/settlement/settlement.routes.ts`
  + Platzhalter-Page, Route `/settlement` bereits registriert.

## Implementationsplan

### Backend

#### 1. `Article`-Aggregate erweitern

`Article.cs` (Round-15): `Return()`-Methode ergänzen — setzt `ReturnedAt = now`,
wirft bei `SoldAt != null` (`409 article.sold`). Kein neuer Port nötig, nutzt
`IArticleRepository`.

#### 2. `Bazaar.Application/Settlement/`

`ISellerSettlementQuery.cs` (Port, `Domain/Ports/`) — Read-Model-DTO mit allen in
spec.md gelisteten Feldern. **Gemeinsame Rundungslogik zuerst extrahieren**, da
sie hier gebraucht und in Round-21 identisch wiederverwendet wird:
`Bazaar.Domain/Settlement/SettlementCalculation.cs` (statische Methode oder
kleines Value-Object):

```csharp
public static class SettlementCalculation
{
    public static (decimal Commission, decimal Payout) Calculate(decimal revenue, decimal commissionRate)
    {
        var commission = Math.Round(revenue * commissionRate / 100m, 2, MidpointRounding.AwayFromZero);
        return (commission, revenue - commission);
    }
}
```

`GetSellerSettlementHandler` ruft `SettlementCalculation.Calculate` mit den vom
Query-Port gelieferten Rohwerten (`revenue`, `seller.SalesCommission`).

`ReturnArticleHandler` — lädt `Article` + `Seller.SettledAt`, `409
settlement.locked` bei gesetztem `SettledAt`, sonst `article.Return()`
(Schritt 1) + Save.

#### 3. Infrastructure

`SellerSettlementQuery.cs` — Aggregation gegen `Articles`/`Sellers` (analog
`SellerCardsQuery` aus Round-15, aber pro Einzel-Seller statt Seite).

#### 4. Api

`SettlementEndpoints.cs` (`Bazaar.Api/Features/Settlement/`) — `GET
/api/sellers/{id}/settlement`, `PUT /api/articles/{id}/return`.

### Frontend

#### 5. `scan-dialog` um Schreib-Modus erweitern

`shared/components/scan-dialog/scan-dialog.ts` (Round-18): neuer Input
`@Input() writeMode: 'batch' | 'immediate' = 'batch'`. Bei `'immediate'` löst
jeder erfolgreiche Treffer sofort `(articleConfirmed)` aus (neuer Output,
Parent ruft direkt den passenden Endpoint auf — die Komponente kennt weiterhin
keine Endpoints, nur das Ereignis), statt intern zu sammeln; die AutoComplete-
Liste aktualisiert sich nach jedem Treffer aus der bereits geladenen
Verkäufer-Artikelliste (Eintrag lokal entfernt, kein Reload nötig für die reine
Anzeige — die KPI-Kacheln im Parent lösen bei `articleConfirmed` einen eigenen
Reload aus). `'batch'` bleibt exakt das Round-18-Verhalten (Default, keine
Änderung für den Freigabe-Aufrufer).

#### 6. `features/settlement/`

`data/settlement-api.ts` (`getSettlement`, `returnArticle`), `settlement.page.ts`
ersetzt Round-7-Platzhalter: Zustand `signal<'selection'|'view'>('selection')`.
Selektion: `seller-search` mit `showCreateButton="false"`. Ansicht: Kopfzeile mit
vier Buttons, drei `kpi-tile`, Artikelliste (`p-table`, rein lesend, kein Bezug
zur vollen `Table`-Shared-Component nötig — analog zur Entscheidung bei
`seller-detail-modal`, Round-14).

„Abrechnen"-Klick bei `canSettle=true`: Toast/Hinweis „Abrechnen folgt in einem
späteren Häppchen" (kein Popup-Component in diesem Round). „Zurückgeben"-Klick
öffnet `scan-dialog` mit `targetField="returnedAt"`, `writeMode="immediate"`.
`articleConfirmed` → `settlement-api.ts`s `returnArticle(id)` (Aufruf bereits vom
Dialog selbst getriggert reicht auch — Entscheidung: **Parent ruft den Endpoint**,
nicht der Dialog, damit `scan-dialog` weiterhin keine HTTP-Kenntnis braucht) +
`getSettlement(sellerId)` erneut laden (kein optimistisches Update — einfacher
und bei diesem Datenvolumen unkritisch).

`printService.printSellerSummary(...)` — neue Methode am Round-17-`PrintService`,
vorerst Stub (Signatur `{sellerId, phase}`).

### 7. Verifikation

- `dotnet test` — `SettlementCalculation` (Beispielrechnung aus dem Epic:
  87,50€/15%→13,13€/74,37€), `GetSellerSettlementHandler` `canSettle`-Ableitung
  (Fixtures: kein Artikel freigegeben → `false`; ein Artikel `Selling` → `false`;
  alle `Sold`/`Returned` → `true`), `ReturnArticleHandler` beide Sperrfälle.
- `ng test` — `scan-dialog` `writeMode="immediate"`-Zweig isoliert von
  `'batch'` testen (Regressionsschutz für Round-18-Verhalten).
- `ng serve`: Verkäufer mit Artikeln aus Round-17/19 wählen → KPI-Kacheln
  korrekt, „Abrechnen" aktiv/inaktiv je nach offenen Artikeln, „Zurückgeben"
  scannt einzeln und schreibt sofort (Reload zeigt Status-Wechsel ohne
  Dialog-Schließen).

## Reihenfolge

Backend 1 → 2 → 3 → 4 sequenziell. Frontend 5 unabhängig (isolierte Komponenten-
Erweiterung), 6 nach 4 und 5, 7 abschließend.
