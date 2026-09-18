import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ColumnConfig, SortEvent, PageEvent, Table } from '../../../../shared/components/table/table';
import { ArticleListItem } from '../../data/articles-api';
import { ArticlesStore } from '../../articles-store';
// Cross-feature READ of another feature's data-layer, per spec.md's own framing ("hier nur
// lesend importiert"): the Brand/Category dropdown OPTIONS come straight from the Brands and
// Categories master-data lists (GET /api/brands, GET /api/categories), not from anything
// Articles-specific. `eslint-plugin-boundaries` disallows feature-to-feature imports by
// default with no built-in exception for this (checked `eslint.config.js`); the existing
// precedent for this exact situation is `sellers-page.spec.ts`'s
// `// eslint-disable-next-line boundaries/dependencies` importing `SellerTypesApi` from
// `features/seller-types/data/seller-types-api` — following that precedent here rather than
// disabling the rule project-wide or inventing a new policy exception.
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';

const DEBOUNCE_MS = 300;
const DEFAULT_SORT = 'number:asc';

/** Row shape actually handed to `Table` — adds the derived German `statusLabel` (see
 * `STATUS_SEVERITY`'s doc comment above) on top of the raw `ArticleListItem` from the API. */
interface ArticleRow extends ArticleListItem {
  statusLabel: string;
}

const STATUS_OPTIONS: { label: string; value: string | null }[] = [
  { label: 'Alle', value: null },
  { label: 'Registriert', value: 'registered' },
  { label: 'Im Verkauf', value: 'selling' },
  { label: 'Verkauft', value: 'sold' },
  { label: 'Zurückgegeben', value: 'returned' },
];

const STATUS_LABELS: Record<string, string> = {
  registered: 'Registriert',
  selling: 'Im Verkauf',
  sold: 'Verkauft',
  returned: 'Zurückgegeben',
};

/**
 * Status -> badge severity mapping (no existing precedent in this codebase for Article status
 * colors specifically — chosen for a sensible success/info/warn/secondary spread across the
 * lifecycle): `registered` (not yet released) is neutral `secondary`, `selling` (active, the
 * "normal" state) is `info`, `sold` (successful outcome) is `success`, `returned` (needs seller
 * pickup) is `warn`.
 *
 * Round-15 Task 6 fix round 1: `Table`'s badge-column template renders whatever the column's
 * `field` points at verbatim (`toDisplayString`) — it has no label-mapping of its own (see
 * `Table`'s `resolveSeverity`/body template). The `status` column below therefore points its
 * `field` at the derived `statusLabel` (German), not the raw `status` (English enum value), the
 * same workaround `brands-page.ts`/`categories-page.ts` use for their `originalLabel` badge
 * column. `badgeSeverity` receives that same displayed value (the label), so this map is keyed
 * by the German label rather than the raw status — semantically it's still "derived from the raw
 * status", just pre-joined through the 1:1 `STATUS_LABELS` mapping instead of a second lookup at
 * render time.
 */
const STATUS_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'secondary'> = {
  [STATUS_LABELS['registered']]: 'secondary',
  [STATUS_LABELS['selling']]: 'info',
  [STATUS_LABELS['sold']]: 'success',
  [STATUS_LABELS['returned']]: 'warn',
};

/**
 * Orchestration page for Round-15 "Artikel-Übersicht & Korrektur" (Task 6) — replaces the
 * Round-7 placeholder. Filter panel is the Haupt-App "Sonderfall zweizeilig" (two-row) layout:
 * row 1 is a full-width free-text search (debounced, no sort-select/"+ Neu" — sort here comes
 * from clicking column headers, and spec.md is explicit there's no create action on this page),
 * row 2 is a 3-column Brand/Category/Status filter grid (immediate, no debounce). The table
 * itself is `<app-table [lazy]="true">` (Round-15 Task 6 also extended `Table` with this mode —
 * see its class doc comment), driven by `ArticlesStore` (Task 6), which resolves search/filter/
 * sort/pagination entirely server-side.
 *
 * Row-click / correction dialog: Tasks 7 (`artikel-dialog`) and 8 (`article-status-popup`) are
 * not part of this task and did not exist yet when this page was built — `onRowClick` is a
 * clearly marked TODO stub rather than an invented dialog. Wire it up following
 * `sellers-page.ts`'s `dialogVisible`/`editingCard`/`onDialogSave` orchestration pattern once
 * those components land.
 */
