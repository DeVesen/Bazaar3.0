# Angular Sidebar Component — Responsive

## Responsive

Below 1024px the sidebar turns into an offcanvas overlay with a backdrop. Above that it stays in icon mode pushing the inset.

```typescript
import { Component, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { Home } from '@primeicons/angular/home';
import { Inbox } from '@primeicons/angular/inbox';
import { Search } from '@primeicons/angular/search';
import { Users } from '@primeicons/angular/users';
import { Bell } from '@primeicons/angular/bell';
import { Cog } from '@primeicons/angular/cog';
import { Sidebar } from '@primeicons/angular/sidebar';

@Component({
    template: `
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
            <p-sidebar-layout class="min-h-192! relative!">
                @if (isMobile()) {
                    <p-sidebar-backdrop class="absolute!" />
                }
                <p-sidebar id="mobile-nav" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [open]="!isMobile()" width="14rem">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!">
                                            <div class="flex size-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold leading-none">A</div>
                                            <span class="font-semibold text-sm">Acme Inc</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-header>
                            <p-sidebar-content>
                                <p-sidebar-group>
                                    <p-sidebar-group-label>Menu</p-sidebar-group-label>
                                    <p-sidebar-group-content>
                                        <p-sidebar-menu>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton [isActive]="true">
                                                    <svg data-p-icon="home"></svg>
                                                    <span>Home</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="inbox"></svg>
                                                    <span>Inbox</span>
                                                </button>
                                                <p-sidebar-menu-badge>3</p-sidebar-menu-badge>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="search"></svg>
                                                    <span>Search</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="users"></svg>
                                                    <span>Team</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="bell"></svg>
                                                    <span>Notifications</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="cog"></svg>
                                                    <span>Settings</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                        </p-sidebar-menu>
                                    </p-sidebar-group-content>
                                </p-sidebar-group>
                            </p-sidebar-content>
                            <p-sidebar-footer>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!">
                                            <p-avatar label="JD" shape="circle" class="size-6 shrink-0 text-xs" />
                                            <span>John Doe</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-footer>
                        </p-sidebar-panel>
                    </p-sidebar-aside>
                </p-sidebar>
                <p-sidebar-main>
                    <header class="flex h-12 items-center gap-2 border-b border-surface-200 dark:border-surface-700 px-4">
                        <button pButton pSidebarTrigger target="mobile-nav" severity="secondary" text size="small">
                            <svg data-p-icon="sidebar"></svg>
                        </button>
                        <span class="text-sm font-medium">Dashboard</span>
                        <span class="ml-auto text-xs text-muted-color rounded-md bg-surface-100 dark:bg-surface-800 px-2 py-1">{{ isMobile() ? 'Mobile' : 'Desktop' }}</span>
                    </header>
                    <div class="flex-1 p-4 flex flex-col gap-4">
                        <div class="rounded-lg bg-surface-100 dark:bg-surface-800 h-48"></div>
                        <div class="rounded-lg bg-surface-100 dark:bg-surface-800 flex-1"></div>
                    </div>
                </p-sidebar-main>
            </p-sidebar-layout>
        </div>
    `,
    standalone: true,
    imports: [AvatarModule, SidebarModule, ButtonModule, Home, Inbox, Search, Users, Bell, Cog, Sidebar]
})
export class SidebarResponsiveDemo {
    isMobile = signal(false);

    constructor() {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia('(max-width: 1023px)');
        this.isMobile.set(mql.matches);
        mql.addEventListener('change', (e) => this.isMobile.set(e.matches));
    }
}
```
