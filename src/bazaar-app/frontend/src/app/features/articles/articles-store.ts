import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  ArticleListItem,
  ArticlesApi,
  UpdateArticleRequest,
  UpdateArticleTimestampsRequest,
} from './data/articles-api';

export interface ArticlesFilters {
  q: string;
  brand: string | null;
  category: string | null;
  status: string | null;
  sort: string; // comma-separated multi-sort, e.g. "number:asc" or "category:asc,price:desc"
}

/**
 * Feature-local store for Articles (Round-15 Task 6). Mirrors `SellersStore`'s "no in-memory
 * list logic, server resolves everything" pattern exactly: search, brand/category/status
 * filter, multi-sort and pagination are all resolved server-side. Every filter/page change —
 * and every successful mutation — re-calls `load()` against `GET /api/articles` with the
 * current `q`/`brand`/`category`/`status`/`sort`/`page`/`pageSize`, rather than
 * sorting/filtering/splicing the already-loaded `items` array client-side.
 *
 * `sort` is a single, already-comma-joined string here — the store doesn't know about
 * `Table`'s multi-sort `SortEvent[]` shape; the page is responsible for building the
 * comma-separated string from it (see `articles-page.ts`).
 *
 * Default `pageSize` is 50 (api/articles.md: "Paginiert, 50 je Seite" — NOT 60 like Sellers).
 */
@Injectable({ providedIn: 'root' })
export class ArticlesStore {
  private readonly articlesApi = inject(ArticlesApi);

  readonly items = signal<ArticleListItem[]>([]);
  readonly totalCount = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(50);
  readonly loading = signal(false);
  readonly filters = signal<ArticlesFilters>({
    q: '',
    brand: null,
    category: null,
    status: null,
    sort: 'number:asc',
  });

  load(): void {
    this.loading.set(true);
    this.articlesApi
      .getArticles({
        page: this.page(),
        pageSize: this.pageSize(),
        q: this.filters().q,
        brand: this.filters().brand ?? undefined,
        category: this.filters().category ?? undefined,
        status: this.filters().status ?? undefined,
        sort: this.filters().sort,
      })
      .subscribe({
        next: (response) => {
          this.items.set(response.items);
          this.totalCount.set(response.totalCount);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        },
      });
  }

  setFilters(partial: Partial<ArticlesFilters>): void {
    this.filters.set({ ...this.filters(), ...partial });
    this.page.set(1);
    this.load();
  }

  setPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  /**
   * Round-15 Task 6 fix round 1: the paginator's `rowsPerPageOptions` (Brands-style `[10, 25,
   * 50]`, see `Table`'s class doc comment "Known remaining gap") lets a user pick a page size
   * other than this store's own fixed 50. Without this method, that pick only shrank `p-table`'s
   * client-side `rows()` — the already-fetched 50-row page got silently sliced down, rows
   * "vanished" with no error. Mirrors `setFilters`'s reset-and-reload pattern: set the new page
   * size, reset to page 1 (the old page number may no longer make sense at a different size),
   * reload.
   */
  setPageSize(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.page.set(1);
    this.load();
  }

  update(id: string, request: UpdateArticleRequest): Observable<void> {
    return this.articlesApi.update(id, request).pipe(tap(() => this.load()));
  }

  updateTimestamps(id: string, request: UpdateArticleTimestampsRequest): Observable<void> {
    return this.articlesApi.updateTimestamps(id, request).pipe(tap(() => this.load()));
  }

  remove(id: string): Observable<void> {
    return this.articlesApi.remove(id).pipe(tap(() => this.load()));
  }
}
