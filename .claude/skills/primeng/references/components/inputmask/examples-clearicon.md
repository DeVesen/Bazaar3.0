# Angular InputMask Component — Clearicon

## Clearicon

When showClear is enabled, a clear icon is displayed to clear the value.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex justify-center">
            <p-inputmask mask="99-999999" [(ngModel)]="value" placeholder="99-999999" [showClear]="true" />
        </div>
    `,
    standalone: true,
    imports: [InputMaskModule, FormsModule]
})
export class InputMaskClearIconDemo {
    value: string | undefined;
}
```
