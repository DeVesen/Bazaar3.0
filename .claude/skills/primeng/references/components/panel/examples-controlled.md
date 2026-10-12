# Angular Panel Component — Controlled

## Controlled

The collapsed property with two-way binding controls the open state programmatically.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="space-y-4 max-w-xs w-full">
                <div class="flex gap-2 justify-center">
                    <button type="button" pButton (click)="collapsed = false" [severity]="!collapsed ? 'primary' : 'secondary'">Open</button>
                    <button type="button" pButton (click)="collapsed = true" [severity]="collapsed ? 'primary' : 'secondary'">Close</button>
                </div>
                <p-panel header="Order Summary" [toggleable]="true" [(collapsed)]="collapsed">
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
    imports: [DividerModule, PanelModule, ButtonModule]
})
export class PanelControlledDemo {
    collapsed: boolean = false;
}
```
