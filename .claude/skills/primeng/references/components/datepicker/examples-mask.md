# Angular DatePicker Component — Mask

## Mask

DatePicker can be used with the pInputMask directive to enforce a specific input format.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" pInputMask="99/99/9999" [keepCharPositions]="true" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, InputMaskModule, FormsModule]
})
export class DatePickerMaskDemo {
    date: Date | undefined;
}
```
