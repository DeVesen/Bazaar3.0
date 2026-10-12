# Angular Splitter Component — Custom

## Custom

The default appearance is fully overridable through Tailwind utilities on the panels and the pt API on the gutter. Below, panels become colored badge containers and the gutter is rendered as a thin rounded bar.

```typescript
import { Component } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <p-splitter
            class="h-60! max-w-lg mx-auto border-none! gap-0.5! bg-transparent!"
            [pt]="{
                gutter: { class: 'w-1.5! rounded-xs!' }
            }"
        >
            <p-splitter-panel class="flex items-center justify-center border border-blue-500 bg-blue-500/10 rounded-sm text-blue-500">
                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-current/20">1</span>
            </p-splitter-panel>
            <p-splitter-panel class="flex items-center justify-center border border-purple-500 bg-purple-500/10 rounded-sm text-purple-500">
                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-current/20">2</span>
            </p-splitter-panel>
        </p-splitter>
    `,
    standalone: true,
    imports: [SplitterModule]
})
export class SplitterCustomDemo {}
```
