# Angular Slider Component — Beispiele

## Basic

Select a numeric value by dragging a handle along a track. Two-way binding is defined using the standard ngModel directive.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <p-slider [(ngModel)]="value" class="max-w-3xs mx-auto w-full" />
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderBasicDemo {
    value: number = 50;
}
```

## Controlled

Slider is connected to an InputNumber using two-way binding.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <div class="max-w-3xs w-full mx-auto">
            <p-inputnumber [(ngModel)]="value" [showButtons]="false" fluid class="mb-4" />
            <p-slider [(ngModel)]="value" class="w-full" />
        </div>
    `,
    standalone: true,
    imports: [InputNumberModule, SliderModule, FormsModule]
})
export class SliderControlledDemo {
    value: number = 50;
}
```

## Custom

Slider is customized with the pt property to override the style of each section.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <div class="max-w-xs mx-auto w-full space-y-16">
            <p-slider
                [(ngModel)]="value1"
                [pt]="{
                    track: { class: 'h-2! bg-blue-100! dark:bg-blue-950!' },
                    range: { class: 'bg-blue-500!' },
                    handle: { class: 'before:hidden! border-2! border-blue-500! bg-surface-0! dark:bg-surface-900! rotate-45! rounded-md!' }
                }"
            />
            <p-slider
                [(ngModel)]="value2"
                [pt]="{
                    track: { class: 'h-2! bg-amber-100! dark:bg-amber-950!' },
                    range: { class: 'bg-amber-500!' },
                    handle: { class: 'before:hidden! w-4! h-5! border-2! border-amber-500! bg-surface-0! dark:bg-surface-900! rounded-sm!' }
                }"
            />
        </div>
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderCustomDemo {
    value1: number = 50;

    value2: number = 50;
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <div class="max-w-3xs w-full mx-auto space-y-12">
            <div>
                <h5 class="mb-2 text-sm font-medium">Disabled Slider</h5>
                <p-slider [(ngModel)]="value" [disabled]="true" />
            </div>
            <div>
                <h5 class="mb-2 text-sm font-medium">Disabled All Handles</h5>
                <p-slider [(ngModel)]="rangeValues" [range]="true" [disabled]="true" />
            </div>
            <div>
                <h5 class="mb-2 text-sm font-medium">Disabled Single Handle</h5>
                <p-slider [(ngModel)]="rangeValues2" [range]="true" [disabledMinHandle]="true" />
            </div>
        </div>
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderDisabledDemo {
    value: number = 50;

    rangeValues: number[] = [20, 80];

    rangeValues2: number[] = [20, 80];
}
```

## Filter

Image filter implementation using multiple sliders.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <div class="flex flex-col items-center justify-center">
            <img alt="user header" class="w-80 rounded mb-6" src="https://primefaces.org/cdn/primevue/images/galleria/galleria1.jpg" [style]="filterStyle" />
            <p-selectbutton [(ngModel)]="filter" [options]="filterOptions" optionLabel="label" optionValue="value" />
            <p-slider [(ngModel)]="filterValues[filter]" class="max-w-56 mt-4" [min]="0" [max]="200" />
        </div>
    `,
    standalone: true,
    imports: [SelectButtonModule, SliderModule, FormsModule]
})
export class SliderFilterDemo {
    filter: number = 0;

    filterValues: number[] = [100, 100, 0];

    filterOptions: any = [
        { label: 'Contrast', value: 0 },
        { label: 'Brightness', value: 1 },
        { label: 'Sepia', value: 2 }
    ];

    get filterStyle() {
        return {
            filter: `contrast(${this.filterValues[0]}%) brightness(${this.filterValues[1]}%) sepia(${this.filterValues[2]}%)`
        };
    }
}
```

## Handles Distance

The minStepsBetweenHandles property defines the minimum number of steps between handles in range mode.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <p-slider [(ngModel)]="rangeValues" [range]="true" [minStepsBetweenHandles]="20" class="max-w-3xs mx-auto w-full" />
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderHandlesdistanceDemo {
    rangeValues: number[] = [20, 80];
}
```

## Input

Slider is connected to an input field using two-way binding.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';

@Component({
    template: `
        <div class="max-w-3xs w-full mx-auto">
            <input type="text" pInputText [(ngModel)]="value" class="w-full mb-4" />
            <p-slider [(ngModel)]="value" class="w-full" />
        </div>
    `,
    standalone: true,
    imports: [SliderModule, InputTextModule, FormsModule]
})
export class SliderInputDemo {
    value: number = 50;
}
```

## Range

When the range property is present, slider provides two handles to define two values. In range mode, the value should be an array instead of a single value.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <p-slider [(ngModel)]="rangeValues" [range]="true" class="max-w-3xs mx-auto w-full" />
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderRangeDemo {
    rangeValues: number[] = [20, 80];
}
```

## Step

Size of each movement is defined with the step property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <p-slider [(ngModel)]="value" [step]="20" class="max-w-3xs mx-auto w-full" />
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderStepDemo {
    value: number = 20;
}
```

## Value Change

The onChange event is triggered during drag, while onSlideEnd is fired when the drag operation completes.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <div class="max-w-3xs mx-auto w-full flex flex-col items-center space-y-4">
            <div class="text-sm text-surface-500 font-mono">onChange: {{ value }}</div>
            <div class="text-sm text-surface-500 font-mono">onSlideEnd: {{ endValue }}</div>
            <p-slider [(ngModel)]="value" (onChange)="onChangeHandler($event)" (onSlideEnd)="onSlideEndHandler($event)" class="w-full" />
        </div>
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderValuechangeDemo {
    value: number = 50;

    endValue: number = 50;

    onChangeHandler(event: SliderChangeEvent) {
        this.value = event.value as number;
    }

    onSlideEndHandler(event: SliderSlideEndEvent) {
        this.endValue = event.value as number;
    }
}
```

## Vertical

Default layout of slider is horizontal , use orientation property for the alternative vertical mode.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';

@Component({
    template: `
        <div class="grid grid-cols-3 h-56 gap-4 w-fit mx-auto">
            @for (slider of sliders; track slider.label; let i = $index) {
                <div class="flex flex-col items-center justify-center gap-3">
                    <p-slider [(ngModel)]="slider.value" orientation="vertical" />
                    <span class="font-mono text-xs uppercase text-surface-500">{{ slider.label }}</span>
                </div>
            }
        </div>
    `,
    standalone: true,
    imports: [SliderModule, FormsModule]
})
export class SliderVerticalDemo {
    sliders = [
        { label: 'Bass', value: 40 },
        { label: 'Mid', value: 70 },
        { label: 'Treble', value: 55 }
    ];
}
```
