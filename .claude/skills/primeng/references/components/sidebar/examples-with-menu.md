# Angular Sidebar Component — With Menu

## With Menu

Full application chrome with workspace switcher, grouped navigation and user footer. Collapses to icon mode.

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { ChevronDown } from '@primeicons/angular/chevron-down';
import { Check } from '@primeicons/angular/check';
import { Home } from '@primeicons/angular/home';
import { Inbox } from '@primeicons/angular/inbox';
import { Search } from '@primeicons/angular/search';
import { Users } from '@primeicons/angular/users';
import { Bell } from '@primeicons/angular/bell';
import { Sidebar } from '@primeicons/angular/sidebar';

interface Company {
    name: string;
    logo: string;
    color: string;
}

@Component({
    template: `
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
            <p-sidebar-layout class="min-h-192! relative!">
                @if (isMobile() && open()) {
                    <p-sidebar-backdrop class="absolute!" />
                }
                <p-sidebar id="menu-demo" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [(open)]="open">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!" (click)="companyMenu.toggle($event)">
                                            <div class="flex size-6 shrink-0 items-center justify-center rounded-md text-white text-xs font-bold leading-none bg-linear-to-br" [class]="activeCompany.color">
                                                {{ activeCompany.logo }}
                                            </div>
                                            <span class="font-semibold text-sm">{{ activeCompany.name }}</span>
                                            <svg data-p-icon="chevron-down" class="ml-auto"></svg>
                                        </button>
                                        <p-menu #companyMenu [model]="companyItems" [popup]="true" appendTo="body">
                                            <ng-template #item let-item>
                                                @if (item.separator) {
                                                    <hr class="border-surface-200 dark:border-surface-700 my-1" />
                                                } @else if (item.logo) {
                                                    <a class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md" (click)="item.command?.()">
                                                        <div class="flex size-5  …(lange Zeile gekürzt)
                                                        <span class="text-sm">{{ item.label }}</span>
                                                        @if (item.active) {
                                                            <svg data-p-icon="check" class="ml-auto"></svg>
                                                        }
                                                    </a>
                                                } @else {
                                                    <a class="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 rounded-md" (click)="item.command?.()">
                                                        @if (item.icon) {
                                                            <span [class]="item.icon"></span>
                                                        }
                                                        <span class="text-sm">{{ item.label }}</span>
                                                    </a>
                                                }
                                            </ng-template>
                                        </p-menu>
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
                                        </p-sidebar-menu>
                                    </p-sidebar-group-content>
                                </p-sidebar-group>
                            </p-sidebar-content>
                            <p-sidebar-footer>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!" (click)="userMenu.toggle($event)">
                                            <p-avatar label="JD" shape="circle" class="size-6 shrink-0 text-xs" />
                                            <span>John Doe</span>
                                            <svg data-p-icon="chevron-down" class="ml-auto"></svg>
                                        </button>
                                        <p-menu #userMenu [model]="userItems" [popup]="true" appendTo="body" />
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-footer>
                            <button pSidebarRail></button>
                        </p-sidebar-panel>
                    </p-sidebar-aside>
                </p-sidebar>
                <p-sidebar-main>
                    <header class="flex h-12 items-center gap-2 border-b border-surface-200 dark:border-surface-700 px-4">
                        <button pButton pSidebarTrigger target="menu-demo" severity="secondary" text size="small">
                            <svg data-p-icon="sidebar"></svg>
                        </button>
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
    imports: [AvatarModule, MenuModule, SidebarModule, ButtonModule, ChevronDown, Check, Home, Inbox, Search, Users, Bell, Sidebar]
})
export class SidebarMenuDemo implements OnInit {
    isMobile = signal(false);

    open = signal(true);

    private mql?: MediaQueryList;

    private mqlListener?: (e: MediaQueryListEvent) => void;

    companies: Company[] = [
        { name: 'Acme Inc', logo: 'A', color: 'from-violet-500 to-indigo-600' },
        { name: 'Globex Corp', logo: 'G', color: 'from-emerald-500 to-teal-600' },
        { name: 'Initech', logo: 'I', color: 'from-orange-500 to-red-600' }
    ];

    activeCompany = this.companies[0];

    companyItems: MenuItem[] = [
        {
            label: 'Companies',
            items: [
                ...this.companies.map((c: any) => ({
                    label: c.name,
                    logo: c.logo,
                    color: c.color,
                    active: this.activeCompany.name === c.name,
                    command: () => {
                        this.activeCompany = c;
                        this.updateCompanyActive();
                    }
                })),
                { separator: true },
                { label: 'Add company', icon: 'pi pi-plus' }
            ]
        }
    ];

    userItems: MenuItem[] = [
        {
            label: 'john@acme.com',
            items: [{ label: 'Settings', icon: 'pi pi-cog' }, { label: 'Notifications', icon: 'pi pi-bell' }, { separator: true }, { label: 'Sign out', icon: 'pi pi-sign-out' }]
        }
    ];

    ngOnInit() {
        if (typeof window === 'undefined') return;
        this.mql = window.matchMedia('(max-width: 1023px)');
        this.isMobile.set(this.mql.matches);
        this.open.set(!this.mql.matches);
        this.mqlListener = (e) => {
            this.isMobile.set(e.matches);
            this.open.set(!e.matches);
        };
        this.mql.addEventListener('change', this.mqlListener);
    }

    ngOnDestroy() {
        this.mql?.removeEventListener('change', this.mqlListener!);
    }

    updateCompanyActive(): void {
        const items = (this.companyItems[0] as any).items;

        items.forEach((item: any) => {
            if (item.logo) {
                item.active = this.activeCompany.name === item.label;
            }
        });
    }
}
```
