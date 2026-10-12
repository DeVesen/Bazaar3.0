# Angular InputNumber Component — Basic

## Basic

InputNumber is used with the p-inputnumber element and ngModel for two-way binding.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <p-inputnumber [(ngModel)]="value" />
        </div>
    `,
    standalone: true,
    imports: [InputNumberModule, FormsModule]
})
export class InputNumberBasicDemo {
    value: number = 42723;
}
```
