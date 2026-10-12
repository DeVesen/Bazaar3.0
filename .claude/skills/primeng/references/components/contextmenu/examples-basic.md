# Angular ContextMenu Component — Basic

## Basic

ContextMenu is attached to a target element using the target property and activated with a right-click.

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
export class ContextMenuBasicDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            { label: 'Cut' },
            { label: 'Copy' },
            { label: 'Paste' },
            { label: 'Rename' },
            { separator: true },
            {
                label: 'Delete',
                linkClass: 'text-red-500! dark:text-red-400!'
            }
        ];
    }
}
```
