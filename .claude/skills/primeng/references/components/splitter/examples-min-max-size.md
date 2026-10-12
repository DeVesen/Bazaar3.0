# Angular Splitter Component — Min Max Size

## Min Max Size

Each panel can declare a minSize and a maxSize in percentages. The splitter ensures the panel cannot shrink below minSize nor grow beyond maxSize during a resize.

```typescript
import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <div class="flex flex-col items-center gap-8 max-w-lg mx-auto">
            <p-splitter class="w-full h-32!">
                <p-splitter-panel [minSize]="20" [maxSize]="50" class="flex items-center justify-center">
                    <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">1</span>
                </p-splitter-panel>
                <p-splitter-panel class="flex items-center justify-center">
                    <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">2</span>
                </p-splitter-panel>
            </p-splitter>
            <p-splitter class="w-full h-32!">
                <p-splitter-panel [minSize]="10" class="flex items-center justify-center">
                    <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">1</span>
                </p-splitter-panel>
                <p-splitter-panel [minSize]="10" class="flex items-center justify-center">
                    <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">2</span>
                </p-splitter-panel>
                <p-splitter-panel [minSize]="10" class="flex items-center justify-center">
                    <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">3</span>
                </p-splitter-panel>
            </p-splitter>
        </div>
    `,
    standalone: true,
    imports: [SplitterModule]
})
export class SplitterMinmaxDemo {}
```
