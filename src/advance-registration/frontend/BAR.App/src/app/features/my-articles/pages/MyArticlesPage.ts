import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ArticlesApiService, ArticleResponse } from '../articles-api.service';
import { MasterDataApiService, MasterDataItem } from '../master-data-api.service';
import { ArtikelDialog } from '../components/artikel-dialog';

@Component({
  selector: 'app-my-articles-page',
  imports: [ButtonModule, TableModule, ArtikelDialog],
  template: `
    <h1>Meine Artikel</h1>
    <button pButton type="button" (click)="openCreateDialog()">+ Neu</button>

    @if (isEmpty()) {
      <p>Noch keine Artikel angemeldet. Mit <strong>+ Neu</strong> den ersten anlegen.</p>
    } @else {
      <p-table [value]="articles()">
        <ng-template #header>
          <tr><th>Nr.</th><th>Bezeichnung</th><th>Kategorie</th><th>Marke</th><th>Preis</th><th></th></tr>
        </ng-template>
        <ng-template #body let-article>
          <tr>
            <td>{{ article.number }}</td>
            <td>{{ article.name }}</td>
            <td>{{ article.category }}</td>
            <td>{{ article.brand }}</td>
            <td>{{ article.price }}</td>
            <td><button pButton type="button" [iconOnly]="true" (click)="openEditDialog(article)"><i class="pi pi-pencil"></i></button></td>
          </tr>
        </ng-template>
      </p-table>
    }

    <app-artikel-dialog
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

  readonly articles = signal<ArticleResponse[]>([]);
  readonly brands = signal<MasterDataItem[]>([]);
  readonly categories = signal<MasterDataItem[]>([]);
  readonly isEmpty = computed(() => this.articles().length === 0);

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
    this.articlesApi.getMine().subscribe((page) => this.articles.set(page.items));
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
        // AC-8: 409 article.no_free_number -> Dialog bleibt zu, Toast durch globalen HTTP-Fehlerpfad
        // (kein spezieller Handler hier noetig, sobald ein Toast-Interceptor existiert - siehe Task-Notiz)
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
