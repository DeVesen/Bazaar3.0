import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface SellerType {
  id: string;
  name: string;
  commissionRate: number;
  itemFee: number;
  sellerCount: number;
}

export interface SellerTypePayload {
  name: string;
  commissionRate: number;
  itemFee: number;
}

@Injectable({ providedIn: 'root' })
export class SellerTypeApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<SellerType[]> {
    return this.http.get<SellerType[]>('/api/seller-types');
  }

  create(payload: SellerTypePayload): Observable<SellerType> {
    return this.http.post<SellerType>('/api/seller-types', payload);
  }

  update(id: string, payload: SellerTypePayload): Observable<SellerType> {
    return this.http.put<SellerType>(`/api/seller-types/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/seller-types/${id}`);
  }
}
