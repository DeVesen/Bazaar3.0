# Angular Skeleton Component — Card

## Card

Sample Card implementation using different Skeleton components and Tailwind CSS utilities.

```typescript
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <div class="max-w-sm w-full space-y-4">
                <div class="flex items-start gap-4">
                    <p-skeleton shape="circle" size="3.5rem" />
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <p-skeleton width="40%" height="1.5rem" />
                        </div>
                        <div class="space-y-1.5 mt-3">
                            <p-skeleton width="100%" borderRadius="4px" />
                            <p-skeleton width="90%" borderRadius="4px" />
                        </div>
                        <p-skeleton class="mt-4 aspect-video w-full h-auto!" />
                        <div class="flex items-center gap-4 mt-4">
                            <p-skeleton width="4rem" height="1.75rem" />
                            <p-skeleton width="4rem" height="1.75rem" />
                        </div>
                    </div>
                        <!-- +3 gleichartige Zeilen -->
    `,
    standalone: true,
    imports: [SkeletonModule]
})
export class SkeletonCardDemo {}
```
