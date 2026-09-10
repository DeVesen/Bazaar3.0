# Plan R08 — Alle Artikel (Admin) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Admin-Übersicht "Alle Artikel" — paginierte, filter- und sortierbare Liste aller Artikel aller Verkäufer mit Verkäufer-AutoComplete-Filter und readonly Detail-Modal — die vertikale Slice für Roadmap-Schritt R08.

**Architecture:** Backend-seitig ist R08 bereits fertig (`GET /api/articles` admin, `GET /api/articles/{id}` admin, Route `/articles` mit `authGuard`+`adminGuard`, Sidebar-Eintrag) — bis auf eine Lücke: die Server-Sortierung kennt kein Feld `seller`, obwohl die Tabelle laut Epic nach Verkäufer sortierbar sein muss (Task 1). Der Rest ist Frontend: ein neuer `AdminArticlesApiService` (Task 2), eine kleine, rückwärtskompatible Erweiterung von `AppTable` um ein optionales `sortField` pro Spalte (Task 3, weil Anzeige-Feld `sellerLabel` und Sortier-Feld `seller` hier auseinanderfallen), ein Verkäufer-AutoComplete im geteilten `FilterPanel` (Task 4, nur aktiv wenn ein neuer Input gesetzt ist — "Meine Artikel" bleibt unverändert), eine neue readonly-Modal-Komponente (Task 5) und die `ArticlesPage` selbst (Task 6), die alles zusammensetzt. Die readonly-Modal-Komponente bekommt ihre Daten direkt aus der bereits vollständigen Listen-Zeile (kein zusätzlicher `GET /api/articles/{id}`-Request) — die Liste liefert schon alle Felder, ein zweiter Request wäre unnötig (YAGNI); der `GetById`-Endpoint bleibt für spätere Verwendung bestehen.

**Tech Stack:** .NET 10 Minimal API, EF Core (Npgsql). Angular 22.1, PrimeNG 22.1.0 (`p-autoComplete`), Vitest.

**Spec:** [`docs/requirements/advance-registration/roadmap/R08-alle-artikel.md`](../../requirements/advance-registration/roadmap/R08-alle-artikel.md) · [`epics/Epic_Alle_Artikel/epic.md`](../../requirements/advance-registration/epics/Epic_Alle_Artikel/epic.md) · [`api/articles.md`](../../requirements/advance-registration/api/articles.md) · [`api/cross-cutting.md`](../../requirements/advance-registration/api/cross-cutting.md) Abschnitt 4 · [`components/artikel-readonly-modal.md`](../../requirements/advance-registration/components/artikel-readonly-modal.md) · [`components/filter-panel/component.md`](../../../components/filter-panel/component.md)

## Global Constraints

- Hexagonal layering: `BAR.Domain` referenziert nichts; `BAR.Application` referenziert `Domain`; `BAR.Infrastructure` implementiert `Domain/Ports`; `BAR.Host` verdrahtet alles (spec.md §10.0.1).
- Fehler-Responses sind RFC 9457 ProblemDetails mit `errorCode`-Extension (`cross-cutting.md` §3) — hier nicht betroffen, da keine neuen Fehlerfälle entstehen.
- Frontend: standalone Components, `ChangeDetectionStrategy.OnPush` implizit über Signals (`input()`/`model()`/`output()`), ausschließlich PrimeNG-Komponenten, Tests über `ng test` (Vitest).
- Verkäufer-AutoComplete: 400ms Debounce, ab 2 Zeichen, `GET /api/sellers?search=…&pageSize=10`, max. 10 Vorschläge (`cross-cutting.md` §4, exakt zitiert).
- Übrige Filter (Marke/Kategorie/Freitext) lösen weiterhin nur über Enter/„Suchen"-Button aus — kein Debounce (`cross-cutting.md` §4).
- Code (Typen, Bezeichner, JSON-Contract) englisch; erklärende Kommentare, wo nötig, deutsch, passend zum bestehenden Code.
- Multi-Sort-Parameter-Format bleibt `?sort=field:asc,field:desc` (`cross-cutting.md` §4).

---

## Backend

### Task 1: Server-Sortierung um Feld `seller` erweitern

**Files:**
- Modify: `src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/ArticleQueries.cs`
- Test: `src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleQueriesTests.cs`

**Interfaces:**
- Consumes: nichts Neues — `IArticleQueries.SearchAllAsync(...)` (Signatur unverändert).
- Produces: `SearchAllAsync(..., sort: "seller:asc"|"seller:desc", ...)` sortiert das Ergebnis nach `Seller.LastName`. Wird von `GetAllArticlesQueryHandler` (unverändert) transparent durchgereicht und von Task 6 (`ArticlesPage`) über `sort=seller:...` angesprochen.

- [ ] **Step 1: Write the failing test**

Füge in `ArticleQueriesTests.cs` einen neuen Test ans Ende der Klasse (vor der letzten schließenden `}`) an:

