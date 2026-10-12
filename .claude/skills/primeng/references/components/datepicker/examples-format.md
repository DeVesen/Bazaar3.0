# Angular DatePicker Component — Format

## Format

Default date format is mm/dd/yy which can be customized using the dateFormat property. Following options can be a part of the format. d - day of month (no leading zero) dd - day of month (two digit) o - day of the year (no leading zeros) oo - day of the year (three digit) D - day name short DD - day name long m - month of year (no leading zero) mm - month of year (two digit) M - month name short MM - month name long y - year (two digit) yy - year (four digit) &#64; - Unix timestamp (ms since 01/01/1970) ! - Windows ticks (100ns since 01/01/0001) '...' - literal text '' - single quote anything else - literal text

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" dateFormat="dd/mm/yy" />
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerFormatDemo {
    date: Date | undefined;
}
```
