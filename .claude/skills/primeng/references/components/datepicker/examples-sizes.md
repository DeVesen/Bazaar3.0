# Angular DatePicker Component — Sizes

## Sizes

DatePicker provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <p-datepicker [(ngModel)]="value1" size="small" placeholder="Small" showIcon iconDisplay="input" />
            <p-datepicker [(ngModel)]="value2" placeholder="Normal" showIcon iconDisplay="input" />
            <p-datepicker [(ngModel)]="value3" size="large" placeholder="Large" showIcon iconDisplay="input" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerSizesDemo {
    value1: Date | undefined;

    value2: Date | undefined;

    value3: Date | undefined;
}
```
