import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AppTable, ColumnConfig, ActionColumnConfig, ActionClickEvent } from '@shared/table/table';
import { MasterDataPopup } from '@shared/master-data-popup/master-data-popup';
import { MasterDataFilterToolbar, MasterDataFilter } from '@shared/master-data-filter-toolbar/master-data-filter-toolbar';
import { MasterDataApiService, MasterDataItem } from '@features/master-data/master-data-api.service';

@Component({
  selector: 'app-categories-page',
  imports: [AppTable, MasterDataPopup, MasterDataFilterToolbar, TranslatePipe],
  template: `
    <app-master-data-filter-toolbar [showOriginalFilter]="true" [canAdd]="true" (filterChange)="onFilterChange($event)" (create)="openCreate()" />

    <app-table
      [columns]="columns"
      [data]="filteredCategories()"
      [loading]="loading()"
      [actionColumn]="actionColumn"
      [lazy]="false"
      (actionClick)="onTableAction($event)"
    />

    <app-master-data-popup
      [(visible)]="popupVisibleModel"
      [mode]="popupMode()"
      [entityLabel]="'categories.entityLabel' | translate"
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
  private readonly translate = inject(TranslateService);

  get columns(): ColumnConfig<MasterDataItem>[] {
    return [
      { field: 'name', header: this.translate.instant('categories.columnName'), type: 'text' },
      {
        field: 'original',
        header: this.translate.instant('categories.columnOriginal'),
        type: 'badge',
        badge: (r) =>
          r.original
            ? { label: this.translate.instant('categories.badgeOriginal'), severity: 'success' }
            : { label: this.translate.instant('categories.badgeNew'), severity: 'warn' }
      },
      { field: 'articleCount', header: this.translate.instant('categories.columnArticleCount'), type: 'number' }
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

  readonly categories = signal<MasterDataItem[]>([]);
  readonly loading = signal(false);
  readonly popupVisible = signal(false);
  readonly popupMode = signal<'create' | 'edit'>('create');
  readonly popupItem = signal<MasterDataItem | null>(null);
  readonly filter = signal<MasterDataFilter>({});

  readonly filteredCategories = computed(() => {
    const { search, original } = this.filter();
    return this.categories().filter(
      (c) =>
        (search === undefined || c.name.toLowerCase().includes(search.toLowerCase())) &&
        (original === undefined || c.original === original)
    );
  });

  readonly saveFn = (name: string, original: boolean | undefined, id: string | undefined) =>
    id ? this.masterDataApi.update('categories', id, { name, original: original ?? false }) : this.masterDataApi.create('categories', name);

  get popupVisibleModel() { return this.popupVisible(); }
  set popupVisibleModel(v: boolean) { this.popupVisible.set(v); }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.masterDataApi.getAll('categories').subscribe({
      next: (items) => {
        this.loading.set(false);
        this.categories.set(items);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: this.translate.instant('categories.loadError') });
      }
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
      message: this.translate.instant('categories.confirmDelete', { name: row.name }),
      acceptLabel: this.translate.instant('common.delete'),
      rejectLabel: this.translate.instant('common.cancel'),
      accept: () => this.deleteCategory(row)
    });
  }

  deleteCategory(row: MasterDataItem): void {
    this.masterDataApi.delete('categories', row.id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('categories.deleted') });
        this.load();
      },
      error: (err: { status?: number; error?: { detail?: string } }) => {
        this.messageService.add({
          severity: 'error',
          summary: err.status === 409 ? (err.error?.detail ?? this.translate.instant('categories.inUse')) : this.translate.instant('categories.deleteFailed')
        });
      }
    });
  }

  onSaved(): void {
    this.load();
  }

  onFilterChange(filter: MasterDataFilter): void {
    this.filter.set(filter);
  }
}
