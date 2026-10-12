# Angular StyleClass Component — Basic

## Basic

StyleClass applies enter and leave animations to a target element declaratively. The target is resolved with the selector option, here &#64;next referring to the next sibling.

```typescript
import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { ChevronDown } from '@primeicons/angular/chevron-down';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4 h-40">
            <button
                type="button"
                pStyleClass="@next"
                enterFromClass="hidden"
                enterActiveClass="animate-scalein"
                leaveToClass="hidden"
                leaveActiveClass="animate-fadeout"
                [hideOnOutsideClick]="true"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-contrast hover:bg-primary/90 transition-colors cursor-pointer text-sm font-medium"
            >
                Toggle Panel
                <svg data-p-icon="chevron-down" [size]="14" />
            </button>
            <div class="hidden w-full max-w-md p-4 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow-md origin-top">
                <p class="text-sm text-surface-700 dark:text-surface-200 leading …(lange Zeile gekürzt)
            </div>
        </div>
    `,
    standalone: true,
    imports: [StyleClassModule, ChevronDown]
})
export class StyleClassBasicDemo {}
```
