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
  TypPopup,
  TypPopupInitialValue,
  TypPopupResult,
  TypPopupServerErrors,
} from '../../components/typ-popup/typ-popup';
import { SellerType } from '../../data/seller-types-api';
import { SellerTypesStore } from '../../seller-types-store';

const EMPTY_TEXT =
  'Noch keine Verkäufer-Typen. Ohne Typ kann kein Verkäufer angelegt werden — mit + Neu beginnen.';

interface ValidationProblemBody {
  errors?: Record<string, string[]>;
}

interface ProblemDetailsBody {
  errorCode?: string;
}

@Component({
  selector: 'app-seller-types-page',
  imports: [Table, TypPopup, Page, ButtonModule],
  templateUrl: './seller-types-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerTypesPage {
  private readonly sellerTypesStore = inject(SellerTypesStore);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  readonly loading = this.sellerTypesStore.loading;
  readonly emptyText = EMPTY_TEXT;

  readonly popupVisible = signal(false);
  readonly popupMode = signal<'create' | 'edit'>('create');
  readonly editingSellerType = signal<SellerType | null>(null);
  readonly saving = signal(false);
  readonly serverErrors = signal<TypPopupServerErrors | null>(null);
  private readonly sortState = signal<SortEvent[]>([]);

  readonly columns: ColumnConfig[] = [
    { field: 'name', header: 'Name', type: 'text', filterable: false },
    { field: 'commissionRate', header: 'Provision (%)', type: 'number', filterable: false },
    { field: 'itemFee', header: 'Gebühr', type: 'currency', filterable: false },
    { field: 'sellerCount', header: 'Verkäufer', type: 'number', filterable: false },
  ];

  readonly rows = computed<SellerType[]>(() => {
    const rows = this.sellerTypesStore.sellerTypes();
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

  readonly popupInitialValue = computed<TypPopupInitialValue | null>(() => {
    const sellerType = this.editingSellerType();
    return sellerType
      ? {
          name: sellerType.name,
          commissionRate: sellerType.commissionRate,
          itemFee: sellerType.itemFee,
        }
      : null;
  });

  constructor() {
    this.sellerTypesStore.load();
  }

  onSortChange(sort: SortEvent[]): void {
    this.sortState.set(sort);
  }

  onRowAdd(): void {
    this.editingSellerType.set(null);
    this.popupMode.set('create');
    this.serverErrors.set(null);
    this.popupVisible.set(true);
  }

  onActionClick(event: ActionClickEvent<SellerType>): void {
    const sellerType: SellerType = event.row;
    if (event.actionId === 'edit') {
      this.editingSellerType.set(sellerType);
      this.popupMode.set('edit');
      this.serverErrors.set(null);
      this.popupVisible.set(true);
    } else if (event.actionId === 'delete') {
      this.deleteSellerType(sellerType);
    }
  }

  onPopupSave(result: TypPopupResult): void {
    const editing = this.editingSellerType();
    this.saving.set(true);

    const onSuccess = (): void => {
      this.saving.set(false);
      this.popupVisible.set(false);
      this.editingSellerType.set(null);
      this.serverErrors.set(null);
      this.messageService.add({ severity: 'success', summary: '✓ Verkäufer-Typ gespeichert' });
    };
    const onError = (error: unknown): void => {
      this.saving.set(false);

      if (error instanceof HttpErrorResponse && error.status === 400) {
        this.serverErrors.set(this.fieldErrorsOf(error));
        return;
      }
      if (this.errorCodeOf(error) === 'seller_type.name_taken') {
        this.messageService.add({
          severity: 'error',
          summary: 'Name bereits vergeben',
          detail: 'Es existiert bereits ein Verkäufer-Typ mit diesem Namen.',
        });
        return;
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Verkäufer-Typ konnte nicht gespeichert werden',
      });
    };

    if (editing) {
      this.sellerTypesStore
        .update(editing.id, result.name, result.commissionRate, result.itemFee)
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.sellerTypesStore
        .create(result.name, result.commissionRate, result.itemFee)
        .subscribe({ next: onSuccess, error: onError });
    }
  }

  onPopupCancel(): void {
    this.popupVisible.set(false);
    this.editingSellerType.set(null);
    this.serverErrors.set(null);
  }

  private deleteSellerType(sellerType: SellerType): void {
    this.sellerTypesStore.remove(sellerType.id).subscribe({
      error: (error: unknown) => {
        if (this.errorCodeOf(error) === 'seller_type.in_use') {
          this.messageService.add({
            severity: 'error',
            summary: 'Verkäufer-Typ wird noch verwendet',
            detail:
              'Diesem Verkäufer-Typ sind noch Verkäufer zugeordnet und er kann nicht gelöscht werden.',
          });
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Verkäufer-Typ konnte nicht gelöscht werden',
        });
      },
    });
  }

  private compareBySort(a: SellerType, b: SellerType, sort: SortEvent[]): number {
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

  private fieldErrorsOf(error: HttpErrorResponse): TypPopupServerErrors {
    const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
    const firstMessage = (key: string): string | undefined => errors[key]?.[0];
    return {
      name: firstMessage('name'),
      commissionRate: firstMessage('commissionRate'),
      itemFee: firstMessage('itemFee'),
    };
  }
}
