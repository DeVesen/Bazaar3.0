# Angular InputPassword Component — Basic

## Basic

InputPassword is applied to an input element with the pInputPassword directive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputPassword [(ngModel)]="value" />
        </div>
    `,
    standalone: true,
    imports: [InputPasswordModule, FormsModule]
})
export class InputPasswordBasicDemo {
    value: string = '';
}
```
