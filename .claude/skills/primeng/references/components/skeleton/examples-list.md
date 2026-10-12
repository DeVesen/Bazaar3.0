# Angular Skeleton Component — List

## List

Sample List implementation using different Skeleton components and Tailwind CSS utilities.

```typescript
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    template: `
        <div class="rounded-sm border border-surface-200 dark:border-surface-700 p-6 bg-surface-0 dark:bg-surface-900">
            <ul class="m-0 p-0 list-none">
                <li class="mb-4">
                    <div class="flex">
                        <p-skeleton shape="circle" size="4rem" class="mr-2" />
                        <div class="self-center" style="flex: 1">
                            <p-skeleton width="100%" class="mb-2" />
                            <p-skeleton width="75%" />
                        </div>
                    </div>
                </li>
                <li class="mb-4">
                    <div class="flex">
                        <p-skeleton shape="circle" size="4rem" class="mr-2" />
                        <div class="self-center" style="flex: 1">
                            <p-skeleton width="100%" class="mb-2" />
                            <p-skeleton width="75%" />
                        </div>
                    </div>
                </li>
                <li class="mb-4">
                    <div class="flex">
                        <p-skeleton shape="circle" size="4rem" class="mr-2" />
                        <div class="self-center" style="flex: 1">
                            <p-skeleton width="100%" class="mb-2" />
                            <p-skeleton width="75%" />
                        </div>
                    </div>
                </li>
                <li>
                    <div class="flex">
                        <p-skeleton shape="circle" size="4rem" class="mr-2" />
                        <div class="self-center" style="flex: 1">
                            <p-skeleton width="100%" class="mb-2" />
                            <p-skeleton width="75%" />
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    `,
    standalone: true,
    imports: [SkeletonModule]
})
export class SkeletonListDemo {}
```
