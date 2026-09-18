import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { SellerType } from '../components/typ-popup/typ-popup';

export type { SellerType };

@Injectable({ providedIn: 'root' })
export class SellerTypesApi {
  private readonly http = inject(HttpClient);

  getAll(): Observable<SellerType[]> {
    return this.http.get<SellerType[]>('/api/seller-types');
  }

  create(name: string, commissionRate: number, itemFee: number): Observable<SellerType> {
    return this.http.post<SellerType>('/api/seller-types', { name, commissionRate, itemFee });
  }

  update(id: string, name: string, commissionRate: number, itemFee: number): Observable<void> {
    return this.http.put<void>(`/api/seller-types/${id}`, { name, commissionRate, itemFee });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`/api/seller-types/${id}`);
  }
}
