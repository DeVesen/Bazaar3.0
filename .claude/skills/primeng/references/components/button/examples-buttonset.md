# Angular Button Component — Buttonset

## Buttonset

Multiple buttons are grouped when wrapped inside an element with p-buttonset class.

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Check } from '@primeicons/angular/check';
import { Trash } from '@primeicons/angular/trash';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex justify-center">
            <span class="p-buttonset">
                <button pButton pRipple><svg data-p-icon="check"></svg> Save</button>
                <button pButton pRipple><svg data-p-icon="trash"></svg> Delete</button>
                <button pButton pRipple><svg data-p-icon="times"></svg> Cancel</button>
            </span>
        </div>
    `,
    standalone: true,
    imports: [ButtonModule, RippleModule, Check, Trash, Times]
})
export class ButtonSetDemo {}
```
