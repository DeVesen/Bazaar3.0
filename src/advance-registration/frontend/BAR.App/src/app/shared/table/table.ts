import { Component, computed, input, output } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

export interface ColumnConfig<T = unknown> {
  field: string;
  header: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'badge';
  sortable?: boolean;
  badge?: (row: T) => { label: string; severity: 'success' | 'warn' | 'secondary' | 'info' | 'danger' };
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
  imports: [TableModule, ButtonModule, SkeletonModule, TagModule],
  styleUrl: './table.scss',
  template: `
    @if (title() || canAdd()) {
      <div class="app-table-toolbar">
        @if (title()) {
          <h2>{{ title() }}</h2>
        }
        @if (canAdd()) {
          <button
            pButton type="button" data-testid="add-button"
            (click)="rowAdd.emit()"
          >+ Neu</button>
        }
      </div>
    }
    <p-table
      [value]="data()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      [lazy]="lazy()"
      [paginator]="showPaginator()"
      [rows]="rows()"
      [first]="first()"
      [rowsPerPageOptions]="[10, 25, 50]"
      [sortMode]="'multiple'"
      [stripedRows]="true"
      [rowHover]="true"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Zeige {first} – {last} von {totalRecords} Einträgen"
      (onSort)="onSort($event)"
      (onPage)="onPage($event)"
    >
      <ng-template #header>
        <tr>
          @for (col of columns(); track col.field) {
            @if (col.sortable === false) {
              <th>{{ col.header }}</th>
            } @else {
              <th [pSortableColumn]="col.field">{{ col.header }} <p-sort-icon [field]="col.field" /></th>
            }
          }
          @if (actionColumn()) {
            <th></th>
          }
        </tr>
      </ng-template>
      <ng-template #body let-row>
        <tr>
          @for (col of columns(); track col.field) {
            <td [class.number]="col.type === 'number' || col.type === 'currency'">
              @if (col.type === 'badge' && col.badge) {
                <p-tag [value]="col.badge!(row).label" [severity]="col.badge!(row).severity" />
              } @else {
                {{ formatCell(col, row) }}
              }
            </td>
          }
          @if (actionColumn()) {
            <td class="actions">
              @for (action of actionColumn()!.actions; track action.actionId) {
                <button
                  pButton [text]="true" [rounded]="true"
                  [attr.aria-label]="action.ariaLabel" [attr.data-action-id]="action.actionId"
                  type="button"
                  (click)="actionClick.emit({ actionId: action.actionId, row })"
                >
                  <i [class]="action.icon"></i>
                </button>
              }
            </td>
          }
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="totalColumns()">
            <p class="empty-state">{{ hasActiveFilter() ? filteredEmptyText : emptyText() }}</p>
          </td>
        </tr>
      </ng-template>
      <ng-template #loadingbody>
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
  readonly columns = input.required<ColumnConfig<T>[]>();
  readonly data = input.required<T[]>();
  readonly totalRecords = input<number>(0);
  readonly loading = input<boolean>(false);
  readonly rows = input<number>(25);
  readonly first = input<number>(0);
  readonly actionColumn = input<ActionColumnConfig | null>(null);
  readonly emptyText = input<string>('Keine Einträge gefunden.');
  readonly hasActiveFilter = input<boolean>(false);
  readonly canAdd = input<boolean>(false);
  readonly title = input<string>('');
  readonly lazy = input<boolean>(true);

  readonly sortChange = output<SortMeta[]>();
  readonly pageChange = output<TablePageEvent>();
  readonly actionClick = output<ActionClickEvent<T>>();
  readonly rowAdd = output<void>();

  readonly filteredEmptyText = 'Keine Einträge für den gewählten Filter gefunden.';
  readonly skeletonRows = [0, 1, 2, 3, 4];

  readonly showPaginator = computed(() => this.totalRecords() > this.rows());
  readonly totalColumns = computed(() => this.columns().length + (this.actionColumn() ? 1 : 0));

  formatCell(col: ColumnConfig<T>, row: T): unknown {
    const value = (row as Record<string, unknown>)[col.field];
    if (col.type === 'currency' && typeof value === 'number') {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
    }
    return value;
  }

  onSort(event: PrimeNgSortEvent): void {
    const metas = event.multiSortMeta ?? (event.field ? [{ field: event.field, order: event.order ?? 1 }] : []);
    this.sortChange.emit(metas.map((m) => ({ field: m.field, order: m.order === 1 ? 'asc' : ('desc' as const) })));
  }

  onPage(event: PrimeNgPageEvent): void {
    this.pageChange.emit({ first: event.first, rows: event.rows });
  }
}
