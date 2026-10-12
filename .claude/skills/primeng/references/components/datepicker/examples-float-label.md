# Angular DatePicker Component — Float Label

## Float Label

A floating label appears on top of the input field when focused. Visit FloatLabel documentation for more information.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
    template: `
        <div class="flex flex-wrap justify-center items-end gap-4">
            <p-floatlabel>
                <p-datepicker [(ngModel)]="value1" inputId="over_label" showIcon iconDisplay="input" />
                <label for="over_label">Over Label</label>
            </p-floatlabel>
            <p-floatlabel variant="in">
                <p-datepicker [(ngModel)]="value2" inputId="in_label" showIcon iconDisplay="input" />
                <label for="in_label">In Label</label>
            </p-floatlabel>
            <p-floatlabel variant="on">
                <p-datepicker [(ngModel)]="value3" inputId="on_label" showIcon iconDisplay="input" />
                <label for="on_label">On Label</label>
            </p-floatlabel>
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FloatLabelModule, FormsModule]
})
export class DatePickerFloatLabelDemo {
    value1: Date | undefined;

    value2: Date | undefined;

    value3: Date | undefined;
}
```
