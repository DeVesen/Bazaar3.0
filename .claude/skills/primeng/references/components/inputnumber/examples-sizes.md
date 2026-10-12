# Angular InputNumber Component — Sizes

## Sizes

InputNumber provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <p-inputnumber [(ngModel)]="value1" size="small" placeholder="Small" mode="currency" currency="USD" locale="en-US" />
            <p-inputnumber [(ngModel)]="value2" placeholder="Normal" mode="currency" currency="USD" locale="en-US" />
            <p-inputnumber [(ngModel)]="value3" size="large" placeholder="Large" mode="currency" currency="USD" locale="en-US" />
        </div>
    `,
    standalone: true,
    imports: [InputNumberModule, FormsModule]
})
export class InputNumberSizesDemo {
    value1!: number;

    value2!: number;

    value3!: number;
}
```
