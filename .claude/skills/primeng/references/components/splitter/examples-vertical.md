# Angular Splitter Component — Vertical

## Vertical

Panels are displayed as stacked by setting the layout to vertical .

```typescript
import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <p-splitter class="h-60! max-w-lg mx-auto" layout="vertical">
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
export class SplitterVerticalDemo {}
```
