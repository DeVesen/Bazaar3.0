# Angular InputPassword Component — Clear Icon

## Clear Icon

Use a custom clear action to reset the password input.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iconfield>
                <input pInputPassword [(ngModel)]="value" class="w-56" />
                @if (value) {
                    <p-inputicon (click)="value = ''" style="cursor: pointer">
                        <svg data-p-icon="times"></svg>
                    </p-inputicon>
                }
            </p-iconfield>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, InputPasswordModule, FormsModule, Times]
})
export class InputPasswordCleariconDemo {
    value: string = '';
}
```
