import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

/** `Bazaar.Api.Features.Statistics.StatisticsEndpoints`'s `ArticlesDto`. */
export interface StatisticsArticles {
  total: number;
  accepted: number;
  selling: number;
  sold: number;
  returned: number;
  sellRate: number | null;
}

/** `Bazaar.Api.Features.Statistics.StatisticsEndpoints`'s `ValuesDto`. */
export interface StatisticsValues {
  acceptedValue: number;
  returnedValue: number;
  openValue: number;
}

/** `Bazaar.Api.Features.Statistics.StatisticsEndpoints`'s `FinanceDto`. */
export interface StatisticsFinance {
  grossIncome: number;
  grossIncomeManual: number;
  commission: number;
  fees: number;
  earningsTotal: number;
  payoutExpected: number;
  payoutSettled: number;
}

/** `Bazaar.Api.Features.Statistics.StatisticsEndpoints`'s `LeaderboardRowDto`. */
export interface LeaderboardRow {
  rank: number;
  sellerId: string;
  sellerName: string;
  sellerType: string;
  accepted: number;
  sold: number;
  revenue: number;
  payout: number;
  settled: boolean;
}

/** Response shape of `GET /api/statistics` (api/statistics.md,
 * `Bazaar.Api.Features.Statistics.StatisticsEndpoints`'s `StatisticsDto`). */
export interface Statistics {
  articles: StatisticsArticles;
  values: StatisticsValues;
  finance: StatisticsFinance;
  leaderboard: LeaderboardRow[];
}

@Injectable({ providedIn: 'root' })
export class StatisticsApi {
  private readonly http = inject(HttpClient);

  /** `sellerTypeId` filters only the leaderboard (api/statistics.md) — omitted from the
   * request entirely when `null` rather than sent as an empty/`"null"` param. */
  getStatistics(sellerTypeId: string | null): Observable<Statistics> {
    let params = new HttpParams();
    if (sellerTypeId !== null) {
      params = params.set('sellerTypeId', sellerTypeId);
    }
    return this.http.get<Statistics>('/api/statistics', { params });
  }
}
