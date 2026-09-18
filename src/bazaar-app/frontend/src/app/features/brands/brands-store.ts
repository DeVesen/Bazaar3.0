import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Brand, BrandsApi } from './data/brands-api';

function byNameAscending(a: Brand, b: Brand): number {
  return a.name.localeCompare(b.name);
}

/**
 * Feature-local store for Brands (Round-11). Keeps `brands` sorted by `name` ascending after
 * every mutation (`load`/`create`/`update`/`remove`) — this is the store's own canonical order.
 * `app-table`'s `sortChange` output only reports what order the user picked; it does not sort
 * anything itself, so re-sorting for a user-picked column/order is the PAGE's responsibility
 * (`BrandsPage`), not this store's.
 *
 * `create`/`update`/`remove` return the underlying `Observable` (rather than swallowing
 * success/error here) so the page can react to success/error itself — closing the popup,
 * showing a toast/error message — matching the existing `login-page.ts`/
 * `change-password-page.ts` pattern of letting the component own user feedback.
 */
@Injectable({ providedIn: 'root' })
export class BrandsStore {
  private readonly brandsApi = inject(BrandsApi);

  readonly brands = signal<Brand[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.brandsApi.getAll().subscribe({
      next: (brands) => {
        this.brands.set([...brands].sort(byNameAscending));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  create(name: string): Observable<Brand> {
    return this.brandsApi.create(name).pipe(
      tap((brand) => {
        this.brands.set([...this.brands(), brand].sort(byNameAscending));
      }),
    );
  }

  update(id: string, name: string, original: boolean): Observable<void> {
    return this.brandsApi.update(id, name, original).pipe(
      tap(() => {
        this.brands.set(
          this.brands()
            .map((brand) => (brand.id === id ? { ...brand, name, original } : brand))
            .sort(byNameAscending),
        );
      }),
    );
  }

  remove(id: string): Observable<void> {
    return this.brandsApi.remove(id).pipe(
      tap(() => {
        this.brands.set(this.brands().filter((brand) => brand.id !== id));
      }),
    );
  }
}
