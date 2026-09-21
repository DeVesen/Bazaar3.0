import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

/**
 * `GET /api/admin/dev-tools/status` only exists on the server when
 * `Environment.IsDevelopment()` (see Program.cs / DevToolsEndpoints.cs) — a 404 here means
 * Production, not an error, so `isDevelopment()` folds it into `false` instead of surfacing it.
 */
@Injectable({ providedIn: 'root' })
export class DevToolsApi {
  private readonly http = inject(HttpClient);

  isDevelopment(): Observable<boolean> {
    return this.http.get<{ isDevelopment: boolean }>('/api/admin/dev-tools/status').pipe(
      map((status) => status.isDevelopment),
      catchError(() => of(false)),
    );
  }

  resetDatabase(): Observable<void> {
    return this.http.post<void>('/api/admin/dev-tools/reset-database', {});
  }
}
