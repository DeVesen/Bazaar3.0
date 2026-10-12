# Angular Gallery Component — Single

## Single

Click on the image to open it in a fullscreen dialog without thumbnails or navigation buttons.

```typescript
import { Component, signal } from '@angular/core';
import { GalleryModule } from 'primeng/gallery';
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
        <div class="flex justify-center">
            <div class="w-80 aspect-3/2 cursor-pointer hover:opacity-75 transition-opacity" (click)="open.set(true)">
                <img [src]="image" alt="image" class="w-full h-full object-cover rounded-lg" />
            </div>
            @if (open()) {
                <p-gallery [fullscreen]="true" (onFullscreenChange)="open.set($event)">
                    <p-gallery-backdrop></p-gallery-backdrop>
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
                        <button class="p-gallery-action" (click)="open.set(false)">
                            <svg data-p-icon="times"></svg>
                        </button>
                    </p-gallery-header>
                    <p-gallery-content>
                        <p-gallery-item>
                            <img [src]="image" alt="image" />
                        </p-gallery-item>
                    </p-gallery-content>
                </p-gallery>
            }
        </div>
    `,
    standalone: true,
    imports: [GalleryModule, Replay, Refresh, SearchPlus, SearchMinus, ArrowsH, ArrowsV, Download, Times]
})
export class GallerySingleDemo {
    image: string = 'https://picsum.photos/id/10/1200/800';

    open = signal(false);
}
```
