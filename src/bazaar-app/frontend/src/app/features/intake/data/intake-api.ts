import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * POST /api/intake request line (api/intake.md), matching the backend's `IntakeArticleLine`
 * (`Bazaar.Application.Intake.IntakeCommand.cs`) field-for-field — PascalCase C# properties
 * serialize camelCase by default (`System.Text.Json`'s default naming policy).
 */
export interface IntakeArticleLine {
  number: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  size?: string | null;
  color?: string | null;
  description?: string | null;
  deleteArticleNumber?: number;
}

/** Response shape of POST /api/intake, matching the backend's `IntakeResponseDto`
 * (`Bazaar.Api.Features.Intake.IntakeEndpoints`). */
export interface IntakeResult {
  articleIds: string[];
  intakeFeePaid: number;
}

@Injectable({ providedIn: 'root' })
export class IntakeApi {
  private readonly http = inject(HttpClient);

  bookIntake(sellerId: string, feeAmount: number, articles: IntakeArticleLine[]): Observable<IntakeResult> {
    return this.http.post<IntakeResult>('/api/intake', { sellerId, feeAmount, articles });
  }
}
