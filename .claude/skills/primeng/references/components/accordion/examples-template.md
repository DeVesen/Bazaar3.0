# Angular Accordion Component — Template

## Template

Create accordion panels dynamically by iterating over a data source to keep structure consistent and reusable.

```typescript
import { Component } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { Minus } from '@primeicons/angular/minus';
import { Plus } from '@primeicons/angular/plus';
import { QuestionCircle } from '@primeicons/angular/question-circle';
import { Lock } from '@primeicons/angular/lock';
import { CreditCard } from '@primeicons/angular/credit-card';

@Component({
    template: `
        <div class="flex justify-center">
            <p-accordion class="w-full max-w-md">
                <p-accordion-panel value="0">
                    <p-accordion-header>
                        <ng-template #toggleicon let-active="active">
                            @if (active) {
                                <svg data-p-icon="minus" />
                            } @else {
                                <svg data-p-icon="plus" />
                            }
                        </ng-template>
                        <span class="flex items-center gap-4">
                            <svg data-p-icon="question-circle" class="text-yellow-500" />
                            <span class="font-medium">What is this service about?</span>
                        </span>
                    </p-accordion-header>
                    <p-accordion-content>
                        <p class="m-0 text-sm">
                            This service helps you manage your projects more eff …(lange Zeile gekürzt)
                        </p>
                    </p-accordion-content>
                </p-accordion-panel>
                <p-accordion-panel value="1">
                    <p-accordion-header>
                        <ng-template #toggleicon let-active="active">
                            @if (active) {
                                <svg data-p-icon="minus" />
                            } @else {
                                <svg data-p-icon="plus" />
                            }
                        </ng-template>
                        <span class="flex items-center gap-4">
                            <svg data-p-icon="lock" class="text-blue-500" />
                            <span class="font-medium">Is my data secure?</span>
                        </span>
                    </p-accordion-header>
                    <p-accordion-content>
                        <p class="m-0 text-sm">Yes. We use end-to-end encryption …(lange Zeile gekürzt)
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
                        <span class="flex items-center gap-4">
                            <svg data-p-icon="credit-card" class="text-green-500" />
                            <span class="font-medium">Can I upgrade or downgrade my plan later?</span>
                        </span>
                    </p-accordion-header>
                    <p-accordion-content>
                        <p class="m-0 text-sm">Absolutely. You can change your s …(lange Zeile gekürzt)
                    </p-accordion-content>
                </p-accordion-panel>
            </p-accordion>
        </div>
    `,
    standalone: true,
    imports: [AccordionModule, Minus, Plus, QuestionCircle, Lock, CreditCard]
})
export class AccordionTemplateDemo {}
```