@Component({
  selector: 'app-articles-page',
  imports: [FormsModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, Table],
  templateUrl: './articles-page.html',
  styleUrl: './articles-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesPage {
  private readonly articlesStore = inject(ArticlesStore);
  private readonly brandsApi = inject(BrandsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly destroyRef = inject(DestroyRef);

  /** `ArticlesStore.items` mapped to the derived `ArticleRow` shape `Table` actually renders —
   * see `ArticleRow`'s doc comment. */
  readonly items = computed<ArticleRow[]>(() =>
    this.articlesStore.items().map((item) => ({
      ...item,
      statusLabel: this.statusLabel(item.status),
    })),
  );
  readonly totalCount = this.articlesStore.totalCount;
  readonly pageSize = this.articlesStore.pageSize;
  readonly loading = this.articlesStore.loading;
  readonly filters = this.articlesStore.filters;

  readonly statusOptions = STATUS_OPTIONS;

  /** Local mirror of the free-text input for immediate UI feedback; debounced into the store. */
  readonly qInput = signal('');

  readonly brandOptions = signal<{ label: string; value: string | null }[]>([
    { label: 'Alle', value: null },
  ]);
  readonly categoryOptions = signal<{ label: string; value: string | null }[]>([
    { label: 'Alle', value: null },
  ]);

  readonly columns: ColumnConfig[] = [
    { field: 'number', header: 'Nr.', type: 'number', filterable: false },
    { field: 'name', header: 'Bezeichnung', type: 'text', filterable: false },
    { field: 'category', header: 'Kategorie', type: 'text', filterable: false },
    { field: 'brand', header: 'Marke', type: 'text', filterable: false },
    { field: 'price', header: 'Preis', type: 'currency', filterable: false },
    {
      // Points at the derived `statusLabel` (German), not the raw `status` (English enum value)
      // — see `STATUS_SEVERITY`'s doc comment above for why.
      field: 'statusLabel',
      header: 'Status',
      type: 'badge',
      filterable: false,
      badgeSeverity: (value) => STATUS_SEVERITY[value as string] ?? 'info',
      // "manuell"-Badge neben Status bei soldManually (spec.md) — a second, independent badge
      // sourced from the whole row rather than the `status` field itself; see `Table`'s
      // `ColumnConfig.secondaryBadge` doc comment for why this stays a caller-supplied hook
      // instead of Article-specific logic inside the shared component.
      secondaryBadge: (row) =>
        (row as ArticleRow).soldManually ? { text: 'manuell', severity: 'secondary' } : null,
    },
    { field: 'sellerName', header: 'Verkäufer', type: 'text', filterable: false },
  ];

  constructor() {
    this.articlesStore.load();
    this.loadBrandOptions();
    this.loadCategoryOptions();

    toObservable(this.qInput)
      .pipe(debounceTime(DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        if (q === this.filters().q) return;
        this.articlesStore.setFilters({ q });
      });
  }

  onQInputChange(value: string): void {
    this.qInput.set(value);
  }

  onBrandChange(brand: string | null): void {
    // Per spec.md, Brand/Category/Status dropdown changes are immediate, no debounce —
    // matching sellers-page's status-dropdown precedent.
    this.articlesStore.setFilters({ brand });
  }

  onCategoryChange(category: string | null): void {
    this.articlesStore.setFilters({ category });
  }

  onStatusChange(status: string | null): void {
    this.articlesStore.setFilters({ status });
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  onSortChange(events: SortEvent[]): void {
    const sort =
      events.length === 0
        ? DEFAULT_SORT
        : events.map((e) => `${e.field}:${e.order}`).join(',');
    this.articlesStore.setFilters({ sort });
  }

  onPageChange(event: PageEvent): void {
    // Round-15 Task 6 fix round 1: the paginator's `rowsPerPageOptions` (hardcoded [10, 25, 50]
    // inside `Table`) lets a user pick a page size other than `ArticlesStore`'s fixed 50 — see
    // `ArticlesStore.setPageSize`'s doc comment. When the emitted `rows` differs from the
    // store's current `pageSize`, that's a page-SIZE change, not a page-NUMBER change: reload at
    // the new size (which itself resets to page 1) instead of also calling `setPage`, since the
    // old zero-based `event.page` was computed by `Table` against the OLD rows-per-page and would
    // point at the wrong page under the new size.
    if (event.rows !== this.pageSize()) {
      this.articlesStore.setPageSize(event.rows);
      return;
    }

    // `Table`'s `pageChange` is ZERO-BASED (Table.onPage/onLazyLoad: Math.floor(first / rows),
    // no +1) — unlike sellers-page's own PaginatorModule-based onPageChange, which does +1
    // itself. ArticlesStore.setPage is 1-based (matching the backend's 1-based `page` param,
    // same as SellersStore) — so +1 here, not in the store.
    this.articlesStore.setPage(event.page + 1);
  }

  onRowClick(row: ArticleListItem): void {
    // TODO(Task 7/8): wire artikel-dialog / article-status-popup. Those components are not
    // part of Task 6 and didn't exist yet when this page was built — see the class doc comment.
    void row;
  }

  private loadBrandOptions(): void {
    this.brandsApi.getAll().subscribe({
      next: (brands: Brand[]) => {
        this.brandOptions.set([
          { label: 'Alle', value: null },
          ...brands.map((b) => ({ label: b.name, value: b.name })),
        ]);
      },
    });
  }

  private loadCategoryOptions(): void {
    this.categoriesApi.getAll().subscribe({
      next: (categories: Category[]) => {
        this.categoryOptions.set([
          { label: 'Alle', value: null },
          ...categories.map((c) => ({ label: c.name, value: c.name })),
        ]);
      },
    });
  }
}
