# Angular Carousel Component — Basic

## Basic

Composition-based carousel using native scroll-snap with sub-components for root, content, items, navigation, and indicators.

```typescript
import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ChevronLeft } from '@primeicons/angular/chevron-left';
import { ChevronRight } from '@primeicons/angular/chevron-right';

@Component({
    template: `
        <div class="mt-8 mb-16">
            <p-carousel class="max-w-xl mx-auto" align="center">
                <p-carousel-content class="h-60">
                    @for (item of items; track item) {
                        <p-carousel-item>
                            <div class="h-full text-5xl font-semibold bg-surface …(lange Zeile gekürzt)
                                <span>{{ item }}</span>
                            </div>
                        </p-carousel-item>
                    }
                </p-carousel-content>
                <div class="flex mt-4 gap-4">
                    <p-carousel-indicators></p-carousel-indicators>
                    <div class="flex items-center justify-end gap-2 flex-1">
                        <button
                            pCarouselPrev
                            class="w-9 h-9 flex items-center justify-center roun …(lange Zeile gekürzt)
                        >
                            <svg data-p-icon="chevron-left"></svg>
                        </button>
                        <button
                            pCarouselNext
                            class="w-9 h-9 flex items-center justify-center roun …(lange Zeile gekürzt)
                        >
                            <svg data-p-icon="chevron-right"></svg>
                        </button>
                    </div>
                </div>
            </p-carousel>
        </div>
    `,
    standalone: true,
    imports: [CarouselModule, ChevronLeft, ChevronRight]
})
export class CarouselBasicDemo {
    items = [1, 2, 3, 4, 5];
}
```
