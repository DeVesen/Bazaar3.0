# Angular Skeleton Component — Basic

## Basic

Placeholder shapes that mimic content layout during loading.

```typescript
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    template: `
        <div class="flex gap-4 max-w-xs mx-auto">
            <p-skeleton shape="circle" size="2.5rem" />
            <div class="flex-1 flex flex-col gap-1.5 py-0.5">
                <p-skeleton width="100%" borderRadius="4px" class="h-auto! flex-1" />
                <p-skeleton width="90%" borderRadius="4px" class="h-auto! flex-1" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [SkeletonModule]
})
export class SkeletonBasicDemo {}
```
