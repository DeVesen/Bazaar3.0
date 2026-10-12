# Angular Accordion Component — Controlled

## Controlled

Control the active panel state with value and valueChange .

```typescript
import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="w-full max-w-md space-y-4">
                <div class="flex gap-2 justify-center">
                    <button type="button" pButton (click)="active = '0'" [severity]="active === '0' ? 'primary' : 'secondary'">Panel 1</button>
                    <button type="button" pButton (click)="active = '1'" [severity]="active === '1' ? 'primary' : 'secondary'">Panel 2</button>
                    <button type="button" pButton (click)="active = '2'" [severity]="active === '2' ? 'primary' : 'secondary'">Panel 3</button>
                    <button type="button" pButton (click)="active = null" severity="danger">Close All</button>
                </div>
                <p-accordion [(value)]="active">
                    <p-accordion-panel value="0">
                        <p-accordion-header>What is this service about?</p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">This service helps you manage your projects more efficiently by offering real-time collaboration, task tracking, and powerful analytics.</p>
                        </p-accordion-content>
                    </p-accordion-panel>
                    <p-accordion-panel value="1">
                        <p-accordion-header>Is my data secure?</p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">Yes. We use end-to-end encryp …(lange Zeile gekürzt)
                        </p-accordion-content>
                    </p-accordion-panel>
                    <p-accordion-panel value="2">
                        <p-accordion-header>Can I upgrade or downgrade my plan later?</p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">Absolutely. You can change yo …(lange Zeile gekürzt)
                        </p-accordion-content>
                    </p-accordion-panel>
                </p-accordion>
            </div>
        </div>
    `,
    standalone: true,
    imports: [AccordionModule, ButtonModule]
})
export class AccordionControlledDemo {
    active: string | null = '0';
}
```
