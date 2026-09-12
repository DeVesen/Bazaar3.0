import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AdminArticlesApiService, AdminArticleListQuery, AdminArticleResponse } from '../admin-articles-api.service';
import { MasterDataApiService, MasterDataItem } from '@features/registration/master-data-api.service';
import { SellerSearchApiService } from '@features/registration/seller-search-api.service';
import { ArticleReadonlyModal } from '../components/article-readonly-modal';
import { AppTable, ActionClickEvent, ActionColumnConfig, ColumnConfig, SortMeta, TablePageEvent } from '@shared/table/table';
import { FilterPanel, FilterPanelSearch } from '@shared/filter-panel/filter-panel';
import { TranslatePipe } from '@ngx-translate/core';

export interface AdminArticleRow extends AdminArticleResponse {
  sellerLabel: string;
}

const COLUMNS: ColumnConfig<AdminArticleRow>[] = [
  { field: 'number', header: 'Nr.', type: 'number' },
  { field: 'name', header: 'Bezeichnung', type: 'text' },
  { field: 'category', header: 'Kategorie', type: 'text' },
  { field: 'brand', header: 'Marke', type: 'text' },
  { field: 'price', header: 'Preis', type: 'currency' },
  { field: 'sellerLabel', header: 'Verkäufer', type: 'text', sortField: 'seller' }
];

const ACTION_COLUMN: ActionColumnConfig = {
  actions: [{ actionId: 'view', icon: 'pi pi-search', ariaLabel: 'Ansehen' }]
};

function toRow(a: AdminArticleResponse): AdminArticleRow {
  return { ...a, sellerLabel: `${a.seller.firstName} ${a.seller.lastName} (#${a.seller.startNumber ?? '–'})` };
}

@Component({
  selector: 'app-articles-page',
  imports: [FilterPanel, AppTable, ArticleReadonlyModal, TranslatePipe],
  template: `
    <h1>{{ 'articles.title' | translate }}</h1>

    <app-filter-panel [brands]="brands()" [categories]="categories()" [sellerAutocomplete]="true" [sellerSearchFn]="sellerSearchFn" (search)="onFilterSearch($event)" />

    <app-table
      [columns]="columns"
      [data]="articles()"
      [totalRecords]="totalRecords()"
      [loading]="loading()"
      [rows]="pageSize()"
      [first]="(page() - 1) * pageSize()"
      [actionColumn]="actionColumn"
      [hasActiveFilter]="hasActiveFilter()"
      emptyText="Noch hat kein Verkäufer Artikel angemeldet."
      (sortChange)="onTableSort($event)"
      (pageChange)="onTablePage($event)"
      (actionClick)="onTableAction($event)"
    />

    <app-article-readonly-modal [(visible)]="modalVisibleModel" [article]="modalArticle()" />
  `
})
export class ArticlesPage implements OnInit {
  private readonly articlesApi = inject(AdminArticlesApiService);
  private readonly masterDataApi = inject(MasterDataApiService);
  private readonly sellerSearchApi = inject(SellerSearchApiService);
  private readonly messageService = inject(MessageService);

  readonly sellerSearchFn = (query: string) => this.sellerSearchApi.search(query);

  readonly columns = COLUMNS;
  readonly actionColumn = ACTION_COLUMN;

  readonly articles = signal<AdminArticleRow[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);
  readonly brands = signal<MasterDataItem[]>([]);
  readonly categories = signal<MasterDataItem[]>([]);

  readonly page = signal(1);
  readonly pageSize = signal(25);
  readonly sort = signal<string | undefined>(undefined);
  readonly filters = signal<FilterPanelSearch>({});
  readonly hasActiveFilter = computed(() => {
    const f = this.filters();
    return !!(f.brand || f.category || f.search || f.sellerId);
  });

  readonly modalVisible = signal(false);
  readonly modalArticle = signal<AdminArticleRow | null>(null);

  get modalVisibleModel() { return this.modalVisible(); }
  set modalVisibleModel(v: boolean) { this.modalVisible.set(v); }

  ngOnInit(): void {
    this.loadArticles();
    this.masterDataApi.getAll('brands').subscribe((items) => this.brands.set(items));
    this.masterDataApi.getAll('categories').subscribe((items) => this.categories.set(items));
  }

  loadArticles(): void {
    this.loading.set(true);
    const query: AdminArticleListQuery = {
      page: this.page(), pageSize: this.pageSize(), sort: this.sort(), ...this.filters()
    };
    this.articlesApi.list(query).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.articles.set(result.items.map(toRow));
        this.totalRecords.set(result.totalCount);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error', summary: 'Artikel konnten nicht geladen werden'
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

  onTableAction(event: ActionClickEvent<AdminArticleRow>): void {
    if (event.actionId === 'view') {
      this.modalArticle.set(event.row);
      this.modalVisible.set(true);
    }
  }
}
