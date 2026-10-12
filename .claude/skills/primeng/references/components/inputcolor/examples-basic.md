# Angular InputColor Component — Basic

## Basic

InputColor is a composable color picker with area, slider, swatch, and input sub-components.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputColorModule } from 'primeng/inputcolor';
import { EyeDropper } from '@primeicons/angular/eye-dropper';

@Component({
    template: `
        <p-inputcolor [(ngModel)]="color" [format]="activeFormat" class="max-w-xs mx-auto space-y-3">
            <p-inputcolor-area>
                <p-inputcolor-area-background />
                <p-inputcolor-area-handle />
            </p-inputcolor-area>
            <div class="flex items-center gap-2">
                <div class="flex-1 space-y-1 mr-1">
                    <p-inputcolor-slider>
                        <p-inputcolor-transparency-grid />
                        <p-inputcolor-slider-track />
                        <p-inputcolor-slider-handle />
                    </p-inputcolor-slider>
                    <p-inputcolor-slider channel="alpha">
                        <p-inputcolor-transparency-grid />
                        <p-inputcolor-slider-track />
                        <p-inputcolor-slider-handle />
                    </p-inputcolor-slider>
                </div>
                <p-inputcolor-swatch class="shrink-0">
                    <p-inputcolor-transparency-grid />
                    <p-inputcolor-swatch-background />
                </p-inputcolor-swatch>
                <p-inputcolor-eyedropper [iconOnly]="true" [outlined]="true" severity="secondary">
                    <svg data-p-icon="eye-dropper" />
                </p-inputcolor-eyedropper>
            </div>
            <div class="flex items-center gap-2">
                <p-select [(ngModel)]="format" [options]="formatOptions" optionLabel="label" optionValue="value" class="w-full md:w-26" />
                <div class="flex-1">
                    @if (format === 'hex') {
                        <input pInputColorInput [fluid]="true" channel="hex" />
                    }
                    @if (format === 'rgba') {
                        <p-inputgroup>
                            <input pInputColorInput [fluid]="true" channel="red" />
                            <input pInputColorInput [fluid]="true" channel="green" />
                            <input pInputColorInput [fluid]="true" channel="blue" />
                            <input pInputColorInput [fluid]="true" channel="alpha" />
                        </p-inputgroup>
                    }
                    @if (format === 'hsba') {
                        <p-inputgroup>
                            <input pInputColorInput [fluid]="true" channel="hue" />
                            <input pInputColorInput [fluid]="true" channel="saturation" />
                            <input pInputColorInput [fluid]="true" channel="brightness" />
                            <input pInputColorInput [fluid]="true" channel="alpha" />
                        </p-inputgroup>
                    }
                    @if (format === 'hsla') {
                        <p-inputgroup>
                            <input pInputColorInput [fluid]="true" channel="hue" />
                            <input pInputColorInput [fluid]="true" channel="saturation" />
                            <input pInputColorInput [fluid]="true" channel="lightness" />
                            <input pInputColorInput [fluid]="true" channel="alpha" />
                        </p-inputgroup>
                    }
                    @if (format === 'oklcha') {
                        <input pInputColorInput [fluid]="true" channel="css" />
                    }
                </div>
            </div>
        </p-inputcolor>
    `,
    standalone: true,
    imports: [SelectModule, InputGroupModule, InputColorModule, FormsModule, EyeDropper]
})
export class InputColorBasicDemo {
    color: string = '#276def';

    formatOptions = [
        { label: 'HEX', value: 'hex' },
        { label: 'RGBA', value: 'rgba' },
        { label: 'HSBA', value: 'hsba' },
        { label: 'HSLA', value: 'hsla' },
        { label: 'OKLCHA', value: 'oklcha' }
    ];

    get activeFormat(): ColorSpace {
        return this.format === 'hex' ? 'rgba' : this.format === 'oklcha' ? 'oklch' : this.format;
    }
}
```
