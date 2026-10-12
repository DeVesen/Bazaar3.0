# Angular TieredMenu Component — Template

## Template

TieredMenu offers item customization with the item template that receives the menuitem instance from the model as a parameter.

```typescript
import { Component, OnInit } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { RippleModule } from 'primeng/ripple';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-tieredmenu [model]="items">
                <ng-template #item let-item let-hasSubmenu="hasSubmenu">
                    <a pRipple class="flex items-center px-3 py-2 cursor-pointer">
                        <span [class]="item.icon"></span>
                        <span class="ms-2 text-sm">{{ item.label }}</span>
                        @if (item.badge) {
                            <p-badge class="ml-auto" [value]="item.badge" />
                        }
                        @if (item.shortcut) {
                            <span class="ml-auto border border-surface rounded-sm bg-emphasis text-muted-color text-xs p-1">{{ item.shortcut }}</span>
                        }
                        @if (hasSubmenu) {
                            <i class="pi pi-angle-right ms-auto rotate-90 lg:rotate-0"></i>
                        }
                    </a>
                </ng-template>
            </p-tieredmenu>
        </div>
    `,
    standalone: true,
    imports: [BadgeModule, TieredMenuModule, RippleModule]
})
export class TieredMenuTemplateDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'File',
                icon: 'pi pi-file',
                items: [
                    {
                        label: 'New',
                        icon: 'pi pi-plus',
                        items: [
                            {
                                label: 'Docs',
                                icon: 'pi pi-file',
                                shortcut: '⌘+N'
                            },
                            {
                                label: 'Image',
                                icon: 'pi pi-image',
                                shortcut: '⌘+I'
                            },
                            {
                                label: 'Video',
                                icon: 'pi pi-video',
                                shortcut: '⌘+L'
                            }
                        ]
                    },
                    {
                        label: 'Open',
                        icon: 'pi pi-folder-open',
                        shortcut: '⌘+O'
                    },
                    {
                        label: 'Print',
                        icon: 'pi pi-print',
                        shortcut: '⌘+P'
                    }
                ]
            },
            {
                label: 'Edit',
                icon: 'pi pi-file-edit',
                items: [
                    {
                        label: 'Copy',
                        icon: 'pi pi-copy',
                        shortcut: '⌘+C'
                    },
                    {
                        label: 'Delete',
                        icon: 'pi pi-times',
                        shortcut: '⌘+D'
                    }
                ]
            },
            {
                label: 'Search',
                icon: 'pi pi-search',
                shortcut: '⌘+S'
            },
            {
                separator: true
            },
            {
                label: 'Share',
                icon: 'pi pi-share-alt',
                items: [
                    {
                        label: 'Slack',
                        icon: 'pi pi-slack',
                        badge: '2'
                    },
                    {
                        label: 'Whatsapp',
                        icon: 'pi pi-whatsapp',
                        badge: '3'
                    }
                ]
            }
        ];
    }
}
```
