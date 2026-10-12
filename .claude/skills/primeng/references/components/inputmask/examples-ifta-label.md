# Angular InputMask Component — Ifta Label

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <input pInputText id="ssn" [(ngModel)]="value" pInputMask="999-99-9999" autocomplete="off" />
                <label for="ssn">SSN</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [IftaLabelModule, InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskIftaLabelDemo {
    value: string | undefined;
}
```
