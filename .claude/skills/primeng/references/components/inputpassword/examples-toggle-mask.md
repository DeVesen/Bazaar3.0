# Angular InputPassword Component — Toggle Mask

## Toggle Mask

Adding a toggle icon to show or hide the password, allowing users to verify their input.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputPasswordModule } from 'primeng/inputpassword';
import { Eye } from '@primeicons/angular/eye';
import { EyeSlash } from '@primeicons/angular/eye-slash';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iconfield>
                <input pInputPassword [(ngModel)]="value" [(mask)]="mask" />
                <p-inputicon (click)="mask = !mask" style="cursor: pointer">
                    @if (mask) {
                        <svg data-p-icon="eye"></svg>
                    } @else {
                        <svg data-p-icon="eye-slash"></svg>
                    }
                </p-inputicon>
            </p-iconfield>
        </div>
    `,
    standalone: true,
    imports: [IconFieldModule, InputIconModule, InputPasswordModule, FormsModule, Eye, EyeSlash]
})
export class InputPasswordTogglemaskDemo {
    value: string = '';

    mask: boolean = true;
}
```
