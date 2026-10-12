# Angular InputMask Component — Invalid

## Invalid

The invalid state is applied using the invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <input pInputText [(ngModel)]="value1" pInputMask="99-999999" placeholder="Serial Key" [invalid]="!value1" />
            <input pInputText [(ngModel)]="value2" pInputMask="99-999999" placeholder="Serial Key" [invalid]="!value2" variant="filled" />
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskInvalidDemo {
    value1: string | undefined;

    value2: string | undefined;
}
```
