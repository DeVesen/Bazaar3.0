import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ArticleListItem {
  id: string;
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  status: string;
  soldManually: boolean;
  sellerId: string;
  sellerName: string;
}

export interface ArticleListResponse {
  items: ArticleListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface GetArticlesParams {
  page?: number;
  pageSize?: number;
  q?: string;
  brand?: string;
  category?: string;
  status?: string;
  sort?: string;
}

/**
 * PUT /api/articles/{id} request body — Stammfelder only. number/sellerId
 * are never editable (api/articles.md §4).
 */
export interface UpdateArticleRequest {
  name: string;
  brand: string;
  category: string;
  price: number;
  size?: string | null;
  color?: string | null;
  description?: string | null;
}

/**
 * PUT /api/articles/{id}/timestamps request body — full replace of the
 * three setable timestamps (api/articles.md §5). ISO 8601 strings or null.
 */
export interface UpdateArticleTimestampsRequest {
  releasedAt: string | null;
  soldAt: string | null;
  returnedAt: string | null;
}

@Injectable({ providedIn: 'root' })
export class ArticlesApi {
  private readonly http = inject(HttpClient);

  getArticles(params: GetArticlesParams): Observable<ArticleListResponse> {
    let httpParams = new HttpParams();
    if (params.page !== undefined) httpParams = httpParams.set('page', params.page);
    if (params.pageSize !== undefined) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params.q) httpParams = httpParams.set('q', params.q);
    if (params.brand) httpParams = httpParams.set('brand', params.brand);
    if (params.category) httpParams = httpParams.set('category', params.category);
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    return this.http.get<ArticleListResponse>('/api/articles', { params: httpParams });
  }

  update(id: string, request: UpdateArticleRequest): Observable<void> {
    return this.http.put<void>(`/api/articles/${id}`, request);
  }

  updateTimestamps(id: string, request: UpdateArticleTimestampsRequest): Observable<void> {
    return this.http.put<void>(`/api/articles/${id}/timestamps`, request);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/articles/${id}`);
  }
}
