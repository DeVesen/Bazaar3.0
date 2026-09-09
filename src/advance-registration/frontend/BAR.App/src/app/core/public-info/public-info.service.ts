import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface PublicInfo {
  registrationDeadline: string | null;
  dropOffFrom: string | null;
  dropOffUntil: string | null;
  bazaarFrom: string | null;
  bazaarUntil: string | null;
  defaultConditions: { commissionRate: number; itemFee: number } | null;
  infoText: string | null;
}

@Injectable({ providedIn: 'root' })
export class PublicInfoService {
  private readonly http = inject(HttpClient);

  get(): Observable<PublicInfo> {
    return this.http.get<PublicInfo>('/api/public/info');
  }
}
