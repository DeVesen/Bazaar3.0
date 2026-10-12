# Angular InputColor Component — Verticalslider

## Verticalslider

Sliders support vertical orientation, displayed alongside the color area.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputColorModule } from 'primeng/inputcolor';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <p-inputcolor [(ngModel)]="color" format="hsba" class="w-full max-w-md">
                <div class="flex gap-4 w-full">
                    <p-inputcolor-area class="flex-1">
                        <p-inputcolor-area-background />
                        <p-inputcolor-area-handle />
                    </p-inputcolor-area>
                    <p-inputcolor-slider orientation="vertical">
                        <p-inputcolor-transparency-grid />
                        <p-inputcolor-slider-track />
                        <p-inputcolor-slider-handle />
                    </p-inputcolor-slider>
                    <p-inputcolor-slider channel="saturation" orientation="vertical">
                        <p-inputcolor-transparency-grid />
                        <p-inputcolor-slider-track />
                        <p-inputcolor-slider-handle />
                    </p-inputcolor-slider>
                    <p-inputcolor-slider channel="brightness" orientation="vertical">
                        <p-inputcolor-transparency-grid />
                        <p-inputcolor-slider-track />
                        <p-inputcolor-slider-handle />
                    </p-inputcolor-slider>
                    <p-inputcolor-slider channel="alpha" orientation="vertical">
                        <p-inputcolor-transparency-grid />
                        <p-inputcolor-slider-track />
                        <p-inputcolor-slider-handle />
                    </p-inputcolor-slider>
                </div>
            </p-inputcolor>
        </div>
    `,
    standalone: true,
    imports: [InputColorModule, FormsModule]
})
export class InputColorVerticalSliderDemo {
    color: string = '';
}
```
