---
round: Round-11
status: geplant
---

# Plan: Round 11 — Marken

Fein-Spezifikation siehe [spec.md](./spec.md).

## Ausgangsbasis aus Vorgänger-Rounds

- [Round-10/plan.md](../Round-10/plan.md): `IIdGenerator`/`NanoIdGenerator` (8-Zeichen
  Base62, wiederverwendbar für `Brand.Id`), Repository-/Configuration-Muster
  (`IEntityTypeConfiguration<T>` in `Configurations/`, Repository in
  `Repositories/`), `DomainExceptionHandler`/`ConflictException` für `409`-Mapping,
  `RequireAuthorization("admin")`-Policy bereits registriert.
- [Round-7/plan.md](../Round-7/plan.md): `features/brands/brands.routes.ts` +
  Platzhalter-Page (`<p>Marken</p>`), Route `/brands` bereits mit `[authGuard]` (seit
  Round-10 zusätzlich `passwordChangeGuard`) in `app.routes.ts` registriert — dieser
  Round ersetzt nur die Platzhalter-Page, `app.routes.ts` ändert sich nicht.
- [Round-9/plan.md](../Round-9/plan.md): `RoleService.isAdmin` (Computed) für die
  rollenabhängige Aktionsspalte im Frontend.

## Implementationsplan

### Backend

#### 1. `Bazaar.Domain/Brand/`

`Brand.cs`: `Id`, `Name`, `Original` (private Setter, `Rename(string)`/
`SetOriginal(bool)`-Methoden statt öffentlicher Setter — Invariante „Name nicht
leer" in `Rename`/Factory geprüft).

`IBrandRepository.cs` in `Domain/Ports/`. Zusätzlich **Platzhalter-Query-Port**
`IArticleCountByBrandQuery.cs` (`Task<int> CountByBrandName(string name)`) — bewusst
in `Domain/Ports/` angelegt, obwohl die reale Implementierung erst Round-15 kommt
(Interface-Vertrag ist Domain-Sache, Implementierung Infrastructure-Sache).

#### 2. Infrastructure

`BrandConfiguration.cs`: `Id` PK, `Name` als `citext`-Spalte (analog `User.Username`
aus Round-10) mit Unique-Index — automatische Case-Insensitivität ohne
`.ToLower()`-Streuung im Anwendungscode.

`BrandRepository.cs`. `ArticleCountByBrandQuery.cs` (Platzhalter):

```csharp
// TODO(Round-15): reale Zählung gegen Articles.Brand implementieren.
public sealed class ArticleCountByBrandQuery : IArticleCountByBrandQuery
{
    public Task<int> CountByBrandName(string name) => Task.FromResult(0);
}
```

DI-Registrierung als eigene Zeile (`AddScoped<IArticleCountByBrandQuery,
ArticleCountByBrandQuery>()`), damit Round-15 nur diese eine Zeile auf die reale
Implementierung umbiegen muss.

#### 3. Application (`Bazaar.Application/Brands/`)

`GetBrandsHandler`, `CreateBrandCommand`+`Validator`+`Handler`,
`UpdateBrandCommand`+`Validator`+`Handler`, `DeleteBrandHandler` — Logik exakt nach
spec.md. `CreateBrandHandler`/`UpdateBrandHandler` nehmen `Original`-Wert bzw.
Rollen-Info als Parameter des Command-Objekts entgegen (vom Endpoint aus dem
`role`-Claim befüllt, nicht aus dem Request-Body deserialisiert — DTO-Mapping trennt
das bereits in Schritt 5).

`UpdateBrandHandler` ruft nach dem Speichern `renameCascade` — in Round-11 ein
No-Op-Delegat (`Task RenameArticlesReferencingBrand(string oldName, string
newName)` auf demselben `IArticleCountByBrandQuery`-Interface ergänzt, oder als
zweites Interface `IBrandRenameCascade` — Entscheidung: **ein gemeinsames Interface**
`IBrandArticleLink` mit beiden Methoden, da beide dieselbe fehlende Artikel-Tabelle
betreffen und Round-15 sie ohnehin gemeinsam real implementiert).

#### 4. Api (`Bazaar.Api/Features/Brands/`)

`BrandEndpoints.cs`: vier Minimal-API-Routen. `POST`/`PUT` nutzen den
`ValidationFilter<T>` aus Round-2. `Original`-Ableitung aus der Rolle:

```csharp
var original = ctx.User.IsInRole("admin"); // oder Claim-Check analog Round-10s "admin"-Policy
```

DTOs (`BrandDto`, `CreateBrandRequest`, `UpdateBrandRequest`) in
`Bazaar.Api/Features/Brands/Dtos.cs`.

### Frontend

#### 5. `shared/components/master-data-popup/`

`master-data-popup.ts`: `@Input() entityLabel`, `@Input() mode`,
`@Input() initialValue?: {name: string; original: boolean}`, `@Output() save`.
Reine Dumb Component (kein HTTP), Template nach spec.md ASCII-Skizze
(`master-data-popup.md`). `boolean-input`-Switch-Variante nur im `edit`-Modus
gerendert.

#### 6. `features/brands/`

`data/brands-api.ts` (vier HTTP-Methoden gegen `/api/brands`), `brands-store.ts`
(Signal `brands = signal<Brand[]>([])`, `load()`, `create()`, `update()`,
`remove()` — In-Memory-Sort im Store selbst oder in der Page, da `table` nur
`sortChange` emittiert und das Parent sortiert). `pages/brands.page.ts` ersetzt die
Round-7-Platzhalter-Page: injiziert `brands-store`, `RoleService.isAdmin`,
verdrahtet `<app-table>` (Spalten-Config wie spec.md) und
`<app-master-data-popup>` (per `p-dialog`/`visible`-Signal geöffnet).

### 7. Verifikation

- `dotnet test` — Domain-/Application-Tests, insb. Duplikatprüfung
  case-insensitiv/Trim, `409 brand.in_use` bleibt mit leerer Artikel-Tabelle
  unerreichbar (Testfall dokumentiert diese Erwartung explizit, kein „totes"
  Testziel).
- `ng serve`: `/brands` als Kassenpersonal → keine Aktionsspalte, kein „+ Neu"; als
  Admin → beide sichtbar, Anlegen/Bearbeiten/Löschen funktionieren gegen die echte
  API.
- Leerzustand vor jedem Import: `emptyText` erscheint korrekt.
- `ng lint` — `shared/` importiert nicht aus `features/brands`.

## Reihenfolge

1 → 2 → 3 → 4 sequenziell (Backend-Schichten). 5 unabhängig von Backend startbar
(reine Dumb Component gegen ein Mock-Interface), 6 nach 4 und 5 (braucht beide).
7 abschließend.
