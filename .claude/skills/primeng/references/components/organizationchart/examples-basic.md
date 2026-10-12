# Angular Organization Chart Component — Basic

## Basic

Displays a hierarchy from the value collection.

```typescript
import { Component } from '@angular/core';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { Product } from '@/domain/product';

@Component({
    template: `
        <div class="flex items-center justify-center overflow-x-auto">
            <p-organization-chart [value]="data" />
        </div>
    `,
    standalone: true,
    imports: [OrganizationChartModule]
})
export class OrganizationChartBasicDemo {
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
}
```
