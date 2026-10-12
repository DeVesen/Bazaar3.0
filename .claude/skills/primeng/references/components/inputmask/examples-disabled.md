# Angular InputMask Component — Disabled

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputText pInputMask="999-99-9999" [(ngModel)]="value" disabled />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskDisabledDemo {
    value: string | undefined;
}
```
