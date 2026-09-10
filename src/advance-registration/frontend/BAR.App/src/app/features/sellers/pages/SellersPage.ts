import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import {
  AppTable,
  ColumnConfig,
  ActionColumnConfig,
  ActionClickEvent,
  SortMeta,
  TablePageEvent
} from '../../../shared/table/table';
import { SellerCreateDialog } from '../../../shared/seller-create-dialog/seller-create-dialog';
import { SellerEditDialog } from '../../../shared/seller-edit-dialog/seller-edit-dialog';
import { SellersApiService, Seller } from '../sellers-api.service';

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

const COLUMNS: ColumnConfig<SellerRow>[] = [
  { field: 'startNumber', header: 'Nr.', type: 'number' },
  { field: 'firstName', header: 'Vorname', type: 'text' },
  { field: 'lastName', header: 'Nachname', type: 'text' },
  { field: 'postalCode', header: 'PLZ', type: 'text' },
  { field: 'city', header: 'Ort', type: 'text' },
  { field: 'sellerTypeName', header: 'Typ', type: 'text' },
  { field: 'commissionRate', header: 'Provision', type: 'number' },
  { field: 'itemFee', header: 'Gebühr', type: 'currency' },
  { field: 'articleCount', header: 'Artikel', type: 'number' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [
    { actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' },
    { actionId: 'delete', icon: 'pi pi-trash', ariaLabel: 'Löschen' }
  ]
};

// The table's sort fields are the flattened view-model names; only
// sellerTypeName needs translation to the nested API field the backend
// sorts on. commissionRate/itemFee are already flat on the backend too, so
// they fall through to their own field name (see SORT_FIELD_MAP[m.field] ?? m.field).
const SORT_FIELD_MAP: Record<string, string> = {
  sellerTypeName: 'sellerType.name'
};

@Component({
  selector: 'app-sellers-page',
  imports: [AppTable, FormsModule, InputTextModule, IconFieldModule, InputIconModule, ButtonModule, SellerCreateDialog, SellerEditDialog],
  template: `
    <h1>Verkäufer</h1>

    <p-iconfield>
      <p-inputicon class="pi pi-search" />
      <input pInputText placeholder="Suche Name/Ort/E-Mail..." [(ngModel)]="searchTermModel" (keydown.enter)="onSearch()" />
    </p-iconfield>
    <p-button label="Suchen" icon="pi pi-search" data-testid="search-button" (onClick)="onSearch()" />

    <app-table
      [columns]="COLUMNS"
      [data]="rows()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      [rows]="pageSize()"
      [first]="(page() - 1) * pageSize()"
      [actionColumn]="ACTION_COLUMN"
      [canAdd]="true"
      [lazy]="true"
      emptyText="Noch keine Verkäufer registriert."
      (rowAdd)="onRowAdd()"
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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly COLUMNS = COLUMNS;
  protected readonly ACTION_COLUMN = ACTION_COLUMN;

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
  readonly dialogMode = signal<DialogMode>(null);
  readonly selectedSeller = signal<Seller | null>(null);

  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly sort = signal<string | undefined>(undefined);

  get searchTermModel() { return this.searchTerm(); }
  set searchTermModel(v: string) { this.searchTerm.set(v); }

  get createDialogVisibleModel() { return this.dialogMode() === 'create'; }
  set createDialogVisibleModel(v: boolean) { if (!v) this.dialogMode.set(null); }

  get editDialogVisibleModel() { return this.dialogMode() === 'edit'; }
  set editDialogVisibleModel(v: boolean) { if (!v) this.dialogMode.set(null); }

  ngOnInit(): void {
    this.load();
  }

  onSearch(): void {
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
      message: `Verkäufer „${row.firstName} ${row.lastName}“ wirklich löschen? Löscht auch alle Artikel und Nummernblöcke.`,
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.deleteSeller(row)
    });
  }

  deleteSeller(row: SellerRow): void {
    this.sellersApi.delete(row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '✓ Verkäufer gelöscht' });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? 'Löschen fehlgeschlagen') : 'Löschen fehlgeschlagen'
        });
      }
    });
  }

  load(): void {
    this.loading.set(true);
    this.sellersApi
      .list({ search: this.searchTerm().trim() || undefined, page: this.page(), pageSize: this.pageSize(), sort: this.sort() })
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.sellers.set(result.items);
          this.totalRecords.set(result.totalCount);
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Verkäufer konnten nicht geladen werden' });
        }
      });
  }
}
