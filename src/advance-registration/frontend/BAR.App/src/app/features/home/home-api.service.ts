import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TypeConditions {
  commissionRate: number;
  itemFee: number;
}

export interface SellerHomeResponse {
  articleCount: number;
  typeConditions: TypeConditions;
}

export interface HeatmapEntryResponse {
  date: string;
  count: number;
}

export interface AdminHomeResponse {
  sellerCount: number;
  articleCount: number;
  categoryCount: number;
  brandCount: number;
  heatmapData: HeatmapEntryResponse[];
}

@Injectable({ providedIn: 'root' })
export class HomeApiService {
  private readonly http = inject(HttpClient);

  getSellerHome(): Observable<SellerHomeResponse> {
    return this.http.get<SellerHomeResponse>('/api/home/seller');
  }

  getAdminHome(): Observable<AdminHomeResponse> {
    return this.http.get<AdminHomeResponse>('/api/home/admin');
  }
}
