# Angular InputMask Component — Filled

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputText pInputMask="99-999999" [(ngModel)]="value" variant="filled" placeholder="99-999999" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskFilledDemo {
    value: string | undefined;
}
```
