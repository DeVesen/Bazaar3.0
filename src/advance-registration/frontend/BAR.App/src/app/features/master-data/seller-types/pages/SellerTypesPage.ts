import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppTable, ColumnConfig, ActionColumnConfig, ActionClickEvent } from '@shared/table/table';
import { SellerTypePopup } from '../components/seller-type-popup';
import { SellerTypeApiService, SellerType, SellerTypePayload } from '../seller-type-api.service';

@Component({
  selector: 'app-seller-types-page',
  imports: [AppTable, SellerTypePopup, TranslatePipe],
  template: `
    <app-table
      [title]="'sellerTypes.title' | translate"
      [columns]="columns"
      [data]="sellerTypes()"
      [loading]="loading()"
      [actionColumn]="actionColumn"
      [canAdd]="true"
      [lazy]="false"
      [emptyText]="emptyText"
      (rowAdd)="openCreate()"
      (actionClick)="onTableAction($event)"
    />

    <app-seller-type-popup
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
  private readonly translate = inject(TranslateService);

  get columns(): ColumnConfig[] {
    return [
      { field: 'name', header: this.translate.instant('sellerTypes.columnName'), type: 'text' },
      { field: 'commissionRate', header: this.translate.instant('sellerTypes.columnCommissionRate'), type: 'number' },
      { field: 'itemFee', header: this.translate.instant('sellerTypes.columnItemFee'), type: 'currency' },
      { field: 'sellerCount', header: this.translate.instant('sellerTypes.columnSellerCount'), type: 'number' }
    ];
  }

  get actionColumn(): ActionColumnConfig {
    return {
      actions: [
        { actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: this.translate.instant('common.edit') },
        { actionId: 'delete', icon: 'pi pi-trash', ariaLabel: this.translate.instant('common.delete') }
      ]
    };
  }

  get emptyText(): string {
    return this.translate.instant('sellerTypes.emptyText');
  }

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
        this.messageService.add({ severity: 'error', summary: this.translate.instant('sellerTypes.loadError') });
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
      message: this.translate.instant('sellerTypes.confirmDelete', { name: row.name, sellerCount: row.sellerCount }),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => this.deleteType(row)
    });
  }

  deleteType(row: SellerType): void {
    this.sellerTypeApi.delete(row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('sellerTypes.deleted') });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? this.translate.instant('sellerTypes.inUse')) : this.translate.instant('sellerTypes.deleteFailed')
        });
      }
    });
  }

  onSaved(): void {
    this.load();
  }
}
