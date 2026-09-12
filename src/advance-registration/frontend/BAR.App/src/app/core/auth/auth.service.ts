import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStore } from './token-store';
import { DecodedToken, decodeJwt } from './jwt-decoder';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenStore = inject(TokenStore);
  private readonly router = inject(Router);

  // Reset hooks instead of a dependency on RoleService: AuthService must not
  // know anything that itself injects AuthService (RoleService does that).
  private readonly logoutResets = new Set<() => void>();

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

  // Called on logout so derived state doesn't linger.
  registerLogoutReset(reset: () => void): void {
    this.logoutResets.add(reset);
  }

  logout(): void {
    this.tokenStore.clear();
    this.currentUser.set(null);
    for (const reset of this.logoutResets) {
      reset();
    }
    void this.router.navigateByUrl('/login');
  }

  private decodeStoredToken(): DecodedToken | null {
    const token = this.tokenStore.getToken();
    return token ? decodeJwt(token) : null;
  }
}
