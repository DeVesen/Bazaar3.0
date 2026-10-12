# Angular TreeTable Component — Loadingskeleton

## Loadingskeleton

Skeleton placeholders are displayed during the loading process.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TreeTableModule } from 'primeng/treetable';
import { TreeNode } from 'primeng/api';

@Component({
    template: `
        <p-treetable [value]="files" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template #header>
                <tr>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Type</th>
                </tr>
            </ng-template>
            <ng-template #body let-rowNode>
                <tr [ttRow]="rowNode">
                    <td>
                        <p-skeleton styleClass="h-5 w-3/4" />
                    </td>
                    <td>
                        <p-skeleton styleClass="h-5 w-1/3" />
                    </td>
                    <td>
                        <p-skeleton styleClass="h-5 w-1/2" />
                    </td>
                </tr>
            </ng-template>
        </p-treetable>
    `,
    standalone: true,
    imports: [SkeletonModule, TreeTableModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeTableLoadingSkeletonDemo {
    files = placeholders;
}
```
