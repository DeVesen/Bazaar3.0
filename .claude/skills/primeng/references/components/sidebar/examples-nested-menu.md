# Angular Sidebar Component — Nested Menu

## Nested Menu

Menu items become collapsible to reveal a nested p-sidebar-menu-sub with deep trees and active-state tracking.

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { Sidebar } from '@primeicons/angular/sidebar';
import { ChevronDown } from '@primeicons/angular/chevron-down';
import { PIcon } from '@primeicons/angular/p-icon';

interface MenuNode {
    label: string;
    icon?: string;
    isActive?: boolean;
    children?: MenuNode[];
}

@Component({
    template: `
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
            <p-sidebar-layout class="min-h-192! relative!">
                @if (isMobile() && open()) {
                    <p-sidebar-backdrop class="absolute!" />
                }
                <p-sidebar id="nested" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [(open)]="open">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!">
                                            <div class="flex size-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold leading-none">F</div>
                                            <span class="font-semibold text-sm">File Manager</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-header>
                            <p-sidebar-content>
                                <p-sidebar-group>
                                    <p-sidebar-group-label>Files</p-sidebar-group-label>
                                    <p-sidebar-group-content>
                                        <p-sidebar-menu>
                                            @for (item of tree; track item.label) {
                                                <ng-container [ngTemplateOutlet]="node" [ngTemplateOutletContext]="{ $implicit: item }" />
                                            }
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
                            <button pSidebarRail></button>
                        </p-sidebar-panel>
                    </p-sidebar-aside>
                </p-sidebar>
                <p-sidebar-main>
                    <header class="flex h-12 items-center gap-2 border-b border-surface-200 dark:border-surface-700 px-4">
                        <button pButton pSidebarTrigger target="nested" severity="secondary" text size="small">
                            <svg data-p-icon="sidebar"></svg>
                        </button>
                        <span class="text-sm font-medium">File Manager</span>
                    </header>
                    <div class="flex-1 p-6">
                        <h1 class="text-2xl font-bold mb-4">Q1 Report</h1>
                        <p class="text-muted-color">Documents &gt; Work &gt; Projects &gt; Q1 Report</p>
                    </div>
                </p-sidebar-main>
            </p-sidebar-layout>
        </div>
        <ng-template #node let-item>
            @if (item.children?.length) {
                <p-sidebar-menu-item collapsible [defaultOpen]="hasActiveChild(item)">
                    <button pSidebarMenuButton>
                        <svg [pIcon]="item.icon"></svg>
                        <span>{{ item.label }}</span>
                        <svg data-p-icon="chevron-down" class="ml-auto transition-transform duration-200"></svg>
                    </button>
                    <p-sidebar-menu-sub>
                        @for (child of item.children; track child.label) {
                            <ng-container [ngTemplateOutlet]="node" [ngTemplateOutletContext]="{ $implicit: child }" />
                        }
                    </p-sidebar-menu-sub>
                </p-sidebar-menu-item>
            } @else {
                <p-sidebar-menu-sub-item>
                    <button pSidebarMenuSubButton [isActive]="item.isActive">
                        <span>{{ item.label }}</span>
                    </button>
                </p-sidebar-menu-sub-item>
            }
        </ng-template>
    `,
    standalone: true,
    imports: [AvatarModule, SidebarModule, ButtonModule, Sidebar, ChevronDown, PIcon]
})
export class SidebarNestedDemo implements OnInit {
    isMobile = signal(false);

    open = signal(true);

    private mql?: MediaQueryList;

    private mqlListener?: (e: MediaQueryListEvent) => void;

    tree: MenuNode[] = [
        {
            label: 'Documents',
            icon: 'folder',
            children: [
                {
                    label: 'Work',
                    children: [{ label: 'Projects', children: [{ label: 'Q1 Report', isActive: true }, { label: 'Q2 Report' }, { label: 'Roadmap' }] }, { label: 'Invoices' }, { label: 'Contracts' }]
                },
                { label: 'Personal', children: [{ label: 'Recipes' }, { label: 'Travel' }] }
            ]
        },
        {
            label: 'Media',
            icon: 'image',
            children: [
                { label: 'Photos', children: [{ label: '2024' }, { label: '2025' }] },
                { label: 'Videos', icon: 'video', children: [{ label: 'Tutorials' }, { label: 'Recordings' }] }
            ]
        },
        { label: 'Websites', icon: 'globe', children: [{ label: 'Blog' }, { label: 'Portfolio' }, { label: 'Documentation' }] }
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

    hasActiveChild(item: MenuNode): boolean {
        if (item.isActive) return true;

        return item.children?.some((c) => this.hasActiveChild(c)) ?? false;
    }
}
```
