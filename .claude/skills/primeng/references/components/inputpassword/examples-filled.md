# Angular InputPassword Component — Filled

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputPassword variant="filled" [(ngModel)]="value" />
        </div>
    `,
    standalone: true,
    imports: [InputPasswordModule, FormsModule]
})
export class InputPasswordFilledDemo {
    value: string = '';
}
```
