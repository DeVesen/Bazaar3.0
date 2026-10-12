# Angular Timeline Component — Horizontal

## Horizontal

TimeLine orientation is controlled with the layout property, default is vertical having horizontal as the alternative.

```typescript
import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

@Component({
    template: `
        <div class="flex flex-col gap-4">
            <p-timeline [value]="events" layout="horizontal" align="top">
                <ng-template #content let-event>
                    <div class="text-sm leading-4">{{ event }}</div>
                </ng-template>
            </p-timeline>
            <p-timeline [value]="events" layout="horizontal" align="bottom">
                <ng-template #content let-event>
                    <div class="text-sm leading-4">{{ event }}</div>
                </ng-template>
            </p-timeline>
            <p-timeline [value]="events" layout="horizontal" align="alternate">
                <ng-template #content let-event>
                    <div class="text-sm leading-4">{{ event }}</div>
                </ng-template>
                <ng-template #opposite let-event><span>&nbsp;</span></ng-template>
            </p-timeline>
        </div>
    `,
    standalone: true,
    imports: [TimelineModule]
})
export class TimelineHorizontalDemo {
    events = ['2026', '2027', '2028', '2029'];
}
```