```csharp
[Fact]
public async Task SearchAllAsync_SortBySellerDescending_OrdersByLastName()
{
    _ = _factory.Server;
    using var scope = _factory.Services.CreateScope();
    var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
    var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
    var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
    var ct = TestContext.Current.CancellationToken;

    var sellerA = Domain.Sellers.Seller.Register("Anna", "Ackermann", null, "12345", "Ort", "000",
        $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
    var sellerZ = Domain.Sellers.Seller.Register("Zora", "Zimmermann", null, "12345", "Ort", "000",
        $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
    await sellers.AddAsync(sellerA, ct);
    await sellers.AddAsync(sellerZ, ct);
    await articles.CreateAsync(Article.Create(sellerA.Id, 4001, "X1", "M", "K", 1m, null, null, null, Now), null, ct);
    await articles.CreateAsync(Article.Create(sellerZ.Id, 4002, "X2", "M", "K", 1m, null, null, null, Now), null, ct);

    var page = await queries.SearchAllAsync(null, null, search: null, sellerId: null, 1, 25, sort: "seller:desc", ct);

    var ordered = page.Items.Where(i => i.Article.Number is 4001 or 4002).ToList();
    Assert.Equal("Zimmermann", ordered[0].SellerLastName);
    Assert.Equal("Ackermann", ordered[1].SellerLastName);
}
```

Prüf zuerst, dass `ArticleWithSeller` (Rückgabetyp von `SearchAllAsync`, in `BAR.Domain/Ports/Queries/IArticleQueries.cs`) bereits ein Member `SellerLastName` hat — laut `ArticleQueries.cs:92` (`x.Seller.LastName` wird in `ArticleWithSeller` übergeben) ist das der Fall; falls der Membername abweicht, den tatsächlichen Namen aus `IArticleQueries.cs` übernehmen.

- [ ] **Step 2: Run test to verify it fails**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter SearchAllAsync_SortBySellerDescending_OrdersByLastName`
Expected: FAIL — aktuell sortiert `sort: "seller:desc"` gar nicht (unbekanntes Feld fällt auf `OrderBy(byNumber)` zurück), die erwartete Reihenfolge stimmt nicht.

- [ ] **Step 3: Implementierung — `ApplySort` um optionales `seller`-Feld erweitern**

In `ArticleQueries.cs`, Methode `ApplySort<T>`: neuen optionalen Parameter anhängen und die zwei neuen `switch`-Zweige ergänzen.

```csharp
private static IQueryable<T> ApplySort<T>(
    IQueryable<T> query, string? sort,
    Expression<Func<T, int>> byNumber,
    Expression<Func<T, string>> byName,
    Expression<Func<T, string>> byCategory,
    Expression<Func<T, string>> byBrand,
    Expression<Func<T, decimal>> byPrice,
    Expression<Func<T, string>>? bySeller = null)
{
    if (string.IsNullOrWhiteSpace(sort))
    {
        return query.OrderBy(byNumber);
    }

    IOrderedQueryable<T>? ordered = null;
    foreach (var part in sort.Split(',', StringSplitOptions.RemoveEmptyEntries))
    {
        var pieces = part.Split(':');
        var field = pieces[0].Trim().ToLowerInvariant();
        var descending = pieces.Length > 1 && pieces[1].Trim().Equals("desc", StringComparison.OrdinalIgnoreCase);

        ordered = (ordered is null, field) switch
        {
            (true, "number") => descending ? query.OrderByDescending(byNumber) : query.OrderBy(byNumber),
            (true, "name") => descending ? query.OrderByDescending(byName) : query.OrderBy(byName),
            (true, "category") => descending ? query.OrderByDescending(byCategory) : query.OrderBy(byCategory),
            (true, "brand") => descending ? query.OrderByDescending(byBrand) : query.OrderBy(byBrand),
            (true, "price") => descending ? query.OrderByDescending(byPrice) : query.OrderBy(byPrice),
            (true, "seller") when bySeller is not null => descending ? query.OrderByDescending(bySeller) : query.OrderBy(bySeller),
            (false, "number") => descending ? ordered!.ThenByDescending(byNumber) : ordered!.ThenBy(byNumber),
            (false, "name") => descending ? ordered!.ThenByDescending(byName) : ordered!.ThenBy(byName),
            (false, "category") => descending ? ordered!.ThenByDescending(byCategory) : ordered!.ThenBy(byCategory),
            (false, "brand") => descending ? ordered!.ThenByDescending(byBrand) : ordered!.ThenBy(byBrand),
            (false, "price") => descending ? ordered!.ThenByDescending(byPrice) : ordered!.ThenBy(byPrice),
            (false, "seller") when bySeller is not null => descending ? ordered!.ThenByDescending(bySeller) : ordered!.ThenBy(bySeller),
            _ => ordered ?? query.OrderBy(byNumber)
        };
    }

    return ordered ?? query.OrderBy(byNumber);
}
```

Im Aufruf innerhalb `SearchAllAsync` (aktuell `ApplySort(joined, sort, x => x.Article.Number, x => x.Article.Name, x => x.Article.Category, x => x.Article.Brand, x => x.Article.Price)`) das neue Argument anhängen:

```csharp
var pageItems = await ApplySort(
        joined, sort,
        x => x.Article.Number, x => x.Article.Name, x => x.Article.Category, x => x.Article.Brand, x => x.Article.Price,
        x => x.Seller.LastName)
    .Skip((page - 1) * pageSize).Take(pageSize)
    .ToListAsync(cancellationToken);
