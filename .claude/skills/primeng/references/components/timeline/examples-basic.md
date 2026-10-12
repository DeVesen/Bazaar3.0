# Angular Timeline Component — Basic

## Basic

Timeline receives the events with the value property as a collection of arbitrary objects. In addition, content template is required to display the representation of an event. Example below is a sample events array that is used throughout the documentation.

```typescript
import { Component } from '@angular/core';
import { TimelineModule } from 'primeng/timeline';

@Component({
    template: `
        <p-timeline [value]="events">
            <ng-template #content let-event>
                <div class="text-sm leading-4">{{ event.status }}</div>
            </ng-template>
        </p-timeline>
    `,
    standalone: true,
    imports: [TimelineModule]
})
export class TimelineBasicDemo {
    events = [{ status: 'Ordered' }, { status: 'Processing' }, { status: 'Shipped' }, { status: 'Delivered' }];
}
```
