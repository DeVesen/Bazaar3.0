# Angular Accordion Component — Trigger

## Trigger

The trigger can be tailored per panel; the toggleicon template animates a custom icon via the header's data-p attribute, while a fully custom header lets the toggle be rendered as any element, such as a Button , by driving the active state with the value model.

```typescript
import { Component, signal } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Plus } from '@primeicons/angular/plus';

@Component({
    template: `
        <p-accordion [(value)]="value" [multiple]="true" class="block max-w-md mx-auto">
            <p-accordion-panel value="1">
                <p-accordion-header>
                    <ng-template #toggleicon>
                        <svg data-p-icon="plus" class="transition-transform ease-out in-data-[p=active]:rotate-45" />
                    </ng-template>
                    What is this service about?
                </p-accordion-header>
                <p-accordion-content>
                    <p class="m-0 text-sm">
                        This service helps you manage your projects more efficie …(lange Zeile gekürzt)
                    </p>
                </p-accordion-content>
            </p-accordion-panel>
            <p-accordion-panel value="2">
                <p-accordion-header>
                    <ng-template #toggleicon><span class="hidden"></span></ng-template>
                    <div class="flex items-center justify-between gap-4 -mx-4 -my-2 px-4 py-2 grow" (click)="$event.stopPropagation()">
                        <span class="text-sm font-semibold">Is my data secure?</span>
                        <button type="button" pButton variant="outlined" size="small" (click)="toggle('2'); $event.stopPropagation()">{{ isActive('2') ? 'Hide' : 'Show' }}</button>
                    </div>
                </p-accordion-header>
                <p-accordion-content>
                    <p class="m-0 text-sm">Yes. We use end-to-end encryption and follow industry best practices to ensure your data is protected. Your information is stored on secure servers and regularly backed up.</p>
                </p-accordion-content>
            </p-accordion-panel>
            <p-accordion-panel value="3">
                <p-accordion-header>
                    <ng-template #toggleicon><span class="hidden"></span></ng-template>
                    <span class="inline-flex items-center gap-2">
                        <svg data-p-icon="plus" class="transition-transform ease-out in-data-[p=active]:rotate-45" />
                        Can I upgrade or downgrade my plan later?
                    </span>
                </p-accordion-header>
                <p-accordion-content>
                    <p class="m-0 text-sm">Absolutely. You can change your subsc …(lange Zeile gekürzt)
                </p-accordion-content>
            </p-accordion-panel>
        </p-accordion>
    `,
    standalone: true,
    imports: [AccordionModule, ButtonModule, Plus]
})
export class AccordionTriggerDemo {
    value = signal<string[]>([]);

    isActive(panel: string): boolean {
        return this.value().includes(panel);
    }

    toggle(panel: string) {
        this.value.update((current) => (current.includes(panel) ? current.filter((v) => v !== panel) : [...current, panel]));
    }
}
```
