# Angular DatePicker Component — Disabled

## Disabled

Use the disabled property to disable a datepicker.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerDisabledDemo {
    date: Date | undefined;
}
```
