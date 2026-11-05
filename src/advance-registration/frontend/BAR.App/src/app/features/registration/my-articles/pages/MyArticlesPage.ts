import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MenuItem, MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ArticlesApiService, ArticleListQuery, ArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../../master-data-api.service';
import { ArticleDialog } from '../components/article-dialog';
import { AppTable, ActionClickEvent, ActionColumnConfig, ColumnConfig, SortMeta, TablePageEvent } from '@shared/table/table';
import { FilterPanel, FilterPanelSearch } from '@shared/filter-panel/filter-panel';
import { ArticlesImportExportApiService, ImportRowError } from '../articles-import-export-api.service';
import { ImportResultDialog, ImportResultData } from '../components/import-result-dialog';
import { MyArticlesPrint } from '../components/my-articles-print';
import { PrintService } from '@core/print/print.service';
import { AuthService } from '@core/auth/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-my-articles-page',
  imports: [FilterPanel, AppTable, ArticleDialog, ImportResultDialog, ButtonModule, TranslatePipe],
  template: `
    <app-filter-panel
      [brands]="brands()"
      [categories]="categories()"
      [canAdd]="true"
      [createLabel]="'myArticles.createButton' | translate"
      [splitButtonItems]="importExportMenuItems"
      (search)="onFilterSearch($event)"
      (create)="openCreateDialog()"
    >
      <p-button
        filterPanelEnd
        data-testid="print-button"
        icon="pi pi-print"
        severity="secondary"
        [outlined]="true"
        [label]="'myArticles.print.button' | translate"
        [ariaLabel]="'myArticles.print.button' | translate"
        [loading]="printing()"
        [disabled]="isEmpty() || printing()"
        (onClick)="onPrint()"
      />
    </app-filter-panel>

    <input #fileInput type="file" accept=".csv,.xlsx" style="display: none" (change)="onFileSelected($event)" />

    @if (isEmpty() && !hasActiveFilter() && !loading()) {
      <p>{{ 'myArticles.emptyTextPrefix' | translate }}<strong>{{ 'myArticles.createButton' | translate }}</strong>{{ 'myArticles.emptyTextSuffix' | translate }}</p>
    } @else {
      <app-table
        [columns]="columns"
        [data]="articles()"
        [totalRecords]="totalRecords()"
        [loading]="loading()"
        [rows]="pageSize()"
        [first]="(page() - 1) * pageSize()"
        [actionColumn]="actionColumn"
        [hasActiveFilter]="hasActiveFilter()"
        (sortChange)="onTableSort($event)"
        (pageChange)="onTablePage($event)"
        (actionClick)="onTableAction($event)"
      />
    }

    <app-article-dialog
      [(visible)]="dialogVisibleModel"
      [mode]="dialogMode()"
      [article]="dialogArticle()"
      [initialNumber]="dialogNextNumber()"
      [brands]="brands()"
      [categories]="categories()"
      (saved)="onSaved()"
      (deleted)="onSaved()"
      (brandCreated)="onBrandCreated($event)"
      (categoryCreated)="onCategoryCreated($event)"
    />

    <app-import-result-dialog
      [(visible)]="importDialogVisibleModel"
      [result]="importResult()"
      (visibleChange)="onImportDialogClosed($event)"
    />
  `
})
export class MyArticlesPage implements OnInit {
  private readonly articlesApi = inject(ArticlesApiService);
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly importExportApi = inject(ArticlesImportExportApiService);
  private readonly printService = inject(PrintService);
  private readonly authService = inject(AuthService);
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');

  readonly importDialogVisible = signal(false);
  readonly importResult = signal<ImportResultData | null>(null);

  get importDialogVisibleModel() { return this.importDialogVisible(); }
  set importDialogVisibleModel(v: boolean) { this.importDialogVisible.set(v); }

  get importExportMenuItems(): MenuItem[] {
    return [
      { label: this.translate.instant('myArticles.importExport.import'), icon: 'pi pi-upload', command: () => this.triggerImport() },
      { separator: true },
      { label: this.translate.instant('myArticles.importExport.export'), icon: 'pi pi-download', command: () => this.onExport() },
      { separator: true },
      { label: this.translate.instant('myArticles.importExport.template'), icon: 'pi pi-file', command: () => this.onTemplate() }
    ];
  }

  readonly printing = signal(false);

  /**
   * Druckt die Liste so, wie sie gerade gefiltert und sortiert ist — alle Treffer, nicht nur die
   * angezeigte Seite. Die Daten werden frisch geladen, damit der Druck nicht von der Seitengröße
   * der Tabelle abhängt.
   */
  onPrint(): void {
    this.printing.set(true);
    this.articlesApi.getAllMine({ sort: this.sort(), ...this.filters() }).subscribe({
      next: (articles) => {
        this.printing.set(false);
        this.printService.print(MyArticlesPrint, (ref) =>
          ref.setInput('model', {
            articles,
            owner: this.authService.currentUser()?.sub ?? '',
            filterText: this.describeFilters(),
            printedAt: new Date()
          })
        );
      },
      error: () => {
        this.printing.set(false);
        this.messageService.add({ severity: 'error', summary: this.translate.instant('myArticles.print.error') });
      }
    });
  }

