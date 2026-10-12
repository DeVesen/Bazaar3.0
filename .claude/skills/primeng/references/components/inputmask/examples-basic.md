# Angular InputMask Component — Basic

## Basic

InputMask is used as a controlled input with ngModel properties.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputText pInputMask="99-999999" [(ngModel)]="value" placeholder="99-999999" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskBasicDemo {
    value: string | undefined;
}
```
