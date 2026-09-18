import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { SellerType, SellerTypesApi } from './data/seller-types-api';

function byNameAscending(a: SellerType, b: SellerType): number {
  return a.name.localeCompare(b.name);
}

/**
 * Feature-local store for Seller Types (Round-13), 1:1 pattern of `CategoriesStore`. Keeps
 * `sellerTypes` sorted by `name` ascending after every mutation (`load`/`create`/`update`/
 * `remove`) — this is the store's own canonical order; re-sorting for a user-picked
 * column/order is the PAGE's responsibility (`SellerTypesPage`), not this store's.
 *
 * `create`/`update`/`remove` return the underlying `Observable` (rather than swallowing
 * success/error here) so the page can react to success/error itself — closing the popup,
 * showing a toast/error message.
 */
@Injectable({ providedIn: 'root' })
export class SellerTypesStore {
  private readonly sellerTypesApi = inject(SellerTypesApi);

  readonly sellerTypes = signal<SellerType[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.sellerTypesApi.getAll().subscribe({
      next: (sellerTypes) => {
        this.sellerTypes.set([...sellerTypes].sort(byNameAscending));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  create(name: string, commissionRate: number, itemFee: number): Observable<SellerType> {
    return this.sellerTypesApi.create(name, commissionRate, itemFee).pipe(
      tap((sellerType) => {
        this.sellerTypes.set([...this.sellerTypes(), sellerType].sort(byNameAscending));
      }),
    );
  }

  update(id: string, name: string, commissionRate: number, itemFee: number): Observable<void> {
    return this.sellerTypesApi.update(id, name, commissionRate, itemFee).pipe(
      tap(() => {
        this.sellerTypes.set(
          this.sellerTypes()
            .map((sellerType) =>
              sellerType.id === id ? { ...sellerType, name, commissionRate, itemFee } : sellerType,
            )
            .sort(byNameAscending),
        );
      }),
    );
  }

  remove(id: string): Observable<void> {
    return this.sellerTypesApi.remove(id).pipe(
      tap(() => {
        this.sellerTypes.set(this.sellerTypes().filter((sellerType) => sellerType.id !== id));
      }),
    );
  }
}
