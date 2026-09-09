import { Injectable, inject, signal } from '@angular/core';
import { TokenStore } from './token-store';
import { AuthService } from './auth.service';

export type Role = 'admin' | 'seller';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly tokenStore = inject(TokenStore);
  private readonly authService = inject(AuthService);

  readonly activeRole = signal<Role>(this.initialRole());

  setRole(role: Role): void {
    this.activeRole.set(role);
    this.tokenStore.setActiveRole(role);
  }

  private initialRole(): Role {
    const stored = this.tokenStore.getActiveRole();
    if (stored === 'admin' || stored === 'seller') {
      return stored;
    }
    return this.authService.currentUser()?.role ?? 'seller';
  }
}
