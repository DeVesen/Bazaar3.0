import { Injectable, computed, inject, signal } from '@angular/core';
import { DecodedToken, decodeJwt } from './jwt-decoder';
import { TokenStore } from './token-store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStore = inject(TokenStore);

  readonly currentUser = signal<DecodedToken | null>(this.loadValidStoredToken());

  readonly isLoggedIn = computed(() => this.currentUser() !== null);
  readonly role = computed(() => this.currentUser()?.role ?? null);
  readonly mustChangePassword = computed(() => this.currentUser()?.mustChangePassword ?? false);

  login(accessToken: string): void {
    this.tokenStore.setToken(accessToken);
    this.currentUser.set(decodeJwt(accessToken));
  }

  logout(): void {
    this.tokenStore.clear();
    this.currentUser.set(null);
  }

  // Actively discards an expired stored token instead of just treating it as
  // "not logged in" — keeps localStorage in sync with the signal from boot.
  private loadValidStoredToken(): DecodedToken | null {
    const token = this.tokenStore.getToken();
    if (!token) return null;
    const decoded = decodeJwt(token);
    if (!decoded || decoded.exp * 1000 <= Date.now()) {
      this.tokenStore.clear();
      return null;
    }
    return decoded;
  }
}
