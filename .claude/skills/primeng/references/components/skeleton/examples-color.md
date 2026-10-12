# Angular Skeleton Component — Color

## Color

Customize the background color of the skeleton.

```typescript
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <div class="max-w-sm w-full space-y-4">
                <p-skeleton borderRadius="4px" class="bg-blue-500! dark:bg-blue-700!" />
                <p-skeleton borderRadius="4px" class="bg-red-500! dark:bg-red-700!" />
                <p-skeleton
                    borderRadius="4px"
                    class="bg-blue-100! dark:bg-blue-950! after:bg-[linear-gradi …(lange Zeile gekürzt)
                />
                <p-skeleton
                    borderRadius="4px"
                    class="bg-red-100! dark:bg-red-950! after:bg-[linear-gradien …(lange Zeile gekürzt)
                />
            </div>
        </div>
    `,
    standalone: true,
    imports: [SkeletonModule]
})
export class SkeletonColorDemo {}
```
