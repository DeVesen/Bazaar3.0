import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * `AppUser` as read from `GET/POST /api/users` (Round-27, docs/requirements/bazaar-app/api/users.md).
 * `passwordHash` never appears in this shape (component spec §2, AC-7) — there is nothing to omit,
 * the backend response simply doesn't carry it.
 */
export interface AppUser {
  id: string;
  username: string;
  role: 'admin' | 'cashier';
  mustChangePassword: boolean;
}

/**
 * `UsersApi` — mirrors `SellerTypesApi`'s shape (docs/components/user-management/component.md).
 * `update()`'s `PUT` body is the first "partial update" shape in this app (see task-C-brief.md):
 * only the fields the caller actually wants to change are included, built conditionally rather
 * than always sending both `role` and `newPassword` (with `null` for the unset one) — the backend
 * validator distinguishes "field present" from "field absent", so an explicit `null` is not the
 * same as omitting the key.
 */
@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly http = inject(HttpClient);

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>('/api/users');
  }

  create(username: string, role: 'admin' | 'cashier', initialPassword: string): Observable<AppUser> {
    return this.http.post<AppUser>('/api/users', { username, role, initialPassword });
  }

  update(id: string, role: 'admin' | 'cashier' | null, newPassword: string | null): Observable<void> {
    const body = {
      ...(role ? { role } : {}),
      ...(newPassword ? { newPassword } : {}),
    };
    return this.http.put<void>(`/api/users/${id}`, body);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/users/${id}`);
  }
}
