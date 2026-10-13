import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { ToolbarModule } from 'primeng/toolbar';
import { Page } from '../../../../shared/components/page/page';
import {
  ActionClickEvent,
  ActionColumnConfig,
  ColumnConfig,
  SortEvent,
  PageEvent,
  Table,
} from '../../../../shared/components/table/table';
import { RoleService } from '../../../../core/auth/role.service';
import { ArticleDetail, ArticleListItem } from '../../data/articles-api';
import { ArticlesStore } from '../../articles-store';
import {
  ArtikelDialog,
  ArtikelDialogServerErrors,
  ArtikelFormResult,
  ArtikelFormValue,
} from '../../components/artikel-dialog/artikel-dialog';
import {
  ArticleStatusPopup,
  ArticleStatusValue,
  ArticleTimestampsChange,
} from '../../components/article-status-popup/article-status-popup';
// Cross-feature READ of another feature's data-layer, per spec.md's own framing ("hier nur
// lesend importiert"): the Brand/Category dropdown OPTIONS come straight from the Brands and
// Categories master-data lists (GET /api/brands, GET /api/categories), not from anything
// Articles-specific. `eslint-plugin-boundaries` disallows feature-to-feature imports by
// default with no built-in exception for this (checked `eslint.config.js`); the existing
// precedent for this exact situation is `sellers-page.spec.ts`'s
// `// eslint-disable-next-line boundaries/dependencies` importing `SellerTypesApi` from
// `features/seller-types/data/seller-types-api` — following that precedent here rather than
// disabling the rule project-wide or inventing a new policy exception.
// eslint-disable-next-line boundaries/dependencies
import { Brand, BrandsApi } from '../../../brands/data/brands-api';
// eslint-disable-next-line boundaries/dependencies
import { Category, CategoriesApi } from '../../../categories/data/categories-api';

const DEBOUNCE_MS = 300;
const DEFAULT_SORT = 'number:asc';

/** Row shape actually handed to `Table` — adds the derived German `statusLabel` (see
 * `STATUS_SEVERITY`'s doc comment above) on top of the raw `ArticleListItem` from the API. */
interface ArticleRow extends ArticleListItem {
  statusLabel: string;
}

const STATUS_OPTIONS: { label: string; value: string | null }[] = [
  { label: 'Alle', value: null },
  { label: 'Registriert', value: 'registered' },
  { label: 'Im Verkauf', value: 'selling' },
  { label: 'Verkauft', value: 'sold' },
  { label: 'Zurückgegeben', value: 'returned' },
];

const STATUS_LABELS: Record<string, string> = {
  registered: 'Registriert',
  selling: 'Im Verkauf',
  sold: 'Verkauft',
  returned: 'Zurückgegeben',
};

/**
 * Status -> badge severity mapping (no existing precedent in this codebase for Article status
 * colors specifically — chosen for a sensible success/info/warn/secondary spread across the
 * lifecycle): `registered` (not yet released) is neutral `secondary`, `selling` (active, the
 * "normal" state) is `info`, `sold` (successful outcome) is `success`, `returned` (needs seller
 * pickup) is `warn`.
 *
 * Round-15 Task 6 fix round 1: `Table`'s badge-column template renders whatever the column's
 * `field` points at verbatim (`toDisplayString`) — it has no label-mapping of its own (see
 * `Table`'s `resolveSeverity`/body template). The `status` column below therefore points its
 * `field` at the derived `statusLabel` (German), not the raw `status` (English enum value), the
 * same workaround `brands-page.ts`/`categories-page.ts` use for their `originalLabel` badge
 * column. `badgeSeverity` receives that same displayed value (the label), so this map is keyed
 * by the German label rather than the raw status — semantically it's still "derived from the raw
 * status", just pre-joined through the 1:1 `STATUS_LABELS` mapping instead of a second lookup at
 * render time.
 */
const STATUS_SEVERITY: Record<string, 'success' | 'info' | 'warn' | 'secondary'> = {
  [STATUS_LABELS['registered']]: 'secondary',
  [STATUS_LABELS['selling']]: 'info',
  [STATUS_LABELS['sold']]: 'success',
  [STATUS_LABELS['returned']]: 'warn',
};

