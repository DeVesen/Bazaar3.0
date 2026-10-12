# Angular InputPassword Component — Ifta Label

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputPasswordModule } from 'primeng/inputpassword';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <input pInputPassword id="password" variant="filled" [(ngModel)]="value" autocomplete="off" />
                <label for="password">Password</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, InputPasswordModule, FormsModule]
})
export class InputPasswordIftaLabelDemo {
    value: string | undefined;
}
```
