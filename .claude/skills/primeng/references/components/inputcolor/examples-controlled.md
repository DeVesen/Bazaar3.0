# Angular InputColor Component — Controlled

## Controlled

Demonstrates tracking color value changes during interaction and when interaction ends.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputColorModule } from 'primeng/inputcolor';
import { EyeDropper } from '@primeicons/angular/eye-dropper';

@Component({
    template: `
        <div class="max-w-xs mx-auto space-y-3">
            <div class="text-center font-mono text-sm text-surface-500">onValueChange: {{ value.toString('hex') }}</div>
            <div class="text-center font-mono text-sm text-surface-500">onValueChangeEnd: {{ endValue.toString('hex') }}</div>
            <p-inputcolor [(ngModel)]="value" (onValueChange)="onColorChange($event)" (onValueChangeEnd)="onColorChangeEnd($event)" class="space-y-3">
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
                    <p-inputcolor-swatch>
                        <p-inputcolor-transparency-grid />
                        <p-inputcolor-swatch-background />
                    </p-inputcolor-swatch>
                    <p-inputcolor-eyedropper [iconOnly]="true" [outlined]="true" severity="secondary">
                        <svg data-p-icon="eye-dropper" />
                    </p-inputcolor-eyedropper>
                </div>
                <input pInputColorInput [fluid]="true" channel="hex" />
            </p-inputcolor>
        </div>
    `,
    standalone: true,
    imports: [InputColorModule, FormsModule, EyeDropper]
})
export class InputColorControlledDemo {
    value: ColorInstance = parseColor('#000000')!;

    endValue: ColorInstance = parseColor('#000000')!;

    onColorChange(event: any) {
        this.value = event.color;
    }

    onColorChangeEnd(event: any) {
        this.endValue = event.color;
    }
}
```
