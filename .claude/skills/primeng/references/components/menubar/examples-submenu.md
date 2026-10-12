# Angular Menubar Component — Submenu

## Submenu

Menuitems with nested items create cascading submenus.

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
export class MenubarSubmenuDemo implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'File',
                items: [
                    { label: 'New File' },
                    { label: 'Open File…' },
                    {
                        label: 'Open Recent',
                        items: [
                            { label: 'todo.md' },
                            { label: 'changelog.md' },
                            { label: 'readme.md' },
                            {
                                label: 'Older',
                                items: [{ label: 'release-notes.md' }, { label: 'roadmap.md' }, { label: 'contributing.md' }, { label: 'license.txt' }]
                            },
                            { separator: true },
                            { label: 'Clear Recent' }
                        ]
                    },
                    { separator: true },
                    { label: 'Save' },
                    { label: 'Save As…' }
                ]
            },
            {
                label: 'View',
                items: [{ label: 'Reload' }, { label: 'Force Reload' }, { separator: true }, { label: 'Toggle DevTools' }]
            }
        ];
    }
}
```
