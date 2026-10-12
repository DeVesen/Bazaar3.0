# Angular DatePicker Component — Year

## Year

Specifying view as year in addition to a suitable dateFormat enables the year picker.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" view="year" dateFormat="yy" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerYearDemo {
    date: Date | undefined;
}
```
