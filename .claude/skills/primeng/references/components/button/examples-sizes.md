# Angular Button Component — Sizes

## Sizes

Button provides small and large sizes as alternatives to the standard.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Check } from '@primeicons/angular/check';

@Component({
    template: `
        <div class="flex justify-center flex-wrap gap-4 items-center">
            <button pButton size="small"><svg data-p-icon="check"></svg> Small</button>
            <button pButton><svg data-p-icon="check"></svg> Normal</button>
            <button pButton size="large"><svg data-p-icon="check"></svg> Large</button>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, Check]
})
export class ButtonSizesDemo {}
```
