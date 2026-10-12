# Angular InputNumber Component — Ifta Label

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <p-inputnumber [(ngModel)]="value" inputId="price_input" mode="currency" currency="USD" locale="en-US" variant="filled" />
                <label for="price_input">Price</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, InputNumberModule, FormsModule]
})
export class InputNumberIftaLabelDemo {
    value: number = 1;
}
```
