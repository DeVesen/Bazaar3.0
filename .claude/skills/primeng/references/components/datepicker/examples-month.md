# Angular DatePicker Component — Month

## Month

Month only picker is enabled by specifying view as month in addition to a suitable dateFormat .

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" view="month" dateFormat="mm/yy" [readonlyInput]="true" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerMonthDemo {
    date: Date | undefined;
}
```
