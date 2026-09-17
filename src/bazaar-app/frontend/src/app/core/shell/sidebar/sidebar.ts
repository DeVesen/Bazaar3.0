import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { Popover, PopoverModule } from 'primeng/popover';
import {
  LucideInbox,
  LucideShoppingCart,
  LucideReceipt,
  LucideUsers,
  LucideTag,
  LucideBookmark,
  LucideFolder,
  LucideUserCog,
  LucideBarChart3,
  LucideSettings,
} from '@lucide/angular';
import { AuthService } from '../../auth/auth.service';
import { RoleService } from '../../auth/role.service';

interface NavItem {
  label: string;
  route: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    SidebarModule,
    AvatarModule,
    ButtonModule,
    BadgeModule,
    PopoverModule,
    LucideInbox,
    LucideShoppingCart,
    LucideReceipt,
    LucideUsers,
    LucideTag,
    LucideBookmark,
    LucideFolder,
    LucideUserCog,
    LucideBarChart3,
    LucideSettings,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleService);
  private readonly router = inject(Router);

  readonly isAdmin = this.roleService.isAdmin;
  readonly username = computed(() => this.authService.currentUser()?.name ?? '');
  readonly roleLabel = computed(() => (this.isAdmin() ? 'Admin' : 'Kassenpersonal'));
  readonly initials = computed(() => this.username().charAt(0).toUpperCase());
  readonly openArticlesCount = signal(0); // Datenanbindung folgt mit Epic_Artikelannahme
  readonly footerMenu = viewChild.required<Popover>('footerMenu');

  private readonly navGroups: NavGroup[] = [
    { label: 'Tagesgeschäft', items: [
      { label: 'Artikelannahme', route: '/intake' },
      { label: 'Verkauf', route: '/checkout' },
      { label: 'Abrechnung', route: '/settlement' },
    ]},
    { label: 'Stammdaten', items: [
      { label: 'Verkäufer', route: '/sellers' },
      { label: 'Artikel', route: '/articles' },
      { label: 'Marken', route: '/brands' },
      { label: 'Kategorien', route: '/categories' },
      { label: 'Verkäufer-Typen', route: '/seller-types' },
    ]},
    { label: 'System', items: [
      { label: 'Statistik', route: '/statistics' },
      { label: 'Einstellungen', route: '/settings' },
    ]},
  ];

  readonly visibleGroups = computed(() =>
    this.navGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => this.isAdmin() || !this.isSettingsItem(item)),
    })),
  );

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  private isSettingsItem(item: NavItem): boolean {
    return item.route === '/settings';
  }
}
