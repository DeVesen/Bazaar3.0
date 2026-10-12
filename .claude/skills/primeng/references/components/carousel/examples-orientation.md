# Angular Carousel Component — Orientation

## Orientation

Set orientation to vertical for a vertical carousel layout.

```typescript
import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ChevronUp } from '@primeicons/angular/chevron-up';
import { ChevronDown } from '@primeicons/angular/chevron-down';

@Component({
    template: `
        <div class="mt-8 mb-16">
            <p-carousel class="max-w-sm mx-auto flex flex-col gap-8 items-center" orientation="vertical" [slidesPerPage]="1.3">
                <button
                    pCarouselPrev
                    class="w-10 h-10 flex items-center justify-center rounded-fu …(lange Zeile gekürzt)
                >
                    <svg data-p-icon="chevron-up"></svg>
                </button>
                <p-carousel-content class="h-60 w-full scroll-pt-px">
                    @for (item of items; track item) {
                        <p-carousel-item>
                            <div class="h-full text-5xl font-semibold bg-surface …(lange Zeile gekürzt)
                                <span>{{ item }}</span>
                            </div>
                        </p-carousel-item>
                    }
                </p-carousel-content>
                <button
                    pCarouselNext
                    class="w-10 h-10 flex items-center justify-center rounded-fu …(lange Zeile gekürzt)
                >
                    <svg data-p-icon="chevron-down"></svg>
                </button>
            </p-carousel>
        </div>
    `,
    standalone: true,
    imports: [CarouselModule, ChevronUp, ChevronDown]
})
export class CarouselOrientationDemo {
    items = [1, 2, 3, 4, 5];
}
```
