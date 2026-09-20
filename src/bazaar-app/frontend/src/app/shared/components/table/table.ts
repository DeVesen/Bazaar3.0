import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

export interface ColumnConfig {
  field: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'badge';
  sortable?: boolean; // default true
  filterable?: boolean; // default true
  matchModes?: MatchMode[];
  filterOptions?: { label: string; value: unknown }[];
  /**
   * Optional severity mapping hook for `type: 'badge'` columns. component.md §4/§6 doesn't
   * fix a global badge-value -> severity mapping, so the caller may supply one; defaults to
   * PrimeNG's `'info'` severity when omitted.
   */
  badgeSeverity?: (value: unknown) => BadgeSeverity;
  /**
   * Optional SECOND badge rendered next to the primary `type: 'badge'` tag, from the whole row
   * rather than a single field (e.g. Articles' "manuell" marker next to the status badge — see
   * `api/articles.md`/spec.md). Returns `null` to render nothing for that row. Mirrors the
   * caller-supplied-function shape of `badgeSeverity` rather than introducing a templating API:
   * `Table` stays generic and config-driven, with no Article-specific knowledge of its own.
   * Only consulted for `type: 'badge'` and `type: 'currency'` columns.
   */
  secondaryBadge?: (row: unknown) => { text: string; severity: BadgeSeverity } | null;
}

export type BadgeSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

export type MatchMode = 'equals' | 'startsWith' | 'contains' | 'endsWith' | 'lt' | 'lte' | 'gt' | 'gte';

export interface ActionButtonConfig {
  actionId: string;
  icon: string; // e.g. 'pi pi-pencil'
  tooltip?: string;
}

export interface ActionColumnConfig {
  buttons: ActionButtonConfig[];
}

export interface SortEvent {
  field: string;
  order: 'asc' | 'desc';
}

export interface ActionClickEvent<T> {
  actionId: string;
  row: T;
}

export interface PageEvent {
  page: number;
  rows: number;
}

export type FilterEvent = Record<string, { value: unknown; matchMode: MatchMode }>;

const DEFAULT_MATCH_MODES_BY_TYPE: Record<ColumnConfig['type'], MatchMode[]> = {
  text: ['contains', 'startsWith', 'endsWith', 'equals'],
  number: ['equals', 'lt', 'lte', 'gt', 'gte'],
  currency: ['equals', 'lt', 'lte', 'gt', 'gte'],
  date: ['equals', 'lt', 'lte', 'gt', 'gte'],
  badge: ['equals'],
};

const PAGINATION_THRESHOLD = 25;
const SKELETON_ROW_COUNT = 5;
const CIRCLED_DIGIT_BASE = 0x2460; // U+2460 = '①'

