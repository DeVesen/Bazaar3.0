# Angular DatePicker Component — Multiple Months

## Multiple Months

Number of months to display is configured with the numberOfMonths property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" [numberOfMonths]="2" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerMultipleMonthsDemo {
    date: Date | undefined;
}
```