interface ValidationProblemBody {
  errors?: Record<string, string[]>;
}

interface ProblemDetailsBody {
  errorCode?: string;
  detail?: string;
}

/**
 * Orchestration page for Round-15 "Artikel-Übersicht & Korrektur" (Task 6, wired up in the
 * Round-15 review fix) — replaces the Round-7 placeholder. Filterleiste is one framed
 * `p-toolbar` above the table: the free-text search (debounced, no sort-select/create button —
 * sort here comes from clicking column headers, and spec.md is explicit there's no create action
 * on this page) fills the remaining width, the Brand/Category/Status selects sit on the right
 * (immediate, no debounce). The table itself is `<app-table [lazy]="true">` (Round-15 Task 6 also
 * extended `Table` with this mode — see its class doc comment), driven by `ArticlesStore`
 * (Task 6), which resolves search/filter/sort/pagination entirely server-side.
 *
 * Aktionen / correction dialogs (review fix, following `sellers-page.ts`'s
 * `dialogVisible`/`editingCard`/`onDialogSave` orchestration pattern): the 8th spec column
 * ("Aktionen", spec.md "Tabelle") is `Table`'s `actionColumn` input, not an entry in `columns` —
 * mirrors why it's excluded from Multi-Sort ("alle außer Aktionsspalte sortierbar"). Every
 * authenticated user gets the "Bearbeiten" (pencil) action, opening `artikel-dialog` for the
 * Stammfelder (`PUT /api/articles/{id}` is `authenticated`, both roles may correct a typo per
 * api/articles.md §4). Only admins additionally get the "Status" (clock) action, opening
 * `article-status-popup` (`PUT /api/articles/{id}/timestamps` is `admin`-only) — this is how
 * spec.md's "Status-Badge für Kassenpersonal nicht klickbar" is realized: `Table`'s badge column
 * has no click handler of its own, so hiding the one actual entry point (the action button) for
 * non-admins is the equivalent lock. Both actions fetch the full `ArticleDetail`
 * (`ArticlesStore.getById`, review fix — the list row lacks size/color/description/raw
 * timestamps) before opening their dialog, exactly like `sellers-page.ts`'s `onEdit`.
 */
