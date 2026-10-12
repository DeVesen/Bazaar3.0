import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Page } from '../../../../shared/components/page/page';
import { RoleService } from '../../../../core/auth/role.service';
import {
  ActionClickEvent,
  ActionColumnConfig,
  ColumnConfig,
  SortEvent,
  Table,
} from '../../../../shared/components/table/table';
import {
  MasterDataPopup,
  MasterDataPopupInitialValue,
  MasterDataPopupResult,
} from '../../../../shared/components/master-data-popup/master-data-popup';
import { Category } from '../../data/categories-api';
import { CategoriesStore } from '../../categories-store';

const EMPTY_TEXT =
  'Noch keine Kategorien. Beim Import aus der Voranmelde-App werden sie mit übernommen.';
const NO_RESULTS_TEXT = 'Keine Kategorien gefunden.';

export type OriginalFilterValue = 'original' | 'new';

interface CategoryRow extends Category {
  originalLabel: string;
}

interface ProblemDetailsBody {
  errorCode?: string;
}

@Component({
  selector: 'app-categories-page',
  imports: [Table, MasterDataPopup, Page, ButtonModule],
  templateUrl: './categories-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  readonly loading = this.categoriesStore.loading;
  readonly originalOptions: { label: string; value: OriginalFilterValue }[] = [
    { label: '✓ Original', value: 'original' },
    { label: 'Neu', value: 'new' },
  ];

  readonly searchTerm = signal('');
  readonly originalFilter = signal<OriginalFilterValue | null>(null);

  private readonly filterActive = computed(
    () => this.searchTerm() !== '' || this.originalFilter() !== null,
  );

  readonly emptyText = computed(() =>
    this.filterActive() && this.categoriesStore.categories().length > 0
      ? NO_RESULTS_TEXT
      : EMPTY_TEXT,
  );

  readonly popupVisible = signal(false);
  readonly popupMode = signal<'create' | 'edit'>('create');
  readonly editingCategory = signal<Category | null>(null);
  private readonly sortState = signal<SortEvent[]>([]);

  readonly columns: ColumnConfig[] = [
    { field: 'id', header: 'ID', type: 'text', filterable: false },
    { field: 'name', header: 'Name', type: 'text', filterable: false },
    {
      field: 'originalLabel',
      header: 'Original',
      type: 'badge',
      badgeSeverity: (value) => (value === '✓ Original' ? 'success' : 'warn'),
      filterable: false,
    },
    { field: 'articleCount', header: 'Artikel', type: 'number', filterable: false },
  ];

  readonly rows = computed<CategoryRow[]>(() => {
    const term = this.searchTerm().toLowerCase();
    const originalFilter = this.originalFilter();
    const rows = this.categoriesStore
      .categories()
      .filter((category) => category.name.toLowerCase().includes(term))
      .filter(
        (category) => originalFilter === null || category.original === (originalFilter === 'original'),
      )
      .map(
        (category): CategoryRow => ({
          ...category,
          originalLabel: category.original ? '✓ Original' : 'Neu',
        }),
      );
    const sort = this.sortState();
    return sort.length === 0 ? rows : [...rows].sort((a, b) => this.compareBySort(a, b, sort));
  });

  readonly actionColumn = computed<ActionColumnConfig | null>(() =>
    this.roleService.isAdmin()
      ? {
          buttons: [
            { actionId: 'edit', icon: 'pi pi-pencil', tooltip: 'Bearbeiten' },
            { actionId: 'delete', icon: 'pi pi-trash', tooltip: 'Löschen' },
          ],
        }
      : null,
  );

  readonly canAdd = computed(() => this.roleService.isAdmin());

  readonly popupInitialValue = computed<MasterDataPopupInitialValue | null>(() => {
    const category = this.editingCategory();
    return category ? { name: category.name, original: category.original } : null;
  });

  constructor() {
    this.categoriesStore.load();
  }

  onSortChange(sort: SortEvent[]): void {
    this.sortState.set(sort);
  }

  onSearchChange(value: string | null): void {
    this.searchTerm.set(value ?? '');
  }

  onOriginalFilterChange(value: OriginalFilterValue | null): void {
    this.originalFilter.set(value);
  }

  onRowAdd(): void {
    this.editingCategory.set(null);
    this.popupMode.set('create');
    this.popupVisible.set(true);
  }

  onActionClick(event: ActionClickEvent<CategoryRow>): void {
    const category: Category = event.row;
    if (event.actionId === 'edit') {
      this.editingCategory.set(category);
      this.popupMode.set('edit');
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.deleteCategory(category);
    }
  }

  onPopupSave(result: MasterDataPopupResult): void {
    const editing = this.editingCategory();
    const onSuccess = (): void => {
      this.popupVisible.set(false);
      this.editingCategory.set(null);
      this.messageService.add({ severity: 'success', summary: '✓ Kategorie gespeichert' });
    };
    const onError = (error: unknown): void => {
      if (this.errorCodeOf(error) === 'category.name_taken') {
        this.messageService.add({
          severity: 'error',
          summary: 'Name bereits vergeben',
          detail: 'Es existiert bereits eine Kategorie mit diesem Namen.',
        });
        return;
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Kategorie konnte nicht gespeichert werden',
      });
    };

    if (editing) {
      this.categoriesStore
        .update(editing.id, result.name, result.original)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.categoriesStore.create(result.name).subscribe({ next: onSuccess, error: onError });
    }
  }

  onPopupCancel(): void {
    this.popupVisible.set(false);
    this.editingCategory.set(null);
  }

  private deleteCategory(category: Category): void {
    this.categoriesStore.remove(category.id).subscribe({
      error: (error: unknown) => {
        if (this.errorCodeOf(error) === 'category.in_use') {
          this.messageService.add({
            severity: 'error',
            summary: 'Kategorie wird noch verwendet',
            detail:
              'Diese Kategorie ist noch Artikeln zugeordnet und kann nicht gelöscht werden.',
          });
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Kategorie konnte nicht gelöscht werden',
        });
      },
    });
  }

  private compareBySort(a: CategoryRow, b: CategoryRow, sort: SortEvent[]): number {
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

  private errorCodeOf(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) return undefined;
    return (error.error as ProblemDetailsBody | null)?.errorCode;
  }
}
