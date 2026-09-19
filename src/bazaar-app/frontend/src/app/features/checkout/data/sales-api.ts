import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Response shape of `POST /api/sales`, matching the backend's response DTO
 * (`Bazaar.Api.Features.Sales.SalesEndpoints`) — mirrors `ReleaseResult`'s shape
 * (`release-api.ts`) field-for-field for the checkout flow (api/sales.md §1).
 */
export interface SalesResult {
  soldCount: number;
  total: number;
  soldAt: string;
}

@Injectable({ providedIn: 'root' })
export class SalesApi {
  private readonly http = inject(HttpClient);

  bookSale(articleIds: readonly string[]): Observable<SalesResult> {
    return this.http.post<SalesResult>('/api/sales', { articleIds });
  }

  undoSale(articleIds: readonly string[]): Observable<void> {
    return this.http.post<void>('/api/sales/undo', { articleIds });
  }
}
