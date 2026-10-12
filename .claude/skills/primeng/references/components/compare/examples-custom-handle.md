# Angular Compare Component — Custom Handle

## Custom Handle

The handle can be styled freely — give the indicator a rounded background, custom icon, and shadow for a more prominent look.

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <p-compare class="aspect-video max-w-lg mx-auto">
            <p-compare-item position="before">
                <img src="https://primefaces.org/cdn/primevue/images/compare/island2.jpg" />
            </p-compare-item>
            <p-compare-item position="after">
                <img src="https://primefaces.org/cdn/primevue/images/compare/island1.jpg" />
            </p-compare-item>
            <p-compare-handle class="bg-transparent!">
                <p-compare-indicator class="size-5! rounded-full! bg-white/50! transition-transform duration-200! hover:transform-[translate(-50%,-50%)_scale(1.5)]!" />
            </p-compare-handle>
        </p-compare>
    `,
    standalone: true,
    imports: []
})
export class CompareHandleDemo {}
```
