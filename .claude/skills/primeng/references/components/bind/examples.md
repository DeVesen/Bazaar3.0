# Angular Bind Directive — Beispiele

## Examples

The pBind is a directive that accepts an object of HTML attributes.

```typescript
import { Component, signal } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <div [pBind]="{ 'aria-label': 'basic-box', class: 'bg-primary text-primary-contrast flex items-center justify-center p-3 rounded-lg w-28 font-medium text-sm' }">Static</div>
            <div [pBind]="boxBinding()" pTooltip="Click to change color">Dynamic</div>
        </div>
    `,
    standalone: true,
    imports: [TooltipModule]
})
export class BindExamplesDemo {
    isActive = signal<boolean>(false);

    boxBinding = computed(() => ({
        class: ['flex items-center justify-center p-3 rounded-lg select-none w-2 …(lange Zeile gekürzt)
        style: { cursor: 'pointer', transition: 'all 0.3s' },
        'data-state': this.isActive() ? 'active' : 'inactive',
        onclick: () => {
            this.isActive.set(!this.isActive());
        }
    }));
}
```
