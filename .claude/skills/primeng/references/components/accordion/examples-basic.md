# Angular Accordion Component — Basic

## Basic

A simple accordion with expandable panels controlled via the value prop.

```typescript
import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';

@Component({
    template: `
        <div class="flex justify-center">
            <p-accordion value="0" class="w-full max-w-md">
                <p-accordion-panel value="0">
                    <p-accordion-header>What is this service about?</p-accordion-header>
                    <p-accordion-content>
                        <p class="m-0 text-sm">This service helps you manage your projects more efficiently by offering real-time collaboration, task tracking, and powerful analytics.</p>
                    </p-accordion-content>
                </p-accordion-panel>
                <p-accordion-panel value="1">
                    <p-accordion-header>Is my data secure?</p-accordion-header>
                    <p-accordion-content>
                        <p class="m-0 text-sm">Yes. We use end-to-end encryption …(lange Zeile gekürzt)
                    </p-accordion-content>
                </p-accordion-panel>
                <p-accordion-panel value="2">
                    <p-accordion-header>Can I upgrade or downgrade my plan later?</p-accordion-header>
                    <p-accordion-content>
                        <p class="m-0 text-sm">Absolutely. You can change your s …(lange Zeile gekürzt)
                    </p-accordion-content>
                </p-accordion-panel>
            </p-accordion>
        </div>
    `,
    standalone: true,
    imports: [AccordionModule]
})
export class AccordionBasicDemo {}
```
