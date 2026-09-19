import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SellerSettlementSeller {
  id: string;
  firstName: string;
  lastName: string;
  address: string | null;
  postalCode: string | null;
  city: string | null;
}

/** Response shape of `GET /api/sellers/{id}/settlement` (api/settlement.md §1,
 * `Bazaar.Api.Features.Settlement.SettlementEndpoints`'s `SellerSettlementDto`). */
export interface SellerSettlement {
  seller: SellerSettlementSeller;
  openCount: number;
  soldCount: number;
  returnedCount: number;
  revenue: number;
  commissionRate: number;
  commission: number;
  payout: number;
  intakeFeePaid: number;
  notDeliveredCount: number;
  settledAt: string | null;
  payoutAmount: number | null;
  canSettle: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettlementApi {
  private readonly http = inject(HttpClient);

  getSettlement(sellerId: string): Observable<SellerSettlement> {
    return this.http.get<SellerSettlement>(`/api/sellers/${sellerId}/settlement`);
  }

  returnArticle(articleId: string): Observable<void> {
    return this.http.put<void>(`/api/articles/${articleId}/return`, null);
  }
}
