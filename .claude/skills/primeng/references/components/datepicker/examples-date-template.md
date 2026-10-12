# Angular DatePicker Component — Date Template

## Date Template

Custom content can be placed inside date cells with the date template that takes a date metadata object as a parameter.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

interface CalendarEvent {
    label: string;
    type: EventType;
}

type EventType = 'personal' | 'work' | 'holiday';

@Component({
    template: `
        <div class="flex justify-center">
            <p-datepicker [(ngModel)]="date" [pt]="{ day: 'w-10! h-10!' }">
                <ng-template #date let-date let-selected="selected">
                    <div class="flex flex-col items-center leading-none gap-0.5">
                        <span [class]="'text-sm ' + (date.otherMonth ? 'text-surface-400 dark:text-surface-600' : isWeekend(date) && !selected ? 'text-red-500 dark:text-red-400' : '')">{{ date.day }}</span>
                        @if (!date.otherMonth && getEventsForDate(date.day, date.month).length > 0) {
                            <div class="flex gap-0.5">
                                @for (event of getEventsForDate(date.day, date.month); track event.label) {
                                    <span [class]="'w-1 h-1 rounded-full ' + dotColors[event.type]" [title]="event.label"></span>
                                }
                            </div>
                        }
                    </div>
                </ng-template>
            </p-datepicker>
        </div>
    `,
    standalone: true,
    imports: [DatePickerModule, FormsModule]
})
export class DatePickerDateTemplateDemo {
    date: Date | undefined;

    dotColors: Record<EventType, string> = {
        personal: 'bg-blue-500 dark:bg-blue-400',
        work: 'bg-orange-500 dark:bg-orange-400',
        holiday: 'bg-teal-500 dark:bg-teal-400'
    };

    isWeekend(date: any): boolean {
        const d = new Date(date.year, date.month, date.day);

        return d.getDay() === 0 || d.getDay() === 6;
    }

    getEventsForDate(day: number, month: number): CalendarEvent[] {
        const events: CalendarEvent[] = [];
        const d = new Date(2025, month, day);
        const dayOfWeek = d.getDay();

        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
            events.push({ label: 'Standup', type: 'work' });
        }

        if (day === 5 || day === 14 || day === 22) {
            events.push({ label: 'Gym', type: 'personal' });
        }

        if ((month === 0 && day === 1) || (month === 1 && day === 14) || (month === 4 && day === 1) || (month === 11 && day === 25) || (month === 11 && day === 31)) {
            events.push({ label: 'Holiday', type: 'holiday' });
        }

        if (dayOfWeek === 4 && (day <= 7 || (day > 14 && day <= 21))) {
            events.push({ label: 'Sprint Review', type: 'work' });
        }

        const seen = new Set<EventType>();

        return events.filter((e) => {
            if (seen.has(e.type)) return false;

            seen.add(e.type);

            return true;
        });
    }
}
```
