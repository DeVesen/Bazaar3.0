# Angular StyleClass Component — Selector

## Selector

The target element is resolved with the selector option, which accepts keywords such as &#64;next , &#64;prev , &#64;parent and &#64;grandparent , or any valid CSS selector.

```typescript
import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';

@Component({
    template: `
        <div class="flex flex-col gap-8">
            <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-surface-500 dark:text-surface-400">&#64;next</span>
                <div class="flex items-center gap-4">
                    <button
                        type="button"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-fadein"
                        leaveActiveClass="animate-fadeout"
                        leaveToClass="hidden"
                        class="px-4 py-2 rounded-lg bg-primary text-primary-contrast hover:bg-primary/90 transition-colors cursor-pointer text-sm font-medium shrink-0"
                    >
                        &#64;next
                    </button>
                    <div class="hidden px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">Next Sibling</div>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-surface-500 dark:text-surface-400">&#64;prev</span>
                <div class="flex items-center gap-4">
                    <div class="hidden px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium">Previous Sibling</div>
                    <button
                        type="button"
                        pStyleClass="@prev"
                        enterFromClass="hidden"
                        enterActiveClass="animate-fadein"
                        leaveActiveClass="animate-fadeout"
                        leaveToClass="hidden"
                        class="px-4 py-2 rounded-lg bg-primary text-primary-contrast hover:bg-primary/90 transition-colors cursor-pointer text-sm font-medium shrink-0"
                    >
                        &#64;prev
                    </button>
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm font-medium text-surface-500 dark:text-surface-400">CSS Selector</span>
                <div class="flex items-center gap-4">
                    <button
                        type="button"
                        pStyleClass="#remote-target"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveActiveClass="animate-fadeout"
                        leaveToClass="hidden"
                        class="px-4 py-2 rounded-lg bg-primary text-primary-contrast hover:bg-primary/90 transition-colors cursor-pointer text-sm font-medium shrink-0"
                    >
                        #remote-target
                    </button>
                </div>
                <div id="remote-target" class="hidden px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium origin-top w-fit">Remote Target</div>
            </div>
        </div>
    `,
    standalone: true,
    imports: [StyleClassModule]
})
export class StyleClassSelectorDemo {}
```
