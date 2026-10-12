# Angular Splitter Component — Advanced

## Advanced

A real-world layout combining a collapsible navigation pane, a custom gutter handle and a viewport that adapts to the current sizes. The pane switches to a compact list once its width drops below 28%.

```typescript
import { Component, signal } from '@angular/core';
import { SplitterModule } from 'primeng/splitter';

@Component({
    template: `
        <p-splitter
            [panelSizes]="[35, 65]"
            class="h-150!"
            [pt]="{
                gutterHandle: { class: 'absolute! inset-y-0! h-full! rounded-non …(lange Zeile gekürzt)
                gutter: { class: 'relative!' }
            }"
            (onResize)="onResize($event)"
            (onResizeEnd)="onResize($event)"
        >
            <p-splitter-panel [minSize]="20" collapsible>
                <ul class="list-none m-0 p-0 w-full">
                    @for (mail of mails; track $index) {
                        <li
                            class="px-4 py-3 cursor-pointer border-b border-surface-100 dark:border-surface-800 transition-colors"
                            [class]="selected() === $index ? 'bg-primary-50 dark:bg-primary-950' : 'hover:bg-surface-50 dark:hover:bg-surface-800'"
                            (click)="selected.set($index)"
                        >
                            <div class="flex items-center justify-between gap-2">
                                <span class="font-semibold text-surface-900 dark:text-surface-0 text-sm truncate">{{ mail.name }}</span>
                                <span class="text-surface-400 text-xs shrink-0">{{ mail.time }}</span>
                            </div>
                            @if (!isCompact()) {
                                <div class="text-surface-700 dark:text-surface-200 text-sm font-medium mt-1 mb-1">{{ mail.title }}</div>
                                <div class="text-surface-400 dark:text-surface-500 text-xs line-clamp-1">{{ mail.description }}</div>
                            }
                        </li>
                    }
                </ul>
            </p-splitter-panel>
            <p-splitter-panel [minSize]="30">
                <div class="p-6">
                    <div class="flex items-start justify-between gap-4 mb-2">
                        <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-0 m-0!">{{ mails[selected()].title }}</h2>
                        <span class="text-surface-400 text-xs shrink-0 pt-1">{{ mails[selected()].time }}</span>
                    </div>
                    <span class="text-surface-400 text-sm">{{ mails[selected()].name }}</span>
                    <p class="text-surface-600 dark:text-surface-300 text-sm leading-relaxed mt-4 m-0!">{{ mails[selected()].description }}</p>
                </div>
            </p-splitter-panel>
        </p-splitter>
    `,
    standalone: true,
    imports: [SplitterModule]
})
export class SplitterAdvancedDemo {
    mails = mails;

    selected = signal(0);

    sizes = signal<number[]>([35, 65]);

    isCompact = computed(() => this.sizes()[0] < 28);

    onResize(event: SplitterResizeEvent) {
        this.sizes.set(event.sizes as number[]);
    }
}
```
