# Angular Fieldset Component — Beispiele

## Basic

A simple Fieldset is created with a legend property along with the content as children.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    template: `
        <div class="flex justify-center">
            <p-fieldset legend="Invoice #1024" class="max-w-xs w-full">
                <div class="flex flex-col text-sm p-2">
                    <div class="flex justify-between">
                        <span class="text-color">Design Service</span>
                        <span class="text-muted-color">$120.00</span>
                    </div>
                    <div class="flex justify-between mt-3">
                        <span class="text-color">Hosting</span>
                        <span class="text-muted-color">$30.00</span>
                    </div>
                    <p-divider />
                    <div class="flex justify-between">
                        <span class="text-color font-medium">Total</span>
                        <span class="text-color font-medium">$150.00</span>
                    </div>
                </div>
            </p-fieldset>
        </div>
    `,
    standalone: true,
    imports: [DividerModule, FieldsetModule]
})
export class FieldsetBasicDemo {}
```

## Controlled

The collapsed property with two-way binding controls the open state programmatically.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { ButtonModule } from 'primeng/button';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="space-y-4 max-w-xs w-full">
                <div class="flex gap-2 justify-center">
                    <button type="button" pButton (click)="collapsed = false" [severity]="!collapsed ? 'primary' : 'secondary'">Open</button>
                    <button type="button" pButton (click)="collapsed = true" [severity]="collapsed ? 'primary' : 'secondary'">Close</button>
                </div>
                <p-fieldset legend="Invoice #1024" [toggleable]="true" [(collapsed)]="collapsed">
                    <div class="flex flex-col text-sm p-2">
                        <div class="flex justify-between">
                            <span class="text-color">Design Service</span>
                            <span class="text-muted-color">$120.00</span>
                        </div>
                        <div class="flex justify-between mt-3">
                            <span class="text-color">Hosting</span>
                            <span class="text-muted-color">$30.00</span>
                        </div>
                        <p-divider />
                        <div class="flex justify-between">
                            <span class="text-color font-medium">Total</span>
                            <span class="text-color font-medium">$150.00</span>
                        </div>
                    </div>
                </p-fieldset>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule, FieldsetModule, ButtonModule]
})
export class FieldsetControlledDemo {
    collapsed: boolean = false;
}
```

## Indicator

The toggleicon template customizes the indicator. It can switch between two icons using the collapsed context variable, or render a single icon that animates purely with CSS by targeting the toggle button's aria-expanded state.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { Plus } from '@primeicons/angular/plus';
import { Minus } from '@primeicons/angular/minus';
import { ChevronDown } from '@primeicons/angular/chevron-down';

@Component({
    template: `
        <div class="flex flex-col gap-8 max-w-xs mx-auto">
            <div>
                <h3 class="text-sm! font-medium! text-surface-500! mb-2">Match open / closed</h3>
                <p-fieldset legend="Invoice #1024" [toggleable]="true" class="w-full">
                    <ng-template #toggleicon let-collapsed="collapsed">
                        @if (collapsed) {
                            <svg data-p-icon="plus" />
                        } @else {
                            <svg data-p-icon="minus" />
                        }
                    </ng-template>
                    <div class="flex flex-col text-sm p-2">
                        <div class="flex justify-between">
                            <span class="text-color">Design Service</span>
                            <span class="text-muted-color">$120.00</span>
                        </div>
                        <div class="flex justify-between mt-3">
                            <span class="text-color">Hosting</span>
                            <span class="text-muted-color">$30.00</span>
                        </div>
                        <p-divider />
                        <div class="flex justify-between">
                            <span class="text-color font-medium">Total</span>
                            <span class="text-color font-medium">$150.00</span>
                        </div>
                    </div>
                </p-fieldset>
            </div>
            <div>
                <h3 class="text-sm! font-medium! text-surface-500! mb-2">CSS-only with data attributes</h3>
                <p-fieldset legend="Invoice #1024" [toggleable]="true" class="w-full">
                    <ng-template #toggleicon>
                        <svg data-p-icon="chevron-down" class="transition-transform duration-200 in-aria-expanded:rotate-180" />
                    </ng-template>
                    <div class="flex flex-col text-sm p-2">
                        <div class="flex justify-between">
                            <span class="text-color">Design Service</span>
                            <span class="text-muted-color">$120.00</span>
                        </div>
                        <div class="flex justify-between mt-3">
                            <span class="text-color">Hosting</span>
                            <span class="text-muted-color">$30.00</span>
                        </div>
                        <p-divider />
                        <div class="flex justify-between">
                            <span class="text-color font-medium">Total</span>
                            <span class="text-color font-medium">$150.00</span>
                        </div>
                    </div>
                </p-fieldset>
            </div>
        </div>
    `,
    standalone: true,
    imports: [DividerModule, FieldsetModule, Plus, Minus, ChevronDown]
})
export class FieldsetIndicatorDemo {}
```

## Template

Header section can also be defined with custom content instead of primitive values.

```typescript
import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    template: `
        <p-fieldset>
            <ng-template #header>
                <div class="flex items-center gap-2 px-2">
                    <p-avatar image="https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png" shape="circle" />
                    <span class="font-bold">Amy Elsner</span>
                </div>
            </ng-template>
            <p class="m-0 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do  …(lange Zeile gekürzt)
                consequat. Duis aute irure dolor in reprehenderit in voluptate v …(lange Zeile gekürzt)
            </p>
        </p-fieldset>
    `,
    standalone: true,
    imports: [AvatarModule, FieldsetModule]
})
export class FieldsetTemplateDemo {}
```

## Toggleable

Content of the fieldset can be expanded and collapsed using the toggleable property.

```typescript
import { Component } from '@angular/core';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
    template: `
        <div class="flex justify-center">
            <p-fieldset legend="Invoice #1024" [toggleable]="true" class="max-w-xs w-full">
                <div class="flex flex-col text-sm p-2">
                    <div class="flex justify-between">
                        <span class="text-color">Design Service</span>
                        <span class="text-muted-color">$120.00</span>
                    </div>
                    <div class="flex justify-between mt-3">
                        <span class="text-color">Hosting</span>
                        <span class="text-muted-color">$30.00</span>
                    </div>
                    <p-divider />
                    <div class="flex justify-between">
                        <span class="text-color font-medium">Total</span>
                        <span class="text-color font-medium">$150.00</span>
                    </div>
                </div>
            </p-fieldset>
        </div>
    `,
    standalone: true,
    imports: [DividerModule, FieldsetModule]
})
export class FieldsetToggleableDemo {}
```
