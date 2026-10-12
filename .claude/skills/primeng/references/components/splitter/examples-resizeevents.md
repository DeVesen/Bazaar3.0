# Angular Splitter Component — Resizeevents

## Resizeevents

Splitters can trigger events during the resize process, allowing you to handle custom logic when a panel is being resized.

```typescript
import { Component, signal } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4 max-w-lg mx-auto">
            <div class="flex flex-col items-center gap-1 w-full text-sm font-mono text-surface-500">
                <div>onResizeStart: [{{ resizeStart() }}]</div>
                <div>onResizeEnd: [{{ resizeEnd() }}]</div>
            </div>
            <p-splitter class="w-full h-60!" (onResizeStart)="onResizeStartEvent($event)" (onResizeEnd)="onResizeEndEvent($event)">
                <p-splitter-panel [minSize]="15" class="flex items-center justify-center">
                    <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">1</span>
                </p-splitter-panel>
                <p-splitter-panel [minSize]="25" class="flex items-center justify-center">
                    <span class="px-2.5 py-1 rounded-md font-mono font-bold bg-surface-100 dark:bg-surface-800 text-color">2</span>
                </p-splitter-panel>
            </p-splitter>
        </div>
    `,
    standalone: true,
    imports: [SplitterModule]
})
export class SplitterResizeeventsDemo {
    resizeStart = signal<string>('50.0%, 50.0%');

    resizeEnd = signal<string>('50.0%, 50.0%');

    onResizeStartEvent(event: any) {
        this.resizeStart.set(event.sizes.map((s: number) => s.toFixed(1) + '%').join(', '));
    }

    onResizeEndEvent(event: any) {
        this.resizeEnd.set(event.sizes.map((s: number) => s.toFixed(1) + '%').join(', '));
    }
}
```
