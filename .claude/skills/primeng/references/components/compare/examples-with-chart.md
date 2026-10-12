# Angular Compare Component — With Chart

## With Chart

Combine slideOnHover with controlled value for interactive chart reveals.

```typescript
import { Component } from '@angular/core';

@Component({
    template: `
        <p-compare class="aspect-video max-w-lg mx-auto" [slideOnHover]="true" [value]="value" (onValueChange)="onValueChange($event)">
            <p-compare-item position="before">
                <svg class="absolute w-full h-full" viewBox="0 0 644 189" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_1381_2302)">
                        <path
                            d="M0.5 118.499C0.5 118.499 82 102.999 113.5 89.4989 …(lange Zeile gekürzt)
                            stroke="var(--p-primary-color)"
                            stroke-width="2"
                        />
                        <path
                            d="M113.5 89.5006C82 103.001 0.5 118.501 0.5 118.501 …(lange Zeile gekürzt)
                            fill="url(#paint0_linear_540_31)"
                        />
                    </g>
                    <defs>
                        <linearGradient id="paint0_linear_540_31" x1="322.25" x2="322.25" y1="1.477" y2="188.5" gradientUnits="userSpaceOnUse">
                            <stop stop-color="var(--p-primary-color)" stop-opacity="0.4"></stop>
                            <stop offset="1" stop-color="var(--p-primary-color)" stop-opacity="0"></stop>
                        </linearGradient>
                    </defs>
                </svg>
            </p-compare-item>
        </p-compare>
    `,
    standalone: true,
    imports: []
})
export class CompareChartDemo {
    value: number = 50;

    onValueChange(event: CompareValueChangeEvent) {
        this.value = event.value;
    }
}
```
