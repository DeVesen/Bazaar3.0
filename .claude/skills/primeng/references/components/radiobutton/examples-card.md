# Angular RadioButton Component — Card

## Card

RadioButtons can be displayed in a card style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    description: string;
    tag: string | null;
}

@Component({
    template: `
        <div class="max-w-xs mx-auto">
            <span class="font-medium">Choose a plan:</span>
            <div class="mt-2 flex flex-col gap-3">
                @for (plan of plans; track plan.id) {
                    <label
                        [for]="'plan-' + plan.id"
                        [class]="'flex-1 flex items-start gap-2 p-3 rounded-lg b …(lange Zeile gekürzt)
                    >
                        <div class="flex-1 flex flex-col gap-1">
                            <div class="flex items-center justify-between gap-2">
                                <div class="flex items-center gap-2">
                                    <span class="font-medium leading-none">{{ plan.name }}</span>
                                    @if (plan.tag) {
                                        <p-tag [value]="plan.tag" />
                                    }
                                </div>
                                <div class="text-sm text-color">
                                    <span class="font-semibold">{{ plan.price }}</span>
                                    <span class="text-surface-500">{{ plan.period }}</span>
                                </div>
                            </div>
                            <span class="text-sm text-surface-500">{{ plan.description }}</span>
                        </div>
                        <p-radiobutton [inputId]="'plan-' + plan.id" name="plan" [value]="plan.id" [(ngModel)]="selectedPlan" />
                    </label>
                }
            </div>
        </div>
    `,
    standalone: true,
    imports: [RadioButtonModule, TagModule, FormsModule]
})
export class RadioButtonCardDemo {
    selectedPlan: string = 'pro';

    plans: Plan[] = [
        { id: 'starter', name: 'Starter', price: '$0', period: '/month', description: 'For solo developers exploring the platform.', tag: null },
        { id: 'pro', name: 'Pro', price: '$29', period: '/month', description: 'For growing teams shipping in production.', tag: 'Popular' },
        { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', description: 'For large organizations with custom needs.', tag: null }
    ];
}
```
