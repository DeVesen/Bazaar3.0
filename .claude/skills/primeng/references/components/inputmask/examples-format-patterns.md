# Angular InputMask Component — Format Patterns

## Format Patterns

Mask format can be a combination of the following definitions; a for alphabetic characters, 9 for numeric characters and * for alphanumberic characters. In addition, formatting characters like ( , ) , - are also accepted.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <p-fluid class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label pLabel for="ssn" class="font-bold! block mb-2">SSN</label>
                <input pInputText id="ssn" pInputMask="999-99-9999" [(ngModel)]="value1" placeholder="999-99-9999" />
            </div>
            <div class="flex-auto">
                <label pLabel for="phone" class="font-bold! block mb-2">Phone</label>
                <input pInputText id="phone" pInputMask="(999) 999-9999" [(ngModel)]="value2" placeholder="(999) 999-9999" />
            </div>
            <div class="flex-auto">
                <label pLabel for="serial" class="font-bold! block mb-2">Serial</label>
                <input pInputText id="serial" pInputMask="a*-999-a999" [(ngModel)]="value3" placeholder="a*-999-a999" />
            </div>
        </p-fluid>
    `,
    standalone: true,
    imports: [FluidModule, InputTextModule, InputMaskModule, LabelModule, FormsModule]
})
export class InputMaskFormatPatternsDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```
