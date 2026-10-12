# Angular Button Component — Button Group

## Button Group

Multiple buttons are grouped when wrapped inside an element with ButtonGroup component.

```typescript
import { Component } from '@angular/core';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { ButtonModule } from 'primeng/button';
import { Check } from '@primeicons/angular/check';
import { Trash } from '@primeicons/angular/trash';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex justify-center">
            <p-buttongroup>
                <button pButton><svg data-p-icon="check"></svg> Save</button>
                <button pButton><svg data-p-icon="trash"></svg> Delete</button>
                <button pButton><svg data-p-icon="times"></svg> Cancel</button>
            </p-buttongroup>
        </div>
    `,
    standalone: true,
    imports: [ButtonGroupModule, ButtonModule, Check, Trash, Times]
})
export class ButtonGroupDemo {}
```
