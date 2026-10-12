# Angular Carousel Component — Variable Size

## Variable Size

Enable autoSize to allow items with variable widths.

```typescript
import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { ChevronLeft } from '@primeicons/angular/chevron-left';
import { ChevronRight } from '@primeicons/angular/chevron-right';

@Component({
    template: `
        <div class="mt-8 mb-16">
            <p-carousel class="max-w-xl mx-auto" align="center" [autoSize]="true">
                <p-carousel-content class="h-35">
                    @for (item of items; track item.width; let i = $index) {
                        <p-carousel-item [style.width]="item.width">
                            <div class="h-full text-4xl font-semibold bg-surface …(lange Zeile gekürzt)
                                <span>{{ i + 1 }}</span>
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
export class CarouselVariableSizeDemo {
    items = [{ width: '120px' }, { width: '80px' }, { width: '200px' }, { width: '160px' }, { width: '220px' }, { width: '180px' }, { width: '280px' }, { width: '100px' }];
}
```
