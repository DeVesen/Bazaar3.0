import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BootstrapStatus {
  hasAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class BootstrapStatusService {
  private readonly http = inject(HttpClient);

  getStatus(): Observable<BootstrapStatus> {
    return this.http.get<BootstrapStatus>('/api/public/bootstrap-status');
  }
}
