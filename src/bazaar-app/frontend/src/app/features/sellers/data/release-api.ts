import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Response shape of POST /api/release, matching the backend's response DTO
 * (`Bazaar.Api.Features.Release.ReleaseEndpoints`) — mirrors `IntakeResult`'s shape
 * (`intake-api.ts`) field-for-field for the release flow.
 */
export interface ReleaseResult {
  releasedCount: number;
  intakeFeePaid: number;
}

@Injectable({ providedIn: 'root' })
export class ReleaseApi {
  private readonly http = inject(HttpClient);

  bookRelease(sellerId: string, feeAmount: number, articleIds: readonly string[]): Observable<ReleaseResult> {
    return this.http.post<ReleaseResult>('/api/release', { sellerId, feeAmount, articleIds });
  }
}
