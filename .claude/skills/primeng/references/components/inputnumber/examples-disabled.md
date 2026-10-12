# Angular InputNumber Component — Disabled

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputnumber inputId="integeronly" [disabled]="true" prefix="%" [(ngModel)]="value1" />
        </div>
    `,
    standalone: true,
    imports: [InputNumberModule, FormsModule]
})
export class InputNumberDisabledDemo {
    value1: number = 50;
}
```
