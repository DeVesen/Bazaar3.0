# Angular Sidebar Component — Dual Sidebar

## Dual Sidebar

Two sidebars on opposite sides with independent triggers. The left is icon-collapsible navigation, the right is an offcanvas chat panel.

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { Home } from '@primeicons/angular/home';
import { Inbox } from '@primeicons/angular/inbox';
import { Search } from '@primeicons/angular/search';
import { Bell } from '@primeicons/angular/bell';
import { ChartBar } from '@primeicons/angular/chart-bar';
import { ChevronDown } from '@primeicons/angular/chevron-down';
import { Users } from '@primeicons/angular/users';
import { Calendar } from '@primeicons/angular/calendar';
import { Cog } from '@primeicons/angular/cog';
import { Sidebar } from '@primeicons/angular/sidebar';
import { Comment } from '@primeicons/angular/comment';

@Component({
    template: `
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
            <p-sidebar-layout class="min-h-192! relative!">
                @if (isMobile() && (navOpen() || open())) {
                    <p-sidebar-backdrop class="absolute!" />
                }
                <p-sidebar id="nav" side="left" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [(open)]="navOpen" width="14rem">
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
                                    <p-sidebar-group-label>Navigation</p-sidebar-group-label>
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
                                                <p-sidebar-menu-badge>5</p-sidebar-menu-badge>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="search"></svg>
                                                    <span>Search</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="bell"></svg>
                                                    <span>Notifications</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                        </p-sidebar-menu>
                                    </p-sidebar-group-content>
                                </p-sidebar-group>
                                <p-sidebar-group>
                                    <p-sidebar-group-label>Projects</p-sidebar-group-label>
                                    <p-sidebar-group-content>
                                        <p-sidebar-menu>
                                            <p-sidebar-menu-item collapsible [defaultOpen]="true">
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="chart-bar"></svg>
                                                    <span>Analytics</span>
                                                    <svg data-p-icon="chevron-down" class="ml-auto transition-transform duration-200"></svg>
                                                </button>
                                                <p-sidebar-menu-sub>
                                                    <p-sidebar-menu-sub-item>
                                                        <button pSidebarMenuSubButton [isActive]="true">Overview</button>
                                                    </p-sidebar-menu-sub-item>
                                                    <p-sidebar-menu-sub-item>
                                                        <button pSidebarMenuSubButton>Reports</button>
                                                    </p-sidebar-menu-sub-item>
                                                </p-sidebar-menu-sub>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="users"></svg>
                                                    <span>Team</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="calendar"></svg>
                                                    <span>Calendar</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                        </p-sidebar-menu>
                                    </p-sidebar-group-content>
                                </p-sidebar-group>
                            </p-sidebar-content>
                            <p-sidebar-footer>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton>
                                            <svg data-p-icon="cog"></svg>
                                            <span>Settings</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-footer>
                        </p-sidebar-panel>
                    </p-sidebar-aside>
                </p-sidebar>
                <p-sidebar-main>
                    <header class="flex h-12 items-center gap-2 border-b border-surface-200 dark:border-surface-700 px-4">
                        <button pButton pSidebarTrigger target="nav" severity="secondary" text size="small">
                            <svg data-p-icon="sidebar"></svg>
                        </button>
                        <span class="text-sm font-medium flex-1">Dashboard</span>
                        <button pButton pSidebarTrigger target="ai" severity="secondary" text size="small">
                            <svg data-p-icon="comment"></svg>
                        </button>
                    </header>
                    <div class="flex-1 p-4 flex flex-col gap-4">
                        <div class="rounded-lg bg-surface-100 dark:bg-surface-800 h-48"></div>
                        <div class="rounded-lg bg-surface-100 dark:bg-surface-800 flex-1"></div>
                    </div>
                </p-sidebar-main>
                <p-sidebar id="ai" side="right" collapsible="offcanvas" [overlay]="true" [(open)]="open" width="18rem">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <div class="flex items-center gap-2 px-1">
                                    <span class="font-semibold text-sm text-surface-500">Weekly metrics overview</span>
                                </div>
                            </p-sidebar-header>
                            <p-sidebar-content>
                                <div class="flex flex-col gap-4 px-3 py-2">
                                    <div class="rounded-xl bg-surface-100 dark:bg-surface-800 px-3 py-2.5 text-sm">Show me this week&apos;s metrics</div>
                                    <div class="text-sm leading-relaxed">
                                        <p>Here are your key metrics for this week:</p>
                                        <ul class="mt-2 space-y-1.5 text-muted-color">
                                            <li class="flex justify-between">
                                                <span>Page views</span>
                                                <span class="font-medium text-color">12,482</span>
                                            </li>
                                            <li class="flex justify-between">
                                                <span>New users</span>
                                                <span class="font-medium text-color">342</span>
                                            </li>
                                            <li class="flex justify-between">
                                                <span>Bounce rate</span>
                                                <span class="font-medium text-color">34%</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </p-sidebar-content>
                            <p-sidebar-footer>
                                <div class="mx-1 rounded-xl border border-surface-200 dark:border-surface-700 px-3 py-2.5">
                                    <input type="text" placeholder="Reply to Claude..." class="w-full bg-transparent border-none outline-none text-sm" />
                                </div>
                            </p-sidebar-footer>
                        </p-sidebar-panel>
                    </p-sidebar-aside>
                </p-sidebar>
            </p-sidebar-layout>
        </div>
    `,
    standalone: true,
    imports: [SidebarModule, ButtonModule, Home, Inbox, Search, Bell, ChartBar, ChevronDown, Users, Calendar, Cog, Sidebar, Comment]
})
export class SidebarDualDemo implements OnInit {
    isMobile = signal(false);

    navOpen = signal(true);

    open = signal(false);

    private mql?: MediaQueryList;

    private mqlListener?: (e: MediaQueryListEvent) => void;

    ngOnInit() {
        if (typeof window === 'undefined') return;
        this.mql = window.matchMedia('(max-width: 1023px)');
        this.isMobile.set(this.mql.matches);
        this.navOpen.set(!this.mql.matches);
        this.mqlListener = (e) => {
            this.isMobile.set(e.matches);
            this.navOpen.set(!e.matches);
        };
        this.mql.addEventListener('change', this.mqlListener);
    }

    ngOnDestroy() {
        this.mql?.removeEventListener('change', this.mqlListener!);
    }
}
```
