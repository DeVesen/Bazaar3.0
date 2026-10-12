# Angular Gallery Component — Toolbar

## Toolbar

Add a p-gallery-header with action sub-components like pGalleryRotateLeft , pGalleryZoomIn , pGalleryDownload , and pGalleryFullScreen to expose image controls.

```typescript
import { Component } from '@angular/core';
import { GalleryModule } from 'primeng/gallery';
import { ChevronLeft } from '@primeicons/angular/chevron-left';
import { ChevronRight } from '@primeicons/angular/chevron-right';
import { Replay } from '@primeicons/angular/replay';
import { Refresh } from '@primeicons/angular/refresh';
import { SearchPlus } from '@primeicons/angular/search-plus';
import { SearchMinus } from '@primeicons/angular/search-minus';
import { ArrowsH } from '@primeicons/angular/arrows-h';
import { ArrowsV } from '@primeicons/angular/arrows-v';
import { Download } from '@primeicons/angular/download';
import { ArrowUpRightAndArrowDownLeftFromCenter } from '@primeicons/angular/arrow-up-right-and-arrow-down-left-from-center';
import { ArrowDownLeftAndArrowUpRightToCenter } from '@primeicons/angular/arrow-down-left-and-arrow-up-right-to-center';

@Component({
    template: `
        <p-gallery class="h-150!">
            <p-gallery-backdrop></p-gallery-backdrop>
            <button pGalleryPrev>
                <svg data-p-icon="chevron-left"></svg>
            </button>
            <button pGalleryNext>
                <svg data-p-icon="chevron-right"></svg>
            </button>
            <p-gallery-header class="justify-end gap-0.5">
                <button pGalleryRotateLeft>
                    <svg data-p-icon="replay"></svg>
                </button>
                <button pGalleryRotateRight>
                    <svg data-p-icon="refresh"></svg>
                </button>
                <button pGalleryZoomIn>
                    <svg data-p-icon="search-plus"></svg>
                </button>
                <button pGalleryZoomOut>
                    <svg data-p-icon="search-minus"></svg>
                </button>
                <button pGalleryFlipX>
                    <svg data-p-icon="arrows-h"></svg>
                </button>
                <button pGalleryFlipY>
                    <svg data-p-icon="arrows-v"></svg>
                </button>
                <button pGalleryDownload>
                    <svg data-p-icon="download"></svg>
                </button>
                <button pGalleryFullScreen class="group">
                    <svg data-p-icon="arrow-up-right-and-arrow-down-left-from-center" class="group-data-fullscreen:hidden!"></svg>
                    <svg data-p-icon="arrow-down-left-and-arrow-up-right-to-center" class="hidden! group-data-fullscreen:block!"></svg>
                </button>
            </p-gallery-header>
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
    imports: [GalleryModule, ChevronLeft, ChevronRight, Replay, Refresh, SearchPlus, SearchMinus, ArrowsH, ArrowsV, Download, ArrowUpRightAndArrowDownLeftFromCenter, ArrowDownLeftAndArrowUpRightToCenter]
})
export class GalleryToolbarDemo {
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
