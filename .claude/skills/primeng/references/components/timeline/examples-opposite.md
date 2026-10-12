# Angular Timeline Component — Opposite

## Opposite

Additional content at the other side of the line can be provided with the opposite property.

```typescript
import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

@Component({
    template: `
        <p-timeline [value]="events">
            <ng-template #opposite let-event>
                <div class="text-xs leading-4 text-surface-500 dark:text-surface-400">{{ event.date }}</div>
            </ng-template>
            <ng-template #content let-event>
                <div class="text-sm leading-4">{{ event.status }}</div>
            </ng-template>
        </p-timeline>
    `,
    standalone: true,
    imports: [TimelineModule]
})
export class TimelineOppositeDemo {
    events = [
        { status: 'Ordered', date: '15/10/2026 10:30' },
        { status: 'Processing', date: '15/10/2026 14:00' },
        { status: 'Shipped', date: '15/10/2026 16:15' },
        { status: 'Delivered', date: '16/10/2026 10:00' }
    ];
}
```
