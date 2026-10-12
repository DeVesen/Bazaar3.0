# Angular InputMask Component — Unmask

## Unmask

The onUnmaskedChange event is invoked on every value change and emits the rawValue without the mask formatting characters, so both the masked and raw values can be accessed at the same time.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex flex-col items-center gap-2">
            <input pInputText [(ngModel)]="value" pInputMask="(999) 999-9999" placeholder="(999) 999-9999" (onUnmaskedChange)="rawValue = $event" />
            <span class="text-sm text-muted-color">Masked: {{ value || '—' }}</span>
            <span class="text-sm text-muted-color">Raw: {{ rawValue || '—' }}</span>
        </div>
    `,
    standalone: true,
    imports: [InputTextModule, InputMaskModule, FormsModule]
})
export class InputMaskUnmaskDemo {
    value: string | undefined;

    rawValue: string | undefined;
}
```
