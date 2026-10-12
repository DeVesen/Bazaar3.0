# Angular Splitter Component — Stateful

## Stateful

Panel sizes can be persisted using the stateKey and stateStorage properties. This example saves sizes to localStorage so they are restored on page reload.

```typescript
import { Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <p-splitter [panelSizes]="[30, 70]" stateKey="splitter-demo-sizes" stateStorage="local" class="h-60! max-w-lg mx-auto" (onResizeEnd)="onResizeEnd($event)">
            <p-splitter-panel [minSize]="10" class="flex items-center justify-center gap-2">
                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">1</span>
                <span class="text-sm text-muted-color tabular-nums">({{ sizes()[0].toFixed(1) }}%)</span>
            </p-splitter-panel>
            <p-splitter-panel [minSize]="10" class="flex items-center justify-center gap-2">
                <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">2</span>
                <span class="text-sm text-muted-color tabular-nums">({{ sizes()[1].toFixed(1) }}%)</span>
            </p-splitter-panel>
        </p-splitter>
    `,
    standalone: true,
    imports: [SplitterModule]
})
export class SplitterStatefulDemo {
    private platformId = inject(PLATFORM_ID);

    sizes = signal<number[]>(this.getInitialSizes());

    private getInitialSizes(): number[] {
        if (isPlatformBrowser(this.platformId)) {
            const stored = localStorage.getItem('splitter-demo-sizes');

            if (stored) {
                try {
                    const parsed = JSON.parse(stored);

                    if (Array.isArray(parsed) && parsed.length === 2 && parsed.every((v: unknown) => typeof v === 'number' && isFinite(v))) {
                        return parsed;
                    }
                } catch {
                    // Stored value is not valid JSON; fall through to the default sizes.
                }
            }
        }

        return [30, 70];
    }

    onResizeEnd(event: any) {
        this.sizes.set(event.sizes);
    }
}
```
