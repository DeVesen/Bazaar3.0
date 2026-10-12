# Angular ContextMenu Component — Submenu

## Submenu

Submenus are defined by nesting menu items within the items property of a parent menu item.

```typescript
import { Component, OnInit } from '@angular/core';
import { ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <div #trigger class="flex items-center justify-center w-full max-w-m …(lange Zeile gekürzt)
                Right-click here
            </div>
            <p-contextmenu [target]="trigger" [model]="items" />
        </div>
    `,
    standalone: true,
    imports: [ContextMenuModule]
})
export class ContextMenuSubmenuDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            { label: 'Copy', icon: 'pi pi-copy' },
            {
                label: 'Share',
                icon: 'pi pi-link',
                items: [
                    { label: 'Send via email', icon: 'pi pi-send' },
                    { label: 'Copy link', icon: 'pi pi-link' },
                    { label: 'Open in new tab', icon: 'pi pi-external-link' }
                ]
            },
            {
                label: 'Save as',
                icon: 'pi pi-download',
                items: [
                    { label: 'PDF', icon: 'pi pi-file' },
                    {
                        label: 'Image',
                        icon: 'pi pi-file',
                        items: [{ label: 'PNG' }, { label: 'JPG' }, { label: 'WebP' }, { label: 'SVG' }]
                    },
                    { label: 'ZIP archive', icon: 'pi pi-folder' }
                ]
            },
            { separator: true },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                styleClass: '[&_.p-contextmenu-item-content]:text-red-500! [&_.p-contextmenu-item-icon]:text-red-500! dark:[&_.p-contextmenu-item-content]:text-red-400! dark:[&_.p-contextmenu-item-icon]:text-red-400!'
            }
        ];
    }
}
```