  private describeFilters(): string {
    const f = this.filters();
    return [
      f.category ? `${this.translate.instant('myArticles.columnCategory')}: ${f.category}` : null,
      f.brand ? `${this.translate.instant('myArticles.columnBrand')}: ${f.brand}` : null,
      f.search ? `${this.translate.instant('myArticles.print.search')}: ${f.search}` : null
    ].filter((part): part is string => part !== null).join(' · ');
  }

  triggerImport(): void {
    this.fileInput()?.nativeElement.click();
  }

  onImportDialogClosed(visible: boolean): void {
    this.importDialogVisible.set(visible);
    if (!visible && this.importResult()?.kind === 'success') {
      this.loadArticles();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.importExportApi.import(file).subscribe({
      next: (summary) => {
        this.importResult.set({ kind: 'success', summary });
        this.importDialogVisible.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.importResult.set(
          err.status === 422
            ? { kind: 'rowErrors', errors: (err.error?.errors ?? []) as ImportRowError[] }
            : { kind: 'generalError', message: this.translate.instant('myArticles.import.generalError') }
        );
        this.importDialogVisible.set(true);
      }
    });
  }

  onExport(): void {
    this.importExportApi.export().subscribe({
      next: (result) => this.triggerDownload(result.blob, result.fileName),
      error: () => {
        this.messageService.add({
          severity: 'error', summary: this.translate.instant('myArticles.import.exportError')
        });
      }
    });
  }

  onTemplate(): void {
    this.importExportApi.template().subscribe({
      next: (result) => this.triggerDownload(result.blob, result.fileName),
      error: () => {
        this.messageService.add({
          severity: 'error', summary: this.translate.instant('myArticles.import.templateError')
        });
      }
    });
  }

  private triggerDownload(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  get columns(): ColumnConfig[] {
    return [
      { field: 'number', header: this.translate.instant('myArticles.columnNumber'), type: 'number' },
      { field: 'name', header: this.translate.instant('myArticles.columnName'), type: 'text' },
      { field: 'category', header: this.translate.instant('myArticles.columnCategory'), type: 'text' },
      { field: 'brand', header: this.translate.instant('myArticles.columnBrand'), type: 'text' },
      { field: 'price', header: this.translate.instant('myArticles.columnPrice'), type: 'currency' }
    ];
  }

  get actionColumn(): ActionColumnConfig {
    return {
      actions: [{ actionId: 'edit', icon: 'pi pi-pencil', ariaLabel: this.translate.instant('common.edit') }]
    };
  }

  readonly articles = signal<ArticleResponse[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly brands = signal<MasterDataItem[]>([]);
  readonly categories = signal<MasterDataItem[]>([]);
  readonly isEmpty = computed(() => this.articles().length === 0);

  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly sort = signal<string | undefined>(undefined);
  readonly filters = signal<FilterPanelSearch>({});
  readonly hasActiveFilter = computed(() => {
    const f = this.filters();
    return !!(f.brand || f.category || f.search);
  });

  readonly dialogVisible = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly dialogArticle = signal<ArticleResponse | null>(null);
  readonly dialogNextNumber = signal<number | null>(null);

  get dialogVisibleModel() { return this.dialogVisible(); }
  set dialogVisibleModel(v: boolean) { this.dialogVisible.set(v); }

  ngOnInit(): void {
    this.loadArticles();
    this.masterDataApi.getAll('brands').subscribe((items) => this.brands.set(items));
    this.masterDataApi.getAll('categories').subscribe((items) => this.categories.set(items));
  }

  loadArticles(): void {
    this.loading.set(true);
    const query: ArticleListQuery = {
      page: this.page(), pageSize: this.pageSize(), sort: this.sort(), ...this.filters()
    };
    this.articlesApi.getMine(query).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.articles.set(result.items);
        this.totalRecords.set(result.totalCount);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error', summary: this.translate.instant('myArticles.loadError')
        });
      }
    });
  }

  onFilterSearch(filters: FilterPanelSearch): void {
    this.filters.set(filters);
    this.page.set(1);
    this.loadArticles();
  }

  onTableSort(metas: SortMeta[]): void {
    this.sort.set(metas.length ? metas.map((m) => `${m.field}:${m.order}`).join(',') : undefined);
    this.loadArticles();
  }

  onTablePage(event: TablePageEvent): void {
    this.page.set(Math.floor(event.first / event.rows) + 1);
    this.pageSize.set(event.rows);
    this.loadArticles();
  }

  onTableAction(event: ActionClickEvent<ArticleResponse>): void {
    if (event.actionId === 'edit') {
      this.openEditDialog(event.row);
    }
  }

  openCreateDialog(): void {
    this.articlesApi.getNextNumber().subscribe({
      next: ({ number }) => {
        this.dialogMode.set('create');
        this.dialogArticle.set(null);
        this.dialogNextNumber.set(number);
        this.dialogVisible.set(true);
      },
      error: () => {
        this.messageService.add({
          severity: 'warn', summary: this.translate.instant('myArticles.noFreeNumber')
        });
      }
    });
  }

  openEditDialog(article: ArticleResponse): void {
    this.dialogMode.set('edit');
    this.dialogArticle.set(article);
    this.dialogNextNumber.set(null);
    this.dialogVisible.set(true);
  }

  onSaved(): void {
    this.loadArticles();
  }

  onBrandCreated(item: MasterDataItem): void {
    this.brands.update((items) => [...items, item]);
  }

  onCategoryCreated(item: MasterDataItem): void {
    this.categories.update((items) => [...items, item]);
  }
}
