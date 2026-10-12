# Angular InputPassword Component — Sizes

## Sizes

InputPassword provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <input pInputPassword pSize="small" [(ngModel)]="value1" placeholder="Small" />
            <input pInputPassword [(ngModel)]="value2" placeholder="Normal" />
            <input pInputPassword pSize="large" [(ngModel)]="value3" placeholder="Large" />
        </div>
    `,
    standalone: true,
    imports: [InputPasswordModule, FormsModule]
})
export class InputPasswordSizesDemo {
    value1: string = '';

    value2: string = '';

    value3: string = '';
}
```
