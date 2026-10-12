# Angular DatePicker Component — Ifta Label

## Ifta Label

IftaLabel is used to create infield top aligned labels. Visit IftaLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
    template: `
        <div class="flex justify-center">
            <p-iftalabel>
                <p-datepicker [(ngModel)]="value" inputId="date" showIcon iconDisplay="input" />
                <label for="date">Date</label>
            </p-iftalabel>
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, IftaLabelModule, FormsModule]
})
export class DatePickerIftaLabelDemo {
    value: Date | undefined;
}
```
