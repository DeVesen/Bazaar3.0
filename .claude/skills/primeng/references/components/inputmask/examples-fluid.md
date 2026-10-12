# Angular InputMask Component — Fluid

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <input pInputText pInputMask="99-999999" [(ngModel)]="value" placeholder="99-999999" fluid />
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskFluidDemo {
    value: string | undefined;
}
```
