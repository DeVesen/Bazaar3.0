# Angular Checkbox Component — Beispiele

## Basic

Binary checkbox is used as a controlled input with ngModel and binary properties.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    template: `
        <div class="flex justify-center gap-4">
            <p-checkbox [(ngModel)]="checked" [binary]="true" />
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, FormsModule]
})
export class CheckboxBasicDemo {
    checked: boolean = false;
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    template: `
        <div class="flex items-center justify-center gap-4">
            <p-checkbox [(ngModel)]="checked1" [binary]="true" [disabled]="true" />
            <p-checkbox [(ngModel)]="checked2" [binary]="true" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, FormsModule]
})
export class CheckboxDisabledDemo {
    checked1: boolean = false;

    checked2: boolean = true;
}
```

## Dynamic

Checkboxes can be generated using a list of values.

```typescript
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex justify-center">
            <div class="flex flex-col gap-4">
                @for (category of categories; track category.key) {
                    <div class="flex items-center gap-2">
                        <p-checkbox [inputId]="category.key" name="group" [value]="category" [(ngModel)]="selectedCategories" />
                        <label pLabel [for]="category.key" class="text-sm">{{ category.name }}</label>
                    </div>
                }
            </div>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, LabelModule, FormsModule]
})
export class CheckboxDynamicDemo implements OnInit {
    selectedCategories: any[] = [];

    categories: any[] = [
        { name: 'Accounting', key: 'A' },
        { name: 'Marketing', key: 'M' },
        { name: 'Production', key: 'P' },
        { name: 'Research', key: 'R' }
    ];

    ngOnInit() {
        this.selectedCategories = [this.categories[1]];
    }
}
```

## Filled

Specify the variant property as filled to display the component with a higher visual emphasis than the default outlined style.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <div class="flex items-center gap-2">
                <p-checkbox [(ngModel)]="checked" [binary]="true" variant="filled" inputId="filled-checkbox" />
                <label pLabel for="filled-checkbox" class="text-sm">Filled</label>
            </div>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, LabelModule, FormsModule]
})
export class CheckboxFilledDemo {
    checked: boolean = false;
}
```

## Indeterminate

The indeterminate state indicates that a checkbox is neither "on" or "off".

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex items-center gap-2 justify-center">
            <p-checkbox [(ngModel)]="checked" [binary]="true" [indeterminate]="true" inputId="indeterminate-checkbox" />
            <label pLabel for="indeterminate-checkbox" class="text-sm">Email Notifications</label>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, LabelModule, FormsModule]
})
export class CheckboxIndeterminateDemo {
    checked: boolean = false;
}
```

## Indicator

Use the icon template to customize the visual indicator inside the checkbox.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LabelModule } from 'primeng/label';
import { Check } from '@primeicons/angular/check';
import { Minus } from '@primeicons/angular/minus';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <div class="flex items-center gap-2">
                <p-checkbox [(ngModel)]="checked" [binary]="true" [indeterminate]="true" inputId="checkbox-indicator" (onChange)="onCheck()">
                    <ng-template #icon let-checked="checked" let-iconClass="class">
                        @if (checked) {
                            <svg data-p-icon="check" [class]="iconClass" />
                        } @else if (isIndeterminate) {
                            <svg data-p-icon="minus" [class]="iconClass" />
                        } @else {
                            <svg data-p-icon="times" [class]="iconClass" />
                        }
                    </ng-template>
                </p-checkbox>
                <label pLabel for="checkbox-indicator" class="text-sm">Select all notifications</label>
            </div>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, LabelModule, FormsModule, Check, Minus, Times]
})
export class CheckboxIndicatorDemo {
    checked: boolean = false;

    isIndeterminate: boolean = true;

    onCheck() {
        this.isIndeterminate = false;
    }
}
```

## Invalid

The invalid state is applied using the invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <div class="flex items-center gap-2">
                <p-checkbox [(ngModel)]="checked" [binary]="true" [invalid]="!checked" inputId="invalid-checkbox" />
                <label pLabel for="invalid-checkbox" [class]="'transition-colors ' + (!checked ? 'text-red-500! dark:text-red-400!' : '')">Invalid</label>
            </div>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, LabelModule, FormsModule]
})
export class CheckboxInvalidDemo {
    checked: boolean = false;
}
```

## Sizes

Checkbox provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LabelModule } from 'primeng/label';

@Component({
    template: `
        <div class="flex flex-wrap items-center justify-center gap-4">
            <div class="flex items-center gap-2">
                <p-checkbox [(ngModel)]="small" [binary]="true" inputId="small-checkbox" size="small" />
                <label pLabel for="small-checkbox" class="text-sm">Small</label>
            </div>
            <div class="flex items-center gap-2">
                <p-checkbox [(ngModel)]="normal" [binary]="true" inputId="normal-checkbox" />
                <label pLabel for="normal-checkbox" class="text-sm">Normal</label>
            </div>
            <div class="flex items-center gap-2">
                <p-checkbox [(ngModel)]="large" [binary]="true" inputId="large-checkbox" size="large" />
                <label pLabel for="large-checkbox" class="text-sm">Large</label>
            </div>
        </div>
    `,
    standalone: true,
    imports: [CheckboxModule, LabelModule, FormsModule]
})
export class CheckboxSizesDemo {
    small: boolean = false;

    normal: boolean = false;

    large: boolean = false;
}
```
