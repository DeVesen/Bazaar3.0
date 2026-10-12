# Angular Sidebar Component — Chat Application

## Chat Application

ChatGPT-style history sidebar with grouped sessions and hover-revealed delete action on each entry.

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { Sparkles } from '@primeicons/angular/sparkles';
import { Search } from '@primeicons/angular/search';
import { PenToSquare } from '@primeicons/angular/pen-to-square';
import { Globe } from '@primeicons/angular/globe';
import { Trash } from '@primeicons/angular/trash';
import { Sidebar } from '@primeicons/angular/sidebar';

interface ChatEntry {
    title: string;
    active?: boolean;
}

interface ChatGroup {
    label: string;
    chats: ChatEntry[];
}

@Component({
    template: `
        <div class="border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
            <p-sidebar-layout class="min-h-192! relative!">
                @if (isMobile() && open()) {
                    <p-sidebar-backdrop class="absolute!" />
                }
                <p-sidebar id="chat-history" [collapsible]="isMobile() ? 'offcanvas' : 'icon'" [overlay]="isMobile()" [(open)]="open" width="16rem">
                    <p-sidebar-spacer />
                    <p-sidebar-aside>
                        <p-sidebar-panel>
                            <p-sidebar-header>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton class="p-1!">
                                            <div class="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-900 dark:bg-surface-0">
                                                <svg data-p-icon="sparkles" [size]="12" class="text-surface-0 dark:text-surface-900"></svg>
                                            </div>
                                            <span class="font-semibold text-sm">ChatGPT</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                                <p-sidebar-menu>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton>
                                            <svg data-p-icon="search"></svg>
                                            <span>Search</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton>
                                            <svg data-p-icon="pen-to-square"></svg>
                                            <span>New chat</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                    <p-sidebar-menu-item>
                                        <button pSidebarMenuButton>
                                            <svg data-p-icon="globe"></svg>
                                            <span>Browse web</span>
                                        </button>
                                    </p-sidebar-menu-item>
                                </p-sidebar-menu>
                            </p-sidebar-header>
                            <p-sidebar-content>
                                @for (group of chatHistory; track group.label) {
                                    <p-sidebar-group>
                                        <p-sidebar-group-label>{{ group.label }}</p-sidebar-group-label>
                                        <p-sidebar-group-content>
                                            <p-sidebar-menu>
                                                @for (chat of group.chats; track chat.title) {
                                                    <p-sidebar-menu-item>
                                                        <button pSidebarMenuButton [isActive]="!!chat.active">
                                                            <span>{{ chat.title }}</span>
                                                        </button>
                                                        <button pSidebarMenuAction showOnHover><svg data-p-icon="trash"></svg></button>
                                                    </p-sidebar-menu-item>
                                                }
                                            </p-sidebar-menu>
                                        </p-sidebar-group-content>
                                    </p-sidebar-group>
                                }
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
                        <button pButton pSidebarTrigger target="chat-history" severity="secondary" text size="small">
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
    imports: [AvatarModule, SidebarModule, ButtonModule, Sparkles, Search, PenToSquare, Globe, Trash, Sidebar]
})
export class SidebarChatDemo implements OnInit {
    isMobile = signal(false);

    open = signal(true);

    private mql?: MediaQueryList;

    private mqlListener?: (e: MediaQueryListEvent) => void;

    chatHistory: ChatGroup[] = [
        {
            label: 'Today',
            chats: [{ title: 'PrimeNG Sidebar component', active: true }, { title: 'How to use Angular signals' }, { title: 'Fix TypeScript generics issue' }]
        },
        {
            label: 'Yesterday',
            chats: [{ title: 'Design system architecture' }, { title: 'Angular 21 new features overview' }, { title: 'CSS light-dark() function usage' }]
        },
        {
            label: 'Previous 7 days',
            chats: [{ title: 'Build a dashboard layout' }, { title: 'Tailwind v4 migration guide' }, { title: 'Node.js API authentication' }, { title: 'Monorepo setup with pnpm' }, { title: 'Deploy Angular to Vercel' }]
        },
        {
            label: 'Previous 30 days',
            chats: [{ title: 'GraphQL schema design' }, { title: 'WebSocket real-time updates' }, { title: 'PostgreSQL query optimization' }, { title: 'Docker compose for dev env' }]
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
}
```
