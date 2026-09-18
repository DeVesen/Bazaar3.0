import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: string;
  name: string;
  original: boolean;
  articleCount: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriesApi {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/categories');
  }

  create(name: string): Observable<Category> {
    return this.http.post<Category>('/api/categories', { name });
  }

  update(id: string, name: string, original: boolean): Observable<void> {
    return this.http.put<void>(`/api/categories/${id}`, { name, original });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/categories/${id}`);
  }
}
