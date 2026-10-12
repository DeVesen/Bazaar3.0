# Angular Timeline Component — Template

## Template

Sample implementation with custom content and styled markers.

```typescript
import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';

interface EventItem {
    status?: string;
    date?: string;
    icon?: string;
    color?: string;
    image?: string;
}

@Component({
    template: `
        <p-timeline [value]="events" align="alternate" class="customized-timeline">
            <ng-template #marker let-event>
                <span class="flex w-8 h-8 items-center justify-center text-white rounded-full z-10 shadow-xs" [style]="{ 'background-color': event.color }">
                    <i [class]="event.icon"></i>
                </span>
            </ng-template>
            <ng-template #content let-event>
                <p-card [header]="event.status" [subheader]="event.date">
                    @if (event.image) {
                        <img [src]="'https://primefaces.org/cdn/primeng/images/demo/product/' + event.image" [alt]="event.name" width="200" class="shadow-sm" />
                    }
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit …(lange Zeile gekürzt)
                        neque quas!
                    </p>
                    <button type="button" pButton [text]="true">Read more</button>
                </p-card>
            </ng-template>
        </p-timeline>
    `,
    standalone: true,
    imports: [CardModule, TimelineModule, ButtonModule]
})
export class TimelineTemplateDemo {
    events: EventItem[];

    constructor() {
        this.events = [
            { status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0', image: 'game-controller.jpg' },
            { status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
            { status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
            { status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' }
        ];
    }
}
```
