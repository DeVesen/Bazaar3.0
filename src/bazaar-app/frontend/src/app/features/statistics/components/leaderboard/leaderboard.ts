import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { BadgeSeverity, ColumnConfig, SortEvent, Table } from '../../../../shared/components/table/table';
import { LeaderboardRow } from '../../data/statistics-api';

export type { LeaderboardRow };

/** Rang → PrimeNG-Badge-Severity (component.md AC-4): Gold/Silber/Bronze/Grau.
 * `'warn'` is the closest PrimeNG severity to a gold/amber accent (no literal "gold" value);
 * silver and the generic gray fallback both map to `'secondary'` (no 4th muted tone exists
 * in `BadgeSeverity`). */
function rankSeverity(rank: number): BadgeSeverity {
  if (rank === 1) return 'warn';
  if (rank === 2) return 'secondary';
  if (rank === 3) return 'contrast';
  return 'secondary';
}

/**
 * Verkäufer-Leaderboard (Round-22, Epic_Statistik). Leaf-ish component: receives the full,
 * already-loaded `rows()` from `StatisticsPage` and owns its OWN client-side re-sort — the
 * type-filter-triggered `GET /api/statistics?sellerTypeId=...` reload stays the parent's job
 * (spec.md: "kein erneuter Request bei Filter-Wechsel im Leaderboard außer dem serverseitigen
 * Typ-Filter-Parameter"). `rank` follows the CURRENTLY DISPLAYED order (component.md AC-3): it
 * is recomputed as `index + 1` on every read of `sortedRows`, never taken verbatim from the
 * backend value on `rows()` — sorting by e.g. "Umsatz" must put the top earner at Rang 1, not
 * whoever leads the backend's default sold-descending order.
 */
@Component({
  selector: 'app-leaderboard',
  imports: [Table],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Leaderboard {
  readonly rows = input.required<LeaderboardRow[]>();
  /** AC-4: hide the "Typ" column when a single type is selected upstream. */
  readonly typeColumnVisible = input<boolean>(true);

  private readonly sortState = signal<SortEvent[]>([]);

  readonly emptyText = 'Noch keine Verkäufe.';

  /** Default order (backend: sold descending) passes through untouched until the user sorts
   * by a column via `Table`'s `(sortChange)` output — `rows()` itself is never mutated. `rank`
   * is always reassigned from the resulting position (component.md AC-3), including in the
   * default (unsorted) case, so Rang 1 always matches row 0 of whatever is actually shown. */
  readonly sortedRows = computed<LeaderboardRow[]>(() => {
    const sort = this.sortState();
    const rows = this.rows();
    const ordered = sort.length === 0 ? rows : [...rows].sort((a, b) => this.compareBySort(a, b, sort));
    return ordered.map((row, index) => ({ ...row, rank: index + 1 }));
  });

  readonly columns = computed<ColumnConfig[]>(() => {
    const all: ColumnConfig[] = [
      {
        field: 'rank',
        header: 'Rang',
        type: 'badge',
        sortable: true,
        filterable: false,
        badgeSeverity: (value) => rankSeverity(value as number),
      },
      { field: 'sellerName', header: 'Verkäufer', type: 'text', sortable: true, filterable: false },
      { field: 'sellerType', header: 'Typ', type: 'text', sortable: true, filterable: false },
      { field: 'accepted', header: 'Angenommen', type: 'number', sortable: true, filterable: false },
      { field: 'sold', header: 'Verkauft', type: 'number', sortable: true, filterable: false },
      { field: 'revenue', header: 'Umsatz', type: 'currency', sortable: true, filterable: false },
      {
        field: 'payout',
        header: 'Auszahlung',
        type: 'currency',
        sortable: true,
        filterable: false,
        secondaryBadge: (row) =>
          (row as LeaderboardRow).settled ? { text: '✓', severity: 'success' } : null,
      },
    ];
    return this.typeColumnVisible() ? all : all.filter((c) => c.field !== 'sellerType');
  });

  onSortChange(sort: SortEvent[]): void {
    this.sortState.set(sort);
  }

  private compareBySort(a: LeaderboardRow, b: LeaderboardRow, sort: SortEvent[]): number {
    for (const { field, order } of sort) {
      const av = (a as unknown as Record<string, unknown>)[field];
      const bv = (b as unknown as Record<string, unknown>)[field];
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
      if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
    }
    return 0;
  }
}
