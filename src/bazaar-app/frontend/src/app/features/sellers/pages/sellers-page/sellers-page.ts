import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { RoleService } from '../../../../core/auth/role.service';
import {
  CreateSellerRequest,
  SellerCard as SellerCardModel,
  SellerDetail,
  UpdateSellerRequest,
} from '../../data/sellers-api';
import { SellersStore } from '../../sellers-store';
import { SellerCard } from '../../components/seller-card/seller-card';
import {
  SellerDialogServerErrors,
  SellerFormResult,
  SellerFormValue,
  VerkaeuferDialog,
} from '../../components/verkaeufer-dialog/verkaeufer-dialog';
import { SellerDetailModal } from '../../components/seller-detail-modal/seller-detail-modal';
import { ReleaseDialog } from '../../components/release-dialog/release-dialog';

const DEBOUNCE_MS = 300;

const SORT_OPTIONS = [
  { label: 'Name', value: 'name' },
  { label: 'Angenommener Warenwert', value: 'acceptedValue' },
  { label: 'Offener Warenwert', value: 'openValue' },
  { label: 'Umsatz', value: 'revenue' },
];

const STATUS_OPTIONS: { label: string; value: string | null }[] = [
  { label: 'Alle', value: null },
  { label: 'Offen', value: 'open' },
  { label: 'Im Verkauf', value: 'selling' },
  { label: 'Abgerechnet', value: 'settled' },
];

const STATUS_LABELS: Record<string, string> = {
  open: 'Offen',
  selling: 'Im Verkauf',
  settled: 'Abgerechnet',
};

interface ValidationProblemBody {
  errors?: Record<string, string[]>;
}

interface ProblemDetailsBody {
  errorCode?: string;
  detail?: string;
}

/**
 * Orchestration page for Round-14 "Verkäufer-Stammdaten" (Task 10) — replaces the
 * Round-7 placeholder. Wires filter row, card grid, pagination, detail modal, edit/create
 * dialog and the settlement status popup on top of `SellersStore` (Task 6), `seller-card`
 * (Task 7), `verkaeufer-dialog` (Task 8) and `seller-detail-modal` (Task 9).
 *
 * Edit flow (Round-14 Task 10 fix round 1): `GET /api/sellers`'s `SellerCardDto` never
 * carried `email`/`address`/`phone`/`salesCommission`/`feePerItem`, so seeding the edit
 * dialog straight from the already-loaded card either left the Save button disabled
 * (empty required `email`) or, worse, silently blanked the seller's real `address`/`phone`
 * server-side on every save (`PUT /api/sellers/{id}` takes the full record, not a patch).
 * Fixed by adding a real `GET /api/sellers/{id}` endpoint: `onEdit` now calls
 * `SellersStore.getById(id)` first and only opens `verkaeufer-dialog` once the full
 * Stammdaten have arrived; a fetch error (e.g. the seller was deleted concurrently) toasts
 * and never opens the dialog.
 */
