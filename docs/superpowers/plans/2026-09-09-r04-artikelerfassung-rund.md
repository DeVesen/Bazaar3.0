# R04 Artikelerfassung rund Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verkäufer können ihre Artikelliste filtern (Marke/Kategorie/Freitext), sortieren und blättern, im Anlege-Dialog per „Speichern + kopieren" mehrere ähnliche Artikel in Serie anlegen, und bekommen bei einem Nummernkonflikt einen eigenen Dialog statt einer generischen Fehlermeldung.

**Architecture:** Reines Frontend (Angular, Feature-First) auf einem seit R03 unveränderten Backend-Vertrag. Zwei neue Shared-Components (`table`, `filter-panel`), Erweiterung von `ArticlesApiService.getMine` um Query-Parameter, Erweiterung von `artikel-dialog` um „Speichern + kopieren" und den Nummernkonflikt-Dialog, Neuverdrahtung von `MyArticlesPage`. Erste App-weite Toast-Infrastruktur (`MessageService`/`p-toast`), die R03 bewusst ausgelassen hat.

**Tech Stack:** Angular 22 (standalone, Zone.js, Signals), PrimeNG 22, Vitest + `TestBed` + `HttpTestingController`.

**Spec:** [docs/superpowers/specs/2026-09-09-r04-artikelerfassung-rund-design.md](../specs/2026-09-09-r04-artikelerfassung-rund-design.md)

**Voraussetzung:** R03 ist implementiert — `ArticlesApiService`, `MasterDataApiService`, `artikel-dialog`, `MyArticlesPage` existieren in der Form aus [R03-Plan](2026-09-09-r03-artikelerfassung.md) Task 17/19/20. Dieser Plan zitiert deren Code-Stand als Ausgangspunkt jeder Modify-Aufgabe.

## Global Constraints

- Frontend: Standalone-Components, Inline-Template, Signals (`input`/`model`/`output`/`computed`/`effect`), `@Injectable({ providedIn: 'root' })` + `inject(...)`, relative `/api/...`-URLs, Page-Dateien PascalCase, Shared/Feature-Dateien kebab-case.
- Tests: Vitest + `TestBed`, `HttpTestingController` für Services, `By.css` für DOM-Assertions.
- UI-Text ist deutsches Klartext im Template (kein `ngx-translate`-Pipe-Einsatz in bestehenden Features — Konvention aus R02/R03 fortgeführt).
- Ausschließlich PrimeNG-Komponenten, kein natives HTML für UI-Elemente (Projekt-CLAUDE.md).
- DI-Registrierung: keine (reines Frontend, kein Assembly-Scanning-Backend betroffen).
- Jeder Task committet für sich (siehe R02/R03-Präzedenz: `git commit -m "feat(bar-app): ..."`).

---

## Task 1: Toast-Infrastruktur (`MessageService` + `p-toast`)

