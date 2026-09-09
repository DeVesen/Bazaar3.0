import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  address?: string;
  postalCode: string;
  city: string;
  phone: string;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<TokenPair> {
    return this.http.post<TokenPair>('/api/auth/login', { email, password });
  }

  register(payload: RegisterPayload): Observable<TokenPair> {
    return this.http.post<TokenPair>('/api/auth/register', payload);
  }
}
