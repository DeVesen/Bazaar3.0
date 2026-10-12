# Angular Accordion Component — With RadioButton

## With RadioButton

RadioButton component can be used to group multiple AccordionPanel components.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="w-full max-w-sm">
                <p-accordion [(value)]="selected" class="w-full block border border-surface-200 dark:border-surface-700 rounded-md divide-y divide-surface-200 dark:divide-surface-700">
                    @for (item of items; track item.value) {
                        <p-accordion-panel [value]="item.value">
                            <p-accordion-header>
                                <ng-template #toggleicon>
                                    <span></span>
                                </ng-template>
                                <span class="flex items-center gap-3 w-full">
                                    <p-radiobutton [value]="item.value" [(ngModel)]="selected" />
                                    <span class="flex items-center justify-between flex-1">
                                        <span class="font-semibold text-base">{{ item.label }}</span>
                                        <span class="font-semibold text-base">{{ item.price }}</span>
                                    </span>
                                </span>
                            </p-accordion-header>
                            <p-accordion-content>
                                <p class="m-0 text-surface-500 pl-8">{{ item.description }}</p>
                            </p-accordion-content>
                        </p-accordion-panel>
                    }
                </p-accordion>
                <button type="button" pButton class="w-full mt-4" size="large">Buy Now for {{ selectedPrice }}</button>
            </div>
        </div>
    `,
    standalone: true,
    imports: [AccordionModule, RadioButtonModule, ButtonModule, FormsModule]
})
export class AccordionRadioButtonDemo {
    items = [
        {
            label: 'Starter Plan',
            description: 'Perfect for individuals getting started. Includes access to core components and community support.',
            value: '0',
            price: '$99'
        },
        {
            label: 'Growth Plan',
            description: 'Ideal for freelancers and small teams. Unlocks advanced UI components and priority email support.',
            value: '1',
            price: '$249'
        },
        {
            label: 'Scale Plan',
            description: 'Best for growing businesses. Includes all features, early access to new releases, and Slack/Jira support.',
            value: '2',
            price: '$499'
        }
    ];

    selected: string = '0';

    get selectedPrice(): string {
        return this.items.find((item) => item.value === this.selected)?.price ?? '';
    }
}
```
