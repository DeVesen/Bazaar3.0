import { Injectable } from '@angular/core';

const TOKEN_KEY = 'bazaar_token';
const REFRESH_TOKEN_KEY = 'bazaar_refresh_token';
const ACTIVE_ROLE_KEY = 'bazaar_active_role';

@Injectable({ providedIn: 'root' })
export class TokenStore {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setRefreshToken(token: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  getActiveRole(): string | null {
    return localStorage.getItem(ACTIVE_ROLE_KEY);
  }

  setActiveRole(role: string): void {
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  }
}
