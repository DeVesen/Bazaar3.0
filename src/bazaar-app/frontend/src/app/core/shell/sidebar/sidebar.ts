import { Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
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
  LucideLogOut,
} from '@lucide/angular';

export type Role = 'admin' | 'cashier';

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
    LucideLogOut,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  readonly role = input.required<Role>();
  readonly username = input.required<string>();
  readonly roleLabel = input.required<string>();
  readonly openArticlesCount = input(0);
  readonly logoutClicked = output<void>();

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
      items: group.items.filter((item) => this.role() === 'admin' || !this.isSettingsItem(item)),
    })),
  );

  readonly initials = computed(() => this.username().charAt(0).toUpperCase());

  private isSettingsItem(item: NavItem): boolean {
    return item.route === '/settings';
  }
}
