# Angular Skeleton Component — Shapes

## Shapes

Various shapes and sizes can be created using styling properties like shape , width , height , borderRadius and class .

```typescript
import { Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    template: `
        <div class="flex flex-col items-start gap-8 max-w-sm">
            <div class="w-full">
                <h5>Circle</h5>
                <div class="flex items-end gap-4">
                    <p-skeleton shape="circle" size="5rem" />
                    <p-skeleton shape="circle" size="4rem" />
                    <p-skeleton shape="circle" size="3rem" />
                    <p-skeleton shape="circle" size="2rem" />
                </div>
            </div>
            <div class="w-full">
                <h5>Square</h5>
                <div class="flex items-end gap-4">
                    <p-skeleton size="5rem" />
                    <p-skeleton size="4rem" />
                    <p-skeleton size="3rem" />
                    <p-skeleton size="2rem" />
                </div>
            </div>
            <div class="w-full">
                <h5>Rectangle</h5>
                <div class="flex flex-col gap-2 w-full">
                    <p-skeleton />
                    <p-skeleton width="12rem" />
                    <p-skeleton width="7rem" />
                    <p-skeleton height="4rem" />
                    <p-skeleton width="12rem" height="4rem" />
                </div>
            </div>
            <div class="w-full">
                <h5>Rounded</h5>
                <div class="flex flex-col gap-2 w-full">
                    <p-skeleton borderRadius="16px" />
                    <p-skeleton width="12rem" borderRadius="16px" />
                    <p-skeleton width="7rem" borderRadius="16px" />
                    <p-skeleton height="4rem" borderRadius="16px" />
                    <p-skeleton width="12rem" height="4rem" borderRadius="16px" />
                </div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [SkeletonModule]
})
export class SkeletonShapesDemo {}
```
