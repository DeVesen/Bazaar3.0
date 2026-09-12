import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerSummary {
  id: string;
  startNumber: number | null;
  firstName: string;
  lastName: string;
}

export interface AdminArticleResponse {
  id: string;
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  seller: SellerSummary;
}

export interface AdminArticleListResponse {
  items: AdminArticleResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AdminArticleListQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  brand?: string;
  category?: string;
  search?: string;
  sellerId?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminArticlesApiService {
  private readonly http = inject(HttpClient);

  list(query: AdminArticleListQuery = {}): Observable<AdminArticleListResponse> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.category) params = params.set('category', query.category);
    if (query.search) params = params.set('search', query.search);
    if (query.sellerId) params = params.set('sellerId', query.sellerId);
    return this.http.get<AdminArticleListResponse>('/api/articles', { params });
  }

  getById(id: string): Observable<AdminArticleResponse> {
    return this.http.get<AdminArticleResponse>(`/api/articles/${id}`);
  }
}
