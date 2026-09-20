import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BootstrapAdminResponse {
  accessToken: string;
}

@Injectable({ providedIn: 'root' })
export class BootstrapApi {
  private readonly http = inject(HttpClient);

  bootstrapAdmin(username: string, password: string): Observable<BootstrapAdminResponse> {
    return this.http.post<BootstrapAdminResponse>('/api/public/bootstrap-admin', { username, password });
  }
}
