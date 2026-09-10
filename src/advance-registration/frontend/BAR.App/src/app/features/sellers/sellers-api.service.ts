import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerType {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
}

export interface Seller {
  id: string;
  startNumber: number | null;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  sellerTypeId: string;
  sellerType: SellerType;
  isAdmin: boolean;
  articleCount: number;
  hasPendingInvite: boolean;
}

export interface NumberBlock {
  id: string;
  sellerId: string;
  fromNumber: number;
  toNumber: number;
  numberCount: number;
  usedCount: number;
  assignedAt: string;
}

export interface CreateSellerPayload {
  firstName: string;
  lastName: string;
  address?: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  sellerTypeId: string;
  isAdmin?: boolean;
  startNumber?: number;
  blockCount?: number;
}

export type UpdateSellerPayload = Omit<CreateSellerPayload, 'startNumber' | 'blockCount'>;

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ListSellersParams {
  search?: string;
  page: number;
  pageSize: number;
  sort?: string;
}

@Injectable({ providedIn: 'root' })
export class SellersApiService {
  private readonly http = inject(HttpClient);

  list(params: ListSellersParams): Observable<PagedResult<Seller>> {
    let httpParams = new HttpParams().set('page', params.page).set('pageSize', params.pageSize);
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    return this.http.get<PagedResult<Seller>>('/api/sellers', { params: httpParams });
  }

  create(payload: CreateSellerPayload): Observable<Seller> {
    return this.http.post<Seller>('/api/sellers', payload);
  }

  update(id: string, payload: UpdateSellerPayload): Observable<Seller> {
    return this.http.put<Seller>(`/api/sellers/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/sellers/${id}`);
  }

  invite(id: string): Observable<{ inviteUrl: string; expiresAt: string }> {
    return this.http.post<{ inviteUrl: string; expiresAt: string }>(`/api/sellers/${id}/invite`, {});
  }

  nextFreeStartNumber(blockCount: number): Observable<{ startNumber: number }> {
    return this.http.get<{ startNumber: number }>('/api/blocks/next-free', { params: { blockCount } });
  }

  reserveBlocks(sellerId: string, body: { startNumber?: number; blockCount?: number }): Observable<NumberBlock[]> {
    return this.http.post<NumberBlock[]>(`/api/sellers/${sellerId}/blocks`, body);
  }

  deleteBlock(sellerId: string, blockId: string): Observable<void> {
    return this.http.delete<void>(`/api/sellers/${sellerId}/blocks/${blockId}`);
  }
}
