# Angular Skeleton Component — Grid

## Grid

Sample Grid implementation using different Skeleton components and Tailwind CSS utilities.

```typescript
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    template: `
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            @for (item of items; track $index) {
                <div class="p-4 rounded-lg bg-surface-50 dark:bg-surface-800/75">
                    <p-skeleton width="100%" height="10rem" />
                    <div class="mt-4 flex items-start gap-3">
                        <p-skeleton shape="circle" size="2.5rem" />
                        <div class="flex-1 flex flex-col gap-2">
                            <p-skeleton width="100%" borderRadius="4px" />
                            <p-skeleton width="90%" borderRadius="4px" />
                        </div>
                    </div>
                </div>
            }
        </div>
    `,
    standalone: true,
    imports: [SkeletonModule]
})
export class SkeletonGridDemo {
    items = Array.from({ length: 6 });
}
```