/**
 * Generic list table (component.md C-001). Dumb component: data comes in via `@Input`,
 * every interaction leaves via `@Output`. The parent decides in-memory vs. backend
 * sort/filter/page handling.
 *
 * Scope deviations from component.md (see task-6-brief.md "Scope decision" and the task
 * report for the full rationale):
 * - §6 Spalten-Filter: no `p-columnFilter` overlay menu (match-mode button group, preset
 *   listbox with divider). Filterable columns instead render a plain inline text input
 *   (or a `p-select` when `filterOptions` is set), using the column's first configured
 *   `matchModes` entry (or the type default from `DEFAULT_MATCH_MODES_BY_TYPE`) as the
 *   match mode. `filterChange` still emits the documented `FilterEvent` shape.
 * - §11 Virtual Scroll: not wired. PrimeNG's virtual scroll needs a fixed `scrollHeight`
 *   plus a real ResizeObserver/layout engine to render rows at all; binding it half-way
 *   in a component every future epic depends on risked breaking row rendering (and this
 *   component's own AC tests) for a capability no Round-11 consumer needs yet (Brands'
 *   dataset is tiny). Left as a documented follow-up instead of inert-but-untested plumbing.
 * - Sorting is handled with a custom header click handler rather than PrimeNG's own
 *   `pSortableColumn`/`sortMode="multiple"` combo: PrimeNG's native multi-sort modifier is
 *   Ctrl/Cmd+click, but component.md §5 and AC-3 specify Shift+click. Managing sort state
 *   ourselves lets the documented Shift+click contract stand without fighting PrimeNG's
 *   built-in modifier-key check.
 *
 * LAZY (backend-paginated) MODE — implemented Round-15 Task 6, option (a) from the previous
 * version of this doc comment:
 * Set `[lazy]="true"` when the parent already resolves paging server-side (e.g. Articles) and
 * hands in only the CURRENT PAGE's rows via `data()` (not the full dataset), together with the
 * real server-side count via `totalRecords()`. In that mode:
 * - `p-table` is bound with `[lazy]="true"` and `[lazyLoadOnInit]="false"` — the initial load
 *   is left to the parent's own `store.load()` call (matching every other page's convention)
 *   rather than PrimeNG's own automatic first `onLazyLoad` emission, so the two don't race and
 *   double-fetch on init.
 * - Pass the ACTUAL server page size via the `rows` input (e.g. `[rows]="pageSize()"`). PrimeNG
 *   slices `data()` down to `[0, rows())` for rendering even in lazy mode (`dataToRender`), so
 *   a `rows` value smaller than the real page size would silently hide fetched rows — this is
 *   why `rows` is now a caller-supplied input instead of the old hardcoded `10` (default stays
 *   `10`, so every existing non-lazy caller's behavior is unchanged).
 * - `(onLazyLoad)` drives `pageChange` in lazy mode. `(onPage)` is still bound for the non-lazy
 *   path, but `onPage()` now no-ops when `lazy()` is true: verified empirically against this
 *   project's installed PrimeNG version (22.1.x) that its internal paginator handler
 *   (`p-table`'s `onPageChange`) emits its own `onPage` output UNCONDITIONALLY and ADDITIONALLY
 *   emits `onLazyLoad` when lazy — i.e. paging (unlike sorting/filtering, which PrimeNG itself
 *   gates with an `if (lazy()) … else …`) is NOT mutually exclusive between the two events at
 *   the PrimeNG level. Without the guard, a paginator click on a lazy table would emit
 *   `pageChange` twice. Sorting/filtering here don't have this problem because `Table` handles
 *   both via its own custom `onHeaderClick`/`onFilterValueChange` handlers, never through
 *   PrimeNG's native `pSortableColumn`/column-filter machinery — so PrimeNG's own internal
 *   lazy-gated sort/filter `onLazyLoad` emissions are never reached from this component at all.
 * - `sortChange`/`filterChange` are unaffected: they already emit from `Table`'s own handlers
 *   regardless of `lazy()`, so the lazy parent (Articles) converts them to backend params
 *   itself; no change was needed here for those two.
 *
 * Round-15 Task 6 fix round 1: the previous version of this doc comment flagged a gap where a
 * lazy consumer's user picking a row-count other than the caller's real page size (still the
 * hardcoded Brands-style `[10, 25, 50]` below) changed `p-table`'s internal `rows()` without the
 * parent ever learning about it or re-fetching at that size, silently slicing already-fetched
 * rows out of view. Closed on the CALLER side, not here: `Table` still only emits `pageChange`
 * with the new `{ page, rows }` (unchanged) — it has no opinion on page size vs. page number.
 * `articles-page.ts`'s `onPageChange` now compares the emitted `rows` against
 * `ArticlesStore.pageSize()` and calls the new `ArticlesStore.setPageSize()` (reset-and-reload,
 * mirroring `setFilters`) instead of `setPage()` when they differ. Any other lazy consumer needs
 * the same comparison in its own `pageChange` handler plus its own store's `setPageSize` — this
 * component still does not expose `rowsPerPageOptions` as an input, so all lazy callers share the
 * same hardcoded `[10, 25, 50]`.
 */
