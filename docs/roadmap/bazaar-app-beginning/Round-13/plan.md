---
round: Round-13
status: geplant
---

# Plan: Round 13 — Verkäufer-Typen

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-11/plan.md](../Round-11/plan.md)/[Round-12/plan.md](../Round-12/plan.md):
  Muster für Stammdaten-CRUD (Aggregate mit privaten Settern, Repository-Port,
  `citext`-Unique-Index, Platzhalter-Query-Port-Konvention mit
  `// TODO(Round-x)`-Kommentar), aber **kein** direkt wiederverwendbares Popup — der
  Feldsatz (Name+Provision+Gebühr, kein `original`) weicht ab, `typ-popup` ist eine
  eigene Komponente (spec.md).
- [Round-7/plan.md](../Round-7/plan.md): `features/seller-types/seller-types.routes.ts`
  + Platzhalter-Page, Route `/seller-types` bereits registriert.

## Implementationsplan

### Backend

#### 1. `Bazaar.Domain/SellerType/`

`SellerType.cs`: `Id`, `Name`, `CommissionRate` (decimal), `ItemFee` (decimal).
Domain-Invariante **im Konstruktor/in `Update`-Methode** geprüft (nicht nur
FluentValidation):

```csharp
private static void EnsureValidRange(decimal commissionRate, decimal itemFee)
{
    if (commissionRate is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(commissionRate));
    if (itemFee < 0) throw new ArgumentOutOfRangeException(nameof(itemFee));
}
```

`ISellerTypeRepository.cs`. Platzhalter-Port `ISellerCountBySellerTypeQuery.cs`
(`Task<int> CountBySellerTypeId(string id)`) — analog Round-11/12s
Artikel-Zähl-Platzhalter, hier aber gegen die noch fehlende **Seller**-Tabelle
(Round-14 löst es real ein, nicht Round-15 — abweichend vom Brand/Category-Muster,
in spec.md bereits so festgehalten).

#### 2. Infrastructure

`SellerTypeConfiguration.cs` (`Name` als `citext`, Unique-Index),
`SellerTypeRepository.cs`, `SellerCountBySellerTypeQuery.cs` (Platzhalter, `// TODO
(Round-14): reale Zählung gegen Sellers.SellerTypeId implementieren`, gibt konstant
`0` zurück).

#### 3. Application (`Bazaar.Application/SellerTypes/`)

`GetSellerTypesHandler`, `CreateSellerTypeCommand`+`Validator`+`Handler`,
`UpdateSellerTypeCommand`+`Validator`+`Handler`, `DeleteSellerTypeHandler`.
FluentValidation prüft dieselben Grenzen wie die Domain-Invariante — Validator
liefert `400` (Formatfehler, AC-4 verlangt serverseitige Ablehnung unabhängig vom
Formular), Domain-Invariante ist die zweite Absicherung bei direktem
Handler-Aufruf (z. B. aus Tests oder künftigem Code, der den Validator umgeht).

#### 4. Api (`Bazaar.Api/Features/SellerTypes/`)

`SellerTypeEndpoints.cs`: `GET` `authenticated`, `POST/PUT/DELETE`
`RequireAuthorization("admin")` — **abweichend von Brands/Categories**, kein
Kassenpersonal-seitiges Anlegen (spec.md-Begründung: Provision/Gebühr nicht
implizit erfindbar).

### Frontend

#### 5. `typ-popup`-Komponente

`features/seller-types/components/typ-popup/` (**feature-lokal**, nicht `shared/`
— nur innerhalb dieser App von diesem einen Feature verwendet, kein
Cross-Feature-Bedarf wie bei `master-data-popup`). Felder: Name (`pInputText`),
Provision (`p-inputnumber`, Prozent-Variante), Gebühr (`p-inputnumber`,
Geld-Variante). Statischer Hinweistext im Dialog: „Änderungen wirken nicht
rückwirkend auf bereits zugewiesene Verkäufer."

#### 6. `features/seller-types/`

`data/seller-types-api.ts`, `seller-types-store.ts`, `pages/seller-types.page.ts`
(ersetzt Round-7-Platzhalter). Tabellen-Spalten **ohne ID-Spalte**
(`name`/`commissionRate`/`itemFee`/`sellerCount`), `emptyText` nach spec.md.
Aktionsspalte nur Admin, aber hier zusätzlich: „+ Neu" ebenfalls nur Admin (anders
als Brands/Categories, wo Kassenpersonal zwar keine Aktionsspalte, aber theoretisch
implizit über AutoComplete anlegen könnte — bei Typen entfällt dieser Weg komplett).

### 7. Verifikation

- `dotnet test` — Wertebereichsgrenzen (0/100, negativ) sowohl über
  FluentValidation (`400`) als auch Domain-Invariante (Exception bei direktem
  Aufruf) abgedeckt.
- `ng serve`: `/seller-types` als Kassenpersonal → nur lesend, kein „+ Neu"; als
  Admin → volle CRUD. Leerzustand-Text vor erstem Anlegen sichtbar (blockiert
  faktisch noch nichts, da Verkäufer-Anlegen erst Round-14 existiert).

## Reihenfolge

1 → 2 → 3 → 4 sequenziell. 5 unabhängig startbar, 6 nach 4 und 5, 7 abschließend.
