import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

interface BootstrapStatusResponse {
  hasAdmin: boolean;
}

@Injectable({ providedIn: 'root' })
export class BootstrapStatusService {
  private readonly http = inject(HttpClient);

  hasAdmin(): Observable<boolean> {
    return this.http
      .get<BootstrapStatusResponse>('/api/public/bootstrap-status')
      .pipe(map((response) => response.hasAdmin));
  }
}
