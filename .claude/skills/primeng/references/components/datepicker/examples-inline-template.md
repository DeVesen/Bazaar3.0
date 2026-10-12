# Angular DatePicker Component — Inline-template

## Inline-template

Custom content can be placed inside date cells in inline mode.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" [inline]="true" [numberOfMonths]="2" [pt]="{ day: 'w-12! h-12! rounded-lg!', dayCell: 'p-2!' }">
                <ng-template #date let-date let-selected="selected">
                    @if (!date.otherMonth) {
                        <div class="flex flex-col items-center gap-1 min-w-[50px]">
                            <span class="font-semibold text-base">{{ date.day }}</span>
                            @if (isFutureOrToday(date)) {
                                <span [class]="'text-sm font-medium ' + getPriceClass(date, selected)">{{ '$' + getPrice(date.year, date.month, date.day) }}</span>
                            }
                        </div>
                    } @else {
                        <span class="invisible">{{ date.day }}</span>
                    }
                </ng-template>
            </p-datepicker>
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerInlineTemplateDemo {
    date: Date | undefined;

    private today: Date = new Date();

    private priceMap = new Map<string, number>();

    constructor() {
        this.today.setHours(0, 0, 0, 0);
    }

    isFutureOrToday(date: any): boolean {
        const d = new Date(date.year, date.month, date.day);

        return d >= this.today;
    }

    getPrice(year: number, month: number, day: number): number {
        const key = `${year}-${month}-${day}`;

        if (!this.priceMap.has(key)) {
            this.priceMap.set(key, Math.floor(Math.random() * 71) + 30);
        }

        return this.priceMap.get(key)!;
    }

    getPriceClass(date: any, selected: boolean): string {
        const price = this.getPrice(date.year, date.month, date.day);
        const isLow = price < 50;

        if (selected) {
            return isLow ? 'text-green-200 dark:text-green-900' : 'opacity-70';
        }

        return isLow ? 'text-green-600 dark:text-green-400' : 'text-surface-600 dark:text-surface-400';
    }
}
```
