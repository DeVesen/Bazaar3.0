import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  ArticleSummary,
  CreateSellerRequest,
  Seller,
  SellerCard,
  SellerSearchResult,
  SellersApi,
  UpdateSellerRequest,
} from './data/sellers-api';

export interface SellersFilters {
  q: string;
  status: string | null;
  sort: string;
}

/**
 * Feature-local store for Sellers (Round-14). Unlike `SellerTypesStore`, this store keeps
 * NO in-memory list logic: search, status filter, sort and pagination are all resolved
 * server-side. Every filter/page change — and every successful mutation — re-calls `load()`
 * against `GET /api/sellers` with the current `q`/`status`/`sort`/`page`/`pageSize`, rather
 * than sorting/filtering/splicing the already-loaded `items` array client-side.
 *
 * `create`/`update`/`remove`/`resetSettlement` return the underlying `Observable` (rather
 * than swallowing success/error here) so the page can react itself — closing a dialog,
 * showing a toast — on top of the store's own `tap`-triggered `load()`.
 */
@Injectable({ providedIn: 'root' })
export class SellersStore {
  private readonly sellersApi = inject(SellersApi);

  readonly items = signal<SellerCard[]>([]);
  readonly totalCount = signal(0);
  readonly page = signal(1);
  readonly pageSize = signal(60);
  readonly loading = signal(false);
  readonly filters = signal<SellersFilters>({ q: '', status: null, sort: 'name' });

  load(): void {
    this.loading.set(true);
    this.sellersApi
      .getCards({
        page: this.page(),
        pageSize: this.pageSize(),
        q: this.filters().q,
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

  setFilters(partial: Partial<SellersFilters>): void {
    this.filters.set({ ...this.filters(), ...partial });
    this.page.set(1);
    this.load();
  }

  setPage(page: number): void {
    this.page.set(page);
    this.load();
  }

  create(request: CreateSellerRequest): Observable<Seller> {
    return this.sellersApi.create(request).pipe(tap(() => this.load()));
  }

  update(id: string, request: UpdateSellerRequest): Observable<void> {
    return this.sellersApi.update(id, request).pipe(tap(() => this.load()));
  }

  remove(id: string): Observable<void> {
    return this.sellersApi.remove(id).pipe(tap(() => this.load()));
  }

  resetSettlement(id: string): Observable<void> {
    return this.sellersApi.resetSettlement(id).pipe(tap(() => this.load()));
  }

  getArticles(id: string): Observable<ArticleSummary[]> {
    return this.sellersApi.getArticles(id);
  }

  search(q: string): Observable<SellerSearchResult[]> {
    return this.sellersApi.search(q);
  }
}
