# Angular InputColor Component — With Popover

## With Popover

InputColor can be used inside a Popover, with a color swatch as the trigger.

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Popover, PopoverModule } from 'primeng/popover';
import { InputColorModule } from 'primeng/inputcolor';
import { EyeDropper } from '@primeicons/angular/eye-dropper';

@Component({
    template: `
        <div class="flex items-center justify-center">
            <p-inputcolor [(ngModel)]="color">
                <p-inputcolor-swatch (click)="op.toggle($event)" style="cursor: pointer">
                    <p-inputcolor-transparency-grid />
                    <p-inputcolor-swatch-background />
                </p-inputcolor-swatch>
                <p-popover #op>
                    <div class="w-72 p-3 space-y-3">
                        <p-inputcolor-area>
                            <p-inputcolor-area-background />
                            <p-inputcolor-area-handle />
                        </p-inputcolor-area>
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
                        <div class="flex items-center gap-2">
                            <input pInputColorInput channel="hex" class="flex-1" />
                            <p-inputcolor-eyedropper [iconOnly]="true" [outlined]="true" severity="secondary">
                                <svg data-p-icon="eye-dropper" />
                            </p-inputcolor-eyedropper>
                        </div>
                    </div>
                </p-popover>
            </p-inputcolor>
        </div>
    `,
    standalone: true,
    imports: [PopoverModule, InputColorModule, FormsModule, EyeDropper]
})
export class InputColorPopoverDemo {
    color: string = '#0099ff';
}
```
