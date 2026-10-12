# Angular Focus Trap Component — Beispiele

## Basic

FocusTrap is applied to a container element with the pFocusTrap directive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoFocusModule } from 'primeng/autofocus';
import { FocusTrapModule } from 'primeng/focustrap';

@Component({
    template: `
        <div class="flex justify-center">
            <div pFocusTrap class="w-full sm:w-80 flex flex-col gap-5">
                <p-iconfield>
                    <p-inputicon>
                        <i class="pi pi-user"></i>
                    </p-inputicon>
                    <input type="text" pInputText id="input" [(ngModel)]="name" type="text" placeholder="Name" [pAutoFocus]="true" [fluid]="true" />
                </p-iconfield>
                <p-iconfield>
                    <p-inputicon>
                        <i class="pi pi-envelope"> </i>
                    </p-inputicon>
                    <input type="text" pInputText id="email" [(ngModel)]="email" type="email" placeholder="Email" [fluid]="true" />
                </p-iconfield>
                <div class="flex items-center gap-2">
                    <p-checkbox id="accept" [(ngModel)]="accept" name="accept" value="Accept" />
                    <label for="accept" class="text-sm">I agree to the terms and conditions.</label>
                </div>
                <button type="submit" pButton class="mt-2 w-full">Submit</button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, IconFieldModule, InputIconModule, ButtonModule, InputTextModule, AutoFocusModule, FocusTrapModule, FormsModule]
})
export class FocusTrapBasicDemo {
    name: string = '';

    email: string = '';

    accept: boolean = false;
}
```
