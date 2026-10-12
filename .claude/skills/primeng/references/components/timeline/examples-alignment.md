# Angular Timeline Component — Alignment

## Alignment

Content location relative the line is defined with the align property.

```typescript
import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

@Component({
    template: `
        <div class="flex flex-wrap gap-12">
            <p-timeline [value]="events" class="w-full md:w-80">
                <ng-template #content let-event>
                    <div class="text-sm leading-4">{{ event.status }}</div>
                </ng-template>
            </p-timeline>
            <p-timeline [value]="events" class="w-full md:w-80" align="right">
                <ng-template #content let-event>
                    <div class="text-sm leading-4">{{ event.status }}</div>
                </ng-template>
            </p-timeline>
            <p-timeline [value]="events" class="w-full md:w-80" align="alternate">
                <ng-template #content let-event>
                    <div class="text-sm leading-4">{{ event.status }}</div>
                </ng-template>
            </p-timeline>
        </div>
    `,
    standalone: true,
    imports: [TimelineModule]
})
export class TimelineAlignmentDemo {
    events = [{ status: 'Ordered' }, { status: 'Processing' }, { status: 'Shipped' }, { status: 'Delivered' }];
}
```
