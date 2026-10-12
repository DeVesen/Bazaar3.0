# Angular InputNumber Component — Currency

## Currency

Monetary values are enabled by setting mode property as currency . In this setting, currency property also needs to be defined using ISO 4217 standard such as "USD" for the US dollar.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { FluidModule } from 'primeng/fluid';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <p-fluid class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label pLabel class="font-bold! block mb-2" for="currency-us">United States</label>
                <p-inputnumber [(ngModel)]="value1" inputId="currency-us" mode="currency" currency="USD" locale="en-US" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! block mb-2" for="currency-germany">Germany</label>
                <p-inputnumber [(ngModel)]="value2" mode="currency" inputId="currency-germany" currency="EUR" locale="de-DE" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! block mb-2" for="currency-india">India</label>
                <p-inputnumber [(ngModel)]="value3" mode="currency" inputId="currency-india" currency="INR" currencyDisplay="code" locale="en-IN" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! block mb-2" for="currency-japan">Japan</label>
                <p-inputnumber [(ngModel)]="value4" mode="currency" inputId="currency-japan" currency="JPY" locale="jp-JP" />
            </div>
        </p-fluid>
    `,
    standalone: true,
    imports: [InputNumberModule, FluidModule, LabelModule, FormsModule]
})
export class InputNumberCurrencyDemo {
    value1: number = 1500;

    value2: number = 2500;

    value3: number = 4250;

    value4: number = 5002;
}
```
