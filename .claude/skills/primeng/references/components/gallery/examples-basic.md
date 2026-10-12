# Angular Gallery Component — Basic

## Basic

Displays a collection of images with a lightbox viewer.

```typescript
import { Component } from '@angular/core';
import { GalleryModule } from 'primeng/gallery';
import { ChevronLeft } from '@primeicons/angular/chevron-left';
import { ChevronRight } from '@primeicons/angular/chevron-right';

@Component({
    template: `
        <p-gallery class="w-full not-data-fullscreen:h-150!">
            <p-gallery-backdrop></p-gallery-backdrop>
            <button pGalleryPrev>
                <svg data-p-icon="chevron-left"></svg>
            </button>
            <button pGalleryNext>
                <svg data-p-icon="chevron-right"></svg>
            </button>
            <p-gallery-content>
                @for (image of images; track image) {
                    <p-gallery-item>
                        <img [src]="image" alt="image" />
                    </p-gallery-item>
                }
            </p-gallery-content>
        </p-gallery>
    `,
    standalone: true,
    imports: [GalleryModule, ChevronLeft, ChevronRight]
})
export class GalleryBasicDemo {
    photos: [number, number, number][] = [
        [10, 1200, 800],
        [11, 800, 1200],
        [15, 1400, 700],
        [16, 700, 1050],
        [17, 1000, 1000]
    ];

    images = this.photos.map(([id, w, h]) => `https://picsum.photos/id/${id}/${w}/${h}`);
}
```
