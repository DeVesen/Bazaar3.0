# Angular InputNumber Component — Float Label

## Float Label

A floating label appears on top of the input field when focused. Visit FloatLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel>
                <p-inputnumber [(ngModel)]="value1" inputId="over_label" mode="currency" currency="USD" locale="en-US" />
                <label for="over_label">Over Label</label>
            </p-floatlabel>
            <p-floatlabel variant="in">
                <p-inputnumber [(ngModel)]="value2" inputId="in_label" mode="currency" currency="USD" locale="en-US" variant="filled" />
                <label for="in_label">In Label</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <p-inputnumber [(ngModel)]="value3" inputId="on_label" mode="currency" currency="USD" locale="en-US" />
                <label for="on_label">On Label</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputNumberModule, FormsModule]
})
export class InputNumberFloatLabelDemo {
    value1: number | undefined;

    value2: number | undefined;

    value3: number | undefined;
}
```
