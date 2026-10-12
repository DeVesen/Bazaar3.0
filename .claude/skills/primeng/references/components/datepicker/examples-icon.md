# Angular DatePicker Component — Icon

## Icon

An additional icon is displayed next to the input field when showIcon is present.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { Clock } from '@primeicons/angular/clock';

@Component({
    template: `
        <p-fluid class="flex flex-wrap gap-4">
            <div class="flex-auto">
                <label for="buttondisplay" class="text-sm font-bold block mb-2"> Button </label>
                <p-datepicker [(ngModel)]="date1" [showIcon]="true" inputId="buttondisplay" [showOnFocus]="false" />
            </div>
            <div class="flex-auto">
                <label for="icondisplay" class="text-sm font-bold block mb-2"> Default Icon </label>
                <p-datepicker [(ngModel)]="date2" [iconDisplay]="'input'" [showIcon]="true" inputId="icondisplay" />
            </div>
            <div class="flex-auto">
                <label for="templatedisplay" class="text-sm font-bold block mb-2"> Custom Icon </label>
                <p-datepicker [(ngModel)]="date3" [iconDisplay]="'input'" [showIcon]="true" [timeOnly]="true" inputId="templatedisplay">
                    <ng-template #inputicon let-clickCallBack="clickCallBack">
                        <svg data-p-icon="clock" (click)="clickCallBack($event)" />
                    </ng-template>
                </p-datepicker>
            </div>
        </p-fluid>
    `,
    standalone: true,
    imports: [DatePickerModule, FluidModule, FormsModule, Clock]
})
export class DatePickerIconDemo {
    date1: Date | undefined;

    date2: Date | undefined;

    date3: Date | undefined;
}
```