```

Der Aufruf in `SearchMineAsync` bleibt unverändert (kein `bySeller`-Argument, Default `null` — dort gibt es keine Verkäufer-Spalte).

- [ ] **Step 4: Run test to verify it passes**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter SearchAllAsync_SortBySellerDescending_OrdersByLastName`
Expected: PASS

- [ ] **Step 5: Vorhandene Article-Tests laufen lassen (Regression)**

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~ArticleQueriesTests`
Expected: PASS (alle bisherigen Tests unverändert grün)

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/backend/BAR.Infrastructure/Persistence/Queries/ArticleQueries.cs src/advance-registration/backend/tests/BAR.Host.IntegrationTests/Persistence/ArticleQueriesTests.cs
git commit -m "feat(bar-backend): support sorting admin article list by seller (R08)"
```

---

## Frontend

### Task 2: `AdminArticlesApiService`

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/articles/admin-articles-api.service.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/articles/admin-articles-api.service.spec.ts`

**Interfaces:**
- Consumes: nichts.
- Produces: `AdminArticleResponse`, `AdminArticleListResponse`, `AdminArticleListQuery`, `AdminArticlesApiService.list(query): Observable<AdminArticleListResponse>`, `AdminArticlesApiService.getById(id): Observable<AdminArticleResponse>`. Wird von Task 6 (`ArticlesPage`) konsumiert.

- [ ] **Step 1: Write the failing test**

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AdminArticlesApiService } from './admin-articles-api.service';

describe('AdminArticlesApiService', () => {
  let service: AdminArticlesApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AdminArticlesApiService]
    });
    service = TestBed.inject(AdminArticlesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list() requests /api/articles', () => {
    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });

    expect(result).toEqual({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });

  it('list(query) sends all provided filters including sellerId as query parameters', () => {
    service.list({ page: 2, pageSize: 10, sort: 'seller:desc', brand: 'Nike', category: 'Jacken', search: 'jack', sellerId: 's1' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sort')).toBe('seller:desc');
    expect(req.request.params.get('brand')).toBe('Nike');
    expect(req.request.params.get('category')).toBe('Jacken');
    expect(req.request.params.get('search')).toBe('jack');
    expect(req.request.params.get('sellerId')).toBe('s1');
    req.flush({ items: [], totalCount: 0, page: 2, pageSize: 10 });
  });

  it('list(query) omits parameters that are not set', () => {
    service.list({ page: 1 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.has('sellerId')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });

  it('getById() requests /api/articles/:id', () => {
    let result: unknown;
    service.getById('a1').subscribe((r) => (result = r));

    const req = httpMock.expectOne('/api/articles/a1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 'a1' });

    expect(result).toEqual({ id: 'a1' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- admin-articles-api.service.spec.ts`
Expected: FAIL with "Cannot find module './admin-articles-api.service'"

- [ ] **Step 3: Write minimal implementation**

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerSummary {
  id: string;
  startNumber: number | null;
  firstName: string;
  lastName: string;
}

export interface AdminArticleResponse {
  id: string;
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  seller: SellerSummary;
}