R03 hat bewusst keine Toast-Anzeige gebaut (siehe R03-Plan „Nacharbeiten"). R04 braucht sie für AC-8, AC-9, AC-10 und den Nummernkonflikt-Fehlerpfad — hier einmalig app-weit nachgezogen.

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/app.config.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.spec.ts`

**Interfaces:**
- Produces: App-weit injizierbarer `MessageService` (aus `primeng/api`) und ein gerendertes `<p-toast>` im Shell-Root — jede Feature-Component ruft künftig direkt `inject(MessageService).add({ severity, summary, detail })` auf, kein eigener Wrapper.

- [ ] **Step 1: Write failing test**

In `shell.spec.ts` ergänzen:

```typescript
  it('renders a global p-toast for feature-level notifications', () => {
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const toast = fixture.debugElement.query(By.css('p-toast'));
    expect(toast).toBeTruthy();
  });
```

- [ ] **Step 2: Run to verify it fails**

Run (im Ordner `src/advance-registration/frontend/BAR.App`): `npx vitest run src/app/core/shell/shell.spec.ts`
Expected: FAIL — kein `p-toast` im Template.

- [ ] **Step 3: Implement**

`app.config.ts` — Import ergänzen und `MessageService` den `providers` hinzufügen:

```typescript
import { MessageService } from 'primeng/api';
```

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    provideTranslateService({
      lang: 'de',
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({ prefix: '/i18n/', suffix: '.json' })
    }),
    providePrimeNG({
      theme: {
        preset: IndustryPreset,
        options: { darkModeSelector: false }
      }
    }),
    provideLucideConfig({ strokeWidth: 1.5 }),
    MessageService
  ]
};
```

`shell.ts` — `ToastModule`-Import ergänzen:

```typescript
import { ToastModule } from 'primeng/toast';
```

```typescript
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, ButtonModule, SidebarModule, ToastModule, LucideMenu, Sidebar],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
```

`shell.html` — `<p-toast />` als erstes Element ergänzen:

```html
<p-toast />
<p-sidebar-layout>
```

(schließendes `</p-sidebar-layout>` bleibt unverändert am Ende der Datei stehen.)

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/core/shell/shell.spec.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/app.config.ts src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.ts src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.html src/advance-registration/frontend/BAR.App/src/app/core/shell/shell.spec.ts
git commit -m "feat(bar-app): App-weite Toast-Infrastruktur (MessageService, p-toast)"
```

---

## Task 2: `ArticlesApiService.getMine` um Query-Parameter erweitern

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.spec.ts`

**Interfaces:**
- Consumes: bestehende `ArticlesApiService`, `ArticleListResponse` (R03 Task 17).
- Produces: `ArticleListQuery { page?: number; pageSize?: number; sort?: string; brand?: string; category?: string; search?: string }`; `ArticlesApiService.getMine(query?: ArticleListQuery) → Observable<ArticleListResponse>` — Aufruf ohne Argument bleibt gültig (Standardwert `{}`), Backend-Query-Parameter-Namen exakt `page`, `pageSize`, `sort`, `brand`, `category`, `search` (siehe [`api/articles.md`](../../requirements/advance-registration/api/articles.md) und R03-Plan Task 15 `ArticlesEndpoints.cs`).

- [ ] **Step 1: Write failing tests**

In `articles-api.service.spec.ts` ergänzen (bestehenden `getMine()`-Test unverändert lassen, er deckt den Aufruf ohne Argument weiter ab):

```typescript
  it('getMine(query) sends all provided filters as query parameters', () => {
    service.getMine({ page: 2, pageSize: 10, sort: 'price:desc', brand: 'Nike', category: 'Jacken', search: 'jack' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles/mine');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    expect(req.request.params.get('sort')).toBe('price:desc');
    expect(req.request.params.get('brand')).toBe('Nike');
    expect(req.request.params.get('category')).toBe('Jacken');
    expect(req.request.params.get('search')).toBe('jack');
    req.flush({ items: [], totalCount: 0, page: 2, pageSize: 10 });
  });

  it('getMine(query) omits parameters that are not set', () => {
    service.getMine({ page: 1 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === '/api/articles/mine');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.has('brand')).toBe(false);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ items: [], totalCount: 0, page: 1, pageSize: 25 });
  });
```

- [ ] **Step 2: Run to verify both fail**

Run: `npx vitest run src/app/features/my-articles/articles-api.service.spec.ts`
Expected: FAIL — `getMine` akzeptiert noch kein Argument.

- [ ] **Step 3: Implement**

In `articles-api.service.ts` Import ergänzen:

```typescript
import { HttpClient, HttpParams } from '@angular/common/http';
```

Neues Interface ergänzen (nach `ArticleListResponse`):

```typescript
export interface ArticleListQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  brand?: string;
  category?: string;
  search?: string;
}
```

`getMine` ersetzen durch:

```typescript
  getMine(query: ArticleListQuery = {}): Observable<ArticleListResponse> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.category) params = params.set('category', query.category);
    if (query.search) params = params.set('search', query.search);
    return this.http.get<ArticleListResponse>('/api/articles/mine', { params });
  }
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/my-articles/articles-api.service.spec.ts`
Expected: PASS (bestehende 5 Tests + 2 neue = 7)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.ts src/advance-registration/frontend/BAR.App/src/app/features/my-articles/articles-api.service.spec.ts
git commit -m "feat(bar-app): ArticlesApiService.getMine um Pagination/Filter/Sort-Query erweitert"
```

---

## Task 3: Shared-Component `table`

Erste echte Nutzung — bisher nur in [`docs/components/table/component.md`](../../../components/table/component.md) beschrieben. Baut nur, was Meine Artikel braucht: Sortierung, Paginierung, Aktionsspalte, Lade-Skeleton, Leerzustand. **Kein** Spalten-Filter (Trichter-Icon) — bewusst nicht gebaut, da keine aktuelle Nutzung ihn braucht (Meine Artikel nutzt ausschließlich das Filter-Panel, siehe Design-Spec „Spalten-Filter vs. Filter-Panel"); eine spätere Epic, die ihn braucht, ergänzt ihn dann.

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/table/table.spec.ts`

**Interfaces:**
- Produces: `ColumnConfig { field: string; header: string; type: 'text' | 'number' | 'currency' | 'date' | 'badge'; sortable?: boolean }`; `ActionButtonConfig { actionId: string; icon: string; ariaLabel: string }`; `ActionColumnConfig { actions: ActionButtonConfig[] }`; `SortMeta { field: string; order: 'asc' | 'desc' }`; `TablePageEvent { first: number; rows: number }`; `ActionClickEvent<T> { actionId: string; row: T }`. Component `AppTable<T>`. Inputs: `columns = input.required<ColumnConfig[]>()`, `data = input.required<T[]>()`, `totalRecords = input<number>(0)`, `loading = input<boolean>(false)`, `rows = input<number>(25)`, `actionColumn = input<ActionColumnConfig | null>(null)`, `emptyText = input<string>('Keine Einträge gefunden.')`, `hasActiveFilter = input<boolean>(false)`. Outputs: `sortChange = output<SortMeta[]>()`, `pageChange = output<TablePageEvent>()`, `actionClick = output<ActionClickEvent<T>>()`, `rowAdd = output<void>()`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppTable, ColumnConfig } from './table';

const COLUMNS: ColumnConfig[] = [
  { field: 'number', header: 'Nr.', type: 'number' },
  { field: 'name', header: 'Bezeichnung', type: 'text' }
];

interface Row { number: number; name: string }

