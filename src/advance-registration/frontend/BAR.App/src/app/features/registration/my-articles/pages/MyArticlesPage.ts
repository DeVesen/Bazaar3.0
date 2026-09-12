import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { ArticlesApiService, ArticleListQuery, ArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../../master-data-api.service';
import { ArticleDialog } from '../components/article-dialog';
import { AppTable, ActionClickEvent, ActionColumnConfig, ColumnConfig, SortMeta, TablePageEvent } from '@shared/table/table';
import { FilterPanel, FilterPanelSearch } from '@shared/filter-panel/filter-panel';

@Component({
  selector: 'app-my-articles-page',
  imports: [FilterPanel, AppTable, ArticleDialog, ButtonModule, TranslatePipe],
  template: `
    <h1>{{ 'myArticles.title' | translate }}</h1>

    <app-filter-panel [brands]="brands()" [categories]="categories()" (search)="onFilterSearch($event)" />

    @if (isEmpty() && !hasActiveFilter() && !loading()) {
      <p>{{ 'myArticles.emptyTextPrefix' | translate }}<strong>{{ 'myArticles.createButton' | translate }}</strong>{{ 'myArticles.emptyTextSuffix' | translate }}</p>
      <button pButton type="button" (click)="openCreateDialog()">{{ 'myArticles.createButton' | translate }}</button>
    } @else {
      <button pButton type="button" (click)="openCreateDialog()">{{ 'myArticles.createButton' | translate }}</button>
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
  `
})
export class MyArticlesPage implements OnInit {
  private readonly articlesApi = inject(ArticlesApiService);
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

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
