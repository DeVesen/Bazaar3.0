# Angular Splitter Component — Size

## Size

Initial dimensions are percentage based and provided through panelSizes on the Splitter. Per-panel constraints are configured with minSize and maxSize on each SplitterPanel.

```typescript
import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <p-splitter [panelSizes]="[25, 75]" class="h-60! max-w-lg mx-auto">
            <p-splitter-panel [minSize]="10" class="flex items-center justify-center">
                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">1</span>
            </p-splitter-panel>
            <p-splitter-panel class="flex items-center justify-center">
                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">2</span>
            </p-splitter-panel>
        </p-splitter>
    `,
    standalone: true,
    imports: [SplitterModule]
})
export class SplitterSizeDemo {}
```
