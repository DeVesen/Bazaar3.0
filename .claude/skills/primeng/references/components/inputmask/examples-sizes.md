# Angular InputMask Component — Sizes

## Sizes

InputMask provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <input pInputText [(ngModel)]="value1" placeholder="Small" pSize="small" pInputMask="99-999999" />
            <input pInputText [(ngModel)]="value2" placeholder="Normal" pInputMask="99-999999" />
            <input pInputText [(ngModel)]="value3" placeholder="Large" pSize="large" pInputMask="99-999999" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskSizesDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```
