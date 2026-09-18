import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Brand {
  id: string;
  name: string;
  original: boolean;
  articleCount: number;
}

@Injectable({ providedIn: 'root' })
export class BrandsApi {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Brand[]> {
    return this.http.get<Brand[]>('/api/brands');
  }

  create(name: string): Observable<Brand> {
    return this.http.post<Brand>('/api/brands', { name });
  }

  update(id: string, name: string, original: boolean): Observable<void> {
    return this.http.put<void>(`/api/brands/${id}`, { name, original });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/brands/${id}`);
  }
}
