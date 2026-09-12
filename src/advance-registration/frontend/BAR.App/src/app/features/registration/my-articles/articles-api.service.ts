import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface ArticleResponse {
  id: string;
  number: number;
  sellerId: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  size: string | null;
  color: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleResponse extends ArticleResponse {
  nextNumber?: number;
}

export interface ArticleListResponse {
  items: ArticleResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ArticleListQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  brand?: string;
  category?: string;
  search?: string;
}

export interface ArticlePayload {
  name: string;
  brand: string;
  category: string;
  price: number;
  size?: string;
  color?: string;
  description?: string;
}

export interface CreateArticlePayload extends ArticlePayload {
  expectedNumber?: number;
}

export type UpdateArticlePayload = ArticlePayload;

@Injectable({ providedIn: 'root' })
export class ArticlesApiService {
  private readonly http = inject(HttpClient);

  getMine(query: ArticleListQuery = {}): Observable<ArticleListResponse> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    if (query.sort) params = params.set('sort', query.sort);
    if (query.brand) params = params.set('brand', query.brand);
    if (query.category) params = params.set('category', query.category);
    if (query.search) params = params.set('search', query.search);
    return this.http.get<ArticleListResponse>('/api/articles/mine', { params });
  }

  getNextNumber(): Observable<{ number: number }> {
    return this.http.get<{ number: number }>('/api/articles/next-number');
  }

  create(payload: CreateArticlePayload): Observable<CreateArticleResponse> {
    return this.http.post<CreateArticleResponse>('/api/articles', payload);
  }

  update(id: string, payload: UpdateArticlePayload): Observable<ArticleResponse> {
    return this.http.put<ArticleResponse>(`/api/articles/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/articles/${id}`);
  }
}
