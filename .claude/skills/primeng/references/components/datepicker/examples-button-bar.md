# Angular DatePicker Component — Button Bar

## Button Bar

When showButtonBar is present, today and clear buttons are displayed at the footer. The content can be fully customized with the buttonbar template as well.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex justify-center gap-4 flex-wrap">
            <p-datepicker [(ngModel)]="date" [showButtonBar]="true" placeholder="Basic" />
            <p-datepicker [(ngModel)]="dates" [showButtonBar]="true" placeholder="Customized" selectionMode="range" [readonlyInput]="true">
                <ng-template #buttonbar let-todayCallback="todayCallback" let-clearCallback="clearCallback">
                    <div class="flex justify-between w-full">
                        <div class="flex gap-2">
                            <button type="button" pButton size="small" severity="secondary">Exact</button>
                            <button type="button" pButton size="small" severity="secondary">Flexible</button>
                        </div>
                        <div class="flex gap-2">
                            <button type="button" pButton size="small" (click)="todayCallback($event)" variant="outlined">Today</button>
                            <button type="button" pButton size="small" severity="danger" variant="text" (click)="clearCallback($event)"><svg data-p-icon="times" /></button>
                        </div>
                    </div>
                </ng-template>
            </p-datepicker>
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, ButtonModule, FormsModule, Times]
})
export class DatePickerButtonBarDemo {
    date: Date | undefined;

    dates: Date[] | undefined;
}
```
