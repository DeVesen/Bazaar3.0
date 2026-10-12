# Angular Menu Component — Controlled

## Controlled

Menu state can be controlled programmatically with the expandedKeys property that defines the keys of the toggleable submenus that are expanded. This property is an object whose key matches an item's id field and value is a boolean. Note that expandedKeys also supports two-way binding.

```typescript
import { Component, OnInit } from '@angular/core';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';

@Component({
    template: `
        <div class="flex flex-col items-center">
            <div class="flex flex-wrap gap-2 mb-6">
                <button type="button" pButton severity="secondary" [outlined]="true" size="small" (click)="expandAll()"><i class="pi pi-plus"></i> Expand All</button>
                <button type="button" pButton severity="secondary" [outlined]="true" size="small" (click)="collapseAll()"><i class="pi pi-minus"></i> Collapse All</button>
            </div>
            <p-menu [(expandedKeys)]="expandedKeys" [model]="items" styleClass="w-full md:w-56" />
        </div>
    `,
    standalone: true,
    imports: [MenuModule, ButtonModule]
})
export class MenuControlledDemo implements OnInit {
    items: MenuItem[] | undefined;

    expandedKeys: { [key: string]: boolean } = { reports: true };

    ngOnInit() {
        this.items = [
            { id: 'dashboard', label: 'Dashboard', icon: 'pi pi-home' },
            { separator: true },
            {
                id: 'workspace',
                label: 'Workspace',
                items: [
                    {
                        id: 'projects',
                        label: 'Projects',
                        icon: 'pi pi-folder',
                        items: [
                            { id: 'projects-active', label: 'Active', icon: 'pi pi-briefcase' },
                            { id: 'projects-completed', label: 'Completed', icon: 'pi pi-check-circle' }
                        ]
                    },
                    {
                        id: 'reports',
                        label: 'Reports',
                        icon: 'pi pi-file',
                        items: [
                            { id: 'reports-monthly', label: 'Monthly', icon: 'pi pi-calendar' },
                            { id: 'reports-yearly', label: 'Yearly', icon: 'pi pi-chart-bar' }
                        ]
                    }
                ]
            }
        ];
    }

    expandAll() {
        const keys: { [key: string]: boolean } = {};

        this.expandNodes(this.items ?? [], keys);
        this.expandedKeys = keys;
    }

    collapseAll() {
        this.expandedKeys = {};
    }

    private expandNodes(nodes: MenuItem[], keys: { [key: string]: boolean }) {
        for (const node of nodes) {
            if (node.items?.length && node.id) {
                keys[node.id] = true;
                this.expandNodes(node.items, keys);
            }
        }
    }
}
```