@Component({
  selector: 'app-sellers-page',
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    ChipModule,
    ConfirmDialogModule,
    DialogModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    PaginatorModule,
    SelectModule,
    SellerCard,
    VerkaeuferDialog,
    SellerDetailModal,
    ReleaseDialog,
  ],
  templateUrl: './sellers-page.html',
  styleUrl: './sellers-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellersPage {
  private readonly sellersStore = inject(SellersStore);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly items = this.sellersStore.items;
  readonly totalCount = this.sellersStore.totalCount;
  readonly page = this.sellersStore.page;
  readonly pageSize = this.sellersStore.pageSize;
  readonly loading = this.sellersStore.loading;
  readonly filters = this.sellersStore.filters;
  readonly isAdmin = this.roleService.isAdmin;

  readonly sortOptions = SORT_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  /** Local mirror of the free-text input for immediate UI feedback; debounced into the store. */
  readonly qInput = signal('');

  readonly hasActiveFilters = computed(
    () => this.filters().q !== '' || this.filters().status !== null,
  );

  readonly noSellersAtAll = computed(
    () => this.totalCount() === 0 && !this.loading() && !this.hasActiveFilters(),
  );

  readonly noResultsForFilter = computed(
    () => this.totalCount() === 0 && !this.loading() && this.hasActiveFilters(),
  );

  // Detail modal.
  readonly detailModalVisible = signal(false);
  readonly selectedCardForDetail = signal<SellerCardModel | null>(null);

  // Create/edit dialog.
  readonly dialogVisible = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly editingCard = signal<SellerCardModel | null>(null);
  readonly editingDetail = signal<SellerDetail | null>(null);
  readonly editLoading = signal(false);
  readonly saving = signal(false);
  readonly serverErrors = signal<SellerDialogServerErrors | null>(null);
  readonly deleteError = signal<string | null>(null);

  readonly dialogInitialValue = computed<SellerFormValue | null>(() => {
    const detail = this.editingDetail();
    if (!detail) return null;
    return this.buildEditInitialValue(detail);
  });

  // Status/settlement popup.
  readonly statusPopupVisible = signal(false);
  readonly statusPopupCard = signal<SellerCardModel | null>(null);

  readonly statusPopupLabel = computed(() => {
    const card = this.statusPopupCard();
    return card ? (STATUS_LABELS[card.status] ?? card.status) : '';
  });

  readonly statusPopupCanReset = computed(
    () => this.isAdmin() && this.statusPopupCard()?.settledAt != null,
  );

  // Freigeben-Popup (Round-18 Task 4).
  readonly releaseDialogVisible = signal(false);
  readonly releaseDialogSellerId = signal<string | null>(null);

  constructor() {
    this.sellersStore.load();

    toObservable(this.qInput)
      .pipe(debounceTime(DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        if (q === this.filters().q) return;
        this.sellersStore.setFilters({ q });
      });
  }

  onQInputChange(value: string): void {
    this.qInput.set(value);
  }

  onSortChange(sort: string): void {
    this.sellersStore.setFilters({ sort });
  }

  onStatusChange(status: string | null): void {
    // Per spec.md: "Status-Filter löst sofort ohne Debounce aus" — no debounce here.
    this.sellersStore.setFilters({ status });
  }

  clearQFilter(): void {
    this.qInput.set('');
    this.sellersStore.setFilters({ q: '' });
  }

  clearStatusFilter(): void {
    this.sellersStore.setFilters({ status: null });
  }

  resetAllFilters(): void {
    this.qInput.set('');
    this.sellersStore.setFilters({ q: '', status: null, sort: 'name' });
  }

  onPageChange(event: PaginatorState): void {
    const rows = event.rows ?? this.pageSize();
    const first = event.first ?? 0;
    const page = rows > 0 ? Math.floor(first / rows) + 1 : 1;
    this.sellersStore.setPage(page);
  }

  onScan(card: SellerCardModel): void {
    this.releaseDialogSellerId.set(card.id);
    this.releaseDialogVisible.set(true);
  }

  onReleaseDialogVisibleChange(visible: boolean): void {
    this.releaseDialogVisible.set(visible);
    if (!visible) {
      this.releaseDialogSellerId.set(null);
    }
  }

  onReleased(): void {
    this.sellersStore.load();
    this.messageService.add({ severity: 'success', summary: '✓ Artikel freigegeben' });
  }

  onCardClick(card: SellerCardModel): void {
    this.selectedCardForDetail.set(card);
    this.detailModalVisible.set(true);
  }

  onDetailModalVisibleChange(visible: boolean): void {
    this.detailModalVisible.set(visible);
    if (!visible) {
      this.selectedCardForDetail.set(null);
    }
  }

  onNewClick(): void {
    this.editingCard.set(null);
    this.editingDetail.set(null);
    this.dialogMode.set('create');
    this.serverErrors.set(null);
    this.deleteError.set(null);
    this.dialogVisible.set(true);
  }

  onEdit(card: SellerCardModel): void {
    this.editingCard.set(card);
    this.dialogMode.set('edit');
    this.serverErrors.set(null);
    this.deleteError.set(null);
    this.editingDetail.set(null);
    this.editLoading.set(true);

    this.sellersStore.getById(card.id).subscribe({
      next: (detail) => {
        this.editLoading.set(false);
        this.editingDetail.set(detail);
        this.dialogVisible.set(true);
      },
      error: () => {
        this.editLoading.set(false);
        this.editingCard.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Verkäufer konnte nicht geladen werden',
          detail: 'Der Verkäufer wurde eventuell zwischenzeitlich gelöscht.',
        });
      },
    });
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) {
      this.editingCard.set(null);
      this.editingDetail.set(null);
      this.serverErrors.set(null);
      this.deleteError.set(null);
    }
  }

  onDialogCancel(): void {
    this.dialogVisible.set(false);
    this.editingCard.set(null);
    this.editingDetail.set(null);
    this.serverErrors.set(null);
    this.deleteError.set(null);
  }

  onDialogSave(result: SellerFormResult): void {
    this.saving.set(true);
    const editing = this.editingCard();

    const onSuccess = (): void => {
      this.saving.set(false);
      this.dialogVisible.set(false);
      this.editingCard.set(null);
      this.editingDetail.set(null);
      this.serverErrors.set(null);
      this.messageService.add({ severity: 'success', summary: '✓ Verkäufer gespeichert' });
    };
    const onError = (error: unknown): void => {
      this.saving.set(false);

      if (error instanceof HttpErrorResponse && error.status === 400) {
        this.serverErrors.set(this.fieldErrorsOf(error));
        return;
      }

      const code = this.errorCodeOf(error);
      if (code === 'seller_type.not_found') {
        this.messageService.add({
          severity: 'error',
          summary: 'Verkäufer-Typ nicht gefunden',
          detail: 'Der gewählte Verkäufer-Typ existiert nicht (mehr).',
        });
        return;
      }
      if (code === 'seller.conditions_admin_only') {
        this.messageService.add({
          severity: 'error',
          summary: 'Konditionen nur durch Admin änderbar',
          detail: 'Provision und Gebühr/Stück dürfen nur von Admins geändert werden.',
        });
        return;
      }
      if (code === 'settlement.locked') {
        this.messageService.add({
          severity: 'error',
          summary: 'Verkäufer bereits abgerechnet',
          detail: 'Ein bereits abgerechneter Verkäufer kann nicht mehr geändert werden.',
        });
        return;
      }
      this.messageService.add({
        severity: 'error',
        summary: 'Verkäufer konnte nicht gespeichert werden',
      });
    };

    if (editing) {
      const request: UpdateSellerRequest = {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        sellerTypeId: result.sellerTypeId,
        address: result.address,
        postalCode: result.postalCode,
        city: result.city,
        phone: result.phone,
        salesCommission: result.salesCommission,
        feePerItem: result.feePerItem,
      };
      this.sellersStore.update(editing.id, request).subscribe({ next: onSuccess, error: onError });
    } else {
      const request: CreateSellerRequest = {
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        sellerTypeId: result.sellerTypeId,
        address: result.address,
        postalCode: result.postalCode,
        city: result.city,
        phone: result.phone,
      };
      this.sellersStore.create(request).subscribe({ next: onSuccess, error: onError });
    }
  }

  onDeleteRequested(): void {
    const editing = this.editingCard();
    if (!editing) return;

    this.sellersStore.remove(editing.id).subscribe({
      next: () => {
        this.dialogVisible.set(false);
        this.editingCard.set(null);
        this.editingDetail.set(null);
        this.deleteError.set(null);
        this.messageService.add({ severity: 'success', summary: '✓ Verkäufer gelöscht' });
      },
      error: (error: unknown) => {
        if (this.errorCodeOf(error) === 'seller.has_articles') {
          this.deleteError.set(
            this.detailOf(error) ?? 'Verkäufer hat noch Artikel und kann nicht gelöscht werden.',
          );
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Verkäufer konnte nicht gelöscht werden',
        });
      },
    });
  }

  onStatusClick(card: SellerCardModel): void {
    this.statusPopupCard.set(card);
    this.statusPopupVisible.set(true);
  }

  onStatusPopupVisibleChange(visible: boolean): void {
    this.statusPopupVisible.set(visible);
    if (!visible) {
      this.statusPopupCard.set(null);
    }
  }

  onResetSettlement(): void {
    const card = this.statusPopupCard();
    if (!card) return;

    this.confirmationService.confirm({
      key: 'resetSettlement',
      header: 'Abrechnung zurücksetzen',
      message: `Auszahlung vom ${this.formatDate(card.settledAt)} wird verworfen. Fortfahren?`,
      accept: () => {
        this.sellersStore.resetSettlement(card.id).subscribe({
          next: () => {
            this.statusPopupVisible.set(false);
            this.statusPopupCard.set(null);
            this.messageService.add({ severity: 'success', summary: '✓ Abrechnung zurückgesetzt' });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Abrechnung konnte nicht zurückgesetzt werden',
            });
          },
        });
      },
    });
  }

  private buildEditInitialValue(detail: SellerDetail): SellerFormValue {
    return {
      firstName: detail.firstName,
      lastName: detail.lastName,
      email: detail.email,
      sellerTypeId: detail.sellerTypeId,
      address: detail.address,
      postalCode: detail.postalCode,
      city: detail.city,
      phone: detail.phone,
      salesCommission: detail.salesCommission,
      feePerItem: detail.feePerItem,
    };
  }

  /**
   * Deliberately omits an explicit locale argument: the format string (`dd.MM.yyyy HH:mm`)
   * is digits-only and locale-independent, and instantiating `DatePipe` with a locale id
   * that has no registered locale data (this project registers none) throws `NG0701`.
   * The default `LOCALE_ID` (`en-US`, built into Angular) produces byte-identical output.
   */
  private formatDate(value: string | null): string {
    if (!value) return '';
    return new DatePipe('en-US').transform(value, 'dd.MM.yyyy HH:mm') ?? value;
  }

  private errorCodeOf(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) return undefined;
    return (error.error as ProblemDetailsBody | null)?.errorCode;
  }

  private detailOf(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) return undefined;
    return (error.error as ProblemDetailsBody | null)?.detail;
  }

  private fieldErrorsOf(error: HttpErrorResponse): SellerDialogServerErrors {
    const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
    const firstMessage = (key: string): string | undefined => errors[key]?.[0];
    return {
      firstName: firstMessage('firstName'),
      lastName: firstMessage('lastName'),
      email: firstMessage('email'),
      sellerTypeId: firstMessage('sellerTypeId'),
    };
  }
}
