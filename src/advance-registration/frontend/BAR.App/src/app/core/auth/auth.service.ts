import { Injectable, computed, inject, signal } from '@angular/core';
import { TokenStore } from './token-store';
import { DecodedToken, decodeJwt } from './jwt-decoder';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStore = inject(TokenStore);

  readonly currentUser = signal<DecodedToken | null>(this.decodeStoredToken());

  readonly isLoggedIn = computed(() => {
    const user = this.currentUser();
    return user !== null && user.exp * 1000 > Date.now();
  });

  login(accessToken: string, refreshToken: string): void {
    this.tokenStore.setToken(accessToken);
    this.tokenStore.setRefreshToken(refreshToken);
    this.currentUser.set(decodeJwt(accessToken));
  }

  logout(): void {
    this.tokenStore.clear();
    this.currentUser.set(null);
  }

  private decodeStoredToken(): DecodedToken | null {
    const token = this.tokenStore.getToken();
    return token ? decodeJwt(token) : null;
  }
}
