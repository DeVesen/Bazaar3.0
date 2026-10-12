# Angular Gallery Component — Grid

## Grid

Gallery can be used as a lightbox by combining it with a grid of thumbnails. Click on an image to open the gallery in fullscreen overlay.

```typescript
import { Component, signal } from '@angular/core';
import { GalleryModule } from 'primeng/gallery';
import { GalleryActiveIndexChangeEvent } from 'primeng/types/gallery';
import { ChevronLeft } from '@primeicons/angular/chevron-left';
import { ChevronRight } from '@primeicons/angular/chevron-right';
import { Replay } from '@primeicons/angular/replay';
import { Refresh } from '@primeicons/angular/refresh';
import { SearchPlus } from '@primeicons/angular/search-plus';
import { SearchMinus } from '@primeicons/angular/search-minus';
import { ArrowsH } from '@primeicons/angular/arrows-h';
import { ArrowsV } from '@primeicons/angular/arrows-v';
import { Download } from '@primeicons/angular/download';
import { Times } from '@primeicons/angular/times';

@Component({
    template: `
        <div class="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-6 gap-2">
            @for (image of images; track image; let i = $index) {
                <div class="aspect-square cursor-pointer hover:opacity-75 transition-opacity" (click)="handleOpen(i)">
                    <img [src]="image" alt="image" class="w-full h-full object-cover rounded-lg" />
                </div>
            }
        </div>
        @if (open()) {
            <p-gallery [fullscreen]="true" (onFullscreenChange)="open.set($event)" [(activeIndex)]="activeIndex" (onActiveIndexChange)="onActiveIndexChange($event)" class="opacity-100 transition-opacity duration-200">
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
                    <button class="p-gallery-action" (click)="close()">
                        <svg data-p-icon="times"></svg>
                    </button>
                </p-gallery-header>
                <p-gallery-content>
                    @for (image of images; track image) {
                        <p-gallery-item>
                            <img [src]="image" alt="image" class="scale-100 blur-none transition-[scale,filter] duration-300" />
                        </p-gallery-item>
                    }
                </p-gallery-content>
                <p-gallery-footer>
                    <p-gallery-thumbnail>
                        <p-gallery-thumbnail-content>
                            @for (image of images; track image; let i = $index) {
                                <p-gallery-thumbnail-item [index]="i">
                                    <img [attr.draggable]="false" [src]="image" class="h-full w-full object-cover" />
                                </p-gallery-thumbnail-item>
                            }
                        </p-gallery-thumbnail-content>
                    </p-gallery-thumbnail>
                </p-gallery-footer>
            </p-gallery>
        }
    `,
    standalone: true,
    imports: [GalleryModule, ChevronLeft, ChevronRight, Replay, Refresh, SearchPlus, SearchMinus, ArrowsH, ArrowsV, Download, Times]
})
export class GalleryGridDemo {
    photos: [number, number, number][] = [
        [10, 1200, 800],
        [11, 800, 1200],
        [15, 1400, 700],
        [16, 700, 1050],
        [17, 1000, 1000],
        [18, 1300, 650],
        [19, 600, 1200],
        [20, 1200, 900],
        [27, 750, 1125],
        [28, 1400, 800],
        [29, 800, 1100],
        [36, 1100, 700],
        [37, 650, 1300],
        [39, 1200, 750],
        [42, 900, 1200],
        [43, 1300, 800],
        [47, 700, 1400],
        [48, 1000, 800],
        [49, 800, 1000],
        [50, 1400, 600],
        [52, 600, 900],
        [53, 1200, 1200],
        [54, 900, 600],
        [55, 750, 1000],
        [56, 1100, 800],
        [57, 1400, 900],
        [58, 850, 1275],
        [59, 1000, 600],
        [60, 600, 1000],
        [64, 1300, 1300]
    ];

    images = this.photos.map(([id, w, h]) => `https://picsum.photos/id/${id}/${w}/${h}`);

    activeIndex: number = 0;

    open = signal(false);

    handleOpen(index: number) {
        this.activeIndex = index;
        this.open.set(true);
    }

    close() {
        this.open.set(false);
    }

    onActiveIndexChange(event: GalleryActiveIndexChangeEvent) {
        this.activeIndex = event.value;
    }
}
```
