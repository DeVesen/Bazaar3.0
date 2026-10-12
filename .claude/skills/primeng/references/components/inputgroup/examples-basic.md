# Angular InputGroup Component — Basic

## Basic

Combines an input with addons such as buttons or text labels.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
                <input pInputText [(ngModel)]="text1" placeholder="Username" />
            </p-inputgroup>
            <p-inputgroup>
                <p-inputgroup-addon>https://</p-inputgroup-addon>
                <input pInputText [(ngModel)]="text2" placeholder="website" />
                <p-inputgroup-addon>.com</p-inputgroup-addon>
            </p-inputgroup>
        </div>
    `,
    standalone: true,
    imports: [InputGroupModule, InputGroupAddonModule, InputTextModule, FormsModule, User]
})
export class InputGroupBasicDemo {
    text1: string | undefined;

    text2: string | undefined;
}
```
