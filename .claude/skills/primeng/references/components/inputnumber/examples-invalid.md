# Angular InputNumber Component — Invalid

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <p-inputnumber [(ngModel)]="value1" [invalid]="value1 === undefined" mode="decimal" [minFractionDigits]="2" placeholder="Amount" />
            <p-inputnumber [(ngModel)]="value2" [invalid]="value2 === undefined" mode="decimal" [minFractionDigits]="2" variant="filled" placeholder="Amount" />
        </div>
    `,
    standalone: true,
    imports: [InputNumberModule, FormsModule]
})
export class InputNumberInvalidDemo {
    value1!: number;

    value2!: number;
}
```
