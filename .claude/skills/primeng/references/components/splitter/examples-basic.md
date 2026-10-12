# Angular Splitter Component — Basic

## Basic

Divides a layout into resizable panels with a draggable divider.

```typescript
import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <p-splitter class="h-60! max-w-lg mx-auto">
            <p-splitter-panel class="flex items-center justify-center">
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
export class SplitterBasicDemo {}
```
