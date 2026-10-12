# Angular DatePicker Component — Invalid

## Invalid

Specify the invalid property to display the component with a red border.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex flex-wrap justify-center gap-4">
            <p-datepicker [(ngModel)]="date1" [invalid]="!date1" placeholder="Date" />
            <p-datepicker [(ngModel)]="date2" [invalid]="!date2" variant="filled" placeholder="Date" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerInvalidDemo {
    date1: Date | undefined;

    date2: Date | undefined;
}
```
