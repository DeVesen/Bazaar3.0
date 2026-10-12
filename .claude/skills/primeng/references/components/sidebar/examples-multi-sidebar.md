# Angular Sidebar Component — Multi Sidebar

## Multi Sidebar

Two stacked sidebars: a hover-to-open icon bar and a fixed secondary panel. Supabase-like IDE layout.

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { SidebarModule } from 'primeng/sidebar';
import { Home } from '@primeicons/angular/home';
import { Database } from '@primeicons/angular/database';
import { Key } from '@primeicons/angular/key';
import { Server } from '@primeicons/angular/server';
import { Globe } from '@primeicons/angular/globe';
import { Code } from '@primeicons/angular/code';
import { Cog } from '@primeicons/angular/cog';
import { ExternalLink } from '@primeicons/angular/external-link';

@Component({
    template: `
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
            <p-sidebar-layout class="min-h-192! relative!">
                @if (isMobile() && (open() || secondaryOpen())) {
                    <p-sidebar-backdrop class="absolute!" />
                }
                <!-- Icon bar - always collapsed, opens on hover as overlay -->
                <p-sidebar id="iconbar" side="left" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="true" [openOnHover]="!isMobile()" width="12rem" [(open)]="open">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!">
                                            <div class="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold leading-none">A</div>
                                            <span class="font-semibold text-sm">Acme Inc</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-header>
                            <p-sidebar-content>
                                <p-sidebar-group>
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
                                                    <svg data-p-icon="database"></svg>
                                                    <span>Database</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="key"></svg>
                                                    <span>Authentication</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="server"></svg>
                                                    <span>Edge Functions</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="globe"></svg>
                                                    <span>Storage</span>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <svg data-p-icon="code"></svg>
                                                    <span>SQL Editor</span>
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
                <!-- Secondary sidebar - always open, not collapsible -->
                <p-sidebar id="secondary" side="left" width="14rem" [collapsible]="isMobile() ? 'offcanvas' : 'none'" [overlay]="isMobile()" [(open)]="secondaryOpen">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <div class="px-1"><span class="font-semibold text-sm">Settings</span></div>
                            </p-sidebar-header>
                            <p-sidebar-content>
                                <p-sidebar-group>
                                    <p-sidebar-group-label>Configuration</p-sidebar-group-label>
                                    <p-sidebar-group-content>
                                        <p-sidebar-menu>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton [isActive]="true"><span>General</span></button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>Compute and Disk</span></button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>Infrastructure</span></button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>Integrations</span></button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>API Keys</span></button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>JWT Keys</span></button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>Log Drains</span></button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>Add-ons</span></button>
                                            </p-sidebar-menu-item>
                                        </p-sidebar-menu>
                                    </p-sidebar-group-content>
                                </p-sidebar-group>
                                <p-sidebar-group>
                                    <p-sidebar-group-label>Integrations</p-sidebar-group-label>
                                    <p-sidebar-group-content>
                                        <p-sidebar-menu>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <span>Data API</span>
                                                    <svg data-p-icon="external-link" class="ml-auto"></svg>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton><span>Vault</span></button>
                                                <p-sidebar-menu-badge>BETA</p-sidebar-menu-badge>
                                            </p-sidebar-menu-item>
                                        </p-sidebar-menu>
                                    </p-sidebar-group-content>
                                </p-sidebar-group>
                                <p-sidebar-group>
                                    <p-sidebar-group-label>Billing</p-sidebar-group-label>
                                    <p-sidebar-group-content>
                                        <p-sidebar-menu>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <span>Subscription</span>
                                                    <svg data-p-icon="external-link" class="ml-auto"></svg>
                                                </button>
                                            </p-sidebar-menu-item>
                                            <p-sidebar-menu-item>
                                                <button pSidebarMenuButton>
                                                    <span>Usage</span>
                                                    <svg data-p-icon="external-link" class="ml-auto"></svg>
                                                </button>
                                            </p-sidebar-menu-item>
                                        </p-sidebar-menu>
                                    </p-sidebar-group-content>
                                </p-sidebar-group>
                            </p-sidebar-content>
                        </p-sidebar-panel>
                    </p-sidebar-aside>
                </p-sidebar>
                <!-- Main content -->
                <p-sidebar-main>
                    <header class="flex h-12 items-center gap-2 border-b border-surface-200 dark:border-surface-700 px-4">
                        <span class="text-sm font-medium">Table Editor</span>
                        <span class="text-xs text-muted-color">/ users</span>
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
    imports: [SidebarModule, Home, Database, Key, Server, Globe, Code, Cog, ExternalLink]
})
export class SidebarMultiDemo implements OnInit {
    isMobile = signal(false);

    open = signal(false);

    secondaryOpen = signal(true);

    private mql?: MediaQueryList;

    private mqlListener?: (e: MediaQueryListEvent) => void;

    ngOnInit() {
        if (typeof window === 'undefined') return;
        this.mql = window.matchMedia('(max-width: 1023px)');
        this.isMobile.set(this.mql.matches);
        this.secondaryOpen.set(!this.mql.matches);
        this.mqlListener = (e) => {
            this.isMobile.set(e.matches);
            this.secondaryOpen.set(!e.matches);
        };
        this.mql.addEventListener('change', this.mqlListener);
    }

    ngOnDestroy() {
        this.mql?.removeEventListener('change', this.mqlListener!);
    }
}
```
