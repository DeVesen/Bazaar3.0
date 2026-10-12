# Angular InputGroup Component — Multiple

## Multiple

A group is created by wrapping the input and add-ons with the p-inputgroup component. Each add-on element is defined as a child of p-inputgroup-addon component. Multiple add-ons can be placed inside the same group.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Clock } from '@primeicons/angular/clock';
import { StarFill } from '@primeicons/angular/star-fill';

@Component({
    template: `
        <div class="max-w-sm mx-auto">
            <p-inputgroup>
                <p-inputgroup-addon>
                    <svg data-p-icon="clock" />
                </p-inputgroup-addon>
                <p-inputgroup-addon>
                    <svg data-p-icon="star-fill" />
                </p-inputgroup-addon>
                <p-inputnumber [(ngModel)]="value" placeholder="Price" />
                <p-inputgroup-addon>$</p-inputgroup-addon>
                <p-inputgroup-addon>.00</p-inputgroup-addon>
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [InputGroupModule, InputNumberModule, InputGroupAddonModule, FormsModule, Clock, StarFill]
})
export class InputGroupMultipleDemo {
    value: number | undefined;
}
```
