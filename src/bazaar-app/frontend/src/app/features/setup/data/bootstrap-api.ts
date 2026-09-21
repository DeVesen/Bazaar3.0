import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BootstrapAdminResponse {
  accessToken: string;
}

export interface SetupSellerType {
  name: string;
  commissionRate: number;
  itemFee: number;
}

export interface CompleteSetupRequest {
  username: string;
  password: string;
  sellerTypes: SetupSellerType[];
  brandNames: string[];
  categoryNames: string[];
}

@Injectable({ providedIn: 'root' })
export class BootstrapApi {
  private readonly http = inject(HttpClient);

  bootstrapAdmin(username: string, password: string): Observable<BootstrapAdminResponse> {
    return this.http.post<BootstrapAdminResponse>('/api/public/bootstrap-admin', { username, password });
  }

  completeSetup(request: CompleteSetupRequest): Observable<void> {
    return this.http.post<void>('/api/public/setup-complete', request);
  }
}
