# Angular InputGroup Component — Float Label

## Float Label

FloatLabel visually integrates a label with its form element. Visit FloatLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '@primeicons/angular/user';

@Component({
    template: `
        <div class="space-y-4 max-w-xs mx-auto">
            <p-inputgroup>
                <p-inputgroup-addon>
                    <svg data-p-icon="user" />
                </p-inputgroup-addon>
                <p-floatlabel>
                    <input pInputText id="over_label" [(ngModel)]="value1" />
                    <label for="over_label">Over Label</label>
                </p-floatlabel>
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon>$</p-inputgroup-addon>
                <p-floatlabel variant="in">
                    <input pInputText id="in_label" [(ngModel)]="value2" />
                    <label for="in_label">In Label</label>
                </p-floatlabel>
                <p-inputgroup-addon>.00</p-inputgroup-addon>
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon>www</p-inputgroup-addon>
                <p-floatlabel variant="on">
                    <input pInputText id="on_label" [(ngModel)]="value3" />
                    <label for="on_label">On Label</label>
                </p-floatlabel>
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [FloatLabelModule, InputGroupModule, InputGroupAddonModule, InputTextModule, FormsModule, User]
})
export class InputGroupFloatLabelDemo {
    value1: string | undefined;

    value2: string | undefined;

    value3: string | undefined;
}
```
