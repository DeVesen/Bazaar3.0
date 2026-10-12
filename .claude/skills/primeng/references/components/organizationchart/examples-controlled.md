# Angular Organization Chart Component — Controlled

## Controlled

Control the collapsed state with collapsedKeys . A key present with true is collapsed; absent keys stay expanded.

```typescript
import { Component } from '@angular/core';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { ButtonModule } from 'primeng/button';
import { Product } from '@/domain/product';
import { Minus } from '@primeicons/angular/minus';
import { Plus } from '@primeicons/angular/plus';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4 overflow-x-auto">
            <div class="flex gap-2">
                <button type="button" pButton size="small" severity="secondary" (click)="expandAll()">Expand all</button>
                <button type="button" pButton size="small" severity="secondary" (click)="collapseAll()">Collapse all</button>
            </div>
            <p-organization-chart [value]="data" [collapsible]="true" [(collapsedKeys)]="collapsedKeys">
                <ng-template #togglericon let-expanded>
                    @if (expanded) {
                        <svg data-p-icon="minus" />
                    } @else {
                        <svg data-p-icon="plus" />
                    }
                </ng-template>
            </p-organization-chart>
        </div>
    `,
    standalone: true,
    imports: [OrganizationChartModule, ButtonModule, Minus, Plus]
})
export class OrganizationChartControlledDemo {
    collapsedKeys: OrganizationChartNodeKeys = {};

    data: OrgChartNode[] = [
        {
            key: '0',
            label: 'Founder',
            children: [
                {
                    key: '0-0',
                    label: 'Product Lead',
                    children: [
                        {
                            key: '0-0-0',
                            label: 'UX/UI Designer'
                        },
                        {
                            key: '0-0-1',
                            label: 'Product Manager'
                        }
                    ]
                },
                {
                    key: '0-1',
                    label: 'Engineering Lead',
                    children: [
                        {
                            key: '0-1-0',
                            label: 'Frontend Developer'
                        },
                        {
                            key: '0-1-1',
                            label: 'Backend Developer'
                        }
                    ]
                }
            ]
        }
    ];

    expandAll() {
        this.collapsedKeys = {};
    }

    collapseAll() {
        this.collapsedKeys = { '0': true };
    }
}
```
