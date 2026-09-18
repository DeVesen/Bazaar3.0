import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SellerCard {
  id: string;
  firstName: string;
  lastName: string;
  postalCode: string | null;
  city: string | null;
  sellerType: string;
  status: string;
  articleCount: number;
  releasedCount: number;
  soldCount: number;
  returnedCount: number;
  acceptedValue: number;
  openValue: number;
  revenue: number;
  settledAt: string | null;
}

export interface SellerCardsResponse {
  items: SellerCard[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface SellerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  city: string | null;
  sellerType: string;
}

export interface ArticleSummary {
  id: string;
  number: number;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  status: string;
  soldManually: boolean;
}

/**
 * POST /api/sellers request body. `salesCommission`/`feePerItem` are NOT accepted here —
 * the server derives them from `sellerTypeId` (see backend `CreateSellerCommand`).
 */
export interface CreateSellerRequest {
  firstName: string;
  lastName: string;
  email: string;
  sellerTypeId: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone?: string | null;
}

/**
 * PUT /api/sellers/{id} request body. `salesCommission`/`feePerItem` are only honored for
 * callers with role `admin` (see backend `UpdateSellerCommand`/`SellerEndpoints`).
 */
export interface UpdateSellerRequest {
  firstName: string;
  lastName: string;
  email: string;
  sellerTypeId: string;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  phone?: string | null;
  salesCommission: number;
  feePerItem: number;
}

/**
 * Response shape of POST /api/sellers (201 Created) — the full detail record of a
 * newly created seller, matching the backend's `SellerDetailDto`.
 */
export interface Seller {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string;
  sellerTypeId: string;
  salesCommission: number;
  feePerItem: number;
  status: string;
  articleCount: number;
  releasedCount: number;
  soldCount: number;
  returnedCount: number;
  acceptedValue: number;
  openValue: number;
  revenue: number;
  settledAt: string | null;
}

/**
 * Response shape of GET /api/sellers/{id} — the seller's full Stammdaten, as needed to
 * seed the edit dialog (see backend's `SellerDto`, Round-14 Task 10 fix). Deliberately
 * excludes the card-level aggregates (`status`/`articleCount`/…) that `Seller` above
 * carries — those live on `SellerCard` already loaded by the grid, not needed here.
 */
export interface SellerDetail {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  phone: string | null;
  email: string;
  sellerTypeId: string;
  salesCommission: number;
  feePerItem: number;
  intakeFeePaid: number;
  settledAt: string | null;
  payoutAmount: number | null;
}

export interface GetCardsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class SellersApi {
  private readonly http = inject(HttpClient);

  getCards(params: GetCardsParams): Observable<SellerCardsResponse> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    if (params.q) {
      httpParams = httpParams.set('q', params.q);
    }
    if (params.status) {
      httpParams = httpParams.set('status', params.status);
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<SellerCardsResponse>('/api/sellers', { params: httpParams });
  }

  search(q: string): Observable<SellerSearchResult[]> {
    return this.http.get<SellerSearchResult[]>('/api/sellers/search', { params: { q } });
  }

  create(request: CreateSellerRequest): Observable<Seller> {
    return this.http.post<Seller>('/api/sellers', request);
  }

  update(id: string, request: UpdateSellerRequest): Observable<void> {
    return this.http.put<void>(`/api/sellers/${id}`, request);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/sellers/${id}`);
  }

  getById(id: string): Observable<SellerDetail> {
    return this.http.get<SellerDetail>(`/api/sellers/${id}`);
  }

  getArticles(id: string): Observable<ArticleSummary[]> {
    return this.http.get<ArticleSummary[]>(`/api/sellers/${id}/articles`);
  }

  resetSettlement(id: string): Observable<void> {
    return this.http.delete<void>(`/api/sellers/${id}/settlement`);
  }
}
