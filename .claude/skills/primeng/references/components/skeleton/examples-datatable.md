# Angular Skeleton Component — DataTable

## DataTable

Sample DataTable implementation using different Skeleton components and Tailwind CSS utilities.

```typescript
import { Component, OnInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
    template: `
        <p-table [value]="products" [tableStyle]="{ 'min-width': '50rem' }">
            <ng-template #header>
                <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                </tr>
            </ng-template>
            <ng-template #body let-product>
                <tr>
                    <td><p-skeleton /></td>
                    <td><p-skeleton /></td>
                    <td><p-skeleton /></td>
                    <td><p-skeleton /></td>
                </tr>
            </ng-template>
        </p-table>
    `,
    standalone: true,
    imports: [SkeletonModule, TableModule]
})
export class SkeletonDataTableDemo implements OnInit {
    products: any[] | undefined;

    ngOnInit() {
        this.products = Array.from({ length: 5 }).map((_, i) => `Item #${i}`);
    }
}
```
