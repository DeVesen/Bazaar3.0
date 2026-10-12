# Angular Menubar Component — Basic

## Basic

Menubar requires nested menuitems as its model.

```typescript
import { Component, OnInit } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex justify-center">
            <p-menubar [model]="items" class="max-[960px]:w-full" />
        </div>
    `,
    standalone: true,
    imports: [MenubarModule]
})
export class MenubarBasicDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'File',
                items: [{ label: 'New Document', icon: 'pi pi-file' }, { label:  …(lange Zeile gekürzt)
            },
            {
                label: 'Edit',
                items: [{ label: 'Undo', icon: 'pi pi-undo' }, { label: 'Redo',  …(lange Zeile gekürzt)
            },
            {
                label: 'View',
                items: [{ label: 'Zoom In' }, { label: 'Zoom Out' }, { label: 'Reset Zoom' }, { separator: true }, { label: 'Full Screen' }]
            },
            {
                label: 'Help',
                items: [{ label: 'Documentation' }, { label: 'Support' }, { separator: true }, { label: 'About' }]
            }
        ];
    }
}
```
