# Angular InputPassword Component — Float Label

## Float Label

FloatLabel visually integrates a label with its form element. Visit FloatLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel>
                <input pInputPassword id="over_label" [(ngModel)]="value1" autocomplete="off" />
                <label for="over_label">Password</label>
            </p-floatlabel>
            <p-floatlabel variant="in">
                <input pInputPassword id="in_label" [(ngModel)]="value2" autocomplete="off" />
                <label for="in_label">Password</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <input pInputPassword id="on_label" [(ngModel)]="value3" autocomplete="off" />
                <label for="on_label">Password</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputPasswordModule, FormsModule]
})
export class InputPasswordFloatLabelDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```
