# Angular Panel Component — Indicator

## Indicator

The headericons template customizes the indicator. It can switch between two icons using the collapsed context variable, or render a single icon that animates purely with CSS by targeting the toggle button's aria-expanded state.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { Plus } from '@primeicons/angular/plus';
import { Minus } from '@primeicons/angular/minus';
import { ChevronDown } from '@primeicons/angular/chevron-down';

@Component({
    template: `
        <div class="flex flex-col gap-8 max-w-xs mx-auto">
            <div>
                <h3 class="text-sm! font-medium! text-surface-500! mb-2">Match open / closed</h3>
                <p-panel header="Order Summary" [toggleable]="true" class="w-full">
                    <ng-template #headericons let-collapsed="collapsed">
                        @if (collapsed) {
                            <svg data-p-icon="plus"></svg>
                        } @else {
                            <svg data-p-icon="minus"></svg>
                        }
                    </ng-template>
                    <div class="flex flex-col text-sm">
                        <div class="flex justify-between">
                            <span class="text-muted-color">Wireless Headphones</span>
                            <span class="text-color font-medium">$79.00</span>
                        </div>
                        <div class="flex justify-between mt-3">
                            <span class="text-muted-color">Phone Case</span>
                            <span class="text-color font-medium">$15.00</span>
                        </div>
                        <div class="flex justify-between mt-3">
                            <span class="text-muted-color">Shipping</span>
                            <span class="text-color font-medium">$5.99</span>
                        </div>
                        <p-divider />
                        <div class="flex justify-between">
                            <span class="text-color font-semibold">Total</span>
                            <span class="text-color font-semibold">$99.99</span>
                        </div>
                    </div>
                </p-panel>
            </div>
            <div>
                <h3 class="text-sm! font-medium! text-surface-500! mb-2">CSS-only with data attributes</h3>
                <p-panel header="Order Summary" [toggleable]="true" class="w-full">
                    <ng-template #headericons>
                        <svg data-p-icon="chevron-down" class="transition-transform duration-200 in-aria-expanded:rotate-180"></svg>
                    </ng-template>
                    <div class="flex flex-col text-sm">
                        <div class="flex justify-between">
                            <span class="text-muted-color">Wireless Headphones</span>
                            <span class="text-color font-medium">$79.00</span>
                        </div>
                        <div class="flex justify-between mt-3">
                            <span class="text-muted-color">Phone Case</span>
                            <span class="text-color font-medium">$15.00</span>
                        </div>
                        <div class="flex justify-between mt-3">
                            <span class="text-muted-color">Shipping</span>
                            <span class="text-color font-medium">$5.99</span>
                        </div>
                        <p-divider />
                        <div class="flex justify-between">
                            <span class="text-color font-semibold">Total</span>
                            <span class="text-color font-semibold">$99.99</span>
                        </div>
                    </div>
                </p-panel>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule, PanelModule, Plus, Minus, ChevronDown]
})
export class PanelIndicatorDemo {}
```
