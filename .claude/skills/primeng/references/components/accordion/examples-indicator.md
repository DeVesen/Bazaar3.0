# Angular Accordion Component — Indicator

## Indicator

The toggleicon template customizes the indicator. It can switch between two icons using the active context variable, or render a single icon that animates purely with CSS by targeting the header's data-p attribute.

```typescript
import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { Minus } from '@primeicons/angular/minus';
import { Plus } from '@primeicons/angular/plus';
import { ChevronDown } from '@primeicons/angular/chevron-down';

@Component({
    template: `
        <div class="flex flex-col gap-8">
            <div>
                <h3 class="text-sm! font-medium! text-surface-500! mb-2">Match open / closed</h3>
                <p-accordion class="block max-w-md mx-auto">
                    <p-accordion-panel value="1">
                        <p-accordion-header>
                            <ng-template #toggleicon let-active="active">
                                @if (active) {
                                    <svg data-p-icon="minus" />
                                } @else {
                                    <svg data-p-icon="plus" />
                                }
                            </ng-template>
                            What is this service about?
                        </p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">
                                This service helps you manage your projects more …(lange Zeile gekürzt)
                                needs.
                            </p>
                        </p-accordion-content>
                    </p-accordion-panel>
                    <p-accordion-panel value="2">
                        <p-accordion-header>
                            <ng-template #toggleicon let-active="active">
                                @if (active) {
                                    <svg data-p-icon="minus" />
                                } @else {
                                    <svg data-p-icon="plus" />
                                }
                            </ng-template>
                            Is my data secure?
                        </p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">Yes. We use end-to-end encryp …(lange Zeile gekürzt)
                        </p-accordion-content>
                    </p-accordion-panel>
                    <p-accordion-panel value="3">
                        <p-accordion-header>
                            <ng-template #toggleicon let-active="active">
                                @if (active) {
                                    <svg data-p-icon="minus" />
                                } @else {
                                    <svg data-p-icon="plus" />
                                }
                            </ng-template>
                            Can I upgrade or downgrade my plan later?
                        </p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">Absolutely. You can change yo …(lange Zeile gekürzt)
                        </p-accordion-content>
                    </p-accordion-panel>
                </p-accordion>
            </div>
            <div>
                <h3 class="text-sm! font-medium! text-surface-500! mb-2">CSS-only with data attributes</h3>
                <p-accordion class="block max-w-md mx-auto">
                    <p-accordion-panel value="1">
                        <p-accordion-header>
                            <ng-template #toggleicon>
                                <svg data-p-icon="chevron-down" class="transition-transform duration-200 in-data-[p=active]:rotate-180" />
                            </ng-template>
                            What is this service about?
                        </p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">
                                This service helps you manage your projects more …(lange Zeile gekürzt)
                                needs.
                            </p>
                        </p-accordion-content>
                    </p-accordion-panel>
                    <p-accordion-panel value="2">
                        <p-accordion-header>
                            <ng-template #toggleicon>
                                <svg data-p-icon="chevron-down" class="transition-transform duration-200 in-data-[p=active]:rotate-180" />
                            </ng-template>
                            Is my data secure?
                        </p-accordion-header>
                        <p-accordion-content>
                            <p class="m-0 text-sm">Yes. We use end-to-end encryp …(lange Zeile gekürzt)
                        </p-accordion-content>
                    </p-accordion-panel>
                </p-accordion>
            </div>
        </div>
    `,
    standalone: true,
    imports: [AccordionModule, Minus, Plus, ChevronDown]
})
export class AccordionIndicatorDemo {}
```
