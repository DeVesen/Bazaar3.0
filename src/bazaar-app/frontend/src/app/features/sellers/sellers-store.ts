import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  ArticleSummary,
  CreateSellerRequest,
  Seller,
  SellerCard,
  SellerDetail,
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
 * NO in-memory list logic: search, status filter and sort are resolved server-side; paging is
 * "Nachladen am Listenende" (`loadMore()`, 60 per request) instead of a paginator — `load()`
 * re-fetches all already loaded pages in one request so mutations keep the scroll position.
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

  readonly hasMore = computed(() => this.items().length < this.totalCount());

  /**
   * Sequenznummer des jeweils jüngsten `load()`/`loadMore()`-Requests. Ein `loadMore()`, das
   * z. B. wegen eines langsamen Netzwerks erst nach einem inzwischen ausgelösten `load()`
   * (neue Filter, oder eine Mutation) antwortet, würde sonst dessen frisch geladene Liste mit
   * veralteten Daten überschreiben und `page` auf einen falschen Wert zurücksetzen. Jeder
   * Request merkt sich seine eigene Nummer und wendet die Antwort nur an, wenn sie beim
   * Eintreffen noch die aktuellste ist.
   */
  private requestSequence = 0;

  /** Lädt alle bisher nachgeladenen Seiten in einem Request neu (Seite 1, pageSize × page). */
  load(): void {
    const sequence = ++this.requestSequence;
    this.loading.set(true);
    this.sellersApi
      .getCards({
        page: 1,
        pageSize: this.page() * this.pageSize(),
        q: this.filters().q,
        status: this.filters().status ?? undefined,
        sort: this.filters().sort,
      })
      .subscribe({
        next: (response) => {
          if (sequence !== this.requestSequence) return;
          this.items.set(response.items);
          this.totalCount.set(response.totalCount);
          this.loading.set(false);
        },
        error: () => {
          if (sequence !== this.requestSequence) return;
          this.loading.set(false);
        },
      });
  }

  /** Nächste 60 Verkäufer ans Listenende anhängen (Epic_Verkaeufer: Nachladen statt Paginator). */
  loadMore(): void {
    if (this.loading() || !this.hasMore()) return;
    const nextPage = this.page() + 1;
    const sequence = ++this.requestSequence;
    this.loading.set(true);
    this.sellersApi
      .getCards({
        page: nextPage,
        pageSize: this.pageSize(),
        q: this.filters().q,
        status: this.filters().status ?? undefined,
        sort: this.filters().sort,
      })
      .subscribe({
        next: (response) => {
          if (sequence !== this.requestSequence) return;
          this.items.update((items) => [...items, ...response.items]);
          this.totalCount.set(response.totalCount);
          this.page.set(nextPage);
          this.loading.set(false);
        },
        error: () => {
          if (sequence !== this.requestSequence) return;
          this.loading.set(false);
        },
      });
  }

  setFilters(partial: Partial<SellersFilters>): void {
    this.filters.set({ ...this.filters(), ...partial });
    this.page.set(1);
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

  getById(id: string): Observable<SellerDetail> {
    return this.sellersApi.getById(id);
  }

  getArticles(id: string): Observable<ArticleSummary[]> {
    return this.sellersApi.getArticles(id);
  }

  search(q: string): Observable<SellerSearchResult[]> {
    return this.sellersApi.search(q);
  }
}
