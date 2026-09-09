import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { LucideLogOut } from '@lucide/angular';
import { AuthService } from '../../auth/auth.service';
import { RoleService, Role } from '../../auth/role.service';
import { SidebarTitle } from './sidebar-title';

interface NavItem {
  label: string;
  route: string;
}

interface NavGroup {
  label: string;
  roles: Role[];
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  { label: 'Mein Bereich', roles: ['admin', 'seller'], items: [
    { label: 'Home', route: '/home' },
    { label: 'Meine Artikel', route: '/my-articles' }
  ]},
  { label: 'Verwaltung', roles: ['admin'], items: [
    { label: 'Verkäufer', route: '/sellers' },
    { label: 'Artikel', route: '/articles' }
  ]},
  { label: 'Stammdaten', roles: ['admin'], items: [
    { label: 'Marken', route: '/brands' },
    { label: 'Kategorien', route: '/categories' },
    { label: 'Verkäufer-Typen', route: '/seller-types' }
  ]},
  { label: 'System', roles: ['admin'], items: [
    { label: 'Profil', route: '/profile' },
    { label: 'Einstellungen', route: '/settings' },
    { label: 'Export', route: '/export' }
  ]},
  { label: 'Konto', roles: ['seller'], items: [
    { label: 'Profil', route: '/profile' },
    { label: 'Nummernblöcke', route: '/number-blocks' }
  ]}
];

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink, RouterLinkActive, FormsModule,
    AvatarModule, SelectButtonModule, ButtonModule, SidebarModule,
    LucideLogOut,
    SidebarTitle
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  protected readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);

  readonly open = input(true);
  readonly openChange = output<boolean>();

  readonly isAdmin = computed(() => this.authService.currentUser()?.role === 'admin');
  readonly activeRole = this.roleService.activeRole;

  readonly visibleGroups = computed(() =>
    NAV_GROUPS.filter((group) => group.roles.includes(this.activeRole()))
  );

  readonly initials = computed(() => (this.authService.currentUser()?.sub ?? '?').charAt(0).toUpperCase());

  readonly roleOptions = [
    { label: 'Admin', value: 'admin' as Role },
    { label: 'Verkäufer', value: 'seller' as Role }
  ];

  setRole(role: Role): void {
    this.roleService.setRole(role);
  }

  logout(): void {
    this.authService.logout();
  }
}
