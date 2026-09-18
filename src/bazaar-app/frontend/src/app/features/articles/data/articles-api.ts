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

/**
 * Response shape for `GET /api/articles/{id}` (Round-15 review fix) — the full Stammdaten plus
 * raw status timestamps, matching the backend's `ArticleDetailDto`. `ArticleListItem` above only
 * carries the columns the table itself renders; it has no `size`/`color`/`description` nor the
 * raw `createdAt`/`releasedAt`/`soldAt`/`returnedAt` timestamps that `artikel-dialog`/
 * `article-status-popup` need to seed their forms — same gap `SellerDetail`/`GET /api/sellers/{id}`
 * closed for the sellers-page edit flow (Round-14 Task 10 fix round 1).
 */
export interface ArticleDetail {
  id: string;
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
  status: string;
  soldManually: boolean;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  releasedAt: string | null;
  soldAt: string | null;
  returnedAt: string | null;
  sellerSettledAt: string | null;
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

/**
 * Response shape for `GET /api/articles/by-number/{number}` (api/articles.md §2, Round-17 Task
 * 3's `ArticleByNumberDto`) — used by intake's Artikelnummer-Prüfung (`intake-article-entry`)
 * and, in a later round, by the cash desk for article recognition. Deliberately narrower than
 * `ArticleDetail`: matches the real backend DTO exactly (`Bazaar.Api/Features/Articles/Dtos.cs`
 * `ArticleByNumberDto`), which carries only `id`/`number`/`name`/`price`/`status`/`sellerId`/
 * `sellerName` — no `brand`/`category`/`size`/`color`/`description`.
 */
export interface ArticleByNumberResult {
  id: string;
  number: number;
  name: string;
  price: number;
  status: string;
  sellerId: string;
  sellerName: string;
}

/** Response shape for `GET /api/articles/next-number` (Round-16, real). */
export interface NextArticleNumberResult {
  nextNumber: number;
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

  getById(id: string): Observable<ArticleDetail> {
    return this.http.get<ArticleDetail>(`/api/articles/${id}`);
  }

  getByNumber(number: number): Observable<ArticleByNumberResult> {
    return this.http.get<ArticleByNumberResult>(`/api/articles/by-number/${number}`);
  }

  getNextNumber(): Observable<NextArticleNumberResult> {
    return this.http.get<NextArticleNumberResult>('/api/articles/next-number');
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
