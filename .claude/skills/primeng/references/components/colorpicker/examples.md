# Angular ColorPicker Component — Beispiele

## Basic

ColorPicker is used as a controlled input with ngModel property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-colorpicker [(ngModel)]="color" />
        </div>
    `,
    standalone: true,
    imports: [ColorPickerModule, FormsModule]
})
export class ColorPickerBasicDemo {
    color: string | undefined;
}
```

## Disabled

When disabled is present, the element cannot be edited and focused.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-colorpicker [(ngModel)]="color" [disabled]="true" />
        </div>
    `,
    standalone: true,
    imports: [ColorPickerModule, FormsModule]
})
export class ColorPickerDisabledDemo {
    color: string | undefined;
}
```

## Format

Default color format to use in value binding is hex and other possible values can be rgb and hsb using the format property.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';

@Component({
    template: `
        <div class="flex flex-wrap gap-4">
            <div class="flex-1 flex flex-col items-center">
                <label for="cp-hex" class="text-sm font-bold block mb-2"> HEX </label>
                <p-colorpicker [(ngModel)]="color" inputId="cp-hex" class="mb-4" />
                <span class="text-sm">{{ color }}</span>
            </div>
            <div class="flex-1 flex flex-col items-center">
                <label for="cp-rgb" class="text-sm font-bold block mb-2"> RGB </label>
                <p-colorpicker [(ngModel)]="colorRGB" format="rgb" inputId="cp-rgb" class="mb-4" />
                <span class="text-sm">{{ 'r:' + colorRGB.r + ' g:' + colorRGB.g + ' b:' + colorRGB.b }}</span>
            </div>
            <div class="flex-1 flex flex-col items-center">
                <label for="cp-hsb" class="text-sm font-bold block mb-2"> HSB </label>
                <p-colorpicker [(ngModel)]="colorHSB" format="hsb" inputId="cp-hsb" class="mb-4" />
                <span class="text-sm">{{ 'h:' + colorHSB.h + ' s:' + colorHSB.s + ' b:' + colorHSB.b }}</span>
            </div>
        </div>
    `,
    standalone: true,
    imports: [ColorPickerModule, FormsModule]
})
export class ColorPickerFormatDemo {
    color: string = '#6466f1';

    colorRGB: any = { r: 100, g: 102, b: 241 };

    colorHSB: any = { h: 239, s: 59, b: 95 };
}
```

## Inline

ColorPicker is displayed as a popup by default, add inline property to customize this behavior.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'primeng/colorpicker';

@Component({
    template: `
        <div class="flex justify-center">
            <p-colorpicker [(ngModel)]="color" [inline]="true" />
        </div>
    `,
    standalone: true,
    imports: [ColorPickerModule, FormsModule]
})
export class ColorPickerInlineDemo {
    color: string | undefined;
}
```
