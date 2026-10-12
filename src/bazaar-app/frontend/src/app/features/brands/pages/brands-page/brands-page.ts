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
import { Brand } from '../../data/brands-api';
import { BrandsStore } from '../../brands-store';

const EMPTY_TEXT =
  'Noch keine Marken. Beim Import aus der Voranmelde-App werden sie mit übernommen.';
const NOT_FOUND_TEXT = 'Keine Marken gefunden.';

export type OriginalFilter = 'original' | 'new';

interface BrandRow extends Brand {
  originalLabel: string;
}

interface ProblemDetailsBody {
  errorCode?: string;
}

@Component({
  selector: 'app-brands-page',
  imports: [Table, MasterDataPopup, Page, ButtonModule],
  templateUrl: './brands-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandsPage {
  private readonly brandsStore = inject(BrandsStore);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  readonly loading = this.brandsStore.loading;
  readonly searchTerm = signal('');
  readonly originalFilter = signal<OriginalFilter | null>(null);
  readonly originalOptions: { label: string; value: OriginalFilter }[] = [
    { label: '✓ Original', value: 'original' },
    { label: 'Neu', value: 'new' },
  ];

  readonly emptyText = computed(() =>
    this.brandsStore.brands().length > 0 ? NOT_FOUND_TEXT : EMPTY_TEXT,
  );

  readonly popupVisible = signal(false);
  readonly popupMode = signal<'create' | 'edit'>('create');
  readonly editingBrand = signal<Brand | null>(null);
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

  readonly rows = computed<BrandRow[]>(() => {
    const term = this.searchTerm().toLocaleLowerCase();
    const originalFilter = this.originalFilter();
    const rows = this.brandsStore
      .brands()
      .filter(
        (brand) =>
          brand.name.toLocaleLowerCase().includes(term) &&
          (originalFilter === null || brand.original === (originalFilter === 'original')),
      )
      .map(
        (brand): BrandRow => ({
          ...brand,
          originalLabel: brand.original ? '✓ Original' : 'Neu',
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
    const brand = this.editingBrand();
    return brand ? { name: brand.name, original: brand.original } : null;
  });

  constructor() {
    this.brandsStore.load();
  }

  onSearchChange(value: string | null): void {
    this.searchTerm.set(value ?? '');
  }

  onOriginalChange(value: OriginalFilter | null | undefined): void {
    this.originalFilter.set(value ?? null);
  }

  onSortChange(sort: SortEvent[]): void {
    this.sortState.set(sort);
  }

  onRowAdd(): void {
    this.editingBrand.set(null);
    this.popupMode.set('create');
    this.popupVisible.set(true);
  }

  onActionClick(event: ActionClickEvent<BrandRow>): void {
    const brand: Brand = event.row;
    if (event.actionId === 'edit') {
      this.editingBrand.set(brand);
      this.popupMode.set('edit');
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.deleteBrand(brand);
    }
  }

  onPopupSave(result: MasterDataPopupResult): void {
    const editing = this.editingBrand();
    const onSuccess = (): void => {
      this.popupVisible.set(false);
      this.editingBrand.set(null);
      this.messageService.add({ severity: 'success', summary: '✓ Marke gespeichert' });
    };
    const onError = (error: unknown): void => {
      if (this.errorCodeOf(error) === 'brand.name_taken') {
        this.messageService.add({
          severity: 'error',
          summary: 'Name bereits vergeben',
          detail: 'Es existiert bereits eine Marke mit diesem Namen.',
        });
        return;
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Marke konnte nicht gespeichert werden',
      });
    };

    if (editing) {
      this.brandsStore
        .update(editing.id, result.name, result.original)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.brandsStore.create(result.name).subscribe({ next: onSuccess, error: onError });
    }
  }

  onPopupCancel(): void {
    this.popupVisible.set(false);
    this.editingBrand.set(null);
  }

  private deleteBrand(brand: Brand): void {
    this.brandsStore.remove(brand.id).subscribe({
      error: (error: unknown) => {
        if (this.errorCodeOf(error) === 'brand.in_use') {
          this.messageService.add({
            severity: 'error',
            summary: 'Marke wird noch verwendet',
            detail: 'Diese Marke ist noch Artikeln zugeordnet und kann nicht gelöscht werden.',
          });
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Marke konnte nicht gelöscht werden',
        });
      },
    });
  }

  private compareBySort(a: BrandRow, b: BrandRow, sort: SortEvent[]): number {
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