function create(data: Row[] = [], overrides: Partial<{ loading: boolean; totalRecords: number; hasActiveFilter: boolean }> = {}) {
  const fixture = TestBed.createComponent(AppTable<Row>);
  fixture.componentRef.setInput('columns', COLUMNS);
  fixture.componentRef.setInput('data', data);
  fixture.componentRef.setInput('loading', overrides.loading ?? false);
  fixture.componentRef.setInput('totalRecords', overrides.totalRecords ?? data.length);
  fixture.componentRef.setInput('hasActiveFilter', overrides.hasActiveFilter ?? false);
  fixture.detectChanges();
  return fixture;
}

describe('AppTable', () => {
  it('shows the generic empty text when there is no data and no active filter', () => {
    const fixture = create([]);
    expect(fixture.nativeElement.textContent).toContain('Keine Einträge gefunden.');
  });

  it('shows the filtered empty text when there is no data and a filter is active', () => {
    const fixture = create([], { hasActiveFilter: true });
    expect(fixture.nativeElement.textContent).toContain('Keine Einträge für den gewählten Filter gefunden.');
  });

  it('renders one row per data item', () => {
    const fixture = create([{ number: 1, name: 'A' }, { number: 2, name: 'B' }]);
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(2);
  });

  it('onSort() emits sortChange translated from PrimeNG sort order', () => {
    const fixture = create([{ number: 1, name: 'A' }]);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.sortChange.subscribe((v: unknown) => emitted.push(v));

    component.onSort({ field: 'name', order: 1 });

    expect(emitted).toEqual([[{ field: 'name', order: 'asc' }]]);
  });

  it('onPage() emits pageChange with first and rows', () => {
    const fixture = create([{ number: 1, name: 'A' }]);
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.pageChange.subscribe((v: unknown) => emitted.push(v));

    component.onPage({ first: 25, rows: 25 });

    expect(emitted).toEqual([{ first: 25, rows: 25 }]);
  });

  it('actionClick emits actionId and row on action button click', () => {
    const fixture = create([{ number: 1, name: 'A' }]);
    fixture.componentRef.setInput('actionColumn', { actions: [{ actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' }] });
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.actionClick.subscribe((v: unknown) => emitted.push(v));

    fixture.debugElement.query(By.css('[data-action-id="edit"]')).nativeElement.click();

    expect(emitted).toEqual([{ actionId: 'edit', row: { number: 1, name: 'A' } }]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/shared/table/table.spec.ts`
Expected: FAIL — `table.ts` fehlt.

- [ ] **Step 3: Implement**

```typescript
import { Component, computed, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

export interface ColumnConfig {
  field: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'badge';
  sortable?: boolean;
}

export interface ActionButtonConfig {
  actionId: string;
  icon: string;
  ariaLabel: string;
}

export interface ActionColumnConfig {
  actions: ActionButtonConfig[];
}

export interface SortMeta {
  field: string;
  order: 'asc' | 'desc';
}

export interface TablePageEvent {
  first: number;
  rows: number;
}

export interface ActionClickEvent<T> {
  actionId: string;
  row: T;
}

interface PrimeNgSortEvent {
  field?: string;
  order?: number;
  multiSortMeta?: { field: string; order: number }[];
}

interface PrimeNgPageEvent {
  first: number;
  rows: number;
}

@Component({
  selector: 'app-table',
  imports: [TableModule, ButtonModule, SkeletonModule],
  template: `
    <p-table
      [value]="data()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      [lazy]="true"
      [paginator]="showPaginator()"
      [rows]="rows()"
      [rowsPerPageOptions]="[10, 25, 50]"
      [sortMode]="'multiple'"
      [stripedRows]="true"
      [rowHover]="true"
      currentPageReportTemplate="Zeige {first} – {last} von {totalRecords} Einträgen"
      (onSort)="onSort($event)"
      (onPage)="onPage($event)"
    >
      <ng-template pTemplate="header">
        <tr>
          @for (col of columns(); track col.field) {
            @if (col.sortable === false) {
              <th>{{ col.header }}</th>
            } @else {
              <th [pSortableColumn]="col.field">{{ col.header }} <p-sortIcon [field]="col.field" /></th>
            }
          }
          @if (actionColumn()) {
            <th></th>
          }
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-row>
        <tr>
          @for (col of columns(); track col.field) {
            <td [class.number]="col.type === 'number' || col.type === 'currency'">{{ row[col.field] }}</td>
          }
          @if (actionColumn()) {
            <td class="actions">
              @for (action of actionColumn()!.actions; track action.actionId) {
                <button
                  pButton [text]="true" [rounded]="true" [icon]="action.icon"
                  [attr.aria-label]="action.ariaLabel" [attr.data-action-id]="action.actionId"
                  type="button"
                  (click)="actionClick.emit({ actionId: action.actionId, row })"
                ></button>
              }
            </td>
          }
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="totalColumns()">
            <p class="empty-state">{{ hasActiveFilter() ? filteredEmptyText : emptyText() }}</p>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="loadingbody">
        @for (skeletonRow of skeletonRows; track skeletonRow) {
          <tr>
            @for (col of columns(); track col.field) {
              <td><p-skeleton /></td>
            }
            @if (actionColumn()) {
              <td></td>
            }
          </tr>
        }
      </ng-template>
    </p-table>
  `
})
export class AppTable<T> {
  readonly columns = input.required<ColumnConfig[]>();
  readonly data = input.required<T[]>();
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(25);
  readonly actionColumn = input<ActionColumnConfig | null>(null);
  readonly emptyText = input<string>('Keine Einträge gefunden.');
  readonly hasActiveFilter = input<boolean>(false);

  readonly sortChange = output<SortMeta[]>();
  readonly pageChange = output<TablePageEvent>();
  readonly actionClick = output<ActionClickEvent<T>>();
  readonly rowAdd = output<void>();

  readonly filteredEmptyText = 'Keine Einträge für den gewählten Filter gefunden.';
  readonly skeletonRows = [0, 1, 2, 3, 4];

  readonly showPaginator = computed(() => this.totalRecords() > this.rows());
  readonly totalColumns = computed(() => this.columns().length + (this.actionColumn() ? 1 : 0));

  onSort(event: PrimeNgSortEvent): void {
    const metas = event.multiSortMeta ?? (event.field ? [{ field: event.field, order: event.order ?? 1 }] : []);
    this.sortChange.emit(metas.map((m) => ({ field: m.field, order: m.order === 1 ? 'asc' : ('desc' as const) })));
  }

  onPage(event: PrimeNgPageEvent): void {
    this.pageChange.emit({ first: event.first, rows: event.rows });
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/shared/table/table.spec.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/table/
git commit -m "feat(bar-app): shared table Component (Sortierung, Paginierung, Aktionsspalte)"
```

---

## Task 4: Shared-Component `filter-panel`

Basis-Variante nach [`docs/components/filter-panel/component.md`](../../../components/filter-panel/component.md): Marke, Kategorie, Freitext, „Suchen"-Button — kein Live-Filter.

**Files:**
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.ts`
- Create: `src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/filter-panel.spec.ts`

**Interfaces:**
- Consumes: `MasterDataItem { id: string; name: string; original: boolean }` (nur der Typ, kein Service-Import — analog `autocomplete-create`, siehe R03-Plan Task 18).
- Produces: `FilterPanelSearch { brand?: string; category?: string; search?: string }`. Component `FilterPanel`. Inputs: `brands = input.required<MasterDataItem[]>()`, `categories = input.required<MasterDataItem[]>()`. Output: `search = output<FilterPanelSearch>()`. Öffentliche Signals für Tests: `brandValue`, `categoryValue`, `searchText`.

- [ ] **Step 1: Write failing tests**

```typescript
import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FilterPanel } from './filter-panel';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

const BRANDS: MasterDataItem[] = [{ id: 'b1', name: 'Nike', original: true }];
const CATEGORIES: MasterDataItem[] = [{ id: 'c1', name: 'Jacken', original: true }];

function create() {
  const fixture = TestBed.createComponent(FilterPanel);
  fixture.componentRef.setInput('brands', BRANDS);
  fixture.componentRef.setInput('categories', CATEGORIES);
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

  it('emit() sends the current brand/category/search values', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.brandValue.set('Nike');
    component.categoryValue.set('Jacken');
    component.searchText.set('jack');

    component.emit();

    expect(emitted).toEqual([{ brand: 'Nike', category: 'Jacken', search: 'jack' }]);
  });

  it('emit() omits fields that are empty', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));

    component.emit();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: undefined }]);
  });

  it('clicking the Suchen button triggers emit()', () => {
    const fixture = create();
    const component = fixture.componentInstance;
    const emitted: unknown[] = [];
    component.search.subscribe((v: unknown) => emitted.push(v));
    component.searchText.set('jack');

    fixture.debugElement.query(By.css('[data-testid="search-button"]')).nativeElement.click();

    expect(emitted).toEqual([{ brand: undefined, category: undefined, search: 'jack' }]);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/shared/filter-panel/filter-panel.spec.ts`
Expected: FAIL — `filter-panel.ts` fehlt.

- [ ] **Step 3: Implement**

```typescript
import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import type { MasterDataItem } from '../../features/my-articles/master-data-api.service';

export interface FilterPanelSearch {
  brand?: string;
  category?: string;
  search?: string;
}

@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule, SelectModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule],
  template: `
    <div class="filter-panel">
      <p-select
        [options]="brands()" optionLabel="name" optionValue="name" placeholder="Marke"
        [(ngModel)]="brandValueModel" [showClear]="true" (onChange)="emit()"
      />
      <p-select
        [options]="categories()" optionLabel="name" optionValue="name" placeholder="Kategorie"
        [(ngModel)]="categoryValueModel" [showClear]="true" (onChange)="emit()"
      />
      <p-iconfield>
        <p-inputicon class="pi pi-search" />
        <input pInputText placeholder="Suche..." [(ngModel)]="searchTextModel" (keydown.enter)="emit()" />
      </p-iconfield>
      <button pButton type="button" label="Suchen" icon="pi pi-search" data-testid="search-button" (click)="emit()"></button>
    </div>
  `
})
export class FilterPanel {
  readonly brands = input.required<MasterDataItem[]>();
  readonly categories = input.required<MasterDataItem[]>();
  readonly search = output<FilterPanelSearch>();

  readonly brandValue = signal<string | null>(null);
  readonly categoryValue = signal<string | null>(null);
  readonly searchText = signal('');

  get brandValueModel() { return this.brandValue(); }
  set brandValueModel(v: string | null) { this.brandValue.set(v); }
  get categoryValueModel() { return this.categoryValue(); }
  set categoryValueModel(v: string | null) { this.categoryValue.set(v); }
  get searchTextModel() { return this.searchText(); }
  set searchTextModel(v: string) { this.searchText.set(v); }

  emit(): void {
    this.search.emit({
      brand: this.brandValue() ?? undefined,
      category: this.categoryValue() ?? undefined,
      search: this.searchText().trim() || undefined
    });
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/shared/filter-panel/filter-panel.spec.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/shared/filter-panel/
git commit -m "feat(bar-app): shared filter-panel Component (Basis-Variante)"
```

---

## Task 5: `artikel-dialog` um „Speichern + kopieren" und Nummernkonflikt-Dialog erweitern

Ersetzt den in R03 gebauten generischen `errorMessage`-Pfad bei `409 article.number_taken` im Anlege-Modus durch den in [`components/artikel-dialog.md`](../../requirements/advance-registration/components/artikel-dialog.md) spezifizierten eigenen Dialog, und ergänzt AC-9/AC-10.

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/components/artikel-dialog.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/components/artikel-dialog.spec.ts`

**Interfaces:**
- Consumes: `ArticlesApiService` (Task 2, jetzt mit `getMine(query?)`, unverändert für `create`/`update`/`delete`), `MessageService` (Task 1).
- Produces: erweiterte `ArtikelDialog`-Component. Neue öffentliche Signals: `conflictDialogVisible`, `conflictMessage`. Neue öffentliche Methode: `saveAndCopy()`. Bestehende Signals/Methoden (`isValid`, `save`, `confirmDelete`, `errorMessage`, `saving`) bleiben in Namen und Typ unverändert.

- [ ] **Step 1: Write failing tests**

Bestehenden Test `'save() on 409 keeps the dialog open and sets errorMessage'` in `artikel-dialog.spec.ts` **ersetzen** durch (409 zeigt jetzt den Konflikt-Dialog, nicht mehr `errorMessage`):

```typescript
  it('save() on 409 keeps the main dialog open and shows the number-conflict dialog', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105', nextNumber: 105 } })));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);

    component.save();

    expect(component.visible()).toBe(true);
    expect(component.conflictDialogVisible()).toBe(true);
    expect(component.conflictMessage()).toBe('Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105');
    expect(component.number()).toBe(105);
  });
```

Neue Tests ergänzen:

```typescript
  it('saveAndCopy() with nextNumber keeps the dialog open, keeps all field values and updates the number', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104, nextNumber: 105 } as never));
    const component = fixture.componentInstance;
    component.name.set('Body langarm'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);

    component.saveAndCopy();

    expect(component.visible()).toBe(true);
    expect(component.name()).toBe('Body langarm');
    expect(component.brand()).toBe('Nike');
    expect(component.number()).toBe(105);
    expect(component.errorMessage()).toBeNull();
  });

  it('saveAndCopy() without nextNumber closes the dialog and keeps it saved', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(of({ id: 'a1', number: 104 } as never));
    const component = fixture.componentInstance;
    component.name.set('Body'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);
    const emitted: void[] = [];
    component.saved.subscribe(() => emitted.push(undefined));

    component.saveAndCopy();

    expect(emitted.length).toBe(1);
    expect(component.visible()).toBe(false);
  });

  it('saveAndCopy() on 409 shows the number-conflict dialog like save()', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105', nextNumber: 105 } })));
    const component = fixture.componentInstance;
    component.name.set('Body'); component.brand.set('Nike'); component.category.set('Bodys'); component.price.set(3);

    component.saveAndCopy();

    expect(component.visible()).toBe(true);
    expect(component.conflictDialogVisible()).toBe(true);
    expect(component.number()).toBe(105);
  });

  it('closeConflictDialog() hides the conflict dialog and keeps the main dialog open', () => {
    const fixture = create();
    const api = TestBed.inject(ArticlesApiService);
    vi.spyOn(api, 'create').mockReturnValue(
      throwError(() => ({ status: 409, error: { detail: 'x', nextNumber: 105 } })));
    const component = fixture.componentInstance;
    component.name.set('Jacke'); component.brand.set('Nike'); component.category.set('Jacken'); component.price.set(5);
    component.save();

    component.closeConflictDialog();

    expect(component.conflictDialogVisible()).toBe(false);
    expect(component.visible()).toBe(true);
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/features/my-articles/components/artikel-dialog.spec.ts`
Expected: FAIL — `saveAndCopy`/`conflictDialogVisible`/`conflictMessage`/`closeConflictDialog` fehlen, alter 409-Test schlägt fehl.

- [ ] **Step 3: Implement**

Import ergänzen:

```typescript
import { MessageService } from 'primeng/api';
```

Neue Signals nach `deleteConfirmVisible` ergänzen:

```typescript
  readonly conflictDialogVisible = signal(false);
  readonly conflictMessage = signal('');
```

`MessageService` injizieren (nach `masterDataApi`):

```typescript
  private readonly messageService = inject(MessageService);
```

`save()` ersetzen durch eine gemeinsame private Methode plus zwei öffentliche Einstiege:

```typescript
  save(): void {
    this.submit(false);
  }

  saveAndCopy(): void {
    this.submit(true);
  }

  private submit(andCopy: boolean): void {
    if (!this.isValid()) return;
    this.saving.set(true);
    const savedNumber = this.number();
    const payload = {
      name: this.name(), brand: this.brand(), category: this.category(), price: this.price()!,
      size: this.size() || undefined, color: this.color() || undefined, description: this.description() || undefined
    };

    const request = this.mode() === 'create'
      ? this.articlesApi.create({ ...payload, expectedNumber: this.number() ?? undefined })
      : this.articlesApi.update(this.article()!.id, payload);

    request.subscribe({
      next: (response: { nextNumber?: number }) => {
        this.saving.set(false);
        this.saved.emit();

        if (!andCopy) {
          this.visible.set(false);
          return;
        }

        if (response.nextNumber === undefined) {
          this.visible.set(false);
          this.messageService.add({
            severity: 'warn', summary: 'Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren'
          });
          return;
        }

        this.number.set(response.nextNumber);
        this.errorMessage.set(null);
        this.messageService.add({
          severity: 'success', summary: `✓ Artikel ${savedNumber} gespeichert — nächste Nummer: ${response.nextNumber}`
        });
      },
      error: (err: { status?: number; error?: { detail?: string; nextNumber?: number } }) => {
        this.saving.set(false);
        if (err.status === 409 && err.error?.nextNumber !== undefined) {
          this.conflictMessage.set(err.error.detail ?? '');
          this.conflictDialogVisible.set(true);
          this.number.set(err.error.nextNumber);
          return;
        }
        this.errorMessage.set(err.error?.detail ?? 'Speichern fehlgeschlagen');
      }
    });
  }

  closeConflictDialog(): void {
    this.conflictDialogVisible.set(false);
  }
```

Footer-Template um „Speichern + kopieren" (nur Anlege-Modus) und Button-Sperre erweitern — bestehenden `<div class="footer">`-Block ersetzen durch:

```html
      <div class="footer">
        @if (mode() === 'edit') {
          <button pButton type="button" label="Löschen" class="p-button-danger" [disabled]="saving()" (click)="deleteConfirmVisible.set(true)"></button>
        }
        <button pButton type="button" label="Abbrechen" class="p-button-text" [disabled]="saving()" (click)="visible.set(false)"></button>
        @if (mode() === 'create') {
          <button pButton type="button" label="Speichern + kopieren" class="p-button-secondary p-button-outlined"
            [disabled]="!isValid() || saving()" [loading]="saving()"
            pTooltip="Artikel speichern und einen weiteren mit denselben Werten anlegen"
            (click)="saveAndCopy()"></button>
        }
        <button pButton type="button" label="Speichern" [disabled]="!isValid() || saving()" [loading]="saving()" (click)="save()"></button>
      </div>
```

Neuen Konflikt-Dialog nach dem Löschen-Bestätigungsdialog ergänzen:

```html
    <p-dialog [(visible)]="conflictDialogVisibleModel" [modal]="true" header="Artikelnummer bereits vergeben">
      <p>{{ conflictMessage() }}</p>
      <button pButton type="button" label="OK" (click)="closeConflictDialog()"></button>
    </p-dialog>
```

Getter/Setter für `conflictDialogVisibleModel` ergänzen (analog `deleteConfirmVisibleModel`):

```typescript
  get conflictDialogVisibleModel() { return this.conflictDialogVisible(); }
  set conflictDialogVisibleModel(v: boolean) { this.conflictDialogVisible.set(v); }
```

`TooltipModule` und `DialogModule` sind bereits importiert (`DialogModule` seit R03); `TooltipModule` zusätzlich in die `imports`-Liste des `@Component`-Decorators aufnehmen:

```typescript
import { TooltipModule } from 'primeng/tooltip';
```

```typescript
  imports: [
    FormsModule, DialogModule, InputTextModule, InputGroupModule, InputGroupAddonModule,
    InputNumberModule, ButtonModule, TextareaModule, TooltipModule, AutocompleteCreate
  ],
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/my-articles/components/artikel-dialog.spec.ts`
Expected: PASS (5 bestehende, davon 1 ersetzt, + 5 neue = 10)

- [ ] **Step 5: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles/components/
git commit -m "feat(bar-app): artikel-dialog um Speichern+kopieren und Nummernkonflikt-Dialog erweitert"
```

---

## Task 6: `MyArticlesPage` mit `filter-panel` und `table` neu verdrahten

**Files:**
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/pages/MyArticlesPage.ts`
- Modify: `src/advance-registration/frontend/BAR.App/src/app/features/my-articles/pages/MyArticlesPage.spec.ts`

**Interfaces:**
- Consumes: `ArticlesApiService.getMine(query?)` (Task 2), `AppTable`/`ColumnConfig`/`ActionColumnConfig`/`SortMeta`/`TablePageEvent`/`ActionClickEvent` (Task 3), `FilterPanel`/`FilterPanelSearch` (Task 4), `ArtikelDialog` (Task 5), `MessageService` (Task 1).
- Produces: neu verdrahtete Seite unter Route `/my-articles`. Öffentliche Signals für Tests (zusätzlich zu den bestehenden aus R03): `hasActiveFilter`.

- [ ] **Step 1: Write failing tests**

Bestehenden Test `'loads articles, brands and categories on init'` unverändert lassen (er ruft `getMine()` ohne Argumente auf — bleibt mit dem Default-Query `{}` gültig). Neue Tests ergänzen:

```typescript
  it('onFilterSearch() reloads with the given filters and resets to page 1', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onFilterSearch({ brand: 'Nike', category: undefined, search: 'jack' });

    expect(articlesApi.getMine).toHaveBeenCalledWith({ page: 1, pageSize: 25, sort: undefined, brand: 'Nike', category: undefined, search: 'jack' });
    expect(fixture.componentInstance.hasActiveFilter()).toBe(true);
  });

  it('onTableSort() reloads with a sort string built from the sort metas', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onTableSort([{ field: 'price', order: 'desc' }, { field: 'name', order: 'asc' }]);

    expect(articlesApi.getMine).toHaveBeenCalledWith(
      expect.objectContaining({ sort: 'price:desc,name:asc' }));
  });

  it('onTablePage() reloads with the page derived from first/rows', () => {
    const { fixture, articlesApi } = create();
    vi.mocked(articlesApi.getMine).mockClear();

    fixture.componentInstance.onTablePage({ first: 50, rows: 25 });

    expect(articlesApi.getMine).toHaveBeenCalledWith(expect.objectContaining({ page: 3, pageSize: 25 }));
  });
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/features/my-articles/pages/MyArticlesPage.spec.ts`
Expected: FAIL — `onFilterSearch`/`onTableSort`/`onTablePage`/`hasActiveFilter` fehlen.

- [ ] **Step 3: Implement**

Imports ersetzen:

```typescript
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ArticlesApiService, ArticleListQuery, ArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../master-data-api.service';
import { ArtikelDialog } from '../components/artikel-dialog';
import { AppTable, ActionClickEvent, ActionColumnConfig, ColumnConfig, SortMeta, TablePageEvent } from '../../../shared/table/table';
import { FilterPanel, FilterPanelSearch } from '../../../shared/filter-panel/filter-panel';
```

Ganze Component ersetzen durch:

```typescript
const COLUMNS: ColumnConfig[] = [
  { field: 'number', header: 'Nr.', type: 'number' },
  { field: 'name', header: 'Bezeichnung', type: 'text' },
  { field: 'category', header: 'Kategorie', type: 'text' },
  { field: 'brand', header: 'Marke', type: 'text' },
  { field: 'price', header: 'Preis', type: 'currency' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [{ actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' }]
};

@Component({
  selector: 'app-my-articles-page',
  imports: [FilterPanel, AppTable, ArtikelDialog],
  template: `
    <h1>Meine Artikel</h1>

    <app-filter-panel [brands]="brands()" [categories]="categories()" (search)="onFilterSearch($event)" />

    @if (isEmpty() && !hasActiveFilter()) {
      <p>Noch keine Artikel angemeldet. Mit <strong>+ Neu</strong> den ersten anlegen.</p>
      <button pButton type="button" label="+ Neu" (click)="openCreateDialog()"></button>
    } @else {
      <button pButton type="button" label="+ Neu" (click)="openCreateDialog()"></button>
      <app-table
        [columns]="columns"
        [data]="articles()"
        [totalRecords]="totalRecords()"
        [loading]="loading()"
        [actionColumn]="actionColumn"
        [hasActiveFilter]="hasActiveFilter()"
        (sortChange)="onTableSort($event)"
        (pageChange)="onTablePage($event)"
        (actionClick)="onTableAction($event)"
      />
    }

    <app-artikel-dialog
      [(visible)]="dialogVisibleModel"
      [mode]="dialogMode()"
      [article]="dialogArticle()"
      [initialNumber]="dialogNextNumber()"
      [brands]="brands()"
      [categories]="categories()"
      (saved)="onSaved()"
      (deleted)="onSaved()"
      (brandCreated)="onBrandCreated($event)"
      (categoryCreated)="onCategoryCreated($event)"
    />
  `
})
export class MyArticlesPage implements OnInit {
  private readonly articlesApi = inject(ArticlesApiService);
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly messageService = inject(MessageService);

  readonly columns = COLUMNS;
  readonly actionColumn = ACTION_COLUMN;

  readonly articles = signal<ArticleResponse[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly brands = signal<MasterDataItem[]>([]);
  readonly categories = signal<MasterDataItem[]>([]);
  readonly isEmpty = computed(() => this.articles().length === 0);

  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly sort = signal<string | undefined>(undefined);
  readonly filters = signal<FilterPanelSearch>({});
  readonly hasActiveFilter = computed(() => {
    const f = this.filters();
    return !!(f.brand || f.category || f.search);
  });

  readonly dialogVisible = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly dialogArticle = signal<ArticleResponse | null>(null);
  readonly dialogNextNumber = signal<number | null>(null);

  get dialogVisibleModel() { return this.dialogVisible(); }
  set dialogVisibleModel(v: boolean) { this.dialogVisible.set(v); }

  ngOnInit(): void {
    this.loadArticles();
    this.masterDataApi.getAll('brands').subscribe((items) => this.brands.set(items));
    this.masterDataApi.getAll('categories').subscribe((items) => this.categories.set(items));
  }

  loadArticles(): void {
    this.loading.set(true);
    const query: ArticleListQuery = {
      page: this.page(), pageSize: this.pageSize(), sort: this.sort(), ...this.filters()
    };
    this.articlesApi.getMine(query).subscribe((result) => {
      this.loading.set(false);
      this.articles.set(result.items);
      this.totalRecords.set(result.totalCount);
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

  onTableAction(event: ActionClickEvent<ArticleResponse>): void {
    if (event.actionId === 'edit') {
      this.openEditDialog(event.row);
    }
  }

  openCreateDialog(): void {
    this.articlesApi.getNextNumber().subscribe({
      next: ({ number }) => {
        this.dialogMode.set('create');
        this.dialogArticle.set(null);
        this.dialogNextNumber.set(number);
        this.dialogVisible.set(true);
      },
      error: () => {
        this.messageService.add({
          severity: 'warn', summary: 'Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren'
        });
      }
    });
  }

  openEditDialog(article: ArticleResponse): void {
    this.dialogMode.set('edit');
    this.dialogArticle.set(article);
    this.dialogNextNumber.set(null);
    this.dialogVisible.set(true);
  }

  onSaved(): void {
    this.loadArticles();
  }

  onBrandCreated(item: MasterDataItem): void {
    this.brands.update((items) => [...items, item]);
  }

  onCategoryCreated(item: MasterDataItem): void {
    this.categories.update((items) => [...items, item]);
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/app/features/my-articles/pages/MyArticlesPage.spec.ts`
Expected: PASS (bestehende 5 Tests + 3 neue = 8)

- [ ] **Step 5: Volle Frontend-Testsuite laufen lassen**

Run (im Ordner `src/advance-registration/frontend/BAR.App`): `npx vitest run`
Expected: alle Tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/advance-registration/frontend/BAR.App/src/app/features/my-articles/pages/
git commit -m "feat(bar-app): MyArticlesPage mit filter-panel und table neu verdrahtet"
```

---

## Nacharbeiten (nicht Teil dieses Plans, im Review ansprechen)

- **Manuelle Prüfung Roadmap „Fertig, wenn"**, insbesondere Punkt 1 (Blockerweiterung nach 10 Artikeln bei Blockgröße 10) und Punkt 6 (Nummernblock-Seite zeigt „10 Nummern · 10 vergeben" — das ist R02s `block-liste`, hier nur verifiziert, nicht neu gebaut).
- **Spalten-Filter der `table`-Komponente** bewusst nicht gebaut (siehe Task 3) — sobald eine künftige Epic ihn braucht (z. B. Epic_Alle_Artikel oder Epic_Verkaeufer), dort als eigener Task nachziehen; Interfaces (`ColumnConfig.filterable`, `filterChange`-Output) sind in der Doku bereits vorgesehen, aber hier nicht implementiert.

## Self-Review

**Spec-Abdeckung:** Toast-Infrastruktur (Task 1, Voraussetzung für AC-8/9/10 und den Konflikt-Dialog), Backend-Query-Anbindung (Task 2), `table`-Component (Task 3), `filter-panel`-Component (Task 4), „Speichern + kopieren" AC-9/AC-10 und Nummernkonflikt-Dialog AC-7 (Task 5), Verdrahtung Filter/Sort/Page in `MyArticlesPage` inkl. AC-8-Toast (Task 6). Jeder Abschnitt der Design-Spec sowie jeder Punkt der Roadmap-„Umfang"-Liste hat eine Task-Entsprechung; die einzige bewusste Lücke (Spalten-Filter) steht unter „Nacharbeiten", nicht stillschweigend weggelassen.

**Placeholder-Scan:** Keine TODO/TBD-Reste; jeder Implementierungs-Step enthält vollständigen Code statt Prosa-Beschreibung.

**Typkonsistenz geprüft:** `ArticleListQuery` (Task 2) wird in Task 6 mit denselben Feldnamen (`page`, `pageSize`, `sort`, `brand`, `category`, `search`) wiederverwendet. `ColumnConfig`/`ActionColumnConfig`/`SortMeta`/`TablePageEvent`/`ActionClickEvent` (Task 3) stimmen in Feldnamen und Typen mit ihrer Verwendung in Task 6 überein (`SortMeta.order` ist `'asc' | 'desc'`, exakt der String, der in `onTableSort` zu `field:order` zusammengesetzt wird). `FilterPanelSearch` (Task 4) wird in Task 6 identisch destrukturiert (`...this.filters()`). `conflictDialogVisible`/`conflictMessage`/`saveAndCopy`/`closeConflictDialog` (Task 5) sind ausschließlich innerhalb von `artikel-dialog` neu — keine Folge-Task greift auf sie zu, `MyArticlesPage` bleibt unverändert an das bestehende `ArtikelDialog`-Interface aus R03 gebunden (`visible`, `mode`, `article`, `initialNumber`, `brands`, `categories`, `saved`, `deleted`, `brandCreated`, `categoryCreated`).