export interface AdminArticleListResponse {
  items: AdminArticleResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminArticleListQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  brand?: string;
  category?: string;
  search?: string;
  sellerId?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminArticlesApiService {
  private readonly http = inject(HttpClient);

  list(query: AdminArticleListQuery = {}): Observable<AdminArticleListResponse> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.category) params = params.set('category', query.category);
    if (query.search) params = params.set('search', query.search);
    if (query.sellerId) params = params.set('sellerId', query.sellerId);
    return this.http.get<AdminArticleListResponse>('/api/articles', { params });
  }

  getById(id: string): Observable<AdminArticleResponse> {
    return this.http.get<AdminArticleResponse>(`/api/articles/${id}`);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- admin-articles-api.service.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/articles/admin-articles-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/articles/admin-articles-api.service.spec.ts
git commit -m "feat(bar-app): add AdminArticlesApiService for the Alle-Artikel admin list"
```

---

### Task 3: `AppTable` — optionales `sortField` pro Spalte

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.spec.ts`

**Interfaces:**
- Consumes: nichts Neues.
- Produces: `ColumnConfig<T>` bekommt optionales Feld `sortField?: string`. Wenn gesetzt, sortiert/rendert die Spalten-Sortierung gegen `sortField` statt `field` — nötig für Task 6, wo Anzeige-Feld (`sellerLabel`, ein zusammengesetzter String) und Server-Sortier-Feld (`seller`, siehe Task 1) auseinanderfallen. Ohne `sortField` verhält sich eine Spalte exakt wie vorher (rückwärtskompatibel, bestehende Verwendungen unverändert).

- [ ] **Step 1: Write the failing test**

Füge in `table.spec.ts` einen neuen Test an (Datei enthält bereits `create()` und `ColumnConfig`-Import):

```typescript
it('sortFieldFor() returns sortField when set, otherwise falls back to field', () => {
  const fixture = create([]);
  const component = fixture.componentInstance;

  expect(component.sortFieldFor({ field: 'sellerLabel', header: 'Verkäufer', type: 'text', sortField: 'seller' })).toBe('seller');
  expect(component.sortFieldFor({ field: 'name', header: 'Bezeichnung', type: 'text' })).toBe('name');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- table.spec.ts`
Expected: FAIL — `sortFieldFor` existiert noch nicht auf `AppTable`, TypeScript meldet zusätzlich, dass `sortField` kein bekanntes Property von `ColumnConfig` ist.

- [ ] **Step 3: Implementierung**

In `table.ts`, Interface `ColumnConfig` um das neue optionale Feld erweitern:

```typescript
export interface ColumnConfig<T = unknown> {
  field: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'badge';
  sortable?: boolean;
  sortField?: string;
  badge?: (row: T) => { label: string; severity: 'success' | 'warn' | 'secondary' | 'info' | 'danger' };
}
```

Neue Methode `sortFieldFor()` auf der Klasse `AppTable<T>` ergänzen (z. B. direkt unter `formatCell()`):

```typescript
sortFieldFor(col: ColumnConfig<T>): string {
  return col.sortField ?? col.field;
}
```

Im `#header`-Template die zwei Bindings, die aktuell `col.field` fürs Sortieren nutzen, auf `sortFieldFor(col)` umstellen — bewusst über eine Methode statt Inline-`??` im Template, damit das Sortier-Feld unabhängig von PrimeNGs interner Darstellung von `p-sort-icon` direkt unit-testbar bleibt:

```html
@if (col.sortable === false) {
  <th>{{ col.header }}</th>
} @else {
  <th [pSortableColumn]="sortFieldFor(col)">{{ col.header }} <p-sort-icon [field]="sortFieldFor(col)" /></th>
}
```

`formatCell()` und alle übrigen Stellen bleiben bei `col.field` (Anzeige-Wert kommt weiterhin aus dem Anzeige-Feld, nur der Sortier-Schlüssel wechselt).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- table.spec.ts`
Expected: PASS (inklusive aller bisherigen Tests in der Datei — rückwärtskompatibel, da `sortField` optional ist)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/table/table.ts src/advance-registration/frontend/BAR.App/src/app/shared/table/table.spec.ts
git commit -m "feat(bar-app): support a separate sortField on table columns"
```

---

### Task 4: `FilterPanel` — Verkäufer-AutoComplete

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.spec.ts`

**Interfaces:**
- Consumes: `SellersApiService.list({ search, page, pageSize }): Observable<PagedResult<Seller>>` aus `src/advance-registration/frontend/BAR.App/src/app/features/sellers/sellers-api.service.ts` (bereits vorhanden, unverändert — `Seller` trägt `id`, `startNumber`, `firstName`, `lastName`).
- Produces: `FilterPanelSearch` bekommt optionales Feld `sellerId?: string`. Neuer Input `sellerAutocomplete = input<boolean>(false)` — nur wenn `true`, rendert das Panel den Verkäufer-Autocomplete (Meine-Artikel-Verwendung setzt den Input nicht, bleibt unverändert). Wird von Task 6 (`ArticlesPage`) mit `[sellerAutocomplete]="true"` verwendet.

- [ ] **Step 1: Write the failing test**

Ersetze `filter-panel.spec.ts` vollständig (die Komponente injiziert jetzt `SellersApiService`, `create()` braucht darum `provideHttpClient()`/`provideHttpClientTesting()`; alle elf Tests — sechs bestehende, fünf neue):

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FilterPanel } from './filter-panel';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

const BRANDS: MasterDataItem[] = [{ id: 'b1', name: 'Nike', original: true }];
const CATEGORIES: MasterDataItem[] = [{ id: 'c1', name: 'Jacken', original: true }];

function create(sellerAutocomplete = false) {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const fixture = TestBed.createComponent(FilterPanel);
  fixture.componentRef.setInput('brands', BRANDS);
  fixture.componentRef.setInput('categories', CATEGORIES);
  fixture.componentRef.setInput('sellerAutocomplete', sellerAutocomplete);
  fixture.detectChanges();
  return fixture;
}

describe('FilterPanel', () => {
  it('does not emit while typing in the free-text field', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.searchText.set('jack');

    expect(emitted.length).toBe(0);
  });

  it('does not emit when a brand or category is selected', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.brandValue.set('Nike');
    component.categoryValue.set('Jacken');

    expect(emitted.length).toBe(0);
  });

  it('emit() sends the current brand/category/search values', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.brandValue.set('Nike');
    component.categoryValue.set('Jacken');
    component.searchText.set('jack');

    component.emit();

    expect(emitted).toEqual([{ brand: 'Nike', category: 'Jacken', search: 'jack', sellerId: undefined }]);
  });

  it('emit() omits fields that are empty', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: undefined }]);
  });

  it('clicking the Suchen button triggers emit()', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.searchText.set('jack');

    fixture.debugElement.query(By.css('[data-testid="search-button"] button')).nativeElement.click();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: 'jack', sellerId: undefined }]);
  });

  it('does not render the seller autocomplete when sellerAutocomplete is false', () => {
    const fixture = create(false);
    expect(fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'))).toBeNull();
  });

  it('renders the seller autocomplete when sellerAutocomplete is true', () => {
    const fixture = create(true);
    expect(fixture.debugElement.query(By.css('[data-testid="seller-autocomplete"]'))).not.toBeNull();
  });

  it('does not request suggestions before 2 characters are typed', fakeAsync(() => {
    const fixture = create(true);
    const httpMock = TestBed.inject(HttpTestingController);

    fixture.componentInstance.onSellerFilter('a');
    tick(400);

    httpMock.expectNone((r) => r.url === '/api/sellers');
  }));

  it('requests suggestions 400ms after typing 2+ characters, debounced', fakeAsync(() => {
    const fixture = create(true);
    const httpMock = TestBed.inject(HttpTestingController);

    fixture.componentInstance.onSellerFilter('an');
    fixture.componentInstance.onSellerFilter('ann');
    tick(399);
    httpMock.expectNone((r) => r.url === '/api/sellers');
    tick(1);

    const req = httpMock.expectOne((r) => r.url === '/api/sellers');
    expect(req.request.params.get('search')).toBe('ann');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ items: [{ id: 's1', startNumber: 42, firstName: 'Max', lastName: 'Mustermann' }], totalCount: 1, page: 1, pageSize: 10 });

    expect(fixture.componentInstance.sellerSuggestions()).toEqual([{ id: 's1', label: 'Max Mustermann (#42)' }]);
  }));

  it('onSellerSelect() sets the sellerId used by emit()', () => {
    const fixture = create(true);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.onSellerSelect({ value: { id: 's1', label: 'Max Mustermann (#42)' } } as never);
    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined, sellerId: 's1' }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel.spec.ts`
Expected: FAIL — `sellerAutocomplete`-Input, `data-testid="seller-autocomplete"`, `onSellerFilter()`, `sellerSuggestions()` und `onSellerSelect()` existieren noch nicht.

- [ ] **Step 3: Write minimal implementation**

Ersetze den Inhalt von `filter-panel.ts` vollständig:

```typescript
import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Subject, debounceTime, of, switchMap } from 'rxjs';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';
import { SellersApiService } from '../../features/sellers/sellers-api.service';

export interface FilterPanelSearch {
  brand?: string;
  category?: string;
  search?: string;
  sellerId?: string;
}

export interface SellerOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, AutoCompleteModule],
  template: `
    <div class="filter-panel">
      @if (sellerAutocomplete()) {
        <p-autocomplete
          data-testid="seller-autocomplete"
          [(ngModel)]="sellerModelValue"
          [suggestions]="sellerSuggestions()"
          optionLabel="label"
          [minLength]="2"
          placeholder="Verkäufer"
          [showClear]="true"
          (completeMethod)="onSellerFilter($event.query)"
          (onSelect)="onSellerSelect($event)"
          (onClear)="onSellerClear()"
        />
      }
      <p-select
        [options]="brands()" optionLabel="name" optionValue="name" placeholder="Marke"
        [(ngModel)]="brandValueModel" [showClear]="true"
      />
      <p-select
        [options]="categories()" optionLabel="name" optionValue="name" placeholder="Kategorie"
        [(ngModel)]="categoryValueModel" [showClear]="true"
      />
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input pInputText placeholder="Suche..." [(ngModel)]="searchTextModel" (keydown.enter)="emit()" />
      </p-iconfield>
      <p-button label="Suchen" icon="pi pi-search" data-testid="search-button" (onClick)="emit()" />
    </div>
  `
})
export class FilterPanel {
  private readonly sellersApi = inject(SellersApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly brands = input.required<MasterDataItem[]>();
  readonly categories = input.required<MasterDataItem[]>();
  readonly sellerAutocomplete = input<boolean>(false);
  readonly search = output<FilterPanelSearch>();

  readonly brandValue = signal<string | null>(null);
  readonly categoryValue = signal<string | null>(null);
  readonly searchText = signal('');
  readonly sellerId = signal<string | undefined>(undefined);
  readonly sellerModel = signal<SellerOption | null>(null);
  readonly sellerSuggestions = signal<SellerOption[]>([]);

  private readonly sellerQuery$ = new Subject<string>();

  constructor() {
    this.sellerQuery$
      .pipe(
        debounceTime(400),
        switchMap((query) => this.sellersApi.list({ search: query, page: 1, pageSize: 10 })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        this.sellerSuggestions.set(
          result.items.map((s) => ({ id: s.id, label: `${s.firstName} ${s.lastName} (#${s.startNumber ?? '–'})` }))
        );
      });
  }

  get brandValueModel() { return this.brandValue(); }
  set brandValueModel(v: string | null) { this.brandValue.set(v); }
  get categoryValueModel() { return this.categoryValue(); }
  set categoryValueModel(v: string | null) { this.categoryValue.set(v); }
  get searchTextModel() { return this.searchText(); }
  set searchTextModel(v: string) { this.searchText.set(v); }
  get sellerModelValue() { return this.sellerModel(); }
  set sellerModelValue(v: SellerOption | null) { this.sellerModel.set(v); }

  onSellerFilter(query: string): void {
    if (query.trim().length < 2) {
      this.sellerSuggestions.set([]);
      return;
    }
    this.sellerQuery$.next(query.trim());
  }

  onSellerSelect(event: AutoCompleteSelectEvent): void {
    const option = event.value as SellerOption;
    this.sellerId.set(option.id);
  }

  onSellerClear(): void {
    this.sellerId.set(undefined);
  }

  emit(): void {
    this.search.emit({
      brand: this.brandValue() ?? undefined,
      category: this.categoryValue() ?? undefined,
      search: this.searchText().trim() || undefined,
      sellerId: this.sellerId()
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- filter-panel.spec.ts`
Expected: PASS (inklusive aller bisherigen Tests — `toEqual` ignoriert `sellerId: undefined` bei den alten Erwartungen ohne dieses Feld)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.spec.ts
git commit -m "feat(bar-app): add debounced seller autocomplete to FilterPanel (R08)"
```

---

### Task 5: `artikel-readonly-modal`-Komponente

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/features/articles/components/artikel-readonly-modal.ts`
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/articles/components/artikel-readonly-modal.spec.ts`

**Interfaces:**
- Consumes: `AdminArticleResponse` aus `../admin-articles-api.service` (Task 2).
- Produces: `ArtikelReadonlyModal` mit `visible = model<boolean>(false)` und `article = input<AdminArticleResponse | null>(null)`. Wird von Task 6 (`ArticlesPage`) eingebunden.

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ArtikelReadonlyModal } from './artikel-readonly-modal';
import type { AdminArticleResponse } from '../admin-articles-api.service';

const ARTICLE: AdminArticleResponse = {
  id: 'a1', number: 101, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 12.5,
  size: 'M', color: 'Blau', description: 'Kaum getragen',
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  seller: { id: 's1', startNumber: 42, firstName: 'Max', lastName: 'Mustermann' }
};

function create(article: AdminArticleResponse | null = ARTICLE) {
  const fixture = TestBed.createComponent(ArtikelReadonlyModal);
  fixture.componentRef.setInput('article', article);
  fixture.componentRef.setInput('visible', true);
  fixture.detectChanges();
  return fixture;
}

describe('ArtikelReadonlyModal', () => {
  it('shows the seller name and number', () => {
    const fixture = create();
    expect(fixture.nativeElement.textContent).toContain('Max Mustermann (#42)');
  });

  it('shows all article fields readonly', () => {
    const fixture = create();
    const inputs = fixture.debugElement.queryAll(By.css('input[readonly]'));
    expect(inputs.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.textContent).toContain('Kaum getragen');
  });

  it('clicking Schließen sets visible to false', () => {
    const fixture = create();
    const component = fixture.componentInstance;

    fixture.debugElement.query(By.css('[data-testid="close-button"] button')).nativeElement.click();

    expect(component.visible()).toBe(false);
  });

  it('renders nothing for the article fields when article is null', () => {
    const fixture = create(null);
    expect(fixture.nativeElement.textContent).not.toContain('Max Mustermann');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- artikel-readonly-modal.spec.ts`
Expected: FAIL with "Cannot find module './artikel-readonly-modal'"

- [ ] **Step 3: Write minimal implementation**

```typescript
import { Component, input, model } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { ButtonModule } from 'primeng/button';
import type { AdminArticleResponse } from '../admin-articles-api.service';

@Component({
  selector: 'app-artikel-readonly-modal',
  imports: [DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule, ButtonModule],
  template: `
    <p-dialog [(visible)]="visibleModel" [modal]="true" header="Artikel ansehen">
      @if (article(); as a) {
        <label>Verkäufer</label>
        <input pInputText [value]="a.seller.firstName + ' ' + a.seller.lastName + ' (#' + (a.seller.startNumber ?? '–') + ')'" [readonly]="true" />

        <label>Artikelnummer</label>
        <input pInputText [value]="a.number" [readonly]="true" />

        <label>Bezeichnung</label>
        <input pInputText [value]="a.name" [readonly]="true" />

        <label>Kategorie</label>
        <input pInputText [value]="a.category" [readonly]="true" />

        <label>Marke</label>
        <input pInputText [value]="a.brand" [readonly]="true" />

        <label>Größe</label>
        <input pInputText [value]="a.size ?? ''" [readonly]="true" />

        <label>Farbe</label>
        <input pInputText [value]="a.color ?? ''" [readonly]="true" />

        <label>Preis</label>
        <p-inputgroup>
          <input pInputText [value]="a.price" [readonly]="true" />
          <p-inputgroup-addon>€</p-inputgroup-addon>
        </p-inputgroup>

        <label>Beschreibung</label>
        <input pInputText [value]="a.description ?? ''" [readonly]="true" />
      }

      <div class="footer">
        <button pButton type="button" data-testid="close-button" (click)="visible.set(false)">Schließen</button>
      </div>
    </p-dialog>
  `
})
export class ArtikelReadonlyModal {
  readonly visible = model<boolean>(false);
  readonly article = input<AdminArticleResponse | null>(null);

  get visibleModel() { return this.visible(); }
  set visibleModel(v: boolean) { this.visible.set(v); }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- artikel-readonly-modal.spec.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/articles/components/artikel-readonly-modal.ts src/advance-registration/frontend/BAR.App/src/app/features/articles/components/artikel-readonly-modal.spec.ts
git commit -m "feat(bar-app): add readonly article-detail modal for admin (R08)"
```

---

### Task 6: `ArticlesPage`

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/articles/pages/ArticlesPage.ts` (Platzhalter ersetzen)
- Test: `src/advance-registration/frontend/BAR.App/src/app/features/articles/pages/ArticlesPage.spec.ts`

**Interfaces:**
- Consumes: `AdminArticlesApiService` (Task 2), `MasterDataApiService` (bestehend, `features/my-articles/master-data-api.service.ts`), `FilterPanel` mit `sellerAutocomplete` (Task 4), `AppTable` mit `sortField` (Task 3), `ArtikelReadonlyModal` (Task 5).
- Produces: fertige Seite unter Route `/articles` (Route/Guard bereits vorhanden, keine Änderung nötig).

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ArticlesPage } from './ArticlesPage';
import { AdminArticlesApiService, AdminArticleResponse } from '../admin-articles-api.service';
import { MasterDataApiService } from '../../my-articles/master-data-api.service';

const ARTICLE: AdminArticleResponse = {
  id: 'a1', number: 101, name: 'Jacke', brand: 'Nike', category: 'Jacken', price: 12.5,
  size: null, color: null, description: null,
  createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
  seller: { id: 's1', startNumber: 42, firstName: 'Max', lastName: 'Mustermann' }
};

function create() {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), MessageService] });
  const articlesApi = TestBed.inject(AdminArticlesApiService);
  const masterDataApi = TestBed.inject(MasterDataApiService);
  vi.spyOn(articlesApi, 'list').mockReturnValue(of({ items: [ARTICLE], totalCount: 1, page: 1, pageSize: 25 }));
  vi.spyOn(masterDataApi, 'getAll').mockReturnValue(of([]));
  const fixture = TestBed.createComponent(ArticlesPage);
  fixture.detectChanges();
  return { fixture, articlesApi, masterDataApi };
}

describe('ArticlesPage', () => {
  it('loads articles, brands and categories on init and builds the seller label', () => {
    const { fixture, articlesApi, masterDataApi } = create();

    expect(articlesApi.list).toHaveBeenCalled();
    expect(masterDataApi.getAll).toHaveBeenCalledWith('brands');
    expect(masterDataApi.getAll).toHaveBeenCalledWith('categories');
    expect(fixture.componentInstance.articles()).toEqual([{ ...ARTICLE, sellerLabel: 'Max Mustermann (#42)' }]);
  });

  it('onFilterSearch() reloads with the given filters including sellerId and resets to page 1', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockClear();

    fixture.componentInstance.onFilterSearch({ brand: 'Nike', category: undefined, search: 'jack', sellerId: 's1' });

    expect(articlesApi.list).toHaveBeenCalledWith({ page: 1, pageSize: 25, sort: undefined, brand: 'Nike', category: undefined, search: 'jack', sellerId: 's1' });
  });

  it('onTableSort() reloads with a sort string built from the sort metas', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockClear();

    fixture.componentInstance.onTableSort([{ field: 'seller', order: 'desc' }]);

    expect(articlesApi.list).toHaveBeenCalledWith(expect.objectContaining({ sort: 'seller:desc' }));
  });

  it('onTablePage() reloads with the page derived from first/rows', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockClear();

    fixture.componentInstance.onTablePage({ first: 25, rows: 25 });

    expect(articlesApi.list).toHaveBeenCalledWith(expect.objectContaining({ page: 2, pageSize: 25 }));
  });

  it('onTableAction("view") opens the readonly modal with the clicked row', () => {
    const { fixture } = create();
    const row = { ...ARTICLE, sellerLabel: 'Max Mustermann (#42)' };

    fixture.componentInstance.onTableAction({ actionId: 'view', row });

    expect(fixture.componentInstance.modalArticle()).toBe(row);
    expect(fixture.componentInstance.modalVisible()).toBe(true);
  });

  it('loadArticles() error path resets loading and shows an error toast', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.list).mockReturnValue(throwError(() => ({ status: 500 })));
    const messageService = TestBed.inject(MessageService);
    const addSpy = vi.spyOn(messageService, 'add');

    fixture.componentInstance.loadArticles();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(addSpy).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- ArticlesPage.spec.ts`
Expected: FAIL — `ArticlesPage` ist noch der `<h1>Artikel</h1>`-Platzhalter ohne die getesteten Signals/Methoden.

- [ ] **Step 3: Write minimal implementation**

Ersetze `ArticlesPage.ts` vollständig:

```typescript
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AdminArticlesApiService, AdminArticleListQuery, AdminArticleResponse } from '../admin-articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../../my-articles/master-data-api.service';
import { ArtikelReadonlyModal } from '../components/artikel-readonly-modal';
import { AppTable, ActionClickEvent, ActionColumnConfig, ColumnConfig, SortMeta, TablePageEvent } from '../../../shared/table/table';
import { FilterPanel, FilterPanelSearch } from '../../../shared/filter-panel/filter-panel';

