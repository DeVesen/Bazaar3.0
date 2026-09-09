import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppTable, ColumnConfig, ActionColumnConfig, ActionClickEvent } from '../../../shared/table/table';
import { StammdatenPopup } from '../../../shared/stammdaten-popup/stammdaten-popup';
import { MasterDataApiService, MasterDataItem } from '../../my-articles/master-data-api.service';

const COLUMNS: ColumnConfig<MasterDataItem>[] = [
  { field: 'name', header: 'Name', type: 'text' },
  { field: 'original', header: 'Original', type: 'badge', badge: (r) => (r.original ? { label: '✓ Original', severity: 'success' } : { label: 'Neu', severity: 'warn' }) },
  { field: 'articleCount', header: 'Artikel', type: 'number' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [
    { actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: 'Bearbeiten' },
    { actionId: 'delete', icon: 'pi pi-trash', ariaLabel: 'Löschen' }
  ]
};

@Component({
  selector: 'app-categories-page',
  imports: [AppTable, StammdatenPopup],
  template: `
    <app-table
      title="Kategorien"
      [columns]="COLUMNS"
      [data]="categories()"
      [loading]="loading()"
      [actionColumn]="ACTION_COLUMN"
      [canAdd]="true"
      [lazy]="false"
      (rowAdd)="openCreate()"
      (actionClick)="onTableAction($event)"
    />

    <app-stammdaten-popup
      [(visible)]="popupVisibleModel"
      [mode]="popupMode()"
      entityLabel="Kategorie"
      [item]="popupItem()"
      [saveFn]="saveFn"
      (saved)="onSaved()"
    />
  `
})
export class CategoriesPage implements OnInit {
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly COLUMNS = COLUMNS as ColumnConfig[];
  protected readonly ACTION_COLUMN = ACTION_COLUMN;

  readonly categories = signal<MasterDataItem[]>([]);
  readonly loading = signal(false);
  readonly popupVisible = signal(false);
  readonly popupMode = signal<'create' | 'edit'>('create');
  readonly popupItem = signal<MasterDataItem | null>(null);

  readonly saveFn = (name: string, original: boolean | undefined, id: string | undefined) =>
    id ? this.masterDataApi.update('categories', id, { name, original: original ?? false }) : this.masterDataApi.create('categories', name);

  get popupVisibleModel() { return this.popupVisible(); }
  set popupVisibleModel(v: boolean) { this.popupVisible.set(v); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.masterDataApi.getAll('categories').subscribe((items) => {
      this.categories.set(items);
      this.loading.set(false);
    });
  }

  openCreate(): void {
    this.popupMode.set('create');
    this.popupItem.set(null);
    this.popupVisible.set(true);
  }

  onTableAction(event: ActionClickEvent<MasterDataItem>): void {
    if (event.actionId === 'edit') {
      this.popupMode.set('edit');
      this.popupItem.set(event.row);
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  confirmDelete(row: MasterDataItem): void {
    this.confirmationService.confirm({
      message: `Kategorie „${row.name}" wirklich löschen?`,
      accept: () => this.deleteCategory(row)
    });
  }

  deleteCategory(row: MasterDataItem): void {
    this.masterDataApi.delete('categories', row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: '✓ Kategorie gelöscht' });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? 'Kategorie wird noch verwendet') : 'Löschen fehlgeschlagen'
        });
      }
    });
  }

  onSaved(): void {
    this.load();
  }
}
