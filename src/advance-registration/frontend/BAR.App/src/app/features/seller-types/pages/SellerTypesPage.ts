import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppTable, ColumnConfig, ActionColumnConfig, ActionClickEvent } from '../../../shared/table/table';
import { TypPopup } from '../../../shared/typ-popup/typ-popup';
import { SellerTypeApiService, SellerType, SellerTypePayload } from '../seller-type-api.service';

const COLUMNS: ColumnConfig[] = [
  { field: 'name', header: 'Bezeichnung', type: 'text' },
  { field: 'commissionRate', header: 'Provision %', type: 'number' },
  { field: 'itemFee', header: 'Gebühr €', type: 'currency' },
  { field: 'sellerCount', header: 'Verkäufer', type: 'number' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [
    { actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' },
    { actionId: 'delete', icon: 'pi pi-trash', ariaLabel: 'Löschen' }
  ]
};

@Component({
  selector: 'app-seller-types-page',
  imports: [AppTable, TypPopup],
  template: `
    <app-table
      title="Verkäufer-Typen"
      [columns]="COLUMNS"
      [data]="sellerTypes()"
      [loading]="loading()"
      [actionColumn]="ACTION_COLUMN"
      [canAdd]="true"
      [lazy]="false"
      [emptyText]="emptyText"
      (rowAdd)="openCreate()"
      (actionClick)="onTableAction($event)"
    />

    <app-typ-popup
      [(visible)]="popupVisibleModel"
      [item]="popupItem()"
      [saveFn]="saveFn"
      (saved)="onSaved()"
    />
  `
})
export class SellerTypesPage implements OnInit {
  private readonly sellerTypeApi = inject(SellerTypeApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly COLUMNS = COLUMNS;
  protected readonly ACTION_COLUMN = ACTION_COLUMN;
  readonly emptyText = 'Noch keine Verkäufer-Typen. Ohne Typ ist keine Registrierung möglich — mit + Neu beginnen.';

  readonly sellerTypes = signal<SellerType[]>([]);
  readonly loading = signal(false);
  readonly popupVisible = signal(false);
  readonly popupItem = signal<SellerType | null>(null);

  readonly saveFn = (payload: SellerTypePayload, id: string | undefined) =>
    id ? this.sellerTypeApi.update(id, payload) : this.sellerTypeApi.create(payload);

  get popupVisibleModel() { return this.popupVisible(); }
  set popupVisibleModel(v: boolean) { this.popupVisible.set(v); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.sellerTypeApi.getAll().subscribe({
      next: (items) => {
        this.loading.set(false);
        this.sellerTypes.set(items);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Verkäufer-Typen konnten nicht geladen werden' });
      }
    });
  }

  openCreate(): void {
    this.popupItem.set(null);
    this.popupVisible.set(true);
  }

  onTableAction(event: ActionClickEvent<SellerType>): void {
    if (event.actionId === 'edit') {
      this.popupItem.set(event.row);
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  confirmDelete(row: SellerType): void {
    this.confirmationService.confirm({
      message: `Verkäufer-Typ „${row.name}“ wirklich löschen? Betrifft ${row.sellerCount} Verkäufer.`,
      acceptLabel: 'Löschen',
      rejectLabel: 'Abbrechen',
      accept: () => this.deleteType(row)
    });
  }

  deleteType(row: SellerType): void {
    this.sellerTypeApi.delete(row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '✓ Verkäufer-Typ gelöscht' });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? 'Verkäufer-Typ wird noch verwendet') : 'Löschen fehlgeschlagen'
        });
      }
    });
  }

  onSaved(): void {
    this.load();
  }
}
