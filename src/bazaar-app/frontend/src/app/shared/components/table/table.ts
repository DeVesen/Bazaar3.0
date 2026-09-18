import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
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
  badgeSeverity?: (value: unknown) => 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
}

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
 * KNOWN LIMITATION — no `[lazy]` mode (backend-driven pagination trap for future consumers):
 * `p-table` in table.html is bound WITHOUT `[lazy]="true"`. In that default (non-lazy) mode,
 * PrimeNG treats `[value]="data()"` as the COMPLETE dataset and re-slices it itself using its
 * own internal paginator/sort/filter state (`first`/`rows`). That is exactly what Brands
 * (the only Round-11 consumer) wants: it hands in the full, in-memory, unpaginated array and
 * `totalRecords` just falls back to `data().length`.
 *
 * It silently breaks for a FUTURE consumer that does backend-driven pagination — e.g. the
 * Artikel/Statistik lists referenced in component.md §2/§6/§7 — if that consumer passes only
 * the CURRENT PAGE's rows (`data()` = one server-fetched page, e.g. 10 rows) together with a
 * larger `totalRecords()` (e.g. 500) for the full server-side count. Without `[lazy]="true"`,
 * PrimeNG does not know `data()` is already page-scoped: on page 2+ it will try to re-slice
 * that small page-array using its own paginator offset (`first`), index out of range, and
 * render blank/wrong rows instead of the intended page — a purely functional bug with no
 * compile-time or template warning.
 *
 * Before wiring this component to any backend-paginated list, a future implementer MUST
 * either:
 *   (a) extend `Table` with a `[lazy]="true"` mode on `p-table`, driven by `(onLazyLoad)`
 *       instead of `(onPage)`, and make sure `sortChange`/`filterChange`/`pageChange` all
 *       emit from that lazy event so the parent can refetch the correct server page/sort/
 *       filter — the existing `onPage`/`onHeaderClick`/`onFilterValueChange` handlers assume
 *       PrimeNG already has the full dataset and are NOT sufficient as-is; or
 *   (b) not reuse this component for a backend-paginated list until (a) exists — keep
 *       feeding it the complete in-memory dataset (as Brands does today).
 * This is not covered by any of the 13 existing AC tests, which only exercise the in-memory
 * path; do not treat their passing as evidence this limitation is handled.
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
  /** Controls the "+ Neu" toolbar button (component.md §3) — the parent owns the permission check. */
  readonly canAdd = input<boolean>(false);
  /** Optional toolbar title (component.md §3 "Seitenüberschrift / Epic-Titel"). */
  readonly title = input<string | null>(null);

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
    const page = event.rows > 0 ? Math.floor(event.first / event.rows) : 0;
    this.pageChange.emit({ page, rows: event.rows });
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
