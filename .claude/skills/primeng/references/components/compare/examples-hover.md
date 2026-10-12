# Angular Compare Component — Hover

## Hover

Enable slideOnHover to update the slider position by hovering over the component.

```typescript
import { Component } from '@angular/core';
import { Code } from '@primeicons/angular/code';

@Component({
    template: `
        <p-compare class="aspect-video max-w-lg mx-auto" [slideOnHover]="true">
            <p-compare-item position="before">
                <img src="https://primefaces.org/cdn/primevue/images/compare/island2.jpg" />
            </p-compare-item>
            <p-compare-item position="after">
                <img src="https://primefaces.org/cdn/primevue/images/compare/island1.jpg" />
            </p-compare-item>
            <p-compare-handle>
                <p-compare-indicator class="group flex items-center justify-center">
                    <svg data-p-icon="code" class="group-data-[orientation=vertical]:rotate-90" />
                </p-compare-indicator>
            </p-compare-handle>
        </p-compare>
    `,
    standalone: true,
    imports: [Code]
})
export class CompareHoverDemo {}
```
