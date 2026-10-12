# Angular InputMask Component — AutoClear

## AutoClear

When autoClear is set to false, the incomplete value is preserved on blur instead of being cleared.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex justify-center">
            <input pInputText [(ngModel)]="value" pInputMask="99-999999" placeholder="99-999999" [autoClear]="false" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskAutoclearDemo {
    value: string | undefined;
}
```
