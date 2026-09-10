import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenPair } from '../../../core/auth/auth-api.service';

@Injectable({ providedIn: 'root' })
export class SetPasswordApiService {
  private readonly http = inject(HttpClient);

  setPassword(inviteToken: string, password: string): Observable<TokenPair> {
    return this.http.post<TokenPair>('/api/auth/set-password', { inviteToken, password });
  }
}
