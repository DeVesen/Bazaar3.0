# Angular Splitter Component — Nested

## Nested

Splitters can be nested by placing another Splitter inside a SplitterPanel.

```typescript
import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <p-splitter [panelSizes]="[25, 75]" class="h-78! max-w-lg mx-auto">
            <p-splitter-panel [minSize]="10" class="flex items-center justify-center">
                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">1</span>
            </p-splitter-panel>
            <p-splitter-panel>
                <p-splitter layout="vertical" [panelSizes]="[50, 50]" class="h-full">
                    <p-splitter-panel class="flex items-center justify-center">
                        <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">2</span>
                    </p-splitter-panel>
                    <p-splitter-panel>
                        <p-splitter [panelSizes]="[20, 80]" class="h-full">
                            <p-splitter-panel class="flex items-center justify-center">
                                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">3</span>
                            </p-splitter-panel>
                            <p-splitter-panel class="flex items-center justify-center">
                                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">4</span>
                            </p-splitter-panel>
                        </p-splitter>
                    </p-splitter-panel>
                </p-splitter>
            </p-splitter-panel>
        </p-splitter>
    `,
    standalone: true,
    imports: [SplitterModule]
})
export class SplitterNestedDemo {}
```
