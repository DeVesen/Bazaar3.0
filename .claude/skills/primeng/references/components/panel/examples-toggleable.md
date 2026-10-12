# Angular Panel Component — Toggleable

## Toggleable

Content of the panel can be expanded and collapsed using the toggleable property.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';

@Component({
    template: `
        <div class="flex justify-center">
            <p-panel header="Order Summary" [toggleable]="true" class="max-w-xs w-full">
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
    `,
    standalone: true,
    imports: [DividerModule, PanelModule]
})
export class PanelToggleableDemo {}
```