@Component({
  selector: 'app-articles-page',
  imports: [
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    SelectModule,
    ToolbarModule,
    Table,
    ArtikelDialog,
    ArticleStatusPopup,
    Page,
  ],
  templateUrl: './articles-page.html',
  styleUrl: './articles-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticlesPage {
  private readonly articlesStore = inject(ArticlesStore);
  private readonly brandsApi = inject(BrandsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  readonly isAdmin = this.roleService.isAdmin;

  /** `ArticlesStore.items` mapped to the derived `ArticleRow` shape `Table` actually renders —
   * see `ArticleRow`'s doc comment. */
  readonly items = computed<ArticleRow[]>(() =>
    this.articlesStore.items().map((item) => ({
      ...item,
      statusLabel: this.statusLabel(item.status),
    })),
  );
  readonly totalCount = this.articlesStore.totalCount;
  readonly pageSize = this.articlesStore.pageSize;
  readonly loading = this.articlesStore.loading;
  readonly filters = this.articlesStore.filters;

  readonly statusOptions = STATUS_OPTIONS;

  /** Local mirror of the free-text input for immediate UI feedback; debounced into the store. */
  readonly qInput = signal('');

  readonly brandOptions = signal<{ label: string; value: string | null }[]>([
    { label: 'Alle', value: null },
  ]);
  readonly categoryOptions = signal<{ label: string; value: string | null }[]>([
    { label: 'Alle', value: null },
  ]);

  readonly columns: ColumnConfig[] = [
    { field: 'number', header: 'Nr.', type: 'number', filterable: false },
    { field: 'name', header: 'Bezeichnung', type: 'text', filterable: false },
    { field: 'category', header: 'Kategorie', type: 'text', filterable: false },
    { field: 'brand', header: 'Marke', type: 'text', filterable: false },
    { field: 'price', header: 'Preis', type: 'currency', filterable: false },
    {
      // Points at the derived `statusLabel` (German), not the raw `status` (English enum value)
      // — see `STATUS_SEVERITY`'s doc comment above for why.
      field: 'statusLabel',
      header: 'Status',
      type: 'badge',
      filterable: false,
      badgeSeverity: (value) => STATUS_SEVERITY[value as string] ?? 'info',
      // "manuell"-Badge neben Status bei soldManually (spec.md) — a second, independent badge
      // sourced from the whole row rather than the `status` field itself; see `Table`'s
      // `ColumnConfig.secondaryBadge` doc comment for why this stays a caller-supplied hook
      // instead of Article-specific logic inside the shared component.
      secondaryBadge: (row) =>
        (row as ArticleRow).soldManually ? { text: 'manuell', severity: 'secondary' } : null,
    },
    { field: 'sellerName', header: 'Verkäufer', type: 'text', filterable: false },
  ];

  /** Spec's 8th column ("Aktionen") — see the class doc comment for why "Bearbeiten" is
   * available to every authenticated user while "Status" is admin-only. */
  readonly actionColumn = computed<ActionColumnConfig>(() => ({
    buttons: [
      { actionId: 'edit', icon: 'pi pi-pencil', tooltip: 'Bearbeiten' },
      ...(this.isAdmin()
        ? [{ actionId: 'status', icon: 'pi pi-clock', tooltip: 'Status' }]
        : []),
    ],
  }));

  // Edit dialog (artikel-dialog).
  readonly dialogVisible = signal(false);
  readonly editingRow = signal<ArticleListItem | null>(null);
  readonly editingDetail = signal<ArticleDetail | null>(null);
  readonly editLoading = signal(false);
  readonly saving = signal(false);
  readonly serverErrors = signal<ArtikelDialogServerErrors | null>(null);
  readonly deleteError = signal<string | null>(null);

  readonly dialogInitialValue = computed<ArtikelFormValue | null>(() => {
    const detail = this.editingDetail();
    if (!detail) return null;
    return {
      number: detail.number,
      name: detail.name,
      brand: detail.brand,
      category: detail.category,
      price: detail.price,
      size: detail.size,
      color: detail.color,
      description: detail.description,
    };
  });

  /** Gestaffelte Sperre (spec.md): `'sold'` disables only the price field, `'settled'`
   * disables everything. Client-side convenience only — the server is the actual authority
   * (`article.sold`/`settlement.locked`, see `artikel-dialog.ts`'s `locked` input doc). */
  readonly dialogLocked = computed<'none' | 'sold' | 'settled'>(() => {
    const detail = this.editingDetail();
    if (!detail) return 'none';
    if (detail.sellerSettledAt != null) return 'settled';
    if (detail.soldAt != null) return 'sold';
    return 'none';
  });

  // Status/timestamps popup (article-status-popup, admin-only).
  readonly statusPopupVisible = signal(false);
  readonly statusPopupDetail = signal<ArticleDetail | null>(null);
  readonly statusSaving = signal(false);

  readonly statusPopupValue = computed<ArticleStatusValue>(() => {
    const detail = this.statusPopupDetail();
    return {
      createdAt: detail?.createdAt ?? '',
      releasedAt: detail?.releasedAt ?? null,
      soldAt: detail?.soldAt ?? null,
      returnedAt: detail?.returnedAt ?? null,
    };
  });

  readonly statusPopupSettlementLocked = computed(
    () => this.statusPopupDetail()?.sellerSettledAt != null,
  );

  constructor() {
    this.articlesStore.load();
    this.loadBrandOptions();
    this.loadCategoryOptions();

    toObservable(this.qInput)
      .pipe(debounceTime(DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => {
        if (q === this.filters().q) return;
        this.articlesStore.setFilters({ q });
      });
  }

  onQInputChange(value: string): void {
    this.qInput.set(value);
  }

  onBrandChange(brand: string | null): void {
    // Per spec.md, Brand/Category/Status dropdown changes are immediate, no debounce —
    // matching sellers-page's status-dropdown precedent.
    this.articlesStore.setFilters({ brand });
  }

  onCategoryChange(category: string | null): void {
    this.articlesStore.setFilters({ category });
  }

  onStatusChange(status: string | null): void {
    this.articlesStore.setFilters({ status });
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status;
  }

  onSortChange(events: SortEvent[]): void {
    const sort =
      events.length === 0
        ? DEFAULT_SORT
        : events.map((e) => `${e.field}:${e.order}`).join(',');
    this.articlesStore.setFilters({ sort });
  }

  onPageChange(event: PageEvent): void {
    // Round-15 Task 6 fix round 1: the paginator's `rowsPerPageOptions` (hardcoded [10, 25, 50]
    // inside `Table`) lets a user pick a page size other than `ArticlesStore`'s fixed 50 — see
    // `ArticlesStore.setPageSize`'s doc comment. When the emitted `rows` differs from the
    // store's current `pageSize`, that's a page-SIZE change, not a page-NUMBER change: reload at
    // the new size (which itself resets to page 1) instead of also calling `setPage`, since the
    // old zero-based `event.page` was computed by `Table` against the OLD rows-per-page and would
    // point at the wrong page under the new size.
    if (event.rows !== this.pageSize()) {
      this.articlesStore.setPageSize(event.rows);
      return;
    }

    // `Table`'s `pageChange` is ZERO-BASED (Table.onPage/onLazyLoad: Math.floor(first / rows),
    // no +1) — unlike sellers-page's own PaginatorModule-based onPageChange, which does +1
    // itself. ArticlesStore.setPage is 1-based (matching the backend's 1-based `page` param,
    // same as SellersStore) — so +1 here, not in the store.
    this.articlesStore.setPage(event.page + 1);
  }

  onTableAction(event: ActionClickEvent<ArticleListItem>): void {
    if (event.actionId === 'edit') {
      this.onEdit(event.row);
      return;
    }
    if (event.actionId === 'status') {
      this.onStatusClick(event.row);
    }
  }

  onEdit(row: ArticleListItem): void {
    this.editingRow.set(row);
    this.editingDetail.set(null);
    this.serverErrors.set(null);
    this.deleteError.set(null);
    this.editLoading.set(true);

    this.articlesStore.getById(row.id).subscribe({
      next: (detail) => {
        this.editLoading.set(false);
        this.editingDetail.set(detail);
        this.dialogVisible.set(true);
      },
      error: () => {
        this.editLoading.set(false);
        this.editingRow.set(null);
        this.messageService.add({
          severity: 'error',
          summary: 'Artikel konnte nicht geladen werden',
          detail: 'Der Artikel wurde eventuell zwischenzeitlich gelöscht.',
        });
      },
    });
  }

  onDialogVisibleChange(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) {
      this.editingRow.set(null);
      this.editingDetail.set(null);
      this.serverErrors.set(null);
      this.deleteError.set(null);
    }
  }

  onDialogCancel(): void {
    this.dialogVisible.set(false);
    this.editingRow.set(null);
    this.editingDetail.set(null);
    this.serverErrors.set(null);
    this.deleteError.set(null);
  }

  onDialogSave(result: ArtikelFormResult): void {
    const editing = this.editingDetail();
    if (!editing) return;

    this.saving.set(true);
    this.articlesStore.update(editing.id, result).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogVisible.set(false);
        this.editingRow.set(null);
        this.editingDetail.set(null);
        this.serverErrors.set(null);
        this.messageService.add({ severity: 'success', summary: '✓ Artikel gespeichert' });
      },
      error: (error: unknown) => {
        this.saving.set(false);

        if (error instanceof HttpErrorResponse && error.status === 400) {
          this.serverErrors.set(this.fieldErrorsOf(error));
          return;
        }

        const code = this.errorCodeOf(error);
        if (code === 'article.sold') {
          this.messageService.add({
            severity: 'error',
            summary: 'Artikel bereits verkauft',
            detail: 'Der Preis kann nach dem Verkauf nicht mehr geändert werden.',
          });
          return;
        }
        if (code === 'settlement.locked') {
          this.messageService.add({
            severity: 'error',
            summary: 'Verkäufer bereits abgerechnet',
            detail: 'Ein Artikel eines abgerechneten Verkäufers kann nicht mehr geändert werden.',
          });
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Artikel konnte nicht gespeichert werden',
        });
      },
    });
  }

  onDeleteRequested(): void {
    const editing = this.editingDetail();
    if (!editing) return;

    this.articlesStore.remove(editing.id).subscribe({
      next: () => {
        this.dialogVisible.set(false);
        this.editingRow.set(null);
        this.editingDetail.set(null);
        this.deleteError.set(null);
        this.messageService.add({ severity: 'success', summary: '✓ Artikel gelöscht' });
      },
      error: (error: unknown) => {
        const code = this.errorCodeOf(error);
        if (code === 'article.sold' || code === 'settlement.locked') {
          this.deleteError.set(
            this.detailOf(error) ?? 'Artikel kann in diesem Zustand nicht gelöscht werden.',
          );
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Artikel konnte nicht gelöscht werden',
        });
      },
    });
  }

  onStatusClick(row: ArticleListItem): void {
    this.articlesStore.getById(row.id).subscribe({
      next: (detail) => {
        this.statusPopupDetail.set(detail);
        this.statusPopupVisible.set(true);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Artikel konnte nicht geladen werden',
          detail: 'Der Artikel wurde eventuell zwischenzeitlich gelöscht.',
        });
      },
    });
  }

  onStatusPopupVisibleChange(visible: boolean): void {
    this.statusPopupVisible.set(visible);
    if (!visible) {
      this.statusPopupDetail.set(null);
    }
  }

  onTimestampsChange(change: ArticleTimestampsChange): void {
    const detail = this.statusPopupDetail();
    if (!detail) return;

    this.statusSaving.set(true);
    this.articlesStore.updateTimestamps(detail.id, change).subscribe({
      next: () => {
        this.statusSaving.set(false);
        this.statusPopupVisible.set(false);
        this.statusPopupDetail.set(null);
        this.messageService.add({ severity: 'success', summary: '✓ Zeitstempel aktualisiert' });
      },
      error: (error: unknown) => {
        this.statusSaving.set(false);
        const code = this.errorCodeOf(error);
        if (code === 'settlement.locked') {
          this.messageService.add({
            severity: 'error',
            summary: 'Verkäufer bereits abgerechnet',
          });
          return;
        }
        if (code === 'article.sold_and_returned') {
          this.messageService.add({
            severity: 'error',
            summary: 'Ungültige Zeitstempel-Kombination',
            detail: 'Verkauft und zurückgegeben schließen sich aus.',
          });
          return;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Zeitstempel konnten nicht aktualisiert werden',
        });
      },
    });
  }

  private errorCodeOf(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) return undefined;
    return (error.error as ProblemDetailsBody | null)?.errorCode;
  }

  private detailOf(error: unknown): string | undefined {
    if (!(error instanceof HttpErrorResponse)) return undefined;
    return (error.error as ProblemDetailsBody | null)?.detail;
  }

  private fieldErrorsOf(error: HttpErrorResponse): ArtikelDialogServerErrors {
    const errors = (error.error as ValidationProblemBody | null)?.errors ?? {};
    const firstMessage = (key: string): string | undefined => errors[key]?.[0];
    return {
      name: firstMessage('name'),
      brand: firstMessage('brand'),
      category: firstMessage('category'),
      price: firstMessage('price'),
    };
  }

  private loadBrandOptions(): void {
    this.brandsApi.getAll().subscribe({
      next: (brands: Brand[]) => {
        this.brandOptions.set([
          { label: 'Alle', value: null },
          ...brands.map((b) => ({ label: b.name, value: b.name })),
        ]);
      },
    });
  }

  private loadCategoryOptions(): void {
    this.categoriesApi.getAll().subscribe({
      next: (categories: Category[]) => {
        this.categoryOptions.set([
          { label: 'Alle', value: null },
          ...categories.map((c) => ({ label: c.name, value: c.name })),
        ]);
      },
    });
  }
}
