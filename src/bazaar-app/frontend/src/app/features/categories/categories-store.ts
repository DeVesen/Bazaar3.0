import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Category, CategoriesApi } from './data/categories-api';

function byNameAscending(a: Category, b: Category): number {
  return a.name.localeCompare(b.name);
}

/**
 * Feature-local store for Categories (Round-12). Keeps `categories` sorted by `name` ascending
 * after every mutation (`load`/`create`/`update`/`remove`) — this is the store's own canonical
 * order. `app-table`'s `sortChange` output only reports what order the user picked; it does not
 * sort anything itself, so re-sorting for a user-picked column/order is the PAGE's responsibility
 * (`CategoriesPage`), not this store's.
 *
 * `create`/`update`/`remove` return the underlying `Observable` (rather than swallowing
 * success/error here) so the page can react to success/error itself — closing the popup,
 * showing a toast/error message — matching the existing `login-page.ts`/
 * `change-password-page.ts` pattern of letting the component own user feedback.
 */
@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly categoriesApi = inject(CategoriesApi);

  readonly categories = signal<Category[]>([]);
  readonly loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.categoriesApi.getAll().subscribe({
      next: (categories) => {
        this.categories.set([...categories].sort(byNameAscending));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  create(name: string): Observable<Category> {
    return this.categoriesApi.create(name).pipe(
      tap((category) => {
        this.categories.set([...this.categories(), category].sort(byNameAscending));
      }),
    );
  }

  update(id: string, name: string, original: boolean): Observable<void> {
    return this.categoriesApi.update(id, name, original).pipe(
      tap(() => {
        this.categories.set(
          this.categories()
            .map((category) => (category.id === id ? { ...category, name, original } : category))
            .sort(byNameAscending),
        );
      }),
    );
  }

  remove(id: string): Observable<void> {
    return this.categoriesApi.remove(id).pipe(
      tap(() => {
        this.categories.set(this.categories().filter((category) => category.id !== id));
      }),
    );
  }
}
