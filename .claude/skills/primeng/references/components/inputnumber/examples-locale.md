# Angular InputNumber Component — Locale

## Locale

Localization information such as grouping and decimal symbols are defined with the locale property which defaults to the user locale.

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
                <label pLabel class="font-bold! block mb-2" for="locale-user">User Locale</label>
                <p-inputnumber [(ngModel)]="value1" inputId="locale-user" [minFractionDigits]="2" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! block mb-2" for="locale-us">United States Locale</label>
                <p-inputnumber [(ngModel)]="value2" inputId="locale-us" mode="decimal" locale="en-US" [minFractionDigits]="2" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! block mb-2" for="locale-german">German Locale</label>
                <p-inputnumber [(ngModel)]="value3" inputId="locale-german" mode="decimal" locale="de-DE" [minFractionDigits]="2" />
            </div>
            <div class="flex-auto">
                <label pLabel class="font-bold! block mb-2" for="locale-indian">Indian Locale</label>
                <p-inputnumber [(ngModel)]="value4" inputId="locale-indian" mode="decimal" locale="en-IN" [minFractionDigits]="2" />
            </div>
        </p-fluid>
    `,
    standalone: true,
    imports: [InputNumberModule, FluidModule, LabelModule, FormsModule]
})
export class InputNumberLocaleDemo {
    value1: number = 151351;

    value2: number = 115744;

    value3: number = 635524;

    value4: number = 732762;
}
```
