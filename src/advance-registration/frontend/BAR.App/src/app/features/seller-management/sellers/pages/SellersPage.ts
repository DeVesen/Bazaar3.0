import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import {
  AppTable,
  ColumnConfig,
  ActionColumnConfig,
  ActionClickEvent,
  SortMeta,
  TablePageEvent
} from '@shared/table/table';
import { FilterPanel, FilterPanelSearch } from '@shared/filter-panel/filter-panel';
import { SellerCreateDialog } from '../components/seller-create-dialog';
import { SellerEditDialog } from '../components/seller-edit-dialog';
import { SellersApiService, Seller } from '../sellers-api.service';
import { SellerTypeOptionsApiService, SellerTypeOption } from '../../seller-type-options-api.service';

/**
 * Flattened view-model for the table: AppTable.formatCell only does a plain
 * property lookup (row[col.field]), it does not walk dot-paths like
 * "sellerType.name". So the nested Provision/Gebühr/Typ values from
 * Seller.sellerType are hoisted onto top-level fields here for display.
 */
export type SellerRow = Seller & {
  sellerTypeName: string;
  commissionRate: number;
  itemFee: number;
};

export type DialogMode = 'create' | 'edit' | null;

// The table's sort fields are the flattened view-model names; only
// sellerTypeName needs translation to the nested API field the backend
// sorts on. commissionRate/itemFee are already flat on the backend too, so
// they fall through to their own field name (see SORT_FIELD_MAP[m.field] ?? m.field).
const SORT_FIELD_MAP: Record<string, string> = {
  sellerTypeName: 'sellerType.name'
};

@Component({
  selector: 'app-sellers-page',
  imports: [AppTable, FilterPanel, SellerCreateDialog, SellerEditDialog],
  template: `
    <app-filter-panel
      [sellerTypeOptions]="sellerTypeOptions()"
      [canAdd]="true"
      (search)="onFilterSearch($event)"
      (create)="onRowAdd()"
    />

    <app-table
      [columns]="columns"
      [data]="rows()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      [rows]="pageSize()"
      [first]="(page() - 1) * pageSize()"
      [actionColumn]="actionColumn"
      [lazy]="true"
      [emptyText]="emptyText"
      (actionClick)="onTableAction($event)"
      (sortChange)="onSortChange($event)"
      (pageChange)="onPageChange($event)"
    />

    @if (dialogMode() === 'create') {
      <app-seller-create-dialog [(visible)]="createDialogVisibleModel" (saved)="onCreateSaved()" />
    }

    @if (dialogMode() === 'edit') {
      <app-seller-edit-dialog [(visible)]="editDialogVisibleModel" [item]="selectedSeller()" (saved)="onEditSaved()" />
    }
  `
})
export class SellersPage implements OnInit {
  private readonly sellersApi = inject(SellersApiService);
  private readonly sellerTypeOptionsApi = inject(SellerTypeOptionsApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  get columns(): ColumnConfig<SellerRow>[] {
    return [
      { field: 'startNumber', header: this.translate.instant('sellers.columnStartNumber'), type: 'number' },
      { field: 'firstName', header: this.translate.instant('sellers.columnFirstName'), type: 'text' },
      { field: 'lastName', header: this.translate.instant('sellers.columnLastName'), type: 'text' },
      { field: 'postalCode', header: this.translate.instant('sellers.columnPostalCode'), type: 'text' },
      { field: 'city', header: this.translate.instant('sellers.columnCity'), type: 'text' },
      { field: 'sellerTypeName', header: this.translate.instant('sellers.columnSellerType'), type: 'text' },
      { field: 'commissionRate', header: this.translate.instant('sellers.columnCommissionRate'), type: 'number' },
      { field: 'itemFee', header: this.translate.instant('sellers.columnItemFee'), type: 'currency' },
      { field: 'articleCount', header: this.translate.instant('sellers.columnArticleCount'), type: 'number' }
    ];
  }

  get actionColumn(): ActionColumnConfig<SellerRow> {
    return {
      actions: [
        { actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: this.translate.instant('common.edit') },
        {
          actionId: 'delete',
          icon: 'pi pi-trash',
          ariaLabel: this.translate.instant('common.delete'),
          hidden: (row: SellerRow) => !row.canDelete
        }
      ]
    };
  }

  get emptyText(): string {
    return this.translate.instant('sellers.emptyText');
  }

  readonly sellers = signal<Seller[]>([]);
  readonly rows = computed<SellerRow[]>(() =>
    this.sellers().map((s) => ({
      ...s,
      sellerTypeName: s.sellerType?.name ?? '',
      commissionRate: s.sellerType?.commissionRate ?? 0,
      itemFee: s.sellerType?.itemFee ?? 0
    }))
  );
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly searchTerm = signal('');
  readonly sellerTypeId = signal<string | undefined>(undefined);
  readonly sellerTypeOptions = signal<SellerTypeOption[]>([]);
  readonly dialogMode = signal<DialogMode>(null);
  readonly selectedSeller = signal<Seller | null>(null);

  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly sort = signal<string | undefined>(undefined);

  get createDialogVisibleModel() { return this.dialogMode() === 'create'; }
  set createDialogVisibleModel(v: boolean) { if (!v) this.dialogMode.set(null); }

  get editDialogVisibleModel() { return this.dialogMode() === 'edit'; }
  set editDialogVisibleModel(v: boolean) { if (!v) this.dialogMode.set(null); }

  ngOnInit(): void {
    this.sellerTypeOptionsApi.getAll().subscribe((options) => this.sellerTypeOptions.set(options));
    this.load();
  }

  onFilterSearch(event: FilterPanelSearch): void {
    this.searchTerm.set(event.search ?? '');
    this.sellerTypeId.set(event.sellerTypeId);
    this.page.set(1);
    this.load();
  }

  onRowAdd(): void {
    this.selectedSeller.set(null);
    this.dialogMode.set('create');
  }

  onCreateSaved(): void {
    this.dialogMode.set(null);
    this.load();
  }

  onEditSaved(): void {
    this.dialogMode.set(null);
    this.load();
  }

  onTableAction(event: ActionClickEvent<SellerRow>): void {
    if (event.actionId === 'edit') {
      this.selectedSeller.set(event.row);
      this.dialogMode.set('edit');
    } else if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  onPageChange(event: TablePageEvent): void {
    this.page.set(Math.floor(event.first / event.rows) + 1);
    this.pageSize.set(event.rows);
    this.load();
  }

  onSortChange(event: SortMeta[]): void {
    this.sort.set(
      event.length ? event.map((m) => `${SORT_FIELD_MAP[m.field] ?? m.field}:${m.order}`).join(',') : undefined
    );
    this.load();
  }

  confirmDelete(row: SellerRow): void {
    this.confirmationService.confirm({
      message: this.translate.instant('sellers.confirmDelete', { firstName: row.firstName, lastName: row.lastName }),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => this.deleteSeller(row)
    });
  }

  deleteSeller(row: SellerRow): void {
    this.sellersApi.delete(row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('sellers.deleted') });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? this.translate.instant('sellers.deleteFailed')) : this.translate.instant('sellers.deleteFailed')
        });
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.sellersApi
      .list({
        sellerTypeId: this.sellerTypeId(),
        search: this.searchTerm().trim() || undefined,
        page: this.page(),
        pageSize: this.pageSize(),
        sort: this.sort()
      })
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.sellers.set(result.items);
          this.totalRecords.set(result.totalCount);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({ severity: 'error', summary: this.translate.instant('sellers.loadError') });
        }
      });
  }
}
