# Angular InputNumber Component — Fluid

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <p-inputnumber [(ngModel)]="value" inputId="price_input" mode="currency" currency="USD" locale="en-US" fluid />
    `,
    standalone: true,
    imports: [InputNumberModule, FormsModule]
})
export class InputNumberFluidDemo {
    value: number | undefined;
}
```