export interface AdminArticleRow extends AdminArticleResponse {
  sellerLabel: string;
}

const COLUMNS: ColumnConfig<AdminArticleRow>[] = [
  { field: 'number', header: 'Nr.', type: 'number' },
  { field: 'name', header: 'Bezeichnung', type: 'text' },
  { field: 'category', header: 'Kategorie', type: 'text' },
  { field: 'brand', header: 'Marke', type: 'text' },
  { field: 'price', header: 'Preis', type: 'currency' },
  { field: 'sellerLabel', header: 'Verkäufer', type: 'text', sortField: 'seller' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [{ actionId: 'view', icon: 'pi pi-search', ariaLabel: 'Ansehen' }]
};

function toRow(a: AdminArticleResponse): AdminArticleRow {
  return { ...a, sellerLabel: `${a.seller.firstName} ${a.seller.lastName} (#${a.seller.startNumber ?? '–'})` };
}

@Component({
  selector: 'app-articles-page',
  imports: [FilterPanel, AppTable, ArtikelReadonlyModal],
  template: `
    <h1>Artikel</h1>

    <app-filter-panel [brands]="brands()" [categories]="categories()" [sellerAutocomplete]="true" (search)="onFilterSearch($event)" />

    <app-table
      [columns]="columns"
      [data]="articles()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      [rows]="pageSize()"
      [first]="(page() - 1) * pageSize()"
      [actionColumn]="actionColumn"
      [hasActiveFilter]="hasActiveFilter()"
      emptyText="Noch hat kein Verkäufer Artikel angemeldet."
      (sortChange)="onTableSort($event)"
      (pageChange)="onTablePage($event)"
      (actionClick)="onTableAction($event)"
    />

    <app-artikel-readonly-modal [(visible)]="modalVisibleModel" [article]="modalArticle()" />
  `
})
export class ArticlesPage implements OnInit {
  private readonly articlesApi = inject(AdminArticlesApiService);
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly messageService = inject(MessageService);

  readonly columns = COLUMNS;
  readonly actionColumn = ACTION_COLUMN;

  readonly articles = signal<AdminArticleRow[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly brands = signal<MasterDataItem[]>([]);
  readonly categories = signal<MasterDataItem[]>([]);

  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly sort = signal<string | undefined>(undefined);
  readonly filters = signal<FilterPanelSearch>({});
  readonly hasActiveFilter = computed(() => {
    const f = this.filters();
    return !!(f.brand || f.category || f.search || f.sellerId);
  });

  readonly modalVisible = signal(false);
  readonly modalArticle = signal<AdminArticleRow | null>(null);

  get modalVisibleModel() { return this.modalVisible(); }
  set modalVisibleModel(v: boolean) { this.modalVisible.set(v); }

  ngOnInit(): void {
    this.loadArticles();
    this.masterDataApi.getAll('brands').subscribe((items) => this.brands.set(items));
    this.masterDataApi.getAll('categories').subscribe((items) => this.categories.set(items));
  }

  loadArticles(): void {
    this.loading.set(true);
    const query: AdminArticleListQuery = {
      page: this.page(), pageSize: this.pageSize(), sort: this.sort(), ...this.filters()
    };
    this.articlesApi.list(query).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.articles.set(result.items.map(toRow));
        this.totalRecords.set(result.totalCount);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Artikel konnten nicht geladen werden'
        });
      }
    });
  }

  onFilterSearch(filters: FilterPanelSearch): void {
    this.filters.set(filters);
    this.page.set(1);
    this.loadArticles();
  }

  onTableSort(metas: SortMeta[]): void {
    this.sort.set(metas.length ? metas.map((m) => `${m.field}:${m.order}`).join(',') : undefined);
    this.loadArticles();
  }

  onTablePage(event: TablePageEvent): void {
    this.page.set(Math.floor(event.first / event.rows) + 1);
    this.pageSize.set(event.rows);
    this.loadArticles();
  }

  onTableAction(event: ActionClickEvent<AdminArticleRow>): void {
    if (event.actionId === 'view') {
      this.modalArticle.set(event.row);
      this.modalVisible.set(true);
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test -- ArticlesPage.spec.ts`
Expected: PASS

- [ ] **Step 5: Vollständige Frontend- und Backend-Testsuite laufen lassen (Regression)**

Run: `npm --prefix src/advance-registration/frontend/BAR.App test`
Expected: PASS (alle Tests, inkl. der in Task 3/4 geänderten `table.spec.ts`/`filter-panel.spec.ts`)

Run: `dotnet test src/advance-registration/backend/tests/BAR.Host.IntegrationTests --filter FullyQualifiedName~Article`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/articles/pages/ArticlesPage.ts src/advance-registration/frontend/BAR.App/src/app/features/articles/pages/ArticlesPage.spec.ts
git commit -m "feat(bar-app): implement Alle-Artikel admin page (R08)"
```

---

## Manuelle Prüfung (Roadmap „Fertig, wenn")

Nach Task 6 alle sechs Punkte aus [`R08-alle-artikel.md`](../../requirements/advance-registration/roadmap/R08-alle-artikel.md) von Hand im Browser durchgehen — Route, Guard und Sidebar-Eintrag existieren bereits, hier geht es nur um den visuellen/interaktiven Feinschliff (Debounce-Gefühl, AutoComplete-Overlay, Modal-Layout), den kein Unit-Test abdeckt.