@Component({
  selector: 'app-table',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    SkeletonModule,
    TableModule,
    TagModule,
    TooltipModule,
    DatePipe,
    CurrencyPipe,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Table<T = unknown> {
  readonly columns = input.required<ColumnConfig[]>();
  readonly data = input.required<T[]>();
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly actionColumn = input<ActionColumnConfig | null>(null);
  readonly emptyText = input<string | null>(null);
  readonly hasActiveFilter = input<boolean>(false);
  /**
   * Rows per page. Also doubles as the effective page size in `[lazy]="true"` mode — see the
   * "LAZY (backend-paginated) MODE" doc comment above for why a lazy caller MUST pass its real
   * server page size here. Defaults to `10`, the value this was hardcoded to before Round-15
   * Task 6, so every existing non-lazy caller's behavior is unchanged.
   */
  readonly rows = input<number>(10);
  /** Opt-in backend-paginated mode — see the "LAZY (backend-paginated) MODE" doc comment above. */
  readonly lazy = input<boolean>(false);
  /** Controls the "+ Neu" toolbar button (component.md §3) — the parent owns the permission check. */
  readonly canAdd = input<boolean>(false);
  /** Optional toolbar title (component.md §3 "Seitenüberschrift / Epic-Titel"). */
  readonly title = input<string | null>(null);
  /**
   * Override for the automatic paginator-visibility threshold (component.md §7). `null`
   * (default) keeps `showPaginator`'s existing "> 25 rows" behavior for every caller that
   * doesn't set it. Callers whose spec mandates the full list in a scrolling box with NO
   * pagination regardless of row count — e.g. `leaderboard.html` (leaderboard component.md
   * AC-6) — pass `[paginator]="false"` explicitly.
   */
  readonly paginator = input<boolean | null>(null);

  readonly sortChange = output<SortEvent[]>();
  readonly filterChange = output<FilterEvent>();
  readonly pageChange = output<PageEvent>();
  readonly actionClick = output<ActionClickEvent<T>>();
  readonly rowAdd = output<void>();

  readonly sortState = signal<SortEvent[]>([]);
  readonly filterState = signal<FilterEvent>({});

  readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => i);

  readonly hasFilterableColumns = computed(() => this.columns().some((c) => c.filterable !== false));

  readonly showPaginator = computed(() => {
    const override = this.paginator();
    if (override !== null) return override;
    const total = this.totalRecords() || this.data().length;
    return total > PAGINATION_THRESHOLD;
  });

  readonly isFiltered = computed(
    () => this.hasActiveFilter() || Object.keys(this.filterState()).length > 0,
  );

  readonly resolvedEmptyText = computed(() =>
    this.isFiltered()
      ? 'Keine Einträge für den gewählten Filter gefunden.'
      : (this.emptyText() ?? 'Keine Einträge gefunden.'),
  );

  getValue(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field];
  }

  getNumericValue(row: T, field: string): string | number | null | undefined {
    const value = this.getValue(row, field);
    return value as string | number | null | undefined;
  }

  getDateValue(row: T, field: string): string | number | Date | null | undefined {
    const value = this.getValue(row, field);
    return value as string | number | Date | null | undefined;
  }

  toDisplayString(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
  }

  resolveSeverity(column: ColumnConfig, value: unknown) {
    return column.badgeSeverity?.(value) ?? 'info';
  }

  resolveSecondaryBadge(column: ColumnConfig, row: T): { text: string; severity: BadgeSeverity } | null {
    return column.secondaryBadge?.(row) ?? null;
  }

  sortIndexOf(field: string): number {
    return this.sortState().findIndex((s) => s.field === field);
  }

  sortOrderOf(field: string): 'asc' | 'desc' | null {
    const idx = this.sortIndexOf(field);
    return idx === -1 ? null : this.sortState()[idx].order;
  }

  sortBadgeOf(field: string): string | null {
    if (this.sortState().length < 2) return null;
    const idx = this.sortIndexOf(field);
    return idx === -1 ? null : this.circledDigit(idx + 1);
  }

  onHeaderClick(event: MouseEvent, column: ColumnConfig): void {
    if (column.sortable === false || this.loading()) return;

    const current = this.sortState();
    const idx = current.findIndex((s) => s.field === column.field);
    let next: SortEvent[];

    if (event.shiftKey) {
      if (idx === -1) {
        next = [...current, { field: column.field, order: 'asc' }];
      } else if (current[idx].order === 'asc') {
        next = current.map((s, i) => (i === idx ? { ...s, order: 'desc' } : s));
      } else {
        next = current.filter((_, i) => i !== idx);
      }
    } else if (current.length === 1 && idx === 0) {
      next = current[0].order === 'asc' ? [{ field: column.field, order: 'desc' }] : [];
    } else {
      next = [{ field: column.field, order: 'asc' }];
    }

    this.sortState.set(next);
    this.sortChange.emit(next);
  }

  onFilterValueChange(column: ColumnConfig, value: unknown): void {
    const next = { ...this.filterState() };
    if (value === null || value === undefined || value === '') {
      delete next[column.field];
    } else {
      const matchMode = column.matchModes?.[0] ?? DEFAULT_MATCH_MODES_BY_TYPE[column.type][0];
      next[column.field] = { value, matchMode };
    }
    this.filterState.set(next);
    this.filterChange.emit(next);
  }

  onPage(event: { first: number; rows: number }): void {
    // In `[lazy]="true"` mode, PrimeNG's own paginator handler emits `onPage` unconditionally
    // AND `onLazyLoad` additionally (verified against this project's PrimeNG version — see the
    // class doc comment) — no-op here so `pageChange` isn't emitted twice; `onLazyLoad` below
    // is the sole source of truth for lazy tables.
    if (this.lazy()) return;
    const page = event.rows > 0 ? Math.floor(event.first / event.rows) : 0;
    this.pageChange.emit({ page, rows: event.rows });
  }

  onLazyLoad(event: TableLazyLoadEvent): void {
    const rows = event.rows ?? 10;
    const first = event.first ?? 0;
    const page = rows > 0 ? Math.floor(first / rows) : 0;
    this.pageChange.emit({ page, rows });
  }

  onActionClick(actionId: string, row: T): void {
    this.actionClick.emit({ actionId, row });
  }

  onAddClick(): void {
    this.rowAdd.emit();
  }

  private circledDigit(n: number): string {
    return String.fromCodePoint(CIRCLED_DIGIT_BASE + (n - 1));
  }
}
