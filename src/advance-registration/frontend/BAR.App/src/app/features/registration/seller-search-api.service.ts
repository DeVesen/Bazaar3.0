import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type { SellerOption } from '@shared/filter-panel/filter-panel';

interface SellerSearchItem {
  id: string;
  firstName: string;
  lastName: string;
  startNumber: number | null;
}

interface SellerSearchResult {
  items: SellerSearchItem[];
}

/**
 * Departments-lokale, lesende Anlaufstelle fuer die Verkaeufer-Autocomplete im
 * Artikel-Filter (Registration). Ruft dieselbe Admin-Verkaeuferliste auf wie die
 * SellerManagement selbst - keine eigene Fachlogik, nur ein duenner Client
 * fuer diese eine Abfrage (angular-modulith-bridge: kein Cross-Feature-Import
 * von SellerManagements SellersApiService).
 */
@Injectable({ providedIn: 'root' })
export class SellerSearchApiService {
  private readonly http = inject(HttpClient);

  search(query: string): Observable<SellerOption[]> {
    const params = new HttpParams().set('search', query).set('page', 1).set('pageSize', 10);
    return this.http.get<SellerSearchResult>('/api/sellers', { params }).pipe(
      map((result) => result.items.map((s): SellerOption => ({ id: s.id, label: `${s.firstName} ${s.lastName} (#${s.startNumber ?? '–'})` })))
    );
  }
}
