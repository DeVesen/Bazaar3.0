# Angular InputGroup Component — Checkbox & Radio

## Checkbox & Radio

Checkbox and RadioButton components can be combined with an input element under the same group.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="space-y-4 max-w-xs mx-auto">
            <p-inputgroup>
                <input type="text" pInputText placeholder="Price" />
                <p-inputgroup-addon><p-radiobutton [(ngModel)]="radioValue1" name="rb1" value="rb1" /></p-inputgroup-addon>
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon><p-checkbox [(ngModel)]="checked1" [binary]="true" /></p-inputgroup-addon>
                <input type="text" pInputText placeholder="Username" />
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon><p-checkbox [(ngModel)]="checked2" [binary]="true" /></p-inputgroup-addon>
                <input type="text" pInputText placeholder="Website" />
                <p-inputgroup-addon><p-radiobutton name="rb2" value="rb2" [(ngModel)]="category" /></p-inputgroup-addon>
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, InputGroupModule, RadioButtonModule, InputGroupAddonModule, InputTextModule, FormsModule]
})
export class InputGroupCheckboxDemo {
    radioValue1: boolean = false;

    checked1: boolean = false;

    checked2: boolean = false;

    category: string | undefined;
}
```
