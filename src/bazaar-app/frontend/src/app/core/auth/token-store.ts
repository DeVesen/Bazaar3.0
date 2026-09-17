import { Injectable } from '@angular/core';

const TOKEN_KEY = 'bazaar_token';

// Only class in core/auth allowed to touch localStorage directly (AC-1).
@Injectable({ providedIn: 'root' })
export class TokenStore {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}
