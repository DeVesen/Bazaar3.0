# Angular Timeline Component — Custom

## Custom

Sample implementation with custom content, styled markers, and rich event cards.

```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { Box } from '@primeicons/angular/box';
import { MapMarker } from '@primeicons/angular/map-marker';
import { PIcon } from '@primeicons/angular/p-icon';

@Component({
    template: `
        <p-timeline
            [value]="events"
            align="alternate"
            class="w-full @container"
            [pt]="{ event: { class: '@max-[480px]:flex-row!' }, eventOpposite: { class: '@max-[480px]:hidden' }, eventContent: { class: '@max-[480px]:text-left!' }, eventConnector: { class: 'mb-4' } }"
        >
            <ng-template #opposite let-event>
                <div class="font-medium text-surface-700 dark:text-surface-200">{{ event.date }}</div>
                <div class="text-sm text-surface-500 dark:text-surface-400">{{ event.time }}</div>
            </ng-template>
            <ng-template #marker let-event>
                <span [class]="'flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg ' + event.color">
                    <svg [pIcon]="event.icon" class="text-lg" />
                </span>
            </ng-template>
            <ng-template #content let-event>
                <div class="p-5 rounded-xl bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm mb-4 text-left">
                    <div class="hidden @max-[480px]:block mb-2 text-sm text-surface-500 dark:text-surface-400">{{ event.date }} · {{ event.time }}</div>
                    <div class="flex items-center gap-3 mb-3">
                        <p-avatar [label]="event.user" shape="circle" class="bg-primary/10! text-primary! font-semibold!" />
                        <span class="font-bold text-surface-900 dark:text-surface-0">{{ event.status }}</span>
                    </div>
                    <span class="text-surface-600 dark:text-surface-300 text-sm leading-relaxed">{{ event.description }}</span>
                    @if (event.details) {
                        <ul class="mt-3 space-y-1">
                            @for (detail of event.details; track detail) {
                                <li class="text-sm text-surface-500 dark:text-surface-400 flex items-center gap-2">
                                    <svg data-p-icon="box" class="text-xs" />
                                    {{ detail }}
                                </li>
                            }
                        </ul>
                    }
                    @if (event.tracking) {
                        <div class="mt-4 p-3 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-between">
                            <span class="text-sm text-surface-600 dark:text-surface-300 flex items-center">
                                <svg data-p-icon="map-marker" class="mr-2 shrink-0" />
                                Tracking: {{ event.tracking }}
                            </span>
                            <button type="button" pButton variant="text" size="small">Track</button>
                        </div>
                    }
                </div>
            </ng-template>
        </p-timeline>
    `,
    standalone: true,
    imports: [AvatarModule, TimelineModule, ButtonModule, Box, MapMarker, PIcon],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineCustomDemo {
    events = [
        {
            status: 'Order Placed',
            date: 'Oct 15, 2026',
            time: '10:30 AM',
            icon: 'shopping-cart',
            color: 'bg-blue-500',
            user: 'JD',
            description: 'Your order #12345 has been confirmed and is being prepared for processing.',
            details: ['2x Wireless Headphones', '1x Phone Case', '1x USB-C Cable']
        },
        {
            status: 'Payment Confirmed',
            date: 'Oct 15, 2026',
            time: '10:32 AM',
            icon: 'credit-card',
            color: 'bg-green-500',
            user: 'SY',
            description: 'Payment of $149.99 was successfully processed via Credit Card ending in 4242.'
        },
        {
            status: 'Shipped',
            date: 'Oct 16, 2026',
            time: '02:15 PM',
            icon: 'truck',
            color: 'bg-orange-500',
            user: 'MK',
            description: 'Package has been handed to the carrier and is on its way.',
            tracking: 'TRK-892374651'
        },
        {
            status: 'Delivered',
            date: 'Oct 18, 2026',
            time: '11:20 AM',
            icon: 'check-circle',
            color: 'bg-lime-500',
            user: 'JD',
            description: 'Package was delivered and signed for at the front door.'
        }
    ];
}
```
