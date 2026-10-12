# Angular InputGroup Component — Ifta Label

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { User } from '@primeicons/angular/user';

@Component({
    template: `
        <div class="max-w-xs mx-auto">
            <p-inputgroup>
                <p-inputgroup-addon>
                    <svg data-p-icon="user" />
                </p-inputgroup-addon>
                <p-iftalabel>
                    <input pInputText id="name" [(ngModel)]="value" />
                    <label for="name">Name</label>
                </p-iftalabel>
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, InputGroupModule, InputGroupAddonModule, InputTextModule, FormsModule, User]
})
export class InputGroupIftaLabelDemo {
    value: string = 'Amy';
}
```
