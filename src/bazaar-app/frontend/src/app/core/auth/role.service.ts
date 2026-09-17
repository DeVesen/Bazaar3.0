import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly authService = inject(AuthService);
  readonly isAdmin = computed(() => this.authService.role() === 'admin');
}
