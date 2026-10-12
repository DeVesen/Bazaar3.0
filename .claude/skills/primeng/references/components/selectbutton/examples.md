# Angular SelectButton Component — Beispiele

## Basic

SelectButton requires a value to bind and a collection of options.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-selectbutton [options]="stateOptions" [(ngModel)]="value" optionLabel="label" optionValue="value" aria-labelledby="basic" />
        </div>
    `,
    standalone: true,
    imports: [SelectButtonModule, FormsModule]
})
export class SelectButtonBasicDemo {
    stateOptions: any[] = [
        { label: 'One-Way', value: 'one-way' },
        { label: 'Return', value: 'return' }
    ];

    value: string = 'one-way';
}
```

## Disabled

When disabled is present, the element cannot be edited and focused entirely. Certain options can also be disabled using the optionDisabled property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    template: `
        <div class="flex justify-center flex-wrap gap-4">
            <p-selectbutton [options]="stateOptions" [(ngModel)]="value1" optionLabel="label" optionValue="value" [disabled]="true" />
            <p-selectbutton [options]="stateOptions2" [(ngModel)]="value2" optionLabel="label" optionValue="value" optionDisabled="constant" />
        </div>
    `,
    standalone: true,
    imports: [SelectButtonModule, FormsModule]
})
export class SelectButtonDisabledDemo {
    stateOptions: any[] = [
        { label: 'Off', value: 'off' },
        { label: 'On', value: 'on' }
    ];

    stateOptions2: any[] = [
        { label: 'Option 1', value: 'Option 1' },
        { label: 'Option 2', value: 'Option 2', constant: true }
    ];

    value1: string = 'off';

    value2: string = 'Option 1';
}
```

## Fluid

The fluid prop makes the component take up the full width of its container when set to true.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    template: `
        <p-selectbutton [options]="stateOptions" [(ngModel)]="value" optionLabel="label" optionValue="value" fluid />
    `,
    standalone: true,
    imports: [SelectButtonModule, FormsModule]
})
export class SelectButtonFluidDemo {
    stateOptions: any[] = [
        { label: 'One-Way', value: 'one-way' },
        { label: 'Return', value: 'return' }
    ];

    value: string = 'one-way';
}
```

## Invalid

The invalid state is applied using the ⁠invalid property to indicate failed validation, which can be integrated with Angular Forms.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-selectbutton [options]="stateOptions" [(ngModel)]="value" optionLabel="label" optionValue="value" [invalid]="value === undefined" />
        </div>
    `,
    standalone: true,
    imports: [SelectButtonModule, FormsModule]
})
export class SelectButtonInvalidDemo {
    stateOptions: any[] = [
        { label: 'One-Way', value: 'one-way' },
        { label: 'Return', value: 'return' }
    ];

    value: string | undefined;
}
```

## Multiple

SelectButton allows selecting only one item by default and setting multiple option enables choosing more than one item. In multiple case, model property should be an array.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-selectbutton [options]="paymentOptions" [(ngModel)]="value" [multiple]="true" optionLabel="name" optionValue="value" />
        </div>
    `,
    standalone: true,
    imports: [SelectButtonModule, FormsModule]
})
export class SelectButtonMultipleDemo {
    paymentOptions: any[] = [
        { name: 'Option 1', value: 1 },
        { name: 'Option 2', value: 2 },
        { name: 'Option 3', value: 3 }
    ];

    value!: number;
}
```

## Sizes

SelectButton provides small and large sizes as alternatives to the base.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    template: `
        <div class="flex flex-col items-center gap-4">
            <p-selectbutton [(ngModel)]="value1" [options]="options" size="small" />
            <p-selectbutton [(ngModel)]="value2" [options]="options" />
            <p-selectbutton [(ngModel)]="value3" [options]="options" size="large" />
        </div>
    `,
    standalone: true,
    imports: [SelectButtonModule, FormsModule]
})
export class SelectButtonSizesDemo {
    value1!: string;

    value2: string = 'Beginner';

    value3: string = 'Expert';

    options: any[] = [
        { label: 'Beginner', value: 'Beginner' },
        { label: 'Expert', value: 'Expert' }
    ];
}
```

## Template

For custom content support define a template named item where the default local template variable refers to an option.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
    template: `
        <div class="flex justify-center">
            <p-selectbutton [options]="justifyOptions" [(ngModel)]="value" optionLabel="justify">
                <ng-template #item let-item>
                    <i [class]="item.icon"></i>
                </ng-template>
            </p-selectbutton>
        </div>
    `,
    standalone: true,
    imports: [SelectButtonModule, FormsModule]
})
export class SelectButtonTemplateDemo {
    value: any;

    justifyOptions: any[] = [
        { icon: 'pi pi-align-left', justify: 'Left' },
        { icon: 'pi pi-align-right', justify: 'Right' },
        { icon: 'pi pi-align-center', justify: 'Center' },
        { icon: 'pi pi-align-justify', justify: 'Justify' }
    ];
}
```
